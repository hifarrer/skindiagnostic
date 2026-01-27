import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import { makeupVTOService } from '../../services/makeupVTOService';
import { usePolling } from '../../hooks/usePolling';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { imageUploadService } from '../../services/imageUploadService';
import { apiClient } from '../../services/api';

// Makeup categories
const MAKEUP_CATEGORIES = [
  { id: 'blush', name: 'Blush', icon: '🩷' },
  { id: 'concealer', name: 'Concealer', icon: '✨' },
  { id: 'eye_liner', name: 'Eye Liner', icon: '👁️' },
];

// Blush pattern options from the API
const BLUSH_PATTERNS = [
  { name: '1color1', label: '1color1', colors: 1 },
  { name: '1color2', label: '1color2', colors: 1 },
  { name: '1color3', label: '1color3', colors: 1 },
  { name: '1color4', label: '1color4', colors: 1 },
  { name: '1color5', label: '1color5', colors: 1 },
  { name: '1color6', label: '1color6', colors: 1 },
  { name: '1color7', label: '1color7', colors: 1 },
  { name: '1color8', label: '1color8', colors: 1 },
  { name: '1color358', label: '1color358', colors: 1 },
  { name: 'Circle1', label: 'Circle1', colors: 1 },
];

// Texture options for blush
const TEXTURES = ['matte', 'shimmer', 'glitter'];

// Preset colors for blush
const BLUSH_COLORS = [
  '#FF6B6B', // Coral red
  '#FF8E8E', // Light pink
  '#E91E63', // Pink
  '#FF5722', // Deep orange
  '#F48FB1', // Light rose
  '#CE93D8', // Light purple
  '#FFAB91', // Peach
  '#D7CCC8', // Nude
];

// Preset colors for concealer (skin tones)
const CONCEALER_COLORS = [
  '#FBF5E9', // Fair
  '#F5E6D3', // Light
  '#E8D4B8', // Light Medium
  '#D4B896', // Medium
  '#C4A67C', // Medium Tan
  '#A67C52', // Tan
  '#8B6914', // Deep
  '#5C4033', // Dark
];

// Eye liner patterns from the API
const EYELINER_PATTERNS = [
  { name: 'Arabic3', label: 'Arabic3' },
  { name: 'Arabic16', label: 'Arabic16' },
  { name: 'Arabic17', label: 'Arabic17' },
  { name: 'Arabic1', label: 'Arabic1' },
  { name: 'Arabic21', label: 'Arabic21' },
  { name: 'Arabic24', label: 'Arabic24' },
  { name: 'Arabic19', label: 'Arabic19' },
  { name: 'Arabic8', label: 'Arabic8' },
  { name: 'Arabic13', label: 'Arabic13' },
  { name: 'Arabic20', label: 'Arabic20' },
];

// Preset colors for eye liner
const EYELINER_COLORS = [
  '#000000', // Black
  '#1A1A1A', // Soft Black
  '#3D2314', // Dark Brown
  '#5C4033', // Brown
  '#2C3E50', // Navy
  '#1B4F72', // Deep Blue
  '#4A235A', // Deep Purple
  '#145A32', // Deep Green
];

