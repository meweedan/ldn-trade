import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const STRIPE_VIP_PRICE_ID = process.env.STRIPE_VIP_PRICE_ID || '';

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    if (!stripe) return res.status(500).json({ message: 'Stripe not configured' });
    const { amount, currency = 'usd', metadata } = req.body as { amount: number; currency?: string; metadata?: Record<string, string> };
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    return res.status(201).json({ clientSecret: intent.client_secret });
  } catch (e: any) {
    return res.status(500).json({ message: 'Payment intent failed', error: e?.message });
  }
};

export const createVipSubscription = async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!stripe) return res.status(500).json({ message: 'Stripe not configured' });
    if (!STRIPE_VIP_PRICE_ID) return res.status(500).json({ message: 'VIP price not configured' });
    const pid = String(req.body?.purchaseId || '');
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: STRIPE_VIP_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/enrolled?vip=1`,
      cancel_url: `${FRONTEND_URL}/enrolled?vip=0`,
      metadata: {
        vip: '1',
        purchaseId: pid,
        userId: (req as any).user?.sub || (req as any).user?.id || '',
      },
    });
    return res.json({ url: session.url });
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to create VIP subscription session', error: e?.message });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    if (!stripe) return res.status(500).json({ message: 'Stripe not configured' });
    const { purchaseId, method } = req.body as { purchaseId: string; method: string };
    if (!purchaseId || !method) return res.status(400).json({ message: 'Missing purchase ID or method' });

    const intent = await stripe.paymentIntents.confirm(purchaseId);

    return res.status(201).json({ status: intent.status });
  } catch (e: any) {
    return res.status(500).json({ message: 'Payment intent failed', error: e?.message });
  }
};

export const confirmProof = async (req: Request, res: Response) => {
  try {
    if (!stripe) return res.status(500).json({ message: 'Stripe not configured' });
    const { purchaseId, method } = req.body as { purchaseId: string; method: string };
    if (!purchaseId || !method) return res.status(400).json({ message: 'Missing purchase ID or method' });

    const intent = await stripe.paymentIntents.update(purchaseId, { metadata: { method } });

    return res.status(201).json({ status: intent.status });
  } catch (e: any) {
    return res.status(500).json({ message: 'Payment intent failed', error: e?.message });
  }
};

