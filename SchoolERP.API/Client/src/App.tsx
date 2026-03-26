import { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  GraduationCap, Settings, LogOut, Bell, Menu, ChevronDown, 
  LayoutDashboard, UserCog, Package, Building2, Wallet, Backpack, Database
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
import TransportHostel from './pages/TransportHostel';
import InventoryStore from './pages/InventoryStore';
import FrontOffice from './pages/FrontOffice';
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
import { usePermissions } from './hooks/usePermissions';
import { useEffect as useAppEffect } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<string>('');
  const location = useLocation();

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
  const currentUserId = decodedToken?.id || '';
  const { hasPermission: baseHasPermission, fetchMyPermissions } = usePermissions();
  const hasPermission = (key: string) => {
    if (isAdmin) return true;
    if (['finance', 'communication', 'infrastructure', 'inventory', 'front_office'].includes(key)) return true;
    return baseHasPermission(key);
  };

  useAppEffect(() => {
    if (isAuthenticated) {
      fetchMyPermissions();
      // Fetch current academic session
      import('./api/masterApi').then(({ masterApi }) => {
        masterApi.getAll('academic-years').then(years => {
          const current = years.find((y: any) => y.isCurrent);
          if (current) setCurrentSession(current.name);
        });
      });
    }
  }, [isAuthenticated, currentRole, currentUserId, fetchMyPermissions]);

  const userName = decodedToken?.Name || 'User';
  const organizationName = decodedToken?.OrganizationName || 'School';

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth initialIsLogin={true} onAuthSuccess={() => setIsAuthenticated(true)} />} />
        <Route path="/register" element={<Auth initialIsLogin={false} onAuthSuccess={() => setIsAuthenticated(true)} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
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
            {/* 1. Dashboard */}
            <Link to="/" className={`flex items-center py-2 rounded-xl transition-all duration-200 group ${
              sidebarOpen ? 'px-4 bg-primary-50 text-primary-700' : 'justify-center text-primary-600'
            }`}>
              <LayoutDashboard className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
              {sidebarOpen && <span className="ml-3 font-semibold text-sm truncate animate-in fade-in">Dashboard</span>}
            </Link>

            {/* 2. Academic & Students */}
            {hasPermission('students') && (
              <div className="space-y-1">
                <button onClick={() => sidebarOpen && toggleSubMenu('students')} className={`w-full flex items-center py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group ${sidebarOpen ? 'px-4' : 'justify-center'}`}>
                  <Backpack className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">Academic Hub</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['students'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['students'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                    <Link to="/students" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Student Directory</Link>
                    <Link to="/student-attendance" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Daily Attendance</Link>
                    <Link to="/examinations" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Exams & Result</Link>
                    <Link to="/student-promotion" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Promotion & Transfer</Link>
                    <Link to="/certificates" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Certificate & ID</Link>
                    <Link to="/timetable" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Class Timetables</Link>
                    <Link to="/student-import" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Bulk Import</Link>
                  </div>
                )}
              </div>
            )}

            {/* 3. Reception & CRM */}
            {(hasPermission('front_office') || hasPermission('communication')) && (
              <div className="space-y-1">
                <button onClick={() => sidebarOpen && toggleSubMenu('crm')} className={`w-full flex items-center py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group ${sidebarOpen ? 'px-4' : 'justify-center'}`}>
                  <Building2 className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">Front Desk & CRM</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['crm'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['crm'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                    <Link to="/front-office" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Admission Enquiry</Link>
                    <Link to="/communication" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Communication Hub</Link>
                  </div>
                )}
              </div>
            )}

            {/* 4. Accounts & Finance */}
            {hasPermission('finance') && (
              <div className="space-y-1">
                <button onClick={() => sidebarOpen && toggleSubMenu('accounts')} className={`w-full flex items-center py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group ${sidebarOpen ? 'px-4' : 'justify-center'}`}>
                  <Wallet className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">Accounts & Fees</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['accounts'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['accounts'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                    <Link to="/financials" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">General Ledger</Link>
                    <Link to="/fees/heads" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Fee Heads</Link>
                    <Link to="/fees/structures" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Fee Structure</Link>
                    <Link to="/fees/generate" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Fee Allocation</Link>
                    <Link to="/fees/settings" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Fee Policies & Discounts</Link>
                  </div>
                )}
              </div>
            )}

            {/* 5. Human Resources */}
            {hasPermission('hr') && (
              <div className="space-y-1">
                <button onClick={() => sidebarOpen && toggleSubMenu('hr')} className={`w-full flex items-center py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group ${sidebarOpen ? 'px-4' : 'justify-center'}`}>
                  <UserCog className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">Human Resources</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['hr'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['hr'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                    <Link to="/employees" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Employee List</Link>
                    <Link to="/teachers" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Academic Staff</Link>
                    <Link to="/attendance" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Staff Attendance</Link>
                    <Link to="/leaves" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Leave Management</Link>
                    <Link to="/leave/settings" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Leave Policies</Link>
                    <Link to="/payroll" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Staff Payroll</Link>
                  </div>
                )}
              </div>
            )}

            {/* 6. Operations & Assets */}
            {(hasPermission('inventory') || hasPermission('infrastructure')) && (
              <div className="space-y-1">
                <button onClick={() => sidebarOpen && toggleSubMenu('ops')} className={`w-full flex items-center py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group ${sidebarOpen ? 'px-4' : 'justify-center'}`}>
                  <Package className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">Ops & Assets</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['ops'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['ops'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                    <Link to="/inventory" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Inventory & Store</Link>
                    <Link to="/infrastructure" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Transport & Hostel</Link>
                  </div>
                )}
              </div>
            )}

            {/* 7. Masters Menu */}
            {hasPermission('settings') && (
              <div className="space-y-1">
                <button onClick={() => sidebarOpen && toggleSubMenu('masters')} className={`w-full flex items-center py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group ${sidebarOpen ? 'px-4' : 'justify-center'}`}>
                  <Database className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">Masters Menu</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['masters'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['masters'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                    <Link to="/masters/academic-years" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Academic Sessions</Link>
                    <Link to="/masters/classes" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Class Master</Link>
                    <Link to="/masters/sections" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Section Master</Link>
                    <Link to="/masters/subjects" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Subject Master</Link>
                    <Link to="/masters/departments" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Departments</Link>
                    <Link to="/masters/designations" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Designations</Link>
                    <Link to="/masters/rooms" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Infrastructure Rooms</Link>
                    <Link to="/masters/labs" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Lab Master</Link>
                    <Link to="/lookups" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">General Lookups</Link>
                  </div>
                )}
              </div>
            )}

            {/* 8. Settings */}
            {hasPermission('settings') && (
              <div className="space-y-1">
                <button onClick={() => sidebarOpen && toggleSubMenu('setup')} className={`w-full flex items-center py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group ${sidebarOpen ? 'px-4' : 'justify-center'}`}>
                  <Settings className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 font-medium text-sm truncate flex-1 text-left">Settings</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenus['setup'] ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {sidebarOpen && openMenus['setup'] && (
                  <div className="ml-9 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                    <Link to="/settings/permissions" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">Menu Controls</Link>
                    <Link to="/settings/users" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">User Management</Link>
                    <Link to="/settings/setup" className="block py-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors">System Quick Setup</Link>
                  </div>
                )}
              </div>
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
        }}
      >
        
        <header className="h-16 glass-nav flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(!sidebarOpen);
              }}
              className="p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            

          </div>
          
          <div className="flex items-center space-x-4">
            {currentSession && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                Session: {currentSession}
              </span>
            )}
            <button className="p-1.5 text-slate-400 hover:text-slate-600 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileOpen(!profileOpen);
                }}
                className="flex items-center cursor-pointer border-l border-slate-200 pl-4 group hover:bg-slate-100/50 py-1 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0 ring-2 ring-white group-hover:ring-primary-100 transition-all">
                  {userName.substring(0, 2).toUpperCase()}
                </div>
                 <div className="ml-2 hidden md:block text-left">
                   <p className="text-xs font-normal text-slate-700 leading-tight">{userName}</p>
                   <p className="text-[10px] text-slate-500 uppercase tracking-tight">School: {organizationName}</p>
                 </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 ml-2 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
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
              <Route path="/students" element={<Students />} />
              <Route path="/student-attendance" element={<StudentAttendance />} />
              <Route path="/student-promotion" element={<StudentPromotion />} />
              <Route path="/certificates" element={<CertificateGenerator />} />
              <Route path="/student-import" element={<StudentImport />} />
              <Route path="/infrastructure" element={<TransportHostel />} />
              <Route path="/communication" element={<CommunicationHub />} />
              <Route path="/inventory" element={<InventoryStore />} />
              <Route path="/front-office" element={<FrontOffice />} />
              <Route path="/financials" element={<Financials />} />
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
              <Route path="/timetable" element={<Timetable />} />
              
              {/* Academic Masters */}
              <Route path="/masters/classes" element={
                <MasterDataPage 
                  title="Class" subtitle="Manage school classes and their ordering" endpoint="classes"
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
                  columns={[ { key: 'name', label: 'Department Name' }, { key: 'isActive', label: 'Status' } ]}
                  formFields={[ { name: 'name', label: 'Department Name', type: 'text', required: true }, { name: 'isActive', label: 'Active', type: 'checkbox' } ]}
                />
              } />
              <Route path="/masters/designations" element={
                <MasterDataPage 
                  title="Designation" subtitle="Employee job titles" endpoint="designations"
                  columns={[ { key: 'name', label: 'Designation' }, { key: 'isActive', label: 'Status' } ]}
                  formFields={[ { name: 'name', label: 'Designation Name', type: 'text', required: true }, { name: 'isActive', label: 'Active', type: 'checkbox' } ]}
                />
              } />
              <Route path="/masters/rooms" element={
                <MasterDataPage 
                  title="Room" subtitle="Manage infrastructure rooms" endpoint="rooms"
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
    </div>
  );
}

export default App;
