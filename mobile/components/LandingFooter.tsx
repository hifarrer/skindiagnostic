import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useIsDesktop } from '../hooks/useIsDesktop';

export default function LandingFooter() {
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

  const socialLinks = [
    { name: 'Facebook', icon: '📘', url: 'https://facebook.com' },
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com' },
    { name: 'Instagram', icon: '📷', url: 'https://instagram.com' },
    { name: 'YouTube', icon: '▶️', url: 'https://youtube.com' },
  ];

  const quickLinks = [
    { label: 'Home', action: () => scrollToSection('hero') },
    { label: 'How It Works', action: () => scrollToSection('how') },
    { label: 'About', action: () => scrollToSection('about') },
    { label: 'FAQs', action: () => scrollToSection('faqs') },
    { label: 'Privacy Policy', action: () => router.push('/privacy-policy') },
    { label: 'Terms of Use', action: () => router.push('/terms-of-use') },
    { label: 'Blog', action: () => {} },
    { label: 'Contact', action: () => router.push('/contact') },
  ];

  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        <View style={styles.quickLinksSection}>
          <Text style={styles.quickLinksTitle}>Quick Links</Text>
          <View style={styles.quickLinksGrid}>
            {quickLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                onPress={link.action}
                style={styles.quickLink}
              >
                <Text style={styles.quickLinkText}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={[styles.footerBottom, !isDesktop && styles.footerBottomStack]}>
          <Text style={styles.copyright}>© 2026 SkinDiagnostics.ai</Text>
          <View style={styles.socialWrap}>
            <View style={styles.socialLinks}>
              {socialLinks.map((social, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (Platform.OS === 'web' && typeof Linking !== 'undefined') {
                      Linking.openURL(social.url).catch(() => {});
                    }
                  }}
                  style={styles.socialLink}
                >
                  <Text style={styles.socialIcon}>{social.icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 10,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.75)',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  container: {
    width: '92%',
    maxWidth: 1140,
    alignSelf: 'center',
  },
  quickLinksSection: {
    marginBottom: 14,
  },
  quickLinksTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3a3f52',
    marginBottom: 10,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickLink: {
    marginRight: 20,
    marginBottom: 6,
  },
  quickLinkText: {
    fontSize: 13,
    color: '#4f5566',
    fontWeight: '600',
  },
  footerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  footerBottomStack: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  copyright: {
    fontSize: 12,
    color: '#4f5566',
  },
  socialWrap: {
    alignItems: 'flex-end',
  },
  socialLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialLink: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.84)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  socialIcon: {
    fontSize: 12,
  },
});
