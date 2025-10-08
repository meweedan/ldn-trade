import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { requireAuth } from '../middleware/authJwt';

function getSignedUrl(rawUrl: string) { return `${rawUrl}?signed=1`; }

export const listForTier = [requireAuth, async (req: Request & { user?: any }, res: Response) => {
  const { tierId } = req.params;
  const purchase = await prisma.purchase.findFirst({ where: { userId: req.user!.sub, tierId, status: 'CONFIRMED' } });
  if (!purchase) return res.status(403).json({ error: 'Payment required' });
  const resources = await prisma.resource.findMany({ where: { tierId } });
  res.json(resources.map((r: { url: string }) => ({ ...r, url: getSignedUrl(r.url) })));
}];
