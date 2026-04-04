import apiClient from './apiClient';

export const subjectContentApi = {
    // Books
    getBooks: async (classId?: string, subjectId?: string) => {
        const response = await apiClient.get('/SubjectContent/books', { 
            params: { classId, subjectId } 
        });
        return response.data;
    },
    createBook: async (data: { academicClassId: string; subjectId: string; name: string; description?: string; coverImageUrl?: string }) => {
        const response = await apiClient.post('/SubjectContent/book', data);
        return response.data;
    },
    getBook: async (id: string) => {
        const response = await apiClient.get(`/SubjectContent/book/${id}`);
        return response.data;
    },
    deleteBook: async (id: string) => {
        const response = await apiClient.post(`/SubjectContent/book/delete/${id}`);
        return response.data;
    },

    // Chapters
    getChapters: async (bookId: string) => {
        const response = await apiClient.get(`/SubjectContent/chapters/${bookId}`);
        return response.data;
    },
    getChapterDetails: async (chapterId: string) => {
        const response = await apiClient.get(`/SubjectContent/chapter/${chapterId}`);
        return response.data;
    },
    createChapter: async (data: { subjectBookId: string; title: string; description?: string; orderIndex: number }) => {
        const response = await apiClient.post('/SubjectContent/chapter', data);
        return response.data;
    },
    deleteChapter: async (id: string) => {
        const response = await apiClient.post(`/SubjectContent/chapter/delete/${id}`);
        return response.data;
    },

    // Content
    addContent: async (data: { 
        chapterId: string; 
        contentType: number; 
        contentValue: string; 
        orderIndex: number; 
        pageNumber?: number 
    }) => {
        const response = await apiClient.post('/SubjectContent/content', data);
        return response.data;
    },
    deleteContent: async (id: string) => {
        const response = await apiClient.post(`/SubjectContent/content/delete/${id}`);
        return response.data;
    },

    // AI Features
    getChatHistory: async (chapterId: string) => {
        const response = await apiClient.get(`/SubjectContent/chat-history/${chapterId}`);
        return response.data;
    },
    clearChatHistory: async (chapterId: string) => {
        const response = await apiClient.post(`/SubjectContent/chat-history/clear/${chapterId}`);
        return response.data;
    },
    summarize: async (chapterId: string) => {
        const response = await apiClient.post(`/SubjectContent/summarize/${chapterId}`);
        return response.data;
    },
    askQuestion: async (data: { chapterId: string; question: string }) => {
        const response = await apiClient.post('/SubjectContent/ask', data);
        return response.data;
    },
    extractText: async (base64Image: string) => {
        const response = await apiClient.post('/SubjectContent/extract-text', base64Image, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    },
    generateQuiz: async (chapterId: string) => {
        const response = await apiClient.post(`/SubjectContent/generate-quiz/${chapterId}`);
        return response.data;
    },
    getStats: async () => {
        const response = await apiClient.get('/SubjectContent/stats');
        return response.data;
    },
    uploadCoverImage: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post('/SubjectContent/upload-cover', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
