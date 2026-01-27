import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { apiClient } from './api';
import { API_URL } from '../constants/Config';

WebBrowser.maybeCompleteAuthSession();

export const authService = {
  async loginWithGoogle() {
    try {
      // For web, redirect to backend OAuth endpoint
      if (typeof window !== 'undefined') {
        window.location.href = `${API_URL.replace('/api', '')}/api/auth/oauth/google`;
        return;
      }

      // For mobile, use AuthSession
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      };

      const request = new AuthSession.AuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      });

      const result = await request.promptAsync(discovery);
      
      if (result.type === 'success') {
        // Exchange code for token via backend
        const response = await apiClient.post('/auth/oauth/google/callback', {
          code: result.params.code,
        });
        return response;
      }

      throw new Error('Authentication cancelled');
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },


  async getMe() {
    return apiClient.get('/auth/me');
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },
};

