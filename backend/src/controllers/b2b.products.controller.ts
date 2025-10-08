import { Request, Response } from 'express';
import db from '../config/database';

export const listProducts = async (req: Request, res: Response) => {
  const { ownerId } = req.query as { ownerId?: string };
  const { rows } = await db.query(
    `SELECT * FROM b2b_products WHERE ($1::uuid IS NULL OR owner_id = $1) ORDER BY created_at DESC`,
    [ownerId || null]
  );
  res.json(rows);
};

export const upsertProduct = async (req: Request, res: Response) => {
  const { id, name, type, description, price, currency, active } = req.body as any;
  const ownerId = (req as any).user?.id as string;
  const { rows } = await db.query(
    `INSERT INTO b2b_products (id, owner_id, name, type, description, price, currency, active)
     VALUES (COALESCE($1, gen_random_uuid()), $2, $3, $4, $5, $6, $7, COALESCE($8, true))
     ON CONFLICT (id)
     DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, description = EXCLUDED.description, price = EXCLUDED.price, currency = EXCLUDED.currency, active = EXCLUDED.active
     RETURNING *`,
    [id ?? null, ownerId, name, type, description, price, currency ?? 'USD', active]
  );
  res.status(201).json(rows[0]);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await db.query('DELETE FROM b2b_products WHERE id = $1', [id]);
  res.status(204).send();
};

export const partnerOnboard = async (req: Request, res: Response) => {
  const ownerId = (req as any).user?.id as string;
  const { companyName, contactEmail } = req.body as { companyName: string; contactEmail: string };
  // Simple placeholder flow: store a record in b2b_partners
  const { rows } = await db.query(
    `INSERT INTO b2b_partners (owner_id, company_name, contact_email)
     VALUES ($1, $2, $3) RETURNING *`,
    [ownerId, companyName, contactEmail]
  );
  res.status(201).json(rows[0]);
};
