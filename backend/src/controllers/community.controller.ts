import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { requireAuth } from '../middleware/authJwt';

export const unlock = [requireAuth, async (req: Request & { user?: any }, res: Response) => {
  const confirmed = await prisma.purchase.findFirst({ where: { userId: req.user!.sub, status: 'CONFIRMED' } });
  if (!confirmed) return res.status(403).json({ error: 'No confirmed purchases' });
  const access = await prisma.communityAccess.upsert({ where: { userId: req.user!.sub }, update: { telegram: true, discord: true, twitter: true }, create: { userId: req.user!.sub, telegram: true, discord: true, twitter: true } });
  res.json(access);
}];

export const status = [requireAuth, async (req: Request & { user?: any }, res: Response) => {
  const access = await prisma.communityAccess.findUnique({ where: { userId: req.user!.sub } });
  res.json(access || { telegram: false, discord: false, twitter: false });
}];
