import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import { skinAnalysisService } from '../../services/skinAnalysisService';
import { usePolling } from '../../hooks/usePolling';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

// Available skin concerns - SD and HD options
const SD_CONCERNS = [
  { id: 'acne', label: 'Acne' },
  { id: 'droopy_lower_eyelid', label: 'Droopy Lower Eyelid' },
  { id: 'eye_bag', label: 'Eye Bag' },
  { id: 'moisture', label: 'Moisture' },
  { id: 'pore', label: 'Pore' },
  { id: 'redness', label: 'Redness' },
  { id: 'texture', label: 'Texture' },
  { id: 'dark_circle_v2', label: 'Dark Circles' },
  { id: 'droopy_upper_eyelid', label: 'Droopy Upper Eyelid' },
  { id: 'firmness', label: 'Firmness' },
  { id: 'oiliness', label: 'Oiliness' },
  { id: 'radiance', label: 'Radiance' },
  { id: 'age_spot', label: 'Age Spot' },
  { id: 'wrinkle', label: 'Wrinkles' },
];

const HD_CONCERNS = [
  { id: 'hd_acne', label: 'Acne (HD)' },
  { id: 'hd_droopy_lower_eyelid', label: 'Droopy Lower Eyelid (HD)' },
  { id: 'hd_eye_bag', label: 'Eye Bag (HD)' },
  { id: 'hd_moisture', label: 'Moisture (HD)' },
  { id: 'hd_pore', label: 'Pore (HD)' },
  { id: 'hd_redness', label: 'Redness (HD)' },
  { id: 'hd_texture', label: 'Texture (HD)' },
  { id: 'hd_dark_circle', label: 'Dark Circles (HD)' },
  { id: 'hd_droopy_upper_eyelid', label: 'Droopy Upper Eyelid (HD)' },
  { id: 'hd_firmness', label: 'Firmness (HD)' },
  { id: 'hd_oiliness', label: 'Oiliness (HD)' },
  { id: 'hd_radiance', label: 'Radiance (HD)' },
  { id: 'hd_age_spot', label: 'Age Spot (HD)' },
  { id: 'hd_wrinkle', label: 'Wrinkles (HD)' },
];

