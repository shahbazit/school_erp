import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Settings2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  GraduationCap, 
  Calendar,
  Zap,
  FileText
} from 'lucide-react';
import { masterApi } from '../../api/masterApi';
import { feeApi } from '../../api/feeApi';

export default function FeeGeneration() {
  const [classes, setClasses] = useState<any[]>([]);
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [classHistory, setClassHistory] = useState<any[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedHeads, setSelectedHeads] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
  });
  
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    masterApi.getAll('classes').then(setClasses).catch(console.error);
    feeApi.getHeads().then(setFeeHeads).catch(console.error);
    masterApi.getAll('academic-years').then(years => {
      setAcademicYears(years);
      const current = years.find((y: any) => y.isCurrent);
      if (current) setSelectedYear(current.id);
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
      await feeApi.generateMonthlyCharges(selectedClasses, selectedMonth, selectedHeads.length > 0 ? selectedHeads : undefined);
      setStatus('SUCCESS');
      fetchHistory();
    } catch (err: any) {
      setError(err.response?.data || 'Process failed. Verify academic session status.');
      setStatus('ERROR');
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Zap className="h-8 w-8 text-amber-500 fill-amber-500/10" />
            Bulk Fee Generator
          </h1>
          <p className="text-slate-500 font-medium mt-1">Push academic charges from structure to student ledgers in seconds.</p>
        </div>
        <div className="hidden md:flex flex-col items-end">
           <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">System Ready</span>
           <p className="text-[10px] text-slate-400 mt-1 font-mono">{new Date().toLocaleDateString()} Ledger Time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 border-t-4 border-t-primary-600 relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 h-40 w-40 bg-primary-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700" />
            
            <form onSubmit={handleGenerate} className="relative z-10 space-y-6">
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5" /> Target Classes
                    </label>
                    <button 
                      type="button"
                      onClick={() => setSelectedClasses(selectedClasses.length === classes.length ? [] : classes.map(c => c.id))}
                      className="text-[10px] font-bold text-primary-600 hover:text-primary-700"
                    >
                      {selectedClasses.length === classes.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {classes.map(c => (
                      <label key={c.id} className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedClasses.includes(c.id) 
                          ? 'bg-primary-50 border-primary-200 text-primary-900' 
                          : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                      }`}>
                        <input 
                          type="checkbox"
                          className="w-3.5 h-3.5 rounded border-slate-300 text-primary-600"
                          checked={selectedClasses.includes(c.id)}
                          onChange={() => toggleClass(c.id)}
                        />
                        <span className="text-xs font-bold truncate">{c.name}</span>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Billing Month
                    </label>
                    <select 
                      required
                      value={selectedMonth} 
                      onChange={e => setSelectedMonth(e.target.value)}
                      className="form-input text-sm bg-white border-slate-200/60 focus:ring-4 focus:ring-primary-500/10 h-12"
                    >
                      {years.map(y => months.map(m => (
                        <option key={`${m} ${y}`} value={`${m} ${y}`}>{m} {y}</option>
                      )))}
                    </select>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Select Fee Categories to Post
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-inner">
                    {feeHeads.length === 0 ? (
                      <p className="col-span-full text-center py-4 text-xs text-slate-400 font-medium italic">No fee heads found in system.</p>
                    ) : (
                      feeHeads.map(head => {
                        return (
                          <div key={head.id} className="group/item">
                            <label className={`flex flex-col gap-1 p-3 rounded-xl border transition-all cursor-pointer ${
                              selectedHeads.includes(head.id) 
                                ? 'bg-primary-50 border-primary-200 text-primary-900 shadow-sm' 
                                : 'bg-slate-50/50 border-transparent hover:border-slate-200 text-slate-600 hover:bg-white'
                            }`}>
                              <div className="flex items-center gap-2.5">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
                                  checked={selectedHeads.includes(head.id)}
                                  onChange={() => toggleHead(head.id)}
                                />
                                <span className="text-xs font-bold leading-none select-none">{head.name}</span>
                              </div>
                            </label>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 italic ml-1">* If none selected, all active fees for the class will be posted.</p>
               </div>

               <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-start gap-4">
                  <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                    <Settings2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900">Posting Scope</h4>
                    <p className="text-xs text-indigo-700 mt-1 leading-relaxed opacity-80">
                      The process will apply all configured <b>Monthly</b>, <b>Yearly</b> (if month 1), and <b>Quarterly</b> fees matching the class structure.
                    </p>
                  </div>
               </div>

               {status === 'SUCCESS' && (
                 <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <p className="text-sm font-bold text-emerald-800">Fees successfully pushed for {selectedClasses.length} classes!</p>
                 </div>
               )}

               {status === 'ERROR' && (
                 <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5 text-rose-600" />
                    <p className="text-sm font-bold text-rose-800">{error}</p>
                 </div>
               )}

               <button 
                 type="submit" 
                 disabled={status === 'LOADING' || selectedClasses.length === 0}
                 className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale transition-all duration-300"
               >
                 {status === 'LOADING' ? (
                   <>
                     <Loader2 className="h-6 w-6 animate-spin" />
                     <span>Processing Ledger...</span>
                   </>
                 ) : (
                   <>
                     <Play className="h-6 w-6 fill-white" />
                     <span>Generate & Post Charges</span>
                   </>
                 ) }
               </button>

               <div className="pt-6 border-t border-slate-100/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" /> Generation Status ({academicYears.find(y => y.id === selectedYear)?.name})
                    </h4>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {months.map(m => {
                      // Simple logic: if month is Jan-Mar, it's next year part of session, else same year.
                      // But the selector saves "Month Year". 
                      // For now, let's just check if ANY history exists for this month in classHistory
                      const hasGeneration = classHistory.some(h => h.month.startsWith(m));
                      return (
                        <div key={m} className={`p-2.5 rounded-xl border text-center transition-all ${
                          hasGeneration 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                            : 'bg-rose-50 border-rose-100 text-rose-600 opacity-60'
                        }`}>
                          <p className="text-[10px] font-black uppercase tracking-tight">{m.substring(0, 3)}</p>
                          <div className={`h-1 w-1 mx-auto rounded-full mt-1 ${hasGeneration ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        </div>
                      );
                    })}
                  </div>
               </div>

             </form>
          </div>
        </div>

        {/* Global Session Config */}
        <div className="space-y-6">
           <div className="glass-card p-6 bg-slate-900 text-white relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 h-24 w-24 bg-primary-500/10 rounded-full blur-2xl" />
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Settings2 className="h-3.5 w-3.5 text-primary-400" /> Target Session
              </label>
              <select 
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl text-xs py-3 px-4 focus:ring-2 focus:ring-primary-500/50 transition-all outline-none"
              >
                {academicYears.map(y => (
                  <option key={y.id} value={y.id} className="text-slate-900">{y.name} {y.isCurrent ? '(Current)' : ''}</option>
                ))}
              </select>
              <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
                 <p className="text-[10px] text-slate-400 leading-relaxed uppercase font-bold tracking-tighter">Current Session View Only</p>
                 <p className="text-[9px] text-slate-500 mt-0.5 italic">* Charges will be tagged to the selected academic session ID for accounting consistency.</p>
              </div>
           </div>

           <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 space-y-3">
            <h4 className="text-amber-900 font-bold text-sm">Cautionary Note</h4>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Batch generation cannot be undone automatically. All posted charges will reflect in student ledgers immediately.
            </p>
          </div>
        </div>
      </div>

      {/* History Section - Full Width Bottom */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary-600" />
              Transactional Batch History
           </h3>
           <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{classHistory.length} batches found</span>
        </div>

        <div className="glass-card overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-200/20">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50/80 border-b border-slate-200/60">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Post Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Month/Ref</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Students</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Batch Amount</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {classHistory.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic">No batches posting found for this session.</td>
                    </tr>
                 ) : (
                    classHistory.map((h, i) => (
                       <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                             <span className="text-xs font-bold text-slate-900">{new Date(h.lastPostedDate).toLocaleDateString()}</span>
                             <p className="text-[10px] text-slate-400">{new Date(h.lastPostedDate).toLocaleTimeString()}</p>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-xs font-black text-primary-600 uppercase tracking-tight">{h.className}</span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">{h.month}</span>
                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-mono">#{i + 1001}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-600">
                             {h.studentCount} Pupils
                          </td>
                          <td className="px-6 py-4 text-right">
                             <span className="text-sm font-black text-slate-900">₹{h.totalAmount.toLocaleString()}</span>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}

