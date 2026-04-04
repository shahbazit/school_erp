import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Printer, User, Search, Award, GraduationCap, Info, Loader2,
  Settings2, Layout, Check, Eye, Layers
} from 'lucide-react';
import { masterApi } from '../api/masterApi';
import { studentApi } from '../api/studentApi';
import { organizationApi, OrganizationSettings } from '../api/organizationApi';
import { certificateFormatApi, CertificateFormatDto } from '../api/certificateFormatApi';
import { Student } from '../types';

type TemplateType = 'ID_CARD_H' | 'ID_CARD_V' | 'BONAFIDE' | 'LEAVING' | 'CHARACTER';
type PaperSize = 'A4' | 'A5' | 'IDENTITY';

// Always-available certificate types (shown regardless of saved formats)
const CERT_TYPES = [
  { id: 'ID_CARD_V',  label: 'ID Card – Vertical',          defaultPaper: 'IDENTITY' as PaperSize, defaultPerPage: 4 },
  { id: 'ID_CARD_H',  label: 'ID Card – Horizontal',         defaultPaper: 'IDENTITY' as PaperSize, defaultPerPage: 4 },
  { id: 'BONAFIDE',   label: 'Bonafide Certificate',          defaultPaper: 'A5'       as PaperSize, defaultPerPage: 1 },
  { id: 'CHARACTER',  label: 'Character Certificate',         defaultPaper: 'A4'       as PaperSize, defaultPerPage: 1 },
  { id: 'LEAVING',    label: 'School Leaving Certificate',    defaultPaper: 'A4'       as PaperSize, defaultPerPage: 1 },
];

