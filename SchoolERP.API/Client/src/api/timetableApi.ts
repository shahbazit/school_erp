import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Interceptor to add auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface TimetableDetailDto {
  id?: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  periodNumber: number;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  subjectId?: string;
  subjectName?: string;
  subjectCode?: string;
  teacherId?: string;
  teacherName?: string;
  teacherCode?: string;
  isBreak: boolean;
  remarks?: string;
}

export interface TimetableDto {
  id: string;
  academicYearId: string;
  academicYearName: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  name: string;
  isActive: boolean;
  periods: TimetableDetailDto[];
}

export interface CreateTimetableDto {
  academicYearId: string;
  classId: string;
  sectionId: string;
  name: string;
  periods: TimetableDetailDto[];
}

export const timetableApi = {
  getTimetables: async (params?: { classId?: string; sectionId?: string; academicYearId?: string; onlyActive?: boolean }) => {
    const response = await api.get<TimetableDto[]>('/timetable', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get<TimetableDto>(`/timetable/${id}`);
    return response.data;
  },
  
  create: async (data: CreateTimetableDto) => {
    const response = await api.post<string>('/timetable', data);
    return response.data;
  },
  
  update: async (id: string, data: CreateTimetableDto) => {
    await api.post(`/timetable/${id}/update`, data);
  },
  
  delete: async (id: string) => {
    await api.post(`/timetable/${id}/delete`);
  },
  
  getTeacherSchedule: async (employeeId: string, academicYearId?: string) => {
    const response = await api.get<TimetableDetailDto[]>(`/timetable/teacher/${employeeId}`, { params: { academicYearId } });
    return response.data;
  }
};
