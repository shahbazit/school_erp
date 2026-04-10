import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Plus, Trash2, Edit3, 
  Settings, CheckCircle, AlertCircle, Info,
  Users, Briefcase, Coffee, CalendarCheck, GraduationCap
} from 'lucide-react';
import { calendarApi, CalendarEvent } from '../api/calendarApi';
import { masterApi } from '../api/masterApi';
import { GenericModal } from '../components/GenericModal';

const CATEGORIES = [
  { value: 0, label: 'Public Holiday', icon: Coffee, color: 'text-red-600 bg-red-50 border-red-100' },
  { value: 1, label: 'Weekly Off', icon: CalendarIcon, color: 'text-slate-600 bg-slate-50 border-slate-100' },
  { value: 2, label: 'Restricted Holiday', icon: Briefcase, color: 'text-orange-600 bg-orange-50 border-orange-100' },
  { value: 3, label: 'Academic Event', icon: GraduationCap, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { value: 4, label: 'Examination Day', icon: CalendarCheck, color: 'text-purple-600 bg-purple-50 border-purple-100' }
];

function GraduationCapIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}

export default function AcademicCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showWeeklyOffModal, setShowWeeklyOffModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Weekly Off Setup State
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0]); // Default Sunday
  const [saturdayOffs, setSaturdayOffs] = useState<number[]>([2, 4]); 
  const [offForStudents, setOffForStudents] = useState<boolean>(true);
  const [offForStaff, setOffForStaff] = useState<boolean>(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [studentOffFilter, setStudentOffFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [staffOffFilter, setStaffOffFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [classes, setClasses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [classFilter, setClassFilter] = useState<string>('all');

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    const matchesStudent = studentOffFilter === 'all' || (studentOffFilter === 'yes' ? e.isHolidayForStudents : !e.isHolidayForStudents);
    const matchesStaff = staffOffFilter === 'all' || (staffOffFilter === 'yes' ? e.isHolidayForStaff : !e.isHolidayForStaff);
    const matchesClass = classFilter === 'all' || e.isAllClasses || e.targetClassIds.includes(classFilter);
    return matchesSearch && matchesCategory && matchesStudent && matchesStaff && matchesClass;
  });

  const fetchSettings = async () => {
    try {
      const data = await calendarApi.getSettings();
      if (data) {
        setWeeklyOffDays(data.weeklyOffDays || [0]);
        setSaturdayOffs(data.saturdayOffOccurrences || [2, 4]);
      }
    } catch (e) {}
  };

  const fetchYears = async () => {
    try {
      const resp = await masterApi.getAcademicYears();
      setAcademicYears(resp);
      const current = resp.find((y: any) => y.isCurrent) || resp[0];
      if (current) setSelectedYearId(current.id);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEvents = async () => {
    if (!selectedYearId) return;
    setLoading(true);
    try {
      const data = await calendarApi.getCalendar(selectedYearId);
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchYears(); 
    fetchSettings();
    masterApi.getClasses().then(setClasses).catch(() => {});
    masterApi.getDepartments().then(setDepartments).catch(() => {});
  }, []);
  useEffect(() => { fetchEvents(); }, [selectedYearId]);

  const handleUpsert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.date || !editingEvent?.name || !selectedYearId) return;

    // Range Validation
    const selectedYear = academicYears.find(y => y.id === selectedYearId);
    if (selectedYear) {
      const eventDate = new Date(editingEvent.date);
      const yearStart = new Date(selectedYear.startDate);
      const yearEnd = new Date(selectedYear.endDate);
      
      // Normalize dates to midnight for accurate comparison
      eventDate.setHours(0, 0, 0, 0);
      yearStart.setHours(0, 0, 0, 0);
      yearEnd.setHours(0, 0, 0, 0);

      if (eventDate < yearStart || eventDate > yearEnd) {
        setMessage({ type: 'error', text: `Event date must be within ${selectedYear.name} (${yearStart.toLocaleDateString()} - ${yearEnd.toLocaleDateString()})` });
        return;
      }

      if (editingEvent.endDate) {
        const eventEndDate = new Date(editingEvent.endDate);
        eventEndDate.setHours(0, 0, 0, 0);
        if (eventEndDate < yearStart || eventEndDate > yearEnd) {
          setMessage({ type: 'error', text: `End date must be within ${selectedYear.name}` });
          return;
        }
      }
    }

    try {
      await calendarApi.upsertEvent({
        ...editingEvent,
        academicYearId: selectedYearId
      });
      setMessage({ type: 'success', text: 'Calendar updated successfully!' });
      setShowModal(false);
      fetchEvents();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update calendar.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await calendarApi.deleteEvent(id);
      fetchEvents();
    } catch (err) {
      alert('Failed to delete event');
    }
  };

  const handleSetupWeeklyOffs = async () => {
    if (!selectedYearId) return;
    try {
      const res = await calendarApi.setupWeeklyOffs({
        daysToOff: weeklyOffDays,
        saturdaysToOff: saturdayOffs,
        academicYearId: selectedYearId,
        isHolidayForStudents: offForStudents,
        isHolidayForStaff: offForStaff
      });
      setMessage({ type: 'success', text: `Successfully generated ${res.count} weekly offs.` });
      setShowWeeklyOffModal(false);
      fetchEvents();
    } catch (err) {
      alert('Failed to setup weekly offs');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await calendarApi.updateSettings({
        weeklyOffDays,
        saturdayOffOccurrences: saturdayOffs
      });
      setMessage({ type: 'success', text: 'School calendar standards saved successfully.' });
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const getCategory = (val: number) => CATEGORIES.find(c => c.value === val) || CATEGORIES[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-xs tracking-widest uppercase mb-1">
            <div className="p-1.5 bg-primary-100 rounded-lg"><CalendarIcon className="h-4 w-4" /></div>
            <span>Academic Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Academic Calendar</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Manage holidays, weekly offs, and academic events for the entire session.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={selectedYearId} 
            onChange={(e) => setSelectedYearId(e.target.value)}
            className="rounded-xl border-slate-200 text-sm font-semibold focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm px-4 py-2.5"
          >
            {academicYears.map((y: any) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>
          <button 
            onClick={() => setShowWeeklyOffModal(true)}
            className="btn-secondary px-6 flex items-center gap-2 whitespace-nowrap bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Settings className="h-4 w-4" />
            Weekly Offs
          </button>
          <button 
            onClick={() => {
              setEditingEvent({ 
                category: 0, 
                isHolidayForStudents: true, 
                isHolidayForStaff: true,
                isAllClasses: true,
                isAllStaff: true,
                date: new Date().toISOString().split('T')[0]
              });
              setShowModal(true);
            }}
            className="btn-primary px-6 py-2.5 flex items-center gap-2 shadow-lg shadow-primary-600/20"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5 mt-0.5 text-green-500" /> : <AlertCircle className="h-5 w-5 mt-0.5 text-red-500" />}
          <div>
            <p className="font-bold text-sm">{message.type === 'success' ? 'Success' : 'Error'}</p>
            <p className="text-sm opacity-90">{message.text}</p>
          </div>
        </div>
      )}

      {/* Filtering Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center animate-in slide-in-from-top-2 duration-500">
        <div className="flex-1 min-w-[200px] relative">
           <input 
             type="text"
             placeholder="Search by event name..."
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
           />
           <CalendarIcon className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
        </div>

        <select 
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          className="rounded-xl border-slate-200 text-sm font-semibold focus:ring-primary-500 focus:border-primary-500 px-4 py-2.5 min-w-[150px]"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        <select 
          value={studentOffFilter}
          onChange={e => setStudentOffFilter(e.target.value as any)}
          className="rounded-xl border-slate-200 text-sm font-semibold focus:ring-primary-500 focus:border-primary-500 px-4 py-2.5 min-w-[150px]"
        >
          <option value="all">Students: All</option>
          <option value="yes">Students: Off Day</option>
          <option value="no">Students: Working Day</option>
        </select>

        <select 
          value={staffOffFilter}
          onChange={e => setStaffOffFilter(e.target.value as any)}
          className="rounded-xl border-slate-200 text-sm font-semibold focus:ring-primary-500 focus:border-primary-500 px-4 py-2.5 min-w-[150px]"
        >
          <option value="all">Staff: All</option>
          <option value="yes">Staff: Off Day</option>
          <option value="no">Staff: Working Day</option>
        </select>

        <select 
          value={classFilter}
          onChange={e => setClassFilter(e.target.value)}
          className="rounded-xl border-slate-200 text-sm font-semibold focus:ring-primary-500 focus:border-primary-500 px-4 py-2.5 min-w-[150px]"
        >
          <option value="all">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>Class {c.name}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden border border-slate-200/60 shadow-xl rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Event Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                         <div className="h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                         <span className="text-slate-400 font-medium text-sm">Loading calendar...</span>
                      </div>
                   </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-40">
                         <CalendarIcon className="h-12 w-12 text-slate-300" />
                         <span className="text-slate-500 font-bold">No events match your current filters</span>
                      </div>
                   </td>
                </tr>
              ) : (
                filteredEvents.map((event: CalendarEvent) => {
                  const cat = getCategory(event.category);
                  const CatIcon = cat.icon;
                  return (
                    <tr key={event.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-slate-700">
                             {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                           </span>
                           <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                             {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' })}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{event.name}</span>
                          <div className="flex flex-col gap-1 mt-1">
                             {event.description && <span className="text-[10px] text-slate-500 italic mb-1">{event.description}</span>}
                             {!event.isAllClasses && event.targetClassNames?.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1">
                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Classes:</span>
                                   {event.targetClassNames.map(name => (
                                      <span key={name} className="text-[9px] font-bold text-primary-700 bg-primary-100 px-1.5 py-0.5 rounded border border-primary-200/50">
                                         {name}
                                      </span>
                                   ))}
                                </div>
                             )}
                             {!event.isAllStaff && event.targetDepartmentNames?.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1">
                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Depts:</span>
                                   {event.targetDepartmentNames.map(name => (
                                      <span key={name} className="text-[9px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200/50">
                                         {name}
                                      </span>
                                   ))}
                                </div>
                             )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cat.color}`}>
                          <CatIcon className="h-3 w-3" />
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex gap-2">
                            {event.isHolidayForStudents ? (
                               <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                                  <Users className="h-3 w-3" /> Students Off
                               </span>
                            ) : (
                               <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                  <Users className="h-3 w-3" /> Students Work
                               </span>
                            )}
                            {event.isHolidayForStaff ? (
                               <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                                  <Briefcase className="h-3 w-3" /> Staff Off
                               </span>
                            ) : (
                               <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                                  <Briefcase className="h-3 w-3" /> Staff Work
                               </span>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => {
                               setEditingEvent(event);
                               setShowModal(true);
                             }}
                             className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                           >
                             <Edit3 className="h-4 w-4" />
                           </button>
                           <button 
                             onClick={() => handleDelete(event.id)}
                             className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                           >
                             <Trash2 className="h-4 w-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Modal */}
      <GenericModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingEvent?.id ? "Edit Calendar Event" : "Add Calendar Event"}
      >
        <form onSubmit={handleUpsert} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">{editingEvent?.id ? 'Date' : 'Start Date'}</label>
              <input 
                type="date"
                required
                min={academicYears.find(y => y.id === selectedYearId)?.startDate ? new Date(academicYears.find(y => y.id === selectedYearId).startDate).toISOString().split('T')[0] : ''}
                max={academicYears.find(y => y.id === selectedYearId)?.endDate ? new Date(academicYears.find(y => y.id === selectedYearId).endDate).toISOString().split('T')[0] : ''}
                value={editingEvent?.date ? new Date(editingEvent.date).toISOString().split('T')[0] : ''}
                onChange={e => setEditingEvent((prev: any) => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500 px-4 py-2.5"
              />
            </div>
            {!editingEvent?.id && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">End Date (Optional)</label>
                <input 
                  type="date"
                  min={editingEvent?.date ? new Date(editingEvent.date).toISOString().split('T')[0] : ''}
                  max={academicYears.find(y => y.id === selectedYearId)?.endDate ? new Date(academicYears.find(y => y.id === selectedYearId).endDate).toISOString().split('T')[0] : ''}
                  value={editingEvent?.endDate || ''}
                  onChange={e => setEditingEvent((prev: any) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500 px-4 py-2.5"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Category</label>
              <select 
                value={editingEvent?.category}
                onChange={e => setEditingEvent((prev: any) => ({ ...prev, category: parseInt(e.target.value) }))}
                className="w-full rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500 px-4 py-2.5"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Event/Holiday Name</label>
            <input 
              required
              placeholder="e.g. Independence Day, Summer Break"
              value={editingEvent?.name || ''}
              onChange={e => setEditingEvent((prev: any) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500 px-4 py-2.5 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Description (Optional)</label>
            <textarea 
              rows={2}
              value={editingEvent?.description || ''}
              onChange={e => setEditingEvent((prev: any) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500 px-4 py-2.5 text-sm"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
             {/* Students Strategy */}
             <div className="space-y-3 pb-3 border-b border-slate-200">
               <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={editingEvent?.isHolidayForStudents}
                    onChange={e => setEditingEvent((prev: any) => ({ ...prev, isHolidayForStudents: e.target.checked }))}
                    className="h-5 w-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex flex-col">
                     <span className="text-sm font-bold text-slate-700">Student Holiday</span>
                     <span className="text-[10px] text-slate-400 uppercase">Classes Suspended</span>
                  </div>
               </label>

               {editingEvent?.isHolidayForStudents && (
                 <div className="pl-8 animate-in slide-in-from-left-2">
                    <label className="flex items-center gap-3 cursor-pointer group mb-2">
                      <input 
                        type="checkbox"
                        checked={editingEvent?.isAllClasses}
                        onChange={e => setEditingEvent((prev: any) => ({ 
                          ...prev, 
                          isAllClasses: e.target.checked,
                          targetClassIds: e.target.checked ? [] : (prev?.targetClassIds || [])
                        }))}
                        className="h-4 w-4 rounded-lg border-slate-300 text-primary-600"
                      />
                      <span className="text-xs font-bold text-slate-600">Apply to All Classes</span>
                    </label>

                    {!editingEvent?.isAllClasses && (
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 border border-slate-200 rounded-lg bg-white custom-scrollbar">
                          {classes.map(c => {
                            const isSelected = editingEvent?.targetClassIds?.includes(c.id);
                            return (
                              <button
                                key={c.id} type="button"
                                onClick={() => {
                                   const current = editingEvent?.targetClassIds || [];
                                   if (isSelected) setEditingEvent((p:any) => ({...p, targetClassIds: current.filter((id:any) => id !== c.id)}));
                                   else setEditingEvent((p:any) => ({...p, targetClassIds: [...current, c.id]}));
                                }}
                                className={`px-2 py-1 rounded text-[9px] font-bold border transition-all ${
                                   editingEvent?.targetClassIds?.map(id => id.toLowerCase())?.includes(c.id.toLowerCase()) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}
                              >
                                {c.name}
                              </button>
                            );
                          })}
                      </div>
                    )}
                 </div>
               )}
             </div>

             {/* Staff Strategy */}
             <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={editingEvent?.isHolidayForStaff}
                    onChange={e => setEditingEvent((prev: any) => ({ ...prev, isHolidayForStaff: e.target.checked }))}
                    className="h-5 w-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex flex-col">
                     <span className="text-sm font-bold text-slate-700">Staff Holiday</span>
                     <span className="text-[10px] text-slate-400 uppercase">Office Closed</span>
                  </div>
               </label>

               {editingEvent?.isHolidayForStaff && (
                  <div className="pl-8 animate-in slide-in-from-left-2">
                    <label className="flex items-center gap-3 cursor-pointer group mb-2">
                      <input 
                        type="checkbox"
                        checked={editingEvent?.isAllStaff}
                        onChange={e => setEditingEvent((prev: any) => ({ 
                          ...prev, 
                          isAllStaff: e.target.checked,
                          targetDepartmentIds: e.target.checked ? [] : (prev?.targetDepartmentIds || [])
                        }))}
                        className="h-4 w-4 rounded-lg border-slate-300 text-primary-600"
                      />
                      <span className="text-xs font-bold text-slate-600">Apply to All Departments</span>
                    </label>

                    {!editingEvent?.isAllStaff && (
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 border border-slate-200 rounded-lg bg-white custom-scrollbar">
                          {departments.map(d => {
                            const isSelected = editingEvent?.targetDepartmentIds?.includes(d.id);
                            return (
                              <button
                                key={d.id} type="button"
                                onClick={() => {
                                   const current = editingEvent?.targetDepartmentIds || [];
                                   if (isSelected) setEditingEvent((p:any) => ({...p, targetDepartmentIds: current.filter((id:any) => id !== d.id)}));
                                   else setEditingEvent((p:any) => ({...p, targetDepartmentIds: [...current, d.id]}));
                                }}
                                className={`px-2 py-1 rounded text-[9px] font-bold border transition-all ${
                                   editingEvent?.targetDepartmentIds?.map(id => id.toLowerCase())?.includes(d.id.toLowerCase()) ? 'bg-orange-600 text-white border-orange-600' : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}
                              >
                                {d.name}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
               )}
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-6">Cancel</button>
            <button type="submit" className="btn-primary px-8 py-2.5">Save Changes</button>
          </div>
        </form>
      </GenericModal>

      {/* Weekly Off Modal */}
      <GenericModal 
        isOpen={showWeeklyOffModal} 
        onClose={() => setShowWeeklyOffModal(false)} 
        title="Setup Weekly Offs"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-xl text-xs border border-blue-100">
            <Info className="h-4 w-4 shrink-0" />
            Choosing days here will automatically generate holiday entries for the entire academic session. Existing weekly off entries for this session will be replaced.
          </div>

          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-500 uppercase ml-1">Standard Weekly Off Days</label>
             <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map(day => {
                  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
                  const active = weeklyOffDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        if (active) setWeeklyOffDays(weeklyOffDays.filter((d: number) => d !== day));
                        else setWeeklyOffDays([...weeklyOffDays, day]);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        active ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'
                      }`}
                    >
                      {dayName}
                    </button>
                  );
                })}
             </div>
          </div>

          <div className="space-y-3 p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
             <label className="text-xs font-bold text-slate-500 uppercase ml-1">Flexible Saturday Offs</label>
             <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map(occ => {
                  const active = saturdayOffs.includes(occ);
                  return (
                    <button
                      key={occ}
                      onClick={() => {
                        if (active) setSaturdayOffs(saturdayOffs.filter((o: number) => o !== occ));
                        else setSaturdayOffs([...saturdayOffs, occ]);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        active ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {occ}{occ === 1 ? 'st' : occ === 2 ? 'nd' : occ === 3 ? 'rd' : 'th'} Sat
                    </button>
                  );
                })}
             </div>
             <p className="text-[10px] text-slate-400 font-medium italic mt-1">Select which Saturdays of the month are non-working days.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <label className="flex items-center gap-3 cursor-pointer group p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                <input 
                  type="checkbox"
                  checked={offForStudents}
                  onChange={e => setOffForStudents(e.target.checked)}
                  className="h-5 w-5 rounded-lg border-slate-300 text-primary-600"
                />
                <span className="text-sm font-bold text-slate-700">Off for Students</span>
             </label>
             <label className="flex items-center gap-3 cursor-pointer group p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                <input 
                  type="checkbox"
                  checked={offForStaff}
                  onChange={e => setOffForStaff(e.target.checked)}
                  className="h-5 w-5 rounded-lg border-slate-300 text-primary-600"
                />
                <span className="text-sm font-bold text-slate-700">Off for Staff</span>
             </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-slate-100">
            <button 
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 font-black text-xs hover:bg-indigo-50 rounded-xl transition-all"
            >
               <Settings className="h-4 w-4" /> Save as School Standard
            </button>
            <div className="flex gap-3">
              <button onClick={() => setShowWeeklyOffModal(false)} className="btn-secondary px-6">Cancel</button>
              <button 
                onClick={handleSetupWeeklyOffs}
                className="btn-primary px-8 py-2.5 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Generate Offs
              </button>
            </div>
          </div>
        </div>
      </GenericModal>
    </div>
  );
}
