import { useState, useEffect, useCallback } from 'react';
import {
  Search, BookOpen, Users, Star, Trash2, ChevronLeft, ChevronRight,
  X, Loader2, AlertCircle, GraduationCap, Mail, Phone, Building2,
  Award, Filter, UserCheck
} from 'lucide-react';
import {
  teacherApi,
  type TeacherProfileDto,
  type TeacherClassAssignmentDto,
} from '../api/teacherApi';

// ── Avatar helpers ────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────

export default function Teachers() {
  const [teachers, setTeachers] = useState<TeacherProfileDto[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  // Selected teacher for side panel
  const [selected, setSelected] = useState<TeacherProfileDto | null>(null);
  const [panelTab, setPanelTab] = useState<'profile' | 'subjects' | 'classes'>('profile');

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await teacherApi.getAll({ pageNumber, pageSize, search: search || undefined });
      setTeachers(res.data);
      setTotalRecords(res.totalRecords);
    } catch {
      setError('Failed to load teachers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, search]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPageNumber(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const refreshSelected = async (employeeId: string) => {
    try {
      const updated = await teacherApi.getByEmployeeId(employeeId);
      setSelected(updated);
      fetchTeachers();
    } catch { /* ignore */ }
  };

  const handleRemoveSubject = async (assignmentId: string) => {
    if (!selected) return;
    try {
      await teacherApi.removeSubject(selected.employeeId, assignmentId);
      refreshSelected(selected.employeeId);
    } catch { setError('Failed to remove subject.'); }
  };

  const handleRemoveClass = async (assignmentId: string) => {
    if (!selected) return;
    try {
      await teacherApi.removeClass(selected.employeeId, assignmentId);
      refreshSelected(selected.employeeId);
    } catch { setError('Failed to remove class assignment.'); }
  };

  const handleToggleClassTeacher = async (assignment: TeacherClassAssignmentDto) => {
    if (!selected) return;
    try {
      await teacherApi.setClassTeacher(selected.employeeId, assignment.id, !assignment.isClassTeacher);
      refreshSelected(selected.employeeId);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to update class teacher status.');
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Teachers</h2>
          <p className="text-sm text-slate-500 mt-0.5">{totalRecords} teacher{totalRecords !== 1 ? 's' : ''} with registered profiles</p>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className={`flex gap-5 ${selected ? 'items-start' : ''}`}>
        {/* ── LEFT: teacher list ── */}
        <div className={`${selected ? 'w-1/2' : 'w-full'} space-y-4 transition-all duration-300`}>
          {/* Search */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search by name, code, specialization…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
              />
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Filter className="h-4 w-4" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading teachers…
              </div>
            ) : teachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                <GraduationCap className="h-10 w-10 opacity-30" />
                <p className="font-medium">No teacher profiles found</p>
                <p className="text-xs">Create a teacher profile from the Employees page, then assign subjects &amp; classes here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {teachers.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelected(t); setPanelTab('profile'); }}
                    className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left group ${selected?.id === t.id ? 'bg-primary-50/60 border-l-2 border-primary-500' : ''}`}
                  >
                    {/* Avatar */}
                    {t.profilePhoto ? (
                      <img src={t.profilePhoto} alt={t.fullName} className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow shrink-0" />
                    ) : (
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ring-2 ring-white shadow ${avatarColor(t.employeeCode)}`}>
                        {getInitials(t.fullName)}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{t.fullName}</p>
                      <p className="text-xs text-slate-400 font-mono">{t.employeeCode}</p>
                    </div>

                    {/* Specializations chip */}
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {t.specializations?.split(',').slice(0, 2).map(s => (
                        <span key={s} className="inline-flex px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-semibold truncate max-w-[80px]">
                          {s.trim()}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <BookOpen className="h-3 w-3" />{t.subjectAssignments.length} subj.
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="h-3 w-3" />{t.classAssignments.length} cls.
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                {Math.min((pageNumber - 1) * pageSize + 1, totalRecords)}–{Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords}
              </span>
              <div className="flex items-center gap-2">
                <button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)}
                  className="p-1.5 rounded-lg border disabled:opacity-40 hover:bg-slate-100 transition">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-medium text-slate-700">{pageNumber} / {totalPages}</span>
                <button disabled={pageNumber >= totalPages} onClick={() => setPageNumber(p => p + 1)}
                  className="p-1.5 rounded-lg border disabled:opacity-40 hover:bg-slate-100 transition">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Detail panel ── */}
        {selected && (
          <div className="w-1/2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Panel Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-4">
              {selected.profilePhoto ? (
                <img src={selected.profilePhoto} alt={selected.fullName} className="h-12 w-12 rounded-xl object-cover ring-2 ring-white shadow shrink-0" />
              ) : (
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow ${avatarColor(selected.employeeCode)}`}>
                  {getInitials(selected.fullName)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate">{selected.fullName}</h3>
                <p className="text-xs text-slate-400 font-mono">{selected.employeeCode}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-5">
              {(['profile', 'subjects', 'classes'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setPanelTab(tab)}
                  className={`py-3 px-4 text-sm font-medium capitalize border-b-2 transition-colors ${panelTab === tab ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {tab === 'subjects' ? `Subjects (${selected.subjectAssignments.length})` :
                   tab === 'classes' ? `Classes (${selected.classAssignments.length})` : 'Profile'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-5 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">

              {/* ── Profile Tab ── */}
              {panelTab === 'profile' && (
                <div className="space-y-4">
                  {/* Contact */}
                  <InfoSection title="Contact">
                    {selected.workEmail && <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Work email" value={selected.workEmail} />}
                    {selected.mobileNumber && <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Mobile" value={selected.mobileNumber} />}
                    {selected.departmentName && <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} label="Department" value={selected.departmentName} />}
                    {selected.designationName && <InfoRow icon={<Award className="h-3.5 w-3.5" />} label="Designation" value={selected.designationName} />}
                  </InfoSection>

                  {/* Qualification */}
                  <InfoSection title="Qualification">
                    {selected.highestQualification
                      ? <InfoRow icon={<GraduationCap className="h-3.5 w-3.5" />} label="Highest" value={`${selected.highestQualification}${selected.qualificationInstitution ? ` — ${selected.qualificationInstitution}` : ''}${selected.qualificationYear ? ` (${selected.qualificationYear})` : ''}`} />
                      : <p className="text-xs text-slate-400">Not provided</p>}
                  </InfoSection>

                  {/* Specialization */}
                  {selected.specializations && (
                    <InfoSection title="Specializations">
                      <div className="flex flex-wrap gap-1.5">
                        {selected.specializations.split(',').map(s => (
                          <span key={s} className="px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">{s.trim()}</span>
                        ))}
                      </div>
                    </InfoSection>
                  )}

                  {/* Experience */}
                  <InfoSection title="Experience">
                    <div className="grid grid-cols-3 gap-3">
                      <StatCard label="Previous" value={`${selected.previousExperienceYears ?? 0} yrs`} />
                      <StatCard label="This School" value={`${selected.currentSchoolExperienceYears ?? 0} yrs`} />
                      <StatCard label="Total" value={`${selected.totalExperienceYears ?? 0} yrs`} color="text-primary-700" />
                    </div>
                    {selected.previousSchools && (
                      <p className="mt-2 text-xs text-slate-500"><span className="font-medium">Previous schools:</span> {selected.previousSchools}</p>
                    )}
                  </InfoSection>
                </div>
              )}

              {/* ── Subjects Tab ── */}
              {panelTab === 'subjects' && (
                <div className="space-y-3">
                  {selected.subjectAssignments.length === 0 ? (
                    <EmptyState icon={<BookOpen className="h-8 w-8 opacity-30" />} message="No subjects assigned yet" />
                  ) : (
                    selected.subjectAssignments.map(sa => (
                      <div key={sa.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{sa.subjectName}</p>
                          <p className="text-xs text-slate-400">{sa.subjectCode} · {sa.academicYearName}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveSubject(sa.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                  <p className="text-xs text-slate-400 text-center pt-1">
                    To assign subjects, use the backend API or Swagger at <code>/api/teacher/{'{employeeId}'}/subjects</code>
                  </p>
                </div>
              )}

              {/* ── Classes Tab ── */}
              {panelTab === 'classes' && (
                <div className="space-y-3">
                  {selected.classAssignments.length === 0 ? (
                    <EmptyState icon={<Users className="h-8 w-8 opacity-30" />} message="No class assignments yet" />
                  ) : (
                    selected.classAssignments.map(ca => (
                      <div key={ca.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${ca.isClassTeacher ? 'bg-amber-100' : 'bg-slate-100'}`}>
                          {ca.isClassTeacher ? <Star className="h-4 w-4 text-amber-500 fill-amber-400" /> : <Users className="h-4 w-4 text-slate-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800">Class {ca.className} — {ca.sectionName}</p>
                            {ca.isClassTeacher && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
                                Class Teacher
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{ca.academicYearName}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleToggleClassTeacher(ca)}
                            title={ca.isClassTeacher ? 'Remove as class teacher' : 'Set as class teacher'}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-amber-500 hover:bg-amber-50 transition"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveClass(ca.id)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  <p className="text-xs text-slate-400 text-center pt-1">
                    To assign classes, use the backend API or Swagger at <code>/api/teacher/{'{employeeId}'}/classes</code>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
      <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-400 shrink-0">{icon}</span>
      <span className="text-slate-400 shrink-0">{label}:</span>
      <span className="text-slate-700 font-medium truncate">{value}</span>
    </div>
  );
}

function StatCard({ label, value, color = 'text-slate-700' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-3 text-center shadow-sm">
      <p className={`text-base font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
      {icon}
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

// Inject form-input style
if (!document.head.querySelector('[data-fid="teachers"]')) {
  const s = document.createElement('style');
  s.setAttribute('data-fid', 'teachers');
  s.textContent = `.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px}`;
  document.head.appendChild(s);
}
