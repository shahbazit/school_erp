import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/apiClient';
import { useGlobalPermissions } from '../contexts/PermissionContext';

export interface PermissionItem {
  menuKey: string;
  canRead: boolean;
  canWrite: boolean;
}

export function usePermissions(roleId?: string, isUserRef: boolean = false) {
  const global = useGlobalPermissions();
  const [localPermissions, setLocalPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPermissions = useCallback(async (id: string, isUser: boolean = false) => {
    setLoading(true);
    try {
      const endpoint = isUser ? `/permission/user/${id}` : `/permission/role/${id}`;
      const response = await apiClient.get<any>(endpoint);
      const perms = Array.isArray(response.data) ? response.data : (response.data.permissions || []);
      setLocalPermissions(perms);
    } catch (err) {
      console.error('Failed to fetch permissions', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (roleId) {
      fetchPermissions(roleId, isUserRef);
    }
  }, [roleId, isUserRef, fetchPermissions]);

  const hasReadPermission = useCallback((menuKey: string) => {
    if (roleId) {
      if (global.isAdmin) return true;
      return localPermissions.some(p => p.menuKey === menuKey && p.canRead);
    }
    return global.hasReadPermission(menuKey);
  }, [roleId, localPermissions, global]);

  const hasWritePermission = useCallback((menuKey: string) => {
    if (roleId) {
      if (global.isAdmin) return true;
      return localPermissions.some(p => p.menuKey === menuKey && p.canWrite);
    }
    return global.hasWritePermission(menuKey);
  }, [roleId, localPermissions, global]);

  const updatePermissionsBulk = async (updateDto: any) => {
    try {
      await apiClient.post('/permission/update', updateDto);
      // If we just updated permissions, we should probably trigger a global refresh
      global.refreshPermissions();
      return true;
    } catch (err) {
      console.error('Failed to update permissions', err);
      return false;
    }
  };

  if (!roleId) {
    return { 
        permissions: global.permissions, 
        loading: global.loading, 
        fetchPermissions, 
        fetchMyPermissions: global.refreshPermissions, 
        hasReadPermission: global.hasReadPermission, 
        hasWritePermission: global.hasWritePermission, 
        updatePermissionsBulk, 
        isAdmin: global.isAdmin 
    };
  }

  return { permissions: localPermissions, loading, fetchPermissions, fetchMyPermissions: global.refreshPermissions, hasReadPermission, hasWritePermission, updatePermissionsBulk, isAdmin: global.isAdmin };
}
