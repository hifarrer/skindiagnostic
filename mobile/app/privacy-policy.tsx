import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <TouchableOpacity
            style={styles.backRow}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.updated}>Last updated: February 2026</Text>

          <Section
            heading="1. Introduction"
            body="SkinDiagnostics.ai (“we,” “our,” or “us”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services (the “Service”). Please read this policy carefully."
          />
          <Section
            heading="2. Information We Collect"
            body="We may collect information you provide directly (such as name, email, and profile details), photos you upload for skin analysis, usage data (how you use the app), and device information (device type, OS, and identifiers) where applicable. We use this to provide and improve the Service, personalize your experience, and communicate with you."
          />
          <Section
            heading="3. How We Use Your Information"
            body="We use your information to provide skin analysis and recommendations, maintain your account, improve our AI and services, send important updates, and comply with legal obligations. We do not sell your personal information to third parties."
          />
          <Section
            heading="4. Data Storage and Security"
            body="We store data on secure servers and use industry-standard measures to protect your information. Photos and analysis results may be retained to improve our models and your history; you can request deletion of your data as described below."
          />
          <Section
            heading="5. Sharing of Information"
            body="We may share information with service providers who assist our operations (e.g., hosting, analytics) under strict confidentiality. We may disclose information if required by law or to protect our rights and safety."
          />
          <Section
            heading="6. Your Choices and Rights"
            body="You can access and update your profile in the app. You may request deletion of your account and associated data by contacting us or using in-app account deletion where available. Depending on your location, you may have additional rights (e.g., access, correction, portability, objection)."
          />
          <Section
            heading="7. Children’s Privacy"
            body="The Service is not intended for users under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us so we can delete it."
          />
          <Section
            heading="8. International Transfers"
            body="Your information may be processed in countries other than your own. We ensure appropriate safeguards are in place where required by applicable law."
          />
          <Section
            heading="9. Changes to This Policy"
            body="We may update this Privacy Policy from time to time. We will notify you of material changes via the app or email. Your continued use of the Service after changes constitutes acceptance of the updated policy."
          />
          <Section
            heading="10. Contact Us"
            body="For privacy-related questions or requests, contact us at privacy@skindiagnostics.ai or through the contact option in the app."
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 SkinDiagnostics.ai</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ heading, body }: { heading: string; body: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>{heading}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf7ff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  inner: {
    maxWidth: 720,
    width: '92%',
    alignSelf: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  backRow: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.landing.purple,
    fontFamily: Colors.landing.fontFamily,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.landing.dark,
    marginBottom: 8,
    fontFamily: Colors.landing.fontFamily,
  },
  updated: {
    fontSize: 14,
    color: Colors.landing.muted,
    marginBottom: 28,
    fontFamily: Colors.landing.fontFamily,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.landing.dark,
    marginBottom: 10,
    fontFamily: Colors.landing.fontFamily,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.landing.muted,
    fontFamily: Colors.landing.fontFamily,
  },
  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.landing.cardBorder,
  },
  footerText: {
    fontSize: 12,
    color: Colors.landing.muted,
    fontFamily: Colors.landing.fontFamily,
  },
});
