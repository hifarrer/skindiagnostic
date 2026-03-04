import Stripe from 'stripe';
import { User } from '../models/User.js';
import { Plan } from '../models/Plan.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── Stripe Webhook ──────────────────────────────────────────────────────

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`Error handling Stripe event ${event.type}:`, error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

async function handleCheckoutCompleted(session) {
  if (session.mode !== 'subscription') return;

  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const userId = session.metadata?.userId;

  let user;
  if (userId) {
    user = await User.findById(parseInt(userId, 10));
  }
  if (!user) {
    user = await User.findByStripeCustomerId(customerId);
  }
  if (!user) {
    console.error('Stripe checkout: no user found for customer', customerId);
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price?.id;
  const plan = priceId ? await Plan.findByStripePriceId(priceId) : null;

  await User.updateSubscriptionFull(user.id, {
    planId: plan?.id || user.subscription_plan_id,
    status: subscription.status === 'trialing' ? 'trialing' : 'active',
    source: 'stripe',
    expiresAt: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    stripeCustomerId: customerId,
  });
}

async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer;
  const user = await User.findByStripeCustomerId(customerId);
  if (!user) {
    console.error('Stripe sub updated: no user for customer', customerId);
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id;
  const plan = priceId ? await Plan.findByStripePriceId(priceId) : null;

  let status;
  switch (subscription.status) {
    case 'active':
      status = 'active';
      break;
    case 'trialing':
      status = 'trialing';
      break;
    case 'past_due':
      status = 'past_due';
      break;
    case 'canceled':
    case 'unpaid':
      status = 'inactive';
      break;
    default:
      status = subscription.status;
  }

  await User.updateSubscriptionFull(user.id, {
    planId: plan?.id || user.subscription_plan_id,
    status,
    source: 'stripe',
    expiresAt: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;
  const user = await User.findByStripeCustomerId(customerId);
  if (!user) return;

  const freePlan = await Plan.findFree();

  await User.updateSubscriptionFull(user.id, {
    planId: freePlan?.id || null,
    status: 'inactive',
    source: 'stripe',
    expiresAt: null,
    cancelAtPeriodEnd: false,
  });
}

async function handlePaymentFailed(invoice) {
  if (!invoice.subscription) return;

  const customerId = invoice.customer;
  const user = await User.findByStripeCustomerId(customerId);
  if (!user) return;

  await User.updateSubscriptionFull(user.id, { status: 'past_due' });
}

async function handlePaymentSucceeded(invoice) {
  if (!invoice.subscription) return;

  const customerId = invoice.customer;
  const user = await User.findByStripeCustomerId(customerId);
  if (!user) return;

  if (user.subscription_status === 'past_due') {
    await User.updateSubscriptionFull(user.id, { status: 'active' });
  }
}

// ── RevenueCat Webhook ──────────────────────────────────────────────────

export const handleRevenueCatWebhook = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const expectedSecret = process.env.REVENUECAT_WEBHOOK_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    console.error('RevenueCat webhook: invalid authorization header');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { event } = req.body;
  if (!event) {
    return res.status(400).json({ error: 'No event in request body' });
  }

  try {
    const appUserId = event.app_user_id;
    const eventType = event.type;

    let user = await findUserByRevenueCatId(appUserId);
    if (!user) {
      console.error('RevenueCat webhook: no user found for app_user_id', appUserId);
      return res.json({ received: true });
    }

    switch (eventType) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION':
        await handleRCPurchase(user, event);
        break;

      case 'CANCELLATION':
        await handleRCCancellation(user, event);
        break;

      case 'EXPIRATION':
        await handleRCExpiration(user);
        break;

      case 'BILLING_ISSUE_DETECTED':
        await User.updateSubscriptionFull(user.id, { status: 'past_due' });
        break;

      case 'SUBSCRIBER_ALIAS':
        break;

      default:
        console.log(`Unhandled RevenueCat event: ${eventType}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling RevenueCat webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

async function findUserByRevenueCatId(appUserId) {
  let user = await User.findByRevenueCatId(appUserId);
  if (user) return user;

  const numericId = parseInt(appUserId, 10);
  if (!isNaN(numericId)) {
    user = await User.findById(numericId);
    if (user) {
      await User.update(user.id, { revenuecat_app_user_id: appUserId });
    }
  }
  return user;
}

async function handleRCPurchase(user, event) {
  const productId = event.product_id;
  let plan = await Plan.findByAppleProductId(productId);
  if (!plan) {
    plan = await Plan.findByGoogleProductId(productId);
  }

  const expiresAt = event.expiration_at_ms
    ? new Date(event.expiration_at_ms).toISOString()
    : null;

  await User.updateSubscriptionFull(user.id, {
    planId: plan?.id || user.subscription_plan_id,
    status: 'active',
    source: 'revenuecat',
    expiresAt,
    cancelAtPeriodEnd: false,
    revenuecatAppUserId: event.app_user_id,
  });
}

async function handleRCCancellation(user, event) {
  const expiresAt = event.expiration_at_ms
    ? new Date(event.expiration_at_ms).toISOString()
    : null;

  await User.updateSubscriptionFull(user.id, {
    status: 'active',
    cancelAtPeriodEnd: true,
    expiresAt,
  });
}

async function handleRCExpiration(user) {
  const freePlan = await Plan.findFree();

  await User.updateSubscriptionFull(user.id, {
    planId: freePlan?.id || null,
    status: 'inactive',
    source: 'revenuecat',
    expiresAt: null,
    cancelAtPeriodEnd: false,
  });
}
