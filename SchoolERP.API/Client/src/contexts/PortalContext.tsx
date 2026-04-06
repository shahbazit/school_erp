import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { studentPortalApi, LinkedStudent } from '../api/studentPortalApi';

interface PortalContextType {
  linkedWards: LinkedStudent[];
  selectedWard: LinkedStudent | null;
  selectWard: (id: string) => void;
  loading: boolean;
  refreshWards: () => Promise<void>;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) throw new Error('usePortal must be used within a PortalProvider');
  return context;
};

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [linkedWards, setLinkedWards] = useState<LinkedStudent[]>([]);
  const [selectedWard, setSelectedWard] = useState<LinkedStudent | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const decodedToken = token ? (function(t) {
    try {
      const base64Url = t.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) { return null; }
  })(token) : null;

  const currentRole = (decodedToken?.Role || decodedToken?.role || decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 'Guest').toString();
  const isPortalUser = ['student', 'parent', 'portal'].includes(currentRole.toLowerCase());

  const refreshWards = useCallback(async () => {
    if (!isPortalUser || !token) {
      setLinkedWards([]);
      setSelectedWard(null);
      return;
    }

    setLoading(true);
    try {
      const wards = await studentPortalApi.getLinkedStudents();
      setLinkedWards(wards);
      
      // Try to restore from localStorage or pick first
      const storedId = localStorage.getItem('last_selected_ward_id');
      const found = wards.find(w => w.id === storedId);
      if (found) {
        setSelectedWard(found);
      } else if (wards.length > 0) {
        setSelectedWard(wards[0]);
        localStorage.setItem('last_selected_ward_id', wards[0].id);
      }
    } catch (err) {
      console.error("PortalContext: Failed to fetch wards", err);
    } finally {
      setLoading(false);
    }
  }, [isPortalUser, token]);

  useEffect(() => {
    refreshWards();
  }, [refreshWards]);

  const selectWard = (id: string) => {
    const found = linkedWards.find(w => w.id === id);
    if (found) {
      setSelectedWard(found);
      localStorage.setItem('last_selected_ward_id', id);
    }
  };

  return (
    <PortalContext.Provider value={{ linkedWards, selectedWard, selectWard, loading, refreshWards }}>
      {children}
    </PortalContext.Provider>
  );
};
