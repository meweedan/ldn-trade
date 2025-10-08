import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listProducts, upsertProduct, deleteProduct, partnerOnboard } from '../controllers/b2b.products.controller';

const router = Router();

router.get('/products', authenticate, authorize('business'), listProducts);
router.post('/products', authenticate, authorize('business'), upsertProduct);
router.delete('/products/:id', authenticate, authorize('business'), deleteProduct);
router.post('/partners/onboard', authenticate, authorize('business'), partnerOnboard);

export default router;
