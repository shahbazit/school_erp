import apiClient from './apiClient';

export interface CalendarEvent {
  id: string;
  date: string;
  name: string;
  description?: string;
  category: number;
  isHolidayForStudents: boolean;
  isHolidayForStaff: boolean;
  academicYearId: string;
  endDate?: string;
  isAllClasses: boolean;
  targetClassIds: string[];
  targetClassNames: string[];
  isAllStaff: boolean;
  targetDepartmentIds: string[];
  targetDepartmentNames: string[];
}

export const calendarApi = {
  getCalendar: async (academicYearId: string) => {
    const response = await apiClient.get<CalendarEvent[]>(`/Calendar/${academicYearId}`);
    return response.data;
  },
  getEvent: async (id: string) => {
    const response = await apiClient.get<CalendarEvent>(`/Calendar/event/${id}`);
    return response.data;
  },
  upsertEvent: async (data: Partial<CalendarEvent>) => {
    const response = await apiClient.post<{ id: string }>('/Calendar', data);
    return response.data;
  },
  deleteEvent: async (id: string) => {
    await apiClient.post(`/Calendar/${id}/delete`);
  },
  setupWeeklyOffs: async (data: { 
    daysToOff: number[], 
    saturdaysToOff: number[],
    academicYearId: string, 
    isHolidayForStudents: boolean, 
    isHolidayForStaff: boolean 
  }) => {
    const response = await apiClient.post<{ count: number }>('/Calendar/setup-weekly-offs', data);
    return response.data;
  },
  getSettings: async () => {
    const response = await apiClient.get<{ weeklyOffDays: number[], saturdayOffOccurrences: number[] }>('/Calendar/settings');
    return response.data;
  },
  updateSettings: async (data: { weeklyOffDays: number[], saturdayOffOccurrences: number[] }) => {
    await apiClient.post('/Calendar/settings', data);
  }
};
