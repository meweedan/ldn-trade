// routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import coursesRoutes from './courses.routes';
import purchaseRoutes from './purchase.routes';
import resourcesRoutes from './resources.routes';
import communityRoutes from './community.routes';
import brokerRoutes from './broker.routes';
import adminRoutes from './admin.routes';
import contentRoutes from './content.routes';
import analyticsRoutes from './analytics.routes';
import contactRoutes from './contact.routes';
import communicationsRoutes from './communications.routes';
import careersRoutes from './careers.routes';
import promosRoutes from './promos.routes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/', contentRoutes);
router.use('/careers', careersRoutes);
// Education app endpoints
router.use('/courses', coursesRoutes);
router.use('/purchase', purchaseRoutes);
router.use('/resources', resourcesRoutes);
router.use('/community', communityRoutes);
router.use('/broker', brokerRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/contact', contactRoutes);
router.use('/communications', communicationsRoutes);
router.use('/promos', promosRoutes);

export default router;
