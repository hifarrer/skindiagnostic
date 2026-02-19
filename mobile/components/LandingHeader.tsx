import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { useIsDesktop } from '../hooks/useIsDesktop';

export default function LandingHeader() {
  const router = useRouter();
  const isDesktop = useIsDesktop();

  // Web-only component
  if (Platform.OS !== 'web') {
    return null;
  }

  const scrollToSection = (sectionId: string) => {
    if (typeof document !== 'undefined') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>✦</Text>
          </View>
          <Text style={styles.logoText}>SkinDiagnostics.ai</Text>
        </View>

        {isDesktop && (
          <View style={styles.navLinks}>
            <TouchableOpacity onPress={() => scrollToSection('hero')}>
              <Text style={styles.navLink}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => scrollToSection('how')}>
              <Text style={styles.navLink}>How It Works</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => scrollToSection('about')}>
              <Text style={styles.navLink}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => scrollToSection('faqs')}>
              <Text style={styles.navLink}>FAQs</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.primary.pink, Colors.primary.purple]}
            style={styles.getStartedGradient}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.8)',
    zIndex: 20,
  },
  container: {
    width: '92%',
    maxWidth: 1140,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(123,92,255,0.12)',
  },
  logoMarkText: {
    fontSize: 16,
    color: Colors.primary.purple,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2a2f3c',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  navLink: {
    fontSize: 14,
    color: '#3b3f4e',
    fontWeight: '500',
    marginHorizontal: 12,
  },
  getStartedButton: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  getStartedGradient: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
