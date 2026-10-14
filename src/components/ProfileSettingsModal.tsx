import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  KeyRound,
  ShieldCheck,
  User,
  Camera,
  Save,
  Eye,
  EyeOff,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Smartphone,
  Upload,
  RotateCcw,
  Sparkles,
  Lock,
} from 'lucide-react';
import { ModalPortal } from './ModalPortal';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export interface UserProfileData {
  name: string;
  role: string;
  npi: string;
  license: string;
  department: string;
  email: string;
  phone: string;
  office: string;
  avatar: string;
  bio: string;
}

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'details' | 'security' | 'powerbi';
  userProfile: UserProfileData;
  onSaveProfile: (updated: UserProfileData) => void;
  onOpenPowerBI?: () => void;
  showToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  initialTab = 'details',
  userProfile,
  onSaveProfile,
  onOpenPowerBI,
  showToast,
}: ProfileSettingsModalProps) {
  useBodyScrollLock(isOpen);

  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'powerbi'>(initialTab);

  // Profile Details Form State
  const [formData, setFormData] = useState<UserProfileData>({ ...userProfile });

  // File input ref for custom avatar image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Sync state if initialTab changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setFormData({ ...userProfile });
    }
  }, [isOpen, initialTab, userProfile]);

  // Handle custom photo upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast?.('error', 'Invalid File Format', 'Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast?.('error', 'File Too Large', 'Maximum photo size allowed is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setFormData((prev) => ({ ...prev, avatar: base64 }));
        showToast?.('success', 'Custom Photo Uploaded', 'Avatar preview updated. Click "Save Profile Details" to save.');
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected if edited
    e.target.value = '';
  };

  const handleResetAvatar = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&q=80',
    }));
    showToast?.('info', 'Avatar Reset', 'Restored default clinical administrator photo.');
  };

  // Dynamic Password Strength Meter
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Not entered', color: 'bg-slate-200', text: 'text-slate-400' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
      case 3:
        return { score: 75, label: 'Strong', color: 'bg-blue-500', text: 'text-blue-500' };
      case 4:
        return { score: 100, label: 'Enterprise HIPAA Compliant', color: 'bg-emerald-500', text: 'text-emerald-600' };
      default:
        return { score: 0, label: 'Too short', color: 'bg-slate-200', text: 'text-slate-400' };
    }
  };

  const pwdStrength = getPasswordStrength(newPassword);

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    showToast?.('success', 'Profile Updated Successfully', 'Clinical identity and credentials saved to central server.');
    onClose();
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast?.('error', 'Current Password Required', 'Please input your existing administrator password.');
      return;
    }
    if (newPassword.length < 8) {
      showToast?.('error', 'Password Too Weak', 'New password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast?.('error', 'Passwords Do Not Match', 'Please ensure the new password and confirmation match.');
      return;
    }

    // Success simulation
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast?.(
      'success',
      'Administrator Password Changed',
      'Security credentials re-encrypted and rotated via TLS 1.3.'
    );
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
            {/* Dim Backdrop with Smooth Fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] z-10 my-auto"
            >
              {/* Header Bar - Responsive, cleanly separated close button */}
              <div className="relative p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-primary text-white shrink-0 border-b border-white/10">
                <div className="flex items-center justify-between gap-3 pr-12 sm:pr-14">
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={formData.avatar}
                        alt={formData.name}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover ring-2 ring-white/30 shadow-md"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h3 className="text-base sm:text-lg font-bold tracking-tight text-white truncate max-w-[190px] xs:max-w-[260px] sm:max-w-none">
                          {formData.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 whitespace-nowrap">
                          Level 4 Admin
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 truncate">
                        {formData.npi} • {formData.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Close Button - Stays positioned in top corner, never squashed */}
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-3.5 right-3.5 sm:top-4 sm:right-5 p-2 rounded-xl text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-all active:scale-95"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Navigation Pill Bar - Horizontal scrollable without ugly scrollbar */}
              <div className="px-3 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                      activeTab === 'details'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile &amp; Credentials</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                      activeTab === 'security'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Security &amp; Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('powerbi')}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                      activeTab === 'powerbi'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-amber-500" />
                    <span>Power BI Telemetry</span>
                  </button>
                </div>

                <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  HIPAA Cryptography Active
                </span>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 overscroll-contain">
                {/* TAB 1: Profile & Hospital Credentials */}
                {activeTab === 'details' && (
                  <form id="profile-details-form" onSubmit={handleSaveDetails} className="space-y-4 sm:space-y-5">
                    {/* Modern Administrator Avatar & Custom Photo Uploader */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 dark:from-slate-800/60 dark:to-slate-800/30 border border-slate-200/90 dark:border-slate-700/80 shadow-xs">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 sm:gap-4">
                          {/* Clickable Avatar with Camera Overlay */}
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative group cursor-pointer shrink-0"
                            title="Click to choose a photo from your device"
                          >
                            <img
                              src={formData.avatar}
                              alt={formData.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-primary/40 shadow-md group-hover:opacity-90 transition-all"
                            />
                            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Camera className="w-5 h-5 drop-shadow" />
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-primary hover:bg-primary-container text-white flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900 transition-transform active:scale-90"
                              aria-label="Upload photo"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Administrator Avatar</h4>
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                Live Preview
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                              Choose your own photo for clinical badge, HL7 audit trails, and prescriptions.
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                              Supports JPG, PNG, WebP • Maximum size 5MB
                            </p>
                          </div>
                        </div>

                        {/* Custom Photo Upload Action Buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            id="profile-avatar-file-input"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Upload Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleResetAvatar}
                            title="Reset to default badge photo"
                            className="px-3 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl transition-colors shrink-0"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields Grid - Responsive 1 col on mobile, 2 col on tablet+ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                          Full Legal Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                          Clinical Executive Role *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                          National Provider Identifier (NPI)
                        </label>
                        <input
                          type="text"
                          value={formData.npi}
                          onChange={(e) => setFormData({ ...formData, npi: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                          Medical License ID
                        </label>
                        <input
                          type="text"
                          value={formData.license}
                          onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                          Department / Directorate
                        </label>
                        <input
                          type="text"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                          Office / Pavilion Suite
                        </label>
                        <input
                          type="text"
                          value={formData.office}
                          onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                          Direct Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                          Direct Emergency Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                        Administrative &amp; Clinical Biography
                      </label>
                      <textarea
                        rows={2}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                      />
                    </div>
                  </form>
                )}

                {/* TAB 2: Security & Password Management */}
                {activeTab === 'security' && (
                  <form id="profile-security-form" onSubmit={handleUpdatePassword} className="space-y-4 sm:space-y-5">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold block">Hospital Enterprise Security Policy</span>
                        <span className="text-amber-800 dark:text-amber-300">
                          Administrative passwords must be rotated every 90 days in accordance with HIPAA §164.308. Changes apply to all OR and EHR nodes.
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3.5 max-w-xl">
                      {/* Current Password */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                          Current Administrator Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new 8+ char password"
                            className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Live Strength Bar */}
                        {newPassword && (
                          <div className="mt-2 space-y-1">
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${pwdStrength.color} transition-all duration-300`}
                                style={{ width: `${pwdStrength.score}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-bold ${pwdStrength.text}`}>
                              Security Rating: {pwdStrength.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                          Confirm New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 2FA Status Toggle */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">Two-Factor Authentication (2FA)</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            Hardware TOTP Token / Authenticator active for {formData.npi}.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setTwoFactorEnabled(!twoFactorEnabled);
                          showToast?.('info', '2FA Status Modified', twoFactorEnabled ? '2FA disabled (Not recommended)' : '2FA hardware key enforced');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          twoFactorEnabled
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {twoFactorEnabled ? 'Enforced' : 'Disabled'}
                      </button>
                    </div>

                    {/* Active Sessions */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Active Administrative Sessions
                      </span>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/40">
                        <div className="p-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <Laptop className="w-4 h-4 text-primary" />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">Windows 11 PC (Chrome 128)</span>
                              <span className="text-[10px] text-emerald-600 font-semibold">Current Active Session • IP 192.168.1.104</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded-md">
                            Online
                          </span>
                        </div>

                        <div className="p-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <Smartphone className="w-4 h-4 text-slate-400" />
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">iPad Pro 12.9" (OR Rounds Mobile)</span>
                              <span className="text-[10px] text-slate-400 font-medium">Last active 2 hours ago • Hospital Ward WiFi</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => showToast?.('info', 'Session Revoked', 'iPad Pro session terminated remotely.')}
                            className="text-[10px] font-bold text-red-600 hover:underline"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {/* TAB 3: Power BI Executive Telemetry */}
                {activeTab === 'powerbi' && (
                  <div className="space-y-4 sm:space-y-5">
                    {/* Header overview card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">DirectQuery Power BI Telemetry</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Admin Executive Clearances, Clinical Decision Flow, and Real-time Auditing.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenPowerBI?.();
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-sm transition-all active:scale-95"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Full Power BI Suite</span>
                      </button>
                    </div>

                    {/* KPI Metrics Trio */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Executive Authorizations
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl font-black text-slate-900 dark:text-white">142</span>
                          <span className="text-[10px] font-bold text-emerald-600">+18% this mo</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">OR Overrides &amp; Sign-offs</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Audit Security Rating
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">99.8%</span>
                          <span className="text-[10px] font-bold text-emerald-600">Level 4</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Zero Unauthorized Breaches</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          HL7 Synchronized
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl font-black text-primary">3,890</span>
                          <span className="text-[10px] font-bold text-slate-400">Claims / Lab</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Central Azure Synapse Node</span>
                      </div>
                    </div>

                    {/* Graphical Visualizations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Graph 1: Weekly Decision Volume */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Weekly Clinical Decisions Pulse</span>
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Live Trend
                          </span>
                        </div>

                        <div className="h-28 w-full pt-2">
                          <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                            <defs>
                              <linearGradient id="pbiGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#005c65" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#005c65" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            <line x1="0" y1="25" x2="300" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="0" y1="75" x2="300" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                            <path
                              d="M0,80 Q50,45 100,55 T200,30 T300,15 L300,100 L0,100 Z"
                              fill="url(#pbiGrad)"
                            />
                            <path
                              d="M0,80 Q50,45 100,55 T200,30 T300,15"
                              fill="none"
                              stroke="#005c65"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                            <circle cx="100" cy="55" r="4" fill="#ffffff" stroke="#005c65" strokeWidth="2" />
                            <circle cx="200" cy="30" r="4" fill="#ffffff" stroke="#005c65" strokeWidth="2" />
                            <circle cx="300" cy="15" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                          </svg>
                        </div>

                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span>Mon</span>
                          <span>Tue</span>
                          <span>Wed</span>
                          <span>Thu</span>
                          <span>Fri</span>
                          <span className="text-amber-600 font-bold">Today (Peak)</span>
                        </div>
                      </div>

                      {/* Graph 2: Department Distribution Bars */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Clearances by Clinical Department</span>
                          <span className="text-[10px] font-bold text-slate-500">Distribution</span>
                        </div>

                        <div className="space-y-2 pt-1 text-xs">
                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Oral &amp; Maxillofacial Surgery</span>
                              <span className="font-bold text-slate-900 dark:text-white">46%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: '46%' }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Billing Claims &amp; Ledgers</span>
                              <span className="font-bold text-slate-900 dark:text-white">28%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '28%' }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Emergency Front-Desk Triage</span>
                              <span className="font-bold text-slate-900 dark:text-white">18%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: '18%' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Audit trail snippet */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Recent Executive Audit Trail
                      </span>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          <span className="font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Signed off Inpatient Invoice CLM-2026-60117 ($4,850.00)
                          </span>
                          <span className="text-[10px] text-slate-400">12 mins ago</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          <span className="font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Authorized Priority OR-1 Schedule for Dr. Marcus Vance
                          </span>
                          <span className="text-[10px] text-slate-400">45 mins ago</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          <span className="font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Exported Weekly Clinical Capacity Report to PDF &amp; CSV
                          </span>
                          <span className="text-[10px] text-slate-400">2 hours ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer Bar - Guaranteed visible with safe-area bottom padding */}
              <div className="p-3.5 sm:p-4 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 shrink-0">
                {activeTab === 'details' && (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 sm:flex-initial px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="profile-details-form"
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Profile Details</span>
                    </button>
                  </>
                )}

                {activeTab === 'security' && (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 sm:flex-initial px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="profile-security-form"
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all active:scale-95"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Update Password</span>
                    </button>
                  </>
                )}

                {activeTab === 'powerbi' && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    Close Telemetry Window
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </ModalPortal>
      )}
    </AnimatePresence>
  );
}
