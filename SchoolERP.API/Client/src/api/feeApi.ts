import apiClient from './apiClient';

export const feeApi = {
  // Fee Heads
  getHeads: async () => {
    const response = await apiClient.get('/masters/fee/heads');
    return response.data;
  },
  createHead: async (data: any) => {
    const response = await apiClient.post('/masters/fee/heads', data);
    return response.data;
  },
  updateHead: async (id: string, data: any) => {
    await apiClient.put(`/masters/fee/heads/${id}`, data);
  },
  deleteHead: async (id: string) => {
    await apiClient.delete(`/masters/fee/heads/${id}`);
  },

  // Fee Structures
  getStructures: async () => {
    const response = await apiClient.get('/masters/fee/structures');
    return response.data;
  },
  createStructure: async (data: any) => {
    const response = await apiClient.post('/masters/fee/structures', data);
    return response.data;
  },
  updateStructure: async (id: string, data: any) => {
    await apiClient.put(`/masters/fee/structures/${id}`, data);
  },
  deleteStructure: async (id: string) => {
    await apiClient.delete(`/masters/fee/structures/${id}`);
  },
  copyStructures: async (fromYearId: string, toYearId: string) => {
    await apiClient.post('/masters/fee/structures/copy', { fromYearId, toYearId });
  },

  // Student Account & Payment
  getStudentAccount: async (studentId: string) => {
    const response = await apiClient.get(`/masters/fee/student-account/${studentId}`);
    return response.data;
  },
  processPayment: async (data: any) => {
    const response = await apiClient.post('/masters/fee/process-payment', data);
    return response.data;
  },

  // Bulk Operations
  generateMonthlyCharges: async (classIds: string[], month: string, feeHeadIds?: string[], academicYearId?: string) => {
    await apiClient.post('/masters/fee/generate-charges', { classIds, month, feeHeadIds, academicYearId });
  },
  undoMonthlyCharges: async (classIds: string[], month: string, academicYearId?: string) => {
    await apiClient.post('/masters/fee/undo-generation', { classIds, month, academicYearId });
  },
  getHistory: async (classId?: string, academicYearId?: string) => {
    let url = '/masters/fee/history?';
    if (classId) url += `classId=${classId}&`;
    if (academicYearId) url += `academicYearId=${academicYearId}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Discounts
  getDiscounts: async () => {
    const response = await apiClient.get('/masters/fee/discounts');
    return response.data;
  },
  assignDiscount: async (data: any) => {
    await apiClient.post('/masters/fee/discounts/assign', data);
  },
  getStudentDiscounts: async (studentId: string) => {
    const response = await apiClient.get(`/masters/fee/student-discounts/${studentId}`);
    return response.data;
  },

  // Configuration
  getConfig: async () => {
    const response = await apiClient.get('/masters/fee/config');
    return response.data;
  },
  updateConfig: async (data: any) => {
    await apiClient.post('/masters/fee/config', data);
  }
};
