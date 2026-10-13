import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  RotateCw,
  Lock,
  Headphones,
  Sparkles,
} from 'lucide-react';

interface ForgotPasswordProps {
  onNotify?: (title: string, message: string, type: 'critical' | 'financial' | 'triage' | 'system') => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNotify }) => {
  const navigate = useNavigate();

  // Steps: 1 (Email & Consent), 2 (6-digit OTP), 3 (Two-time password input)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('dr.sneha.lal@smileclinic.com');
  const [authorizedConsent, setAuthorizedConsent] = useState(true);

  // OTP State
  const [otp, setOtp] = useState(['4', '8', '2', '9', '1', '0']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Password Reset State (Two-times window)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Countdown timer for Step 2
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Handle OTP digit change with forward focus
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError('');

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);
    setOtpError('');
    if (pasted.length === 6) {
      otpInputsRef.current[5]?.focus();
    }
  };

  // Step 1: Submit email
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorizedConsent) {
      alert('Please confirm authorization checkbox under HIPAA policy.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setResendTimer(45);
      setCanResend(false);
      onNotify?.(
        'Verification OTP Dispatched',
        `6-digit cryptographic security code sent to institutional email: ${email}`,
        'system'
      );
    }, 400);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setOtpError('Please input all 6 digits of the institutional OTP.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      onNotify?.(
        'Identity Verified',
        'Multi-factor validation accepted. Please set your new master passcode.',
        'system'
      );
    }, 450);
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (!canResend) return;
    setResendTimer(45);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    otpInputsRef.current[0]?.focus();
    onNotify?.('New OTP Generated', 'Fresh 6-digit passcode sent to your device.', 'system');
  };

  // Step 3: Password reset
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('The two passwords do not match. Please verify both inputs.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetSuccess(true);
      onNotify?.(
        'Master Passcode Reset Successfully',
        'Your institutional credential has been updated. Redirecting to sign in...',
        'system'
      );
      setTimeout(() => navigate('/login'), 1800);
    }, 500);
  };

  // Password strength
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);

  return (
    <div className="bg-[#f7fafc] font-sans text-slate-800 min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between pb-6">
        <Link to="/login" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#005c65]/10 border border-[#005c65]/20 text-[#005c65] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[26px]">dentistry</span>
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 block leading-tight">Smile Clinic</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Admin Credential Recovery
            </span>
          </div>
        </Link>

        <Link
          to="/login"
          className="text-xs font-semibold text-[#005c65] hover:text-[#007782] flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-xl mx-auto flex-1 flex items-center justify-center py-4">
        <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
          {/* Multi-Step Stepper Header */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 -z-0" />

            {/* Step 1 Circle */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step >= 1
                    ? 'bg-[#005c65] text-white shadow-md shadow-[#005c65]/20'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-[11px] font-semibold text-slate-600 mt-1">Staff Email</span>
            </div>

            {/* Step 2 Circle */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step >= 2
                    ? 'bg-[#005c65] text-white shadow-md shadow-[#005c65]/20'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-[11px] font-semibold text-slate-600 mt-1">6-Digit OTP</span>
            </div>

            {/* Step 3 Circle */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step === 3
                    ? 'bg-[#005c65] text-white shadow-md shadow-[#005c65]/20'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {resetSuccess ? <CheckCircle2 className="w-4 h-4" /> : '3'}
              </div>
              <span className="text-[11px] font-semibold text-slate-600 mt-1">New Passcode</span>
            </div>
          </div>

          {/* STEP 1: Email + Checkbox Consent */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#005c65] flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Forgot Master Credentials?</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Enter your verified hospital license email. We will route a 6-digit single-use OTP key through our InfoSec service.
                </p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Institutional Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="dr.sneha.lal@smileclinic.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    />
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={authorizedConsent}
                      onChange={(e) => setAuthorizedConsent(e.target.checked)}
                      className="mt-0.5 rounded text-[#005c65] focus:ring-0"
                      required
                    />
                    <span className="text-xs text-slate-600 leading-tight">
                      I confirm I am an authorized clinical practitioner requesting an electronic master key reset under the{' '}
                      <strong className="text-slate-900">Hospital Security &amp; HIPAA Telemetry Protocol</strong>.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-[#005c65] hover:bg-[#007782] text-white font-semibold text-sm rounded-lg shadow-md shadow-[#005c65]/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Transmit 6-Digit OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: 6-Digit OTP with Box Animations */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#005c65] flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Enter 6-Digit Security Code</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  A verification token was transmitted to <strong className="text-slate-800">{email}</strong>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* 6 Animated Digits */}
                <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      <input
                        ref={(el) => { otpInputsRef.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`w-11 h-13 sm:w-13 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border transition-all focus:outline-none focus:scale-105 ${
                          digit
                            ? 'bg-teal-50/50 border-[#005c65] text-[#005c65]'
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#005c65]'
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>

                {otpError && (
                  <p className="text-xs font-semibold text-red-600 text-center">{otpError}</p>
                )}

                {/* Auto-fill demo button */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setOtp(['4', '8', '2', '9', '1', '0']);
                      setOtpError('');
                    }}
                    className="text-xs text-[#005c65] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Auto-fill Sample Code (482910)
                  </button>
                </div>

                {/* Countdown Timer & Resend */}
                <div className="text-center text-xs text-slate-500">
                  {resendTimer > 0 ? (
                    <span>
                      Resend token in <strong className="text-slate-800 font-mono">{resendTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-bold text-[#005c65] hover:underline flex items-center gap-1 mx-auto"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Resend Security Code
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-3 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 px-6 bg-[#005c65] hover:bg-[#007782] text-white font-semibold text-sm rounded-lg shadow-md shadow-[#005c65]/20 flex items-center justify-center space-x-2 transition-all"
                  >
                    {isLoading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Validate Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: Two-Time Password Window + Strength Real-time Check */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              {resetSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Passcode Updated Successfully!</h2>
                  <p className="text-xs text-slate-500">
                    Your master institutional encryption key has been restored. Telemetry audit logged to HIPAA registry.
                  </p>
                  <span className="text-xs font-semibold text-[#005c65] block animate-pulse">
                    Redirecting to secure login...
                  </span>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#005c65] flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Set New Master Passcode</h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Please enter and re-confirm your institutional security password (two times window verification).
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {/* Window 1: New Password */}
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                        1. New Master Passcode *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 8 characters, numbers &amp; symbols"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
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

                    {/* Window 2: Confirm Password */}
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                        2. Re-Confirm Master Passcode *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type matching passcode"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Security Requirements Checklist */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                            hasMinLength ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'
                          }`}
                        >
                          ✓
                        </div>
                        <span className={hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                          At least 8 characters
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                            hasUppercase ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'
                          }`}
                        >
                          ✓
                        </div>
                        <span className={hasUppercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                          Contains uppercase letter (A-Z)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                            hasNumber && hasSymbol ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'
                          }`}
                        >
                          ✓
                        </div>
                        <span className={hasNumber && hasSymbol ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                          Includes numerals (0-9) &amp; special symbol
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-6 bg-[#005c65] hover:bg-[#007782] text-white font-semibold text-sm rounded-lg shadow-md shadow-[#005c65]/20 flex items-center justify-center space-x-2 transition-all"
                    >
                      {isLoading ? (
                        <RotateCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Finalize &amp; Save Master Passcode</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer Support */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 text-xs text-slate-400 border-t border-slate-200">
        <div className="flex items-center gap-1.5">
          <Headphones className="w-3.5 h-3.5 text-blue-600" />
          <span>Need IT Emergency Assistance? Call Helpdesk ext. 4402</span>
        </div>
        <span>Smile Clinic Hospital Management System &bull; TLS 1.3 Certified</span>
      </footer>
    </div>
  );
};
