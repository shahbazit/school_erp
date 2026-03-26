import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, XCircle, Clock, FileText, Plus,
  Loader2, Trash2, Edit2, Save, Calendar
} from 'lucide-react';
import {
  leaveApi,
  LeaveStatus,
  LeaveDayType,
  type LeaveTypeDto,
  type LeaveApplicationDto,
  type LeaveBalanceDto,
} from '../api/leaveApi';
import apiClient from '../api/apiClient';

const statusConfig = {
  [LeaveStatus.Pending]: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="w-4 h-4" /> },
  [LeaveStatus.Approved]: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4" /> },
  [LeaveStatus.Rejected]: { label: 'Rejected', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: <XCircle className="w-4 h-4" /> },
  [LeaveStatus.Cancelled]: { label: 'Cancelled', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <Trash2 className="w-4 h-4" /> },
};

export default function Leaves() {
  const [activeTab, setActiveTab] = useState<'my-leaves' | 'approvals' | 'balances'>('my-leaves');

  // Common State
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeDto[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/academicyears').then(res => {
      const active = res.data.find((y: any) => y.isActive);
      setActiveSession(active);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const loadLeaveTypes = async () => {
      try {
        const types = await leaveApi.getTypes();
        setLeaveTypes(types);
      } catch (err) {
        console.error("Failed to load leave types.", err);
      }
    };
    loadLeaveTypes();
  }, []);

  const token = localStorage.getItem('token');
  const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const role = (decodedToken?.Role || decodedToken?.role || decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 'Guest').toLowerCase();
  const canManage = role === 'admin' || role === 'hr';

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary-600" />
            Leave Management
          </h1>
          {activeSession && (
            <p className="text-sm font-bold text-primary-600 mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-600 animate-pulse" />
              Active Session: {activeSession.name}
            </p>
          )}
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('my-leaves')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'my-leaves' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>My Leaves</button>
          <button onClick={() => setActiveTab('approvals')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'approvals' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Approvals</button>
          <button onClick={() => setActiveTab('balances')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'balances' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Balances</button>
        </div>
      </div>

      {activeTab === 'my-leaves' && <MyLeaves leaveTypes={leaveTypes} />}
      {activeTab === 'approvals' && <Approvals />}
      {activeTab === 'balances' && <Balances leaveTypes={leaveTypes} canManage={canManage} />}
    </div>
  );
}

