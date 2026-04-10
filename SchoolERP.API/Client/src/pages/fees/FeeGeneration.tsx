import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Settings2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  GraduationCap, 
  Calendar,
  RotateCcw,
  ShieldCheck,
  Info
} from 'lucide-react';
import { masterApi } from '../../api/masterApi';
import { feeApi } from '../../api/feeApi'
import { useLocalization } from '../../contexts/LocalizationContext';

export default function FeeGeneration() {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [classHistory, setClassHistory] = useState<any[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  const [selectedHeads, setSelectedHeads] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return d.toLocaleString('default', { month: 'long' });
  });
  
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    masterApi.getAll('classes').then(data => {
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
      setClasses(sorted);
    }).catch(console.error);
    masterApi.getAll('academic-years').then(years => {
      setAcademicYears(years);
      const current = years.find((y: any) => y.isCurrent);
      if (current) setSelectedYear(current.id);
    }).catch(console.error);
    feeApi.getHeads().then(heads => {
       setFeeHeads(heads.filter((h: any) => h.isSelective));
    }).catch(console.error);
  }, []);

  const fetchHistory = () => {
    feeApi.getHistory(undefined, selectedYear).then(setClassHistory).catch(console.error);
  };

  useEffect(() => {
    if (selectedYear) fetchHistory();
  }, [selectedYear]);

  const toggleClass = (id: string) => {
    setSelectedClasses(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleHead = (id: string) => {
    setSelectedHeads(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClasses.length === 0) return;

    setStatus('LOADING');
    setError(null);
    try {
      // If none selected, we pass undefined so it generates ALL fees (Tuition, etc.)
      const headIds = selectedHeads.length > 0 ? selectedHeads : undefined;
      await feeApi.generateMonthlyCharges(selectedClasses, selectedMonth, headIds, selectedYear);
      setStatus('SUCCESS');
      fetchHistory();
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMessage = typeof errorData === 'object' ? errorData.Message : (errorData || 'Process failed. Verify academic session status.');
      setError(errorMessage);
      setStatus('ERROR');
    }
  };

  const handleUndo = async () => {
    if (selectedClasses.length === 0) {
        alert("Please select at least one class.");
        return;
    }
    if (!window.confirm(`Are you sure you want to REVERT and DELETE all fee charges for ${selectedMonth} across ${selectedClasses.length} selected classes? This cannot be undone.`)) return;

    setStatus('LOADING');
    setError(null);
    try {
      await feeApi.undoMonthlyCharges(selectedClasses, selectedMonth, selectedYear);
      setStatus('SUCCESS');
      fetchHistory();
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMessage = typeof errorData === 'object' ? errorData.Message : (errorData || 'Revert failed.');
      setError(errorMessage);
      setStatus('ERROR');
    }
  };

  const months = [
    "April", "May", "June", "July", "August", "September", 
    "October", "November", "December", "January", "February", "March"
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      {/* Premium Header */}
      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-200 rounded-full" />
        <div className="flex items-center justify-between px-2">
          <div>
            <div className="flex items-center gap-2 text-primary-600 font-bold text-[10px] tracking-[0.25em] uppercase mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Administrative Control Center</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
              Financial Batch Engine
              <div className="flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary-100">
                v2.0 Stable
              </div>
            </h1>
            <p className="text-slate-500 font-medium mt-2 max-w-xl">
              Automated ledger posting system for school-wide fee allocation and adjustments.
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end text-right">
             <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-slate-600 tracking-tight">Ledger Instance: {academicYears.find(y => y.id === selectedYear)?.name || 'Ready'}</span>
             </div>
             <p className="text-[10px] text-slate-400 mt-2 font-mono uppercase tracking-widest">{new Date().toDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Main Interface */}
        <div className="space-y-8">
          <div className="glass-card p-10 border-none shadow-2xl shadow-slate-200/40 relative overflow-hidden group/main">
            {/* Design accents */}
            <div className="absolute -right-20 -top-20 h-64 w-64 bg-primary-50 rounded-full opacity-40 blur-3xl group-hover/main:scale-125 transition-transform duration-1000" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 bg-indigo-50 rounded-full opacity-40 blur-3xl group-hover/main:scale-125 transition-transform duration-1000" />
            
            <form onSubmit={handleGenerate} className="relative z-10 space-y-10">
               <div className="space-y-8">
                  {/* Class Selection Grid */}
                  <div className="space-y-5">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary-500" /> 
                        Identify Target Groups
                      </label>
                      <button 
                        type="button"
                        onClick={() => setSelectedClasses(selectedClasses.length === classes.length ? [] : classes.map(c => c.id))}
                        className="text-[10px] font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        {selectedClasses.length === classes.length ? 'Deselect Everything' : 'Include All Classes'}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {classes.map(c => (
                        <label key={c.id} className={`flex items-center gap-2.5 p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                          selectedClasses.includes(c.id) 
                            ? 'bg-gradient-to-br from-primary-50 to-white border-primary-200 text-primary-900 shadow-md shadow-primary-500/5 ring-1 ring-primary-100' 
                            : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:shadow-sm'
                        }`}>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                            selectedClasses.includes(c.id) ? 'bg-primary-500 border-primary-500' : 'bg-slate-50 border-slate-200 group-hover:border-primary-300'
                          }`}>
                            <input 
                              type="checkbox"
                              className="hidden"
                              checked={selectedClasses.includes(c.id)}
                              onChange={() => toggleClass(c.id)}
                            />
                            {selectedClasses.includes(c.id) && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                          </div>
                          <span className="text-[13px] font-bold truncate tracking-tight">{c.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {feeHeads.length > 0 && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-indigo-500" /> 
                          Elective (Selective) Fees
                        </label>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Choose which optional fees to include in this month's bill</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        {feeHeads.map(h => (
                          <label key={h.id} className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border transition-all cursor-pointer group ${
                            selectedHeads.includes(h.id) 
                              ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-200 text-indigo-900 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-100' 
                              : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:shadow-sm'
                          }`}>
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                              selectedHeads.includes(h.id) ? 'bg-indigo-500 border-indigo-500' : 'bg-slate-50 border-slate-200 group-hover:border-indigo-300'
                            }`}>
                              <input 
                                type="checkbox"
                                className="hidden"
                                checked={selectedHeads.includes(h.id)}
                                onChange={() => toggleHead(h.id)}
                              />
                              {selectedHeads.includes(h.id) && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                            </div>
                            <span className="text-sm font-bold tracking-tight">{h.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Operational Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50/50 rounded-3xl border border-slate-100 group/config hover:bg-slate-50 transition-all">
                    <div className="space-y-2.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-indigo-500" /> Academic Session
                      </label>
                      <div className="relative">
                        <select 
                          required
                          value={selectedYear} 
                          onChange={e => setSelectedYear(e.target.value)}
                          className="w-full h-14 pl-5 pr-10 bg-white border-none rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-primary-500/10 transition-all appearance-none cursor-pointer"
                        >
                          {academicYears.map(y => (
                            <option key={y.id} value={y.id}>{y.name} {y.isCurrent ? '(Active)' : ''}</option>
                          ))}
                        </select>
                        <Settings2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-rose-500" /> Billing Cycle (Month)
                      </label>
                      <div className="relative">
                        <select 
                          required
                          value={selectedMonth} 
                          onChange={e => setSelectedMonth(e.target.value)}
                          className="w-full h-14 pl-5 pr-10 bg-white border-none rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-primary-500/10 transition-all appearance-none cursor-pointer"
                        >
                          {months.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                      </div>
                    </div>
                  </div>
               </div>

               {/* Notifications */}
               {status === 'SUCCESS' && (
                 <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300 shadow-sm shadow-emerald-500/5">
                    <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900 leading-none">Operation Successful</h4>
                      <p className="text-xs font-medium text-emerald-700 mt-1 opacity-80">Ledger balance updated for {selectedClasses.length} class segments.</p>
                    </div>
                 </div>
               )}

               {status === 'ERROR' && (
                 <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 animate-in fade-in shake-in-50 duration-300 shadow-sm shadow-rose-500/5">
                    <div className="p-2 bg-rose-500 rounded-xl text-white shadow-lg shadow-rose-500/20">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-rose-900 leading-none">Posting Interrupted</h4>
                      <p className="text-xs font-medium text-rose-700 mt-1 opacity-80">{error}</p>
                    </div>
                 </div>
               )}

               {/* Dual Action Buttons */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    type="submit" 
                    disabled={status === 'LOADING' || selectedClasses.length === 0}
                    className="md:col-span-2 h-16 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-black rounded-3xl shadow-xl shadow-primary-500/25 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale transition-all duration-300 relative overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    {status === 'LOADING' ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="tracking-tight">Processing Transactions...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-6 w-6 fill-white" />
                        <span className="tracking-tight uppercase text-sm">Post Charges to Ledger</span>
                      </>
                    ) }
                  </button>

                  <button 
                    type="button"
                    onClick={handleUndo}
                    disabled={status === 'LOADING' || selectedClasses.length === 0}
                    className="h-16 bg-white hover:bg-rose-50 border-2 border-slate-100 hover:border-rose-100 text-slate-400 hover:text-rose-600 font-bold rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-30 transition-all duration-300"
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span className="text-sm">Revert Batch</span>
                  </button>
               </div>
               
               <div className="pt-2 px-4 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                 <Info className="h-3.5 w-3.5" />
                 Duplicate charges for the same student, head, and month will be auto-ignored.
               </div>
            </form>
          </div>
        </div>

        {/* Matrix Visualization */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
             <div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <CheckCircle2 className="h-7 w-7 text-primary-500" />
                  Generation Visibility Grid
               </h3>
               <p className="text-xs text-slate-500 font-medium mt-1">Cross-check processing status across all class segments.</p>
             </div>
             <div className="flex gap-6">
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                   <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                   <span className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">Generated</span>
                </div>
                <div className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100/50">
                   <div className="h-2.5 w-2.5 bg-rose-500 rounded-full" />
                   <span className="text-[10px] font-black text-rose-800 uppercase tracking-tight">Pending</span>
                 </div>
                 <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50">
                    <div className="h-2.5 w-2.5 bg-slate-300 rounded-full" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">No Students</span>
                 </div>
              </div>
          </div>

          <div className="glass-card p-2 border-none shadow-xl shadow-slate-200/30 overflow-hidden">
             <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                     <tr className="bg-slate-50/50 rounded-2xl">
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sticky left-0 bg-white/80 backdrop-blur-md z-20 border-r border-slate-100/50">Class Model</th>
                        {months.map(m => (
                          <th key={m} className="px-3 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] text-center font-mono">{m.substring(0, 3)}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50">
                     {classes.map(c => (
                       <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50/50 z-10 border-r border-slate-100">
                             <div className="flex items-center gap-3">
                               <div className="w-1.5 h-1.5 rounded-full bg-primary-100 group-hover:bg-primary-500 transition-colors" />
                               <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{c.name}</span>
                             </div>
                          </td>
                          {months.map(m => {
                            const hasGen = classHistory.some(h => h.classId === c.id && h.month.includes(m));
                            const isEmpty = c.studentCount === 0;

                            return (
                              <td key={m} className="px-3 py-4 text-center">
                                 <div className={`mx-auto h-7 w-7 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                   hasGen 
                                    ? 'bg-emerald-50 text-emerald-600 scale-100 rotate-0 shadow-sm shadow-emerald-200/50' 
                                    : (isEmpty 
                                        ? 'bg-slate-50 text-slate-200 scale-75 border border-slate-100/50 opacity-40' 
                                        : 'bg-rose-50 text-rose-400 scale-95 group-hover:scale-100 border border-rose-100/50'
                                      )
                                 }`}>
                                    {hasGen ? (
                                      <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                      isEmpty ? <div className="h-1 w-1 rounded-full bg-slate-300" /> : <AlertCircle className="h-3.5 w-3.5 opacity-60" />
                                    )}
                                 </div>
                              </td>
                            );
                          })}
                       </tr>
                     ))}
                     {classes.length === 0 && (
                       <tr>
                         <td colSpan={13} className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <Info className="h-10 w-10 text-slate-200" />
                              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Awaiting class structure...</p>
                            </div>
                         </td>
                       </tr>
                     )}
                  </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
