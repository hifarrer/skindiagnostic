import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOfferings,
  LOG_LEVEL,
} from 'react-native-purchases';
import { REVENUECAT_APPLE_KEY, REVENUECAT_GOOGLE_KEY } from '../constants/Config';

let isInitialized = false;

export const revenueCatService = {
  async initialize(appUserId?: string) {
    if (Platform.OS === 'web' || isInitialized) return;

    const apiKey =
      Platform.OS === 'ios' ? REVENUECAT_APPLE_KEY : REVENUECAT_GOOGLE_KEY;

    if (!apiKey) {
      console.warn('RevenueCat: No API key configured for platform', Platform.OS);
      return;
    }

    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    await Purchases.configure({
      apiKey,
      appUserID: appUserId || undefined,
    });

    isInitialized = true;
  },

  async identify(appUserId: string) {
    if (Platform.OS === 'web' || !isInitialized) return;
    await Purchases.logIn(appUserId);
  },

  async logout() {
    if (Platform.OS === 'web' || !isInitialized) return;
    await Purchases.logOut();
  },

  async getOfferings(): Promise<PurchasesOfferings | null> {
    if (Platform.OS === 'web' || !isInitialized) return null;

    try {
      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error) {
      console.error('RevenueCat getOfferings error:', error);
      return null;
    }
  },

  async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
    if (Platform.OS === 'web') return null;

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo;
    } catch (error: any) {
      if (error.userCancelled) {
        return null;
      }
      throw error;
    }
  },

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (Platform.OS === 'web' || !isInitialized) return null;

    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('RevenueCat getCustomerInfo error:', error);
      return null;
    }
  },

  async restorePurchases(): Promise<CustomerInfo | null> {
    if (Platform.OS === 'web' || !isInitialized) return null;

    try {
      return await Purchases.restorePurchases();
    } catch (error) {
      console.error('RevenueCat restorePurchases error:', error);
      throw error;
    }
  },

  isPremium(customerInfo: CustomerInfo | null): boolean {
    if (!customerInfo) return false;
    return customerInfo.entitlements.active['premium'] !== undefined;
  },
};
