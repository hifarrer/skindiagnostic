import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import { lookVTOService, LookTemplate } from '../../services/lookVTOService';
import { usePolling } from '../../hooks/usePolling';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { imageUploadService } from '../../services/imageUploadService';
import { apiClient } from '../../services/api';

export default function LooksScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedLook, setSelectedLook] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [templates, setTemplates] = useState<LookTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  // Ensure token is synced with apiClient whenever it changes
  useEffect(() => {
    if (token) {
      apiClient.setToken(token);
      console.log('[Looks] Token synced with apiClient');
    } else {
      apiClient.setToken(null);
    }
  }, [token]);

  // Fetch templates on mount
  useEffect(() => {
    if (token && user) {
      loadTemplates();
    }
  }, [token, user]);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      let allTemplates: LookTemplate[] = [];
      let nextToken: string | undefined = undefined;
      let pageCount = 0;
      const MAX_PAGES = 100; // Safety limit to prevent infinite loops
      
      // Fetch all pages until no more next_token
      do {
        pageCount++;
        console.log(`[Looks] Fetching page ${pageCount}...`);
        
        const response = await lookVTOService.getTemplates(20, nextToken);
        
        if (response.data?.templates && response.data.templates.length > 0) {
          allTemplates = [...allTemplates, ...response.data.templates];
          console.log(`[Looks] Loaded ${response.data.templates.length} templates from page ${pageCount} (total: ${allTemplates.length})`);
          
          // Check if there's a next page
          nextToken = response.data.next_token;
          
          if (nextToken) {
            console.log(`[Looks] More pages available, continuing...`);
          } else {
            console.log(`[Looks] No more pages, finished loading.`);
          }
        } else {
          console.log(`[Looks] No templates in response, stopping.`);
          break; // No more templates
        }
        
        // Safety check to prevent infinite loops
        if (pageCount >= MAX_PAGES) {
          console.warn(`[Looks] Reached maximum page limit (${MAX_PAGES}), stopping.`);
          break;
        }
      } while (nextToken);
      
      setTemplates(allTemplates);
      console.log(`[Looks] ✅ Total loaded: ${allTemplates.length} templates from ${pageCount} page(s)`);
      
      // Log categories found
      const uniqueCategories = Array.from(new Set(allTemplates.map(t => t.category_name))).filter(Boolean);
      console.log(`[Looks] 📁 Categories found: ${uniqueCategories.join(', ')}`);
    } catch (error: any) {
      console.error('[Looks] Failed to load templates:', error);
      Alert.alert('Error', 'Failed to load available looks. Please try again later.');
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Get unique categories from templates
  const categories = Array.from(new Set(templates.map(t => t.category_name))).filter(Boolean);
  
  // Filter templates by selected category
  const filteredTemplates = selectedCategory
    ? templates.filter(t => t.category_name === selectedCategory)
    : templates;

  // Poll for results
  const { data: pollData, loading: polling } = usePolling({
    pollingFunction: async () => {
      if (!taskId) throw new Error('No task ID');
      return await lookVTOService.getTaskStatus(taskId);
    },
    interval: 3000,
    maxAttempts: 40,
    enabled: !!taskId && !result,
    onSuccess: (data) => {
      setResult(data);
      setTaskId(null);
    },
    onError: (error) => {
      const message =
        typeof error === 'string' ? error : 'Failed to get look results';
      Alert.alert('Error', message);
      setTaskId(null);
    },
  });

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
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleTryLook = async (template: LookTemplate) => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please upload a photo first');
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
    setShowOriginal(false);
    try {
      // Ensure token is set in apiClient before upload (double-check)
      if (token) {
        apiClient.setToken(token);
        console.log('[Looks] Token verified and set in apiClient before upload');
      } else {
        throw new Error('No authentication token available');
      }
      
      // Upload image first
      console.log('[Looks] Starting image upload...');
      const imageUrl = await imageUploadService.uploadImage(selectedImage);
      console.log('[Looks] Image uploaded successfully:', imageUrl);
      
      // Apply look using the template ID
      console.log('[Looks] Applying look with template ID:', template.id);
      const response = await lookVTOService.applyLook(imageUrl, template.id);
      
      if (response.taskId) {
        setTaskId(response.taskId);
        setSelectedLook(template.id);
        Alert.alert('Look Applied', `${template.title} is being applied! Results will appear when ready.`);
      }
    } catch (error: any) {
      console.error('[Looks] Apply look error:', error);
      let errorMessage = 'Failed to apply look';
      
      if (error.message?.includes('Invalid Template') || error.message?.includes('InvalidTemplate')) {
        errorMessage = `The look "${template.title}" is not available. Please try a different look.`;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Look Try-On</Text>
        <Text style={styles.subtitle}>
          Try complete makeup looks instantly
        </Text>
      </View>

      <View style={styles.content}>
        {/* Result Image (shows on top when available) */}
        {result && result.resultUrl && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>
              {showOriginal ? '📷 Original Photo' : '✨ Look Applied!'}
            </Text>
            
            {/* Show either result or original based on toggle */}
            <Image 
              source={{ uri: showOriginal ? selectedImage! : result.resultUrl }} 
              style={styles.resultImage}
              resizeMode="cover"
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
              <Text style={styles.tryNewButtonText}>🔄 Try Different Look</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upload placeholder (only show when no result) */}
        {!result && (
          <View style={styles.imageContainer}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageIcon}>✨</Text>
                <Text style={styles.imageText}>Upload a photo to try looks</Text>
              </View>
            )}
          </View>
        )}

        {(uploading || polling) && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary.orange} />
            <Text style={styles.loadingText}>
              {uploading ? 'Uploading...' : 'Applying look...'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUploadPhoto}
          disabled={uploading || polling}
        >
          <Text style={styles.buttonText}>📁 Upload Photo</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Available Looks</Text>

        {categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[
                styles.categoryChipText,
                !selectedCategory && styles.categoryChipTextActive,
              ]}>
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {loadingTemplates ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary.orange} />
            <Text style={styles.loadingText}>Loading looks...</Text>
          </View>
        ) : filteredTemplates.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No looks available</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.lookCard,
                  selectedLook === template.id && styles.lookCardSelected,
                ]}
                onPress={() => handleTryLook(template)}
                activeOpacity={0.8}
                disabled={!selectedImage || uploading || polling}
              >
                {template.thumb && (
                  <View style={styles.thumbnailContainer}>
                    <Image 
                      source={{ uri: template.thumb }} 
                      style={styles.lookThumbnail}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={[
                        styles.tryButtonOverlay,
                        (!selectedImage || uploading || polling) && styles.tryButtonDisabled,
                      ]}
                      onPress={() => handleTryLook(template)}
                      disabled={!selectedImage || uploading || polling}
                    >
                      <Text style={styles.tryButtonText}>Try</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.lookInfo}>
                  <Text style={styles.lookName} numberOfLines={1}>{template.title}</Text>
                  {template.category_name && (
                    <Text style={styles.lookCategory} numberOfLines={1}>{template.category_name}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
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
  uploadButton: {
    borderRadius: 12,
    backgroundColor: Colors.primary.orange,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    marginHorizontal: -4,
  },
  lookCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  lookCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary.orange,
  },
  lookInfo: {
    padding: 8,
  },
  lookIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  lookName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  lookDescription: {
    fontSize: 14,
    color: Colors.gray.dark,
    marginBottom: 15,
  },
  tryButton: {
    backgroundColor: Colors.primary.orange,
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tryButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.white,
  },
  categoryContainer: {
    marginBottom: 20,
    maxHeight: 50,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: Colors.primary.orange,
    borderColor: Colors.primary.orange,
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.gray.dark,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  lookThumbnail: {
    width: '100%',
    height: '100%',
  },
  tryButtonOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.primary.orange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  tryButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  lookCategory: {
    fontSize: 10,
    color: Colors.gray.dark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyBox: {
    backgroundColor: Colors.white,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray.dark,
  },
});
