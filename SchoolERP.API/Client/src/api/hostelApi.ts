import apiClient from './apiClient';

export interface Hostel {
  id: string;
  name: string;
  type: string;
  wardenName?: string;
  wardenPhone?: string;
  address?: string;
  isActive: boolean;
  roomCount: number;
  totalCapacity: number;
  currentOccupancy: number;
}

export interface HostelRoom {
  id: string;
  hostelId: string;
  hostelName?: string;
  roomNo: string;
  roomType?: string;
  capacity: number;
  costPerMonth: number;
  isActive: boolean;
  currentOccupancy: number;
}

export interface HostelAssignment {
  id: string;
  studentId: string;
  studentName: string;
  employeeId?: string;
  employeeName?: string;
  roomId: string;
  roomNo: string;
  hostelName: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export const hostelApi = {
  // Hostels
  getHostels: () => apiClient.get<Hostel[]>('/hostel'),
  createHostel: (data: Partial<Hostel>) => apiClient.post<Hostel>('/hostel', data),
  updateHostel: (id: string, data: Partial<Hostel>) => apiClient.put<Hostel>(`/hostel/${id}`, data),
  deleteHostel: (id: string) => apiClient.delete(`/hostel/${id}`),

  // Rooms
  getRooms: () => apiClient.get<HostelRoom[]>('/hostel/rooms'),
  getRoomsByHostel: (hostelId: string) => apiClient.get<HostelRoom[]>(`/hostel/rooms/by-hostel/${hostelId}`),
  createRoom: (data: Partial<HostelRoom>) => apiClient.post<HostelRoom>('/hostel/rooms', data),
  updateRoom: (id: string, data: Partial<HostelRoom>) => apiClient.put<HostelRoom>(`/hostel/rooms/${id}`, data),
  deleteRoom: (id: string) => apiClient.delete(`/hostel/rooms/${id}`),

  // Assignments
  getAssignments: () => apiClient.get<HostelAssignment[]>('/hostel/assignments'),
  assignRoom: (data: { studentId: string; roomId: string; startDate: string; endDate?: string }) => 
    apiClient.post<HostelAssignment>('/hostel/assignments', data),
  removeAssignment: (id: string) => apiClient.delete(`/hostel/assignments/${id}`),
};
