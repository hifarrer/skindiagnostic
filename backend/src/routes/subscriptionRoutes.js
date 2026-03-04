import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  getCurrentSubscription,
} from '../controllers/subscriptionController.js';

const router = express.Router();

router.post('/checkout', authenticate, createCheckoutSession);
router.post('/portal', authenticate, createPortalSession);
router.post('/cancel', authenticate, cancelSubscription);
router.get('/current', authenticate, getCurrentSubscription);

export default router;
