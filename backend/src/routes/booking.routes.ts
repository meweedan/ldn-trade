import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { searchTrips, createBooking, listMyBookings } from '../controllers/booking.controller';

const router = Router();

// Public search endpoint (no auth required)
router.get('/search', searchTrips);
router.post('/', authenticate, createBooking);
router.get('/me', authenticate, listMyBookings);

export default router;
