import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '../constants/Colors';

export default function LandingBenefits() {
  // Web-only component
  if (Platform.OS !== 'web') {
    return null;
  }

  const benefits = [
    {
      icon: '⏱️',
      title: 'Instant Results',
      description: 'Get results in seconds.',
    },
    {
      icon: '🛡️',
      title: 'AI Accuracy',
      description: 'Advanced skin diagnostics.',
    },
    {
      icon: '⭐',
      title: 'Personalized Advice',
      description: 'Tailored skincare recommendations.',
    },
  ];

  return (
    <View style={styles.benefits}>
      <View style={styles.benefitsContent}>
        <View style={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              </View>
              <View style={styles.benefitBody}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  benefits: {
    marginTop: 16,
  },
  benefitsContent: {
    width: '92%',
    maxWidth: 1140,
    alignSelf: 'center',
  },
  benefitsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  benefitCard: {
    width: Platform.OS === 'web' ? '32%' : '100%',
    minWidth: 250,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    marginBottom: 14,
    shadowColor: '#1f2430',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  benefitIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitIcon: {
    fontSize: 16,
  },
  benefitBody: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2f3341',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    color: '#5b6070',
    lineHeight: 18,
  },
});
