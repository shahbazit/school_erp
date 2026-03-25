import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Edit2, UserX, UserCheck, ChevronLeft, ChevronRight,
  Briefcase, Phone, Mail, MapPin, X, Save, Loader2, AlertCircle,
  User, Building2, Calendar, Shield, Filter, MoreVertical, GraduationCap, Award
} from 'lucide-react';
import {
  employeeApi,
  type EmployeeDto,
  type CreateEmployeeDto,
  type UpdateEmployeeDto,
  type EmploymentType,
} from '../api/employeeApi';
import { 
  teacherApi, 
  type UpsertTeacherProfileDto 
} from '../api/teacherApi';
import { masterApi } from '../api/masterApi';

// ─── Helpers ───────────────────────────────────────────────────────────────

const EMPLOYMENT_TYPES: { label: string; value: EmploymentType }[] = [
  { label: 'Full Time', value: 1 },
  { label: 'Part Time', value: 2 },
  { label: 'Contract', value: 3 },
  { label: 'Intern', value: 4 },
];

const EMPLOYMENT_TYPE_COLORS: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-700',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-amber-100 text-amber-700',
  4: 'bg-purple-100 text-purple-700',
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(code: string) {
  const colors = [
    'bg-violet-100 text-violet-700',
    'bg-cyan-100 text-cyan-700',
    'bg-rose-100 text-rose-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-blue-100 text-blue-700',
  ];
  const idx = code.charCodeAt(code.length - 1) % colors.length;
  return colors[idx];
}

// ─── Blank form ───────────────────────────────────────────────────────────

const blankForm = (): CreateEmployeeDto => ({
  firstName: '',
  lastName: '',
  mobileNumber: '',
  workEmail: '',
  dateOfJoining: new Date().toISOString().split('T')[0],
  employmentType: 1,
});

// ─── Main Component ───────────────────────────────────────────────────────

