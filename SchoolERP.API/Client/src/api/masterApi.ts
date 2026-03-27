import apiClient from './apiClient';
import { Lookup, CreateLookupDto, LookupType } from '../types';

export const lookupApi = {
  getAll: async (type?: LookupType): Promise<Lookup[]> => {
    const response = await apiClient.get<Lookup[]>('/lookups', { params: { type } });
    return response.data;
  },

  getById: async (id: string): Promise<Lookup> => {
    const response = await apiClient.get<Lookup>(`/lookups/${id}`);
    return response.data;
  },

  create: async (data: CreateLookupDto): Promise<Lookup> => {
    const response = await apiClient.post<Lookup>('/lookups', data);
    return response.data;
  },

  update: async (id: string, data: CreateLookupDto): Promise<void> => {
    await apiClient.post(`/lookups/${id}/update`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.post(`/lookups/${id}/delete`);
  }
};

export const masterApi = {
  getAll: async (endpoint: string): Promise<any[]> => {
    const response = await apiClient.get<any[]>(`/masters/${endpoint}`);
    return response.data;
  },

  getById: async (endpoint: string, id: string): Promise<any> => {
    const response = await apiClient.get<any>(`/masters/${endpoint}/${id}`);
    return response.data;
  },

  create: async (endpoint: string, data: any): Promise<any> => {
    const response = await apiClient.post<any>(`/masters/${endpoint}`, data);
    return response.data;
  },

  update: async (endpoint: string, id: string, data: any): Promise<void> => {
    await apiClient.post(`/masters/${endpoint}/${id}/update`, data);
  },

  delete: async (endpoint: string, id: string): Promise<void> => {
    await apiClient.post(`/masters/${endpoint}/${id}/delete`);
  },

  // Semantic Helpers
  getClasses: () => masterApi.getAll('classes'),
  getSections: () => masterApi.getAll('sections'),
  getSubjects: () => masterApi.getAll('subjects'),
  getAcademicYears: () => masterApi.getAll('academic-years'),
  getDepartments: () => masterApi.getAll('departments'),
  getDesignations: () => masterApi.getAll('designations')
};
