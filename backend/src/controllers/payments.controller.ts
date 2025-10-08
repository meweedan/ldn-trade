import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

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

