import { useState, useEffect } from 'react';
import { 
  Library, Book, History, Plus, Search, 
  Trash2, Edit, CheckCircle, AlertCircle, 
  User, Calendar, Hash, Bookmark, BookOpen, Layers
} from 'lucide-react';
import { libraryApi, LibraryBook, LibraryCategory, LibraryBookIssue } from '../api/libraryApi';
import { studentApi } from '../api/studentApi';
import { employeeApi } from '../api/employeeApi';
import { Student } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';

export default function LibraryManagement() {
  const [activeTab, setActiveTab] = useState<'books' | 'issues' | 'categories'>('books');
  const [loading, setLoading] = useState(true);
  
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [issues, setIssues] = useState<LibraryBookIssue[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const [showBookModal, setShowBookModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { formatCurrency, formatDate } = useLocalization();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, cRes, iRes, sRes, eRes] = await Promise.all([
        libraryApi.getBooks(),
        libraryApi.getCategories(),
        libraryApi.getIssues(),
        studentApi.getAll({ pageSize: 1000 }),
        employeeApi.getShortList()
      ]);
      setBooks(bRes.data);
      setCategories(cRes.data);
      setIssues(iRes.data);
      setStudents(sRes.data);
      setEmployees(eRes);
    } catch (error) {
      console.error('Failed to load library data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      if (selectedItem) {
        await libraryApi.updateBook(selectedItem.id, data as any);
      } else {
        await libraryApi.createBook(data as any);
      }
      setShowBookModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to save book', error);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      if (selectedItem) {
        await libraryApi.updateCategory(selectedItem.id, data as any);
      } else {
        await libraryApi.createCategory(data as any);
      }
      setShowCategoryModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to save category', error);
    }
  };

  const handleIssueBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      bookId: formData.get('bookId') as string,
      studentId: formData.get('studentId') as string || undefined,
      employeeId: formData.get('employeeId') as string || undefined,
      issueDate: new Date().toISOString(),
      dueDate: formData.get('dueDate') as string
    };

    if (!data.bookId || (!data.studentId && !data.employeeId)) {
        alert("Please select a book and a person (Student or Staff)");
        return;
    }

    try {
      await libraryApi.issueBook(data as any);
      setShowIssueModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to issue book', error);
      alert("Error issuing book. It might be out of stock.");
    }
  };

  const handleReturnBook = async (issueId: string) => {
    const fine = prompt("Enter fine amount (if any):", "0");
    const remarks = prompt("Enter remarks (optional):", "");
    
    if (fine === null) return;

    try {
      await libraryApi.returnBook(issueId, {
        returnDate: new Date().toISOString(),
        fineAmount: parseFloat(fine) || 0,
        remarks: remarks || undefined
      });
      loadData();
    } catch (error) {
      console.error('Failed to return book', error);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await libraryApi.deleteBook(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete book', error);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Library className="h-7 w-7 text-primary-600" />
            Library Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold opacity-60">Manage Books, Inventory & Circulation</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'books' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Books Inventory
          </button>
          <button 
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'issues' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Issue / Return
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'categories' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Categories
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Books" value={books.reduce((acc, b) => acc + b.totalCopies, 0).toString()} sub={`${books.length} Titles`} icon={Book} color="bg-primary-500" />
        <StatCard label="Available" value={books.reduce((acc, b) => acc + b.availableCopies, 0).toString()} sub="On Shelf" icon={CheckCircle} color="bg-emerald-500" />
        <StatCard label="Issued" value={issues.filter(i => i.status === 'Issued').length.toString()} sub="Currently Out" icon={BookOpen} color="bg-amber-500" />
        <StatCard label="Categories" value={categories.length.toString()} sub="Active Genres" icon={Layers} color="bg-indigo-500" />
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        {activeTab === 'books' && (
          <>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-100 focus:outline-none" placeholder="Search by title, author, ISBN..." />
              </div>
              <button 
                onClick={() => { setSelectedItem(null); setShowBookModal(true); }}
                className="btn-primary py-2.5 px-6 text-xs font-black flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add New Title
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Title & Author</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">ISBN / Edition</th>
                    <th className="px-6 py-4">Availability</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {books.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic">No books in inventory</td></tr>
                  ) : books.map(book => (
                    <tr key={book.id} className="hover:bg-slate-50/50 group transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 leading-tight">{book.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">By {book.author || 'Unknown'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-tight">{book.categoryName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-slate-600">{book.isbn || 'N/A'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{book.edition || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="flex-1 h-1.5 bg-slate-100 rounded-full w-16 overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}></div>
                           </div>
                           <span className="text-xs font-black text-slate-700">{book.availableCopies}/{book.totalCopies}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">{book.location || 'Not Set'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setSelectedItem(book); setShowBookModal(true); }} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteBook(book.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'issues' && (
          <>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Active Book Circulation</h3>
               <button 
                onClick={() => { setSelectedItem(null); setShowIssueModal(true); }}
                className="btn-primary py-2.5 px-6 text-xs font-black flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Issue New Book
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Book Title</th>
                    <th className="px-6 py-4">Student / Staff</th>
                    <th className="px-6 py-4">Issue Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {issues.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">No circulation records found</td></tr>
                  ) : issues.map(issue => (
                    <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 text-sm">{issue.bookTitle}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700 text-sm">{issue.studentName || issue.employeeName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{issue.admissionNumber || issue.employeeCode}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                           <Calendar className="h-3 w-3" />
                           <span>{formatDate(issue.issueDate)}</span>
                           <span className="text-slate-300 mx-1">→</span>
                           <span className={new Date(issue.dueDate) < new Date() && issue.status === 'Issued' ? 'text-rose-500 font-bold' : ''}>
                              {formatDate(issue.dueDate)}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight ${
                          issue.status === 'Returned' ? 'bg-emerald-100 text-emerald-700' :
                          new Date(issue.dueDate) < new Date() ? 'bg-rose-100 text-rose-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {issue.status} {issue.status === 'Issued' && new Date(issue.dueDate) < new Date() && '(Overdue)'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {issue.status === 'Issued' && (
                          <button 
                            onClick={() => handleReturnBook(issue.id)}
                            className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 underline underline-offset-4"
                          >
                            Return Book
                          </button>
                        )}
                        {issue.status === 'Returned' && (
                           <p className="text-[10px] text-slate-400 font-bold italic">Returned on {formatDate(issue.returnDate!)}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'categories' && (
           <>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Book Categories</h3>
              <button 
                onClick={() => { setSelectedItem(null); setShowCategoryModal(true); }}
                className="btn-primary py-2.5 px-6 text-xs font-black"
              >
                Add Category
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {categories.map(cat => (
                  <div key={cat.id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl relative group hover:border-primary-200 transition-all">
                     <div className="h-10 w-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center mb-3 text-primary-500">
                        <Bookmark className="h-5 w-5" />
                     </div>
                     <h4 className="font-black text-slate-800 uppercase tracking-tight truncate">{cat.name}</h4>
                     <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{cat.description || 'No description provided.'}</p>
                     
                     <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedItem(cat); setShowCategoryModal(true); }} className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg text-slate-400 hover:text-primary-600"><Edit className="h-3 w-3" /></button>
                        <button className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg text-slate-400 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                     </div>
                  </div>
               ))}
            </div>
           </>
        )}
      </div>

      {/* Modals */}
      {showBookModal && (
        <GenericModal title={selectedItem ? "Edit Book" : "Add New Book"} onClose={() => setShowBookModal(false)}>
           <form onSubmit={handleSaveBook} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Book Title</label>
                    <input name="title" defaultValue={selectedItem?.title} required className="input-field" placeholder="Enter title" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Author</label>
                    <input name="author" defaultValue={selectedItem?.author} className="input-field" placeholder="Author name" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Category</label>
                    <select name="categoryId" defaultValue={selectedItem?.categoryId} required className="input-field">
                       <option value="">Select Category</option>
                       {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">ISBN</label>
                    <input name="isbn" defaultValue={selectedItem?.isbn} className="input-field" placeholder="ISBN number" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Edition</label>
                    <input name="edition" defaultValue={selectedItem?.edition} className="input-field" placeholder="e.g. 2023 Edition" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Total Copies</label>
                    <input name="totalCopies" type="number" defaultValue={selectedItem?.totalCopies || 1} required className="input-field" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Rack Location</label>
                    <input name="location" defaultValue={selectedItem?.location} className="input-field" placeholder="e.g. Rack 4, Shelf B" />
                 </div>
              </div>
              <div className="pt-4 flex gap-3">
                 <button type="button" onClick={() => setShowBookModal(false)} className="flex-1 btn-secondary py-3">Cancel</button>
                 <button type="submit" className="flex-1 btn-primary py-3">Save Title</button>
              </div>
           </form>
        </GenericModal>
      )}

      {showCategoryModal && (
        <GenericModal title={selectedItem ? "Edit Category" : "Add Category"} onClose={() => setShowCategoryModal(false)}>
           <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Category Name</label>
                 <input name="name" defaultValue={selectedItem?.name} required className="input-field" placeholder="e.g. Science, Fiction, History" />
              </div>
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Description</label>
                 <textarea name="description" defaultValue={selectedItem?.description} className="input-field h-24" placeholder="Brief description..." />
              </div>
              <div className="pt-4 flex gap-3">
                 <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 btn-secondary py-3">Cancel</button>
                 <button type="submit" className="flex-1 btn-primary py-3">Save Category</button>
              </div>
           </form>
        </GenericModal>
      )}

      {showIssueModal && (
        <GenericModal title="Issue Book" onClose={() => setShowIssueModal(false)}>
           <form onSubmit={handleIssueBook} className="space-y-4">
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Select Book</label>
                 <select name="bookId" required className="input-field">
                    <option value="">Select a title</option>
                    {books.filter(b => b.availableCopies > 0).map(b => (
                       <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} available)</option>
                    ))}
                 </select>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue To</p>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                       <label className="text-[10px] font-medium text-slate-500 mb-1 block">Student</label>
                       <select name="studentId" className="input-field bg-white">
                          <option value="">Search Student...</option>
                          {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>)}
                       </select>
                    </div>
                    <div className="col-span-2">
                       <label className="text-[10px] font-medium text-slate-500 mb-1 block">OR Staff Member</label>
                       <select name="employeeId" className="input-field bg-white">
                          <option value="">Search Staff...</option>
                          {employees.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>)}
                       </select>
                    </div>
                 </div>
              </div>

              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Due Date</label>
                 <input name="dueDate" type="date" required className="input-field" defaultValue={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} />
                 <p className="text-[10px] text-slate-400 mt-1 font-medium">Default: 14 days from today.</p>
              </div>

              <div className="pt-4 flex gap-3">
                 <button type="button" onClick={() => setShowIssueModal(false)} className="flex-1 btn-secondary py-3">Cancel</button>
                 <button type="submit" className="flex-1 btn-primary py-3">Confirm Issue</button>
              </div>
           </form>
        </GenericModal>
      )}

      {/* Reusable Components Stlye Inject */}
      <style>{`
        .input-field {
          width: 100%;
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .input-field:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }
      `}</style>
    </div>
  );
}

// Helpers
function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
     <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-4">
           <div className={`p-3 rounded-2xl ${color} bg-opacity-10 shadow-inner`}>
              <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
           </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{value}</h3>
        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">{sub}</p>
     </div>
  );
}

function GenericModal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
           <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{title}</h3>
              <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all font-bold">
                 &times;
              </button>
           </div>
           <div className="p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
              {children}
           </div>
        </div>
     </div>
  );
}
