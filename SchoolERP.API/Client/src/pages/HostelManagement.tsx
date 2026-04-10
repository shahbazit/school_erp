import { useState, useEffect } from 'react';
import { 
  Building2, Users, Bed, Activity, 
  Trash2, Search, Filter, Home,
  ChevronRight, AlertCircle, TrendingUp
} from 'lucide-react';
import { hostelApi, Hostel, HostelRoom, HostelAssignment } from '../api/hostelApi';
import { studentApi } from '../api/studentApi';
import { masterApi } from '../api/masterApi';
import { Student } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';

export default function HostelManagement() {
  const [loading, setLoading] = useState(true);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedYearName, setSelectedYearName] = useState<string>('');
  const [assignments, setAssignments] = useState<HostelAssignment[]>([]);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'setup'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHostel, setFilterHostel] = useState('');

  const { formatDate } = useLocalization();

  const [showHostelModal, setShowHostelModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
    fetchRooms();
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
      const [hRes, sRes] = await Promise.all([
        hostelApi.getHostels(),
        studentApi.getAll({ pageSize: 1000, academicYear: yearName || selectedYearName, isActive: true })
      ]);
      setHostels(hRes.data);
      setStudents(sRes.data);
    } catch (error) {
      console.error('Failed to load hostel data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await hostelApi.getRooms();
      setRooms(res.data);
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await hostelApi.getAssignments();
      setAssignments(res.data);
    } catch (error) {
      console.error('Failed to fetch assignments', error);
    }
  };

  const handleAddHostel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
       name: formData.get('name') as string,
       type: formData.get('type') as string,
       address: formData.get('address') as string,
       wardenName: formData.get('wardenName') as string,
       wardenPhone: formData.get('wardenPhone') as string
    };
    
    try {
       await hostelApi.createHostel(data as any);
       setShowHostelModal(false);
       loadData();
    } catch (error) {
       console.error('Failed to create hostel', error);
    }
  };

  const handleAddRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
       hostelId: formData.get('hostelId') as string,
       roomNo: formData.get('roomNo') as string,
       roomType: formData.get('roomType') as string,
       capacity: Number(formData.get('capacity')),
       costPerMonth: Number(formData.get('costPerMonth')),
       isActive: true
    };
    
    try {
       await hostelApi.createRoom(data as any);
       setShowRoomModal(false);
       fetchRooms();
       loadData();
    } catch (error) {
       console.error('Failed to create room', error);
    }
  };

  const handleAssignRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
       studentId: formData.get('studentId') as string,
       roomId: formData.get('roomId') as string,
       startDate: new Date().toISOString().split('T')[0]
    };
    
    if (!data.studentId || !data.roomId) return;

    try {
       await hostelApi.assignRoom(data);
       fetchAssignments();
       fetchRooms();
       loadData();
       (e.target as HTMLFormElement).reset();
       alert('Room assigned successfully.');
    } catch (error: any) {
       const msg = error.response?.data?.Message || error.message || 'Failed to assign room';
       alert(msg);
    }
  };

  const handleDeleteHostel = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hostel? it will remove all rooms as well.')) return;
    try {
       await hostelApi.deleteHostel(id);
       loadData();
    } catch (error) {
       console.error('Failed to delete hostel', error);
    }
  };

  const handleDeleteRoom = async (id: string) => {
     if (!window.confirm('Delete this room?')) return;
     try {
        await hostelApi.deleteRoom(id);
        fetchRooms();
        loadData();
     } catch (error) {
        console.error('Failed to delete room', error);
     }
  };

  const handleRemoveAssignment = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) return;
    try {
      await hostelApi.removeAssignment(id);
      fetchAssignments();
      fetchRooms();
      loadData();
    } catch (error) {
      console.error('Failed to remove assignment', error);
    }
  };

  const totalCapacity = hostels.reduce((sum, h) => sum + h.totalCapacity, 0);
  const currentOccupancy = hostels.reduce((sum, h) => sum + h.currentOccupancy, 0);
  const roomCount = hostels.reduce((sum, h) => sum + h.roomCount, 0);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Hostel Management</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Residential Facilities & Occupancy</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200">
           <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" icon={Activity} />
           <TabButton active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} label="All List" icon={Users} />
           <TabButton active={activeTab === 'setup'} onClick={() => setActiveTab('setup')} label="Setup" icon={Home} />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Hostels" value={hostels.length.toString()} sub="Boys, Girls & Staff" icon={Building2} color="bg-primary-500" />
        <StatCard label="Total Rooms" value={roomCount.toString()} sub="Across all facilities" icon={Bed} color="bg-indigo-500" />
        <StatCard label="Total Capacity" value={totalCapacity.toString()} sub={`${currentOccupancy} Occupied`} icon={Users} color="bg-emerald-500" />
        <StatCard label="Occupancy Rate" value={totalCapacity > 0 ? `${Math.round((currentOccupancy / totalCapacity) * 100)}%` : '0%'} sub="Live availability" icon={TrendingUp} color="bg-amber-500" />
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="lg:col-span-2 space-y-4">
             {/* Quick Actions */}
             <div className="grid grid-cols-2 gap-3">
                <QuickActionCard 
                  title="Assign Room" 
                  desc="Quick Registrar" 
                  icon={Bed} 
                  color="text-primary-600" 
                  bg="bg-primary-50" 
                  onClick={() => setActiveTab('assignments')}
                />
                <QuickActionCard 
                  title="Manage Facilites" 
                  desc="Setup Hostels/Rooms" 
                  icon={Building2} 
                  color="text-indigo-600" 
                  bg="bg-indigo-50" 
                  onClick={() => setActiveTab('setup')}
                />
             </div>

             {/* Recent Activity Table (Preview) */}
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
                            <p className="text-xs text-slate-400 font-bold uppercase">{as.hostelName}</p>
                          </td>
                          <td className="px-4 py-2 text-right">
                             <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">Room {as.roomNo}</span>
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
              <form onSubmit={handleAssignRoom} className="space-y-3">
                 <div className="space-y-2">
                    <select name="studentId" required className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-primary-500 transition-all">
                      <option value="">Select Student</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>)}
                    </select>
                    <select name="roomId" required className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-primary-500 transition-all">
                      <option value="">Select Room</option>
                      {rooms.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.hostelName} - {r.roomNo} ({r.currentOccupancy}/{r.capacity})
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">Assign Now</button>
                 </div>
              </form>
            </SectionCard>

            <div className="p-4 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/20">
               <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Occupancy Tip</h4>
               </div>
               <p className="text-primary-100 text-xs leading-relaxed font-medium">Keep an eye on occupancy rates to plan for next session intake.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
           {/* Filters */}
           <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px] relative">
                 <input 
                   type="text" 
                   placeholder="Search student..." 
                   className="w-full bg-slate-100 border-none rounded-lg px-4 py-2 pl-10 text-sm font-bold outline-none ring-primary-500/20 focus:ring-2"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
                 <Filter className="h-4 w-4 text-slate-400" />
                 <select 
                   className="bg-transparent border-none text-xs font-black uppercase outline-none"
                   value={filterHostel}
                   onChange={(e) => setFilterHostel(e.target.value)}
                 >
                     <option value="">All Hostels</option>
                     {hostels.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                 </select>
              </div>
           </div>

           {/* Assignments Table */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-0 overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
                       <tr>
                          <th className="px-4 py-3">Student Details</th>
                          <th className="px-4 py-3">Facility / Room</th>
                          <th className="px-4 py-3">Started On</th>
                          <th className="px-4 py-3 text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {assignments
                         .filter(as => 
                           (as.studentName.toLowerCase().includes(searchTerm.toLowerCase())) &&
                           (filterHostel === '' || as.hostelName === filterHostel)
                         )
                         .map(as => (
                          <tr key={as.id} className="group hover:bg-slate-50 transition-colors">
                             <td className="px-4 py-2.5">
                                <p className="text-sm font-black text-slate-800">{as.studentName}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase">Resident Member</p>
                             </td>
                             <td className="px-4 py-2.5">
                                <p className="text-sm font-bold text-slate-700">{as.hostelName}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase">Room {as.roomNo}</p>
                             </td>
                             <td className="px-4 py-2.5">
                                <span className="text-xs font-bold text-slate-500 uppercase">{formatDate(as.startDate)}</span>
                             </td>
                             <td className="px-4 py-2.5 text-right">
                                <button 
                                  onClick={() => handleRemoveAssignment(as.id)}
                                  className="text-[10px] font-black text-rose-500 uppercase hover:text-rose-700 transition-colors"
                                >
                                   Remove
                                </button>
                             </td>
                          </tr>
                       ))}
                       {assignments.length === 0 && (
                          <tr>
                             <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">No assignments found</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-right-2 duration-500">
          <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Hostel Facilities</h3>
              <button onClick={() => setShowHostelModal(true)} className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-sm">Add Hostel</button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {hostels.map(hostel => (
                <div key={hostel.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${hostel.type === 'Boys' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{hostel.name}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Type: {hostel.type}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteHostel(hostel.id)} className="p-2 hover:bg-rose-50 rounded-xl transition-colors group">
                      <Trash2 className="h-4 w-4 text-slate-300 group-hover:text-rose-600" />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-3 mb-6">
                       <StatTiny label="Rooms" value={hostel.roomCount.toString()} />
                       <StatTiny label="Occupancy" value={hostel.currentOccupancy.toString()} />
                       <StatTiny label="Load" value={hostel.totalCapacity > 0 ? `${Math.round((hostel.currentOccupancy / hostel.totalCapacity) * 100)}%` : '0%'} />
                    </div>

                    <div className="flex gap-2">
                       <button onClick={() => { setSelectedHostelId(hostel.id); setShowRoomModal(true); }} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all">Add Room</button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50">
                       <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Room Inventory</h4>
                       <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                          {rooms.filter(r => r.hostelId === hostel.id).map(room => (
                             <div key={room.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 group">
                                <div className="flex items-center gap-3">
                                   <p className="text-xs font-bold text-slate-700"># {room.roomNo}</p>
                                   <span className="text-[8px] bg-white border border-slate-200 px-1.5 py-0.5 rounded-full font-black uppercase text-slate-400">{room.roomType}</span>
                                </div>
                                <button onClick={() => handleDeleteRoom(room.id)} className="p-1 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all">
                                   <Trash2 className="h-3 w-3" />
                                </button>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Residential Setup</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Use this section to configure your hostels and individual rooms. You can define room types, capacities, and monthly costs which will be automatically reflected in student fee ledgers.</p>
                
                <div className="mt-6 space-y-3">
                   <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                      <h4 className="text-[10px] font-black text-indigo-600 uppercase mb-1">Fee Integration Active</h4>
                      <p className="text-[10px] text-indigo-400 font-bold uppercase">Assignments automatically trigger "Hostel Fee" subscriptions.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {showHostelModal && (
        <GenericModal title="Add New Hostel" onClose={() => setShowHostelModal(false)}>
          <form onSubmit={handleAddHostel} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hostel Name</label>
              <input name="name" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="e.g. Crystal Hall" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hostel Type</label>
              <select name="type" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20">
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Staff">Staff</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Warden Name</label>
                <input name="wardenName" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Warden Phone</label>
                <input name="wardenPhone" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="+123..." />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Address / Location</label>
              <textarea name="address" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="Full address" rows={3}></textarea>
            </div>
            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowHostelModal(false)} className="flex-1 btn-secondary py-3 text-xs font-black uppercase">Cancel</button>
              <button type="submit" className="flex-1 btn-primary py-3 text-xs font-black uppercase">Create Hostel</button>
            </div>
          </form>
        </GenericModal>
      )}

      {showRoomModal && (
        <GenericModal title="Add New Room" onClose={() => setShowRoomModal(false)}>
          <form onSubmit={handleAddRoom} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Hostel</label>
              <select name="hostelId" defaultValue={selectedHostelId || ""} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20">
                <option value="">Select Hostel</option>
                {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Room Number</label>
                <input name="roomNo" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="e.g. 101" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Capacity</label>
                <input name="capacity" type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="4" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Room Type</label>
                <input name="roomType" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="e.g. Deluxe" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Cost</label>
                <input name="costPerMonth" type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20" placeholder="0.00" />
              </div>
            </div>
            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowRoomModal(false)} className="flex-1 btn-secondary py-3 text-xs font-black uppercase">Cancel</button>
              <button type="submit" className="flex-1 btn-primary py-3 text-xs font-black uppercase">Create Room</button>
            </div>
          </form>
        </GenericModal>
      )}
    </div>
  );
}

// Helpers
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
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{value}</h3>
        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight truncate">{sub}</p>
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
      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{desc}</p>
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

function StatTiny({ label, value }: { label: string, value: string }) {
   return (
      <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100 text-center">
         <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">{label}</p>
         <h4 className="text-lg font-black text-slate-800 leading-none">{value}</h4>
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
