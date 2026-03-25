import { useEffect, useState } from 'react';
import { Users, GraduationCap, Check, AlertCircle, Search, Filter, ArrowRight } from 'lucide-react';
import { masterApi } from '../api/masterApi';
import { studentApi } from '../api/studentApi';
import { promotionApi, BulkPromotionRequestDto } from '../api/promotionApi';
import { Student } from '../types';

export default function StudentPromotion() {
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Masters
  const [classesList, setClassesList] = useState<any[]>([]);
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  const [academicYearsList, setAcademicYearsList] = useState<any[]>([]);

  // Source Filters
  const [sourceClassId, setSourceClassId] = useState('');
  const [sourceSectionId, setSourceSectionId] = useState('');
  const [sourceYear, setSourceYear] = useState('');

  // Target Selection
  const [targetClassId, setTargetClassId] = useState('');
  const [targetSectionId, setTargetSectionId] = useState('');
  const [targetYear, setTargetYear] = useState('');

  // Student Selection
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      masterApi.getAll('classes'),
      masterApi.getAll('sections'),
      masterApi.getAll('academic-years')
    ]).then(([cls, sec, years]) => {
      setClassesList(cls);
      setSectionsList(sec);
      setAcademicYearsList(years);
      
      const current = years.find((y: any) => y.isCurrent);
      if (current) {
        setSourceYear(current.name);
        // Find next year for target
        const next = years.find((y: any) => !y.isCurrent && y.name > current.name);
        if (next) setTargetYear(next.name);
      }
    }).catch(err => {
      console.error(err);
      setError('Failed to load master data.');
    });
  }, []);

  const handleFetchStudents = async () => {
    if (!sourceClassId || !sourceYear) {
      setError('Please select Source Class and Academic Year.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await studentApi.getAll({
        classId: sourceClassId,
        sectionId: sourceSectionId || undefined,
        academicYear: sourceYear,
        isActive: true, 
        pageSize: 1000 // Increase page size for promotion lists
      });
      
      const filtered = response.data;
      setStudents(filtered);
      setSelectedStudentIds(new Set(filtered.map(s => s.id as string)));
    } catch (err) {
      setError('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.size === students.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(students.map(s => s.id as string)));
    }
  };

  const toggleSelectStudent = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  const handlePromote = async () => {
    if (selectedStudentIds.size === 0) {
      setError('No students selected.');
      return;
    }
    if (!targetClassId || !targetYear) {
      setError('Please select Target Class and Academic Year.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const request: BulkPromotionRequestDto = {
        targetClassId,
        targetSectionId: targetSectionId || undefined,
        targetAcademicYear: targetYear,
        students: Array.from(selectedStudentIds).map(id => ({
          studentId: id,
          isPromoted: true // Simple implementation: all selected are promoted
        }))
      };

      const result = await promotionApi.bulkPromote(request);
      if (result.success) {
        setSuccess(result.message);
        setStudents([]);
        setSelectedStudentIds(new Set());
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Promotion failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary-600" />
            Student Promotion & Transfer
          </h1>
          <p className="text-sm text-slate-500 mt-1">Move students to new classes and academic sessions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Source Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary-500" />
              1. Source Selection
            </h2>
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Academic Year</label>
                <select 
                  value={sourceYear} 
                  onChange={(e) => setSourceYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                >
                  <option value="">Select Year</option>
                  {academicYearsList.map(y => <option key={y.id} value={y.name}>{y.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Class</label>
                  <select 
                    value={sourceClassId} 
                    onChange={(e) => setSourceClassId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white transition-all outline-none"
                  >
                    <option value="">Select</option>
                    {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Section</label>
                  <select 
                    value={sourceSectionId} 
                    onChange={(e) => setSourceSectionId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white transition-all outline-none"
                  >
                    <option value="">All Sections</option>
                    {sectionsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <button 
                onClick={handleFetchStudents}
                disabled={loading}
                className="w-full btn-secondary py-2.5 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Searching...' : <><Search className="h-4 w-4" /> Load Students</>}
              </button>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-emerald-500" />
              2. Target Destination
            </h2>
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Target Year</label>
                <select 
                  value={targetYear} 
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full bg-emerald-50/30 border border-emerald-200/50 rounded-xl px-4 py-2.5 text-sm focus:bg-white transition-all outline-none"
                >
                  <option value="">Select Year</option>
                  {academicYearsList.map(y => <option key={y.id} value={y.name}>{y.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Target Class</label>
                  <select 
                    value={targetClassId} 
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white transition-all outline-none"
                  >
                    <option value="">Select</option>
                    {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Target Section</label>
                  <select 
                    value={targetSectionId} 
                    onChange={(e) => setTargetSectionId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white transition-all outline-none"
                  >
                    <option value="">No Change / None</option>
                    {sectionsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={students.length > 0 && selectedStudentIds.size === students.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <h3 className="text-sm font-bold text-slate-700">Eligible Students ({students.length})</h3>
              </div>
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                {selectedStudentIds.size} Selected
              </span>
            </div>
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="bg-slate-50/80 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    <th className="px-6 py-3 w-10"></th>
                    <th className="px-6 py-3">Student Detail</th>
                    <th className="px-6 py-3">Roll No.</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No students loaded.</p>
                        <p className="text-slate-400 text-xs mt-1">Select source year and class to begin.</p>
                      </td>
                    </tr>
                  ) : (
                    students.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox" 
                            checked={selectedStudentIds.has(s.id as string)}
                            onChange={() => toggleSelectStudent(s.id as string)}
                            className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs mr-3 text-slate-600">
                              {s.firstName[0]}{s.lastName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{s.firstName} {s.lastName}</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{s.admissionNo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{s.rollNumber || '—'}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                            selectedStudentIds.has(s.id as string) 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-slate-50 text-slate-400 border border-slate-100'
                          }`}>
                            {selectedStudentIds.has(s.id as string) ? 'To Promote' : 'Stay'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50/80 border-t border-slate-100">
               {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="mb-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-600 text-sm animate-in slide-in-from-top-2">
                  <Check className="h-5 w-5 shrink-0 shadow-sm shadow-emerald-500/20" />
                  <p className="font-medium">{success}</p>
                </div>
              )}

              <button 
                onClick={handlePromote}
                disabled={isSubmitting || selectedStudentIds.size === 0}
                className="w-full btn-primary py-3 py-3 text-base shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Processing...' : (
                  <>
                    <Check className="h-5 w-5" />
                    Complete Bulk Promotion
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