export default function CertificateGenerator() {
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings | null>(null);

  // Masters
  const [classesList, setClassesList] = useState<any[]>([]);
  const [sectionsList, setSectionsList] = useState<any[]>([]);

  // Selection State
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('ID_CARD_V');
  const [filterClassId, setFilterClassId] = useState('');
  const [filterSectionId, setFilterSectionId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  
  // Saved DB formats keyed by templateId
  const [savedFormats, setSavedFormats] = useState<Record<string, CertificateFormatDto>>({});

  // Active print settings
  const [selectedFormatId, setSelectedFormatId] = useState('ID_CARD_V');
  const [paperSize, setPaperSize] = useState<PaperSize>('IDENTITY');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [showLogo, setShowLogo] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showSeal, setShowSeal] = useState(true);
  const [logoScale, setLogoScale] = useState(1.0);
  const [headerText, setHeaderText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [footerLeft, setFooterLeft] = useState('');
  const [footerRight, setFooterRight] = useState('');
  const [layoutMode, setLayoutMode] = useState<'SINGLE' | 'GRID'>('SINGLE');

  const selectedStudentsData = useMemo(() => 
    students.filter(s => s.id && selectedStudentIds.includes(s.id)), 
    [students, selectedStudentIds]
  );

  const previewStudent = selectedStudentsData[0] || (students.length > 0 ? students[0] : null);

  useEffect(() => {
    Promise.all([
      masterApi.getAll('classes'),
      masterApi.getAll('sections'),
      organizationApi.getSettings(),
      certificateFormatApi.getAll().catch(() => [] as CertificateFormatDto[]),
    ]).then(([cls, sec, org, formats]) => {
      setClassesList(cls);
      setSectionsList(sec);
      setOrgSettings(org);
      const map: Record<string, CertificateFormatDto> = {};
      (formats as CertificateFormatDto[]).forEach(f => { map[f.templateId] = f; });
      setSavedFormats(map);
      applyTypeFormat('ID_CARD_V', map);
    }).catch(console.error);
  }, []);

  const applyTypeFormat = (typeId: string, overridesMap: Record<string, CertificateFormatDto | any>) => {
    const tpl = CERT_TYPES.find(t => t.id === typeId)!;
    const saved = overridesMap[typeId];

    setSelectedFormatId(typeId);
    setSelectedTemplate(typeId as TemplateType);
    setPaperSize(saved?.paperSize || tpl.defaultPaper);
    setPrimaryColor(saved?.primaryColor || '#4f46e5');
    setShowLogo(saved?.showLogo ?? true);
    setShowAddress(saved?.showAddress ?? true);
    setShowSeal(saved?.showSeal ?? true);
    setLogoScale(saved?.logoScale ?? 1.0);
    setHeaderText(saved?.headerText || '');
    setBodyText(saved?.bodyText || '');
    setFooterLeft(saved?.footerLeft || '');
    setFooterRight(saved?.footerRight || '');
    const pages = saved?.perPage ?? tpl.defaultPerPage;
    setLayoutMode(pages > 1 ? 'GRID' : 'SINGLE');
  };

  const handleTypeChange = (typeId: string) => {
    applyTypeFormat(typeId, savedFormats);
  };

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
      if (res.data.length > 0) {
        const firstId = res.data[0].id;
        if (firstId) setSelectedStudentIds([firstId]);
      }
    } catch {
      setError('Failed to load students.');
    } finally {
      setSearching(false);
    }
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

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
          <p className="text-sm text-slate-500 mt-1">Select a pre-designed format and print student documents.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/certificates/designer" 
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <Layers className="h-4 w-4 text-primary-500" />
            Try Advanced Designer
          </Link>
          <button 
            onClick={handlePrint} 
            disabled={selectedStudentIds.length === 0}
            className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg shadow-primary-500/20"
          >
            <Printer className="h-4 w-4" />
            Print {selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ''} Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:hidden">
        
        {/* Left Column: Selection */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* 1. Certificate Type Selection — always shows all 5 types */}
          <div className="glass-card p-5 space-y-4 shadow-xl border-slate-200">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layout className="h-4 w-4" /> 1. Select Certificate Type
            </h3>
            <div className="space-y-2">
              {CERT_TYPES.map(t => {
                const hasSaved = !!savedFormats[t.id];
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTypeChange(t.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left text-sm font-bold transition-all ${
                      selectedFormatId === t.id
                        ? 'bg-primary-600 border-primary-700 text-white shadow-lg'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{t.label}</span>
                    <div className="flex items-center gap-1.5">
                      {hasSaved && (
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${selectedFormatId === t.id ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                          CUSTOM
                        </span>
                      )}
                      {selectedFormatId === t.id && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </div>
                  </button>
                );
              })}
              <Link
                to="/certificate-formats"
                className="text-[10px] font-bold text-primary-600 flex items-center gap-1 hover:underline mt-1"
              >
                <Settings2 className="h-3 w-3" /> Customise Formats
              </Link>
            </div>

            {selectedFormatId && (
              <div className="pt-3 border-t border-slate-100 space-y-4">
                 
                 {/* Paper Size Selector */}
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase text-center tracking-widest">Select Paper Size</p>
                    <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl">
                       {(['A4', 'A5', 'IDENTITY'] as PaperSize[]).map(size => (
                          <button 
                            key={size}
                            onClick={() => setPaperSize(size)}
                            className={`py-2 rounded-lg text-[10px] font-bold transition-all ${paperSize === size ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            {size}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Print Mode (Grid vs Single) */}
                 {(layoutMode === 'GRID' || (selectedTemplate.startsWith('ID_CARD') && paperSize !== 'IDENTITY')) && (
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-slate-400 uppercase text-center tracking-widest">Layout Mode</p>
                       <div className="flex bg-slate-100 p-1 rounded-xl">
                          <button 
                            onClick={() => setLayoutMode('SINGLE')}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${layoutMode === 'SINGLE' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            Single
                          </button>
                          <button 
                            onClick={() => setLayoutMode('GRID')}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${layoutMode === 'GRID' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            Grid
                          </button>
                       </div>
                    </div>
                 )}

                 <div className="flex justify-between items-center text-[10px] px-1 pt-1 opacity-60">
                    <span className="text-slate-400 font-bold uppercase">Template</span>
                    <span className="text-slate-800 font-black italic">{selectedTemplate.replace(/_/g, ' ')}</span>
                 </div>
              </div>
            )}
          </div>

          {/* 3. Student Search */}
          <div className="glass-card p-5 space-y-4 shadow-xl border-slate-200">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User className="h-4 w-4" /> 3. Select Students
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
                className="w-full btn-secondary py-2 flex items-center justify-center gap-2 text-xs"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Fetch Records
              </button>
            </div>

            {students.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Results ({selectedStudentIds.length}/{students.length})</p>
                  <button 
                    onClick={() => setSelectedStudentIds(selectedStudentIds.length === students.length ? [] : students.map(s => s.id!).filter(Boolean))}
                    className="text-[10px] font-bold text-primary-600 hover:text-primary-700"
                  >
                    {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-[250px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                  {students.map(s => (
                    <button
                      key={s.id}
                      onClick={() => s.id && toggleStudentSelection(s.id)}
                      className={`w-full group flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                        s.id && selectedStudentIds.includes(s.id) 
                          ? 'bg-slate-900 text-white shadow-lg' 
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${s.id && selectedStudentIds.includes(s.id) ? 'bg-slate-700' : 'bg-slate-200 text-slate-500'}`}>
                          {s.id && selectedStudentIds.includes(s.id) ? <Check className="h-3.5 w-3.5" /> : `${s.firstName[0]}${s.lastName[0]}`}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold truncate">{s.firstName} {s.lastName}</p>
                          <p className={`text-[10px] ${s.id && selectedStudentIds.includes(s.id) ? 'text-slate-400' : 'text-slate-500'}`}>Adm: {s.admissionNo}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preview Area */}
        <div className="lg:col-span-3">
          <div className="bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 min-h-[700px] flex items-center justify-center p-6 relative overflow-hidden">
            
            {/* Template Rendering */}
            {!previewStudent ? (
              <div className="text-center space-y-4 max-w-sm animate-in fade-in duration-700">
                <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto ring-4 ring-slate-50">
                  <Info className="h-10 w-10 text-slate-200" />
                </div>
                <div>
                  <h4 className="text-slate-700 font-bold text-lg">No Student Chosen</h4>
                  <p className="text-slate-400 text-sm">Select one or more students to preview their certificates in real-time.</p>
                </div>
              </div>
            ) : (
              <div className="animate-in zoom-in-95 duration-300 shadow-2xl relative">
                  <CertificateRenderer 
                    template={selectedTemplate}
                    student={previewStudent}
                    settings={orgSettings}
                    className={getClassName(previewStudent.classId)}
                    section={getSectionName(previewStudent.sectionId)}
                    customColor={primaryColor}
                    showLogo={showLogo}
                    showAddress={showAddress}
                    showSeal={showSeal}
                    paperSize={paperSize}
                    logoScale={logoScale}
                    headerText={headerText}
                    bodyText={bodyText}
                    footerLeft={footerLeft}
                    footerRight={footerRight}
                  />
              </div>
            )}
            
            {/* Preview Banner */}
            <div className="absolute top-4 right-6 flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur text-slate-800 px-4 py-2 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Eye className="h-3 w-3 text-emerald-500" />
                Preview Mode
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY AREA */}
      <div className="hidden print:block absolute inset-0 bg-white">
          {selectedStudentsData.length > 0 && (
             <div className={`print-container ${paperSize}`}>
                {selectedTemplate.startsWith('ID_CARD') && layoutMode === 'GRID' && paperSize !== 'IDENTITY' ? (
                   <div className="grid grid-cols-2 gap-x-4 gap-y-8 p-8">
                    {selectedStudentsData.map(student => (
                      <div key={student.id} className="flex items-center justify-center break-inside-avoid">
                        <CertificateRenderer 
                          template={selectedTemplate}
                          student={student}
                          settings={orgSettings}
                          className={getClassName(student.classId)}
                          section={getSectionName(student.sectionId)}
                          customColor={primaryColor}
                          showLogo={showLogo}
                          showAddress={showAddress}
                          showSeal={showSeal}
                          paperSize="IDENTITY"
                          headerText={headerText}
                          bodyText={bodyText}
                          footerLeft={footerLeft}
                          footerRight={footerRight}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    {selectedStudentsData.map(student => (
                      <div key={student.id} className="min-h-screen flex items-center justify-center p-8 page-break-after-always">
                        <CertificateRenderer 
                          template={selectedTemplate}
                          student={student}
                          settings={orgSettings}
                          className={getClassName(student.classId)}
                          section={getSectionName(student.sectionId)}
                          customColor={primaryColor}
                          showLogo={showLogo}
                          showAddress={showAddress}
                          showSeal={showSeal}
                          paperSize={paperSize}
                          headerText={headerText}
                          bodyText={bodyText}
                          footerLeft={footerLeft}
                          footerRight={footerRight}
                        />
                      </div>
                    ))}
                  </div>
                )}
             </div>
          )}
      </div>

      <style>{`
        @media print {
          @page {
            size: ${paperSize === 'IDENTITY' ? '86mm 54mm' : paperSize === 'A4' ? 'A4 portrait' : 'A5 landscape'};
            margin: 0;
          }
          body { margin: 0; padding: 0; background: white; }
          .page-break-after-always { page-break-after: always; }
          .break-inside-avoid { break-inside: avoid; }
          .print-container { width: 100%; }
        }
      `}</style>
    </div>
  );
}

// Reusable Renderer
function CertificateRenderer({ 
  template, student, settings, className, section, customColor, showLogo, showAddress, showSeal, paperSize,
  logoScale, headerText, bodyText, footerLeft, footerRight 
}: any) {
  const commonProps = { 
    student, settings, className, section, customColor, showLogo, showAddress, showSeal, paperSize,
    logoScale, headerText, bodyText, footerLeft, footerRight 
  };
  
  switch(template) {
    case 'ID_CARD_V': return <IDCardVertical {...commonProps} />;
    case 'ID_CARD_H': return <IDCardHorizontal {...commonProps} />;
    case 'BONAFIDE': return <BonafideCertificate {...commonProps} />;
    case 'LEAVING': return <OfficialCertificate title={headerText || "SCHOOL LEAVING CERTIFICATE"} {...commonProps} />;
    case 'CHARACTER': return <OfficialCertificate title={headerText || "CHARACTER CERTIFICATE"} {...commonProps} />;
    default: return null;
  }
}

function IDCardVertical({ student, settings, className, customColor, showLogo, logoScale = 1, headerText, footerRight }: any) {
  const logoH = Math.round(logoScale * 24);
  return (
    <div className="w-[54mm] h-[86mm] bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col relative shadow-lg scale-125 transform origin-center print:scale-100">
       <div 
        className="h-20 relative flex flex-col items-center justify-center text-white pt-2 overflow-hidden"
        style={{ backgroundColor: customColor }}
       >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 -translate-y-12 blur-xl"></div>
          {showLogo && settings?.logoBase64 ? (
            <img src={settings.logoBase64} alt="Logo" className="object-contain mb-1" style={{ height: logoH, maxWidth: 32 }} />
          ) : (
            <GraduationCap className="h-6 w-6 mb-1 opacity-80" />
          )}
          <p className="text-[10px] font-black tracking-widest uppercase text-center px-4 leading-tight">{settings?.name || 'Global Academy'}</p>
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
             <p className="text-[8px] font-bold px-2 py-0.5 rounded-full inline-block" style={{ color: customColor, backgroundColor: `${customColor}10` }}>
                {headerText || 'STUDENT ID'}
             </p>
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
          <div className="h-8 w-8 bg-slate-100 border border-slate-200 rounded flex items-center justify-center">
             <div className="w-6 h-6 bg-slate-300 opacity-20"></div>
          </div>
          <div className="text-right">
             <div className="h-4 w-12 border-b border-slate-400 ml-auto mb-1"></div>
             <p className="text-[5px] font-bold text-slate-400 uppercase">{footerRight || 'Principal'}</p>
          </div>
       </div>
    </div>
  );
}

function IDCardHorizontal({ student, settings, className, customColor, showLogo, headerText }: any) {
  return (
    <div className="w-[86mm] h-[54mm] bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col relative shadow-lg scale-125 transform origin-center print:scale-100">
       <div className="h-12 flex items-center px-4 text-white" style={{ backgroundColor: '#111827' }}>
          {showLogo && settings?.logoBase64 && (
            <img src={settings.logoBase64} alt="Logo" className="h-6 w-6 object-contain mr-3" />
          )}
          <p className="text-[10px] font-black tracking-widest uppercase">{settings?.name || 'Global Academy'}</p>
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
             <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{headerText || 'Enrollment Card'}</p>
             
             <div className="grid grid-cols-2 gap-y-2 mt-4">
                <div>
                   <p className="text-[5px] font-bold text-slate-300 uppercase">Class</p>
                   <p className="text-[9px] font-black text-slate-700">{className}</p>
                </div>
                <div>
                   <p className="text-[5px] font-bold text-slate-300 uppercase">Valid Thru</p>
                   <p className="text-[9px] font-black text-slate-700">MAR 2026</p>
                </div>
                <div className="col-span-2">
                   <p className="text-[5px] font-bold text-slate-300 uppercase">Emergency</p>
                   <p className="text-[9px] font-black text-slate-700">{student.fatherMobile || '+91 00000 00000'}</p>
                </div>
             </div>
          </div>
       </div>
       <div className="h-1 w-full" style={{ backgroundColor: customColor }}></div>
    </div>
  );
}

function processBodyText(text: string, student: any, className: string) {
  if (!text) return null;
  return text
    .replace(/\[Name\]/g, `${student.firstName} ${student.lastName}`)
    .replace(/\[AdmissionNo\]/g, student.admissionNo || '')
    .replace(/\[Class\]/g, className || '')
    .replace(/\[Session\]/g, student.academicYear || '2024-25');
}

function BonafideCertificate({ student, settings, className, section, customColor, showLogo, showAddress, paperSize, headerText, bodyText, footerLeft, footerRight }: any) {
  const isA4 = paperSize === 'A4';
  const processedBody = processBodyText(bodyText, student, className);

  return (
    <div 
      className={`bg-white p-12 flex flex-col border-[20px] border-slate-50 relative print:border-0 print:p-8 shadow-2xl origin-center 
      ${isA4 ? 'w-[210mm] min-h-[297mm] scale-[0.4]' : 'w-[210mm] min-h-[148mm] scale-[0.6]'}
      transform print:scale-100`}
    >
       <div className="text-center space-y-2 mb-10 border-b-2 border-slate-100 pb-8 relative">
          {showLogo && settings?.logoBase64 && (
            <img src={settings.logoBase64} alt="Logo" className="h-16 w-16 object-contain absolute left-0 top-0" />
          )}
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter" style={{ color: customColor }}>
            {settings?.name || 'GLOBAL EXCELLENCE INTERNATIONAL SCHOOL'}
          </h1>
          {settings?.tagline && <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">{settings.tagline}</p>}
          {showAddress && (
            <p className="text-xs text-slate-500 font-medium">
              {settings?.address}, {settings?.city}, {settings?.state} - {settings?.pinCode} | Phone: {settings?.phone}
            </p>
          )}
       </div>

       <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-800 underline underline-offset-8 uppercase tracking-[15px]">
            {headerText || 'Bonafide'}
          </h2>
       </div>

       <div className="flex-1 space-y-8 text-xl leading-relaxed text-slate-700 text-justify px-4">
          {processedBody ? (
            <p className="whitespace-pre-wrap">{processedBody}</p>
          ) : (
            <>
              <p>
                This is to certify that Master / Miss <span className="font-black text-slate-900 border-b border-slate-300 mx-1">{student.firstName} {student.lastName}</span>, 
                bearing Admission No. <span className="font-black text-slate-900 border-b border-slate-300 mx-1">{student.admissionNo}</span>, is a bonafide student 
                of this institution studying in Class <span className="font-black text-slate-900 border-b border-slate-300 mx-1">{className}</span> 
                {section && <span> Section <span className="font-black text-slate-900 border-b border-slate-300 mx-1">{section}</span></span>} 
                during the academic session <span className="font-black text-slate-900 border-b border-slate-300 mx-1">{student.academicYear || "2024-2025"}</span>.
              </p>
              <p>
              According to school records, {student.gender === 'Male' ? 'his' : 'her'} date of birth is 
              <span className="font-black text-slate-900 border-b border-slate-300 mx-1">{new Date(student.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>. 
              {student.gender === 'Male' ? 'He' : 'She'} bears a good moral character.
              </p>
            </>
          )}
       </div>

       <div className="mt-16 flex justify-between items-end">
          <div className="text-center">
             <div className="h-px w-40 bg-slate-300 mb-2"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase">{footerLeft || 'Class Teacher'}</p>
          </div>
          <div className="text-center">
             <div className="h-px w-40 bg-slate-900 mb-2"></div>
             <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{footerRight || 'Office Principal'}</p>
          </div>
       </div>
    </div>
  );
}

function OfficialCertificate({ title, student, settings, className, customColor, showLogo, bodyText, footerLeft, footerRight }: any) {
  const processedBody = processBodyText(bodyText, student, className);

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white p-20 flex flex-col border-[2px] border-slate-100 relative print:p-10 scale-[0.4] transform origin-top print:scale-100 shadow-2xl">
       <div className="text-center border-b-4 pb-10 mb-16 relative" style={{ borderColor: '#111827' }}>
          <div className="flex items-center justify-center gap-4 mb-3">
              {showLogo && settings?.logoBase64 ? (
                <img src={settings.logoBase64} alt="Logo" className="h-16 w-16 object-contain" />
              ) : (
                <GraduationCap className="h-12 w-12 text-slate-900" />
              )}
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter" style={{ color: customColor }}>
                {settings?.name || 'GLOBAL EXCELLENCE ACADEMY'}
              </h1>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{settings?.boardAffiliation || 'Authorized Educational Trust'} | Reg No: {settings?.affiliationNo || 'N/A'}</p>
       </div>

       <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-white inline-block px-12 py-4 rounded-3xl uppercase tracking-[12px]" style={{ backgroundColor: '#111827' }}>{title}</h2>
          <div className="flex justify-between items-end mt-10 px-4">
             <p className="text-sm font-bold text-slate-400 uppercase">SR NO: {student.admissionNo?.slice(-4)}</p>
             <p className="text-sm font-bold text-slate-400 uppercase">DATE: {new Date().toLocaleDateString()}</p>
          </div>
       </div>

       <div className="flex-1 space-y-12 text-2xl leading-[2] text-slate-700">
          {processedBody ? (
            <div className="whitespace-pre-wrap text-justify indent-16">{processedBody}</div>
          ) : (
            <>
              <div className="text-justify indent-16">
                Certified that <span className="font-black text-slate-900 uppercase border-b-2 border-slate-200">{student.firstName} {student.lastName}</span>
                {student.gender === 'Male' ? ' son ' : ' daughter '} of Shri <span className="font-bold text-slate-800 border-b-2 border-slate-200">{student.fatherName}</span>
                is a student of this school in <span className="font-bold text-slate-800 border-b-2 border-slate-200">{className}</span> class.
              </div>

              <div className="grid grid-cols-1 gap-8 px-12 italic text-slate-500">
                <p>This certificate is issued to certify {student.gender === 'Male' ? 'his' : 'her'} meritorious conduct and academic consistency during the session {student.academicYear || "2024-25"}.</p>
              </div>
            </>
          )}
       </div>

       <div className="mt-auto flex justify-between items-end border-t-2 border-slate-50 pt-16">
          <div className="text-center">
             <div className="h-px w-48 bg-slate-400 mb-3"></div>
             <p className="text-xs font-black text-slate-500 uppercase">{footerLeft || 'Verification Clerk'}</p>
          </div>
          <div className="text-center">
             <div className="h-px w-48 bg-slate-900 mb-3"></div>
             <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{footerRight || 'Head of Institution'}</p>
          </div>
       </div>
    </div>
  );
}
