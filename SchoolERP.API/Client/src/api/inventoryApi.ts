import apiClient from './apiClient';

export enum InventoryTransactionType {
    Purchase = 1,
    Issue = 2,
    Adjustment = 3,
    Return = 4
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  code?: string;
  categoryId: string;
  categoryName?: string;
  unit: string;
  minQuantity: number;
  unitPrice: number;
  currentStock: number;
}

export interface InventorySupplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  category?: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName?: string;
  type: InventoryTransactionType;
  typeName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  reference?: string;
  entity?: string;
  handledBy?: string;
  notes?: string;
  transactionDate: string;

  // Vendor payment tracking (internal to inventory, NOT school finance)
  supplierId?: string;
  supplierName?: string;
  paymentStatus?: string;  // 'Unpaid' | 'Partial' | 'Paid'
  amountPaid: number;
  amountDue: number;
}

export interface CreateInventoryTransactionRequest {
  itemId: string;
  type: InventoryTransactionType;
  quantity: number;
  unitPrice: number;
  reference?: string;
  entity?: string;
  handledBy?: string;
  notes?: string;

  // For Purchase type: vendor payment info
  supplierId?: string;
  paymentStatus?: string;
  amountPaid?: number;
}

export interface UpdatePaymentStatusRequest {
  paymentStatus: string;
  amountPaid: number;
}

export const inventoryApi = {
  // Items
  getItems: () => apiClient.get<InventoryItem[]>('/inventory/items'),
  getItem: (id: string) => apiClient.get<InventoryItem>(`/inventory/items/${id}`),
  upsertItem: (data: Partial<InventoryItem>) => apiClient.post<InventoryItem>('/inventory/items', data),
  deleteItem: (id: string) => apiClient.post(`/inventory/items/${id}/delete`),

  // Transactions
  getTransactions: () => apiClient.get<InventoryTransaction[]>('/inventory/transactions'),
  createTransaction: (data: CreateInventoryTransactionRequest) => apiClient.post<InventoryTransaction>('/inventory/transactions', data),
  updatePayment: (id: string, data: UpdatePaymentStatusRequest) => apiClient.post<InventoryTransaction>(`/inventory/transactions/${id}/payment/update`, data),

  // Suppliers
  getSuppliers: () => apiClient.get<InventorySupplier[]>('/inventory/suppliers'),
  upsertSupplier: (data: Partial<InventorySupplier>) => apiClient.post<InventorySupplier>('/inventory/suppliers', data),
  deleteSupplier: (id: string) => apiClient.post(`/inventory/suppliers/${id}/delete`),

  // Categories
  getCategories: () => apiClient.get<InventoryCategory[]>('/inventory/categories'),
  upsertCategory: (data: Partial<InventoryCategory>) => apiClient.post<InventoryCategory>('/inventory/categories', data),
  deleteCategory: (id: string) => apiClient.post(`/inventory/categories/${id}/delete`),
};
