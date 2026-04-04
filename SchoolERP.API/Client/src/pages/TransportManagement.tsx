import { useState, useEffect } from 'react';
import { 
  Bus, Users, Navigation, 
  ChevronRight, AlertCircle, Activity, 
  DollarSign, Trash2, Trash, TrendingUp, TrendingDown
} from 'lucide-react';
import { transportApi, TransportVehicle, TransportRoute, TransportAssignment, TransportStoppage } from '../api/transportApi';
import { studentApi } from '../api/studentApi';
import { Student } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';

import { usePermissions } from '../hooks/usePermissions';

export default function TransportManagement() {
  const { hasWritePermission } = usePermissions();
  const writeAllowed = hasWritePermission('transport');
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
  const [stoppages, setStoppages] = useState<TransportStoppage[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<TransportAssignment[]>([]);
  
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showStoppageModal, setShowStoppageModal] = useState(false);

  const { formatCurrency, formatDate } = useLocalization();

  useEffect(() => {
    loadData();
    fetchAssignments();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rRes, vRes, sRes, stopRes] = await Promise.all([
        transportApi.getRoutes(),
        transportApi.getVehicles(),
        studentApi.getAll({ pageSize: 1000 }),
        transportApi.getStoppages()
      ]);
      setRoutes(rRes.data);
      setVehicles(vRes.data);
      setStudents(sRes.data);
      setStoppages(stopRes.data);
    } catch (error) {
      console.error('Failed to load transport data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await transportApi.getAssignments();
      setAssignments(res.data);
    } catch (error) {
      console.error('Failed to fetch assignments', error);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
       vehicleNo: formData.get('vehicleNo') as string,
       vehicleModel: formData.get('vehicleModel') as string,
       capacity: Number(formData.get('capacity')),
       isActive: true
    };
    
    try {
       await transportApi.createVehicle(data as any);
       setShowVehicleModal(false);
       loadData();
    } catch (error) {
       console.error('Failed to create vehicle', error);
    }
  };

  const handleAssignTransport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
       studentId: formData.get('studentId') as string,
       routeId: formData.get('routeId') as string,
       startDate: new Date().toISOString().split('T')[0]
    };
    
    if (!data.studentId || !data.routeId) return;

    try {
       await transportApi.assignTransport(data);
       fetchAssignments();
       loadData();
    } catch (error) {
       console.error('Failed to assign transport', error);
    }
  };

  const handleRemoveAssignment = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) return;
    try {
      await transportApi.removeAssignment(id);
      fetchAssignments();
      loadData();
    } catch (error) {
      console.error('Failed to remove assignment', error);
    }
  };

  const handleAddRoute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
       routeName: formData.get('routeName') as string,
       driverName: formData.get('driverName') as string,
       routeCost: Number(formData.get('routeCost')),
       vehicleId: formData.get('vehicleId') as string || undefined
    };
    
    try {
       await transportApi.createRoute(data as any);
       setShowRouteModal(false);
       loadData();
    } catch (error) {
       console.error('Failed to create route', error);
    }
  };

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.isActive).length;
  const totalUsers = routes.reduce((sum, r) => sum + r.userCount, 0);
  const estimatedRevenue = routes.reduce((sum, r) => sum + (r.routeCost * r.userCount), 0);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500 ${!writeAllowed ? 'is-read-only-view' : ''}`}>
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Bus className="h-7 w-7 text-primary-600" />
            Transport Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold opacity-60">Vehicle & Route Logistics</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Vehicles" value={totalVehicles.toString()} sub={`${activeVehicles} Active / ${totalVehicles - activeVehicles} Inactive`} icon={Bus} color="bg-primary-500" />
        <StatCard label="Live Routes" value={routes.length.toString()} sub="All active routes" icon={Navigation} color="bg-indigo-500" />
        <StatCard label="Total Users" value={totalUsers.toString()} sub="Assigned Students/Staff" icon={Users} color="bg-emerald-500" />
        <StatCard label="Revenue (Est.)" value={formatCurrency(estimatedRevenue)} sub="Monthly Transport Fees" icon={TrendingUp} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden translate-y-0 hover:shadow-xl transition-all">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Active Transport Routes</h3>
              <div className="flex gap-2">
                <button onClick={() => setShowStoppageModal(true)} className="btn-secondary py-2 border-slate-200 text-xs text-slate-600">Manage Stoppages</button>
                <button onClick={() => setShowVehicleModal(true)} className="btn-secondary py-2 border-slate-200 text-xs text-slate-600">Add Vehicle</button>
                <button onClick={() => setShowRouteModal(true)} className="btn-primary py-2 text-xs font-black">Add Route</button>
              </div>
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
                  {routes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">No routes found</td>
                    </tr>
                  ) : routes.map(route => (
                    <tr key={route.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-800">{route.routeName}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">Driver: {route.driverName || 'Not assigned'}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">{route.vehicleNo || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">{route.userCount} Users</td>
                      <td className="px-6 py-5 font-bold text-emerald-600 text-sm">{formatCurrency(route.routeCost)}</td>
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

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden translate-y-0 hover:shadow-xl transition-all">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Recent Transport Assignments</h3>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 text-[10px] uppercase font-black text-slate-400 tracking-[2px] border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Route</th>
                    <th className="px-6 py-4">Started On</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">No recent assignments</td>
                    </tr>
                  ) : assignments.map(as => (
                    <tr key={as.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{as.studentName}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{as.routeName}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{formatDate(as.startDate)}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleRemoveAssignment(as.id)} className="text-[10px] font-black text-rose-500 uppercase hover:text-rose-700 transition-colors">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SectionCard title="Quick Assignment" icon={Activity}>
            <form onSubmit={handleAssignTransport} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <select name="studentId" required className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary-500/20">
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>)}
                </select>
                <select name="routeId" required className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary-500/20">
                  <option value="">Select Route</option>
                  {routes.map(r => <option key={r.id} value={r.id}>{r.routeName}</option>)}
                </select>
                <button type="submit" className="w-full btn-primary py-2.5 shadow-lg shadow-primary-500/20 font-black">Assign Student</button>
              </div>
            </form>
          </SectionCard>

          <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-amber-500 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-900 uppercase">System Note</h4>
              <p className="text-xs text-amber-700 leading-relaxed mt-1">Assigning a student to a route will automatically include transport charges in their monthly fee bill.</p>
            </div>
          </div>
        </div>
      </div>

      {showRouteModal && (
        <GenericModal title="Add New Route" onClose={() => setShowRouteModal(false)}>
          <form onSubmit={handleAddRoute} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Route Name</label>
              <input name="routeName" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="e.g. Downtown Express" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Cost</label>
                <input name="routeCost" type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vehicle</label>
                <select name="vehicleId" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20">
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleNo}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Driver Name</label>
              <input name="driverName" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="Enter driver name" />
            </div>
            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowRouteModal(false)} className="flex-1 btn-secondary py-3">Cancel</button>
              <button type="submit" className="flex-1 btn-primary py-3">Create Route</button>
            </div>
          </form>
        </GenericModal>
      )}

      {showVehicleModal && (
        <GenericModal title="Add New Vehicle" onClose={() => setShowVehicleModal(false)}>
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vehicle Number</label>
              <input name="vehicleNo" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="e.g. ABC-1234" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vehicle Model</label>
              <input name="vehicleModel" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="e.g. Toyota Coaster 2022" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Seating Capacity</label>
              <input name="capacity" type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="30" />
            </div>
            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowVehicleModal(false)} className="flex-1 btn-secondary py-3">Cancel</button>
              <button type="submit" className="flex-1 btn-primary py-3">Create Vehicle</button>
            </div>
          </form>
        </GenericModal>
      )}

      {showStoppageModal && (
        <StoppageManagement 
          stoppages={stoppages} 
          onClose={() => setShowStoppageModal(false)} 
          refresh={loadData} 
        />
      )}
    </div>
  );
}

function StoppageManagement({ stoppages, onClose, refresh }: { stoppages: TransportStoppage[], onClose: () => void, refresh: () => void }) {
  const { formatCurrency } = useLocalization();
  const handleAddStoppage = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     const formData = new FormData(e.currentTarget);
     const data = {
        name: formData.get('name') as string,
        cost: Number(formData.get('cost'))
     };
     
     try {
        await transportApi.createStoppage(data);
        refresh();
        (e.target as HTMLFormElement).reset();
     } catch (error) {
        console.error('Failed to create stoppage', error);
     }
  };

  const handleDelete = async (id: string) => {
     if (!window.confirm('Delete this stoppage?')) return;
     try {
        await transportApi.deleteStoppage(id);
        refresh();
     } catch (error) {
        console.error('Failed to delete stoppage', error);
     }
  };

  return (
    <GenericModal title="Manage Transport Stoppages" onClose={onClose}>
       <div className="space-y-6">
          <form onSubmit={handleAddStoppage} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-end gap-3">
             <div className="flex-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stoppage Name</label>
                <input name="name" required className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="e.g. Sector 12 Gate" />
             </div>
             <div className="w-32">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Cost</label>
                <input name="cost" type="number" required className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="0.00" />
             </div>
             <button type="submit" className="btn-primary py-2 px-6">Add</button>
          </form>

          <div className="max-h-[300px] overflow-y-auto border border-slate-100 rounded-2xl">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 sticky top-0">
                   <tr>
                      <th className="px-4 py-3">Stoppage</th>
                      <th className="px-4 py-3">Cost</th>
                      <th className="px-4 py-3 text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {stoppages.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-sm italic">No stoppages defined yet</td></tr>
                   ) : stoppages.map(stop => (
                      <tr key={stop.id} className="hover:bg-slate-50/50">
                         <td className="px-4 py-3 text-sm font-bold text-slate-700">{stop.name}</td>
                         <td className="px-4 py-3 text-sm font-black text-emerald-600">{formatCurrency(stop.cost)}</td>
                         <td className="px-4 py-3 text-right">
                            <button onClick={() => handleDelete(stop.id)} className="text-rose-400 hover:text-rose-600 p-1">
                               <Trash2 className="h-4 w-4" />
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end">
             <button onClick={onClose} className="btn-secondary py-2 px-8 font-black uppercase text-xs">Close</button>
          </div>
       </div>
    </GenericModal>
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

function GenericModal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
           <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{title}</h3>
              <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all">
                 &times;
              </button>
           </div>
           <div className="p-8">
              {children}
           </div>
        </div>
     </div>
  );
}