// ── Tab 1: My Leaves ──────────────────────────────────────────────────────
function MyLeaves({ leaveTypes }: { leaveTypes: LeaveTypeDto[] }) {
  const [applications, setApplications] = useState<LeaveApplicationDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const [applyData, setApplyData] = useState<any>({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    dayType: LeaveDayType.FullDay,
    reason: ''
  });

  const loadMyApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real app, passing employeeId from auth context, for now assuming backend infers current user
      const data = await leaveApi.getApplications(); 
      setApplications(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadMyApplications(); }, [loadMyApplications]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      await leaveApi.applyLeave(applyData);
      setShowApplyModal(false);
      setApplyData({ leaveTypeId: '', startDate: '', endDate: '', dayType: LeaveDayType.FullDay, reason: '' });
      loadMyApplications();
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
       <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Application History</h3>
          <button 
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" /> Apply for Leave
          </button>
       </div>

       <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10 text-center text-slate-400">Loading...</div>
          ) : applications.length === 0 ? (
            <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
              <FileText className="w-10 h-10 opacity-20" />
              <p>No leave applications found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3 border-b border-slate-100">Leave Type</th>
                  <th className="px-5 py-3 border-b border-slate-100">Duration</th>
                  <th className="px-5 py-3 border-b border-slate-100">Type</th>
                  <th className="px-5 py-3 border-b border-slate-100">Reason</th>
                  <th className="px-5 py-3 border-b border-slate-100">Status</th>
                  <th className="px-5 py-3 border-b border-slate-100">Applied On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-medium text-slate-800">{app.leaveTypeName}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(app.startDate).toLocaleDateString()} to {new Date(app.endDate).toLocaleDateString()}
                      <span className="block text-[10px] font-bold text-slate-400 mt-0.5">{app.totalDays} day(s)</span>
                    </td>
                    <td className="px-5 py-3">
                       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${app.dayType === 1 ? 'bg-slate-100 text-slate-600' : 'bg-primary-50 text-primary-600'}`}>
                          {app.dayType === 1 ? 'Full Day' : app.dayType === 4 ? 'Quarter' : 'Half Day'}
                       </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 italic max-w-xs truncate">{app.reason}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${statusConfig[app.status].color}`}>
                        {statusConfig[app.status].icon} {app.statusName}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400">{new Date(app.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
       </div>

       {/* Simple Modal */}
       {showApplyModal && (
         <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowApplyModal(false)} />
           <div className="relative bg-white shadow-2xl w-full lg:w-[60%] h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
             <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <h3 className="text-lg font-bold text-slate-800">Apply for Leave</h3>
               <button onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition">&times;</button>
             </div>
             <form onSubmit={handleApply} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Leave Type</label>
                  <select 
                    required 
                    value={applyData.leaveTypeId}
                    onChange={e => setApplyData((prev: any) => ({ ...prev, leaveTypeId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  >
                    <option value="">Select Type</option>
                    {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name} (Max: {t.maxDaysPerYear} days)</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Start Date</label>
                    <input 
                      type="date" 
                      required 
                      value={applyData.startDate}
                      onChange={e => setApplyData((prev: any) => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">End Date</label>
                    <input 
                      type="date" 
                      required 
                      value={applyData.endDate}
                      onChange={e => setApplyData((prev: any) => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" 
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Leave Duration</label>
                   <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Full Day', value: LeaveDayType.FullDay },
                        { label: 'First Half', value: LeaveDayType.FirstHalf },
                        { label: 'Second Half', value: LeaveDayType.SecondHalf },
                        { label: 'Quarter', value: LeaveDayType.Quarter },
                      ].map(opt => (
                        <button 
                          key={opt.value}
                          type="button"
                          onClick={() => setApplyData((p: any) => ({ ...p, dayType: opt.value }))}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            applyData.dayType === opt.value 
                              ? 'bg-primary-600 text-white border-primary-600 shadow-sm' 
                              : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300 hover:text-primary-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                   </div>
                   <p className="text-[10px] text-slate-400 mt-1.5 italic">Note: Choosing a partial day will automatically adjust the daily quota (e.g., 0.5 for Half Day).</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Reason</label>
                  <textarea 
                    rows={3} 
                    value={applyData.reason}
                    onChange={e => setApplyData((prev: any) => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 placeholder:text-slate-300" 
                    placeholder="Enter reason for leave..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                   <button type="button" onClick={() => setShowApplyModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition">Cancel</button>
                   <button type="submit" disabled={isApplying} className="flex-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-200 flex items-center justify-center gap-2">
                     {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                     Submit Application
                   </button>
                </div>
             </form>
           </div>
         </div>
       )}
    </div>
  );
}

// ── Tab 2: Approvals ──────────────────────────────────────────────────────
function Approvals() {
  const [applications, setApplications] = useState<LeaveApplicationDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadPending = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await leaveApi.getApplications({ status: LeaveStatus.Pending });
      setApplications(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadPending(); }, [loadPending]);

  const handleAction = async (id: string, status: LeaveStatus) => {
    setIsProcessing(true);
    try {
      await leaveApi.processLeave(id, { status, remarks: "Processed via dashboard" });
      loadPending();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
       <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Pending Approvals</h3>
       </div>
       <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-10 text-center text-slate-400">Loading...</div>
          ) : applications.length === 0 ? (
            <div className="p-10 text-center text-slate-400 italic">No pending applications found.</div>
          ) : (
            applications.map(app => (
              <div key={app.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                   <div className="h-10 w-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold">{app.employeeName[0]}</div>
                   <div>
                     <p className="font-bold text-slate-800">{app.employeeName} <span className="text-slate-400 font-medium ml-1">requested {app.leaveTypeName}</span></p>
                     <p className="text-sm text-slate-500">{new Date(app.startDate).toLocaleDateString()} to {new Date(app.endDate).toLocaleDateString()} ({app.totalDays} days)</p>
                     <p className="text-xs text-slate-400 italic bg-slate-50 px-2 py-1 rounded inline-block mt-2 font-mono">"{app.reason || 'No reason provided'}"</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <button disabled={isProcessing} onClick={() => handleAction(app.id, LeaveStatus.Approved)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Approve
                   </button>
                   <button disabled={isProcessing} onClick={() => handleAction(app.id, LeaveStatus.Rejected)} className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-semibold hover:bg-rose-100 transition flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> Reject
                   </button>
                </div>
              </div>
            ))
          )}
       </div>
    </div>
  );
}

// ── Tab 3: Balances ───────────────────────────────────────────────────────
function Balances({ leaveTypes, canManage }: { leaveTypes: LeaveTypeDto[]; canManage: boolean }) {
  const [balances, setBalances] = useState<LeaveBalanceDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingBalance, setEditingBalance] = useState<LeaveBalanceDto | null>(null);
  const [newTotal, setNewTotal] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [addForm, setAddForm] = useState({ leaveTypeId: '', totalDays: 0 });

  const fetchBalance = async () => {
    setIsLoading(true);
    try {
      const data = await leaveApi.getBalances();
      setBalances(data);
    } catch {
      alert("Failed to load balances.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBalance(); }, []);

  const handleUpdate = async () => {
    if (!editingBalance) return;
    setIsUpdating(true);
    try {
      await leaveApi.updateBalance({
        employeeId: editingBalance.employeeId,
        leaveTypeId: editingBalance.leaveTypeId,
        totalDays: newTotal
      });
      setEditingBalance(null);
      fetchBalance();
    } catch {
      alert("Failed to update balance.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await leaveApi.bulkInitializeBalances(addForm);
      setShowBulkAdd(false);
      setAddForm({ leaveTypeId: '', totalDays: 0 });
      fetchBalance();
      alert("Leave quotas initialized for all employees successfully!");
    } catch {
      alert("Failed to initialize bulk quotas.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {canManage && (
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm mb-4">
           <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">Administrator Controls</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Initialize yearly quotas for all active employees.</p>
           </div>
           <button 
             onClick={() => setShowBulkAdd(true)}
             className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-primary-200"
           >
              <Plus className="w-3.5 h-3.5" />
              Bulk Initialize Quotas
           </button>
        </div>
      )}

      {balances.length > 0 ? (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between mb-4 px-1">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">My Active Quotas</h4>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {balances.map(b => (
               <div key={b.id} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm relative overflow-hidden group hover:border-primary-200 transition-all">
                  <div className="flex items-start justify-between">
                     <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{b.leaveTypeName}</h4>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-100 w-fit">
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Remaining</span>
                           <span className="text-xs font-black text-slate-800">{b.remainingDays}</span>
                        </div>
                     </div>
                      {canManage && (
                        <button 
                          onClick={() => { setEditingBalance(b); setNewTotal(Number(b.totalDays)); }}
                          className="p-2 text-slate-300 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                        >
                           <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                  </div>

                  <div className="flex items-end justify-between mt-6">
                     <div>
                        <p className="text-2xl font-black text-slate-800 leading-none">{(b.totalDays - b.consumedDays).toFixed(0)}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Available Days</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 leading-none">{b.totalDays}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Total Allocation</p>
                     </div>
                  </div>

                  <div className="h-2 w-full bg-slate-100 rounded-full mt-5 overflow-hidden border border-slate-50">
                     <div className={`h-full rounded-full transition-all duration-1000 ${b.consumedDays/b.totalDays > 0.8 ? 'bg-rose-500' : 'bg-primary-600'}`} style={{ width: `${Math.min(100, (b.consumedDays/b.totalDays)*100)}%` }}></div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      ) : (
        <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
           {isLoading ? 'Fetching balances...' : 'No active leave balances found for current session.'}
        </div>
      )}

      {editingBalance && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setEditingBalance(null)} />
           <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                 <h3 className="text-lg font-black text-slate-800">Update Quota</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase">Adjusting: {editingBalance.leaveTypeName}</p>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Adjust Total Yearly Days</label>
                    <div className="flex items-center gap-4">
                       <input 
                         type="number"
                         value={newTotal}
                         onChange={e => setNewTotal(Number(e.target.value))}
                         className="flex-1 px-5 py-3 rounded-2xl border-0 bg-slate-50 font-black text-xl text-slate-800 focus:ring-2 focus:ring-primary-400 shadow-inner"
                       />
                       <span className="text-sm font-bold text-slate-400">Days</span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic mt-3 px-1 leading-relaxed border-l-2 border-slate-100 pl-3">Increasing this value will immediately increase the employee's available leave balance for the current academic session.</p>
                 </div>
                 
                 <div className="flex gap-3">
                    <button onClick={() => setEditingBalance(null)} className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition">Discard</button>
                    <button onClick={handleUpdate} disabled={isUpdating} className="flex-[2] py-3 px-4 bg-primary-600 text-white rounded-2xl text-sm font-black hover:bg-primary-700 transition shadow-xl shadow-primary-200 flex items-center justify-center gap-2">
                       {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                       Save Changes
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showBulkAdd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowBulkAdd(false)} />
           <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 text-center">
                 <h3 className="text-lg font-black text-slate-800">Bulk Initialize Leave Quotas</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase mt-1">Applying to ALL active employees</p>
              </div>
              <form onSubmit={handleBulkAdd} className="p-8 space-y-5">
                 <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-[10px] text-amber-600 font-bold leading-relaxed mb-2">
                    Note: This will only initialize balances for employees who don't already have one for the selected category in the current year.
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Leave Category</label>
                    <select 
                      required
                      value={addForm.leaveTypeId}
                      onChange={e => setAddForm((p: any) => ({ ...p, leaveTypeId: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border-0 bg-slate-50 font-bold text-sm text-slate-800 focus:ring-2 focus:ring-primary-400 shadow-inner"
                    >
                       <option value="">Select Category...</option>
                       {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Standard Yearly Allowance</label>
                    <input 
                      type="number"
                      required
                      value={addForm.totalDays}
                      onChange={e => setAddForm((p: any) => ({ ...p, totalDays: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-2xl border-0 bg-slate-50 font-black text-xl text-slate-800 focus:ring-2 focus:ring-primary-400 shadow-inner"
                    />
                 </div>
                 <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowBulkAdd(false)} className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition">Cancel</button>
                    <button type="submit" disabled={isUpdating} className="flex-[2] py-3 px-4 bg-emerald-600 text-white rounded-2xl text-sm font-black hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 flex items-center justify-center gap-2">
                       {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                       Process All Employees
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
