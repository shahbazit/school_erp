import { useState } from 'react';
import { 
  Bus, Building2, Users, Navigation, 
  ChevronRight, AlertCircle, Search, 
  MoreVertical, Bed, Activity, DollarSign
} from 'lucide-react';

type ViewMode = 'TRANSPORT' | 'HOSTEL';

export default function TransportHostel() {
  const [view, setView] = useState<ViewMode>('TRANSPORT');
  
  // Data State
  const routes = [
    { id: '1', name: 'Route A - City Center', vehicle: 'Bus 42', driver: 'Rahul S.', cost: 1200, users: 45 },
    { id: '2', name: 'Route B - West Side', vehicle: 'Bus 15', driver: 'Ahmed K.', cost: 800, users: 32 },
    { id: '3', name: 'Route C - North Hill', vehicle: 'Bus 08', driver: 'John D.', cost: 1500, users: 12 },
  ];

  const hostels = [
    { id: '1', name: 'Mount View Boys Hostel', type: 'Boys', warden: 'Mr. Sharma', rooms: 50, occupancy: 142 },
    { id: '2', name: 'Silver Oak Girls Hostel', type: 'Girls', warden: 'Ms. Gupta', rooms: 40, occupancy: 110 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Building2 className="h-7 w-7 text-primary-600" />
            Infrastructure & Facilities
          </h1>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold opacity-60">Transport & Residential Management</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
           <button 
            onClick={() => setView('TRANSPORT')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'TRANSPORT' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-slate-600'}`}
           >
              <Bus className="h-4 w-4" /> Transport
           </button>
           <button 
            onClick={() => setView('HOSTEL')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'HOSTEL' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-slate-600'}`}
           >
              <Bed className="h-4 w-4" /> Hostel
           </button>
        </div>
      </div>

      {view === 'TRANSPORT' ? (
        <TransportDashboard routes={routes} />
      ) : (
        <HostelDashboard hostels={hostels} />
      )}

    </div>
  );
}

// Transport Sub-Dashboard
function TransportDashboard({ routes }: { routes: any[] }) {
   return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
         
         {/* Stats Bar */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Total Vehicles" value="12" sub="8 Active / 4 Maintenance" icon={Bus} color="bg-primary-500" />
            <StatCard label="Live Routes" value={routes.length} sub="Covering 24km radius" icon={Navigation} color="bg-indigo-500" />
            <StatCard label="Total Users" value="284" sub="75% Attendance today" icon={Users} color="bg-emerald-500" />
            <StatCard label="Revenue (Est.)" value="$14.2k" sub="Monthly Transport Fees" icon={DollarSign} color="bg-amber-500" />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden translate-y-0 hover:shadow-xl transition-all">
                   <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Active Transport Routes</h3>
                      <button className="btn-secondary py-2 border-slate-200">Manage Vehicles</button>
                   </div>
                   <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                         <thead className="bg-slate-50/80 text-[10px] uppercase font-black text-slate-400 tracking-[2px] border-b border-slate-100">
                            <tr>
                               <th className="px-6 py-4">Route Information</th>
                               <th className="px-6 py-4">Assigned vehicle</th>
                               <th className="px-6 py-4">Users</th>
                               <th className="px-6 py-4">Cost</th>
                               <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {routes.map(route => (
                               <tr key={route.id} className="group hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-5">
                                     <p className="font-bold text-slate-800">{route.name}</p>
                                     <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">Driver: {route.driver}</p>
                                  </td>
                                  <td className="px-6 py-5">
                                     <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">{route.vehicle}</span>
                                  </td>
                                  <td className="px-6 py-5 text-sm font-bold text-slate-600">{route.users} Students</td>
                                  <td className="px-6 py-5 font-bold text-emerald-600 text-sm">${route.cost}</td>
                                  <td className="px-6 py-5 text-right">
                                     <button className="p-2 text-slate-300 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                                        <ChevronRight className="h-5 w-5" />
                                     </button>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
            </div>

            <div className="space-y-6">
               <SectionCard title="Live Assignments" icon={Activity}>
                  <div className="space-y-4">
                     <p className="text-xs text-slate-400 font-medium mb-4 italic">Assign a student to a route to begin fee billing.</p>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                        <div className="relative">
                           <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                           <input type="text" placeholder="Search student name..." className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary-500/20" />
                        </div>
                        <select className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm">
                           <option>Select Route</option>
                           {routes.map(r => <option key={r.id}>{r.name}</option>)}
                        </select>
                        <button className="w-full btn-primary py-2.5 shadow-lg shadow-primary-500/20">Assign Student</button>
                     </div>
                  </div>
               </SectionCard>

               <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500 flex items-center justify-center shrink-0">
                     <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                     <h4 className="text-sm font-black text-amber-900 uppercase">Driver Shift Update</h4>
                     <p className="text-xs text-amber-700 leading-relaxed mt-1">Bus 42 driver Rahul S. is on leave. Substitute driver Vijay M. assigned for Route A.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

// Hostel Sub-Dashboard
function HostelDashboard({ hostels }: { hostels: any[] }) {
   return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Total Residents" value="252" sub="Full occupancy in Boys Block" icon={Bed} color="bg-primary-500" />
            <StatCard label="Vacant Rooms" value="12" sub="8 in Silver Oak (Girls)" icon={Building2} color="bg-indigo-500" trend="Low" />
            <StatCard label="Revenue (Est.)" value="$38.5k" sub="Monthly Room Rentals" icon={DollarSign} color="bg-amber-500" />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {hostels.map(hostel => (
               <div key={hostel.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all">
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${hostel.type === 'Boys' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                           {hostel.type === 'Boys' ? <Users className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{hostel.name}</h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warden: {hostel.warden}</p>
                        </div>
                     </div>
                     <button className="p-2 hover:bg-slate-50 rounded-xl"><MoreVertical className="h-5 w-5 text-slate-300" /></button>
                  </div>
                  
                  <div className="p-8 space-y-8">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                           <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Total Rooms</p>
                           <h4 className="text-3xl font-black text-slate-800 leading-none">{hostel.rooms}</h4>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                           <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Occupants</p>
                           <h4 className="text-3xl font-black text-slate-800 leading-none">{hostel.occupancy}</h4>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-end mb-2">
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Occupancy Load</p>
                           <span className="text-xs font-black text-primary-600">{(hostel.occupancy / (hostel.rooms * 3) * 100).toFixed(0)}% Capacity</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(hostel.occupancy / (hostel.rooms * 3) * 100)}%` }}></div>
                        </div>
                     </div>

                     <div className="flex gap-4 pt-4">
                        <button className="flex-1 btn-secondary py-3">View Room Ledger</button>
                        <button className="flex-1 btn-primary py-3">Assign Room</button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}

// Helpers
function StatCard({ label, value, sub, icon: Icon, color, trend }: any) {
   return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
         <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10 shadow-inner`}>
               <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            {trend && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{trend}</span>}
         </div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">{label}</p>
         <h3 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{value}</h3>
         <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">{sub}</p>
      </div>
   );
}

function SectionCard({ title, icon: Icon, children }: any) {
   return (
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-fit">
         <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center">
               <Icon className="h-4 w-4 text-slate-500" />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{title}</h3>
         </div>
         <div className="p-6">
            {children}
         </div>
      </div>
   );
}
