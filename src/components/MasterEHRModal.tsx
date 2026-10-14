import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Activity,
  HeartPulse,
  Thermometer,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Pill,
  Calendar,
  Clock,
  Printer,
  Download,
  X,
  CheckCircle2,
  User,
  Stethoscope,
  Sparkles,
  Plus,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { PatientEHR } from '../types';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ModalPortal } from './ModalPortal';

interface MasterEHRModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientEHR | null;
  onNotify?: (title: string, message: string, type: 'critical' | 'financial' | 'triage' | 'system') => void;
}

export const MasterEHRModal: React.FC<MasterEHRModalProps> = ({
  isOpen,
  onClose,
  patient,
  onNotify,
}) => {
  useBodyScrollLock(isOpen);

  const [activeTab, setActiveTab] = useState<'vitals' | 'odontogram' | 'radiographs' | 'meds' | 'notes'>('vitals');
  const [selectedTooth, setSelectedTooth] = useState<number | null>(30);
  const [newNote, setNewNote] = useState('');
  const [notesList, setNotesList] = useState<Array<{ id: string; author: string; role: string; date: string; content: string }>>([
    {
      id: '1',
      author: 'Dr. Katherine Bell, DDS',
      role: 'Chief of Oral & Maxillofacial Surgery',
      date: 'Today, 09:42 AM',
      content: 'Pre-operative evaluation completed. Cone-beam computed tomography reveals 11.2mm crestal alveolar bone height with adequate cortical plate density. Proceeding with planned osteotomy under IV sedation.',
    },
    {
      id: '2',
      author: 'Dr. Alan Morales',
      role: 'Oral Radiologist & Diagnostic Specialist',
      date: 'Yesterday, 14:15 PM',
      content: 'Digital CBCT 3D reconstruction verified. Inferior alveolar canal nerve loop maintains a 3.4mm safety margin from mandibular molar roots. No apical pathology observed.',
    },
  ]);

  const [prescriptions, setPrescriptions] = useState([
    { id: 'rx-1', name: 'Cefazolin Sodium', dosage: '500mg IV q8h', indication: 'Surgical Antimicrobial Prophylaxis', status: 'Active Inpatient' },
    { id: 'rx-2', name: 'Ibuprofen', dosage: '600mg PO TID PRN', indication: 'Post-Op Analgesia & Anti-inflammatory', status: 'Active Inpatient' },
    { id: 'rx-3', name: 'Chlorhexidine Gluconate', dosage: '0.12% Oral Rinse BID', indication: 'Oral Antimicrobial Decontamination', status: 'Active Inpatient' },
    { id: 'rx-4', name: 'Dexamethasone Sodium', dosage: '4mg IV single dose', indication: 'Post-Surgical Soft Tissue Edema Control', status: 'Completed' },
  ]);

  if (!patient) return null;

  // Odontogram conditions
  const toothConditions: Record<number, { condition: string; detail: string; status: 'healthy' | 'caries' | 'crown' | 'implant' | 'endo' }> = {
    3: { condition: 'Composite Resin', detail: 'Class II MO Composite Restoration', status: 'healthy' },
    14: { condition: 'Apicoectomy', detail: 'Microsurgical Retrograde Root Filling #14', status: 'endo' },
    19: { condition: 'Root Canal Therapy', detail: 'Completed 3-canal obturation with bioceramic sealer', status: 'endo' },
    30: { condition: 'Zirconia Crown', detail: 'Monolithic Translucent Zirconia #30 (Cemented)', status: 'crown' },
    31: { condition: 'Caries Detected', detail: 'Occlusal enamel micro-cavitation requiring preventive seal', status: 'caries' },
    4: { condition: 'Titanium Implant', detail: '4.3 x 10mm fixture seated with 45 Ncm insertion torque', status: 'implant' },
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const item = {
      id: String(Date.now()),
      author: 'Dr. Sneha Lal (Chief Admin)',
      role: 'Attending Clinical Director',
      date: 'Just now',
      content: newNote.trim(),
    };
    setNotesList([item, ...notesList]);
    setNewNote('');
    onNotify?.('EHR Chart Updated', `Clinical progress note added for ${patient.name}`, 'system');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[92vh] flex flex-col my-auto"
            >
              {/* Header Banner */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-[#004850] via-[#005c65] to-[#1560a4] text-white shrink-0 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-xl font-bold border border-white/25 shrink-0">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight">{patient.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/20 text-white border border-white/25">
                          {patient.mrn}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          patient.acuity === 'Critical'
                            ? 'bg-red-500 text-white'
                            : patient.acuity === 'Urgent'
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-emerald-400 text-slate-950'
                        }`}>
                          {patient.acuity} Acuity
                        </span>
                      </div>
                      <p className="text-xs text-white/80 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span>{patient.age} yrs • {patient.gender === 'M' ? 'Male' : 'Female'} • Blood Type O+</span>
                        <span>Ward: <b className="text-white">{patient.room}</b></span>
                        <span>Attending: <b className="text-white">{patient.attendingPhysician}</b></span>
                      </p>
                    </div>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print EHR</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                      aria-label="Close Master EHR"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Sub-bar tags */}
                <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between text-[11px] text-white/80 gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Insurance: <strong className="text-white">{patient.insurance}</strong> ({patient.policyNumber})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-200 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                    <AlertTriangle className="w-3 h-3 text-amber-300" />
                    <span>Allergies: <strong>{patient.allergies.join(', ') || 'No Known Drug Allergies (NKDA)'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-white/60">
                    <Lock className="w-3 h-3" />
                    <span>HIPAA Compliant Electronic Record</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="px-4 sm:px-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
                {[
                  { id: 'vitals', label: 'Vitals & Telemetry', icon: Activity },
                  { id: 'odontogram', label: 'Dental Odontogram (32)', icon: Stethoscope },
                  { id: 'radiographs', label: 'Digital CBCT & Panorex', icon: Layers },
                  { id: 'meds', label: 'Medications & Prescriptions', icon: Pill },
                  { id: 'notes', label: 'Clinical Progress Notes', icon: FileText },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        isActive
                          ? 'border-[#005c65] text-[#005c65] dark:text-teal-400 bg-white dark:bg-slate-900 rounded-t-lg shadow-sm'
                          : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
                {/* TAB 1: VITALS & TELEMETRY */}
                {activeTab === 'vitals' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#005c65]" />
                          Continuous Hemodynamic Telemetry Dock
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live Streaming Active
                        </span>
                      </div>

                      {/* 4 Vital telemetry cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Heart Rate</span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-black text-slate-900">{patient.vitals.hr}</span>
                            <span className="text-xs font-semibold text-slate-400">bpm</span>
                          </div>
                          <div className="mt-2 h-7 w-full flex items-center">
                            <svg className="w-full h-full stroke-red-500 fill-none" viewBox="0 0 100 24">
                              <path strokeWidth="2" strokeLinecap="round" d="M0,12 L20,12 L25,4 L30,20 L35,8 L40,16 L45,12 L100,12" />
                            </svg>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Normal Sinus Rhythm</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Blood Pressure</span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-black text-slate-900">{patient.vitals.bp}</span>
                            <span className="text-xs font-semibold text-slate-400">mmHg</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: '75%' }} />
                          </div>
                          <span className="text-[10px] text-blue-600 font-semibold mt-2 block">MAP: 92 mmHg (Optimal)</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">SpO2 Oxygen</span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-black text-slate-900">{patient.vitals.spO2}%</span>
                            <span className="text-xs font-semibold text-slate-400">Room Air</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99%' }} />
                          </div>
                          <span className="text-[10px] text-emerald-600 font-semibold mt-2 block">Target &gt; 95% met</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Core Temperature</span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-black text-slate-900">{patient.vitals.temp}</span>
                            <span className="text-xs font-semibold text-slate-400">Axillary</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-teal-500 h-full rounded-full" style={{ width: '60%' }} />
                          </div>
                          <span className="text-[10px] text-teal-600 font-semibold mt-2 block">Afebrile Status</span>
                        </div>
                      </div>
                    </div>

                    {/* Clinical Summary Banner */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Chief Complaint &amp; Intake Diagnosis</h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {patient.chiefComplaint}. Patient admitted under {patient.attendingPhysician} for comprehensive maxillofacial management and post-operative surgical observation in {patient.room}.
                      </p>
                    </div>

                    {/* Recent Procedures */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Recent Clinical Procedures</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {patient.recentProcedures.map((proc, i) => (
                          <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#005c65] shrink-0" />
                            <span className="text-xs font-bold text-slate-800">{proc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: INTERACTIVE ODONTOGRAM (32 TEETH) */}
                {activeTab === 'odontogram' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-[#005c65]" />
                          Universal Adult 32-Tooth Odontogram
                        </h3>
                        <p className="text-xs text-slate-500">Interactive maxillary &amp; mandibular treatment condition mapping</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Healthy
                        </span>
                        <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <span className="w-2 h-2 rounded-full bg-blue-500" /> Crown
                        </span>
                        <span className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          <span className="w-2 h-2 rounded-full bg-purple-500" /> Endo / Root Canal
                        </span>
                        <span className="flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          <span className="w-2 h-2 rounded-full bg-teal-600" /> Implant
                        </span>
                        <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <span className="w-2 h-2 rounded-full bg-amber-500" /> Caries
                        </span>
                      </div>
                    </div>

                    {/* Odontogram Visual Arch */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                      {/* Upper Arch (1 to 16) */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
                          Maxillary Arch (Teeth 1–16)
                        </span>
                        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 sm:gap-2">
                          {Array.from({ length: 16 }, (_, i) => i + 1).map((toothNum) => {
                            const cond = toothConditions[toothNum];
                            const isSelected = selectedTooth === toothNum;
                            return (
                              <button
                                key={toothNum}
                                onClick={() => setSelectedTooth(toothNum)}
                                className={`p-2 rounded-xl text-center transition-all flex flex-col items-center justify-between min-h-[58px] ${
                                  isSelected
                                    ? 'ring-2 ring-[#005c65] shadow-md bg-white'
                                    : cond
                                    ? 'bg-white hover:bg-slate-100 shadow-sm'
                                    : 'bg-white/60 hover:bg-white text-slate-400'
                                }`}
                              >
                                <span className="font-mono text-[10px] font-bold text-slate-400">#{toothNum}</span>
                                <div className={`w-4 h-4 rounded-full mt-1 ${
                                  cond?.status === 'crown'
                                    ? 'bg-blue-500'
                                    : cond?.status === 'endo'
                                    ? 'bg-purple-500'
                                    : cond?.status === 'implant'
                                    ? 'bg-teal-600'
                                    : cond?.status === 'caries'
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-400'
                                }`} />
                                <span className="text-[9px] font-bold text-slate-700 mt-1 truncate max-w-full">
                                  {cond ? cond.status.toUpperCase() : 'OK'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Lower Arch (32 down to 17) */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
                          Mandibular Arch (Teeth 17–32)
                        </span>
                        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 sm:gap-2">
                          {Array.from({ length: 16 }, (_, i) => 32 - i).map((toothNum) => {
                            const cond = toothConditions[toothNum];
                            const isSelected = selectedTooth === toothNum;
                            return (
                              <button
                                key={toothNum}
                                onClick={() => setSelectedTooth(toothNum)}
                                className={`p-2 rounded-xl text-center transition-all flex flex-col items-center justify-between min-h-[58px] ${
                                  isSelected
                                    ? 'ring-2 ring-[#005c65] shadow-md bg-white'
                                    : cond
                                    ? 'bg-white hover:bg-slate-100 shadow-sm'
                                    : 'bg-white/60 hover:bg-white text-slate-400'
                                }`}
                              >
                                <span className="font-mono text-[10px] font-bold text-slate-400">#{toothNum}</span>
                                <div className={`w-4 h-4 rounded-full mt-1 ${
                                  cond?.status === 'crown'
                                    ? 'bg-blue-500'
                                    : cond?.status === 'endo'
                                    ? 'bg-purple-500'
                                    : cond?.status === 'implant'
                                    ? 'bg-teal-600'
                                    : cond?.status === 'caries'
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-400'
                                }`} />
                                <span className="text-[9px] font-bold text-slate-700 mt-1 truncate max-w-full">
                                  {cond ? cond.status.toUpperCase() : 'OK'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Selected Tooth Detail Panel */}
                    {selectedTooth && (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold bg-[#005c65]/10 text-[#005c65] px-2.5 py-1 rounded-lg">
                              Tooth #{selectedTooth}
                            </span>
                            <span className="font-bold text-sm text-slate-900">
                              {toothConditions[selectedTooth]?.condition || 'Healthy Tooth & Sound Enamel'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">Diagnostic Inspection</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-3">
                          {toothConditions[selectedTooth]?.detail || 'No active pathology, restoration, or bone loss detected. Periodic periodontal evaluation scheduled.'}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* TAB 3: DIGITAL CBCT & RADIOGRAPHS */}
                {activeTab === 'radiographs' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#005c65]" />
                          High-Resolution Diagnostic Imaging &amp; CBCT
                        </h3>
                        <p className="text-xs text-slate-500">DICOM 3.0 Tele-radiology archive with automated nerve canal tracking</p>
                      </div>
                      <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Verified by Dr. Alan Morales
                      </span>
                    </div>

                    {/* Simulated Radiograph Viewer */}
                    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-4 min-h-[280px] flex flex-col justify-between text-white">
                      <div className="flex justify-between items-center text-xs text-slate-300">
                        <span className="font-mono text-[11px]">FOV: 12x8 cm • Slice: 0.15mm • kVp: 90 • mAs: 12.0</span>
                        <span className="text-emerald-400 font-bold">● High Contrast Mode</span>
                      </div>

                      {/* Graphic simulation of Panorex / CBCT */}
                      <div className="my-6 flex flex-col items-center justify-center text-center">
                        <div className="w-full max-w-lg h-36 border-2 border-dashed border-teal-500/40 rounded-2xl flex items-center justify-center bg-teal-950/20 relative overflow-hidden">
                          {/* Radiograph grid lines */}
                          <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 opacity-20 pointer-events-none">
                            {Array.from({ length: 18 }).map((_, idx) => (
                              <div key={idx} className="border border-teal-400" />
                            ))}
                          </div>
                          <div className="relative z-10 text-center px-4">
                            <span className="text-xs font-bold text-teal-300 uppercase tracking-widest block">
                              Orthopantomogram &amp; 3D Volume Reconstruction
                            </span>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Mandibular Canal Margin: 3.4mm • Alveolar Crest Height: 11.2mm • Bone Type: D2
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                        <span>Study ID: DICOM-2026-X98104</span>
                        <span>Acquisition: Digital Orthophos S 3D</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 4: MEDICATIONS & PRESCRIPTIONS */}
                {activeTab === 'meds' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <Pill className="w-4 h-4 text-[#005c65]" />
                          Active Inpatient &amp; Outpatient e-Prescriptions
                        </h3>
                        <p className="text-xs text-slate-500">Pharmacy dispatch protocol with allergy cross-referencing</p>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                      {prescriptions.map((rx) => (
                        <div key={rx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#005c65] flex items-center justify-center shrink-0">
                              <Pill className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xs text-slate-900">{rx.name}</h4>
                                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {rx.dosage}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{rx.indication}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              rx.status === 'Active Inpatient'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {rx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* TAB 5: CLINICAL NOTES & AUDIT */}
                {activeTab === 'notes' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#005c65]" />
                        Physician Progress Notes &amp; SOAP Documentation
                      </h3>
                      <p className="text-xs text-slate-500">Permanent medical legal audit trail with electronic signatures</p>
                    </div>

                    {/* Add note form */}
                    <form onSubmit={handleAddNote} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase">
                        Add New Physician Order / Progress Note
                      </label>
                      <textarea
                        rows={2}
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Type clinical observation, post-operative order, or medication change..."
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-[#005c65] focus:outline-none"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#005c65] hover:bg-[#007782] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Append Note to EHR</span>
                        </button>
                      </div>
                    </form>

                    {/* Notes list */}
                    <div className="space-y-3">
                      {notesList.map((note) => (
                        <div key={note.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                            <div>
                              <span className="font-bold text-slate-900">{note.author}</span>
                              <span className="text-slate-400 text-[11px] block">{note.role}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">{note.date}</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">{note.content}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 pt-1 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Cryptographically Verified &amp; Signed</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bottom Footer */}
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>JCAHO &amp; HIPAA Enterprise Certified Protocol 2026.4</span>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  Close Master Chart
                </button>
              </div>
            </motion.div>
          </div>
        </ModalPortal>
      )}
    </AnimatePresence>
  );
};
