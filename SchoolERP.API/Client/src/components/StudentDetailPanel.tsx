import { useState, useEffect } from 'react';
import { 
  X, MapPin, BookOpen, Users, GraduationCap, Shield, 
  Calendar, CreditCard, FileText, Activity, Phone, 
  Mail, Award, ChevronRight, ExternalLink, Printer,
  User, CheckCircle2, AlertCircle, TrendingUp, Clock,
  Info, Loader2, Upload
} from 'lucide-react';
import { Student } from '../types';
import apiClient, { API_URL } from '../api/apiClient';
const BASE_URL = API_URL.replace('/api', '');

interface StudentDetailPanelProps {
  student: Student | null;
  onClose: () => void;
  onEdit: (student: Student) => void;
  className?: string;
  sectionName?: string;
}

type TabType = 'OVERVIEW' | 'ACADEMICS' | 'ATTENDANCE' | 'FEES' | 'DOCUMENTS' | 'EXAMS' | 'MEDICAL';

export default function StudentDetailPanel({ student, onClose, onEdit, className, sectionName }: StudentDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    if (student?.id && activeTab === 'DOCUMENTS') {
       fetchDocuments();
    }
  }, [student, activeTab]);

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

  const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
  
  const tabs: { id: TabType, label: string, icon: any }[] = [
    { id: 'OVERVIEW', label: 'Overview', icon: User },
    { id: 'ACADEMICS', label: 'Academics', icon: GraduationCap },
    { id: 'ATTENDANCE', label: 'Attendance', icon: Calendar },
    { id: 'FEES', label: 'Fees', icon: CreditCard },
    { id: 'EXAMS', label: 'Results', icon: Award },
    { id: 'MEDICAL', label: 'Health', icon: Activity },
    { id: 'DOCUMENTS', label: 'Documents', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative w-full lg:w-[65%] h-full bg-slate-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out overflow-hidden">
        
        {/* Profile Header Block */}
        <div className="bg-white border-b border-slate-200 shrink-0">
           <div className="bg-gradient-to-r from-primary-600 to-indigo-700 h-32 relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all z-20"
              >
                 <X className="h-5 w-5" />
              </button>
              
              <div className="absolute left-0 bottom-0 p-6 flex items-end gap-6 translate-y-12">
                 <div className="h-32 w-32 rounded-[2.5rem] bg-white p-1.5 shadow-2xl border-4 border-white overflow-hidden ring-4 ring-slate-100/50 relative">
                    <div className="h-full w-full rounded-[2rem] bg-slate-100 flex items-center justify-center overflow-hidden">
                       {student.studentPhoto ? (
                         <img src={student.studentPhoto} alt="Student" className="h-full w-full object-cover" />
                       ) : (
                         <span className="text-4xl font-black text-slate-300">{initials}</span>
                       )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
                       <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                 </div>
                 
                 <div className="pb-4">
                    <div className="flex items-center gap-3">
                       <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{student.firstName} {student.lastName}</h2>
                       <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${student.isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                          {student.isActive ? 'Active Student' : 'Inactive'}
                       </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-slate-500 font-medium">
                       <p className="flex items-center gap-1.5 text-sm bg-slate-100 px-2 py-0.5 rounded-md font-mono">{student.admissionNo}</p>
                       <p className="flex items-center gap-1.5 text-sm"><GraduationCap className="h-4 w-4 text-primary-500" /> {className} {sectionName}</p>
                       <p className="flex items-center gap-1.5 text-sm"><Shield className="h-4 w-4 text-orange-500" /> Roll #{student.rollNumber || 'N/A'}</p>
                    </div>
                 </div>
              </div>
           </div>
           
           {/* Tab Navigation */}
           <div className="pt-20 px-8 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                 {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
                        activeTab === tab.id 
                          ? 'border-primary-600 text-primary-600 bg-primary-50/50' 
                          : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                       <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-primary-600' : 'text-slate-400'}`} />
                       {tab.label}
                    </button>
                 ))}
              </div>
              
              <div className="flex items-center gap-2 pb-2">
                 <button 
                  onClick={() => onEdit(student)}
                  className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" 
                 >
                    <Users className="h-5 w-5" />
                 </button>
              </div>
           </div>
        </div>

        {/* Dynamic Content Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
           
           {activeTab === 'OVERVIEW' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard label="Attendance" value="94.2%" sub="This Month" icon={Calendar} color="bg-emerald-500" trend="+2.5%" />
                    <StatCard label="Avg Grade" value="A+" sub="Last Term" icon={Award} color="bg-primary-500" />
                    <StatCard label="Fee Status" value="Paid" sub="Session 23-24" icon={CreditCard} color="bg-blue-500" />
                    <StatCard label="Behavior" value="Exemplary" sub="Teacher Log" icon={TrendingUp} color="bg-purple-500" />
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                       <SectionCard title="Personal Dossier" icon={User}>
                          <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                             <DataPoint label="Full Name" value={`${student.firstName} ${student.lastName}`} />
                             <DataPoint label="Gender" value={student.gender} />
                             <DataPoint label="Date of Birth" value={new Date(student.dateOfBirth).toLocaleDateString()} />
                             <DataPoint label="Blood Group" value={student.bloodGroup || 'O+'} color="text-red-600" />
                             <DataPoint label="Mobile" value={student.mobileNumber} variant="link" />
                             <DataPoint label="Email" value={student.email} variant="link" />
                          </div>
                       </SectionCard>

                       <SectionCard title="Guardian Network" icon={Users}>
                          <div className="space-y-6">
                             <GuardianItem name={student.fatherName} role="Father" mobile={student.fatherMobile} occ={student.fatherOccupation} />
                             <GuardianItem name={student.motherName} role="Mother" mobile={student.motherMobile} occ={student.motherOccupation} />
                             <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <AlertCircle className="h-5 w-5 text-rose-500" />
                                   <div>
                                      <p className="text-xs font-bold text-rose-900 uppercase tracking-tight">Emergency Contact</p>
                                      <p className="text-sm text-rose-700 font-bold">{student.emergencyContactName} ({student.emergencyContactNumber})</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </SectionCard>
                    </div>

                    <div className="space-y-6">
                       <SectionCard title="Quick Print" icon={Printer}>
                          <div className="space-y-2">
                             <ShortcutButton label="Identity Card" icon={User} onClick={() => window.location.href='/certificates'} />
                             <ShortcutButton label="Bonafide Certificate" icon={FileText} onClick={() => window.location.href='/certificates'} />
                             <ShortcutButton label="Fee Receipt" icon={CreditCard} onClick={() => window.location.href=`/fees/student/${student.id}`} />
                          </div>
                       </SectionCard>
                       <SectionCard title="Timeline" icon={Clock}>
                          <div className="space-y-5 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                             <TimelineItem date="15 Aug 2023" label="Enrollment Confirmed" sub="Admission into Class 8-A" active />
                             <TimelineItem date="02 Sep 2023" label="First Term Started" sub="Academic Session 23-24" />
                          </div>
                       </SectionCard>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'DOCUMENTS' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                 <div className="flex items-center justify-between">
                    <div>
                       <h3 className="text-lg font-bold text-slate-800">Verified Documents</h3>
                       <p className="text-xs text-slate-500">History of all uploaded academic and personal files.</p>
                    </div>
                    <button className="btn-secondary py-2 flex items-center gap-2"><Upload className="h-4 w-4" /> Upload New</button>
                 </div>
                 {loadingDocs ? <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" /></div> : documents.length === 0 ? (
                    <div className="py-20 text-center glass-card border-dashed space-y-4">
                       <FileText className="h-12 w-12 text-slate-200 mx-auto" />
                       <p className="text-slate-400 font-medium italic text-sm">No documented records found for this student.</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {documents.map(doc => (
                          <div key={doc.id} className="p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-all flex items-center justify-between group">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><FileText className="h-6 w-6" /></div>
                                <div><p className="text-sm font-bold text-slate-800">{doc.documentName}</p></div>
                             </div>
                             <a href={`${BASE_URL}${doc.documentUrl}`} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><ExternalLink className="h-4 w-4" /></a>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           )}

           {activeTab === 'MEDICAL' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SectionCard title="Vital Records" icon={Activity}>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center p-3 bg-red-50 rounded-2xl border border-red-100">
                              <div className="flex items-center gap-3"><AlertCircle className="h-5 w-5 text-red-500" /><span className="text-xs font-bold text-red-900 uppercase">Blood Group</span></div>
                              <span className="text-xl font-black text-red-600">{student.bloodGroup || 'O+'}</span>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase">Height</p>
                                 <p className="text-sm font-black text-slate-800">142 cm</p>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase">Weight</p>
                                 <p className="text-sm font-black text-slate-800">38 kg</p>
                              </div>
                           </div>
                        </div>
                    </SectionCard>
                    <SectionCard title="Allergies & Alerts" icon={Shield}>
                       <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-4">
                          <Info className="h-6 w-6 text-orange-500" />
                          <div><p className="text-xs font-black text-orange-900 uppercase">Nut Allergy</p><p className="text-xs text-orange-700">Severely allergic to peanuts.</p></div>
                       </div>
                    </SectionCard>
                 </div>
                 <SectionCard title="Medical History" icon={Clock}>
                    <div className="space-y-4">
                       <HistoryItem label="Annual Physical Exam" date="12 Jan 2024" doctor="Dr. Emily Watson" status="Healthy" />
                       <HistoryItem label="Flu Vaccination" date="05 Nov 2023" doctor="School Clinic" status="Completed" />
                    </div>
                 </SectionCard>
              </div>
           )}

           {activeTab === 'ACADEMICS' && <PlaceholderTab icon={GraduationCap} title="Academic Transcript coming soon" />}
           {activeTab === 'ATTENDANCE' && <PlaceholderTab icon={Calendar} title="Attendance Analytics coming soon" />}
           {activeTab === 'FEES' && <PlaceholderTab icon={CreditCard} title="Fee Ledger integration coming soon" />}
           {activeTab === 'EXAMS' && <PlaceholderTab icon={Award} title="Examination Results history coming soon" />}
        </div>
      </div>
    </div>
  );
}

// Helpers
function StatCard({ label, value, sub, icon: Icon, color, trend }: any) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm">
       <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-2xl ${color} bg-opacity-10`}><Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} /></div>
          {trend && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>}
       </div>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
       <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
       <p className="text-[10px] font-bold text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
       <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center"><Icon className="h-4 w-4 text-slate-500" /></div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{title}</h3>
       </div>
       <div className="p-6">{children}</div>
    </div>
  );
}

function GuardianItem({ name, role, mobile, occ }: any) {
  return (
     <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-300"><User className="h-5 w-5" /></div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 flex-1">
           <div><p className="text-[9px] font-bold text-slate-400 uppercase">{role}</p><p className="text-sm font-bold text-slate-800">{name || '—'}</p></div>
           <div><p className="text-[9px] font-bold text-slate-400 uppercase">Mobile</p><p className="text-sm font-bold text-primary-600">{mobile || '—'}</p></div>
           <div className="col-span-2 mt-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Occupation</p><p className="text-sm font-bold text-slate-500">{occ || '—'}</p></div>
        </div>
     </div>
  );
}

function HistoryItem({ label, date, doctor, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary-100 group transition-all">
       <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary-50"><Activity className="h-5 w-5 text-slate-400 group-hover:text-primary-600" /></div>
          <div><p className="text-sm font-bold text-slate-800">{label}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{date} • {doctor}</p></div>
       </div>
       <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{status}</span>
    </div>
  );
}

function DataPoint({ label, value, color = "text-slate-800", variant = "text" }: any) {
  return (
    <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">{label}</p>
    {variant === 'link' ? <p className={`text-sm font-bold flex items-center gap-2 ${color} hover:text-primary-600 cursor-pointer`}>{label === 'Email' ? <Mail className="h-3 w-3" /> : <Phone className="h-3 w-3" />}{value || '—'}</p> : <p className={`text-sm font-bold ${color}`}>{value || '—'}</p>}
    </div>
  );
}

function ShortcutButton({ label, icon: Icon, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left">
       <div className="flex items-center gap-3"><Icon className="h-4 w-4 text-slate-400" /><span className="text-xs font-bold text-slate-600">{label}</span></div>
       <ChevronRight className="h-3 w-3 text-slate-300" />
    </button>
  );
}

function TimelineItem({ date, label, sub, active }: any) {
  return (
    <div className="pl-8 relative"><div className={`absolute left-[-1px] top-1.5 h-3 w-3 rounded-full border-2 ${active ? 'bg-primary-600 border-primary-100 ring-4 ring-primary-50' : 'bg-white border-slate-200'}`}></div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{date}</p><p className={`text-xs font-black mt-1 ${active ? 'text-primary-700' : 'text-slate-800'}`}>{label}</p><p className="text-[10px] font-bold text-slate-400 mt-0.5">{sub}</p></div>
  );
}

function PlaceholderTab({ icon: Icon, title }: any) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
       <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center"><Icon className="h-10 w-10 text-slate-200" /></div>
       <div><h4 className="text-slate-700 font-black uppercase tracking-widest">{title}</h4><p className="text-xs text-slate-400 mt-2 max-w-xs px-6">Implementation in progress. Historical data migration pending.</p></div>
    </div>
  );
}
