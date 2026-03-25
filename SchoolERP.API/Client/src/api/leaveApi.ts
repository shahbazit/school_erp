import apiClient from './apiClient';

export enum LeaveStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
}

export interface LeaveTypeDto {
  id: string;
  name: string;
  description?: string;
  maxDaysPerYear: number;
  isActive: boolean;
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
  getTypes: async (): Promise<LeaveTypeDto[]> => {
    const res = await apiClient.get<LeaveTypeDto[]>('/leave/types');
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
    const res = await apiClient.put<{ message: string }>(`/leave/applications/${id}/action`, data);
    return res.data;
  },

  getBalances: async (employeeId: string): Promise<LeaveBalanceDto[]> => {
    const res = await apiClient.get<LeaveBalanceDto[]>(`/leave/balances/${employeeId}`);
    return res.data;
  }
};
