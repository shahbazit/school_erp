import { useState, useEffect } from 'react';
import { 
  Contact, FileText, Printer, User, Search, Filter, 
  ChevronRight, Award, GraduationCap, Info, Loader2
} from 'lucide-react';
import { masterApi } from '../api/masterApi';
import { studentApi } from '../api/studentApi';
import { Student } from '../types';

type TemplateType = 'ID_CARD_H' | 'ID_CARD_V' | 'BONAFIDE' | 'LEAVING' | 'CHARACTER';

export default function CertificateGenerator() {
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Masters
  const [classesList, setClassesList] = useState<any[]>([]);
  const [sectionsList, setSectionsList] = useState<any[]>([]);

  // Selection State
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('ID_CARD_V');
  const [filterClassId, setFilterClassId] = useState('');
  const [filterSectionId, setFilterSectionId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    Promise.all([
      masterApi.getAll('classes'),
      masterApi.getAll('sections')
    ]).then(([cls, sec]) => {
      setClassesList(cls);
      setSectionsList(sec);
    }).catch(console.error);
  }, []);

  const handleSearch = async () => {
    if (!filterClassId) {
      setError('Please select a class first.');
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const res = await studentApi.getAll({ 
        classId: filterClassId, 
        sectionId: filterSectionId || undefined,
        pageSize: 100 
      });
      setStudents(res.data);
      if (res.data.length > 0 && !selectedStudent) {
        setSelectedStudent(res.data[0]);
      }
    } catch {
      setError('Failed to load students.');
    } finally {
      setSearching(false);
    }
  };

  const templates = [
    { id: 'ID_CARD_V', name: 'Standard ID Card (Vertical)', icon: Contact, category: 'Identity' },
    { id: 'ID_CARD_H', name: 'Access Card (Horizontal)', icon: Contact, category: 'Identity' },
    { id: 'BONAFIDE', name: 'Bonafide Certificate', icon: FileText, category: 'Certificates' },
    { id: 'CHARACTER', name: 'Character Certificate', icon: Award, category: 'Certificates' },
    { id: 'LEAVING', name: 'School Leaving Certificate', icon: GraduationCap, category: 'Official' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const getClassName = (id: string) => classesList.find(c => c.id === id)?.name || 'N/A';
  const getSectionName = (id: string) => sectionsList.find(s => s.id === id)?.name || 'N/A';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-primary-600" />
            Certificates & ID Cards
          </h1>
          <p className="text-sm text-slate-500 mt-1">Generate and print professional student documentation.</p>
        </div>
        <button 
          onClick={handlePrint} 
          disabled={!selectedStudent}
          className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg shadow-primary-500/20"
        >
          <Printer className="h-4 w-4" />
          Print Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:hidden">
        
        {/* Left Column: Selection */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* 1. Template Picker */}
          <div className="glass-card p-5 space-y-4 shadow-xl border-slate-200">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Filter className="h-4 w-4" /> 1. Select Template
            </h3>
            <div className="space-y-2">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id as TemplateType)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border transition-all ${
                    selectedTemplate === t.id 
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedTemplate === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <t.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight">{t.name}</p>
                    <p className={`text-[10px] uppercase tracking-tighter font-semibold ${selectedTemplate === t.id ? 'text-indigo-200' : 'text-slate-400'}`}>{t.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Student Search */}
          <div className="glass-card p-5 space-y-4 shadow-xl border-slate-200">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User className="h-4 w-4" /> 2. Find Student
            </h3>
            <div className="space-y-3">
              {error && <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded">{error}</p>}
              <select 
                value={filterClassId} 
                onChange={(e) => setFilterClassId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white transition-all outline-none"
              >
                <option value="">Select Class</option>
                {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select 
                value={filterSectionId} 
                onChange={(e) => setFilterSectionId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white transition-all outline-none"
              >
                <option value="">All Sections</option>
                {sectionsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button 
                onClick={handleSearch}
                disabled={searching || !filterClassId}
                className="w-full btn-secondary py-2.5 flex items-center justify-center gap-2"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Load Students
              </button>
            </div>

            {students.length > 0 && (
              <div className="pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Student Results ({students.length})</p>
                <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                  {students.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className={`w-full group flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${
                        selectedStudent?.id === s.id 
                          ? 'bg-slate-900 text-white shadow-lg' 
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedStudent?.id === s.id ? 'bg-slate-700' : 'bg-slate-200 text-slate-500'}`}>
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold truncate">{s.firstName} {s.lastName}</p>
                          <p className={`text-[10px] ${selectedStudent?.id === s.id ? 'text-slate-400' : 'text-slate-500'}`}>Adm: {s.admissionNo}</p>
                        </div>
                      </div>
                      <ChevronRight className={`h-3 w-3 ${selectedStudent?.id === s.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preview Area */}
        <div className="lg:col-span-3">
          <div className="bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 min-h-[700px] flex items-center justify-center p-12 relative overflow-hidden">
            
            {/* Template Rendering */}
            {!selectedStudent ? (
              <div className="text-center space-y-4 max-w-sm animate-in fade-in duration-700">
                <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto ring-4 ring-slate-50">
                  <Info className="h-10 w-10 text-slate-200" />
                </div>
                <div>
                  <h4 className="text-slate-700 font-bold text-lg">No Selection</h4>
                  <p className="text-slate-400 text-sm">Select a student from the directory to generate a real-time preview of the document.</p>
                </div>
              </div>
            ) : (
              <div className="animate-in zoom-in-95 duration-300 shadow-2xl relative">
                 {/* ID CARD VERTICAL */}
                 {selectedTemplate === 'ID_CARD_V' && (
                    <IDCardVertical 
                      student={selectedStudent} 
                      className={getClassName(selectedStudent.classId)} 
                    />
                 )}
                 {/* ID CARD HORIZONTAL */}
                 {selectedTemplate === 'ID_CARD_H' && (
                    <IDCardHorizontal 
                      student={selectedStudent} 
                      className={getClassName(selectedStudent.classId)} 
                    />
                 )}
                 {/* BONAFIDE */}
                 {selectedTemplate === 'BONAFIDE' && (
                    <BonafideCertificate 
                      student={selectedStudent} 
                      className={getClassName(selectedStudent.classId)} 
                      section={getSectionName(selectedStudent.sectionId)} 
                    />
                 )}
                 {/* LEAVING */}
                 {selectedTemplate === 'LEAVING' && (
                    <OfficialCertificate 
                      title="SCHOOL LEAVING CERTIFICATE"
                      student={selectedStudent} 
                      className={getClassName(selectedStudent.classId)} 
                    />
                 )}
                 {/* CHARACTER */}
                 {selectedTemplate === 'CHARACTER' && (
                    <OfficialCertificate 
                      title="CHARACTER CERTIFICATE"
                      student={selectedStudent} 
                      className={getClassName(selectedStudent.classId)} 
                    />
                 )}
              </div>
            )}
            
            {/* Preview Banner */}
            <div className="absolute top-4 right-6 flex items-center gap-2 bg-white/80 backdrop-blur text-slate-800 px-4 py-2 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest shadow-sm">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               WYSIWYG Mode
            </div>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY AREA */}
      <div className="hidden print:block absolute inset-0 bg-white min-h-screen">
          {selectedStudent && (
             <div className="flex items-center justify-center min-h-screen scale-[1] print:scale-[1]">
                {selectedTemplate === 'ID_CARD_V' && <IDCardVertical student={selectedStudent} className={getClassName(selectedStudent.classId)} />}
                {selectedTemplate === 'ID_CARD_H' && <IDCardHorizontal student={selectedStudent} className={getClassName(selectedStudent.classId)} />}
                {selectedTemplate === 'BONAFIDE' && <BonafideCertificate student={selectedStudent} className={getClassName(selectedStudent.classId)} section={getSectionName(selectedStudent.sectionId)} />}
                {selectedTemplate === 'LEAVING' && <OfficialCertificate title="SCHOOL LEAVING CERTIFICATE" student={selectedStudent} className={getClassName(selectedStudent.classId)} />}
                {selectedTemplate === 'CHARACTER' && <OfficialCertificate title="CHARACTER CERTIFICATE" student={selectedStudent} className={getClassName(selectedStudent.classId)} />}
             </div>
          )}
      </div>

    </div>
  );
}

// Internal Components for Templates

function IDCardVertical({ student, className }: { student: Student, className: string }) {
  return (
    <div className="w-[54mm] h-[86mm] bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col relative shadow-lg scale-125 transform origin-center print:scale-100">
       <div className="h-20 bg-indigo-600 relative flex flex-col items-center justify-center text-white pt-2 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 -translate-y-12 blur-xl"></div>
          <GraduationCap className="h-6 w-6 mb-1 opacity-80" />
          <p className="text-[10px] font-black tracking-widest uppercase">Global Academy</p>
       </div>
       
       <div className="flex flex-col items-center -mt-8 relative z-10 px-4">
          <div className="h-20 w-20 rounded-2xl bg-slate-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
             {student.studentPhoto ? (
               <img src={student.studentPhoto} alt="Student" className="h-full w-full object-cover" />
             ) : (
               <User className="h-10 w-10 text-slate-200" />
             )}
          </div>
          
          <div className="mt-3 text-center">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1">{student.firstName} {student.lastName}</h3>
             <p className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">STUDENT ID</p>
          </div>

          <div className="w-full mt-4 space-y-2 border-t pt-4 border-slate-100">
             <div className="flex justify-between items-center">
                <span className="text-[6px] text-slate-400 font-bold uppercase">Adm No</span>
                <span className="text-[9px] text-slate-800 font-black">{student.admissionNo}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-[6px] text-slate-400 font-bold uppercase">Class</span>
                <span className="text-[9px] text-slate-800 font-black">{className}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-[6px] text-slate-400 font-bold uppercase">D.O.B</span>
                <span className="text-[9px] text-slate-800 font-black">{new Date(student.dateOfBirth).toLocaleDateString()}</span>
             </div>
          </div>
       </div>

       <div className="mt-auto p-4 flex items-center justify-between bg-slate-50/50">
          <div className="h-10 w-10 bg-slate-900 rounded-sm"></div>
          <div className="text-right">
             <div className="h-4 w-12 border-b border-slate-400 ml-auto mb-1"></div>
             <p className="text-[5px] font-bold text-slate-400 uppercase">Director</p>
          </div>
       </div>
    </div>
  );
}

function IDCardHorizontal({ student, className }: { student: Student, className: string }) {
  return (
    <div className="w-[86mm] h-[54mm] bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col relative shadow-lg scale-125 transform origin-center print:scale-100">
       <div className="h-12 bg-slate-900 flex items-center px-4 text-white">
          <p className="text-[10px] font-black tracking-widest uppercase">Global Academy International</p>
       </div>

       <div className="flex-1 flex p-4 gap-4">
          <div className="h-24 w-24 rounded-xl bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center shrink-0">
             {student.studentPhoto ? (
               <img src={student.studentPhoto} alt="Student" className="h-full w-full object-cover rounded-xl" />
             ) : (
               <User className="h-10 w-10 text-slate-200" />
             )}
          </div>
          <div className="flex-1 py-1">
             <h3 className="text-lg font-black text-slate-800 uppercase leading-none">{student.firstName} {student.lastName}</h3>
             <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Enrollment Card</p>
             
             <div className="grid grid-cols-2 gap-y-2 mt-4">
                <div>
                   <p className="text-[5px] font-bold text-slate-300 uppercase">Class</p>
                   <p className="text-[9px] font-black text-slate-700">{className}</p>
                </div>
                <div>
                   <p className="text-[5px] font-bold text-slate-300 uppercase">Valid Thru</p>
                   <p className="text-[9px] font-black text-slate-700">MAR 2025</p>
                </div>
                <div className="col-span-2">
                   <p className="text-[5px] font-bold text-slate-300 uppercase">Emergency</p>
                   <p className="text-[9px] font-black text-slate-700">{student.fatherMobile || '+91 00000 00000'}</p>
                </div>
             </div>
          </div>
       </div>
       <div className="h-1 w-full bg-gradient-to-r from-teal-400 to-indigo-600"></div>
    </div>
  );
}

function BonafideCertificate({ student, className, section }: { student: Student, className: string, section: string }) {
  return (
    <div className="w-[210mm] min-h-[148mm] bg-white p-16 flex flex-col border-[20px] border-slate-50 relative print:border-0 print:p-10 scale-[0.6] transform origin-center print:scale-100 shadow-2xl">
       <div className="text-center space-y-2 mb-12 border-b-2 border-slate-100 pb-8">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">GLOBAL EXCELLENCE INTERNATIONAL SCHOOL</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">A Temple of Learning & Integrity</p>
          <p className="text-xs text-slate-500 font-medium">Knowledge Square, Knowledge City, State - 400101 | Phone: +91-7000-000-000</p>
       </div>

       <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-800 underline underline-offset-8 uppercase tracking-[15px]">Bonafide</h2>
       </div>

       <div className="flex-1 space-y-10 text-xl leading-relaxed text-slate-700 text-justify">
          <p>
            This is to certify that Master / Miss <span className="font-black text-slate-900 border-b border-slate-300 mx-1">{student.firstName} {student.lastName}</span>, 
            bearing Admission No. <span className="font-black text-slate-900 border-b border-slate-300 mx-1">{student.admissionNo}</span>, is a bonafide student 
            of this institution studying in Class <span className="font-black text-slate-900 border-b border-slate-300 mx-1">{className}</span> 
            {section && <span> Section <span className="font-black text-slate-900 border-b border-slate-300 mx-1">{section}</span></span>} 
            during the academic session <span className="font-black text-slate-900 border-b border-slate-300 mx-1">{student.academicYear || "2023-2024"}</span>.
          </p>
          <p>
           According to school records, {student.gender === 'Male' ? 'his' : 'her'} date of birth is 
           <span className="font-black text-slate-900 border-b border-slate-300 mx-1">{new Date(student.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>. 
           {student.gender === 'Male' ? 'He' : 'She'} bears a good moral character.
          </p>
       </div>

       <div className="mt-20 flex justify-between items-end">
          <div className="text-center">
             <div className="h-px w-40 bg-slate-300 mb-2"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase">Class Teacher</p>
          </div>
          <div className="text-center">
             <div className="h-px w-40 bg-slate-900 mb-2"></div>
             <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Office Principal</p>
          </div>
       </div>
    </div>
  );
}

function OfficialCertificate({ title, student, className }: { title: string, student: Student, className: string }) {
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white p-20 flex flex-col border-[2px] border-slate-100 relative print:p-10 scale-[0.4] transform origin-top print:scale-100 shadow-2xl">
       <div className="text-center border-b-4 border-slate-900 pb-10 mb-16">
          <div className="flex items-center justify-center gap-4 mb-3">
              <GraduationCap className="h-12 w-12 text-slate-900" />
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">GLOBAL EXCELLENCE ACADEMY</h1>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Authorized Educational Trust under Govt. Reg. #420-2024</p>
       </div>

       <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-white bg-slate-900 inline-block px-12 py-4 rounded-3xl uppercase tracking-[12px]">{title}</h2>
          <div className="flex justify-between items-end mt-10 px-4">
             <p className="text-sm font-bold text-slate-400 uppercase">SR NO: {student.admissionNo?.slice(-4)}</p>
             <p className="text-sm font-bold text-slate-400 uppercase">DATE: {new Date().toLocaleDateString()}</p>
          </div>
       </div>

       <div className="flex-1 space-y-12 text-2xl leading-[2] text-slate-700">
          <div className="text-justify indent-16">
             Certified that <span className="font-black text-slate-900 uppercase border-b-2 border-slate-200">{student.firstName} {student.lastName}</span>
             {student.gender === 'Male' ? ' son ' : ' daughter '} of Shri <span className="font-bold text-slate-800 border-b-2 border-slate-200">{student.fatherName}</span>
             is a student of this school in <span className="font-bold text-slate-800 border-b-2 border-slate-200">{className}</span> class.
          </div>

          <div className="grid grid-cols-1 gap-8 px-12 italic text-slate-500">
             <p>This certificate is issued to certify {student.gender === 'Male' ? 'his' : 'her'} meritorious conduct and academic consistency during the session {student.academicYear || "2023-24"}.</p>
          </div>
       </div>

       <div className="mt-auto flex justify-between items-end border-t-2 border-slate-50 pt-16">
          <div className="text-center">
             <div className="h-px w-48 bg-slate-400 mb-3"></div>
             <p className="text-xs font-black text-slate-500 uppercase">Verification Clerk</p>
          </div>
          <div className="text-center">
             <div className="h-px w-48 bg-slate-900 mb-3"></div>
             <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Head of Institution</p>
          </div>
       </div>
    </div>
  );
}
