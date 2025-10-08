import { Request, Response } from 'express';
import db from '../config/database';

export const searchTrips = async (req: Request, res: Response) => {
  // Placeholder for integrating external booking APIs (e.g., Amadeus, Skyscanner, Booking.com)
  // For now, just respond with a stubbed list
  res.json({ results: [], message: 'External booking API integration pending' });
};

export const createBooking = async (req: Request, res: Response) => {
  const { userId, productType, productId, price, currency, meta } = req.body as any;
  const result = await db.query(
    'INSERT INTO bookings (user_id, product_type, product_id, price, currency, meta) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [userId, productType, productId, price, currency, meta ?? {}]
  );
  res.status(201).json(result.rows[0]);
};

export const listMyBookings = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const result = await db.query('SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  res.json(result.rows);
};
