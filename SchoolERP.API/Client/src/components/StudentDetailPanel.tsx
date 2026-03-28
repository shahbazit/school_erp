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
}

type TabType = 'PERSONAL' | 'ACADEMIC' | 'PARENT' | 'ADDRESS' | 'FINANCE' | 'DOCUMENTS';

export default function StudentDetailPanel({ student, onClose, onEdit, className, sectionName }: StudentDetailPanelProps) {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const [activeTab, setActiveTab] = useState<TabType>('PERSONAL');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [feeAccount, setFeeAccount] = useState<any>(null);
  const [loadingFee, setLoadingFee] = useState(false);

  useEffect(() => {
    if (student?.id && activeTab === 'DOCUMENTS') {
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
    { id: 'PERSONAL', label: 'Personal', icon: User },
    { id: 'ACADEMIC', label: 'Academic', icon: BookOpen },
    { id: 'PARENT', label: 'Parent/Guardian', icon: Users },
    { id: 'FINANCE', label: 'Finance', icon: CreditCard },
    { id: 'ADDRESS', label: 'Address', icon: MapPin },
    { id: 'DOCUMENTS', label: 'Documents', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full lg:w-[60%] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
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
          {activeTab === 'PERSONAL' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
              <InfoRow label="Full Name" value={`${student.firstName} ${student.lastName}`} />
              <InfoRow label="Gender" value={student.gender} />
              <InfoRow label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—'} />
              <InfoRow label="Blood Group" value={student.bloodGroup || '—'} />
              <InfoRow label="Mobile" value={student.mobileNumber} />
              <InfoRow label="Email" value={student.email || '—'} />
            </div>
          )}

          {activeTab === 'ACADEMIC' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
              <InfoRow label="Class" value={className || '—'} />
              <InfoRow label="Section" value={sectionName || '—'} />
              <InfoRow label="Roll Number" value={student.rollNumber || '—'} />
              <InfoRow label="Admission Number" value={student.admissionNo} />
              <InfoRow label="Academic Year" value={student.academicYear} />
              <InfoRow label="Admission Date" value={formatDate(student.admissionDate)} />
              <InfoRow label="Previous School" value={student.previousSchool || '—'} className="md:col-span-2" />
            </div>
          )}

          {activeTab === 'PARENT' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                   <User className="h-4 w-4 text-primary-500" /> Father's Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow label="Name" value={student.fatherName || '—'} />
                  <InfoRow label="Mobile" value={student.fatherMobile || '—'} />
                  <InfoRow label="Occupation" value={student.fatherOccupation || '—'} />
                  <InfoRow label="Email" value={student.fatherEmail || '—'} />
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                   <User className="h-4 w-4 text-pink-500" /> Mother's Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow label="Name" value={student.motherName || '—'} />
                  <InfoRow label="Mobile" value={student.motherMobile || '—'} />
                  <InfoRow label="Occupation" value={student.motherOccupation || '—'} />
                  <InfoRow label="Email" value={student.motherEmail || '—'} />
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                   <Info className="h-4 w-4 text-amber-500" /> Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow label="Name" value={student.emergencyContactName || '—'} />
                  <InfoRow label="Mobile" value={student.emergencyContactNumber || '—'} />
                  <InfoRow label="Relation" value={student.emergencyContactRelation || '—'} className="md:col-span-2" />
                </div>
              </div>
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
                         <p className="text-[10px] font-bold text-rose-600/70 uppercase tracking-widest mb-1">Net Balance</p>
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

          {activeTab === 'ADDRESS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
               <InfoRow label="Address Line 1" value={student.addressLine1 || '—'} className="md:col-span-2" />
               <InfoRow label="Address Line 2" value={student.addressLine2 || '—'} className="md:col-span-2" />
               <InfoRow label="City" value={student.city || '—'} />
               <InfoRow label="State" value={student.state || '—'} />
               <InfoRow label="PIN Code" value={student.pincode || '—'} />
            </div>
          )}

          {activeTab === 'DOCUMENTS' && (
            <div className="space-y-6 animate-in fade-in duration-300">
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
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, className = "" }: { label: string, value: string, className?: string }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}
