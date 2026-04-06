import { useState, useEffect } from 'react';
import { BookOpen, Search, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';

export default function PortalLibrary() {
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
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">Loading Library Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2rem] p-6 text-slate-800 border border-slate-100 shadow-sm relative overflow-hidden mb-8">
        <div className="absolute right-0 top-0 w-64 h-64 bg-violet-50/50 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-50 px-4 py-2 rounded-xl mb-4 border border-violet-100">
              <BookOpen className="h-4 w-4 text-violet-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-500 leading-none">Library Center</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-2">My Books</h1>
            <p className="text-slate-500 text-sm font-medium">Track your borrowed books, due dates, and reading history.</p>
          </div>
          
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search library catalog..."
              className="w-full md:w-72 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500/30 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Books Borrowed</p>
            <p className="text-2xl font-black text-slate-800">2</p>
          </div>
          <div className="h-10 w-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Overdue</p>
            <p className="text-2xl font-black text-slate-800">0</p>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-violet-500 rounded-full" />
        Currently Borrowed
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "Advanced Mathematics vol 2", author: "H.C. Verma", issueDate: "01 Apr 2026", dueDate: "15 Apr 2026", status: "Active", color: "blue" },
          { title: "Physics Principles", author: "Resnick Halliday", issueDate: "28 Mar 2026", dueDate: "11 Apr 2026", status: "Due Soon", color: "amber" }
        ].map((book, i) => (
          <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-24 h-32 rounded-xl bg-${book.color}-50 border border-${book.color}-100 flex items-center justify-center shrink-0`}>
              <BookOpen className={`h-8 w-8 text-${book.color}-400`} />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <span className={`self-start px-2 py-1 bg-${book.color}-50 text-${book.color}-600 rounded-md text-[10px] font-black uppercase tracking-widest mb-2`}>
                {book.status}
              </span>
              <h3 className="font-bold text-slate-800 leading-tight mb-1">{book.title}</h3>
              <p className="text-xs font-medium text-slate-500 mb-4">{book.author}</p>
              
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-auto bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Due {book.dueDate}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
