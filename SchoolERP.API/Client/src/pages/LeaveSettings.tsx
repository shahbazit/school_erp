import { useState, useEffect } from 'react';
import {
  Settings, Plus, Trash2, Star,
  Calendar, Calculator, Sparkles,
  Layers, ChevronRight, LayoutGrid, Info,
  AlertCircle
} from 'lucide-react';
import { leaveApi, type LeaveTypeDto, type LeavePlanDto } from '../api/leaveApi';

export default function LeaveSettings() {
  const [plans, setPlans] = useState<LeavePlanDto[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [types, setTypes] = useState<LeaveTypeDto[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);

  // Form States
  const [planForm, setPlanForm] = useState({ name: '', description: '' });
  const [typeForm, setTypeForm] = useState<Omit<LeaveTypeDto, 'id' | 'isActive'>>({
    name: '',
    description: '',
    maxDaysPerYear: 12,
    isMonthlyAccrual: false,
    accrualRatePerMonth: 1,
    canCarryForward: false,
    maxCarryForwardDays: 0,
    leavePlanId: ''
  });

  const loadPlans = async () => {
    try {
      const data = await leaveApi.getPlans();
      setPlans(data);
      if (data.length > 0 && !selectedPlanId) {
        setSelectedPlanId(data[0].id);
      }
    } catch (err) {}
  };

  const loadTypes = async (planId: string) => {
    try {
      const data = await leaveApi.getTypes(planId);
      setTypes(data);
    } catch (err) {}
  };

  useEffect(() => { loadPlans(); }, []);
  useEffect(() => { if (selectedPlanId) loadTypes(selectedPlanId); }, [selectedPlanId]);

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPlan = await leaveApi.createPlan(planForm);
      setShowPlanModal(false);
      setPlanForm({ name: '', description: '' });
      loadPlans();
      setSelectedPlanId(newPlan.id);
    } catch (err) { alert("Failed to save plan"); }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this group? All defined categories inside will be lost.")) return;
    try {
      await leaveApi.deletePlan(id);
      loadPlans();
      if (selectedPlanId === id) setSelectedPlanId(null);
    } catch (err: any) {
      alert(err.response?.data || "Failed to delete plan.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await leaveApi.setDefaultPlan(id);
      loadPlans();
    } catch (err) { alert("Failed to set default plan"); }
  };

  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;
    try {
      const data = { ...typeForm, leavePlanId: selectedPlanId };
      if (editingTypeId) {
        await leaveApi.updateType(editingTypeId, data);
      } else {
        await leaveApi.createType(data);
      }
      setShowTypeModal(false);
      setEditingTypeId(null);
      setTypeForm({
        name: '', description: '', maxDaysPerYear: 12, isMonthlyAccrual: false,
        accrualRatePerMonth: 1, canCarryForward: false, maxCarryForwardDays: 0,
        leavePlanId: ''
      });
      loadTypes(selectedPlanId);
    } catch (err) { alert("Failed to save category"); }
  };

  const handleEditType = (t: LeaveTypeDto) => {
    setEditingTypeId(t.id);
    setTypeForm({
      name: t.name,
      description: t.description || '',
      maxDaysPerYear: t.maxDaysPerYear,
      isMonthlyAccrual: t.isMonthlyAccrual,
      accrualRatePerMonth: t.accrualRatePerMonth,
      canCarryForward: t.canCarryForward,
      maxCarryForwardDays: t.maxCarryForwardDays,
      leavePlanId: t.leavePlanId
    });
    setShowTypeModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Layers className="w-5 h-5 text-indigo-600" />
             <h2 className="text-xl font-black text-slate-800 tracking-tight">Grouped Leave Policies</h2>
          </div>
          <p className="text-sm text-slate-400 font-medium">Create separate leave plans for different employee groups (Teachers, Admin, etc.)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Sidebar: Groups */}
         <div className="lg:col-span-1 space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4">Employee Groups</h4>
            {plans.map(p => (
              <button 
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`w-full text-left p-4 rounded-3xl border transition-all flex items-center justify-between group
                  ${selectedPlanId === p.id 
                    ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50' 
                    : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200 text-slate-500'}`}
              >
                 <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors
                      ${selectedPlanId === p.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                       <LayoutGrid className="w-4 h-4" />
                    </div>
                    <div>
                       <p className={`text-sm font-black transition-colors ${selectedPlanId === p.id ? 'text-slate-800' : 'text-slate-500 group-hover:text-indigo-600'}`}>{p.name}</p>
                       {selectedPlanId === p.id && <p className="text-[10px] text-indigo-500 font-bold">Currently Managing</p>}
                    </div>
                 </div>
                 <ChevronRight className={`w-4 h-4 transition-transform ${selectedPlanId === p.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
              </button>
            ))}
            
            <button 
              onClick={() => setShowPlanModal(true)}
              className="w-full py-4 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition flex items-center justify-center gap-2"
            >
               <Plus className="w-3.5 h-3.5" /> Add Another Group
            </button>
         </div>

         {/* Main Content: Categories in Group */}
         <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
                  <div>
                     <h3 className="text-lg font-black text-slate-800">
                        {plans.find(p => p.id === selectedPlanId)?.name || 'Select a Group'} 
                        <span className="ml-2 text-slate-300 font-medium">| Policy List</span>
                     </h3>
                     <p className="text-xs text-slate-400 font-bold uppercase mt-1">Rule definitions for this specific group</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedPlanId && !plans.find(p => p.id === selectedPlanId)?.isDefault && (
                       <button 
                         onClick={() => handleSetDefault(selectedPlanId)}
                         className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-black rounded-xl transition border border-indigo-100"
                       >
                         <Star className="w-4 h-4" /> Set as Primary
                       </button>
                    )}
                    {selectedPlanId && (
                       <button 
                         disabled={plans.find(p => p.id === selectedPlanId)?.isDefault || plans.find(p => p.id === selectedPlanId)?.employeeCount! > 0}
                         onClick={() => handleDeletePlan(selectedPlanId)}
                         className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition border 
                           ${(plans.find(p => p.id === selectedPlanId)?.isDefault || plans.find(p => p.id === selectedPlanId)?.employeeCount! > 0) 
                             ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60' 
                             : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-100'}`}
                       >
                         <Trash2 className="w-4 h-4" /> Delete Group
                       </button>
                    )}
                    {selectedPlanId && plans.find(p => p.id === selectedPlanId)?.isDefault && (
                       <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-500 text-[10px] font-black uppercase rounded-xl border border-indigo-100 select-none">
                          Default System Plan
                       </div>
                    )}
                    {selectedPlanId && plans.find(p => p.id === selectedPlanId)?.employeeCount! > 0 && !plans.find(p => p.id === selectedPlanId)?.isDefault && (
                       <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 text-[10px] font-black uppercase rounded-xl border border-slate-100 select-none">
                          <AlertCircle className="w-3.5 h-3.5" /> {plans.find(p => p.id === selectedPlanId)?.employeeCount} Staff Members Mapped
                       </div>
                    )}
                    <button 
                      disabled={!selectedPlanId}
                      onClick={() => { setEditingTypeId(null); setTypeForm({name: '', description: '', maxDaysPerYear: 12, isMonthlyAccrual: false, accrualRatePerMonth: 1, canCarryForward: false, maxCarryForwardDays: 0, leavePlanId: selectedPlanId || ''}); setShowTypeModal(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-lg shadow-slate-200 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" /> Add Category
                    </button>
                  </div>
               </div>

               {selectedPlanId ? (
                 <div className="p-0 animate-in fade-in slide-in-from-right-4 duration-500">
                    {types.length === 0 ? (
                       <div className="p-20 text-center">
                          <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-100" />
                          <p className="text-slate-400 font-bold">No leave categories defined for this group.</p>
                       </div>
                    ) : (
                       <table className="w-full text-left">
                          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <tr>
                                <th className="px-8 py-4">Category</th>
                                <th className="px-6 py-4">Total Quota</th>
                                <th className="px-6 py-4">Accrual Method</th>
                                <th className="px-6 py-4">Carry Over</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {types.map(t => (
                               <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-8 py-6">
                                     <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                           <Calendar className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-sm font-black text-slate-800">{t.name}</h4>
                                     </div>
                                  </td>
                                  <td className="px-6 py-6">
                                     <span className="text-xs font-black text-slate-700">{t.maxDaysPerYear} Days</span>
                                  </td>
                                  <td className="px-6 py-6">
                                     <div className="flex flex-col">
                                        <span className={`text-[11px] font-black ${t.isMonthlyAccrual ? 'text-emerald-600' : 'text-slate-500'}`}>
                                           {t.isMonthlyAccrual ? 'Monthly Accrual' : 'Yearly Upfront'}
                                        </span>
                                        {t.isMonthlyAccrual && <span className="text-[10px] text-slate-400 font-bold uppercase">{t.accrualRatePerMonth} Days/Mo</span>}
                                     </div>
                                  </td>
                                  <td className="px-6 py-6">
                                     <div className="flex flex-col">
                                        <span className={`text-[11px] font-black ${t.canCarryForward ? 'text-amber-600' : 'text-slate-400'}`}>
                                           {t.canCarryForward ? 'Enabled' : 'No'}
                                        </span>
                                        {t.canCarryForward && <span className="text-[10px] text-slate-400 font-bold uppercase">Max {t.maxCarryForwardDays} Days</span>}
                                     </div>
                                  </td>
                                  <td className="px-8 py-6 text-right">
                                     <button 
                                       onClick={() => handleEditType(t)}
                                       className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-lg"
                                     >
                                        <Settings className="w-4 h-4" />
                                     </button>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    )}
                 </div>
               ) : (
                 <div className="p-20 text-center flex flex-col items-center justify-center h-full">
                    <Info className="w-12 h-12 text-slate-100 mb-4" />
                    <p className="text-slate-400 font-bold">Select an employee group from the left to manage policies.</p>
                 </div>
               )}
            </div>

            {/* Note Panel */}
            <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem] flex gap-4 items-start">
               <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
               <div className="text-xs text-amber-900 leading-relaxed font-medium">
                  <p className="font-black uppercase tracking-widest text-[10px] mb-1">Standard Pro-rata Rule</p>
                  For "Monthly Accrual" categories, the system will automatically calculate the available leave based on months completed since the session start. Administrative staff can manually override balances in the <strong>Balances</strong> tab if exceptional carry-forwards are needed.
               </div>
            </div>
         </div>
      </div>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowPlanModal(false)} />
           <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">New Employee Group</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase mt-1">Naming the Policy Plan</p>
              </div>
              <form onSubmit={handlePlanSubmit} className="p-8 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Group Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Academic Staff, Front-Office..."
                      value={planForm.name}
                      onChange={e => setPlanForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-5 py-3 rounded-2xl border-0 bg-slate-50 font-bold text-sm text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-400 shadow-inner" 
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Description (Optional)</label>
                    <textarea 
                      rows={2}
                      placeholder="Who is this plan for?"
                      value={planForm.description}
                      onChange={e => setPlanForm(p => ({ ...p, description: e.target.value }))}
                      className="w-full px-5 py-3 rounded-2xl border-0 bg-slate-50 font-bold text-sm text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-400 shadow-inner resize-none" 
                    />
                 </div>
                 <div className="flex gap-3">
                    <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 py-3 text-sm font-black text-slate-500">Cancel</button>
                    <button type="submit" className="flex-[2] py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition shadow-xl shadow-indigo-100">
                       Create Group
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Type Modal (Category Policy) */}
      {showTypeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowTypeModal(false)} />
           <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                 <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{editingTypeId ? 'Refine Policy' : 'Add Category to Group'}</h3>
                    <p className="text-xs text-indigo-500 font-bold uppercase mt-1">Applying to: {plans.find(p => p.id === selectedPlanId)?.name}</p>
                 </div>
                 <button onClick={() => setShowTypeModal(false)} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400">&times;</button>
              </div>
              
              <form onSubmit={handleTypeSubmit} className="p-8 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Leave Category Name</label>
                          <input 
                            required
                            type="text" 
                            placeholder="Sick, Casual, Earned..."
                            value={typeForm.name}
                            onChange={e => setTypeForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full px-5 py-3 rounded-2xl border-0 bg-slate-50 font-bold text-sm text-slate-800 focus:ring-2 focus:ring-indigo-400 shadow-inner" 
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Max Yearly Allowance</label>
                          <input 
                            required
                            type="number" 
                            value={typeForm.maxDaysPerYear}
                            onChange={e => setTypeForm(p => ({ ...p, maxDaysPerYear: Number(e.target.value) }))}
                            className="w-full px-5 py-3 rounded-2xl border-0 bg-slate-50 font-black text-lg text-slate-800 focus:ring-2 focus:ring-indigo-400 shadow-inner" 
                          />
                       </div>
                    </div>

                    <div className="space-y-5 bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-100">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <Calculator className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs font-black text-slate-700">Monthly Accrual</span>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                             <input 
                               type="checkbox" 
                               className="sr-only peer" 
                               checked={typeForm.isMonthlyAccrual}
                               onChange={e => setTypeForm(p => ({ ...p, isMonthlyAccrual: e.target.checked }))}
                             />
                             <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-sm"></div>
                           </label>
                        </div>
                        {typeForm.isMonthlyAccrual && (
                           <div className="animate-in slide-in-from-top-2 duration-200">
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Monthly Earning Rate (Days)</label>
                              <input 
                                type="number" 
                                step="0.5"
                                value={typeForm.accrualRatePerMonth}
                                onChange={e => setTypeForm(p => ({ ...p, accrualRatePerMonth: Number(e.target.value) }))}
                                className="w-full px-5 py-3 rounded-2xl border-0 bg-white font-bold text-sm text-slate-800 focus:ring-2 focus:ring-emerald-400 shadow-sm" 
                              />
                           </div>
                        )}
                        <p className="text-[10px] text-slate-400 italic">When enabled, employee "Available Balance" grows month by month.</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5 bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-100">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span className="text-xs font-black text-slate-700">Carry Forward Settings</span>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                             <input 
                               type="checkbox" 
                               className="sr-only peer" 
                               checked={typeForm.canCarryForward}
                               onChange={e => setTypeForm(p => ({ ...p, canCarryForward: e.target.checked }))}
                             />
                             <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 shadow-sm"></div>
                           </label>
                        </div>
                        {typeForm.canCarryForward && (
                           <div className="animate-in slide-in-from-top-2 duration-200">
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Max Transfer Limit (Days)</label>
                              <input 
                                required
                                type="number" 
                                value={typeForm.maxCarryForwardDays}
                                onChange={e => setTypeForm(p => ({ ...p, maxCarryForwardDays: Number(e.target.value) }))}
                                className="w-full px-5 py-3 rounded-2xl border-0 bg-white font-bold text-sm text-slate-800 focus:ring-2 focus:ring-amber-400 shadow-sm" 
                              />
                           </div>
                        )}
                        <p className="text-[10px] text-slate-400 italic">Determines if unused balances roll over to the next financial year.</p>
                    </div>

                    <div className="flex items-end">
                       <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition shadow-xl shadow-slate-200">
                          {editingTypeId ? 'Update Rule' : 'Add to Plan'}
                       </button>
                    </div>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
