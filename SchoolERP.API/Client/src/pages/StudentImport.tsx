import { useState, useRef, useEffect } from 'react';
import { 
  Upload, FileJson, Download, CheckCircle2, 
  AlertCircle, Loader2, Database, Trash2, 
  ChevronRight, Info, Filter, ArrowRight
} from 'lucide-react';
import { studentApi } from '../api/studentApi';
import { masterApi } from '../api/masterApi';

interface ImportRow {
  firstName: string;
  lastName: string;
  admissionNo: string;
  gender: string;
  dateOfBirth: string;
  fatherName: string;
  fatherMobile: string;
  classId: string;
  sectionId: string;
  // Dynamic validation status
  status: 'valid' | 'invalid' | 'warning';
  errors: string[];
}

export default function StudentImport() {
  const [step, setStep] = useState(1);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    masterApi.getAll('classes').then(setClasses);
    masterApi.getAll('sections').then(setSections);
  }, []);

  const downloadTemplate = () => {
    const template = [
      {
        admissionNo: "ADM001",
        firstName: "John",
        lastName: "Doe",
        gender: "Male",
        dateOfBirth: "2010-05-15",
        fatherName: "Richard Doe",
        fatherMobile: "9876543210",
        classId: classes[0]?.id || "GUID-HERE",
        sectionId: sections[0]?.id || "GUID-HERE"
      }
    ];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "student_import_template.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) throw new Error("File must be a JSON array of students.");
        
        const mapped = json.map((item: any) => {
          const errors: string[] = [];
          if (!item.firstName) errors.push("First name is missing");
          if (!item.admissionNo) errors.push("Admission no is missing");
          if (!item.classId) errors.push("Class ID is missing");
          
          return {
            ...item,
            status: errors.length > 0 ? 'invalid' : 'valid',
            errors
          };
        });

        setImportData(mapped);
        setStep(2);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const processImport = async () => {
    const validRows = importData.filter(r => r.status === 'valid');
    if (validRows.length === 0) return;

    setProcessing(true);
    try {
      await studentApi.bulkEnroll(validRows);
      setSuccess(true);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to process bulk import.");
    } finally {
      setProcessing(false);
    }
  };

  const removeItem = (index: number) => {
    setImportData(prev => prev.filter((_, i) => i !== index));
    if (importData.length <= 1) setStep(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-primary-600" />
            Bulk Student Onboarding
          </h1>
          <p className="text-sm text-slate-500 mt-1">Import hundreds of student records instantly via data files.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button onClick={downloadTemplate} className="btn-secondary flex items-center gap-2 py-2.5 px-5">
              <Download className="h-4 w-4" /> Download Format
           </button>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center py-6">
         <div className="flex items-center gap-4">
            <StepCircle num={1} active={step >= 1} label="Upload" />
            <div className={`h-1 w-12 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-slate-200'}`}></div>
            <StepCircle num={2} active={step >= 2} label="Analyze" />
            <div className={`h-1 w-12 rounded-full ${step >= 3 ? 'bg-primary-500' : 'bg-slate-200'}`}></div>
            <StepCircle num={3} active={step >= 3} label="Finish" />
         </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
           <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
           <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Step Components */}
      <div className="min-h-[400px]">
        
        {step === 1 && (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-slate-200 bg-slate-50/30">
             <div className="h-24 w-24 bg-white rounded-3xl shadow-xl flex items-center justify-center ring-8 ring-slate-50">
                <Upload className="h-10 w-10 text-primary-500" />
             </div>
             <div className="max-w-md space-y-2">
                <h2 className="text-xl font-bold text-slate-800">Ready to ingest data?</h2>
                <p className="text-slate-500 text-sm italic">Select your prepared JSON file containing student enrollment records. Ensure IDs for Class and Section match your system's master data.</p>
             </div>
             <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".json" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="btn-primary px-10 py-4 text-lg shadow-xl shadow-primary-500/30 flex items-center gap-3"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileJson className="h-5 w-5" />}
                  Browse JSON Data File
                </button>
             </div>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <Info className="h-3 w-3" /> Max recommended file size: 5MB
             </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                      <span className="text-xs font-bold text-indigo-700">{importData.length} records parsed</span>
                   </div>
                   <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-700">{importData.filter(r => r.status === 'valid').length} valid</span>
                   </div>
                   {importData.some(r => r.status === 'invalid') && (
                     <div className="bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
                        <span className="text-xs font-bold text-rose-700">{importData.filter(r => r.status === 'invalid').length} errors</span>
                     </div>
                   )}
                </div>
                <div className="flex items-center gap-3">
                   <button onClick={() => setStep(1)} className="btn-secondary py-2">Start Over</button>
                   <button 
                    onClick={processImport} 
                    disabled={processing || importData.filter(r => r.status === 'valid').length === 0}
                    className="btn-primary py-2.5 px-8 flex items-center gap-2 shadow-lg shadow-primary-500/20"
                   >
                     {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                     Process Enrollment
                   </button>
                </div>
             </div>

             <div className="glass-card shadow-xl overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <tr>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4">Student Name</th>
                         <th className="px-6 py-4">Admission #</th>
                         <th className="px-6 py-4">Father Name</th>
                         <th className="px-6 py-4">Details</th>
                         <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {importData.map((row, idx) => (
                         <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${row.status === 'invalid' ? 'bg-red-50/20' : ''}`}>
                            <td className="px-6 py-4">
                               {row.status === 'valid' ? (
                                 <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100">
                                    <CheckCircle2 className="h-3 w-3" /> Valid
                                 </div>
                               ) : (
                                 <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 w-fit px-2 py-0.5 rounded-full text-[10px] font-bold border border-rose-100">
                                    <AlertCircle className="h-3 w-3" /> Error
                                 </div>
                               )}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-800">{row.firstName} {row.lastName}</td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{row.admissionNo}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{row.fatherName}</td>
                            <td className="px-6 py-4">
                               {row.status === 'invalid' ? (
                                 <span className="text-[10px] text-rose-500 font-medium italic">{row.errors.join(', ')}</span>
                               ) : (
                                 <span className="text-[10px] text-slate-400">Class: {row.classId.substring(0,8)}...</span>
                               )}
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button onClick={() => removeItem(idx)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                  <Trash2 className="h-4 w-4" />
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {step === 3 && (
           <div className="glass-card p-16 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95">
              <div className="h-24 w-24 bg-emerald-500 rounded-full shadow-2xl flex items-center justify-center ring-8 ring-emerald-50">
                 <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Onboarding Complete!</h2>
                 <p className="text-slate-500 max-w-sm">All valid student records have been synchronized and enrolled into the system successfully.</p>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => window.location.href='/students'} className="btn-primary px-8 flex items-center gap-2">
                    <Filter className="h-4 w-4" /> View Directory
                 </button>
                 <button onClick={() => { setStep(1); setImportData([]); setSuccess(false); }} className="btn-secondary px-8">
                    Import More
                 </button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}

function StepCircle({ num, active, label }: { num: number, active: boolean, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
       <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
         active ? 'bg-primary-600 text-white shadow-lg ring-4 ring-primary-100' : 'bg-slate-100 text-slate-400'
       }`}>
          {num}
       </div>
       <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-primary-600' : 'text-slate-400'}`}>{label}</span>
    </div>
  );
}
