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
  const { studentId } = useParams<{ studentId: string }>();
  const [account, setAccount] = useState<StudentAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
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
      setSubscriptions(subsData as any[]);
      setSelectiveHeads((headsData as any[]).filter(h => h.isSelective));
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
            <p className="text-2xl font-black text-slate-800">₹{account.totalAllocated.toLocaleString()}</p>
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
            <p className="text-2xl font-black text-slate-800">₹{account.totalPaid.toLocaleString()}</p>
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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-red-600/70">Net Balance</p>
            <p className="text-2xl font-black text-red-600">₹{account.currentBalance.toLocaleString()}</p>
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
                    <tr key={sub.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-700">{sub.feeHeadName}</td>
                      <td className="px-6 py-4 text-slate-500">{sub.customAmount ? `₹${sub.customAmount}` : 'Default'}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Active</span>
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
                          {ad.calculationType === 'Percentage' ? `${ad.value}%` : `₹${ad.value}`}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">({ad.frequency})</span>
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
            Last Updated: {new Date(account.lastTransactionDate).toLocaleDateString()}
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
                      {new Date(tx.transactionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
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
                      {tx.type === 'Charge' ? '+' : '-'}₹{tx.amount.toLocaleString()}
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
    </div>
  );
}

function DiscountModal({ studentId, availableDiscounts, feeHeads, academicYears, onClose, onSuccess }: any) {
  const currentYear = academicYears.find((y: any) => y.isCurrent);
  
  const [formData, setFormData] = useState({
    feeDiscountId: '',
    feeHeadId: '',
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
        studentId
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
                <option key={d.id} value={d.id}>{d.name} ({d.calculationType === 'Percentage' ? `${d.value}%` : `₹${d.value}`})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fee Head (Optional)</label>
            <select 
              className="form-input"
              value={formData.feeHeadId}
              onChange={(e) => setFormData({...formData, feeHeadId: e.target.value})}
            >
              <option value="">All Monthly Fees</option>
              {feeHeads.map((h: any) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1 italic">Limit discount to a specific fee head (e.g., Computer Fee only)</p>
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
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
function PayFeeModal({ studentId, studentName, balance, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    amount: balance,
    discount: 0,
    paymentMethod: 'Cash',
    referenceNumber: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="fixed inset-0 z-[110] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white shadow-2xl w-full lg:w-[60%] h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        <div className="bg-primary-600 p-6 text-white text-center">
          <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-80" />
          <h2 className="text-xl font-bold">Collect Fee Payment</h2>
          <p className="text-primary-100 text-sm opacity-80">For {studentName}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center mb-6">
            <span className="text-sm font-semibold text-slate-500">Net Outstanding</span>
            <span className="text-xl font-black text-slate-800">₹{balance.toLocaleString()}</span>
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
