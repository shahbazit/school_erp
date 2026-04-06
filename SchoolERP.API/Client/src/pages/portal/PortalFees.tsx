import { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Wallet, DollarSign, Calendar, Clock, 
  CheckCircle2, AlertCircle, TrendingDown, 
  Download, CreditCard, ChevronRight, History
} from 'lucide-react';
import { studentPortalApi, LinkedStudent, FeeSummary } from '../../api/studentPortalApi';
import { useLocalization } from '../../contexts/LocalizationContext';
import { usePortal } from '../../contexts/PortalContext';
import { masterApi } from '../../api/masterApi';
import { financeApi } from '../../api/financeApi';

export default function PortalFees() {
  const { formatCurrency, formatDate } = useLocalization();
  const { selectedWard, loading: wardsLoading } = usePortal();
  const [feeData, setFeeData] = useState<FeeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  useEffect(() => {
    masterApi.getAll('academic-years').then(setAcademicYears).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchFees = async () => {
      if (!selectedWard) return;
      try {
        setRefreshing(true);
        const data = await studentPortalApi.getStudentFees(selectedWard.id);
        setFeeData(data);
      } catch (err) {
        console.error("PortalFees: Failed to fetch fees", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    fetchFees();
  }, [selectedWard]);

  const handlePaymentSuccess = () => {
      setIsPayModalOpen(false);
      // Re-trigger fetchFees via reloading if needed, but selectedWard is already in dependency array.
      // Easiest is to just re-fetch manually here.
      if (selectedWard) {
          studentPortalApi.getStudentFees(selectedWard.id).then(setFeeData).catch(console.error);
      }
  };

  if (loading || wardsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 tracking-tight">Loading financial ledger...</p>
        </div>
      </div>
    );
  }

  if (!selectedWard) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <Wallet className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No linked students found</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
          We couldn't find any financial records linked to your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 🔴 HEADER & INFO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <button 
             onClick={() => window.history.back()}
             className="flex items-center text-slate-500 hover:text-blue-500 font-bold text-[10px] uppercase tracking-widest mb-2 transition-colors group"
           >
             <ArrowLeft className="h-3 w-3 mr-1.5 group-hover:-translate-x-1 transition-transform" />
             Back to Dashboard
           </button>
           <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fee Ledger & Payments</h1>
        </div>
      </div>

      {/* 🟡 STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <DollarSign className="h-24 w-24 text-slate-900" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Payable</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(feeData?.summary.totalAllocated ?? 0)}</p>
            <div className="flex items-center gap-1.5 mt-2.5">
               <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">Current Session</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <CheckCircle2 className="h-24 w-24 text-blue-800" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5">Paid Amount</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(feeData?.summary.totalPaid ?? 0)}</p>
            <div className="flex items-center gap-1.5 mt-2.5">
               <TrendingDown className="h-3 w-3 text-blue-500" />
               <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">
                 {Math.round(((feeData?.summary.totalPaid ?? 0) / (feeData?.summary.totalAllocated ?? 1)) * 100)}% Cleared
               </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 shadow-sm shadow-blue-500/5 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Wallet className="h-24 w-24 text-blue-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5">Net Oustanding</p>
            <p className="text-3xl font-black text-blue-500 tracking-tight">{formatCurrency(feeData?.summary.balance ?? 0)}</p>
            
            <div className="mt-auto pt-4 flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                 <AlertCircle className="h-3.5 w-3.5 text-blue-400" />
                 <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">Payment Due</span>
               </div>
               <button 
                 onClick={() => setIsPayModalOpen(true)}
                 className="bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
               >
                 Pay Now
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 TRANSACTIONS & DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Transaction History */}
        <div className="lg:col-span-8 space-y-6">
           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-50 rounded-2xl flex items-center justify-center">
                    <History className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Transaction History</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Verified receipts & debits</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                  <Download className="h-5 w-5" />
                </button>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50/50 border-b border-slate-50">
                   <tr>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {feeData?.transactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <p className="text-sm font-medium text-slate-400 italic">No transactions recorded yet.</p>
                        </td>
                      </tr>
                    ) : (
                      feeData?.transactions.map((t, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-slate-700">{formatDate(t.transactionDate)}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Verified</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {t.amount > 0 ? (
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-rose-500" />
                              )}
                              <p className="text-xs font-bold text-slate-800">{t.note || 'Academic Fee Payment'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                               {t.paymentMethod}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className={`text-sm font-black ${t.amount > 0 ? 'text-blue-600' : 'text-slate-800'}`}>
                              {formatCurrency(t.amount)}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                 </tbody>
               </table>
             </div>
           </div>
        </div>

        {/* Right: Payment Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
           {/* Quick Action Payment */}
           <div className="bg-white rounded-3xl p-6 text-slate-800 shadow-md border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-blue-500">Payment Central</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Secure Online Gateway</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Base Outstanding</span>
                    <span className="text-sm font-black text-slate-800">{formatCurrency(feeData?.summary.balance ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Convenience Fee</span>
                    <span className="text-sm font-black text-blue-400">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-800 font-black uppercase tracking-widest">Total to Pay</span>
                    <span className="text-xl font-black text-blue-500">{formatCurrency(feeData?.summary.balance ?? 0)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsPayModalOpen(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                   Proceed to Payment
                   <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
           </div>

           {/* Fee Breakdown Info */}
           <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Important Note</h4>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Fees once paid are non-refundable. Please ensure you are paying for the correct student and session. For any discrepancies in the ledger, please contact the school accounts office immediately.
              </p>
           </div>
        </div>

      </div>

      {/* 🔵 MODALS */}
      {isPayModalOpen && selectedWard && (
        <PayFeeModal 
          studentId={selectedWard.id}
          studentName={`${selectedWard.firstName} ${selectedWard.lastName}`}
          balance={feeData?.summary.balance ?? 0}
          academicYears={academicYears}
          onClose={() => setIsPayModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}



function PayFeeModal({ studentId, studentName, balance, academicYears, onClose, onSuccess }: any) {
  const { formatCurrency, settings } = useLocalization();
  const currentYear = academicYears.find((y: any) => y.isCurrent);
  
  const [financialAccounts, setFinancialAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: balance,
    discount: 0,
    academicYearId: currentYear?.id || '',
    paymentMethod: 'Online',
    referenceNumber: '',
    remarks: 'Online Payment via Portal',
    financialAccountId: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    financeApi.listAccounts().then(res => {
      const activeAccounts = res.data.filter((a: any) => a.isActive);
      setFinancialAccounts(activeAccounts);
      // Try to find a digital/online account
      const onlineAcc = activeAccounts.find((a: any) => 
        a.name.toLowerCase().includes('online') || 
        a.name.toLowerCase().includes('bank') ||
        a.name.toLowerCase().includes('digital')
      );
      if (onlineAcc) {
        setFormData(prev => ({ ...prev, financialAccountId: onlineAcc.id || '' }));
      } else if (activeAccounts.length > 0) {
        setFormData(prev => ({ ...prev, financialAccountId: activeAccounts[0].id || '' }));
      }
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.academicYearId) {
      alert('Please select an Academic Year');
      return;
    }
    setLoading(true);
    try {
      await masterApi.create('fee/process-payment', {
        ...formData,
        studentId
      });
      onSuccess();
    } catch (err) {
      alert('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white shadow-2xl w-full sm:w-[450px] h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-slate-200">
        <div className="bg-blue-500 p-8 text-white text-center shrink-0">
          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-90 animate-pulse" />
          <h2 className="text-2xl font-black tracking-tight">Make a Payment</h2>
          <p className="text-blue-100 text-sm font-medium mt-1">Paying for: {studentName}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar pb-24">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center justify-center gap-1 mb-6">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Outstanding</span>
            <span className="text-3xl font-black text-blue-600 tracking-tight">{formatCurrency(balance)}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Academic Session</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400"
                required
                value={formData.academicYearId}
                onChange={(e) => setFormData({...formData, academicYearId: e.target.value})}
              >
                 <option value="">Select Session...</option>
                 {academicYears.map((y: any) => (
                    <option key={y.id} value={y.id}>{y.name} {y.isCurrent ? '(Current)' : ''}</option>
                 ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Amount to Pay ({settings?.currencySymbol || "₹"})</label>
              <input 
                type="number" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Reference (Optional)</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400"
                placeholder="UPI ID or Transaction Reference"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
              />
            </div>
            
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
               <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
               <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                 By clicking confirm, you agree to the terms of payment. Please do not refresh the page during transaction.
               </p>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] bg-blue-500 hover:bg-blue-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-[10px] font-black uppercase tracking-[0.2em]"
            >
              {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                <>Confirm & Pay <ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
