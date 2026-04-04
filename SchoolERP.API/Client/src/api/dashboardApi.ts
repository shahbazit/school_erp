import apiClient from './apiClient';

export const dashboardApi = {
    getAdminSummary: async () => {
        const response = await apiClient.get('/dashboard/admin/summary');
        return response.data;
    },
    getTeacherSummary: async (employeeId?: string) => {
        const response = await apiClient.get('/dashboard/teacher/summary', { params: { employeeId } });
        return response.data;
    }
};

export const homeworkApi = {
    getAll: async (params?: { classId?: string; sectionId?: string; date?: string }) => {
        const response = await apiClient.get('/homework', { params });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await apiClient.get(`/homework/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await apiClient.post('/homework', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await apiClient.post(`/homework/${id}/update`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await apiClient.post(`/homework/${id}/delete`);
        return response.data;
    }
};
