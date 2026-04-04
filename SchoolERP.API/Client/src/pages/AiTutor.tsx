import { useEffect, useState, useRef } from 'react';
import { 
    BookOpen, Sparkles, Send, ChevronRight, 
    FileText, MessageSquare, Layout, BookMarked, 
    Loader2, Book as BookIcon, HelpCircle
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

export default function AiTutor() {
    const [searchParams] = useSearchParams();
    const urlBookId = searchParams.get('bookId');

    const token = localStorage.getItem('token');
    const decodedToken = token ? (function(t) {
        try {
            const base64Url = t.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) { return null; }
    })(token) : null;

    const currentRole = (decodedToken?.Role || decodedToken?.role || decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 'Guest').toString();
    const isStudent = currentRole.toLowerCase() === 'student';
    const studentClassId = decodedToken?.AcademicClassId || decodedToken?.academicClassId || '';

    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    
    const [selectedClassId, setSelectedClassId] = useState<string>(isStudent ? studentClassId : '');
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [selectedBookId, setSelectedBookId] = useState<string>(urlBookId || '');

    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapterId, setSelectedChapterId] = useState<string>('');
    const [chapterDetails, setChapterDetails] = useState<any>(null);

    const [loading, setLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'study' | 'quiz'>('study');
    
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Load recent chats from localStorage on mount
    useEffect(() => {
        const raw = localStorage.getItem('ai_tutor_recents');
        if (raw) {
            try { setRecentChats(JSON.parse(raw)); } catch (e) { console.error(e); }
        }
    }, []);

    // No longer saving chatHistory to localStorage as the API handles it now.
    // But we still track recents for quick navigation.
    useEffect(() => {
        if (selectedChapterId && chatHistory.length > 0) {
            // Update recents list in localStorage for quick UI access
            const currentBook = books.find(b => String(b.id || b.Id) === String(selectedBookId));
            const currentChapter = chapters.find(c => String(c.id || c.Id) === String(selectedChapterId));
            
            if (currentBook && currentChapter) {
                const session = {
                    classId: selectedClassId,
                    bookId: selectedBookId,
                    subjectId: selectedSubjectId,
                    chapterId: selectedChapterId,
                    bookName: currentBook.name,
                    chapterTitle: currentChapter.title,
                    timestamp: new Date().toISOString()
                };

                setRecentChats(prev => {
                    const filtered = prev.filter(p => p.chapterId !== selectedChapterId);
                    const updated = [session, ...filtered].slice(0, 25);
                    localStorage.setItem('ai_tutor_recents', JSON.stringify(updated));
                    return updated;
                });
            }
        }
    }, [chatHistory]);

    // Sync urlBookId with selectedBookId
    useEffect(() => {
        if (urlBookId) {
            setSelectedBookId(urlBookId);
        }
    }, [urlBookId]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // Background load master data
                if (!isStudent) {
                    masterApi.getAll('classes').then(setClasses);
                }
                masterApi.getAll('subjects').then(setSubjects);

                const targetBookId = urlBookId || selectedBookId;
                if (targetBookId) {
                    const book = await subjectContentApi.getBook(targetBookId);
                    if (book) {
                        const bId = book.id || book.Id || targetBookId;
                        const bClassId = book.academicClassId || book.AcademicClassId;
                        const bSubId = book.subjectId || book.SubjectId;

                        setSelectedClassId(bClassId);
                        setSelectedSubjectId(bSubId);
                        setSelectedBookId(bId);
                        
                        // Load books list right away
                        const availableBooks = await subjectContentApi.getBooks(bClassId, bSubId);
                        setBooks(availableBooks);

                        // Load chapters for initial state
                        const chs = await subjectContentApi.getChapters(bId);
                        setChapters(chs);
                    }
                }
            } catch (e) {
                console.error("Failed to init tutor", e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [urlBookId]);

    useEffect(() => {
        if (selectedClassId && selectedSubjectId) {
            const currentBook = books.find(b => String(b.id || b.Id) === String(selectedBookId));
            if (!currentBook || (currentBook.academicClassId !== selectedClassId && currentBook.AcademicClassId !== selectedClassId)) {
                loadBooks();
            }
        }
    }, [selectedClassId, selectedSubjectId]);

    useEffect(() => {
        if (selectedBookId) {
            loadChapters();
        } else {
            setChapters([]);
            setSelectedChapterId('');
        }
    }, [selectedBookId]);

    // Load chapter history when selected from Database
    const fetchHistory = async (chapterId: string) => {
        if (!chapterId) return;
        setChatLoading(true);
        try {
            console.log("Fetching history for chapter:", chapterId);
            const history = await subjectContentApi.getChatHistory(chapterId);
            console.log("Loaded history nodes:", history?.length || 0);
            
            const historyArray = Array.isArray(history) ? history : [];
            const mapped = historyArray.map((h: any) => ({
                role: ((h.role || h.Role) === 'user' ? 'user' : 'ai') as 'user' | 'ai',
                content: String(h.content || h.Content)
            }));
            setChatHistory(mapped);
        } catch (e) {
            console.error("Failed to load history", e);
            setChatHistory([]);
        } finally {
            setChatLoading(false);
        }
    };

    useEffect(() => {
        if (selectedChapterId) {
            fetchHistory(selectedChapterId);
            loadChapterDetails();
            setActiveTab('study');
        } else {
            setChapterDetails(null);
            setChatHistory([]);
        }
    }, [selectedChapterId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleNewChat = async () => {
        try {
            await subjectContentApi.clearChatHistory(selectedChapterId);
            setChatHistory([]);
        } catch (e) {
            console.error(e);
            alert("Failed to clear history");
        }
    };

    const handleLoadSession = async (session: any) => {
        setLoading(true);
        try {
            // Set context first
            setSelectedClassId(session.classId || ""); 
            setSelectedSubjectId(session.subjectId);
            setSelectedBookId(session.bookId);
            
            // Load chapters for this book immediately to avoid default selection race
            const chaptersArray = await subjectContentApi.getChapters(session.bookId);
            setChapters(Array.isArray(chaptersArray) ? chaptersArray : []);
            
            // Now set the chapter and force reload history
            setSelectedChapterId(session.chapterId);
            fetchHistory(session.chapterId); // Direct call just in case ID didn't change
            
        } catch (e) {
            console.error("Failed to load session", e);
        } finally {
            setLoading(false);
        }
    };

    const loadBooks = async () => {
        if (!selectedClassId || !selectedSubjectId) return;
        try {
            const data = await subjectContentApi.getBooks(selectedClassId, selectedSubjectId);
            setBooks(data);
        } catch (error) {
            console.error('Failed to load books', error);
        }
    };

    const loadChapters = async () => {
        if (!selectedBookId) return;
        setLoading(true);
        try {
            const data = await subjectContentApi.getChapters(selectedBookId);
            const chaptersArray = Array.isArray(data) ? data : [];
            setChapters(chaptersArray);
            
            if (chaptersArray.length > 0) {
                const currentInList = chaptersArray.find(c => (c.id || c.Id) === selectedChapterId);
                if (!selectedChapterId || !currentInList) {
                    setSelectedChapterId(chaptersArray[0].id || chaptersArray[0].Id);
                }
            }
        } catch (error) {
            console.error('Failed to load chapters', error);
            setChapters([]);
        } finally {
            setLoading(false);
        }
    };

    const loadChapterDetails = async () => {
        if (!selectedChapterId) return;
        try {
            const data = await subjectContentApi.getChapterDetails(selectedChapterId);
            setChapterDetails(data);
        } catch (error) {
            console.error('Failed to load details', error);
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

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="max-w-[1600px] mx-auto flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 px-4 pb-12">
            {/* Header / Selection Bar */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-[100] backdrop-blur-md bg-white/90">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">AI Tutor</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest pl-0.5">Interactive Learning Companion</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-1 max-w-full">
                    {!isStudent && (
                        <select
                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary-500/10 outline-none font-bold min-w-[140px]"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                        >
                            <option value="">Class</option>
                            {classes.map(c => <option key={c.id || c.Id} value={c.id || c.Id}>{c.name}</option>)}
                        </select>
                    )}

                    <select
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary-500/10 outline-none font-bold min-w-[140px]"
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                    >
                        <option value="">Subject</option>
                        {subjects.map(s => <option key={s.id || s.Id} value={s.id || s.Id}>{s.name}</option>)}
                    </select>

                    <select
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary-500/10 outline-none font-bold min-w-[180px]"
                        value={selectedBookId}
                        onChange={(e) => setSelectedBookId(e.target.value)}
                    >
                        <option value="">Select Book</option>
                        {books.map(b => <option key={b.id || b.Id} value={b.id || b.Id}>{b.name}</option>)}
                    </select>

                    <select
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary-500/10 outline-none font-bold min-w-[180px]"
                        value={selectedChapterId}
                        onChange={(e) => setSelectedChapterId(e.target.value)}
                    >
                        <option value="">Select Chapter</option>
                        {chapters.map(c => <option key={c.id || c.Id} value={c.id || c.Id}>{c.title}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex gap-6 items-start">
                {/* Sidebar - Chapter List & Recents */}
                <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col shrink-0 transition-all duration-300 sticky top-[100px] h-fit max-h-[calc(100vh-140px)]`}>
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        {!sidebarCollapsed && (
                            <div className="flex items-center gap-2">
                                <BookIcon className="h-4 w-4 text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Curriculum</span>
                            </div>
                        )}
                        <button 
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className={`p-1.5 hover:bg-slate-200/50 rounded-lg transition-colors ${sidebarCollapsed ? 'mx-auto' : ''}`}
                        >
                            <Layout className={`h-4 w-4 text-slate-400 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Chapters Section */}
                        <div className="p-3 space-y-1.5 border-b border-slate-50">
                            {!sidebarCollapsed && <p className="px-3 pb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Chapters</p>}
                            {!selectedBookId ? (
                                !sidebarCollapsed && <p className="px-3 py-4 text-xs text-slate-400 italic">Select a book</p>
                            ) : chapters.length === 0 ? (
                                !sidebarCollapsed && <p className="px-3 py-4 text-xs text-slate-400 italic">No chapters found</p>
                            ) : (
                                chapters.map(ch => (
                                    <button
                                        key={ch.id || ch.Id}
                                        onClick={() => setSelectedChapterId(ch.id || ch.Id || '')}
                                        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${
                                            selectedChapterId === (ch.id || ch.Id)
                                            ? 'bg-emerald-600 text-white shadow-md' 
                                            : 'hover:bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                            selectedChapterId === (ch.id || ch.Id) ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            {ch.orderIndex}
                                        </div>
                                        {!sidebarCollapsed && <span className="text-xs font-bold truncate text-left">{ch.title}</span>}
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Recents Section */}
                        {!sidebarCollapsed && recentChats.length > 0 && (
                            <div className="p-3 space-y-1.5">
                                <p className="px-3 pb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Recent Chats</p>
                                {recentChats.map((rc, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleLoadSession(rc)}
                                        className={`w-full flex flex-col p-3 rounded-2xl border transition-all text-left ${
                                            selectedChapterId === rc.chapterId 
                                            ? 'border-emerald-200 bg-emerald-50/30' 
                                            : 'border-transparent hover:bg-slate-50'
                                        }`}
                                    >
                                        <p className="text-[10px] font-black text-slate-900 truncate mb-0.5">{rc.chapterTitle}</p>
                                        <p className="text-[8px] font-bold text-slate-400 truncate uppercase tracking-tighter">
                                            {rc.bookName}
                                        </p>
                                        <p className="text-[7px] text-slate-300 mt-1 font-medium">{new Date(rc.timestamp).toLocaleDateString()}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main View - AI Learning Assistant Expanded */}
                {!selectedChapterId ? (
                    <div className="flex-1 bg-white rounded-3xl border-2 border-dashed border-slate-100 min-h-[500px] flex flex-col items-center justify-center text-slate-300">
                        <div className="relative mb-6">
                            <Sparkles className="h-24 w-24 opacity-5 animate-pulse" />
                            <BookIcon className="h-12 w-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-200 uppercase tracking-widest">Select a Chapter</h2>
                    </div>
                ) : (
                    <div className="flex-1 bg-white rounded-3xl shadow-sm flex flex-col border border-slate-100 animate-in zoom-in-95 duration-500 min-h-[calc(100vh-140px)]">
                        <div className="p-6 bg-emerald-50/50 border-b border-emerald-100/50 flex items-center justify-between sticky top-[92px] z-[90] backdrop-blur-md bg-emerald-50/80">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] text-emerald-600 font-black tracking-widest uppercase">Smart Learning Assistant</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-800 leading-tight">
                                        {chapters.find(c => (c.id || c.Id) === selectedChapterId)?.title}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleNewChat}
                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                    title="Start New Chat"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                </button>
                                <button 
                                    onClick={handleSummarize}
                                    disabled={chatLoading}
                                    className="px-4 py-2 bg-white text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm hover:shadow-md hover:bg-emerald-50 transition-all disabled:opacity-50"
                                >
                                    Summarize
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-10 space-y-10 bg-white">
                            {chatHistory.length === 0 && (
                                <div className="pt-10 text-center max-w-md mx-auto space-y-6 pb-10">
                                    <div className="h-20 w-20 bg-emerald-50 rounded-[2rem] rotate-12 flex items-center justify-center mx-auto border border-emerald-100 shadow-xl shadow-emerald-500/10">
                                        <Sparkles className="h-10 w-10 text-emerald-600 animate-pulse" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">How can I help you learn today?</h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                            I've analyzed this chapter and I'm ready to explain concepts, solve problems, or quiz your knowledge.
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="max-w-3xl mx-auto space-y-10">
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'ai' && (
                                            <div className="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20 mt-1">
                                                <Sparkles className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                        
                                        <div className={`flex-1 min-w-0 ${msg.role === 'user' ? 'max-w-[80%]' : ''}`}>
                                            <div className={`p-1 ${msg.role === 'user' ? 'bg-slate-50 rounded-2xl px-5 py-3 border border-slate-200' : ''}`}>
                                                <div className={`prose prose-slate max-w-none text-[15px] font-medium leading-[1.8] ${msg.role === 'user' ? 'text-slate-700 text-right' : 'text-slate-800 text-left'}`}>
                                                    {msg.content.split('\n').map((line, lIdx) => {
                                                        const isHeader = line.startsWith('### ');
                                                        const isSubHeader = line.startsWith('## ');
                                                        const isMainHeader = line.startsWith('# ');
                                                        const isList = line.startsWith('- ') || line.startsWith('* ') || (line.trim().length > 0 && /^\d+\.\s/.test(line));

                                                        const cleanLine = line.replace(/^#{1,3}\s+/, '').replace(/^([-*]|\d+\.)\s+/, '');

                                                        if (!line.trim()) return <div key={lIdx} className="h-4" />;

                                                        return (
                                                            <div key={lIdx} className={
                                                                isMainHeader ? 'text-xl font-black mb-4 text-slate-900 border-b border-slate-100 pb-2' : 
                                                                isHeader ? 'text-lg font-black mb-2 text-emerald-700' : 
                                                                isSubHeader ? 'text-[11px] font-black uppercase text-slate-400 mb-2 tracking-widest' : 
                                                                isList ? 'pl-2 mb-2 flex items-start' : 'mb-4 last:mb-0'
                                                            }>
                                                                {isList && <span className="mr-3 text-emerald-500 font-black">
                                                                    {/^\d+\.\s/.test(line) ? line.match(/^\d+/)?.[0] + '.' : '•'}
                                                                </span>}
                                                                <span className="flex-1 whitespace-pre-wrap">
                                                                    {cleanLine.split('**').map((part, pIdx) => 
                                                                        pIdx % 2 === 1 ? <b key={pIdx} className="font-black text-emerald-600 drop-shadow-sm">{part}</b> : part
                                                                    )}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {msg.role === 'user' && (
                                            <div className="h-9 w-9 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/20 mt-1">
                                                <span className="text-[10px] font-black text-white uppercase">{decodedToken?.name?.substring(0,1) || 'U'}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {chatLoading && (
                                    <div className="flex gap-6 animate-in fade-in duration-300">
                                        <div className="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20">
                                            <Sparkles className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="flex items-center gap-1.5 py-3">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} className="h-10" />
                            </div>
                        </div>

                        <div className="sticky bottom-0 px-6 pb-8 pt-4 z-[100] bg-gradient-to-t from-white via-white/80 to-transparent">
                            <div className="max-w-3xl mx-auto space-y-4">
                                {/* Suggestions Area */}
                                <div className="flex flex-wrap justify-center gap-2">
                                    {['Summarize this for me', 'What are the key concepts?', 'Give me a practice example', 'Explain like I am 5'].map(q => (
                                        <button 
                                            key={q}
                                            onClick={() => { setQuestion(q); }}
                                            className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                                
                                <form onSubmit={handleAskQuestion} className="relative group">
                                    <div className="absolute inset-0 bg-slate-50 shadow-[0_0_40px_-12px_rgba(0,0,0,0.08)] rounded-[2rem] border border-slate-200" />
                                    <div className="relative z-10 flex items-center p-2">
                                        <input
                                            type="text"
                                            placeholder="Message your AI Tutor..."
                                            className="flex-1 pl-6 pr-4 py-4 bg-transparent text-[15px] text-slate-900 focus:ring-0 outline-none transition-all placeholder:text-slate-400 font-medium"
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            disabled={chatLoading || !question.trim()}
                                            className="h-10 w-10 bg-slate-900 text-white rounded-[1.25rem] flex items-center justify-center hover:bg-slate-800 transition-all disabled:opacity-20 active:scale-95 shrink-0 mr-1"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </div>
                                </form>
                                <div className="text-center">
                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.3em]">Direct Learning Neural Stream</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
