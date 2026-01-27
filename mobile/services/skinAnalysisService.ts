import { apiClient } from './api';

export const skinAnalysisService = {
  async uploadImage(imageUri: string, dstActions?: string[]) {
    // Ensure token is available
    const token = apiClient.getToken();
    if (!token) {
      console.error('[SkinAnalysis] No token available');
      throw new Error('No authentication token available. Please login first.');
    }

    // For web
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' });
        
        const formData = new FormData();
        formData.append('image', file);
        if (dstActions && dstActions.length > 0) {
          formData.append('dstActions', JSON.stringify(dstActions));
        }
        
        console.log('[SkinAnalysis] Uploading to /skin-analysis/upload');
        console.log('[SkinAnalysis] Token present:', !!token);
        
        const uploadResponse = await apiClient.client.post('/skin-analysis/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return uploadResponse.data;
      } catch (error: any) {
        console.error('[SkinAnalysis] Web upload error:', error);
        if (error.response?.status === 401) {
          apiClient.setToken(null);
          throw new Error('Authentication failed. Please login again.');
        }
        throw error;
      }
    }
    
    // For native platforms
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);
    
    if (dstActions && dstActions.length > 0) {
      formData.append('dstActions', JSON.stringify(dstActions));
    }

    console.log('[SkinAnalysis] Uploading to /skin-analysis/upload (native)');
    console.log('[SkinAnalysis] Token present:', !!token);

    try {
      const response = await apiClient.client.post('/skin-analysis/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('[SkinAnalysis] Native upload error:', error);
      if (error.response?.status === 401) {
        apiClient.setToken(null);
        throw new Error('Authentication failed. Please login again.');
      }
      throw error;
    }
  },

  async getTaskStatus(taskId: string) {
    return apiClient.get(`/skin-analysis/${taskId}`);
  },

  async getHistory() {
    return apiClient.get('/skin-analysis/history');
  },
};

