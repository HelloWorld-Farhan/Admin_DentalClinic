import React, { useState, useRef, useEffect } from 'react';
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
  Trash2,
  Check,
  Calendar,
  RotateCw
} from 'lucide-react';
import { mockNotifications } from '../data/mockData';
import { NotificationItem } from '../types';
import PowerBIModal from './PowerBIModal';
import ExportModal from './ExportModal';
import ToastNotification, { ToastMessage } from './ToastNotification';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [powerBiOpen, setPowerBiOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Lock background window scrolling whenever any popup, drawer, or modal is open
  useBodyScrollLock(Boolean(mobileMenuOpen || notificationsOpen || profileOpen || powerBiOpen || exportOpen));

  // Today's Date and 5-second recurring live sync state
  const [currentDateFormatted] = useState(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  });

  const [syncCountdown, setSyncCountdown] = useState(5);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // 5-second periodic live sync interval
    const syncInterval = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
      }, 850);
      setSyncCountdown(5);
    }, 5000);

    const countdownInterval = setInterval(() => {
      setSyncCountdown((prev) => (prev <= 1 ? 5 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  const [notificationFilter, setNotificationFilter] = useState<'all' | 'critical' | 'financial' | 'triage'>('all');
  
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Close notifications/profile on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (notificationsOpen && notificationRef.current && !notificationRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (profileOpen && profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotificationsOpen(false);
        setProfileOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notificationsOpen, profileOpen]);

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

  const dismissNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    setNotificationsOpen(false);

    if (item.type === 'critical') {
      navigate('/dashboard/laboratory');
      showToast('info', 'Navigating to Diagnostics', item.title);
    } else if (item.type === 'financial') {
      navigate('/dashboard/billing');
      showToast('info', 'Navigating to Billing Claims', item.title);
    } else if (item.type === 'triage') {
      navigate('/dashboard/reception');
      showToast('info', 'Navigating to Front-Desk Triage', item.title);
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
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

  const filteredNotifications = notifications.filter(n => {
    if (notificationFilter === 'all') return true;
    return n.type === notificationFilter;
  });

  return (
    <div className="min-h-screen bg-[#f7fafc] text-slate-800 flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />

      {/* Global Modals */}
      <PowerBIModal isOpen={powerBiOpen} onClose={() => setPowerBiOpen(false)} />
      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />

      {/* Full Screen Dim Backdrop for open popups */}
      <AnimatePresence>
        {(notificationsOpen || profileOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-[1px]"
            onClick={() => {
              setNotificationsOpen(false);
              setProfileOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shrink-0 transition-shadow">
        <div className="max-w-[1720px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-all duration-200">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_hospital
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-slate-900 leading-none">Smile Clinic</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-primary/10 text-primary uppercase tracking-wide">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Hospital &amp; Clinical Management</span>
              </div>
            </NavLink>
          </div>

          {/* Middle: Today's Date & Live 5s Sync Telemetry + Global Search */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-2xl mx-2 lg:mx-4">
            {/* Today's Date Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shrink-0 transition-colors shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{currentDateFormatted}</span>
            </div>

            {/* Live 5-Second Sync Indicator */}
            <div 
              onClick={() => {
                setIsSyncing(true);
                setTimeout(() => setIsSyncing(false), 800);
                showToast('success', 'Real-Time Sync Completed', 'Local clinical state synchronized with central HL7 node.');
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/70 rounded-xl text-xs font-semibold text-emerald-800 shrink-0 transition-all cursor-pointer shadow-2xs group"
              title="Click to force immediate synchronization (Auto-syncs every 5s)"
            >
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isSyncing ? 'animate-ping' : ''}`} />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <RotateCw className={`w-3.5 h-3.5 text-emerald-600 transition-transform ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="font-bold">Live Sync</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-200/60 text-emerald-900 font-mono">
                {isSyncing ? 'Syncing...' : `${syncCountdown}s`}
              </span>
            </div>

            {/* Global Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search patient MRN, doctor NPI, claim #, or lab order..."
                className="w-full pl-9 pr-8 py-1.5 bg-slate-100 focus:bg-white rounded-xl text-xs text-slate-900 placeholder:text-slate-400 border border-transparent focus:border-primary/30 focus:shadow-sm focus:outline-none transition-all"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Power BI Button */}
            <button
              onClick={() => setPowerBiOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-semibold rounded-xl text-xs border border-amber-500/20 transition-all shadow-xs active:scale-95"
              title="Open Microsoft Power BI Telemetry"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
              <span>Power BI</span>
            </button>

            {/* Export Reports Button */}
            <button
              onClick={() => setExportOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            {/* Notifications Menu with Popover */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  if (profileOpen) setProfileOpen(false);
                }}
                className={`relative p-2 rounded-xl transition-all ${
                  notificationsOpen 
                    ? 'bg-primary/10 text-primary ring-2 ring-primary/20' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Clinical Alert Center"
                aria-expanded={notificationsOpen}
              >
                <BellRing className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse shadow-sm" />
                )}
              </button>

              {/* Notification Popover */}
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-slate-900/10 cursor-default" 
                      onClick={() => setNotificationsOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className="absolute right-0 mt-2.5 w-[340px] sm:w-[420px] bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200/90 overflow-hidden z-50 ring-1 ring-black/5"
                    >
                    {/* Popover Header */}
                    <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-400/20 flex items-center justify-center">
                            <BellRing className="w-4 h-4 text-amber-300" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs tracking-wide">Clinical Intelligence Alerts</h4>
                            <p className="text-[10px] text-slate-300">Live HL7 &amp; Hospital Telemetry</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 shadow-xs">
                              {unreadCount} New
                            </span>
                          )}
                          <button
                            onClick={() => setNotificationsOpen(false)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Filter Chips */}
                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-700/60">
                        {(['all', 'critical', 'financial', 'triage'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setNotificationFilter(tab)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                              notificationFilter === tab
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="ml-auto text-[10px] text-sky-300 hover:text-white transition-colors flex items-center gap-1 font-semibold"
                          >
                            <Check className="w-3 h-3" />
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
                      {filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-80" />
                          <p className="text-xs font-semibold text-slate-600">All alerts cleared</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">No pending triage or clinical events</p>
                        </div>
                      ) : (
                        filteredNotifications.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={`p-3.5 hover:bg-slate-50/90 transition-all flex items-start gap-3 cursor-pointer group relative ${
                              !item.read ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {item.type === 'critical' ? (
                                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-xs">
                                  <AlertTriangle className="w-4 h-4" />
                                </div>
                              ) : item.type === 'financial' ? (
                                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                                  <CreditCard className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pr-6">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-slate-900 group-hover:text-primary transition-colors truncate">
                                  {item.title}
                                </span>
                                {!item.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 leading-snug mt-1 line-clamp-2">
                                {item.message}
                              </p>
                              <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock className="w-3 h-3 text-slate-400" /> {item.time}
                                </span>
                                <span className="font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                  Review details &rarr;
                                </span>
                              </div>
                            </div>
                            {/* Dismiss single button */}
                            <button
                              onClick={(e) => dismissNotification(e, item.id)}
                              className="absolute top-3 right-3 p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                              title="Dismiss alert"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Popover Footer */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          setNotificationsOpen(false);
                          setPowerBiOpen(true);
                        }}
                        className="font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Telemetry in Power BI</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setNotifications([])}
                        className="text-[11px] text-slate-500 hover:text-red-600 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                  </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  if (notificationsOpen) setNotificationsOpen(false);
                }}
                className={`flex items-center gap-2 p-1.5 rounded-xl transition-all ${
                  profileOpen ? 'bg-slate-100 ring-2 ring-primary/20' : 'hover:bg-slate-100'
                }`}
                aria-expanded={profileOpen}
              >
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&q=80"
                    alt="Dr. Sarah Sterling"
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-primary/30"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">Dr. Sarah Sterling</span>
                  <span className="text-[10px] text-slate-500 font-medium block">Chief Hospital Admin</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-slate-900/10 cursor-default" 
                      onClick={() => setProfileOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className="absolute right-0 mt-2.5 w-64 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200/90 py-2 z-50 ring-1 ring-black/5"
                    >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&q=80"
                          alt="Dr. Sarah Sterling"
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/30"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Dr. Sarah Sterling</span>
                          <span className="text-[11px] text-slate-500 block">NPI-88492019 • Chief Admin</span>
                        </div>
                      </div>
                      <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Executive Level 4 Access
                      </div>
                    </div>

                    <div className="py-1.5">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setPowerBiOpen(true);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center gap-2.5 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 text-amber-500" />
                        <span>Executive Power BI Suite</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setExportOpen(true);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center gap-2.5 transition-colors"
                      >
                        <Download className="w-4 h-4 text-slate-400" />
                        <span>Export Hospital Reports</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate('/dashboard/reception');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center gap-2.5 transition-colors"
                      >
                        <BellRing className="w-4 h-4 text-slate-400" />
                        <span>Emergency Front-Desk Triage</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1.5 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out of Portal</span>
                      </button>
                    </div>
                  </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Animated Content */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        {/* Desktop Sidebar with LayoutId Spring Animation */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 bg-white/70 backdrop-blur-md shrink-0 py-6 px-4">
          <div className="space-y-1.5 flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
              Core Hospital Operations
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = item.to === '/dashboard'
                ? (location.pathname === '/dashboard' || location.pathname === '/')
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group overflow-hidden ${
                    isCurrent
                      ? 'text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {/* Framer Motion Active Pill Background with Spring Physics */}
                  {isCurrent && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="absolute inset-0 bg-primary rounded-xl shadow-md shadow-primary/25"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isCurrent ? 'text-white' : 'text-slate-400 group-hover:text-primary'
                    }`} />
                    <span className="transition-colors">{item.label}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md relative z-10 transition-colors ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                </NavLink>
              );
            })}
          </div>

          {/* Sidebar System Telemetry Card */}
          <div className="mt-auto pt-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary-container to-primary text-white space-y-2 shadow-lg shadow-primary/10">
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
                      <span className="material-symbols-outlined text-xl">local_hospital</span>
                    </div>
                    <div>
                      <span className="font-bold text-sm block text-slate-900">Smile Clinic</span>
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
                    const isCurrent = item.to === '/dashboard'
                      ? (location.pathname === '/dashboard' || location.pathname === '/')
                      : location.pathname.startsWith(item.to);

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/dashboard'}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isCurrent
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
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

        {/* Content Outlet with Direct Responsive Mounting */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          <Outlet context={{ showToast, openPowerBi: () => setPowerBiOpen(true), openExport: () => setExportOpen(true) }} />
        </main>
      </div>
    </div>
  );
}
