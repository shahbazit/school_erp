import { useState } from 'react';
import { authApi } from '../api/authApi';
import { LoginRequest, RegisterRequest } from '../types';
import { clearUserSession } from '../utils/storageUtils';
import { extractError } from '../utils/errorUtils';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);
      if (response.success && response.token) {
        clearUserSession(); // Clear session data while preserving preferences
        localStorage.setItem('token', response.token);
        
        // Decode organizationId from token
        try {
          const base64Url = response.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          const orgId = payload.OrganizationId || payload.organizationId || payload.orgId;
          if (orgId) {
            localStorage.setItem('organizationId', orgId);
          }
        } catch (e) { console.error("Could not decode orgId", e); }

        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        return { success: true, requiresPasswordChange: response.requiresPasswordChange };
      }
      return { success: false };
    } catch (err: any) {
      setError(extractError(err, 'Login failed. Please check your credentials.'));
      return { success: false };
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
        clearUserSession(); // Clear session data while preserving preferences
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
        clearUserSession(); // Clear session data while preserving preferences
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
    clearUserSession();
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
