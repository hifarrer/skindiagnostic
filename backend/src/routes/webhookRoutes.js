import express from 'express';
import { handleStripeWebhook, handleRevenueCatWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Stripe needs raw body for signature verification — the raw body middleware
// is applied at the route level here, NOT at the app level.
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// RevenueCat sends JSON
router.post('/revenuecat', express.json(), handleRevenueCatWebhook);

export default router;
