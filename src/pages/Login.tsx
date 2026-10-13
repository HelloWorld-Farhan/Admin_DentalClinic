import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  UserPlus,
  Building,
  Key,
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  Cpu,
  Mail,
  User,
  Hash,
  Briefcase,
  Check,
  Headphones,
  Sparkles,
  Phone,
  AlertCircle,
  RefreshCw,
  X,
  CheckCircle2,
} from 'lucide-react';

interface LoginProps {
  initialMode?: 'signin' | 'signup';
  onNotify?: (title: string, message: string, type: 'critical' | 'financial' | 'triage' | 'system') => void;
  onLoginSuccess?: () => void;
}

// Official Admin Credentials
export const OFFICIAL_ADMIN_CREDENTIALS = {
  email: 'admin@smileclinic.com',
  password: 'Admin@Smile2026#',
  role: 'Chief Clinical Administrator (Demo)',
  name: 'Dr. Sneha Lal, MD (Demo Admin)',
};

export const Login: React.FC<LoginProps> = ({ initialMode = 'signin', onNotify, onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: Sign In or Sign Up
  const [tab, setTab] = useState<'signin' | 'signup'>(
    location.pathname === '/signup' || initialMode === 'signup' ? 'signup' : 'signin'
  );

  // Sign In fields
  const [department, setDepartment] = useState('administration');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaMethod, setMfaMethod] = useState<'duo' | 'fido' | 'sms'>('duo');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign Up fields
  const [practitionerName, setPractitionerName] = useState('');
  const [npiLicense, setNpiLicense] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupRole, setSignupRole] = useState('Attending Physician');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hipaaConsent, setHipaaConsent] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Dual OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mockEmailOtp, setMockEmailOtp] = useState('482910');
  const [mockMobileOtp, setMockMobileOtp] = useState('739154');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(45);

  // Password criteria evaluation
  const isMin8Chars = signupPassword.length >= 8;
  const isRecommended12 = signupPassword.length >= 12;
  const hasCapital = /[A-Z]/.test(signupPassword);
  const numberCount = (signupPassword.match(/\d/g) || []).length;
  const hasMin2Numbers = numberCount >= 2;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(signupPassword);
  const passwordsMatch = signupPassword.length > 0 && signupPassword === confirmPassword;

  const isPasswordValid = isMin8Chars && hasCapital && hasMin2Numbers && hasSpecialChar;


  // Sign In Handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const inputEmail = email.trim().toLowerCase();
    const inputPass = password;

    // Check against official admin credentials
    const isOfficialMatch =
      inputEmail === OFFICIAL_ADMIN_CREDENTIALS.email.toLowerCase() &&
      inputPass === OFFICIAL_ADMIN_CREDENTIALS.password;

    // Also check against registered accounts in localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('smileclinic_registered_admins') || '[]');
    const registeredUser = registeredUsers.find(
      (u: any) => u.email.toLowerCase() === inputEmail && u.password === inputPass
    );

    if (isOfficialMatch || registeredUser) {
      const activeName = isOfficialMatch ? OFFICIAL_ADMIN_CREDENTIALS.name : registeredUser.name;
      const activeEmail = isOfficialMatch ? OFFICIAL_ADMIN_CREDENTIALS.email : registeredUser.email;

      sessionStorage.setItem('admin_auth', 'true');
      sessionStorage.setItem('admin_email', activeEmail);
      sessionStorage.setItem('admin_name', activeName);

      onLoginSuccess?.();
      onNotify?.(
        'Authentication Successful',
        `Welcome ${activeName}. Verified secure HIPAA TLS session initialized.`,
        'system'
      );
      navigate('/dashboard');
    } else {
      setLoginError(
        'Invalid credentials. Please enter your authorized administrator email and password.'
      );
    }
  };

  // Trigger Sign Up OTP Step
  const handleInitiateSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!isPasswordValid) {
      setSignupError(
        'Password does not meet all security criteria (minimum 8-12 characters, 1 capital letter, 2 numbers, and 1 special symbol).'
      );
      return;
    }

    if (!passwordsMatch) {
      setSignupError('Passwords do not match. Please verify your confirm password.');
      return;
    }

    const cleanPhone = signupPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setSignupError('Please provide a valid 10-digit mobile phone number for OTP verification.');
      return;
    }

    if (!hipaaConsent) {
      setSignupError('Please acknowledge adherence to federal HIPAA Privacy & Security regulations.');
      return;
    }

    // Generate fresh 6-digit mock codes
    const newEmailCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newMobileCode = Math.floor(100000 + Math.random() * 900000).toString();
    setMockEmailOtp(newEmailCode);
    setMockMobileOtp(newMobileCode);
    setEmailOtp('');
    setMobileOtp('');
    setOtpError(null);
    setShowOtpModal(true);
    setResendCountdown(60);
  };

  // Auto-fill demo OTPs
  const handleAutoFillOtp = () => {
    setEmailOtp(mockEmailOtp);
    setMobileOtp(mockMobileOtp);
    setOtpError(null);
  };

  // Confirm OTP and complete registration
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (emailOtp.trim() !== mockEmailOtp) {
      setOtpError('Invalid Email OTP code. Please recheck your code or click Auto-fill.');
      return;
    }

    if (mobileOtp.trim() !== mockMobileOtp) {
      setOtpError('Invalid Mobile OTP code. Please recheck your SMS code or click Auto-fill.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      // Save new account into localStorage
      const existing = JSON.parse(localStorage.getItem('smileclinic_registered_admins') || '[]');
      const newUser = {
        name: practitionerName || 'Dr. Medical Specialist',
        license: npiLicense,
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        role: signupRole,
        password: signupPassword,
        verifiedAt: new Date().toISOString(),
      };
      existing.push(newUser);
      localStorage.setItem('smileclinic_registered_admins', JSON.stringify(existing));

      sessionStorage.setItem('admin_auth', 'true');
      sessionStorage.setItem('admin_email', newUser.email);
      sessionStorage.setItem('admin_name', newUser.name);

      setIsVerifying(false);
      setShowOtpModal(false);

      onLoginSuccess?.();
      onNotify?.(
        'Staff Credential Registered',
        `Account verified for ${newUser.name}. Welcome to Smile Clinic Administration.`,
        'system'
      );
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="bg-[#f7fafc] font-sans text-slate-800 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT HERO PANEL */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#005c65] text-white rounded-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-2xl">
            {/* Ambient glows */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#1560a4] opacity-35 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[#007877] opacity-45 blur-3xl pointer-events-none" />

            {/* Subtle Cross Watermark */}
            <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
              <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 100 100">
                <path d="M45,20 H55 V45 H80 V55 H55 V80 H45 V55 H20 V45 H45 Z" />
              </svg>
            </div>

            {/* Upper Branding */}
            <div className="relative z-10 flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-white text-[#005c65] flex items-center justify-center shadow-lg font-bold">
                    <span className="material-symbols-outlined text-2xl">dentistry</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold tracking-tight block">Smile Clinic</span>
                    <span className="text-xs uppercase tracking-wider text-teal-200 block font-medium">
                      Admin Portal System
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
                  <span>Node US-East-1</span>
                </div>
              </div>

              {/* Dynamic Left Copy */}
              <AnimatePresence mode="wait">
                {tab === 'signin' ? (
                  <motion.div
                    key="signin-left"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 pt-2"
                  >
                    <div className="inline-flex items-center space-x-2 bg-blue-500/30 text-teal-100 px-3 py-1 rounded-full text-xs font-medium">
                      <Shield className="w-3.5 h-3.5" />
                      <span>256-Bit HIPAA Compliant Cloud EHR Infrastructure</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
                      Unified Clinical Operating Environment.
                    </h1>

                    <p className="text-teal-100/90 text-sm leading-relaxed">
                      Empowering inpatient care teams, verified physicians, and administrative specialists with
                      zero-latency EHR synchronization and multi-factor biometric assurance.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup-left"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 pt-2"
                  >
                    <div className="inline-flex items-center space-x-2 bg-emerald-500/30 text-teal-100 px-3 py-1 rounded-full text-xs font-medium">
                      <Check className="w-3.5 h-3.5" />
                      <span>Certified Medical Practitioner Onboarding</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
                      Institutional Credentialing &amp; Clinical Onboarding.
                    </h1>

                    <p className="text-teal-100/90 text-sm leading-relaxed">
                      Join Smile Clinic&apos;s certified medical practitioner network. Direct integration with national
                      NPI registries, HIPAA clearinghouses, and encrypted audit trails.
                    </p>

                    <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs space-y-2">
                      <div className="font-semibold text-teal-200 uppercase tracking-wider text-[11px]">
                        Dual-Channel Verification
                      </div>
                      <p className="text-teal-100/80 text-[11px]">
                        Enrollment requires simultaneous 6-digit verification sent to your official institutional email
                        and registered clinical mobile number.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Certifications Badge */}
            <div className="relative z-10 pt-6 border-t border-white/15">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/10 backdrop-blur-md rounded-lg py-2 px-3 text-center border border-white/10">
                  <span className="text-xs font-bold block">{tab === 'signin' ? 'HL7 FHIR' : 'AMA/ADA'}</span>
                  <span className="text-[10px] text-teal-200 uppercase">
                    {tab === 'signin' ? 'R4 API Core' : 'Board Approved'}
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg py-2 px-3 text-center border border-white/10">
                  <span className="text-xs font-bold block">HIPAA</span>
                  <span className="text-[10px] text-teal-200 uppercase">Audit Ready</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg py-2 px-3 text-center border border-white/10">
                  <span className="text-xs font-bold block">{tab === 'signin' ? 'JCAHO' : 'SOC-2'}</span>
                  <span className="text-[10px] text-teal-200 uppercase">
                    {tab === 'signin' ? 'Standardized' : 'Type II'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Tabbed Authentication Form Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
            <div>
              {/* Segmented Tab Controls */}
              <div className="flex items-center justify-between pb-6">
                <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signin');
                      setLoginError(null);
                    }}
                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
                      tab === 'signin' ? 'bg-[#005c65] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sign In to Portal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signup');
                      setSignupError(null);
                    }}
                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
                      tab === 'signup' ? 'bg-[#005c65] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Staff Account</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center space-x-1.5 text-slate-400 text-xs">
                  <Shield className="w-3.5 h-3.5 text-[#005c65]" />
                  <span>Encrypted TLS 1.3</span>
                </div>
              </div>

              {/* ===================== TAB 1: SIGN IN PANEL ===================== */}
              {tab === 'signin' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Staff Verification &amp; Access</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Please authenticate with your credentialed medical institutional license.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSignIn} className="space-y-3.5">
                    {/* Department Select */}
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                        Clinical Department
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                        >
                          <option value="administration">Hospital Administration &amp; Operations</option>
                          <option value="physician">Doctor / Inpatient Physician (MD / DO)</option>
                          <option value="nursing">Critical Care &amp; Nursing Station</option>
                          <option value="laboratory">Diagnostic Pathology &amp; Laboratory</option>
                          <option value="reception">Triage &amp; Patient Reception Desk</option>
                          <option value="billing">Clinical Billing, Pharmacy &amp; Claims</option>
                        </select>
                      </div>
                    </div>

                    {/* Hospital Email/ID */}
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                        Hospital Staff ID or License Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setLoginError(null);
                          }}
                          placeholder="name@smileclinic.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                        />
                      </div>
                    </div>

                    {/* Master Passcode with Eye Icon */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold uppercase text-slate-600">
                          Master Security Key / Password *
                        </label>
                        <Link to="/forgot-password" className="text-xs font-semibold text-[#005c65] hover:underline">
                          Forgot Credentials?
                        </Link>
                      </div>
                      <div className="relative">
                        <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setLoginError(null);
                          }}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* MFA Selector */}
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                        Multi-Factor Authentication (MFA)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <label className="cursor-pointer">
                          <input
                            type="radio"
                            name="mfa"
                            value="duo"
                            checked={mfaMethod === 'duo'}
                            onChange={() => setMfaMethod('duo')}
                            className="sr-only"
                          />
                          <div
                            className={`p-2 rounded-lg text-center flex flex-col items-center transition-all border ${
                              mfaMethod === 'duo'
                                ? 'bg-teal-50 border-[#005c65] text-[#005c65] font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <Smartphone className="w-4 h-4 mb-1" />
                            <span className="text-[11px]">Duo Push</span>
                          </div>
                        </label>

                        <label className="cursor-pointer">
                          <input
                            type="radio"
                            name="mfa"
                            value="fido"
                            checked={mfaMethod === 'fido'}
                            onChange={() => setMfaMethod('fido')}
                            className="sr-only"
                          />
                          <div
                            className={`p-2 rounded-lg text-center flex flex-col items-center transition-all border ${
                              mfaMethod === 'fido'
                                ? 'bg-teal-50 border-[#005c65] text-[#005c65] font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <Cpu className="w-4 h-4 mb-1" />
                            <span className="text-[11px]">FIDO2 Key</span>
                          </div>
                        </label>

                        <label className="cursor-pointer">
                          <input
                            type="radio"
                            name="mfa"
                            value="sms"
                            checked={mfaMethod === 'sms'}
                            onChange={() => setMfaMethod('sms')}
                            className="sr-only"
                          />
                          <div
                            className={`p-2 rounded-lg text-center flex flex-col items-center transition-all border ${
                              mfaMethod === 'sms'
                                ? 'bg-teal-50 border-[#005c65] text-[#005c65] font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <Mail className="w-4 h-4 mb-1" />
                            <span className="text-[11px]">SMS OTP</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <button
                        type="submit"
                        className="w-full py-3 px-6 bg-[#005c65] hover:bg-[#007782] transition-colors text-white font-semibold text-sm rounded-lg shadow-md shadow-[#005c65]/20 flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Authorize &amp; Sign In</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ===================== TAB 2: SIGN UP PANEL ===================== */}
              {tab === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Register Clinical Practitioner</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter details. Dual Email and Mobile OTP verification will activate your credentials.
                    </p>
                  </div>

                  {signupError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  <form onSubmit={handleInitiateSignUp} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                          Full Practitioner Name *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="text"
                            required
                            placeholder="Dr. Elena Vance, MD"
                            value={practitionerName}
                            onChange={(e) => setPractitionerName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                          NPI or License # *
                        </label>
                        <div className="relative">
                          <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="text"
                            required
                            placeholder="NPI-104928502"
                            value={npiLicense}
                            onChange={(e) => setNpiLicense(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                          Institutional Email *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="email"
                            required
                            placeholder="e.vance@smileclinic.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                          Mobile Phone (For SMS OTP) *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="tel"
                            required
                            placeholder="+1 (555) 782-9901"
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                        Department Role
                      </label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <select
                          value={signupRole}
                          onChange={(e) => setSignupRole(e.target.value)}
                          className="w-full pl-9 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                        >
                          <option>Attending Physician</option>
                          <option>Surgical Resident</option>
                          <option>Charge Nurse</option>
                          <option>Pathology Specialist</option>
                          <option>Clinical Data Auditor</option>
                          <option>Hospital Administration</option>
                        </select>
                      </div>
                    </div>

                    {/* Passwords with Eye Icons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                          Passcode (Min 8-12 chars) *
                        </label>
                        <div className="relative">
                          <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type={showSignupPassword ? 'text' : 'password'}
                            required
                            placeholder="e.g. VanceAdmin2026#"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title={showSignupPassword ? 'Hide password' : 'Show password'}
                          >
                            {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                          Confirm Passcode *
                        </label>
                        <div className="relative">
                          <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            placeholder="Re-enter passcode"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Strict Password Checklist */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
                      <span className="font-semibold text-slate-700 block uppercase tracking-wider text-[10px]">
                        Security Complexity Criteria:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <div
                          className={`flex items-center space-x-1.5 ${
                            isMin8Chars ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                          }`}
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${isMin8Chars ? 'text-emerald-600' : 'text-slate-300'}`}
                          />
                          <span>8–12+ Characters ({signupPassword.length}/12)</span>
                        </div>
                        <div
                          className={`flex items-center space-x-1.5 ${
                            hasCapital ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                          }`}
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${hasCapital ? 'text-emerald-600' : 'text-slate-300'}`}
                          />
                          <span>1+ Uppercase Letter (A-Z)</span>
                        </div>
                        <div
                          className={`flex items-center space-x-1.5 ${
                            hasMin2Numbers ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                          }`}
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${hasMin2Numbers ? 'text-emerald-600' : 'text-slate-300'}`}
                          />
                          <span>2+ Numbers (Found {numberCount})</span>
                        </div>
                        <div
                          className={`flex items-center space-x-1.5 ${
                            hasSpecialChar ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                          }`}
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${hasSpecialChar ? 'text-emerald-600' : 'text-slate-300'}`}
                          />
                          <span>1+ Special Symbol (!@#$%...)</span>
                        </div>
                        <div
                          className={`flex items-center space-x-1.5 sm:col-span-2 ${
                            passwordsMatch ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                          }`}
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-emerald-600' : 'text-slate-300'}`}
                          />
                          <span>
                            {passwordsMatch
                              ? 'Passcodes Match Exactly'
                              : confirmPassword.length > 0
                              ? 'Passcodes Do Not Match'
                              : 'Confirm Passcode Required'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* HIPAA Consent */}
                    <div className="pt-1">
                      <label className="flex items-start space-x-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hipaaConsent}
                          onChange={(e) => setHipaaConsent(e.target.checked)}
                          className="mt-0.5 rounded text-[#005c65] focus:ring-0"
                          required
                        />
                        <span className="text-xs text-slate-600 leading-tight">
                          I acknowledge adherence to the federal{' '}
                          <strong className="text-slate-900">HIPAA Privacy &amp; Security Regulations</strong> and consent
                          to dual OTP email and mobile verification for clinical credentials.
                        </span>
                      </label>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 px-6 bg-[#005c65] hover:bg-[#007782] transition-colors text-white font-semibold text-sm rounded-lg shadow-md shadow-[#005c65]/20 flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Verify &amp; Create Account (Email &amp; Mobile OTP)</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </div>

            {/* Bottom Help Desk strip */}
            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <Headphones className="w-4 h-4 text-blue-600" />
                <span>
                  Emergency IT Dispatch:{' '}
                  <a href="tel:18005553472" className="font-semibold text-slate-900 hover:underline">
                    ext. 4402 (24/7 Priority)
                  </a>
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono text-[11px]">
                  v4.12.0-STABLE
                </span>
                <span>Build #8921-EHR</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== DUAL OTP VERIFICATION MODAL ===================== */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#005c65] flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Institutional Identity Verification</h3>
                    <p className="text-xs text-slate-500">Dual Email &amp; Mobile SMS authentication required</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Demo Notification Banner with One-Click Autofill */}
              <div className="my-4 p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-900">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Simulated Dispatch (Demo Server)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="text-xs font-bold text-blue-700 bg-white hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-300 transition-colors cursor-pointer"
                  >
                    Auto-Fill Both Codes
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white p-2 rounded-lg border border-blue-200">
                    <span className="text-[10px] uppercase block text-slate-500 font-sans font-semibold">
                      Email Code ({signupEmail.slice(0, 15)}...)
                    </span>
                    <span className="text-sm font-bold text-slate-900">{mockEmailOtp}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-200">
                    <span className="text-[10px] uppercase block text-slate-500 font-sans font-semibold">
                      Mobile SMS ({signupPhone.slice(-4)})
                    </span>
                    <span className="text-sm font-bold text-slate-900">{mockMobileOtp}</span>
                  </div>
                </div>
              </div>

              {otpError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* 1. Email OTP Field */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    1. Email 6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 482910"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    />
                  </div>
                </div>

                {/* 2. Mobile OTP Field */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    2. Mobile SMS 6-Digit Passcode
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={mobileOtp}
                      onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 739154"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const newEmailCode = Math.floor(100000 + Math.random() * 900000).toString();
                      const newMobileCode = Math.floor(100000 + Math.random() * 900000).toString();
                      setMockEmailOtp(newEmailCode);
                      setMockMobileOtp(newMobileCode);
                      setResendCountdown(60);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend Codes ({resendCountdown}s)</span>
                  </button>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowOtpModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="px-5 py-2 text-xs font-bold text-white bg-[#005c65] hover:bg-[#007782] rounded-lg shadow-md shadow-[#005c65]/20 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Verify &amp; Activate Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
