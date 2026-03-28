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

export interface AccountSummary {
  accountId: string;
  accountName: string;
  accountType: string;
  ownerName?: string;
  ownerEmployeeId?: string;
  isActive: boolean;
  totalIncome: number;
  totalExpense: number;
  internalTransfersIn: number;
  internalTransfersOut: number;
  closingBalance: number;
}

export interface TransactionDetail {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'Income' | 'Expense';
  referenceNumber: string;
}

export interface FinancialAccount {
  id?: string;
  name: string;
  accountType: string;
  description?: string;
  isActive: boolean;
  ownerEmployeeId?: string;
}

export const financeApi = {
  // Expense Logging
  getExpenses: () => apiClient.get<ExpenseRecord[]>('/finance/expenses'),
  addExpense: (data: Partial<ExpenseRecord>) => apiClient.post<ExpenseRecord>('/finance/expenses', data),
  
  // Dashboard Metrics
  getPLSummary: () => apiClient.get<ProfitLossSummary>('/finance/pl-summary'),
  
  // Account Summaries (The "3 persons" requirement)
  getAccountSummaries: (academicYearId?: string) => apiClient.get<AccountSummary[]>(`/Finance/accounts`, { params: { academicYearId } }),
  getAccountLedger: (id: string, params?: any) => apiClient.get<TransactionDetail[]>(`/Finance/accounts/${id}/ledger`, { params }),
  
  // Financial Account Master Management
  listAccounts: () => apiClient.get<FinancialAccount[]>('/Finance/list-accounts'),
  createAccount: (data: Partial<FinancialAccount>) => apiClient.post<FinancialAccount>('/Finance/accounts', data),
  updateAccount: (id: string, data: Partial<FinancialAccount>) => apiClient.put<FinancialAccount>(`/Finance/accounts/${id}`, data),
  deleteAccount: (id: string) => apiClient.delete(`/Finance/accounts/${id}`),
  transferFunds: (data: any) => apiClient.post('/Finance/transfer', data),

  // Ledger Exports
  exportLedger: (params?: any) => apiClient.get('/finance/export', { params, responseType: 'blob' })
};
