import { useEffect, useState, useRef } from 'react';
import { 
    BookOpen, Sparkles, Send, Upload, Plus, ChevronRight, 
    FileText, MessageSquare, Trash2, Layout, BookMarked, 
    Image as ImageIcon, Loader2, Book as BookIcon, CheckCircle2, HelpCircle
} from 'lucide-react';
import { subjectContentApi } from '../api/subjectContentApi';
import { masterApi } from '../api/masterApi';
import { useSearchParams } from 'react-router-dom';

interface Book {
    id: string;
    Id?: string;
    name: string;
    description: string;
    academicClassId: string;
    AcademicClassId?: string;
    subjectId: string;
    SubjectId?: string;
}

interface Chapter {
    id: string;
    Id?: string;
    title: string;
    description: string;
    summary: string;
    orderIndex: number;
}

interface Content {
    id: string;
    contentType: number;
    contentValue: string;
    pageNumber?: number;
}

export default function SubjectContent() {
    const [searchParams] = useSearchParams();
    const urlBookId = searchParams.get('bookId');

    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [selectedBookId, setSelectedBookId] = useState<string>(urlBookId || '');

    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapterId, setSelectedChapterId] = useState<string>('');
    const [chapterDetails, setChapterDetails] = useState<any>(null);

    const [loading, setLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [ocrLoading, setOcrLoading] = useState(false);
    
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [isManageMode, setIsManageMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'study' | 'quiz'>('study');

    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [pendingSegments, setPendingSegments] = useState<{ text: string, page: string }[]>([{ text: '', page: '' }]);
    const [showAddChapterInput, setShowAddChapterInput] = useState(false);
    
    const [ocrTargetIndex, setOcrTargetIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Sync urlBookId with selectedBookId
    useEffect(() => {
        if (urlBookId) {
            setSelectedBookId(urlBookId);
        }
    }, [urlBookId]);

    useEffect(() => {
        const init = async () => {
            // If urlBookId is present, prioritize fetching it
            const targetBookId = urlBookId || selectedBookId;
            
            setLoading(true);
            try {
                if (targetBookId) {
                    const book = await subjectContentApi.getBook(targetBookId);
                    if (book) {
                        // Support both casing just in case
                        const bId = book.id || book.Id || targetBookId;
                        const bClassId = book.academicClassId || book.AcademicClassId;
                        const bSubId = book.subjectId || book.SubjectId;

                        setSelectedClassId(bClassId);
                        setSelectedSubjectId(bSubId);
                        setSelectedBookId(bId);
                        
                        // Load books for this class/subject immediately
                        const availableBooks = await subjectContentApi.getBooks(bClassId, bSubId);
                        setBooks(availableBooks);
                    }
                }

                // Load Master Data 
                const [classesData, subjectsData] = await Promise.all([
                    masterApi.getAll('classes'),
                    masterApi.getAll('subjects')
                ]);
                setClasses(classesData);
                setSubjects(subjectsData);
            } catch (e) {
                console.error("Failed to initialize", e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [urlBookId]); // Only re-run when the top-level URL changes

    useEffect(() => {
        // Only auto-load books if not already handled by init's logic
        if (selectedClassId && selectedSubjectId) {
            const currentSelectedBook = books.find(b => String(b.id || b.Id) === String(selectedBookId));
            if (!currentSelectedBook || (currentSelectedBook.academicClassId !== selectedClassId && currentSelectedBook.AcademicClassId !== selectedClassId)) {
                loadBooks();
            }
        }
    }, [selectedClassId, selectedSubjectId]);

    const loadBooks = async () => {
        if (!selectedClassId || !selectedSubjectId) return;
        try {
            const data = await subjectContentApi.getBooks(selectedClassId, selectedSubjectId);
            setBooks(data);
        } catch (error) {
            console.error('Failed to load books', error);
        }
    };

    const loadChapters = async (bookIdOverride?: string) => {
        const bookId = bookIdOverride || selectedBookId;
        if (!bookId) {
            setChapters([]);
            return [];
        }
        
        setLoading(true);
        try {
            const data = await subjectContentApi.getChapters(bookId);
            const chaptersArray = Array.isArray(data) ? data : [];
            setChapters(chaptersArray);
            
            if (chaptersArray.length > 0) {
               const currentInList = chaptersArray.find(c => (c.id || c.Id) === selectedChapterId);
               if (!selectedChapterId || !currentInList) {
                   setSelectedChapterId(chaptersArray[0].id || chaptersArray[0].Id);
                   setIsManageMode(true);
               }
            } else {
               setSelectedChapterId('');
               setChapterDetails(null);
            }

            return chaptersArray;
        } catch (error) {
            console.error('Failed to load chapters', error);
            setChapters([]);
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedBookId) {
            loadChapters();
        } else {
            setChapters([]);
            setSelectedChapterId('');
        }
    }, [selectedBookId]);

    useEffect(() => {
        if (selectedChapterId) {
            loadChapterDetails();
            setChatHistory([]);
            setActiveTab('study');
        } else {
            setChapterDetails(null);
        }
    }, [selectedChapterId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const loadChapterDetails = async () => {
        if (!selectedChapterId) return;
        try {
            const data = await subjectContentApi.getChapterDetails(selectedChapterId);
            setChapterDetails(data);
        } catch (error) {
            console.error('Failed to load details', error);
        }
    };

    const handleDeleteChapter = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this entire chapter? All content inside will be lost.')) return;
        try {
            await subjectContentApi.deleteChapter(id);
            if (selectedChapterId === id) {
                setSelectedChapterId('');
                setChapterDetails(null);
            }
            loadChapters();
        } catch (error) {
            console.error(error);
            alert("Failed to delete chapter.");
        }
    };

    const handleDeleteBook = async () => {
        if (!selectedBookId) return;
        if (!window.confirm('Are you sure you want to delete this ENTIRE book? All chapters and content inside will be permanently removed.')) return;
        
        try {
            setLoading(true);
            await subjectContentApi.deleteBook(selectedBookId);
            setSelectedBookId('');
            setChapters([]);
            setChapterDetails(null);
            // Reload books list
            loadBooks();
        } catch (error) {
            console.error(error);
            alert("Failed to delete book.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddChapter = async () => {
        if (!newChapterTitle || !selectedBookId) return;
        
        setLoading(true);
        try {
            await subjectContentApi.createChapter({
                subjectBookId: selectedBookId,
                title: newChapterTitle,
                orderIndex: (chapters?.length || 0) + 1
            });
            setShowAddChapterInput(false);
            setNewChapterTitle('');
            
            // Reload chapters
            const updatedChapters = await subjectContentApi.getChapters(selectedBookId);
            const chaptersArray = Array.isArray(updatedChapters) ? updatedChapters : [];
            setChapters(chaptersArray);
            
            // Select the newly created chapter (usually at the end)
            if (chaptersArray.length > 0) {
                const lastChapter = chaptersArray[chaptersArray.length - 1];
                setSelectedChapterId(lastChapter.id);
                setIsManageMode(true);
            }
        } catch (error) {
            console.error("Failed to add chapter", error);
            alert("Failed to add chapter. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteContent = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this content?')) return;
        try {
            await subjectContentApi.deleteContent(id);
            loadChapterDetails();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddContent = async () => {
        const validSegments = pendingSegments.filter(s => s.text.trim());
        if (validSegments.length === 0) return;
        
        try {
            for (let i = 0; i < validSegments.length; i++) {
                const s = validSegments[i];
                const pageNum = s.page ? parseInt(s.page) : null;
                
                await subjectContentApi.addContent({
                    chapterId: selectedChapterId,
                    contentType: 1, // Text
                    contentValue: s.text,
                    pageNumber: pageNum !== null && !isNaN(pageNum) ? pageNum : undefined,
                    orderIndex: (chapterDetails?.contents?.length || 0) + i + 1
                });
            }
            setPendingSegments([{ text: '', page: '' }]);
            loadChapterDetails();
        } catch (error) {
            console.error(error);
        }
    };

    const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setOcrLoading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = reader.result as string;
                const result = await subjectContentApi.extractText(base64);
                
                setPendingSegments(prev => {
                    const newSegs = [...prev];
                    const targetIdx = ocrTargetIndex !== null ? ocrTargetIndex : prev.length - 1;
                    
                    if (targetIdx >= 0 && targetIdx < newSegs.length) {
                        newSegs[targetIdx] = { ...newSegs[targetIdx], text: result.extractedText };
                        return newSegs;
                    }
                    return [...prev, { text: result.extractedText, page: '' }];
                });
                setOcrTargetIndex(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            };
        } catch (error) {
            console.error('OCR failed', error);
        } finally {
            setOcrLoading(false);
        }
    };

    const handleSummarize = async () => {
        setChatLoading(true);
        try {
            const res = await subjectContentApi.summarize(selectedChapterId);
            setChatHistory(prev => [...prev, { role: 'ai', content: `**Chapter Summary:**\n\n${res.summary}` }]);
        } catch (error) {
            console.error(error);
        } finally {
            setChatLoading(false);
        }
    };

    const handleGenerateQuiz = async () => {
        setChatLoading(true);
        setActiveTab('quiz');
        try {
            const res = await subjectContentApi.generateQuiz(selectedChapterId);
            setChatHistory(prev => [...prev, { role: 'ai', content: `**Practice Test:**\n\n${res.quiz}` }]);
        } catch (error) {
            console.error(error);
        } finally {
            setChatLoading(false);
        }
    };

    const handleAskQuestion = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!question.trim()) return;

        const currentQuestion = question;
        setQuestion('');
        setChatHistory(prev => [...prev, { role: 'user', content: currentQuestion }]);
        setChatLoading(true);

        try {
            const res = await subjectContentApi.askQuestion({
                chapterId: selectedChapterId,
                question: currentQuestion
            });
            setChatHistory(prev => [...prev, { role: 'ai', content: res.answer }]);
        } catch (error) {
            console.error(error);
            setChatHistory(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't process your question right now." }]);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleOcrUpload}
            />
            {/* Header / Selection Bar */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-100 rounded-2xl text-primary-600">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">AI Curriculum Manager</h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest pl-0.5">
                            {books.find(b => String(b.id || b.Id) === String(selectedBookId))?.name || 'Create & Manage Content'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-1 max-w-full">
                    <select
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary-500/10 outline-none font-bold min-w-[140px]"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                        <option value="">Class</option>
                        {classes.map(c => <option key={c.id || c.Id} value={c.id || c.Id}>{c.name}</option>)}
                    </select>

                    <select
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary-500/10 outline-none font-bold min-w-[140px]"
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                    >
                        <option value="">Subject</option>
                        {subjects.map(s => <option key={s.id || s.Id} value={s.id || s.Id}>{s.name}</option>)}
                    </select>

                    <div className="flex items-center gap-2">
                        <select
                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary-500/10 outline-none font-bold min-w-[180px]"
                            value={selectedBookId}
                            onChange={(e) => setSelectedBookId(e.target.value)}
                        >
                            <option value="">Select Book</option>
                            {books.map(b => <option key={b.id || b.Id} value={b.id || b.Id}>{b.name}</option>)}
                        </select>
                        {selectedBookId && (
                            <button
                                onClick={handleDeleteBook}
                                className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-100 shadow-sm"
                                title="Delete Entire Book"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6">
                {/* Sidebar - Chapter List */}
                <div className="w-80 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col shrink-0 h-fit sticky top-4">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookIcon className="h-4 w-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chapters</span>
                        </div>
                        {selectedBookId && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setShowAddChapterInput(!showAddChapterInput)}
                                    className={`p-2 rounded-xl transition-all ${
                                        showAddChapterInput ? 'bg-primary-100 text-primary-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                    }`}
                                    title="Add New Chapter"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                        {!selectedBookId ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center italic">
                                <BookMarked className="h-10 w-10 mb-4 opacity-10" />
                                <p className="text-sm font-medium">Select a book to view chapters</p>
                            </div>
                        ) : loading ? (
                            <div className="p-6 text-center text-slate-400">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                <p className="text-xs font-bold">Loading Chapters...</p>
                            </div>
                        ) : chapters.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 italic text-sm">No chapters found for this book.</div>
                        ) : (
                            chapters.map(ch => (
                                <div key={ch.id} className="group relative">
                                    <button
                                        onClick={() => setSelectedChapterId(ch.id)}
                                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all ${
                                            selectedChapterId === ch.id 
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' 
                                            : 'hover:bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                                            selectedChapterId === ch.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600'
                                        }`}>
                                            {ch.orderIndex}
                                        </div>
                                        <span className="text-sm font-bold truncate text-left pr-6">{ch.title}</span>
                                        <ChevronRight className={`h-4 w-4 ml-auto opacity-40 transition-transform ${selectedChapterId === ch.id ? 'translate-x-1 opacity-100' : ''}`} />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteChapter(ch.id);
                                        }}
                                        className="absolute right-10 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        title="Delete Chapter"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))
                        )}

                        {showAddChapterInput && selectedBookId && (
                            <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2 duration-300">
                                <div className="relative group">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="New chapter title..."
                                        className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 outline-none font-bold shadow-sm transition-all"
                                        value={newChapterTitle}
                                        onChange={(e) => setNewChapterTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
                                    />
                                    <button
                                        onClick={handleAddChapter}
                                        disabled={!newChapterTitle}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-md active:scale-90 disabled:opacity-50"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main View */}
                {!selectedChapterId ? (
                    <div className="flex-1 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                        <div className="relative mb-6">
                            <Sparkles className="h-24 w-24 opacity-5 animate-pulse" />
                            <BookIcon className="h-12 w-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-200 uppercase tracking-widest">Select a Chapter</h2>
                    </div>
                ) : (
                    <div className="flex-1 flex gap-6">
                        {isManageMode ? (
                            /* --- Management Mode --- */
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-black">
                                                {chapterDetails?.orderIndex}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <BookIcon className="h-3 w-3 text-primary-600" />
                                                    <span className="text-[10px] font-black text-primary-600 tracking-[0.2em] uppercase">
                                                        {books.find(b => String(b.id) === String(selectedBookId))?.name || 'Curriculum'}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 leading-tight">{chapterDetails?.title}</h3>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 invisible">
                                            {/* Global button hidden since it's moved to segments */}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4 pr-3 custom-scrollbar">
                                         {chapterDetails?.contents?.map((c: any) => (
                                            <div key={c.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-primary-200 transition-colors group relative">
                                                 {c.pageNumber !== null && c.pageNumber !== undefined && (
                                                    <div className="absolute top-4 right-14 px-2 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-black rounded-lg border border-slate-200 uppercase tracking-widest shadow-sm">
                                                        SECTION {c.pageNumber}
                                                    </div>
                                                )}
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1">
                                                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">{c.contentValue}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDeleteContent(c.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="mt-12 space-y-6 p-8 bg-slate-50 rounded-[32px] border border-slate-200 shadow-inner relative overflow-hidden group/new">
                                            <div className="flex items-center justify-between mb-4 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
                                                        <Plus className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-slate-900 font-black text-lg">Prepare Material</h4>
                                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest pl-0.5">Ready to save to chapter</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => setPendingSegments([...pendingSegments, { text: '', page: '' }])}
                                                    className="px-4 py-2 bg-white text-primary-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 hover:border-primary-600 hover:bg-primary-50 flex items-center gap-2 shadow-sm"
                                                >
                                                    <Plus className="h-3 w-3" /> Add Another Segment
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-4 relative z-10">
                                                {pendingSegments.map((s, idx) => (
                                                    <div key={idx} className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-1 duration-200 group/seg shadow-sm">
                                                        <div className="w-20 shrink-0">
                                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest pl-1">Section No.</label>
                                                            <input
                                                                type="number"
                                                                placeholder=""
                                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                                                                value={s.page}
                                                                onChange={(e) => {
                                                                    const newSegs = [...pendingSegments];
                                                                    newSegs[idx].page = e.target.value;
                                                                    setPendingSegments(newSegs);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Text Material</label>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setOcrTargetIndex(idx);
                                                                        fileInputRef.current?.click();
                                                                    }}
                                                                    className="flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-black uppercase hover:bg-primary-100 transition-all border border-primary-100/50"
                                                                >
                                                                     {ocrLoading && ocrTargetIndex === idx ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3" />}
                                                                    Extract from Image
                                                                </button>
                                                            </div>
                                                            <textarea
                                                                placeholder="Type, paste, or use the 'Extract' button above..."
                                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm focus:ring-4 focus:ring-primary-500/10 outline-none font-medium min-h-[140px] transition-all resize-none"
                                                                value={s.text}
                                                                onChange={(e) => {
                                                                    const newSegs = [...pendingSegments];
                                                                    newSegs[idx].text = e.target.value;
                                                                    setPendingSegments(newSegs);
                                                                }}
                                                            />
                                                        </div>
                                                        {pendingSegments.length > 1 && (
                                                            <button 
                                                                onClick={() => setPendingSegments(pendingSegments.filter((_, i) => i !== idx))}
                                                                className="mt-8 h-10 w-10 shrink-0 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-100"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={handleAddContent}
                                                disabled={pendingSegments.every(s => !s.text.trim())}
                                                className="w-full mt-6 py-5 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 hover:bg-primary-600 transition-all active:scale-[0.98] disabled:opacity-50 relative z-10"
                                            >
                                                <CheckCircle2 className="h-5 w-5" />
                                                Save All Segments to Chapter
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* --- Empty State / No Chapter Selected --- */
                            <div className="flex-1 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                                <div className="relative mb-6">
                                    <Sparkles className="h-24 w-24 opacity-5 animate-pulse" />
                                    <BookIcon className="h-12 w-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-200 uppercase tracking-widest text-center">
                                    {selectedBookId ? 'Select a Chapter to Manage' : 'Select Book to Get Started'}
                                </h2>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
