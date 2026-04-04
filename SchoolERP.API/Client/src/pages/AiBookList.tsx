import { useEffect, useState } from 'react';
import { Sparkles, Plus, BookOpen, Search, Filter, ChevronRight, Image as ImageIcon, Loader2, X, Layout } from 'lucide-react';
import { subjectContentApi } from '../api/subjectContentApi';
import { masterApi } from '../api/masterApi';
import { useNavigate } from 'react-router-dom';

const AiBookList = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const token = localStorage.getItem('token');
    const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
    const currentRole = (decodedToken?.Role || decodedToken?.role || decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 'Guest').toString();
    const isStudent = currentRole.toLowerCase() === 'student';
    
    const [filters, setFilters] = useState({
        classId: '',
        subjectId: ''
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newBook, setNewBook] = useState({
        classId: '',
        subjectId: '',
        name: '',
        description: ''
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [classesData, subjectsData] = await Promise.all([
                    masterApi.getAll('classes'),
                    masterApi.getAll('subjects')
                ]);
                setClasses(classesData);
                setSubjects(subjectsData);
                loadBooks();
            } catch (error) {
                console.error('Failed to load initial data', error);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        loadBooks();
    }, [filters.classId, filters.subjectId]);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const data = await subjectContentApi.getBooks(filters.classId || undefined, filters.subjectId || undefined);
            setBooks(data);
        } catch (error) {
            console.error('Failed to load books', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBook = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await subjectContentApi.createBook({
                academicClassId: newBook.classId,
                subjectId: newBook.subjectId,
                name: newBook.name,
                description: newBook.description
            });
            setBooks([result, ...books]);
            setShowCreateModal(false);
            setNewBook({ classId: '', subjectId: '', name: '', description: '' });
        } catch (error) {
            console.error('Error creating book:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/20">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Curriculum Books</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Manage and explore your digital multi-media textbooks.</p>
                </div>
                
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-primary-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Create New Book
                </button>
            </div>

            {/* Create Book Slide-over */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[150] flex justify-end overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
                        onClick={() => setShowCreateModal(false)} 
                    />
                    
                    <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 h-full">
                        {/* Drawer Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/20 text-white">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 leading-tight">Create AI Book</h3>
                                    <p className="text-[10px] text-primary-600 font-black uppercase tracking-[0.2em]">New Curriculum Entry</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowCreateModal(false)}
                                className="h-10 w-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all group shadow-sm active:scale-90"
                            >
                                <X className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            <form onSubmit={handleCreateBook} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Class</label>
                                        <select 
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all"
                                            value={newBook.classId}
                                            onChange={e => setNewBook({...newBook, classId: e.target.value})}
                                            required
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                                        <select 
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all"
                                            value={newBook.subjectId}
                                            onChange={e => setNewBook({...newBook, subjectId: e.target.value})}
                                            required
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Book Name</label>
                                        <input 
                                            type="text"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all"
                                            placeholder="Enter book title"
                                            value={newBook.name}
                                            onChange={e => setNewBook({...newBook, name: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Description</label>
                                        <textarea 
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all min-h-[120px] resize-none"
                                            placeholder="Describe the curriculum scope..."
                                            value={newBook.description}
                                            onChange={e => setNewBook({...newBook, description: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm flex items-center justify-center gap-3 hover:bg-primary-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 active:scale-[0.98]"
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Sparkles className="h-5 w-5" /> Initialize AI Book</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Filters</span>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                    <select 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                        value={filters.classId}
                        onChange={e => setFilters({...filters, classId: e.target.value})}
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <select 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                        value={filters.subjectId}
                        onChange={e => setFilters({...filters, subjectId: e.target.value})}
                    >
                        <option value="">All Subjects</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search by book name..."
                        className="pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all w-[300px]"
                    />
                </div>
            </div>

            {/* Book Grid */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
                    <p className="text-slate-500 font-black animate-pulse">Loading Library...</p>
                </div>
            ) : books.length === 0 ? (
                <div className="h-96 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12 space-y-6">
                    <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                        <BookOpen className="h-12 w-12 text-slate-200" />
                    </div>
                    <div className="max-w-md">
                        <h3 className="text-xl font-black text-slate-900">No Books Found</h3>
                        <p className="text-slate-500 font-medium mt-2">We couldn't find any books matching your criteria. Try adjusting your filters or create a new book.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/ai-dashboard')}
                        className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-black shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all"
                    >
                        Get Started
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {books.map(book => (
                        <div 
                            key={book.id}
                            className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary-600/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col"
                        >
                            {/* Info Area */}
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-[9px] font-black uppercase tracking-wider">
                                            {book.chapterCount || 0} Chapters
                                        </span>
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase tracking-wider">
                                            AI-READY
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1 uppercase leading-tight">{book.name}</h3>
                                    <p className="text-slate-500 text-xs line-clamp-2 font-medium leading-relaxed">{book.description || 'Professional AI-curated curriculum content.'}</p>
                                </div>

                                 <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => navigate(`/ai-tutor?bookId=${book.id}`)}
                                        className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Launch AI Tutor
                                    </button>
                                    {!isStudent && (
                                        <button 
                                            onClick={() => navigate(`/subject-content?bookId=${book.id}`)}
                                            className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-primary-600 transition-all active:scale-95"
                                        >
                                            <Layout className="h-3.5 w-3.5" />
                                            Manage Chapters
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AiBookList;
