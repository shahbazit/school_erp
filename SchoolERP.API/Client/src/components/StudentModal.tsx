import React, { useState, useEffect, useCallback } from 'react';
import { X, User, BookOpen, Users, MapPin, ChevronLeft, ChevronRight, Check, CreditCard, Plus, Trash2, Settings, TrendingDown, FilePlus, Upload, FileText, Download, Calendar, Percent } from 'lucide-react';
import { toast } from 'react-toastify';
import { Student, CreateStudentDto, UpdateStudentDto, AssignCourseDto } from '../types';
import { masterApi } from '../api/masterApi';
import { studentApi } from '../api/studentApi';
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
  hostelName: '', roomNo: '',
  studentAadharNo: '', studentBankAccountNo: '', studentBankName: '', studentIFSCCODE: '', fatherAadharNo: '', parentAccountNo: '', parentBankName: '', parentBankIFSCCODE: '', motherAadharNo: '', registrationNumber: '', annualIncome: '',
  fatherQualification: '', motherQualification: '', parentMobileNumber: '', parentEmail: '', parentOccupation: '', parentQualification: '', smsFacility: false, smsMobileNumber: '', permanentAddress: '',
  courseIds: [] as AssignCourseDto[],

  feeSubscriptions: [] as any[],
  feeDiscounts: [] as any[],
  primaryContact: 'Father',
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
  const [allFeeHeads, setAllFeeHeads] = useState<any[]>([]);
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
  const [siblingSearch, setSiblingSearch] = useState('');
  const [siblingResults, setSiblingResults] = useState<Student[]>([]);
  const [isSearchingSibling, setIsSearchingSibling] = useState(false);
  const [siblings, setSiblings] = useState<Student[]>([]);
  const [loadingSiblings, setLoadingSiblings] = useState(false);
  const [manuallyLinked, setManuallyLinked] = useState<Student[]>([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState('');
  const [showAdvancedDiscount, setShowAdvancedDiscount] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({ feeHeadId: '', customAmount: '' });
  const [discountAssignForm, setDiscountAssignForm] = useState({
    academicYearId: '',
    feeHeadId: '',
    remarks: '',
    calculationType: '',
    value: '',
    frequency: ''
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const documentTypes = ['Aadhar Card', 'Birth Certificate', 'Transfer Certificate', 'Previous Marksheet', 'Medical Record', 'Other'];

  const fetchSiblings = useCallback(async () => {
    if (!formData.familyId || formData.familyId.length < 3) {
      setSiblings([]);
      return;
    }
    try {
      setLoadingSiblings(true);
      const res = await studentApi.getAll({ familyId: formData.familyId, pageSize: 50 });
      // Distinct by admissionNo to avoid session duplicates
      const uniqueSiblings = res.data.reduce((acc, current) => {
        if (!acc.some(s => s.admissionNo === current.admissionNo)) acc.push(current);
        return acc;
      }, [] as Student[]);
      setSiblings(uniqueSiblings.filter(s => s.id !== initialData?.id && s.admissionNo !== initialData?.admissionNo));
    } catch (err) {
      console.error("Fetch Siblings Error:", err);
    } finally {
      setLoadingSiblings(false);
    }
  }, [formData.familyId, initialData?.id]);

  useEffect(() => {
    if (isOpen && formData.familyId) {
      fetchSiblings();
    } else {
      setSiblings([]);
    }
  }, [isOpen, formData.familyId, fetchSiblings]);

  const handleSiblingSearch = useCallback(async (query: string) => {
    setSiblingSearch(query);
    if (query.trim().length < 3) {
      setSiblingResults([]);
      return;
    }
    
    try {
      setIsSearchingSibling(true);
      const res = await studentApi.getAll({ search: query, pageSize: 20 });
      // Distinct by admissionNo
      const uniqueResults = res.data.reduce((acc, current) => {
        if (!acc.some(s => s.admissionNo === current.admissionNo)) acc.push(current);
        return acc;
      }, [] as Student[]);
      setSiblingResults(uniqueResults.filter(s => s.id !== initialData?.id && s.admissionNo !== initialData?.admissionNo));
    } catch (err) {
      console.error("Sibling Search Error:", err);
    } finally {
      setIsSearchingSibling(false);
    }
  }, [initialData?.id]);

  const linkSibling = (sibling: Student) => {
    const resolvedFamilyId = sibling.familyId || `FAM-${sibling.admissionNo}`;
    
    setManuallyLinked(prev => [...prev.filter(s => s.id !== sibling.id), sibling]);
    
    setFormData(prev => ({
      ...prev,
      familyId: resolvedFamilyId,
      fatherName: sibling.fatherName || prev.fatherName,
      fatherMobile: sibling.fatherMobile || prev.fatherMobile,
      fatherEmail: sibling.fatherEmail || prev.fatherEmail,
      fatherOccupation: sibling.fatherOccupation || prev.fatherOccupation,
      fatherQualification: (sibling as any).fatherQualification || (prev as any).fatherQualification,
      motherName: sibling.motherName || prev.motherName,
      motherMobile: sibling.motherMobile || prev.motherMobile,
      motherEmail: sibling.motherEmail || prev.motherEmail,
      motherOccupation: sibling.motherOccupation || prev.motherOccupation,
      motherQualification: (sibling as any).motherQualification || (prev as any).motherQualification,
      guardianName: sibling.guardianName || prev.guardianName,
      guardianMobile: sibling.guardianMobile || prev.guardianMobile,
      guardianRelation: sibling.guardianRelation || prev.guardianRelation,
      addressLine1: sibling.addressLine1 || prev.addressLine1,
      addressLine2: sibling.addressLine2 || prev.addressLine2,
      city: sibling.city || prev.city,
      state: sibling.state || prev.state,
      pincode: sibling.pincode || prev.pincode,
      permanentAddress: (sibling as any).permanentAddress || (prev as any).permanentAddress
    }));
    setSiblingSearch('');
    setSiblingResults([]);
    toast.success(`Linked with ${sibling.firstName}. Saved details synced!`, { toastId: 'sibling-linked' });
  };

  const unlinkSibling = (id: string) => {
    setManuallyLinked(prev => prev.filter(s => s.id !== id));
    setSiblings(prev => prev.filter(s => s.id !== id));
    if (siblings.length <= 1 && manuallyLinked.length <= 1) {
       // Optional: Could clear familyId here if no links left
    }
  };

  useEffect(() => {
    const contact = formData.primaryContact;
    let targetMobile = '';
    if (contact === 'Father') targetMobile = formData.fatherMobile;
    else if (contact === 'Mother') targetMobile = formData.motherMobile;
    else if (contact === 'Guardian') targetMobile = formData.guardianMobile;

    if (targetMobile && targetMobile !== formData.smsMobileNumber) {
      setFormData(prev => ({ ...prev, smsMobileNumber: targetMobile }));
    }
  }, [formData.primaryContact, formData.fatherMobile, formData.motherMobile, formData.guardianMobile, formData.smsMobileNumber]);

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
      const moduleLockedHeads = ['Transport', 'Hostel', 'Bus'];
      const filteredSelectiveHeads = (heads as any[]).filter(h => 
        h.isSelective && !moduleLockedHeads.some(locked => h.name.includes(locked))
      );
      setFeeHeads(filteredSelectiveHeads.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      setAllFeeHeads(heads.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      setAvailableDiscounts(discs.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      const sortedYears = years.sort((a: any, b: any) => b.name.localeCompare(a.name));
      setAcademicYears(sortedYears);
      
      const currentYear = years.find((y: any) => y.isCurrent);
      if (currentYear) {
        setDiscountAssignForm((prev: any) => ({ ...prev, academicYearId: currentYear.id }));
        if (!initialData) {
          setFormData(prev => ({ ...prev, academicYear: currentYear.name }));
        }
      }
    } catch {
      // silently fail, selects remain empty
    } finally {
      setLoadingMasters(false);
    }
  }, [initialData]);

  const fetchFullStudent = useCallback(async () => {
    if (!initialData?.id || !isOpen) return;
    try {
      const fullData = await studentApi.getById(initialData.id);
      setFormData({
        ...defaultForm,
        ...fullData,
        dateOfBirth: fullData.dateOfBirth ? fullData.dateOfBirth.substring(0, 10) : '',
        admissionDate: fullData.admissionDate ? fullData.admissionDate.substring(0, 10) : '',
        tcDate: (fullData as any).tcDate ? (fullData as any).tcDate.substring(0, 10) : '',
        feeSubscriptions: (fullData.feeSubscriptions || []).map((sub: any) => ({
          ...sub,
          isSystemManaged: sub.feeHeadName?.toLowerCase().includes('transport') || 
                           sub.feeHeadName?.toLowerCase().includes('hostel') || 
                           sub.feeHeadName?.toLowerCase().includes('bus')
        })),
        feeDiscounts: (fullData.feeDiscounts || []).map((d: any) => ({
          ...d,
          feeHeadId: d.restrictedFeeHeadId // Sync for backend consistency
        })),
        courseIds: (fullData as any).enrolledCourses?.map((c: any) => ({ courseId: c.courseId, batchId: c.batchId })) || [],
      } as any);
    } catch (err: any) {
      console.error("Full student fetch error:", err);
    }
  }, [initialData?.id, isOpen]);

  useEffect(() => {
    if (isOpen && initialData?.id) {
       fetchFullStudent();
    }
  }, [isOpen, initialData?.id, fetchFullStudent]);

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
      
      if (initialData?.id) {
        // Fetch full deep details for existing student (Handle binding/reading correctly)
        fetchFullStudent();
      } else {
        // New student initialization
        setFormData({ ...defaultForm });
      }

      setDocName('');
      setDocType('Aadhar Card');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen, initialData?.id, fetchMasters, fetchFullStudent, defaultTab]);

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

    // Dynamic Validation for Official Contact
    const pContact = formData.primaryContact;
    if (pContact === 'Father' && !formData.fatherMobile?.trim()) newErrors.fatherMobile = 'Father mobile is required for Portal Login';
    if (pContact === 'Mother' && !formData.motherMobile?.trim()) newErrors.motherMobile = 'Mother mobile is required for Portal Login';
    if (pContact === 'Guardian' && !formData.guardianMobile?.trim()) newErrors.guardianMobile = 'Guardian mobile is required for Portal Login';
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const basicErrors = ['firstName', 'lastName', 'mobileNumber', 'gender', 'classId', 'sectionId', 'academicYear', 'admissionDate', 'guardianInfo'];
      const familyErrors = ['fatherMobile', 'motherMobile', 'guardianMobile'];
      
      if (basicErrors.some(field => newErrors[field])) {
        setActiveTab('basic');
      } else if (familyErrors.some(field => newErrors[field])) {
        setActiveTab('family');
        toast.error(`Please provide the ${pContact}'s mobile number for the Official Portal Account.`, { toastId: 'pcontact-missing' });
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

  const renderSiblingList = () => {
    const combined = [...siblings, ...manuallyLinked].reduce((acc, current) => {
      const isSelf = initialData?.id === current.id || 
                    (initialData?.admissionNo && current.admissionNo && initialData.admissionNo === current.admissionNo);
      if (!isSelf && !acc.some(s => s.id === current.id)) acc.push(current);
      return acc;
    }, [] as Student[]);

    if (combined.length === 0 && !loadingSiblings) return null;
    
    return (
      <div className="mb-6 flex flex-wrap gap-2 items-center bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 min-h-[44px]">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 ml-1 flex items-center gap-1.5 line-clamp-1">
          <Users className="h-3 w-3" />
          {loadingSiblings ? 'Refreshing Group...' : 'Linked Family Students:'}
        </span>
        {combined.map(sib => (
          <div key={sib.id} className="group relative flex items-center gap-2 pl-2.5 pr-1.5 py-1 bg-white border border-slate-200 rounded-full shadow-sm hover:border-primary-300 hover:shadow-md transition-all animate-in fade-in zoom-in-95">
            <div className="w-4 h-4 bg-primary-100 rounded-full flex items-center justify-center text-[8px] font-bold text-primary-700">
              {sib.firstName?.[0]}
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="text-[10px] font-bold text-slate-700">{sib.firstName} {sib.lastName}</span>
              <span className="text-[8px] text-slate-400 font-medium">Adm: {sib.admissionNo}</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); unlinkSibling(sib.id!); }}
              className="ml-1 p-0.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full transition-colors"
              title="Remove from group"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}
        {loadingSiblings && combined.length > 0 && (
          <div className="ml-2 animate-pulse text-[8px] text-primary-500 font-bold uppercase tracking-tighter">Syncing...</div>
        )}
        {loadingSiblings && combined.length === 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-white/50 border border-slate-100 rounded-full">
            <div className="h-2 w-2 border border-primary-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-[9px] text-slate-400 italic">Exploring family...</span>
          </div>
        )}
      </div>
    );
  };

  const renderBasicTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderInput('firstName', 'Student Name (First)', 'text', undefined, true)}
        {renderInput('lastName', 'Last Name', 'text', undefined, true)}
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
      {renderSiblingList()}
    </div>
  );

  const renderAdmissionTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderInput('admissionScheme', 'Admission Scheme', 'text')}
        {renderInput('admissionType', 'Admission Type', 'text')}
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
      </div>

    {(formData.routeName || formData.hostelName) && (
      <div className="mt-6 pt-6 border-t border-slate-100">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4">Active Services & Logistics</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formData.routeName && (
            <div className="p-3 bg-primary-50 border border-primary-100 rounded-xl flex items-center gap-3">
              <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-primary-200 shadow-sm">
                <MapPin className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary-700 uppercase tracking-tight">Transport Route</p>
                <p className="text-sm font-black text-slate-800">{formData.routeName}</p>
                {formData.stoppageName && <p className="text-[10px] text-slate-500 font-bold uppercase">{formData.stoppageName}</p>}
              </div>
            </div>
          )}
          {formData.hostelName && (
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3">
              <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-indigo-200 shadow-sm">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-tight">Hostel Accommodation</p>
                <p className="text-sm font-black text-slate-800">{formData.hostelName}</p>
                {formData.roomNo && <p className="text-[10px] text-slate-500 font-bold uppercase">Room: {formData.roomNo}</p>}
              </div>
            </div>
          )}
        </div>
        <p className="mt-3 text-[10px] text-center text-slate-400 italic">Services are managed via dedicated Transport/Hostel modules.</p>
      </div>
    )}
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
    <div className="space-y-6">
      {/* Compact Utility Row: Sibling Search & Primary Account */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Sibling Search */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="h-3 w-3 text-slate-400" />
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Link Sibling</h4>
          </div>
          <div className="relative">
            <input 
              type="text" 
              value={siblingSearch} 
              onChange={(e) => handleSiblingSearch(e.target.value)}
              placeholder="Search sibling name/adm..."
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none"
            />
            {isSearchingSibling && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                 <div className="h-3 w-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {siblingResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-slate-50 animate-in fade-in slide-in-from-top-1">
                {siblingResults.map(s => (
                  <button key={s.id} type="button" onClick={() => linkSibling(s)}
                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 transition-colors text-left">
                    <div>
                       <p className="text-[11px] font-bold text-slate-700">{s.firstName} {s.lastName}</p>
                       <p className="text-[9px] text-slate-400">{s.admissionNo}</p>
                    </div>
                    <span className="text-[9px] font-black text-primary-600 uppercase">Link</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Official Portal & SMS Dropdown */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-3 w-3 text-emerald-600" />
            <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Official Portal & SMS Contact</h4>
          </div>
          <select 
            name="primaryContact" 
            value={formData.primaryContact} 
            onChange={handleChange}
            className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none"
          >
            <option value="Father">Father's Number</option>
            <option value="Mother">Mother's Number</option>
            <option value="Guardian">Guardian's Number</option>
          </select>
        </div>
      </div>

      {renderSiblingList()}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderInput('fatherName', "Father's Name", 'text')}
        {renderInput('fatherMobile', 'Father Contact Number', 'tel', undefined, formData.primaryContact === 'Father')}
        {renderInput('fatherEmail', 'Father Email', 'email')}
        {renderInput('fatherOccupation', 'Father Occupation', 'text')}
        {renderInput('fatherQualification', 'Father Qualification', 'text')}
        {renderInput('motherName', "Mother's Name", 'text')}
        {renderInput('motherMobile', 'Mother Mobile Number', 'tel', undefined, formData.primaryContact === 'Mother')}
        {renderInput('motherEmail', 'Mother Email', 'email')}
        {renderInput('motherOccupation', 'Mother Occupation', 'text')}
        {renderInput('motherQualification', 'Mother Qualification', 'text')}
        {renderInput('guardianName', 'Guardian Name', 'text')}
        {renderInput('guardianRelation', 'Guardian Relation', 'text')}
        {renderInput('guardianMobile', 'Guardian Mobile Number', 'tel', undefined, formData.primaryContact === 'Guardian')}
        {renderInput('guardianEmail', 'Guardian Email', 'email')}
        {renderInput('parentOccupation', 'Guardian Occupation', 'text')}
        {renderInput('parentQualification', 'Guardian Qualification', 'text')}
        {renderInput('email', 'Student Email', 'email')}
        {renderCheckbox('smsFacility', 'SMS Facility')}
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
    <div className="flex items-center justify-between px-3.5 py-[11px] bg-slate-50 border border-slate-200 rounded-xl mt-[19px]">
      <div className="flex items-center gap-3">
        <input type="checkbox" id={name} name={name} checked={(formData as any)[name]} onChange={handleChange} className="h-4 w-4 rounded text-primary-600 border-slate-300 cursor-pointer" />
        <label htmlFor={name} className="text-[13px] font-semibold text-slate-600 cursor-pointer">
          {label}
        </label>
      </div>
      {name === 'smsFacility' && formData.smsMobileNumber && (
        <span className="text-[9px] font-black text-primary-700 bg-primary-100/50 px-2 py-0.5 rounded-full border border-primary-200/50 uppercase tracking-tighter">
          {formData.smsMobileNumber}
        </span>
      )}
    </div>
  );



  const renderFeesTab = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        
        {/* SECTION 1: ADD-ON SUBSCRIPTIONS */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary-600" />
              <h3 className="text-sm font-bold text-slate-800">Extra Subscriptions</h3>
            </div>
            <span className="bg-white px-2 py-0.5 rounded-full border border-slate-200 text-[10px] font-bold text-primary-700">
              {formData.feeSubscriptions.length} Active
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Subscriptions List at Top */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
              {formData.feeSubscriptions.length === 0 ? (
                <p className="text-center py-4 text-[11px] font-bold text-slate-300 uppercase">No Subscriptions</p>
              ) : (
                formData.feeSubscriptions.map((sub: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-100 rounded-lg hover:border-primary-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`h-7 w-7 ${sub.isSystemManaged ? 'bg-primary-100 text-primary-700' : 'bg-slate-50 text-slate-500'} rounded flex items-center justify-center font-bold text-[10px] shrink-0`}>
                        {sub.isSystemManaged ? <Settings className="h-3.5 w-3.5" /> : sub.feeHeadName?.[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-xs leading-tight flex items-center gap-1.5">
                          {sub.feeHeadName}
                          {sub.isSystemManaged && <span className="text-[8px] bg-primary-50 text-primary-600 px-1 rounded uppercase">Auto</span>}
                        </h4>
                        <p className="text-[10px] text-slate-400">{sub.customAmount ? formatCurrency(sub.customAmount) : 'Standard Rate'}</p>
                      </div>
                    </div>
                    {sub.isSystemManaged ? (
                      <button 
                        type="button"
                        onClick={() => toast.info(`Managed by Service Module. Please remove assignment from ${sub.feeHeadName.includes('Hostel') ? 'Hostel' : 'Transport'} Management to delete this fee.`)}
                        className="p-1.5 text-slate-200 hover:text-primary-500 transition-colors"
                        title="System Managed Fee"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, feeSubscriptions: formData.feeSubscriptions.filter((_: any, i: number) => i !== idx)})} 
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Action Bar at Bottom */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Fee Head</label>
                  <select 
                    value={subscriptionForm.feeHeadId}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, feeHeadId: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold outline-none"
                  >
                    <option value="">-- Select Head --</option>
                    {feeHeads.filter(h => !formData.feeSubscriptions.some((s: any) => s.feeHeadId === h.id)).map((h: any) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Custom Amount</label>
                  <input 
                    type="number" 
                    value={subscriptionForm.customAmount}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, customAmount: e.target.value })}
                    placeholder="Optional" 
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold outline-none" 
                  />
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  const { feeHeadId, customAmount } = subscriptionForm;
                  if (!feeHeadId) { toast.error("Select a head"); return; }
                  const head = feeHeads.find(h => h.id === feeHeadId);
                  setFormData({
                    ...formData,
                    feeSubscriptions: [...formData.feeSubscriptions, { feeHeadId, feeHeadName: head?.name, customAmount: customAmount ? Number(customAmount) : null }]
                  });
                  setSubscriptionForm({ feeHeadId: '', customAmount: '' });
                }}
                className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-bold text-[11px] uppercase tracking-wider transition-all"
              >
                Add Subscription
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: DISCOUNT POLICIES */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="bg-emerald-50/50 px-4 py-2.5 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">Fee Discounts</h3>
            </div>
            <span className="bg-white px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-bold text-emerald-700">
              {formData.feeDiscounts.length} Rules
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Applied Discounts List at Top */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
              {formData.feeDiscounts.length === 0 ? (
                <p className="text-center py-4 text-[11px] font-bold text-slate-300 uppercase">No Discounts</p>
              ) : (
                formData.feeDiscounts.map((disc: any, idx: number) => {
                  const masterDisc = availableDiscounts.find(m => m.id === (disc.feeDiscountId || disc.discountId));
                  const val = disc.value ?? masterDisc?.value;
                  return (
                    <div key={idx} className="bg-white border border-slate-100 rounded-lg p-2.5 hover:border-emerald-200 transition-all flex items-center justify-between gap-3">
                      <div className="flex gap-2">
                        <div className="h-7 w-7 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center shrink-0"><Percent className="h-3.5 w-3.5" /></div>
                        <div>
                          <h4 className="font-bold text-slate-700 text-xs leading-tight">{disc.discountName}</h4>
                          <p className="text-[9px] text-slate-400 font-bold">{disc.restrictedFeeHeadName || 'Universal'} • {disc.academicYearName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-800">{(disc.calculationType || masterDisc?.calculationType) === 'Percentage' ? `${val}%` : formatCurrency(val)}</p>
                          <p className="text-[8px] font-bold text-emerald-600 uppercase">{disc.frequency || masterDisc?.frequency || 'Manual'}</p>
                        </div>
                        <button onClick={() => setFormData({...formData, feeDiscounts: formData.feeDiscounts.filter((_: any, i: number) => i !== idx)})} className="p-1 text-slate-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Assignment Console at Bottom */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Session</label>
                  <select 
                    value={discountAssignForm.academicYearId}
                    onChange={(e) => setDiscountAssignForm({ ...discountAssignForm, academicYearId: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold outline-none"
                  >
                    {academicYears.map((y: any) => (<option key={y.id} value={y.id}>{y.name}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Rule</label>
                  <select 
                    value={selectedDiscountId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedDiscountId(val);
                      const disc = availableDiscounts.find(d => d.id === val);
                      if (disc) setDiscountAssignForm((prev: any) => ({ ...prev, feeHeadId: disc.defaultFeeHeadId || '' }));
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-emerald-900 outline-none"
                  >
                    <option value="">-- Select --</option>
                    {availableDiscounts.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.calculationType === 'Percentage' ? `${d.value}%` : formatCurrency(d.value)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Remarks</label>
                  <input 
                    type="text" 
                    value={discountAssignForm.remarks}
                    onChange={(e) => setDiscountAssignForm({ ...discountAssignForm, remarks: e.target.value })}
                    placeholder="Reason..." 
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs outline-none" 
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    if (!selectedDiscountId || !discountAssignForm.academicYearId) { toast.error("Required fields missing"); return; }
                    const disc = availableDiscounts.find(d => d.id === selectedDiscountId);
                    const head = allFeeHeads.find(h => h.id === discountAssignForm.feeHeadId);
                    const year = academicYears.find(y => y.id === discountAssignForm.academicYearId);
                    setFormData({
                      ...formData,
                      feeDiscounts: [...formData.feeDiscounts, { 
                        feeDiscountId: selectedDiscountId, discountName: disc?.name, feeHeadId: discountAssignForm.feeHeadId || null,
                        restrictedFeeHeadName: discountAssignForm.feeHeadId ? (head?.name || 'Assigned') : 'Universal',
                        academicYearId: discountAssignForm.academicYearId, academicYearName: year?.name, remarks: discountAssignForm.remarks,
                        calculationType: discountAssignForm.calculationType || null, value: discountAssignForm.value ? Number(discountAssignForm.value) : null,
                        frequency: discountAssignForm.frequency || null
                      }]
                    });
                    setSelectedDiscountId('');
                    setDiscountAssignForm((prev: any) => ({ ...prev, remarks: '', feeHeadId: '', calculationType: '', value: '', frequency: '' }));
                    toast.success("Applied");
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-[11px] uppercase transition-all"
                >
                  Apply
                </button>
              </div>

              <div className="pt-1">
                <button type="button" onClick={() => setShowAdvancedDiscount(!showAdvancedDiscount)} className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Settings className={`h-3 w-3 ${showAdvancedDiscount ? 'rotate-90' : ''}`} /> {showAdvancedDiscount ? 'Hide' : 'Override'}
                </button>
                {showAdvancedDiscount && (
                  <div className="grid grid-cols-2 gap-2 mt-2 animate-in zoom-in-95">
                    <select value={discountAssignForm.calculationType} onChange={e => setDiscountAssignForm({...discountAssignForm, calculationType: e.target.value})} className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-semibold outline-none">
                      <option value="">Standard Mode</option>
                      <option value="Percentage">%</option>
                      <option value="Fixed">Flat</option>
                    </select>
                    <input type="number" value={discountAssignForm.value} onChange={e => setDiscountAssignForm({...discountAssignForm, value: e.target.value})} placeholder="Value" className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold outline-none" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
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
