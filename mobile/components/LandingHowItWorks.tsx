import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { useIsDesktop } from '../hooks/useIsDesktop';

const STEPS = [
  { number: '1', title: 'Upload Your Photo', imageUrl: 'https://res.cloudinary.com/dqemas8ht/image/upload/v1771477306/b1_jyianh.jpg' },
  { number: '2', title: 'AI Skin Analysis', imageUrl: 'https://res.cloudinary.com/dqemas8ht/image/upload/v1771477308/b2_jutieu.png' },
  { number: '3', title: 'Receive Skin Report', imageUrl: 'https://res.cloudinary.com/dqemas8ht/image/upload/v1771477306/b3_o9xljc.jpg' },
];

const BADGE_COLORS: [string, string][] = [
  ['#7B5CFF', '#FF5EA8'],
  ['#5AD7FF', '#7B5CFF'],
  ['#FF5EA8', '#FF8A4C'],
];

function ArrowSvg({ color }: { color: string }) {
  if (Platform.OS !== 'web') return null;
  return (
    <div
      style={{ width: 54, height: 18, opacity: 0.55 }}
      dangerouslySetInnerHTML={{
        __html: `<svg viewBox="0 0 64 20" width="54" height="18" fill="none">
          <path d="M2 10h46" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
          <path d="M44 2l16 8-16 8" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
      }}
    />
  );
}

export default function LandingHowItWorks() {
  const router = useRouter();
  const isDesktop = useIsDesktop();

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.section} nativeID="how">
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.howWrap}>
          <View style={[styles.stepsRow, !isDesktop && styles.stepsStack]}>
            {STEPS.map((step, index) => (
              <React.Fragment key={index}>
                <View style={styles.step}>
                  <View style={styles.circle}>
                    <Image
                      source={{ uri: step.imageUrl }}
                      style={styles.stepImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.labelRow}>
                    <LinearGradient
                      colors={BADGE_COLORS[index]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.badge}
                    >
                      <Text style={styles.badgeText}>{step.number}</Text>
                    </LinearGradient>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                  </View>
                </View>
                {isDesktop && index < STEPS.length - 1 && (
                  <View style={styles.arrowWrap}>
                    <ArrowSvg color={index === 0 ? '#7B5CFF' : '#FF5EA8'} />
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>
          <TouchableOpacity
            style={styles.ctaWrap}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#7B5CFF', '#5AD7FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>Start Your Free Scan  ›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingTop: 34,
  },
  container: {
    width: '92%',
    maxWidth: 1140,
    alignSelf: 'center',
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 26,
    letterSpacing: -0.5,
    fontWeight: '700',
    color: '#1f2430',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  howWrap: {
    borderRadius: 26,
    paddingTop: 24,
    paddingBottom: 22,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#1f2430',
    shadowOpacity: 0.1,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.62), rgba(255,255,255,.35))',
        boxShadow: '0 10px 26px rgba(31,36,48,.10)',
      } as any,
      default: {
        backgroundColor: 'rgba(255,255,255,0.62)',
      },
    }),
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  stepsStack: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  stepImage: {
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web'
      ? { objectFit: 'cover' as const, objectPosition: 'center center' }
      : {}),
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#1f2430',
    shadowOpacity: 0.1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        backgroundImage: `
          radial-gradient(70px 70px at 35% 30%, rgba(255,255,255,.92), rgba(255,255,255,.35) 65%, rgba(255,255,255,.1)),
          radial-gradient(110px 110px at 65% 70%, rgba(122,92,255,.14), transparent 60%),
          radial-gradient(110px 110px at 30% 70%, rgba(255,94,168,.12), transparent 60%)
        `,
        boxShadow: '0 14px 28px rgba(31,36,48,.10)',
      } as any,
      default: {
        backgroundColor: 'rgba(255,255,255,0.8)',
      },
    }),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7B5CFF',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.white,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3a3f52',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  arrowWrap: {
    alignSelf: 'center',
    marginTop: -40,
    paddingHorizontal: 4,
  },
  ctaWrap: {
    alignSelf: 'center',
    marginTop: 18,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#5AD7FF',
    shadowOpacity: 0.14,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
  },
  ctaGradient: {
    minWidth: 280,
    paddingHorizontal: 30,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});
