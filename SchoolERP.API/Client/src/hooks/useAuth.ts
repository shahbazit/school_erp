import { useState } from 'react';
import { authApi } from '../api/authApi';
import { LoginRequest, RegisterRequest } from '../types';

// Extracts a human-readable error message from any ASP.NET Core / Axios error
const extractError = (err: any, fallback: string): string => {
  const data = err?.response?.data;
  if (!data) return fallback;

  // 1. Custom array: { "Errors": ["msg"] }
  if (Array.isArray(data.Errors) && data.Errors.length > 0) return data.Errors[0];

  // 2. Lowercase array: { "errors": ["msg"] }
  if (Array.isArray(data.errors) && data.errors.length > 0) return data.errors[0];

  // 3. ASP.NET validation object: { "errors": { "Field": ["msg"] } }
  if (data.errors && typeof data.errors === 'object') {
    const firstKey = Object.keys(data.errors)[0];
    const firstMessages = data.errors[firstKey];
    if (Array.isArray(firstMessages) && firstMessages.length > 0) return firstMessages[0];
  }

  // 4. Simple message or title (Problem Details)
  if (typeof data.message === 'string') return data.message;
  if (typeof data.title === 'string') return data.title;

  return fallback;
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        
        // Decode organizationId from token
        try {
          const base64Url = response.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          if (payload.OrganizationId) {
            localStorage.setItem('organizationId', payload.OrganizationId);
          }
        } catch (e) { console.error("Could not decode orgId", e); }

        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        return true;
      }
      return false;
    } catch (err: any) {
      setError(extractError(err, 'Login failed. Please check your credentials.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest, organizationId: string) => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem('organizationId', organizationId);
      const response = await authApi.register(data);
      return response.success;
    } catch (err: any) {
      setError(extractError(err, 'Registration failed. Please try again.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateOtp = async (mobileNumber: string, organizationId: string) => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem('organizationId', organizationId);
      await authApi.generateOtp({ mobileNumber });
      return true;
    } catch (err: any) {
      setError(extractError(err, 'Failed to send OTP.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (mobileNumber: string, otp: string, organizationId: string) => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem('organizationId', organizationId);
      const response = await authApi.verifyOtp({ mobileNumber, otp });
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        return true;
      }
      return false;
    } catch (err: any) {
      setError(extractError(err, 'OTP verification failed. Please try again.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerStepOne = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.registerStepOne(data);
      return response;
    } catch (err: any) {
      setError(extractError(err, 'Step 1 failed. Please try again.'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const finalizeRegistration = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.finalizeRegistration(data);
      if (response.token) {
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        return true;
      }
      return false;
    } catch (err: any) {
      setError(extractError(err, 'Could not complete registration. Please check your OTP and try again.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('organizationId');
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword({ email });
      return true;
    } catch (err: any) {
      setError(extractError(err, 'Could not process forgot password request.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(data);
      return true;
    } catch (err: any) {
      setError(extractError(err, 'Password reset failed. Please check your token or link.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, register, generateOtp, verifyOtp, registerStepOne, finalizeRegistration, logout, forgotPassword, resetPassword, loading, error };
};
