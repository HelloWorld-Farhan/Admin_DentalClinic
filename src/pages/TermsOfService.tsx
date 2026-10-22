import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LegalPageHeader from '../components/LegalPageHeader';

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-[#f7fafc] font-sans text-slate-800 min-h-screen flex flex-col justify-between selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Top Header */}
      <LegalPageHeader title="Terms of Service & Hospital System Administration" showPrintButton={true} />

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
              <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 font-bold text-xs uppercase tracking-wider">
                Enterprise Agreement
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold">
                Admin Operating Regulations
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Hospital Administration Terms of Service</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Effective Date: January 1, 2026 • Governing Authority: Smile Clinic Dental Healthcare System
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold">1</span>
              <span>Acceptance of Administrative Terms</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              These Terms of Service govern executive, operational, and clinical administrative access to the Smile Clinic Dental Hospital Management System. Use of this portal constitutes an institutional contract between authorized administrative personnel and Smile Clinic Healthcare Corporation.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold">2</span>
              <span>Authorized Usage & Credential Integrity</span>
            </h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs sm:text-sm text-slate-600">
              <p className="leading-relaxed">
                Administrative credentials must remain strictly individual. Account sharing, credential delegation, or using administrative elevation outside assigned hospital business hours is strictly prohibited under federal healthcare IT standards.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold">3</span>
              <span>Data Export & Business Associate Compliance</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Exporting bulk patient clinical summaries, radiographic studies, or revenue cycle records requires dual administrator authorization and must be transferred exclusively to verified Business Associates under current BAA agreements.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold">4</span>
              <span>Audit Logging & Termination of Access</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The hospital maintains continuous, automated surveillance of all EHR and financial interactions. Violation of clinical privacy or tampering with audit logs triggers immediate administrative termination and referral for statutory sanctions.
            </p>
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
            <span className="text-teal-800 font-bold">Terms of Service</span>
            <Link to="/patient-rights" className="hover:text-teal-800 transition-colors">Patient Rights</Link>
            <Link to="/support" className="hover:text-teal-800 transition-colors">Support Desk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