export default function SkinAnalysisScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [concernMode, setConcernMode] = useState<'sd' | 'hd'>('hd'); // Default to HD
  const [selectedScoreType, setSelectedScoreType] = useState<string | null>(null); // Track which score is selected

  // Poll for results when taskId is set
  const { data: pollData, loading: polling } = usePolling({
    pollingFunction: async () => {
      if (!taskId) throw new Error('No task ID');
      return await skinAnalysisService.getTaskStatus(taskId);
    },
    interval: 3000,
    maxAttempts: 40,
    enabled: !!taskId && !result,
    onSuccess: (data) => {
      setResult(data);
      setTaskId(null);
      setSelectedScoreType(null); // Reset selection when new results arrive
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to get analysis results');
      setTaskId(null);
    },
  });

  const requestPermissions = async () => {
    if (Platform.OS === 'web') {
      return true;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    if (!user || !token) {
      Alert.alert('Login Required', 'Please login to use this feature', [
        { text: 'OK', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.error('Camera error:', error);
    }
  };

  const handleUploadPhoto = async () => {
    if (!user || !token) {
      Alert.alert('Login Required', 'Please login to use this feature', [
        { text: 'OK', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
      console.error('Image picker error:', error);
    }
  };

  const toggleConcern = (concernId: string) => {
    setSelectedConcerns((prev) => {
      if (prev.includes(concernId)) {
        return prev.filter((id) => id !== concernId);
      } else {
        return [...prev, concernId];
      }
    });
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please take or upload a photo first');
      return;
    }

    if (selectedConcerns.length === 0) {
      Alert.alert('No Concerns Selected', 'Please select at least one skin concern to analyze');
      return;
    }

    if (!user || !token) {
      Alert.alert('Login Required', 'Please login to use this feature', [
        { text: 'OK', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    setUploading(true);
    setResult(null);
    try {
      const response = await skinAnalysisService.uploadImage(selectedImage, selectedConcerns);
      
      if (response.taskId) {
        setTaskId(response.taskId);
        Alert.alert(
          'Analysis Started',
          'Your skin analysis has been started. Results will appear when ready!',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Analysis Failed',
        error.response?.data?.error || error.message || 'Failed to start analysis. Please try again.'
      );
      console.error('Analysis error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Skin Analysis</Text>
        <Text style={styles.subtitle}>
          Get detailed insights about your skin health
        </Text>
      </View>

      <View style={styles.content}>
        {/* Skin Concern Selection */}
        <View style={styles.concernSection}>
          <Text style={styles.sectionTitle}>Select Skin Concerns</Text>
          <Text style={styles.sectionSubtitle}>
            Choose concerns either all in SD or all in HD
          </Text>
          
          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, concernMode === 'sd' && styles.modeButtonActive]}
              onPress={() => {
                setConcernMode('sd');
                setSelectedConcerns([]);
              }}
            >
              <Text style={[styles.modeButtonText, concernMode === 'sd' && styles.modeButtonTextActive]}>
                Standard (SD)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, concernMode === 'hd' && styles.modeButtonActive]}
              onPress={() => {
                setConcernMode('hd');
                setSelectedConcerns([]);
              }}
            >
              <Text style={[styles.modeButtonText, concernMode === 'hd' && styles.modeButtonTextActive]}>
                High Definition (HD)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Concern Checkboxes */}
          <View style={styles.concernsGrid}>
            {(concernMode === 'sd' ? SD_CONCERNS : HD_CONCERNS).map((concern) => (
              <TouchableOpacity
                key={concern.id}
                style={[
                  styles.concernChip,
                  selectedConcerns.includes(concern.id) && styles.concernChipSelected,
                ]}
                onPress={() => toggleConcern(concern.id)}
              >
                <Text
                  style={[
                    styles.concernChipText,
                    selectedConcerns.includes(concern.id) && styles.concernChipTextSelected,
                  ]}
                >
                  {concern.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {selectedConcerns.length > 0 && (
            <Text style={styles.selectedCount}>
              {selectedConcerns.length} concern{selectedConcerns.length !== 1 ? 's' : ''} selected
            </Text>
          )}
        </View>

        <View style={styles.imageContainer}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageIcon}>📷</Text>
              <Text style={styles.imageText}>No image selected</Text>
            </View>
          )}
        </View>

        {result && result.status === 'success' && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Analysis Results</Text>
            <Text style={styles.resultText}>
              Tap on a score below to view that specific concern overlay
            </Text>
            
            {/* Display Layered Image with Overlays */}
            {result.maskUrls && Object.keys(result.maskUrls).length > 0 && (
              <View style={styles.layeredImageContainer}>
                <View style={styles.imageLayerWrapper}>
                  {/* Base original image */}
                  {(result.originalImageUrl || result.maskUrls['resize_image'] || selectedImage) && (
                    <Image 
                      source={{ uri: result.originalImageUrl || result.maskUrls['resize_image'] || selectedImage }} 
                      style={styles.baseImage} 
                    />
                  )}
                  
                  {/* Overlay mask images */}
                  {Object.entries(result.maskUrls)
                    .filter(([type]) => type !== 'resize_image')
                    .map(([type, url]: [string, any]) => {
                      // Show this overlay if:
                      // 1. No score is selected (show all)
                      // 2. This is the selected score type
                      const shouldShow = selectedScoreType === null || selectedScoreType === type;
                      
                      if (!shouldShow) return null;
                      
                      return (
                        <Image
                          key={type}
                          source={{ uri: url }}
                          style={[styles.overlayImage, styles.baseImage]}
                        />
                      );
                    })}
                </View>
                
                {selectedScoreType && (
                  <TouchableOpacity
                    style={styles.clearSelectionButton}
                    onPress={() => setSelectedScoreType(null)}
                  >
                    <Text style={styles.clearSelectionText}>Show All Overlays</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Display Clickable Scores */}
            {result.scores && Object.keys(result.scores).length > 0 ? (
              <View style={styles.scoresContainer}>
                <Text style={styles.scoresTitle}>Detailed Scores (Tap to view overlay)</Text>
                {Object.entries(result.scores)
                  .filter(([key]) => key !== 'all' && result.maskUrls?.[key]) // Only show scores that have mask URLs
                  .map(([key, value]: [string, any]) => {
                    // Format the key for display
                    const displayKey = key
                      .replace(/_/g, ' ')
                      .replace(/hd /g, '')
                      .replace(/\b\w/g, (l) => l.toUpperCase());
                    
                    // Handle different value types
                    let displayValue = '';
                    if (typeof value === 'object' && value !== null) {
                      // If it's an object, try to get a score or value
                      if (value.ui_score !== undefined) {
                        displayValue = `${value.ui_score}`;
                      } else if (value.score !== undefined) {
                        displayValue = `${value.score}`;
                      } else if (value.value !== undefined) {
                        displayValue = String(value.value);
                      } else {
                        displayValue = 'N/A';
                      }
                    } else {
                      displayValue = String(value);
                    }
                    
                    const isSelected = selectedScoreType === key;
                    
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.scoreItem,
                          isSelected && styles.scoreItemSelected,
                        ]}
                        onPress={() => {
                          // Toggle selection: if already selected, deselect (show all)
                          setSelectedScoreType(isSelected ? null : key);
                        }}
                      >
                        <Text style={[styles.scoreLabel, isSelected && styles.scoreLabelSelected]}>
                          {displayKey}:
                        </Text>
                        <Text style={[styles.scoreValue, isSelected && styles.scoreValueSelected]}>
                          {displayValue}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            ) : result.metadata?.scores && Object.keys(result.metadata.scores).length > 0 ? (
              <View style={styles.scoresContainer}>
                {Object.entries(result.metadata.scores).map(([key, value]: [string, any]) => {
                  const displayKey = key
                    .replace(/_/g, ' ')
                    .replace(/hd /g, '')
                    .replace(/\b\w/g, (l) => l.toUpperCase());
                  
                  let displayValue = '';
                  if (typeof value === 'object' && value !== null) {
                    if (value.score !== undefined) {
                      displayValue = `${value.score}${value.unit || ''}`;
                    } else if (value.value !== undefined) {
                      displayValue = String(value.value);
                    } else {
                      displayValue = 'See details';
                    }
                  } else {
                    displayValue = String(value);
                  }
                  
                  return (
                    <View key={key} style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>{displayKey}:</Text>
                      <Text style={styles.scoreValue}>{displayValue}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noScoresText}>
                Detailed scores are being processed. Check back soon!
              </Text>
            )}
            {result.resultUrl && result.resultUrl.endsWith('.zip') && (
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const canOpen = await Linking.canOpenURL(result.resultUrl);
                    if (canOpen) {
                      await Linking.openURL(result.resultUrl);
                    } else {
                      Alert.alert('Download', `Results URL: ${result.resultUrl}`);
                    }
                  } catch (error) {
                    Alert.alert('Error', 'Could not open download link');
                  }
                }}
              >
                <Text style={styles.downloadText}>
                  📥 Download Full Results (ZIP)
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Debug info - remove in production */}
            {__DEV__ && result.metadata && (
              <Text style={styles.debugText}>
                Debug: Metadata keys: {Object.keys(result.metadata).join(', ')}
              </Text>
            )}
          </View>
        )}
        
        {result && result.status === 'pending' && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Analysis in Progress</Text>
            <Text style={styles.resultText}>
              Your skin analysis is being processed. Please wait...
            </Text>
          </View>
        )}
        
        {result && result.status === 'error' && (
          <View style={[styles.resultBox, styles.errorBox]}>
            <Text style={styles.resultTitle}>Analysis Error</Text>
            <Text style={styles.resultText}>
              There was an error processing your analysis. Please try again.
            </Text>
          </View>
        )}

        {(uploading || polling) && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary.orange} />
            <Text style={styles.loadingText}>
              {uploading ? 'Uploading...' : 'Analyzing...'}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleTakePhoto}
            disabled={uploading || polling}
          >
            <Text style={styles.buttonText}>📸 Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleUploadPhoto}
            disabled={uploading || polling}
          >
            <Text style={styles.secondaryButtonText}>📁 Upload Photo</Text>
          </TouchableOpacity>
        </View>

        {selectedImage && selectedConcerns.length > 0 && !uploading && !polling && !result && (
          <TouchableOpacity
            style={[styles.button, styles.analyzeButton]}
            onPress={handleAnalyze}
          >
            <Text style={styles.buttonText}>🔬 Analyze Skin</Text>
          </TouchableOpacity>
        )}
        
        {selectedImage && selectedConcerns.length === 0 && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Please select at least one skin concern before analyzing
            </Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            1. Take or upload a clear photo of your face{'\n'}
            2. Our AI analyzes your skin condition{'\n'}
            3. Get detailed insights and recommendations
          </Text>
        </View>
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
  },
  content: {
    padding: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imagePlaceholder: {
    height: 250,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  imageIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  imageText: {
    fontSize: 16,
    color: '#666',
  },
  resultBox: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.primary.orange,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  scoresContainer: {
    marginTop: 15,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  scoreItemSelected: {
    backgroundColor: Colors.primary.orange,
    borderColor: Colors.primary.orange,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  scoreLabelSelected: {
    color: '#fff',
  },
  scoreValue: {
    fontSize: 14,
    color: Colors.primary.orange,
    fontWeight: 'bold',
  },
  scoreValueSelected: {
    color: '#fff',
  },
  noScoresText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  downloadText: {
    fontSize: 12,
    color: '#9370DB',
    marginTop: 15,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  errorBox: {
    backgroundColor: '#ffe6e6',
    borderColor: '#ff4444',
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    marginTop: 10,
    fontFamily: 'monospace',
  },
  loadingBox: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 15,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButton: {
    backgroundColor: Colors.primary.orange,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary.orange,
  },
  analyzeButton: {
    marginTop: 10,
    backgroundColor: Colors.primary.orange,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    padding: 18,
    textAlign: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.orange,
    padding: 18,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  concernSection: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gray.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  modeToggle: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: Colors.background.lightBlue,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.gray.light,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: Colors.primary.orange,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  concernsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  concernChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  concernChipSelected: {
    backgroundColor: Colors.primary.orange,
    borderColor: Colors.primary.orange,
  },
  concernChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  concernChipTextSelected: {
    color: '#fff',
  },
  selectedCount: {
    fontSize: 12,
    color: Colors.primary.orange,
    marginTop: 10,
    fontWeight: '600',
  },
  layeredImageContainer: {
    marginTop: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  imageLayerWrapper: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  baseImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayImage: {
    // Overlay images will be layered on top using absolute positioning
    // The mask images from API already have transparency/alpha channel
  },
  clearSelectionButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#9370DB',
    borderRadius: 20,
  },
  clearSelectionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  maskImagesContainer: {
    marginTop: 15,
    marginBottom: 15,
  },
  maskImagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  maskImagesSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  maskImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  maskImageCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10,
  },
  maskImageGrid: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    resizeMode: 'cover',
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  maskImageItem: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  maskImageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  maskImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#f5f5f5',
  },
  maskScore: {
    fontSize: 11,
    color: '#9370DB',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
});
