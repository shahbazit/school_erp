import apiClient from './apiClient';

export interface LinkedStudent {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
  studentPhoto?: string;
  gender: string;
  dateOfBirth?: string;
  class: string;
  section: string;
  classId: string;
  sectionId: string;
  academicYear: string;
  rollNumber: string;
}

export interface StudentSummary {
  studentName: string;
  admissionNo: string;
  className: string;
  outstandingFees: number;
  paidFees: number;
  attendancePresentThisMonth: number;
  attendanceTotalThisMonth: number;
  homeworkToday: number;
  lastTransactionDate?: string;
}

export interface AttendanceRecord {
  attendanceDate: string;
  status: string;
  remarks?: string;
}

export interface FeeTransaction {
  transactionDate: string;
  amount: number;
  paymentMethod: string;
  status: string;
  note?: string;
}

export interface FeeSummary {
  transactions: FeeTransaction[];
  summary: {
    totalAllocated: number;
    totalPaid: number;
    totalDiscount: number;
    balance: number;
  };
}

export const studentPortalApi = {
  getLinkedStudents: () => apiClient.get<LinkedStudent[]>('/portal/students').then(r => r.data),
  getStudentSummary: (id: string) => apiClient.get<StudentSummary>(`/portal/student/${id}/summary`).then(r => r.data),
  getStudentAttendance: (id: string, month: number, year: number) => 
    apiClient.get<AttendanceRecord[]>(`/portal/student/${id}/attendance`, { params: { month, year } }).then(r => r.data),
  getStudentFees: (id: string) => apiClient.get<FeeSummary>(`/portal/student/${id}/fees`).then(r => r.data),
};
