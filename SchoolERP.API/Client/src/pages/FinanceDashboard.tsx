import React, { useEffect, useState } from 'react';
import { financeApi, AccountSummary, TransactionDetail } from '../api/financeApi';
import { masterApi } from '../api/masterApi';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  Search,
  Filter,
  User,
  Edit2,
  Trash2,
  Plus,
  TrendingUp
} from 'lucide-react';

const FinanceDashboard: React.FC = () => {
  const [summaries, setSummaries] = useState<AccountSummary[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountSummary | null>(null);
  const [ledger, setLedger] = useState<TransactionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountSummary | null>(null);
  const [saving, setSaving] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    accountType: 'Cash',
    description: '',
    ownerEmployeeId: '',
    isActive: true
  });
  const [transferData, setTransferData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    remarks: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [years, staff] = await Promise.all([
        masterApi.getAcademicYears(),
        masterApi.getEmployeesShort()
      ]);
      setAcademicYears(years);
      setEmployees(staff);
      const current = years.find((y: any) => y.isCurrent);
      if (current) setSelectedYearId(current.id);
    } catch (error) {
      console.error('Error fetching academic years', error);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [selectedYearId]);

  const fetchSummaries = async () => {
    try {
      const response = await financeApi.getAccountSummaries(selectedYearId);
      console.log('Finance Summaries Debug:', response.data);
      const data = response.data;
      if (Array.isArray(data)) {
        // Deduplicate in case of API/DB anomalies
        const uniqueData = data.reduce((acc: AccountSummary[], current) => {
          const x = acc.find(item => item.accountId === current.accountId);
          if (!x) return acc.concat([current]);
          else return acc;
        }, []);
        setSummaries(uniqueData);
        if (data.length > 0 && !selectedAccount) {
          handleAccountClick(data[0]);
        }
      } else {
        console.warn('Finance Summaries was not an array:', data);
        setSummaries([]);
      }
    } catch (error) {
      console.error('Error fetching summaries', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountClick = async (account: AccountSummary) => {
    setSelectedAccount(account);
    try {
      const response = await financeApi.getAccountLedger(account.accountId);
      setLedger(response.data);
    } catch (error) {
      console.error('Error fetching ledger', error);
      setLedger([]);
    }
  };

  const handleEdit = (acc: AccountSummary) => {
    setEditingAccount(acc);
    setNewAccount({
      name: acc.accountName,
      accountType: acc.accountType,
      description: '', // description not in summary
      ownerEmployeeId: acc.ownerEmployeeId || '',
      isActive: acc.isActive
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this financial account? This will orphan its transaction records.')) return;
    
    try {
      await financeApi.deleteAccount(id);
      if (selectedAccount?.accountId === id) setSelectedAccount(null);
      fetchSummaries();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferData.fromAccountId || !transferData.toAccountId || transferData.amount <= 0) {
      alert('Please fill all required fields');
      return;
    }
    if (transferData.fromAccountId === transferData.toAccountId) {
      alert('Source and destination accounts must be different');
      return;
    }
    
    setSaving(true);
    try {
      await financeApi.transferFunds({
        ...transferData,
        academicYearId: selectedYearId
      });
      setIsTransferModalOpen(false);
      setTransferData({ fromAccountId: '', toAccountId: '', amount: 0, remarks: '' });
      fetchSummaries();
    } catch (error: any) {
      alert(error.response?.data?.message || error.response?.data || 'Transfer failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name.trim()) return;
    
    setSaving(true);
    try {
      if (editingAccount) {
        await financeApi.updateAccount(editingAccount.accountId, newAccount);
      } else {
        await financeApi.createAccount(newAccount);
      }
      setIsAddModalOpen(false);
      setEditingAccount(null);
      setNewAccount({ name: '', accountType: 'Cash', description: '', ownerEmployeeId: '', isActive: true });
      fetchSummaries();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save account');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium italic">Loading Financial Data...</div>;

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Financial Account Management</h1>
          <p className="text-slate-500 text-sm">View real-time balances for all account persons and counters.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Active Session</span>
                <select 
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none min-w-[200px]"
                >
                  <option value="">Full History (All Years)</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.name} {year.isCurrent ? '(Current)' : ''}</option>
                  ))}
                </select>
            </div>
          </div>
          <button 
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-white text-slate-700 font-bold rounded-2xl border-2 border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-all shadow-sm group"
          >
            <History size={18} className="text-amber-500 group-hover:rotate-12 transition-transform" />
            <span>Money Transfer</span>
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span>New Account</span>
          </button>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {summaries.map((acc) => (
          <div 
            key={acc.accountId}
            onClick={() => handleAccountClick(acc)}
            className={`group cursor-pointer transition-all duration-300 transform hover:-translate-y-1 rounded-2xl p-6 border-2 
              ${selectedAccount?.accountId === acc.accountId 
                ? 'bg-white border-primary-500 shadow-xl shadow-primary-500/10' 
                : 'bg-white border-transparent hover:border-slate-200 shadow-sm shadow-black/5'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${acc.accountType === 'Cash' ? 'bg-orange-100 text-orange-600' : 'bg-primary-100 text-primary-600'}`}>
                <Wallet size={24} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${acc.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {acc.accountType}
                </span>
                <div className="flex items-center gap-1.5 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(acc); }}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all border border-slate-100 hover:border-primary-100"
                    title="Modify Details"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(acc.accountId); }}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-slate-100 hover:border-rose-100"
                    title="Archive Account"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">{acc.accountName}</h3>
            <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5 font-medium uppercase tracking-tight">
              <User size={12} className="text-slate-300" /> {acc.ownerName || 'Main Counter'}
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                <span className="text-slate-400">Operating Revenue</span>
                <span className="text-emerald-600">+ {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(acc.totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                <span className="text-slate-400">Operating Expense</span>
                <span className="text-rose-600">- {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(acc.totalExpense)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold opacity-60">
                <span className="text-slate-400">Net Transfers</span>
                <span className="text-slate-600">
                  {acc.internalTransfersIn - acc.internalTransfersOut >= 0 ? '+' : ''}
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(acc.internalTransfersIn - acc.internalTransfersOut)}
                </span>
              </div>
              <div className="h-px bg-slate-100 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">Closing Balance</span>
                <span className={`text-lg font-black ${acc.closingBalance >= 0 ? 'text-primary-600' : 'text-rose-600'}`}>
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(acc.closingBalance)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Action Card: Add New Account */}
        <div 
          onClick={() => setIsAddModalOpen(true)}
          className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 hover:text-primary-500 hover:border-primary-200 cursor-pointer transition-all bg-white/50 hover:bg-white group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-primary-50 flex items-center justify-center mb-2 transition-colors">
            <span className="text-2xl font-light">+</span>
          </div>
          <span className="font-bold text-xs uppercase tracking-wider">New Financial Account</span>
        </div>
      </div>

      {/* Add Account Side Panel */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[120] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => { setIsAddModalOpen(false); setEditingAccount(null); }} />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
            {/* Panel Header */}
            <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 text-white shrink-0">
               <div className="flex justify-between items-start mb-6">
                 <div className="h-14 w-14 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
                   <Wallet className="h-7 w-7 text-white" />
                 </div>
                 <button 
                  onClick={() => { setIsAddModalOpen(false); setEditingAccount(null); }}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20"
                 >
                   <Plus size={20} className="rotate-45" />
                 </button>
               </div>
               <h2 className="text-2xl font-black tracking-tight leading-none mb-2">{editingAccount ? 'Update Records' : 'Setup New Vault'}</h2>
               <p className="text-primary-100 text-[10px] font-black opacity-80 uppercase tracking-[0.2em] leading-relaxed">
                 {editingAccount ? 'Modify Access & Settings' : 'Digital Vault & Cash Records'}
               </p>
            </div>
            
            <form onSubmit={handleCreateAccount} className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary-600 transition-colors">Account Holder Name</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newAccount.name}
                  onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                  placeholder="e.g. Rahul Sharma (Feecounter)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Classification</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {['Cash', 'Bank'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewAccount({...newAccount, accountType: type})}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        newAccount.accountType === type 
                          ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-500/20' 
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {type} Vault
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 focus-within:translate-x-1 transition-transform group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary-600 transition-colors">Assigned Manager / Employee</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <User size={18} />
                  </div>
                  <select 
                    value={newAccount.ownerEmployeeId}
                    onChange={e => setNewAccount({...newAccount, ownerEmployeeId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Main Counter (Shared/General)</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary-600 transition-colors">Description / Purpose</label>
                <textarea 
                  value={newAccount.description}
                  onChange={e => setNewAccount({...newAccount, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-700 min-h-[100px] focus:outline-none focus:border-primary-400 transition-all resize-none placeholder:text-slate-300 leading-relaxed"
                  placeholder="Purpose of this account..."
                />
              </div>

              <div className="flex gap-4 pt-6 sticky bottom-0 bg-white/70 backdrop-blur-md pb-4">
                <button 
                  type="button" 
                  onClick={() => { setIsAddModalOpen(false); setEditingAccount(null); setNewAccount({ name: '', accountType: 'Cash', description: '', ownerEmployeeId: '', isActive: true }); }}
                  className="flex-1 py-4.5 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  disabled={saving || !newAccount.name}
                  className="flex-2 py-4.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary-700 transition-all active:scale-95 shadow-2xl shadow-primary-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={16} />
                      {editingAccount ? 'Update Permanent Record' : 'Seal New Record'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 min-h-screen">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsTransferModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white text-center">
              <div className="h-16 w-16 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Internal Fund Transfer</h2>
              <p className="text-amber-100 text-xs mt-1 font-medium opacity-80 uppercase tracking-widest">Move Capital Between Accounts</p>
            </div>
            
            <form onSubmit={handleTransfer} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Account (Source)</label>
                  <select 
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold text-slate-700 focus:border-amber-500 focus:bg-white outline-none transition-all"
                    value={transferData.fromAccountId}
                    onChange={(e) => setTransferData({...transferData, fromAccountId: e.target.value})}
                  >
                    <option value="">Select Source</option>
                    {summaries.map(s => (
                      <option key={s.accountId} value={s.accountId}>{s.accountName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Account (Destination)</label>
                  <select 
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold text-slate-700 focus:border-primary-500 focus:bg-white outline-none transition-all"
                    value={transferData.toAccountId}
                    onChange={(e) => setTransferData({...transferData, toAccountId: e.target.value})}
                  >
                    <option value="">Select Target</option>
                    {summaries.map(s => (
                      <option key={s.accountId} value={s.accountId}>{s.accountName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transfer Amount</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input 
                    type="number" 
                    required
                    min="1"
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 text-sm font-bold text-slate-700 focus:border-primary-500 focus:bg-white outline-none transition-all"
                    placeholder="0.00"
                    value={transferData.amount || ''}
                    onChange={(e) => setTransferData({...transferData, amount: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transfer Remarks</label>
                <input 
                  type="text" 
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold text-slate-700 focus:border-primary-500 focus:bg-white outline-none transition-all"
                  placeholder="Reason for transfer..."
                  value={transferData.remarks}
                  onChange={(e) => setTransferData({...transferData, remarks: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  disabled={saving || !transferData.fromAccountId || !transferData.toAccountId || transferData.amount <= 0}
                  className="flex-1 py-4 bg-amber-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-amber-700 transition-all animate-all active:scale-95 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ledger Section */}
      {selectedAccount && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
            <div>
              <h2 className="text-xl font-bold text-slate-800">General Ledger</h2>
              <p className="text-sm text-slate-400 font-medium tracking-tight mt-0.5">Transaction history for <span className="text-primary-600 font-bold">{selectedAccount.accountName}</span></p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search transactions..." 
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-300 w-full md:w-64"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Filter size={16} /> Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Source / Description</th>
                  <th className="px-6 py-4">Classification</th>
                  <th className="px-6 py-4">Ref No.</th>
                  <th className="px-6 py-4 text-right">Credit / Debit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400 italic">
                      <div className="flex flex-col items-center gap-2">
                        <History size={32} className="text-slate-200 mb-1" />
                        <p className="font-medium">No transactions recorded yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  ledger.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-color group">
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-slate-700">{formatDate(item.date)}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-tight">{formatTime(item.date)}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${item.type === 'Income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {item.type === 'Income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{item.description}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.type === 'Income' ? 'Funds Received' : 'Funds Outflow'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs font-mono font-medium text-slate-400">{item.referenceNumber || '---'}</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className={`text-sm font-black ${item.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.type === 'Income' ? '+' : '-'} {new Intl.NumberFormat('en-IN').format(item.amount)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <span>Entry Count: {ledger.length} Transactions</span>
            <div className="flex items-center gap-2">
              <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50">Prev</button>
              <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceDashboard;
