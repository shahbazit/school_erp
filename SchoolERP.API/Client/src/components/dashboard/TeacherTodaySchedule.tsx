import { useState, useEffect } from 'react';
import { Clock, Calendar, Loader2, ChevronRight } from 'lucide-react';
import { timetableApi, type TimetableDetailDto } from '../../api/timetableApi';
import apiClient from '../../api/apiClient';

interface TeacherTodayScheduleProps {
  teacherId?: string;
}

export default function TeacherTodaySchedule({ teacherId }: TeacherTodayScheduleProps) {
  const [schedule, setSchedule] = useState<TimetableDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    fetchMySchedule();
  }, [teacherId]);

  const fetchMySchedule = async () => {
    setLoading(true);
    try {
      let targetEmployeeId = teacherId;
      
      if (!targetEmployeeId) {
        // 1. Get my employee profile
        const empRes = await apiClient.get('/employee/me');
        setEmployee(empRes.data);
        targetEmployeeId = empRes.data.id;
      } else {
          // If we have teacherId, we still need employeeRoleName check, 
          // but we can assume teacher role since it's passed from Dashboard
          setEmployee({ id: targetEmployeeId, employeeRoleName: 'Teacher' });
      }
      
      // 2. Get today's schedule
      const today = new Date().getDay(); // 0=Sun, 1=Mon...
      if (today === 0) {
        setSchedule([]); // No school on Sunday
        setLoading(false);
        return;
      }
      
      const data = await timetableApi.getTeacherSchedule(targetEmployeeId!);
      setSchedule(data.filter(p => p.dayOfWeek === today).sort((a, b) => a.periodNumber - b.periodNumber));
    } catch (err) {
      console.error("Failed to fetch dashboard schedule", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 flex flex-col items-center justify-center animate-pulse">
      <Loader2 className="h-8 w-8 text-primary-200 animate-spin" />
      <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-4">Loading Schedule...</p>
    </div>
  );

  if (!employee || (employee.employeeRoleName !== 'Teacher' && employee.employeeRoleName !== 'Admin')) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full group">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 text-primary-700 rounded-xl">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">Today's Schedule</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My upcoming classes</p>
          </div>
        </div>
        <button className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {schedule.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
            <Clock className="h-10 w-10 text-slate-300" />
            <p className="text-xs font-bold uppercase tracking-widest mt-3">No classes today</p>
          </div>
        ) : (
          schedule.map((p, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border transition-all hover:-translate-y-0.5 ${p.isBreak ? 'bg-amber-50 border-amber-100/50 grayscale opacity-60' : 'bg-white border-slate-100 hover:border-primary-100 hover:shadow-md'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex flex-col items-center justify-center font-black ${p.isBreak ? 'bg-amber-100 text-amber-700' : 'bg-slate-900 text-white'}`}>
                    <span className="text-[8px] leading-none mb-0.5 uppercase tracking-tighter opacity-50">Pd</span>
                    <span className="text-base leading-none">{p.periodNumber}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 tracking-tight leading-tight">{p.isBreak ? 'Break Interval' : p.subjectName}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 tracking-tight">{p.startTime} — {p.endTime}</span>
                    </div>
                  </div>
                </div>
                {!p.isBreak && (
                  <div className="bg-primary-50 text-primary-700 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                    {p.remarks}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {schedule.length > 0 && (
        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
             <span>Next Up: </span>
             <span className="text-primary-600">Period {schedule[0].periodNumber}</span>
           </div>
        </div>
      )}
    </div>
  );
}
