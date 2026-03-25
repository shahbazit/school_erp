import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, XCircle, Clock, FileText, Plus,
  Loader2, Search, Trash2
} from 'lucide-react';
import {
  leaveApi,
  LeaveStatus,
  type LeaveTypeDto,
  type LeaveApplicationDto,
  type LeaveBalanceDto,
} from '../api/leaveApi';

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

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Leave Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Apply for leaves or manage approvals</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('my-leaves')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'my-leaves' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>My Leaves</button>
          <button onClick={() => setActiveTab('approvals')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'approvals' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Approvals</button>
          <button onClick={() => setActiveTab('balances')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'balances' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Balances</button>
        </div>
      </div>

      {activeTab === 'my-leaves' && <MyLeaves leaveTypes={leaveTypes} />}
      {activeTab === 'approvals' && <Approvals />}
      {activeTab === 'balances' && <Balances />}
    </div>
  );
}

// ── Tab 1: My Leaves ──────────────────────────────────────────────────────
function MyLeaves({ leaveTypes }: { leaveTypes: LeaveTypeDto[] }) {
  const [applications, setApplications] = useState<LeaveApplicationDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const [applyData, setApplyData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
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
      setApplyData({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
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
                    onChange={e => setApplyData(prev => ({ ...prev, leaveTypeId: e.target.value }))}
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
                      onChange={e => setApplyData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">End Date</label>
                    <input 
                      type="date" 
                      required 
                      value={applyData.endDate}
                      onChange={e => setApplyData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Reason</label>
                  <textarea 
                    rows={3} 
                    value={applyData.reason}
                    onChange={e => setApplyData(prev => ({ ...prev, reason: e.target.value }))}
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
function Balances() {
  const [employeeId, setEmployeeId] = useState('');
  const [balances, setBalances] = useState<LeaveBalanceDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = async () => {
    if (!employeeId.trim()) return;
    setIsLoading(true);
    try {
      const data = await leaveApi.getBalances(employeeId);
      setBalances(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-4xl">
       <h3 className="text-lg font-bold text-slate-800 mb-4">Check Leave Balances</h3>
       <div className="flex gap-4 mb-8">
          <input 
            type="text" 
            placeholder="Enter Employee ID (GUID)"
            value={employeeId}
            onChange={e => setEmployeeId(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <button onClick={fetchBalance} disabled={isLoading} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition flex items-center gap-2">
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} View Balance
          </button>
       </div>

       {balances.length > 0 && (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
           {balances.map(b => (
             <div key={b.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 relative overflow-hidden group hover:shadow-md transition">
                <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-primary-100/30 rounded-full blur-2xl group-hover:bg-primary-200 transition"></div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{b.leaveTypeName}</h4>
                <div className="flex items-end justify-between mt-4">
                   <div>
                     <p className="text-2xl font-black text-slate-800">{b.remainingDays}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase">Days Remaining</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-bold text-slate-500">{b.totalDays}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase">Total Quota</p>
                   </div>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full mt-4 overflow-hidden">
                   <div className="h-full bg-primary-600 rounded-full" style={{ width: `${(b.consumedDays/b.totalDays)*100}%` }}></div>
                </div>
             </div>
           ))}
         </div>
       )}
    </div>
  );
}
