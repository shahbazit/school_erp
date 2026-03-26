import { useEffect, useState, useMemo, useCallback } from 'react';
import { useMasters } from '../../hooks/useMasters';
import { Plus, Edit2, Trash2, Search, ArrowRight, Filter, ChevronDown, ChevronRight, LayoutGrid, Info } from 'lucide-react';
import { GenericModal } from '../../components/GenericModal';
import { masterApi } from '../../api/masterApi';
import { CopyFeeStructureAction } from '../../components/fees/CopyFeeStructureAction';

export default function FeeStructures() {
  const { masters, loading, fetchMasters, addMaster, updateMaster, removeMaster } = useMasters('fee/structures');
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSession, setFilterSession] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaster, setEditingMaster] = useState<any | null>(null);
  
  const initialForm = {
    academicYearId: '',
    feeHeadId: '',
    classId: '',
    classIds: [] as string[],
    amount: '',
    frequency: 'Monthly',
    applicableMonth: '',
    description: ''
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});

  const loadMasters = useCallback(async () => {
    try {
      const [cls, years, heads] = await Promise.all([
        masterApi.getAll('classes'),
        masterApi.getAll('academic-years'),
        masterApi.getAll('fee/heads')
      ]);
      setClasses(cls.sort((a: any, b: any) => a.order - b.order));
      setAcademicYears(years);
      setFeeHeads(heads);
      
      const current = years.find((y: any) => y.isCurrent);
      if (current) {
        setFilterSession(current.id);
        setFormData(prev => ({ ...prev, academicYearId: current.id }));
      }
    } catch (err) {
      console.error('Failed to load masters', err);
    }
  }, []);

  useEffect(() => {
    fetchMasters();
    loadMasters();
  }, [fetchMasters, loadMasters]);

  const filteredStructures = useMemo(() => {
    return masters.filter(m => {
      const matchesSearch = Object.values(m).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesClass = !filterClass || m.classId === filterClass;
      const matchesSession = !filterSession || m.academicYearId === filterSession;
      return matchesSearch && matchesClass && matchesSession;
    });
  }, [masters, searchTerm, filterClass, filterSession]);

  const groupedByClass = useMemo(() => {
    const groups: Record<string, { className: string, structures: any[], total: number }> = {};
    
    filteredStructures.forEach(fs => {
      if (!groups[fs.classId]) {
        groups[fs.classId] = { className: fs.className, structures: [], total: 0 };
      }
      groups[fs.classId].structures.push(fs);
      groups[fs.classId].total += Number(fs.amount);
    });

    // Sort by class order if possible, otherwise by name
    return Object.entries(groups).sort((a, b) => {
      const clsA = classes.find(c => c.id === a[0]);
      const clsB = classes.find(c => c.id === b[0]);
      if (clsA && clsB) return clsA.order - clsB.order;
      return a[1].className.localeCompare(b[1].className);
    });
  }, [filteredStructures, classes]);

  useEffect(() => {
    // Expand all classes by default when data loads
    if (groupedByClass.length > 0 && Object.keys(expandedClasses).length === 0) {
      const initial: Record<string, boolean> = {};
      groupedByClass.forEach(([cid]) => initial[cid] = true);
      setExpandedClasses(initial);
    }
  }, [groupedByClass, expandedClasses]);

  const toggleClass = (cid: string) => {
    setExpandedClasses(prev => ({ ...prev, [cid]: !prev[cid] }));
  };

  const handleOpenAddModal = () => {
    setEditingMaster(null);
    setFormData({
      ...initialForm,
      academicYearId: filterSession || academicYears.find(y => y.isCurrent)?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (master: any) => {
    setEditingMaster(master);
    setFormData({
      academicYearId: master.academicYearId,
      feeHeadId: master.feeHeadId,
      classId: master.classId,
      classIds: [master.classId],
      amount: master.amount.toString(),
      frequency: master.frequency,
      applicableMonth: master.applicableMonth || '',
      description: master.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Scrub the payload to ensure optional fields don't cause model binding issues
    const payload = { 
      ...formData, 
      amount: Number(formData.amount),
      classId: formData.classId || null,
      classIds: formData.classIds.length > 0 ? formData.classIds : null
    };
    
    let success = false;
    if (editingMaster) {
      success = await updateMaster(editingMaster.id, payload);
    } else {
      success = await addMaster(payload);
    }
    
    if (success) {
       setIsModalOpen(false);
       fetchMasters();
    }
  };

  const handleClassSelection = (cid: string) => {
    if (editingMaster) {
      setFormData(prev => ({ ...prev, classId: cid, classIds: [cid] }));
    } else {
      setFormData(prev => {
        const classIds = prev.classIds.includes(cid)
          ? prev.classIds.filter(id => id !== cid)
          : [...prev.classIds, cid];
        return { ...prev, classIds };
      });
    }
  };

  const toggleAll = (expand: boolean) => {
    const newState: Record<string, boolean> = {};
    groupedByClass.forEach(([cid]) => newState[cid] = expand);
    setExpandedClasses(newState);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-primary-600 font-bold text-[10px] tracking-[0.2em] uppercase mb-1.5 bg-primary-50/50 w-fit px-2 py-0.5 rounded">
            <span>Fees & Finance</span>
            <ArrowRight className="h-3 w-3" />
            <span>Structure</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Fee Structure</h1>
          <p className="text-slate-500 text-sm font-medium">Assign and manage fee amounts for various classes and sessions.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => {
              const allExpanded = Object.values(expandedClasses).every(v => v);
              toggleAll(!allExpanded);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            {Object.values(expandedClasses).every(v => v) ? (
              <>
                <ChevronRight className="h-3.5 w-3.5 rotate-90" />
                Collapse All
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Expand All
              </>
            )}
          </button>
          <CopyFeeStructureAction onSuccess={fetchMasters} />
          <button onClick={handleOpenAddModal} className="btn-primary shadow-lg shadow-primary-200">
            <Plus className="h-4 w-4 mr-2" />
            Build Structure
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative min-w-[200px]">
            <Filter className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select 
              value={filterSession} 
              onChange={e => setFilterSession(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-full appearance-none transition-all font-semibold"
            >
              <option value="">All Sessions</option>
              {academicYears.map(y => <option key={y.id} value={y.id}>{y.name} {y.isCurrent ? '(Current)' : ''}</option>)}
            </select>
            <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative min-w-[200px]">
            <LayoutGrid className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select 
              value={filterClass} 
              onChange={e => setFilterClass(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-full appearance-none transition-all font-semibold"
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search heads..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-full transition-all font-medium"
          />
        </div>
      </div>

      {/* Main Content: Grouped List */}
      <div className="space-y-4">
        {loading && masters.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
             <div className="h-10 w-10 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-4" />
             <p className="text-slate-500 font-medium">Loading structures...</p>
           </div>
        ) : groupedByClass.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
             <div className="p-4 bg-slate-50 rounded-full mb-4">
               <Info className="h-8 w-8 text-slate-400" />
             </div>
             <p className="text-slate-600 font-bold">No structures defined yet</p>
             <p className="text-slate-400 text-sm mt-1">Select filters or click "Add New" to get started.</p>
           </div>
        ) : (
          groupedByClass.map(([classId, group]) => (
            <div key={classId} className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden transition-all hover:border-slate-300 group/card">
              {/* Group Header */}
              <div className="flex items-center justify-between p-5 bg-white border-b border-slate-100 group">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleClass(classId)}
                    className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 group-hover:text-primary-500"
                  >
                    {expandedClasses[classId] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </button>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{group.className}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        {group.structures.length} Heads
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* One-time Total display */}
                  {(() => {
                    const oneTimeOnly = group.structures.filter(m => (m.frequency || "").toLowerCase() === 'one-time').reduce((sum: number, m: any) => sum + m.amount, 0);
                    return oneTimeOnly > 0 ? (
                      <div className="text-right border-r border-slate-100 pr-6 mr-0 hidden sm:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 text-right">One-Time Fee</p>
                        <p className="text-sm font-black text-amber-600">₹{oneTimeOnly.toLocaleString()}</p>
                      </div>
                    ) : null;
                  })()}

                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center justify-end gap-1.5">
                      Calculated Annual Total
                    </p>
                    <p className="text-2xl font-black text-primary-600 tracking-tight">
                      ₹{(() => {
                        const annualTotal = group.structures.reduce((sum: number, m: any) => {
                          const freq = (m.frequency || "").toLowerCase();
                          if (freq === 'monthly') return sum + (m.amount * 12);
                          if (freq === 'quarterly') return sum + (m.amount * 4);
                          if (freq === 'yearly') return sum + m.amount;
                          return sum; // One-time excluded from annual sum
                        }, 0);
                        return annualTotal.toLocaleString();
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {expandedClasses[classId] && (
                <div className="border-t border-slate-100 animate-in slide-in-from-top-1 duration-200">
                  <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3.5">Fee Head</th>
                          <th className="px-6 py-3.5">Frequency</th>
                          <th className="px-6 py-3.5">Applies (Month)</th>
                          <th className="px-6 py-3.5">Session</th>
                          <th className="px-6 py-3.5 text-right">Amount</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {group.structures.map((fs: any) => (
                          <tr key={fs.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-700">{fs.feeHeadName}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                fs.frequency === 'Monthly' ? 'bg-blue-50 text-blue-600' :
                                fs.frequency === 'Yearly' ? 'bg-purple-50 text-purple-600' :
                                fs.frequency === 'Quarterly' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {fs.frequency}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-medium italic">{fs.applicableMonth || 'Any'}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-semibold text-slate-600">{fs.academicYearName}</span>
                            </td>
                            <td className="px-6 py-4 text-right font-black text-slate-800">₹{fs.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button 
                                  onClick={() => handleOpenEditModal(fs)}
                                  className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                  onClick={() => { if(window.confirm('Delete this?')) removeMaster(fs.id); }}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      <GenericModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingMaster ? "Modify Fee Entry" : "Establish New Fee Entry"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Session *</label>
                <select 
                  required
                  value={formData.academicYearId}
                  onChange={e => setFormData({...formData, academicYearId: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-semibold"
                >
                  <option value="">Select Session...</option>
                  {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fee Category *</label>
                <select 
                  required
                  value={formData.feeHeadId}
                  onChange={e => setFormData({...formData, feeHeadId: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-semibold"
                >
                  <option value="">Select Category...</option>
                  {feeHeads.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Apply to Classes *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-48 overflow-y-auto custom-scrollbar">
                {classes.map(cls => (
                  <label 
                    key={cls.id} 
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      (editingMaster ? (formData.classId === cls.id) : formData.classIds.includes(cls.id))
                        ? 'bg-primary-100 border-primary-200 shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      checked={editingMaster ? (formData.classId === cls.id) : formData.classIds.includes(cls.id)}
                      onChange={() => handleClassSelection(cls.id)}
                    />
                    <span className={`text-xs font-bold leading-none ${
                        (editingMaster ? (formData.classId === cls.id) : formData.classIds.includes(cls.id))
                          ? 'text-primary-800' : 'text-slate-600'
                    }`}>
                      {cls.name}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium italic">
                <span>{editingMaster ? 'Cannot change class for existing record' : `${formData.classIds.length} classes selected`}</span>
                {!editingMaster && (
                  <button type="button" onClick={() => setFormData({...formData, classIds: classes.map(c => c.id)})} className="text-primary-600 hover:underline">Select All</button>
                )}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount (₹) *</label>
                <input 
                  type="number"
                  required
                  placeholder="e.g. 1500"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-black text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Cycle *</label>
                <select 
                  required
                  value={formData.frequency}
                  onChange={e => setFormData({...formData, frequency: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-semibold"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="One-time">One-time</option>
                </select>
              </div>
           </div>

           {(formData.frequency === 'Yearly' || formData.frequency === 'One-time') && (
             <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-amber-700 uppercase tracking-[0.1em]">Target Allocation Month *</label>
                <select
                  required
                  value={formData.applicableMonth}
                  onChange={e => setFormData({...formData, applicableMonth: e.target.value})}
                  className="px-3.5 py-2.5 bg-white border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 flex-1 min-w-[150px] font-bold text-amber-900"
                >
                  <option value="">Select Month...</option>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
             </div>
           )}

           <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal Remarks</label>
              <textarea 
                rows={2}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium"
                placeholder="Optional notes about this fee..."
              />
           </div>

           <div className="pt-2">
             <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-3.5 flex justify-center items-center shadow-xl shadow-primary-200"
              >
                {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editingMaster ? 'Update Structure' : 'Proceed to Generate')}
              </button>
           </div>
        </form>
      </GenericModal>
    </div>
  );
}
