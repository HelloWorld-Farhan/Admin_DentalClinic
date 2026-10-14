import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Sparkles,
  PhoneCall,
  UserCheck,
  ArrowRight,
  Clock,
  Activity,
  Layers,
  ChevronDown,
  Stethoscope,
  Check,
  BellRing,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { mockTriageQueue, mockDoctors } from '../data/mockData';
import { TriageItem, TriageAcuity, InsuranceVerificationStatus } from '../types';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ModalPortal } from '../components/ModalPortal';
import { useClinicDB } from '../lib/db';

interface ReceptionProps {
  onNotify?: (title: string, message: string, type: 'critical' | 'financial' | 'triage' | 'system') => void;
  onOpenPowerBI?: () => void;
  onOpenExport?: () => void;
}

// Counter Station Model
interface CounterStation {
  id: string;
  code: string;
  name: string;
  staffName: string;
  staffAvatar: string;
  role: string;
  status: 'Online' | 'Busy' | 'Break' | 'Automated';
  queueLength: number;
  avgHandleTime: string;
  specialty: string;
}

// Initial Staffed Counters
const initialCounters: CounterStation[] = [
  {
    id: 'c-01',
    code: 'C-01 FastTrack',
    name: 'Counter 1 (FastTrack)',
    staffName: 'Elena Torres',
    staffAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    role: 'Senior Triage Nurse',
    status: 'Online',
    queueLength: 2,
    avgHandleTime: '3.2m',
    specialty: 'Rapid Check-In & Priority Triage',
  },
  {
    id: 'c-02',
    code: 'C-02 Insurance',
    name: 'Counter 2 (Insurance)',
    staffName: 'Marcus Vance',
    staffAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80',
    role: 'Billing & Pre-Auth Coordinator',
    status: 'Online',
    queueLength: 4,
    avgHandleTime: '5.1m',
    specialty: 'PPO/HMO Pre-Verification & Copay',
  },
  {
    id: 'c-03',
    code: 'C-03 Specialist',
    name: 'Counter 3 (Specialist)',
    staffName: 'Amina Al-Mansoor',
    staffAvatar: 'https://images.unsplash.com/photo-1594824813512-8877e8a9366e?auto=format&fit=crop&w=256&q=80',
    role: 'Surgical Intake Lead',
    status: 'Online',
    queueLength: 3,
    avgHandleTime: '4.5m',
    specialty: 'Oral Surgery & Maxillofacial Consults',
  },
  {
    id: 'c-04',
    code: 'C-04 Admissions',
    name: 'Counter 4 (Admissions)',
    staffName: 'Amit Zhao',
    staffAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    role: 'Inpatient Admission Officer',
    status: 'Online',
    queueLength: 1,
    avgHandleTime: '6.0m',
    specialty: 'Day-Care & Operating Suite Admissions',
  },
  {
    id: 'c-05',
    code: 'C-05 Cashier',
    name: 'Counter 5 (Cashier)',
    staffName: 'Chloe Bennet',
    staffAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    role: 'Patient Financial Counselor',
    status: 'Online',
    queueLength: 2,
    avgHandleTime: '2.8m',
    specialty: 'Payment Plans & CareCredit Approvals',
  },
  {
    id: 'c-06',
    code: 'C-06 Kiosk',
    name: 'Counter 6 (Kiosk)',
    staffName: 'Self-Service Terminal',
    staffAvatar: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=256&q=80',
    role: 'Automated Check-in Scanner',
    status: 'Automated',
    queueLength: 0,
    avgHandleTime: '1.1m',
    specialty: 'QR Barcode & Digital Pass Scanner',
  },
];

// Rush curve hourly data with rich telemetry
interface RushDataPoint {
  time: string;
  label: string;
  x: number;
  yToday: number;
  yAvg: number;
  inflowRate: number; // patients / hr
  baselineRate: number;
  waitTime: string;
  acuityBreakdown: string;
  status: 'Passed' | 'Active Peak' | 'Upcoming Rush' | 'Evening Stable';
}

const rushPoints: RushDataPoint[] = [
  {
    time: '07:00 AM',
    label: 'Early Shift Start',
    x: 40,
    yToday: 110,
    yAvg: 105,
    inflowRate: 14,
    baselineRate: 16,
    waitTime: '1.8 mins avg wait',
    acuityBreakdown: '100% Routine Diagnostics & Fast Scans',
    status: 'Passed',
  },
  {
    time: '08:30 AM',
    label: 'Morning Inflow Surge',
    x: 120,
    yToday: 60,
    yAvg: 80,
    inflowRate: 38,
    baselineRate: 28,
    waitTime: '3.4 mins avg wait',
    acuityBreakdown: '4 Urgent • 34 Scheduled Restorative',
    status: 'Passed',
  },
  {
    time: '10:00 AM',
    label: 'Morning Maximum Peak',
    x: 210,
    yToday: 20,
    yAvg: 40,
    inflowRate: 58,
    baselineRate: 42,
    waitTime: '5.2 mins peak wait',
    acuityBreakdown: '6 Emergencies (STAT) • 52 Scheduled',
    status: 'Passed',
  },
  {
    time: '11:00 AM',
    label: 'Active Mid-Day Inflow',
    x: 280,
    yToday: 50,
    yAvg: 65,
    inflowRate: 46,
    baselineRate: 36,
    waitTime: '4.2 mins current SLA',
    acuityBreakdown: '2 STAT Trauma • 8 Urgent • 36 Routine',
    status: 'Active Peak',
  },
  {
    time: '01:00 PM',
    label: 'Post-Lunch Surgical Check-in',
    x: 370,
    yToday: 35,
    yAvg: 50,
    inflowRate: 48,
    baselineRate: 39,
    waitTime: '4.5 mins expected wait',
    acuityBreakdown: '5 Urgent Implants • 43 Scheduled',
    status: 'Upcoming Rush',
  },
  {
    time: '03:00 PM',
    label: 'Afternoon Pediatric & Ortho',
    x: 460,
    yToday: 68,
    yAvg: 60,
    inflowRate: 32,
    baselineRate: 30,
    waitTime: '3.1 mins expected wait',
    acuityBreakdown: 'Pediatric Sedation & Aligner Checks',
    status: 'Upcoming Rush',
  },
  {
    time: '05:00 PM',
    label: 'Evening Discharge & Walk-In',
    x: 550,
    yToday: 95,
    yAvg: 85,
    inflowRate: 18,
    baselineRate: 20,
    waitTime: '2.2 mins low wait',
    acuityBreakdown: 'Emergency Night-Call Walk-ins',
    status: 'Evening Stable',
  },
];

// Web Audio API Sound Chimes (Zero external audio assets needed!)
const playLobbyChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First bell tone: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.7);

    // Second bell tone: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.22);
    gain2.gain.setValueAtTime(0.25, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 1.2);
  } catch (err) {
    console.warn('Audio chime omitted', err);
  }
};

const playEmergencyChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [0, 0.2, 0.4].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(987.77, now + delay);
      gain.gain.setValueAtTime(0.22, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.15);
    });
  } catch (err) {
    console.warn('Emergency chime omitted', err);
  }
};

const playNfcBeep = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch (err) {}
};

export const Reception: React.FC<ReceptionProps> = ({ onNotify, onOpenPowerBI, onOpenExport }) => {
  const { doctors, addPatient } = useClinicDB();

  // Queue state
  const [queue, setQueue] = useState<TriageItem[]>(mockTriageQueue);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Waiting' | 'In Triage' | 'With Doctor'>('All');

  // Counters Matrix state
  const [counters, setCounters] = useState<CounterStation[]>(initialCounters);
  const [hoveredCounter, setHoveredCounter] = useState<string | null>(null);

  // Digital Signage Live PA Mirror
  const [nowServing, setNowServing] = useState({
    counter1: '#T-101',
    counter2: '#B-045',
    counter5: '#C-012',
    nextInLine: '#T-102 → Desk 1 (FastTrack)',
  });
  const [isChimeBroadcasting, setIsChimeBroadcasting] = useState(false);
  const [callingTokenId, setCallingTokenId] = useState<string | null>(null);

  // Rush curve hover tracking
  const [hoveredRushIdx, setHoveredRushIdx] = useState<number | null>(3); // Default to 11:00 AM Active

  // Modals state
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [visitorModalOpen, setVisitorModalOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedPrintItem, setSelectedPrintItem] = useState<TriageItem | null>(null);

  // Body scroll lock
  const isAnyModalOpen = Boolean(
    checkInModalOpen || visitorModalOpen || emergencyModalOpen || reassignModalOpen || printModalOpen
  );
  useBodyScrollLock(isAnyModalOpen);

  // 2-Step Fast-Track Form
  const [fastTrackStep, setFastTrackStep] = useState<1 | 2>(1);
  const [intakeForm, setIntakeForm] = useState({
    mrn: '',
    fullName: '',
    phone: '',
    intakeType: 'OPD Visit' as 'OPD Visit' | 'Lab / Rad' | 'Triage ER',
    department: 'General Dental & Diagnostics',
    assignedDoctor: mockDoctors[0]?.name || 'Dr. Marcus Vance',
    acuity: 'Routine' as TriageAcuity,
    insurance: 'Delta Dental Premier',
  });

  // Reassign Counter Form State
  const [selectedStationId, setSelectedStationId] = useState<string>('c-01');
  const [stationForm, setStationForm] = useState({
    staffName: 'Elena Torres',
    role: 'Senior Triage Nurse',
    status: 'Online' as CounterStation['status'],
    specialty: 'Rapid Check-In & Priority Triage',
  });

  // Visitor RFID Form State
  const [visitorForm, setVisitorForm] = useState({
    visitorName: '',
    visitorPhone: '',
    patientMRN: 'MRN-89421 (Ananya Verma)',
    relationship: 'Family Member',
    tower: 'ICU Tower Wing C',
    rfidUID: 'Unassigned',
    isScanning: false,
  });

  // Active Visitor Count
  const [visitorCount, setVisitorCount] = useState(38);

  // Direct Check-In Modal Form
  const [directCheckIn, setDirectCheckIn] = useState({
    name: '',
    mrn: '',
    appointmentType: 'Scheduled Consult',
    assignedDoctor: mockDoctors[0]?.name || 'Dr. Marcus Vance',
    room: 'Suite 101 - Dr. Vance',
    insurance: 'Delta Dental Premier',
    preAuthVerified: true,
  });

  // Filtered Queue Calculation
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

  // Dispatch / Call Patient to Counter Action (properly named, audio chime & animated)
  const handleCallToDesk = (item: TriageItem, counterCode = 'Desk 1 (FastTrack)') => {
    playLobbyChime();
    setCallingTokenId(item.id);

    // Update patient status in queue
    setQueue((prev) =>
      prev.map((q) =>
        q.id === item.id
          ? {
              ...q,
              status: 'In Triage',
              assignedRoom: counterCode.split(' ')[0] || q.assignedRoom,
            }
          : q
      )
    );

    // Update lobby digital signage mirror
    setNowServing((prev) => ({
      ...prev,
      counter1: item.tokenNumber,
      nextInLine: `${item.tokenNumber} → ${counterCode}`,
    }));

    // Trigger visual pulse
    setTimeout(() => {
      setCallingTokenId(null);
    }, 3500);

    onNotify?.(
      'Patient Chime Broadcast',
      `Calling Token ${item.tokenNumber} (${item.patientName}) to ${counterCode} over lobby public speakers`,
      'triage'
    );
  };

  // Broadcast Next Chime button handler
  const handleBroadcastNext = () => {
    playLobbyChime();
    setIsChimeBroadcasting(true);
    setTimeout(() => setIsChimeBroadcasting(false), 2000);

    // Pick next waiting patient
    const nextWaiting = queue.find((q) => q.status === 'Waiting');
    if (nextWaiting) {
      handleCallToDesk(nextWaiting, 'Desk 1 (FastTrack)');
    } else {
      onNotify?.(
        'Public Audio Chime',
        `Chime broadcast sent to main lobby. Next queue slot: ${nowServing.nextInLine}`,
        'triage'
      );
    }
  };

  // Open Wristband Print preview
  const handleOpenPrintWristband = (item: TriageItem) => {
    setSelectedPrintItem(item);
    setPrintModalOpen(true);
  };

  // Submit Fast-Track 2-Step Intake
  const handleFastTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeForm.fullName.trim()) return;

    const tokenNum = `T-${Math.floor(107 + Math.random() * 80)}`;
    const newItem: TriageItem = {
      id: `triage-${Date.now()}`,
      tokenNumber: tokenNum,
      patientName: intakeForm.fullName,
      age: 34,
      gender: 'M',
      arrivalTime: 'Just now',
      chiefComplaint: `${intakeForm.department}: Registered at Front Desk Fast-Track`,
      acuity: intakeForm.intakeType === 'Triage ER' ? 'Immediate' : intakeForm.acuity,
      insuranceStatus: 'Verified',
      insuranceProvider: intakeForm.insurance,
      assignedDoctor: intakeForm.assignedDoctor,
      assignedRoom: 'Consult Suite 101',
      waitTimeMinutes: 1,
      status: 'Waiting',
    };

    setQueue([newItem, ...queue]);

    // Persist to Central Clinic Database so Dashboard & Patients page counters increment live!
    addPatient({
      mrn: intakeForm.mrn || `#MED-${Math.floor(9500 + Math.random() * 400)}`,
      name: intakeForm.fullName,
      age: 34,
      gender: 'M',
      admissionType: intakeForm.intakeType === 'Triage ER' ? 'Emergency' : 'Day-Care',
      attendingPhysician: intakeForm.assignedDoctor,
      department: intakeForm.department,
      acuity: intakeForm.intakeType === 'Triage ER' ? 'Critical' : intakeForm.acuity === 'Urgent' ? 'Urgent' : 'Stable',
      insurance: intakeForm.insurance,
      policyNumber: `POL-${Math.floor(10000000 + Math.random() * 90000000)}`,
      room: 'Lobby Waiting Triage',
      admissionDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      chiefComplaint: `${intakeForm.department} Intake: Fast-Track registered`,
      vitals: { bp: '120/80', hr: 72, spO2: 99, temp: '98.4°F' },
      allergies: ['NKDA'],
      recentProcedures: ['Front-Desk Triage Intake'],
      radiographsAttached: false,
    });

    // Reset Form
    setIntakeForm({
      mrn: '',
      fullName: '',
      phone: '',
      intakeType: 'OPD Visit',
      department: 'General Dental & Diagnostics',
      assignedDoctor: mockDoctors[0]?.name || 'Dr. Marcus Vance',
      acuity: 'Routine',
      insurance: 'Delta Dental Premier',
    });
    setFastTrackStep(1);

    // Open print preview
    setSelectedPrintItem(newItem);
    setPrintModalOpen(true);

    onNotify?.(
      'Token Generated & Printed',
      `Token ${tokenNum} issued for ${newItem.patientName}. Routed to ${newItem.assignedDoctor}`,
      'triage'
    );
  };

  // Submit Code Red Emergency Walk-In Intake
  const handleEmergencyWalkIn = (complaintType: string) => {
    playEmergencyChime();
    const tokenNum = `E-${Math.floor(10 + Math.random() * 89)}`;
    const emergencyItem: TriageItem = {
      id: `triage-stat-${Date.now()}`,
      tokenNumber: tokenNum,
      patientName: 'Emergency Trauma Walk-In (STAT)',
      age: 30,
      gender: 'M',
      arrivalTime: 'STAT 0m ago',
      chiefComplaint: complaintType || 'Acute Mandibular Trauma & Dental Avulsion',
      acuity: 'Immediate',
      insuranceStatus: 'Self-Pay',
      insuranceProvider: 'Emergency Trauma Fast-Bypass',
      assignedDoctor: 'Dr. Tariq Al-Mansoor',
      assignedRoom: 'Trauma Bay 1 (STAT)',
      waitTimeMinutes: 0,
      status: 'In Triage',
    };

    setQueue([emergencyItem, ...queue]);

    // Save to db.ts
    addPatient({
      mrn: `#EMR-${Math.floor(8000 + Math.random() * 1000)}`,
      name: 'Emergency Trauma Walk-In (STAT)',
      age: 30,
      gender: 'M',
      admissionType: 'Emergency',
      attendingPhysician: 'Dr. Tariq Al-Mansoor',
      department: 'Oral & Maxillofacial Trauma',
      acuity: 'Critical',
      insurance: 'Hospital Trauma Emergency Fund',
      policyNumber: 'EMR-STAT-991',
      room: 'Trauma Bay 1',
      admissionDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      chiefComplaint: complaintType,
      vitals: { bp: '142/90', hr: 96, spO2: 98, temp: '99.1°F' },
      allergies: ['Unknown (Emergency Intake)'],
      recentProcedures: ['CDT D7240 STAT Surgical Triage'],
      radiographsAttached: false,
    });

    setEmergencyModalOpen(false);

    onNotify?.(
      'CODE RED: Immediate Trauma Bypass',
      `STAT Emergency Token #${tokenNum} routed directly into Trauma Bay 1 under Dr. Al-Mansoor`,
      'critical'
    );
  };

  // Submit Direct Check-In Modal
  const handleDirectCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directCheckIn.name.trim()) return;

    const tokenNum = `T-${Math.floor(115 + Math.random() * 80)}`;
    const newItem: TriageItem = {
      id: `triage-${Date.now()}`,
      tokenNumber: tokenNum,
      patientName: directCheckIn.name,
      age: 38,
      gender: 'F',
      arrivalTime: 'Just now',
      chiefComplaint: `${directCheckIn.appointmentType}: Checked in at Front Desk`,
      acuity: 'Routine',
      insuranceStatus: directCheckIn.preAuthVerified ? 'Verified' : 'Pending Pre-Auth',
      insuranceProvider: directCheckIn.insurance,
      assignedDoctor: directCheckIn.assignedDoctor,
      assignedRoom: directCheckIn.room,
      waitTimeMinutes: 2,
      status: 'Waiting',
    };

    setQueue([newItem, ...queue]);

    addPatient({
      mrn: directCheckIn.mrn || `#MED-${Math.floor(9600 + Math.random() * 300)}`,
      name: directCheckIn.name,
      age: 38,
      gender: 'F',
      admissionType: 'Scheduled',
      attendingPhysician: directCheckIn.assignedDoctor,
      department: 'Restorative & Implant Dentistry',
      acuity: 'Stable',
      insurance: directCheckIn.insurance,
      policyNumber: `POL-${Math.floor(20000000 + Math.random() * 80000000)}`,
      room: directCheckIn.room,
      admissionDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      chiefComplaint: `${directCheckIn.appointmentType}: Direct admission`,
      vitals: { bp: '118/76', hr: 70, spO2: 99, temp: '98.5°F' },
      allergies: ['None Reported'],
      recentProcedures: ['Scheduled Consult Check-In'],
      radiographsAttached: true,
    });

    setCheckInModalOpen(false);
    setDirectCheckIn({
      name: '',
      mrn: '',
      appointmentType: 'Scheduled Consult',
      assignedDoctor: mockDoctors[0]?.name || 'Dr. Marcus Vance',
      room: 'Suite 101 - Dr. Vance',
      insurance: 'Delta Dental Premier',
      preAuthVerified: true,
    });

    onNotify?.(
      'Check-In Completed',
      `Token #${tokenNum} issued for ${newItem.patientName}. Attending: ${newItem.assignedDoctor}`,
      'triage'
    );
  };

  // Simulate NFC Visitor Badge Tap
  const handleSimulateNfcTap = () => {
    setVisitorForm((prev) => ({ ...prev, isScanning: true }));
    playNfcBeep();
    setTimeout(() => {
      const hexUID = Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .toUpperCase()
          .padStart(2, '0')
      ).join(':');
      setVisitorForm((prev) => ({
        ...prev,
        isScanning: false,
        rfidUID: `UID: ${hexUID}`,
      }));
    }, 600);
  };

  // Issue Visitor Pass Submit
  const handleIssueVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorForm.visitorName.trim()) return;

    setVisitorCount((c) => c + 1);
    setVisitorModalOpen(false);
    onNotify?.(
      'Visitor RFID Pass Issued',
      `RFID Badge #${visitorForm.rfidUID !== 'Unassigned' ? visitorForm.rfidUID : 'VIS-' + Math.floor(1000 + Math.random() * 9000)} activated for ${visitorForm.visitorName} (${visitorForm.tower})`,
      'system'
    );
  };

  // Open Reassign Modal for specific counter
  const handleOpenReassignModal = (stationId?: string) => {
    const target = counters.find((c) => c.id === (stationId || selectedStationId)) || counters[0];
    setSelectedStationId(target.id);
    setStationForm({
      staffName: target.staffName,
      role: target.role,
      status: target.status,
      specialty: target.specialty,
    });
    setReassignModalOpen(true);
  };

  // Save Counter Reassignment
  const handleSaveCounterReassignment = (e: React.FormEvent) => {
    e.preventDefault();
    setCounters((prev) =>
      prev.map((c) =>
        c.id === selectedStationId
          ? {
              ...c,
              staffName: stationForm.staffName,
              role: stationForm.role,
              status: stationForm.status,
              specialty: stationForm.specialty,
            }
          : c
      )
    );
    setReassignModalOpen(false);
    onNotify?.(
      'Counter Reassignment Saved',
      `Updated ${selectedStationId.toUpperCase()} personnel to ${stationForm.staffName} (${stationForm.role})`,
      'system'
    );
  };

  // Acuity Badge Helper
  const getAcuityPill = (acuity: TriageAcuity) => {
    switch (acuity) {
      case 'Immediate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> Urgent Level 1 (STAT)
          </span>
        );
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> Urgent Level 2
          </span>
        );
      case 'Routine':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" /> Standard Care
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* ============================================================ */}
      {/* 1. HEADER & TOP QUICK ACTION BAR                            */}
      {/* ============================================================ */}
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

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenPowerBI && (
            <button
              onClick={onOpenPowerBI}
              className="flex items-center gap-2 px-3.5 h-10 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-semibold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Radio className="w-4 h-4 text-amber-600" />
              <span>Queue Analytics (Power BI)</span>
            </button>
          )}

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-2 px-3.5 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Export Triage Log</span>
            </button>
          )}

          {/* Issue Visitor RFID */}
          <button
            onClick={() => setVisitorModalOpen(true)}
            className="flex items-center gap-2 px-3.5 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileBadge className="w-4 h-4 text-blue-600" />
            <span>Issue Visitor RFID</span>
          </button>

          {/* Emergency Walk-In (Code Red) */}
          <button
            onClick={() => setEmergencyModalOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] border border-red-200 animate-pulse"
          >
            <BadgeAlert className="w-4 h-4 text-red-600" />
            <span>Emergency Walk-In</span>
          </button>

          {/* New Check-In */}
          <button
            onClick={() => setCheckInModalOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-xl bg-[#005c65] hover:bg-[#007782] text-white text-xs font-bold shadow-md shadow-[#005c65]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Check-In</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. OPERATIONAL TELEMETRY BAR (4 KPI Bento Cards)            */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Scheduled Today */}
        <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Total Scheduled Today
            </span>
            <span className="p-2 rounded-xl bg-teal-50 text-[#005c65] group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">348</span>
              <span className="text-xs text-teal-600 font-semibold">+18% vs yesterday</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-50">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#005c65]" /> Completed: <strong className="text-slate-800">215</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Lobby: <strong className="text-slate-800">{queue.length + 36}</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" /> No-Show: <strong className="text-slate-800">14</strong>
            </span>
          </div>
        </div>

        {/* KPI 2: Lobby Occupancy Gauge */}
        <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all group">
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
            <div className="bg-[#005c65] h-full rounded-full transition-all duration-500" style={{ width: '68%' }} />
          </div>
        </div>

        {/* KPI 3: Average Check-In Wait */}
        <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Average Check-In Wait
            </span>
            <span className="p-2 rounded-xl bg-teal-50 text-[#005c65] group-hover:scale-110 transition-transform">
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
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-50">
            <span>Triage Intake: <strong className="text-slate-800">2.8m</strong></span>
            <span>Registration: <strong className="text-slate-800">1.4m</strong></span>
          </div>
        </div>

        {/* KPI 4: Counter Staffing Status */}
        <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Counter Staffing</span>
            <span className="flex items-center gap-1 text-teal-600 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" /> 100% ONLINE
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {counters.filter((c) => c.status === 'Online' || c.status === 'Automated').length} / 6
              </span>
              <span className="text-sm text-slate-500">Counters Open</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            {counters.map((c) => (
              <span
                key={c.id}
                className={`h-2 flex-1 rounded-full transition-all ${
                  c.status === 'Online'
                    ? 'bg-[#005c65]'
                    : c.status === 'Automated'
                    ? 'bg-blue-600'
                    : 'bg-amber-400'
                }`}
                title={`${c.name} - ${c.staffName} (${c.status})`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. PATIENT ARRIVAL RUSH CURVE & COUNTER MATRIX             */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Hourly Arrival Curve Chart (7 Cols) */}
        <div className="xl:col-span-7 p-5 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
            <div>
              <span className="text-base text-slate-900 font-bold block">Patient Arrival Rush Curve</span>
              <span className="text-xs text-slate-500">
                Real-time arrival volume tracking compared with historical Monday baseline (Hover points for details)
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

          {/* Interactive Wave SVG Visualization */}
          <div className="w-full h-44 pt-2 relative">
            <svg
              className="w-full h-full overflow-visible cursor-crosshair"
              preserveAspectRatio="none"
              viewBox="0 0 600 130"
              onMouseLeave={() => setHoveredRushIdx(3)} // Return to 11:00 AM Active
            >
              <defs>
                <linearGradient id="rushTealGradInteractive" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#007782" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#007782" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line stroke="#F1F5F9" strokeDasharray="3,3" x1="0" x2="600" y1="30" y2="30" />
              <line stroke="#F1F5F9" strokeDasharray="3,3" x1="0" x2="600" y1="70" y2="70" />
              <line stroke="#F1F5F9" strokeDasharray="3,3" x1="0" x2="600" y1="110" y2="110" />

              {/* Baseline Trend Curve */}
              <path
                d="M0,105 Q60,95 120,60 T240,40 T360,75 T480,48 T600,85"
                fill="none"
                stroke="#CBD5E1"
                strokeDasharray="4,4"
                strokeWidth="2"
              />

              {/* Today's Inflow Curve Fill */}
              <path
                d="M0,110 Q50,90 100,55 T200,20 T300,60 T400,35 T500,70 T600,90 L600,130 L0,130 Z"
                fill="url(#rushTealGradInteractive)"
              />

              {/* Today's Inflow Stroke */}
              <path
                d="M0,110 Q50,90 100,55 T200,20 T300,60 T400,35 T500,70 T600,90"
                fill="none"
                stroke="#007782"
                strokeLinecap="round"
                strokeWidth="3.2"
              />

              {/* Interactive Scanning Guideline & Hover Point */}
              {hoveredRushIdx !== null && rushPoints[hoveredRushIdx] && (
                <g>
                  {/* Vertical Scanner Guideline */}
                  <line
                    x1={rushPoints[hoveredRushIdx].x}
                    x2={rushPoints[hoveredRushIdx].x}
                    y1={10}
                    y2={125}
                    stroke="#007782"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                    className="transition-all duration-150"
                  />
                  {/* Outer Pulsing Aura */}
                  <circle
                    cx={rushPoints[hoveredRushIdx].x}
                    cy={rushPoints[hoveredRushIdx].yToday}
                    r="12"
                    fill="#007782"
                    opacity="0.25"
                    className="animate-ping"
                  />
                  {/* Point Ring */}
                  <circle
                    cx={rushPoints[hoveredRushIdx].x}
                    cy={rushPoints[hoveredRushIdx].yToday}
                    r="6"
                    fill="#005c65"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                </g>
              )}

              {/* Invisible touch/hover trigger columns for each time point */}
              {rushPoints.map((pt, idx) => (
                <rect
                  key={pt.time}
                  x={pt.x - 30}
                  y={0}
                  width={60}
                  height={130}
                  fill="transparent"
                  onMouseEnter={() => setHoveredRushIdx(idx)}
                />
              ))}
            </svg>

            {/* Floating Glassmorphic Hover Telemetry Card */}
            {hoveredRushIdx !== null && rushPoints[hoveredRushIdx] && (
              <div
                className="absolute top-2 z-20 pointer-events-none transition-all duration-200"
                style={{
                  left: `${Math.min(Math.max((rushPoints[hoveredRushIdx].x / 600) * 100 - 15, 2), 65)}%`,
                }}
              >
                <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700/60 text-xs w-64">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="font-bold text-teal-300">{rushPoints[hoveredRushIdx].time}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        rushPoints[hoveredRushIdx].status === 'Active Peak'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 animate-pulse'
                          : rushPoints[hoveredRushIdx].status === 'Upcoming Rush'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rushPoints[hoveredRushIdx].status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 my-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Today Inflow</span>
                      <strong className="text-white text-sm">
                        {rushPoints[hoveredRushIdx].inflowRate}{' '}
                        <span className="text-[10px] font-normal text-slate-400">pat/hr</span>
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Monday Baseline</span>
                      <strong className="text-slate-300 text-sm">
                        {rushPoints[hoveredRushIdx].baselineRate}{' '}
                        <span className="text-[10px] font-normal text-slate-400">pat/hr</span>
                      </strong>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-300 border-t border-slate-800/80 pt-1.5 space-y-0.5">
                    <p>
                      ⏱ <strong>Wait SLA:</strong> {rushPoints[hoveredRushIdx].waitTime}
                    </p>
                    <p className="text-teal-200/90 truncate">
                      🩺 <strong>Acuity:</strong> {rushPoints[hoveredRushIdx].acuityBreakdown}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time axis footer */}
          <div className="flex justify-between items-center text-xs text-slate-500 pt-2 px-1 border-t border-slate-100">
            {rushPoints.map((pt, idx) => (
              <button
                key={pt.time}
                onClick={() => setHoveredRushIdx(idx)}
                onMouseEnter={() => setHoveredRushIdx(idx)}
                className={`transition-colors ${
                  hoveredRushIdx === idx ? 'text-[#005c65] font-bold' : 'hover:text-slate-800'
                }`}
              >
                {pt.time}
              </button>
            ))}
          </div>
        </div>

        {/* Counter Station Status Matrix (5 Cols) */}
        <div className="xl:col-span-5 p-5 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <div>
              <span className="text-base text-slate-900 font-bold block">Front Counter Allocation</span>
              <span className="text-xs text-slate-500">Live station load &amp; assigned personnel</span>
            </div>
            <button
              onClick={() => handleOpenReassignModal()}
              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#005c65] text-xs font-bold transition-all shadow-sm"
            >
              Reassign Staff
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {counters.map((c) => {
              const isHovered = hoveredCounter === c.id;
              return (
                <div
                  key={c.id}
                  onMouseEnter={() => setHoveredCounter(c.id)}
                  onMouseLeave={() => setHoveredCounter(null)}
                  onClick={() => handleOpenReassignModal(c.id)}
                  className={`p-3 rounded-xl transition-all cursor-pointer border relative group ${
                    c.status === 'Automated'
                      ? 'bg-blue-50/60 border-blue-100 hover:border-blue-300'
                      : 'bg-slate-50 hover:bg-white border-slate-100 hover:border-teal-300 hover:shadow-md'
                  } ${isHovered ? 'scale-[1.02]' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold truncate ${
                        c.status === 'Automated' ? 'text-blue-700' : 'text-slate-900'
                      }`}
                    >
                      {c.code}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        c.status === 'Online'
                          ? 'bg-teal-500 animate-pulse'
                          : c.status === 'Automated'
                          ? 'bg-blue-600'
                          : 'bg-amber-400'
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 my-1">
                    <img
                      src={c.staffAvatar}
                      alt={c.staffName}
                      className="w-5 h-5 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-xs text-slate-700 font-medium truncate">{c.staffName}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[10px]">
                    <span className="text-slate-400">Queue:</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold ${
                        c.status === 'Automated' ? 'bg-blue-600 text-white' : 'bg-[#005c65] text-white'
                      }`}
                    >
                      {c.status === 'Automated' ? '62 Today' : `${c.queueLength} pat.`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. PRIMARY WORKSPACE: LIVE TRIAGE QUEUE & SIDE PANELS        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Queue & Check-In Table Area (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col gap-4">
            {/* Table Controls & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['All', 'Waiting', 'In Triage', 'With Doctor'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === tab
                        ? 'bg-[#005c65] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {tab} ({tab === 'All' ? queue.length : queue.filter((q) => q.status === tab).length})
                  </button>
                ))}
              </div>

              {/* Search & Priority Selector */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search queue..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-8 pr-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#005c65] w-36 sm:w-44"
                  />
                </div>

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
                  onClick={() => {
                    playLobbyChime();
                    onNotify?.('Queue Refreshed', 'Telemetry sync updated 42 waiting admissions', 'system');
                  }}
                  className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
                  title="Refresh Live Queue"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Queue Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left border-collapse">
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
                          <p className="text-xs text-slate-400">
                            No patients currently match the active tab &ldquo;{activeTab}&rdquo; or filter query
                          </p>
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
                      const isCurrentlyCalling = callingTokenId === item.id;
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isUrgent ? 'bg-red-50/40' : ''
                          } ${isCurrentlyCalling ? 'bg-teal-50/80 ring-1 ring-teal-400' : ''}`}
                        >
                          {/* Token & Time */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span
                                className={`font-bold font-mono text-sm ${
                                  isUrgent ? 'text-red-700' : 'text-[#005c65]'
                                }`}
                              >
                                {item.tokenNumber}
                              </span>
                              <span className="text-xs text-slate-400">{item.arrivalTime}</span>
                            </div>
                          </td>

                          {/* Patient Profile */}
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

                          {/* Department & Doctor */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-slate-800 line-clamp-1">
                                {item.chiefComplaint}
                              </span>
                              <span className="text-xs text-blue-600 font-semibold">{item.assignedDoctor}</span>
                            </div>
                          </td>

                          {/* Acuity Level */}
                          <td className="py-3 px-3">{getAcuityPill(item.acuity)}</td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                isCurrentlyCalling
                                  ? 'bg-teal-600 text-white animate-pulse'
                                  : item.status === 'Waiting'
                                  ? 'bg-amber-100 text-amber-800'
                                  : item.status === 'In Triage'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-teal-100 text-teal-800'
                              }`}
                            >
                              {isCurrentlyCalling
                                ? 'Calling to Desk...'
                                : `${item.status} (${item.waitTimeMinutes}m wait)`}
                            </span>
                          </td>

                          {/* Insurance Pre-Check */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1 text-teal-700 text-xs font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[130px]">{item.insuranceProvider}</span>
                            </div>
                          </td>

                          {/* Quick Action Button: Properly Named & Fully Interactive */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Call to Desk Button (renamed from Call C-01) */}
                              <button
                                onClick={() => handleCallToDesk(item, 'Desk 1 (FastTrack)')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                  isCurrentlyCalling
                                    ? 'bg-teal-600 text-white scale-105 shadow-md shadow-teal-500/20'
                                    : 'bg-[#005c65] text-white hover:bg-[#007782] active:scale-95'
                                }`}
                                title="Call patient to receptionist counter over public lobby sound system"
                              >
                                <Volume2 className={`w-3.5 h-3.5 ${isCurrentlyCalling ? 'animate-bounce' : ''}`} />
                                <span>{isCurrentlyCalling ? 'Calling...' : 'Call to Desk'}</span>
                              </button>

                              {/* Print Thermal Wristband / Ticket */}
                              <button
                                onClick={() => handleOpenPrintWristband(item)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                                title="Print Thermal Wristband & Queue Token Ticket"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 gap-2">
              <span>Showing {filteredQueue.length} active triage tickets</span>
              <span className="text-[#005c65] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Audio Triage PA Dispatch Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Panel: Digital Signage Mirror & Fast-Track (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* Digital Signage Lobby Display Mirror */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-xl flex flex-col gap-3 relative overflow-hidden border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-400 animate-ping" />
                <span className="text-xs uppercase tracking-wider font-bold text-teal-400">
                  Lobby Signage Display #01
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">11:00 AM</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider block mb-2 font-semibold">
                Now Serving on Public Speakers
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-[#005c65] text-white shadow-sm">
                  <span className="block text-[10px] opacity-80 font-medium">Counter 1</span>
                  <span className="text-base sm:text-lg font-bold font-mono tracking-tight">
                    {nowServing.counter1}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-700/80 text-white">
                  <span className="block text-[10px] opacity-80 font-medium">Counter 2</span>
                  <span className="text-base sm:text-lg font-bold font-mono tracking-tight">
                    {nowServing.counter2}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-700/80 text-white">
                  <span className="block text-[10px] opacity-80 font-medium">Counter 5</span>
                  <span className="text-base sm:text-lg font-bold font-mono tracking-tight">
                    {nowServing.counter5}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-slate-300">
              <span className="text-slate-400">Next in broadcast chime:</span>
              <span className="font-semibold text-teal-300 truncate max-w-[180px]">{nowServing.nextInLine}</span>
            </div>

            {/* Broadcast Next Chime Button */}
            <button
              onClick={handleBroadcastNext}
              className={`w-full mt-1 h-10 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                isChimeBroadcasting
                  ? 'bg-teal-500 scale-[1.02] shadow-teal-500/30'
                  : 'bg-teal-600 hover:bg-teal-500'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isChimeBroadcasting ? 'animate-bounce' : ''}`} />
              <span>{isChimeBroadcasting ? 'Broadcasting Audio Chime...' : 'Broadcast Next Chime'}</span>
            </button>
          </div>

          {/* Quick Walk-In Registration Card: 2-Step Wizard */}
          <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-50 text-[#005c65]">
                  <Plus className="w-4 h-4" />
                </span>
                <span className="text-base text-slate-900 font-bold">Fast-Track Intake</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                Step {fastTrackStep} of 2
              </span>
            </div>

            <form onSubmit={handleFastTrackSubmit} className="flex flex-col gap-3">
              {fastTrackStep === 1 ? (
                <>
                  {/* Step 1: Patient Identity & Intake Category */}
                  <div>
                    <label className="block text-xs text-slate-600 font-semibold mb-1">National ID / MRN</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Scan barcode or enter MRN-..."
                        value={intakeForm.mrn}
                        onChange={(e) => setIntakeForm({ ...intakeForm, mrn: e.target.value })}
                        className="w-full h-9 pl-3 pr-9 bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setIntakeForm({ ...intakeForm, mrn: `MRN-${Math.floor(91000 + Math.random() * 8000)}` })
                        }
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-teal-700"
                        title="Simulate Barcode Scan"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 font-semibold mb-1">Full Patient Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Richardson"
                      value={intakeForm.fullName}
                      onChange={(e) => setIntakeForm({ ...intakeForm, fullName: e.target.value })}
                      className="w-full h-9 px-3 bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
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
                          className={`p-2 rounded-xl text-center text-xs font-semibold transition-all border ${
                            intakeForm.intakeType === type
                              ? 'bg-[#005c65] text-white border-[#005c65] shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!intakeForm.fullName.trim()) {
                        onNotify?.('Missing Information', 'Please provide the patient full name to proceed.', 'triage');
                        return;
                      }
                      setFastTrackStep(2);
                    }}
                    className="w-full mt-1 h-10 rounded-xl bg-[#005c65] hover:bg-[#007782] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Proceed to Clinical Assignment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  {/* Step 2: Department, Doctor & Insurance */}
                  <div>
                    <label className="block text-xs text-slate-600 font-semibold mb-1">Assigned Department</label>
                    <select
                      value={intakeForm.department}
                      onChange={(e) => setIntakeForm({ ...intakeForm, department: e.target.value })}
                      className="w-full h-9 px-3 bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    >
                      <option value="General Dental & Diagnostics">General Dental &amp; Diagnostics</option>
                      <option value="Oral & Maxillofacial Surgery">Oral &amp; Maxillofacial Surgery</option>
                      <option value="Pediatric Dental Care">Pediatric Dental Care</option>
                      <option value="Emergency Dental Triage">Emergency Dental Triage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 font-semibold mb-1">Attending Clinician</label>
                    <select
                      value={intakeForm.assignedDoctor}
                      onChange={(e) => setIntakeForm({ ...intakeForm, assignedDoctor: e.target.value })}
                      className="w-full h-9 px-3 bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    >
                      {doctors.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.specialty})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 font-semibold mb-1">Insurance Provider</label>
                    <select
                      value={intakeForm.insurance}
                      onChange={(e) => setIntakeForm({ ...intakeForm, insurance: e.target.value })}
                      className="w-full h-9 px-3 bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    >
                      <option value="Delta Dental Premier">Delta Dental Premier</option>
                      <option value="MetLife Dental">MetLife Dental</option>
                      <option value="Cigna Dental Health">Cigna Dental Health</option>
                      <option value="Guardian DentalGuard">Guardian DentalGuard</option>
                      <option value="Self-Pay / CareCredit">Self-Pay / CareCredit</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setFastTrackStep(1)}
                      className="w-1/3 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 h-10 rounded-xl bg-[#005c65] hover:bg-[#007782] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Issue Token &amp; Ticket</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Visitor RFID Badge Management Box */}
          <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                  <CreditCard className="w-4 h-4" />
                </span>
                <span className="text-base text-slate-900 font-bold">Visitor Passes Active</span>
              </div>
              <span className="text-xs font-bold text-blue-700">{visitorCount} Issued</span>
            </div>
            <p className="text-xs text-slate-500">
              Tap NFC card on USB scanner to log visitor entry into restricted inpatient towers.
            </p>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Radio className="w-4 h-4 text-teal-600 animate-pulse" />
                <span>
                  RFID Reader: <strong>Ready (USB Port 3)</strong>
                </span>
              </div>
              <button
                onClick={() => setVisitorModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-sm"
              >
                + Issue Pass
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. MODAL: REASSIGN COUNTER STAFF MODAL                      */}
      {/* ============================================================ */}
      <AnimatePresence>
        {reassignModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setReassignModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 16 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-5 sm:p-6 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#005c65] flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Reassign Counter Personnel</h3>
                      <p className="text-xs text-slate-500">Live rotation of reception staff across intake desks</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReassignModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCounterReassignment} className="space-y-4 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Counter Station</label>
                    <select
                      value={selectedStationId}
                      onChange={(e) => {
                        const sId = e.target.value;
                        setSelectedStationId(sId);
                        const match = counters.find((c) => c.id === sId);
                        if (match) {
                          setStationForm({
                            staffName: match.staffName,
                            role: match.role,
                            status: match.status,
                            specialty: match.specialty,
                          });
                        }
                      }}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    >
                      {counters.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} — Currently: {c.staffName} ({c.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Staff Member</label>
                    <select
                      value={stationForm.staffName}
                      onChange={(e) => setStationForm({ ...stationForm, staffName: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900"
                    >
                      <option value="Elena Torres">Elena Torres (Senior Triage Lead)</option>
                      <option value="Marcus Vance">Marcus Vance (Insurance Coordinator)</option>
                      <option value="Amina Al-Mansoor">Amina Al-Mansoor (Surgical Intake Specialist)</option>
                      <option value="Amit Zhao">Amit Zhao (Inpatient Admission Officer)</option>
                      <option value="Chloe Bennet">Chloe Bennet (Financial Counselor)</option>
                      <option value="Jessica Liu">Jessica Liu (Registered Dental Hygienist)</option>
                      <option value="Self-Service Terminal">Self-Service Terminal (Automated)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Station Status</label>
                      <select
                        value={stationForm.status}
                        onChange={(e) =>
                          setStationForm({ ...stationForm, status: e.target.value as CounterStation['status'] })
                        }
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                      >
                        <option value="Online">Online &amp; Active</option>
                        <option value="Busy">Busy (In Case)</option>
                        <option value="Break">Meal / Rest Break</option>
                        <option value="Automated">Automated Kiosk</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Duty / Focus</label>
                      <input
                        type="text"
                        value={stationForm.specialty}
                        onChange={(e) => setStationForm({ ...stationForm, specialty: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                        placeholder="e.g. Priority Check-In"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setReassignModalOpen(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#005c65] text-white rounded-xl text-sm font-bold hover:bg-[#007782] shadow-md shadow-[#005c65]/20"
                    >
                      Save Counter Assignment
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 6. MODAL: THERMAL WRISTBAND & QUEUE TICKET PREVIEW MODAL    */}
      {/* ============================================================ */}
      <AnimatePresence>
        {printModalOpen && selectedPrintItem && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setPrintModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 16 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-5 sm:p-6 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#005c65] flex items-center justify-center">
                      <Printer className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Thermal Wristband &amp; Token</h3>
                      <p className="text-xs text-slate-500">Zebra ZD510 Direct Thermal Print Output</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPrintModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Simulated Hospital Thermal Queue Ticket */}
                <div className="my-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 font-mono text-slate-800 flex flex-col gap-3 shadow-inner">
                  <div className="text-center border-b border-dashed border-slate-300 pb-2">
                    <h4 className="font-bold text-slate-900 text-sm tracking-wider uppercase">SMILE CLINIC SURGICAL CENTER</h4>
                    <p className="text-[10px] text-slate-500 font-sans">Central Reception • 742 Evergreen Suite</p>
                  </div>

                  <div className="text-center py-2">
                    <span className="text-xs text-slate-500 font-sans block">YOUR TRIAGE TOKEN</span>
                    <span className="text-4xl font-extrabold text-[#005c65] tracking-tight">
                      {selectedPrintItem.tokenNumber}
                    </span>
                    <span className="text-[11px] text-slate-600 block mt-1 font-sans">
                      Est. Wait: <strong>{selectedPrintItem.waitTimeMinutes} Minutes</strong>
                    </span>
                  </div>

                  <div className="text-xs border-t border-dashed border-slate-300 pt-2 space-y-1 font-sans">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Patient:</span>
                      <strong className="text-slate-900">{selectedPrintItem.patientName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Attending:</span>
                      <span className="text-blue-700 font-semibold">{selectedPrintItem.assignedDoctor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Room:</span>
                      <span>{selectedPrintItem.assignedRoom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Insurance:</span>
                      <span>{selectedPrintItem.insuranceProvider}</span>
                    </div>
                  </div>

                  {/* Simulated 1D Barcode */}
                  <div className="pt-2 text-center border-t border-dashed border-slate-300">
                    <div className="h-9 flex items-center justify-center gap-0.5 opacity-80">
                      {[...Array(48)].map((_, i) => (
                        <span
                          key={i}
                          className="bg-slate-900 h-full inline-block"
                          style={{ width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1px' : '2px' }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono tracking-widest block mt-1">
                      *{selectedPrintItem.tokenNumber}-SMILE*
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setPrintModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                  >
                    Close Preview
                  </button>
                  <button
                    onClick={() => {
                      setPrintModalOpen(false);
                      onNotify?.(
                        'Direct Print Dispatched',
                        `Sent thermal slip for Token ${selectedPrintItem.tokenNumber} (${selectedPrintItem.patientName}) to Reception Thermal Printer`,
                        'system'
                      );
                    }}
                    className="px-5 py-2 bg-[#005c65] text-white rounded-xl text-xs font-bold hover:bg-[#007782] shadow-sm flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Send to Zebra ZD510 Printer</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 7. MODAL: NEW DIRECT CHECK-IN MODAL                         */}
      {/* ============================================================ */}
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
                className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-5 sm:p-6 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#005c65] flex items-center justify-center">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Direct Patient Check-In</h3>
                      <p className="text-xs text-slate-500">Issue queue token and notify attending clinician</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCheckInModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleDirectCheckInSubmit} className="space-y-4 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ronald Vance"
                      value={directCheckIn.name}
                      onChange={(e) => setDirectCheckIn({ ...directCheckIn, name: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Type</label>
                      <select
                        value={directCheckIn.appointmentType}
                        onChange={(e) => setDirectCheckIn({ ...directCheckIn, appointmentType: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                      >
                        <option>Scheduled Consult</option>
                        <option>Follow-up Suture Removal</option>
                        <option>Diagnostics / 3D CT Scan</option>
                        <option>Permanent Crown Delivery</option>
                        <option>Emergency Toothache Walk-in</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Clinician &amp; Room</label>
                      <select
                        value={directCheckIn.assignedDoctor}
                        onChange={(e) => setDirectCheckIn({ ...directCheckIn, assignedDoctor: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                      >
                        {doctors.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name} ({d.room})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Insurance Carrier</label>
                    <select
                      value={directCheckIn.insurance}
                      onChange={(e) => setDirectCheckIn({ ...directCheckIn, insurance: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                    >
                      <option value="Delta Dental Premier">Delta Dental Premier</option>
                      <option value="MetLife Dental">MetLife Dental</option>
                      <option value="Cigna Dental Health">Cigna Dental Health</option>
                      <option value="Guardian DentalGuard">Guardian DentalGuard</option>
                      <option value="Self-Pay / CareCredit">Self-Pay / CareCredit</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="preAuthCheck"
                      checked={directCheckIn.preAuthVerified}
                      onChange={(e) => setDirectCheckIn({ ...directCheckIn, preAuthVerified: e.target.checked })}
                      className="w-4 h-4 text-[#005c65] rounded border-slate-300 focus:ring-[#005c65]"
                    />
                    <label htmlFor="preAuthCheck" className="text-xs text-slate-600 font-medium cursor-pointer">
                      Insurance Pre-Authorization &amp; Photo ID Verified
                    </label>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCheckInModalOpen(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#005c65] text-white rounded-xl text-sm font-bold hover:bg-[#007782] shadow-md shadow-[#005c65]/20"
                    >
                      Confirm Check-In &amp; Issue Token
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 8. MODAL: ISSUE VISITOR RFID PASS                           */}
      {/* ============================================================ */}
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
                className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-5 sm:p-6 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <FileBadge className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Issue Visitor RFID Pass</h3>
                      <p className="text-xs text-slate-500">Security clearance for inpatient and recovery floor visits</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setVisitorModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleIssueVisitorSubmit} className="space-y-4 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Verma"
                      value={visitorForm.visitorName}
                      onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Visiting Inpatient</label>
                    <input
                      type="text"
                      value={visitorForm.patientMRN}
                      onChange={(e) => setVisitorForm({ ...visitorForm, patientMRN: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                      <select
                        value={visitorForm.relationship}
                        onChange={(e) => setVisitorForm({ ...visitorForm, relationship: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                      >
                        <option value="Family Member">Family Member</option>
                        <option value="Spouse / Partner">Spouse / Partner</option>
                        <option value="Legal Guardian">Legal Guardian</option>
                        <option value="Caregiver">Caregiver</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Access Tower</label>
                      <select
                        value={visitorForm.tower}
                        onChange={(e) => setVisitorForm({ ...visitorForm, tower: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                      >
                        <option value="ICU Tower Wing C">ICU Tower Wing C</option>
                        <option value="Surgical Floor 2">Surgical Floor 2</option>
                        <option value="Recovery Pavilion">Recovery Pavilion</option>
                      </select>
                    </div>
                  </div>

                  {/* RFID Scanner Simulator Card */}
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-blue-900 block">NFC / RFID Card Hardware:</span>
                      <span className="text-[11px] text-blue-700 font-mono">
                        {visitorForm.isScanning ? 'Reading RFID Tag...' : visitorForm.rfidUID}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSimulateNfcTap}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Tap RFID Card</span>
                    </button>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setVisitorModalOpen(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md"
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

      {/* ============================================================ */}
      {/* 9. MODAL: EMERGENCY WALK-IN INTAKE (CODE RED)               */}
      {/* ============================================================ */}
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
                className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-red-200 w-full max-w-md p-5 sm:p-6 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-red-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                      <BadgeAlert className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-900">Emergency Walk-In Intake</h3>
                      <p className="text-xs text-red-600">Immediate bypass of standard queue</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEmergencyModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-4 space-y-3">
                  <p className="text-xs text-slate-600">
                    Select acute presentation to immediately dispatch a <strong>STAT Red Priority Token</strong> and
                    auto-assign Trauma Bay 1:
                  </p>

                  <div className="space-y-2">
                    {[
                      {
                        title: 'Mandibular Fracture & Facial Trauma',
                        desc: 'Bicycle or vehicular trauma, displacement',
                      },
                      {
                        title: 'Severe Throbbing Abscess & Facial Cellulitis',
                        desc: 'Submandibular swelling, airway precaution',
                      },
                      {
                        title: 'Avulsed Permanent Incisor (Golden Hour)',
                        desc: 'Tooth knocked out within past 60 minutes',
                      },
                      {
                        title: 'Uncontrolled Post-Op Hemorrhage',
                        desc: 'Continuous bleeding after wisdom teeth surgery',
                      },
                    ].map((em) => (
                      <button
                        key={em.title}
                        type="button"
                        onClick={() => handleEmergencyWalkIn(em.title)}
                        className="w-full p-3 rounded-xl bg-red-50/70 hover:bg-red-100 border border-red-100 text-left transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col"
                      >
                        <strong className="text-xs text-red-900">{em.title}</strong>
                        <span className="text-[11px] text-red-700/80">{em.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs border border-red-200">
                    <strong>Trauma Protocol:</strong> Immediate clinician notification, bypass copay settlement,
                    auto-prepare airway &amp; suction station.
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setEmergencyModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                  >
                    Cancel
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

export default Reception;
