import { apiClient } from './api';

export interface PlanData {
  id: number;
  name: string;
  description: string;
  price: string;
  features: string[];
  stripe_price_id: string | null;
  apple_product_id: string | null;
  google_product_id: string | null;
  trial_days: number;
  billing_period: string;
  is_active: boolean;
}

export interface SubscriptionData {
  status: string;
  source: string | null;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
  plan: {
    id: number;
    name: string;
    price: string;
    features: string[];
  } | null;
  stripeStatus?: string;
  currentPeriodEnd?: number;
}

export const planService = {
  async getPlans(): Promise<PlanData[]> {
    return apiClient.get('/plans');
  },

  async getCurrentSubscription(): Promise<{ subscription: SubscriptionData }> {
    return apiClient.get('/subscriptions/current');
  },

  async createCheckoutSession(planId: number): Promise<{ url: string }> {
    return apiClient.post('/subscriptions/checkout', { planId });
  },

  async createPortalSession(): Promise<{ url: string }> {
    return apiClient.post('/subscriptions/portal');
  },

  async cancelSubscription(): Promise<{ message: string; cancelAt: string }> {
    return apiClient.post('/subscriptions/cancel');
  },
};
