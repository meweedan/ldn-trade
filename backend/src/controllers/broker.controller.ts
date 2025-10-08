import { Request, Response } from 'express';
import prisma from '../config/prisma';

export async function signup(req: Request, res: Response) {
  const { ref, userId } = req.query as { ref?: string; userId?: string };
  if (!ref) return res.status(400).json({ error: 'ref required' });
  await prisma.brokerSignup.create({ data: { referralCode: ref, userId: userId || undefined } });
  const target = `https://example-broker.com/signup?ref=${encodeURIComponent(ref)}`;
  res.redirect(302, target);
}
