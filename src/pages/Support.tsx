import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LegalPageHeader from '../components/LegalPageHeader';

export default function Support() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const [formData, setFormData] = useState({
    name: 'Dr. Sneha Lal, MD (Demo Admin)',
    email: 'admin@smileclinic.com',
    category: 'EHR Database & Server Infrastructure',
    priority: 'Normal',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
    }, 500);
  };

  const faqs = [
    {
      q: 'How do hospital administrators export certified ADA / HIPAA audit compliance logs?',
      a: 'From the Admin dashboard top actions, click "Export Clinical Reports". Select the date range, required schemas (EHR Access, Financial Transactions, or Staff Shifts), and generate a cryptographically sealed SHA-256 CSV / PDF audit report.'
    },
    {
      q: 'What is the immediate hospital protocol for catastrophic dental trauma or severe hemorrhage?',
      a: 'Call the Emergency Hotline at (555) 234-5678 immediately. The admin dispatch module enables immediate operatory reservation, on-call maxillofacial surgeon alerting, and automated ambulance bay clearance.'
    },
    {
      q: 'How do I synchronize insurance clearinghouse claims and EDI 837D batch transactions?',
      a: 'Navigate to "Billing & Revenue". Under Claims Triage, click "Sync Clearinghouse". The system transmits pending batches to Delta Dental, MetLife, and Cigna with real-time EDI 999 acknowledgement validation.'
    },
    {
      q: 'How do I onboard and provision role-based credentials for incoming associate dentists or dental hygienists?',
      a: 'Under "Doctors & Specialists", click "Add New Provider". Input NPI license, state dental board registration, assign operatory access tiers, and dispatch the automated dual-factor onboarding invitation.'
    }
  ];

  return (
    <div className="bg-[#f7fafc] font-sans text-slate-800 min-h-screen flex flex-col justify-between selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Top Header */}
      <LegalPageHeader title="Executive IT Support & Helpdesk" showPrintButton={false} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full">
        {/* Emergency Hotline Notice Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-rose-50 to-orange-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">medical_services</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-rose-950 flex items-center gap-2">
                <span>Immediate Dental Emergency Hotline</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-semibold uppercase tracking-wider">
                  24/7 Available
                </span>
              </h3>
              <p className="text-xs text-rose-800/90 mt-0.5">
                Experiencing severe swelling, acute continuous pain, dental trauma, or a knocked-out tooth? Do not wait. Call our emergency triage doctor directly.
              </p>
            </div>
          </div>
          <a
            href="tel:5552345678"
            className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shrink-0 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Call (555) 234-5678</span>
          </a>
        </div>

        {/* Quick Operations Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[20px]">database</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">EHR Infrastructure</h4>
            <p className="text-[11px] text-slate-500 mt-1">Database latency, failover backups & HIPAA storage</p>
            <div className="mt-2 text-[10px] font-semibold text-teal-700">Ext. 100 • infra@smileclinic.com</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[20px]">desk</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">Front Desk & Triage</h4>
            <p className="text-[11px] text-slate-500 mt-1">Check-in kiosks, digital consent pads & VoIP queues</p>
            <div className="mt-2 text-[10px] font-semibold text-blue-700">Ext. 102 • reception-it@smileclinic.com</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">Revenue Cycle & Claims</h4>
            <p className="text-[11px] text-slate-500 mt-1">Clearinghouse connectivity, EDI 835 remittances & payouts</p>
            <div className="mt-2 text-[10px] font-semibold text-emerald-700">Ext. 401 • billing-it@smileclinic.com</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[20px]">policy</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">Security & Compliance</h4>
            <p className="text-[11px] text-slate-500 mt-1">Access auditing, HIPAA disclosures & credentials</p>
            <div className="mt-2 text-[10px] font-semibold text-purple-700">Ext. 110 • compliance@smileclinic.com</div>
          </div>
        </div>

        {/* Form & FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Administrative Support Ticket</h3>
              <p className="text-xs text-slate-500 mt-1">
                Direct dispatch to healthcare systems engineering, database administrators, and hospital leadership.
              </p>
            </div>

            {formSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-xl space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[24px]">done</span>
                </div>
                <h4 className="font-bold text-emerald-900 text-base">Administrative Ticket Created</h4>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  Ticket <strong>#ADM-{Math.floor(100000 + Math.random() * 900000)}</strong> has been prioritized. Tier-3 engineering response SLA is under 15 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => setFormSubmitted(false)}
                  className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Submit Another Ticket
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Admin / Director Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Executive Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Inquiry Department
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-600"
                    >
                      <option>EHR Database & Server Infrastructure</option>
                      <option>Front Desk Kiosk & Operatory VoIP</option>
                      <option>Clearinghouse Claims & EDI Gateway</option>
                      <option>HIPAA Audit Log Export & Archival</option>
                      <option>Provider Credentialing & Roles</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Urgency Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-600"
                    >
                      <option>Normal (Routine question)</option>
                      <option>Urgent (Facility workflow blocked)</option>
                      <option>Critical (Clinical EHR outage)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of issue or question"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Message / Incident Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Please include relevant facility wing, affected operatory, or error code..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-600"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Dispatch Support Ticket</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Admin FAQs */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                <span className="material-symbols-outlined text-[20px] text-teal-700">help</span>
                <h4 className="font-bold text-sm text-slate-900">Admin Portal FAQs</h4>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 text-left text-xs font-bold text-slate-800 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <span className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-teal-700' : ''}`}>
                          expand_more
                        </span>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="p-3.5 bg-white text-[11px] text-slate-600 leading-relaxed border-t border-slate-200"
                          >
                            {faq.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
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
            <Link to="/patient-rights" className="hover:text-teal-800 transition-colors">Patient Rights</Link>
            <span className="text-teal-800 font-bold">Support Desk</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
