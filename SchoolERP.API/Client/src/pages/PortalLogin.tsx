import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, Home, Users, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { toast } from 'react-toastify';

interface PortalLoginProps {
  onAuthSuccess: () => void;
}

export default function PortalLogin({ onAuthSuccess }: PortalLoginProps) {
  const [role, setRole] = useState<'student' | 'parent'>('student');
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
    const success = await login({
      email: formData.identifier,
      password: formData.password,
      schoolDomain: formData.schoolDomain
    });
    if (success) {
      toast.success(`Welcome to the ${role === 'student' ? 'Student' : 'Parent'} Portal!`);
      onAuthSuccess();
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
              Access your academic records, stay updated with school events, and manage your progress in one simple place.
            </p>

            <div className="mt-12 space-y-4 text-left">
              <div className={`p-5 rounded-2xl border transition-all duration-300 ${role === 'student' ? 'bg-white border-emerald-200 shadow-xl shadow-emerald-500/5 transform scale-105' : 'bg-transparent border-slate-200 opacity-40'}`}>
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-2 tracking-widest">Student Portal</p>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">View grades, attendance, and join virtual classrooms effortlessly.</p>
              </div>
              <div className={`p-5 rounded-2xl border transition-all duration-300 ${role === 'parent' ? 'bg-white border-amber-200 shadow-xl shadow-amber-500/5 transform scale-105' : 'bg-transparent border-slate-200 opacity-40'}`}>
                <p className="text-[10px] font-bold text-amber-600 uppercase mb-2 tracking-widest">Parent Dashboard</p>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">Monitor your ward's daily activities and manage fee payments securely.</p>
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
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Secure access for the school community.</p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="flex p-1 bg-slate-100/80 rounded-2xl mb-10">
            <button 
              onClick={() => setRole('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${role === 'student' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Users className="h-4 w-4" />
              Student
            </button>
            <button 
              onClick={() => setRole('parent')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${role === 'parent' ? 'bg-white text-amber-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Users className="h-4 w-4" />
              Parent
            </button>
          </div>

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
                  {role === 'student' ? 'Admission Number' : 'Registered Mobile'}
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
                    placeholder={role === 'student' ? 'ADM101' : '9876543210'} 
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
              className={`w-full py-4 rounded-xl text-xs font-black text-white shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 ${role === 'student' ? 'bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-700' : 'bg-amber-600 shadow-amber-500/20 hover:bg-amber-700'}`}
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
