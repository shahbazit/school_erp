import apiClient from './apiClient';

export const financialsApi = {
  getSummary: async (sessionId?: string) => {
    const response = await apiClient.get(`/financials/summary${sessionId ? `?academicYearId=${sessionId}` : ''}`);
    return response.data;
  },
  getDefaulters: async (sessionId?: string, minBalance = 500) => {
    const response = await apiClient.get(`/financials/defaulters?minBalance=${minBalance}${sessionId ? `&academicYearId=${sessionId}` : ''}`);
    return response.data;
  },
  getExpenses: async () => {
    const response = await apiClient.get('/financials/expenses');
    return response.data;
  },
  getOtherIncome: async () => {
    const response = await apiClient.get('/financials/income');
    return response.data;
  },
  logExpense: async (data: any) => {
    const response = await apiClient.post('/financials/expenses', data);
    return response.data;
  },
  logIncome: async (data: any) => {
    const response = await apiClient.post('/financials/income', data);
    return response.data;
  }
};
