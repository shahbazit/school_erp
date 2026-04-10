import { useState, useEffect } from 'react';
import { 
  Settings2, 
  Percent, 
  Calendar, 
  Clock, 
  Plus, 
  Save, 
  Trash2, 
  AlertCircle,
  Info,
  DollarSign,
  X,
  Edit,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { feeApi } from '../../api/feeApi'
import { useLocalization } from '../../contexts/LocalizationContext';

export default function FeeSettings() {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const [activeTab, setActiveTab] = useState<'policy' | 'discounts'>('policy');
  const [config, setConfig] = useState<any>({
    monthlyDueDay: 10,
    gracePeriodDays: 5,
    lateFeeType: 'Fixed',
    lateFeeAmount: 500,
    autoCalculateLateFee: true
  });
  
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const [discountForm, setDiscountForm] = useState<any>({
    name: '',
    calculationType: 'Percentage',
    value: 0,
    category: 'Other',
    frequency: 'Monthly',
    isActive: true,
    defaultFeeHeadId: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [conf, disc, heads] = await Promise.all([
        feeApi.getConfig(),
        feeApi.getDiscounts(),
        feeApi.getHeads()
      ]);
      if (conf) setConfig(conf);
      setDiscounts(disc || []);
      setFeeHeads(heads || []);
    } catch (e) {
      console.error(e);
    }
  };

  const saveConfig = async () => {
    setStatus('LOADING');
    try {
      await feeApi.updateConfig(config);
      setStatus('SUCCESS');
      setMessage('Fee policy updated successfully');
    } catch (e) {
      setStatus('ERROR');
      setMessage('Failed to update fee policy');
    }
  };

  const openAddDiscount = () => {
    setEditingDiscount(null);
    setDiscountForm({
      name: '',
      calculationType: 'Percentage',
      value: 0,
      category: 'Other',
      frequency: 'Monthly',
      isActive: true,
      defaultFeeHeadId: null
    });
    setIsDrawerOpen(true);
  };

  const openEditDiscount = (discount: any) => {
    setEditingDiscount(discount);
    setDiscountForm({ ...discount });
    setIsDrawerOpen(true);
  };

  const saveDiscount = async () => {
    setStatus('LOADING');
    try {
      await feeApi.updateDiscount(discountForm);
      setStatus('SUCCESS');
      setMessage(editingDiscount ? 'Discount updated' : 'Discount created');
      setIsDrawerOpen(false);
      loadData(); // Reload to get fresh list
    } catch (e) {
      setStatus('ERROR');
      setMessage('Failed to save discount');
    }
  };

  const deleteDiscount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount type?")) return;
    setStatus('LOADING');
    try {
      // Assuming a delete method or update with IsActive=false
      await feeApi.updateDiscount({ ...discounts.find(d => d.id === id), isActive: false });
      setStatus('SUCCESS');
      setMessage('Discount removed');
      loadData();
    } catch (e) {
      setStatus('ERROR');
      setMessage('Failed to remove discount');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-xs tracking-widest uppercase mb-1">
            <div className="p-1.5 bg-primary-100 rounded-lg"><Settings2 className="h-4 w-4" /></div>
            <span>Fee Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Fee Policies & Discounts</h1>
          <p className="text-slate-500 text-sm max-w-xl">
             Configure organization-wide fee rules, due dates, late fees, and managed discount categories.
          </p>
        </div>
      </div>

      {status === 'SUCCESS' && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-800 animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100/50 rounded-2xl w-fit border border-slate-200/50">
        <button 
          onClick={() => setActiveTab('policy')}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'policy' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Clock className="h-4 w-4" />
          Late Fee Policy
        </button>
        <button 
          onClick={() => setActiveTab('discounts')}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'discounts' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Percent className="h-4 w-4" />
          Discount Masters
        </button>
      </div>

      {activeTab === 'policy' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" /> Due Day of Month
                  </label>
                  <input 
                    type="number" 
                    min="1" max="28"
                    value={config.monthlyDueDay}
                    onChange={(e) => setConfig({...config, monthlyDueDay: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-bold text-slate-700"
                  />
                  <p className="text-[10px] text-slate-400">Day fees are considered due (e.g., 10th)</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> Grace Period (Days)
                  </label>
                  <input 
                    type="number" 
                    value={config.gracePeriodDays}
                    onChange={(e) => setConfig({...config, gracePeriodDays: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-bold text-slate-700"
                  />
                  <p className="text-[10px] text-slate-400">Additional days before penalty kicks in</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                 <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                   <AlertCircle className="h-4 w-4 text-orange-500" /> Penalty Settings
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Late Fee Type</label>
                      <select 
                        value={config.lateFeeType}
                        onChange={(e) => setConfig({...config, lateFeeType: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat"
                      >
                        <option value="Fixed">Fixed Amount (Lump sum)</option>
                        <option value="PerDay">Per Day (Cumulative)</option>
                        <option value="Percentage">Percentage of Overdue</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Penalty Amount / Value</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          type="number" 
                          value={config.lateFeeAmount}
                          onChange={(e) => setConfig({...config, lateFeeAmount: parseFloat(e.target.value)})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none font-bold text-slate-700"
                        />
                      </div>
                   </div>
                 </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-2xl border border-primary-100 mt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg"><Clock className="h-5 w-5 text-primary-600" /></div>
                  <div>
                    <h5 className="text-xs font-black text-primary-900 uppercase tracking-tight">Auto-Charge Late Fees</h5>
                    <p className="text-[10px] text-primary-600 font-medium">Automatically post late fee transactions on ledger</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={config.autoCalculateLateFee}
                  onChange={(e) => setConfig({...config, autoCalculateLateFee: e.target.checked})}
                  className="h-6 w-11 rounded-full bg-slate-200 border-none appearance-none cursor-pointer checked:bg-primary-600 relative transition-all before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-6 before:transition-all"
                />
              </div>

              <div className="pt-8 flex justify-end">
                <button 
                  onClick={saveConfig}
                  disabled={status === 'LOADING'}
                  className="px-10 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Policy Configuration
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 border-slate-200/60">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary-500" /> Policy Summary
              </h4>
              <ul className="space-y-4 text-xs">
                <li className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">Monthly Deadline</span>
                  <span className="font-bold text-slate-700">{config.monthlyDueDay}th</span>
                </li>
                <li className="flex justify-between py-2 border-b border-slate-50">
                   <span className="text-slate-500">Effective Penalty Date</span>
                   <span className="font-bold text-slate-700">{config.monthlyDueDay + config.gracePeriodDays}th</span>
                </li>
                <li className="flex justify-between py-2 border-b border-slate-50">
                   <span className="text-slate-500">Auto-Posting</span>
                   <span className={`font-bold ${config.autoCalculateLateFee ? 'text-green-600' : 'text-slate-400'}`}>
                     {config.autoCalculateLateFee ? 'Enabled' : 'Manual only'}
                   </span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 text-orange-800 space-y-3">
               <AlertCircle className="h-6 w-6" />
               <p className="text-xs leading-relaxed font-medium">
                 Changes to the late fee policy will only apply to future un-calculated months. Existing postings will not be retroactively modified.
               </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Percent className="h-5 w-5 text-primary-500" /> Managed Discount Types
                </h2>
                <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Define standard discount rules for your organization</p>
              </div>
              <button 
                onClick={openAddDiscount}
                className="btn-primary text-xs flex items-center gap-2 px-6 py-3"
              >
                <Plus className="h-4 w-4" /> Create Discount Type
              </button>
           </div>

           <div className="glass-card overflow-hidden border-slate-200/60 shadow-xl shadow-slate-200/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Rule Name</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Standard Value</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Applicable On</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {discounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No discount rules defined yet. Click "Create" to start.</td>
                    </tr>
                  ) : (
                    discounts.map((d) => (
                      <tr key={d.id} className="hover:bg-primary-50/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{d.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{d.frequency} Application</div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                             d.category === 'Staff' ? 'bg-purple-100 text-purple-700' :
                             d.category === 'Sibling' ? 'bg-blue-100 text-blue-700' :
                             'bg-slate-100 text-slate-600'
                           }`}>
                             {d.category}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-slate-700 font-mono">
                            {d.calculationType === 'Percentage' ? `${d.value}%` : formatCurrency(d.value)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-slate-600">
                            {d.defaultFeeHeadId ? feeHeads.find(h => h.id === d.defaultFeeHeadId)?.name : 'Universal (Net)'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => openEditDiscount(d)}
                              className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-all"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => deleteDiscount(d.id)}
                              className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Side Drawer Popup */}
      {isDrawerOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-500 overflow-y-auto border-l border-slate-100">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-xl text-primary-600">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {editingDiscount ? 'Update Discount Type' : 'Create New Discount'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Data Management</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all hover:rotate-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Discount Name</label>
                  <input 
                    value={discountForm.name}
                    onChange={(e) => setDiscountForm({...discountForm, name: e.target.value})}
                    placeholder="e.g. Sibling Discount, Staff Child"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                    <select 
                      value={discountForm.category}
                      onChange={(e) => setDiscountForm({...discountForm, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat"
                    >
                      <option value="Sibling">Sibling Discount</option>
                      <option value="Staff">Staff Benefit</option>
                      <option value="Merit">Academic Merit</option>
                      <option value="FinancialAid">Financial Aid</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Frequency</label>
                    <select 
                      value={discountForm.frequency}
                      onChange={(e) => setDiscountForm({...discountForm, frequency: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat"
                    >
                      <option value="Monthly">Monthly Cycle</option>
                      <option value="One-Time">Annual / One-Time</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Percent className="h-3.5 w-3.5" /> Value Calculation
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase">Method</label>
                      <select 
                        value={discountForm.calculationType}
                        onChange={(e) => setDiscountForm({...discountForm, calculationType: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Percentage">Percentage (%)</option>
                        <option value="Fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase">Value</label>
                      <input 
                        type="number"
                        value={discountForm.value}
                        onChange={(e) => setDiscountForm({...discountForm, value: parseFloat(e.target.value)})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Application Target</label>
                    <select 
                      value={discountForm.defaultFeeHeadId || ''}
                      onChange={(e) => setDiscountForm({...discountForm, defaultFeeHeadId: e.target.value || null})}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat"
                    >
                      <option value="">Balance Level (Overall)</option>
                      {feeHeads.map((h: any) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-slate-400 font-medium px-1">Specific head targeted by this discount rule by default.</p>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={saveDiscount}
                    disabled={status === 'LOADING'}
                    className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-xl shadow-primary-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                  >
                    <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {editingDiscount ? 'Update Policy Rule' : 'Initialize Discount Rule'}
                  </button>
                  <p className="mt-4 text-[10px] text-slate-400 text-center font-medium italic">All changes are immediately effective for upcoming fee cycles.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
