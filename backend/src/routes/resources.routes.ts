import { Router } from 'express';
import { listForTier } from '../controllers/resources.controller';

const router = Router();
router.get('/:tierId', ...listForTier as any);
export default router;
