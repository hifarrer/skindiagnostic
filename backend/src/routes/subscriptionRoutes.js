import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createSubscription, getCurrentSubscription } from '../controllers/subscriptionController.js';

const router = express.Router();

router.post('/create', authenticate, createSubscription);
router.get('/current', authenticate, getCurrentSubscription);

export default router;

