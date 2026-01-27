import axios, { AxiosInstance } from 'axios';
import { API_URL } from '../constants/Config';

class ApiClient {
  public client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to always add Authorization header if token exists
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - token expired
          this.setToken(null);
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('[ApiClient] Token set successfully');
    } else {
      delete this.client.defaults.headers.common['Authorization'];
      console.log('[ApiClient] Token cleared');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  async get(endpoint: string, config = {}) {
    const response = await this.client.get(endpoint, config);
    return response.data;
  }

  async post(endpoint: string, data = {}, config = {}) {
    const response = await this.client.post(endpoint, data, config);
    return response.data;
  }

  async put(endpoint: string, data = {}, config = {}) {
    const response = await this.client.put(endpoint, data, config);
    return response.data;
  }

  async delete(endpoint: string, config = {}) {
    const response = await this.client.delete(endpoint, config);
    return response.data;
  }

  async uploadFile(endpoint: string, fileUri: string, fieldName = 'image') {
    // Ensure we have a token before uploading
    if (!this.token) {
      console.error('[ApiClient] No token available for upload');
      throw new Error('No authentication token available. Please login first.');
    }

    console.log('[ApiClient] Starting file upload to:', endpoint);
    console.log('[ApiClient] Token present:', !!this.token);
    console.log('[ApiClient] File URI:', fileUri.substring(0, 100) + '...');

    // For web, convert URI to File/Blob
    if (typeof window !== 'undefined') {
      try {
        console.log('[ApiClient] Web platform detected, fetching blob...');
        const response = await fetch(fileUri);
        const blob = await response.blob();
        console.log('[ApiClient] Blob created, size:', blob.size, 'type:', blob.type);
        
        const file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' });
        console.log('[ApiClient] File created:', file.name, file.size, file.type);
        
        const formData = new FormData();
        formData.append(fieldName, file);
        
        // Use fetch API directly for more control over headers
        const uploadUrl = `${API_URL}${endpoint}`;
        console.log('[ApiClient] Uploading to:', uploadUrl);
        
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            // Do NOT set Content-Type - browser will set it with boundary for FormData
          },
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({ error: 'Unknown error' }));
          console.error('[ApiClient] Upload failed:', uploadResponse.status, errorData);
          console.error('[ApiClient] Upload URL:', uploadUrl);
          console.error('[ApiClient] Token present:', !!this.token);
          
          if (uploadResponse.status === 401) {
            this.setToken(null);
            throw new Error('Authentication failed. Please login again.');
          }
          throw new Error(errorData.error || `Upload failed with status ${uploadResponse.status}`);
        }
        
        const data = await uploadResponse.json();
        
        console.log('[ApiClient] Upload successful:', data);
        return data;
      } catch (error: any) {
        console.error('[ApiClient] Web upload error:', error);
        if (error.message?.includes('401')) {
          this.setToken(null);
          throw new Error('Authentication failed. Please login again.');
        }
        throw error;
      }
    }
    
    // For native platforms
    const formData = new FormData();
    formData.append(fieldName, {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    // Use fetch for native as well for consistency
    const uploadUrl = `${API_URL}${endpoint}`;
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Upload failed with status ${response.status}`);
      }
      
      return data;
    } catch (error: any) {
      console.error('[ApiClient] Native upload error:', error);
      if (error.message?.includes('401')) {
        this.setToken(null);
        throw new Error('Authentication failed. Please login again.');
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
