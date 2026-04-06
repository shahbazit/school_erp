import { useState, useEffect, useCallback } from 'react';
import { 
  Users, GraduationCap, Calendar, Clock, 
  Wallet, DollarSign, FileText, CheckCircle2, 
  AlertCircle, ChevronRight, User, RefreshCw,
  LayoutDashboard, BookOpen, Activity
} from 'lucide-react';
import { studentPortalApi, LinkedStudent, StudentSummary } from '../../api/studentPortalApi';
import { useLocalization } from '../../contexts/LocalizationContext';
import { usePortal } from '../../contexts/PortalContext';

export default function PortalDashboard() {
  const { formatCurrency, formatDate } = useLocalization();
  const { selectedWard, loading: wardsLoading } = usePortal();
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!selectedWard) return;
      try {
        setRefreshing(true);
        const data = await studentPortalApi.getStudentSummary(selectedWard.id);
        setSummary(data);
      } catch (err) {
        console.error("PortalDashboard: Failed to fetch summary", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    fetchSummary();
  }, [selectedWard]);

  if (loading || wardsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 tracking-tight">Syncing community portal...</p>
        </div>
      </div>
    );
  }

  if (!selectedWard) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <Users className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No linked students found</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
          We couldn't find any students linked to your registered mobile/email. Please contact the school office to verify your details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {/* 🔵 STUDENT SUMMARY DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Col: Main Stats */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Welcome Card */}
          <div className="bg-white rounded-3xl p-8 text-slate-800 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full mb-4 border border-blue-100">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 leading-none">Student Portal</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">{selectedWard?.firstName} {selectedWard?.lastName}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-slate-500 text-xs font-bold flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-500" /> {selectedWard?.admissionNo}
                  </p>
                  <p className="text-slate-500 text-xs font-bold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-500" /> {selectedWard?.academicYear}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Status Overview</p>
                <div className="flex items-center justify-end gap-2 text-blue-500">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-lg font-black tracking-tight uppercase">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              label="Outstanding Fees" 
              value={formatCurrency(summary?.outstandingFees ?? 0)} 
              icon={Wallet} 
              color="rose"
            />
            <MetricCard 
              label="Attendance Rate" 
              value={`${summary ? Math.round((summary.attendancePresentThisMonth / Math.max(summary.attendanceTotalThisMonth, 1)) * 100) : 0}%`} 
              sub={`${summary?.attendancePresentThisMonth}/${summary?.attendanceTotalThisMonth} days`}
              icon={Activity} 
              color="blue"
            />
            <MetricCard 
              label="Homework Today" 
              value={summary?.homeworkToday ?? 0} 
              sub="Tasks assigned"
              icon={BookOpen} 
              color="violet"
            />
            <MetricCard 
              label="Paid Fees" 
              value={formatCurrency(summary?.paidFees ?? 0)} 
              icon={DollarSign} 
              color="indigo"
            />
          </div>

          {/* Attendance Visualization */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-800">Monthly Attendance Coverage</h3>
              </div>
              <button className="text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:underline">View History</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 30 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    i < (summary?.attendancePresentThisMonth ?? 0) 
                      ? 'bg-blue-500 text-white' 
                      : i < (summary?.attendanceTotalThisMonth ?? 0) 
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 text-slate-300'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-50">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded bg-blue-500"></div>
                 <span className="text-[10px] font-bold text-slate-500">Present</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded bg-rose-500"></div>
                 <span className="text-[10px] font-bold text-slate-500">Absent</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded bg-slate-200"></div>
                 <span className="text-[10px] font-bold text-slate-500">No Data</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Col: Timeline/Alerts */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
             <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-bold text-slate-700">Recent Notifications</span>
                </div>
                <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">New</span>
             </div>
             <div className="divide-y divide-slate-50">
               <NotificationItem 
                 icon={DollarSign} 
                 color="blue" 
                 title="Fee Receipt Generated" 
                 time="2 hours ago" 
                 desc={`Payment of ${formatCurrency(1200)} received successfully.`} 
               />
               <NotificationItem 
                 icon={FileText} 
                 color="indigo" 
                 title="Exam Timetable Updated" 
                 time="Yesterday" 
                 desc="Final exams schedule for Class 10 is now available." 
               />
               <NotificationItem 
                 icon={CheckCircle2} 
                 color="violet" 
                 title="Result Declared" 
                 time="3 days ago" 
                 desc="Term 1 reports are ready for download in documents." 
               />
               <NotificationItem 
                 icon={AlertCircle} 
                 color="amber" 
                 title="Absent Notification" 
                 time="4 days ago" 
                 desc="Today's attendance marked as Absent." 
               />
             </div>
             <button className="w-full py-4 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors uppercase tracking-widest border-t border-slate-50">
                View All Activity
             </button>
          </div>

          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-blue-500 opacity-80" />
              <h3 className="text-sm font-black uppercase tracking-widest text-blue-500 opacity-90">Learning Resources</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <QuickLink label="AI Tutor" href="/ai-tutor" />
              <QuickLink label="Fee Ledger" href="/portal-fees" />
              <QuickLink label="Transport" href="/transport" />
              <QuickLink label="Library" href="/library" />
              <QuickLink label="Hostel" href="/hostel" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-500 border-blue-100 shadow-blue-500/5',
    rose: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-500/5',
    violet: 'bg-violet-50 text-violet-600 border-violet-100 shadow-violet-500/5',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-500/5'
  };
  return (
    <div className={`p-5 rounded-2xl border bg-white transition-all hover:shadow-md ${colors[color] || ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colors[color]} border-transparent`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="text-lg font-black text-slate-800 tracking-tight leading-none">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
        {sub && <p className="text-[9px] text-slate-400 mt-1 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

function NotificationItem({ icon: Icon, color, title, time, desc }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-500',
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600'
  };
  return (
    <div className="p-4 hover:bg-slate-50 transition-colors flex gap-4">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-slate-800">{title}</p>
          <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{time}</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{desc}</p>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';

function QuickLink({ label, href }: any) {
  return (
    <Link to={href} className="bg-white hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all rounded-xl py-3 px-4 flex items-center justify-between group shadow-sm">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-blue-500">{label}</span>
      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-blue-500 transition-all group-hover:translate-x-1" />
    </Link>
  );
}

