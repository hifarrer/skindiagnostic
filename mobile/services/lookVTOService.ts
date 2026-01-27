import { apiClient } from './api';

export interface LookTemplate {
  id: string;
  thumb: string;
  title: string;
  category_name: string;
}

export interface TemplatesResponse {
  status: number;
  data: {
    templates: LookTemplate[];
    next_token?: string;
  };
}

export const lookVTOService = {
  async getTemplates(pageSize: number = 20, startingToken?: string): Promise<TemplatesResponse> {
    const params: any = { page_size: pageSize };
    if (startingToken) {
      params.starting_token = startingToken;
    }
    
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/look-vto/templates?${queryString}`);
  },

  async applyLook(imageUrl: string, templateId: string) {
    return apiClient.post('/look-vto/apply', {
      imageUrl,
      templateId,
    });
  },

  async getTaskStatus(taskId: string) {
    return apiClient.get(`/look-vto/${taskId}`);
  },
};

