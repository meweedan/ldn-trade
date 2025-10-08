import { Request, Response } from 'express';
import db from '../config/database';

export const getBusinessProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const result = await db.query('SELECT * FROM businesses WHERE owner_id = $1', [userId]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Business profile not found' });
  res.json(result.rows[0]);
};

export const updateBusinessProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { name, description, address, phone, website } = req.body as any;
  const result = await db.query(
    `INSERT INTO businesses (owner_id, name, description, address, phone, website)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (owner_id)
     DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, address = EXCLUDED.address, phone = EXCLUDED.phone, website = EXCLUDED.website
     RETURNING *`,
    [userId, name, description, address, phone, website]
  );
  res.json(result.rows[0]);
};

export const listB2BBookings = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const result = await db.query('SELECT * FROM bookings WHERE business_owner_id = $1 ORDER BY created_at DESC', [userId]);
  res.json(result.rows);
};
