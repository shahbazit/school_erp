import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Trash2, Download } from 'lucide-react';
import { Student } from '../types';
import apiClient, { API_URL } from '../api/apiClient';
const BASE_URL = API_URL.replace('/api', '');

interface StudentDocumentDto {
  id: string;
  studentId: string;
  documentType: string;
  documentName: string;
  documentUrl: string;
  createdAt: string;
}

interface StudentDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export default function StudentDocumentsModal({ isOpen, onClose, student }: StudentDocumentsModalProps) {
  const [documents, setDocuments] = useState<StudentDocumentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [docType, setDocType] = useState('Aadhar Card');
  const [docName, setDocName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = ['Aadhar Card', 'Birth Certificate', 'Transfer Certificate', 'Previous Marksheet', 'Medical Record', 'Other'];

  useEffect(() => {
    if (isOpen && student?.id) {
      fetchDocuments();
      setDocName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen, student]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<StudentDocumentDto[]>(`/StudentDocument/student/${student?.id}`);
      setDocuments(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student?.id || !fileInputRef.current?.files?.[0]) return;
    if (!docName.trim()) {
      setError("Document name is required");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append('StudentId', student.id);
      formData.append('DocumentType', docType);
      formData.append('DocumentName', docName);
      formData.append('File', file);

      await apiClient.post('/StudentDocument', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await fetchDocuments();
      setDocName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await apiClient.delete(`/StudentDocument/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              Student Documents
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Manage files for {student.firstName} {student.lastName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Upload Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-4 border-b pb-2">Upload New Document</h3>
            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5 lg:col-span-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Doc Type</label>
                <select value={docType} onChange={e => setDocType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/30">
                  {documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 lg:col-span-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Doc Name *</label>
                <input value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. 10th Marksheet"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/30" />
              </div>
              <div className="space-y-1.5 lg:col-span-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">File *</label>
                <input type="file" ref={fileInputRef} accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-primary-50 file:text-primary-700 cursor-pointer" />
              </div>
              <div className="lg:col-span-1">
                <button type="submit" disabled={uploading}
                  className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>

          {/* Document List */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 border-b pb-2">Existing Documents</h3>
            {loading ? (
              <p className="text-sm text-slate-500 py-4 text-center">Loading documents...</p>
            ) : documents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-start justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow group">
                    <div className="flex items-start gap-3 overflow-hidden">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate" title={doc.documentName}>{doc.documentName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{doc.documentType}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-2">
                      <a href={`${BASE_URL}${doc.documentUrl}`} target="_blank" rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors" title="View / Download">
                        <Download className="h-4 w-4" />
                      </a>
                      <button onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
