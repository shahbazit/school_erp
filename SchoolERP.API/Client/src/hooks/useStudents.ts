import { useState, useCallback } from 'react';
import { studentApi } from '../api/studentApi';
import { Student } from '../types';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentApi.getAll({});
      setStudents(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, []);

  const addStudent = async (student: any) => {
    setLoading(true);
    setError(null);
    try {
      const newStudent = await studentApi.create(student);
      setStudents(prev => [...prev, newStudent]);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to add student');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id: string, updatedStudent: any) => {
    setLoading(true);
    setError(null);
    try {
      const student = await studentApi.update(id, updatedStudent);
      setStudents(prev => prev.map(s => s.id === id ? student : s));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update student');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeStudent = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await studentApi.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete student');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    students, 
    loading, 
    error, 
    fetchStudents, 
    addStudent, 
    updateStudent, 
    removeStudent 
  };
};
