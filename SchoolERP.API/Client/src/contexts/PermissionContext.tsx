import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/apiClient';

interface PermissionItem {
  menuKey: string;
  canRead: boolean;
  canWrite: boolean;
}

interface PermissionContextType {
  permissions: PermissionItem[];
  loading: boolean;
  isAdmin: boolean;
  hasReadPermission: (menuKey: string) => boolean;
  hasWritePermission: (menuKey: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = useMemo(() => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const decodedToken = JSON.parse(jsonPayload);
      const role = decodedToken?.Role || decodedToken?.role || decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 'Guest';
      const roleArray = Array.isArray(role) ? role : [role];
      return roleArray.some((r: any) => r.toString().toLowerCase() === 'admin');
    } catch (e) { return false; }
  }, []);

  const refreshPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<any>('/permission/my');
      const perms = Array.isArray(response.data) ? response.data : (response.data.permissions || []);
      setPermissions(perms);
    } catch (err) {
      console.error('Failed to fetch my permissions', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) {
        refreshPermissions();
    }
  }, [refreshPermissions]);

  const hasReadPermission = useCallback((menuKey: string) => {
    if (isAdmin) return true;
    return permissions.some(p => p.menuKey === menuKey && p.canRead);
  }, [permissions, isAdmin]);

  const hasWritePermission = useCallback((menuKey: string) => {
    if (isAdmin) return true;
    return permissions.some(p => p.menuKey === menuKey && p.canWrite);
  }, [permissions, isAdmin]);

  return (
    <PermissionContext.Provider value={{ permissions, loading, isAdmin, hasReadPermission, hasWritePermission, refreshPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const useGlobalPermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('useGlobalPermissions must be used within a PermissionProvider');
  }
  return context;
};
