import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LegalPageHeader from '../components/LegalPageHeader';

export default function PatientRights() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-[#f7fafc] font-sans text-slate-800 min-h-screen flex flex-col justify-between selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Top Header */}
      <LegalPageHeader title="Patient Rights & Institutional Governance" showPrintButton={true} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8"
        >
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                Patient Bill of Rights
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold">
                Hospital Governance & Ethical Standards
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Hospital Patient Bill of Rights & Administrative Charter</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Smile Clinic Hospital Management System ensures that all clinical and administrative operations strictly uphold dental patient civil rights, transparent billing, and privacy.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">1. Universal Non-Discriminatory Access</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
                  All patients admitted or scheduled across Smile Clinic operatories receive dignified, compassionate dental care irrespective of race, ethnicity, sexual orientation, disability status, or insurance carrier.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">2. Transparent Pricing & Surprise Billing Protections</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
                  Under the No Surprises Act and hospital policy, patients have the right to good-faith itemized fee estimates prior to treatment and transparent explanation of insurance copayments, deductibles, and lab fees.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">folder_shared</span>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">3. Rapid Electronic Health Record Access</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
                  Patients have the right to inspect, download, and request electronic transfer of complete radiographic DICOM series, periodontal pocket charts, and surgical histories within 24 hours of request without unreasonable cost.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">emergency</span>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">4. Emergency Dental Triage Access</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
                  Patients with severe pain, facial swelling, or dental trauma are guaranteed immediate clinical triage via our 24/7 hotline at (555) 234-5678, with round-the-clock on-call surgical coverage.
                </p>
              </div>
            </div>
          </section>
        </motion.div>
      </main>

      {/* Standard Legal Footer */}
      <footer className="w-full bg-slate-100 py-4 border-t border-slate-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600 text-xs text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-teal-700">shield_with_heart</span>
            <span>© 2026 Smile Clinic Health System. All health records encrypted.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6 text-[11px] font-medium">
            <Link to="/privacy-policy" className="hover:text-teal-800 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-teal-800 transition-colors">Terms of Service</Link>
            <span className="text-teal-800 font-bold">Patient Rights</span>
            <Link to="/support" className="hover:text-teal-800 transition-colors">Support Desk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
