import apiClient from './apiClient';

export type EmploymentType = 1 | 2 | 3 | 4;  // FullTime, PartTime, Contract, Intern
export type DocumentType = 1 | 2 | 3 | 4 | 5 | 6;  // Resume, Certificate, IdProof, ...

export interface EmployeeDocumentDto {
  id: string;
  fileName: string;
  url: string;
  documentType: DocumentType;
  documentTypeName: string;
  description?: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export interface EmployeeDto {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  maritalStatus?: string;
  profilePhoto?: string;
  mobileNumber: string;
  workEmail: string;
  personalEmail?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  permanentAddressLine1?: string;
  permanentAddressLine2?: string;
  permanentCity?: string;
  permanentState?: string;
  permanentPincode?: string;
  departmentId?: string;
  departmentName?: string;
  designationId?: string;
  designationName?: string;
  employeeRoleId?: string;
  employeeRoleName?: string;
  dateOfJoining: string;
  employmentType: EmploymentType;
  employmentTypeName: string;
  workLocation?: string;
  isActive: boolean;
  status: number;
  statusName: string;
  deactivationReason?: string;
  hasTeacherProfile: boolean;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
  documents: EmployeeDocumentDto[];
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  maritalStatus?: string;
  profilePhoto?: string;
  mobileNumber: string;
  workEmail: string;
  personalEmail?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  permanentAddressLine1?: string;
  permanentAddressLine2?: string;
  permanentCity?: string;
  permanentState?: string;
  permanentPincode?: string;
  departmentId?: string;
  designationId?: string;
  employeeRoleId?: string;
  dateOfJoining: string;
  employmentType: EmploymentType;
  workLocation?: string;
  createSystemUser?: boolean;
  systemPassword?: string;
  userId?: string;
}

export interface UpdateEmployeeDto extends CreateEmployeeDto {
  isActive: boolean;
  deactivationReason?: string;
}

export interface EmployeeListParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  departmentId?: string;
  designationId?: string;
  employeeRoleId?: string;
  isActive?: boolean;
  employmentType?: EmploymentType;
  sortBy?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
}

export const employeeApi = {
  getAll: async (params: EmployeeListParams = {}): Promise<PaginatedResponse<EmployeeDto>> => {
    const response = await apiClient.get<PaginatedResponse<EmployeeDto>>('/employee', { params });
    return response.data;
  },

  getById: async (id: string): Promise<EmployeeDto> => {
    const response = await apiClient.get<EmployeeDto>(`/employee/${id}`);
    return response.data;
  },

  create: async (data: CreateEmployeeDto): Promise<EmployeeDto> => {
    const response = await apiClient.post<EmployeeDto>('/employee', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEmployeeDto): Promise<EmployeeDto> => {
    const response = await apiClient.post<EmployeeDto>(`/employee/${id}/update`, data);
    return response.data;
  },

  deactivate: async (id: string, reason?: string): Promise<void> => {
    await apiClient.post(`/employee/${id}/delete`, null, { params: { reason } });
  },

  reactivate: async (id: string): Promise<void> => {
    await apiClient.post(`/employee/${id}/reactivate`);
  },

  addDocument: async (id: string, doc: {
    fileName: string;
    url: string;
    documentType: DocumentType;
    description?: string;
    fileSizeBytes: number;
  }): Promise<EmployeeDocumentDto> => {
    const response = await apiClient.post<EmployeeDocumentDto>(`/employee/${id}/documents`, doc);
    return response.data;
  },

  removeDocument: async (id: string, docId: string): Promise<void> => {
    await apiClient.post(`/employee/${id}/documents/${docId}/delete`);
  }
};
