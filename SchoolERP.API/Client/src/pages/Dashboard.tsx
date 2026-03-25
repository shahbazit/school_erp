import { useState, useEffect } from 'react';
import { BookOpen, LayoutGrid, CheckCircle2, AlertCircle, Clock, FileText, Plus, Users, Wallet } from 'lucide-react';
import TeacherTodaySchedule from '../components/dashboard/TeacherTodaySchedule';
import { dashboardApi } from '../api/dashboardApi';
import { masterApi } from '../api/masterApi';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [adminSummary, setAdminSummary] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  const token = localStorage.getItem('token');
  const decoded: any = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const isAdmin = (decoded.Role || decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"])?.toLowerCase() === 'admin';

  useEffect(() => {
     if (isAdmin) {
         fetchAdminSummary();
         fetchTeachers();
     } else {
         fetchTeacherSummary();
     }
  }, [isAdmin]);

  const fetchAdminSummary = async () => {
    try {
      const data = await dashboardApi.getAdminSummary();
      setAdminSummary(data);
    } catch (err) { console.error(err); }
  };

  const fetchTeachers = async () => {
    try {
      const data = await masterApi.getAll('employees');
      setTeachers(data.filter((e: any) => e.teacherProfile));
    } catch (err) { console.error(err); }
  };

  const fetchTeacherSummary = async (tid?: string) => {
    try {
      const data = await dashboardApi.getTeacherSummary(tid);
      setSummary(data);
    } catch (err) { console.error(err); }
  };

  const handleTeacherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTeacherId(id);
    if (id) {
        fetchTeacherSummary(id);
    } else {
        setSummary(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Admin Quick Switch (Hero Section for Admin) */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Institutional Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {[
                        { label: 'Total Students', value: adminSummary?.totalStudents || '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Academic Staff', value: adminSummary?.totalTeachers || '0', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Active Schedules', value: adminSummary?.activeTimetables || '0', icon: LayoutGrid, color: 'text-violet-600', bg: 'bg-violet-50' },
                        { label: 'Dues Pending', value: adminSummary?.pendingFeesCount || '0', icon: Wallet, color: 'text-rose-600', bg: 'bg-rose-50' },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                            <span className={`text-xl font-black mt-0.5 ${stat.color}`}>{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-full md:w-64">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Monitor Specific Teacher</label>
                <select 
                    className="form-input text-sm font-bold bg-slate-50 border-slate-100"
                    value={selectedTeacherId}
                    onChange={handleTeacherChange}
                >
                    <option value="">Select Teacher Dashboard...</option>
                    {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                    ))}
                </select>
            </div>
        </div>
      )}

      {/* Teacher Content Region */}
      {(!isAdmin || selectedTeacherId) && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
           {/* Header Content & Quick Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                    {isAdmin ? 'Teacher Performance Cockpit' : 'Daily Command Center'}
                </h1>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Status Overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                {!isAdmin && (
                    <div className="flex gap-2">
                    <button className="btn-secondary flex items-center gap-2 group">
                        <FileText className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
                        Teaching Log
                    </button>
                    <button className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-200">
                        <Plus className="h-4 w-4" />
                        Mark Attendance
                    </button>
                    </div>
                )}
            </div>

            {/* Metrics Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                { label: 'Classes Today', value: summary?.periodsToday || '0', icon: BookOpen, color: 'text-primary-600', bg: 'bg-primary-50', sub: 'Active Sessions' },
                { label: 'Attendance Pending', value: summary?.attendancePending || '0', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Needs Review', urgent: (summary?.attendancePending > 0) },
                { label: 'Homework Pending', value: summary?.homeworkPending || '0', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Daily Tasks' },
                { label: 'Next Session', value: summary?.nextPeriod ? `Pd ${summary.nextPeriod.periodNumber}` : 'Done', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: summary?.nextPeriod ? summary.nextPeriod.startTime : 'For Today' },
                ].map((stat, i) => (
                <div key={i} className={`glass-card p-5 flex items-start justify-between group transition-all hover:-translate-y-1 ${stat.urgent ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
                    <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-2xl font-black text-slate-800 group-hover:text-primary-600 transition-colors">{stat.value}</p>
                        <span className="text-[10px] font-bold text-slate-400">{stat.sub}</span>
                    </div>
                    </div>
                    <div className={`p-2.5 rounded-2xl ${stat.bg} transition-transform group-hover:rotate-12`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                </div>
                ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Recent Registrations or Activities */}
                <div className="lg:col-span-2 glass-card overflow-hidden h-full flex flex-col">
                <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-primary-600" />
                    Pending Daily Submissions
                    </h3>
                    <button className="text-xs font-black text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">Details</button>
                </div>
                <div className="p-8 text-center bg-white flex-1 flex flex-col items-center justify-center">
                    <div className="p-4 bg-slate-50 rounded-full mb-4">
                        <CheckCircle2 className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">Submission tracking for specific periods will appear here.</p>
                </div>
                </div>

                {/* Right: Teacher Schedule Widget */}
                <div className="lg:col-span-1 h-full min-h-[450px]">
                    <TeacherTodaySchedule teacherId={selectedTeacherId || undefined} />
                </div>
            </div>
        </div>
      )}

      {/* Empty State for Admin (when no teacher selected) */}
      {isAdmin && !selectedTeacherId && (
          <div className="glass-card p-12 text-center animate-in fade-in zoom-in-95 duration-700">
             <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                    <LayoutGrid className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Select a Teacher Profile</h3>
                <p className="text-slate-500 font-medium">Use the dropdown above to monitor daily attendance, schedules, and homework compliance for individual staff members.</p>
             </div>
          </div>
      )}

    </div>
  );
}
