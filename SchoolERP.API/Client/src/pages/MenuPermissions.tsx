import { useState, useEffect, useCallback, useMemo } from 'react';
import { Shield, ChevronRight, Save, Loader2, User, Search, Eye, Edit3, TypeIcon as type, Layers, ChevronDown, Trash2, RefreshCw } from 'lucide-react';
import apiClient from '../api/apiClient';

interface MenuMaster {
  key: string;
  label: string;
  icon?: string;
  type: string;
  parentKey?: string | null;
  sortOrder: number;
}

interface PermissionItem {
  menuKey: string;
  canRead: boolean;
  canWrite: boolean;
}

import { usePermissions } from '../hooks/usePermissions';

const DEFAULT_ROLES = ['Admin', 'Teacher', 'Accountant', 'HR-Manager', 'Office-Staff'];

export default function MenuPermissions() {
  const { hasWritePermission, updatePermissionsBulk } = usePermissions();
  const writeAllowed = hasWritePermission('menu_permissions');
  const [tab, setTab] = useState<'role' | 'user'>('role');
  const [items, setItems] = useState<{ id?: string; name: string; role?: string; email?: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [search, setSearch] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedMenus, setSelectedMenus] = useState<PermissionItem[]>([]);
  const [dynamicMenus, setDynamicMenus] = useState<MenuMaster[]>([]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [hasOverrides, setHasOverrides] = useState(false);

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchCurrentPermissions = useCallback(async (id: string, isUser: boolean) => {
    setIsLoading(true);
    try {
      const url = isUser ? `/permission/user/${id}` : `/permission/role/${id}`;
      const response = await apiClient.get<any>(url);
      
      if (isUser && response.data.permissions) {
        setSelectedMenus(response.data.permissions);
        setHasOverrides(response.data.hasOverrides);
      } else if (isUser && response.data.hasOverrides !== undefined) {
        // Handle cases where the response might be structured differently but contains the flag
        setSelectedMenus(response.data.permissions || []);
        setHasOverrides(response.data.hasOverrides);
      } else {
        // Fallback for simple list responses
        const perms = Array.isArray(response.data) ? response.data : (response.data.permissions || []);
        setSelectedMenus(perms);
        setHasOverrides(isUser && perms.length > 0);
      }
    } catch (err) {
      console.error('Failed to fetch permissions', err);
      setSelectedMenus([]);
      setHasOverrides(false);
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

  const handleResetOverrides = async () => {
    if (tab !== 'user' || !selectedId) return;
    if (!window.confirm("Are you sure? This will remove all individual overrides and this user will inherit permissions from their Role instead.")) return;

    setIsSaving(true);
    try {
      await apiClient.post('/permission/update', {
        userId: selectedId,
        permissions: [] // Sending empty list causes our backend to delete all override records
      });
      setSelectedMenus([]);
      setHasOverrides(false);
      // Refresh to show inherited role perms
      await fetchCurrentPermissions(selectedId, true);
    } catch (err) {
      console.error('Failed to reset overrides', err);
    } finally {
      setIsSaving(false);
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
          // Only select the first user if there is at least one users
          if (response.data.length > 0) {
              const firstUser = response.data[0];
              setSelectedId(firstUser.id);
          } else {
              setSelectedId('');
          }
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

  const updatePermission = (key: string, field: 'canRead' | 'canWrite', value: boolean) => {
    setSelectedMenus(prev => {
      const existing = prev.find(p => p.menuKey === key);
      const newPerm = existing ? { ...existing } : { menuKey: key, canRead: false, canWrite: false };
      newPerm[field] = value;

      // If granting write access, automatically grant read access
      if (field === 'canWrite' && value) {
        newPerm.canRead = true;
      }
      
      // If revoking read access, automatically revoke write access
      if (field === 'canRead' && !value) {
        newPerm.canWrite = false;
      }

      if (existing) {
        return prev.map(p => p.menuKey === key ? newPerm : p);
      } else {
        return [...prev, newPerm];
      }
    });

    // Handle group cascading
    const menu = dynamicMenus.find(m => m.key === key);
    if (!menu) return;

    if (menu.type === 'Page' && value) {
        // granting permission to a page should also automatically grant READ to the parent group
        if (menu.parentKey) {
            setSelectedMenus(prev => {
                const parentGroup = prev.find(p => p.menuKey === menu.parentKey);
                if (!parentGroup || !parentGroup.canRead) {
                    const newParent = parentGroup ? { ...parentGroup, canRead: true } : { menuKey: menu.parentKey!, canRead: true, canWrite: false };
                    if (parentGroup) return prev.map(p => p.menuKey === menu.parentKey ? newParent : p);
                    return [...prev, newParent];
                }
                return prev;
            });
        }
    } else if (menu.type === 'Group' && !value && field === 'canRead') {
        // revoking READ to a group should revoke EVERYTHING from its pages automatically
        const childrenKeys = dynamicMenus.filter(m => m.parentKey === key).map(m => m.key);
        if (childrenKeys.length > 0) {
            setSelectedMenus(prev => prev.map(p => {
                if (childrenKeys.includes(p.menuKey)) {
                    return { ...p, canRead: false, canWrite: false };
                }
                return p;
            }));
        }
    }
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      const requestPayload = {
        roleName: tab === 'role' ? selectedId : undefined,
        userId: tab === 'user' ? selectedId : undefined,
        permissions: selectedMenus.map(sm => ({ 
            menuKey: sm.menuKey, 
            canRead: sm.canRead, 
            canWrite: sm.canWrite 
        }))
      };

      const success = await updatePermissionsBulk(requestPayload);
      if (success) {
        if (tab === 'user') setHasOverrides(true);
        alert('Permissions saved successfully. Current session privileges updated.');
      }
    } catch (err) {
      console.error('Failed to save permissions', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.email?.toLowerCase().includes(search.toLowerCase()));

  // Groups and their specific pages
  const treeData = useMemo(() => {
    const flatPages = dynamicMenus.filter(m => m.type === 'Page');
    const flatGroups = dynamicMenus.filter(m => m.type === 'Group');
    const flatUndefined = dynamicMenus.filter(m => !m.type || (m.type !== 'Page' && m.type !== 'Group'));
    
    // 1. Groups will be the primary containers
    const resultGroups = flatGroups.map(grp => ({
        ...grp,
        children: flatPages.filter(p => p.parentKey === grp.key).sort((a,b) => a.sortOrder - b.sortOrder)
    })).sort((a,b) => a.sortOrder - b.sortOrder);

    // 2. Only show root pages if they have NO parent AND are not already part of dynamic tree
    const rootItems = [...flatPages.filter(p => !p.parentKey), ...flatUndefined];

    return { rootPages: rootItems, groups: resultGroups };
  }, [dynamicMenus]);

  return (
    <div className={`max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10 ${!writeAllowed ? 'is-read-only-view' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
             <div className="bg-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-200">
               <Shield className="h-6 w-6" />
             </div>
             Granular Menu Controls
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium ml-12">Configure detailed Read & Write permissions hierarchically</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving || !selectedId}
          className="btn-primary shadow-xl shadow-primary-600/20 px-8 py-3.5 flex items-center justify-center gap-2 rounded-2xl text-base font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Apply Privileges
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
          <User className="h-4 w-4" /> Individual Override
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
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[700px] custom-scrollbar pb-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-3">
                 <Loader2 className="h-8 w-8 animate-spin" />
                 <span className="text-xs font-bold uppercase tracking-widest">Scanning Profiles...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">No profiles found.</div>
            ) : filteredItems.map(item => {
              const itemId = item.id || item.name;
              return (
                <button
                  key={itemId}
                  onClick={() => setSelectedId(itemId)}
                  className={`w-full flex items-center justify-between px-6 py-4 text-sm transition-all relative group ${
                    selectedId === itemId 
                    ? 'bg-primary-50 text-primary-800' 
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
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate mt-0.5">
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-1 pb-10">
             <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary-100/50 text-primary-700 flex items-center justify-center font-bold text-lg shadow-sm border border-primary-100">
                    {tab === 'role' ? <Shield className="h-6 w-6" /> : <User className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">Privilege Matrix</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm text-slate-500 font-medium">Matrix for <span className="text-primary-600 font-bold px-1 bg-primary-50 rounded-md">{items.find(r => (r.id || r.name) === selectedId)?.name || 'target'}</span></p>
                      {tab === 'user' && hasOverrides && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                          Custom Overrides
                        </span>
                      )}
                      {tab === 'user' && !hasOverrides && (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          Inheriting Role Settings
                        </span>
                      )}
                    </div>
                  </div>
               </div>
               <div className="flex flex-col items-end gap-1">
                 <div className="flex gap-4 mb-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <div className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-blue-500"/> View Only</div>
                    <div className="flex items-center gap-1.5"><Edit3 className="h-3.5 w-3.5 text-emerald-500"/> Full Edit</div>
                 </div>
                  {tab === 'user' && (
                    <button
                      onClick={handleResetOverrides}
                      disabled={isSaving}
                      className="flex flex-row items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors border border-red-100 disabled:opacity-50 mt-1 shadow-sm"
                    >
                      <RefreshCw className={isSaving ? "h-3 w-3 animate-spin" : "h-3 w-3"} />
                      Reset to Role Inherit
                    </button>
                  )}
               </div>
             </div>
             
             <div className="p-0">
               {/* Standalone Pages */}
               <div className="divide-y divide-slate-100">
                  {treeData.rootPages.map(page => {
                      const pState = selectedMenus.find(p => p.menuKey === page.key) || { canRead: false, canWrite: false };
                      return (
                          <div key={page.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors group">
                               <div className="flex items-center gap-3">
                                   <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all">
                                       <Layers className="h-4 w-4" />
                                   </div>
                                   <div>
                                       <span className="font-semibold text-slate-700 block">{page.label}</span>
                                       <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Core Engine Page</span>
                                   </div>
                               </div>
                               <div className="flex items-center gap-3 mt-4 sm:mt-0 pl-11 sm:pl-0">
                                   <button 
                                      onClick={() => updatePermission(page.key, 'canRead', !pState.canRead)}
                                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${pState.canRead ? 'bg-blue-50 text-blue-700 border-blue-200/50' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                   >
                                      <Eye className={`h-3.5 w-3.5 ${pState.canRead ? 'text-blue-500' : 'text-slate-400'}`} />
                                      {pState.canRead ? 'Read Access' : 'No Read'}
                                   </button>
                                   <button 
                                      onClick={() => updatePermission(page.key, 'canWrite', !pState.canWrite)}
                                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${pState.canWrite ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                   >
                                      <Edit3 className={`h-3.5 w-3.5 ${pState.canWrite ? 'text-emerald-500' : 'text-slate-400'}`} />
                                      {pState.canWrite ? 'Write Access' : 'No Write'}
                                   </button>
                               </div>
                          </div>
                      )
                  })}
               </div>

               {/* Group Hierarchy */}
               <div className="space-y-6 p-6 bg-slate-50/50">
                  {treeData.groups.map(group => {
                      const gState = selectedMenus.find(p => p.menuKey === group.key) || { canRead: false, canWrite: false };
                      return (
                          <div key={group.key} className="bg-white border text-sm border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                              <div 
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 bg-slate-50/80 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors"
                                onClick={() => toggleGroup(group.key)}
                              >
                                  <div className="flex items-center gap-3">
                                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${gState.canRead ? 'bg-primary-600 text-white shadow-md shadow-primary-200' : 'bg-slate-200 text-slate-500'}`}>
                                          <Shield className="h-5 w-5" />
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-2">
                                            <span className={`text-base font-bold tracking-tight block ${gState.canRead ? 'text-slate-800' : 'text-slate-500'}`}>{group.label}</span>
                                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${openGroups[group.key] ? 'rotate-180' : ''}`} />
                                          </div>
                                          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Navigation Group</span>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-3 mt-4 sm:mt-0">
                                       <button 
                                          onClick={(e) => { e.stopPropagation(); updatePermission(group.key, 'canRead', !gState.canRead); }}
                                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${gState.canRead ? 'bg-blue-50 text-blue-700 border-blue-200/50 hover:bg-blue-100' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                       >
                                          <Eye className={`h-3.5 w-3.5 ${gState.canRead ? 'text-blue-500' : 'text-slate-400'}`} />
                                          {gState.canRead ? 'Appears in Sidebar' : 'Hidden from Sidebar'}
                                       </button>
                                  </div>
                              </div>
                              {openGroups[group.key] && (
                                <div className="divide-y divide-slate-50 pl-2 animate-in slide-in-from-top-2 duration-200">
                                  {group.children.length === 0 && (
                                     <div className="p-4 pl-14 text-xs font-semibold text-slate-400 uppercase tracking-widest">No Sub-Pages Registered</div>
                                  )}
                                  {group.children.map(page => {
                                      const pState = selectedMenus.find(p => p.menuKey === page.key) || { canRead: false, canWrite: false };
                                      return (
                                          <div key={page.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 px-5 hover:bg-indigo-50/10 transition-colors">
                                              <div className="flex items-center gap-4">
                                                  <div className="w-6 border-b-2 border-l-2 border-slate-100 h-6 rounded-bl-lg mb-4 ml-2 opacity-60"></div>
                                                  <span className={`font-semibold transition-colors ${pState.canRead ? 'text-slate-700' : 'text-slate-400'}`}>{page.label}</span>
                                              </div>
                                              <div className="flex items-center gap-2 mt-2 sm:mt-0 pl-[3.25rem] sm:pl-0">
                                                  <button 
                                                      onClick={() => updatePermission(page.key, 'canRead', !pState.canRead)}
                                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${pState.canRead ? 'bg-blue-50 text-blue-700 border-blue-200/50' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                                  >
                                                      <Eye className={`h-3.5 w-3.5 ${pState.canRead ? 'text-blue-500' : 'text-slate-400'}`} /> Read
                                                  </button>
                                                  <button 
                                                      onClick={() => updatePermission(page.key, 'canWrite', !pState.canWrite)}
                                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${pState.canWrite ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                                  >
                                                      <Edit3 className={`h-3.5 w-3.5 ${pState.canWrite ? 'text-emerald-500' : 'text-slate-400'}`} /> Write
                                                  </button>
                                              </div>
                                          </div>
                                      );
                                  })}
                                </div>
                              )}
                          </div>
                      );
                  })}
               </div>

             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
