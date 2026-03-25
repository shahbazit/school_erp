import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, Home, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setLocalError('Invalid or missing reset token/email. Please request a new link.');
    }
  }, [token, email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    const result = await resetPassword({
      email,
      token,
      newPassword: formData.password
    });

    if (result) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #dee2e6 1px, transparent 0)', backgroundSize: '40px 40px' }}
      ></div>

      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-600 transition-colors font-medium">
          <Home className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-[400px] z-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center text-primary-600 font-bold">
            <GraduationCap className="h-8 w-8 mr-2" />
            <span className="text-2xl">SchoolERP</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {success ? (
            <div className="text-center animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Password Reset!</h2>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Your password has been successfully updated. Redirecting to login...
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold text-xs shadow-sm hover:bg-primary-700 transition-all"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Reset Password</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your new password below.
                </p>
              </div>

              {(error || localError) && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-xs border border-red-100 shadow-sm mb-6 font-medium">
                  {error || localError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-0 pl-10 pr-10 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-0 pl-10 pr-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !!localError}
                  className="bg-primary-600 text-white px-8 py-2.5 rounded-lg font-bold text-xs shadow-sm shadow-primary-500/30 hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all w-full disabled:opacity-70 flex justify-center items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
