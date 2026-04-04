import React, { useState, useEffect, useCallback } from 'react';
import { X, User, BookOpen, Users, MapPin, ChevronLeft, ChevronRight, Check, CreditCard, Plus, Trash2, Settings, TrendingDown, FilePlus, Upload, FileText, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { Student, CreateStudentDto, UpdateStudentDto, AssignCourseDto } from '../types';
import { masterApi } from '../api/masterApi';
import { useLocalization } from '../contexts/LocalizationContext';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: CreateStudentDto | UpdateStudentDto) => Promise<void>;
  initialData?: Student | null;
  defaultTab?: string;
}

import apiClient, { API_URL } from '../api/apiClient';
const BASE_URL = API_URL.replace('/api', '');

const TABS = [
  { id: 'basic', label: 'Basic Details', icon: User },
  { id: 'admission', label: 'Admission Details', icon: BookOpen },
  { id: 'document', label: 'Document Details', icon: FileText },
  { id: 'family', label: 'Family Details', icon: Users },
  { id: 'address', label: 'Address Details', icon: MapPin },
  { id: 'attachments', label: 'File Attachments', icon: FilePlus },
  { id: 'fees', label: 'Fees & Discounts', icon: CreditCard },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const defaultForm = {
  admissionNo: '',
  admissionDate: new Date().toISOString().substring(0, 10),
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
  
  ledgerNumber: '', srnNumber: '', permanentEducationNo: '', familyId: '', apaarId: '', medium: '', enrollmentSchoolName: '', openingBalance: '',
  admissionScheme: '', admissionType: '', religion: '', category: '', caste: '', placeOfBirth: '', heightInCM: '', weightInKG: '', colorVision: '', previousClass: '', tcNo: '', tcDate: '', houseName: '', isCaptain: false, isMonitor: false, bus: '', routeName: '', stoppageName: '', busFee: '',
  studentAadharNo: '', studentBankAccountNo: '', studentBankName: '', studentIFSCCODE: '', fatherAadharNo: '', parentAccountNo: '', parentBankName: '', parentBankIFSCCODE: '', motherAadharNo: '', registrationNumber: '', annualIncome: '',
  fatherQualification: '', motherQualification: '', parentMobileNumber: '', parentEmail: '', parentOccupation: '', parentQualification: '', smsFacility: false, smsMobileNumber: '', permanentAddress: '',
  courseIds: [] as AssignCourseDto[],

  feeSubscriptions: [] as any[],
  feeDiscounts: [] as any[],
};

export default function StudentModal({ isOpen, onClose, onSave, initialData, defaultTab }: StudentModalProps) {
  const { formatCurrency, settings } = useLocalization();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({ ...defaultForm });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loadingMasters, setLoadingMasters] = useState(false);

  // Document management state
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [docType, setDocType] = useState('Aadhar Card');
  const [docName, setDocName] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const documentTypes = ['Aadhar Card', 'Birth Certificate', 'Transfer Certificate', 'Previous Marksheet', 'Medical Record', 'Other'];

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

  const fetchDocuments = useCallback(async () => {
    if (!initialData?.id) return;
    try {
      setLoadingDocs(true);
      const res = await apiClient.get(`/StudentDocument/student/${initialData.id}`);
      setDocuments(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingDocs(false);
    }
  }, [initialData?.id]);

  useEffect(() => {
    if (isOpen && initialData?.id && activeTab === 'attachments') {
      fetchDocuments();
    }
  }, [isOpen, activeTab, initialData?.id, fetchDocuments]);

  useEffect(() => {
    if (isOpen) {
      fetchMasters();
      setActiveTab(defaultTab || 'basic');
      setErrors({});
      if (initialData) {
        setFormData({
          ...defaultForm,
          ...initialData,
          dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.substring(0, 10) : '',
          admissionDate: initialData.admissionDate ? initialData.admissionDate.substring(0, 10) : '',
          tcDate: (initialData as any).tcDate ? (initialData as any).tcDate.substring(0, 10) : '',
          feeSubscriptions: initialData.feeSubscriptions || [],
          feeDiscounts: initialData.feeDiscounts || [],
          courseIds: (initialData as any).enrolledCourses?.map((c: any) => ({ courseId: c.courseId, batchId: c.batchId })) || [],
        } as any);
        setDocName('');
        setDocType('Aadhar Card');
        if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.classId) newErrors.classId = 'Class is required';
    if (!formData.sectionId) newErrors.sectionId = 'Section is required';
    if (!formData.academicYear) newErrors.academicYear = 'Academic Year is required';
    if (!formData.admissionDate) newErrors.admissionDate = 'Admission date is required';
    
    if (!formData.fatherName?.trim() && !formData.motherName?.trim() && !formData.guardianName?.trim()) {
      const msg = "At least one Parent/Guardian name is required (Father, Mother, or Guardian)";
      newErrors.guardianInfo = msg;
      toast.error(msg, { toastId: 'guardian-missing' });
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const basicErrors = ['firstName', 'lastName', 'mobileNumber', 'gender', 'classId', 'sectionId', 'academicYear', 'admissionDate', 'guardianInfo'];
      if (basicErrors.some(field => newErrors[field])) {
        setActiveTab('basic');
      }
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setServerError(null);

    const submissionData = { ...formData };
    
    // Convert empty strings to null for numeric/date fields and parse numbers
    const numericFields = ['openingBalance', 'heightInCM', 'weightInKG', 'busFee', 'annualIncome'];
    numericFields.forEach(field => {
      const val = (submissionData as any)[field];
      if (val === '' || val === undefined) {
        (submissionData as any)[field] = null;
      } else if (typeof val === 'string') {
        (submissionData as any)[field] = Number(val);
      }
    });

    const dateFields = ['dateOfBirth', 'admissionDate', 'tcDate'];
    dateFields.forEach(field => {
      if (!(submissionData as any)[field]) {
        (submissionData as any)[field] = null;
      }
    });

    try {
      await onSave(submissionData as any);
      onClose();
    } catch (error: any) {
      console.error('Failed to save student', error);
      setServerError(error.message || 'Failed to save student. Please check for duplicate entries.');
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

    const renderBasicTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderInput('firstName', 'Student Name (First)', 'text', undefined, true)}
        {renderInput('lastName', 'Last Name', 'text', undefined, true)}
        {renderInput('fatherName', "Father's Name", 'text')}
        {renderInput('motherName', "Mother's Name", 'text')}
        {renderInput('mobileNumber', 'Contact Number', 'tel', undefined, true)}
        {renderInput('dateOfBirth', 'Date Of Birth', 'date')}
        {renderInput('gender', 'Gender', 'select', ['Male', 'Female', 'Other'], true)}
        {renderInput('admissionNo', 'Admission Number', 'text')}
        {renderInput('admissionDate', 'Date Of Admission', 'date', undefined, true)}
        {renderInput('ledgerNumber', 'Ledger Number', 'text')}
        {renderInput('classId', 'Admission in Class', 'select', classes, true)}
        {renderInput('sectionId', 'Admission in Section', 'select', sections, true)}
        {renderInput('rollNumber', 'Roll Number', 'text')}
        {renderInput('srnNumber', 'SRN Number', 'text')}
        {renderInput('permanentEducationNo', 'Permanent Education No', 'text')}
        {renderInput('familyId', 'Family Id', 'text')}
        {renderInput('apaarId', 'Apaar Id', 'text')}
        {renderInput('medium', 'Medium', 'text')}
        {renderInput('enrollmentSchoolName', 'Enrollment School Name', 'text')}
        {renderInput('openingBalance', 'Opening Balance', 'number')}
        {renderInput('academicYear', 'Academic Year (Session)', 'select', academicYears.map(y => ({ id: y.name, name: y.name })), true, !!initialData)}
      </div>
      {initialData && (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-400 font-medium">
          <Settings className="h-3 w-3" />
          <span>Note: Use the <strong>Promotion & Transfer</strong> module to move this student to a different session or class.</span>
        </div>
      )}
    </div>
  );

  const renderAdmissionTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderInput('admissionScheme', 'Admission Scheme', 'text')}
        {renderInput('admissionType', 'Admission Type', 'text')}
        {renderInput('guardianName', 'Guardian Name', 'text')}
        {renderInput('guardianRelation', 'Relation', 'text')}
        {renderInput('religion', 'Religion', 'text')}
        {renderInput('category', 'Category', 'text')}
        {renderInput('caste', 'Caste', 'text')}
        {renderInput('bloodGroup', 'Blood Group', 'select', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])}
        {renderInput('placeOfBirth', 'Place Of Birth', 'text')}
        {renderInput('heightInCM', 'Height (In CM)', 'number')}
        {renderInput('weightInKG', 'Weight (In KG)', 'number')}
        {renderInput('colorVision', 'Color Vision', 'text')}
        {renderInput('previousClass', 'Previous Class', 'text')}
        {renderInput('previousSchool', 'Previous School Name', 'text')}
        {renderInput('tcNo', 'TC No', 'text')}
        {renderInput('tcDate', 'TC Date', 'date')}
        {renderInput('houseName', 'House Name', 'text')}
        {renderCheckbox('isCaptain', 'Is Captain')}
        {renderCheckbox('isMonitor', 'Is Monitor')}
        {renderInput('bus', 'Bus', 'text')}
        {renderInput('routeName', 'Route Name', 'text')}
        {renderInput('stoppageName', 'Stoppage Name', 'text')}
        {renderInput('busFee', 'Bus Fee', 'number')}
      </div>
    </div>
  );

  const renderDocumentTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderInput('studentAadharNo', 'Student Aadhar No', 'text')}
        {renderInput('studentBankAccountNo', 'Student Bank Account No', 'text')}
        {renderInput('studentBankName', 'Student Bank Name', 'text')}
        {renderInput('studentIFSCCODE', 'Student IFSC CODE', 'text')}
        {renderInput('fatherAadharNo', 'Father Aadhar No', 'text')}
        {renderInput('parentAccountNo', 'Parent Account No', 'text')}
        {renderInput('parentBankName', 'Parent Bank Name', 'text')}
        {renderInput('parentBankIFSCCODE', 'Parent Bank IFSC CODE', 'text')}
        {renderInput('motherAadharNo', 'Mother Aadhar No', 'text')}
        {renderInput('registrationNumber', 'Registration Number', 'text')}
        {renderInput('annualIncome', 'Annual Income', 'number')}
      </div>
    </div>
  );

  const renderFamilyTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderInput('fatherMobile', 'Father Contact Number', 'tel')}
        {renderInput('fatherEmail', 'Father Email', 'email')}
        {renderInput('fatherOccupation', 'Father Occupation', 'text')}
        {renderInput('fatherQualification', 'Father Qualification', 'text')}
        {renderInput('motherMobile', 'Mother Mobile Number', 'tel')}
        {renderInput('motherEmail', 'Mother Email', 'email')}
        {renderInput('motherOccupation', 'Mother Occupation', 'text')}
        {renderInput('motherQualification', 'Mother Qualification', 'text')}
        {renderInput('parentMobileNumber', 'Parent Mobile Number', 'tel')}
        {renderInput('parentEmail', 'Parent Email', 'email')}
        {renderInput('parentOccupation', 'Parent Occupation', 'text')}
        {renderInput('parentQualification', 'Parent Qualification', 'text')}
        {renderInput('email', 'Student Email', 'email')}
        {renderCheckbox('smsFacility', 'SMS Facility')}
        {renderInput('smsMobileNumber', 'SMS Mobile Number', 'tel')}
      </div>
    </div>
  );

  const renderAddressTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderInput('addressLine1', 'Present Address (Line 1)', 'text')}
        {renderInput('addressLine2', 'Present Address (Line 2)', 'text')}
        {renderInput('city', 'City', 'text')}
        {renderInput('state', 'State', 'text')}
        {renderInput('pincode', 'PIN Code', 'text')}
        {renderInput('permanentAddress', 'Permanent Address', 'text')}
      </div>
    </div>
  );

  const renderInput = (name: string, label: string, type: string, options?: any[], required?: boolean, disabled?: boolean) => {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        {type === 'select' ? (
          <select 
            name={name} 
            value={(formData as any)[name] || ''} 
            onChange={handleChange} 
            disabled={disabled}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${errors[name] ? 'border-red-300 focus:ring-red-400/30' : 'border-slate-200 focus:ring-primary-500/30 disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed'}`}
          >
            <option value="">Select...</option>
            {options?.map((opt: any) => (
              typeof opt === 'string' ? 
              <option key={opt} value={opt}>{opt}</option> :
              <option key={opt.id} value={opt.id || opt.name}>{opt.name}</option>
            ))}
          </select>
        ) : (
          <input 
            type={type}
            name={name} 
            value={(formData as any)[name] || ''} 
            onChange={handleChange}
            disabled={disabled}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${errors[name] ? 'border-red-300 focus:ring-red-400/30' : 'border-slate-200 focus:ring-primary-500/30 disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed'}`} 
          />
        )}
        {errors[name] && <p className="text-xs text-red-500 font-medium">{errors[name]}</p>}
      </div>
    );
  };

  const renderCheckbox = (name: string, label: string) => (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 h-full mt-6">
      <input type="checkbox" id={name} name={name} checked={(formData as any)[name]} onChange={handleChange} className="h-4 w-4 rounded text-primary-600 border-slate-300 cursor-pointer" />
      <label htmlFor={name} className="text-sm font-medium text-slate-700 cursor-pointer">
        {label}
      </label>
    </div>
  );



  const renderFeesTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <td className="px-4 py-2 text-slate-500">{sub.customAmount ? formatCurrency(sub.customAmount) : 'Standard'}</td>
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
                      <option key={d.id} value={d.id}>{d.name} ({d.calculationType === 'Percentage' ? `${d.value}%` : formatCurrency(d.value)})</option>
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
                                  {disc.calculationType === 'Percentage' ? `${disc.value}%` : formatCurrency(disc.value)}
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
    </div>
  );




  const renderFilesTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {!initialData ? (
        <div className="bg-amber-50 border border-amber-100 p-8 rounded-2xl flex flex-col items-center text-center">
           <FilePlus className="h-10 w-10 text-amber-500 mb-2" />
           <p className="font-bold text-amber-900">Registration Mode</p>
           <p className="text-sm text-amber-700">Please register the student first before uploading documents.</p>
        </div>
      ) : (
        <>
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-4 border-b pb-2 flex items-center gap-2">
               <Upload className="h-4 w-4 text-primary-600" />
               Upload New Document
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Doc Type</label>
                <select value={docType} onChange={e => setDocType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/30">
                  {documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Doc Name *</label>
                <input value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. 10th Marksheet"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">File *</label>
                <input type="file" ref={fileInputRef} accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:bg-primary-50 file:text-primary-700 font-medium cursor-pointer" />
              </div>
              <div className="lg:col-span-3 flex justify-end">
                <button type="button" disabled={uploadingDocs}
                  onClick={async () => {
                     if (!fileInputRef.current?.files?.[0] || !docName.trim()) {
                        setUploadError("Document name and file are required");
                        return;
                     }
                     try {
                        setUploadingDocs(true);
                        setUploadError(null);
                        const formDataDoc = new FormData();
                        formDataDoc.append('StudentId', initialData.id!);
                        formDataDoc.append('DocumentType', docType);
                        formDataDoc.append('DocumentName', docName);
                        formDataDoc.append('File', fileInputRef.current.files[0]);

                        await apiClient.post('/StudentDocument', formDataDoc, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        await fetchDocuments();
                        setDocName('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                     } catch (err: any) {
                        setUploadError(err.response?.data?.Message || err.message);
                     } finally {
                        setUploadingDocs(false);
                     }
                  }}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70">
                  <Plus className="h-4 w-4" />
                  {uploadingDocs ? 'Uploading...' : 'Save Document'}
                </button>
              </div>
            </div>
            {uploadError && <p className="mt-4 text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{uploadError}</p>}
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Attached Documents</h3>
               <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{documents.length} Files</span>
            </div>
            {loadingDocs ? (
               <div className="p-12 text-center text-slate-400">Loading documents...</div>
            ) : documents.length === 0 ? (
               <div className="p-12 text-center flex flex-col items-center">
                  <FileText className="h-10 w-10 text-slate-100 mb-2" />
                  <p className="text-sm font-medium text-slate-400 italic">No files attached yet.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="p-3.5 border border-slate-100 rounded-xl flex items-center justify-between group hover:border-primary-200 hover:shadow-sm transition-all">
                       <div className="flex items-center gap-3 truncate">
                          <div className="h-9 w-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                             <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="truncate">
                             <p className="text-sm font-bold text-slate-700 truncate">{doc.documentName}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{doc.documentType}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={`${BASE_URL}${doc.documentUrl}`} target="_blank" rel="noreferrer" 
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                             <Download className="h-4 w-4" />
                          </a>
                          <button type="button" 
                            onClick={async () => {
                               if (window.confirm('Delete this file?')) {
                                  try {
                                     await apiClient.delete(`/StudentDocument/${doc.id}`);
                                     await fetchDocuments();
                                  } catch (err: any) {
                                     alert('Failed to delete');
                                  }
                               }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                             <Trash2 className="h-4 w-4" />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const tabContent: Record<string, React.ReactNode> = {
    basic: renderBasicTab(),
    admission: renderAdmissionTab(),
    document: renderDocumentTab(),
    family: renderFamilyTab(),
    address: renderAddressTab(),
    attachments: renderFilesTab(),
    fees: renderFeesTab(),
  };

  const hasErrorsOnTab = (tabId: string) => {
    const tabFields: Record<string, string[]> = {
      basic: ['firstName', 'lastName', 'mobileNumber', 'gender', 'classId', 'sectionId', 'academicYear', 'admissionDate', 'guardianInfo'],
      admission: [],
      document: [],
      family: [],
      address: [],
      attachments: [],
      fees: [],
    };
    return tabFields[tabId]?.some(f => !!errors[f]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[95%] lg:max-w-[1400px] h-[95vh] bg-white shadow-2xl rounded-2xl flex flex-col animate-in zoom-in-95 fade-in duration-300 ease-out overflow-hidden">
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
        <div className="flex border-b border-slate-100 bg-slate-50/60 px-2 pt-2 shrink-0 gap-1 overflow-x-auto w-full no-scrollbar">
          {TABS.map((tab) => {
            if (tab.id === 'attachments' && !initialData) return null;
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
          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {tabContent[activeTab]}
            </div>
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