import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useIsDesktop } from '../hooks/useIsDesktop';

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: 'What is SkinDiagnostics?',
    answer:
      'SkinDiagnostics.ai is an AI-powered skin analysis app that helps you understand your skin condition. You can upload a photo, receive instant analysis for concerns like acne, texture, and redness, and get personalized skincare recommendations—all from your phone or computer.',
  },
  {
    question: 'How often should I use the SkinDiagnostics app?',
    answer:
      'We recommend using the skin analysis feature once or twice a week to track changes over time. Daily use is not necessary; consistency every few days or weekly gives the best picture of how your skin is responding to your routine or treatments.',
  },
  {
    question: 'When should I see a doctor?',
    answer:
      'You should see a dermatologist or doctor if you notice sudden or severe changes, persistent irritation, signs of infection, or any lesion that bleeds, grows, or doesn’t heal. The app is for general awareness and tracking—it does not diagnose medical conditions. When in doubt, always consult a healthcare provider.',
  },
  {
    question: 'Does SkinDiagnostics.AI replace a doctor?',
    answer:
      'No. SkinDiagnostics.ai is a wellness and awareness tool, not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a dermatologist or physician for any skin or health concerns.',
  },
  {
    question: 'What skin conditions can the app help with?',
    answer:
      'The app can help you track and get insights on common concerns such as acne, skin texture, redness, and overall skin condition. It is not intended to diagnose serious conditions like skin cancer—those require in-person evaluation by a doctor.',
  },
  {
    question: 'How can I cancel my account?',
    answer:
      'You can cancel your subscription from the Subscription or Profile section in the app. If you subscribed through the App Store or Google Play, you may need to manage the subscription in your device’s account settings. Cancelling stops future charges but does not delete your account or data.',
  },
  {
    question: 'How can I delete my account?',
    answer:
      'To delete your account and associated data, go to Profile in the app and look for “Delete account” or “Account settings.” Follow the steps to permanently remove your account. If you don’t see this option, contact our support team and we’ll guide you through the process.',
  },
  {
    question: 'Is my personal information safe?',
    answer:
      'Yes. We take privacy seriously. Your photos and personal data are processed securely and we do not sell your information to third parties. We use industry-standard practices to protect your data. For full details, please see our Privacy Policy.',
  },
  {
    question: 'Do I need to create an account?',
    answer:
      'Yes. Creating an account lets you save your skin analyses, track progress over time, and access personalized recommendations. You can sign up with email or use a social login for a quick start.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'We may offer a free trial for premium features. Check the Subscription or Get Started section in the app or on our website for the latest offers and pricing.',
  },
];

function ChevronSvg({ expanded }: { expanded: boolean }) {
  if (Platform.OS !== 'web') return null;
  const rotation = expanded ? 'rotate(180deg)' : 'rotate(0deg)';
  return (
    <div
      style={{
        width: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: rotation,
        transition: 'transform 0.2s ease',
      }}
      dangerouslySetInnerHTML={{
        __html: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M6 9l6 6 6-6" stroke="#7B5CFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      }}
    />
  );
}

export default function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isDesktop = useIsDesktop();

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.section} nativeID="faqs">
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Text style={styles.sectionSubtitle}>
          Quick answers to common questions about SkinDiagnostics.ai
        </Text>
        <View style={[styles.faqList, !isDesktop && styles.faqListNarrow]}>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.faqItem, isOpen && styles.faqItemOpen]}
                onPress={() => setOpenIndex(isOpen ? null : index)}
                activeOpacity={0.85}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <ChevronSvg expanded={isOpen} />
                </View>
                {isOpen && (
                  <View style={styles.faqAnswerWrap}>
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  container: {
    width: '92%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2430',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#5b6070',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  faqList: {
    gap: 12,
  },
  faqListNarrow: {
    maxWidth: '100%',
  },
  faqItem: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.55)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 10px 28px rgba(31,36,48,0.08)',
      } as any,
      default: {},
    }),
  },
  faqItemOpen: {
    borderColor: 'rgba(123,92,255,0.35)',
    ...Platform.select({
      web: {
        boxShadow: '0 12px 32px rgba(123,92,255,0.12)',
      } as any,
      default: {},
    }),
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#2a2f3c',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  faqAnswerWrap: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    paddingTop: 0,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    color: '#5b6070',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});
