import { apiClient } from './api';

export const imageUploadService = {
  /**
   * Upload image to backend (which uploads to Cloudinary)
   * Returns the Cloudinary URL
   */
  async uploadImage(imageUri: string): Promise<string> {
    try {
      // Upload to dedicated upload endpoint to get Cloudinary URL
      const result = await apiClient.uploadFile('/upload', imageUri);
      
      // Backend returns imageUrl in the response
      if (result.imageUrl) {
        console.log('Image uploaded successfully:', result.imageUrl);
        return result.imageUrl;
      }
      
      throw new Error('No image URL returned from upload');
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  },
};
