import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  AlertCircle,
  Loader2,
  ChevronRight,
  Search,
  School,
  History,
  LayoutGrid,
  FileText
} from 'lucide-react';
import { timetableApi, type TimetableDto, type TimetableDetailDto } from '../api/timetableApi';
import { masterApi } from '../api/masterApi';
import apiClient from '../api/apiClient';

// Type definitions for Master data
interface MasterItem { id: string; name: string; code?: string; }

const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' }
];

export default function Timetable() {
  // State
  const [timetables, setTimetables] = useState<TimetableDto[]>([]);
  const [selected, setSelected] = useState<TimetableDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Masters state
  const [classes, setClasses] = useState<MasterItem[]>([]);
  const [sections, setSections] = useState<MasterItem[]>([]);
  const [subjects, setSubjects] = useState<MasterItem[]>([]);
  const [academicYears, setAcademicYears] = useState<MasterItem[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  // Search & Filter state
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  
  // Create / Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: 'Main Timetable',
    academicYearId: '',
    classId: '',
    sectionId: '',
    isActive: true,
    periods: [] as TimetableDetailDto[]
  });

  // Fetch initial data
  useEffect(() => {
    fetchMasters();
    fetchTimetables();
  }, []);

  const fetchMasters = async () => {
    try {
      const [c, s, sub, ay, emp] = await Promise.all([
        masterApi.getClasses(),
        masterApi.getSections(),
        masterApi.getSubjects(),
        masterApi.getAcademicYears(),
        apiClient.get('/employee?role=Teacher').then(res => res.data.data || [])
      ]);
      setClasses(c);
      setSections(s);
      setSubjects(sub);
      setAcademicYears(ay.filter((y: any) => y.isActive));
      setTeachers(emp);
      
      // Default academic year
      const currentYear = ay.find((y: any) => y.isCurrent);
      if (currentYear) setFormData(prev => ({ ...prev, academicYearId: currentYear.id }));
    } catch (err) {
      console.error("Failed to fetch masters", err);
    }
  };

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const data = await timetableApi.getTimetables({
        classId: filterClass || undefined,
        sectionId: filterSection || undefined
      });
      setTimetables(data);
    } catch (err) {
      console.error("Failed to fetch timetables", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      name: 'Main Timetable',
      academicYearId: formData.academicYearId, // Keep current year
      classId: '',
      sectionId: '',
      isActive: true,
      periods: []
    });
    setShowModal(true);
  };

  const handleEdit = async (id: string) => {
    try {
      const data = await timetableApi.getById(id);
      setIsEditing(true);
      setFormData({
        id: data.id,
        name: data.name,
        academicYearId: data.academicYearId,
        classId: data.classId,
        sectionId: data.sectionId,
        isActive: data.isActive,
        periods: data.periods
      });
      setShowModal(true);
    } catch (err) {
      console.error("Failed to load timetable", err);
    }
  };

  const handleSave = async () => {
    if (!formData.classId || !formData.sectionId || !formData.academicYearId) return;
    
    setIsSubmitLoading(true);
    try {
      const payload = {
        ...formData,
        periods: formData.periods.map(p => ({
          ...p,
          id: p.id || undefined,
          subjectId: p.subjectId || null,
          teacherId: p.teacherId || null
        }))
      };

      if (isEditing) {
        await timetableApi.update(formData.id, payload as any);
      } else {
        await timetableApi.create(payload as any);
      }
      setShowModal(false);
      fetchTimetables();
    } catch (err) {
      console.error("Failed to save", err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this timetable?")) return;
    try {
      await timetableApi.delete(id);
      fetchTimetables();
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ── Period Helpers ───────────────────────────────────────────────────────

  const addPeriod = (dayId: number) => {
    const lastPeriodNumber = formData.periods
      .filter(p => p.dayOfWeek === dayId)
      .reduce((max, p) => Math.max(max, p.periodNumber), 0);
      
    const newPeriod: TimetableDetailDto = {
      dayOfWeek: dayId,
      periodNumber: lastPeriodNumber + 1,
      startTime: '08:00',
      endTime: '08:45',
      isBreak: false,
      subjectId: undefined,
      teacherId: undefined,
      remarks: ''
    };
    
    setFormData({ ...formData, periods: [...formData.periods, newPeriod] });
  };

  const updatePeriod = (index: number, updates: Partial<TimetableDetailDto>) => {
    const updated = [...formData.periods];
    updated[index] = { ...updated[index], ...updates };
    setFormData({ ...formData, periods: updated });
  };

  const removePeriod = (index: number) => {
    const updated = [...formData.periods];
    updated.splice(index, 1);
    setFormData({ ...formData, periods: updated });
  };

  // ── Render Helpers ───────────────────────────────────────────────────────

  const getTimetableForDay = (dayId: number) => {
    return formData.periods
      .filter(p => p.dayOfWeek === dayId)
      .sort((a, b) => a.periodNumber - b.periodNumber);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-200">
              <Calendar className="h-6 w-6" />
            </div>
            Timetable Management
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1 ml-14">Define class schedules, assigned teachers and subjects</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Create Timetable
        </button>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select 
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <select 
          value={filterSection}
          onChange={e => setFilterSection(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all appearance-none cursor-pointer"
        >
          <option value="">All Sections</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button 
          onClick={fetchTimetables}
          className="md:col-span-1 bg-primary-50 text-primary-700 hover:bg-primary-100 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* ── Content Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Timetable List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Timetables</h2>
            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{timetables.length}</span>
          </div>
          
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
               <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
               <p className="text-xs text-slate-400 font-bold mt-3 uppercase tracking-wider">Loading schedules...</p>
             </div>
          ) : timetables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
              <History className="h-10 w-10 opacity-20 mb-3" />
              <p className="text-sm font-bold">No timetables found</p>
              <button onClick={handleOpenCreate} className="text-xs text-primary-600 font-bold mt-2 hover:underline">Create your first one</button>
            </div>
          ) : (
            timetables.map(t => (
              <div 
                key={t.id} 
                onClick={() => setSelected(t)}
                className={`group p-5 rounded-3xl border transition-all cursor-pointer ${selected?.id === t.id ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-200' : 'bg-white border-slate-100 hover:border-primary-200 shadow-sm'}`}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-2 rounded-xl ${selected?.id === t.id ? 'bg-white/20' : 'bg-primary-50 text-primary-600'}`}>
                    <School className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(t.id); }} className={`p-1.5 rounded-lg ${selected?.id === t.id ? 'hover:bg-white/10' : 'hover:bg-slate-100 text-slate-400'}`}><Edit className="h-3.5 w-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} className={`p-1.5 rounded-lg ${selected?.id === t.id ? 'hover:bg-red-400' : 'hover:bg-red-50 text-red-400'}`}><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className={`font-black text-lg tracking-tight ${selected?.id === t.id ? 'text-white' : 'text-slate-800'}`}>{t.className} - {t.sectionName}</h3>
                  <p className={`text-xs font-bold mt-0.5 ${selected?.id === t.id ? 'text-white/70' : 'text-slate-400'}`}>{t.name} • {t.academicYearName}</p>
                </div>
                {selected?.id === t.id && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Details Loaded</span>
                    <ChevronRight className="h-4 w-4 text-white/50" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Timetable Detail View */}
        <div className="lg:col-span-2 xl:col-span-3">
          {selected ? (
            <TimetablePreview t={selected} />
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] text-slate-400 p-10 text-center">
              <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 mb-6">
                <LayoutGrid className="h-12 w-12 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Select a Timetable</h3>
              <p className="max-w-xs text-sm font-medium text-slate-400 mt-2">Pick a class from the left to view and manage its weekly schedule details.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Create/Edit Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{isEditing ? 'Edit' : 'Create'} Timetable</h2>
                <p className="text-sm text-slate-400 font-medium">Configure periods for each day of the week</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition shadow-sm border border-slate-100"
              ><X className="h-6 w-6" /></button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/30">
              
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                  <select 
                    value={formData.academicYearId}
                    onChange={e => setFormData({...formData, academicYearId: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none outline-none shadow-sm"
                  >
                    <option value="">Select Year...</option>
                    {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
                  <select 
                    value={formData.classId}
                    onChange={e => setFormData({...formData, classId: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none outline-none shadow-sm"
                  >
                    <option value="">Select Class...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Section</label>
                  <select 
                    value={formData.sectionId}
                    onChange={e => setFormData({...formData, sectionId: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none outline-none shadow-sm"
                  >
                    <option value="">Select Section...</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Timetable Name</label>
                  <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Regular Session"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none shadow-sm"
                  />
                </div>
              </div>

              {/* Day-wise Period Builder */}
              <div className="space-y-12">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day.id} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary-600" />
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{day.name}</h3>
                      </div>
                      <button 
                        onClick={() => addPeriod(day.id)}
                        className="flex items-center gap-2 text-xs font-black text-primary-600 hover:text-primary-700 bg-white border border-primary-200 px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Period / Break
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getTimetableForDay(day.id).length === 0 ? (
                        <div className="col-span-full py-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No activities scheduled for {day.name}</p>
                        </div>
                      ) : (
                        getTimetableForDay(day.id).map((p, idx) => {
                          const originalIdx = formData.periods.indexOf(p);
                          return (
                            <div key={idx} className={`relative p-5 rounded-3xl border transition-all ${p.isBreak ? 'bg-amber-50/50 border-amber-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <span className={`flex items-center justify-center h-6 w-6 rounded-lg text-[10px] font-black ${p.isBreak ? 'bg-amber-200 text-amber-800' : 'bg-slate-900 text-white'}`}>
                                    {p.periodNumber}
                                  </span>
                                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                    {p.isBreak ? 'Interval Break' : 'Academic Period'}
                                  </span>
                                </div>
                                <button onClick={() => removePeriod(originalIdx)} className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                              </div>

                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Starts</label>
                                    <input type="time" value={p.startTime} onChange={e => updatePeriod(originalIdx, {startTime: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                                  </div>
                                  <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ends</label>
                                    <input type="time" value={p.endTime} onChange={e => updatePeriod(originalIdx, {endTime: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                                  </div>
                                </div>

                                {!p.isBreak && (
                                  <>
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                                      <select 
                                        value={p.subjectId} 
                                        onChange={e => updatePeriod(originalIdx, {subjectId: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold appearance-none cursor-pointer outline-none"
                                      >
                                        <option value="">Select Subject...</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Teacher</label>
                                      <select 
                                        value={p.teacherId} 
                                        onChange={e => updatePeriod(originalIdx, {teacherId: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold appearance-none cursor-pointer outline-none"
                                      >
                                        <option value="">Select Teacher...</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                                      </select>
                                    </div>
                                  </>
                                )}

                                <div className="flex items-center gap-2 pt-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={p.isBreak} 
                                      onChange={e => updatePeriod(originalIdx, {isBreak: e.target.checked})} 
                                      className="h-3.5 w-3.5 border-slate-300 rounded text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Set as Break</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-8 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-6">
               <div className="flex items-center gap-3 text-slate-400">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-xs font-bold uppercase tracking-widest">Changes are saved to the academic year session</p>
               </div>
               <div className="flex gap-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors"
                >Cancel</button>
                <button 
                  onClick={handleSave}
                  disabled={isSubmitLoading || !formData.classId || !formData.sectionId}
                  className="flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 text-white px-10 py-4 rounded-2xl text-sm font-black shadow-xl shadow-primary-200 disabled:opacity-50 transition-all hover:-translate-y-1"
                >
                  {isSubmitLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Save Timetable
                </button>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Sub-component for Timetable Preview ─────────────────────────────────────

function TimetablePreview({ t }: { t: TimetableDto }) {
  const [data, setData] = useState<TimetableDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [t.id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await timetableApi.getById(t.id);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
     <div className="h-full flex flex-col items-center justify-center bg-white rounded-[40px] border border-slate-100">
       <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
     </div>
  );

  if (!data) return null;

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
             <LayoutGrid className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Weekly View: {data.className} — {data.sectionName}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{data.name} • {data.academicYearName}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 shadow-sm transition-all active:scale-95"><FileText className="h-5 w-5" /></button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1000px] p-8">
          <div className="grid grid-cols-7 gap-6">
            
            {/* Header Column: Time / Period */}
            <div className="space-y-4">
              <div className="h-12 flex items-center justify-center">
                <Clock className="h-5 w-5 text-slate-300" />
              </div>
              {/* Generate time slots from max periods across all days */}
              {Array.from({ length: Math.max(...DAYS_OF_WEEK.map(d => data.periods.filter(p => p.dayOfWeek === d.id).length), 0) }).map((_, i) => (
                <div key={i} className="h-32 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Period</p>
                  <p className="text-xl font-black text-slate-800 leading-none">{i + 1}</p>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {DAYS_OF_WEEK.map(day => (
              <div key={day.id} className="space-y-4">
                <div className="h-12 flex flex-col items-center justify-center bg-slate-900 rounded-2xl shadow-lg border border-slate-800">
                  <p className="text-[10px] font-black text-white px-2 text-center uppercase tracking-widest">{day.name.substring(0, 3)}</p>
                </div>
                {data.periods
                  .filter(p => p.dayOfWeek === day.id)
                  .sort((a, b) => a.periodNumber - b.periodNumber)
                  .map((p, idx) => (
                    <div 
                      key={idx} 
                      className={`h-32 p-4 rounded-3xl border flex flex-col justify-between transition-all hover:shadow-md ${p.isBreak ? 'bg-amber-50/40 border-amber-100/50 grayscale opacity-70' : 'bg-white border-slate-100 border-l-4 border-l-primary-500'}`}
                    >
                      <div>
                        {p.isBreak ? (
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest text-center mt-6">Break Interval</p>
                        ) : (
                          <>
                            <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.15em] leading-tight truncate">{p.subjectName || 'No Subject'}</p>
                            <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-2 leading-tight">{p.teacherName || 'TBA'}</p>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50 mt-auto">
                        <Clock className="h-2.5 w-2.5 text-slate-300" />
                        <span className="text-[9px] font-bold text-slate-400 tracking-tighter">{p.startTime} — {p.endTime}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Global UI styling injection
if (typeof document !== 'undefined') {
  const styleId = 'timetable-ui';
  if (!document.getElementById(styleId)) {
    const s = document.createElement('style');
    s.id = styleId;
    s.textContent = `
      .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
    `;
    document.head.appendChild(s);
  }
}
