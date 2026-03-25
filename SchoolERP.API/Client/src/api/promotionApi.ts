import apiClient from './apiClient';

export interface PromoteStudentDto {
  studentId: string;
  isPromoted: boolean;
  newRollNumber?: string;
}

export interface BulkPromotionRequestDto {
  targetClassId: string;
  targetSectionId?: string;
  targetAcademicYear: string;
  students: PromoteStudentDto[];
}

export const promotionApi = {
  bulkPromote: async (data: BulkPromotionRequestDto): Promise<{ success: boolean; message: string; count: number }> => {
    const response = await apiClient.post('/promotion/bulk', data);
    return response.data;
  }
};
