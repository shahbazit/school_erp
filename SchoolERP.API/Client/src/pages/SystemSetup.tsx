import { useState, useEffect } from 'react';
import { 
  Database, CheckCircle, AlertCircle, Play,
  UserCheck, Building, GraduationCap, Calendar, Users, Briefcase,
  Edit3, Save, Trash2, Plus, Info,
  Percent, Settings2
} from 'lucide-react';
import { seedApi } from '../api/seedApi';
import apiClient from '../api/apiClient';
import { GenericModal } from '../components/GenericModal';

interface MasterStatus {
  name: string;
  count: number;
  loading: boolean;
  icon: any;
  endpoint: string;
}

export default function SystemSetup() {
  const [statuses, setStatuses] = useState<MasterStatus[]>([
    { name: 'Lookups', count: 0, loading: true, icon: Database, endpoint: 'lookups' },
    { name: 'Academic Sessions', count: 0, loading: true, icon: Calendar, endpoint: 'masters/academic-years' },
    { name: 'Classes', count: 0, loading: true, icon: GraduationCap, endpoint: 'masters/classes' },
    { name: 'Sections', count: 0, loading: true, icon: Users, endpoint: 'masters/sections' },
    { name: 'Departments', count: 0, loading: true, icon: Building, endpoint: 'masters/departments' },
    { name: 'Designations', count: 0, loading: true, icon: Briefcase, endpoint: 'masters/designations' },
    { name: 'Employee Roles', count: 0, loading: true, icon: Briefcase, endpoint: 'masters/roles' },
    { name: 'Subjects', count: 0, loading: true, icon: GraduationCap, endpoint: 'masters/subjects' },
    { name: 'Fee Heads', count: 0, loading: true, icon: Building, endpoint: 'masters/fee/heads' },
    { name: 'Fee Discounts', count: 0, loading: true, icon: Percent, endpoint: 'masters/fee/discounts' },
    { name: 'Fee Policy', count: 0, loading: true, icon: Settings2, endpoint: 'masters/fee/config' },
    { name: 'Leave Types', count: 0, loading: true, icon: Calendar, endpoint: 'Leave/types' },
  ]);

  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('');

  const fetchStatuses = async () => {
    const updatedStatuses = await Promise.all(statuses.map(async (s) => {
      try {
        const response = await apiClient.get(s.endpoint);
        const count = Array.isArray(response.data) ? response.data.length : (response.data ? 1 : 0);
        return { ...s, count, loading: false };
      } catch (e) {
        return { ...s, count: 0, loading: false };
      }
    }));
    setStatuses(updatedStatuses);
  };

  useEffect(() => { fetchStatuses(); }, []);

  const handleOpenReview = async () => {
    setIsSeeding(true);
    try {
      const data = await seedApi.getDefaultData();
      // Keep original keys for API compatibility, but helper for local display
      setReviewData(data);
      const keys = Object.keys(data);
      if (keys.length > 0) {
        setActiveTab(keys[0]);
      }
      setShowReviewModal(true);
    } catch (e: any) {
      alert("Failed to load default data: " + (e.response?.data?.detailed || e.message));
    } finally {
      setIsSeeding(false);
    }
  };

  const handleApplyCustomSeed = async () => {
    if (!window.confirm('This will seed the database with your customized list. Proceed?')) return;
    setIsSeeding(true);
    try {
      const resp = await seedApi.seedCustomData(reviewData);
      setMessage({ type: 'success', text: resp.message || 'System customized successfully!' });
      setShowReviewModal(false);
      await fetchStatuses();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.response?.data?.detailed || e.response?.data?.message || 'Failed to seed custom data.' });
    } finally {
      setIsSeeding(false);
    }
  };

  const removeItem = (category: string, index: number) => {
    const updated = [...reviewData[category]];
    updated.splice(index, 1);
    setReviewData({ ...reviewData, [category]: updated });
  };

  const updateItem = (category: string, index: number, field: string, value: any) => {
    const updated = [...reviewData[category]];
    if (typeof updated[index] === 'string') {
      updated[index] = value;
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setReviewData({ ...reviewData, [category]: updated });
  };

  const addItem = (category: string) => {
    let newItem: any = "";
    if (category === 'Lookups') newItem = { type: 1, code: "NEW_CODE", name: "New Entry" };
    if (category === 'Subjects') newItem = { name: "New Subject", code: "NEW" };
    if (category === 'FeeHeads') newItem = { name: "New Head", isSelective: false };
    if (category === 'Classes') newItem = "New Class";
    if (category === 'Sections') newItem = "D";
    if (category === 'Departments') newItem = "New Dept";
    if (category === 'Designations') newItem = "New Desig";
    if (category === 'EmployeeRoles') newItem = { name: "New Role", description: "" };
    if (category === 'LeaveTypes') newItem = "New Leave";
    if (category === 'AcademicYears') newItem = { name: `${new Date().getFullYear()}-${(new Date().getFullYear() + 1) % 100}`, startDate: `${new Date().getFullYear()}-04-01`, endDate: `${new Date().getFullYear() + 1}-03-31`, isCurrent: false };
    if (category === 'MenuMasters') newItem = { key: "new", label: "New Menu", icon: "Layout", sortOrder: 10 };
    if (category === 'FeeDiscounts') newItem = { name: "New Discount", category: "Other", calculationType: "Percentage", value: 10, frequency: "Monthly" };
    if (category === 'FeePolicy') newItem = { monthlyDueDay: 10, gracePeriodDays: 5, lateFeeType: "Fixed", lateFeeAmount: 500, autoCalculateLateFee: true };
    
    setReviewData({ ...reviewData, [category]: [...reviewData[category], newItem] });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-xs tracking-widest uppercase mb-1">
            <div className="p-1.5 bg-primary-100 rounded-lg"><Database className="h-4 w-4" /></div>
            <span>System Initialization</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Configuration Center</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Populate your school ERP with professional defaults or customize them to fit your specific needs before seeding.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
            <button 
                onClick={handleOpenReview}
                disabled={isSeeding}
                className="btn-secondary px-6 flex items-center gap-2 whitespace-nowrap"
            >
                <Edit3 className="h-4 w-4" />
                Customize Defaults
            </button>
            <button 
                onClick={async () => {
                   if (window.confirm('This will seed the database with standard defaults. Proceed?')) {
                       setIsSeeding(true);
                       try {
                           const res = await seedApi.seedDefaultData();
                           setMessage({ type: 'success', text: res.message });
                           await fetchStatuses();
                       } finally { setIsSeeding(false); }
                   }
                }}
                disabled={isSeeding}
                className={`btn-primary px-8 py-3.5 flex items-center gap-3 shadow-xl active:scale-95 transition-all text-base ${isSeeding ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isSeeding ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="h-5 w-5 fill-current" />}
                <span>Quick Setup</span>
            </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5 mt-0.5 text-green-500" /> : <AlertCircle className="h-5 w-5 mt-0.5 text-red-500" />}
          <div>
            <p className="font-bold text-sm">{message.type === 'success' ? 'Success' : 'Error'}</p>
            <p className="text-sm opacity-90">{message.text}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statuses.map((s, idx) => (
          <div key={idx} className="glass-card p-6 group hover:shadow-xl transition-all border-slate-200/60 hover:border-primary-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-slate-50 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                <s.icon className="h-6 w-6" />
              </div>
              {s.loading ? <div className="h-2 w-12 bg-slate-100 animate-pulse rounded" /> : s.count > 0 ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                  <CheckCircle className="h-3 w-3" /> {s.count} Recorded
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">Empty</span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{s.name}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
               {s.count > 0 ? `Your ${s.name.toLowerCase()} are configured.` : `No ${s.name.toLowerCase()} found.`}
            </p>
          </div>
        ))}
      </div>

      <GenericModal 
        isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} 
        title="Review & Customize Master Data" 
      >
        <div className="flex flex-col h-full">
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-slate-100 custom-scrollbar">
                {reviewData && Object.keys(reviewData).map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setActiveTab(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-tight ${
                            activeTab === cat ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                        {cat.replace(/([A-Z])/g, ' $1').trim() || cat} ({reviewData[cat].length})
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500 text-xs italic">
                        <Info className="h-4 w-4" />
                        Modify the default list below. These will be seeded to your organization.
                    </div>
                    {(activeTab !== 'FeePolicy' && activeTab !== 'FeeConfig') && (
                        <button 
                            onClick={() => addItem(activeTab)}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all flex items-center gap-2 text-xs font-bold"
                        >
                            <Plus className="h-4 w-4" /> Add Row
                        </button>
                    )}
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                                <th className="pb-3 px-2">#</th>
                                <th className="pb-3 px-2">Record Information</th>
                                <th className="pb-3 px-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {reviewData && reviewData[activeTab] && reviewData[activeTab].map((item: any, idx: number) => (
                                <tr key={idx} className="group">
                                    <td className="py-3 px-2 text-slate-400 font-mono text-xs">{idx + 1}</td>
                                    <td className="py-3 px-2">
                                        {typeof item === 'string' ? (
                                            <input 
                                                value={item} 
                                                onChange={(e) => updateItem(activeTab, idx, '', e.target.value)} 
                                                className="bg-transparent border-b border-transparent focus:border-primary-500 hover:border-slate-300 w-full py-1 transition-all outline-none font-medium text-slate-700"
                                            />
                                        ) : activeTab === 'Lookups' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] text-slate-400 uppercase block">Code</label>
                                                    <input value={item.code} onChange={(e) => updateItem(activeTab, idx, 'code', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400 uppercase block">Display Name</label>
                                                    <input value={item.name} onChange={(e) => updateItem(activeTab, idx, 'name', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                            </div>
                                        ) : activeTab.toLowerCase() === 'subjects' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <input value={item.name} onChange={(e) => updateItem(activeTab, idx, 'name', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" placeholder="Subject Name" />
                                                <input value={item.code} onChange={(e) => updateItem(activeTab, idx, 'code', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" placeholder="Code" />
                                            </div>
                                        ) : activeTab === 'FeeHeads' ? (
                                            <div className="flex items-center gap-4">
                                                <input value={item.name} onChange={(e) => updateItem(activeTab, idx, 'name', e.target.value)} className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs" placeholder="Fee Name" />
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" checked={item.isSelective} onChange={(e) => updateItem(activeTab, idx, 'isSelective', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                                    <span className="text-[10px] text-slate-500">Selective</span>
                                                </div>
                                            </div>
                                        ) : activeTab === 'AcademicYears' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Year Name</label>
                                                    <input value={item.name} onChange={(e) => updateItem(activeTab, idx, 'name', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                                <div className="flex items-center gap-2 mt-4">
                                                    <input type="checkbox" checked={item.isCurrent} onChange={(e) => updateItem(activeTab, idx, 'isCurrent', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                                    <span className="text-[10px] text-slate-500">Current</span>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Start Date</label>
                                                    <input type="date" value={item.startDate?.split('T')[0]} onChange={(e) => updateItem(activeTab, idx, 'startDate', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400">End Date</label>
                                                    <input type="date" value={item.endDate?.split('T')[0]} onChange={(e) => updateItem(activeTab, idx, 'endDate', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                            </div>
                                        ) : activeTab === 'MenuMasters' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Label</label>
                                                    <input value={item.label} onChange={(e) => updateItem(activeTab, idx, 'label', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Key (Lower-Unique)</label>
                                                    <input value={item.key} onChange={(e) => updateItem(activeTab, idx, 'key', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Icon (Lucide Name)</label>
                                                    <input value={item.icon} onChange={(e) => updateItem(activeTab, idx, 'icon', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Order</label>
                                                    <input type="number" value={item.sortOrder} onChange={(e) => updateItem(activeTab, idx, 'sortOrder', parseInt(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                            </div>
                                        ) : activeTab === 'FeeDiscounts' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Discount Name</label>
                                                    <input value={item.name} onChange={(e) => updateItem(activeTab, idx, 'name', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-slate-400">Category</label>
                                                        <input value={item.category} onChange={(e) => updateItem(activeTab, idx, 'category', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-slate-400">Frequency</label>
                                                        <select value={item.frequency} onChange={(e) => updateItem(activeTab, idx, 'frequency', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px]">
                                                            <option value="Monthly">Monthly</option>
                                                            <option value="One-Time">One-Time</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <div>
                                                        <label className="text-[10px] text-slate-400">Type</label>
                                                        <select value={item.calculationType} onChange={(e) => updateItem(activeTab, idx, 'calculationType', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px]">
                                                            <option value="Percentage">%</option>
                                                            <option value="Fixed">Value</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-slate-400">Value</label>
                                                        <input type="number" value={item.value} onChange={(e) => updateItem(activeTab, idx, 'value', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : activeTab === 'FeePolicy' || activeTab === 'FeeConfig' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Monthly Due Day</label>
                                                    <input type="number" value={item.monthlyDueDay} onChange={(e) => updateItem(activeTab, idx, 'monthlyDueDay', parseInt(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Grace Period (Days)</label>
                                                    <input type="number" value={item.gracePeriodDays} onChange={(e) => updateItem(activeTab, idx, 'gracePeriodDays', parseInt(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Late Fee Amount</label>
                                                    <input type="number" value={item.lateFeeAmount} onChange={(e) => updateItem(activeTab, idx, 'lateFeeAmount', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Late Fee Type</label>
                                                    <select value={item.lateFeeType} onChange={(e) => updateItem(activeTab, idx, 'lateFeeType', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px]">
                                                        <option value="Fixed">Fixed</option>
                                                        <option value="Percentage">Percentage</option>
                                                        <option value="PerDay">Per Day</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center gap-2 mt-4">
                                                    <input type="checkbox" checked={item.autoCalculateLateFee} onChange={(e) => updateItem(activeTab, idx, 'autoCalculateLateFee', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                                    <span className="text-[10px] text-slate-500">Auto Calculate Late Fee</span>
                                                </div>
                                            </div>
                                        ) : activeTab === 'EmployeeRoles' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Role Name</label>
                                                    <input value={item.name} onChange={(e) => updateItem(activeTab, idx, 'name', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Description</label>
                                                    <input value={item.description} onChange={(e) => updateItem(activeTab, idx, 'description', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                                                </div>
                                            </div>
                                        ) : (
                                            JSON.stringify(item)
                                        )}
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                        <button onClick={() => removeItem(activeTab, idx)} className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button onClick={() => setShowReviewModal(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                <button 
                    onClick={handleApplyCustomSeed}
                    className="px-8 py-2.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center gap-2"
                >
                    <Save className="h-4 w-4" />
                    Apply Configuration
                </button>
            </div>
        </div>
      </GenericModal>

      <div className="p-8 bg-gradient-to-br from-indigo-600 to-primary-700 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl"><UserCheck className="h-10 w-10 text-primary-100" /></div>
            <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Start managing your school</h2>
                <p className="text-primary-100 text-sm max-w-lg">Initialize with master data, then start creating sessions, registering students, and managing fees.</p>
            </div>
            <button className="px-6 py-2.5 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 active:scale-95 transition-all text-sm whitespace-nowrap">Documentation</button>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 bg-white/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
