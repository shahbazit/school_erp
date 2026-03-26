import React, { useState, useEffect, useCallback } from 'react';
import { X, User, BookOpen, Users, MapPin, ChevronLeft, ChevronRight, Check, CreditCard, Plus, Trash2, Settings, TrendingDown } from 'lucide-react';
import { Student, CreateStudentDto, UpdateStudentDto, AssignCourseDto } from '../types';
import { masterApi } from '../api/masterApi';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: CreateStudentDto | UpdateStudentDto) => Promise<void>;
  initialData?: Student | null;
}

const TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'academic', label: 'Academic', icon: BookOpen },
  { id: 'parent', label: 'Parent / Guardian', icon: Users },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'fees', label: 'Fees & Discounts', icon: CreditCard },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const defaultForm = {
  admissionNo: '',
  firstName: '',
  lastName: '',
  gender: 'Male',
  dateOfBirth: '',
  bloodGroup: '',
  mobileNumber: '',
  email: '',
  rollNumber: '',
  classId: '',
  sectionId: '',
  academicYear: new Date().getFullYear().toString(),
  previousSchool: '',
  fatherName: '',
  fatherMobile: '',
  fatherEmail: '',
  fatherOccupation: '',
  motherName: '',
  motherMobile: '',
  motherEmail: '',
  motherOccupation: '',
  guardianName: '',
  guardianMobile: '',
  guardianEmail: '',
  guardianRelation: '',
  emergencyContactName: '',
  emergencyContactNumber: '',
  emergencyContactRelation: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  isActive: true,
  consentAccepted: true,
  courseIds: [] as AssignCourseDto[],
  feeSubscriptions: [] as any[],
  feeDiscounts: [] as any[],
};

