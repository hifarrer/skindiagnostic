import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { dermatologistService, Dermatologist } from '../../services/dermatologistService';

export default function DermatologistScreen() {
  const [zipcode, setZipcode] = useState('');
  const [dermatologists, setDermatologists] = useState<Dermatologist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!zipcode.trim()) {
      Alert.alert('Invalid Input', 'Please enter a valid zipcode');
      return;
    }

    // Basic zipcode validation (5 digits)
    const zipcodeRegex = /^\d{5}$/;
    if (!zipcodeRegex.test(zipcode.trim())) {
      Alert.alert('Invalid Zipcode', 'Please enter a valid 5-digit zipcode');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const results = await dermatologistService.searchDermatologists(zipcode.trim());
      setDermatologists(results);
    } catch (error: any) {
      console.error('Search error:', error);
      Alert.alert(
        'Search Failed',
        error.message || 'Failed to search for dermatologists. Please try again.'
      );
      setDermatologists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/[^\d]/g, '')}`);
  };

  const handleDirections = (address: string, city: string, state: string, zipcode: string) => {
    const fullAddress = `${address}, ${city}, ${state} ${zipcode}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Dermatologist</Text>
        <Text style={styles.subtitle}>
          Enter your zipcode to find the closest dermatologists near you
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchCard}>
          <Text style={styles.searchTitle}>Search by Zipcode</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.zipcodeInput}
              placeholder="Enter zipcode (e.g., 10001)"
              placeholderTextColor={Colors.gray.dark}
              value={zipcode}
              onChangeText={setZipcode}
              keyboardType="number-pad"
              maxLength={5}
            />
            <TouchableOpacity
              style={[styles.searchButtonWrap, loading && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={loading}
              activeOpacity={0.86}
            >
              <LinearGradient
                colors={Colors.landing.gradientPurplePink}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.searchButton}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.searchButtonText}>Search</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {searched && !loading && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {dermatologists.length > 0
                ? `Found ${dermatologists.length} Dermatologist${dermatologists.length !== 1 ? 's' : ''}`
                : 'No Results'}
            </Text>

            {dermatologists.length > 0 ? (
              dermatologists.map((doc) => (
                <View key={doc.id || doc.name} style={styles.dermatologistCard}>
                  <View style={styles.dermatologistHeader}>
                    <View style={styles.dermatologistInfo}>
                      <Text style={styles.dermatologistName}>{doc.name}</Text>
                      <View style={styles.ratingContainer}>
                        <Text style={styles.ratingIcon}>⭐</Text>
                        <Text style={styles.ratingText}>{doc.rating}</Text>
                      </View>
                    </View>
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceText}>{doc.distance} mi</Text>
                    </View>
                  </View>

                  <View style={styles.addressContainer}>
                    <Text style={styles.addressIcon}>📍</Text>
                    <Text style={styles.addressText}>
                      {doc.address}, {doc.city}, {doc.state} {doc.zipcode}
                    </Text>
                  </View>

                  <View style={styles.phoneContainer}>
                    <Text style={styles.phoneIcon}>📞</Text>
                    <Text style={styles.phoneText}>{doc.phone}</Text>
                  </View>

                  {doc.specialties.length > 0 && (
                    <View style={styles.specialtiesContainer}>
                      <Text style={styles.specialtiesLabel}>Specialties:</Text>
                      <View style={styles.specialtiesList}>
                        {doc.specialties.map((specialty, index) => (
                          <View key={index} style={styles.specialtyChip}>
                            <Text style={styles.specialtyText}>{specialty}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.callButton]}
                      onPress={() => handleCall(doc.phone)}
                    >
                      <Text style={styles.actionButtonText}>📞 Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.directionsButton]}
                      onPress={() => handleDirections(doc.address, doc.city, doc.state, doc.zipcode)}
                    >
                      <Text style={styles.actionButtonText}>🗺️ Directions</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noResultsCard}>
                <Text style={styles.noResultsIcon}>🔍</Text>
                <Text style={styles.noResultsText}>
                  No dermatologists found for this zipcode. Please try a different zipcode.
                </Text>
              </View>
            )}
          </View>
        )}

        {!searched && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              1. Enter your zipcode above{'\n'}
              2. We'll find the 10 closest dermatologists{'\n'}
              3. View their contact information and specialties{'\n'}
              4. Call or get directions directly from the app
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fbff',
  },
  header: {
    padding: 28,
    paddingTop: 36,
    paddingBottom: 28,
    backgroundColor: Colors.landing.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.landing.cardBorder,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.landing.dark,
    marginBottom: 6,
    fontFamily: Colors.landing.fontFamily,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.landing.muted,
    lineHeight: 22,
    fontFamily: Colors.landing.fontFamily,
  },
  content: {
    padding: 24,
  },
  searchCard: {
    borderRadius: 26,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    shadowColor: '#1f2430',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 4,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.40))',
          boxShadow: '0 14px 30px rgba(31,36,48,.10)',
        } as any
      : { backgroundColor: Colors.landing.cardBg }),
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.landing.dark,
    marginBottom: 14,
    fontFamily: Colors.landing.fontFamily,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  zipcodeInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,.9)',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: Colors.landing.dark,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    fontFamily: Colors.landing.fontFamily,
  },
  searchButtonWrap: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: Colors.landing.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 3,
  },
  searchButton: {
    borderRadius: 999,
    paddingHorizontal: 26,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: Colors.landing.fontFamily,
  },
  resultsContainer: {
    marginTop: 12,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.landing.dark,
    marginBottom: 14,
    fontFamily: Colors.landing.fontFamily,
  },
  dermatologistCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    shadowColor: '#1f2430',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.42))',
          boxShadow: '0 10px 26px rgba(31,36,48,.08)',
        } as any
      : { backgroundColor: Colors.landing.cardBg }),
  },
  dermatologistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dermatologistInfo: {
    flex: 1,
  },
  dermatologistName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.landing.dark,
    marginBottom: 5,
    fontFamily: Colors.landing.fontFamily,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  distanceBadge: {
    backgroundColor: Colors.landing.purple,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray.dark,
    lineHeight: 20,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phoneIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  phoneText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  specialtiesContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  specialtiesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specialtyChip: {
    backgroundColor: Colors.background.lightBlue,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  specialtyText: {
    fontSize: 12,
    color: Colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButton: {
    backgroundColor: Colors.landing.purple,
  },
  directionsButton: {
    backgroundColor: Colors.landing.cyan,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: Colors.landing.fontFamily,
  },
  noResultsCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    backgroundColor: Colors.landing.cardBg,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  noResultsText: {
    fontSize: 15,
    color: Colors.landing.muted,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: Colors.landing.fontFamily,
  },
  infoCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    backgroundColor: Colors.landing.cardBg,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.landing.dark,
    marginBottom: 10,
    fontFamily: Colors.landing.fontFamily,
  },
  infoText: {
    fontSize: 14,
    color: Colors.landing.muted,
    lineHeight: 22,
    fontFamily: Colors.landing.fontFamily,
  },
});
