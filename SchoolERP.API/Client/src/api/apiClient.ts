import axios from 'axios';
import { toast } from 'react-toastify';

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
    
    const isAuthRoute = config.url?.includes('/auth/') || config.url?.endsWith('/auth');
    
    if (token && !isAuthRoute) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Skip X-Organization-Id header for authentication requests
    if (organizationId && !isAuthRoute) {
      config.headers['X-Organization-Id'] = organizationId;
    }

    // --- Server Compatibility Hack: Map PUT/DELETE/PATCH to POST ---
    const method = config.method?.toLowerCase();
    if (method === 'put' || method === 'delete' || method === 'patch') {
      const suffix = method === 'delete' ? '/delete' : '/update';
      config.method = 'post';

      if (config.url) {
        // Handle URLs with query parameters correctly
        const [path, query] = config.url.split('?');
        const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
        
        if (!normalizedPath.endsWith(suffix)) {
          config.url = normalizedPath + suffix + (query ? '?' + query : '');
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle session expiration and global errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const message = (typeof data === 'object' ? (data?.message || data?.Message) : data) || 'Server error occurred.';

      const isOrgError = status === 404 && (
        message?.toString().trim().toLowerCase() === 'organization not found.' || 
        message?.toString().trim().toLowerCase() === 'organization not found'
      );

      if (status === 401 || isOrgError) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('organizationId');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/portal') {
          console.warn('Session context lost, redirecting to portal...');
          window.location.href = '/portal';
        }
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.', { toastId: 'unauthorized-error' });
      } else if (status >= 400) {
        // Use message as toastId to deduplicate identical errors (like "Server error occurred")
        toast.error(message, { toastId: message });
      }
    } else {
      toast.error('Network error. Please check your connection.', { toastId: 'network-error' });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
