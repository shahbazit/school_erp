import { useState, useCallback } from 'react';
import { lookupApi } from '../api/masterApi';
import { Lookup, CreateLookupDto, LookupType } from '../types';

export const useLookups = (type?: LookupType) => {
  const [lookups, setLookups] = useState<Lookup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLookups = useCallback(async (customType?: LookupType) => {
    setLoading(true);
    setError(null);
    try {
      const data = await lookupApi.getAll(customType !== undefined ? customType : type);
      setLookups(data);
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Failed to fetch lookups');
    } finally {
      setLoading(false);
    }
  }, [type]);

  const addLookup = async (data: CreateLookupDto) => {
    setLoading(true);
    setError(null);
    try {
      const newLookup = await lookupApi.create(data);
      setLookups(prev => [...prev, newLookup]);
      return true;
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Failed to add lookup');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateLookup = async (id: string, data: CreateLookupDto) => {
    setLoading(true);
    setError(null);
    try {
      await lookupApi.update(id, data);
      setLookups(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
      return true;
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Failed to update lookup');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeLookup = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await lookupApi.delete(id);
      setLookups(prev => prev.filter(l => l.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Failed to delete lookup');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { lookups, loading, error, fetchLookups, addLookup, updateLookup, removeLookup };
};

export const useMasters = (endpoint: string) => {
  const [masters, setMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMasters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await masterApi.getAll(endpoint);
      setMasters(data);
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Failed to fetch masters');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const addMaster = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const newMaster = await masterApi.create(endpoint, data);
      setMasters(prev => [...prev, newMaster]);
      return true;
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Failed to add master');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateMaster = async (id: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      await masterApi.update(endpoint, id, data);
      setMasters(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
      return true;
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Failed to update master');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeMaster = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await masterApi.delete(endpoint, id);
      setMasters(prev => prev.filter(m => m.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Failed to delete master');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { masters, loading, error, fetchMasters, addMaster, updateMaster, removeMaster };
};

import { masterApi } from '../api/masterApi';
