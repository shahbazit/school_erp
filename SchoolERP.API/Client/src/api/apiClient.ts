import axios from 'axios';

// Get base URL from env or fallback to local backend port
// Get base URL from env or fallback to local backend port
export const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to append tokens and organization IDs
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const organizationId = localStorage.getItem('organizationId');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add organization ID header if present
    if (organizationId) {
      config.headers['X-Organization-Id'] = organizationId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle session expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      // If we are already on login/landing, don't redirect again
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
