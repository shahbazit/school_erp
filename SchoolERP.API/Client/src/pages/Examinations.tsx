import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Save, CheckCircle2,
  AlertCircle, Loader2, Target, Printer, FileText, Search, BookOpen, Filter
} from 'lucide-react';
import { masterApi } from '../api/masterApi';
import apiClient from '../api/apiClient';
import { studentApi } from '../api/studentApi';
import { Student } from '../types';

interface ExamDto {
  id: string;
  examName: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface MarkEntryDto {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  obtainedMarks: number;
  grade: string;
  remarks: string;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700', 'bg-cyan-100 text-cyan-700',
  'bg-rose-100 text-rose-700', 'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700',
];

function avatarColor(code: string) {
  if (!code) return AVATAR_COLORS[0];
  return AVATAR_COLORS[code.charCodeAt(code.length - 1) % AVATAR_COLORS.length] || AVATAR_COLORS[0];
}

export default function Examinations() {
  const [activeTab, setActiveTab] = useState<'exams' | 'mark-entry' | 'marksheets'>('exams');
  
  // Masters
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // Shared Filters
  const [filterExamId, setFilterExamId] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [filterSectionId, setFilterSectionId] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');

  // Tab: Exams
  const [exams, setExams] = useState<ExamDto[]>([]);
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({ examName: '', academicYear: '2023-2024', startDate: '', endDate: '', status: 'Scheduled' });
  const [examsLoading, setExamsLoading] = useState(false);

  // Tab: Mark Entry Data
  const [records, setRecords] = useState<MarkEntryDto[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsSaving, setRecordsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Marksheets Tab State
  const [marksheetStudents, setMarksheetStudents] = useState<Student[]>([]);
  const [selectedStudentResults, setSelectedStudentResults] = useState<any[]>([]);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchExams();
    masterApi.getAll('classes').then(setClasses);
    masterApi.getAll('sections').then(setSections);
    masterApi.getAll('subjects').then(setSubjects);
  }, []);

  const fetchExams = async () => {
    try {
      setExamsLoading(true);
      const res = await apiClient.get<ExamDto[]>('/ExamManagement/exams');
      setExams(res.data);
    } catch {
      setError("Failed to fetch exams.");
    } finally {
      setExamsLoading(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/ExamManagement/exams', examForm);
      setShowExamModal(false);
      fetchExams();
    } catch {
      setError("Failed to create exam.");
    }
  };

  const loadMarkSheetgrid = useCallback(async () => {
    if (!filterExamId || !filterClassId || !filterSectionId || !filterSubjectId) return;
    setRecordsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await apiClient.get<MarkEntryDto[]>(`/ExamManagement/results/exam/${filterExamId}/class/${filterClassId}/section/${filterSectionId}/subject/${filterSubjectId}`);
      setRecords(res.data);
    } catch(err: any) {
      setError(err.response?.data?.message || "Failed fetching records.");
    } finally {
      setRecordsLoading(false);
    }
  }, [filterExamId, filterClassId, filterSectionId, filterSubjectId]);

  useEffect(() => {
    if (activeTab === 'mark-entry') {
      const t = setTimeout(() => loadMarkSheetgrid(), 300);
      return () => clearTimeout(t);
    }
  }, [loadMarkSheetgrid, activeTab]);

