import { Router } from 'express';
import { getTraffic, getRevenue, getCoursesAgg, trackEvent, getAdminExtras } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// public tracking endpoint
router.post('/track', trackEvent);

// admin analytics (require auth + admin)
router.get('/traffic', authenticate, authorize('admin'), ...(getTraffic as any));
router.get('/revenue', authenticate, authorize('admin'), ...(getRevenue as any));
router.get('/courses', authenticate, authorize('admin'), ...(getCoursesAgg as any));
router.get('/admin-extras', authenticate, authorize('admin'), ...(getAdminExtras as any));

export default router;
