import Stripe from 'stripe';
import { User } from '../models/User.js';
import { Plan } from '../models/Plan.js';
import { getFrontendUrl } from '../config/urls.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getOrCreateStripeCustomer(user) {
  if (user.stripe_customer_id) {
    return user.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id.toString() },
  });

  await User.update(user.id, { stripe_customer_id: customer.id });
  return customer.id;
}

export const createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    if (!plan.stripe_price_id) {
      return res.status(400).json({ error: 'Plan does not have a Stripe price configured' });
    }

    const user = await User.findById(req.user.id);
    const customerId = await getOrCreateStripeCustomer(user);

    const sessionParams = {
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      success_url: `${getFrontendUrl()}/subscription?success=true`,
      cancel_url: `${getFrontendUrl()}/subscription?canceled=true`,
      metadata: { userId: user.id.toString(), planId: plan.id.toString() },
    };

    if (plan.trial_days > 0) {
      sessionParams.subscription_data = {
        trial_period_days: plan.trial_days,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
};

export const createPortalSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${getFrontendUrl()}/subscription`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create portal session error:', error);
    res.status(500).json({ error: 'Failed to create billing portal session' });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.stripe_customer_id) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      const trialingSubs = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'trialing',
        limit: 1,
      });
      if (trialingSubs.data.length === 0) {
        return res.status(400).json({ error: 'No active subscription found' });
      }
      subscriptions.data = trialingSubs.data;
    }

    const subscription = await stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true,
    });

    await User.updateSubscriptionFull(user.id, {
      cancelAtPeriodEnd: true,
      expiresAt: new Date(subscription.current_period_end * 1000).toISOString(),
    });

    res.json({
      message: 'Subscription will cancel at end of billing period',
      cancelAt: new Date(subscription.current_period_end * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

export const getCurrentSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const plan = user.subscription_plan_id
      ? await Plan.findById(user.subscription_plan_id)
      : null;

    const response = {
      subscription: {
        status: user.subscription_status || 'inactive',
        source: user.subscription_source || null,
        expiresAt: user.subscription_expires_at || null,
        cancelAtPeriodEnd: user.subscription_cancel_at_period_end || false,
        plan: plan
          ? { id: plan.id, name: plan.name, price: plan.price, features: plan.features }
          : null,
      },
    };

    if (user.stripe_customer_id && user.subscription_source === 'stripe') {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          limit: 1,
          expand: ['data.default_payment_method'],
        });

        if (subscriptions.data.length > 0) {
          const sub = subscriptions.data[0];
          response.subscription.stripeStatus = sub.status;
          response.subscription.currentPeriodEnd = sub.current_period_end;
          response.subscription.cancelAtPeriodEnd = sub.cancel_at_period_end;
        }
      } catch (stripeErr) {
        console.error('Error fetching Stripe subscription details:', stripeErr);
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
};
