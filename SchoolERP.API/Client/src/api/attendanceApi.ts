import apiClient from './apiClient';

export enum AttendanceStatus {
  Present = 1,
  Absent = 2,
  HalfDay = 3,
  Late = 4,
  OnLeave = 5,
}

export interface EmployeeAttendanceDto {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName?: string;
  designationName?: string;
  profilePhoto?: string;
  attendanceDate: string;
  status: AttendanceStatus;
  statusName: string;
  inTime?: string;
  outTime?: string;
  remarks?: string;
}

export interface MonthlyAttendanceSummaryDto {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  year: number;
  month: number;
  totalPresent: number;
  totalAbsent: number;
  totalHalfDay: number;
  totalLate: number;
  totalOnLeave: number;
  totalWorkingDays: number;
  dailyRecords: EmployeeAttendanceDto[];
}

export interface MarkAttendanceDto {
  employeeId: string;
  attendanceDate: string;
  status: AttendanceStatus;
  inTime?: string;
  outTime?: string;
  remarks?: string;
}

export interface BulkMarkAttendanceDto {
  records: MarkAttendanceDto[];
}

export const attendanceApi = {
  getByDate: async (date: string, params?: { departmentId?: string; search?: string }): Promise<EmployeeAttendanceDto[]> => {
    // Expected date format: YYYY-MM-DD
    const res = await apiClient.get<EmployeeAttendanceDto[]>(`/employeeattendance/date/${date}`, { params });
    return res.data;
  },

  markAttendance: async (data: BulkMarkAttendanceDto): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/employeeattendance/mark', data);
    return res.data;
  },

  getMonthlySummary: async (employeeId: string, year: number, month: number): Promise<MonthlyAttendanceSummaryDto> => {
    const res = await apiClient.get<MonthlyAttendanceSummaryDto>(`/employeeattendance/summary/${employeeId}`, {
      params: { year, month }
    });
    return res.data;
  }
};
