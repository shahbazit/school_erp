import { useState, useEffect } from 'react';
import { Bus, MapPin, Clock, Calendar, AlertCircle } from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';

export default function PortalTransport() {
  const { selectedWard } = usePortal();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading transport data
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [selectedWard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">Loading Transport Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2rem] p-6 text-slate-800 border border-slate-100 shadow-sm relative overflow-hidden mb-8">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl mb-4 border border-blue-100">
            <Bus className="h-4 w-4 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 leading-none">Transport Services</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-2">School Bus Route</h1>
          <p className="text-slate-500 text-sm font-medium">Live tracking and schedule for your assigned transport route.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Route Details */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 bg-blue-500 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Bus className="h-32 w-32" />
              </div>
              <div className="relative z-10">
                <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase mb-4 inline-block">Route 4A</span>
                <h2 className="text-2xl font-black mb-1">Morning Pickup</h2>
                <p className="text-blue-100 font-medium text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Estimated arrival in 15 mins
                </p>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="relative border-l-2 border-slate-200 ml-3 md:ml-4 space-y-8 pb-4">
                <div className="relative pl-6 md:pl-8">
                  <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-1.5 ring-4 ring-emerald-50" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">07:15 AM</p>
                  <p className="font-bold text-slate-800">Bus Left Depot</p>
                  <p className="text-sm text-slate-500 mt-1">Main City Station</p>
                </div>
                <div className="relative pl-6 md:pl-8">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 ring-4 ring-blue-50 animate-pulse" />
                  <p className="text-xs font-black text-blue-500 uppercase tracking-wider mb-1">07:45 AM (Expected)</p>
                  <p className="font-bold text-slate-800">Your Stop</p>
                  <p className="text-sm text-slate-500 mt-1">Greenwood Estate, Gate 2</p>
                </div>
                <div className="relative pl-6 md:pl-8">
                  <div className="absolute w-3 h-3 bg-slate-300 rounded-full -left-[7px] top-1.5" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">08:15 AM</p>
                  <p className="font-bold text-slate-800">School Campus</p>
                  <p className="text-sm text-slate-500 mt-1">Main Entrance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Driver Details</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <span className="text-lg font-black text-slate-500">RK</span>
              </div>
              <div>
                <p className="font-bold text-slate-800">Ram Kumar</p>
                <p className="text-xs text-slate-500 font-medium">License: DL-XXXX-1234</p>
              </div>
            </div>
            <button className="w-full py-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-xl font-bold text-sm transition-colors border border-slate-100">
              Contact Driver
            </button>
          </div>

          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <h4 className="font-bold text-amber-800 text-sm mb-1">Transport Alert</h4>
                <p className="text-xs text-amber-600/80 leading-relaxed font-medium">Due to heavy rain, the evening drop-off might be delayed by 10-15 minutes. Please track the bus live.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
