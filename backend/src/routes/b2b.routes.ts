import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getBusinessProfile, updateBusinessProfile, listB2BBookings } from '../controllers/b2b.controller';

const router = Router();

router.get('/profile', authenticate, authorize('business'), getBusinessProfile);
router.put('/profile', authenticate, authorize('business'), updateBusinessProfile);
router.get('/bookings', authenticate, authorize('business'), listB2BBookings);

export default router;
