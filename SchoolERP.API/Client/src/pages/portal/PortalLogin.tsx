import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { GraduationCap, Home, Users, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { toast } from 'react-toastify';

interface PortalLoginProps {
  onAuthSuccess: () => void;
}

export default function PortalLogin({ onAuthSuccess }: PortalLoginProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    schoolDomain: '',
    identifier: '',
    password: ''
  });

  const { login, loading, error } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({
      email: formData.identifier,
      password: formData.password,
      schoolDomain: formData.schoolDomain
    });
    if (result.success) {
      if (result.requiresPasswordChange) {
        navigate('/force-password-change');
      } else {
        toast.success(`Welcome to the Community Portal!`);
        onAuthSuccess();
      }
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* Side Section: Shared Community Identity */}
      <div className="hidden lg:flex lg:w-5/12 bg-slate-50 items-center justify-center p-12 relative border-r border-slate-200">
        <div 
          className="absolute inset-0 opacity-50"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #dee2e6 1px, transparent 0)', backgroundSize: '40px 40px' }}
        ></div>

        <div className="text-slate-900 text-center z-10 py-12">
          <div className="inline-flex items-center mb-8 text-emerald-600 font-bold">
            <GraduationCap className="h-8 w-8 mr-3" />
            <span className="text-3xl m-0 tracking-tight">Community Portal</span>
          </div>
          
          <div className="mx-auto max-w-[320px]">
            <h1 className="text-2xl font-black mb-4">Your secondary home.</h1>
            <p className="text-xs text-slate-500 mb-0 leading-relaxed mx-auto max-w-[280px]">
              Access academic records, stay updated with school events, and manage progress in one simple place for both students and parents.
            </p>

            <div className="mt-12 space-y-4 text-left">
              <div className="p-5 rounded-2xl border bg-white border-emerald-200 shadow-xl shadow-emerald-500/5 transition-all duration-300">
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-2 tracking-widest">Unified Access</p>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">One secure login for students and parents to access grades, attendance, and fee management.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section: Shared Clean Layout */}
      <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-6 relative bg-white">
        <div className="absolute top-6 right-6">
          <Link to="/" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-600 transition-colors font-bold uppercase tracking-wide">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </div>

        <div className="w-full max-w-[380px]">
          <div className="mb-10 text-center lg:text-left">
            <h5 className="font-black text-slate-900 text-2xl mb-1.5">Portal Login</h5>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Access for Students & Parents</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500"></div>
               <p className="text-[11px] font-medium text-red-600 m-0">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-5">
              {/* Domain Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">School Domain / Code</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input 
                    name="schoolDomain" 
                    required 
                    value={formData.schoolDomain} 
                    onChange={handleChange} 
                    autoComplete="off"
                    placeholder="e.g. greenschool" 
                    className="w-full bg-slate-50 border-0 pl-11 pr-4 py-3.5 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Identifier Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Admission No / Mobile / Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShieldCheck className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input 
                    name="identifier" 
                    required 
                    value={formData.identifier} 
                    onChange={handleChange} 
                    placeholder="ADM101 or 9876543210" 
                    className="w-full bg-slate-50 border-0 pl-11 pr-4 py-3.5 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <Link to="/forgot-password" className="text-[10px] font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-wide">Forgot?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShieldCheck className="h-4 w-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="••••••••" 
                    className="w-full bg-slate-50 border-0 pl-11 pr-4 py-3.5 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-xs font-black text-white shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-700"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Connect to Portal
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
            <Link to="/login" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors tracking-widest uppercase">
              Staff Workspace Login
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
