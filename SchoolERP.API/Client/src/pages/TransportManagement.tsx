import { useState, useEffect } from 'react';
import { 
  Bus, Users, Navigation, 
  ChevronRight, AlertCircle, Activity, 
  DollarSign, Trash2, Trash, TrendingUp, TrendingDown
} from 'lucide-react';
import { transportApi, TransportVehicle, TransportRoute, TransportAssignment, TransportStoppage } from '../api/transportApi';
import { studentApi } from '../api/studentApi';
import { masterApi } from '../api/masterApi';
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
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedYearName, setSelectedYearName] = useState<string>('');
  const [assignments, setAssignments] = useState<TransportAssignment[]>([]);
  
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showStoppageModal, setShowStoppageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'masters' | 'handover'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoute, setFilterRoute] = useState('');

  const { formatCurrency, formatDate } = useLocalization();

  useEffect(() => {
    loadInitialData();
    fetchAssignments();
  }, []);

  const loadInitialData = async () => {
    try {
      const years = await masterApi.getAll('academic-years');
      setAcademicYears(years);
      const current = years.find((y: any) => y.isCurrent);
      if (current) {
        setSelectedYearName(current.name);
        loadData(current.name);
      } else {
        loadData();
      }
    } catch (error) {
      console.error('Failed to load years', error);
      loadData();
    }
  };

  const loadData = async (yearName?: string) => {
    setLoading(true);
    try {
      const [rRes, vRes, sRes, stopRes] = await Promise.all([
        transportApi.getRoutes(),
        transportApi.getVehicles(),
        studentApi.getAll({ pageSize: 1000, academicYear: yearName || selectedYearName, isActive: true }),
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
       stoppageId: (formData.get('stoppageId') as string) || undefined,
       startDate: new Date().toISOString().split('T')[0]
    };
    
    if (!data.studentId || !data.routeId) return;

    try {
       await transportApi.assignTransport(data as any);
       fetchAssignments();
       loadData();
       (e.target as HTMLFormElement).reset();
       alert('Transport assigned successfully.');
    } catch (error: any) {
       const msg = error.response?.data?.Message || error.message || 'Failed to assign transport';
       alert(msg);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await transportApi.deleteVehicle(id);
      loadData();
    } catch (error) {
       console.error('Failed to delete vehicle', error);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    try {
      await transportApi.deleteRoute(id);
      loadData();
    } catch (error) {
       console.error('Failed to delete route', error);
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
      
      {/* Compact Header - Standard Fonts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <Bus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Transport Management</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Fleet & Logistics Operations</p>
          </div>
        </div>
        
        {/* Compact Tab Navigation - Standard Fonts */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200">
           <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" icon={Activity} />
           <TabButton active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} label="All List" icon={Users} />
           <TabButton active={activeTab === 'masters'} onClick={() => setActiveTab('masters')} label="Setup" icon={Navigation} />
           <TabButton active={activeTab === 'handover'} onClick={() => setActiveTab('handover')} label="Handover" icon={ChevronRight} />
        </div>
      </div>

      {/* Compact Stats - Legible Fonts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Vehicles" value={totalVehicles.toString()} sub={`${activeVehicles} on duty`} icon={Bus} color="bg-primary-500" />
        <StatCard label="Routes" value={routes.length.toString()} sub="Network path" icon={Navigation} color="bg-indigo-500" />
        <StatCard label="Users" value={totalUsers.toString()} sub="Total capacity" icon={Users} color="bg-emerald-500" />
        <StatCard label="Earnings" value={formatCurrency(estimatedRevenue)} sub="Projected" icon={TrendingUp} color="bg-amber-500" />
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="lg:col-span-2 space-y-4">
             {/* Compact Quick Actions */}
             <div className="grid grid-cols-2 gap-3">
                <QuickActionCard 
                  title="Assign New" 
                  desc="Quick Registrar" 
                  icon={Users} 
                  color="text-primary-600" 
                  bg="bg-primary-50" 
                  onClick={() => setActiveTab('assignments')}
                />
                <QuickActionCard 
                  title="Masters" 
                  desc="Fleet & Stoppage" 
                  icon={Bus} 
                  color="text-indigo-600" 
                  bg="bg-indigo-50" 
                  onClick={() => setActiveTab('masters')}
                />
             </div>

             {/* Compact Recent Activity */}
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">Recent Activity</h3>
                  <button onClick={() => setActiveTab('assignments')} className="text-xs font-black text-primary-600 uppercase hover:underline">View All</button>
                </div>
                <div className="p-0">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-50">
                      {assignments.slice(0, 5).map(as => (
                        <tr key={as.id} className="group hover:bg-slate-50 transition-all">
                          <td className="px-4 py-2">
                            <p className="text-sm font-bold text-slate-800">{as.studentName}</p>
                            <p className="text-xs text-slate-400 font-bold uppercase">{as.stoppageName || 'Master Route'}</p>
                          </td>
                          <td className="px-4 py-2 text-right">
                             <span className="bg-slate-800 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">{as.vehicleNo || 'Self'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <SectionCard title="Quick Assignment" icon={Activity}>
              <form onSubmit={handleAssignTransport} className="space-y-3">
                 <div className="space-y-2">
                    <select name="studentId" required className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-primary-500 transition-all">
                      <option value="">Select Student</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>)}
                    </select>
                    <select name="routeId" required className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-primary-500 transition-all">
                      <option value="">Select Route</option>
                      {routes.map(r => <option key={r.id} value={r.id}>{r.routeName}</option>)}
                    </select>
                    <select name="stoppageId" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-primary-500 transition-all">
                      <option value="">Route Point (Auto)</option>
                      {stoppages.map(s => <option key={s.id} value={s.id}>{s.name} (+{formatCurrency(s.cost)})</option>)}
                    </select>
                    <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">Assign Now</button>
                 </div>
              </form>
            </SectionCard>

            <div className="p-4 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
               <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Admin Tip</h4>
               </div>
               <p className="text-indigo-100 text-xs leading-relaxed font-medium">Use 'Handover' tab for daily logs.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
           {/* Compact Filters */}
           <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px] relative">
                 <input 
                   type="text" 
                   placeholder="Search student..." 
                   className="w-full bg-slate-100 border-none rounded-lg px-4 py-2 pl-10 text-sm font-bold outline-none ring-primary-500/20 focus:ring-2"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <select 
                className="bg-slate-100 border-none rounded-lg px-4 py-2 text-xs font-black uppercase outline-none"
                value={filterRoute}
                onChange={(e) => setFilterRoute(e.target.value)}
              >
                  <option value="">All Routes</option>
                  {routes.map(r => <option key={r.id} value={r.routeName}>{r.routeName}</option>)}
              </select>
           </div>

           {/* Compact Assignments Table */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-0 overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
                       <tr>
                          <th className="px-4 py-3">Student Details</th>
                          <th className="px-4 py-3">Route / Point</th>
                          <th className="px-4 py-3">Bus No</th>
                          <th className="px-4 py-3 text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {assignments
                         .filter(as => 
                           (as.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || as.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase())) &&
                           (filterRoute === '' || as.routeName === filterRoute)
                         )
                         .map(as => (
                          <tr key={as.id} className="group hover:bg-slate-50 transition-colors">
                             <td className="px-4 py-2.5">
                                <p className="text-sm font-black text-slate-800">{as.studentName}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase">{as.admissionNo} • {as.className}</p>
                             </td>
                             <td className="px-4 py-2.5">
                                <p className="text-sm font-bold text-slate-700">{as.routeName}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase">{as.stoppageName || 'Main'}</p>
                             </td>
                             <td className="px-4 py-2.5">
                                <span className="bg-slate-100 text-slate-700 text-xs font-black px-2.5 py-1 rounded inline-flex items-center gap-1.5 uppercase">
                                  <Bus className="h-3 w-3" />
                                  {as.vehicleNo || 'Self'}
                                </span>
                             </td>
                             <td className="px-4 py-2.5 text-right">
                                <button 
                                  onClick={() => handleRemoveAssignment(as.id)}
                                  className="p-2 text-rose-300 hover:text-rose-600 transition-all rounded-lg"
                                >
                                   <Trash2 className="h-4 w-4" />
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'masters' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in slide-in-from-right-2 duration-500">
           <div className="space-y-4">
              {/* Compact Routes */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Live Routes</h3>
                  <button onClick={() => setShowRouteModal(true)} className="bg-primary-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase shadow-sm">Add New</button>
                </div>
                <div className="p-0 overflow-x-auto text-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[11px] uppercase font-black text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2">Route</th>
                        <th className="px-4 py-2">Bus/Users</th>
                        <th className="px-4 py-2 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {routes.map(route => (
                        <tr key={route.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2">
                            <p className="font-bold text-slate-800">{route.routeName}</p>
                            <p className="text-xs text-emerald-600 font-bold uppercase">{formatCurrency(route.routeCost)} / mo</p>
                          </td>
                          <td className="px-4 py-2">
                             <div className="flex items-center gap-2">
                                <span className="bg-slate-800 text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase">{route.vehicleNo || 'NA'}</span>
                                <span className="text-xs font-bold text-slate-400">{route.userCount} slots</span>
                             </div>
                          </td>
                          <td className="px-4 py-2 text-right">
                             <button onClick={() => handleDeleteRoute(route.id)} className="text-slate-300 hover:text-rose-600 transition-all"><Trash2 className="h-4 w-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Compact Vehicles */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Fleet Master</h3>
                  <button onClick={() => setShowVehicleModal(true)} className="border border-slate-200 text-slate-600 px-3 py-1 rounded-lg text-xs font-black uppercase">Add Bus</button>
                </div>
                <div className="p-0">
                   <table className="w-full text-left text-sm">
                      <tbody className="divide-y divide-slate-50">
                         {vehicles.map(v => (
                            <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                               <td className="px-4 py-2">
                                  <p className="font-bold text-slate-800">{v.vehicleNo}</p>
                                  <p className="text-xs text-slate-400 font-bold uppercase">{v.vehicleModel}</p>
                               </td>
                               <td className="px-4 py-2 text-right">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${v.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {v.isActive ? 'Active' : 'Offline'}
                                  </span>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
           </div>

           <div className="space-y-4">
              {/* Compact Stoppages */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Stoppage Points</h3>
                  <button onClick={() => setShowStoppageModal(true)} className="border border-slate-200 text-slate-600 px-3 py-1 rounded-lg text-xs font-black uppercase">Config</button>
                </div>
                <div className="p-0">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-400 border-b border-slate-100">
                          <tr>
                             <th className="px-4 py-2">Point</th>
                             <th className="px-4 py-2">Cost</th>
                             <th className="px-4 py-2 text-right">Del</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {stoppages.map(s => (
                             <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-2 font-bold text-slate-700">{s.name}</td>
                                <td className="px-4 py-2 font-black text-emerald-600">{formatCurrency(s.cost)}</td>
                                <td className="px-4 py-2 text-right">
                                   <button onClick={async () => { if(confirm('Delete?')) { await transportApi.deleteStoppage(s.id); loadData(); } }} className="text-rose-300 hover:text-rose-600 transition-all"><Trash2 className="h-4 w-4" /></button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'handover' && (
        <div className="space-y-4 animate-in zoom-in-95 duration-500">
           <div className="bg-slate-900 rounded-xl p-4 text-white relative overflow-hidden shadow-lg border border-slate-800">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="space-y-1">
                    <h2 className="text-lg font-black tracking-tight uppercase">Handover Sheets</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Daily staff logistics reporting</p>
                 </div>
                 <button onClick={() => window.print()} className="bg-white text-slate-900 px-4 py-2 rounded-lg font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-sm">Print Sheets</button>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-3">
              {Object.entries(assignments.reduce((acc, as) => {
                 const key = as.vehicleNo || 'Unassigned';
                 if (!acc[key]) acc[key] = [];
                 acc[key].push(as);
                 return acc;
              }, {} as Record<string, typeof assignments>)).map(([busNo, students]) => (
                <div key={busNo} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border-slate-300">
                   <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-2">
                         <Bus className="h-4 w-4 text-primary-600" />
                         <h3 className="text-sm font-black text-slate-800 uppercase">Bus: {busNo}</h3>
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase">{students.length} Students</span>
                   </div>
                   <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left text-sm">
                         <thead className="bg-white text-[11px] font-black uppercase text-slate-300 border-b border-slate-50">
                            <tr>
                               <th className="px-4 py-1.5 w-10">#</th>
                               <th className="px-4 py-1.5">Student</th>
                               <th className="px-4 py-1.5">Stoppage Point</th>
                               <th className="px-4 py-1.5 text-center">Sign</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {students.map((st, idx) => (
                               <tr key={st.id}>
                                  <td className="px-4 py-2 font-bold text-slate-300">{idx + 1}</td>
                                  <td className="px-4 py-2 font-bold text-slate-800">{st.studentName}</td>
                                  <td className="px-4 py-2 text-slate-500 font-medium">
                                     <span className="font-bold text-slate-800">{st.stoppageName || 'Master'}</span>
                                  </td>
                                  <td className="px-4 py-2"><div className="h-5 w-16 border border-slate-200 rounded bg-slate-50/30"></div></td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}


      {/* Master Management Modals */}
      {showStoppageModal && (
        <GenericModal title="Manage Stoppages" onClose={() => setShowStoppageModal(false)} maxWidth="max-w-xl">
           <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = { name: formData.get('name') as string, cost: Number(formData.get('cost')) };
              try {
                await transportApi.createStoppage(data);
                loadData();
                (e.target as HTMLFormElement).reset();
              } catch (error) { console.error(error); }
           }} className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-end gap-3">
              <div className="flex-1">
                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">New Stoppage Name</label>
                 <input name="name" required placeholder="e.g. Sector 12" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div className="w-24">
                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cost</label>
                 <input name="cost" type="number" required placeholder="0.00" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <button type="submit" className="btn-primary py-2 px-4 text-xs font-black uppercase">Add</button>
           </form>
           <div className="max-h-96 overflow-y-auto no-scrollbar border border-slate-50 rounded-2xl shadow-inner bg-white/50">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/80 text-[10px] uppercase font-black text-slate-400 sticky top-0 backdrop-blur-sm z-10">
                    <tr>
                       <th className="px-6 py-3">Stoppage</th>
                       <th className="px-6 py-3">Monthly Charge</th>
                       <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {stoppages.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 font-bold text-slate-700">{s.name}</td>
                        <td className="px-6 py-3 font-black text-emerald-600">{formatCurrency(s.cost)}</td>
                        <td className="px-6 py-3 text-right">
                           <button onClick={async () => { if(confirm('Delete?')) { await transportApi.deleteStoppage(s.id); loadData(); } }} className="p-1.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </GenericModal>
      )}

      {showVehicleModal && (
        <GenericModal title="Manage Fleet / Vehicles" onClose={() => setShowVehicleModal(false)} maxWidth="max-w-2xl">
           <form onSubmit={handleAddVehicle} className="mb-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-3 gap-4">
              <div>
                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Vehicle Number</label>
                 <input name="vehicleNo" required className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div>
                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Model / Type</label>
                 <input name="vehicleModel" required className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div className="flex items-end gap-3">
                 <div className="flex-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Capacity</label>
                    <input name="capacity" type="number" required className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                 </div>
                 <button type="submit" className="btn-primary py-2 px-6 text-xs font-black uppercase">Save</button>
              </div>
           </form>
           <div className="max-h-96 overflow-y-auto no-scrollbar border border-slate-50 rounded-2xl shadow-inner bg-white/50">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/80 text-[10px] uppercase font-black text-slate-400 sticky top-0 backdrop-blur-sm z-10">
                    <tr>
                       <th className="px-6 py-3">Vehicle Details</th>
                       <th className="px-6 py-3">Capacity</th>
                       <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {vehicles.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3">
                           <p className="font-bold text-slate-700">{v.vehicleNo}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase">{v.vehicleModel}</p>
                        </td>
                        <td className="px-6 py-3 font-bold text-slate-500">{v.capacity} Slots</td>
                        <td className="px-6 py-3 text-right">
                           <button onClick={() => handleDeleteVehicle(v.id)} className="p-1.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </GenericModal>
      )}

      {showRouteModal && (
        <GenericModal title="Transport Route Planning" onClose={() => setShowRouteModal(false)} maxWidth="max-w-2xl">
           <form onSubmit={handleAddRoute} className="mb-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Route Name</label>
                    <input name="routeName" required className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Base Cost</label>
                       <input name="routeCost" type="number" required className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                    </div>
                    <div>
                       <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">vehicle</label>
                       <select name="vehicleId" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs">
                          <option value="">Select</option>
                          {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleNo}</option>)}
                       </select>
                    </div>
                 </div>
              </div>
              <div className="flex items-end gap-3">
                 <div className="flex-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Driver Name</label>
                    <input name="driverName" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs" placeholder="Optional" />
                 </div>
                 <button type="submit" className="btn-primary py-2 px-8 text-xs font-black uppercase">Create Route</button>
              </div>
           </form>
           <div className="max-h-96 overflow-y-auto no-scrollbar border border-slate-50 rounded-2xl shadow-inner bg-white/50">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/80 text-[10px] uppercase font-black text-slate-400 sticky top-0 backdrop-blur-sm z-10">
                    <tr>
                       <th className="px-6 py-3">Route</th>
                       <th className="px-6 py-3">Vehicle</th>
                       <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {routes.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 font-bold text-slate-700">{r.routeName}</td>
                        <td className="px-6 py-3 font-bold text-slate-500">{r.vehicleNo || 'N/A'}</td>
                        <td className="px-6 py-3 text-right">
                           <button onClick={() => handleDeleteRoute(r.id)} className="p-1.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </GenericModal>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: any }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all
        ${active ? 'bg-white text-primary-600 shadow-sm translate-y-0.5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}
      `}
    >
      <Icon className={`h-4 w-4 ${active ? 'text-primary-600' : 'text-slate-400'}`} />
      {label}
    </button>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, trend }: any) {
  return (
     <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-2">
           <div className={`p-2 rounded-lg ${color} bg-opacity-10 shadow-inner`}>
              <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
           </div>
           {trend && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{trend}</span>}
        </div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{value}</h3>
        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-tight truncate">{sub}</p>
     </div>
  );
}

function QuickActionCard({ title, desc, icon: Icon, color, bg, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group bg-white`}
    >
      <div className={`h-10 w-10 ${bg} ${color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm leading-tight">{title}</h4>
      <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">{desc}</p>
    </button>
  );
}

function SectionCard({ title, icon: Icon, children }: any) {
  return (
     <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/30">
           <div className="h-7 w-7 bg-slate-100 rounded-lg flex items-center justify-center">
              <Icon className="h-4 w-4 text-slate-500" />
           </div>
           <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">{title}</h3>
        </div>
        <div className="p-4">
           {children}
        </div>
     </div>
  );
}

function GenericModal({ title, children, onClose, maxWidth = "max-w-md" }: { title: string, children: React.ReactNode, onClose: () => void, maxWidth?: string }) {
  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className={`bg-white rounded-[2.5rem] w-full ${maxWidth} shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
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
