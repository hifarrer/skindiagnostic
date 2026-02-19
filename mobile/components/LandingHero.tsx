import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { useIsDesktop } from '../hooks/useIsDesktop';

const HERO_IMAGE = 'https://res.cloudinary.com/dqemas8ht/image/upload/v1771375978/hero_yjxj8c.png';

function FeatureIcon({ type }: { type: 'clock' | 'shield' | 'check' }) {
  if (Platform.OS !== 'web') return null;
  const icons: Record<string, string> = {
    clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 6v6l4 2" stroke="#7B5CFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="#FF5EA8" stroke-width="2" opacity=".9"/>
    </svg>`,
    shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l8 4v6c0 6-3.5 9.5-8 10-4.5-.5-8-4-8-10V6l8-4Z" stroke="#5AD7FF" stroke-width="2" stroke-linejoin="round"/>
      <path d="M9 12l2 2 4-5" stroke="#7B5CFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 13l2-2 4 4 8-8 2 2-10 10-6-6Z" fill="none" stroke="#FF5EA8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 2l2 2M20 8l2 2M14 4l2 2" stroke="#FF8A4C" stroke-width="2" stroke-linecap="round" opacity=".9"/>
    </svg>`,
  };
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
      dangerouslySetInnerHTML={{ __html: icons[type] }}
    />
  );
}

function HeroVisualContent() {
  return (
    <Image
      source={{ uri: HERO_IMAGE }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
      } as any}
      resizeMode="cover"
    />
  );
}

function HeroCardGlow() {
  if (Platform.OS !== 'web') return null;
  return (
    <div
      style={{
        position: 'absolute', top: -60, right: -80, width: 540, height: 420,
        backgroundImage: `
          radial-gradient(260px 220px at 40% 35%, rgba(255,94,168,.26), transparent 62%),
          radial-gradient(260px 220px at 70% 55%, rgba(255,138,76,.18), transparent 62%),
          radial-gradient(300px 240px at 30% 70%, rgba(90,215,255,.18), transparent 62%),
          radial-gradient(340px 280px at 60% 35%, rgba(122,92,255,.18), transparent 62%)
        `,
        filter: 'blur(1px)',
        opacity: 0.9,
        pointerEvents: 'none',
      }}
    />
  );
}

function ChevronSvg() {
  if (Platform.OS !== 'web') return null;
  return (
    <div
      style={{ width: 14, height: 14, opacity: 0.9, marginLeft: 8, display: 'inline-flex' }}
      dangerouslySetInnerHTML={{
        __html: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      }}
    />
  );
}

