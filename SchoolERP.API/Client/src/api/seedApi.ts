import apiClient from './apiClient';

export const seedApi = {
  getDefaultData: async () => {
    const response = await apiClient.get('seed/default-data');
    return response.data;
  },
  seedDefaultData: async () => {
    const response = await apiClient.post('seed/default-data');
    return response.data;
  },
  seedCustomData: async (data: any) => {
    const response = await apiClient.post('seed/seed-custom', data);
    return response.data;
  }
};
