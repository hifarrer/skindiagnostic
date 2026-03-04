import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { PlanData } from '../../services/planService';

const GRADIENTS: Record<string, readonly [string, string]> = {
  free: ['#5b6070', '#3a3f52'],
  premium: Colors.landing.gradientPurplePink as unknown as readonly [string, string],
};
const DEFAULT_GRADIENT: readonly [string, string] = ['#7B5CFF', '#5AD7FF'];

export default function SubscriptionScreen() {
  const {
    isPremium,
    subscription,
    plans,
    loading,
    error,
    subscribe,
    restore,
    manageBilling,
    cancelSubscription,
    refresh,
  } = useSubscription();
  const [actionLoading, setActionLoading] = useState(false);
  const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

  const handleSubscribe = async (plan: PlanData) => {
    try {
      setActionLoading(true);
      await subscribe(plan);
    } catch (err: any) {
      const msg = err.message || 'Subscription failed';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setActionLoading(true);
      await restore();
      if (Platform.OS === 'web') {
        alert('Purchases restored successfully');
      } else {
        Alert.alert('Success', 'Purchases restored successfully');
      }
    } catch (err: any) {
      const msg = err.message || 'Restore failed';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setActionLoading(true);
      await manageBilling();
    } catch (err: any) {
      const msg = err.message || 'Failed to open billing portal';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const doCancel = async () => {
      try {
        setActionLoading(true);
        await cancelSubscription();
        await refresh();
      } catch (err: any) {
        const msg = err.message || 'Failed to cancel';
        if (Platform.OS === 'web') {
          alert(msg);
        } else {
          Alert.alert('Error', msg);
        }
      } finally {
        setActionLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to cancel? You will keep access until the end of your billing period.')) {
        await doCancel();
      }
    } else {
      Alert.alert(
        'Cancel Subscription',
        'Are you sure? You will keep access until the end of your billing period.',
        [
          { text: 'Keep Subscription', style: 'cancel' },
          { text: 'Cancel', style: 'destructive', onPress: doCancel },
        ]
      );
    }
  };

  const getGradient = (name: string): readonly [string, string] =>
    GRADIENTS[name.toLowerCase()] || DEFAULT_GRADIENT;

  const isFree = (plan: PlanData) => parseFloat(plan.price) === 0;

  const isCurrentPlan = (plan: PlanData) => {
    if (!subscription?.plan) return isFree(plan);
    return subscription.plan.id === plan.id;
  };

  const getButtonLabel = (plan: PlanData) => {
    if (isCurrentPlan(plan)) {
      if (isFree(plan)) return 'Current Plan';
      if (subscription?.cancelAtPeriodEnd) return 'Cancelling...';
      return 'Current Plan';
    }
    if (!isFree(plan) && plan.trial_days > 0) {
      return `Start ${plan.trial_days}-Day Free Trial`;
    }
    if (isFree(plan)) return 'Downgrade';
    return 'Subscribe';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.landing.purple} />
        <Text style={styles.loadingText}>Loading plans...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={Colors.landing.gradientPurplePink}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Unlock the full potential of SkinDiagnostics.AI
        </Text>
        {isPremium && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {subscription?.status === 'trialing' ? 'FREE TRIAL ACTIVE' : 'PREMIUM ACTIVE'}
            </Text>
          </View>
        )}
      </LinearGradient>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isPremium && subscription?.cancelAtPeriodEnd && subscription.expiresAt && (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>
            Your subscription will end on {new Date(subscription.expiresAt).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        {plans.map((plan) => {
          const current = isCurrentPlan(plan);
          const free = isFree(plan);
          const popular = !free && plan.name.toLowerCase() === 'premium';

          return (
            <View
              key={plan.id}
              style={[styles.planCard, popular && styles.planCardPopular]}
            >
              {popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  {free ? '$0' : `$${parseFloat(plan.price).toFixed(2)}`}
                </Text>
                <Text style={styles.period}>
                  /{free ? 'forever' : `${plan.billing_period || 'month'}`}
                </Text>
              </View>
              {plan.description ? (
                <Text style={styles.description}>{plan.description}</Text>
              ) : null}
              <View style={styles.featuresList}>
                {(plan.features || []).map((feature: string, index: number) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureIcon}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.subscribeButtonWrap}
                onPress={() => {
                  if (current || actionLoading) return;
                  if (free) return;
                  handleSubscribe(plan);
                }}
                activeOpacity={current || free ? 1 : 0.86}
                disabled={actionLoading}
              >
                <LinearGradient
                  colors={current ? (['#aab0bf', '#8e94a4'] as const) : getGradient(plan.name)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.subscribeButton}
                >
                  {actionLoading && !current ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.subscribeText}>{getButtonLabel(plan)}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          );
        })}

        {isPremium && (
          <View style={styles.managementSection}>
            <TouchableOpacity
              style={styles.managementButton}
              onPress={handleManageBilling}
              disabled={actionLoading}
            >
              <Text style={styles.managementButtonText}>Manage Billing</Text>
            </TouchableOpacity>

            {!subscription?.cancelAtPeriodEnd && subscription?.source !== 'revenuecat' && (
              <TouchableOpacity
                style={[styles.managementButton, styles.cancelButton]}
                onPress={handleCancel}
                disabled={actionLoading}
              >
                <Text style={[styles.managementButtonText, styles.cancelButtonText]}>
                  Cancel Subscription
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isNative && (
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={actionLoading}
          >
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fbff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.landing.muted,
    fontFamily: Colors.landing.fontFamily,
  },
  header: {
    padding: 28,
    paddingTop: 36,
    paddingBottom: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 6,
    fontFamily: Colors.landing.fontFamily,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    fontFamily: Colors.landing.fontFamily,
  },
  statusBadge: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: Colors.landing.fontFamily,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 14,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontFamily: Colors.landing.fontFamily,
  },
  noticeBanner: {
    backgroundColor: '#fef9c3',
    padding: 14,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
  },
  noticeText: {
    color: '#92400e',
    fontSize: 13,
    fontFamily: Colors.landing.fontFamily,
  },
  content: {
    padding: 24,
  },
  planCard: {
    borderRadius: 26,
    padding: 26,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    shadowColor: '#1f2430',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 4,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.40))',
          boxShadow: '0 14px 30px rgba(31,36,48,.10)',
        } as any
      : { backgroundColor: Colors.landing.cardBg }),
  },
  planCardPopular: {
    borderColor: Colors.landing.pink,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: Colors.landing.pink,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  popularText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Colors.landing.fontFamily,
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.landing.dark,
    marginBottom: 10,
    fontFamily: Colors.landing.fontFamily,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.landing.dark,
    fontFamily: Colors.landing.fontFamily,
  },
  period: {
    fontSize: 15,
    color: Colors.landing.muted,
    marginLeft: 4,
    fontFamily: Colors.landing.fontFamily,
  },
  description: {
    fontSize: 13,
    color: Colors.landing.muted,
    marginBottom: 16,
    fontFamily: Colors.landing.fontFamily,
  },
  featuresList: {
    marginBottom: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIcon: {
    fontSize: 16,
    color: Colors.landing.purple,
    marginRight: 10,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 14,
    color: Colors.landing.muted,
    fontFamily: Colors.landing.fontFamily,
  },
  subscribeButtonWrap: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: Colors.landing.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 3,
  },
  subscribeButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: Colors.landing.fontFamily,
  },
  managementSection: {
    marginTop: 8,
    marginBottom: 20,
    gap: 12,
  },
  managementButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  managementButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.landing.dark,
    fontFamily: Colors.landing.fontFamily,
  },
  cancelButton: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
  },
  cancelButtonText: {
    color: '#dc2626',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 40,
  },
  restoreText: {
    fontSize: 14,
    color: Colors.landing.purple,
    fontWeight: '600',
    fontFamily: Colors.landing.fontFamily,
  },
});
