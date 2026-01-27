import { apiClient } from './api';

export const planService = {
  async getPlans() {
    return apiClient.get('/plans');
  },

  async createSubscription(planId: number, paymentMethodId: string) {
    return apiClient.post('/subscriptions/create', {
      planId,
      paymentMethodId,
    });
  },

  async getCurrentSubscription() {
    return apiClient.get('/subscriptions/current');
  },
};

