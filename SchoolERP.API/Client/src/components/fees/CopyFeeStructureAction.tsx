import { useState, useEffect } from 'react';
import { Copy, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { masterApi } from '../../api/masterApi';
import { feeApi } from '../../api/feeApi';
import { GenericModal } from '../GenericModal';

interface Props {
  onSuccess: () => void;
}

export function CopyFeeStructureAction({ onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [error, setError] = useState<string | null>(null);
  
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [fromYearId, setFromYearId] = useState('');
  const [toYearId, setToYearId] = useState('');

  useEffect(() => {
    if (isOpen) {
      masterApi.getAll('academic-years').then(setAcademicYears).catch(console.error);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    if (!fromYearId || !toYearId) {
       setError("Please select both source and target sessions.");
       setStatus('ERROR');
       return;
    }
    if (fromYearId === toYearId) {
        setError("Source and Target sessions cannot be the same.");
        setStatus('ERROR');
        return;
    }

    setLoading(true);
    setError(null);
    setStatus('IDLE');
    try {
      await feeApi.copyStructures(fromYearId, toYearId);
      setStatus('SUCCESS');
      onSuccess();
      setTimeout(() => setIsOpen(false), 2000);
    } catch (err: any) {
      setError(err.response?.data || "Failed to copy structures.");
      setStatus('ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 hover:bg-amber-100 transition-all font-semibold text-sm"
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy from Session
      </button>

      <GenericModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Copy Fee Structure"
      >
        <div className="space-y-6">
           <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-tight">
                This will duplicate all fee assignments (Heads to Classes) from the source session to the target session. 
                Existing assignments in the target session will be <b>replaced</b>.
              </p>
           </div>

           <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block ml-1">Copy From (Source)</label>
                <select 
                  value={fromYearId} 
                  onChange={e => setFromYearId(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select Source Session...</option>
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.name} {y.isCurrent ? '(Current)' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block ml-1">Paste into (Target)</label>
                <select 
                  value={toYearId} 
                  onChange={e => setToYearId(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select Target Session...</option>
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.name} {y.isCurrent ? '(Current)' : ''}</option>
                  ))}
                </select>
              </div>
           </div>

           {status === 'SUCCESS' && (
             <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 text-sm font-bold">
               <CheckCircle2 className="h-4 w-4" /> Structure Copied Successfully!
             </div>
           )}

           {status === 'ERROR' && (
             <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm font-bold">
                <AlertCircle className="h-4 w-4" /> {error}
             </div>
           )}

           <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-all text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleCopy}
                disabled={loading || !fromYearId || !toYearId}
                className="flex-2 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 px-8 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                Duplicate Structure
              </button>
           </div>
        </div>
      </GenericModal>
    </>
  );
}
