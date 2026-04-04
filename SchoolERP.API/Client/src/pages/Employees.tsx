import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, Search, Plus, Edit, DollarSign,
  MapPin, Phone, Briefcase, GraduationCap, 
  Award, Shield, 
  X, Save, Loader2, AlertCircle, UserX,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  EmploymentType, 
  EmployeeDto,
  employeeApi
} from '../api/employeeApi';
import { masterApi } from '../api/masterApi';
import { leaveApi, type LeavePlanDto } from '../api/leaveApi';
import apiClient from '../api/apiClient'
import { useLocalization } from '../contexts/LocalizationContext';
import { usePermissions } from '../hooks/usePermissions';

// --- Constants ---
const EMPLOYMENT_TYPES = [
  { label: 'Full Time', value: 1 },
  { label: 'Part Time', value: 2 },
  { label: 'Contract', value: 3 },
  { label: 'Intern', value: 4 },
];

export default function Employees() {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const { hasWritePermission } = usePermissions();
  const writeAllowed = hasWritePermission('employee_directory');
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Masters
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [salaryStructures, setSalaryStructures] = useState<any[]>([]);
  const [leavePlans, setLeavePlans] = useState<LeavePlanDto[]>([]);

  // Filters & pagination
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(true);
  const [filterEmpType, setFilterEmpType] = useState<EmploymentType | undefined>();
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(blankForm());
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('personal');

  const inputCls = (field: string) =>
    `w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? 'border-red-300 focus:ring-red-400/30 focus:border-red-400'
        : 'border-slate-200 focus:ring-primary-500/30 focus:border-primary-400'
    }`;

  // Teacher Profile state
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [isTeacherLoading, setIsTeacherLoading] = useState(false);

  // Salary state
  const [employeeSalary, setEmployeeSalary] = useState<any>(null);
  const [selectedStructureId, setSelectedStructureId] = useState<string>('');
  const [isSalarySaving, setIsSalarySaving] = useState(false);

  // Deactivate
  const [deactivateTarget, setDeactivateTarget] = useState<EmployeeDto | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');

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
      setError('Failed to load employees.');
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, search, filterActive, filterEmpType]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  useEffect(() => {
    masterApi.getAll('departments').then(setDepartments).catch(console.error);
    masterApi.getAll('designations').then(setDesignations).catch(console.error);
    masterApi.getAll('roles').then(setRoles).catch(console.error);
    leaveApi.getPlans().then(setLeavePlans).catch(console.error);
    apiClient.get('/payroll/structures').then(res => setSalaryStructures(res.data)).catch(console.error);
  }, []);

  function blankForm() {
    return {
      firstName: '', lastName: '', gender: '', dateOfBirth: '', bloodGroup: '', maritalStatus: '',
      mobileNumber: '', personalEmail: '', workEmail: '', emergencyContactName: '', emergencyContactNumber: '',
      addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
      dateOfJoining: new Date().toISOString().substring(0,10), employmentType: 1, workLocation: '',
      departmentId: '', designationId: '', employeeRoleId: '', leavePlanId: '',
      createSystemUser: false, systemPassword: '', isActive: true, deactivationReason: ''
    };
  }

  const handleCreate = () => {
    setEditingId(null);
    setForm(blankForm());
    setTeacherProfile(null);
    setFormError(null);
    setErrors({});
    setActiveTab('personal');
    setShowModal(true);
  };

  const handleEdit = async (id: string) => {
    try {
      setEditingId(id);
      const data = await employeeApi.getById(id);
      setForm({
        ...data,
        dateOfBirth: data.dateOfBirth?.substring(0, 10) || '',
        dateOfJoining: data.dateOfJoining?.substring(0, 10) || '',
        createSystemUser: !!data.userId,
        systemPassword: ''
      });
      
      // Fetch teacher profile if applicable
      if (data.designationName === 'Teacher') {
        fetchTeacherProfile(id);
      } else {
        setTeacherProfile(null);
      }

      setFormError(null);
      setErrors({});
      setActiveTab('personal');
      
      // Fetch salary if editing
      fetchEmployeeSalary(id);

      setShowModal(true);
    } catch { alert('Failed to load details'); }
  };
  const fetchTeacherProfile = async (empId: string) => {
    setIsTeacherLoading(true);
    try {
      const res = await apiClient.get(`/employee/${empId}/teacher-profile`);
      setTeacherProfile(res.data || { employeeId: empId, highestQualification: '' });
    } catch {
      setTeacherProfile({ employeeId: empId, highestQualification: '' });
    } finally {
      setIsTeacherLoading(false);
    }
  };

  const fetchEmployeeSalary = async (empId: string) => {
    try {
      const res = await apiClient.get(`/payroll/employee/${empId}`);
      setEmployeeSalary(res.data);
      setSelectedStructureId(res.data.salaryStructureId);
    } catch {
      setEmployeeSalary(null);
      setSelectedStructureId('');
    }
  };

  const handleSaveSalary = async () => {
    if (!editingId || !selectedStructureId) return;
    setIsSalarySaving(true);
    try {
      await apiClient.post('/payroll/assign', {
        employeeId: editingId,
        salaryStructureId: selectedStructureId
      });
      await fetchEmployeeSalary(editingId);
      alert('Salary structure assigned successfully!');
    } catch {
      alert('Failed to assign salary structure.');
    } finally {
      setIsSalarySaving(false);
    }
  };

  const setField = (key: string, val: any) => {
    setForm((prev: any) => ({ ...prev, [key]: val }));
    clearError(key);
    
    // If designation changes to Teacher and we don't have a profile, init it
    if (key === 'designationId') {
      const desig = designations.find(d => d.id === val);
      if (desig?.name === 'Teacher' && !teacherProfile) {
        setTeacherProfile({ employeeId: editingId || '', highestQualification: '' });
      }
    }
  };

  const handleTeacherField = (key: string, val: any) => {
    setTeacherProfile((prev: any) => ({ ...prev, [key]: val }));
    clearError(key);
  };

  const clearError = (key: string) => {
    if (errors[key]) setErrors(prev => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  };

  const validate = () => {
    const n: Record<string, string> = {};
    if (!form.firstName?.trim()) n.firstName = 'First Name is required';
    if (!form.lastName?.trim()) n.lastName = 'Last Name is required';
    if (!form.mobileNumber?.trim()) n.mobileNumber = 'Mobile is required';
    if (!form.workEmail?.trim()) n.workEmail = 'Work Email is required';
    if (form.createSystemUser && !editingId && !form.systemPassword?.trim()) n.systemPassword = 'Password is required';
    if (isTeacher && !teacherProfile?.highestQualification?.trim()) n.highestQualification = 'Qualification is required';
    
    setErrors(n);
    if (Object.keys(n).length > 0) {
      if (n.firstName || n.lastName) setActiveTab('personal');
      else if (n.mobileNumber || n.workEmail) setActiveTab('contact');
      else if (n.highestQualification) setActiveTab('academic');
      else if (n.systemPassword) setActiveTab('system');
    }
    return Object.keys(n).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setFormError(null);
    setIsSaving(true);
    const payload = { ...form };
    // Convert empty strings to null for GUID fields
    if (payload.departmentId === '') payload.departmentId = null;
    if (payload.designationId === '') payload.designationId = null;
    if (payload.employeeRoleId === '') payload.employeeRoleId = null;
    if (payload.leavePlanId === '') payload.leavePlanId = null;
    if (payload.userId === '') payload.userId = null;
    if (payload.dateOfBirth === '') payload.dateOfBirth = null;

    try {
      let savedEmp: any;
      if (editingId) {
        savedEmp = await employeeApi.update(editingId, payload);
      } else {
        savedEmp = await employeeApi.create(payload);
      }

      // Save teacher profile if active
      const desig = designations.find(d => d.id === form.designationId);
      if ((desig?.name === 'Teacher' || form.designationName === 'Teacher') && teacherProfile) {
        await apiClient.post('/employee/teacher-profile', { 
          ...teacherProfile, 
          employeeId: editingId || savedEmp.id 
        });
      }

      setShowModal(false);
      fetchEmployees();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await employeeApi.update(deactivateTarget.id, { 
        ...deactivateTarget, 
        isActive: false, 
        deactivationReason: deactivateReason 
      } as any);
      setDeactivateTarget(null);
      setDeactivateReason('');
      fetchEmployees();
    } catch { alert('Failed to deactivate'); }
  };

  const isTeacher = useMemo(() => {
    const desig = designations.find(d => d.id === form.designationId);
    return desig?.name === 'Teacher' || form.designationName === 'Teacher';
  }, [form.designationId, form.designationName, designations]);

  const modalTabs = useMemo(() => {
    const base = [
      { id: 'personal', label: 'Personal', icon: User },
      { id: 'contact', label: 'Contact', icon: Phone },
      { id: 'job', label: 'Job Details', icon: Briefcase },
    ];
    if (isTeacher) {
      base.push({ id: 'academic', label: 'Academic', icon: GraduationCap });
    }
    if (editingId) {
      base.push({ id: 'salary', label: 'Salary & Payroll', icon: DollarSign });
    }
    base.push({ id: 'system', label: 'System Access', icon: Shield });
    return base;
  }, [isTeacher, editingId]);

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className={`max-w-7xl mx-auto space-y-6 ${!writeAllowed ? 'is-read-only-view' : ''}`}>
      
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary-600" />
            Employee Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage staff records and system access.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              value={search} onChange={e => { setSearch(e.target.value); setPageNumber(1); }}
              placeholder="Search employees..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-full md:w-64" 
            />
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm animate-in fade-in transition">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select 
          value={filterActive === undefined ? '' : filterActive.toString()} 
          onChange={e => {
            const val = e.target.value;
            setFilterActive(val === '' ? undefined : val === 'true');
            setPageNumber(1);
          }}
          className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>

        <select 
          value={filterEmpType || ''} 
          onChange={e => {
            setFilterEmpType(e.target.value ? Number(e.target.value) as EmploymentType : undefined);
            setPageNumber(1);
          }}
          className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
        >
          <option value="">All Types</option>
          {EMPLOYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4" colSpan={6}><div className="h-4 bg-slate-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400">No records found.</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">{emp.fullName}</div>
                          <div className="text-xs text-slate-400">{emp.workEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.departmentName || '---'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.designationName || '---'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                        {EMPLOYMENT_TYPES.find(t => t.value === emp.employmentType)?.label || 'Other'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${emp.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className={`text-xs font-semibold ${emp.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {emp.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right shrink-0">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(emp.id)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit Profile"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {emp.isActive && (
                          <button 
                            onClick={() => setDeactivateTarget(emp)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Deactivate Account"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Page {pageNumber} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={pageNumber === 1} onClick={() => setPageNumber(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button disabled={pageNumber >= totalPages} onClick={() => setPageNumber(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>


      {/* ─────────────────────────────────────────────────────────────────────
          Tabbed Modal (Popup)
      ───────────────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white shadow-2xl w-full sm:w-[600px] lg:w-[800px] h-full flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Employee' : 'New Employee Registration'}</h3>
                  <p className="text-xs text-slate-500">Provide staff details in the tabs below.</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex px-4 border-b border-slate-100 bg-slate-50/50 pt-2 shrink-0">
              {modalTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all mr-1 ${
                    activeTab === tab.id 
                    ? 'text-primary-600 border-primary-600 bg-white rounded-t-lg' 
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <Section title="Basic Information" icon={<User className="h-4 w-4" />}>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="First Name *" error={errors.firstName}>
                        <input value={form.firstName} onChange={e => setField('firstName', e.target.value)} className={inputCls('firstName')} placeholder="e.g. Shahbaz" />
                      </FormField>
                      <FormField label="Last Name *" error={errors.lastName}>
                        <input value={form.lastName} onChange={e => setField('lastName', e.target.value)} className={inputCls('lastName')} placeholder="e.g. Ahmad" />
                      </FormField>
                      <FormField label="Gender" error={errors.gender}>
                        <select value={form.gender} onChange={e => setField('gender', e.target.value)} className={inputCls('gender')}>
                          <option value="">Select Gender</option>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </FormField>
                      <FormField label="Date of Birth" error={errors.dateOfBirth}>
                        <input type="date" value={form.dateOfBirth} onChange={e => setField('dateOfBirth', e.target.value)} className={inputCls('dateOfBirth')} />
                      </FormField>
                      <FormField label="Blood Group" error={errors.bloodGroup}>
                        <select value={form.bloodGroup} onChange={e => setField('bloodGroup', e.target.value)} className={inputCls('bloodGroup')}>
                          <option value="">Select</option>
                          {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(g => <option key={g}>{g}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Marital Status" error={errors.maritalStatus}>
                        <select value={form.maritalStatus} onChange={e => setField('maritalStatus', e.target.value)} className={inputCls('maritalStatus')}>
                          <option value="">Select</option>
                          <option>Single</option><option>Married</option><option>Divorced</option>
                        </select>
                      </FormField>
                    </div>
                  </Section>

                  {editingId && (
                    <Section title="Operational Status" icon={<UserX className="h-4 w-4" />}>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <p className="text-sm font-bold text-slate-800 tracking-tight">Active Employment</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Determines if this staff member is currently working.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${form.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {form.isActive ? 'Active' : 'Locked'}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={form.isActive} 
                              onChange={e => setField('isActive', e.target.checked)}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                          </label>
                        </div>
                      </div>
                      {!form.isActive && (
                        <div className="mt-3 animate-in slide-in-from-top-1">
                          <FormField label="Reason for Inactivity" error={errors.deactivationReason}>
                             <input value={form.deactivationReason} onChange={e => setField('deactivationReason', e.target.value)} className={inputCls('deactivationReason')} placeholder="e.g. Resigned" />
                          </FormField>
                        </div>
                      )}
                    </Section>
                  )}
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <Section title="Contact Information" icon={<Phone className="h-4 w-4" />}>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Mobile Number *" error={errors.mobileNumber}>
                        <input value={form.mobileNumber} onChange={e => setField('mobileNumber', e.target.value)} className={inputCls('mobileNumber')} placeholder="+91 XXXXX XXXXX" />
                      </FormField>
                      <FormField label="Work Email *" error={errors.workEmail}>
                        <input value={form.workEmail} onChange={e => setField('workEmail', e.target.value)} className={inputCls('workEmail')} placeholder="official@school.com" />
                      </FormField>
                      <FormField label="Personal Email" error={errors.personalEmail}>
                        <input value={form.personalEmail} onChange={e => setField('personalEmail', e.target.value)} className={inputCls('personalEmail')} />
                      </FormField>
                    </div>
                  </Section>

                  <Section title="Residential Address" icon={<MapPin className="h-4 w-4" />}>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Address Line 1" className="col-span-2" error={errors.addressLine1}>
                        <input value={form.addressLine1} onChange={e => setField('addressLine1', e.target.value)} className={inputCls('addressLine1')} />
                      </FormField>
                      <FormField label="City" error={errors.city}>
                        <input value={form.city} onChange={e => setField('city', e.target.value)} className={inputCls('city')} />
                      </FormField>
                      <FormField label="State" error={errors.state}>
                        <input value={form.state} onChange={e => setField('state', e.target.value)} className={inputCls('state')} />
                      </FormField>
                      <FormField label="Pincode" error={errors.pincode}>
                        <input value={form.pincode} onChange={e => setField('pincode', e.target.value)} className={inputCls('pincode')} />
                      </FormField>
                    </div>
                  </Section>
                </div>
              )}

              {activeTab === 'job' && (
                <div className="space-y-6">
                  <Section title="Employment Details" icon={<Briefcase className="h-4 w-4" />}>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Joining Date *" error={errors.dateOfJoining}>
                        <input type="date" value={form.dateOfJoining} onChange={e => setField('dateOfJoining', e.target.value)} className={inputCls('dateOfJoining')} />
                      </FormField>
                      <FormField label="Employment Type" error={errors.employmentType}>
                        <select value={form.employmentType} onChange={e => setField('employmentType', Number(e.target.value))} className={inputCls('employmentType')}>
                          {EMPLOYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Department" error={errors.departmentId}>
                        <select value={form.departmentId} onChange={e => setField('departmentId', e.target.value)} className={inputCls('departmentId')}>
                          <option value="">Select Dept</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Designation" error={errors.designationId}>
                        <select value={form.designationId} onChange={e => setField('designationId', e.target.value)} className={inputCls('designationId')}>
                          <option value="">Select Desig</option>
                          {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </FormField>

                      <FormField label="Assign Leave Plan (Group)" error={errors.leavePlanId}>
                        <select value={form.leavePlanId} onChange={e => setField('leavePlanId', e.target.value)} className={inputCls('leavePlanId')}>
                          <option value="">System Default</option>
                          {leavePlans.map(p => <option key={p.id} value={p.id}>{p.name} {p.isDefault ? '(Default)' : ''}</option>)}
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1 italic leading-tight">Assigning a plan defines allowed leave categories and accrual rules.</p>
                      </FormField>
                    </div>
                  </Section>
                </div>
              )}

              {activeTab === 'academic' && teacherProfile && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Section title="Qualifications" icon={<GraduationCap className="h-4 w-4" />}>
                    <div className="space-y-4">
                      <FormField label="Highest Qualification *" error={errors.highestQualification}>
                        <input 
                          value={teacherProfile.highestQualification} 
                          onChange={e => handleTeacherField('highestQualification', e.target.value)} 
                          className={inputCls('highestQualification')} 
                          placeholder="e.g. M.Sc in Mathematics"
                        />
                      </FormField>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="University/College" error={errors.qualificationInstitution}>
                          <input value={teacherProfile.qualificationInstitution || ''} onChange={e => handleTeacherField('qualificationInstitution', e.target.value)} className={inputCls('qualificationInstitution')} />
                        </FormField>
                        <FormField label="Year" error={errors.qualificationYear}>
                          <input type="number" value={teacherProfile.qualificationYear || ''} onChange={e => handleTeacherField('qualificationYear', e.target.value ? parseInt(e.target.value) : undefined)} className={inputCls('qualificationYear')} />
                        </FormField>
                      </div>
                    </div>
                  </Section>
                  <Section title="Experience & Specialization" icon={<Award className="h-4 w-4" />}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="Specializations" error={errors.specializations}>
                          <input value={teacherProfile.specializations || ''} onChange={e => handleTeacherField('specializations', e.target.value)} className={inputCls('specializations')} placeholder="e.g. Algebra, Physics" />
                        </FormField>
                        <FormField label="Total Experience (Years)" error={errors.previousExperienceYears}>
                          <input type="number" value={teacherProfile.previousExperienceYears || ''} onChange={e => handleTeacherField('previousExperienceYears', e.target.value ? parseInt(e.target.value) : undefined)} className={inputCls('previousExperienceYears')} />
                        </FormField>
                      </div>
                      <FormField label="Previous Schools" error={errors.previousSchools}>
                        <textarea value={teacherProfile.previousSchools || ''} onChange={e => handleTeacherField('previousSchools', e.target.value)} className={`${inputCls('previousSchools')} min-h-[100px] resize-none`} />
                      </FormField>
                    </div>
                  </Section>
                </div>
              )}
                            {activeTab === 'salary' && editingId && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Section title="Current Salary Assignment" icon={<DollarSign className="h-4 w-4" />}>
                        {employeeSalary ? (
                          <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl flex items-center justify-between mb-2">
                             <div>
                                <h4 className="font-black text-emerald-800 text-lg">{employeeSalary.salaryStructureName}</h4>
                                <div className="flex items-center gap-4 mt-1">
                                   <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Gross: {formatCurrency(employeeSalary.grossSalary)}</div>
                                   <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider bg-emerald-100/50 px-2 py-0.5 rounded-lg">Net: {formatCurrency(employeeSalary.netSalary)}</div>
                                </div>
                             </div>
                             <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <DollarSign className="w-6 h-6" />
                             </div>
                          </div>
                        ) : (
                          <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl flex items-center gap-4 text-amber-600">
                             <AlertCircle className="w-6 h-6" />
                             <p className="text-sm font-bold">No salary structure assigned. This employee will not be included in payroll runs.</p>
                          </div>
                        )}
                      </Section>

                      <Section title="Update Remuneration" icon={<Save className="h-4 w-4" />}>
                         <div className="space-y-4">
                            <FormField label="Assign Salary Structure">
                               <select 
                                 value={selectedStructureId} 
                                 onChange={e => setSelectedStructureId(e.target.value)}
                                 className={inputCls('salaryStructure')}
                               >
                                  <option value="">Select a Structure...</option>
                                  {salaryStructures.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (Net: {formatCurrency(s.netTotal)})</option>
                                  ))}
                               </select>
                            </FormField>
                            
                            <div className="pt-2">
                               <button 
                                 onClick={handleSaveSalary}
                                 disabled={isSalarySaving || !selectedStructureId || selectedStructureId === employeeSalary?.salaryStructureId}
                                 className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-black hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                               >
                                  {isSalarySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                  {employeeSalary ? 'Update Assignment' : 'Assign Structure'}
                               </button>
                            </div>
                         </div>
                      </Section>
                    </div>
                  )}

                  {activeTab === 'system' && (
                <div className="space-y-6">
                  <Section title="Permissions & Access" icon={<Shield className="h-4 w-4" />}>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                          <div>
                            <p className="text-sm font-bold text-slate-800 tracking-tight">System Login Account</p>
                            <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Allow this staff member to log in to the ERP.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={form.createSystemUser} 
                              onChange={e => setField('createSystemUser', e.target.checked)}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                          </label>
                        </div>

                        {form.createSystemUser && (
                          <div className="grid grid-cols-2 gap-4 p-5 bg-primary-50/20 border border-primary-100 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                             <div className="col-span-2 pb-2 border-b border-primary-100/50 mb-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-600/60 mb-1 block">Account Identity</label>
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                                    <User className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-800">{form.workEmail || 'No email provided'}</p>
                                    <p className="text-[10px] text-slate-400 font-medium italic">Username (Primary Email)</p>
                                  </div>
                                </div>
                             </div>

                             <FormField label="System Role *" className="col-span-2" error={errors.employeeRoleId}>
                                <select value={form.employeeRoleId} onChange={e => setField('employeeRoleId', e.target.value)} className={inputCls('employeeRoleId')}>
                                  <option value="">Assign Permissions Role</option>
                                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                             </FormField>

                             <FormField label="Access Password *" className="col-span-2" error={errors.systemPassword}>
                               <input 
                                 type="password" 
                                 value={form.systemPassword} 
                                 onChange={e => setField('systemPassword', e.target.value)} 
                                 className={inputCls('systemPassword')} 
                                 placeholder="Assign a secure password"
                               />
                             </FormField>
                          </div>
                        )}
                    </div>
                  </Section>

                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
               <button onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Cancel</button>
               <button 
                 onClick={handleSave} 
                 disabled={isSaving}
                 className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-sm shadow-primary-500/20"
               >
                 {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                 {editingId ? 'Save Changes' : 'Register Staff'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirm Dialog */}
      {deactivateTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeactivateTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Deactivate Staff?</h3>
            <p className="text-sm text-slate-500 mb-4">Are you sure you want to deactivate <span className="font-bold">{deactivateTarget.fullName}</span>? This will suspend their system login.</p>
            <div className="space-y-3">
              <FormField label="Public Deactivation Reason">
                <input value={deactivateReason} onChange={e => setDeactivateReason(e.target.value)} className={inputCls('deactivateReason')} placeholder="Optional note" />
              </FormField>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setDeactivateTarget(null)} className="flex-1 py-2 text-sm font-semibold text-slate-500 bg-slate-100 rounded-xl">Cancel</button>
                <button onClick={handleDeactivate} className="flex-1 py-2 text-sm font-semibold text-white bg-rose-500 rounded-xl">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Local Helpers ---

function Section({ icon, title, children }: { icon: React.ReactNode; title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1 px-1">
        <div className="text-primary-600 opacity-80">{icon}</div>
        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">{title}</h4>
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children, className = '', error }: { label: string; children: React.ReactNode; className?: string; error?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-[10px] font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}
