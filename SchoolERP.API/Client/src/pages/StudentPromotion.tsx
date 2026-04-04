import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, Check, Search, Filter, ArrowRight, AlertTriangle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { masterApi } from '../api/masterApi';
import { studentApi } from '../api/studentApi';
import { promotionApi, BulkPromotionRequestDto } from '../api/promotionApi';
import { Student } from '../types';

export default function StudentPromotion(): React.ReactElement {
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
  const [studentActions, setStudentActions] = useState<Record<string, 'Promote' | 'Detain' | 'PassOut' | 'Withdraw'>>({});
  
  // Confirmation state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState<{ count: number, fromClass: string, fromYear: string, toClass: string, toYear: string } | null>(null);

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
      
      // Default all to 'Promote'
      const initialActions: Record<string, any> = {};
      filtered.forEach(s => {
        initialActions[s.id as string] = 'Promote';
      });
      setStudentActions(initialActions);
    } catch (err) {
      setError('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  const handleActionChange = (id: string, action: 'Promote' | 'Detain' | 'PassOut' | 'Withdraw') => {
    setStudentActions(prev => ({ ...prev, [id]: action }));
    // Automatically select if action is changed
    const next = new Set(selectedStudentIds);
    next.add(id);
    setSelectedStudentIds(next);
  };

  const setAllActions = (action: 'Promote' | 'Detain' | 'PassOut' | 'Withdraw') => {
    const next = { ...studentActions };
    selectedStudentIds.forEach(id => {
      next[id] = action;
    });
    setStudentActions(next);
  };

  const toggleSelectAll = () => {
    const activeStudents = students.filter(s => s.status === 'Active');
    if (selectedStudentIds.size === activeStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(activeStudents.map(s => s.id as string)));
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

    // Check if any 'Promote' or 'Detain' actions exist
    const needsTarget = Array.from(selectedStudentIds).some(id => 
      studentActions[id] === 'Promote'
    );

    if (needsTarget && (!targetClassId || !targetYear)) {
      const msg = 'Please select Target Class and Academic Year for continuing students.';
      setError(msg);
      toast.error(msg);
      return;
    }

    const sourceClass = classesList.find(c => c.id === sourceClassId)?.name || 'Selected Class';
    const targetClass = classesList.find(c => c.id === targetClassId)?.name || 'Target Class';
    
    setConfirmData({
      count: selectedStudentIds.size,
      fromClass: sourceClass,
      fromYear: sourceYear,
      toClass: targetClass,
      toYear: targetYear
    });
    setShowConfirm(true);
  };

  const executePromotion = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    setError(null);
    try {
      const request: BulkPromotionRequestDto = {
        targetClassId: targetClassId || undefined,
        targetSectionId: targetSectionId || undefined,
        targetAcademicYear: targetYear,
        students: Array.from(selectedStudentIds).map(id => {
          const s = students.find(std => std.id === id);
          return {
            studentId: id,
            action: studentActions[id],
            newRollNumber: s?.rollNumber
          };
        })
      };

      const result = await promotionApi.bulkPromote(request);
      if (result.success) {
        setSuccess(result.message);
        toast.success("Bulk promotion/transfer completed!");
        setStudents([]);
        setSelectedStudentIds(new Set());
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete promotion process");
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
                    <option value="">No Change / Keep Current</option>
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
                  checked={students.length > 0 && students.filter(s => s.status === 'Active').every(s => selectedStudentIds.has(s.id as string))}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <h3 className="text-sm font-bold text-slate-700">Student List ({students.length})</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Bulk Action:</span>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {(['Promote', 'Detain', 'PassOut', 'Withdraw'] as const).map(act => (
                    <button
                      key={act}
                      onClick={() => setAllActions(act)}
                      disabled={selectedStudentIds.size === 0}
                      className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all hover:bg-white hover:shadow-sm disabled:opacity-50"
                    >
                      {act}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full ml-2">
                  {selectedStudentIds.size} Selected
                </span>
              </div>
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
                            disabled={s.status !== 'Active'}
                            className={`w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500 ${s.status !== 'Active' ? 'opacity-30 cursor-not-allowed' : ''}`}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs mr-3 text-slate-600">
                              {s.firstName[0]}{s.lastName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{s.firstName} {s.lastName}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{s.admissionNo}</p>
                                {s.status !== 'Active' && (
                                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
                                    s.status === 'Promoted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    s.status === 'Detained' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}>
                                    {s.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{s.rollNumber || '—'}</td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={studentActions[s.id as string]}
                            onChange={(e) => handleActionChange(s.id as string, e.target.value as any)}
                            disabled={s.status !== 'Active'}
                            className={`text-[10px] font-bold uppercase px-2 py-1.5 rounded-md border outline-none transition-all ${
                              selectedStudentIds.has(s.id as string) 
                                ? studentActions[s.id as string] === 'Promote' ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : studentActions[s.id as string] === 'PassOut' ? 'bg-blue-50 text-blue-600 border-blue-200'
                                : studentActions[s.id as string] === 'Withdraw' ? 'bg-orange-50 text-orange-600 border-orange-200'
                                : 'bg-amber-50 text-amber-600 border-amber-200'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                          >
                            <option value="Promote">Promote</option>
                            <option value="Detain">Detain</option>
                            <option value="PassOut">Pass Out</option>
                            <option value="Withdraw">Withdraw</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-slate-50/80 border-t border-slate-100">
              {success ? (
                <div className="mb-6 p-8 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                  <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm ring-8 ring-emerald-50">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Process Completed!</h3>
                  <p className="text-slate-600 mt-1 max-w-xs">{success}</p>
                  <button 
                    onClick={() => setSuccess(null)}
                    className="mt-6 px-6 py-2 bg-white border border-emerald-200 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors shadow-sm"
                  >
                    Manage More Students
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handlePromote}
                  disabled={isSubmitting || selectedStudentIds.size === 0}
                  className="w-full btn-primary py-3.5 text-base shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                       <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Processing Bulk Action...
                    </div>
                  ) : (
                    <>
                      <GraduationCap className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      Complete Bulk Promotion / Transfer
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && confirmData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowConfirm(false)} />
          <div className="relative w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 animate-bounce cursor-default">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Confirm Promotion</h3>
                <p className="text-sm text-slate-500">Please review the promotion details carefully.</p>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Process Count</span>
                  <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">{confirmData.count} Students</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">From (Current)</p>
                    <p className="text-xs font-bold text-slate-700">{confirmData.fromClass}</p>
                    <p className="text-[10px] text-slate-500">{confirmData.fromYear}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">To (Next)</p>
                    <p className="text-xs font-bold text-emerald-600">{confirmData.toClass}</p>
                    <p className="text-[10px] text-emerald-500">{confirmData.toYear}</p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-medium px-4">
                This action will update academic records and cannot be undone. All future fee calculations for these students will be based on target class settings.
              </p>
            </div>
            
            <div className="flex border-t border-slate-100">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest border-r border-slate-100"
              >
                No, Cancel
              </button>
              <button
                onClick={executePromotion}
                className="flex-1 px-4 py-4 text-sm font-bold text-primary-600 hover:bg-primary-50 transition-all uppercase tracking-widest"
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
