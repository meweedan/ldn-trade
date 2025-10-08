import { Request, Response } from 'express';
import { authorize } from '../middleware/auth';
import prisma from '../config/prisma';
import db from '../config/database';

// GET /analytics/traffic (admin)
// If you don't have traffic tracking, return an empty series; frontend has fallbacks
// Ensure analytics tables exist
async function ensureAnalyticsTables() {
  await db.query(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    source TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT now()
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS pageviews (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
    path TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  )`);
}

// Public tracking endpoint (no auth). Body: { sessionId, path, referrer, userAgent, source, utm_* }
export const trackEvent = async (req: Request, res: Response) => {
  try {
    const { sessionId, path, referrer, userAgent, source, utm_source, utm_medium, utm_campaign, userId } = req.body || {};
    if (!sessionId || !path) return res.status(400).json({ message: 'sessionId and path are required' });
    await ensureAnalyticsTables();
    // upsert session
    await db.query(
      `INSERT INTO sessions (id, user_id, source, utm_source, utm_medium, utm_campaign)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET last_seen = now(), source = COALESCE(EXCLUDED.source, sessions.source), utm_source = COALESCE(EXCLUDED.utm_source, sessions.utm_source), utm_medium = COALESCE(EXCLUDED.utm_medium, sessions.utm_medium), utm_campaign = COALESCE(EXCLUDED.utm_campaign, sessions.utm_campaign)`,
      [sessionId, userId ?? null, source ?? null, utm_source ?? null, utm_medium ?? null, utm_campaign ?? null]
    );
    // insert pageview
    await db.query(
      `INSERT INTO pageviews (session_id, path, referrer, user_agent) VALUES ($1,$2,$3,$4)`,
      [sessionId, path, referrer ?? null, userAgent ?? (req.headers['user-agent'] || null)]
    );
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTraffic = [authorize('admin'), async (_req: Request, res: Response) => {
  await ensureAnalyticsTables();
  // Aggregate pageviews and sessions by day (last 90 days)
  const pv = await db.query(
    `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
            COUNT(*)::int AS views,
            COUNT(DISTINCT session_id)::int AS sessions
     FROM pageviews
     WHERE created_at >= now() - interval '90 days'
     GROUP BY 1
     ORDER BY 1 ASC`
  );
  const pvMap: Record<string, { views: number; sessions: number }> = {};
  for (const row of pv.rows) pvMap[row.date] = { views: row.views, sessions: row.sessions };

  // Signups per day
  const su = await db.query(
    `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
     FROM users
     WHERE created_at >= now() - interval '90 days'
     GROUP BY 1
     ORDER BY 1 ASC`
  );
  const suMap: Record<string, number> = {};
  for (const row of su.rows) suMap[row.date] = row.count;

  // Purchases per day (confirmed)
  const purchases: any[] = await prisma.purchase.findMany({
    where: { status: 'CONFIRMED' as any },
    select: { createdAt: true },
  });
  const prMap: Record<string, number> = {};
  for (const p of purchases) {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    prMap[key] = (prMap[key] || 0) + 1;
  }

  // Merge dates
  const dates = Array.from(new Set([...Object.keys(pvMap), ...Object.keys(suMap), ...Object.keys(prMap)])).sort();
  const series = dates.map((date) => ({
    date,
    sessions: pvMap[date]?.sessions || 0,
    uniques: pvMap[date]?.sessions || 0,
    views: pvMap[date]?.views || 0,
    signups: suMap[date] || 0,
    purchases: prMap[date] || 0,
  }));
  return res.json(series);
}];

// GET /analytics/admin-extras (admin)
// Returns various admin metrics and lists needed by the dashboard
export const getAdminExtras = [authorize('admin'), async (_req: Request, res: Response) => {
  try {
    await ensureAnalyticsTables();

    // Broker signups
    let brokerSignupsTotal = 0;
    let brokerByDay: Array<{ date: string; count: number }> = [];
    try {
      const all = await (prisma as any).brokerSignup.findMany({ select: { createdAt: true } });
      brokerSignupsTotal = all.length;
      const map: Record<string, number> = {};
      for (const b of all) {
        const d = new Date(b.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        map[key] = (map[key] || 0) + 1;
      }
      brokerByDay = Object.entries(map).sort((a,b)=>a[0]<b[0]? -1:1).map(([date,count])=>({ date, count: count as number }));
    } catch {}

    // Materials viewed: count pageviews to /learn routes
    const materialsTotalRes = await db.query(`SELECT COUNT(*)::int AS c FROM pageviews WHERE path LIKE '/learn%'`);
    const materialsViewedTotal = materialsTotalRes.rows?.[0]?.c ?? 0;

    // Refresh tokens issued
    const refreshTotalRes = await db.query(`SELECT COUNT(*)::int AS c FROM refresh_tokens`);
    const refreshTokensTotal = refreshTotalRes.rows?.[0]?.c ?? 0;
    const refreshByDayRes = await db.query(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
       FROM refresh_tokens
       WHERE created_at >= now() - interval '90 days'
       GROUP BY 1 ORDER BY 1 ASC`
    );

    // Average session time (seconds)
    const avgSessRes = await db.query(`SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (last_seen - first_seen))), 0) AS avg_secs FROM sessions`);
    const avgSessionSeconds = Number(avgSessRes.rows?.[0]?.avg_secs || 0);

    // Users lists
    const usersAllRes = await db.query(`SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 100`);
    const usersAll = usersAllRes.rows || [];
    // Pending users: users without a confirmed purchase
    const pendingUsersRes = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at
       FROM users u
       LEFT JOIN purchases p ON p.user_id = u.id AND UPPER(p.status) = 'CONFIRMED'
       GROUP BY u.id
       HAVING COUNT(p.id) = 0
       ORDER BY u.created_at DESC
       LIMIT 100`
    );
    const pendingUsers = pendingUsersRes.rows || [];

    // Pending purchases list (mirror of existing route but collated here for convenience)
    const pendingPurchases = await prisma.purchase.findMany({
      where: { status: 'PENDING' as any },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: true, tier: true } as any,
    }) as any[];

    return res.json({
      brokerSignupsTotal,
      brokerByDay,
      materialsViewedTotal,
      refreshTokensTotal,
      refreshByDay: refreshByDayRes.rows || [],
      avgSessionSeconds,
      usersAll,
      pendingUsers,
      pendingPurchases,
    });
  } catch (e) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}];

// GET /analytics/revenue (admin)
// Build a simple daily revenue series from confirmed purchases and tier prices
export const getRevenue = [authorize('admin'), async (_req: Request, res: Response) => {
  const purchases: any[] = await prisma.purchase.findMany({
    where: { status: 'CONFIRMED' as any },
    include: { tier: true } as any,
    orderBy: { createdAt: 'asc' },
  });
  const byDay: Record<string, { usdt: number; stripeUsd: number }> = {};
  for (const p of purchases) {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const usdt = Number(p?.tier?.price_usdt || 0);
    const stripeUsd = Number(p?.tier?.price_stripe || 0) / 100;
    if (!byDay[key]) byDay[key] = { usdt: 0, stripeUsd: 0 };
    byDay[key].usdt += Number.isFinite(usdt) ? usdt : 0;
    byDay[key].stripeUsd += Number.isFinite(stripeUsd) ? stripeUsd : 0;
  }
  const series = Object.entries(byDay)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, v]) => ({ date, usdt: v.usdt, stripeUsd: v.stripeUsd }));
  return res.json(series);
}];

// GET /analytics/courses (admin)
// Aggregate per course: sales count and revenue sums from confirmed purchases
export const getCoursesAgg = [authorize('admin'), async (_req: Request, res: Response) => {
  const purchases: any[] = await prisma.purchase.findMany({
    where: { status: 'CONFIRMED' as any },
    include: { tier: true } as any,
  });
  const byTier: Record<string, { id: string; name: string; sales: number; views: number; revenue_usdt: number; revenue_stripe_cents: number }> = {};
  for (const p of purchases) {
    const id = String(p.tierId);
    const name = String(p?.tier?.name || 'Course');
    if (!byTier[id]) byTier[id] = { id, name, sales: 0, views: 0, revenue_usdt: 0, revenue_stripe_cents: 0 };
    byTier[id].sales += 1;
    byTier[id].revenue_usdt += Number(p?.tier?.price_usdt || 0) || 0;
    byTier[id].revenue_stripe_cents += Number(p?.tier?.price_stripe || 0) || 0;
  }
  return res.json(Object.values(byTier));
}];
