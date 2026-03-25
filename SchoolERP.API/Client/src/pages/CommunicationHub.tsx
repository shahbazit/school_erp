import { useState } from 'react';
import { 
  Send, Mail, Bell, 
  History, ChevronRight,
  Clock, CheckCircle2, 
  Smartphone, Plus
} from 'lucide-react';

export default function CommunicationHub() {
  const [activeChannel, setActiveChannel] = useState<'SMS' | 'EMAIL' | 'PUSH'>('SMS');
  
  const channels = [
    { id: 'SMS', label: 'SMS Gateway', icon: Smartphone, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'EMAIL', label: 'Email Broadcast', icon: Mail, color: 'text-primary-500', bg: 'bg-primary-50' },
    { id: 'PUSH', label: 'App Notifications', icon: Bell, color: 'text-purple-500', bg: 'bg-purple-50' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <div className="h-10 w-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Send className="h-5 w-5 rotate-[-20deg]" />
             </div>
             Communication Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">Direct reach to 2,450 parents across all channels.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="btn-secondary py-2.5 px-5 flex items-center gap-2">
              <History className="h-4 w-4" /> History
           </button>
           <button className="btn-primary py-2.5 px-6 shadow-xl shadow-primary-500/20 flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Broadcast
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar Controls */}
        <div className="space-y-6">
           <div className="glass-card p-4 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Broadcast Channels</p>
              {channels.map(ch => (
                 <button 
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id as any)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeChannel === ch.id ? 'bg-white shadow-xl ring-1 ring-slate-100' : 'hover:bg-white/50'}`}
                 >
                    <div className="flex items-center gap-4">
                       <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${ch.bg} ${ch.color}`}>
                          <ch.icon className="h-5 w-5" />
                       </div>
                       <div className="text-left">
                          <p className={`text-sm font-black ${activeChannel === ch.id ? 'text-slate-800' : 'text-slate-400'}`}>{ch.label}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Ready for dispatch</p>
                       </div>
                    </div>
                    {activeChannel === ch.id && <ChevronRight className="h-4 w-4 text-primary-500" />}
                 </button>
              ))}
           </div>

           <div className="glass-card p-6 bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute -right-6 -bottom-6 h-32 w-32 bg-primary-500/20 rounded-full blur-3xl"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary-400 mb-2">Current Credits</p>
              <h2 className="text-4xl font-black tracking-tight">14,208</h2>
              <p className="text-xs text-slate-400 mt-2 font-medium">Approx. 4,500 priority SMS left.</p>
              <button className="w-full mt-6 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-xs font-bold transition-all border border-primary-400/20">Refill Wallet</button>
           </div>
        </div>

        {/* Composer Area */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <History className="h-5 w-5 text-slate-400" />
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Recent Broadcasts</h3>
                 </div>
                 <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-xl px-4 py-2">
                    <option>All Sections</option>
                    <option>Primary</option>
                    <option>Secondary</option>
                 </select>
              </div>

              <div className="divide-y divide-slate-50">
                 <BroadcastItem 
                   title="School Closure - Heavy Rain" 
                   sub="Sent to 842 Primary Parents" 
                   status="Delivered" 
                   time="2h ago"
                   channel="SMS"
                 />
                 <BroadcastItem 
                   title="Annual Day Invitation" 
                   sub="Sent to all Staff & Students" 
                   status="Processing" 
                   time="5h ago"
                   channel="Email"
                 />
                 <BroadcastItem 
                   title="Exam Schedule Updated" 
                   sub="Grade 10-12 Students" 
                   status="Delivered" 
                   time="Yesterday"
                   channel="Push"
                 />
              </div>

              <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
                 <button className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline px-6 py-2">View Full Dispatch Logs</button>
              </div>
           </div>

           <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-10 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative z-10 flex-1">
                 <h3 className="text-2xl font-black text-white tracking-tight leading-snug">Emergency? Reach everyone in 30 seconds.</h3>
                 <p className="text-primary-100 text-sm mt-2 opacity-80">Our high-speed gateway ensures priority delivery during school closures or critical updates.</p>
              </div>
              <button className="relative z-10 bg-white text-primary-600 px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-black/20 hover:scale-105 transition-all">
                 Launch SOS Broadcast
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}

function BroadcastItem({ title, sub, status, time, channel }: any) {
  return (
    <div className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group">
       <div className="flex items-center gap-5">
          <div className="h-12 w-12 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-110 transition-all">
             {channel === 'SMS' && <Smartphone className="h-5 w-5 text-amber-500" />}
             {channel === 'Email' && <Mail className="h-5 w-5 text-primary-500" />}
             {channel === 'Push' && <Bell className="h-5 w-5 text-purple-500" />}
          </div>
          <div>
             <h4 className="font-bold text-slate-800 text-base">{title}</h4>
             <p className="text-xs text-slate-500 font-medium">{sub}</p>
          </div>
       </div>
       <div className="text-right">
          <div className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-end gap-1.5 ${status === 'Delivered' ? 'text-emerald-500' : 'text-primary-500'}`}>
             {status === 'Delivered' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3 animate-pulse" />}
             {status}
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase mt-1 tracking-tighter">{time}</p>
       </div>
    </div>
  );
}
