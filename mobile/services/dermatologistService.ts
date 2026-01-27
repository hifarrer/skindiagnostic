import { apiClient } from './api';

export interface Dermatologist {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string;
  distance: number;
  rating: number;
  specialties: string[];
}

export interface SearchResponse {
  success: boolean;
  count: number;
  dermatologists: Dermatologist[];
}

export const dermatologistService = {
  async searchDermatologists(zipcode: string): Promise<Dermatologist[]> {
    try {
      const response = await apiClient.get<SearchResponse>(
        `/dermatologists/search?zipcode=${encodeURIComponent(zipcode)}`
      );
      return response.dermatologists || [];
    } catch (error: any) {
      console.error('[DermatologistService] Search error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to search for dermatologists. Please try again.');
    }
  },
};
