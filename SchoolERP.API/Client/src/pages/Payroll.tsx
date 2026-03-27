import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Calculator, History, Plus, Loader2, Search,
  CheckCircle2, Clock, Settings, X,
  Trash2, ArrowRight, UserCheck, TrendingUp, TrendingDown
} from 'lucide-react';
import {
  payrollApi,
  PayrollStatus,
  SalaryComponentType,
  type SalaryStructureDto,
  type PayrollRunDto,
  type UpsertSalaryStructureDto
} from '../api/payrollApi';
import { extractError } from '../utils/errorUtils';

const statusConfig = {
  [PayrollStatus.Draft]: { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <Clock className="w-4 h-4" /> },
  [PayrollStatus.Processed]: { label: 'Processed', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Calculator className="w-4 h-4" /> },
  [PayrollStatus.Approved]: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4" /> },
  [PayrollStatus.Paid]: { label: 'Paid', color: 'bg-violet-100 text-violet-700 border-violet-200', icon: <DollarSign className="w-4 h-4" /> },
};

export default function Payroll() {
  const [activeTab, setActiveTab] = useState<'runs' | 'structures' | 'process'>('runs');

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Payroll Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage salary structures and process monthly payroll</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit shadow-inner">
          <button onClick={() => setActiveTab('runs')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'runs' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Payroll History</button>
          <button onClick={() => setActiveTab('process')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'process' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Process Monthly</button>
          <button onClick={() => setActiveTab('structures')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'structures' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Structures</button>
        </div>
      </div>

      {activeTab === 'runs' && <PayrollRuns />}
      {activeTab === 'process' && <ProcessPayroll onSuccess={() => setActiveTab('runs')} />}
      {activeTab === 'structures' && <SalaryStructures />}
    </div>
  );
}

// ── Tab 1: Payroll Runs ───────────────────────────────────────────────────
function PayrollRuns() {
  const [runs, setRuns] = useState<PayrollRunDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const loadRuns = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await payrollApi.getRuns();
      setRuns(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadRuns(); }, [loadRuns]);

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this payroll? This will lock the records.")) return;
    try {
      await payrollApi.approvePayroll(id);
      loadRuns();
    } catch (err) {
      alert("Failed to approve payroll.");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {isLoading ? (
        <div className="p-10 text-center text-slate-400">Loading payroll history...</div>
      ) : runs.length === 0 ? (
        <div className="bg-white p-20 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 flex flex-col items-center gap-4">
           <History className="w-12 h-12 opacity-10" />
           <p className="font-medium">No payroll runs found. Start by processing monthly payroll.</p>
        </div>
      ) : (
        runs.map(run => (
          <div key={run.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                 <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center font-black">
                    <span className="text-[10px] opacity-60 uppercase">{new Date(0, run.month - 1).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-xl leading-none">{run.year.toString().slice(-2)}</span>
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-800 text-lg">Payroll for {new Date(0, run.month - 1).toLocaleString('default', { month: 'long' })} {run.year}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-400 font-medium">
                       <span className="flex items-center gap-1"><UserCheck className="w-4 h-4" /> {run.employeeCount} Employees</span>
                       <span>•</span>
                       <span>Processed on {new Date(run.processedDate).toLocaleDateString()}</span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-row md:flex-col items-end gap-2 md:gap-1">
                 <p className="text-2xl font-black text-slate-900">₹{run.totalAmount.toLocaleString()}</p>
                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wider ${statusConfig[run.status].color}`}>
                    {statusConfig[run.status].icon} {run.statusName}
                 </span>
              </div>

              <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                <button onClick={() => setSelectedRunId(run.id)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-100">
                  View Slips
                </button>
                {run.status === PayrollStatus.Draft && (
                  <button onClick={() => handleApprove(run.id)} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-100">
                    Approve
                  </button>
                )}
              </div>
            </div>
            
            {run.remarks && <p className="mt-4 text-xs text-slate-400 italic bg-slate-50/50 p-2 rounded-lg border border-slate-100 border-dashed inline-block">Remark: {run.remarks}</p>}
          </div>
        ))
      )}

      {selectedRunId && (
        <RunDetailsModal runId={selectedRunId} onClose={() => setSelectedRunId(null)} />
      )}
    </div>
  );
}

// ── Shared Modal Component ────────────────────────────────────────────────
function RunDetailsModal({ runId, onClose }: { runId: string, onClose: () => void }) {
  const [run, setRun] = useState<PayrollRunDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    payrollApi.getRun(runId).then(setRun).finally(() => setIsLoading(false));
  }, [runId]);

  const filteredDetails = run?.details?.filter(d => 
    d.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white shadow-2xl w-full lg:w-[60%] h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div>
             <h3 className="text-xl font-black text-slate-800">Payroll Run Details</h3>
             {run && <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(0, run.month - 1).toLocaleString('default', { month: 'long' })} {run.year}</p>}
           </div>
           <button onClick={onClose} className="p-2 border border-slate-200 hover:bg-slate-200 rounded-xl text-slate-400 transition">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="flex-grow overflow-hidden flex flex-col p-6">
          {isLoading ? (
            <div className="flex-grow flex items-center justify-center text-slate-400">Loading details...</div>
          ) : !run ? (
             <div className="flex-grow flex items-center justify-center text-rose-400">Failed to load run data.</div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <div className="flex items-center gap-6">
                    <div className="text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Employees</p>
                       <p className="text-xl font-black text-slate-800">{run.employeeCount}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-100" />
                    <div className="text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Payout</p>
                       <p className="text-xl font-black text-primary-600">₹{run.totalAmount.toLocaleString()}</p>
                    </div>
                 </div>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-100 w-full md:w-64"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>

              <div className="flex-grow overflow-y-auto border border-slate-100 rounded-2xl">
                 <table className="w-full text-left">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                       <tr>
                          <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                          <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gross</th>
                          <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Deductions</th>
                          <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Payout</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredDetails.map(d => (
                         <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3">
                               <p className="text-sm font-bold text-slate-800">{d.employeeName}</p>
                               <p className="text-[10px] text-slate-400 font-bold">{d.employeeCode}</p>
                            </td>
                            <td className="px-5 py-3 text-right">
                               <p className="text-sm font-mono font-bold text-slate-600">₹{d.grossSalary.toLocaleString()}</p>
                            </td>
                            <td className="px-5 py-3 text-right">
                               <p className="text-sm font-mono font-bold text-rose-500">₹{d.totalDeductions.toLocaleString()}</p>
                            </td>
                            <td className="px-5 py-3 text-right">
                               <p className="text-sm font-mono font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg inline-block">₹{d.netSalary.toLocaleString()}</p>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Salary Structures ──────────────────────────────────────────────
function SalaryStructures() {
  const [structures, setStructures] = useState<SalaryStructureDto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const initialFormData: UpsertSalaryStructureDto = {
    name: '',
    description: '',
    isActive: true,
    components: [
      { name: 'Basic Salary', type: SalaryComponentType.Earning, amount: 0 },
      { name: 'HRA', type: SalaryComponentType.Earning, amount: 0 },
      { name: 'PF', type: SalaryComponentType.Deduction, amount: 0 }
    ]
  };

  const [formData, setFormData] = useState<UpsertSalaryStructureDto>(initialFormData);
  const [deleteTarget, setDeleteTarget] = useState<SalaryStructureDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadStructures = useCallback(async () => {
    try {
      const data = await payrollApi.getStructures();
      setStructures(data);
    } catch (err) {
       console.error("Failed to load structures", err);
    }
  }, []);

  useEffect(() => { loadStructures(); }, [loadStructures]);

  const handleAddComponent = () => {
    setFormData(prev => ({ 
      ...prev, 
      components: [...prev.components, { name: '', type: SalaryComponentType.Earning, amount: 0 }] 
    }));
  };

  const handleRemoveComponent = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      components: prev.components.filter((_, i) => i !== index) 
    }));
  };

  const handleEdit = (ss: SalaryStructureDto) => {
    setEditId(ss.id);
    setFormData({
      name: ss.name,
      description: ss.description || '',
      isActive: ss.isActive,
      components: ss.components.map(c => ({
        name: c.name,
        type: c.type,
        amount: c.amount
      }))
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await payrollApi.updateStructure(editId, formData);
      } else {
        await payrollApi.createStructure(formData);
      }
      setShowModal(false);
      setEditId(null);
      setFormData(initialFormData);
      loadStructures();
    } catch (err: any) { 
       const msg = extractError(err, "Failed to save structure.");
       alert(msg); 
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await payrollApi.deleteStructure(deleteTarget.id);
      setDeleteTarget(null);
      loadStructures();
    } catch (err: any) {
      alert(err.response?.data || "Failed to delete structure.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Standard Templates</h3>
          <button 
            onClick={() => { setEditId(null); setFormData(initialFormData); setShowModal(true); }} 
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition"
          >
            <Plus className="w-4 h-4" /> New Structure
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {structures.map(ss => (
            <div key={ss.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-primary-200 transition relative overflow-hidden flex flex-col h-full shadow-sm">
               <div className="flex items-start justify-between">
                   <h4 className="font-black text-slate-800 text-lg leading-tight">{ss.name}</h4>
                   <div className="flex items-center gap-2">
                     <Settings 
                       onClick={() => handleEdit(ss)}
                       className="w-4 h-4 text-slate-300 hover:text-primary-600 transition cursor-pointer" 
                     />
                     <Trash2 
                       onClick={() => setDeleteTarget(ss)}
                       className="w-4 h-4 text-slate-300 hover:text-rose-600 transition cursor-pointer" 
                     />
                   </div>
                </div>
               <p className="text-sm text-slate-400 mt-1 mb-6 flex-grow">{ss.description || 'No description provided'}</p>
               
               <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                     <span>Components Breakdown</span>
                     <span>Amt</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto pr-1 thin-scrollbar space-y-1">
                    {ss.components.map(c => (
                      <div key={c.id} className="flex items-center justify-between text-sm group">
                        <span className="text-slate-600 flex items-center gap-1.5">
                           {c.type === SalaryComponentType.Earning ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-rose-500" />}
                           {c.name}
                        </span>
                        <span className={`font-mono text-xs font-bold ${c.type === SalaryComponentType.Earning ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {c.type === SalaryComponentType.Deduction && '-'}₹{c.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Monthly Net</p>
                    <p className="text-xl font-black text-primary-600">₹{ss.netTotal.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Gross</p>
                    <p className="text-sm font-bold text-slate-500">₹{ss.totalEarnings.toLocaleString()}</p>
                  </div>
               </div>
            </div>
          ))}
       </div>

       {showModal && (
         <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
           <div className="relative bg-white shadow-2xl w-full lg:w-[60%] h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <h3 className="text-xl font-black text-slate-800">{editId ? 'Update' : 'Configure'} Salary Structure</h3>
                 <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition">&times;</button>
              </div>
              <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-grow custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-xs font-black text-slate-400 uppercase ml-1">Structure Name</label>
                       <input 
                         required 
                         className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-400 focus:bg-white transition shadow-inner" 
                         placeholder="e.g., Senior Secondary Teacher"
                         value={formData.name}
                         onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-black text-slate-400 uppercase ml-1">Brief Description</label>
                       <input 
                         className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-400 focus:bg-white transition shadow-inner" 
                         placeholder="Description for HR records..."
                         value={formData.description}
                         onChange={e => setFormData(p => ({...p, description: e.target.value}))}
                       />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Breakdown Components</h4>
                       <button type="button" onClick={handleAddComponent} className="text-xs font-bold text-primary-600 flex items-center gap-1 hover:underline">
                          <Plus className="w-3 h-3" /> Add Component
                       </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.components.map((comp, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group">
                           <div className="flex-1 space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Label</label>
                              <input 
                                required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium" 
                                value={comp.name}
                                onChange={e => {
                                  const newComps = [...formData.components];
                                  newComps[idx].name = e.target.value;
                                  setFormData(p => ({...p, components: newComps}));
                                }}
                              />
                           </div>
                           <div className="w-32 space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                              <select 
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium"
                                value={comp.type}
                                onChange={e => {
                                  const newComps = [...formData.components];
                                  newComps[idx].type = parseInt(e.target.value);
                                  setFormData(p => ({...p, components: newComps}));
                                }}
                              >
                                 <option value={SalaryComponentType.Earning}>Earning</option>
                                 <option value={SalaryComponentType.Deduction}>Deduction</option>
                              </select>
                           </div>
                           <div className="w-32 space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Amount (₹)</label>
                              <input 
                                type="number" required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700" 
                                value={comp.amount}
                                onChange={e => {
                                  const newComps = [...formData.components];
                                  newComps[idx].amount = parseFloat(e.target.value) || 0;
                                  setFormData(p => ({...p, components: newComps}));
                                }}
                              />
                           </div>
                           <div className="flex items-end pb-1">
                              <button type="button" onClick={() => handleRemoveComponent(idx)} className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
                 <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50/50 -mx-6 -mb-6 mt-auto">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl text-sm font-black hover:bg-slate-50 transition">Cancel</button>
                    <button type="submit" className="flex-2 px-10 py-3 bg-primary-600 text-white rounded-2xl text-sm font-black hover:bg-primary-700 transition shadow-xl shadow-primary-100">Save Configuration</button>
                 </div>
              </form>
           </div>
         </div>
       )}

       {/* Delete Confirmation Modal */}
       {deleteTarget && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteTarget(null)} />
           <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
             <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-600">
               <Trash2 className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-black text-slate-800 mb-2">Delete Structure?</h3>
             <p className="text-slate-500 mb-8 font-medium">Are you sure you want to delete <span className="text-slate-800 font-bold">"{deleteTarget.name}"</span>? This action cannot be undone and will fail if employees are still assigned to it.</p>
             
             <div className="flex gap-4">
               <button 
                 onClick={() => setDeleteTarget(null)}
                 disabled={isDeleting}
                 className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleDelete}
                 disabled={isDeleting}
                 className="flex-1 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
               >
                 {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                 Delete Permanent
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

// ── Tab 3: Process Payroll ────────────────────────────────────────────────
function ProcessPayroll({ onSuccess }: { onSuccess: () => void }) {
  const [data, setData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    remarks: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await payrollApi.processPayroll(data);
      alert("Payroll processed successfully!");
      onSuccess();
    } catch (err: any) {
      const msg = extractError(err, "Processing failed. Make sure salary structures are assigned to employees.");
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
       <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="h-20 w-20 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-6">
             <Calculator className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Generate Monthly Payroll</h3>
          <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto font-medium leading-relaxed">This will calculate salaries for all active employees based on their assigned structures for the selected period.</p>
          
          <form onSubmit={handleProcess} className="mt-10 space-y-6 text-left">
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Financial Year</label>
                  <input 
                    type="number" required className="w-full px-4 py-3 bg-slate-50 border-0 rounded-2xl font-bold text-slate-800 shadow-inner focus:ring-2 focus:ring-primary-400 outline-none" 
                    value={data.year}
                    onChange={e => setData(p => ({...p, year: parseInt(e.target.value)}))}
                  />
               </div>
               <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Target Month</label>
                  <select 
                    required className="w-full px-4 py-3 bg-slate-50 border-0 rounded-2xl font-bold text-slate-800 shadow-inner focus:ring-2 focus:ring-primary-400 outline-none"
                    value={data.month}
                    onChange={e => setData(p => ({...p, month: parseInt(e.target.value)}))}
                  >
                     {[...Array(12)].map((_, i) => (
                       <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                     ))}
                  </select>
               </div>
             </div>
             <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Internal Note (Optional)</label>
                <textarea 
                  rows={3} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-2xl font-semibold text-slate-800 shadow-inner focus:ring-2 focus:ring-primary-400 outline-none placeholder:text-slate-300"
                  placeholder="Reason for running, or specific instructions..."
                  value={data.remarks}
                  onChange={e => setData(p => ({...p, remarks: e.target.value}))}
                />
             </div>
             <button disabled={isProcessing} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition shadow-xl flex items-center justify-center gap-3">
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                {isProcessing ? 'Processing Calculations...' : 'Kick-off Payroll Run'}
             </button>
          </form>
       </div>
    </div>
  );
}
