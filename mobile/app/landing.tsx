import React, { useEffect, useRef } from 'react';
import { ScrollView, View, StyleSheet, Platform, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import LandingHero from '../components/LandingHero';
import LandingHowItWorks from '../components/LandingHowItWorks';
import LandingConcerns from '../components/LandingConcerns';
import LandingFAQ from '../components/LandingFAQ';

export default function LandingPage() {
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'web' && !hasRedirected.current) {
      const timer = setTimeout(() => {
        router.replace('/(auth)/login');
        hasRedirected.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [router]);

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container} id="template-body-content">
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LandingHero />
        <LandingHowItWorks />
        <LandingConcerns />
        <LandingFAQ />

        <View style={styles.finalCTA}>
          <Text style={styles.finalCTATitle}>
            Ready to Improve Your Skin{' '}
            <Text style={styles.finalCTATitleAccent}>Health?</Text>
          </Text>
          <TouchableOpacity
            style={styles.finalCTAContainer}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#7B5CFF', '#FF5EA8', '#FF8A4C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.finalCTAGradient}
            >
              <Text style={styles.finalCTALink}>Get Started Now  ›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    ...Platform.select({
      web: {
        minHeight: '100vh',
      },
    }),
  },
  finalCTA: {
    paddingTop: 24,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalCTATitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2430',
    marginBottom: 14,
    textAlign: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  finalCTATitleAccent: {
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(90deg, #7B5CFF, #FF5EA8)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      } as any,
      default: {
        color: '#7B5CFF',
      },
    }),
  },
  finalCTAContainer: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  finalCTAGradient: {
    paddingHorizontal: 34,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalCTALink: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});
