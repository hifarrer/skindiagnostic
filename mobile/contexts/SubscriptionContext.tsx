import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { useAuth } from './AuthContext';
import { planService, PlanData, SubscriptionData } from '../services/planService';
import { revenueCatService } from '../services/revenueCatService';

interface SubscriptionContextType {
  isPremium: boolean;
  subscriptionStatus: string;
  subscription: SubscriptionData | null;
  plans: PlanData[];
  offerings: PurchasesPackage[];
  loading: boolean;
  error: string | null;
  subscribe: (plan: PlanData) => Promise<void>;
  restore: () => Promise<void>;
  manageBilling: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

  const isPremium =
    subscription?.status === 'active' || subscription?.status === 'trialing';

  const loadSubscription = useCallback(async () => {
    if (!user || !token) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);

      const [plansData, subData] = await Promise.all([
        planService.getPlans(),
        planService.getCurrentSubscription(),
      ]);

      setPlans(Array.isArray(plansData) ? plansData : []);
      setSubscription(subData.subscription);

      if (isNative) {
        await revenueCatService.initialize(user.id.toString());
        await revenueCatService.identify(user.id.toString());

        const rcOfferings = await revenueCatService.getOfferings();
        if (rcOfferings?.current?.availablePackages) {
          setOfferings(rcOfferings.current.availablePackages);
        }

        const customerInfo = await revenueCatService.getCustomerInfo();
        if (customerInfo && revenueCatService.isPremium(customerInfo)) {
          if (subData.subscription?.status !== 'active' && subData.subscription?.status !== 'trialing') {
            setSubscription((prev) =>
              prev ? { ...prev, status: 'active', source: 'revenuecat' } : prev
            );
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading subscription:', err);
      setError(err.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, [user, token, isNative]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const subscribe = useCallback(
    async (plan: PlanData) => {
      if (!user) throw new Error('Please log in first');

      setError(null);

      if (isNative) {
        if (offerings.length === 0) {
          throw new Error('No subscription packages available');
        }

        const pkg = offerings[0];
        const customerInfo = await revenueCatService.purchasePackage(pkg);
        if (customerInfo && revenueCatService.isPremium(customerInfo)) {
          setSubscription((prev) =>
            prev
              ? { ...prev, status: 'active', source: 'revenuecat', plan: { id: plan.id, name: plan.name, price: plan.price, features: plan.features } }
              : { status: 'active', source: 'revenuecat', expiresAt: null, cancelAtPeriodEnd: false, plan: { id: plan.id, name: plan.name, price: plan.price, features: plan.features } }
          );
        }
      } else {
        const { url } = await planService.createCheckoutSession(plan.id);
        if (url) {
          if (Platform.OS === 'web') {
            window.location.href = url;
          } else {
            await Linking.openURL(url);
          }
        }
      }
    },
    [user, isNative, offerings]
  );

  const restore = useCallback(async () => {
    if (!isNative) return;

    setError(null);
    try {
      const customerInfo = await revenueCatService.restorePurchases();
      if (customerInfo && revenueCatService.isPremium(customerInfo)) {
        await loadSubscription();
      } else {
        setError('No previous purchases found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to restore purchases');
      throw err;
    }
  }, [isNative, loadSubscription]);

  const manageBilling = useCallback(async () => {
    setError(null);

    if (isNative) {
      const storeUrl =
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/account/subscriptions'
          : 'https://play.google.com/store/account/subscriptions';
      await Linking.openURL(storeUrl);
    } else {
      const { url } = await planService.createPortalSession();
      if (url) {
        if (Platform.OS === 'web') {
          window.location.href = url;
        } else {
          await Linking.openURL(url);
        }
      }
    }
  }, [isNative]);

  const cancelSub = useCallback(async () => {
    setError(null);

    if (isNative) {
      await manageBilling();
    } else {
      const result = await planService.cancelSubscription();
      setSubscription((prev) =>
        prev ? { ...prev, cancelAtPeriodEnd: true, expiresAt: result.cancelAt } : prev
      );
    }
  }, [isNative, manageBilling]);

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium,
        subscriptionStatus: subscription?.status || 'inactive',
        subscription,
        plans,
        offerings,
        loading,
        error,
        subscribe,
        restore,
        manageBilling,
        cancelSubscription: cancelSub,
        refresh: loadSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