export default function MakeupScreen() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Category selection
  const [selectedCategory, setSelectedCategory] = useState<string>('blush');
  
  // Blush parameters
  const [blushPattern, setBlushPattern] = useState<string>('1color1');
  const [blushColor, setBlushColor] = useState<string>('#FF6B6B');
  const [blushCustomColor, setBlushCustomColor] = useState<string>('#FF6B6B');
  const [blushTexture, setBlushTexture] = useState<string>('matte');
  const [blushIntensity, setBlushIntensity] = useState<number>(50);
  
  // Concealer parameters
  const [concealerColor, setConcealerColor] = useState<string>('#FBF5E9');
  const [concealerCustomColor, setConcealerCustomColor] = useState<string>('#FBF5E9');
  const [concealerIntensity, setConcealerIntensity] = useState<number>(50);
  const [concealerUnderEyeIntensity, setConcealerUnderEyeIntensity] = useState<number>(50);
  const [concealerCoverage, setConcealerCoverage] = useState<number>(50);
  
  // Eye liner parameters
  const [eyelinerPattern, setEyelinerPattern] = useState<string>('Arabic3');
  const [eyelinerColor, setEyelinerColor] = useState<string>('#000000');
  const [eyelinerCustomColor, setEyelinerCustomColor] = useState<string>('#000000');
  const [eyelinerTexture, setEyelinerTexture] = useState<string>('matte');
  const [eyelinerIntensity, setEyelinerIntensity] = useState<number>(50);
  
  // UI state
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  // Poll for results
  const { data: pollData, loading: polling } = usePolling({
    pollingFunction: async () => {
      if (!taskId) throw new Error('No task ID');
      return await makeupVTOService.getTaskStatus(taskId);
    },
    interval: 3000,
    maxAttempts: 40,
    enabled: !!taskId && !result,
    onSuccess: (data) => {
      setResult(data);
      setTaskId(null);
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to get makeup results');
      setTaskId(null);
    },
  });

  const requestCameraPermissions = async () => {
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

    if (Platform.OS === 'web') {
      Alert.alert('Camera', 'Camera feature is not available on web. Please use the upload option.');
      return;
    }

    const hasPermission = await requestCameraPermissions();
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

  const handleApplyMakeup = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please take or upload a photo first');
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
      // Ensure apiClient has the current token before making requests
      apiClient.setToken(token);
      
      // Upload image first
      const imageUrl = await imageUploadService.uploadImage(selectedImage!);
      
      // Build the effect based on selected category
      let effect: any;
      
      if (selectedCategory === 'blush') {
        effect = {
          category: 'blush',
          pattern: {
            name: blushPattern,
          },
          palettes: [
            {
              color: blushColor,
              texture: blushTexture,
              colorIntensity: Math.round(blushIntensity),
            },
          ],
        };
      } else if (selectedCategory === 'concealer') {
        effect = {
          category: 'concealer',
          palettes: [
            {
              color: concealerColor,
              colorIntensity: Math.round(concealerIntensity),
              colorUnderEyeIntensity: Math.round(concealerUnderEyeIntensity),
              coverageLevel: Math.round(concealerCoverage),
            },
          ],
        };
      } else if (selectedCategory === 'eye_liner') {
        effect = {
          category: 'eye_liner',
          pattern: {
            name: eyelinerPattern,
          },
          palettes: [
            {
              color: eyelinerColor,
              texture: eyelinerTexture,
              colorIntensity: Math.round(eyelinerIntensity),
            },
          ],
        };
      }

      console.log(`Applying ${selectedCategory} effect:`, JSON.stringify(effect, null, 2));
      
      // Apply makeup
      const response = await makeupVTOService.applyMakeup(imageUrl, [effect]);
      
      if (response.taskId) {
        setTaskId(response.taskId);
        const categoryName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        Alert.alert(`${categoryName} Applied`, `Your ${selectedCategory} is being applied! Results will appear when ready.`);
      }
    } catch (error: any) {
      console.error('Makeup apply error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to apply makeup';
      Alert.alert('Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleBlushColorSelect = (color: string) => {
    setBlushColor(color);
    setBlushCustomColor(color);
  };

  const handleConcealerColorSelect = (color: string) => {
    setConcealerColor(color);
    setConcealerCustomColor(color);
  };

  const handleEyelinerColorSelect = (color: string) => {
    setEyelinerColor(color);
    setEyelinerCustomColor(color);
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary.orange} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Virtual Makeup Try-On</Text>
        <Text style={styles.subtitle}>
          Try on different makeup looks in real-time
        </Text>
      </View>

      <View style={styles.content}>
        {/* Result Image (shows on top when available) */}
        {result && result.resultUrl && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>
              {showOriginal ? '📷 Original Photo' : '✨ Makeup Applied!'}
            </Text>
            
            {/* Show either result or original based on toggle */}
            <Image 
              source={{ uri: showOriginal ? selectedImage! : result.resultUrl }} 
              style={styles.resultImage} 
            />
            
            {/* Toggle for original image */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowOriginal(!showOriginal)}
            >
              <View style={[styles.toggleSwitch, showOriginal && styles.toggleSwitchActive]}>
                <View style={[styles.toggleKnob, showOriginal && styles.toggleKnobActive]} />
              </View>
              <Text style={styles.toggleText}>
                {showOriginal ? 'Show Result' : 'Show Original'}
              </Text>
            </TouchableOpacity>
            
            {/* Try new look button */}
            <TouchableOpacity
              style={styles.tryNewButton}
              onPress={() => {
                setResult(null);
                setShowOriginal(false);
              }}
            >
              <Text style={styles.tryNewButtonText}>🔄 Try Different Settings</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upload placeholder (only show when no result) */}
        {!result && (
          <View style={styles.imageContainer}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageIcon}>💄</Text>
                <Text style={styles.imageText}>
                  {Platform.OS === 'web' 
                    ? 'Upload a photo to try on makeup'
                    : 'Take or upload a photo to try on makeup'}
                </Text>
              </View>
            )}
          </View>
        )}

        {(uploading || polling) && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary.orange} />
            <Text style={styles.loadingText}>
              {uploading ? 'Uploading...' : 'Applying makeup...'}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleTakePhoto}
              disabled={uploading || polling}
            >
              <Text style={styles.buttonText}>📷 Take Photo</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.startButton, Platform.OS === 'web' && styles.fullWidth]}
            onPress={handleUploadPhoto}
            disabled={uploading || polling}
          >
            <Text style={styles.buttonText}>📁 Upload Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Category Selection */}
        <Text style={styles.sectionTitle}>Makeup Category</Text>
        <View style={styles.categoryRow}>
          {MAKEUP_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                selectedCategory === cat.id && styles.categoryButtonSelected,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.id && styles.categoryTextSelected,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BLUSH SETTINGS */}
        {selectedCategory === 'blush' && (
          <>
            <Text style={styles.sectionTitle}>Blush Settings</Text>

            {/* Pattern Selection */}
            <View style={styles.paramSection}>
              <Text style={styles.paramLabel}>Pattern</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.patternScroll}>
                <View style={styles.patternRow}>
                  {BLUSH_PATTERNS.map((pattern) => (
                    <TouchableOpacity
                      key={pattern.name}
                      style={[
                        styles.patternCard,
                        blushPattern === pattern.name && styles.patternCardSelected,
                      ]}
                      onPress={() => setBlushPattern(pattern.name)}
                    >
                      <View style={styles.patternPreview}>
                        <Text style={styles.patternEmoji}>🩷</Text>
                      </View>
                      <Text style={styles.patternName}>{pattern.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Color Selection */}
            <View style={styles.paramSection}>
              <Text style={styles.paramLabel}>Color</Text>
              <View style={styles.colorGrid}>
                {BLUSH_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      blushColor === color && styles.colorSwatchSelected,
                    ]}
                    onPress={() => handleBlushColorSelect(color)}
                  />
                ))}
              </View>
              <View style={styles.customColorRow}>
                <Text style={styles.customColorLabel}>Custom:</Text>
                <TextInput
                  style={styles.colorInput}
                  value={blushCustomColor}
                  onChangeText={(text) => {
                    setBlushCustomColor(text);
                    if (/^#[0-9A-Fa-f]{6}$/.test(text)) {
                      setBlushColor(text);
                    }
                  }}
                  placeholder="#FF0000"
                  maxLength={7}
                />
                <View style={[styles.colorPreview, { backgroundColor: blushColor }]} />
              </View>
            </View>

            {/* Texture Selection */}
            <View style={styles.paramSection}>
              <Text style={styles.paramLabel}>Texture</Text>
              <View style={styles.textureRow}>
                {TEXTURES.map((texture) => (
                  <TouchableOpacity
                    key={texture}
                    style={[
                      styles.textureButton,
                      blushTexture === texture && styles.textureButtonSelected,
                    ]}
                    onPress={() => setBlushTexture(texture)}
                  >
                    <Text
                      style={[
                        styles.textureText,
                        blushTexture === texture && styles.textureTextSelected,
                      ]}
                    >
                      {texture.charAt(0).toUpperCase() + texture.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Intensity */}
            <View style={styles.paramSection}>
              <Text style={styles.paramLabel}>Color Intensity: {blushIntensity}%</Text>
              <View style={styles.intensityRow}>
                {[25, 50, 75, 100].map((intensity) => (
                  <TouchableOpacity
                    key={intensity}
                    style={[
                      styles.intensityButton,
                      blushIntensity === intensity && styles.intensityButtonSelected,
                    ]}
                    onPress={() => setBlushIntensity(intensity)}
                  >
                    <Text
                      style={[
                        styles.intensityText,
                        blushIntensity === intensity && styles.intensityTextSelected,
                      ]}
                    >
                      {intensity}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* CONCEALER SETTINGS */}
        {selectedCategory === 'concealer' && (
          <>
            <Text style={styles.sectionTitle}>Concealer Settings</Text>

            {/* Color Selection */}
            <View style={styles.paramSection}>
              <Text style={styles.paramLabel}>Color</Text>
              <View style={styles.colorGrid}>
                {CONCEALER_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      concealerColor === color && styles.colorSwatchSelected,
                    ]}
                    onPress={() => handleConcealerColorSelect(color)}
                  />
                ))}
              </View>
              <View style={styles.customColorRow}>
                <Text style={styles.customColorLabel}>Custom:</Text>
                <TextInput
                  style={styles.colorInput}
                  value={concealerCustomColor}
                  onChangeText={(text) => {
                    setConcealerCustomColor(text);
                    if (/^#[0-9A-Fa-f]{6}$/.test(text)) {
                      setConcealerColor(text);
                    }
                  }}
                  placeholder="#FBF5E9"
                  maxLength={7}
                />
                <View style={[styles.colorPreview, { backgroundColor: concealerColor }]} />
              </View>
            </View>

            {/* Color Intensity */}
            <View style={styles.paramSection}>
              <Text style={styles.paramLabel}>Color Intensity: {concealerIntensity}</Text>
              <View style={styles.sliderContainer}>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: `${concealerIntensity}%` }]} />
                </View>
                <View style={styles.sliderButtons}>
                  {[0, 25, 50, 75, 100].map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.sliderButton,
                        concealerIntensity === val && styles.sliderButtonSelected,
                      ]}
                      onPress={() => setConcealerIntensity(val)}
                    >
                      <Text
                        style={[
                          styles.sliderButtonText,
                          concealerIntensity === val && styles.sliderButtonTextSelected,
                        ]}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Under Eye Color Intensity */}
            <View style={styles.paramSection}>
              <Text style={styles.paramLabel}>Under Eye Color Intensity: {concealerUnderEyeIntensity}</Text>
              <View style={styles.sliderContainer}>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: `${concealerUnderEyeIntensity}%` }]} />
                </View>
                <View style={styles.sliderButtons}>
                  {[0, 25, 50, 75, 100].map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.sliderButton,
                        concealerUnderEyeIntensity === val && styles.sliderButtonSelected,
                      ]}
                      onPress={() => setConcealerUnderEyeIntensity(val)}
                    >
                      <Text
                        style={[
                          styles.sliderButtonText,
                          concealerUnderEyeIntensity === val && styles.sliderButtonTextSelected,
                        ]}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Coverage Intensity */}
            <View style={styles.paramSection}>
              <Text style={styles.paramLabel}>Coverage Intensity: {concealerCoverage}</Text>
              <View style={styles.sliderContainer}>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: `${concealerCoverage}%` }]} />
                </View>
                <View style={styles.sliderButtons}>
                  {[0, 25, 50, 75, 100].map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.sliderButton,
                        concealerCoverage === val && styles.sliderButtonSelected,
                      ]}
                      onPress={() => setConcealerCoverage(val)}
                    >
                      <Text
                        style={[
                          styles.sliderButtonText,
                          concealerCoverage === val && styles.sliderButtonTextSelected,
                        ]}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}

        {/* EYE LINER SETTINGS */}
        {selectedCategory === 'eye_liner' && (
          <>
            <Text style={styles.sectionTitle}>Eye Liner Settings</Text>

            {/* Pattern Selection */}
            <View style={styles.paramSection}>
              <Text style={styles.paramLabel}>Pattern</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.patternScroll}>
                <View style={styles.patternRow}>
                  {EYELINER_PATTERNS.map((pattern) => (
                    <TouchableOpacity
                      key={pattern.name}
                      style={[
                        styles.patternCard,
                        eyelinerPattern === pattern.name && styles.patternCardSelected,
                      ]}
                      onPress={() => setEyelinerPattern(pattern.name)}
                    >
                      <View style={styles.patternPreview}>
                        <Text style={styles.patternEmoji}>👁️</Text>
                      </View>
                      <Text style={styles.patternName}>{pattern.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Color Selection */}
            <View style={styles.paramSection}>
              <Text style={styles.paramLabel}>Color</Text>
              <View style={styles.colorGrid}>
                {EYELINER_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      eyelinerColor === color && styles.colorSwatchSelected,
                    ]}
                    onPress={() => handleEyelinerColorSelect(color)}
                  />
                ))}
              </View>
              <View style={styles.customColorRow}>
                <Text style={styles.customColorLabel}>Custom:</Text>
                <TextInput
                  style={styles.colorInput}
                  value={eyelinerCustomColor}
                  onChangeText={(text) => {
                    setEyelinerCustomColor(text);
                    if (/^#[0-9A-Fa-f]{6}$/.test(text)) {
                      setEyelinerColor(text);
                    }
                  }}
                  placeholder="#000000"
                  maxLength={7}
                />
                <View style={[styles.colorPreview, { backgroundColor: eyelinerColor }]} />
              </View>
            </View>

            {/* Texture Selection */}
            <View style={styles.paramSection}>
              <Text style={styles.paramLabel}>Texture</Text>
              <View style={styles.textureRow}>
                {TEXTURES.map((texture) => (
                  <TouchableOpacity
                    key={texture}
                    style={[
                      styles.textureButton,
                      eyelinerTexture === texture && styles.textureButtonSelected,
                    ]}
                    onPress={() => setEyelinerTexture(texture)}
                  >
                    <Text
                      style={[
                        styles.textureText,
                        eyelinerTexture === texture && styles.textureTextSelected,
                      ]}
                    >
                      {texture.charAt(0).toUpperCase() + texture.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Intensity */}
            <View style={styles.paramSection}>
              <Text style={styles.paramLabel}>Color Intensity: {eyelinerIntensity}%</Text>
              <View style={styles.intensityRow}>
                {[25, 50, 75, 100].map((intensity) => (
                  <TouchableOpacity
                    key={intensity}
                    style={[
                      styles.intensityButton,
                      eyelinerIntensity === intensity && styles.intensityButtonSelected,
                    ]}
                    onPress={() => setEyelinerIntensity(intensity)}
                  >
                    <Text
                      style={[
                        styles.intensityText,
                        eyelinerIntensity === intensity && styles.intensityTextSelected,
                      ]}
                    >
                      {intensity}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Apply Button */}
        <TouchableOpacity
          style={[
            styles.applyButton,
            (!selectedImage || uploading || polling) && styles.applyButtonDisabled,
          ]}
          onPress={handleApplyMakeup}
          disabled={!selectedImage || uploading || polling}
        >
          <Text style={styles.applyButtonText}>
            {uploading ? 'Uploading...' : polling ? 'Processing...' : `✨ Apply ${selectedCategory === 'eye_liner' ? 'Eye Liner' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
          </Text>
        </TouchableOpacity>
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
    textAlign: 'center',
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
    textAlign: 'center',
  },
  resultImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  // Toggle styles
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    padding: 2,
    marginRight: 10,
  },
  toggleSwitchActive: {
    backgroundColor: Colors.primary.orange,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  // Try new button
  tryNewButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  tryNewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.orange,
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
    marginBottom: 25,
  },
  startButton: {
    borderRadius: 12,
    backgroundColor: Colors.primary.orange,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 18,
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  // Category selection
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  categoryButtonSelected: {
    borderColor: Colors.primary.orange,
    backgroundColor: '#FFF8F0',
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextSelected: {
    color: Colors.primary.orange,
  },
  // Slider styles for concealer
  sliderContainer: {
    marginTop: 8,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: Colors.primary.orange,
    borderRadius: 4,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sliderButtonSelected: {
    backgroundColor: Colors.primary.orange,
    borderColor: Colors.primary.orange,
  },
  sliderButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  sliderButtonTextSelected: {
    color: Colors.white,
  },
  // Parameter sections
  paramSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paramLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  // Pattern styles
  patternScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  patternRow: {
    flexDirection: 'row',
    gap: 12,
  },
  patternCard: {
    width: 80,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patternCardSelected: {
    borderColor: Colors.primary.orange,
    backgroundColor: '#fff5f0',
  },
  patternPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE4E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  patternEmoji: {
    fontSize: 24,
  },
  patternName: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  // Color styles
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: '#333',
    borderWidth: 3,
  },
  customColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customColorLabel: {
    fontSize: 14,
    color: '#666',
  },
  colorInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  colorPreview: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  // Texture styles
  textureRow: {
    flexDirection: 'row',
    gap: 10,
  },
  textureButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  textureButtonSelected: {
    backgroundColor: Colors.primary.orange,
    borderColor: Colors.primary.orange,
  },
  textureText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  textureTextSelected: {
    color: Colors.white,
  },
  // Intensity styles
  intensityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  intensityButtonSelected: {
    backgroundColor: Colors.primary.orange,
    borderColor: Colors.primary.orange,
  },
  intensityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  intensityTextSelected: {
    color: Colors.white,
  },
  // Apply button
  applyButton: {
    borderRadius: 12,
    backgroundColor: Colors.primary.orange,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  applyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
});
