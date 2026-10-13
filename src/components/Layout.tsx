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
  RotateCw,
  UserCheck,
  KeyRound,
  Plus,
  Radio,
  UserPlus,
  Send
} from 'lucide-react';
import { mockNotifications } from '../data/mockData';
import { NotificationItem } from '../types';
import PowerBIModal from './PowerBIModal';
import ExportModal from './ExportModal';
import ProfileSettingsModal, { UserProfileData } from './ProfileSettingsModal';
import ToastNotification, { ToastMessage } from './ToastNotification';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ModalPortal } from './ModalPortal';

interface LayoutProps {
  onLogout?: () => void;
}

export default function Layout({ onLogout }: LayoutProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [powerBiOpen, setPowerBiOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'details' | 'security' | 'powerbi'>('details');

  const quickActionsRef = useRef<HTMLDivElement>(null);

  // Administrator Profile State (marked as Demo)
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    name: sessionStorage.getItem('admin_name') || 'Dr. Sneha Lal, MD (Demo Admin)',
    role: 'Chief Clinical Admin (Demo)',
    npi: 'NPI-88492019',
    license: 'CA-MED-994821',
    department: 'Hospital Administration & Surgical Directorate (Demo Environment)',
    email: sessionStorage.getItem('admin_email') || 'admin@smileclinic.com',
    phone: '+1 (555) 942-8810',
    office: 'Tower A - Executive Wing, Suite 402',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&q=80',
    bio: 'Board-certified Maxillofacial Surgeon & Clinical Administrator in Smile Clinic Demo System.',
  });

  // Lock background window scrolling whenever any popup, drawer, or modal is open
  useBodyScrollLock(Boolean(mobileMenuOpen || notificationsOpen || profileOpen || powerBiOpen || exportOpen || profileModalOpen || broadcastModalOpen));

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
      if (quickActionsOpen && quickActionsRef.current && !quickActionsRef.current.contains(target)) {
        setQuickActionsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotificationsOpen(false);
        setProfileOpen(false);
        setMobileMenuOpen(false);
        setQuickActionsOpen(false);
        setBroadcastModalOpen(false);
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
  }, [notificationsOpen, profileOpen, quickActionsOpen]);

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
    sessionStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_auth');
    onLogout?.();
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
    <div className="h-screen bg-[#f7fafc] text-slate-800 flex flex-col antialiased selection:bg-primary/20 selection:text-primary overflow-hidden">
      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />

      {/* Global Modals */}
      <PowerBIModal isOpen={powerBiOpen} onClose={() => setPowerBiOpen(false)} />
      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />
      <ProfileSettingsModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        initialTab={profileModalTab}
        userProfile={userProfile}
        onSaveProfile={(updated) => {
          setUserProfile(updated);
          showToast('success', 'Profile Updated', `${updated.name}'s credentials saved successfully.`);
        }}
        onOpenPowerBI={() => setPowerBiOpen(true)}
        showToast={showToast}
      />

      {/* Global Emergency Broadcast Modal */}
      <AnimatePresence>
        {broadcastModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setBroadcastModalOpen(false)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white dark:bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
              >
                <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Emergency Clinical Broadcast</h3>
                      <p className="text-xs text-red-100">Direct Alert to All Active Surgical Suites &amp; Triage</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBroadcastModalOpen(false)}
                    className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!broadcastMessage.trim()) return;
                    showToast('error', 'Emergency Clinical Alert Broadcasted', broadcastMessage.trim());
                    setBroadcastModalOpen(false);
                    setBroadcastMessage('');
                  }} 
                  className="p-5 sm:p-6 space-y-4"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                      Emergency Alert Message
                    </label>
                    <textarea
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="e.g. Code Blue - OR-2 Immediate Anesthesia Assistance Required..."
                      rows={4}
                      required
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40"
                    />
                  </div>
                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setBroadcastModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/30 flex items-center gap-2"
                    >
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span>Broadcast Alert Now</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* Full Screen Dim Backdrop for open popups */}
      <AnimatePresence>
        {(notificationsOpen || profileOpen || quickActionsOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-[1px]"
            onClick={() => {
              setNotificationsOpen(false);
              setProfileOpen(false);
              setQuickActionsOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <header className="shrink-0 h-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-shadow">
        <div className="max-w-[1720px] mx-auto px-2.5 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Left: Mobile Toggle & Brand Logo Emblem Only (No Name text) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <NavLink to="/dashboard" className="flex items-center group shrink-0" title="Smile Clinic Home">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-[#004e57] text-white flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-all duration-200 shrink-0 border border-white/20">
                {/* Healthcare Cross & Shield Emblem */}
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" fill="rgba(255,255,255,0.18)"/>
                  <path d="M12 7v8M8 11h8" stroke="white" strokeWidth="2.5"/>
                </svg>
              </div>
            </NavLink>
          </div>

          {/* Center: Search Bar (Responsive on Mobile & Desktop) */}
          <div className="flex-1 max-w-xl mx-1.5 sm:mx-4">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && globalSearchTerm.trim()) {
                    navigate(`/dashboard/patients?search=${encodeURIComponent(globalSearchTerm.trim())}`);
                    showToast('info', 'Searching Records', `Looking up "${globalSearchTerm.trim()}"`);
                  }
                }}
                placeholder="Search patient, doctor, order..."
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-8 py-1.5 bg-slate-100 hover:bg-slate-200/60 focus:bg-white rounded-xl text-xs text-slate-900 placeholder:text-slate-400 border border-transparent focus:border-primary/30 focus:shadow-sm focus:outline-none transition-all"
              />
              <span className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right: Live Sync + Profile Picture & Name */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Live 5-Second Sync Indicator */}
            <div 
              onClick={() => {
                setIsSyncing(true);
                setTimeout(() => setIsSyncing(false), 800);
                showToast('success', 'Real-Time Sync Completed', 'Local clinical state synchronized with central HL7 node.');
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/70 rounded-xl text-[11px] sm:text-xs font-semibold text-emerald-800 shrink-0 transition-all cursor-pointer shadow-2xs group"
              title="Click to force immediate synchronization (Auto-syncs every 5s)"
            >
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isSyncing ? 'animate-ping' : ''}`} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500" />
              </span>
              <RotateCw className={`w-3.5 h-3.5 text-emerald-600 transition-transform ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="font-bold hidden xs:inline">Sync</span>
              <span className="text-[10px] px-1 sm:px-1.5 py-0.5 rounded-md bg-emerald-200/60 text-emerald-900 font-mono">
                {syncCountdown}s
              </span>
            </div>

            {/* Profile Dropdown: Profile Picture & Name */}
            <div className="relative shrink-0" ref={profileRef}>
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  if (notificationsOpen) setNotificationsOpen(false);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-xl transition-all shrink-0 ${
                  profileOpen ? 'bg-slate-100 ring-2 ring-primary/20' : 'hover:bg-slate-100'
                }`}
                aria-expanded={profileOpen}
              >
                <div className="relative shrink-0">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-2 ring-primary/30"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                </div>
                <div className="text-left shrink-0">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-900 block leading-tight max-w-[70px] xs:max-w-[100px] sm:max-w-none truncate">
                    {userProfile.name.split(',')[0]}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium hidden sm:block">
                    {userProfile.role}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
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
                      className="fixed sm:absolute inset-x-3 sm:inset-x-auto right-3 sm:right-0 top-16 sm:top-auto sm:mt-2.5 max-w-[calc(100vw-1.5rem)] sm:w-72 bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-200/90 py-2 z-50 ring-1 ring-black/5 max-h-[85vh] overflow-y-auto"
                    >
                    <div className="p-3 border-b border-slate-100">
                      <div 
                        onClick={() => {
                          setProfileOpen(false);
                          setProfileModalTab('details');
                          setProfileModalOpen(true);
                        }}
                        className="p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={userProfile.avatar}
                            alt={userProfile.name}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/30 group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-primary transition-colors">
                              {userProfile.name}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {userProfile.npi} • {userProfile.role}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Executive Level 4 Access
                          </span>
                          <span className="text-[10px] font-bold text-primary group-hover:underline">
                            Edit Profile &rarr;
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-1.5">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setProfileModalTab('details');
                          setProfileModalOpen(true);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center gap-2.5 transition-colors"
                      >
                        <UserCheck className="w-4 h-4 text-primary" />
                        <span>Account &amp; Clinical Details</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setProfileModalTab('security');
                          setProfileModalOpen(true);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center gap-2.5 transition-colors"
                      >
                        <KeyRound className="w-4 h-4 text-amber-500" />
                        <span>Security &amp; Change Password</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setProfileModalTab('powerbi');
                          setProfileModalOpen(true);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center gap-2.5 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 text-emerald-600" />
                        <span>Executive Power BI Telemetry</span>
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

      {/* Main Body with Fixed Left Sidebar + Scrollable Inner Content */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto overflow-hidden">
        {/* Desktop Sidebar with LayoutId Spring Animation - Stays Fixed on Screen! */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 bg-white/80 backdrop-blur-md shrink-0 py-6 px-4 h-full overflow-y-auto">
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
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[#004e57] text-white flex items-center justify-center font-bold shadow-md shadow-primary/20">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" fill="rgba(255,255,255,0.18)"/>
                        <path d="M12 7v8M8 11h8" stroke="white" strokeWidth="2.5"/>
                      </svg>
                    </div>
                    <div>
                      <span className="font-extrabold text-sm block text-slate-900">Smile Clinic</span>
                      <span className="text-[10px] text-teal-700 uppercase tracking-wider font-extrabold">Admin Portal</span>
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
                      setExportOpen(true);
                    }}
                    className="w-full py-2 px-3 bg-teal-50 text-teal-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-teal-700" />
                    <span>Export Clinical Reports</span>
                  </button>
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

        {/* Inner Page Content - ONLY this area scrolls vertically! */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-full overflow-y-auto h-full">
          <Outlet context={{ showToast, openPowerBi: () => setPowerBiOpen(true), openExport: () => setExportOpen(true), openBroadcast: () => setBroadcastModalOpen(true) }} />
        </main>
      </div>
    </div>
  );
}
