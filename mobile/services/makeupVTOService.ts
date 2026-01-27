import { apiClient } from './api';

export const makeupVTOService = {
  async applyMakeup(imageUrl: string, effects: any[]) {
    return apiClient.post('/makeup-vto/apply', {
      imageUrl,
      effects,
    });
  },

  async getTaskStatus(taskId: string) {
    return apiClient.get(`/makeup-vto/${taskId}`);
  },
};