  const saveMarkSheet = async () => {
    setRecordsSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const payload = {
        examId: filterExamId,
        classId: filterClassId,
        sectionId: filterSectionId,
        subjectId: filterSubjectId,
        targetTotalMarks: 100,
        targetPassingMarks: 33,
        records: records.map(r => ({
           studentId: r.studentId,
           obtainedMarks: r.obtainedMarks,
           grade: r.grade || '',
           remarks: r.remarks || ''
        }))
      };

      await apiClient.post('/ExamManagement/results/mark', payload);
      setSuccess(true);
    } catch(err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setRecordsSaving(false);
    }
  };

  const updateRecord = (studentId: string, field: keyof MarkEntryDto, value: any) => {
    setRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, [field]: value } : r));
    setSuccess(false);
  };

  const loadStudentsForMarksheets = async () => {
    if (!filterClassId || !filterSectionId) return;
    try {
      setRecordsLoading(true);
      const res = await studentApi.getAll({ classId: filterClassId, sectionId: filterSectionId, pageSize: 100 });
      setMarksheetStudents(res.data);
    } catch {
      setError("Failed to load students.");
    } finally {
      setRecordsLoading(false);
    }
  };

  const fetchStudentReport = async (student: Student) => {
    setViewingStudent(student);
    setReportLoading(true);
    try {
      const res = await apiClient.get(`/ExamManagement/results/marksheet/student/${student.id}`);
      setSelectedStudentResults(res.data);
    } catch {
      setError("Failed to fetch report card.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-primary-600" />
            Examinations
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage tests and bulk result entries.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('exams')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'exams' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Exams List
          </button>
          <button onClick={() => setActiveTab('mark-entry')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'mark-entry' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Mark Entry
          </button>
          <button onClick={() => setActiveTab('marksheets')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'marksheets' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Report Cards
          </button>
        </div>
      </div>

      {(error || success) && (
        <div className={`flex items-center gap-2 p-3 border rounded-xl text-sm font-medium animate-in slide-in-from-top-2 ${success ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {success ? "Success! Operation completed successfully." : error}
        </div>
      )}

      {/* Tab 1: Config Exams */}
      {activeTab === 'exams' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
             <h3 className="font-bold text-slate-700">Exam Schedules</h3>
             <button onClick={() => setShowExamModal(true)} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium shadow-sm transition flex gap-2">
                <Plus className="h-4 w-4" /> New Exam
             </button>
          </div>
          <div className="p-4 overflow-auto custom-scrollbar">
            {examsLoading ? <p className="text-center text-slate-400 py-10">Loading exams...</p> : (
              <table className="w-full text-left border-collapse">
                <thead><tr className="border-b text-slate-500 text-[10px] uppercase font-bold tracking-widest"><th className="pb-3 pr-4">Exam Name</th><th className="pb-3 px-4">Session</th><th className="pb-3 px-4">Dates</th><th className="pb-3 pl-4">Status</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {exams.map(ex => (
                    <tr key={ex.id} className="hover:bg-slate-50/50">
                      <td className="py-4 pr-4 font-bold text-slate-800">{ex.examName}</td>
                      <td className="py-4 px-4 text-slate-600 font-mono text-xs">{ex.academicYear}</td>
                      <td className="py-4 px-4 text-xs text-slate-500">{new Date(ex.startDate).toLocaleDateString()} - {new Date(ex.endDate).toLocaleDateString()}</td>
                      <td className="py-4 pl-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          ex.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {ex.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {exams.length === 0 && (
                    <tr><td colSpan={4} className="py-10 text-center text-slate-400">No exams configured yet.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Mark Entry */}
      {activeTab === 'mark-entry' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-4">
            <select value={filterExamId} onChange={e => setFilterExamId(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-300">
              <option value="">-- Exam Setup --</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.examName}</option>)}
            </select>
            <select value={filterClassId} onChange={e => setFilterClassId(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-300">
              <option value="">-- Class --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filterSectionId} onChange={e => setFilterSectionId(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-300">
              <option value="">-- Section --</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={filterSubjectId} onChange={e => setFilterSubjectId(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-300">
              <option value="">-- Subject --</option>
              {subjects.map(su => <option key={su.id} value={su.id}>{su.name}</option>)}
            </select>
            
            <div className="ml-auto">
              <button 
                onClick={saveMarkSheet} 
                disabled={recordsSaving || records.length === 0} 
                className="btn-primary px-6 shadow-md shadow-primary-500/20 flex items-center gap-2"
              >
                {recordsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Marks
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto p-4 custom-scrollbar">
            {recordsLoading ? (
              <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-3">
                 <Loader2 className="h-6 w-6 animate-spin text-primary-500" /> Mapping Marksheet Topology...
              </div>
            ) : (!filterExamId || !filterClassId || !filterSectionId || !filterSubjectId) ? (
              <div className="flex flex-col items-center justify-center p-20 text-slate-400 text-center gap-4">
                <Target className="h-12 w-12 opacity-20 text-primary-500" />
                <p className="max-w-xs font-medium">Please select Exam, Class, Section, and Subject to begin mark entry.</p>
              </div>
            ) : records.length === 0 ? (
               <div className="text-center p-20 text-slate-400">No student enrollments found for this selection.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-[10px] uppercase font-bold text-slate-500 tracking-widest whitespace-nowrap">
                    <th className="px-4 py-3 bg-slate-50 sticky left-0 z-10">Candidate</th>
                    <th className="px-4 py-3">Obtained (Out of 100)</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3 w-full">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map(r => (
                    <tr key={r.studentId} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3 bg-white sticky left-0 group-hover:bg-slate-50 transition-colors">
                         <div className="flex items-center gap-3 w-max">
                           <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border border-white shadow-sm ${avatarColor(r.admissionNo)}`}>
                             {getInitials(r.studentName)}
                           </div>
                           <div>
                             <p className="text-sm font-bold text-slate-800">{r.studentName}</p>
                             <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{r.admissionNo}</p>
                           </div>
                         </div>
                      </td>
                      <td className="px-4 py-3">
                         <input type="number" min="0" max="100" step="0.5" value={r.obtainedMarks} onChange={(e) => updateRecord(r.studentId, 'obtainedMarks', parseFloat(e.target.value) || 0)} className="w-24 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all text-center" />
                      </td>
                      <td className="px-4 py-3">
                         <input type="text" maxLength={2} value={r.grade || ''} onChange={(e) => updateRecord(r.studentId, 'grade', e.target.value.toUpperCase())} className="w-16 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all text-center uppercase" placeholder="A+" />
                      </td>
                      <td className="px-4 py-3">
                         <input type="text" value={r.remarks || ''} onChange={(e) => updateRecord(r.studentId, 'remarks', e.target.value)} className="w-full min-w-[200px] px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all" placeholder="Add specific feedback..." />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Report Cards */}
      {activeTab === 'marksheets' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
            <select value={filterClassId} onChange={e => setFilterClassId(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-300 min-w-[150px]">
              <option value="">-- Select Class --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filterSectionId} onChange={e => setFilterSectionId(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-300 min-w-[150px]">
              <option value="">-- Select Section --</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button onClick={loadStudentsForMarksheets} className="btn-secondary py-2 px-6 flex items-center gap-2">
               <Filter className="h-4 w-4" /> Load Students
            </button>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest uppercase">
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Adm No.</th>
                    <th className="px-6 py-4 text-right">Result Reports</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recordsLoading ? (
                    <tr><td colSpan={3} className="px-6 py-20 text-center text-slate-400">Searching records...</td></tr>
                  ) : marksheetStudents.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-20 text-center text-slate-400">Apply class and section filters to list students.</td></tr>
                  ) : (
                    marksheetStudents.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{s.firstName} {s.lastName}</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500 uppercase">{s.admissionNo}</td>
                        <td className="px-6 py-4 text-right">
                           <button onClick={() => fetchStudentReport(s)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl text-xs font-bold transition-all">
                              <FileText className="h-4 w-4" /> View Report Card
                           </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Exam Modal */}
      {showExamModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
               <div className="p-4 border-b bg-slate-50 border-slate-100 font-bold text-slate-800">Add New Examination</div>
               <form onSubmit={handleCreateExam} className="p-5 space-y-4">
                  <div><label className="text-xs font-semibold text-slate-500 uppercase">Exam Name</label><input required value={examForm.examName} onChange={e => setExamForm({...examForm, examName: e.target.value})} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm" placeholder="e.g. Annual Exams 2024" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Start Date</label><input required type="date" value={examForm.startDate} onChange={e => setExamForm({...examForm, startDate: e.target.value})} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm" /></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">End Date</label><input required type="date" value={examForm.endDate} onChange={e => setExamForm({...examForm, endDate: e.target.value})} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm" /></div>
                  </div>
                  <div><label className="text-xs font-semibold text-slate-500 uppercase">Academic Year</label><input required value={examForm.academicYear} onChange={e => setExamForm({...examForm, academicYear: e.target.value})} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm" placeholder="2024-2025" /></div>
                  
                  <div className="pt-4 flex justify-end gap-2">
                     <button type="button" onClick={() => setShowExamModal(false)} className="px-4 py-2 font-bold text-slate-500 text-sm hover:bg-slate-50 rounded-lg">Cancel</button>
                     <button type="submit" className="btn-primary px-6">Create Exam</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Report Card Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
               <div>
                  <h3 className="text-xl font-bold text-slate-800">Progress Report Card</h3>
                  <p className="text-sm text-slate-500">Student: <span className="font-semibold text-slate-700">{viewingStudent.firstName} {viewingStudent.lastName}</span></p>
               </div>
               <button onClick={() => setViewingStudent(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                  <Plus className="h-5 w-5 rotate-45" />
               </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
               {reportLoading ? (
                 <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" /> Generating Marksheet...
                 </div>
               ) : selectedStudentResults.length === 0 ? (
                 <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
                    <AlertCircle className="h-10 w-10 opacity-20" />
                    <p>No published exam results found for this candidate.</p>
                 </div>
               ) : (
                 <div className="space-y-8">
                    {Array.from(new Set(selectedStudentResults.map(r => r.examName))).map(examName => {
                      const examResults = selectedStudentResults.filter(r => r.examName === examName);
                      return (
                        <div key={examName} className="space-y-3">
                           <div className="flex items-center gap-2 border-b-2 border-primary-100 pb-1">
                              <BookOpen className="h-4 w-4 text-primary-600" />
                              <h4 className="font-bold text-slate-800 tracking-tight">{examName} <span className="text-slate-400 text-xs font-medium ml-2">({examResults[0].academicYear})</span></h4>
                           </div>
                           <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                              <table className="w-full text-left text-sm">
                                 <thead className="bg-white/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                       <th className="px-5 py-3">Subject Name</th>
                                       <th className="px-5 py-3">Score Details</th>
                                       <th className="px-5 py-3 text-center">Grade</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100">
                                    {examResults.map((r, i) => (
                                       <tr key={i} className="hover:bg-white/50">
                                          <td className="px-5 py-4 font-bold text-slate-700">{r.subjectName} <span className="text-[9px] text-slate-400 block font-normal tracking-wide">{r.subjectCode}</span></td>
                                          <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                                             <span className="font-bold text-slate-800">{r.obtainedMarks}</span> / {r.totalMarks}
                                             <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2 overflow-hidden max-w-[100px]">
                                                <div className="h-full bg-primary-500" style={{ width: `${(r.obtainedMarks / r.totalMarks) * 100}%` }}></div>
                                             </div>
                                          </td>
                                          <td className="px-5 py-4 text-center">
                                             <span className="inline-flex px-3 py-1 bg-white border-2 border-primary-50 rounded-xl font-bold text-primary-700 text-xs shadow-sm">{r.grade || 'NA'}</span>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                      );
                    })}
                 </div>
               )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 shrink-0">
               <button onClick={() => window.print()} className="btn-secondary px-6 flex items-center gap-2 text-sm">
                  <Printer className="h-4 w-4" /> Print Marksheet
               </button>
               <button onClick={() => setViewingStudent(null)} className="btn-primary px-8 text-sm">
                  Close Preview
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
