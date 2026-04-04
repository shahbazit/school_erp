import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, Home, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface AuthProps {
  onAuthSuccess: () => void;
  initialIsLogin?: boolean;
}

export default function Auth({ onAuthSuccess, initialIsLogin = true }: AuthProps) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [loginRole] = useState<'institution'>('institution');
  const [step, setStep] = useState(1);
  const [registrationUid, setRegistrationUid] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState(false);
  
  const { login, registerStepOne, finalizeRegistration, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    // Step 1
    email: '',
    mobileNumber: '',
    password: '',
    firstName: '',
    lastName: '',
    // Step 2
    schoolName: '',
    schoolDomain: '',
    city: '',
    address: '',
    otp: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const success = await login({ 
        email: formData.email, 
        password: formData.password
      });
      if (success) {
        toast.success("Welcome back! Login successful.");
        onAuthSuccess();
      }
    } else {
      if (step === 1) {
        const response = await registerStepOne({
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        });
        
        if (response && response.success) {
          toast.info("Initial registration successful. Proceeding to school details.");
          setRegistrationUid(response.token || null);
          setStep(2);
        }
      } else {
        const success = await finalizeRegistration({
          registrationUid,
          schoolName: formData.schoolName,
          schoolDomain: formData.schoolDomain,
          city: formData.city,
          address: formData.address,
          otp: formData.otp
        });

        if (success) {
          toast.success("Registration completed successfully!");
          setVerifySuccess(true);
          setTimeout(() => {
            onAuthSuccess();
          }, 1500);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* Side Section: Minimal Brand Identity */}
      <div className="hidden lg:flex lg:w-5/12 bg-slate-50 items-center justify-center p-12 relative border-r border-slate-200">
        <div 
          className="absolute inset-0 opacity-50"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #dee2e6 1px, transparent 0)', backgroundSize: '40px 40px' }}
        ></div>

        <div className="text-slate-900 text-center z-10 py-12">
          <div className="inline-flex items-center mb-8 text-primary-600 font-bold">
            <GraduationCap className="h-8 w-8 mr-3" />
            <span className="text-3xl m-0">SchoolERP</span>
          </div>
          <div className="mx-auto max-w-[320px] text-left text-center">
            <h1 className="text-2xl font-bold mb-4">
              {isLogin ? 'Welcome back!' : 'Get started today.'}
            </h1>
            <p className="text-xs text-slate-500 mb-0 leading-relaxed mx-auto">
              {isLogin 
                ? 'Manage your school with precision and ease in one unified workspace.'
                : 'Join SchoolERP today and start managing your operations efficiently.'}
            </p>

            {!isLogin && (
               <ul className="list-none grid gap-4 mt-8 text-left">
                  <li className="flex items-center gap-3 text-xs text-slate-500">
                      <span className={`flex items-center justify-center rounded-full w-6 h-6 shadow-sm ${step === 1 ? 'bg-primary-600 text-white' : 'bg-green-500 text-white'}`}>
                          {step > 1 ? <CheckCircle className="h-3.5 w-3.5" /> : '1'}
                      </span>
                      <span className={`${step === 1 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>Personal Details</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs text-slate-500">
                      <span className={`flex items-center justify-center rounded-full w-6 h-6 ${step === 2 ? 'bg-primary-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                          2
                      </span>
                      <span className={`${step === 2 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>School Details & OTP</span>
                  </li>
              </ul>
            )}

            {isLogin && (
              <div className="mt-12 space-y-4 max-w-[280px] mx-auto">
                <div className="p-5 rounded-2xl border bg-white border-primary-200 shadow-xl shadow-primary-500/5 transform scale-105">
                  <p className="text-[10px] font-bold text-primary-600 uppercase mb-2 tracking-widest">Workspace Access</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">Official administrative portal for School Leaders, Teachers, and Operations staff.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Section: Minimal & Compact */}
      <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-6 relative bg-white">
        <div className="absolute top-6 right-6">
          <Link to="/" className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-600 transition-colors font-medium">
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="w-full max-w-[380px]">
          <div className="flex justify-between items-center mb-10 lg:hidden text-primary-600 font-bold mt-8">
            <div className="flex items-center">
              <GraduationCap className="h-6 w-6 mr-2" />
              <span className="text-xl">SchoolERP</span>
            </div>
          </div>

          <div className="mb-6 text-center lg:text-left">
            <h5 className="font-bold text-slate-900 text-xl mb-1">
              {isLogin ? 'Institution Login' : (step === 1 ? 'Create Account' : 'School Details')}
            </h5>
            <p className="text-slate-500 text-xs m-0">
              {isLogin ? 'Official workspace access for school faculty.' : `Step ${step} of 2: ${step === 1 ? 'Personal Details' : 'Institute Information'}`}
            </p>
          </div>



          {verifySuccess ? (
            <div className="text-center animate-pulse">
                <div className="mb-4 flex justify-center">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h4 className="font-bold text-slate-900 mb-3">Registration Successful!</h4>
                <p className="text-slate-500 text-xs mb-2">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isLogin ? (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Institutional Email / Employee Code
                    </label>
                    <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border-0 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
                      <Link to="/forgot-password" className="block text-[10px] font-bold text-primary-600 hover:text-primary-500 transition-colors">Forgot?</Link>
                    </div>
                    <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full bg-slate-50 border-0 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" />
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center">
                      <input id="remember-me" name="remember-me" type="checkbox" className="h-3.5 w-3.5 text-primary-600 focus:ring-primary-500 border-slate-300 rounded" />
                      <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-500">Keep me logged in</label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {step === 1 ? (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">First Name</label>
                          <input name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full bg-slate-50 border-0 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Last Name</label>
                          <input name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full bg-slate-50 border-0 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Mobile Number</label>
                        <input name="mobileNumber" type="tel" required value={formData.mobileNumber} onChange={handleChange} placeholder="e.g. 9876543210" className="w-full bg-slate-50 border-0 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" />
                      </div>
                      <div className="mb-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Work Email</label>
                        <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border-0 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" />
                      </div>
                      <div className="mb-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
                        <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full bg-slate-50 border-0 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" />
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="mb-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">School/Institute Name</label>
                        <input name="schoolName" required value={formData.schoolName} onChange={handleChange} className="w-full bg-slate-50 border-0 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" />
                      </div>
                      <div className="mb-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Preferred Domain (e.g. myschool.com)</label>
                        <input name="schoolDomain" required value={formData.schoolDomain} onChange={handleChange} className="w-full bg-slate-50 border-0 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">City</label>
                          <input name="city" required value={formData.city} onChange={handleChange} className="w-full bg-slate-50 border-0 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">OTP (from Email)</label>
                          <input name="otp" required maxLength={6} value={formData.otp} onChange={handleChange} placeholder="000000" className="w-full bg-slate-50 border-0 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all text-center tracking-widest font-bold" />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Institute Address</label>
                        <textarea name="address" rows={2} value={formData.address} onChange={handleChange} className="w-full bg-slate-50 border-0 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="text-center pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary-600 shadow-primary-500/30 hover:bg-primary-700 focus:ring-primary-500 text-white px-8 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-all w-full disabled:opacity-70 flex justify-center items-center"
                  >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    isLogin ? 'Sign In to Workspace' : (step === 1 ? 'Next: School Details' : 'Finalize Registration')
                  )}
                </button>
                
                {!isLogin && step === 2 && (
                  <button type="button" onClick={() => setStep(1)} className="mt-3 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                    Back to Step 1
                  </button>
                )}
              </div>

              <div className="text-center pt-2 border-t border-slate-100 mt-6">
                <p className="text-xs text-slate-500 m-0">
                  {isLogin ? 'New school? ' : 'Already have an account? '}
                  <button type="button" onClick={() => { setIsLogin(!isLogin); setStep(1); }} className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
                    {isLogin ? 'Register your institution' : 'Sign In'}
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
