import { useState, useEffect } from 'react';
import { Building2, BedDouble, User, Coffee, Info, BellRing } from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';

export default function PortalHostel() {
  const { selectedWard } = usePortal();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [selectedWard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">Loading Hostel Info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2rem] p-6 text-slate-800 border border-slate-100 shadow-sm relative overflow-hidden mb-8">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl mb-4 border border-emerald-100">
            <Building2 className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 leading-none">Accommodation</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-2">Hostel Details</h1>
          <p className="text-slate-500 text-sm font-medium">View your room assignment, warden details, and hostel policies.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="h-24 w-24 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100 shadow-inner">
              <BedDouble className="h-10 w-10 relative z-10" />
            </div>
            <div className="text-center md:text-left">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Room</span>
              <h2 className="text-3xl font-black text-slate-800 mt-1 mb-2">Block A - Room 204</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-xs font-bold border border-slate-200">2 Seater</span>
                <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-xs font-bold border border-slate-200">AC</span>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold border border-emerald-100">Allocated</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><User className="h-4 w-4" /></div>
                <h3 className="font-bold text-slate-800">Warden Info</h3>
              </div>
              <p className="font-black text-slate-700">Mr. Sharma</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Block A Supervisor</p>
              <p className="text-xs font-bold text-blue-500 mt-4 bg-blue-50 px-3 py-2 rounded-lg inline-block hover:bg-blue-100 cursor-pointer transition-colors">+91 98765 43210</p>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 text-amber-500 rounded-xl"><Coffee className="h-4 w-4" /></div>
                <h3 className="font-bold text-slate-800">Mess Details</h3>
              </div>
              <p className="font-black text-slate-700">Dining Hall 1</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Vegetarian Plan</p>
              <button className="text-xs font-bold text-amber-600 mt-4 uppercase tracking-widest hover:underline flex items-center gap-1">
                View Menu <Info className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <BellRing className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-white">Leave Requests</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium mb-6">
              Apply for a hostel gate pass or overnight leave ahead of time for approval.
            </p>
            <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
              Request Gate Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
