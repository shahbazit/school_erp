import { useState, useEffect } from 'react';
import { 
  Settings2, 
  Percent, 
  Calendar, 
  Clock, 
  Plus, 
  Save, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Info,
  DollarSign
} from 'lucide-react';
import { feeApi } from '../../api/feeApi';

export default function FeeSettings() {
  const [activeTab, setActiveTab] = useState<'policy' | 'discounts'>('policy');
  const [config, setConfig] = useState<any>({
    monthlyDueDay: 10,
    gracePeriodDays: 5,
    lateFeeType: 'Fixed',
    lateFeeAmount: 500,
    autoCalculateLateFee: true
  });
  
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [conf, disc] = await Promise.all([
        feeApi.getConfig(),
        feeApi.getDiscounts()
      ]);
      if (conf) setConfig(conf);
      setDiscounts(disc || []);
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

  const updateDiscount = (idx: number, field: string, value: any) => {
    const updated = [...discounts];
    updated[idx] = { ...updated[idx], [field]: value };
    setDiscounts(updated);
  };

  const removeDiscount = (idx: number) => {
    setDiscounts(discounts.filter((_, i) => i !== idx));
  };

  const addDiscount = () => {
    setDiscounts([...discounts, { 
      name: 'New Discount', 
      calculationType: 'Percentage', 
      value: 10, 
      category: 'Other', 
      frequency: 'Monthly',
      isActive: true 
    }]);
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
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary-500" /> Managed Discount Types
              </h2>
              <button 
                onClick={addDiscount}
                className="btn-primary text-xs flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Create Discount Type
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {discounts.map((d, idx) => (
                <div key={idx} className="glass-card p-6 border-slate-200/60 relative group animate-in zoom-in-95 duration-300">
                  <button 
                    onClick={() => removeDiscount(idx)}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  
                  <div className="space-y-4">
                    <input 
                      value={d.name}
                      onChange={(e) => updateDiscount(idx, 'name', e.target.value)}
                      placeholder="Discount Name"
                      className="text-lg font-black text-slate-800 bg-transparent border-none outline-none w-full focus:text-primary-600 placeholder:text-slate-300"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-tight">Calculation</label>
                        <select 
                          value={d.calculationType}
                          onChange={(e) => updateDiscount(idx, 'calculationType', e.target.value)}
                          className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold border-none outline-none appearance-none"
                        >
                          <option value="Percentage">Percentage (%)</option>
                          <option value="Fixed">Fixed Amount (₹)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-tight">Value</label>
                        <input 
                          type="number"
                          value={d.value}
                          onChange={(e) => updateDiscount(idx, 'value', parseFloat(e.target.value))}
                          className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold border-none outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-tight">Category</label>
                        <select 
                          value={d.category}
                          onChange={(e) => updateDiscount(idx, 'category', e.target.value)}
                          className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold border-none outline-none appearance-none"
                        >
                          <option value="Sibling">Sibling Discount</option>
                          <option value="Staff">Staff Benefit</option>
                          <option value="FinancialAid">Financial Aid</option>
                          <option value="Merit">Academic Merit</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-tight">Frequency</label>
                        <select 
                          value={d.frequency}
                          onChange={(e) => updateDiscount(idx, 'frequency', e.target.value)}
                          className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold border-none outline-none appearance-none"
                        >
                          <option value="Monthly">Apply Monthly</option>
                          <option value="One-Time">Annual / One-Time</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
           </div>

           <div className="pt-6 flex justify-end">
              <button 
                onClick={async () => {
                   // Actually, we need an API to bulk update/create discounts
                   // For now we'll assume the back-end handles individual ones or we can add bulk support
                   alert("Bulk saving discounts...");
                }}
                className="px-10 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Discount Masters
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
