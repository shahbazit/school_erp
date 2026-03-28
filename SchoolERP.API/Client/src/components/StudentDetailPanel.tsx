import { useState, useEffect } from 'react';
import { 
  X, User, BookOpen, Users, MapPin, 
  Calendar, CreditCard, FileText, Activity, Phone, 
  Mail, ExternalLink, Hash, CheckCircle, Info, TrendingUp, TrendingDown, Wallet, History
} from 'lucide-react';
import { Student } from '../types';
import apiClient, { API_URL } from '../api/apiClient';
import { masterApi } from '../api/masterApi'
import { useLocalization } from '../contexts/LocalizationContext';

const BASE_URL = API_URL.replace('/api', '');

interface StudentDetailPanelProps {
  student: Student | null;
  onClose: () => void;
  onEdit: (student: Student) => void;
  className?: string;
  sectionName?: string;
  academicYearName?: string;
}

type TabType = 'BASIC' | 'ADMISSION' | 'DOCUMENT' | 'FAMILY' | 'ADDRESS' | 'FINANCE';

export default function StudentDetailPanel({ student, onClose, onEdit, className, sectionName, academicYearName }: StudentDetailPanelProps) {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const [activeTab, setActiveTab] = useState<TabType>('BASIC');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [feeAccount, setFeeAccount] = useState<any>(null);
  const [loadingFee, setLoadingFee] = useState(false);

  useEffect(() => {
    if (student?.id && activeTab === 'DOCUMENT') {
       fetchDocuments();
    }
    if (student?.id && activeTab === 'FINANCE') {
       fetchFeeAccount();
    }
  }, [student, activeTab]);

  const fetchFeeAccount = async () => {
    try {
      setLoadingFee(true);
      const data = await masterApi.getAll(`fee/student-account/${student?.id}`);
      setFeeAccount(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFee(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await apiClient.get(`/StudentDocument/student/${student?.id}`);
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocs(false);
    }
  };

  if (!student) return null;

  const tabs: { id: TabType, label: string, icon: any }[] = [
    { id: 'BASIC', label: 'Basic Details', icon: User },
    { id: 'ADMISSION', label: 'Admission Details', icon: BookOpen },
    { id: 'DOCUMENT', label: 'Document Details', icon: FileText },
    { id: 'FAMILY', label: 'Family Details', icon: Users },
    { id: 'ADDRESS', label: 'Address Details', icon: MapPin },
    { id: 'FINANCE', label: 'Fees & Discounts', icon: CreditCard }
  ];

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full lg:w-[85%] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              {student.studentPhoto ? (
                <img src={student.studentPhoto} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{student.firstName} {student.lastName}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Hash className="h-3 w-3" /> {student.admissionNo}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${student.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {student.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit(student)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Edit Profile
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab List */}
        <div className="flex border-b border-slate-100 px-6 space-x-6 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-primary-600 text-primary-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'BASIC' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
              <InfoRow label="Student Name" value={`${student.firstName} ${student.lastName}`} />
              <InfoRow label="Father's Name" value={student.fatherName || '—'} />
              <InfoRow label="Mother's Name" value={student.motherName || '—'} />
              <InfoRow label="Contact Number" value={student.mobileNumber} />
              <InfoRow label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—'} />
              <InfoRow label="Gender" value={student.gender} />
              <InfoRow label="Admission Number" value={student.admissionNo} />
              <InfoRow label="Date Of Admission" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '—'} />
              <InfoRow label="Ledger Number" value={student.ledgerNumber || '—'} />
              <InfoRow label="Admission in Class" value={className || '—'} />
              <InfoRow label="Admission in Section" value={sectionName || '—'} />
              <InfoRow label="Roll Number" value={student.rollNumber || '—'} />
              <InfoRow label="SRN Number" value={student.srnNumber || '—'} />
              <InfoRow label="Permanent Education No" value={student.permanentEducationNo || '—'} />
              <InfoRow label="Family Id" value={student.familyId || '—'} />
              <InfoRow label="Apaar Id" value={student.apaarId || '—'} />
              <InfoRow label="Medium" value={student.medium || '—'} />
              <InfoRow label="Enrollment School Name" value={student.enrollmentSchoolName || '—'} />
              <InfoRow label="Opening Balance" value={student.openingBalance || '—'} />
              <InfoRow label="Academic Year" value={academicYearName || student.academicYear || '—'} />
            </div>
          )}

          {activeTab === 'ADMISSION' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
              <InfoRow label="Admission Scheme" value={student.admissionScheme || '—'} />
              <InfoRow label="Admission Type" value={student.admissionType || '—'} />
              <InfoRow label="Guardian Name" value={student.guardianName || '—'} />
              <InfoRow label="Relation" value={student.guardianRelation || '—'} />
              <InfoRow label="Religion" value={student.religion || '—'} />
              <InfoRow label="Category" value={student.category || '—'} />
              <InfoRow label="Caste" value={student.caste || '—'} />
              <InfoRow label="Blood Group" value={student.bloodGroup || '—'} />
              <InfoRow label="Place Of Birth" value={student.placeOfBirth || '—'} />
              <InfoRow label="Height (In CM)" value={student.heightInCM || '—'} />
              <InfoRow label="Weight (In KG)" value={student.weightInKG || '—'} />
              <InfoRow label="Color Vision" value={student.colorVision || '—'} />
              <InfoRow label="Previous Class" value={student.previousClass || '—'} />
              <InfoRow label="Previous School Name" value={student.previousSchool || '—'} />
              <InfoRow label="TC No" value={student.tcNo || '—'} />
              <InfoRow label="TC Date" value={student.tcDate ? new Date(student.tcDate).toLocaleDateString() : '—'} />
              <InfoRow label="House Name" value={student.houseName || '—'} />
              <InfoRow label="Is Captain" value={student.isCaptain ? 'Yes' : 'No'} />
              <InfoRow label="Is Monitor" value={student.isMonitor ? 'Yes' : 'No'} />
              <InfoRow label="Bus" value={student.bus || '—'} />
              <InfoRow label="Route Name" value={student.routeName || '—'} />
              <InfoRow label="Stoppage Name" value={student.stoppageName || '—'} />
              <InfoRow label="Bus Fee" value={student.busFee || '—'} />
            </div>
          )}

          {activeTab === 'DOCUMENT' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InfoRow label="Student Aadhar No" value={student.studentAadharNo || '—'} />
                <InfoRow label="Student Bank Account No" value={student.studentBankAccountNo || '—'} />
                <InfoRow label="Student Bank Name" value={student.studentBankName || '—'} />
                <InfoRow label="Student IFSC CODE" value={student.studentIFSCCODE || '—'} />
                <InfoRow label="Father Aadhar No" value={student.fatherAadharNo || '—'} />
                <InfoRow label="Parent Account No" value={student.parentAccountNo || '—'} />
                <InfoRow label="Parent Bank Name" value={student.parentBankName || '—'} />
                <InfoRow label="Parent Bank IFSC CODE" value={student.parentBankIFSCCODE || '—'} />
                <InfoRow label="Mother Aadhar No" value={student.motherAadharNo || '—'} />
                <InfoRow label="Registration Number" value={student.registrationNumber || '—'} />
                <InfoRow label="Annual Income" value={student.annualIncome || '—'} />
              </div>
              
              <h3 className="text-lg font-bold text-slate-700 border-b pb-2 pt-6">Uploaded Documents</h3>
              {loadingDocs ? (
                 <div className="text-center py-10">
                    <div className="h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-2 text-slate-500 text-sm">Loading documents...</p>
                 </div>
               ) : documents.length === 0 ? (
                 <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                    <FileText className="h-8 w-8 text-slate-200 mx-auto" />
                    <p className="mt-2 text-slate-400 text-sm">No documents found.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documents.map(doc => (
                      <div key={doc.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between group hover:border-primary-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{doc.documentName}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Uploaded: {formatDate(doc.createdDate)}</p>
                          </div>
                        </div>
                        <a 
                          href={`${BASE_URL}${doc.documentUrl}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'FAMILY' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
              <InfoRow label="Father Contact Number" value={student.fatherMobile || '—'} />
              <InfoRow label="Father Email" value={student.fatherEmail || '—'} />
              <InfoRow label="Father Occupation" value={student.fatherOccupation || '—'} />
              <InfoRow label="Father Qualification" value={student.fatherQualification || '—'} />
              
              <InfoRow label="Mother Mobile Number" value={student.motherMobile || '—'} />
              <InfoRow label="Mother Email" value={student.motherEmail || '—'} />
              <InfoRow label="Mother Occupation" value={student.motherOccupation || '—'} />
              <InfoRow label="Mother Qualification" value={student.motherQualification || '—'} />
              
              <InfoRow label="Parent Mobile Number" value={student.parentMobileNumber || '—'} />
              <InfoRow label="Parent Email" value={student.parentEmail || '—'} />
              <InfoRow label="Parent Occupation" value={student.parentOccupation || '—'} />
              <InfoRow label="Parent Qualification" value={student.parentQualification || '—'} />
              
              <InfoRow label="Student Email" value={student.email || '—'} />
              <InfoRow label="SMS Facility" value={student.smsFacility ? 'Yes' : 'No'} />
              <InfoRow label="SMS Mobile Number" value={student.smsMobileNumber || '—'} />
            </div>
          )}

          {activeTab === 'ADDRESS' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
               <InfoRow label="Present Address" value={`${student.addressLine1 || ''} ${student.addressLine2 || ''} ${student.city || ''} ${student.state || ''} ${student.pincode || ''}`} className="md:col-span-2" />
               <InfoRow label="Permanent Address" value={student.permanentAddress || '—'} className="md:col-span-2" />
             </div>
          )}

          {activeTab === 'FINANCE' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               {loadingFee ? (
                 <div className="text-center py-10"><div className="h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
               ) : !feeAccount ? (
                 <div className="text-center py-10 text-slate-400">Fee account logic not initialized.</div>
               ) : (
                 <>
                   {/* Summary Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl relative overflow-hidden group">
                         <TrendingUp className="absolute -right-2 -bottom-2 h-16 w-16 text-blue-900/5 group-hover:scale-110 transition-transform" />
                         <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-widest mb-1">Total Billable</p>
                         <p className="text-xl font-bold text-slate-800">{formatCurrency(feeAccount.totalAllocated)}</p>
                      </div>
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl relative overflow-hidden group">
                         <CheckCircle className="absolute -right-2 -bottom-2 h-16 w-16 text-emerald-900/5 group-hover:scale-110 transition-transform" />
                         <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Total Paid</p>
                         <p className="text-xl font-bold text-slate-800">{formatCurrency(feeAccount.totalPaid)}</p>
                      </div>
                      <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl relative overflow-hidden group">
                         <Wallet className="absolute -right-2 -bottom-2 h-16 w-16 text-rose-900/5 group-hover:scale-110 transition-transform" />
                         <p className="text-[10px] font-bold text-rose-600/70 uppercase tracking-widest mb-1">Net Outstanding</p>
                         <p className="text-xl font-bold text-rose-600">{formatCurrency(feeAccount.currentBalance)}</p>
                      </div>
                   </div>

                   {/* Ledger Table */}
                   <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-6">
                      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                         <History className="h-4 w-4 text-slate-400" />
                         <h3 className="text-sm font-bold text-slate-700">Financial Ledger</h3>
                      </div>
                      <div className="overflow-x-auto">
                         <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-white uppercase text-[9px] font-bold text-slate-400 border-b border-slate-100 tracking-wider">
                               <tr>
                                  <th className="px-5 py-3">Type</th>
                                  <th className="px-5 py-3">Date</th>
                                  <th className="px-5 py-3">Details</th>
                                  <th className="px-5 py-3 text-right">Amount</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                               {feeAccount.transactions?.length === 0 ? (
                                  <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">No transactions recorded.</td></tr>
                               ) : (
                                  feeAccount.transactions.map((tx: any) => (
                                     <tr key={tx.id} className="hover:bg-slate-50/50">
                                        <td className="px-5 py-3">
                                           <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase ${
                                              tx.type === 'Charge' ? 'bg-amber-100 text-amber-700' :
                                              tx.type === 'Payment' ? 'bg-emerald-100 text-emerald-700' :
                                              'bg-slate-100 text-slate-600'
                                           }`}>
                                              {tx.type}
                                           </span>
                                        </td>
                                        <td className="px-5 py-3 text-slate-500">{formatDate(tx.transactionDate)}</td>
                                        <td className="px-5 py-3 max-w-[200px] truncate">{tx.description}</td>
                                        <td className={`px-5 py-3 text-right font-bold ${tx.type === 'Charge' ? 'text-slate-700' : 'text-emerald-600'}`}>
                                           {tx.type === 'Charge' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </td>
                                     </tr>
                                  ))
                               )}
                            </tbody>
                         </table>
                      </div>
                   </div>
                 </>
               )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, className = "" }: { label: string, value: string | number, className?: string }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}
