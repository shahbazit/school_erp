import apiClient from './apiClient';

export enum SalaryComponentType {
  Earning = 1,
  Deduction = 2,
}

export enum PayrollStatus {
  Draft = 1,
  Processed = 2,
  Approved = 3,
  Paid = 4,
}

export interface SalaryComponentDto {
  id: string;
  name: string;
  type: SalaryComponentType;
  typeName: string;
  amount: number;
}

export interface SalaryStructureDto {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  totalEarnings: number;
  totalDeductions: number;
  netTotal: number;
  components: SalaryComponentDto[];
}

export interface UpsertSalaryStructureDto {
  name: string;
  description?: string;
  isActive: boolean;
  components: {
    name: string;
    type: SalaryComponentType;
    amount: number;
  }[];
}

export interface EmployeeSalaryDto {
  id: string;
  employeeId: string;
  employeeName: string;
  salaryStructureId: string;
  salaryStructureName: string;
  grossSalary: number;
  netSalary: number;
}

export interface AssignSalaryDto {
  employeeId: string;
  salaryStructureId: string;
}

export interface PayrollDetailDto {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  componentBreakdownDetails: string;
}

export interface PayrollRunDto {
  id: string;
  year: number;
  month: number;
  processedDate: string;
  processedByName: string;
  status: PayrollStatus;
  statusName: string;
  totalAmount: number;
  employeeCount: number;
  remarks?: string;
  details: PayrollDetailDto[];
}

export interface ProcessPayrollDto {
  year: number;
  month: number;
  remarks?: string;
}

export const payrollApi = {
  getStructures: async (): Promise<SalaryStructureDto[]> => {
    const res = await apiClient.get<SalaryStructureDto[]>('/payroll/structures');
    return res.data;
  },

  createStructure: async (data: UpsertSalaryStructureDto): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/payroll/structures', data);
    return res.data;
  },

  assignSalary: async (data: AssignSalaryDto): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/payroll/assign', data);
    return res.data;
  },

  getEmployeeSalary: async (employeeId: string): Promise<EmployeeSalaryDto> => {
    const res = await apiClient.get<EmployeeSalaryDto>(`/payroll/employee/${employeeId}`);
    return res.data;
  },

  getRuns: async (): Promise<PayrollRunDto[]> => {
    const res = await apiClient.get<PayrollRunDto[]>('/payroll/runs');
    return res.data;
  },

  processPayroll: async (data: ProcessPayrollDto): Promise<{ message: string; runId: string }> => {
    const res = await apiClient.post<{ message: string; runId: string }>('/payroll/process', data);
    return res.data;
  },

  approvePayroll: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>(`/payroll/runs/${id}/approve`);
    return res.data;
  },
};
