import { useEffect, useState } from 'react';
import { useMasters } from '../hooks/useMasters';
import { Plus, Edit2, Trash2, Search, ArrowRight } from 'lucide-react';
import { GenericModal } from '../components/GenericModal';
import { masterApi } from '../api/masterApi';

function SelectField({ field, value, onChange }: { field: any, value: any, onChange: (val: any) => void }) {
  const [options, setOptions] = useState<{ label: string; value: any }[]>(field.options || []);
  const [loading, setLoading] = useState(field.endpoint ? true : false);

  useEffect(() => {
    if (field.endpoint) {
      masterApi.getAll(field.endpoint).then(data => {
        setOptions(data.map((item: any) => ({
          label: item.name || item.className || item.title || item.roomNo || item.id,
          value: item.id
        })));
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [field.endpoint, field.options]);

  return (
    <select 
      required={field.required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all font-medium disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[size:1.5em_1.5em] bg-no-repeat pr-10"
      disabled={loading}
    >
      <option value="">Select {field.label}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

interface MasterPageProps {
  title: string;
  subtitle: string;
  endpoint: string;
  columns: { key: string; label: string; render?: (val: any) => React.ReactNode }[];
  formFields: { 
    name: string; 
    label: string; 
    type: 'text' | 'number' | 'date' | 'checkbox' | 'select' ; 
    required?: boolean;
    defaultValue?: any;
    options?: { label: string; value: any }[];
    endpoint?: string;
    visibleIf?: (formData: any) => boolean;
  }[];
  renderToolbar?: () => React.ReactNode;
}

export default function MasterDataPage({ title, subtitle, endpoint, columns, formFields, renderToolbar }: MasterPageProps) {
  const { masters, loading, error, fetchMasters, addMaster, updateMaster, removeMaster } = useMasters(endpoint);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaster, setEditingMaster] = useState<any | null>(null);
  
  const initialData = formFields.reduce((acc, f) => ({ ...acc, [f.name]: f.defaultValue ?? (f.type === 'checkbox' ? true : '') }), {});
  const [formData, setFormData] = useState<any>(initialData);

  useEffect(() => {
    fetchMasters();
  }, [fetchMasters]);

  const handleOpenAddModal = () => {
    setEditingMaster(null);
    setFormData(initialData);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (master: any) => {
    setEditingMaster(master);
    const formattedData = { ...master };
    formFields.forEach(f => {
      if (f.type === 'date' && master[f.name]) {
        // Handle ISO string or Date object and convert to yyyy-MM-dd
        try {
          formattedData[f.name] = new Date(master[f.name]).toISOString().substring(0, 10);
        } catch {
          formattedData[f.name] = master[f.name];
        }
      }
    });
    setFormData(formattedData);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Scrub hidden fields
    const scrubbedData = { ...formData };
    formFields.forEach(field => {
      if (field.visibleIf && !field.visibleIf(formData)) {
        scrubbedData[field.name] = field.defaultValue ?? (field.type === 'checkbox' ? false : '');
      }
    });

    let success = false;
    if (editingMaster) {
      success = await updateMaster(editingMaster.id, scrubbedData);
    } else {
      success = await addMaster(scrubbedData);
    }
    if (success) setIsModalOpen(false);
  };

  const filteredMasters = masters.filter(m => 
    Object.values(m).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <span className="p-1.5 bg-primary-100 rounded-md">Masters</span>
            <ArrowRight className="h-3 w-3" />
            <span>{title}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title} Management</h1>
          <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          {renderToolbar?.()}
          <button 
            onClick={handleOpenAddModal}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New {title}
          </button>
        </div>
      </div>

      <div className="relative group max-w-lg">
        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary-500" />
        <input 
          type="text" 
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full shadow-sm transition-shadow focus:shadow-md"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 uppercase text-[10px] font-bold text-slate-400 border-b border-slate-200 tracking-widest ">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-4">{col.label}</th>
                ))}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {loading && masters.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-8 w-8 bg-slate-200 rounded-full mb-3" />
                      <p className="font-medium">Loading {title}...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMasters.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredMasters.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    {columns.map(col => (
                      <td key={col.key} className="px-6 py-4">
                        {col.render ? col.render(item[col.key]) : (
                          <span className="text-slate-700 font-medium">{String(item[col.key])}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors shadow-sm bg-white"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this record?')) removeMaster(item.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm bg-white"
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

      <GenericModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingMaster ? `Update ${title}` : `Create ${title}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formFields.map(field => {
            const isVisible = field.visibleIf ? field.visibleIf(formData) : true;
            if (!isVisible) return null;

            return (
              <div key={field.name} className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{field.label}</label>
                {field.type === 'checkbox' ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <input 
                      type="checkbox" 
                      id={field.name}
                      checked={formData[field.name]}
                      onChange={(e) => setFormData({...formData, [field.name]: e.target.checked})}
                      className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor={field.name} className="text-sm font-medium text-slate-700 cursor-pointer">{field.label}</label>
                  </div>
                ) : field.type === 'select' ? (
                  <SelectField 
                    field={field} 
                    value={formData[field.name]} 
                    onChange={(val) => setFormData({...formData, [field.name]: val})} 
                  />
                ) : (
                  <input 
                    type={field.type}
                    required={field.required}
                    value={formData[field.name]}
                    onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all font-medium"
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                )}
              </div>
            );
          })}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-2.5 flex justify-center items-center shadow-lg hover:shadow-primary-600/20"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                editingMaster ? 'Save Changes' : `Create ${title}`
              )}
            </button>
          </div>
        </form>
      </GenericModal>
    </div>
  );
}