export default function LandingHero() {
  const router = useRouter();
  const isDesktop = useIsDesktop();

  if (Platform.OS !== 'web') {
    return null;
  }

  const features: { title: string; desc: string; icon: 'clock' | 'shield' | 'check' }[] = [
    { title: 'Instant Results', desc: 'Get results in seconds.', icon: 'clock' },
    { title: 'AI Accuracy', desc: 'Advanced skin diagnostics.', icon: 'shield' },
    { title: 'Personalized Advice', desc: 'Tailored skincare recommends.', icon: 'check' },
  ];

  return (
    <View style={styles.hero} nativeID="hero">
      <View style={styles.container}>
        <View style={styles.heroCardOuter}>
          <LinearGradient
            colors={['rgba(255,255,255,0.70)', 'rgba(255,255,255,0.40)']}
            style={styles.heroCard}
          >
            <HeroCardGlow />
            <View style={[styles.heroGrid, !isDesktop && styles.heroGridStack]}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroTitle}>
                  AI-Powered Skin{'\n'}
                  <Text nativeID="hero-accent" style={styles.heroAccentInline}>Analysis & Diagnostics</Text>
                </Text>
                <Text style={styles.heroSubtitle}>
                  Analyze your skin instantly using advanced AI technology.
                </Text>
                <View style={styles.ctaContainer}>
                  <TouchableOpacity
                    style={styles.primaryCTA}
                    onPress={() => router.push('/(auth)/login')}
                    activeOpacity={0.86}
                  >
                    <LinearGradient
                      colors={['#7B5CFF', '#FF5EA8', '#FF8A4C']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryCTAGradient}
                    >
                      <Text style={styles.primaryCTAText}>Scan Your Skin  ›</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryCTA}
                    onPress={() => router.push('/(auth)/login')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.secondaryCTARow}>
                      <Text style={styles.secondaryCTAText}>Try a Demo Scan</Text>
                      <ChevronSvg />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.heroRight}>
                <View style={styles.visualCard}>
                  <HeroVisualContent />
                  <View style={styles.scanRing} />
                  <View style={styles.faceCard}>
                    <View style={styles.faceCardTitleRow}>
                      <Text style={styles.faceCardTitle}>Acne Detected</Text>
                      <View style={styles.faceCardDot} />
                    </View>
                    <View style={styles.tag}>
                      <View style={styles.tagDot} />
                      <Text style={styles.tagText}>Skin Texture</Text>
                    </View>
                    <View style={styles.tag}>
                      <View style={[styles.tagDot, styles.tagDotOrange]} />
                      <Text style={styles.tagText}>Redness</Text>
                    </View>
                    <View style={styles.tag}>
                      <View style={[styles.tagDot, styles.tagDotPurple]} />
                      <Text style={styles.tagText}>Skin Care</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.features, !isDesktop && styles.featuresStack]}>
              {features.map((f, i) => (
                <View key={i} style={styles.fCard}>
                  <View style={styles.fCardIcon}>
                    <FeatureIcon type={f.icon} />
                  </View>
                  <View style={styles.fCardBody}>
                    <Text style={styles.fCardTitle}>{f.title}</Text>
                    <Text style={styles.fCardDesc}>{f.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 34,
    paddingBottom: 18,
  },
  container: {
    width: '92%',
    maxWidth: 1140,
    alignSelf: 'center',
  },
  heroCardOuter: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#1f2430',
    shadowOpacity: 0.12,
    shadowRadius: 45,
    shadowOffset: { width: 0, height: 18 },
    elevation: 5,
  },
  heroCard: {
    borderRadius: 28,
    paddingVertical: 44,
    paddingHorizontal: 44,
    overflow: 'hidden',
    position: 'relative' as any,
  },
  heroGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    position: 'relative' as any,
    zIndex: 1,
  },
  heroGridStack: {
    flexDirection: 'column',
  },
  heroLeft: {
    flex: 1.05,
  },
  heroTitle: {
    marginBottom: 12,
    fontSize: 52,
    lineHeight: 54,
    letterSpacing: -1,
    color: '#1f2430',
    fontWeight: '800',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  heroAccentInline: {
    fontSize: 52,
    lineHeight: 54,
    letterSpacing: -1,
    fontWeight: '800',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#7B5CFF',
  },
  heroSubtitle: {
    marginBottom: 18,
    color: '#5b6070',
    fontSize: 16,
    lineHeight: 25.6,
    maxWidth: 420,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  primaryCTA: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#FF5EA8',
    shadowOpacity: 0.16,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  primaryCTAGradient: {
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  primaryCTAText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  secondaryCTA: {
    paddingVertical: 12,
  },
  secondaryCTARow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryCTAText: {
    color: '#3a3f52',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  heroRight: {
    flex: 0.95,
  },
  visualCard: {
    height: 360,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#1f2430',
    shadowOpacity: 0.1,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    position: 'relative' as any,
    ...Platform.select({
      web: {
        backgroundImage: `
          radial-gradient(220px 220px at 65% 35%, rgba(255,94,168,.22), transparent 62%),
          radial-gradient(240px 240px at 35% 72%, rgba(90,215,255,.18), transparent 62%),
          radial-gradient(260px 260px at 55% 60%, rgba(122,92,255,.16), transparent 62%),
          linear-gradient(180deg, rgba(255,255,255,.70), rgba(255,255,255,.35))
        `,
      } as any,
      default: {
        backgroundColor: 'rgba(255,255,255,0.70)',
      },
    }),
  },
  scanRing: {
    position: 'absolute',
    right: 30,
    top: 34,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.40)',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 10px rgba(255,94,168,.10), 0 0 0 18px rgba(122,92,255,.08)',
      } as any,
      default: {},
    }),
  },
  faceCard: {
    position: 'absolute',
    left: 12,
    top: 12,
    width: 140,
    borderRadius: 12,
    padding: 8,
    backgroundColor: 'rgba(31,36,48,0.40)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    zIndex: 10,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 12px 28px rgba(0,0,0,.18)',
      } as any,
      default: {},
    }),
  },
  faceCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  faceCardTitle: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  faceCardDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(90,215,255,.95)',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 2px rgba(90,215,255,.18)',
      } as any,
      default: {},
    }),
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginTop: 4,
    gap: 6,
  },
  tagDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,94,168,.95)',
  },
  tagDotOrange: {
    backgroundColor: 'rgba(255,138,76,.95)',
  },
  tagDotPurple: {
    backgroundColor: 'rgba(122,92,255,.95)',
  },
  tagText: {
    color: Colors.white,
    fontSize: 9,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  features: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 14,
    position: 'relative' as any,
    zIndex: 1,
  },
  featuresStack: {
    flexDirection: 'column',
  },
  fCard: {
    flex: 1,
    minWidth: 180,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#1f2430',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.68), rgba(255,255,255,.40))',
      } as any,
      default: {
        backgroundColor: 'rgba(255,255,255,0.68)',
      },
    }),
  },
  fCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,.95), rgba(255,255,255,.55))',
        boxShadow: '0 10px 22px rgba(122,92,255,.10)',
      } as any,
      default: {
        backgroundColor: 'rgba(255,255,255,0.95)',
      },
    }),
  },
  fCardBody: {
    flex: 1,
  },
  fCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2a2f3c',
    marginBottom: 4,
    letterSpacing: -0.3,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  fCardDesc: {
    fontSize: 13,
    color: '#5b6070',
    lineHeight: 18.85,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});
