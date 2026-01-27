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
} from 'react-native';
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
              style={[styles.searchButton, loading && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
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
    backgroundColor: Colors.background.lightBlue,
  },
  header: {
    padding: 30,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.darkBlue,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray.dark,
    lineHeight: 22,
  },
  content: {
    padding: 20,
  },
  searchCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  zipcodeInput: {
    flex: 1,
    backgroundColor: Colors.background.lightBlue,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.gray.light,
  },
  searchButton: {
    backgroundColor: Colors.primary.orange,
    borderRadius: 8,
    paddingHorizontal: 25,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  resultsContainer: {
    marginTop: 10,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  dermatologistCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 5,
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
    backgroundColor: Colors.primary.orange,
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
    backgroundColor: Colors.accent.green,
  },
  directionsButton: {
    backgroundColor: Colors.accent.blue,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  noResultsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noResultsText: {
    fontSize: 16,
    color: Colors.gray.dark,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: Colors.gray.dark,
    lineHeight: 22,
  },
});
