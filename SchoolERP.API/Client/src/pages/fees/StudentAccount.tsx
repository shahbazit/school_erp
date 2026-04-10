import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Plus,
  Calendar,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Settings,
  History,
  CreditCard
} from 'lucide-react';
import { masterApi } from '../../api/masterApi';
import { financeApi } from '../../api/financeApi';
import { useLocalization } from '../../contexts/LocalizationContext';

interface Transaction {
  id: string;
  transactionDate: string;
  type: 'Charge' | 'Payment' | 'Discount' | 'Refund';
  amount: number;
  description: string;
  referenceNumber?: string;
  paymentMethod?: string;
}

interface StudentAccount {
  studentId: string;
  studentName: string;
  totalAllocated: number;
  totalPaid: number;
  totalDiscount: number;
  currentBalance: number;
  lastTransactionDate: string;
  transactions: Transaction[];
}

export default function StudentAccount() {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const { studentId } = useParams<{ studentId: string }>();
  const [account, setAccount] = useState<StudentAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isExtraChargeModalOpen, setIsExtraChargeModalOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [selectiveHeads, setSelectiveHeads] = useState<any[]>([]);
  const [assignedDiscounts, setAssignedDiscounts] = useState<any[]>([]);
  const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const [accountData, subsData, headsData, discData, allDiscs, yearsData] = await Promise.all([
        masterApi.getAll(`fee/student-account/${studentId}`),
        masterApi.getAll(`fee/student-subscriptions/${studentId}`),
        masterApi.getAll('fee/heads'),
        masterApi.getAll(`fee/student-discounts/${studentId}`),
        masterApi.getAll('fee/discounts'),
        masterApi.getAll('academic-years')
      ]);
      setAccount(accountData as any);
      setSubscriptions((subsData as any[]).map((sub: any) => ({
        ...sub,
        isSystemManaged: sub.feeHeadName?.toLowerCase().includes('transport') || 
                         sub.feeHeadName?.toLowerCase().includes('hostel') || 
                         sub.feeHeadName?.toLowerCase().includes('bus')
      })));
      const moduleLockedHeads = ['Transport', 'Hostel', 'Bus'];
      setSelectiveHeads((headsData as any[]).filter(h => 
        h.isSelective && !moduleLockedHeads.some(locked => h.name.includes(locked))
      ));
      setAssignedDiscounts(discData as any[]);
      setAvailableDiscounts(allDiscs as any[]);
      setAcademicYears(yearsData as any[]);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to fetch account details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, [studentId]);

  if (loading && !account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 text-center max-w-2xl mx-auto mt-10">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">Account Error</h2>
        <p className="mb-6">{error || 'Student account not found'}</p>
        <Link to="/students" className="btn-primary inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-slate-500 hover:text-primary-600 font-medium text-sm mb-2 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-base">
              {account.studentName.charAt(0)}
            </div>
            {account.studentName}'s Fee Ledger
          </h1>
        </div>
        
        <div className="flex gap-2">
          <button className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Statement
          </button>
          <button 
            onClick={() => setIsPayModalOpen(true)}
            className="btn-primary shadow-lg shadow-primary-500/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Collect Payment
          </button>
          <button 
            onClick={() => setIsExtraChargeModalOpen(true)}
            className="btn-secondary !bg-amber-50 !text-amber-700 !border-amber-200 hover:!bg-amber-100"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Charge
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 bg-gradient-to-br from-white to-slate-50 border-l-4 border-l-blue-500 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp className="h-24 w-24 text-blue-900" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Allocated</p>
            <p className="text-2xl font-black text-slate-800">{formatCurrency(account.totalAllocated)}</p>
            <p className="text-xs text-slate-400 mt-2 flex items-center">
              <Calendar className="h-3 w-3 mr-1" /> Lifetime billing
            </p>
          </div>
        </div>

        <div className="glass-card p-6 bg-gradient-to-br from-white to-emerald-50 border-l-4 border-l-emerald-500 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <CheckCircle2 className="h-24 w-24 text-emerald-900" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-emerald-600/70">Total Paid</p>
            <p className="text-2xl font-black text-slate-800">{formatCurrency(account.totalPaid)}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" /> {((account.totalPaid / (account.totalAllocated || 1)) * 100).toFixed(1)}% cleared
            </p>
          </div>
        </div>

        <div className="glass-card p-6 bg-gradient-to-br from-white to-red-50 border-l-4 border-l-red-500 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Wallet className="h-24 w-24 text-red-900" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-red-600/70">Net Outstanding</p>
            <p className="text-2xl font-black text-red-600">{formatCurrency(account.currentBalance)}</p>
            <p className="text-xs text-red-500 font-semibold mt-2 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> Payment due
            </p>
          </div>
        </div>
      </div>

      {/* Subscriptions & Discounts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscriptions */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary-600" />
              <h3 className="font-bold text-slate-700">Selective Fee Subscriptions</h3>
            </div>
          </div>
          <div className="p-0">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-400 border-b border-slate-100 tracking-widest">
                <tr>
                  <th className="px-6 py-3">Fee Head</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">No selective fees subscribed.</td>
                  </tr>
                ) : (
                  subscriptions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">{sub.feeHeadName}</span>
                          {sub.isSystemManaged && (
                            <span className="text-[9px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">System</span>
                          )}
                        </div>
                        {sub.isSystemManaged && (
                          <p className="text-[10px] text-slate-400 font-medium">Auto-synced from service module</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-slate-800 font-bold">{sub.customAmount ? formatCurrency(sub.customAmount) : 'Default rate'}</p>
                         <p className="text-[10px] text-slate-400">Monthly billing</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Active</span>
                           {sub.isSystemManaged && <ServiceLink type={sub.feeHeadName} />}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assigned Discounts */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-slate-700">Applied Discounts</h3>
            </div>
          </div>
          <div className="p-0">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-400 border-b border-slate-100 tracking-widest">
                <tr>
                  <th className="px-6 py-3">Benefit Name</th>
                  <th className="px-6 py-3">Value</th>
                  <th className="px-6 py-3">Applied To</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assignedDiscounts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">No discounts assigned.</td>
                  </tr>
                ) : (
                  assignedDiscounts.map((ad: any) => (
                    <tr key={ad.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {ad.discountName}
                        <p className="text-[10px] text-slate-400">{ad.category}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-emerald-600">
                          {ad.calculationType === 'Percentage' ? `${ad.value}%` : formatCurrency(ad.value)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">({ad.frequency})</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium ${ad.restrictedFeeHeadName === 'All Monthly Fees' ? 'text-slate-400' : 'text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100'}`}>
                          {ad.restrictedFeeHeadName || 'All Monthly Fees'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2 py-1 rounded">Applied</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-400" />
            <h3 className="font-bold text-slate-700">Transaction History</h3>
          </div>
          <div className="text-xs font-medium text-slate-400">
            Last Updated: {formatDate(account.lastTransactionDate)}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white uppercase text-[10px] font-bold text-slate-400 border-b border-slate-100 tracking-widest">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {account.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                account.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                        tx.type === 'Charge' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        tx.type === 'Payment' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        tx.type === 'Discount' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {formatDate(tx.transactionDate)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 font-semibold">{tx.description}</p>
                      {tx.paymentMethod && <p className="text-[10px] text-slate-400 font-medium tracking-wide">via {tx.paymentMethod}</p>}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {tx.referenceNumber || '—'}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold tabular-nums ${
                      tx.type === 'Charge' ? 'text-slate-700' : 'text-emerald-600'
                    }`}>
                      {tx.type === 'Charge' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Fee Modal - Simplified inline for now, but should be professional */}
      {isPayModalOpen && (
        <PayFeeModal 
          studentId={account.studentId} 
          studentName={account.studentName}
          balance={account.currentBalance}
          academicYears={academicYears}
          onClose={() => setIsPayModalOpen(false)}
          onSuccess={() => {
            setIsPayModalOpen(false);
            fetchAccount();
          }}
        />
      )}
      {isSubModalOpen && (
        <SubscriptionModal 
          studentId={account.studentId}
          selectiveHeads={selectiveHeads}
          existingSubscriptions={subscriptions}
          onClose={() => setIsSubModalOpen(false)}
          onSuccess={() => {
            setIsSubModalOpen(false);
            fetchAccount();
          }}
        />
      )}

      {isDiscountModalOpen && (
        <DiscountModal 
          studentId={account.studentId}
          availableDiscounts={availableDiscounts}
          feeHeads={selectiveHeads}
          academicYears={academicYears}
          onClose={() => setIsDiscountModalOpen(false)}
          onSuccess={() => {
            setIsDiscountModalOpen(false);
            fetchAccount();
          }}
        />
      )}

      {isExtraChargeModalOpen && (
        <ExtraChargeModal 
          studentId={account.studentId}
          academicYears={academicYears}
          onClose={() => setIsExtraChargeModalOpen(false)}
          onSuccess={() => {
            setIsExtraChargeModalOpen(false);
            fetchAccount();
          }}
        />
      )}
    </div>
  );
}

function ExtraChargeModal({ studentId, academicYears, onClose, onSuccess }: any) {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const currentYear = academicYears.find((y: any) => y.isCurrent);
  const [formData, setFormData] = useState({
    amount: '',
    chargeType: 'Library Fine',
    academicYearId: currentYear?.id || '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentYear && !formData.academicYearId) {
      setFormData(prev => ({ ...prev, academicYearId: currentYear.id }));
    }
  }, [currentYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.academicYearId || !formData.amount) return;
    
    setLoading(true);
    try {
      await masterApi.create('fee/add-extra-charge', {
        ...formData,
        amount: Number(formData.amount),
        studentId
      });
      onSuccess();
    } catch (err) {
      alert('Failed to add extra charge');
    } finally {
      setLoading(false);
    }
  };

  const chargeTypes = [
    'Library Fine', 
    'Uniform Charge', 
    'ID Card Fee', 
    'Late Fine', 
    'Exam Fine', 
    'Lab Breakage', 
    'Document Processing',
    'Miscellaneous'
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative bg-white shadow-2xl w-full max-w-md rounded-2xl overflow-hidden animate-in zoom-in-95">
        <div className="bg-amber-600 p-6 text-white text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-80" />
          <h2 className="text-xl font-bold">Add Extra Charge</h2>
          <p className="text-amber-50 text-xs">Post a manual debit to student's account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Academic Year</label>
            <select 
              className="form-input"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Charge Type</label>
              <select 
                className="form-input"
                required
                value={formData.chargeType}
                onChange={(e) => setFormData({...formData, chargeType: e.target.value})}
              >
                {chargeTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{settings?.currencySymbol || "₹"}</span>
                <input 
                  type="number" 
                  required
                  className="form-input pl-7"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Remarks / Comment</label>
            <textarea 
              className="form-input min-h-[80px]"
              value={formData.remarks}
              onChange={(e) => setFormData({...formData, remarks: e.target.value})}
              placeholder="Detailed reason for this charge..."
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
            <button 
              type="submit" 
              disabled={loading || !formData.amount}
              className="btn-primary flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 flex justify-center items-center"
            >
              {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Charge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DiscountModal({ studentId, availableDiscounts, feeHeads, academicYears, onClose, onSuccess }: any) {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const currentYear = academicYears.find((y: any) => y.isCurrent);
  
  const [formData, setFormData] = useState({
    feeDiscountId: '',
    feeHeadIds: [] as string[],
    academicYearId: currentYear?.id || '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);

  // Sync year if it loads late
  useEffect(() => {
    if (currentYear && !formData.academicYearId) {
      setFormData(prev => ({ ...prev, academicYearId: currentYear.id }));
    }
  }, [currentYear]);

  const toggleFeeHead = (id: string) => {
    setFormData(prev => ({
      ...prev,
      feeHeadIds: prev.feeHeadIds.includes(id) 
        ? prev.feeHeadIds.filter(fid => fid !== id)
        : [...prev.feeHeadIds, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.academicYearId) {
      alert('Please select an Academic Year');
      return;
    }
    setLoading(true);
    try {
      await masterApi.create('fee/discounts/assign', {
        ...formData,
        studentId,
        // If no specifically selected heads, it stays as empty array which the backend handles as "All" 
        // OR we can explicitly pass null. Let's keep array and let backend handle it.
      });
      onSuccess();
    } catch (err) {
      alert('Failed to assign discount');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative bg-white shadow-2xl w-full max-w-md rounded-2xl overflow-hidden animate-in zoom-in-95">
        <div className="bg-emerald-600 p-6 text-white text-center">
          <TrendingDown className="h-8 w-8 mx-auto mb-2 opacity-80" />
          <h2 className="text-xl font-bold">Assign Discount</h2>
          <p className="text-emerald-50 text-xs opacity-80">Reduce fee liability for this student</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Academic Year</label>
            <select 
              className="form-input"
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
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Select Discount Type</label>
            <select 
              className="form-input"
              required
              value={formData.feeDiscountId}
              onChange={(e) => setFormData({...formData, feeDiscountId: e.target.value})}
            >
              <option value="">Choose Discount...</option>
              {availableDiscounts.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name} ({d.calculationType === 'Percentage' ? `${d.value}%` : formatCurrency(d.value)})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Apply To Fee Heads</label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-[160px] overflow-y-auto space-y-2 custom-scrollbar">
              <label className="flex items-center gap-2 p-1 hover:bg-white rounded transition-colors cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={formData.feeHeadIds.length === 0}
                  onChange={() => setFormData({...formData, feeHeadIds: []})}
                  className="h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className={`text-sm ${formData.feeHeadIds.length === 0 ? 'font-bold text-emerald-700' : 'text-slate-600'}`}>All Monthly Fees</span>
              </label>
              <div className="border-t border-slate-100 my-1 pt-1">
                {feeHeads.map((h: any) => (
                  <label key={h.id} className="flex items-center gap-2 p-1 hover:bg-white rounded transition-colors cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.feeHeadIds.includes(h.id)}
                      onChange={() => toggleFeeHead(h.id)}
                      className="h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <span className={`text-sm ${formData.feeHeadIds.includes(h.id) ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{h.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 italic">Selecting nothing applies the discount to all standard fees.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Remarks</label>
            <textarea 
              className="form-input min-h-[60px]"
              value={formData.remarks}
              onChange={(e) => setFormData({...formData, remarks: e.target.value})}
              placeholder="Reason for discount..."
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
            <button 
              type="submit" 
              disabled={loading || !formData.feeDiscountId}
              className="btn-primary flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 flex justify-center items-center"
            >
              {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Apply Discount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubscriptionModal({ studentId, selectiveHeads, existingSubscriptions, onClose, onSuccess }: any) {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const [formData, setFormData] = useState({
    feeHeadId: '',
    customAmount: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  // Filter out already subscribed fee heads
  const availableHeads = selectiveHeads.filter(
    (h: any) => !existingSubscriptions.some((s: any) => s.feeHeadId === h.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.feeHeadId) return;
    
    setLoading(true);
    try {
      await masterApi.create('fee/student-subscriptions', {
        studentId,
        feeHeadId: formData.feeHeadId,
        customAmount: formData.customAmount ? Number(formData.customAmount) : null,
        isActive: formData.isActive
      });
      onSuccess();
    } catch (err) {
      alert('Failed to add subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative bg-white shadow-2xl w-full max-w-md rounded-2xl overflow-hidden animate-in zoom-in-95">
        <div className="bg-primary-600 p-6 text-white text-center">
          <Settings className="h-8 w-8 mx-auto mb-2 opacity-80" />
          <h2 className="text-xl font-bold">New Subscription</h2>
          <p className="text-primary-100 text-xs">Setup selective/elective fee for student</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fee Head</label>
            <select 
              className="form-input"
              required
              value={formData.feeHeadId}
              onChange={(e) => setFormData({...formData, feeHeadId: e.target.value})}
            >
              <option value="">Select Fee Head</option>
              {availableHeads.map((h: any) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Custom Amount (Optional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{settings?.currencySymbol || "₹"}</span>
              <input 
                type="number" 
                className="form-input pl-7"
                placeholder="Leave blank for standard amount"
                value={formData.customAmount}
                onChange={(e) => setFormData({...formData, customAmount: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox"
              id="sub-active"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="sub-active" className="text-sm font-medium text-slate-700">Set as Active Subscription</label>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
            <button 
              type="submit" 
              disabled={loading || !formData.feeHeadId}
              className="btn-primary flex-1 py-2.5 flex justify-center items-center"
            >
              {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Subscribe Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sub-component for Payment
function PayFeeModal({ studentId, studentName, balance, academicYears, onClose, onSuccess }: any) {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const currentYear = academicYears.find((y: any) => y.isCurrent);
  
  const [financialAccounts, setFinancialAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: balance,
    discount: 0,
    academicYearId: currentYear?.id || '',
    paymentMethod: 'Cash',
    referenceNumber: '',
    remarks: '',
    financialAccountId: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    financeApi.listAccounts().then(res => {
      setFinancialAccounts(res.data.filter((a: any) => a.isActive));
    }).catch(console.error);
  }, []);

  // Sync state if currentYear loads after modal opens
  useEffect(() => {
    if (currentYear && !formData.academicYearId) {
      setFormData(prev => ({ ...prev, academicYearId: currentYear.id }));
    }
  }, [currentYear]);

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
    <div className="fixed inset-0 z-[9999] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white shadow-2xl w-full sm:w-[450px] h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-slate-200">
        <div className="bg-primary-600 p-8 text-white text-center shrink-0">
          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-90 animate-pulse" />
          <h2 className="text-2xl font-black tracking-tight">Collect Payment</h2>
          <p className="text-primary-100 text-sm font-medium mt-1">Student: {studentName}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar pb-24">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center mb-6">
            <span className="text-sm font-semibold text-slate-500">Net Outstanding</span>
            <span className="text-xl font-black text-slate-800">{formatCurrency(balance)}</span>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Payment Academic Year</label>
            <select 
              className="form-input"
              required
              value={formData.academicYearId}
              onChange={(e) => setFormData({...formData, academicYearId: e.target.value})}
            >
               <option value="">Select Session...</option>
               {academicYears.map((y: any) => (
                  <option key={y.id} value={y.id}>{y.name} {y.isCurrent ? '(Current)' : ''}</option>
               ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1 italic">Tying payments to academic sessions is essential for yearly accounting.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Paid Amount</label>
              <input 
                type="number" 
                required
                className="form-input"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Discount</label>
              <input 
                type="number" 
                className="form-input"
                value={formData.discount}
                onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Payment Method</label>
            <select 
              className="form-input"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Online">Online / UPI</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Receiving Account / Person</label>
            <select 
              className="form-input border-amber-200 focus:border-amber-400 bg-amber-50/10"
              required
              value={formData.financialAccountId}
              onChange={(e) => setFormData({...formData, financialAccountId: e.target.value})}
            >
              <option value="">-- Select Receiving Account --</option>
              {financialAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.accountType})</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1 ml-1 italic">* Ensure you are collecting into your assigned counter.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Reference No.</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="Receipt or Transaction ID"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 px-4">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary flex-[2] bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 py-3 px-4 flex justify-center items-center"
            >
              {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ServiceLink({ type }: { type: string }) {
  const isTransport = type.toLowerCase().includes('transport');
  const isHostel = type.toLowerCase().includes('hostel');
  
  if (!isTransport && !isHostel) return null;
  
  return (
    <Link 
      to={isTransport ? "/transport" : "/hostel"} 
      className="text-[9px] font-bold text-primary-600 hover:text-primary-700 underline flex items-center gap-1 mt-1"
    >
      Manage {isTransport ? 'Route' : 'Room'}
    </Link>
  );
}
