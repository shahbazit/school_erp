import { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Settings, LogOut, Bell, Menu, ChevronDown, 
  LayoutDashboard, UserCog, Package, Building2, Wallet, Backpack, Database, Search, BookOpen, Sparkles, Calendar
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import LookupManagement from './pages/LookupManagement';
import MasterDataPage from './pages/MasterDataPage';
import Employees from './pages/Employees';
import Teachers from './pages/Teachers';
import Attendance from './pages/Attendance';
import StudentAttendance from './pages/StudentAttendance';
import StudentPromotion from './pages/StudentPromotion';
 import CertificateGenerator from './pages/CertificateGenerator';
import StudentImport from './pages/StudentImport';
import TransportManagement from './pages/TransportManagement';
import HostelManagement from './pages/HostelManagement';
import InventoryStore from './pages/InventoryStore';
import FrontOffice from './pages/FrontOffice';
import LibraryManagement from './pages/LibraryManagement';
import CommunicationHub from './pages/CommunicationHub';
import Financials from './pages/Financials';
import Examinations from './pages/Examinations';
import Leaves from './pages/Leaves';
import LeaveSettings from './pages/LeaveSettings';
import Payroll from './pages/Payroll';
import StudentAccount from './pages/fees/StudentAccount';
import FeeGeneration from './pages/fees/FeeGeneration';
import FeeSettings from './pages/fees/FeeSettings';
import FeeStructures from './pages/fees/FeeStructures';
import Timetable from './pages/Timetable';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MenuPermissions from './pages/MenuPermissions';
import UserManagement from './pages/UserManagement';
import SystemSetup from './pages/SystemSetup';
import AcademicCalendar from './pages/AcademicCalendar';
import OrganizationSettings from './pages/OrganizationSettings';
import FinanceDashboard from './pages/FinanceDashboard';
import PortalLogin from './pages/portal/PortalLogin';
import CertificateFormatManager from './pages/CertificateFormatManager';
import CustomCertificateDesigner from './pages/CustomCertificateDesigner';
import SubjectContent from './pages/SubjectContent';
import AiBookList from './pages/AiBookList';
import AiTutor from './pages/portal/AiTutor';
import PortalFees from './pages/portal/PortalFees';
import PortalTransport from './pages/portal/PortalTransport';
import PortalHostel from './pages/portal/PortalHostel';
import PortalLibrary from './pages/portal/PortalLibrary';
import ForcePasswordChange from './pages/ForcePasswordChange';
import { usePermissions } from './hooks/usePermissions';
import { useEffect as useAppEffect, useMemo } from 'react';
import { studentApi } from './api/studentApi';
import { masterApi } from './api/masterApi';
import { PortalProvider, usePortal } from './contexts/PortalContext';
import { Student } from './types';
import StudentDetailPanel from './components/StudentDetailPanel';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [studentResults, setStudentResults] = useState<Student[]>([]);
  const [quickViewStudent, setQuickViewStudent] = useState<Student | null>(null);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const handleAuthSuccess = (isFirstTime = false) => {
    setIsAuthenticated(true);
    if (isFirstTime) {
      toast.info("Welcome aboard! Sending you to Quick Setup to configure your school's initial settings.", {
        position: "top-center",
        autoClose: 5000
      });
      setTimeout(() => {
        navigate('/settings/setup');
      }, 1500);
    }
  };


  useAppEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);



  const toggleSubMenu = (menu: string) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

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
  const isAdmin = currentRole.toLowerCase() === 'admin';
  const isPortalUser = ['student', 'parent', 'portal'].includes(currentRole.toLowerCase());
  const currentUserId = decodedToken?.id || '';
  const { hasReadPermission, hasWritePermission, fetchMyPermissions } = usePermissions();
  
    const checkPermission = (key: string) => {
      if (isAdmin) return true;
      if (isPortalUser) {
        const portalAllowed = [
          'dashboard', 'fees', 'portal-fees', 'academic', 
          'attendance', 'examinations', 'timetable', 
          'ai', 'ai_tutor', 'finance', 'logistics'
        ];
        return portalAllowed.includes(key);
      }
      return hasReadPermission(key);
    };

  const checkWritePermission = (key: string) => {
    if (isAdmin) return true;
    if (isPortalUser) return false;
    return hasWritePermission(key);
  };

  useAppEffect(() => {
    if (isAuthenticated) {
      fetchMyPermissions();
      // Fetch master data for the global search quick view mapping
      masterApi.getAll('classes').then(setClassesList).catch(console.error);
      masterApi.getAll('sections').then(setSectionsList).catch(console.error);

      // Fetch current academic session
      masterApi.getAll('academic-years').then(years => {
        const current = years.find((y: any) => y.isCurrent);
        if (current) setCurrentSession(current.name);
      });
    }
  }, [isAuthenticated, currentRole, currentUserId, fetchMyPermissions]);

  const classMap = useMemo(() => {
    return classesList.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});
  }, [classesList]);

  const sectionMap = useMemo(() => {
    return sectionsList.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {});
  }, [sectionsList]);

  const userName = decodedToken?.Name || 'User';
  const organizationName = decodedToken?.OrganizationName || 'School';

  const menuItems = [
    { label: 'Dashboard', path: '/', permission: true, group: 'dashboard' },
    
    // Students
    { label: 'Student Directory', path: '/students', permission: checkPermission('student_directory'), group: 'students' },
    { label: 'Daily Attendance', path: '/student-attendance', permission: checkPermission('student_attendance'), group: 'students' },
    { label: 'Promotion & Transfer', path: '/student-promotion', permission: checkPermission('student_promotion'), group: 'students' },
    { label: 'Certificate & ID', path: '/certificates', permission: checkPermission('certificates'), group: 'students' },
    { label: 'Bulk Import', path: '/student-import', permission: checkPermission('student_import'), group: 'students' },
    
    // Academic
    { label: 'Exams & Result', path: '/examinations', permission: checkPermission('examinations'), group: 'academic' },
    { label: 'Class Timetables', path: '/timetable', permission: checkPermission('timetable'), group: 'academic' },
    { label: 'Academic Calendar', path: '/academic-calendar', permission: checkPermission('academic_calendar'), group: 'academic' },

    // AI Curriculum
    { label: 'AI Books Hub', path: '/ai-book-list', permission: checkPermission('ai_book_list') && !isPortalUser, group: 'ai' },
    { label: 'Chapter Content', path: '/subject-content', permission: checkPermission('subject_content') && !isPortalUser, group: 'ai' },
    { label: 'AI Tutor', path: '/ai-tutor', permission: checkPermission('ai_tutor'), group: 'ai' },
    
    // Finance
    { label: 'Finance Dashboard', path: '/finance-dashboard', permission: checkPermission('finance_dashboard'), group: 'finance' },
    { label: 'General Ledger', path: '/financials', permission: checkPermission('financials'), group: 'finance' },
    { label: 'Fee Collection', path: '/fees/generate', permission: checkPermission('fee_collection'), group: 'finance' },
    { label: 'Fee Structures', path: '/fees/structures', permission: checkPermission('fee_structures'), group: 'finance' },
    { label: 'Fee Heads', path: '/fees/heads', permission: checkPermission('fee_heads'), group: 'finance' },
    { label: 'Fee Policies', path: '/fees/settings', permission: checkPermission('fee_policies'), group: 'finance' },
    
    // HR & Payroll
    { label: 'Employee List', path: '/employees', permission: checkPermission('employees'), group: 'hr' },
    { label: 'Academic Staff', path: '/teachers', permission: checkPermission('teachers'), group: 'hr' },
    { label: 'Staff Attendance', path: '/attendance', permission: checkPermission('attendance'), group: 'hr' },
    { label: 'Leave Management', path: '/leaves', permission: checkPermission('leaves'), group: 'hr' },
    { label: 'Leave Policies', path: '/leave/settings', permission: checkPermission('leave_settings'), group: 'hr' },
    { label: 'Staff Payroll', path: '/payroll', permission: checkPermission('payroll'), group: 'hr' },
    
    // Logistics
    { label: 'Front Office', path: '/front-office', permission: checkPermission('front_office'), group: 'logistics' },
    { label: 'Communication', path: '/communication', permission: checkPermission('communication'), group: 'logistics' },
    { label: 'Inventory & Store', path: '/inventory', permission: checkPermission('inventory'), group: 'logistics' },
    { label: 'Transport Management', path: '/transport', permission: checkPermission('transport'), group: 'logistics' },
    { label: 'Hostel Management', path: '/hostel', permission: checkPermission('hostel'), group: 'logistics' },
    { label: 'Library Management', path: '/library', permission: checkPermission('library'), group: 'logistics' },
    
    // Masters
    { label: 'Academic Sessions', path: '/masters/academic-years', permission: checkPermission('academic_years'), group: 'masters' },
    { label: 'Class Master', path: '/masters/classes', permission: checkPermission('classes'), group: 'masters' },
    { label: 'Section Master', path: '/masters/sections', permission: checkPermission('sections'), group: 'masters' },
    { label: 'Subject Master', path: '/masters/subjects', permission: checkPermission('subjects'), group: 'masters' },
    { label: 'Departments', path: '/masters/departments', permission: checkPermission('departments'), group: 'masters' },
    { label: 'Designations', path: '/masters/designations', permission: checkPermission('designations'), group: 'masters' },
    { label: 'Infrastructure Rooms', path: '/masters/rooms', permission: checkPermission('rooms'), group: 'masters' },
    { label: 'Lab Master', path: '/masters/labs', permission: checkPermission('labs'), group: 'masters' },
    { label: 'General Lookups', path: '/lookups', permission: checkPermission('lookups'), group: 'masters' },
    
    // Administration
    { label: 'Organization Settings', path: '/settings/organization', permission: checkPermission('organization_settings'), group: 'admin' },
    { label: 'Menu Controls', path: '/settings/permissions', permission: checkPermission('permissions'), group: 'admin' },
    { label: 'User Management', path: '/settings/users', permission: checkPermission('users'), group: 'admin' },
    { label: 'System Quick Setup', path: '/settings/setup', permission: checkPermission('setup'), group: 'admin' },
  ].filter(item => item.permission === true || item.permission);

  const portalMenuItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Fee Ledger', path: '/portal-fees', icon: Wallet },
    { label: 'AI Learning Tutor', path: '/ai-tutor', icon: Sparkles },
    { label: 'Transport', path: '/transport', icon: Package },
    { label: 'Hostel', path: '/hostel', icon: Building2 },
    { label: 'Library', path: '/library', icon: BookOpen },
  ];

  const filteredResults = searchQuery.trim() === '' 
    ? [] 
    : menuItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));

  useAppEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        studentApi.getAll({ search: searchQuery, pageSize: 5 }).then(res => {
          setStudentResults(res.data || []);
        });
      } else {
        setStudentResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);


  if (!isAuthenticated) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} limit={3} newestOnTop={true} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth initialIsLogin={true} onAuthSuccess={() => handleAuthSuccess(false)} />} />
          <Route path="/portal" element={<PortalLogin onAuthSuccess={() => setIsAuthenticated(true)} />} />
          <Route path="/force-password-change" element={<ForcePasswordChange />} />
          <Route path="/register" element={<Auth initialIsLogin={false} onAuthSuccess={() => handleAuthSuccess(true)} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    );
  }

  return (
    <PortalProvider>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" limit={3} newestOnTop={true} />
      <div className="flex bg-slate-50 h-screen w-screen max-w-full text-slate-800 relative overflow-hidden font-sans">

      
      {/* Sidebar Wrapper - Constant width to prevent layout shift */}
      <div className="shrink-0 relative z-50 w-0 md:w-20">
        <aside 
          className={`bg-white text-slate-600 flex flex-col transition-all duration-300 ease-in-out shadow-xl h-full fixed left-0 top-0 overflow-hidden ${
            sidebarOpen ? 'w-64 opacity-100 border-r border-slate-200' : 'w-0 opacity-0 border-r-0 md:w-20 md:opacity-100 md:border-r md:border-slate-200'
          }`}
          onMouseEnter={() => window.innerWidth >= 768 && setSidebarOpen(true)}
          onMouseLeave={() => window.innerWidth >= 768 && setSidebarOpen(false)}
        >
          <div className={`h-16 flex items-center px-6 border-b border-slate-100 shrink-0 ${(sidebarOpen || window.innerWidth < 768) ? '' : 'justify-center px-0'}`}>
            <GraduationCap className="h-7 w-7 text-primary-600 shrink-0" />
            {sidebarOpen && <span className="ml-3 text-slate-900 font-bold text-xl tracking-tight truncate animate-in fade-in duration-500">SchoolERP</span>}
          </div>
          
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {isPortalUser ? (
              portalMenuItems.map((item) => (
                <Link key={item.path} to={item.path} className={`flex items-center py-2 rounded-xl transition-all duration-200 group ${
                  location.pathname === item.path 
                    ? (sidebarOpen ? 'px-4 bg-primary-50 text-primary-700 shadow-sm' : 'justify-center bg-primary-50 text-primary-700 scale-105') 
                    : (sidebarOpen ? 'px-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900' : 'justify-center text-slate-400 hover:text-slate-900')
                }`}>
                  <item.icon className={`h-5 w-5 shrink-0 transition-transform ${location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {sidebarOpen && <span className="ml-3 font-semibold text-sm truncate animate-in fade-in">{item.label}</span>}
                </Link>
              ))
            ) : (
            <>
            {/* 1. Dashboard */}
            <Link to="/" className={`flex items-center py-2 rounded-xl transition-all duration-200 group ${
              location.pathname === '/' 
                ? (sidebarOpen ? 'px-4 bg-primary-50 text-primary-700 shadow-sm' : 'justify-center bg-primary-50 text-primary-700 scale-105') 
                : (sidebarOpen ? 'px-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900' : 'justify-center text-slate-400 hover:text-slate-900')
            }`}>
              <LayoutDashboard className={`h-5 w-5 shrink-0 transition-transform ${location.pathname === '/' ? 'scale-110' : 'group-hover:scale-110'}`} />
              {sidebarOpen && <span className="ml-3 font-semibold text-sm truncate animate-in fade-in">Dashboard</span>}
            </Link>

            {/* 2. Students */}
            {checkPermission('students') && (
              <div className="space-y-1">
                <button 
                  onClick={() => sidebarOpen && toggleSubMenu('students')} 
                  className={`w-full flex items-center py-2 rounded-xl transition-all duration-200 group ${
                    ['/students', '/student-attendance', '/student-promotion', '/certificates', '/student-import'].includes(location.pathname)
                      ? (sidebarOpen ? 'px-4 bg-primary-50/50 text-primary-700' : 'justify-center bg-primary-50/50 text-primary-700 shadow-sm')
                      : (sidebarOpen ? 'px-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900' : 'justify-center text-slate-400 hover:text-slate-900')
                  }`}
                >
                  <Backpack className={`h-5 w-5 shrink-0 transition-transform ${['/students', '/student-attendance', '/student-promotion', '/certificates', '/student-import'].includes(location.pathname) ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">Student Management</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['students'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['students'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200 border-l border-slate-100 pl-2">
                    {[
                      { to: '/students', label: 'Student Directory', perm: 'student_directory' },
                      { to: '/student-attendance', label: 'Daily Attendance', perm: 'student_attendance' },
                      { to: '/student-promotion', label: 'Promotion & Transfer', perm: 'student_promotion' },
                      { to: '/certificates', label: 'Certificate & ID', perm: 'certificates' },
                      { to: '/student-import', label: 'Bulk Import', perm: 'student_import' }
                    ].filter(l => checkPermission(l.perm)).map(link => (
                      <Link 
                        key={link.to} 
                        to={link.to} 
                        className={`block py-1.5 text-sm transition-colors ${location.pathname === link.to ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Academic */}
            {checkPermission('academic') && (
              <div className="space-y-1">
                <button 
                  onClick={() => sidebarOpen && toggleSubMenu('academic')} 
                  className={`w-full flex items-center py-2 rounded-xl transition-all duration-200 group ${
                    ['/examinations', '/timetable', '/academic-calendar'].includes(location.pathname)
                      ? (sidebarOpen ? 'px-4 bg-primary-50/50 text-primary-700' : 'justify-center bg-primary-50/50 text-primary-700 shadow-sm')
                      : (sidebarOpen ? 'px-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900' : 'justify-center text-slate-400 hover:text-slate-900')
                  }`}
                >
                  <BookOpen className={`h-5 w-5 shrink-0 transition-transform ${['/examinations', '/timetable', '/academic-calendar'].includes(location.pathname) ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">Academic</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['academic'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['academic'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200 border-l border-slate-100 pl-2">
                    {[
                      { to: '/examinations', label: 'Exams & Result', perm: 'examinations' },
                      { to: '/timetable', label: 'Class Timetables', perm: 'timetable' },
                      { to: '/academic-calendar', label: 'Academic Calendar', perm: 'academic_calendar' }
                    ].filter(l => checkPermission(l.perm)).map(link => (
                      <Link 
                        key={link.to} 
                        to={link.to} 
                        className={`block py-1.5 text-sm transition-colors ${location.pathname === link.to ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Academic - End */}
            {checkPermission('finance') && (
              <div className="space-y-1">
                <button 
                  onClick={() => sidebarOpen && toggleSubMenu('accounts')} 
                  className={`w-full flex items-center py-2 rounded-xl transition-all duration-200 group ${
                    ['/financials', '/finance-dashboard', '/fees/heads', '/fees/structures', '/fees/generate', '/fees/settings'].includes(location.pathname) || location.pathname.startsWith('/fees/student')
                      ? (sidebarOpen ? 'px-4 bg-primary-50/50 text-primary-700' : 'justify-center bg-primary-50/50 text-primary-700 shadow-sm')
                      : (sidebarOpen ? 'px-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900' : 'justify-center text-slate-400 hover:text-slate-900')
                  }`}
                >
                  <Wallet className={`h-5 w-5 shrink-0 transition-transform ${location.pathname.includes('/fees') || location.pathname === '/financials' || location.pathname === '/finance-dashboard' ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">Finance</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['accounts'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['accounts'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200 border-l border-slate-100 pl-2">
                    {isPortalUser ? (
                      <Link to="/portal-fees" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/portal-fees' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Fee Ledger</Link>
                    ) : (
                      <>
                        <Link to="/finance-dashboard" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/finance-dashboard' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Finance Dashboard</Link>
                        <Link to="/financials" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/financials' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>General Ledger</Link>
                        <Link to="/fees/generate" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/fees/generate' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Fee Collection</Link>
                        <Link to="/fees/structures" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/fees/structures' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Fee Structures</Link>
                        <Link to="/fees/heads" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/fees/heads' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Fee Heads</Link>
                        <Link to="/fees/settings" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/fees/settings' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Fee Policies</Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 5. HR & Payroll */}
            {checkPermission('hr') && (
              <div className="space-y-1">
                <button 
                  onClick={() => sidebarOpen && toggleSubMenu('hr')} 
                  className={`w-full flex items-center py-2 rounded-xl transition-all duration-200 group ${
                    ['/employees', '/teachers', '/attendance', '/leaves', '/leave/settings', '/payroll'].includes(location.pathname)
                      ? (sidebarOpen ? 'px-4 bg-primary-50/50 text-primary-700' : 'justify-center bg-primary-50/50 text-primary-700 shadow-sm')
                      : (sidebarOpen ? 'px-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900' : 'justify-center text-slate-400 hover:text-slate-900')
                  }`}
                >
                  <UserCog className={`h-5 w-5 shrink-0 transition-transform ${['/employees', '/teachers', '/attendance', '/leaves', '/leave/settings', '/payroll'].includes(location.pathname) ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">HR & Payroll</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['hr'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['hr'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200 border-l border-slate-100 pl-2">
                    <Link to="/employees" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/employees' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Employee List</Link>
                    <Link to="/teachers" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/teachers' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Academic Staff</Link>
                    <Link to="/attendance" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/attendance' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Staff Attendance</Link>
                    <Link to="/leaves" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/leaves' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Leave Management</Link>
                    <Link to="/leave/settings" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/leave/settings' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Leave Policies</Link>
                    <Link to="/payroll" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/payroll' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Staff Payroll</Link>
                  </div>
                )}
              </div>
            )}

            {/* 6. Logistics */}
            {(checkPermission('inventory') || checkPermission('infrastructure') || checkPermission('front_office')) && (
              <div className="space-y-1">
                <button 
                  onClick={() => sidebarOpen && toggleSubMenu('logistics')} 
                  className={`w-full flex items-center py-2 rounded-xl transition-all duration-200 group ${
                    ['/front-office', '/communication', '/inventory', '/transport', '/hostel', '/library'].includes(location.pathname)
                      ? (sidebarOpen ? 'px-4 bg-primary-50/50 text-primary-700' : 'justify-center bg-primary-50/50 text-primary-700 shadow-sm')
                      : (sidebarOpen ? 'px-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900' : 'justify-center text-slate-400 hover:text-slate-900')
                  }`}
                >
                  <Package className={`h-5 w-5 shrink-0 transition-transform ${['/front-office', '/communication', '/inventory', '/transport', '/hostel', '/library'].includes(location.pathname) ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">Logistics</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['logistics'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['logistics'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200 border-l border-slate-100 pl-2">
                    {!isPortalUser ? (
                      <>
                        <Link to="/front-office" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/front-office' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Front Office</Link>
                        <Link to="/communication" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/communication' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Communication</Link>
                        <Link to="/inventory" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/inventory' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Inventory & Store</Link>
                      </>
                    ) : null}
                    <Link to="/transport" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/transport' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Transport</Link>
                    <Link to="/hostel" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/hostel' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Hostel</Link>
                    <Link to="/library" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/library' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Library</Link>
                  </div>
                )}
              </div>
            )}

            {/* 7. Masters */}
            {checkPermission('settings') && (
              <div className="space-y-1">
                <button 
                  onClick={() => sidebarOpen && toggleSubMenu('masters')} 
                  className={`w-full flex items-center py-2 rounded-xl transition-all duration-200 group ${
                    location.pathname.startsWith('/masters') || location.pathname === '/lookups'
                      ? (sidebarOpen ? 'px-4 bg-primary-50/50 text-primary-700' : 'justify-center bg-primary-50/50 text-primary-700 shadow-sm')
                      : (sidebarOpen ? 'px-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900' : 'justify-center text-slate-400 hover:text-slate-900')
                  }`}
                >
                  <Database className={`h-5 w-5 shrink-0 transition-transform ${location.pathname.startsWith('/masters') || location.pathname === '/lookups' ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">Masters</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['masters'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['masters'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200 border-l border-slate-100 pl-2">
                    {[
                      { to: '/masters/academic-years', label: 'Academic Sessions' },
                      { to: '/masters/classes', label: 'Class Master' },
                      { to: '/masters/sections', label: 'Section Master' },
                      { to: '/masters/subjects', label: 'Subject Master' },
                      { to: '/masters/departments', label: 'Departments' },
                      { to: '/masters/designations', label: 'Designations' },
                      { to: '/masters/rooms', label: 'Infrastructure Rooms' },
                      { to: '/masters/labs', label: 'Lab Master' },
                      { to: '/lookups', label: 'General Lookups' }
                    ].map(link => (
                      <Link 
                        key={link.to} 
                        to={link.to} 
                        className={`block py-1.5 text-sm transition-colors ${location.pathname === link.to ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI Curriculum Section */}
            {checkPermission('ai') && (
              <div className="space-y-1">
                <button 
                  onClick={() => sidebarOpen && toggleSubMenu('ai')} 
                  className={`w-full flex items-center py-2 rounded-xl transition-all duration-200 group ${
                    ['/ai-book-list', '/subject-content'].includes(location.pathname)
                      ? (sidebarOpen ? 'px-4 bg-primary-50/50 text-primary-700' : 'justify-center bg-primary-50/50 text-primary-700 shadow-sm')
                      : (sidebarOpen ? 'px-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900' : 'justify-center text-slate-400 hover:text-slate-900')
                  }`}
                >
                  <Sparkles className={`h-5 w-5 shrink-0 transition-transform ${['/ai-book-list', '/subject-content'].includes(location.pathname) ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">AI Curriculum</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['ai'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['ai'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200 border-l border-slate-100 pl-2">
                    {!isPortalUser && (
                      <>
                        <Link to="/ai-book-list" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/ai-book-list' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Manage Books</Link>
                        <Link to="/subject-content" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/subject-content' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Chapter Content</Link>
                      </>
                    )}
                    <Link to="/ai-tutor" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/ai-tutor' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>AI Learning Tutor</Link>
                  </div>
                )}
              </div>
            )}

            {/* 8. Administration */}
            {checkPermission('settings') && (
              <div className="space-y-1">
                <button 
                  onClick={() => sidebarOpen && toggleSubMenu('setup')} 
                  className={`w-full flex items-center py-2 rounded-xl transition-all duration-200 group ${
                    location.pathname.startsWith('/settings')
                      ? (sidebarOpen ? 'px-4 bg-primary-50/50 text-primary-700' : 'justify-center bg-primary-50/50 text-primary-700 shadow-sm')
                      : (sidebarOpen ? 'px-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900' : 'justify-center text-slate-400 hover:text-slate-900')
                  }`}
                >
                  <Settings className={`h-5 w-5 shrink-0 transition-transform ${location.pathname.startsWith('/settings') ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">Administration</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['setup'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['setup'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200 border-l border-slate-100 pl-2">
                    <Link to="/settings/organization" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/settings/organization' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Organization Settings</Link>
                    <Link to="/settings/users" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/settings/users' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>User Management</Link>
                    <Link to="/settings/permissions" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/settings/permissions' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>Role Permissions</Link>
                    <Link to="/settings/setup" className={`block py-1.5 text-sm transition-colors ${location.pathname === '/settings/setup' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-primary-600'}`}>System Setup</Link>
                  </div>
                )}
              </div>
            )}
            </>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-100 shrink-0">
            <button 
              onClick={() => { localStorage.removeItem('token'); setIsAuthenticated(false); }}
              className={`flex w-full items-center py-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group ${
              sidebarOpen ? 'px-4' : 'justify-center'
            }`}>
              <LogOut className="h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
              {sidebarOpen && <span className="ml-3 font-medium text-sm truncate animate-in fade-in">Logout</span>}
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        onClick={() => {
          sidebarOpen && setSidebarOpen(false);
          profileOpen && setProfileOpen(false);
          showSearchResults && setShowSearchResults(false);
        }}
      >
        
        <header className="h-16 glass-nav flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(!sidebarOpen);
              }}
              className="p-2 -ml-2 mr-4 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all active:scale-90"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {!isPortalUser && (
              <div className="relative ml-2 group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search students or navigation..."
                  className="block w-full md:w-72 pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-100/50 hover:bg-slate-100 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:outline-none border border-transparent focus:border-primary-500/30 transition-all placeholder:text-slate-400 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                />
                
                {showSearchResults && (filteredResults.length > 0 || studentResults.length > 0) && (
                  <div className="absolute top-full left-0 mt-2 w-full md:w-72 bg-white border border-slate-100 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {filteredResults.length > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-1 border-b border-slate-50 bg-slate-50/50">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Navigation</p>
                        </div>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                          {filteredResults.map((item, index) => (
                            <Link
                              key={index}
                              to={item.path}
                              onClick={() => {
                                setSearchQuery('');
                                setStudentResults([]);
                                setShowSearchResults(false);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-primary-400 mr-3"></div>
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {studentResults.length > 0 && (
                      <div>
                        <div className="px-3 py-1 border-b border-slate-50 bg-slate-50/50">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Students</p>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                          {studentResults.map((student) => (
                            <div
                              key={student.id}
                              onClick={() => {
                                setSearchQuery('');
                                setStudentResults([]);
                                setShowSearchResults(false);
                                setQuickViewStudent(student);
                              }}
                              className="flex items-center px-4 py-2.5 hover:bg-emerald-50 transition-colors group cursor-pointer"
                            >
                              <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] mr-3 shrink-0">
                                {student.firstName[0]}{student.lastName[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-700 leading-tight truncate group-hover:text-emerald-700">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">Adm: {student.admissionNo || 'N/A'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <HeaderContextArea 
               isPortalUser={isPortalUser} 
               currentSession={currentSession} 
            />
            <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl relative transition-all active:scale-95 group">
              <Bell className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white border border-white"></span>
            </button>
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileOpen(!profileOpen);
                }}
                className="flex items-center cursor-pointer bg-white border border-slate-100 hover:border-primary-100 hover:bg-primary-50/30 px-3 py-1.5 rounded-xl transition-all shadow-sm hover:shadow group"
              >
                <div className="h-8 w-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  {userName.substring(0, 2).toUpperCase()}
                </div>
                 <div className="ml-3 hidden md:block text-left mr-2">
                   <p className="text-sm font-bold text-slate-700 leading-none mb-1">{userName}</p>
                   <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Admin Panel</p>
                 </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">My Account</p>
                  </div>
                  <a href="#" className="flex items-center px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group">
                    <Settings className="h-4 w-4 mr-3 text-slate-400 group-hover:text-slate-600" />
                    Profile Settings
                  </a>
                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <button 
                      onClick={() => { localStorage.removeItem('token'); setIsAuthenticated(false); }}
                      className="flex w-full items-center px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors group"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-red-400 group-hover:text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Main Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden max-w-full bg-slate-50/50">
          <div className="p-6 overflow-x-hidden max-w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="/register" element={<Navigate to="/" />} />
              <Route path="/students" element={<Students checkWritePermission={checkWritePermission} />} />
              <Route path="/student-attendance" element={<StudentAttendance />} />
              <Route path="/student-promotion" element={<StudentPromotion />} />
              <Route path="/certificate-formats" element={<CertificateFormatManager />} />
              <Route path="/certificates/designer" element={<CustomCertificateDesigner />} />
              <Route path="/certificates" element={<CertificateGenerator />} />
              <Route path="/student-import" element={<StudentImport />} />
              <Route path="/transport" element={isPortalUser ? <PortalTransport /> : <TransportManagement />} />
              <Route path="/hostel" element={isPortalUser ? <PortalHostel /> : <HostelManagement />} />
              <Route path="/library" element={isPortalUser ? <PortalLibrary /> : <LibraryManagement />} />
              <Route path="/communication" element={<CommunicationHub />} />
              <Route path="/inventory" element={<InventoryStore />} />
              <Route path="/front-office" element={<FrontOffice />} />
              <Route path="/financials" element={<Financials />} />
              <Route path="/finance-dashboard" element={<FinanceDashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/examinations" element={<Examinations />} />
              <Route path="/leaves" element={<Leaves />} />
              <Route path="/leave/settings" element={<LeaveSettings />} />
              <Route path="/payroll" element={<Payroll />} />
              <Route path="/lookups" element={<LookupManagement />} />
              <Route path="/settings/users" element={<UserManagement />} />
              <Route path="/settings/permissions" element={<MenuPermissions />} />
              <Route path="/settings/setup" element={<SystemSetup />} />
              <Route path="/settings/organization" element={<OrganizationSettings />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/academic-calendar" element={<AcademicCalendar />} />
              <Route path="/ai-book-list" element={<AiBookList />} />
              <Route path="/subject-content" element={<SubjectContent />} />
              <Route path="/ai-tutor" element={<AiTutor />} />
              <Route path="/portal-fees" element={<PortalFees />} />
              
              {/* Academic Masters */}
              <Route path="/masters/classes" element={
                <MasterDataPage 
                  title="Class" subtitle="Manage school classes and their ordering" endpoint="classes"
                  writeAllowed={checkWritePermission('classes')}
                  columns={[ { key: 'name', label: 'Class Name' }, { key: 'order', label: 'Sort Order' }, { key: 'isActive', label: 'Status', render: (v) => v ? 'Active' : 'Inactive' } ]}
                  formFields={[ 
                    { name: 'name', label: 'Class Name', type: 'text', required: true },
                    { name: 'order', label: 'Sort Order', type: 'number', required: true, defaultValue: 0 },
                    { name: 'isActive', label: 'Active', type: 'checkbox' }
                  ]}
                />
              } />
              <Route path="/masters/sections" element={
                <MasterDataPage 
                  title="Section" subtitle="Manage academic sections (A, B, C, etc.)" endpoint="sections"
                  writeAllowed={checkWritePermission('sections')}
                  columns={[ { key: 'name', label: 'Section Name' }, { key: 'isActive', label: 'Status', render: (v) => v ? 'Active' : 'Inactive' } ]}
                  formFields={[ 
                    { name: 'name', label: 'Section Name', type: 'text', required: true },
                    { name: 'isActive', label: 'Active', type: 'checkbox' }
                  ]}
                />
              } />
              <Route path="/masters/subjects" element={
                <MasterDataPage 
                  title="Subject" subtitle="Manage academic subjects" endpoint="subjects"
                  writeAllowed={checkWritePermission('subjects')}
                  columns={[ { key: 'code', label: 'Code' }, { key: 'name', label: 'Subject Name' }, { key: 'isActive', label: 'Status' } ]}
                  formFields={[ 
                    { name: 'code', label: 'Subject Code', type: 'text', required: true },
                    { name: 'name', label: 'Subject Name', type: 'text', required: true },
                    { name: 'isActive', label: 'Active', type: 'checkbox' }
                  ]}
                />
              } />
              <Route path="/masters/academic-years" element={
                <MasterDataPage 
                  title="Academic Year" subtitle="Manage school sessions" endpoint="academic-years"
                  writeAllowed={checkWritePermission('academic_years')}
                  columns={[ 
                    { key: 'name', label: 'Year' }, 
                    { key: 'startDate', label: 'Starts', render: (v) => <span className="text-slate-600 font-medium">{new Date(v).toLocaleDateString()}</span> }, 
                    { key: 'endDate', label: 'Ends', render: (v) => <span className="text-slate-600 font-medium">{new Date(v).toLocaleDateString()}</span> }, 
                    { key: 'isCurrent', label: 'Current?', render: (v) => <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${v ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{v ? 'YES' : 'NO'}</span> } 
                  ]}
                  formFields={[ 
                    { name: 'name', label: 'Session Name', type: 'text', required: true },
                    { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                    { name: 'endDate', label: 'End Date', type: 'date', required: true },
                    { name: 'isCurrent', label: 'Is Current Year', type: 'checkbox' },
                    { name: 'isActive', label: 'Active', type: 'checkbox' }
                  ]}
                />
              } />

              {/* Administrative Masters */}
              <Route path="/masters/departments" element={
                <MasterDataPage 
                  title="Department" subtitle="School departments (Admin, Accounts, etc.)" endpoint="departments"
                  writeAllowed={checkWritePermission('departments')}
                  columns={[ { key: 'name', label: 'Department Name' }, { key: 'isActive', label: 'Status' } ]}
                  formFields={[ { name: 'name', label: 'Department Name', type: 'text', required: true }, { name: 'isActive', label: 'Active', type: 'checkbox' } ]}
                />
              } />
              <Route path="/masters/designations" element={
                <MasterDataPage 
                  title="Designation" subtitle="Employee job titles" endpoint="designations"
                  writeAllowed={checkWritePermission('designations')}
                  columns={[ { key: 'name', label: 'Designation' }, { key: 'isActive', label: 'Status' } ]}
                  formFields={[ { name: 'name', label: 'Designation Name', type: 'text', required: true }, { name: 'isActive', label: 'Active', type: 'checkbox' } ]}
                />
              } />
              <Route path="/masters/rooms" element={
                <MasterDataPage 
                  title="Room" subtitle="Manage infrastructure rooms" endpoint="rooms"
                  writeAllowed={checkWritePermission('rooms')}
                  columns={[ { key: 'roomNo', label: 'Room No' }, { key: 'type', label: 'Type' }, { key: 'capacity', label: 'Capacity' } ]}
                  formFields={[ 
                    { name: 'roomNo', label: 'Room Number/Name', type: 'text', required: true },
                    { name: 'type', label: 'Room Type', type: 'text' },
                    { name: 'capacity', label: 'Student Capacity', type: 'number', required: true, defaultValue: 40 },
                    { name: 'isActive', label: 'Active', type: 'checkbox' }
                  ]}
                />
              } />
              <Route path="/masters/labs" element={
                <MasterDataPage 
                  title="Lab" subtitle="Manage school laboratories" endpoint="labs"
                  writeAllowed={checkWritePermission('labs')}
                  columns={[ { key: 'name', label: 'Lab Name' }, { key: 'description', label: 'Description' } ]}
                  formFields={[ 
                    { name: 'name', label: 'Lab Name', type: 'text', required: true },
                    { name: 'description', label: 'Description', type: 'text' },
                    { name: 'isActive', label: 'Active', type: 'checkbox' }
                  ]}
                />
              } />
              {/* Fee Module Routes */}
              <Route path="/fees/heads" element={
                <MasterDataPage 
                  title="Fee Head" subtitle="Define fee categories (Tuition, Bus, etc.)" endpoint="fee/heads"
                  writeAllowed={checkWritePermission('fee_heads')}
                  columns={[ 
                    { key: 'name', label: 'Name' }, 
                    { key: 'isSelective', label: 'Selective?', render: (v) => v ? 'Yes' : 'No' }, 
                    { key: 'isActive', label: 'Status', render: (v) => v ? 'Active' : 'Inactive' } 
                  ]}
                  formFields={[ 
                    { name: 'name', label: 'Head Name', type: 'text', required: true },
                    { name: 'description', label: 'Description', type: 'text' },
                    { name: 'isSelective', label: 'Is Selective (Subscription Required)', type: 'checkbox' },
                    { name: 'isActive', label: 'Active', type: 'checkbox' }
                  ]}
                />
              } />
              <Route path="/fees/structures" element={<FeeStructures />} />

              <Route path="/fees/student/:studentId" element={<StudentAccount />} />
              <Route path="/fees/generate" element={<FeeGeneration />} />
              <Route path="/fees/settings" element={<FeeSettings />} />
            </Routes>
          </div>
        </main>
      </div>

      {quickViewStudent && (
        <StudentDetailPanel
          student={quickViewStudent}
          onClose={() => setQuickViewStudent(null)}
          canEdit={checkWritePermission('student_directory')}
          onEdit={(s) => {
            setQuickViewStudent(null);
            window.location.href = `/students?edit=${s.id}`;
          }}
          className={quickViewStudent?.classId ? classMap[quickViewStudent.classId] : ''}
          sectionName={quickViewStudent?.sectionId ? sectionMap[quickViewStudent.sectionId] : ''}
        />
      )}
    </div>
    </PortalProvider>
  );
}

// Helper Component for Header Area
function HeaderContextArea({ isPortalUser, currentSession }: { isPortalUser: boolean; currentSession: string }) {
    const { linkedWards, selectedWard, selectWard } = usePortal();

    if (isPortalUser) {
        if (linkedWards.length > 1) {
            return (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
                    <div className="flex items-center px-4 py-2 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all cursor-pointer relative group min-w-[200px] shadow-sm hover:shadow-md animate-in zoom-in-95 duration-500">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center mr-3 shrink-0 border border-blue-100">
                            <span className="text-xs font-black text-blue-600 uppercase">
                                {selectedWard?.firstName?.[0]}{selectedWard?.lastName?.[0]}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1.5 opacity-80">Managing Ward</p>
                            <div className="relative flex items-center justify-between">
                                <span className="text-sm font-black text-slate-900 truncate leading-none">
                                    {selectedWard ? `${selectedWard.firstName} ${selectedWard.lastName}` : 'Select Ward'}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500 transition-colors ml-2" />
                                
                                <select 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    value={selectedWard?.id}
                                    onChange={(e) => selectWard(e.target.value)}
                                >
                                    {linkedWards.map(w => (
                                        <option key={w.id} value={w.id}>{w.firstName} {w.lastName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        // Single ward portal: Show nothing as requested.
        return null;
    }

    // Organization Login (Staff/Admin)
    if (currentSession) {
        return (
            <div className="hidden sm:flex items-center px-4 py-1.5 rounded-xl bg-indigo-50/50 border border-indigo-100/50 shadow-sm transition-all hover:bg-indigo-50 hover:shadow group">
                <div className="h-8 w-8 rounded-lg bg-white shadow-sm border border-indigo-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 leading-tight">Current Session</span>
                    <span className="text-sm font-extrabold text-indigo-900 leading-tight">{currentSession}</span>
                </div>
            </div>
        );
    }

    return null;
}

export default function Root() {
  return (
    <Routes>
      <Route path="*" element={<App />} />
    </Routes>
  );
}

