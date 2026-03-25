import apiClient from './apiClient';

export interface AdmissionEnquiry {
  id: string;
  studentName: string;
  parentName: string;
  phoneNumber: string;
  email?: string;
  classId: string;
  className: string;
  enquiryDate: string;
  source: string;
  status: 'New' | 'Follow-up' | 'Converted' | 'Cold' | 'Rejected';
  nextFollowUp?: string;
  remarks?: string;
}

export interface VisitorLog {
  id: string;
  visitorName: string;
  purpose: string;
  phone: string;
  timeIn: string;
  timeOut?: string;
  date: string;
  idCardNo?: string;
  whomToMeet: string;
}

export interface CallLog {
  id: string;
  name: string;
  phone: string;
  type: 'Incoming' | 'Outgoing';
  duration?: string;
  purpose: string;
  date: string;
}

export const frontOfficeApi = {
  // Enquiries
  getEnquiries: (params?: any) => apiClient.get<AdmissionEnquiry[]>('/frontoffice/enquiries', { params }),
  createEnquiry: (data: Partial<AdmissionEnquiry>) => apiClient.post<AdmissionEnquiry>('/frontoffice/enquiries', data),
  updateEnquiry: (id: string, data: Partial<AdmissionEnquiry>) => apiClient.put(`/frontoffice/enquiries/${id}`, data),
  
  // Visitors
  getVisitors: () => apiClient.get<VisitorLog[]>('/frontoffice/visitors'),
  recordVisitor: (data: Partial<VisitorLog>) => apiClient.post<VisitorLog>('/frontoffice/visitors', data),
  checkOutVisitor: (id: string) => apiClient.put(`/frontoffice/visitors/${id}/checkout`),
  
  // Call Logs
  getCallLogs: () => apiClient.get<CallLog[]>('/frontoffice/calls'),
  recordCall: (data: Partial<CallLog>) => apiClient.post<CallLog>('/frontoffice/calls', data),
  
  // Complaints
  getComplaints: () => apiClient.get<any[]>('/frontoffice/complaints'),
  recordComplaint: (data: any) => apiClient.post('/frontoffice/complaints', data)
};
