import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground 
      source={require('../../assets/aiskinbg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>SkingDiagnostics.AI</Text>
        </View>

        <View style={styles.spacer} />

        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                {/* Try Makeup - Commented out but functionality preserved
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/(tabs)/makeup')}
                >
                  <Text style={styles.actionIcon}>💄</Text>
                  <Text style={styles.actionLabel}>Try Makeup</Text>
                </TouchableOpacity>
                */}
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/(tabs)/skin-analysis')}
                >
                  <Text style={styles.actionIcon}>🔬</Text>
                  <Text style={styles.actionLabel}>Skin Analysis</Text>
                </TouchableOpacity>
                {/* AI Look Try-On - Commented out but functionality preserved
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/(tabs)/looks')}
                >
                  <Text style={styles.actionIcon}>✨</Text>
                  <Text style={styles.actionLabel}>AI Look Try-On</Text>
                </TouchableOpacity>
                */}
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/(tabs)/statistics')}
                >
                  <Text style={styles.actionIcon}>📈</Text>
                  <Text style={styles.actionLabel}>Statistics</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/(tabs)/subscription')}
                >
                  <Text style={styles.actionIcon}>⭐</Text>
                  <Text style={styles.actionLabel}>Subscription</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/(tabs)/dermatologist')}
                >
                  <Text style={styles.actionIcon}>👨‍⚕️</Text>
                  <Text style={styles.actionLabel}>Find Dermatologist</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.darkBlue,
  },
  spacer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 0,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.gray.dark,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'rgba(227, 242, 253, 0.7)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});
