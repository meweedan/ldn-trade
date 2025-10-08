// backend/src/routes/communications.routes.ts
import { Router } from 'express';
import {
  createCommunication,
  getCommunicationPublic,
  assignCommunication,
  setPriority,
  escalateCommunication,
  getMyCommunications,
  closeCommunication,
} from '../controllers/communications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public endpoint for contact form submissions
router.post('/', createCommunication);

// Public ticket tracking
router.get('/track/:ticketId', getCommunicationPublic);
router.get("/my", authenticate, getMyCommunications);
router.patch('/communications/:id/assign', assignCommunication);
router.patch('/communications/:id/priority', setPriority);
router.patch('/communications/:id/escalate', escalateCommunication);
router.patch('/communications/:id/close', closeCommunication);

export default router;
