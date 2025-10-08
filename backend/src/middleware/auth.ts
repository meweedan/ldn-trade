import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/database';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email?: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key') as any;
    const userId = decoded.sub as string;
    const role = decoded.role as string;

    // Fetch email so downstream handlers like getMyCommunications can use it
    let email: string | undefined = undefined;
    try {
      const result = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
      email = result.rows?.[0]?.email as string | undefined;
    } catch {
      // ignore DB lookup failure; proceed with id/role only
    }

    req.user = { id: userId, role, email };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
