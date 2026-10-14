import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Users,
  Timer,
  BadgeAlert,
  Volume2,
  Printer,
  QrCode,
  ShieldCheck,
  Search,
  Plus,
  RefreshCw,
  X,
  CreditCard,
  Building,
  CheckCircle2,
  Radio,
  FileBadge,
} from 'lucide-react';
import { mockTriageQueue, mockDoctors } from '../data/mockData';
import { TriageItem, TriageAcuity, InsuranceVerificationStatus } from '../types';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ModalPortal } from '../components/ModalPortal';

interface ReceptionProps {
  onNotify?: (title: string, message: string, type: 'critical' | 'financial' | 'triage' | 'system') => void;
  onOpenPowerBI?: () => void;
  onOpenExport?: () => void;
}

export const Reception: React.FC<ReceptionProps> = ({ onNotify, onOpenPowerBI, onOpenExport }) => {
  const [queue, setQueue] = useState<TriageItem[]>(mockTriageQueue);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Waiting' | 'In Triage' | 'With Doctor'>('All');

  // Modals
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [visitorModalOpen, setVisitorModalOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  // Freeze background window scrolling when ANY reception modal is open
  const isAnyModalOpen = Boolean(checkInModalOpen || visitorModalOpen || emergencyModalOpen);
  useBodyScrollLock(isAnyModalOpen);
  const [nowServing, setNowServing] = useState({
    counter1: '#A-102',
    counter2: '#B-045',
    counter5: '#C-012',
    nextInLine: '#A-104 → Desk 1',
  });

  // Fast-track form in sidebar
  const [intakeForm, setIntakeForm] = useState({
    mrn: '',
    fullName: '',
    dob: '1990-05-12',
    intakeType: 'OPD Visit',
    department: 'General Dental & Diagnostics',
  });

  // Visitor RFID form
  const [visitorForm, setVisitorForm] = useState({
    visitorName: '',
    patientMRN: 'MRN-89421 (Ananya Verma)',
    relationship: 'Family Member',
    tower: 'ICU Tower Wing C',
  });

  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      const matchSearch =
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignedDoctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPriority =
        filterPriority === 'ALL' ||
        (filterPriority === 'Urgent' && (item.acuity === 'Immediate' || item.acuity === 'Urgent')) ||
        (filterPriority === 'Routine' && item.acuity === 'Routine');

      const matchTab =
        activeTab === 'All' ||
        (activeTab === 'Waiting' && item.status === 'Waiting') ||
        (activeTab === 'In Triage' && item.status === 'In Triage') ||
        (activeTab === 'With Doctor' && item.status === 'With Doctor');

      return matchSearch && matchPriority && matchTab;
    });
  }, [queue, searchQuery, filterPriority, activeTab]);

  const handleCallCounter = (item: TriageItem, counterName: string) => {
    setNowServing((prev) => ({
      ...prev,
      nextInLine: `${item.tokenNumber} → ${counterName}`,
    }));
    onNotify?.(
      'Patient Chime Broadcast',
      `Calling Token ${item.tokenNumber} (${item.patientName}) to ${counterName} over public lobby audio`,
      'triage'
    );
  };

  const handlePrintWristband = (item: TriageItem) => {
    onNotify?.(
      'RFID Wristband Dispatched',
      `Direct thermal print sent to Zebra ZD510 for ${item.patientName} (${item.tokenNumber})`,
      'system'
    );
  };

  const handleQuickIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeForm.fullName.trim()) return;

    const tokenNum = `#A-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: TriageItem = {
      id: `triage-${Date.now()}`,
      tokenNumber: tokenNum,
      patientName: intakeForm.fullName,
      age: 32,
      gender: 'M',
      arrivalTime: 'Just now',
      chiefComplaint: `${intakeForm.intakeType}: Intake registered at desk`,
      acuity: intakeForm.intakeType === 'Triage ER' ? 'Immediate' : 'Routine',
      insuranceStatus: 'Verified',
      insuranceProvider: 'Delta Dental Premier',
      assignedDoctor: mockDoctors[0].name,
      assignedRoom: 'Consult Suite 101',
      waitTimeMinutes: 2,
      status: 'Waiting',
    };

    setQueue([newItem, ...queue]);
    setIntakeForm({ mrn: '', fullName: '', dob: '1990-05-12', intakeType: 'OPD Visit', department: 'General Dental & Diagnostics' });
    onNotify?.(
      'Token Generated & Printed',
      `Token ${newItem.tokenNumber} issued to ${newItem.patientName}. Assigned to ${newItem.assignedDoctor}`,
      'triage'
    );
  };

  const handleIssueVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVisitorModalOpen(false);
    onNotify?.(
      'Visitor Pass Issued',
      `RFID Badge #VIS-${Math.floor(1000 + Math.random() * 9000)} activated for ${visitorForm.visitorName} (${visitorForm.tower})`,
      'system'
    );
  };

  const handleEmergencyWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenNum = `#E-${Math.floor(10 + Math.random() * 90)}`;
    const emergencyItem: TriageItem = {
      id: `triage-${Date.now()}`,
      tokenNumber: tokenNum,
      patientName: 'Emergency Trauma Walk-In',
      age: 28,
      gender: 'M',
      arrivalTime: 'Emergency Rush',
      chiefComplaint: 'Acute Facial Hemorrhage & Mandibular Trauma',
      acuity: 'Immediate',
      insuranceStatus: 'Self-Pay',
      insuranceProvider: 'Emergency Waiver Fast-Track',
      assignedDoctor: 'Dr. Marcus Vance',
      assignedRoom: 'Trauma Bay 1',
      waitTimeMinutes: 0,
      status: 'In Triage',
    };

    setQueue([emergencyItem, ...queue]);
    setEmergencyModalOpen(false);
    onNotify?.(
      'CODE RED: Immediate Triage Assigned',
      `Emergency Token ${tokenNum} routed directly into Trauma Bay 1 under Dr. Vance`,
      'critical'
    );
  };

  const getAcuityPill = (acuity: TriageAcuity) => {
    switch (acuity) {
      case 'Immediate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> Urgent Level 1 (STAT)
          </span>
        );
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> Urgent Level 2
          </span>
        );
      case 'Routine':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" /> Standard Care
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Sub-header & Live Status Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#005c65] text-xs uppercase tracking-wider font-semibold mb-1">
            <Monitor className="w-4 h-4" />
            <span>Central Patient Reception &amp; Admissions Wing</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Reception &amp; Front-Desk Operations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Live queue management, appointment intake, walk-in triage, and visitor pass administration
          </p>
        </div>

        {/* Quick Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenPowerBI && (
            <button
              onClick={onOpenPowerBI}
              className="flex items-center gap-2 px-4 h-10 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-sm font-semibold transition-all shadow-sm"
            >
              <Radio className="w-4 h-4 text-amber-600" />
              <span>Queue Analytics (Power BI)</span>
            </button>
          )}

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-2 px-4 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Export Triage Log</span>
            </button>
          )}

          <button
            onClick={() => setVisitorModalOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium shadow-sm transition-all"
          >
            <FileBadge className="w-4 h-4 text-blue-600" />
            <span>Issue Visitor RFID</span>
          </button>

          <button
            onClick={() => setEmergencyModalOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-sm font-semibold shadow-sm transition-all"
          >
            <BadgeAlert className="w-4 h-4 text-red-600" />
            <span>Emergency Walk-In</span>
          </button>

          <button
            onClick={() => setCheckInModalOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-[#005c65] hover:bg-[#007782] text-white text-sm font-semibold shadow-md shadow-[#005c65]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Check-In</span>
          </button>
        </div>
      </div>

      {/* Operational Telemetry Bar (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Appointments */}
        <div className="p-5 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Total Scheduled Today
            </span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-[#005c65]">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">348</span>
              <span className="text-xs text-teal-600 font-semibold">+18% vs yesterday</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#005c65]" /> Completed: <strong className="text-slate-800">215</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Lobby: <strong className="text-slate-800">42</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" /> No-Show: <strong className="text-slate-800">14</strong>
            </span>
          </div>
        </div>

        {/* Stat 2: Lobby Occupancy Gauge */}
        <div className="p-5 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Lobby Occupancy</span>
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
              Optimal
            </span>
          </div>
          <div className="flex items-center justify-between my-2">
            <div>
              <span className="text-3xl font-bold text-slate-900 tracking-tight">68%</span>
              <span className="text-xs text-slate-500 block">54 / 80 Chairs Filled</span>
            </div>
            {/* Inline SVG Radial Gauge */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-[#005c65] transition-all duration-1000"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="68, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <Monitor className="w-4 h-4 text-[#005c65] absolute" />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#005c65] h-full rounded-full" style={{ width: '68%' }} />
          </div>
        </div>

        {/* Stat 3: Avg Wait Time */}
        <div className="p-5 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Average Check-In Wait
            </span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-[#005c65]">
              <Timer className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">4.2</span>
              <span className="text-sm text-slate-500">mins</span>
              <span className="text-xs text-teal-600 font-semibold ml-1">-1.4m SLA</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Triage Intake: <strong className="text-slate-800">2.8m</strong></span>
            <span>Registration: <strong className="text-slate-800">1.4m</strong></span>
          </div>
        </div>

        {/* Stat 4: Active Reception Desks */}
        <div className="p-5 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Counter Staffing</span>
            <span className="flex items-center gap-1 text-teal-600 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" /> 100% ONLINE
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">6 / 6</span>
              <span className="text-sm text-slate-500">Counters Open</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 flex-1 rounded-full bg-[#005c65]" title="Counter 1 Active" />
            <span className="h-2 flex-1 rounded-full bg-[#005c65]" title="Counter 2 Active" />
            <span className="h-2 flex-1 rounded-full bg-[#005c65]" title="Counter 3 Active" />
            <span className="h-2 flex-1 rounded-full bg-[#005c65]" title="Counter 4 Active" />
            <span className="h-2 flex-1 rounded-full bg-[#005c65]" title="Counter 5 Active" />
            <span className="h-2 flex-1 rounded-full bg-blue-600" title="Counter 6 Express" />
          </div>
        </div>
      </div>

      {/* Operational Flow: Arrival Curve Chart & Counter Station Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Hourly Arrival Curve (7 Cols) */}
        <div className="xl:col-span-7 p-5 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
            <div>
              <span className="text-base text-slate-900 font-bold block">Patient Arrival Rush Curve</span>
              <span className="text-xs text-slate-500">
                Real-time arrival volume tracking compared with historical Monday baseline
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded bg-[#007782]" />
                <span className="text-xs text-slate-600">Today&apos;s Inflow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded bg-slate-300" />
                <span className="text-xs text-slate-600">Avg Trend</span>
              </div>
            </div>
          </div>

          {/* Wave SVG Visualization */}
          <div className="w-full h-40 pt-2">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 130">
              <defs>
                <linearGradient id="rushTealGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#007782" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#007782" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line stroke="#E2E8F0" strokeDasharray="3,3" x1="0" x2="600" y1="30" y2="30" />
              <line stroke="#E2E8F0" strokeDasharray="3,3" x1="0" x2="600" y1="70" y2="70" />
              <line stroke="#E2E8F0" strokeDasharray="3,3" x1="0" x2="600" y1="110" y2="110" />

              {/* Baseline */}
              <path
                d="M0,105 Q60,95 120,60 T240,40 T360,75 T480,48 T600,85"
                fill="none"
                stroke="#BDC8CA"
                strokeDasharray="4,4"
                strokeWidth="2"
              />
              {/* Today's curve fill */}
              <path
                d="M0,110 Q50,90 100,55 T200,20 T300,60 T400,35 T500,70 T600,90 L600,130 L0,130 Z"
                fill="url(#rushTealGrad)"
              />
              {/* Today's curve stroke */}
              <path
                d="M0,110 Q50,90 100,55 T200,20 T300,60 T400,35 T500,70 T600,90"
                fill="none"
                stroke="#007782"
                strokeLinecap="round"
                strokeWidth="3"
              />
              {/* Active Marker */}
              <circle cx="280" cy="50" fill="#007782" r="5" />
              <circle cx="280" cy="50" fill="#007782" opacity="0.25" r="10" />
              <line stroke="#007782" strokeDasharray="2,2" strokeWidth="1.5" x1="280" x2="280" y1="0" y2="120" />
            </svg>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 pt-2 px-1 border-t border-slate-100">
            <span>07:00 AM</span>
            <span>09:00 AM (Peak)</span>
            <span className="text-[#005c65] font-bold">11:00 AM (Now)</span>
            <span>01:00 PM</span>
            <span>03:00 PM</span>
            <span>05:00 PM</span>
          </div>
        </div>

        {/* Counter Station Status Matrix (5 Cols) */}
        <div className="xl:col-span-5 p-5 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <div>
              <span className="text-base text-slate-900 font-bold block">Front Counter Allocation</span>
              <span className="text-xs text-slate-500">Live station load &amp; assigned personnel</span>
            </div>
            <button
              onClick={() => onNotify?.('Reallocation Triggered', 'Desk 04 staff rotated to handle Insurance rush.', 'system')}
              className="text-[#005c65] text-xs font-semibold hover:underline"
            >
              Reassign Staff
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {/* C-01 */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">C-01 FastTrack</span>
                <span className="h-2 w-2 rounded-full bg-teal-500" />
              </div>
              <span className="text-xs text-slate-600 truncate">Elena Torres</span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">Queue</span>
                <span className="px-1.5 py-0.5 rounded bg-[#005c65] text-white text-[10px] font-bold">2 pat.</span>
              </div>
            </div>

            {/* C-02 */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">C-02 Insurance</span>
                <span className="h-2 w-2 rounded-full bg-teal-500" />
              </div>
              <span className="text-xs text-slate-600 truncate">Marcus Vance</span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">Queue</span>
                <span className="px-1.5 py-0.5 rounded bg-[#005c65] text-white text-[10px] font-bold">4 pat.</span>
              </div>
            </div>

            {/* C-03 */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">C-03 Specialist</span>
                <span className="h-2 w-2 rounded-full bg-teal-500" />
              </div>
              <span className="text-xs text-slate-600 truncate">Amina Al-Mansoor</span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">Queue</span>
                <span className="px-1.5 py-0.5 rounded bg-[#005c65] text-white text-[10px] font-bold">3 pat.</span>
              </div>
            </div>

            {/* C-04 */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">C-04 Admissions</span>
                <span className="h-2 w-2 rounded-full bg-teal-500" />
              </div>
              <span className="text-xs text-slate-600 truncate">Amit Zhao</span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">Queue</span>
                <span className="px-1.5 py-0.5 rounded bg-[#005c65] text-white text-[10px] font-bold">1 pat.</span>
              </div>
            </div>

            {/* C-05 */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">C-05 Cashier</span>
                <span className="h-2 w-2 rounded-full bg-teal-500" />
              </div>
              <span className="text-xs text-slate-600 truncate">Chloe Bennet</span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">Queue</span>
                <span className="px-1.5 py-0.5 rounded bg-[#005c65] text-white text-[10px] font-bold">2 pat.</span>
              </div>
            </div>

            {/* C-06 Express */}
            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 flex flex-col justify-between gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700">C-06 Kiosk</span>
                <span className="h-2 w-2 rounded-full bg-blue-600" />
              </div>
              <span className="text-xs text-slate-600 truncate">Self-Service</span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">Processed</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">62 Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Workspace: Live Triage Queue Table (8 cols) & Side Intelligence (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Queue & Check-In Table Area (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="p-5 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col gap-4">
            {/* Table Controls & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['All', 'Waiting', 'In Triage', 'With Doctor'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      activeTab === tab
                        ? 'bg-[#005c65] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab} ({tab === 'All' ? queue.length : queue.filter((q) => q.status === tab).length})
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="h-9 pl-3 pr-7 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-[#005c65] cursor-pointer"
                  >
                    <option value="ALL">All Triage Priority</option>
                    <option value="Urgent">Emergent &amp; Urgent</option>
                    <option value="Routine">Standard Care</option>
                  </select>
                </div>

                <button
                  onClick={() => onNotify?.('Queue Refreshed', 'Telemetry sync updated 42 waiting admissions', 'system')}
                  className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900"
                  title="Refresh Live Queue"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Queue List Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                    <th className="py-2.5 px-3">Token &amp; Time</th>
                    <th className="py-2.5 px-3">Patient Profile</th>
                    <th className="py-2.5 px-3">Department &amp; Doctor</th>
                    <th className="py-2.5 px-3">Acuity</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Insurance Pre-Check</th>
                    <th className="py-2.5 px-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Users className="w-10 h-10 text-slate-300" />
                          <p className="text-sm font-bold text-slate-700">No triage queue entries found</p>
                          <p className="text-xs text-slate-400">No patients currently match the active tab &ldquo;{activeTab}&rdquo; or filter priority</p>
                          <button
                            onClick={() => {
                              setActiveTab('All');
                              setFilterPriority('ALL');
                              setSearchQuery('');
                            }}
                            className="mt-2 px-3 py-1.5 bg-[#005c65] text-white rounded-lg text-xs font-semibold"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map((item) => {
                      const isUrgent = item.acuity === 'Immediate';
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isUrgent ? 'bg-red-50/40' : ''
                          }`}
                        >
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className={`font-bold font-mono text-sm ${isUrgent ? 'text-red-700' : 'text-[#005c65]'}`}>
                              {item.tokenNumber}
                            </span>
                            <span className="text-xs text-slate-400">{item.arrivalTime}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-bold border border-slate-200">
                              {item.patientName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900">{item.patientName}</span>
                              <span className="text-xs text-slate-400">
                                {item.age}y • {item.gender}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-800">{item.chiefComplaint}</span>
                            <span className="text-xs text-blue-600 font-semibold">{item.assignedDoctor}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">{getAcuityPill(item.acuity)}</td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              item.status === 'Waiting'
                                ? 'bg-amber-100 text-amber-800'
                                : item.status === 'In Triage'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {item.status} ({item.waitTimeMinutes}m wait)
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 text-teal-700 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{item.insuranceProvider}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCallCounter(item, 'Desk 1')}
                              className="px-2.5 py-1 rounded bg-[#005c65] text-white text-xs font-semibold hover:bg-[#007782] transition-all"
                              title="Call patient to receptionist desk"
                            >
                              Call C-01
                            </button>

                            <button
                              onClick={() => handlePrintWristband(item)}
                              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                              title="Print Wristband"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 gap-2">
              <span>Showing {filteredQueue.length} active triage tickets</span>
              <span className="text-[#005c65] font-semibold">Triage Algorithm v3.4 Active</span>
            </div>
          </div>
        </div>

        {/* Right Side Panel: Digital Signage Preview & Quick Walk-In (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* Digital Signage Lobby Display Mirror */}
          <div className="p-5 rounded-xl bg-slate-900 text-white shadow-md flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-400 animate-ping" />
                <span className="text-xs uppercase tracking-wider font-bold text-teal-400">
                  Lobby Signage Display #01
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">10:48 AM</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider block mb-2 font-semibold">
                Now Serving on Public Speakers
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-[#005c65] text-white">
                  <span className="block text-[11px] opacity-80">Counter 1</span>
                  <span className="text-lg font-bold font-mono tracking-tight">{nowServing.counter1}</span>
                </div>
                <div className="p-2 rounded bg-slate-700/80 text-white">
                  <span className="block text-[11px] opacity-80">Counter 2</span>
                  <span className="text-lg font-bold font-mono tracking-tight">{nowServing.counter2}</span>
                </div>
                <div className="p-2 rounded bg-slate-700/80 text-white">
                  <span className="block text-[11px] opacity-80">Counter 5</span>
                  <span className="text-lg font-bold font-mono tracking-tight">{nowServing.counter5}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-slate-300">
              <span className="text-slate-400">Next in broadcast chime:</span>
              <span className="font-semibold text-teal-300">{nowServing.nextInLine}</span>
            </div>

            <button
              onClick={() => {
                onNotify?.(
                  'Public Announcement Chime',
                  `Audible broadcast triggered: "${nowServing.nextInLine}"`,
                  'triage'
                );
              }}
              className="w-full mt-1 h-9 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Volume2 className="w-4 h-4" />
              <span>Broadcast Next Chime</span>
            </button>
          </div>

          {/* Quick Walk-In Registration Card */}
          <div className="p-5 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-teal-50 text-[#005c65]">
                  <Plus className="w-4 h-4" />
                </span>
                <span className="text-base text-slate-900 font-bold">Fast-Track Intake</span>
              </div>
              <span className="text-xs text-slate-400">Step 1 of 2</span>
            </div>

            <form onSubmit={handleQuickIntakeSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-slate-600 font-semibold mb-1">National ID / MRN</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Scan barcode or enter MRN-..."
                    value={intakeForm.mrn}
                    onChange={(e) => setIntakeForm({ ...intakeForm, mrn: e.target.value })}
                    className="w-full h-9 pl-3 pr-9 bg-slate-50 text-slate-900 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                  />
                  <QrCode className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 font-semibold mb-1">Full Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="First &amp; Last Name"
                  value={intakeForm.fullName}
                  onChange={(e) => setIntakeForm({ ...intakeForm, fullName: e.target.value })}
                  className="w-full h-9 px-3 bg-slate-50 text-slate-900 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 font-semibold mb-1">Intake Classification</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['OPD Visit', 'Lab / Rad', 'Triage ER'] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setIntakeForm({ ...intakeForm, intakeType: type })}
                      className={`p-2 rounded-lg text-center text-xs font-semibold transition-all border ${
                        intakeForm.intakeType === type
                          ? 'bg-[#005c65] text-white border-[#005c65]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 font-semibold mb-1">Assigned Department</label>
                <select
                  value={intakeForm.department}
                  onChange={(e) => setIntakeForm({ ...intakeForm, department: e.target.value })}
                  className="w-full h-9 px-3 bg-slate-50 text-slate-900 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                >
                  <option value="General Dental & Diagnostics">General Dental &amp; Diagnostics</option>
                  <option value="Oral & Maxillofacial Surgery">Oral &amp; Maxillofacial Surgery</option>
                  <option value="Pediatric Dental Care">Pediatric Dental Care</option>
                  <option value="Emergency Dental Triage">Emergency Dental Triage</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-1 h-10 rounded-lg bg-[#005c65] hover:bg-[#007782] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Generate Token &amp; Wristband</span>
              </button>
            </form>
          </div>

          {/* Visitor RFID Badge Management Box */}
          <div className="p-5 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-blue-50 text-blue-700">
                  <CreditCard className="w-4 h-4" />
                </span>
                <span className="text-base text-slate-900 font-bold">Visitor Passes Active</span>
              </div>
              <span className="text-xs font-bold text-blue-700">38 Issued</span>
            </div>
            <p className="text-xs text-slate-500">
              Tap NFC card on USB scanner to log visitor entry into restricted inpatient towers.
            </p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Radio className="w-4 h-4 text-teal-600" />
                <span>RFID Reader: <strong>Ready (USB Port 3)</strong></span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: New Check-In Modal */}
      <AnimatePresence>
        {checkInModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setCheckInModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 16 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-4 sm:p-6 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#005c65] flex items-center justify-center">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Direct Patient Check-In</h3>
                      <p className="text-xs text-slate-500">Issue queue token and notify attending clinician</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCheckInModalOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 pt-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Patient Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ronald Vance"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Appointment Type</label>
                      <select className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900">
                        <option>Scheduled Consult</option>
                        <option>Follow-up Suture Removal</option>
                        <option>Diagnostics / CT Scan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Assign Room</label>
                      <select className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900">
                        <option>Suite 101 - Dr. Vance</option>
                        <option>Suite 204 - Dr. Rostova</option>
                        <option>Operatory 3 - Dr. Patel</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setCheckInModalOpen(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setCheckInModalOpen(false);
                        onNotify?.('Check-In Completed', 'Token generated and sent to SMS + Lobby Board', 'triage');
                      }}
                      className="px-5 py-2 bg-[#005c65] text-white rounded-lg text-sm font-semibold hover:bg-[#007782]"
                    >
                      Confirm &amp; Issue Token
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* MODAL: Issue Visitor RFID */}
      <AnimatePresence>
        {visitorModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setVisitorModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-4 sm:p-6 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <FileBadge className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Issue Visitor RFID Pass</h3>
                    <p className="text-xs text-slate-500">Security clearance for inpatient and recovery floor visits</p>
                  </div>
                </div>
                <button
                  onClick={() => setVisitorModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleIssueVisitorSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Visitor Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Verma"
                    value={visitorForm.visitorName}
                    onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Visiting Patient</label>
                  <input
                    type="text"
                    value={visitorForm.patientMRN}
                    onChange={(e) => setVisitorForm({ ...visitorForm, patientMRN: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Relationship</label>
                    <select
                      value={visitorForm.relationship}
                      onChange={(e) => setVisitorForm({ ...visitorForm, relationship: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                    >
                      <option value="Family Member">Family Member</option>
                      <option value="Spouse / Partner">Spouse / Partner</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Caregiver">Caregiver</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Access Tower</label>
                    <select
                      value={visitorForm.tower}
                      onChange={(e) => setVisitorForm({ ...visitorForm, tower: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                    >
                      <option value="ICU Tower Wing C">ICU Tower Wing C</option>
                      <option value="Surgical Floor 2">Surgical Floor 2</option>
                      <option value="Recovery Pavilion">Recovery Pavilion</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setVisitorModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md"
                  >
                    Encode &amp; Issue NFC Badge
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* MODAL: Emergency Walk-In Trigger */}
      <AnimatePresence>
        {emergencyModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setEmergencyModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 16 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-red-200 w-full max-w-md p-4 sm:p-6 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-red-100">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                      <BadgeAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-900">Emergency Walk-In Intake</h3>
                      <p className="text-xs text-red-600">Immediate bypass of standard queue</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEmergencyModalOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-4 space-y-3">
                  <p className="text-sm text-slate-700">
                    Are you dispatching an emergency patient intake? This will generate a <strong>STAT Red Priority Token</strong> and immediately notify Trauma Bay 1.
                  </p>
                  <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs">
                    <strong>Trauma Protocol:</strong> Immediate clinician notification, bypass copay settlement, auto-prepare airway and suction station.
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setEmergencyModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEmergencyWalkIn}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 shadow-md shadow-red-500/20"
                  >
                    Dispatch STAT Emergency Intake
                  </button>
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
};
