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

export default function TermsOfUseScreen() {
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

          <Text style={styles.title}>Terms of Use</Text>
          <Text style={styles.updated}>Last updated: February 2026</Text>

          <Section
            heading="1. Acceptance of Terms"
            body="By accessing or using SkinDiagnostics.ai (“Service”), you agree to be bound by these Terms of Use. If you do not agree, do not use the Service. We may update these terms from time to time; continued use after changes constitutes acceptance."
          />
          <Section
            heading="2. Description of Service"
            body="SkinDiagnostics.ai provides AI-powered skin analysis and related wellness information. The Service is for general informational and educational purposes only. It is not a medical device and does not provide medical advice, diagnosis, or treatment."
          />
          <Section
            heading="3. Not Medical Advice"
            body="The Service does not replace professional medical advice. Always seek the advice of a physician or dermatologist for any skin or health concerns. Do not disregard professional advice or delay seeking it because of something you read or received through the Service."
          />
          <Section
            heading="4. Eligibility and Account"
            body="You must be at least 13 years old to use the Service. You are responsible for maintaining the confidentiality of your account and for all activity under your account. You must provide accurate information when registering."
          />
          <Section
            heading="5. Acceptable Use"
            body="You agree to use the Service only for lawful purposes. You may not misuse the Service, attempt to gain unauthorized access, upload harmful or illegal content, or use the Service in any way that could harm us, other users, or third parties. We may suspend or terminate access for violations."
          />
          <Section
            heading="6. Intellectual Property"
            body="The Service and its content (including software, design, text, and graphics) are owned by SkinDiagnostics.ai or its licensors. You may not copy, modify, distribute, or create derivative works without our written permission. You retain rights to content you submit; you grant us a license to use it to provide and improve the Service."
          />
          <Section
            heading="7. Subscriptions and Payments"
            body="If you subscribe to paid features, you agree to the applicable subscription terms and payment terms. Fees are non-refundable except where required by law or as stated in our subscription policy. We may change pricing with notice."
          />
          <Section
            heading="8. Disclaimers"
            body="The Service is provided “as is” and “as available.” We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose. We do not guarantee that the Service will be uninterrupted, error-free, or that results will be accurate or complete."
          />
          <Section
            heading="9. Limitation of Liability"
            body="To the maximum extent permitted by law, SkinDiagnostics.ai and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or data, arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the twelve months before the claim."
          />
          <Section
            heading="10. Indemnification"
            body="You agree to indemnify and hold harmless SkinDiagnostics.ai and its officers, directors, and employees from any claims, damages, or expenses arising from your use of the Service or violation of these terms."
          />
          <Section
            heading="11. Termination"
            body="We may terminate or suspend your access at any time for any reason. You may stop using the Service at any time. Upon termination, your right to use the Service ceases. Provisions that by their nature should survive (e.g., disclaimers, limitation of liability) will survive."
          />
          <Section
            heading="12. Governing Law"
            body="These terms are governed by the laws of the jurisdiction in which we operate, without regard to conflict of law principles. Any disputes shall be resolved in the courts of that jurisdiction."
          />
          <Section
            heading="13. Contact"
            body="For questions about these Terms of Use, contact us at legal@skindiagnostics.ai or through the contact option in the app."
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
