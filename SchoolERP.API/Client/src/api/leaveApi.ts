import apiClient from './apiClient';

export enum LeaveStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
}

export enum LeaveDayType {
  FullDay = 1,
  FirstHalf = 2,
  SecondHalf = 3,
  Quarter = 4,
}

export interface LeavePlanDto {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  employeeCount: number;
  leaveTypes?: LeaveTypeDto[];
}

export interface LeaveTypeDto {
  id: string;
  name: string;
  description?: string;
  maxDaysPerYear: number;
  isActive: boolean;
  leavePlanId?: string;
  // Policy Settings
  isMonthlyAccrual: boolean;
  accrualRatePerMonth: number;
  canCarryForward: boolean;
  maxCarryForwardDays: number;
}

export interface LeaveApplicationDto {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  dayType: LeaveDayType;
  status: LeaveStatus;
  statusName: string;
  approvedById?: string;
  approvedByName?: string;
  actionDate?: string;
  actionRemarks?: string;
  createdAt: string;
}

export interface ApplyLeaveDto {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  dayType: LeaveDayType;
  reason?: string;
}

export interface LeaveActionDto {
  status: LeaveStatus;
  remarks?: string;
}

export interface LeaveBalanceDto {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  totalDays: number;
  consumedDays: number;
  remainingDays: number;
}

export const leaveApi = {
  getPlans: async (): Promise<LeavePlanDto[]> => {
    const res = await apiClient.get<LeavePlanDto[]>('/leave/plans');
    return res.data;
  },

  createPlan: async (data: { name: string; description?: string }): Promise<LeavePlanDto> => {
    const res = await apiClient.post<LeavePlanDto>('/leave/plans', data);
    return res.data;
  },

  deletePlan: async (id: string): Promise<void> => {
    await apiClient.post(`/leave/plans/${id}/delete`);
  },

  setDefaultPlan: async (id: string): Promise<void> => {
    await apiClient.post(`/leave/plans/${id}/set-default`);
  },

  getTypes: async (planId?: string): Promise<LeaveTypeDto[]> => {
    const res = await apiClient.get<LeaveTypeDto[]>(planId ? `/leave/types` : `/leave/types/my`, { params: { planId } });
    return res.data;
  },

  createType: async (data: Omit<LeaveTypeDto, 'id' | 'isActive'>): Promise<LeaveTypeDto> => {
    const res = await apiClient.post<LeaveTypeDto>('/leave/types', data);
    return res.data;
  },

  updateType: async (id: string, data: Omit<LeaveTypeDto, 'id' | 'isActive'>): Promise<LeaveTypeDto> => {
    const res = await apiClient.post<LeaveTypeDto>(`/leave/types/${id}/update`, data);
    return res.data;
  },

  getApplications: async (params?: { employeeId?: string; status?: LeaveStatus }): Promise<LeaveApplicationDto[]> => {
    const res = await apiClient.get<LeaveApplicationDto[]>('/leave/applications', { params });
    return res.data;
  },

  applyLeave: async (data: ApplyLeaveDto): Promise<{ message: string; id: string }> => {
    const res = await apiClient.post<{ message: string; id: string }>('/leave/apply', data);
    return res.data;
  },

  processLeave: async (id: string, data: LeaveActionDto): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>(`/leave/applications/${id}/action`, data);
    return res.data;
  },

  getBalances: async (employeeId?: string): Promise<LeaveBalanceDto[]> => {
    const url = employeeId ? `/leave/balances/${employeeId}` : '/leave/balances';
    const res = await apiClient.get<LeaveBalanceDto[]>(url);
    return res.data;
  },

  updateBalance: async (data: { employeeId: string, leaveTypeId: string, totalDays: number }): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/leave/balances/update', data);
    return res.data;
  },

  bulkInitializeBalances: async (data: { leaveTypeId: string, totalDays: number }): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/leave/balances/bulk-initialize', data);
    return res.data;
  }
};
