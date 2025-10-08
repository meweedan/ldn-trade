import { Router } from 'express';
import { unlock, status } from '../controllers/community.controller';

const router = Router();
router.post('/unlock', ...(unlock as any));
router.get('/status', ...(status as any));
export default router;