export default function Employees() {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Masters
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [designations, setDesignations] = useState<{ id: string; name: string }[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);

  // Filters & pagination
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(true);
  const [filterEmpType, setFilterEmpType] = useState<EmploymentType | undefined>();
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateEmployeeDto | UpdateEmployeeDto>(blankForm());
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Deactivate
  const [deactivateTarget, setDeactivateTarget] = useState<EmployeeDto | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');

  // Active menu
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Teacher Profile state
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState<UpsertTeacherProfileDto | null>(null);
  const [isTeacherSaving, setIsTeacherSaving] = useState(false);
  const [targetEmployeeName, setTargetEmployeeName] = useState('');

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await employeeApi.getAll({
        pageNumber,
        pageSize,
        search: search || undefined,
        isActive: filterActive,
        employmentType: filterEmpType,
      });
      setEmployees(result.data);
      setTotalRecords(result.totalRecords);
    } catch {
      setError('Failed to load employees. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, search, filterActive, filterEmpType]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // Load Masters
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [d, ds, r] = await Promise.all([
          masterApi.getAll('departments'),
          masterApi.getAll('designations'),
          masterApi.getAll('roles'),
        ]);
        setDepartments(d);
        setDesignations(ds);
        setRoles(r);
      } catch (err) {
        console.error('Failed to load masters', err);
      }
    };
    loadMasters();
  }, []);

  // Search debounce
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPageNumber(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Open add modal ──
  const openAdd = () => {
    setEditingId(null);
    setForm(blankForm());
    setFormError(null);
    setShowModal(true);
  };

  // ── Open edit modal ──
  const openEdit = async (id: string) => {
    setOpenMenu(null);
    setIsLoading(true);
    setFormError(null);
    try {
      const emp = await employeeApi.getById(id);
      setEditingId(id);
      setForm({
        ...emp,
        dateOfJoining: emp.dateOfJoining.split('T')[0],
        dateOfBirth: emp.dateOfBirth?.split('T')[0],
      } as UpdateEmployeeDto);
      setShowModal(true);
    } catch {
      setError('Failed to load employee details.');
    } finally {
      setIsLoading(false);
    }
  };

  const openTeacherProfile = async (emp: EmployeeDto) => {
    setOpenMenu(null);
    setTargetEmployeeName(emp.fullName);
    setIsLoading(true);
    try {
      try {
        const profile = await teacherApi.getByEmployeeId(emp.id);
        setTeacherProfile({
          employeeId: emp.id,
          highestQualification: profile.highestQualification || '',
          qualificationInstitution: profile.qualificationInstitution || '',
          qualificationYear: profile.qualificationYear,
          specializations: profile.specializations || '',
          previousExperienceYears: profile.previousExperienceYears,
          previousSchools: profile.previousSchools || '',
        });
      } catch {
        setTeacherProfile({
          employeeId: emp.id,
          highestQualification: '',
          qualificationInstitution: '',
          specializations: '',
          previousSchools: '',
        });
      }
      setShowTeacherModal(true);
    } catch {
      setError('Failed to fetch academic profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTeacher = async () => {
    if (!teacherProfile) return;
    setIsTeacherSaving(true);
    try {
      await teacherApi.upsert(teacherProfile);
      setShowTeacherModal(false);
    } catch {
      setError('Failed to save academic profile.');
    } finally {
      setIsTeacherSaving(false);
    }
  };

  // ── Save (create or update) ──
  const handleSave = async () => {
    setFormError(null);
    const f = form as CreateEmployeeDto;
    if (!f.firstName || !f.lastName || !f.workEmail || !f.mobileNumber) {
      setFormError('First name, last name, work email, and mobile are required.');
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        await employeeApi.update(editingId, form as UpdateEmployeeDto);
      } else {
        await employeeApi.create(form as CreateEmployeeDto);
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg || 'Failed to save employee.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Deactivate ──
  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await employeeApi.deactivate(deactivateTarget.id, deactivateReason || undefined);
      setDeactivateTarget(null);
      setDeactivateReason('');
      fetchEmployees();
    } catch {
      setError('Failed to deactivate employee.');
    }
  };

  // ── Reactivate ──
  const handleReactivate = async (id: string) => {
    setOpenMenu(null);
    try {
      await employeeApi.reactivate(id);
      fetchEmployees();
    } catch {
      setError('Failed to reactivate employee.');
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const field = (k: keyof CreateEmployeeDto | keyof UpdateEmployeeDto) =>
    ((form as unknown) as Record<string, unknown>)[k as string] as string | undefined ?? '';

  const setField = (k: string, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const currentDob = field('dateOfBirth') ? new Date(field('dateOfBirth')) : null;
  const dobYear = currentDob && !isNaN(currentDob.getTime()) ? currentDob.getFullYear().toString() : '';
  const dobMonth = currentDob && !isNaN(currentDob.getTime()) ? (currentDob.getMonth() + 1).toString() : '';
  const dobDay = currentDob && !isNaN(currentDob.getTime()) ? currentDob.getDate().toString() : '';
  
  const handleDobChange = (type: 'year' | 'month' | 'day', value: string) => {
    let y = dobYear || new Date().getFullYear().toString();
    let m = dobMonth || '1';
    let d = dobDay || '1';
    if (type === 'year') y = value;
    if (type === 'month') m = value;
    if (type === 'day') d = value;
    if (!value && type === 'year' && !dobMonth && !dobDay) {
       setField('dateOfBirth', ''); return;
    }
    setField('dateOfBirth', `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Employee Directory</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {totalRecords} employee{totalRecords !== 1 ? 's' : ''} in this school
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by name, code, email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filterActive === undefined ? '' : String(filterActive)}
            onChange={e => {
              setFilterActive(e.target.value === '' ? undefined : e.target.value === 'true');
              setPageNumber(1);
            }}
            className="border border-slate-200 bg-white text-sm text-slate-700 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select
            value={filterEmpType ?? ''}
            onChange={e => {
              setFilterEmpType(e.target.value ? Number(e.target.value) as EmploymentType : undefined);
              setPageNumber(1);
            }}
            className="border border-slate-200 bg-white text-sm text-slate-700 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer"
          >
            <option value="">All Types</option>
            {EMPLOYMENT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading employees…
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <Briefcase className="h-10 w-10 opacity-30" />
            <p className="font-medium">No employees found</p>
            <p className="text-sm">Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Employee</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Contact</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Department</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Type</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Joined</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {emp.profilePhoto ? (
                          <img src={emp.profilePhoto} alt={emp.fullName}
                            className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow" />
                        ) : (
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ring-2 ring-white shadow ${avatarColor(emp.employeeCode)}`}>
                            {getInitials(emp.fullName)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-800 leading-tight">{emp.fullName}</p>
                          <p className="text-xs text-slate-400 font-mono">{emp.employeeCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {emp.workEmail}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {emp.mobileNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        {emp.departmentName && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            {emp.departmentName}
                          </div>
                        )}
                        {emp.designationName && (
                          <p className="text-xs text-slate-400 pl-4">{emp.designationName}</p>
                        )}
                        {(!emp.departmentName && !emp.designationName) && (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${EMPLOYMENT_TYPE_COLORS[emp.employmentType] || 'bg-slate-100 text-slate-600'}`}>
                        {emp.employmentTypeName}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {new Date(emp.dateOfJoining).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${emp.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${emp.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === emp.id ? null : emp.id); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenu === emp.id && (
                          <div
                            className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-20 animate-in fade-in slide-in-from-top-1 duration-150"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              onClick={() => openEdit(emp.id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                            </button>
                            {emp.isActive && (
                              <button
                                onClick={() => openTeacherProfile(emp)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                              >
                                <GraduationCap className="h-3.5 w-3.5" /> Academic Profile
                              </button>
                            )}
                            {emp.isActive ? (
                              <button
                                onClick={() => { setOpenMenu(null); setDeactivateTarget(emp); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <UserX className="h-3.5 w-3.5" /> Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(emp.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <UserCheck className="h-3.5 w-3.5" /> Reactivate
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Showing {Math.min((pageNumber - 1) * pageSize + 1, totalRecords)}–{Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(p => p - 1)}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium text-slate-700">{pageNumber} / {totalPages}</span>
            <button
              disabled={pageNumber >= totalPages}
              onClick={() => setPageNumber(p => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Backdrop close for dropdown ── */}
      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          Add / Edit Modal
      ───────────────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white shadow-2xl w-full lg:w-[60%] h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
                  <p className="text-xs text-slate-400">Fill in the details below</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar">

              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Personal Info */}
              <Section icon={<User className="h-4 w-4" />} title="Personal Information">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="First Name *">
                    <input value={field('firstName')} onChange={e => setField('firstName', e.target.value)}
                      className="form-input" placeholder="e.g. John" />
                  </FormField>
                  <FormField label="Last Name *">
                    <input value={field('lastName')} onChange={e => setField('lastName', e.target.value)}
                      className="form-input" placeholder="e.g. Smith" />
                  </FormField>
                  <FormField label="Gender">
                    <select value={field('gender')} onChange={e => setField('gender', e.target.value)} className="form-input">
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </FormField>
                  <FormField label="Date of Birth" className="col-span-2 md:col-span-1">
                    <div className="flex gap-2 w-full">
                      <select value={dobYear} onChange={e => handleDobChange('year', e.target.value)} className="form-input p-2 flex-1 w-24">
                        <option value="">Year</option>
                        {Array.from({length: 60}, (_, i) => new Date().getFullYear() - 15 - i).map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <select value={dobMonth} onChange={e => handleDobChange('month', e.target.value)} className="form-input p-2 flex-1">
                         <option value="">Month</option>
                         {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'short' })}</option>)}
                      </select>
                      <select value={dobDay} onChange={e => handleDobChange('day', e.target.value)} className="form-input p-2 flex-1 min-w-[60px]">
                         <option value="">Day</option>
                         {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </FormField>
                  <FormField label="Blood Group">
                    <select value={field('bloodGroup')} onChange={e => setField('bloodGroup', e.target.value)} className="form-input">
                      <option value="">Select</option>
                      {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Marital Status">
                    <select value={field('maritalStatus')} onChange={e => setField('maritalStatus', e.target.value)} className="form-input">
                      <option value="">Select</option>
                      <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                    </select>
                  </FormField>
                </div>
              </Section>

              {/* Contact */}
              <Section icon={<Phone className="h-4 w-4" />} title="Contact Information">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Mobile Number *">
                    <input value={field('mobileNumber')} onChange={e => setField('mobileNumber', e.target.value)}
                      className="form-input" placeholder="+91 9876543210" />
                  </FormField>
                  <FormField label="Work Email *">
                    <input type="email" value={field('workEmail')} onChange={e => setField('workEmail', e.target.value)}
                      className="form-input" placeholder="name@school.edu" />
                  </FormField>
                  <FormField label="Personal Email">
                    <input type="email" value={field('personalEmail')} onChange={e => setField('personalEmail', e.target.value)}
                      className="form-input" placeholder="personal@email.com" />
                  </FormField>
                  <FormField label="Emergency Contact Name">
                    <input value={field('emergencyContactName')} onChange={e => setField('emergencyContactName', e.target.value)}
                      className="form-input" placeholder="Guardian / Spouse" />
                  </FormField>
                  <FormField label="Emergency Number">
                    <input value={field('emergencyContactNumber')} onChange={e => setField('emergencyContactNumber', e.target.value)}
                      className="form-input" placeholder="+91 9000000000" />
                  </FormField>
                </div>
              </Section>

              {/* Address */}
              <Section icon={<MapPin className="h-4 w-4" />} title="Present Address">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Address Line 1" className="col-span-2">
                    <input value={field('addressLine1')} onChange={e => setField('addressLine1', e.target.value)}
                      className="form-input" placeholder="House / Flat, Street" />
                  </FormField>
                  <FormField label="Address Line 2" className="col-span-2">
                    <input value={field('addressLine2')} onChange={e => setField('addressLine2', e.target.value)}
                      className="form-input" placeholder="Locality / Area" />
                  </FormField>
                  <FormField label="City">
                    <input value={field('city')} onChange={e => setField('city', e.target.value)} className="form-input" placeholder="City" />
                  </FormField>
                  <FormField label="State">
                    <input value={field('state')} onChange={e => setField('state', e.target.value)} className="form-input" placeholder="State" />
                  </FormField>
                  <FormField label="Pincode">
                    <input value={field('pincode')} onChange={e => setField('pincode', e.target.value)} className="form-input" placeholder="000000" />
                  </FormField>
                </div>
              </Section>

              {/* Job Info */}
              <Section icon={<Briefcase className="h-4 w-4" />} title="Job Information">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Date of Joining *">
                    <input type="date" value={field('dateOfJoining')} onChange={e => setField('dateOfJoining', e.target.value)}
                      className="form-input" />
                  </FormField>
                  <FormField label="Employment Type">
                    <select
                      value={(form as CreateEmployeeDto).employmentType}
                      onChange={e => setField('employmentType', Number(e.target.value))}
                      className="form-input"
                    >
                      {EMPLOYMENT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Work Location">
                    <input value={field('workLocation')} onChange={e => setField('workLocation', e.target.value)}
                      className="form-input" placeholder="Main Campus / Branch" />
                  </FormField>
                  <FormField label="Department">
                    <select value={field('departmentId')} onChange={e => setField('departmentId', e.target.value)} className="form-input">
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Designation">
                    <select value={field('designationId')} onChange={e => setField('designationId', e.target.value)} className="form-input">
                      <option value="">Select Designation</option>
                      {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Employee Role (System Role)">
                    <select value={field('employeeRoleId')} onChange={e => setField('employeeRoleId', e.target.value)} className="form-input">
                      <option value="">Select Role</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </FormField>
                </div>
              </Section>

              {/* Status (edit only) */}
              {editingId && (
                <Section icon={<Shield className="h-4 w-4" />} title="Account Status">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(form as UpdateEmployeeDto).isActive ?? true}
                        onChange={e => setField('isActive', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                    </label>
                    <span className="text-sm font-medium text-slate-700">
                      {(form as UpdateEmployeeDto).isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {!(form as UpdateEmployeeDto).isActive && (
                    <FormField label="Deactivation Reason" className="mt-3">
                      <input
                        value={field('deactivationReason')}
                        onChange={e => setField('deactivationReason', e.target.value)}
                        className="form-input"
                        placeholder="Reason for deactivation"
                      />
                    </FormField>
                  )}
                </Section>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition hover:scale-105 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingId ? 'Save Changes' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          Deactivate Confirm Modal
      ───────────────────────────────────────────────────────────────────── */}
      {deactivateTarget && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setDeactivateTarget(null); setDeactivateReason(''); }} />
          <div className="relative bg-white shadow-2xl w-full lg:w-[60%] h-full flex flex-col animate-in slide-in-from-right duration-300 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Deactivate Employee</h3>
                <p className="text-xs text-slate-500">This will disable their account access.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to deactivate <span className="font-semibold">{deactivateTarget.fullName}</span>?
            </p>
            <FormField label="Reason (optional)">
              <input
                value={deactivateReason}
                onChange={e => setDeactivateReason(e.target.value)}
                className="form-input"
                placeholder="e.g. Resigned, End of contract"
              />
            </FormField>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setDeactivateTarget(null); setDeactivateReason(''); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                className="flex-1 px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-xl transition"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          Academic Profile Modal (Teacher Profile)
      ───────────────────────────────────────────────────────────────────── */}
      {showTeacherModal && teacherProfile && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTeacherModal(false)} />
          <div className="relative bg-white shadow-2xl w-full sm:w-[500px] h-full flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Academic Profile</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">{targetEmployeeName}</p>
                </div>
              </div>
              <button onClick={() => setShowTeacherModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <Section icon={<GraduationCap className="h-4 w-4" />} title="Educational Background">
                <div className="space-y-4">
                  <FormField label="Highest Qualification *">
                    <input 
                      value={teacherProfile.highestQualification} 
                      onChange={e => setTeacherProfile({...teacherProfile, highestQualification: e.target.value})}
                      className="form-input" placeholder="e.g. M.Sc. Physics, B.Ed." 
                    />
                  </FormField>
                  <FormField label="Institution">
                    <input 
                      value={teacherProfile.qualificationInstitution} 
                      onChange={e => setTeacherProfile({...teacherProfile, qualificationInstitution: e.target.value})}
                      className="form-input" placeholder="University / College Name" 
                    />
                  </FormField>
                  <FormField label="Year of Completion">
                    <input 
                      type="number"
                      value={teacherProfile.qualificationYear || ''} 
                      onChange={e => setTeacherProfile({...teacherProfile, qualificationYear: e.target.value ? parseInt(e.target.value) : undefined})}
                      className="form-input" placeholder="2015" 
                    />
                  </FormField>
                </div>
              </Section>

              <Section icon={<Award className="h-4 w-4" />} title="Expertise & Experience">
                <div className="space-y-4">
                  <FormField label="Specializations (comma separated)">
                    <input 
                      value={teacherProfile.specializations} 
                      onChange={e => setTeacherProfile({...teacherProfile, specializations: e.target.value})}
                      className="form-input" placeholder="Mathematics, Quantum Physics" 
                    />
                  </FormField>
                  <FormField label="Previous Teaching Experience (Years)">
                    <input 
                      type="number"
                      value={teacherProfile.previousExperienceYears || ''} 
                      onChange={e => setTeacherProfile({...teacherProfile, previousExperienceYears: e.target.value ? parseInt(e.target.value) : undefined})}
                      className="form-input" placeholder="5" 
                    />
                  </FormField>
                  <FormField label="Previous Schools">
                    <textarea 
                      value={teacherProfile.previousSchools} 
                      onChange={e => setTeacherProfile({...teacherProfile, previousSchools: e.target.value})}
                      className="form-input min-h-[80px]" placeholder="List of previously served institutions" 
                    />
                  </FormField>
                </div>
              </Section>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
              <button
                onClick={() => setShowTeacherModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTeacher}
                disabled={isTeacherSaving || !teacherProfile.highestQualification}
                className="flex-[2] flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 transition disabled:opacity-50"
              >
                {isTeacherSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Academic Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal for documents ── (placeholder — expandable in Phase 2) */}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-600">
        <span className="text-primary-500">{icon}</span>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h4>
      </div>
      <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-4">
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  );
}

// Inject .form-input style if not in CSS (fallback)
const style = document.createElement('style');
style.textContent = `.form-input { @apply w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-300 transition; }`;
if (!document.head.querySelector('[data-fid="employees"]')) {
  style.setAttribute('data-fid', 'employees');
  document.head.appendChild(style);
}
