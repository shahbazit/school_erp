import apiClient from './apiClient';
import { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest, GenerateOtpRequest, VerifyOtpRequest } from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh-token', data);
    return response.data;
  },

  generateOtp: async (data: GenerateOtpRequest): Promise<{message: string}> => {
    const response = await apiClient.post<{message: string}>('/auth/generate-otp', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', data);
    return response.data;
  },

  registerStepOne: async (data: any): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register-step-1', data);
    return response.data;
  },

  finalizeRegistration: async (data: any): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/finalize-registration', data);
    return response.data;
  },

  forgotPassword: async (data: { email: string }): Promise<{message: string}> => {
    const response = await apiClient.post<{message: string}>('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: any): Promise<{message: string}> => {
    const response = await apiClient.post<{message: string}>('/auth/reset-password', data);
    return response.data;
  }
};
