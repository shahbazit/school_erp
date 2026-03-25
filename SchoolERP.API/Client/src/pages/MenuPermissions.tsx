import { useState, useEffect, useCallback } from 'react';
import { Shield, ChevronRight, Save, Loader2, Check, User, Search } from 'lucide-react';
import apiClient from '../api/apiClient';

interface MenuMaster {
  key: string;
  label: string;
  icon?: string;
}

const DEFAULT_ROLES = ['Admin', 'Teacher', 'Accountant', 'HR-Manager', 'Office-Staff'];

export default function MenuPermissions() {
  const [tab, setTab] = useState<'role' | 'user'>('role');
  const [items, setItems] = useState<{ id?: string; name: string; role?: string; email?: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [search, setSearch] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [dynamicMenus, setDynamicMenus] = useState<MenuMaster[]>([]);

  const fetchCurrentPermissions = useCallback(async (id: string, isUser: boolean) => {
    setIsLoading(true);
    try {
      const url = isUser ? `/permission/user/${id}` : `/permission/role/${id}`;
      const response = await apiClient.get<string[]>(url);
      setSelectedMenus(response.data);
    } catch (err) {
      console.error('Failed to fetch permissions', err);
      setSelectedMenus([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllModules = async () => {
    try {
      const response = await apiClient.get<MenuMaster[]>('/permission/menus');
      setDynamicMenus(response.data);
    } catch (err) {
      console.error('Failed to fetch global menus', err);
    }
  };

  useEffect(() => {
    fetchAllModules();
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      try {
        if (tab === 'role') {
          setItems(DEFAULT_ROLES.map(r => ({ name: r })));
          setSelectedId(DEFAULT_ROLES[0]);
        } else {
          const response = await apiClient.get<any[]>('/permission/users');
          setItems(response.data);
          if (response.data.length > 0) setSelectedId(response.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load items', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadItems();
  }, [tab]);

  useEffect(() => {
    if (selectedId) {
      fetchCurrentPermissions(selectedId, tab === 'user');
    }
  }, [selectedId, tab, fetchCurrentPermissions]);

  const toggleMenu = (key: string) => {
    setSelectedMenus(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      const payload = tab === 'user' 
        ? { userId: selectedId, menuKeys: selectedMenus }
        : { roleName: selectedId, menuKeys: selectedMenus };
        
      await apiClient.post('/permission/update', payload);
      alert('Permissions saved successfully');
    } catch (err) {
      console.error('Failed to save permissions', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
             <div className="bg-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-200">
               <Shield className="h-6 w-6" />
             </div>
             Menu Access Control
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium ml-12">Configure dynamic sidebar modules per {tab === 'role' ? 'Role' : 'Individual User'}</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving || !selectedId}
          className="btn-primary shadow-xl shadow-primary-600/20 px-8 py-3.5 flex items-center justify-center gap-2 rounded-2xl text-base font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Update Permissions
        </button>
      </div>

      {/* Tab Selector */}
      <div className="inline-flex p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200">
        <button 
          onClick={() => setTab('role')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tab === 'role' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Shield className="h-4 w-4" /> By Role
        </button>
        <button 
          onClick={() => setTab('user')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tab === 'user' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <User className="h-4 w-4" /> By User
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selection Column */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/30">
             <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder={`Search ${tab === 'role' ? 'roles' : 'users'}...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300"
                />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-3">
                 <Loader2 className="h-8 w-8 animate-spin" />
                 <span className="text-xs font-bold uppercase tracking-widest">Scanning Catalog...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">No results found matching your search.</div>
            ) : filteredItems.map(item => {
              const itemId = item.id || item.name;
              return (
                <button
                  key={itemId}
                  onClick={() => setSelectedId(itemId)}
                  className={`w-full flex items-center justify-between px-6 py-4.5 text-sm transition-all relative group ${
                    selectedId === itemId 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-slate-600 hover:bg-slate-50/50 hover:text-slate-900 focus:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                      selectedId === itemId ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                    }`}>
                      {tab === 'role' ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-bold truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate">
                         {tab === 'user' ? (item.role || 'Member') : 'System Entry'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${selectedId === itemId ? 'translate-x-1 opacity-100 text-primary-600' : 'opacity-20 translate-x-0'}`} />
                  
                  {selectedId === itemId && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-1">
             <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shadow-sm">
                    {tab === 'role' ? <Shield className="h-6 w-6" /> : <User className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">Assign Modules</h3>
                    <p className="text-sm text-slate-500 font-medium">Control module visibility for <span className="text-primary-600 font-bold">{items.find(r => (r.id || r.name) === selectedId)?.name || 'target'}</span></p>
                  </div>
               </div>
               <div className="flex flex-col items-end">
                  <div className="text-[10px] font-black text-white bg-primary-600 px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary-200">
                    {selectedMenus.length} Enabled
                  </div>
               </div>
             </div>
             
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {dynamicMenus.map(menu => (
                    <button
                      key={menu.key}
                      onClick={() => toggleMenu(menu.key)}
                      className={`p-6 rounded-3xl border-2 transition-all duration-300 flex items-start gap-4 text-left group hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] ${
                        selectedMenus.includes(menu.key)
                        ? 'bg-primary-50/30 border-primary-200 ring-4 ring-primary-50/20'
                        : 'bg-white border-slate-100 hover:border-slate-300 grayscale-[0.8] hover:grayscale-0'
                      }`}
                    >
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition shadow-md ${
                        selectedMenus.includes(menu.key) ? 'bg-primary-600 text-white shadow-primary-200 rotate-3' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                      }`}>
                         {selectedMenus.includes(menu.key) ? <Check className="h-6 w-6 stroke-[3px]" /> : <Shield className="h-6 w-6 opacity-30" />}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className={`font-semibold text-base leading-tight ${selectedMenus.includes(menu.key) ? 'text-primary-900' : 'text-slate-700'}`}>{menu.label}</p>
                        <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed opacity-80 group-hover:opacity-100">
                          Allow access to this module
                        </p>
                      </div>
                      <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                        selectedMenus.includes(menu.key) ? 'bg-primary-600 border-primary-600 rotate-12 scale-110 shadow-lg' : 'bg-white border-slate-200'
                      }`}>
                         {selectedMenus.includes(menu.key) && <div className="h-2.5 w-2.5 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
             
             <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center gap-4 text-slate-500">
                   <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 text-primary-600">
                     <Shield className="h-5 w-5" />
                   </div>
                   <p className="text-xs leading-normal font-medium max-w-lg">
                      {tab === 'user' 
                        ? "User-specific settings act as an override. If you enable a module here for a user, they'll see it regardless of their role settings." 
                        : "Role-level settings affect all users who haven't been given specific custom overrides."}
                   </p>
                </div>
             </div>
          </div>

          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex gap-4">
             <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
               <Shield className="h-6 w-6 animate-pulse" />
             </div>
             <div className="flex-1 pt-0.5">
                <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Security Protocol Check</p>
                <p className="text-xs text-amber-700/80 mt-1 font-bold leading-relaxed">
                   Changes to permissions are immediate in the database, but users may need to refresh their session or re-log to update their sidebar state if they are currently active.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
