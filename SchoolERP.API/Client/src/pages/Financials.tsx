import { useState, useEffect } from 'react';
import { 
  TrendingUp, AlertCircle, 
  Plus, Download, Search,
  ArrowDownRight, FileText,
  LayoutDashboard, Settings,
  Activity, PieChart, Coins, Receipt, Landmark,
  CheckCircle2
} from 'lucide-react';
import { financialsApi } from '../api/financialsApi';
import { masterApi } from '../api/masterApi';
import { GenericModal } from '../components/GenericModal';

// Shared Metric Component for Premium Feel
const MetricCard = ({ label, value, trend, icon: Icon, color, red = false }: any) => (
  <div className="glass-card p-6 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border-none ring-1 ring-slate-100/50">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${color} shadow-lg shadow-current/10 animate-in zoom-in-50 duration-700`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex flex-col items-end">
        <span className={`text-[10px] font-black uppercase tracking-widest ${
          trend.toString().includes('+') || parseFloat(trend) > 0 ? 'text-emerald-500' : red ? 'text-rose-500' : 'text-slate-400'
        }`}>
          {trend}
        </span>
        {trend.toString().includes('%') && (
           <div className={`h-1 w-12 rounded-full mt-1 ${trend.toString().includes('+') ? 'bg-emerald-100' : 'bg-rose-100'}`}>
              <div className={`h-full rounded-full ${trend.toString().includes('+') ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: '65%' }} />
           </div>
        )}
      </div>
    </div>
    <div className="mt-5">
      <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">{label}</p>
      <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</p>
    </div>
  </div>
);

