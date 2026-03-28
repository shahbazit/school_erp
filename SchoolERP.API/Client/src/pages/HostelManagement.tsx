import { useState, useEffect } from 'react';
import { 
  Building2, Users, Bed, Activity, 
  MoreVertical
} from 'lucide-react';
import { hostelApi, Hostel, HostelRoom, HostelAssignment } from '../api/hostelApi';
import { studentApi } from '../api/studentApi';
import { Student } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';

export default function HostelManagement() {
  const [loading, setLoading] = useState(true);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [assignments, setAssignments] = useState<HostelAssignment[]>([]);

  const { formatDate } = useLocalization();

  const [showHostelModal, setShowHostelModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    fetchRooms();
    fetchAssignments();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hRes, sRes] = await Promise.all([
        hostelApi.getHostels(),
        studentApi.getAll({ pageSize: 1000 })
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
    } catch (error) {
       console.error('Failed to assign room', error);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Building2 className="h-7 w-7 text-primary-600" />
            Hostel Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold opacity-60">Residential Facilities</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Hostels" value={hostels.length.toString()} sub="Boys, Girls & Staff" icon={Building2} color="bg-primary-500" />
        <StatCard label="Total Rooms" value={roomCount.toString()} sub="Across all facilities" icon={Bed} color="bg-indigo-500" />
        <StatCard label="Total Capacity" value={totalCapacity.toString()} sub={`${currentOccupancy} Occupied`} icon={Users} color="bg-emerald-500" />
        <StatCard label="Occupancy Rate" value={totalCapacity > 0 ? `${Math.round((currentOccupancy / totalCapacity) * 100)}%` : '0%'} sub="Live availability" icon={Activity} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Hostel Facilities</h3>
            <div className="flex gap-2">
              <button onClick={() => setShowRoomModal(true)} className="btn-secondary py-2 border-slate-200 text-xs shadow-sm shadow-slate-100">Add Room</button>
              <button onClick={() => setShowHostelModal(true)} className="btn-primary py-2 px-4 text-xs font-black uppercase">Add Hostel</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hostels.map(hostel => (
              <div key={hostel.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${hostel.type === 'Boys' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{hostel.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warden: {hostel.wardenName || 'N/A'}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><MoreVertical className="h-5 w-5 text-slate-300" /></button>
                </div>
                
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Total Rooms</p>
                      <h4 className="text-3xl font-black text-slate-800 leading-none">{hostel.roomCount}</h4>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Occupants</p>
                      <h4 className="text-3xl font-black text-slate-800 leading-none">{hostel.currentOccupancy}</h4>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Occupancy Load</p>
                      <span className="text-xs font-black text-primary-600">
                        {hostel.totalCapacity > 0 ? (hostel.currentOccupancy / hostel.totalCapacity * 100).toFixed(0) : 0}% Capacity
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full" 
                        style={{ width: `${hostel.totalCapacity > 0 ? (hostel.currentOccupancy / hostel.totalCapacity * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={() => { setSelectedHostelId(hostel.id); setShowRoomModal(true); }} className="flex-1 btn-secondary py-3 text-sm font-black uppercase">Add Room</button>
                    <button className="flex-1 btn-primary py-3 text-sm font-black uppercase">Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hostels.length === 0 && (
            <div className="p-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-300">
              <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-600">No Hostels Found</h3>
              <p className="text-sm text-slate-400">Click 'Add Hostel' to create your first residential facility.</p>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden translate-y-0 hover:shadow-xl transition-all mt-8">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Recent Room Assignments</h3>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 text-[10px] uppercase font-black text-slate-400 tracking-[2px] border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Facility/Room</th>
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
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-600">{as.hostelName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Room {as.roomNo}</p>
                      </td>
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
          <SectionCard title="Room Assignment" icon={Bed}>
            <form onSubmit={handleAssignRoom} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <select name="studentId" required className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary-500/20">
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>)}
                </select>
                <select name="roomId" required className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary-500/20">
                  <option value="">Select Room</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.hostelName} - {r.roomNo} ({r.currentOccupancy}/{r.capacity})
                    </option>
                  ))}
                </select>
                <button type="submit" className="w-full btn-primary py-2.5 shadow-lg shadow-primary-500/20 font-black uppercase">Assign Student</button>
              </div>
            </form>
          </SectionCard>
        </div>
      </div>

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
              <button type="button" onClick={() => setShowHostelModal(false)} className="flex-1 btn-secondary py-3">Cancel</button>
              <button type="submit" className="flex-1 btn-primary py-3">Create Hostel</button>
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
              <button type="button" onClick={() => setShowRoomModal(false)} className="flex-1 btn-secondary py-3">Cancel</button>
              <button type="submit" className="flex-1 btn-primary py-3">Create Room</button>
            </div>
          </form>
        </GenericModal>
      )}
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
