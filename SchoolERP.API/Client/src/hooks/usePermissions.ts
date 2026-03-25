import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

export function usePermissions(roleId?: string) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPermissions = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get<string[]>(`/permission/role/${id}`);
      setPermissions(response.data);
    } catch (err) {
      console.error('Failed to fetch permissions', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<string[]>('/permission/my');
      setPermissions(response.data);
    } catch (err) {
      console.error('Failed to fetch my permissions', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (roleId) {
      fetchPermissions(roleId);
    }
  }, [roleId, fetchPermissions]);

  const hasPermission = useCallback((menuKey: string) => {
    return permissions.includes(menuKey);
  }, [permissions]);

  const updatePermissions = async (roleId: string, menuKeys: string[]) => {
    try {
      await apiClient.post('/permission/update', { roleId, menuKeys });
      return true;
    } catch (err) {
      console.error('Failed to update permissions', err);
      return false;
    }
  };

  return { permissions, loading, fetchPermissions, fetchMyPermissions, hasPermission, updatePermissions };
}
