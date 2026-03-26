import { useState, useEffect } from 'react';
import { Shield, Mail, Trash2, Search, CheckCircle, XCircle, User, UserPlus, AlertCircle } from 'lucide-react';
import apiClient from '../api/apiClient';

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get<AppUser[]>('/permission/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">System Users</h1>
          <p className="text-sm text-slate-500 mt-1">Manage login accounts and system access levels across departments.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all w-72 placeholder:text-slate-400"
            />
          </div>
          <button 
            disabled
            className="bg-slate-100 text-slate-400 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-not-allowed border border-slate-200"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Guidance Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-black text-amber-900 leading-none tracking-tight">Streamlined Account Management</p>
          <p className="text-xs text-amber-700 mt-1 font-medium">To ensure automatic data linking, please manage staff login accounts directly from the <span className="underline font-bold">Employee Directory</span>. Standalone user creation is disabled to prevent record mismatch.</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Initial</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User Identity</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-8 h-16 bg-slate-50/20"></td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic font-medium">
                  <div className="flex flex-col items-center gap-2 opacity-60">
                    <User className="h-8 w-8" />
                    <p>No system users found matching your search.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center font-black text-sm uppercase shadow-sm border border-slate-200 ring-2 ring-white">
                      {user.name?.[0] || user.email?.[0] || '?'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-bold text-slate-800 leading-tight">{user.name || 'Unnamed User'}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium italic">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary-50 text-primary-700 text-[11px] font-black uppercase tracking-wider border border-primary-100 shadow-sm leading-none">
                      <Shield className="h-3 w-3" />
                      {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-tight ${user.isEmailVerified ? 'text-emerald-600' : 'text-slate-300'}`}>
                        {user.isEmailVerified ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        Email
                      </div>
                      <div className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-tight ${user.isMobileVerified ? 'text-emerald-600' : 'text-slate-300'}`}>
                        {user.isMobileVerified ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        Mobile
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="Manage Permissions">
                        <Shield className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Revoke Access">
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
  );
}
