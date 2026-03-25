import { useState, useEffect, useCallback } from 'react';
import {
  Calendar, CheckCircle2, XCircle, Clock, Save, History,
  Loader2, AlertCircle, Search, GraduationCap
} from 'lucide-react';
import { masterApi } from '../api/masterApi';
import apiClient from '../api/apiClient';

interface StudentAttendanceDto {
  studentId: string;
  studentName: string;
  admissionNo: string;
  rollNumber: string;
  status: string;
  remarks: string;
}

const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
  'Present': { label: 'Present', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200', icon: <CheckCircle2 className="w-4 h-4" /> },
  'Absent': { label: 'Absent', color: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200', icon: <XCircle className="w-4 h-4" /> },
  'HalfDay': { label: 'Half Day', color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200', icon: <Clock className="w-4 h-4" /> },
  'Leave': { label: 'On Leave', color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200', icon: <Calendar className="w-4 h-4" /> },
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700', 'bg-cyan-100 text-cyan-700',
  'bg-rose-100 text-rose-700', 'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700',
];
function avatarColor(code: string) {
  return AVATAR_COLORS[code.charCodeAt(code.length - 1) % AVATAR_COLORS.length];
}

export default function StudentAttendance() {
  const [activeTab, setActiveTab] = useState<'mark' | 'report'>('mark');

  // Filter States
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  const [records, setRecords] = useState<StudentAttendanceDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      masterApi.getAll('classes'),
      masterApi.getAll('sections')
    ]).then(([cls, sec]) => {
      setClasses(cls);
      setSections(sec);
    }).catch(() => setError("Failed to load classes or sections."));
  }, []);

  const loadRecords = useCallback(async () => {
    if (!classId || !sectionId || !selectedDate) return;
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await apiClient.get<StudentAttendanceDto[]>(`/StudentAttendance/date/${selectedDate}/class/${classId}/section/${sectionId}`);
      setRecords(res.data);
    } catch {
      setError('Failed to load tracking data.');
    } finally {
      setIsLoading(false);
    }
  }, [classId, sectionId, selectedDate]);

  useEffect(() => {
    if (activeTab === 'mark') {
      const t = setTimeout(() => loadRecords(), 300);
      return () => clearTimeout(t);
    }
  }, [loadRecords, activeTab]);

  const handleStatusChange = (studentId: string, status: string) => {
    setRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
    setSuccess(false);
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, remarks } : r));
  };

  const markAll = (status: string) => {
    setRecords(prev => prev.map(r => ({ ...r, status })));
    setSuccess(false);
  };

  const saveAttendance = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        classId,
        sectionId,
        attendanceDate: selectedDate,
        records: records.map(r => ({
          studentId: r.studentId,
          status: r.status,
          remarks: r.remarks || ''
        }))
      };
      
      await apiClient.post('/StudentAttendance/mark', payload);
      
      setSuccess(true);
    } catch {
      setError('Failed to securely push updates to database. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRecords = records.filter(r => r.studentName.toLowerCase().includes(search.toLowerCase()) || r.admissionNo.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary-600" />
            Student Attendance
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage academic daily attendance limits securely.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('mark')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'mark' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Track Class
          </button>
          <button onClick={() => setActiveTab('report')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'report' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Student Summary
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> Academic records officially saved out!
          </div>
        </div>
      )}

      {/* Mark Attendance Tab */}
      {activeTab === 'mark' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          {/* Controls */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-4">
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} max={new Date().toISOString().split('T')[0]} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-300" />
            <select value={classId} onChange={e => setClassId(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-300">
              <option value="">-- Choose Class --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={sectionId} onChange={e => setSectionId(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-300">
              <option value="">-- Choose Section --</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            
            <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
            
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-300" />
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => markAll('Present')} disabled={records.length === 0} className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">P</button>
              <button onClick={() => markAll('Absent')} disabled={records.length === 0} className="px-3 py-2 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100">A</button>
              <button onClick={saveAttendance} disabled={isSaving || records.length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save State
              </button>
            </div>
          </div>

          {/* Records Table */}
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-3">
                 <Loader2 className="h-6 w-6 animate-spin text-primary-500" /> Getting layout logic ready...
              </div>
            ) : (!classId || !sectionId) ? (
              <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-2">
                <GraduationCap className="h-10 w-10 opacity-30 text-primary-500" />
                <p>Select a specific Class and Section above to map the array.</p>
              </div>
            ) : filteredRecords.length === 0 ? (
               <div className="text-center p-20 text-slate-400">No live students found matching this criteria.</div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Pupil</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest w-1/2">Markers</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map(record => (
                    <tr key={record.studentId} className="hover:bg-slate-50/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                           <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm border border-white ${avatarColor(record.admissionNo)}`}>
                             {getInitials(record.studentName)}
                           </div>
                           <div>
                             <p className="text-sm font-bold text-slate-800">{record.studentName}</p>
                             <p className="text-xs text-slate-400 font-mono mt-0.5">Adm: {record.admissionNo} • Roll: {record.rollNumber || '-'}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {['Present', 'Absent', 'HalfDay', 'Leave'].map(stat => (
                            <button
                              key={stat}
                              onClick={() => handleStatusChange(record.studentId, stat)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-all ${
                                record.status === stat 
                                  ? `${statusConfig[stat].color} ring-1 ring-offset-1 ring-${statusConfig[stat].color.split('-')[1]}-400 shadow-sm scale-105` 
                                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                }`}
                            >
                              {statusConfig[stat].icon} {statusConfig[stat].label}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <input
                          type="text"
                          placeholder="Optional notes..."
                          value={record.remarks || ''}
                          onChange={(e) => handleRemarkChange(record.studentId, e.target.value)}
                          className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Monthly Report Tab */}
      {activeTab === 'report' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px] p-6 text-center text-slate-400">
            <History className="h-12 w-12 mx-auto text-primary-200 mb-3 opacity-50" />
            <p className="font-semibold text-slate-500">Student Analytics Engine Ready</p>
            <p className="text-sm">Summary viewing module logic mirrors mapping standards internally.</p>
        </div>
      )}
    </div>
  );
}
