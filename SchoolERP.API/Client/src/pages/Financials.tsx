import { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Wallet, AlertCircle, 
  BarChart3, Plus, Download, Filter, Search,
  ArrowUpRight, ArrowDownRight, Printer, FileText,
  CreditCard, LayoutDashboard, History, Settings,
  Activity, PieChart, Coins, Receipt, Landmark
} from 'lucide-react';

// Shared Metric Component for Premium Feel
const MetricCard = ({ label, value, trend, icon: Icon, color, red = false }: any) => (
  <div className="glass-card p-6 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border-none ring-1 ring-slate-100/50">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${color} shadow-lg shadow-current/10 animate-in zoom-in-50 duration-700`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex flex-col items-end">
        <span className={`text-[10px] font-black uppercase tracking-widest ${
          trend.includes('+') ? 'text-emerald-500' : red ? 'text-rose-500' : 'text-slate-400'
        }`}>
          {trend}
        </span>
        {trend.includes('%') && (
           <div className={`h-1 w-12 rounded-full mt-1 ${trend.includes('+') ? 'bg-emerald-100' : 'bg-rose-100'}`}>
              <div className={`h-full rounded-full ${trend.includes('+') ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: '65%' }} />
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
  const [loading, setLoading] = useState(false);

  // Mock Data for Layout
  const feeHeads = [
    { id: '1', name: 'Admission Fee', frequency: 'One-time', amount: 5000 },
    { id: '2', name: 'Tuition Fee (Monthly)', frequency: 'Monthly', amount: 2500 },
    { id: '3', name: 'Transport Maintenance', frequency: 'Monthly', amount: 800 },
    { id: '4', name: 'Lab & Computer Fund', frequency: 'Termly', amount: 1500 },
  ];

  const expenses = [
    { id: 'e1', date: '21 Mar 2024', category: 'Utility', desc: 'Electricity Bill', amount: 4500, status: 'Paid' },
    { id: 'e2', date: '20 Mar 2024', category: 'Maintenance', desc: 'Plumbing Repairs', amount: 1200, status: 'Paid' },
    { id: 'e3', date: '19 Mar 2024', category: 'Marketing', desc: 'Social Media Ads', amount: 8000, status: 'Pending' },
    { id: 'e4', date: '15 Mar 2024', category: 'Supplies', desc: 'Whiteboard Markers', amount: 450, status: 'Paid' },
  ];

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
          
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-black text-slate-600 hover:border-indigo-200 transition-all group">
                <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" /> Export Statement
             </button>
             <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-[1.5rem] text-sm font-black shadow-2xl shadow-slate-200 hover:scale-[1.03] active:scale-95 transition-all">
                <Plus className="h-4 w-4" /> Log Income
             </button>
          </div>
       </div>

       {/* Top Metrics Grid */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard label="Total Revenue (YTD)" value="₹1,24,500" trend="+12.4% vs LY" icon={TrendingUp} color="bg-emerald-500" />
          <MetricCard label="Office Expenses" value="₹32,800" trend="-4% vs Prev" icon={ArrowDownRight} color="bg-rose-500" red />
          <MetricCard label="Net Profit" value="₹91,700" trend="Margin 73%" icon={Coins} color="bg-indigo-600" />
          <MetricCard label="Collection Rate" value="94.2%" trend="Targets: 95%" icon={PieChart} color="bg-amber-500" />
       </div>

       {/* Primary Navigation Tabs */}
       <div className="flex border-b border-slate-200 gap-10 overflow-x-auto no-scrollbar px-1">
          {[
            { id: 'overview', label: 'Financial Health', icon: LayoutDashboard },
            { id: 'fee-setup', label: 'Fee Rules', icon: Settings },
            { id: 'billing', label: 'Billing Center', icon: Receipt },
            { id: 'defaulters', label: 'Arrears Log', icon: AlertCircle },
            { id: 'expenses', label: 'Office Ledger', icon: FileText },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-2 pb-5 text-xs transition-all tracking-widest uppercase font-black relative ${
              activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}>
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-300'}`} />
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full animate-in slide-in-from-left duration-300" />}
            </button>
          ))}
       </div>

       {/* Dashboard Content */}
       {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-5 duration-700">
             
             {/* Left Column: Revenue Split */}
             <div className="lg:col-span-2 space-y-8">
                <div className="glass-card p-8 border-none ring-1 ring-slate-100 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
                      <BarChart3 className="h-32 w-32" />
                   </div>
                   <div className="flex justify-between items-center mb-10">
                      <div>
                         <h3 className="text-xl font-black text-slate-800 tracking-tight">Income Distribution</h3>
                         <p className="text-sm text-slate-400 font-bold">Primary revenue streams catalog</p>
                      </div>
                      <select className="bg-slate-50 border-none rounded-xl text-xs font-black uppercase tracking-tight py-2 pl-4 pr-10 outline-none ring-1 ring-slate-100 focus:ring-indigo-200 transition-all">
                         <option>Current Year</option>
                         <option>Last 30 Days</option>
                      </select>
                   </div>
                   <div className="space-y-6">
                      {[
                        { label: 'Tuition Fees', value: '₹84,200', pct: 68, color: 'bg-indigo-500' },
                        { label: 'Exam Fees', value: '₹12,400', pct: 10, color: 'bg-emerald-500' },
                        { label: 'Transport Fees', value: '₹18,500', pct: 15, color: 'bg-amber-500' },
                        { label: 'Others (Uniform/Library)', value: '₹9,400', pct: 7, color: 'bg-slate-500' },
                      ].map((item, i) => (
                        <div key={i} className="space-y-3">
                           <div className="flex justify-between items-end">
                              <p className="text-sm font-black text-slate-700">{item.label}</p>
                              <div className="flex items-center gap-3">
                                 <span className="text-sm font-black text-slate-900">{item.value}</span>
                                 <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{item.pct}%</span>
                              </div>
                           </div>
                           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                              <div className={`h-full ${item.color} rounded-full transition-all duration-1000 delay-300`} style={{ width: `${item.pct}%` }} />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Recent Transactions List */}
                <div className="glass-card overflow-hidden border-none ring-1 ring-slate-100 shadow-sm">
                   <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                      <h3 className="text-lg font-black text-slate-800">Operational History</h3>
                      <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline px-4 py-2 hover:bg-indigo-50 rounded-xl transition-all">Audit Vault</button>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left font-normal italic-normal">
                         <thead className="bg-slate-50/50">
                            <tr>
                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Credit/Debit</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {[
                               { desc: 'Monthly Fee (Mar)', type: 'Credit', source: 'Rahul Sharma', amount: '₹2,500', method: 'Online' },
                               { desc: 'Infrastructure Repair', type: 'Debit', source: 'Urban Services', amount: '-₹4,200', method: 'Cash' },
                               { desc: 'Exam Fee (T2)', type: 'Credit', source: 'Sneha Gupta', amount: '₹1,500', method: 'Offline' },
                               { desc: 'Salary Disbursement', type: 'Debit', source: 'Staff Payroll', amount: '-₹45,000', method: 'Bank' },
                            ].map((row, i) => (
                               <tr key={i} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                                  <td className="px-6 py-4">
                                     <p className="text-sm font-black text-slate-800">{row.desc}</p>
                                     <p className="text-[10px] text-slate-300 font-bold uppercase mt-0.5 tracking-tighter">TRX ID: #82910</p>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-500 font-bold">{row.source}</td>
                                  <td className="px-6 py-4">
                                     <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-400 rounded-full uppercase tracking-widest group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        {row.method}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <span className={`text-sm font-black ${row.type === 'Credit' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {row.amount}
                                     </span>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>

             {/* Right Column: Fee Setup Overview */}
             <div className="space-y-8">
                <div className="glass-card p-6 bg-indigo-600 text-white border-none shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                   <h4 className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">System Liquidity</h4>
                   <p className="text-4xl font-black mt-3 flex items-start gap-1">
                      <span className="text-lg mt-1 font-bold opacity-50">₹</span>
                      1.25<span className="text-2xl mt-2 opacity-60 ml-0.5">M</span>
                   </p>
                   <p className="text-xs font-bold mt-2 opacity-60">Projected yearly receivables based on current student count.</p>
                   <div className="mt-8 flex gap-3">
                      <button className="flex-1 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-indigo-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Deep Audit</button>
                      <button className="p-3 bg-white/20 backdrop-blur-md rounded-2xl hover:bg-white/30 transition-all"><ArrowUpRight className="h-4 w-4" /></button>
                   </div>
                </div>

                <div className="glass-card p-8 border-none ring-1 ring-slate-100 shadow-sm">
                   <div className="flex justify-between items-center mb-6">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Fee Catalog</h4>
                      <Plus className="h-4 w-4 text-slate-300 hover:text-indigo-600 cursor-pointer" />
                   </div>
                   <div className="space-y-4">
                      {feeHeads.map((head, idx) => (
                         <div key={idx} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                            <div>
                               <p className="text-xs font-black text-slate-800">{head.name}</p>
                               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">{head.frequency}</p>
                            </div>
                            <p className="text-sm font-black text-indigo-600">₹{head.amount}</p>
                         </div>
                      ))}
                   </div>
                   <button onClick={() => setActiveTab('fee-setup')} className="w-full mt-6 py-4 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Configure Fee Rules</button>
                </div>

                <div className="glass-card p-6 border-dashed border-2 border-slate-100 flex flex-col items-center justify-center py-12 group hover:border-indigo-200 transition-all cursor-pointer">
                   <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Printer className="h-5 w-5 text-slate-300 group-hover:text-indigo-600" />
                   </div>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Instant Ledger Print</p>
                </div>
             </div>
          </div>
       )}

       {/* Expense Ledger Content */}
       {activeTab === 'expenses' && (
          <div className="space-y-6 animate-in slide-in-from-right-10 duration-700 font-normal">
             <div className="glass-card p-6 border-none ring-1 ring-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative flex-1 group">
                   <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                   <input 
                      className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold placeholder:text-slate-300 outline-none ring-1 ring-slate-50 focus:ring-indigo-100 transition-all"
                      placeholder="Search expense archives (Description, Category, Voucher)..."
                   />
                </div>
                <div className="flex gap-2">
                   <button className="p-3.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"><Filter className="h-5 w-5" /></button>
                   <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl hover:scale-[1.02] transition-transform">
                      <Plus className="h-4 w-4" /> Log New Expense
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 glass-card border-none ring-1 ring-slate-100 overflow-hidden shadow-sm">
                   <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                      <h3 className="text-lg font-black text-slate-800 italic uppercase tracking-tighter">Debit Register</h3>
                      <p className="text-[10px] font-black text-slate-300">MARCH 2024</p>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead className="bg-slate-50/30">
                            <tr>
                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Item/Vendor</th>
                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Category</th>
                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Status</th>
                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Amount</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {expenses.map((ex, i) => (
                               <tr key={ex.id} className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-6 py-5">
                                     <p className="text-sm font-black text-slate-800">{ex.desc}</p>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 tracking-tighter">{ex.date}</p>
                                  </td>
                                  <td className="px-6 py-5">
                                     <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-full uppercase tracking-widest">
                                        {ex.category}
                                     </span>
                                  </td>
                                  <td className="px-6 py-5">
                                     <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${ex.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${ex.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{ex.status}</span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-5 text-right font-black text-slate-900 text-sm italic">
                                     ₹{ex.amount.toLocaleString()}
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>

                <div className="md:col-span-4 space-y-6">
                   <div className="glass-card p-8 bg-rose-50 border-rose-100 ring-1 ring-rose-100 border-none">
                      <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-4">Expense Analysis</h4>
                      <div className="space-y-4">
                         {[
                           { name: 'Fixed Costs', amount: '₹18,500', pct: 56, color: 'bg-rose-400' },
                           { name: 'Consumables', amount: '₹4,300', pct: 13, color: 'bg-rose-300' },
                           { name: 'Marketing', amount: '₹10,000', pct: 31, color: 'bg-rose-500' },
                         ].map((cat, i) => (
                            <div key={i} className="space-y-2">
                               <div className="flex justify-between text-xs font-black text-rose-900">
                                  <span>{cat.name}</span>
                                  <span>{cat.amount}</span>
                               </div>
                               <div className="h-1.5 w-full bg-rose-200/50 rounded-full overflow-hidden shadow-inner">
                                  <div className={`h-full ${cat.color} transition-all duration-1000`} style={{ width: `${cat.pct}%` }} />
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="glass-card p-6 border-none ring-1 ring-indigo-50 shadow-lg shadow-indigo-100/20 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
                      <div className="flex items-center gap-3 mb-6">
                         <PieChart className="h-5 w-5 opacity-60" />
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Profitability Ratio</span>
                      </div>
                      <div className="flex items-end gap-3">
                         <p className="text-4xl font-black italic">68.2<span className="text-2xl opacity-60 font-bold ml-1">%</span></p>
                         <div className="flex flex-col mb-1 animate-pulse">
                            <ArrowUpRight className="h-5 w-5 text-emerald-300" />
                            <span className="text-[10px] font-black text-emerald-300 uppercase">+2.1%</span>
                         </div>
                      </div>
                      <p className="mt-4 text-xs font-bold opacity-60 leading-relaxed italic">Healthy margin detected. Revenue streams are successfully covering operational debits with significant surplus.</p>
                      <button className="w-full mt-8 py-3 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:scale-[1.02] active:scale-95 transition-all">Download Audit Report</button>
                   </div>
                </div>
             </div>
          </div>
       )}

       {/* Placeholder for other tabs */}
       {['fee-setup', 'billing', 'defaulters'].includes(activeTab) && (
          <div className="glass-card p-24 text-center border-none ring-1 ring-slate-100/50">
             <div className="h-20 w-20 rounded-[2rem] bg-slate-50 text-slate-200 flex items-center justify-center mx-auto mb-6">
                <LayoutDashboard className="h-10 w-10 opacity-10 animate-pulse" />
             </div>
             <h3 className="text-xl font-black text-slate-800 italic uppercase">Module Component Syncing</h3>
             <p className="text-xs text-slate-400 font-bold mt-2 tracking-widest uppercase">Connecting to Real-time Liquidity Stream...</p>
          </div>
       )}

    </div>
  );
}
