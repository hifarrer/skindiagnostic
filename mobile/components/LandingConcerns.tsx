import React from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { useIsDesktop } from '../hooks/useIsDesktop';

const CONCERNS = [
  {
    title: 'Acne & Blemishes',
    imageUrl:
      'https://res.cloudinary.com/dqemas8ht/image/upload/v1771475501/aacne1_qkyj7b.png',
  },
  {
    title: 'Wrinkles & Fine Lines',
    imageUrl:
      'https://res.cloudinary.com/dqemas8ht/image/upload/v1771475501/aacne2_pc2nve.jpg',
  },
  {
    title: 'Dark Spots & Sun Damage',
    imageUrl:
      'https://res.cloudinary.com/dqemas8ht/image/upload/v1771475501/aacne3_ncrsjf.png',
  },
];

function MagnifyIcon() {
  if (Platform.OS !== 'web') return null;
  return (
    <div
      style={{
        position: 'absolute', top: 12, right: 12,
        width: 34, height: 34, borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,.80)',
        border: '1px solid rgba(255,255,255,.70)',
        display: 'grid', placeItems: 'center',
        boxShadow: '0 10px 22px rgba(31,36,48,.10)',
        zIndex: 2,
      }}
      dangerouslySetInnerHTML={{
        __html: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="#3A3F52" stroke-width="2"/>
          <path d="M16.5 16.5 21 21" stroke="#3A3F52" stroke-width="2" stroke-linecap="round"/>
        </svg>`,
      }}
    />
  );
}

export default function LandingConcerns() {
  const isDesktop = useIsDesktop();

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.section} nativeID="about">
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>
          Understanding Your Skin Concerns
        </Text>
        <View style={[styles.grid, !isDesktop && styles.gridStack]}>
          {CONCERNS.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.imgWrap}>
                <MagnifyIcon />
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.img}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingTop: 26,
  },
  container: {
    width: '92%',
    maxWidth: 1140,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2430',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
  },
  gridStack: {
    flexDirection: 'column',
  },
  card: {
    flex: 1,
    minWidth: 250,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#1f2430',
    shadowOpacity: 0.1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 3,
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.40))',
        boxShadow: '0 14px 30px rgba(31,36,48,.10)',
      } as any,
      default: {
        backgroundColor: 'rgba(255,255,255,0.72)',
      },
    }),
  },
  imgWrap: {
    width: '100%',
    height: 170,
    overflow: 'hidden',
    position: 'relative' as any,
    ...Platform.select({
      web: {
        backgroundImage: `
          radial-gradient(110px 110px at 28% 40%, rgba(255,94,168,.18), transparent 62%),
          radial-gradient(130px 130px at 70% 62%, rgba(90,215,255,.16), transparent 62%),
          radial-gradient(160px 160px at 55% 35%, rgba(122,92,255,.14), transparent 65%),
          linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,.25))
        `,
      } as any,
      default: {
        backgroundColor: 'rgba(255,255,255,0.65)',
      },
    }),
  },
  img: {
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web'
      ? { objectFit: 'cover' as const, objectPosition: 'center center' }
      : {}),
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3a3f52',
    letterSpacing: -0.3,
    marginTop: 12,
    marginBottom: 16,
    marginHorizontal: 14,
    textAlign: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});