export default function StudentModal({ isOpen, onClose, onSave, initialData }: StudentModalProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({ ...defaultForm });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loadingMasters, setLoadingMasters] = useState(false);

  const fetchMasters = useCallback(async () => {
    setLoadingMasters(true);
    try {
      const [cls, sec, heads, discs, years] = await Promise.all([
        masterApi.getAll('classes'),
        masterApi.getAll('sections'),
        masterApi.getAll('fee/heads'),
        masterApi.getAll('fee/discounts'),
        masterApi.getAll('academic-years'),
      ]);
      setClasses(cls.sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })));
      setSections(sec.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      setFeeHeads(heads.filter((h: any) => h.isSelective).sort((a: any, b: any) => a.name.localeCompare(b.name)));
      setAvailableDiscounts(discs.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      setAcademicYears(years.sort((a: any, b: any) => b.name.localeCompare(a.name))); // For years, usually want newest first
      
      const currentYear = years.find((y: any) => y.isCurrent);
      if (currentYear && !initialData) {
        setFormData(prev => ({ ...prev, academicYear: currentYear.name }));
      }
    } catch {
      // silently fail, selects remain empty
    } finally {
      setLoadingMasters(false);
    }
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      fetchMasters();
      setActiveTab('personal');
      setErrors({});
      if (initialData) {
        setFormData({
          admissionNo: initialData.admissionNo || '',
          firstName: initialData.firstName || '',
          lastName: initialData.lastName || '',
          gender: initialData.gender || 'Male',
          dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.substring(0, 10) : '',
          bloodGroup: initialData.bloodGroup || '',
          mobileNumber: initialData.mobileNumber || '',
          email: initialData.email || '',
          feeSubscriptions: initialData.feeSubscriptions || [],
          feeDiscounts: initialData.feeDiscounts || [],
          rollNumber: initialData.rollNumber || '',
          classId: initialData.classId || '',
          sectionId: initialData.sectionId || '',
          academicYear: initialData.academicYear || new Date().getFullYear().toString(),
          previousSchool: initialData.previousSchool || '',
          fatherName: initialData.fatherName || '',
          fatherMobile: initialData.fatherMobile || '',
          fatherEmail: initialData.fatherEmail || '',
          fatherOccupation: initialData.fatherOccupation || '',
          motherName: initialData.motherName || '',
          motherMobile: initialData.motherMobile || '',
          motherEmail: initialData.motherEmail || '',
          motherOccupation: initialData.motherOccupation || '',
          guardianName: initialData.guardianName || '',
          guardianMobile: initialData.guardianMobile || '',
          guardianEmail: initialData.guardianEmail || '',
          guardianRelation: initialData.guardianRelation || '',
          emergencyContactName: initialData.emergencyContactName || '',
          emergencyContactNumber: initialData.emergencyContactNumber || '',
          emergencyContactRelation: initialData.emergencyContactRelation || '',
          addressLine1: initialData.addressLine1 || '',
          addressLine2: initialData.addressLine2 || '',
          city: initialData.city || '',
          state: initialData.state || '',
          pincode: initialData.pincode || '',
          isActive: initialData.isActive !== false,
          consentAccepted: true,
          courseIds: [],
        });
      } else {
        setFormData({ ...defaultForm });
      }
    }
  }, [initialData, isOpen, fetchMasters]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.classId) newErrors.classId = 'Class is required';
    if (!formData.academicYear) newErrors.academicYear = 'Academic Year is required';
    if (!formData.fatherName?.trim() && !formData.motherName?.trim() && !formData.guardianName?.trim()) {
      newErrors.guardianInfo = "At least one Parent/Guardian name is required (Father, Mother, or Guardian)";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.firstName || newErrors.lastName || newErrors.mobileNumber || newErrors.gender) setActiveTab('personal');
      else if (newErrors.classId || newErrors.academicYear) setActiveTab('academic');
      else if (newErrors.guardianInfo) setActiveTab('parent');
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSave(formData as any);
      onClose();
    } catch (error) {
      console.error('Failed to save student', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? 'border-red-300 focus:ring-red-400/30 focus:border-red-400'
        : 'border-slate-200 focus:ring-primary-500/30 focus:border-primary-400'
    }`;

  const currentDob = formData.dateOfBirth ? new Date(formData.dateOfBirth) : null;
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
       setFormData(prev => ({ ...prev, dateOfBirth: '' }));
       return;
    }

    const newDob = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, dateOfBirth: newDob }));
  };

  const tabIndex = TABS.findIndex(t => t.id === activeTab);

  const renderPersonalTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">First Name *</label>
          <input name="firstName" value={formData.firstName} onChange={handleChange}
            placeholder="e.g. Riya" className={inputCls('firstName')} />
          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Last Name *</label>
          <input name="lastName" value={formData.lastName} onChange={handleChange}
            placeholder="e.g. Sharma" className={inputCls('lastName')} />
          {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Gender *</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className={inputCls('gender')}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Date of Birth</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={dobYear} onChange={e => handleDobChange('year', e.target.value)} className={inputCls('dateOfBirth') + " p-2 flex-1 min-w-0"}>
              <option value="">Year</option>
              {Array.from({length: 30}, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <div className="flex gap-2 flex-1">
              <select value={dobMonth} onChange={e => handleDobChange('month', e.target.value)} className={inputCls('dateOfBirth') + " p-2 flex-1 min-w-0"}>
                <option value="">Month</option>
                {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'short' })}</option>)}
              </select>
              <select value={dobDay} onChange={e => handleDobChange('day', e.target.value)} className={inputCls('dateOfBirth') + " p-2 flex-1 min-w-0"}>
                <option value="">Day</option>
                {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mobile Number *</label>
          <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange}
            placeholder="e.g. +91 98765 43210" className={inputCls('mobileNumber')} />
          {errors.mobileNumber && <p className="text-xs text-red-500">{errors.mobileNumber}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Blood Group</label>
          <select 
            name="bloodGroup" 
            value={formData.bloodGroup} 
            onChange={handleChange} 
            className={inputCls('bloodGroup')}
          >
            <option value="">Select Group</option>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  const renderAcademicTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Class *</label>
          <select name="classId" value={formData.classId} onChange={handleChange} className={inputCls('classId')}
            disabled={loadingMasters}>
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          {errors.classId && <p className="text-xs text-red-500">{errors.classId}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Section *</label>
          <select name="sectionId" value={formData.sectionId} onChange={handleChange} className={inputCls('sectionId')}
            disabled={loadingMasters}>
            <option value="">Select Section</option>
            {sections.map(sec => (
              <option key={sec.id} value={sec.id}>{sec.name}</option>
            ))}
          </select>
          {errors.sectionId && <p className="text-xs text-red-500">{errors.sectionId}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Roll Number</label>
          <input name="rollNumber" value={formData.rollNumber} onChange={handleChange}
            placeholder="e.g. 42" className={inputCls('rollNumber')} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Academic Year *</label>
          <select 
            name="academicYear" 
            value={formData.academicYear} 
            onChange={handleChange} 
            className={inputCls('academicYear')}
          >
            <option value="">Select Year</option>
            {academicYears.map(year => (
              <option key={year.id} value={year.name}>{year.name}</option>
            ))}
          </select>
          {errors.academicYear && <p className="text-xs text-red-500">{errors.academicYear}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Admission Number</label>
        <input name="admissionNo" value={formData.admissionNo} onChange={handleChange}
          placeholder="Leave blank to auto-generate" className={inputCls('admissionNo')} />
        <p className="text-xs text-slate-400">If left blank, a unique admission number will be generated automatically.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Previous School</label>
        <input name="previousSchool" value={formData.previousSchool} onChange={handleChange}
          placeholder="Name of previous school (if any)" className={inputCls('previousSchool')} />
      </div>

      {initialData && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive}
            onChange={handleChange} className="h-4 w-4 rounded text-primary-600 border-slate-300 cursor-pointer" />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
            Student is currently active / enrolled
          </label>
        </div>
      )}
    </div>
  );

  const renderParentTab = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 border-b pb-1">Father's Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Name</label>
            <input name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="e.g. Ramesh" className={inputCls('fatherName')} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mobile</label>
            <input type="tel" name="fatherMobile" value={formData.fatherMobile} onChange={handleChange} placeholder="+91 9876543210" className={inputCls('fatherMobile')} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</label>
            <input type="email" name="fatherEmail" value={formData.fatherEmail} onChange={handleChange} className={inputCls('fatherEmail')} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Occupation</label>
            <input name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className={inputCls('fatherOccupation')} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 border-b pb-1">Mother's Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Name</label>
            <input name="motherName" value={formData.motherName} onChange={handleChange} className={inputCls('motherName')} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mobile</label>
            <input type="tel" name="motherMobile" value={formData.motherMobile} onChange={handleChange} className={inputCls('motherMobile')} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</label>
            <input type="email" name="motherEmail" value={formData.motherEmail} onChange={handleChange} className={inputCls('motherEmail')} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Occupation</label>
            <input name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className={inputCls('motherOccupation')} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 border-b pb-1">Local Guardian (Optional)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Name</label>
            <input name="guardianName" value={formData.guardianName} onChange={handleChange} className={inputCls('guardianName')} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mobile</label>
            <input type="tel" name="guardianMobile" value={formData.guardianMobile} onChange={handleChange} className={inputCls('guardianMobile')} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</label>
            <input type="email" name="guardianEmail" value={formData.guardianEmail} onChange={handleChange} className={inputCls('guardianEmail')} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Relation</label>
            <input name="guardianRelation" value={formData.guardianRelation} onChange={handleChange} className={inputCls('guardianRelation')} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 border-b pb-1">Emergency Contact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Name</label>
            <input name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className={inputCls('emergencyContactName')} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Number</label>
            <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} className={inputCls('emergencyContactNumber')} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Relation</label>
            <input name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleChange} className={inputCls('emergencyContactRelation')} />
          </div>
        </div>
      </div>
      {errors.guardianInfo && <p className="text-xs text-red-500 mt-2">{errors.guardianInfo}</p>}
    </div>
  );

  const renderAddressTab = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Address Line 1</label>
        <input name="addressLine1" value={formData.addressLine1} onChange={handleChange}
          placeholder="House No., Street, Colony" className={inputCls('addressLine1')} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Address Line 2</label>
        <input name="addressLine2" value={formData.addressLine2} onChange={handleChange}
          placeholder="Landmark, Area (optional)" className={inputCls('addressLine2')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">City</label>
          <input name="city" value={formData.city} onChange={handleChange}
            placeholder="City" className={inputCls('city')} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">State</label>
          <input name="state" value={formData.state} onChange={handleChange}
            placeholder="State" className={inputCls('state')} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">PIN Code</label>
          <input name="pincode" value={formData.pincode} onChange={handleChange}
            placeholder="110001" className={inputCls('pincode')} />
        </div>
      </div>
    </div>
  );

  const renderFeesTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* Subscriptions */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary-600" />
            <h3 className="font-bold text-slate-700 text-sm">Selective Fee Subscriptions</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Fee Head</label>
              <select 
                id="new-sub-head"
                className="form-input text-sm"
              >
                <option value="">Select Fee Head...</option>
                {feeHeads.filter(h => !formData.feeSubscriptions.some((s: any) => s.feeHeadId === h.id)).map((h: any) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Custom Amount</label>
                <input type="number" id="new-sub-amount" placeholder="Default" className="form-input text-sm" />
              </div>
              <button 
                type="button"
                onClick={() => {
                  const headId = (document.getElementById('new-sub-head') as HTMLSelectElement).value;
                  const amount = (document.getElementById('new-sub-amount') as HTMLInputElement).value;
                  if (!headId) return;
                  const head = feeHeads.find(h => h.id === headId);
                  setFormData({
                    ...formData,
                    feeSubscriptions: [
                      ...formData.feeSubscriptions,
                      { feeHeadId: headId, feeHeadName: head?.name, customAmount: amount ? Number(amount) : null }
                    ]
                  });
                  (document.getElementById('new-sub-head') as HTMLSelectElement).value = '';
                  (document.getElementById('new-sub-amount') as HTMLInputElement).value = '';
                }}
                className="btn-primary p-2 h-[38px] w-[38px] flex items-center justify-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2">Fee Head</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {formData.feeSubscriptions.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400 italic text-xs">No elective fees selected.</td></tr>
                ) : (
                  formData.feeSubscriptions.map((sub: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2 font-medium">{sub.feeHeadName}</td>
                      <td className="px-4 py-2 text-slate-500">{sub.customAmount ? `₹${sub.customAmount}` : 'Standard'}</td>
                      <td className="px-4 py-2 text-right">
                        <button 
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            feeSubscriptions: formData.feeSubscriptions.filter((_: any, i: number) => i !== idx)
                          })}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Discounts */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-slate-700 text-sm">Applied Discounts</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-1">Academic Year</label>
                <select id="new-disc-year" className="form-input text-sm border-emerald-200">
                  {academicYears.map((y: any) => (
                    <option key={y.id} value={y.id}>{y.name} {y.isCurrent ? '(Current)' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-1">Discount Type</label>
                <select id="new-disc-id" className="form-input text-sm border-emerald-200">
                  <option value="">Select Discount...</option>
                  {availableDiscounts.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.calculationType === 'Percentage' ? `${d.value}%` : `₹${d.value}`})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-1">Specific Head (Optional)</label>
                <select id="new-disc-head" className="form-input text-sm border-emerald-200">
                  <option value="">All Monthly Fees</option>
                  {feeHeads.map((h: any) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2 md:col-span-2">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-1">Remarks</label>
                  <input id="new-disc-remarks" type="text" placeholder="Reason..." className="form-input text-sm border-emerald-200" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 md:col-span-2">
                <div>
                  <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-1">Mode</label>
                  <select id="new-disc-calc" className="form-input text-sm border-emerald-200">
                    <option value="">Default</option>
                    <option value="Fixed">Fixed Amount</option>
                    <option value="Percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-1">Custom Value</label>
                  <input id="new-disc-value" type="number" placeholder="Enter..." className="form-input text-sm border-emerald-200" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-1">Frequency</label>
                  <select id="new-disc-freq" className="form-input text-sm border-emerald-200">
                    <option value="">Default</option>
                    <option value="Monthly">Monthly</option>
                    <option value="OneTime">One-Time</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="flex items-end justify-end">
                <button 
                  type="button"
                  onClick={() => {
                    const discId = (document.getElementById('new-disc-id') as HTMLSelectElement).value;
                    const yearId = (document.getElementById('new-disc-year') as HTMLSelectElement).value;
                    const headId = (document.getElementById('new-disc-head') as HTMLSelectElement).value;
                    const remarks = (document.getElementById('new-disc-remarks') as HTMLInputElement).value;
                    const calcType = (document.getElementById('new-disc-calc') as HTMLSelectElement).value;
                    const val = (document.getElementById('new-disc-value') as HTMLInputElement).value;
                    const freq = (document.getElementById('new-disc-freq') as HTMLSelectElement).value;

                    if (!discId || !yearId) return;
                    const disc = availableDiscounts.find(d => d.id === discId);
                    const head = feeHeads.find(h => h.id === headId);
                    const year = academicYears.find(y => y.id === yearId);
                    setFormData({
                      ...formData,
                      feeDiscounts: [
                        ...formData.feeDiscounts,
                        { 
                          feeDiscountId: discId, 
                          discountName: disc?.name,
                          restrictedFeeHeadId: headId || null,
                          restrictedFeeHeadName: headId ? head?.name : 'All',
                          academicYearId: yearId,
                          academicYearName: year?.name,
                          remarks,
                          calculationType: calcType || null,
                          value: val ? Number(val) : null,
                          frequency: freq || null
                        }
                      ]
                    });
                    // Reset custom fields
                    (document.getElementById('new-disc-id') as HTMLSelectElement).value = '';
                    (document.getElementById('new-disc-remarks') as HTMLInputElement).value = '';
                    (document.getElementById('new-disc-calc') as HTMLSelectElement).value = '';
                    (document.getElementById('new-disc-value') as HTMLInputElement).value = '';
                    (document.getElementById('new-disc-freq') as HTMLSelectElement).value = '';
                  }}
                  className="btn-primary bg-emerald-600 hover:bg-emerald-700 p-2 h-[38px] w-full flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Assign Discount</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2">Discount / Head</th>
                  <th className="px-4 py-2">Year</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {formData.feeDiscounts.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400 italic text-xs">No active discounts assigned.</td></tr>
                ) : (
                  formData.feeDiscounts.map((disc: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 text-xs">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                           <p className="font-bold text-slate-700">{disc.discountName}</p>
                           { (disc.calculationType || disc.value) && (
                             <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                {disc.calculationType === 'Percentage' ? `${disc.value}%` : `₹${disc.value}`}
                             </span>
                           )}
                        </div>
                        <div className="flex gap-2 text-[10px] text-slate-400">
                           <p>Head: {disc.restrictedFeeHeadName || 'All'}</p>
                           {disc.frequency && <p>• Freq: {disc.frequency}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-slate-500 font-medium">{disc.academicYearName}</td>
                      <td className="px-4 py-2 text-right">
                        <button 
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            feeDiscounts: formData.feeDiscounts.filter((_: any, i: number) => i !== idx)
                          })}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<string, React.ReactNode> = {
    personal: renderPersonalTab(),
    academic: renderAcademicTab(),
    parent: renderParentTab(),
    address: renderAddressTab(),
    fees: renderFeesTab(),
  };

  const hasErrorsOnTab = (tabId: string) => {
    const tabFields: Record<string, string[]> = {
      personal: ['firstName', 'lastName', 'mobileNumber'],
      academic: ['classId', 'sectionId'],
      parent: ['guardianInfo'],
      address: [],
      fees: [],
    };
    return tabFields[tabId]?.some(f => !!errors[f]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full lg:w-[60%] h-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300 ease-out overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {initialData ? 'Edit Student' : 'Register New Student'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {initialData ? `Editing: ${initialData.firstName} ${initialData.lastName}` : 'Fill in the student details below'}
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/60 px-2 pt-2 shrink-0 gap-1 overflow-x-auto w-full custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasErr = hasErrorsOnTab(tab.id);
            return (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'text-primary-700 border-primary-600 bg-white shadow-sm'
                    : hasErr
                    ? 'text-red-500 border-transparent hover:border-red-300'
                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-200'
                }`}>
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {hasErr && <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {tabContent[activeTab]}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-4">
            <div className="flex gap-2 w-full sm:w-auto justify-center text-slate-400 font-medium">
              <button type="button" onClick={() => setActiveTab(TABS[Math.max(0, tabIndex - 1)].id)}
                disabled={tabIndex === 0}
                className="p-2 text-slate-500 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setActiveTab(TABS[Math.min(TABS.length - 1, tabIndex + 1)].id)}
                disabled={tabIndex === TABS.length - 1}
                className="p-2 text-slate-500 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="text-xs self-center ml-1">{tabIndex + 1} / {TABS.length}</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button type="button" onClick={onClose} disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    {initialData ? 'Save Changes' : 'Register Student'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}