import { apiClient } from './api';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  age: number | null;
  avatar_url?: string;
  subscription_status: string;
  subscription_plan_id?: number;
  statistics?: {
    analyses: number;
    looksTried: number;
    favorites: number;
  };
}

export interface UpdateProfileData {
  email?: string;
  age?: number | null;
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    return apiClient.get('/auth/me');
  },

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    return apiClient.put('/auth/profile', data);
  },
};
