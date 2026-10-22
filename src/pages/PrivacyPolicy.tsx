import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LegalPageHeader from '../components/LegalPageHeader';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-[#f7fafc] font-sans text-slate-800 min-h-screen flex flex-col justify-between selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Top Header */}
      <LegalPageHeader title="HIPAA Notice of Privacy Practices & Data Governance" showPrintButton={true} />

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
                Enterprise HIPAA Security Rule
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                256-Bit SSL Encrypted
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Hospital Privacy Policy & Administrative Data Governance</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Effective Date: January 1, 2026 • Governing Organization: Smile Clinic Healthcare System & Dental Hospitals
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold">1</span>
              <span>Enterprise Privacy & Institutional Compliance</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Smile Clinic enforces institutional compliance under the Health Insurance Portability and Accountability Act of 1996 (HIPAA), HITECH Act, and state privacy mandates. All electronic Protected Health Information (ePHI) across hospital management, provider scheduling, and patient accounting is protected by technical and administrative safeguards.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold">2</span>
              <span>Administrative Role-Based Access Controls (RBAC)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Access to patient charts, radiographic series, and billing ledgers is strictly enforced via the principle of least privilege. Administrative personnel receive access only to the data elements essential to their functional hospital duties.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs sm:text-sm text-slate-600">
              <p>• <strong>Access Auditing:</strong> Every query, report export, and record amendment is permanently logged with IP and timestamp.</p>
              <p>• <strong>Encryption:</strong> Data in transit is secured by TLS 1.3; database volumes are encrypted with AES-256 keys.</p>
              <p>• <strong>Disaster Recovery:</strong> Redundant multi-region hot backups ensure zero loss of clinical data.</p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold">3</span>
              <span>Breach Response & HHS Notification</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The hospital Data Protection Committee monitors continuous security telemetry. In the event of a confirmed ePHI security incident, statutory notifications to affected individuals and the U.S. Department of Health and Human Services (HHS) are initiated within statutory limits.
            </p>
          </section>

          {/* Contact Box */}
          <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 text-xs sm:text-sm text-teal-950 space-y-1">
            <div className="font-bold">Chief Information Security Officer & Privacy Officer</div>
            <div>Smile Clinic Healthcare Systems Inc. • 100 Smile Way, Suite 400</div>
            <div>Direct Line: (555) 234-5678 • Email: admin-privacy@smileclinic.com</div>
          </div>
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
            <span className="text-teal-800 font-bold">Privacy Policy</span>
            <Link to="/terms-of-service" className="hover:text-teal-800 transition-colors">Terms of Service</Link>
            <Link to="/patient-rights" className="hover:text-teal-800 transition-colors">Patient Rights</Link>
            <Link to="/support" className="hover:text-teal-800 transition-colors">Support Desk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