export default function Financials() {
  const [activeTab, setActiveTab] = useState<'overview' | 'fee-setup' | 'billing' | 'defaulters' | 'expenses'>('overview');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  
  const [expenseForm, setExpenseForm] = useState({
    category: 'Utility',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    referenceNumber: ''
  });

  const [incomeForm, setIncomeForm] = useState({
    category: 'Donation',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    referenceNumber: ''
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await masterApi.getAll('academic-years');
        setSessions(data);
        const current = data.find((s: any) => s.isCurrent);
        if (current) setSelectedSession(current.id);
      } catch (err) {
        console.error('Failed to load sessions:', err);
      }
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession || sessions.length === 0) {
      loadData();
    }
  }, [selectedSession]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sum, def, exp, heads] = await Promise.all([
        financialsApi.getSummary(selectedSession),
        financialsApi.getDefaulters(selectedSession),
        financialsApi.getExpenses(),
        masterApi.getAll('fee/heads')
      ]);
      setSummary(sum);
      setDefaulters(def);
      setExpenses(exp);
      setFeeHeads(heads);
    } catch (err) {
      console.error('Failed to load financials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financialsApi.logExpense({ ...expenseForm, academicYearId: selectedSession });
      setIsExpenseModalOpen(false);
      loadData();
    } catch (err) {
      alert('Failed to log expense');
    }
  };

  const handleLogIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financialsApi.logIncome({ ...incomeForm, academicYearId: selectedSession });
      setIsIncomeModalOpen(false);
      loadData();
    } catch (err) {
      alert('Failed to log income');
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <Landmark className="h-12 w-12 text-slate-200 mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Fiscal Core...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-1000">
       
       {/* Module Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="space-y-1">
             <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                <div className="p-3 bg-slate-900 rounded-[2rem] shadow-2xl rotate-3">
                   <Landmark className="h-8 w-8 text-indigo-400" />
                </div>
                Finance Center
             </h1>
             <p className="text-sm text-slate-400 font-bold ml-1 tracking-tight flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                Real-time Fiscal Health & Fee Analytics
             </p>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiscal Session</span>
                 <select 
                   value={selectedSession}
                   onChange={(e) => setSelectedSession(e.target.value)}
                   className="bg-white border-2 border-slate-100 rounded-2xl px-4 py-2 text-sm font-black text-slate-900 focus:border-indigo-500 outline-none transition-all shadow-sm cursor-pointer"
                 >
                    {sessions.map(s => (
                      <option key={s.id} value={s.id}>{s.name} {s.isCurrent ? '(Current)' : ''}</option>
                    ))}
                 </select>
              </div>
              <div className="h-10 w-[2px] bg-slate-100 hidden md:block" />
              <div className="flex items-center gap-3">
                 <button
                   onClick={() => setIsIncomeModalOpen(true)}
                   className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-[1.5rem] text-sm font-black shadow-xl shadow-emerald-500/10 hover:scale-[1.03] transition-all"
                 >
                    <TrendingUp className="h-4 w-4" /> Log Income
                 </button>
                 <button 
                   onClick={() => setIsExpenseModalOpen(true)}
                   className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-[1.5rem] text-sm font-black shadow-2xl shadow-slate-200 hover:scale-[1.03] active:scale-95 transition-all"
                 >
                    <Plus className="h-4 w-4" /> Log Expense
                 </button>
              </div>
           </div>
       </div>

       {/* Top Metrics Grid */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard label="Total Revenue" value={`₹${summary?.totalRevenueYTD.toLocaleString()}`} trend="+Active" icon={TrendingUp} color="bg-emerald-500" />
          <MetricCard label="Total Expenses" value={`₹${summary?.totalExpensesYTD.toLocaleString()}`} trend="Operational" icon={ArrowDownRight} color="bg-rose-500" red={summary?.totalExpensesYTD > 0} />
          <MetricCard label="Net Balance" value={`₹${summary?.netProfit.toLocaleString()}`} trend="Liquid" icon={Coins} color="bg-indigo-600" />
          <MetricCard label="Collection Rate" value={`${summary?.overallCollectionRate}%`} trend="Overall" icon={PieChart} color="bg-amber-500" />
       </div>

       {/* Primary Navigation Tabs */}
       <div className="flex border-b border-slate-200 gap-10 overflow-x-auto no-scrollbar px-1">
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'defaulters', label: 'Arrears Log', icon: AlertCircle },
            { id: 'expenses', label: 'Office Ledger', icon: FileText },
            { id: 'fee-setup', label: 'Fee Policy', icon: Settings },
            { id: 'billing', label: 'Billing Logs', icon: Receipt },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-2 pb-5 text-xs transition-all tracking-widest uppercase font-black relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}>
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-300'}`} />
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full animate-in slide-in-from-left duration-300" />}
            </button>
          ))}
       </div>

       {/* Dashboard Tab */}
       {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-5 duration-700">
             <div className="lg:col-span-2 space-y-8">
                {/* Revenue Sources */}
                <div className="glass-card p-8 border-none ring-1 ring-slate-100 shadow-sm">
                   <div className="flex justify-between items-center mb-10">
                      <div>
                         <h3 className="text-xl font-black text-slate-800 tracking-tight">Income Distribution</h3>
                         <p className="text-sm text-slate-400 font-bold">Primary revenue streams catalog</p>
                      </div>
                   </div>
                   <div className="space-y-6">
                      {summary?.revenueSources.map((item: any, i: number) => (
                        <div key={i} className="space-y-3">
                           <div className="flex justify-between items-end">
                              <p className="text-sm font-black text-slate-700">{item.category}</p>
                              <div className="flex items-center gap-3">
                                 <span className="text-sm font-black text-slate-900">₹{item.amount.toLocaleString()}</span>
                                 <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{item.percentage}%</span>
                              </div>
                           </div>
                           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                              <div className={`h-full ${item.color} rounded-full transition-all duration-1000 delay-300`} style={{ width: `${item.percentage}%` }} />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Recent Transactions List */}
                <div className="glass-card overflow-hidden border-none ring-1 ring-slate-100 shadow-sm">
                   <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                      <h3 className="text-lg font-black text-slate-800">Recent Transactions</h3>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead className="bg-slate-50/50">
                            <tr>
                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Party/Member</th>
                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {summary?.recentTransactions.map((row: any, i: number) => (
                               <tr key={i} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                                  <td className="px-6 py-4">
                                     <p className="text-sm font-black text-slate-800">{row.description}</p>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tighter">
                                       {new Date(row.date).toLocaleDateString()}
                                     </p>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-500 font-bold">{row.source}</td>
                                  <td className="px-6 py-4">
                                     <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-400 rounded-full uppercase tracking-widest group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        {row.method}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <span className={`text-sm font-black ${row.type === 'Credit' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {row.type === 'Credit' ? '+' : '-'}{row.amount.toLocaleString()}
                                     </span>
                                  </td>
                                </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>

             <div className="space-y-8">
                {/* Liquidity Card */}
                <div className="glass-card p-6 bg-indigo-600 text-white border-none shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                   <h4 className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">System Liquidity</h4>
                   <p className="text-4xl font-black mt-3 flex items-start gap-1">
                      <span className="text-lg mt-1 font-bold opacity-50">₹</span>
                      {summary?.netProfit ? (summary.netProfit / 1000000).toFixed(2) : '0.00'}<span className="text-2xl mt-2 opacity-60 ml-0.5">M</span>
                   </p>
                   <p className="text-xs font-bold mt-2 opacity-60">Current liquid reserves across all accounts.</p>
                </div>

                <div className="glass-card p-8 border-none ring-1 ring-slate-100 shadow-sm">
                   <div className="flex justify-between items-center mb-6">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Fee Catalog</h4>
                   </div>
                   <div className="space-y-4">
                      {feeHeads.slice(0, 5).map((head, idx) => (
                         <div key={idx} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                            <div>
                               <p className="text-xs font-black text-slate-800">{head.name}</p>
                               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">
                                 {head.isSelective ? 'Subscription' : 'Mandatory'}
                               </p>
                            </div>
                            <span className={`h-2 w-2 rounded-full ${head.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                         </div>
                      ))}
                   </div>
                   <button onClick={() => window.location.href = '/fees/heads'} className="w-full mt-6 py-4 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Go to Master Config</button>
                </div>
             </div>
          </div>
       )}

       {/* Defaulter Tab */}
       {activeTab === 'defaulters' && (
          <div className="glass-card overflow-hidden border-none ring-1 ring-slate-100 shadow-sm animate-in zoom-in-95 duration-500">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-rose-50/30">
                <div>
                   <h3 className="text-2xl font-black text-rose-600 tracking-tighter uppercase">Arrears & Pending Dues</h3>
                   <p className="text-xs text-rose-400 font-bold uppercase tracking-widest mt-1">Students with outstanding balance &gt; ₹500</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                   <AlertCircle className="h-6 w-6" />
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50">
                      <tr>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Adm No</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Balance Due</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {defaulters.map((d, i) => (
                         <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-5 font-black text-slate-800">{d.fullName}</td>
                            <td className="px-8 py-5 text-sm text-slate-500 font-mono">{d.admissionNo}</td>
                            <td className="px-8 py-5 font-bold text-slate-600 underline decoration-slate-200 underline-offset-4">{d.className}</td>
                            <td className="px-8 py-5 text-right font-black text-rose-600 text-lg">₹{d.outstandingAmount.toLocaleString()}</td>
                            <td className="px-8 py-5 text-center">
                               <button 
                                 onClick={() => window.location.href = `/fees/student/${d.studentId}`}
                                 className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors"
                               >
                                 Open Ledger
                               </button>
                            </td>
                         </tr>
                      ))}
                      {defaulters.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-20 text-center">
                             <CheckCircle2 className="h-12 w-12 text-emerald-100 mx-auto mb-4" />
                             <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No defaulters found! Financial health is optimal.</p>
                          </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
       )}

       {/* Expense Ledger Tab */}
       {activeTab === 'expenses' && (
          <div className="space-y-6 animate-in slide-in-from-right-10 duration-700">
             <div className="glass-card p-6 border-none ring-1 ring-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative flex-1">
                   <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold outline-none" placeholder="Search expenses..." />
                </div>
                <button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-black">
                   <Plus className="h-4 w-4" /> Log New Expense
                </button>
             </div>

             <div className="glass-card border-none ring-1 ring-slate-100 overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-slate-50">
                      <tr>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {expenses.map((ex) => (
                         <tr key={ex.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5">
                               <p className="text-sm font-black text-slate-800">{ex.description}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(ex.date).toLocaleDateString()}</p>
                            </td>
                            <td className="px-6 py-5">
                               <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-full uppercase tracking-widest">{ex.category}</span>
                            </td>
                            <td className="px-6 py-5 font-bold text-slate-500 text-xs uppercase tracking-tighter">{ex.paymentMethod}</td>
                            <td className="px-6 py-5 text-right font-black text-rose-500 text-sm italic">₹{ex.amount.toLocaleString()}</td>
                         </tr>
                      ))}
                      {expenses.length === 0 && (
                        <tr>
                           <td colSpan={4} className="p-20 text-center text-slate-400 italic">No expenses recorded yet.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
       )}

       {/* Placeholder for other tabs */}
       {['fee-setup', 'billing'].includes(activeTab) && (
          <div className="glass-card p-24 text-center border-none ring-1 ring-slate-100/50">
             <div className="h-20 w-20 rounded-[2rem] bg-slate-50 text-slate-200 flex items-center justify-center mx-auto mb-6">
                <Settings className="h-10 w-10 opacity-10 animate-pulse" />
             </div>
             <h3 className="text-xl font-black text-slate-800 italic uppercase">Module Hub Under Sync</h3>
             <p className="text-[10px] text-slate-400 font-bold mt-2 tracking-[0.3em] uppercase">Use Sidebar "Accounts & Fees" for specific configs</p>
          </div>
       )}

       {/* Log Expense Modal */}
       <GenericModal 
         isOpen={isExpenseModalOpen} 
         onClose={() => setIsExpenseModalOpen(false)} 
         title="Log School Expense"
         icon={ArrowDownRight}
       >
          <form onSubmit={handleLogExpense} className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                   <input 
                     required
                     className="form-input" 
                     placeholder="Electricity Bill, Supplies, etc." 
                     value={expenseForm.description}
                     onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                   <select 
                     className="form-input"
                     value={expenseForm.category}
                     onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                   >
                      <option>Utility</option>
                      <option>Maintenance</option>
                      <option>Supplies</option>
                      <option>Marketing</option>
                      <option>Salary</option>
                      <option>Rent</option>
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount (₹)</label>
                   <input 
                     type="number" 
                     required
                     className="form-input" 
                     value={expenseForm.amount}
                     onChange={e => setExpenseForm({...expenseForm, amount: Number(e.target.value)})}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                   <input 
                     type="date" 
                     required
                     className="form-input" 
                     value={expenseForm.date}
                     onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Method</label>
                   <select 
                     className="form-input"
                     value={expenseForm.paymentMethod}
                     onChange={e => setExpenseForm({...expenseForm, paymentMethod: e.target.value})}
                   >
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>UPI</option>
                   </select>
                </div>
             </div>
             <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="btn-secondary flex-1 py-4">Discard</button>
                <button type="submit" className="btn-primary flex-1 bg-slate-900 py-4">Save Entry</button>
             </div>
          </form>
       </GenericModal>

       {/* Log Income Modal */}
       <GenericModal 
         isOpen={isIncomeModalOpen} 
         onClose={() => setIsIncomeModalOpen(false)} 
         title="Log Other Income"
         icon={TrendingUp}
       >
          <form onSubmit={handleLogIncome} className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Income Source</label>
                   <input 
                     required
                     className="form-input" 
                     placeholder="Canteen Revenue, Donations, Event Fees, etc." 
                     value={incomeForm.description}
                     onChange={e => setIncomeForm({...incomeForm, description: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                   <select 
                     className="form-input"
                     value={incomeForm.category}
                     onChange={e => setIncomeForm({...incomeForm, category: e.target.value})}
                   >
                      <option>Donation</option>
                      <option>Canteen</option>
                      <option>Fine</option>
                      <option>Bookshop</option>
                      <option>Events</option>
                      <option>Others</option>
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount (₹)</label>
                   <input 
                     type="number" 
                     required
                     className="form-input" 
                     value={incomeForm.amount}
                     onChange={e => setIncomeForm({...incomeForm, amount: Number(e.target.value)})}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date Received</label>
                   <input 
                     type="date" 
                     required
                     className="form-input" 
                     value={incomeForm.date}
                     onChange={e => setIncomeForm({...incomeForm, date: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Method</label>
                   <select 
                     className="form-input"
                     value={incomeForm.paymentMethod}
                     onChange={e => setIncomeForm({...incomeForm, paymentMethod: e.target.value})}
                   >
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>UPI</option>
                   </select>
                </div>
             </div>
             <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsIncomeModalOpen(false)} className="btn-secondary flex-1 py-4">Cancel</button>
                <button type="submit" className="btn-primary flex-1 bg-emerald-600 py-4">Save Income</button>
             </div>
          </form>
       </GenericModal>
    </div>
  );
}
