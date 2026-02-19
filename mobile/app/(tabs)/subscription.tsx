import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function SubscriptionScreen() {
  const router = useRouter();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'Forever',
      features: ['Basic skin analysis', 'Limited looks', 'Watermarked results'],
      gradient: ['#5b6070', '#3a3f52'] as const,
      popular: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99',
      period: 'per month',
      features: ['Unlimited analysis', 'All looks', 'HD results', 'Priority support'],
      gradient: Colors.landing.gradientPurplePink,
      popular: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19.99',
      period: 'per month',
      features: ['Everything in Premium', 'API access', 'Custom looks', 'White-label'],
      gradient: ['#7B5CFF', '#5AD7FF'] as const,
      popular: false,
    },
  ];

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
      </LinearGradient>

      <View style={styles.content}>
        {plans.map((plan) => (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              plan.popular && styles.planCardPopular,
            ]}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>POPULAR</Text>
              </View>
            )}
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.period}>/{plan.period}</Text>
            </View>
            <View style={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureIcon}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.subscribeButtonWrap} onPress={() => {}} activeOpacity={0.86}>
              <LinearGradient
                colors={plan.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.subscribeButton}
              >
                <Text style={styles.subscribeText}>
                  {plan.id === 'free' ? 'Current Plan' : 'Subscribe'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fbff',
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
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.40))',
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
    marginBottom: 20,
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
});
