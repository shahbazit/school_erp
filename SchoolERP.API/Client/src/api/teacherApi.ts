import apiClient from './apiClient';

export interface TeacherSubjectAssignmentDto {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  academicYearId: string;
  academicYearName: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface TeacherClassAssignmentDto {
  id: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  academicYearId: string;
  academicYearName: string;
  isClassTeacher: boolean;
  isActive: boolean;
}

export interface TeacherProfileDto {
  id: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  profilePhoto?: string;
  workEmail?: string;
  mobileNumber?: string;
  departmentName?: string;
  designationName?: string;
  isActive: boolean;
  highestQualification?: string;
  qualificationInstitution?: string;
  qualificationYear?: number;
  specializations?: string;
  previousExperienceYears?: number;
  previousSchools?: string;
  currentSchoolExperienceYears?: number;
  totalExperienceYears?: number;
  subjectAssignments: TeacherSubjectAssignmentDto[];
  classAssignments: TeacherClassAssignmentDto[];
}

export interface UpsertTeacherProfileDto {
  employeeId: string;
  highestQualification?: string;
  qualificationInstitution?: string;
  qualificationYear?: number;
  specializations?: string;
  previousExperienceYears?: number;
  previousSchools?: string;
}

export interface AssignSubjectDto {
  subjectId: string;
  academicYearId: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface AssignClassDto {
  classId: string;
  sectionId: string;
  academicYearId: string;
  isClassTeacher: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
}

export const teacherApi = {
  getAll: async (params: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    subjectId?: string;
    classId?: string;
    academicYearId?: string;
    minExperience?: number;
    maxExperience?: number;
  } = {}): Promise<PaginatedResponse<TeacherProfileDto>> => {
    const res = await apiClient.get<PaginatedResponse<TeacherProfileDto>>('/teacher', { params });
    return res.data;
  },

  getByEmployeeId: async (employeeId: string): Promise<TeacherProfileDto> => {
    const res = await apiClient.get<TeacherProfileDto>(`/teacher/${employeeId}`);
    return res.data;
  },

  upsert: async (data: UpsertTeacherProfileDto): Promise<TeacherProfileDto> => {
    const res = await apiClient.post<TeacherProfileDto>('/teacher', data);
    return res.data;
  },
  
  delete: async (employeeId: string): Promise<void> => {
    await apiClient.post(`/teacher/${employeeId}/delete-profile`);
  },

  assignSubject: async (employeeId: string, data: AssignSubjectDto): Promise<{ message: string; assignmentId: string }> => {
    const res = await apiClient.post(`/teacher/${employeeId}/subjects`, data);
    return res.data;
  },

  removeSubject: async (employeeId: string, assignmentId: string): Promise<void> => {
    await apiClient.post(`/teacher/${employeeId}/subjects/${assignmentId}/delete`);
  },

  assignClass: async (employeeId: string, data: AssignClassDto): Promise<{ message: string; assignmentId: string }> => {
    const res = await apiClient.post(`/teacher/${employeeId}/classes`, data);
    return res.data;
  },

  removeClass: async (employeeId: string, assignmentId: string): Promise<void> => {
    await apiClient.post(`/teacher/${employeeId}/classes/${assignmentId}/delete`);
  },

  setClassTeacher: async (employeeId: string, assignmentId: string, isClassTeacher: boolean): Promise<{ message: string }> => {
    const res = await apiClient.post(`/teacher/${employeeId}/classes/${assignmentId}/set-class-teacher`, null, {
      params: { isClassTeacher }
    });
    return res.data;
  }
};
