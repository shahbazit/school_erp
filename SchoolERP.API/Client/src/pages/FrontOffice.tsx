import { useState, useEffect } from 'react';
import { 
  Building2, Users, Search, Plus, Filter, 
  PhoneCall, Calendar, Mail, FileText, 
  MapPin, Clock, CheckCircle2, AlertCircle,
  MoreVertical, Edit3, Trash2, ArrowRight, ArrowUpRight,
  UserCheck, UserMinus, PhoneIncoming, MessageSquare,
  BarChart3, LifeBuoy, Zap, ChevronRight
} from 'lucide-react';

export default function FrontOffice() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'enquiries' | 'visitors' | 'calls' | 'complaints'>('dashboard');
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Mock Data
  useEffect(() => {
    setEnquiries([
      { id: '1', date: '2024-03-22', student: 'Aarav Mehta', parent: 'Sanjay Mehta', phone: '+91 98765 43210', class: '10th-A', status: 'Follow-up', source: 'Website', next: '2024-03-24' },
      { id: '2', date: '2024-03-21', student: 'Ishita Jain', parent: 'Anil Jain', phone: '+91 98111 22233', class: '8th-C', status: 'Converted', source: 'Referral', next: null },
      { id: '3', date: '2024-03-20', student: 'Kabir Singh', parent: 'Daljit Singh', phone: '+91 91234 56789', class: 'LKG', status: 'New', source: 'Social Media', next: '2024-03-22' },
    ]);
    
    setVisitors([
      { id: 'v1', name: 'Vivek Sharma', purpose: 'Fee Payment', whom: 'Accounts Dept', in: '10:30 AM', out: null, phone: '+91 98765 00000', idCard: 'AD-9201' },
      { id: 'v2', name: 'Pooja Gupta', purpose: 'Parent Teacher Meet', whom: 'Class Teacher 5B', in: '11:15 AM', out: '11:45 AM', phone: '+91 91234 11111', idCard: 'AD-9202' },
    ]);
  }, []);

  const metrics = [
    { label: 'Today\'s Enquiries', value: '12', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Visitors Checked-In', value: '4', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Follow-ups', value: '28', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Calls Today', value: '45', icon: PhoneCall, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-20 animate-in fade-in duration-700 font-normal">
       
       {/* Module Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3.5 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 ring-4 ring-white rotate-3">
                <Building2 className="h-8 w-8 text-white" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Front Office Desk</h1>
                <p className="text-sm text-slate-400 font-bold italic">Manage enquiries, visitors, and guest relations with elegance.</p>
             </div>
          </div>
          
          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:border-indigo-400 hover:shadow-lg transition-all">
                <BarChart3 className="h-4 w-4" /> CRM Analytics
             </button>
             <button className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all">
                <Plus className="h-4 w-4" /> Register Guest
             </button>
          </div>
       </div>

       {/* Tabs Navigation */}
       <div className="flex border-b border-slate-200 gap-10 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'dashboard', label: 'Reception Wall', icon: Zap },
            { id: 'enquiries', label: 'Admission Enquiries', icon: Users },
            { id: 'visitors', label: 'Visitor Register', icon: MapPin },
            { id: 'calls', label: 'Communications Log', icon: PhoneIncoming },
            { id: 'complaints', label: 'Resolution Center', icon: LifeBuoy },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-1 pb-4 text-[11px] transition-all tracking-[0.1em] uppercase font-black relative ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}>
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-200'}`} />
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full animate-in slide-in-from-left duration-300" />}
            </button>
          ))}
       </div>

       {/* Main Dashboard Section */}
       {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
             {/* Info Matrix */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {metrics.map((m, i) => (
                   <div key={i} className="glass-card p-6 border-none ring-1 ring-slate-100/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                         <div className={`p-3 rounded-2xl ${m.bg}`}>
                            <m.icon className={`h-6 w-6 ${m.color}`} />
                         </div>
                         <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all" />
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                      <p className="text-4xl font-black text-slate-900 mt-1 tracking-tighter">{m.value}</p>
                   </div>
                ))}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Active Visitors List */}
                <div className="lg:col-span-8 flex flex-col space-y-6">
                   <div className="glass-card flex-1 border-none ring-1 ring-slate-100 overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                         <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                               <MapPin className="h-5 w-5 text-emerald-500" />
                               On-Premise Visitors
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Real-time occupancy log</p>
                         </div>
                         <button className="p-2.5 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 transition-colors shadow-sm focus:rotate-180 transition-transform"><Clock className="h-4 w-4" /></button>
                      </div>
                      <div className="overflow-x-auto h-full">
                         <table className="w-full text-left">
                            <tbody className="divide-y divide-slate-50">
                               {visitors.filter(v => v.out === null).map((v, i) => (
                                  <tr key={v.id} className="group hover:bg-slate-50/50 transition-colors">
                                     <td className="px-6 py-5">
                                        <p className="text-sm font-black text-slate-800 tracking-tight">{v.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{v.phone}</p>
                                     </td>
                                     <td className="px-6 py-5">
                                        <p className="text-xs text-slate-500 font-bold">{v.purpose}</p>
                                        <p className="text-[10px] text-indigo-400 font-bold italic mt-0.5">Meeting: {v.whom}</p>
                                     </td>
                                     <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-sm italic">
                                           <CheckCircle2 className="h-3.5 w-3.5" /> {v.in}
                                        </div>
                                     </td>
                                     <td className="px-6 py-5 text-right">
                                        <button className="px-5 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white shadow-sm transition-all shadow-emerald-100">Checkout</button>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                         {visitors.filter(v => v.out === null).length === 0 && (
                            <div className="py-20 text-center text-slate-300">
                               <UserMinus className="h-12 w-12 mx-auto opacity-10 mb-2" />
                               <p className="text-xs font-black uppercase tracking-widest italic">No Guest Checked-in Currently</p>
                            </div>
                         )}
                      </div>
                   </div>

                   {/* Quick Search Section */}
                   <div className="glass-card p-4 border-none ring-1 ring-slate-100 shadow-sm bg-slate-50/50">
                      <div className="relative group">
                         <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                         <input 
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:italic placeholder:font-bold"
                            placeholder="Find caller records, visitor history or complaints..."
                         />
                      </div>
                   </div>
                </div>

                {/* Right Panel: Upcoming Follow-ups */}
                <div className="lg:col-span-4 space-y-6">
                   <div className="glass-card p-6 bg-indigo-600 text-white border-none shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                      <div className="flex justify-between items-start mb-10">
                         <div className="space-y-1">
                            <h4 className="text-[11px] font-black tracking-[0.2em] uppercase opacity-70 italic">Pending Alerts</h4>
                            <p className="text-3xl font-black italic tracking-tighter">Follow-ups</p>
                         </div>
                         <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black">28</div>
                      </div>
                      <div className="space-y-4">
                         {enquiries.filter(e => e.next).slice(0, 3).map(e => (
                            <div key={e.id} className="p-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/20 transition-all cursor-pointer group/item">
                               <div className="flex justify-between items-start">
                                  <p className="text-xs font-black tracking-tight">{e.student}</p>
                                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                               </div>
                               <p className="text-[10px] font-bold opacity-60 mt-1 italic tracking-widest">{e.class} • Parent: {e.parent}</p>
                               <div className="mt-3 flex items-center justify-between">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200">Date: {e.next}</span>
                                  <div className="h-6 w-6 rounded-lg bg-emerald-400 text-slate-800 flex items-center justify-center"><PhoneCall className="h-3 w-3" /></div>
                               </div>
                            </div>
                         ))}
                      </div>
                      <button className="w-full mt-6 py-4 bg-white/20 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all shadow-xl shadow-indigo-900/40">View Enrollment Matrix</button>
                   </div>

                   <div className="glass-card p-8 border-dashed border-2 border-slate-200 flex flex-col items-center justify-center space-y-3 group hover:border-indigo-300 transition-all cursor-pointer py-10">
                      <div className="p-4 bg-slate-50 text-slate-200 rounded-2xl group-hover:scale-110 transition-transform group-hover:bg-indigo-50 group-hover:text-indigo-400">
                         <Mail className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Postal & Dispatch Log</p>
                   </div>
                </div>
             </div>
          </div>
       )}

       {/* Enquiries Master Content */}
       {activeTab === 'enquiries' && (
          <div className="glass-card border-none ring-1 ring-slate-100 overflow-hidden shadow-sm animate-in slide-in-from-right-10 duration-700">
             <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20 italic-normal font-normal">
                <div className="relative flex-1 group">
                   <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                   <input className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold shadow-inner placeholder:text-slate-200" placeholder="Search by Student Name, Parent Name or Registration ID..." />
                </div>
                <div className="flex gap-2">
                   <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 shadow-sm"><Filter className="h-4 w-4" /></button>
                   <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-xl shadow-indigo-100"><Plus className="h-4 w-4" /> New Enquiry</button>
                </div>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50/50">
                      <tr>
                         <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] italic">Student Detail</th>
                         <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] italic">Guardian Info</th>
                         <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] italic text-center">Progression Status</th>
                         <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] italic text-right">Action Log</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {enquiries.map((enq, idx) => (
                         <tr key={idx} className="hover:bg-slate-50/30 transition-colors group cursor-default">
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center font-black text-indigo-400 text-xs shadow-inner">
                                     {enq.student.split(' ').map((n: string) => n[0]).join('')}
                                  </div>
                                  <div>
                                     <p className="text-sm font-black text-slate-800 tracking-tight">{enq.student}</p>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Application for: {enq.class}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-5">
                               <p className="text-sm font-bold text-slate-600 tracking-tight italic">{enq.parent}</p>
                               <p className="text-[10px] text-indigo-500 font-black flex items-center gap-1.5 mt-1 tracking-tight">
                                  <PhoneCall className="h-3 w-3" /> {enq.phone}
                               </p>
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex flex-col items-center">
                                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${
                                     enq.status === 'Converted' ? 'bg-emerald-100 text-emerald-700' :
                                     enq.status === 'Follow-up' ? 'bg-amber-100 text-amber-700' :
                                     'bg-indigo-100 text-indigo-700'
                                  }`}>
                                     {enq.status}
                                  </span>
                                  {enq.next && (
                                     <p className="text-[9px] text-slate-400 font-black mt-2 uppercase tracking-tight">Next Call: <span className="text-slate-800">{enq.next}</span></p>
                                  )}
                               </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                               <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                  <button className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all hover:scale-110 shadow-sm"><Edit3 className="h-4 w-4" /></button>
                                  <button className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-110 shadow-sm"><Trash2 className="h-4 w-4" /></button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       )}

       {/* Placeholders for Visitor, Communications, Resolution Tabs */}
       {['visitors', 'calls', 'complaints'].includes(activeTab) && (
          <div className="glass-card p-32 text-center border-none ring-1 ring-slate-100/40">
             <div className="h-24 w-24 bg-slate-50 text-slate-200 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <LifeBuoy className="h-12 w-12 opacity-5 animate-pulse" />
             </div>
             <h3 className="text-2xl font-black text-slate-800 tracking-tighter italic uppercase">Synchronizing Reception Master</h3>
             <p className="text-xs text-slate-400 font-black mt-3 tracking-[0.3em] uppercase">Connecting to Real-time Occupancy Matrix...</p>
          </div>
       )}

    </div>
  );
}
