import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Users, 
  BellRing, 
  CreditCard, 
  FlaskConical, 
  BarChart3, 
  Download, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { mockNotifications } from '../data/mockData';
import { NotificationItem } from '../types';
import PowerBIModal from './PowerBIModal';
import ExportModal from './ExportModal';
import ToastNotification, { ToastMessage } from './ToastNotification';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [powerBiOpen, setPowerBiOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState('All Departments');
  
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read).length;

  const showToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('info', 'Notifications Updated', 'All items marked as read');
  };

  const handleLogout = () => {
    showToast('info', 'Session Terminated', 'Securely logged out of Admin Portal');
    setTimeout(() => {
      navigate('/login');
    }, 400);
  };

  const navItems = [
    {
      to: '/dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      to: '/dashboard/doctors',
      label: 'Doctors & OR Schedule',
      icon: Stethoscope,
      badge: '6 Suites',
    },
    {
      to: '/dashboard/patients',
      label: 'Patient EHR Registry',
      icon: Users,
      badge: '14.8k',
    },
    {
      to: '/dashboard/reception',
      label: 'Front-Desk Triage',
      icon: BellRing,
      badge: '8 Active',
    },
    {
      to: '/dashboard/billing',
      label: 'Billing & Financials',
      icon: CreditCard,
      badge: '94.2%',
    },
    {
      to: '/dashboard/laboratory',
      label: 'Lab & Diagnostics',
      icon: FlaskConical,
      badge: '289 Orders',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7fafc] text-on-surface flex flex-col antialiased">
      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />

      {/* Global Modals */}
      <PowerBIModal isOpen={powerBiOpen} onClose={() => setPowerBiOpen(false)} />
      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shrink-0">
        <div className="max-w-[1720px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_hospital
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-slate-900 leading-none">Smile Clinic</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Hospital &amp; Clinical Management</span>
              </div>
            </NavLink>
          </div>

          {/* Middle: Department Selector & Search */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-xl mx-4">
            {/* Department Dropdown */}
            <div className="relative shrink-0">
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  showToast('info', 'Department Filter', `Switched view to ${e.target.value}`);
                }}
                className="appearance-none pl-3 pr-8 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 border-none cursor-pointer focus:ring-2 focus:ring-primary transition-all"
              >
                <option>All Departments</option>
                <option>Oral &amp; Maxillofacial Surgery</option>
                <option>Restorative &amp; Endodontics</option>
                <option>Orthodontics &amp; Craniofacial</option>
                <option>Periodontics &amp; Implants</option>
                <option>Emergency Triage Station</option>
                <option>Pathology &amp; Diagnostics</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Global Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search patient MRN, doctor NPI, claim #, or lab order..."
                className="w-full pl-9 pr-8 py-1.5 bg-slate-100 focus:bg-white rounded-xl text-xs text-slate-900 placeholder:text-slate-400 border border-transparent focus:border-primary/30 focus:shadow-sm focus:outline-none transition-all"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Power BI Button */}
            <button
              onClick={() => setPowerBiOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-semibold rounded-xl text-xs border border-amber-500/20 transition-all shadow-sm"
              title="Open Microsoft Power BI Telemetry"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
              <span>Power BI</span>
            </button>

            {/* Export Reports Button */}
            <button
              onClick={() => setExportOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Clinical Alert Center"
              >
                <BellRing className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notification Popover */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                  >
                    <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BellRing className="w-4 h-4 text-amber-400" />
                        <h4 className="font-bold text-xs">Clinical Intelligence Alerts</h4>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300">
                          {unreadCount} New
                        </span>
                      </div>
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-slate-300 hover:text-white transition-colors"
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                            !item.read ? 'bg-sky-50/50' : ''
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {item.type === 'critical' ? (
                              <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                            ) : item.type === 'financial' ? (
                              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                <CreditCard className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-xs text-slate-900 block">{item.title}</span>
                            <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{item.message}</p>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" /> {item.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                      <button
                        onClick={() => {
                          setNotificationsOpen(false);
                          setPowerBiOpen(true);
                        }}
                        className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1"
                      >
                        <span>View Telemetry Log in Power BI</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&q=80"
                  alt="Dr. Sarah Sterling"
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-primary/20"
                />
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">Dr. Sarah Sterling</span>
                  <span className="text-[10px] text-slate-500 font-medium block">Chief Hospital Admin</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50"
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900 block">Credentialed Role</span>
                      <span className="text-[11px] text-primary font-semibold flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Executive Level 4 Access
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setPowerBiOpen(true);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                        <span>Executive Power BI Suite</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setExportOpen(true);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4 text-slate-400" />
                        <span>Export Hospital Reports</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Portal</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shrink-0 py-6 px-4">
          <div className="space-y-1.5 flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
              Core Hospital Operations
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to === '/dashboard' && location.pathname === '/');
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-primary transition-colors'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                </NavLink>
              );
            })}
          </div>

          {/* Sidebar System Telemetry Card */}
          <div className="mt-auto pt-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary-container to-primary text-white space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  HIPAA Secure
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">TLS 1.3</span>
              </div>
              <p className="text-[11px] text-on-primary-container leading-snug">
                Encrypted multi-tenant clinical node active on US-East-1.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-200">
                <span>99.98% System Uptime</span>
                <span className="font-bold text-emerald-300">Normal</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-Out Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-950/60 z-50 lg:hidden backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 bottom-0 left-0 w-72 bg-white z-50 lg:hidden shadow-2xl flex flex-col p-5 overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                      🦷
                    </div>
                    <div>
                      <span className="font-bold text-sm block">Smile Clinic</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Admin Portal</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1.5 flex-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) => `
                          flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                            isActive
                              ? 'bg-primary text-white shadow-sm'
                              : 'text-slate-700 hover:bg-slate-100'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/10">
                          {item.badge}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setPowerBiOpen(true);
                    }}
                    className="w-full py-2 px-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4 text-amber-600" />
                    <span>Open Power BI Analytics</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 px-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content Outlet */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          <Outlet context={{ showToast, openPowerBi: () => setPowerBiOpen(true), openExport: () => setExportOpen(true) }} />
        </main>
      </div>
    </div>
  );
}
