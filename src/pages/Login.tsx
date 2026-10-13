import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  UserPlus,
  Building,
  BadgeCheck,
  Key,
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  Cpu,
  Mail,
  FileText,
  User,
  Hash,
  Briefcase,
  Check,
  Headphones,
  Sparkles,
} from 'lucide-react';

interface LoginProps {
  initialMode?: 'signin' | 'signup';
  onNotify?: (title: string, message: string, type: 'critical' | 'financial' | 'triage' | 'system') => void;
}

export const Login: React.FC<LoginProps> = ({ initialMode = 'signin', onNotify }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // If path is /signup, default to signup tab
  const [tab, setTab] = useState<'signin' | 'signup'>(
    location.pathname === '/signup' || initialMode === 'signup' ? 'signup' : 'signin'
  );

  // Sign In fields
  const [department, setDepartment] = useState('administration');
  const [email, setEmail] = useState('dr.sneha.lal@smileclinic.com');
  const [password, setPassword] = useState('CentralAdmin2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaMethod, setMfaMethod] = useState<'duo' | 'fido' | 'sms'>('duo');

  // Sign Up fields
  const [practitionerName, setPractitionerName] = useState('');
  const [npiLicense, setNpiLicense] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState('Attending Physician');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [hipaaConsent, setHipaaConsent] = useState(false);

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const passwordStrength = getPasswordStrength(signupPassword);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    onNotify?.(
      'Authentication Successful',
      `Welcome Dr. Sneha Lal, MD (Chief Clinical Admin). HIPAA TLS session initialized.`,
      'system'
    );
    navigate('/dashboard');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hipaaConsent) {
      alert('Please check the HIPAA Privacy & Security declaration checkbox.');
      return;
    }
    onNotify?.(
      'Staff Credential Registered',
      `Practitioner account for ${practitionerName || 'Dr. Clinical Specialist'} created. Welcome to Smile Clinic Admin.`,
      'system'
    );
    navigate('/dashboard');
  };

  return (
    <div className="bg-[#f7fafc] font-sans text-slate-800 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT HERO: Dynamic Content Altering on Tab Change */}
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

            {/* Upper Branding & Dynamic Content */}
            <div className="relative z-10 flex flex-col space-y-6">
              {/* Header Logo */}
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

              {/* Dynamic Animated Text & Metrics */}
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

                    <p className="text-sm text-teal-100/90 leading-relaxed">
                      Empowering inpatient care teams, verified physicians, and administrative specialists with zero-latency EHR synchronization and multi-factor biometric assurance.
                    </p>

                    {/* Metrics Bento */}
                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex flex-col justify-between border border-white/10">
                        <span className="text-[11px] uppercase tracking-wider text-teal-200 font-semibold">
                          System Uptime
                        </span>
                        <div className="flex items-baseline space-x-1 mt-1">
                          <span className="text-2xl font-bold">99.98%</span>
                          <span className="text-xs text-teal-300">SLAs</span>
                        </div>
                        <div className="w-full bg-white/20 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-teal-300 h-full rounded-full w-[99.98%]" />
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex flex-col justify-between border border-white/10">
                        <span className="text-[11px] uppercase tracking-wider text-teal-200 font-semibold">
                          Active Patient Records
                        </span>
                        <div className="flex items-baseline space-x-1 mt-1">
                          <span className="text-2xl font-bold">14.8k+</span>
                          <span className="text-xs text-teal-300">Live</span>
                        </div>
                        <div className="w-full bg-white/20 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-blue-300 h-full rounded-full w-[84%]" />
                        </div>
                      </div>
                    </div>
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
                      <BadgeCheck className="w-3.5 h-3.5" />
                      <span>Certified Medical Practitioner Onboarding</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
                      Institutional Credentialing &amp; Clinical Onboarding.
                    </h1>

                    <p className="text-sm text-teal-100/90 leading-relaxed">
                      Join Smile Clinic&apos;s certified medical practitioner network. Direct integration with national NPI registries, HIPAA compliance clearinghouses, and encrypted audit trails.
                    </p>

                    {/* Signup Metrics Bento */}
                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex flex-col justify-between border border-white/10">
                        <span className="text-[11px] uppercase tracking-wider text-teal-200 font-semibold">
                          Surgical Theatres
                        </span>
                        <div className="flex items-baseline space-x-1 mt-1">
                          <span className="text-2xl font-bold">18 Suites</span>
                          <span className="text-xs text-teal-300">OR Fleet</span>
                        </div>
                        <div className="w-full bg-white/20 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-teal-300 h-full rounded-full w-[92%]" />
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex flex-col justify-between border border-white/10">
                        <span className="text-[11px] uppercase tracking-wider text-teal-200 font-semibold">
                          Staff Practitioners
                        </span>
                        <div className="flex items-baseline space-x-1 mt-1">
                          <span className="text-2xl font-bold">120+ MDs</span>
                          <span className="text-xs text-teal-300">Active</span>
                        </div>
                        <div className="w-full bg-white/20 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-blue-300 h-full rounded-full w-[88%]" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Lower Compliance Showcase (Altered per tab) */}
            <div className="relative z-10 pt-8 mt-6 border-t border-white/10">
              <div className="flex items-center space-x-2 text-teal-200 text-xs font-semibold pb-3 uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>
                  {tab === 'signin' ? 'Accredited Clinical Architecture' : 'Institutional Certifications'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/10 backdrop-blur-md rounded-lg py-2 px-3 text-center border border-white/10">
                  <span className="text-xs font-bold block">{tab === 'signin' ? 'HL7 FHIR' : 'AMA/ADA'}</span>
                  <span className="text-[10px] text-teal-200 uppercase">{tab === 'signin' ? 'R4 API Core' : 'Board Approved'}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg py-2 px-3 text-center border border-white/10">
                  <span className="text-xs font-bold block">HIPAA</span>
                  <span className="text-[10px] text-teal-200 uppercase">Audit Ready</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg py-2 px-3 text-center border border-white/10">
                  <span className="text-xs font-bold block">{tab === 'signin' ? 'JCAHO' : 'SOC-2'}</span>
                  <span className="text-[10px] text-teal-200 uppercase">{tab === 'signin' ? 'Standardized' : 'Type II'}</span>
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
                    onClick={() => setTab('signin')}
                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
                      tab === 'signin'
                        ? 'bg-[#005c65] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sign In to Portal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('signup')}
                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
                      tab === 'signup'
                        ? 'bg-[#005c65] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
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

              {/* TAB 1: SIGN IN PANEL */}
              {tab === 'signin' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Staff Verification &amp; Access</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Please authenticate with your credentialed medical institutional license.
                    </p>
                  </div>

                  {/* SSO Quick Option */}
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-slate-800 font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>Login via Hospital ActiveDirectory / Okta SSO</span>
                  </button>

                  <div className="flex items-center space-x-3 my-2">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      or direct sign in
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-4">
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
                        Hospital Staff ID or License Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="dr.sneha.lal@smileclinic.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                        />
                      </div>
                    </div>

                    {/* Master Passcode */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold uppercase text-slate-600">
                          Master Security Key / Password
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-xs font-semibold text-[#005c65] hover:underline"
                        >
                          Forgot Credentials?
                        </Link>
                      </div>
                      <div className="relative">
                        <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
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
                        className="w-full py-3 px-6 bg-[#005c65] hover:bg-[#007782] transition-colors text-white font-semibold text-sm rounded-lg shadow-md shadow-[#005c65]/20 flex items-center justify-center space-x-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Authorize &amp; Sign In</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onNotify?.(
                            'Institutional Demo Active',
                            'Welcome Dr. Sneha Lal, MD (Chief Clinical Admin). Entering dashboard...',
                            'system'
                          );
                          navigate('/dashboard');
                        }}
                        className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 font-semibold text-xs rounded-lg flex items-center justify-center space-x-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Quick Demo Access &rarr; Open Dashboard Directly</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 2: SIGN UP PANEL */}
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
                      New staff enrollments require verification by the Department Credentialing Officer.
                    </p>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-3.5">
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
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Password setup with strength indicator */}
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                        Set Institutional Passcode *
                      </label>
                      <div className="relative">
                        <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 12 characters, numbers &amp; symbols"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* 4-bar strength indicator */}
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="grid grid-cols-4 gap-1.5 flex-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              passwordStrength >= 1 ? 'bg-red-500' : 'bg-slate-200'
                            }`}
                          />
                          <div
                            className={`h-1.5 rounded-full ${
                              passwordStrength >= 2 ? 'bg-amber-500' : 'bg-slate-200'
                            }`}
                          />
                          <div
                            className={`h-1.5 rounded-full ${
                              passwordStrength >= 3 ? 'bg-teal-500' : 'bg-slate-200'
                            }`}
                          />
                          <div
                            className={`h-1.5 rounded-full ${
                              passwordStrength >= 4 ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {passwordStrength >= 3 ? 'Strong' : 'Min 12 chars'}
                        </span>
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
                          <strong className="text-slate-900">HIPAA Privacy &amp; Security Regulations</strong> and consent to active telemetry audit logging for electronic health records access.
                        </span>
                      </label>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 px-6 bg-[#005c65] hover:bg-[#007782] transition-colors text-white font-semibold text-sm rounded-lg shadow-md shadow-[#005c65]/20 flex items-center justify-center space-x-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Submit Credential for Approval</span>
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
    </div>
  );
};
