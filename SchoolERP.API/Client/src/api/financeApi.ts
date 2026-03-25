import apiClient from './apiClient';

export interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  paidTo: string;
  paymentMethod: string;
}

export interface ProfitLossSummary {
  income: {
    fees: number;
    others: number;
    total: number;
  };
  expenses: {
    payroll: number;
    office: number;
    infrastructure: number;
    total: number;
  };
  netProfit: number;
}

export const financeApi = {
  // Expense Logging
  getExpenses: () => apiClient.get<ExpenseRecord[]>('/finance/expenses'),
  addExpense: (data: Partial<ExpenseRecord>) => apiClient.post<ExpenseRecord>('/finance/expenses', data),
  
  // Dashboard Metrics
  getPLSummary: () => apiClient.get<ProfitLossSummary>('/finance/pl-summary'),
  
  // Ledger Exports
  exportLedger: (params?: any) => apiClient.get('/finance/export', { params, responseType: 'blob' })
};
