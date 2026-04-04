import apiClient from './apiClient';

export interface TransportVehicle {
  id: string;
  vehicleNo: string;
  vehicleModel: string;
  fuelType?: string;
  capacity: number;
  registrationDetails?: string;
  chasisNo?: string;
  driverName?: string;
  driverPhone?: string;
  isActive: boolean;
}

export interface TransportRoute {
  id: string;
  routeName: string;
  vehicleId?: string;
  vehicleNo?: string;
  driverName?: string;
  routeCost: number;
  isActive: boolean;
  userCount: number;
}

export interface TransportAssignment {
  id: string;
  studentId: string;
  studentName: string;
  employeeId?: string;
  employeeName?: string;
  routeId: string;
  routeName: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface TransportStoppage {
  id: string;
  name: string;
  cost: number;
  isActive: boolean;
}

export const transportApi = {
  // Vehicles
  getVehicles: () => apiClient.get<TransportVehicle[]>('/transport/vehicles'),
  createVehicle: (data: Partial<TransportVehicle>) => apiClient.post<TransportVehicle>('/transport/vehicles', data),
  updateVehicle: (id: string, data: Partial<TransportVehicle>) => apiClient.post<TransportVehicle>(`/transport/vehicles/${id}/update`, data),
  deleteVehicle: (id: string) => apiClient.post(`/transport/vehicles/${id}/delete`),

  // Routes
  getRoutes: () => apiClient.get<TransportRoute[]>('/transport/routes'),
  createRoute: (data: Partial<TransportRoute>) => apiClient.post<TransportRoute>('/transport/routes', data),
  updateRoute: (id: string, data: Partial<TransportRoute>) => apiClient.post<TransportRoute>(`/transport/routes/${id}/update`, data),
  deleteRoute: (id: string) => apiClient.post(`/transport/routes/${id}/delete`),

  // Stoppages
  getStoppages: () => apiClient.get<TransportStoppage[]>('/transport/stoppages'),
  createStoppage: (data: Partial<TransportStoppage>) => apiClient.post<TransportStoppage>('/transport/stoppages', data),
  updateStoppage: (id: string, data: Partial<TransportStoppage>) => apiClient.post<TransportStoppage>(`/transport/stoppages/${id}/update`, data),
  deleteStoppage: (id: string) => apiClient.post(`/transport/stoppages/${id}/delete`),

  // Assignments
  getAssignments: () => apiClient.get<TransportAssignment[]>('/transport/assignments'),
  assignTransport: (data: { studentId: string; routeId: string; startDate: string; endDate?: string }) => 
    apiClient.post<TransportAssignment>('/transport/assignments', data),
  removeAssignment: (id: string) => apiClient.post(`/transport/assignments/${id}/delete`),
};

