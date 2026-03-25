import apiClient from './apiClient';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  pricePerUnit: number;
  lastPurchaseDate?: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'Purchase' | 'Issue' | 'Adjustment';
  quantity: number;
  transactionDate: string;
  handledBy: string;
  notes?: string;
  entityName?: string; // e.g. Student name or Supplier name
}

export interface InventorySupplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export const inventoryApi = {
  // Items
  getItems: () => apiClient.get<InventoryItem[]>('/inventory/items'),
  createItem: (data: Partial<InventoryItem>) => apiClient.post<InventoryItem>('/inventory/items', data),
  
  // Suppliers
  getSuppliers: () => apiClient.get<InventorySupplier[]>('/inventory/suppliers'),
  createSupplier: (data: Partial<InventorySupplier>) => apiClient.post<InventorySupplier>('/inventory/suppliers', data),
  
  // Transactions
  getTransactions: (params?: any) => apiClient.get<InventoryTransaction[]>('/inventory/transactions', { params }),
  
  // Stock Actions
  recordPurchase: (data: { itemId: string; quantity: number; supplierId: string; price: number; notes?: string }) => 
    apiClient.post('/inventory/purchase', data),
    
  issueItem: (data: { itemId: string; quantity: number; receiverIdentifier: string; receiverType: 'Student' | 'Staff' | 'Dept'; notes?: string }) => 
    apiClient.post('/inventory/issue', data),
    
  getDashboardSummary: () => apiClient.get<any>('/inventory/dashboard')
};
