import { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee, Calculator, History, Plus, Loader2, Search,
  CheckCircle2, Clock, Settings, X,
  Trash2, ArrowRight, UserCheck, Printer
} from 'lucide-react';
import {
  payrollApi,
  PayrollStatus,
  PayrollRunDto,
  PayrollDetailDto,
  SalaryStructureDto,
  SalaryComponentType
} from '../api/payrollApi';
import { useLocalization } from '../contexts/LocalizationContext';

const statusConfig = {
  [PayrollStatus.Draft]: { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <Clock className="w-4 h-4" /> },
  [PayrollStatus.Processed]: { label: 'Processed', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Calculator className="w-4 h-4" /> },
  [PayrollStatus.Approved]: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4" /> },
  [PayrollStatus.Paid]: { label: 'Paid', color: 'bg-primary-100 text-primary-700 border-primary-200', icon: <CheckCircle2 className="w-4 h-4" /> },
  [PayrollStatus.Rejected]: { label: 'Rejected', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: <X className="w-4 h-4" /> },
};

export default function Payroll() {
  const { formatCurrency, formatDate } = useLocalization();
  const [activeTab, setActiveTab] = useState<'runs' | 'structures' | 'process' | 'ledger'>('runs');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-200">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Payroll Management</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Generate, Review & Disburse Monthly Salaries</p>
          </div>
        </div>
        <div className="bg-slate-100 p-1.5 rounded-xl flex gap-1">
          <button onClick={() => setActiveTab('runs')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'runs' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Payroll History</button>
          <button onClick={() => setActiveTab('process')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'process' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Process Monthly</button>
          <button onClick={() => setActiveTab('structures')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'structures' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Structures</button>
          <button onClick={() => setActiveTab('ledger')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'ledger' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Employee Ledger</button>
        </div>
      </div>

      {activeTab === 'runs' && <PayrollRuns />}
      {activeTab === 'process' && <ProcessPayroll onSuccess={() => setActiveTab('runs')} />}
      {activeTab === 'structures' && <SalaryStructures />}
      {activeTab === 'ledger' && <EmployeeLedger />}
    </div>
  );
}

function EmployeeLedger() {
  const { formatCurrency, formatDate } = useLocalization();
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMiscModalOpen, setIsMiscModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await payrollApi.getEmployeeSalaries();
      setEmployees(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const loadLedger = async (emp: any) => {
    setSelectedEmp(emp);
    setIsLoading(true);
    try {
      const data = await payrollApi.getEmployeeLedger(emp.employeeId);
      setHistory(data);
    } finally {
      setIsLoading(false);
    }
  };

  const [viewingSlip, setViewingSlip] = useState<any | null>(null);

  const filtered = employees.filter(e => 
    e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 min-h-[600px] shadow-sm overflow-hidden">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
             <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl">
                <History className="w-7 h-7" />
             </div>
             <div>
                <h3 className="font-black text-slate-800 text-2xl tracking-tight">Staff Financial Ledger</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Transaction History & Plans</p>
             </div>
          </div>

          {!selectedEmp ? (
            <div className="relative w-full md:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl font-bold text-slate-700 shadow-inner focus:ring-2 focus:ring-primary-400 outline-none transition" 
                 placeholder="Search by name or code..."
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
          ) : (
            <button 
              onClick={() => setSelectedEmp(null)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition"
            >
               &larr; Back to Staff List
            </button>
          )}
       </div>

       {isLoading && !selectedEmp ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
             <Loader2 className="w-12 h-12 animate-spin mb-4" />
             <p className="font-black text-xs tracking-widest uppercase animate-pulse">Loading Records...</p>
          </div>
       ) : selectedEmp ? (
          /* Drill-down: Individual Transactions */
          <div className="animate-in slide-in-from-bottom-5 duration-500">
             <div className="bg-slate-900 rounded-[2rem] p-8 mb-10 text-white flex items-center justify-between shadow-2xl shadow-slate-200">
                <div className="flex items-center gap-6">
                   <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl">
                      {selectedEmp.employeeName.split(' ').map((n:any) => n[0]).join('')}
                   </div>
                   <div>
                      <h4 className="text-xl font-black">{selectedEmp.employeeName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code: {selectedEmp.employeeCode} | Plan: {selectedEmp.salaryStructureName}</p>
                   </div>
                </div>
                <button 
                   onClick={() => setIsMiscModalOpen(true)}
                   className="px-6 py-4 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-500 transition flex items-center gap-2"
                >
                   <Plus className="w-4 h-4" /> Record Misc Payout
                </button>
             </div>

             {isLoading ? (
                <div className="p-24 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-slate-200" /></div>
             ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-3xl">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type / Month</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Payout</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference / Remarks</th>
                            <th className="px-6 py-4"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {history.map((h: any) => (
                            <tr key={h.id} className="hover:bg-slate-50/50 transition duration-200">
                               <td className="px-6 py-5">
                                  <div className="flex items-center gap-2">
                                     <span className={`w-2 h-2 rounded-full ${h.type === 'Salary' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                     <p className="text-sm font-black text-slate-800">{h.type}</p>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{formatDate(h.date)} &bull; {new Date(0, h.month-1).toLocaleString('default', { month: 'long' })} {h.year}</p>
                               </td>
                               <td className="px-6 py-5 text-right">
                                  <p className="text-sm font-mono font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-lg inline-block">{formatCurrency(h.netSalary)}</p>
                               </td>
                               <td className="px-6 py-5 max-w-sm">
                                  <p className="text-xs text-slate-500 font-semibold leading-relaxed italic">{h.remarks || '--'}</p>
                               </td>
                               <td className="px-6 py-5 text-right">
                                  {h.type === 'Salary' && (
                                     <button onClick={() => setViewingSlip(h)} className="p-3 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                                        <Printer className="w-4 h-4" />
                                     </button>
                                  )}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
       ) : (
          /* Master List View */
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="overflow-x-auto border border-slate-100 rounded-[2rem]">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Member</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Plan</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Est. Monthly Payout</th>
                         <th className="px-8 py-5"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filtered.map((e: any) => (
                         <tr key={e.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-8 py-5">
                               <p className="text-sm font-black text-slate-800 leading-none">{e.employeeName}</p>
                               <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">Code: {e.employeeCode}</p>
                            </td>
                            <td className="px-8 py-5 text-sm font-bold text-slate-600">
                               <div className="flex items-center gap-2">
                                  <Settings className="w-3.5 h-3.5 text-primary-400" />
                                  {e.salaryStructureName}
                               </div>
                            </td>
                            <td className="px-8 py-5 text-right font-mono font-black text-slate-800">
                               {formatCurrency(e.netSalary)}
                            </td>
                            <td className="px-8 py-5 text-right">
                               <button 
                                 onClick={() => loadLedger(e)}
                                 className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 hover:border-primary-600 transition duration-300 shadow-lg shadow-slate-200 hover:shadow-primary-100"
                               >
                                  Show Ledger
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       )}

       {isMiscModalOpen && selectedEmp && (
          <MiscPayoutModal 
             employeeId={selectedEmp.employeeId} 
             employeeName={selectedEmp.employeeName}
             onClose={() => setIsMiscModalOpen(false)} 
             onSuccess={() => { setIsMiscModalOpen(false); loadLedger(selectedEmp); }} 
          />
       )}

       {viewingSlip && selectedEmp && (
          <SalarySlipModal 
            detail={viewingSlip} 
            employeeName={selectedEmp.employeeName}
            employeeCode={selectedEmp.employeeCode}
            onClose={() => setViewingSlip(null)} 
          />
       )}
    </div>
  );
}

function MiscPayoutModal({ employeeId, employeeName, onClose, onSuccess }: { employeeId: string, employeeName: string, onClose: () => void, onSuccess: () => void }) {
  const { formatCurrency, settings } = useLocalization();
  const [data, setData] = useState({ type: 'Bonus', amount: 0, paymentMethod: 'Bank Transfer', remarks: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (data.amount <= 0) return alert("Please enter a valid amount.");
    setIsSaving(true);
    try {
      await payrollApi.recordMiscPayout({ ...data, employeeId });
      onSuccess();
    } catch (err) {
      alert("Failed to record payout.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
       <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
          <h4 className="text-xl font-black text-slate-800 mb-1">Miscellaneous Payout</h4>
          <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-8">Recording extra payment for {employeeName}</p>
          
          <div className="space-y-6">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Payout Category</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border-0 rounded-2xl font-bold text-slate-800 shadow-inner focus:ring-2 focus:ring-primary-400 outline-none transition"
                  value={data.type}
                  onChange={e => setData(d => ({...d, type: e.target.value}))}
                >
                   <option value="Bonus">Performance Bonus</option>
                   <option value="Incentive">Special Incentive</option>
                   <option value="Advance">Salary Advance (Loan)</option>
                   <option value="Arrears">Salary Arrears</option>
                   <option value="Reimbursement">Other Reimbursement</option>
                </select>
             </div>

             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Amount ({settings?.currencySymbol || "₹"})</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-slate-50 border-0 rounded-2xl font-black text-primary-600 shadow-inner focus:ring-2 focus:ring-primary-400 outline-none transition text-xl" 
                  value={data.amount}
                  onChange={e => setData(d => ({...d, amount: parseFloat(e.target.value) || 0}))}
                />
             </div>

             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Remarks / Note</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border-0 rounded-2xl font-semibold text-slate-700 shadow-inner focus:ring-2 focus:ring-primary-400 outline-none transition resize-none h-24" 
                  placeholder="Details about the payment..."
                  value={data.remarks}
                  onChange={e => setData(d => ({...d, remarks: e.target.value}))}
                />
             </div>
             
             <div className="flex gap-4 pt-4">
                <button onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition">Cancel</button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                >
                   {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Record Payment'}
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}

function PayrollRuns() {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const [runs, setRuns] = useState<PayrollRunDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollRunDto | null>(null);

  const loadData = useCallback(() => {
    setIsLoading(true);
    payrollApi.getRuns().then(setRuns).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) return (
     <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-black text-xs uppercase tracking-widest animate-pulse">Loading Histories...</p>
     </div>
  );

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
       <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Financial Cycles</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Review & Manage Processed Runs</p>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">Total Runs: {runs.length}</p>
       </div>

       <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 uppercase">
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-[0.2em]">Pay Period</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-[0.2em]">Processing Date</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-[0.2em]">Status</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-[0.2em] text-center">Staff Count</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-[0.2em] text-right">Total Payout</th>
                   <th className="px-8 py-5"></th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {runs.map(run => (
                   <tr key={run.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center font-black text-[10px]">
                               {run.month}/{run.year.toString().slice(-2)}
                            </div>
                            <div>
                               <p className="font-extrabold text-slate-800 text-sm">{new Date(0, run.month - 1).toLocaleString('default', { month: 'long' })} {run.year}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Ref: {run.id.slice(0, 8)}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-500">
                         {formatDate(run.processedDate)}
                      </td>
                      <td className="px-8 py-6">
                         <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${statusConfig[run.status].color}`}>
                            {statusConfig[run.status].icon}
                            {statusConfig[run.status].label}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-center text-sm font-black text-slate-800">
                         <div className="inline-flex items-center justify-center h-8 w-12 bg-slate-100 rounded-lg border border-slate-200/50">
                            {run.employeeCount}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <p className="text-sm font-mono font-black text-primary-600 bg-primary-50 px-4 py-1.5 rounded-xl inline-block">{formatCurrency(run.totalAmount)}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button 
                            onClick={() => setSelectedRun(run)}
                            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition duration-300 shadow-sm"
                         >
                            View Details
                         </button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>

       {selectedRun && <RunDetailsModal run={selectedRun} onClose={() => setSelectedRun(null)} onUpdate={loadData} />}
    </div>
  );
}

function RunDetailsModal({ run, onClose, onUpdate }: { run: PayrollRunDto, onClose: () => void, onUpdate: () => void }) {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const [details, setDetails] = useState<PayrollDetailDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Adjustment State
  const [adjustingSlip, setAdjustingSlip] = useState<PayrollDetailDto | null>(null);
  const [adjData, setAdjData] = useState({ earning: 0, deduction: 0, remarks: '' });
  const [isSavingAdj, setIsSavingAdj] = useState(false);
  const [viewingSlip, setViewingSlip] = useState<PayrollDetailDto | null>(null);

  const loadData = useCallback(() => {
    setIsLoading(true);
    payrollApi.getRun(run.id).then(res => setDetails(res.details)).finally(() => setIsLoading(false));
  }, [run.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartAdjust = (d: PayrollDetailDto) => {
     setAdjustingSlip(d);
     setAdjData({ 
        earning: d.adjustmentEarnings || 0, 
        deduction: d.adjustmentDeductions || 0, 
        remarks: d.adjustmentRemarks || '' 
     });
  };

  const handleSaveAdjustment = async () => {
     if (!adjustingSlip) return;
     setIsSavingAdj(true);
     try {
        await payrollApi.updateAdjustment(adjustingSlip.id, {
           adjustmentEarnings: adjData.earning,
           adjustmentDeductions: adjData.deduction,
           adjustmentRemarks: adjData.remarks
        });
        setAdjustingSlip(null);
        loadData();
        onUpdate(); // Update the header totals too
     } finally {
        setIsSavingAdj(false);
     }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this payroll? It will need reprocessing.')) return;
    await payrollApi.rejectPayroll(run.id);
    onClose();
    onUpdate();
  };

  const handleDisburse = async () => {
    if (!confirm('Mark as PAID? This will record a final expense in the system.')) return;
    await payrollApi.markPaidPayroll(run.id);
    onClose();
    onUpdate();
  };

  const filtered = details.filter(d => 
    d.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
        <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl">
                   <Calculator className="w-8 h-8" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-slate-800">{new Date(0, run.month - 1).toLocaleString('default', { month: 'long' })} {run.year}</h2>
                   <div className="flex items-center gap-3 mt-1">
                      <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${statusConfig[run.status].color}`}>
                        {statusConfig[run.status].label}
                      </span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Payout: <span className="text-primary-600 ml-1 font-black">{formatCurrency(run.totalAmount)}</span></p>
                   </div>
                </div>
             </div>
             
             <div className="flex items-center gap-2">
                {run.status === PayrollStatus.Approved && (
                  <button onClick={handleDisburse} className="px-6 py-3 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 transition flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Disburse Payment
                  </button>
                )}
                {(run.status === PayrollStatus.Processed || run.status === PayrollStatus.Draft) && (
                   <>
                    <button onClick={handleReject} className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition whitespace-nowrap">Reject</button>
                    <button onClick={() => payrollApi.approvePayroll(run.id).then(() => {onClose(); onUpdate();})} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition">Approve Payroll</button>
                   </>
                )}
                <button onClick={onClose} className="p-3 text-slate-400 hover:bg-slate-100 rounded-2xl transition">&times;</button>
             </div>
          </div>

          <div className="p-6 bg-slate-50/50 border-b border-slate-100">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary-400 outline-none transition" 
                  placeholder="Search staff by name or code..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4">
            {isLoading ? (
               <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-slate-300" /></div>
            ) : (
              <div className="border border-slate-100 rounded-3xl overflow-hidden">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/80 border-b border-slate-100">
                          <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                          <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gross</th>
                          <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Deductions</th>
                          <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Adjustments</th>
                          <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Payout</th>
                          <th className="px-5 py-3"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filtered.map(d => (
                         <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3">
                               <p className="font-black text-slate-800 text-sm leading-none">{d.employeeName}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{d.employeeCode}</p>
                            </td>
                            <td className="px-5 py-3 text-right text-sm font-mono text-slate-600">{formatCurrency(d.grossSalary)}</td>
                            <td className="px-5 py-3 text-right text-sm font-mono text-rose-500">-{formatCurrency(d.totalDeductions)}</td>
                            <td className="px-5 py-3 text-right">
                               <div className="flex flex-col items-end">
                                  {d.adjustmentEarnings > 0 && <span className="text-[10px] font-bold text-emerald-500">+{d.adjustmentEarnings.toLocaleString()}</span>}
                                  {d.adjustmentDeductions > 0 && <span className="text-[10px] font-bold text-rose-500">-{d.adjustmentDeductions.toLocaleString()}</span>}
                                  {d.adjustmentEarnings === 0 && d.adjustmentDeductions === 0 && <span className="text-[10px] text-slate-300">--</span>}
                               </div>
                            </td>
                            <td className="px-5 py-3 text-right">
                               <p className="text-sm font-mono font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg inline-block">{formatCurrency(d.netSalary)}</p>
                            </td>
                            <td className="px-5 py-3 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => setViewingSlip(d)} title="View Salary Slip" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                                     <Printer className="w-4 h-4" />
                                  </button>
                                  {(run.status === PayrollStatus.Draft || run.status === PayrollStatus.Rejected) && (
                                     <button 
                                       onClick={() => handleStartAdjust(d)} 
                                       title="Edit / Adjust Slip" 
                                       className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 bg-slate-100 hover:bg-primary-50 rounded-xl transition-all border border-slate-200 hover:border-primary-200"
                                     >
                                        <Plus className="w-3.5 h-3.5" /> Adjust
                                     </button>
                                  )}
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            )}
          </div>
        </div>

        {viewingSlip && (
           <SalarySlipModal detail={viewingSlip} run={run} onClose={() => setViewingSlip(null)} />
        )}

        {/* Inline Adjustment Drawer/Overlay */}
        {adjustingSlip && (
           <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setAdjustingSlip(null)} />
              <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-150">
                 <h4 className="text-xl font-black text-slate-800 mb-1">Adjust Payout</h4>
                 <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-8">{adjustingSlip.employeeName}</p>
                 
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-emerald-600 uppercase ml-1">Extra Earnings</label>
                          <input 
                            type="number" 
                            className="w-full px-4 py-3 bg-emerald-50 border-0 rounded-2xl font-black text-emerald-600 shadow-inner focus:ring-2 focus:ring-emerald-400 outline-none transition" 
                            value={adjData.earning}
                            onChange={e => setAdjData(prev => ({...prev, earning: parseFloat(e.target.value) || 0}))}
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-rose-600 uppercase ml-1">Extra Cuts</label>
                          <input 
                            type="number" 
                            className="w-full px-4 py-3 bg-rose-50 border-0 rounded-2xl font-black text-rose-600 shadow-inner focus:ring-2 focus:ring-rose-400 outline-none transition" 
                            value={adjData.deduction}
                            onChange={e => setAdjData(prev => ({...prev, deduction: parseFloat(e.target.value) || 0}))}
                          />
                       </div>
                    </div>
                    
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Adjustment Remarks</label>
                       <textarea 
                         className="w-full px-4 py-3 bg-slate-50 border-0 rounded-2xl font-semibold text-slate-600 shadow-inner focus:ring-2 focus:ring-primary-400 outline-none transition resize-none h-24" 
                         placeholder="Reason for adjustment..."
                         value={adjData.remarks}
                         onChange={e => setAdjData(prev => ({...prev, remarks: e.target.value}))}
                       />
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                       <button onClick={() => setAdjustingSlip(null)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition">Discard</button>
                       <button 
                         onClick={handleSaveAdjustment} 
                         disabled={isSavingAdj}
                         className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition flex items-center justify-center gap-2"
                       >
                          {isSavingAdj ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        )}
    </div>
  );
}

function SalaryStructures() {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const [structures, setStructures] = useState<SalaryStructureDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(() => {
    setIsLoading(true);
    payrollApi.getStructures().then(setStructures).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<SalaryStructureDto | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this structure?')) {
      payrollApi.deleteStructure(id).then(loadData);
    }
  };

  const handleEdit = (ss: SalaryStructureDto) => {
    setEditingStructure(ss);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingStructure(null);
    setIsModalOpen(true);
  };

  if (isLoading) return (
     <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-black text-xs uppercase tracking-widest animate-pulse">Fetching Schemes...</p>
     </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Salary Configurations</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Define pay scales and component breakdowns</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition flex items-center gap-3 shadow-2xl shadow-slate-200 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> New Structure
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {structures.map(ss => (
          <div key={ss.id} className="relative bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group overflow-hidden">
             <div className="absolute top-0 right-0 p-8 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <button onClick={() => handleEdit(ss)} className="p-3 bg-white shadow-lg rounded-xl text-slate-400 hover:text-primary-600 transition">
                   <Settings className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(ss.id)} className="p-3 bg-white shadow-lg rounded-xl text-slate-400 hover:text-rose-500 transition">
                   <Trash2 className="w-4 h-4" />
                </button>
             </div>

             <div className="flex items-center gap-4 mb-8">
                <div className={`h-3 w-3 rounded-full ${ss.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <h3 className="text-xl font-black text-slate-800">{ss.name}</h3>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pay</p>
                   <p className="text-xl font-black text-slate-800">{formatCurrency(ss.netTotal)}</p>
                </div>
                <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-50">
                   <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">Earnings</p>
                   <p className="text-xl font-black text-emerald-600">{formatCurrency(ss.totalEarnings)}</p>
                </div>
                <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-50">
                   <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest mb-1">Deductions</p>
                   <p className="text-xl font-black text-rose-600">{formatCurrency(ss.totalDeductions)}</p>
                </div>
             </div>

             <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Components Breakdown</p>
                <div className="flex flex-wrap gap-2">
                   {ss.components.slice(0, 4).map((c, idx) => (
                      <span key={idx} className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 border ${c.type === SalaryComponentType.Earning ? 'bg-emerald-50/50 text-emerald-700 border-emerald-100' : 'bg-rose-50/50 text-rose-700 border-rose-100'}`}>
                         {c.name}: {formatCurrency(c.amount)}
                      </span>
                   ))}
                   {ss.components.length > 4 && (
                      <span className="px-3 py-1.5 rounded-xl text-[10px] font-extrabold bg-slate-50 text-slate-400 border border-slate-100">
                         +{ss.components.length - 4} More
                      </span>
                   )}
                </div>
             </div>

             <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">{ss.description || 'No description provided'}</p>
                <button onClick={() => handleEdit(ss)} className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] flex items-center gap-1 hover:gap-2 transition-all">
                   Manage Scale <ArrowRight className="w-3.5 h-3.5" />
                </button>
             </div>
          </div>
        ))}
        
        <button 
          onClick={handleAddNew}
          className="border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-slate-300 hover:border-primary-200 hover:text-primary-300 hover:bg-primary-50/20 transition-all group"
        >
          <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Plus className="w-8 h-8" />
          </div>
          <p className="font-black text-sm uppercase tracking-widest">Add New Pay Scale</p>
        </button>
      </div>

      {isModalOpen && (
        <UpsertSalaryStructureModal 
          structure={editingStructure} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); loadData(); }} 
        />
      )}
    </div>
  );
}

function ProcessPayroll({ onSuccess }: { onSuccess: () => void }) {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const [data, setData] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, remarks: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      await payrollApi.processPayroll(data);
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data || "Failed to process payroll.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] border border-slate-100 p-12 shadow-2xl shadow-slate-200">
       <div className="text-center mb-10">
          <div className="h-20 w-20 rounded-[2rem] bg-primary-600 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-200 animate-bounce-subtle">
             <Calculator className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Run Monthly Payroll</h2>
          <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Automated Salary Generator</p>
       </div>

       <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Select Year</label>
                <select className="w-full px-5 py-4 bg-slate-50 border-0 rounded-[1.5rem] font-black text-slate-800 shadow-inner focus:ring-2 focus:ring-primary-400 outline-none transition" value={data.year} onChange={e => setData({...data, year: parseInt(e.target.value)})}>
                  {[0,1,2].map(i => <option key={i} value={2026-i}>{2026-i}</option>)}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Select Month</label>
                <select className="w-full px-5 py-4 bg-slate-50 border-0 rounded-[1.5rem] font-black text-slate-800 shadow-inner focus:ring-2 focus:ring-primary-400 outline-none transition" value={data.month} onChange={e => setData({...data, month: parseInt(e.target.value)})}>
                  {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Process Remarks</label>
             <textarea 
               className="w-full px-6 py-4 bg-slate-50 border-0 rounded-[1.5rem] font-bold text-slate-600 shadow-inner focus:ring-2 focus:ring-primary-400 outline-none transition resize-none h-32" 
               placeholder="Example: March 2026 Full Cycle..."
               value={data.remarks}
               onChange={e => setData({...data, remarks: e.target.value})}
             />
          </div>

          <button 
            onClick={handleProcess} 
            disabled={isProcessing}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-slate-800 transition shadow-2xl shadow-slate-300 flex items-center justify-center gap-3 active:scale-95 duration-100"
          >
             {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Plus className="w-5 h-5" /> Initialize Run</>}
          </button>
       </div>
    </div>
  );
}

function SalarySlipModal({ detail, run, employeeName, employeeCode, onClose }: { detail: any, run?: any, employeeName?: string, employeeCode?: string, onClose: () => void }) {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const components = JSON.parse(detail.componentBreakdownDetails || '[]');
  const earnings = components.filter((c: any) => c.Type === 'Earning');
  const deductions = components.filter((c: any) => c.Type === 'Deduction');

  const print = () => window.print();

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 no-print">
       <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
       <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 slip-print-container">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary-600 text-white rounded-xl flex items-center justify-center">
                   <Printer className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="font-black text-slate-800">Salary Slip Preview</h4>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Ready for Print or PDF Export</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <button onClick={print} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-2">
                   <Printer className="w-4 h-4" /> Print now
                </button>
                <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition">&times;</button>
             </div>
          </div>

          <div className="p-10 flex-grow overflow-y-auto bg-white slip-inner">
             <div className="text-center mb-10 pb-10 border-b border-slate-100 border-dashed">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Salary Statement</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="h-1 w-1 bg-primary-400 rounded-full" />
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">{new Date(0, (run?.month || detail.month) - 1).toLocaleString('default', { month: 'long' })} {run?.year || detail.year}</p>
                  <span className="h-1 w-1 bg-primary-400 rounded-full" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-10 mb-12">
                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Staff Details</p>
                   <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Name</p>
                        <p className="text-lg font-black text-slate-800 leading-none">{employeeName || detail.employeeName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Staff Code</p>
                        <p className="text-sm font-bold text-slate-600 leading-none">{employeeCode || detail.employeeCode}</p>
                      </div>
                   </div>
                </div>
                <div className="p-6">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Summary</p>
                   <div className="space-y-3">
                      <div className="flex justify-between">
                         <span className="text-sm font-medium text-slate-500">Statement #</span>
                         <span className="text-sm font-bold text-slate-800">{detail.id.split('-')[0].toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-sm font-medium text-slate-500">Payment Mode</span>
                         <span className="text-sm font-bold text-slate-800">Bank Transfer</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-sm font-medium text-slate-500">Gross Amount</span>
                         <span className="text-sm font-bold text-slate-800">{formatCurrency(detail.grossSalary)}</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-4">
                   <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-2">Earnings (+)</h5>
                   <div className="space-y-3 pr-4">
                      {earnings.map((e: any, i: number) => (
                         <div key={i} className="flex justify-between items-center text-sm font-medium">
                            <span className="text-slate-600">{e.Name}</span>
                            <span className="text-emerald-600 font-bold">{formatCurrency(e.Amount)}</span>
                         </div>
                      ))}
                      {detail.adjustmentEarnings > 0 && (
                        <div className="flex justify-between items-center text-sm font-medium bg-emerald-50/50 p-2 rounded-lg -mx-2 border border-emerald-50">
                           <span className="text-emerald-700 font-bold">Adjustments / Reimb.</span>
                           <span className="text-emerald-600 font-bold">{formatCurrency(detail.adjustmentEarnings)}</span>
                        </div>
                      )}
                      <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between font-black">
                         <span className="text-slate-800">Total Earnings</span>
                         <span className="text-slate-800">{formatCurrency(detail.grossSalary + detail.adjustmentEarnings)}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest border-b border-rose-100 pb-2">Deductions (-)</h5>
                   <div className="space-y-3 pr-4">
                      {deductions.map((d: any, i: number) => (
                         <div key={i} className="flex justify-between items-center text-sm font-medium">
                            <span className="text-slate-600">{d.Name}</span>
                            <span className="text-rose-600 font-bold">{formatCurrency(d.Amount)}</span>
                         </div>
                      ))}
                      {detail.adjustmentDeductions > 0 && (
                        <div className="flex justify-between items-center text-sm font-medium bg-rose-50/50 p-2 rounded-lg -mx-2 border border-rose-50">
                           <span className="text-rose-700 font-bold">Adjustments / Cuts</span>
                           <span className="text-rose-600 font-bold">{formatCurrency(detail.adjustmentDeductions)}</span>
                        </div>
                      )}
                      <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between font-black">
                         <span className="text-slate-800">Total Deductions</span>
                         <span className="text-slate-800">{formatCurrency(detail.totalDeductions + detail.adjustmentDeductions)}</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-primary-600 p-8 rounded-[2rem] text-white shadow-2xl shadow-primary-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div>
                      <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest mb-1">Net Monthly Payout</p>
                      <h4 className="text-4xl font-black tracking-tighter">{formatCurrency(detail.netSalary)}</h4>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest mb-1">In Words</p>
                      <p className="text-sm font-bold opacity-90 break-words">{formatCurrency(detail.netSalary)} Rupees Only</p>
                   </div>
                </div>
             </div>

             {detail.adjustmentRemarks && (
               <div className="mt-10 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-500 italic text-xs leading-relaxed">
                  Note: {detail.adjustmentRemarks}
               </div>
             )}

             <div className="mt-16 flex justify-between pt-10 border-t border-slate-100">
                <div className="text-center">
                   <div className="h-0.5 w-32 bg-slate-200 mb-2 mx-auto" />
                   <p className="text-[10px] font-bold text-slate-400 uppercase uppercase tracking-widest">Office Stamp</p>
                </div>
                <div className="text-center">
                   <div className="h-0.5 w-32 bg-slate-200 mb-2 mx-auto" />
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signature of Receiver</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function UpsertSalaryStructureModal({ structure, onClose, onSuccess }: { structure: SalaryStructureDto | null, onClose: () => void, onSuccess: () => void }) {
  const { formatCurrency, settings } = useLocalization();
  const [name, setName] = useState(structure?.name || '');
  const [description, setDescription] = useState(structure?.description || '');
  const [isActive, setIsActive] = useState(structure?.isActive ?? true);
  const [components, setComponents] = useState<{name: string, type: number, amount: number}[]>(() => {
    if (structure?.components && structure.components.length > 0) {
      return structure.components.map(c => ({ name: c.name, type: c.type, amount: c.amount }));
    }
    return [{ name: 'Basic Salary', type: SalaryComponentType.Earning, amount: 0 }];
  });
  const [isSaving, setIsSaving] = useState(false);

  const addComponent = (type: number) => setComponents([...components, { name: '', type, amount: 0 }]);
  const removeComponent = (index: number) => setComponents(components.filter((_, i) => i !== index));
  const updateComponent = (index: number, field: string, value: any) => {
    const updated = [...components];
    (updated[index] as any)[field] = value;
    setComponents(updated);
  };

  const handleSave = async () => {
    if (!name) return alert("Please enter a structure name.");
    setIsSaving(true);
    try {
      const data = { name, description, isActive, components };
      if (structure) {
        await payrollApi.updateStructure(structure.id, data);
      } else {
        await payrollApi.createStructure(data);
      }
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data || "Failed to save structure.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalEarnings = components.filter(c => c.type === SalaryComponentType.Earning).reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalDeductions = components.filter(c => c.type === SalaryComponentType.Deduction).reduce((sum, c) => sum + (c.amount || 0), 0);
  const netTotal = totalEarnings - totalDeductions;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Compact Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">{structure ? 'Edit' : 'New'} Pay Scale</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configure earnings & deductions</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-900 transition-colors font-black text-xl">&times;</button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 space-y-8">
          
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-3 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scheme Name</label>
              <input 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-primary-400 outline-none transition" 
                placeholder="Senior Staff Scale..." 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <button 
                onClick={() => setIsActive(!isActive)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}
              >
                {isActive ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {isActive ? 'Active' : 'Paused'}
              </button>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="grid grid-cols-2 gap-8">
            
            {/* Earnings */}
            <div className="space-y-4">
               <div className="flex items-center justify-between bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50">
                  <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Earnings (+)</h4>
                  <button onClick={() => addComponent(SalaryComponentType.Earning)} className="text-emerald-600 hover:scale-110 transition"><Plus className="w-4 h-4" /></button>
               </div>

               <div className="space-y-3">
                  {components.filter(c => c.type === SalaryComponentType.Earning).map((c) => {
                     const realIdx = components.indexOf(c);
                     return (
                        <div key={realIdx} className="group flex gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all">
                           <input 
                              className="flex-grow px-3 py-1.5 bg-transparent border-0 font-bold text-slate-700 text-xs outline-none" 
                              placeholder="Label" 
                              value={c.name}
                              onChange={e => updateComponent(realIdx, 'name', e.target.value)}
                           />
                           <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-[10px]">{settings?.currencySymbol || "₹"}</span>
                              <input 
                                 type="number"
                                 className="w-24 pl-5 pr-3 py-2 bg-white rounded-lg font-black text-emerald-600 text-right text-xs outline-none border border-slate-100"
                                 value={c.amount}
                                 onChange={e => updateComponent(realIdx, 'amount', parseFloat(e.target.value) || 0)}
                              />
                           </div>
                           <button onClick={() => removeComponent(realIdx)} className="p-2 text-slate-200 hover:text-rose-400 transition">
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* Deductions */}
            <div className="space-y-4">
               <div className="flex items-center justify-between bg-rose-50/30 p-4 rounded-xl border border-rose-100/50">
                  <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Deductions (-)</h4>
                  <button onClick={() => addComponent(SalaryComponentType.Deduction)} className="text-rose-600 hover:scale-110 transition"><Plus className="w-4 h-4" /></button>
               </div>

               <div className="space-y-3">
                  {components.filter(c => c.type === SalaryComponentType.Deduction).map((c) => {
                     const realIdx = components.indexOf(c);
                     return (
                        <div key={realIdx} className="group flex gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-rose-200 transition-all">
                           <input 
                              className="flex-grow px-3 py-1.5 bg-transparent border-0 font-bold text-slate-700 text-xs outline-none" 
                              placeholder="Label" 
                              value={c.name}
                              onChange={e => updateComponent(realIdx, 'name', e.target.value)}
                           />
                           <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-rose-500 font-bold text-[10px]">{settings?.currencySymbol || "₹"}</span>
                              <input 
                                 type="number"
                                 className="w-24 pl-5 pr-3 py-2 bg-white rounded-lg font-black text-rose-600 text-right text-xs outline-none border border-slate-100"
                                 value={c.amount}
                                 onChange={e => updateComponent(realIdx, 'amount', parseFloat(e.target.value) || 0)}
                              />
                           </div>
                           <button onClick={() => removeComponent(realIdx)} className="p-2 text-slate-200 hover:text-rose-400 transition">
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     );
                  })}
               </div>
            </div>
          </div>
        </div>

        {/* Clean & Compact Footer */}
        <div className="px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-slate-900 rounded-xl text-white">
                 <p className="text-[8px] font-black opacity-40 uppercase tracking-widest">Net Payout</p>
                 <p className="text-lg font-black tracking-tight">{formatCurrency(netTotal)}</p>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                 {components.length} Items
              </div>
           </div>

           <div className="flex items-center gap-4">
              <button onClick={onClose} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancel</button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-700 transition shadow-lg shadow-primary-200 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Structure'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
