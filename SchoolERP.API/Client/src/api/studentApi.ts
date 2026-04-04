import apiClient from './apiClient';
import { Student, CreateStudentDto, UpdateStudentDto } from '../types';

export interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
}

export const studentApi = {
  getAll: async (params: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    classId?: string;
    sectionId?: string;
    courseId?: string;
    academicYear?: string;
    isActive?: boolean;
    status?: string;
    sortBy?: string;
  }): Promise<PaginatedResponse<Student>> => {
    const response = await apiClient.get<PaginatedResponse<Student>>('/student', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Student> => {
    const response = await apiClient.get<Student>(`/student/${id}`);
    return response.data;
  },

  create: async (data: CreateStudentDto): Promise<Student> => {
    const response = await apiClient.post<Student>('/student', data);
    return response.data;
  },

  update: async (id: string, data: UpdateStudentDto): Promise<Student> => {
    const response = await apiClient.post<Student>(`/student/${id}/update`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.post(`/student/${id}/delete`);
  },

  bulkEnroll: async (students: any[]) => {
    const response = await apiClient.post('/Student/bulk', students);
    return response.data;
  },

  bulkValidate: async (students: any[]) => {
    const response = await apiClient.post<any[]>('/Student/bulk/validate', students);
    return response.data;
  }
};
