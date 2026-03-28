import apiClient from './apiClient';

export interface AdmissionEnquiry {
  id: string;
  studentName: string;
  parentName: string;
  mobile: string;
  email?: string;
  classId: string;
  className?: string; // Mapped from Class.Name
  gender?: string;
  source?: string;
  status: 'New' | 'Follow-up' | 'Converted' | 'Lost';
  nextFollowUpDate?: string;
  notes?: string;
  createdAt: string;
}

export interface VisitorLog {
  id: string;
  visitorName: string;
  phone: string;
  purpose: string;
  whomToMeet?: string;
  checkInTime: string;
  checkOutTime?: string;
  idProof?: string;
  notes?: string;
}

export const frontOfficeApi = {
  // Enquiries
  getEnquiries: () => apiClient.get<AdmissionEnquiry[]>('/crm/enquiries'),
  createEnquiry: (data: Partial<AdmissionEnquiry>) => apiClient.post<AdmissionEnquiry>('/crm/enquiries', data),
  updateEnquiry: (id: string, data: Partial<AdmissionEnquiry>) => apiClient.put(`/crm/enquiries/${id}`, data),
  deleteEnquiry: (id: string) => apiClient.delete(`/crm/enquiries/${id}`),

  // Visitors
  getVisitors: () => apiClient.get<VisitorLog[]>('/crm/visitors'),
  recordVisitor: (data: Partial<VisitorLog>) => apiClient.post<VisitorLog>('/crm/visitors', data),
  checkOutVisitor: (id: string) => apiClient.post(`/crm/visitors/${id}/checkout`),
  deleteVisitor: (id: string) => apiClient.delete(`/crm/visitors/${id}`)
};
