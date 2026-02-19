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

// Utility function to determine SD or HD mode based on image dimensions
const determineImageMode = (width: number, height: number): 'sd' | 'hd' => {
  const longSide = Math.max(width, height);
  const shortSide = Math.min(width, height);
  
  // HD: up to 2560 pixels on the long side and at least 1080 pixels on the short side
  if (longSide <= 2560 && shortSide >= 1080) {
    return 'hd';
  }
  
  // SD: up to 1920 pixels on the long side and at least 480 pixels on the short side
  if (longSide <= 1920 && shortSide >= 480) {
    return 'sd';
  }
  
  // Default to SD if dimensions don't meet HD requirements
  // This handles edge cases where image might be too small or too large
  return 'sd';
};

// Utility function to get image dimensions from URI
const getImageDimensions = (uri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        resolve({ width, height });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

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
  const [concernMode, setConcernMode] = useState<'sd' | 'hd' | null>(null); // Auto-detected based on image
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
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

  const handleImageSelected = async (imageUri: string, width?: number, height?: number) => {
    setSelectedImage(imageUri);
    setSelectedConcerns([]); // Reset concerns when new image is selected
    
    try {
      let imgWidth = width;
      let imgHeight = height;
      
      // If dimensions not provided, get them from the image
      if (!imgWidth || !imgHeight) {
        const dimensions = await getImageDimensions(imageUri);
        imgWidth = dimensions.width;
        imgHeight = dimensions.height;
      }
      
      setImageDimensions({ width: imgWidth, height: imgHeight });
      
      // Automatically determine SD or HD mode based on dimensions
      const detectedMode = determineImageMode(imgWidth, imgHeight);
      setConcernMode(detectedMode);
    } catch (error) {
      console.error('Error getting image dimensions:', error);
      // Default to SD if we can't determine dimensions
      setConcernMode('sd');
      Alert.alert(
        'Warning',
        'Could not determine image dimensions. Using Standard (SD) mode. For best results, use images with at least 1080px on the short side for HD analysis.'
      );
    }
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
        const asset = result.assets[0];
        await handleImageSelected(asset.uri, asset.width, asset.height);
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
        const asset = result.assets[0];
        await handleImageSelected(asset.uri, asset.width, asset.height);
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
          
          {selectedImage && concernMode && (
            <View style={styles.modeIndicator}>
              <Text style={styles.modeIndicatorText}>
                {concernMode === 'hd' ? '🔍 High Definition (HD)' : '📷 Standard (SD)'} mode detected
              </Text>
              {imageDimensions && (
                <Text style={styles.modeIndicatorSubtext}>
                  Image: {imageDimensions.width} × {imageDimensions.height} pixels
                </Text>
              )}
            </View>
          )}
          
          {!selectedImage && (
            <Text style={styles.sectionSubtitle}>
              Upload an image to automatically detect the best analysis mode
            </Text>
          )}

          {/* Concern Checkboxes */}
          {concernMode && (
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
          )}
          
          {!concernMode && selectedImage && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Detecting image mode...
              </Text>
            </View>
          )}
          
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
            <ActivityIndicator size="large" color={Colors.landing.purple} />
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

        {selectedImage && concernMode && selectedConcerns.length > 0 && !uploading && !polling && !result && (
          <TouchableOpacity
            style={[styles.button, styles.analyzeButton]}
            onPress={handleAnalyze}
          >
            <Text style={styles.buttonText}>🔬 Analyze Skin</Text>
          </TouchableOpacity>
        )}
        
        {selectedImage && concernMode && selectedConcerns.length === 0 && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Please select at least one skin concern before analyzing
            </Text>
          </View>
        )}
        
        {selectedImage && !concernMode && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Detecting image mode. Please wait...
            </Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            1. Take or upload a clear photo of your face{'\n'}
            2. The system automatically detects the best analysis mode (SD or HD) based on your image size{'\n'}
            3. Select the skin concerns you want to analyze{'\n'}
            4. Get detailed insights and recommendations
          </Text>
          <Text style={styles.infoSubtext}>
            {'\n'}Image requirements:{'\n'}
            • HD: Up to 2560px on long side, at least 1080px on short side{'\n'}
            • SD: Up to 1920px on long side, at least 480px on short side
          </Text>
        </View>
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
    backgroundColor: 'rgba(255,255,255,.92)',
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
    fontFamily: Colors.landing.fontFamily,
  },
  content: {
    padding: 24,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imagePlaceholder: {
    height: 250,
    backgroundColor: 'rgba(255,255,255,.6)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.landing.cardBorder,
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 22,
    resizeMode: 'cover',
  },
  imageIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  imageText: {
    fontSize: 16,
    color: Colors.landing.muted,
    fontFamily: Colors.landing.fontFamily,
  },
  resultBox: {
    backgroundColor: 'rgba(255,255,255,.92)',
    padding: 22,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.landing.purple,
    shadowColor: '#1f2430',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.landing.dark,
    marginBottom: 10,
    fontFamily: Colors.landing.fontFamily,
  },
  resultText: {
    fontSize: 14,
    color: Colors.landing.muted,
    marginBottom: 10,
    fontFamily: Colors.landing.fontFamily,
  },
  scoresContainer: {
    marginTop: 14,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(247,245,255,.95)',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(123,92,255,.2)',
  },
  scoreItemSelected: {
    backgroundColor: Colors.landing.purple,
    borderColor: Colors.landing.purple,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.landing.dark,
    flex: 1,
    fontFamily: Colors.landing.fontFamily,
  },
  scoreLabelSelected: {
    color: Colors.white,
  },
  scoreValue: {
    fontSize: 14,
    color: '#5c4d9e',
    fontWeight: '700',
    fontFamily: Colors.landing.fontFamily,
  },
  scoreValueSelected: {
    color: Colors.white,
  },
  noScoresText: {
    fontSize: 14,
    color: Colors.landing.muted,
    marginTop: 10,
    fontFamily: Colors.landing.fontFamily,
  },
  downloadText: {
    fontSize: 12,
    color: Colors.landing.purple,
    marginTop: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontFamily: Colors.landing.fontFamily,
  },
  errorBox: {
    backgroundColor: 'rgba(255,94,168,.12)',
    borderColor: Colors.landing.pink,
  },
  debugText: {
    fontSize: 10,
    color: Colors.landing.mutedDark,
    marginTop: 10,
    fontFamily: 'monospace',
  },
  loadingBox: {
    backgroundColor: Colors.landing.cardBg,
    padding: 22,
    borderRadius: 22,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.landing.muted,
    fontFamily: Colors.landing.fontFamily,
  },
  buttonContainer: {
    gap: 14,
    marginBottom: 14,
  },
  button: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  primaryButton: {
    backgroundColor: Colors.landing.purple,
    shadowColor: Colors.landing.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: Colors.landing.cardBg,
    borderWidth: 2,
    borderColor: Colors.landing.purple,
  },
  analyzeButton: {
    marginTop: 10,
    backgroundColor: Colors.landing.pink,
    shadowColor: Colors.landing.pink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    padding: 16,
    textAlign: 'center',
    fontFamily: Colors.landing.fontFamily,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.landing.purple,
    padding: 16,
    textAlign: 'center',
    fontFamily: Colors.landing.fontFamily,
  },
  infoBox: {
    backgroundColor: Colors.landing.cardBg,
    padding: 22,
    borderRadius: 22,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    shadowColor: '#1f2430',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
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
  infoSubtext: {
    fontSize: 12,
    color: Colors.landing.muted,
    lineHeight: 18,
    marginTop: 8,
    fontFamily: Colors.landing.fontFamily,
  },
  concernSection: {
    backgroundColor: Colors.landing.cardBg,
    padding: 20,
    borderRadius: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    shadowColor: '#1f2430',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.landing.dark,
    marginBottom: 4,
    fontFamily: Colors.landing.fontFamily,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.landing.muted,
    marginBottom: 14,
    fontFamily: Colors.landing.fontFamily,
  },
  modeIndicator: {
    backgroundColor: 'rgba(123,92,255,.08)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.landing.purple,
  },
  modeIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.landing.purple,
    marginBottom: 4,
    fontFamily: Colors.landing.fontFamily,
  },
  modeIndicatorSubtext: {
    fontSize: 12,
    color: Colors.landing.muted,
    fontFamily: Colors.landing.fontFamily,
  },
  concernsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  concernChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,.9)',
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    marginRight: 8,
    marginBottom: 8,
  },
  concernChipSelected: {
    backgroundColor: Colors.landing.purple,
    borderColor: Colors.landing.purple,
  },
  concernChipText: {
    fontSize: 12,
    color: Colors.landing.muted,
    fontWeight: '600',
    fontFamily: Colors.landing.fontFamily,
  },
  concernChipTextSelected: {
    color: Colors.white,
  },
  selectedCount: {
    fontSize: 12,
    color: Colors.landing.purple,
    marginTop: 10,
    fontWeight: '700',
    fontFamily: Colors.landing.fontFamily,
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
    backgroundColor: Colors.landing.purple,
    borderRadius: 999,
  },
  clearSelectionText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Colors.landing.fontFamily,
  },
  maskImagesContainer: {
    marginTop: 14,
    marginBottom: 14,
  },
  maskImagesTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.landing.dark,
    marginBottom: 4,
    fontFamily: Colors.landing.fontFamily,
  },
  maskImagesSubtitle: {
    fontSize: 12,
    color: Colors.landing.muted,
    marginBottom: 14,
    fontFamily: Colors.landing.fontFamily,
  },
  maskImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  maskImageCard: {
    width: '48%',
    backgroundColor: Colors.landing.cardBg,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    marginBottom: 10,
  },
  maskImageGrid: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    resizeMode: 'cover',
    backgroundColor: 'rgba(255,255,255,.5)',
    marginBottom: 8,
  },
  maskImageItem: {
    marginBottom: 14,
    backgroundColor: Colors.landing.cardBg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
  },
  maskImageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.landing.dark,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Colors.landing.fontFamily,
  },
  maskImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: 'rgba(255,255,255,.5)',
  },
  maskScore: {
    fontSize: 11,
    color: Colors.landing.purple,
    marginTop: 4,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Colors.landing.fontFamily,
  },
  scoresTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.landing.dark,
    marginBottom: 10,
    fontFamily: Colors.landing.fontFamily,
  },
  warningBox: {
    backgroundColor: 'rgba(255,138,76,.12)',
    padding: 14,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.landing.orange,
  },
  warningText: {
    fontSize: 14,
    color: Colors.landing.mutedDark,
    textAlign: 'center',
    fontFamily: Colors.landing.fontFamily,
  },
});
