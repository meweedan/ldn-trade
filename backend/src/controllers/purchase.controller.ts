import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { requireAuth, requireAdmin } from '../middleware/authJwt';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

export const createPurchase = [requireAuth, async (req: Request & { user?: any }, res: Response) => {
  const { tierId, method, mode = 'payment', subscriptionPriceId, promoCode: rawPromoCode, refCode: rawRefCode, preview, vipTelegram } = req.body as {
    tierId: string;
    method: 'stripe' | 'usdt' | 'libyana' | 'madar' | 'free';
    mode?: 'payment' | 'subscription';
    subscriptionPriceId?: string;
    promoCode?: string;
    refCode?: string;
    preview?: boolean;
    vipTelegram?: boolean;
  };
  const tier = await prisma.courseTier.findUnique({ where: { id: tierId } });
  if (!tier) return res.status(404).json({ error: 'Tier not found' });

  // Base price (USD) — prefer Stripe price if present (stored as USD in DB), else USDT numeric
  const usdFromStripe = typeof (tier as any).price_stripe === 'number' ? Number((tier as any).price_stripe) : NaN;
  const usdFromUsdt = typeof (tier as any).price_usdt === 'number' ? Number((tier as any).price_usdt) : NaN;
  const P = Number.isFinite(usdFromStripe) && usdFromStripe > 0 ? usdFromStripe : (Number.isFinite(usdFromUsdt) ? usdFromUsdt : 0);

  // Resolve referral 10% if valid and not self
  const refInput = (rawRefCode || '').trim();
  let refDiscount = 0;
  let refAffiliateId: string | null = null;
  if (refInput) {
    const affiliate = await prisma.affiliate.findFirst({ where: { code: { equals: refInput, mode: 'insensitive' }, active: true } });
    if (affiliate && affiliate.userId !== req.user!.sub) {
      refDiscount = 0.1 * P;
      refAffiliateId = affiliate.id;
    }
  }

  // Resolve promo
  const promoInput = (rawPromoCode || '').trim();
  let promoDiscount = 0;
  let promoId: string | null = null;
  let promoCode: string | null = null;
  if (promoInput) {
    const now = new Date();
    const promo = await prisma.promoCode.findFirst({
      where: {
        code: { equals: promoInput, mode: 'insensitive' },
        active: true,
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
    });
    if (promo) {
      // Validate min spend
      if (promo.minSpendUsd == null || P >= Number(promo.minSpendUsd)) {
        // Validate applicability: if array is empty, treat as 'all tiers'
        let applicable = true;
        if (promo.applicableTierIds != null) {
          try {
            const raw = promo.applicableTierIds as any;
            const ids: string[] = Array.isArray(raw)
              ? raw.map((v: any) => String(v))
              : Array.isArray((raw || {}).ids)
              ? (raw.ids as any[]).map((v: any) => String(v))
              : [];
            applicable = ids.length === 0 ? true : ids.includes(tierId);
          } catch {
            applicable = true;
          }
        }
        // Validate global cap and per-user cap
        if (applicable) {
          if (promo.maxGlobalRedemptions != null) {
            const used = await prisma.promoRedemption.count({ where: { promoId: promo.id } });
            if (used >= promo.maxGlobalRedemptions) applicable = false;
          }
          if (applicable && promo.maxPerUser != null) {
            const usedByUser = await prisma.promoRedemption.count({ where: { promoId: promo.id, userId: req.user!.sub } });
            if (usedByUser >= promo.maxPerUser) applicable = false;
          }
        }
        if (applicable) {
          if (promo.discountType === 'PERCENT') {
            promoDiscount = Math.max(0, Math.min(P, (promo.value / 100) * P));
          } else {
            promoDiscount = Math.max(0, Math.min(P, Number(promo.value)));
          }
          promoId = promo.id;
          promoCode = promo.code;
        }
      }
    }
  }

  // Best-of rule with 20% floor
  const floorPrice = 0.8 * P;
  const chosen = refDiscount >= promoDiscount ? 'ref' : 'promo';
  let appliedDiscount = Math.max(refDiscount, promoDiscount);
  let finalPrice = Math.max(P - appliedDiscount, floorPrice);
  appliedDiscount = Math.max(0, P - finalPrice);

  let pricingPath: string = 'none';
  if (refDiscount && !promoDiscount) pricingPath = 'refOnly';
  else if (promoDiscount && !refDiscount) pricingPath = 'promoOnly';
  else if (refDiscount && promoDiscount) pricingPath = chosen === 'ref' ? 'both_present_bestOf_ref' : 'both_present_bestOf_promo';
  // Resolve VIP addon from VIP Tier price (for non-Stripe methods only to avoid Stripe line items issues)
  let vipAddon = 0;
  if (vipTelegram) {
    try {
      const vipTier = await prisma.courseTier.findFirst({ where: { isVipProduct: true } as any });
      const vipUsd = Number((vipTier as any)?.price_usdt || 0);
      if (vipUsd > 0 && method !== 'stripe') {
        vipAddon = vipUsd;
        pricingPath = pricingPath + `|vip_addon_usd_${vipUsd}`;
      }
    } catch {}
  }

  // Preview: return computed price only, do not create a purchase
  if (preview) {
    return res.json({ provider: method, amount: finalPrice + vipAddon, discount: appliedDiscount, baseUsed: P, pricingPath });
  }

  // Create purchase with metadata
  const purchase = await prisma.purchase.create({
    data: {
      userId: req.user!.sub,
      tierId,
      status: method === 'free' ? ('CONFIRMED' as any) : ('PENDING' as any),
      refAffiliateId: refAffiliateId || undefined,
      refCode: refAffiliateId ? refInput : undefined,
      promoId: promoId || undefined,
      promoCode: promoCode || undefined,
      discountUsd: appliedDiscount,
      finalPriceUsd: finalPrice + vipAddon,
      pricingPath,
    },
  });

  if (method === 'stripe') {
    if (!stripe) {
      return res.status(503).json({
        error: 'Stripe is not configured',
        message: 'Set STRIPE_SECRET_KEY in your environment or use method "usdt" for now.'
      });
    }
    let session;
    if (mode === 'subscription') {
      if (!subscriptionPriceId) return res.status(400).json({ error: 'priceId required for subscription' });
      session = await stripe.checkout.sessions.create({ mode: 'subscription', line_items: [{ price: subscriptionPriceId, quantity: 1 }], metadata: { purchaseId: purchase.id, tierId }, success_url: `${process.env.FRONTEND_URL}/dashboard?success=1`, cancel_url: `${process.env.FRONTEND_URL}/courses/${tierId}?canceled=1` });
    } else {
      // price_stripe is USD in our DB; Stripe expects cents
      const unitAmountCents = Math.round(Number((tier as any).price_stripe || 0) * 100);
      session = await stripe.checkout.sessions.create({ mode: 'payment', line_items: [{ price_data: { currency: 'usd', product_data: { name: tier.name }, unit_amount: unitAmountCents }, quantity: 1 }], metadata: { purchaseId: purchase.id, tierId }, success_url: `${process.env.FRONTEND_URL}/dashboard?success=1`, cancel_url: `${process.env.FRONTEND_URL}/courses/${tierId}?canceled=1` });
    }
    return res.json({ provider: 'stripe', checkoutUrl: session.url, purchaseId: purchase.id });
  } else {
    if (method === 'free') {
      return res.json({ provider: 'free', purchaseId: purchase.id, status: 'confirmed' });
    }
    // Return normalized provider details; amount is final price under rules
    const provider = ['usdt', 'libyana', 'madar'].includes(method) ? method : 'usdt';
    const amount = provider === 'usdt' ? finalPrice + vipAddon : finalPrice;
    return res.json({ provider, purchaseId: purchase.id, address: process.env.USDT_WALLET_ADDRESS || 'address', amount, status: 'pending' });
  }
}];

// Admin-only: metrics (counts and revenue)
export const adminGetMetrics = [requireAdmin, async (_req: Request & { user?: any }, res: Response) => {
  // Pull all purchases with tier to compute sums. For large datasets, replace with DB aggregates.
  const purchases = await prisma.purchase.findMany({ include: { tier: true } as any });
  const toU32 = (v: any) => {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  };
  const totals = purchases.reduce(
    (acc: any, p: any) => {
      const status = String(p.status || '').toUpperCase();
      if (status === 'CONFIRMED') acc.confirmed++;
      else if (status === 'PENDING') acc.pending++;
      else acc.failed++;
      if (status === 'CONFIRMED') {
        acc.revenue_usdt += toU32(p.tier?.price_usdt);
        acc.revenue_stripe_cents += toU32(p.tier?.price_stripe);
      }
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      acc.byDay[key] = (acc.byDay[key] || 0) + 1;
      return acc;
    },
    { confirmed: 0, pending: 0, failed: 0, revenue_usdt: 0, revenue_stripe_cents: 0, byDay: {} as Record<string, number> }
  );
  return res.json(totals);
}];

// Admin-only: list pending purchases for manual verification
export const adminListPendingPurchases = [requireAdmin, async (_req: Request & { user?: any }, res: Response) => {
  const purchases = await prisma.purchase.findMany({
    where: { status: 'PENDING' as any },
    orderBy: { createdAt: 'desc' },
    include: { tier: true, user: true } as any,
  });
  return res.json({ data: purchases });
}];

// Admin-only: set purchase status (e.g., confirm Libyana/Madar manually)
export const adminSetPurchaseStatus = [requireAdmin, async (req: Request & { user?: any }, res: Response) => {
  const { id } = req.params as { id: string };
  const { status, note } = req.body as { status: 'CONFIRMED' | 'FAILED' | 'PENDING'; note?: string };
  if (!id || !status) return res.status(400).json({ error: 'id and status are required' });
  const purchase = await prisma.purchase.findUnique({ where: { id }, include: { tier: true } as any });
  if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
  const prevStatus = purchase.status as string;
  const updated = await prisma.purchase.update({ where: { id }, data: { status: status as any, txnHash: note ? String(note) : purchase.txnHash } });

  // On first-time CONFIRMED, grant entitlements and log rewards/redemptions
  if (status === 'CONFIRMED' && prevStatus !== 'CONFIRMED') {
    // Referral reward
    if (purchase.refAffiliateId) {
      await prisma.referralReward.create({
        data: {
          affiliateId: purchase.refAffiliateId,
          purchaseId: purchase.id,
          tierId: purchase.tierId,
          userId: purchase.userId,
          status: 'QUALIFIED',
        },
      });
    }
    // Promo redemption
    if (purchase.promoId) {
      await prisma.promoRedemption.create({
        data: {
          promoId: purchase.promoId,
          userId: purchase.userId,
          purchaseId: purchase.id,
        },
      });
    }
    // Grant community Telegram access
    const hasAccess = await prisma.communityAccess.findUnique({ where: { userId: purchase.userId } });
    if (hasAccess) {
      await prisma.communityAccess.update({ where: { userId: purchase.userId }, data: { telegram: true } });
    } else {
      await prisma.communityAccess.create({ data: { userId: purchase.userId, telegram: true, discord: false, twitter: false } });
    }

    // VIP: if VIP Tier or VIP add-on present, activate/extend VIP 30 days
    try {
      const full = await prisma.purchase.findUnique({ where: { id: purchase.id }, include: { tier: true } as any });
      const isVipTier = !!(full as any)?.tier?.isVipProduct;
      const path = String((full as any)?.pricingPath || '');
      const vipAddonMatch = path.includes('vip_addon_usd_');
      if (isVipTier || vipAddonMatch) {
        const now = new Date();
        const existing = await prisma.communityAccess.findUnique({ where: { userId: purchase.userId } });
        let start = now;
        let end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (existing?.vipEnd && existing.vipEnd > now) {
          start = existing.vipStart || now;
          end = new Date(existing.vipEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
        }
        await prisma.communityAccess.upsert({
          where: { userId: purchase.userId },
          update: { vip: true, vipStart: start, vipEnd: end },
          create: { userId: purchase.userId, telegram: true, discord: false, twitter: false, vip: true, vipStart: start, vipEnd: end },
        });
      }
    } catch {}
  }

  return res.json(updated);
}];

// Helper: mark old pending purchases (>30 min) as FAILED
async function expireStalePurchases(userId: string) {
  const THIRTY_MIN = 30 * 60 * 1000;
  const cutoff = new Date(Date.now() - THIRTY_MIN);
  await prisma.purchase.updateMany({
    where: { userId, status: 'PENDING' as any, createdAt: { lt: cutoff } },
    data: { status: 'FAILED' as any },
  });
}

export const myPurchases = [requireAuth, async (req: Request & { user?: any }, res: Response) => {
  // Expire stale pending purchases before returning
  await expireStalePurchases(req.user!.sub);
  const [purchases, access] = await Promise.all([
    prisma.purchase.findMany({ where: { userId: req.user!.sub }, orderBy: { createdAt: 'desc' }, include: { tier: true } }),
    prisma.communityAccess.findUnique({ where: { userId: req.user!.sub } }),
  ]);
  const entitlements = {
    vipTelegram: { active: !!access?.vip, endsAt: access?.vipEnd || null },
  } as any;
  const enriched = purchases.map((p: any) => {
    const tiers: string[] = (() => {
      if (p?.tier?.isBundle) {
        try {
          const raw = p?.tier?.bundleTierIds as any;
          if (Array.isArray(raw)) return raw.map(String);
          if (raw && Array.isArray(raw.ids)) return raw.ids.map(String);
        } catch {}
      }
      return [p.tierId];
    })();
    return { ...p, entitlements: { ...entitlements, tiers } };
  });
  res.json(enriched);
}];

// Confirm/provide proof of payment
export const confirmPurchase = [requireAuth, async (req: Request & { user?: any }, res: Response) => {
  const { purchaseId, method, txHash, fromPhone } = req.body as { purchaseId: string; method: 'usdt' | 'libyana' | 'madar'; txHash?: string; fromPhone?: string };
  if (!purchaseId || !method) return res.status(400).json({ error: 'purchaseId and method are required' });

  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
  if (!purchase || purchase.userId !== req.user!.sub) return res.status(404).json({ error: 'Purchase not found' });

  // If already confirmed/failed, return as-is
  if (purchase.status === 'CONFIRMED' || purchase.status === 'FAILED') {
    return res.json(purchase);
  }

  const createdMs = new Date(purchase.createdAt).getTime();
  const ageMs = Date.now() - createdMs;
  const within30m = ageMs <= 30 * 60 * 1000;

  if (method === 'usdt') {
    if (!txHash || !txHash.trim()) return res.status(400).json({ error: 'txHash required for USDT' });
    // NOTE: Do not auto-confirm. Keep as PENDING until an admin verifies on-chain.
    if (!within30m) {
      const updated = await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'FAILED' as any, txnHash: txHash.trim() } });
      return res.status(400).json({ error: 'Payment window expired', purchase: updated });
    }
    const updated = await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'PENDING' as any, txnHash: txHash.trim() } });
    return res.json({
      message: 'Proof received. Awaiting manual verification by admin.',
      purchase: updated,
    });
  }

  if (method === 'libyana' || method === 'madar') {
    if (!fromPhone || !fromPhone.trim()) return res.status(400).json({ error: 'fromPhone required' });
    // Store phone in txnHash field as a simple proof record
    const updated = await prisma.purchase.update({ where: { id: purchase.id }, data: { txnHash: fromPhone.trim() } });
    // Status remains PENDING for manual admin confirmation
    return res.json(updated);
  }

  return res.status(400).json({ error: 'Unsupported method' });
}];
