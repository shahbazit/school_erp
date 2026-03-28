import { useState, useEffect, useCallback } from 'react';
import {
  Calendar, CheckCircle2, XCircle, Clock, Save, History,
  Loader2, AlertCircle, Search
} from 'lucide-react';
import {
  attendanceApi,
  AttendanceStatus,
  type EmployeeAttendanceDto,
  type MonthlyAttendanceSummaryDto,
  type DetailedMonthlyAttendanceDto,
  type AttendanceDayDetailDto,
} from '../api/attendanceApi';
import { masterApi } from '../api/masterApi';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700', 'bg-cyan-100 text-cyan-700',
  'bg-rose-100 text-rose-700', 'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700',
];
function avatarColor(code: string) {
  return AVATAR_COLORS[code.charCodeAt(code.length - 1) % AVATAR_COLORS.length];
}

const statusConfig = {
  [AttendanceStatus.Present]: { label: 'Present', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200', icon: <CheckCircle2 className="w-4 h-4" /> },
  [AttendanceStatus.Absent]: { label: 'Absent', color: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200', icon: <XCircle className="w-4 h-4" /> },
  [AttendanceStatus.HalfDay]: { label: 'Half Day', color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200', icon: <Clock className="w-4 h-4" /> },
  [AttendanceStatus.Late]: { label: 'Late', color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200', icon: <Clock className="w-4 h-4" /> },
  [AttendanceStatus.OnLeave]: { label: 'On Leave', color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200', icon: <Calendar className="w-4 h-4" /> },
};

export default function Attendance() {
  const [activeTab, setActiveTab] = useState<'mark' | 'report'>('mark');

  // Mark Attendance State
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<EmployeeAttendanceDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load records
  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await attendanceApi.getByDate(selectedDate, { search: search || undefined });
      setRecords(data);
    } catch {
      setError('Failed to load attendance records.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, search]);

  useEffect(() => {
    if (activeTab === 'mark') {
      const t = setTimeout(() => loadRecords(), 300);
      return () => clearTimeout(t);
    }
  }, [loadRecords, activeTab]);

  const handleStatusChange = (employeeId: string, status: AttendanceStatus) => {
    setRecords(prev => prev.map(r => r.employeeId === employeeId ? { ...r, status, statusName: statusConfig[status].label } : r));
  };

  const handleRemarkChange = (employeeId: string, remarks: string) => {
    setRecords(prev => prev.map(r => r.employeeId === employeeId ? { ...r, remarks } : r));
  };

  const saveAttendance = async () => {
    setIsSaving(true);
    try {
      const payload = {
        records: records.map(r => ({
          employeeId: r.employeeId,
          attendanceDate: selectedDate,
          status: r.status,
          remarks: r.remarks
        }))
      };
      await attendanceApi.markAttendance(payload);
      await loadRecords();
    } catch {
      setError('Failed to save attendance. Please check your data and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const markAll = (status: AttendanceStatus) => {
    setRecords(prev => prev.map(r => ({ ...r, status, statusName: statusConfig[status].label })));
  };

  return (
    <div className="space-y-5">
      {/* ── Header & Tabs ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Employee Attendance</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage daily attendance and view monthly reports</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('mark')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'mark' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Mark Daily Attendance
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'report' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Monthly Reports
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Tab: Mark Attendance ── */}
      {activeTab === 'mark' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]} // Can't mark future
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search employee..."
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 mr-2">Quick mark all:</span>
              <button onClick={() => markAll(AttendanceStatus.Present)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition">Present</button>
              <button onClick={() => markAll(AttendanceStatus.Absent)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition">Absent</button>
              
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              
              <button 
                onClick={saveAttendance} 
                disabled={isSaving || records.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-transparent"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Attendance
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-slate-400 gap-3">
                 <Loader2 className="h-5 w-5 animate-spin" /> Loading records...
              </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <History className="h-10 w-10 opacity-30" />
                <p>No active employees found for marking attendance.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 bg-white border-b border-slate-200 z-10 shadow-sm">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Employee</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {records.map(record => (
                    <tr key={record.employeeId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {record.profilePhoto ? (
                            <img src={record.profilePhoto} alt={record.employeeName} className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm shrink-0" />
                          ) : (
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ring-2 ring-white shadow-sm ${avatarColor(record.employeeCode)}`}>
                              {getInitials(record.employeeName)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{record.employeeName}</p>
                            <p className="text-xs text-slate-400 font-mono truncate">{record.employeeCode} <span className="text-slate-300 mx-1">•</span> {record.designationName || record.departmentName || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {([
                            AttendanceStatus.Present, 
                            AttendanceStatus.Absent, 
                            AttendanceStatus.HalfDay, 
                            AttendanceStatus.Late, 
                            AttendanceStatus.OnLeave
                          ] as AttendanceStatus[]).map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(record.employeeId, status)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                record.status === status 
                                  ? `${statusConfig[status].color} ring-1 ring-offset-1` 
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                              style={{ 
                                '--tw-ring-color': record.status === status ? `var(--tw-colors-${statusConfig[status].color.split('-')[1]}-400)` : '' 
                              } as React.CSSProperties}
                            >
                              {statusConfig[status].icon} {statusConfig[status].label}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="text"
                          placeholder="Add note..."
                          value={record.remarks || ''}
                          onChange={(e) => handleRemarkChange(record.employeeId, e.target.value)}
                          className="w-full px-3 py-1.5 text-sm bg-transparent border-0 border-b border-transparent focus:border-slate-300 focus:ring-0 placeholder:text-slate-300 transition-colors"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Report Viewer ── */}
      {activeTab === 'report' && (
        <ReportViewer />
      )}
    </div>
  );
}

// ── Isolated Report Tab Component ──
function ReportViewer() {
  const [selectedYearId, setSelectedYearId] = useState('');
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [report, setReport] = useState<DetailedMonthlyAttendanceDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [years, emps] = await Promise.all([
          masterApi.getAcademicYears(),
          masterApi.getEmployeesShort()
        ]);
        setAcademicYears(years);
        setEmployees(emps);
        const current = years.find((y: any) => y.isCurrent) || years[0];
        if (current) {
          setSelectedYearId(current.id);
          setYear(new Date(current.startDate).getFullYear());
        }
      } catch (e) {
        console.error("Failed to load report dependencies", e);
      }
    };
    init();
  }, []);

  const fetchReport = async () => {
    if (!employeeIdInput) {
      setError("Please select an employee.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await attendanceApi.getDetailedReport(employeeIdInput, year, month);
      setReport(data);
    } catch {
      setError("Failed to load detailed report.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-5xl">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-primary-600" />
        Detailed Monthly Attendance
      </h3>
      
      <div className="flex flex-wrap items-end gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Select Employee</label>
          <select 
            value={employeeIdInput}
            onChange={e => setEmployeeIdInput(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-300"
          >
            <option value="">-- Select Employee --</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>
            ))}
          </select>
        </div>

        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Academic Year</label>
           <select 
             value={selectedYearId} 
             onChange={e => {
               setSelectedYearId(e.target.value);
               const y = academicYears.find(ay => ay.id === e.target.value);
               if (y) setYear(new Date(y.startDate).getFullYear());
             }}
             className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-300"
           >
             {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
           </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Month</label>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-300">
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Year</label>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-300" />
        </div>

        <button onClick={fetchReport} disabled={isLoading} className="btn-primary px-6 py-2.5 flex items-center gap-2 shadow-md">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Get Report
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm mb-6 border border-red-100 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" /> {error}
      </div>}

      {report && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
             <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg bg-primary-600 text-white">
                   {getInitials(report.employeeName)}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xl">{report.employeeName}</h4>
                  <p className="text-sm text-slate-400 font-semibold tracking-wide uppercase">{report.employeeCode}</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-sm font-bold text-slate-600 uppercase tracking-tighter">Current Session Report</p>
                <p className="text-2xl font-black text-primary-600">{new Date(0, report.month-1).toLocaleString('default', {month:'long'})} {report.year}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Present" value={report.days.filter((d: AttendanceDayDetailDto) => d.attendanceStatus === AttendanceStatus.Present).length} color="emerald" />
            <StatBox label="Absent" value={report.days.filter((d: AttendanceDayDetailDto) => d.attendanceStatus === AttendanceStatus.Absent || d.isMissing).length} color="rose" />
            <StatBox label="Leave" value={report.days.filter((d: AttendanceDayDetailDto) => !!d.leaveType).length} color="blue" />
            <StatBox label="Holidays" value={report.days.filter((d: AttendanceDayDetailDto) => d.dayType !== 'WorkingDay').length} color="slate" />
          </div>

          <div>
             <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Attendance Timeline</h4>
                <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-200"></div> Working</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-100"></div> Holiday</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-100"></div> Weekly Off</span>
                </div>
             </div>
             
             <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {report.days.map((day: AttendanceDayDetailDto, idx: number) => {
                    const isToday = new Date(day.date).toDateString() === new Date().toDateString();
                    const isHoliday = day.dayType === 'Holiday';
                    const isWeeklyOff = day.dayType === 'WeeklyOff';
                    
                    let bgColor = 'bg-white';
                    let borderColor = 'border-slate-200';
                    let textColor = 'text-slate-700';

                    if (isHoliday) { bgColor = 'bg-red-50'; borderColor = 'border-red-100'; textColor = 'text-red-700'; }
                    else if (isWeeklyOff) { bgColor = 'bg-indigo-50'; borderColor = 'border-indigo-100'; textColor = 'text-indigo-700'; }
                    else if (day.leaveType) { bgColor = 'bg-blue-50'; borderColor = 'border-blue-100'; textColor = 'text-blue-700'; }
                    else if (day.attendanceStatus === AttendanceStatus.Present) { bgColor = 'bg-emerald-50'; borderColor = 'border-emerald-100'; textColor = 'text-emerald-700'; }
                    else if (day.attendanceStatus === AttendanceStatus.Absent) { bgColor = 'bg-rose-50'; borderColor = 'border-rose-100'; textColor = 'text-rose-700'; }

                    return (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-2xl border ${borderColor} ${bgColor} transition-transform hover:scale-105 shadow-sm relative group`}
                      >
                         <div className="flex justify-between items-start mb-1">
                            <span className={`text-sm font-black ${textColor}`}>{new Date(day.date).getDate()}</span>
                            <span className="text-[9px] font-bold opacity-40 uppercase">{new Date(day.date).toLocaleDateString('en-US', {weekday: 'short'})}</span>
                         </div>
                         <div className="min-h-[20px]">
                            {day.eventName ? (
                               <p className="text-[9px] font-bold leading-tight truncate" title={day.eventName}>{day.eventName}</p>
                            ) : day.leaveType ? (
                               <p className="text-[9px] font-bold leading-tight text-blue-600">LR: {day.leaveType}</p>
                            ) : day.attendanceStatus ? (
                               <p className="text-[9px] font-bold leading-tight uppercase opacity-60">
                                  {day.attendanceStatus === AttendanceStatus.Present ? 'Present' : 'Absent'}
                               </p>
                            ) : day.dayType === 'WorkingDay' && (
                               <p className="text-[9px] font-bold leading-tight text-slate-300">Working</p>
                            )}
                         </div>
                         {day.isMissing && (
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white shadow-sm" title="Missing Attendance"></div>
                         )}
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: number, color: string }) {
  const bg = `bg-${color}-50`;
  const text = `text-${color}-700`;
  const border = `border-${color}-200`;
  return (
    <div className={`rounded-2xl border ${border} ${bg} p-4 text-center shadow-sm`}>
      <p className={`text-3xl font-black ${text}`}>{value}</p>
      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70 ${text}`}>{label}</p>
    </div>
  );
}

// Inject scrollbar CSS
if (!document.head.querySelector('[data-fid="attendance"]')) {
  const s = document.createElement('style');
  s.setAttribute('data-fid', 'attendance');
  s.textContent = `.custom-scrollbar::-webkit-scrollbar{width:6px;height:6px}.custom-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}`;
  document.head.appendChild(s);
}
