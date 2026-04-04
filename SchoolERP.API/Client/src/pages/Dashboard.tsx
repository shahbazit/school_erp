import { useState, useEffect, useCallback } from 'react';
import {
  Users, GraduationCap, BookOpen, TrendingUp, TrendingDown,
  DollarSign, AlertCircle, Calendar, Clock, ChevronRight,
  Activity, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle,
  Package, FileText, BarChart3, Layers, Wallet, UserCheck,
  RefreshCw, Bell, Shield, IndianRupee
} from 'lucide-react';
import { dashboardApi } from '../api/dashboardApi';
import { masterApi } from '../api/masterApi';
import TeacherTodaySchedule from '../components/dashboard/TeacherTodaySchedule';
import { useLocalization } from '../contexts/LocalizationContext';

// ─── helpers ────────────────────────────────────────────────────────────────
const n = (v: any): number => (v === null || v === undefined || isNaN(Number(v)) ? 0 : Number(v));
const fmt = (v: any) => new Intl.NumberFormat('en-IN').format(n(v));
const pct = (a: any, b: any) => (n(b) === 0 ? 0 : Math.round((n(a) / n(b)) * 100));

const now = new Date();
const greeting = () => {
  const h = now.getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// ─── mini bar chart (no library) ────────────────────────────────────────────
function MiniBarChart({ data }: { data: { month: string; amount: number }[] }) {
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
          <div
            className="w-full rounded-t transition-all duration-700"
            style={{
              height: `${(d.amount / max) * 44}px`,
              background: i === data.length - 1
                ? 'linear-gradient(180deg, #3b82f6, #6366f1)'
                : '#e2e8f0',
              minHeight: 2
            }}
          />
          <span className="text-[9px] text-slate-400 font-medium">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: number | null;
  trendLabel?: string;
  accent?: string;
}

function StatCard({ label, value, sub, icon: Icon, iconColor, iconBg, trend, trendLabel, accent }: StatCardProps) {
  const isPositive = trend !== undefined && trend !== null && trend >= 0;
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 relative overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
      style={accent ? { borderTop: `3px solid ${accent}` } : {}}
    >
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {trend !== undefined && trend !== null && (
          <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
        {trendLabel && <p className="text-[11px] text-slate-400 mt-1">{trendLabel}</p>}
      </div>
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────
function SectionHeader({ title, icon: Icon, action }: { title: string; icon: React.ElementType; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-slate-100 rounded-lg">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      </div>
      {action}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
function Badge({ children, color = 'slate' }: { children: React.ReactNode; color?: string }) {
  const map: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
    violet: 'bg-violet-50 text-violet-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${map[color] ?? map.slate}`}>
      {children}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { formatCurrency, formatDate } = useLocalization();
  const [adminSummary, setAdminSummary] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshAt, setRefreshAt] = useState(new Date());

  const money = (v: any) => formatCurrency(n(v));
  const dayLabel = formatDate(now);

  const token = localStorage.getItem('token');
  const decoded: any = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const roles = decoded.Role || decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  const isAdmin = rolesArray.some((r: string) => r.toLowerCase() === 'admin');
  const userName = decoded.name || decoded.Name || decoded.email || 'Administrator';

  const fetchAdminSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getAdminSummary();
      setAdminSummary(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const list = await masterApi.getEmployeesShort();
      // Since it's a short-list, it might not have the teacherProfile property.
      // For now, let's accept all active employees as potential teachers for monitoring.
      setTeachers(list || []);
    } catch (err) { console.error("Dashboard: fetchTeachers failed", err); }
  }, []);

  const fetchTeacherSummary = useCallback(async (tid?: string) => {
    try {
      const data = await dashboardApi.getTeacherSummary(tid);
      setSummary(data);
    } catch (err) { console.error("Dashboard: fetchTeacherSummary failed", err); }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminSummary();
      fetchTeachers();
    } else {
      fetchTeacherSummary();
    }
  }, [isAdmin]);

  const handleTeacherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTeacherId(id);
    if (id) fetchTeacherSummary(id);
    else setSummary(null);
  };

  const handleRefresh = () => {
    setRefreshAt(new Date());
    if (isAdmin) fetchAdminSummary();
    else fetchTeacherSummary(selectedTeacherId || undefined);
  };

  const d = adminSummary;
  const feeCollectionPct = d ? pct(n(d.thisMonthCollection), n(d.totalAllocated)) : 0;
  const attendancePct = d ? pct(n(d.attendanceTakenToday), Math.max(n(d.totalClassSections), 1)) : 0;

  // ── Admin Dashboard ────────────────────────────────────────────────────────
  if (isAdmin) {
    return (
      <div className="space-y-6">

        {/* ─── Top Header Bar ─── */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
          <div className="relative flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-none">
                  {greeting()}, <span className="text-primary-600 font-extrabold">{userName}</span>
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <p className="text-slate-500 text-xs font-medium">{dayLabel}</p>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <p className="text-emerald-600 text-[10px] font-black uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">Active Session</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
              <div className="text-right px-1">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest leading-none mb-1">Last Updated</p>
                <div className="flex items-center justify-end gap-1.5">
                  <Clock className="h-3 w-3 text-primary-500" />
                  <p className="text-slate-700 text-xs font-bold leading-none">{refreshAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all duration-200 active:scale-95 shadow-sm"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary-600' : 'text-slate-400'}`} />
                Sync Data
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Loading dashboard…</p>
            </div>
          </div>
        )}

        {!loading && d && (
          <>
            {/* ─── KPI Row 1 — People ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Students"
                value={fmt(d.totalStudents)}
                sub={`${fmt(d.maleCount)} M · ${fmt(d.femaleCount)} F`}
                icon={GraduationCap}
                iconColor="text-blue-600"
                iconBg="bg-blue-50"
                accent="#3b82f6"
              />
              <StatCard
                label="Academic Staff"
                value={fmt(d.totalTeachers)}
                sub={`${fmt(d.totalEmployees)} total employees`}
                icon={BookOpen}
                iconColor="text-indigo-600"
                iconBg="bg-indigo-50"
                accent="#6366f1"
              />
              <StatCard
                label="Active Timetables"
                value={fmt(d.activeTimetables)}
                sub="Scheduled classes"
                icon={Layers}
                iconColor="text-violet-600"
                iconBg="bg-violet-50"
                accent="#7c3aed"
              />
              <StatCard
                label="Leaves Pending"
                value={fmt(d.leavesPending)}
                sub="Awaiting approval"
                icon={Bell}
                iconColor={n(d.leavesPending) > 0 ? 'text-amber-600' : 'text-emerald-600'}
                iconBg={n(d.leavesPending) > 0 ? 'bg-amber-50' : 'bg-emerald-50'}
                accent={n(d.leavesPending) > 0 ? '#f59e0b' : '#10b981'}
              />
            </div>

            {/* ─── KPI Row 2 — Financials ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="This Month Collection"
                value={money(d.thisMonthCollection)}
                sub="vs last month"
                icon={TrendingUp}
                iconColor="text-emerald-600"
                iconBg="bg-emerald-50"
                trend={n(d.collectionGrowth)}
                trendLabel={`Last month: ${money(d.lastMonthCollection)}`}
                accent="#10b981"
              />
              <StatCard
                label="Total Collected"
                value={money(d.totalCollected)}
                sub={`${pct(d.totalCollected, d.totalAllocated)}% of allocated`}
                icon={Wallet}
                iconColor="text-blue-600"
                iconBg="bg-blue-50"
                accent="#3b82f6"
              />
              <StatCard
                label="Pending Dues"
                value={money(d.totalPending)}
                sub={`${fmt(n(d.studentsWithDues))} students with dues`}
                icon={IndianRupee}
                iconColor="text-rose-600"
                iconBg="bg-rose-50"
                accent="#ef4444"
              />
              <StatCard
                label="Total Allocated"
                value={money(d.totalAllocated)}
                sub="All fee structures combined"
                icon={DollarSign}
                iconColor="text-slate-600"
                iconBg="bg-slate-100"
                accent="#64748b"
              />
            </div>

            {/* ─── Middle Row — Charts + Ops ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Fee Collection Trend */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all">
                <SectionHeader title="Fee Collection Trend" icon={BarChart3} />
                {d.monthlyTrend && d.monthlyTrend.length > 0 ? (
                  <div className="mt-2">
                    <MiniBarChart data={d.monthlyTrend} />
                    <div className="flex justify-between mt-3 pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Current Month</p>
                        <p className="text-sm font-bold text-slate-800">{money(d.thisMonthCollection)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Collection Rate</p>
                        <p className="text-sm font-bold text-slate-800">{feeCollectionPct}%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-6">No data available</p>
                )}
              </div>

              {/* Attendance Overview */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all">
                <SectionHeader title="Today's Attendance Coverage" icon={UserCheck} />
                <div className="flex flex-col items-center justify-center py-4 gap-3">
                  {/* Donut-style ring */}
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.2" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke={attendancePct >= 75 ? '#10b981' : attendancePct >= 50 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="3.2"
                        strokeDasharray={`${Math.min(attendancePct, 100)} ${Math.max(100 - attendancePct, 0)}`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 1s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-slate-800">{attendancePct}%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">{fmt(d.attendanceTakenToday)} of {fmt(d.totalClassSections)} classes</p>
                    <p className="text-xs text-slate-400 mt-0.5">Attendance taken today</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${attendancePct >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {attendancePct >= 75 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    {attendancePct >= 75 ? 'On Track' : 'Needs Attention'}
                  </div>
                </div>
              </div>

              {/* Operations Alerts */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all">
                <SectionHeader title="Operations Alerts" icon={Shield} />
                <div className="space-y-3 mt-1">
                  {[
                    {
                      label: 'Students with Dues',
                      value: n(d.studentsWithDues),
                      icon: Wallet,
                      color: n(d.studentsWithDues) > 0 ? 'text-rose-600' : 'text-emerald-600',
                      bg: n(d.studentsWithDues) > 0 ? 'bg-rose-50' : 'bg-emerald-50',
                      badge: n(d.studentsWithDues) > 0 ? 'red' : 'green',
                      status: n(d.studentsWithDues) > 0 ? 'Action Needed' : 'All Clear'
                    },
                    {
                      label: 'Leaves Pending',
                      value: n(d.leavesPending),
                      icon: Calendar,
                      color: n(d.leavesPending) > 0 ? 'text-amber-600' : 'text-emerald-600',
                      bg: n(d.leavesPending) > 0 ? 'bg-amber-50' : 'bg-emerald-50',
                      badge: n(d.leavesPending) > 0 ? 'amber' : 'green',
                      status: n(d.leavesPending) > 0 ? 'Review Required' : 'All Clear'
                    },
                    {
                      label: 'Low Stock Items',
                      value: n(d.lowStockItems),
                      icon: Package,
                      color: n(d.lowStockItems) > 0 ? 'text-amber-600' : 'text-emerald-600',
                      bg: n(d.lowStockItems) > 0 ? 'bg-amber-50' : 'bg-emerald-50',
                      badge: n(d.lowStockItems) > 0 ? 'amber' : 'green',
                      status: n(d.lowStockItems) > 0 ? 'Restock Soon' : 'Sufficient'
                    },
                    {
                      label: 'Upcoming Exams',
                      value: n(d.upcomingExams),
                      icon: FileText,
                      color: 'text-blue-600',
                      bg: 'bg-blue-50',
                      badge: 'blue',
                      status: 'Scheduled'
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${item.bg}`}>
                          <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                          <p className="text-[10px] text-slate-400">{item.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{fmt(item.value)}</span>
                        <Badge color={item.badge}>{item.badge === 'red' || item.badge === 'amber' ? '!' : '✓'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Bottom Row — Recent Activity ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Recent Enrollments */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-bold text-slate-700">Recent Enrollments</span>
                  </div>
                  <Badge color="blue">Latest 5</Badge>
                </div>
                <div className="divide-y divide-slate-50">
                  {d.recentStudents && d.recentStudents.length > 0 ? d.recentStudents.map((s: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/70 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {s.firstName?.[0]}{s.lastName?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{s.firstName} {s.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{s.admissionNumber}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge color={s.gender?.toLowerCase() === 'male' ? 'blue' : 'violet'}>{s.gender || 'N/A'}</Badge>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="py-8 text-center text-sm text-slate-400">No recent enrollments</div>
                  )}
                </div>
              </div>

              {/* Recent Fee Transactions */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700">Recent Transactions</span>
                  </div>
                  <Badge color="green">Latest 5</Badge>
                </div>
                <div className="divide-y divide-slate-50">
                  {d.recentTransactions && d.recentTransactions.length > 0 ? d.recentTransactions.map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/70 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="text-white h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{t.studentName}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{t.paymentMode || 'Cash'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-emerald-700">{money(t.amount)}</p>
                        <p className="text-[10px] text-slate-400">
                          {t.transactionDate ? new Date(t.transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="py-8 text-center text-sm text-slate-400">No recent transactions</div>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Teacher Monitor Section ─── */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Teacher Performance Monitor</h3>
                    <p className="text-xs text-slate-400 mt-0.5">View daily schedule, attendance, and homework status for any teacher</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all min-w-[220px] font-medium text-slate-700"
                      value={selectedTeacherId}
                      onChange={handleTeacherChange}
                    >
                      <option value="">Select a teacher…</option>
                      {teachers.map((t: any) => (
                        <option key={t.id || t.Id} value={t.id || t.Id}>
                          {t.fullName || t.FullName || (t.firstName + ' ' + t.lastName)}
                        </option>
                      ))}
                    </select>
                </div>
              </div>

              {selectedTeacherId ? (
                <div className="space-y-6">
                  {/* Teacher KPIs */}
                  {summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Classes Today', value: summary.periodsToday ?? 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Attendance Pending', value: summary.attendancePending ?? 0, icon: AlertCircle, color: summary.attendancePending > 0 ? 'text-amber-600' : 'text-emerald-600', bg: summary.attendancePending > 0 ? 'bg-amber-50' : 'bg-emerald-50' },
                        { label: 'Homework Pending', value: summary.homeworkPending ?? 0, icon: FileText, color: summary.homeworkPending > 0 ? 'text-rose-600' : 'text-emerald-600', bg: summary.homeworkPending > 0 ? 'bg-rose-50' : 'bg-emerald-50' },
                        { label: 'Next Period', value: summary.nextPeriod ? `Period ${summary.nextPeriod.periodNumber}` : 'Done', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      ].map((s, i) => (
                        <div key={i} className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${s.bg}`}>
                            <s.icon className={`h-4 w-4 ${s.color}`} />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-slate-800">{s.value}</p>
                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">{s.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <TeacherTodaySchedule teacherId={selectedTeacherId} />
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Users className="h-7 w-7 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">Select a teacher to monitor</p>
                  <p className="text-xs text-slate-400 mt-1">View their schedule, attendance tracking, and homework compliance</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Teacher Dashboard ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 70% 50%, white 0%, transparent 70%)'
        }} />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-blue-100 text-sm mb-0.5">{greeting()},</p>
            <h1 className="text-2xl font-bold tracking-tight">{userName}</h1>
            <p className="text-blue-200 text-xs mt-1 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> {dayLabel}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl text-sm font-medium text-white transition-all duration-200 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Teacher KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Classes Today', value: summary?.periodsToday ?? 0, sub: 'Scheduled periods', icon: BookOpen, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', accent: '#3b82f6' },
          { label: 'Attendance Pending', value: summary?.attendancePending ?? 0, sub: summary?.attendancePending > 0 ? 'Needs to be marked' : 'All marked ✓', icon: UserCheck, iconColor: summary?.attendancePending > 0 ? 'text-amber-600' : 'text-emerald-600', iconBg: summary?.attendancePending > 0 ? 'bg-amber-50' : 'bg-emerald-50', accent: summary?.attendancePending > 0 ? '#f59e0b' : '#10b981' },
          { label: 'Homework Pending', value: summary?.homeworkPending ?? 0, sub: summary?.homeworkPending > 0 ? 'Not yet assigned' : 'All assigned ✓', icon: FileText, iconColor: summary?.homeworkPending > 0 ? 'text-rose-600' : 'text-emerald-600', iconBg: summary?.homeworkPending > 0 ? 'bg-rose-50' : 'bg-emerald-50', accent: summary?.homeworkPending > 0 ? '#ef4444' : '#10b981' },
          { label: 'Next Period', value: summary?.nextPeriod ? `Period ${summary.nextPeriod.periodNumber}` : 'Done', sub: summary?.nextPeriod?.startTime || 'No more today', icon: Clock, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50', accent: '#6366f1' },
        ].map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <Calendar className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-bold text-slate-700">Today's Schedule</span>
        </div>
        <div className="p-4">
          <TeacherTodaySchedule teacherId={undefined} />
        </div>
      </div>
    </div>
  );
}
