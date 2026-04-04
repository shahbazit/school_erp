import { useEffect, useState } from 'react';
import { useLookups } from '../hooks/useMasters';
import { usePermissions } from '../hooks/usePermissions';
import { LookupType, Lookup } from '../types';
import { Plus, Edit2, Trash2, Search, Settings2 } from 'lucide-react';
import { GenericModal } from '../components/GenericModal';

const lookupTypeOptions = [
  { label: 'Relation', value: LookupType.Relation },
  { label: 'Blood Group', value: LookupType.BloodGroup },
  { label: 'Gender', value: LookupType.Gender },
  { label: 'Category', value: LookupType.Category },
  { label: 'Religion', value: LookupType.Religion },
  { label: 'Language', value: LookupType.Language },
  { label: 'Employment Type', value: LookupType.EmploymentType },
  { label: 'Payment Mode', value: LookupType.PaymentMode },
  { label: 'Bank', value: LookupType.Bank },
  { label: 'Attendance Status', value: LookupType.AttendanceStatus },
  { label: 'Leave Type', value: LookupType.LeaveType },
  { label: 'Transport Route', value: LookupType.Route },
  { label: 'Transport Stop', value: LookupType.Stop },
  { label: 'Vehicle', value: LookupType.Vehicle },
  { label: 'Exam Type', value: LookupType.ExamType },
  { label: 'Grade', value: LookupType.Grade },
  { label: 'Result Status', value: LookupType.ResultStatus },
  { label: 'Notification Type', value: LookupType.NotificationType },
];

export default function LookupManagement() {
  const { hasWritePermission } = usePermissions();
  const writeAllowed = hasWritePermission('lookups');
  const [selectedType, setSelectedType] = useState<LookupType>(LookupType.Relation);
  const { lookups, loading, error, fetchLookups, addLookup, updateLookup, removeLookup } = useLookups(selectedType);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLookup, setEditingLookup] = useState<Lookup | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups, selectedType]);

  const handleOpenAddModal = () => {
    setEditingLookup(null);
    setFormData({ code: '', name: '', description: '', isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lookup: Lookup) => {
    setEditingLookup(lookup);
    setFormData({ code: lookup.code, name: lookup.name, description: lookup.description || '', isActive: lookup.isActive });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, type: selectedType };
    let success = false;
    if (editingLookup) {
      success = await updateLookup(editingLookup.id, data);
    } else {
      success = await addLookup(data);
    }
    if (success) setIsModalOpen(false);
  };

  const filteredLookups = lookups.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reference Lookups</h1>
          <p className="text-slate-500 text-sm mt-1">Manage fixed value lists for the system</p>
        </div>
        {writeAllowed && (
          <button 
            onClick={handleOpenAddModal}
            className="btn-primary flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New {lookupTypeOptions.find(o => o.value === selectedType)?.label}
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-64">
           <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 ml-1">Select Lookup Category</label>
           <div className="relative">
              <Settings2 className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(Number(e.target.value))}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full appearance-none shadow-sm"
              >
                {lookupTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
           </div>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 ml-1">Search Entries</label>
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={`Search ${lookupTypeOptions.find(o => o.value === selectedType)?.label}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full shadow-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 uppercase text-xs font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                {writeAllowed && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {loading && lookups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-8 w-8 bg-slate-200 rounded-full mb-3"></div>
                      <p>Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLookups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium">
                    No entries found in this category.
                  </td>
                </tr>
              ) : (
                filteredLookups.map((lookup) => (
                  <tr key={lookup.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                        {lookup.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{lookup.name}</td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{lookup.description || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${lookup.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {lookup.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {writeAllowed && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEditModal(lookup)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Delete this entry?')) removeLookup(lookup.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <GenericModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingLookup ? `Edit ${formData.name}` : `Add New Entry`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
            <input 
              type="text" 
              required
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              className="form-input"
              placeholder="e.g. FULL_TIME"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="form-input"
              placeholder="e.g. Full-time"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="form-input min-h-[80px]"
              placeholder="Optional description..."
            />
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-slate-700">Is Active</label>
          </div>
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-2.5 flex justify-center items-center font-semibold"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                editingLookup ? 'Update Entry' : 'Create Entry'
              )}
            </button>
          </div>
        </form>
      </GenericModal>
    </div>
  );
}
