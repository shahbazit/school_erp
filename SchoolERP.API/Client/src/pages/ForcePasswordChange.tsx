import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';

export default function ForcePasswordChange() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // We'll use the existing reset-password endpoint or a specialized one
      // For now, let's assume we can use a "update-my-password" logic
      const response = await apiClient.post('/auth/reset-password-force', {
        newPassword: password
      });

      if (response.data.success) {
        toast.success("Password updated successfully! Welcome to your portal.");
        navigate('/');
      } else {
        setError(response.data.errors?.[0] || "Failed to update password.");
      }
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          <div className="bg-primary-600 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Lock className="h-24 w-24" />
            </div>
            <ShieldCheck className="h-10 w-10 mb-4" />
            <h1 className="text-2xl font-black mb-2">Secure Your Account</h1>
            <p className="text-primary-100 text-xs font-medium leading-relaxed">
              For your security, we require all new portal accounts to set a personal password before continuing.
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-[11px] font-bold text-red-600 uppercase tracking-tight leading-normal">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 characters"
                    className="w-full bg-slate-50 border-0 pl-11 pr-4 py-3.5 rounded-2xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CheckCircle2 className="h-4 w-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-slate-50 border-0 pl-11 pr-4 py-3.5 rounded-2xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl text-xs font-black text-white bg-primary-600 shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Update & Continue
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-50 text-center">
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Your new password will be your official key to the parent portal. Choose something secure that you'll remember.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
