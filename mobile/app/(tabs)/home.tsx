import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

const BG_IMAGE = 'https://res.cloudinary.com/dqemas8ht/image/upload/v1769479036/pexels-shiny-diamond-3762476_qpfkca.jpg';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={{ uri: BG_IMAGE }}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <Text style={styles.cardSubtitle}>Choose an option below to get started</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.actionButtonWrap}
                onPress={() => router.push('/(tabs)/skin-analysis')}
                activeOpacity={0.86}
              >
                <LinearGradient
                  colors={Colors.landing.gradientPurplePink}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionIcon}>🔬</Text>
                  <Text style={styles.actionLabel}>Skin Analysis</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonWrap}
                onPress={() => router.push('/(tabs)/statistics')}
                activeOpacity={0.86}
              >
                <View style={[styles.actionButton, styles.actionButtonSecondary]}>
                  <Text style={styles.actionIcon}>📈</Text>
                  <Text style={[styles.actionLabel, styles.actionLabelSecondary]}>Statistics</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonWrap}
                onPress={() => router.push('/(tabs)/subscription')}
                activeOpacity={0.86}
              >
                <View style={[styles.actionButton, styles.actionButtonSecondary]}>
                  <Text style={styles.actionIcon}>⭐</Text>
                  <Text style={[styles.actionLabel, styles.actionLabelSecondary]}>Subscription</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonWrap}
                onPress={() => router.push('/(tabs)/dermatologist')}
                activeOpacity={0.86}
              >
                <View style={[styles.actionButton, styles.actionButtonSecondary]}>
                  <Text style={styles.actionIcon}>👨‍⚕️</Text>
                  <Text style={[styles.actionLabel, styles.actionLabelSecondary]}>Find Dermatologist</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 32,
  },
  content: {
    width: '100%',
  },
  card: {
    borderRadius: 26,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#1f2430',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 14px 30px rgba(31,36,48,.10)',
        } as any
      : {}),
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.landing.dark,
    marginBottom: 6,
    fontFamily: Colors.landing.fontFamily,
  },
  cardSubtitle: {
    fontSize: 15,
    color: Colors.landing.muted,
    marginBottom: 20,
    fontFamily: Colors.landing.fontFamily,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    alignSelf: 'center',
    width: 254,
  },
  actionButtonWrap: {
    width: 120,
    height: 120,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.landing.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 3,
  },
  actionButton: {
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionButtonSecondary: {
    backgroundColor: 'rgba(255,255,255,.85)',
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 10px 22px rgba(122,92,255,.08)' } as any
      : {}),
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: Colors.landing.fontFamily,
  },
  actionLabelSecondary: {
    color: Colors.landing.dark,
  },
});
