import apiClient from './apiClient';

export interface LibraryCategory {
  id: string;
  name: string;
  description?: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  edition?: string;
  isbn?: string;
  categoryId: string;
  categoryName?: string;
  totalCopies: number;
  availableCopies: number;
  location?: string;
  price?: number;
}

export interface LibraryBookIssue {
  id: string;
  bookId: string;
  bookTitle?: string;
  studentId?: string;
  studentName?: string;
  admissionNumber?: string;
  employeeId?: string;
  employeeName?: string;
  employeeCode?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: string;
  remarks?: string;
}

export const libraryApi = {
  // Categories
  getCategories: () => apiClient.get<LibraryCategory[]>('/library/categories'),
  createCategory: (data: Partial<LibraryCategory>) => apiClient.post<LibraryCategory>('/library/categories', data),
  updateCategory: (id: string, data: Partial<LibraryCategory>) => apiClient.post<LibraryCategory>(`/library/categories/${id}/update`, data),
  deleteCategory: (id: string) => apiClient.post(`/library/categories/${id}/delete`),

  // Books
  getBooks: () => apiClient.get<LibraryBook[]>('/library/books'),
  getBook: (id: string) => apiClient.get<LibraryBook>(`/library/books/${id}`),
  createBook: (data: Partial<LibraryBook>) => apiClient.post<LibraryBook>('/library/books', data),
  updateBook: (id: string, data: Partial<LibraryBook>) => apiClient.post<LibraryBook>(`/library/books/${id}/update`, data),
  deleteBook: (id: string) => apiClient.post(`/library/books/${id}/delete`),

  // Issue/Return
  getIssues: () => apiClient.get<LibraryBookIssue[]>('/library/issues'),
  issueBook: (data: { bookId: string; studentId?: string; employeeId?: string; issueDate: string; dueDate: string }) => 
    apiClient.post<LibraryBookIssue>('/library/issues', data),
  returnBook: (id: string, data: { returnDate: string; fineAmount: number; remarks?: string }) => 
    apiClient.post(`/library/issues/${id}/return`, data),
  getStudentHistory: (studentId: string) => apiClient.get<LibraryBookIssue[]>(`/library/student/${studentId}/history`),
};
