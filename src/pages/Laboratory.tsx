import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Activity,
  Timer,
  AlertOctagon,
  Cpu,
  Search,
  Plus,
  PhoneCall,
  Printer,
  LineChart,
  CheckCircle2,
  X,
  FileBadge,
  QrCode,
  Share2,
  Radio,
  Clock,
  Sparkles,
  RefreshCw,
  Zap,
  Check,
  TrendingUp,
  Sliders,
} from 'lucide-react';
import { mockLabOrders, mockDoctors } from '../data/mockData';
import { LabOrder, LabPriority, LabStatus } from '../types';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ModalPortal } from '../components/ModalPortal';

interface LaboratoryProps {
  onNotify?: (title: string, message: string, type: 'critical' | 'financial' | 'triage' | 'system') => void;
  onOpenPowerBI?: () => void;
  onOpenExport?: () => void;
}

export interface SpecimenIntakePoint {
  time: string;
  cx: number;
  cyEmergency: number;
  cyOutpatient: number;
  emergencyCount: number;
  outpatientCount: number;
  tatMins: number;
  fastTrackTarget: number;
  callOuts: number;
  shiftNote: string;
  isPeak?: boolean;
}

export interface AnalyzerItem {
  id: string;
  name: string;
  testType: string;
  load: number;
  testsPerHour: number;
  cycle: string;
  status: string;
  statusColor: string;
  barColor: string;
  temp: string;
  reagentLevel: number;
  lastQC: string;
}

const DEFAULT_ANALYZERS: AnalyzerItem[] = [
  { id: 'an-1', name: 'Sysmex XN-1000', testType: 'Hematology & CBC', load: 94, testsPerHour: 45, cycle: 'Continuous Micro-Flow', status: 'Online', statusColor: 'bg-teal-500', barColor: 'bg-[#005c65]', temp: '37.0°C', reagentLevel: 88, lastQC: '06:15 AM' },
  { id: 'an-2', name: 'Cobas 8000', testType: 'Clinical Chemistry', load: 88, testsPerHour: 120, cycle: 'Batch High-Yield Photometry', status: 'Online', statusColor: 'bg-blue-600', barColor: 'bg-blue-600', temp: '36.8°C', reagentLevel: 92, lastQC: '07:00 AM' },
  { id: 'an-3', name: 'GeneXpert Infinity', testType: 'Molecular PCR Assays', load: 62, testsPerHour: 24, cycle: 'Thermal Cycling (32/40m)', status: 'Active Cycle', statusColor: 'bg-teal-600', barColor: 'bg-teal-600', temp: '55.4°C', reagentLevel: 74, lastQC: '08:30 AM' },
  { id: 'an-4', name: 'ORTHO VISION', testType: 'Blood Bank Serology', load: 100, testsPerHour: 36, cycle: 'Cross-Match Ready (42 units ready)', status: 'Online', statusColor: 'bg-teal-500', barColor: 'bg-teal-500', temp: '4.2°C', reagentLevel: 96, lastQC: '06:00 AM' },
];

export const Laboratory: React.FC<LaboratoryProps> = ({ onNotify, onOpenPowerBI, onOpenExport }) => {
  const outletCtx = useOutletContext<{
    showToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  } | null>();

  const [orders, setOrders] = useState<LabOrder[]>(mockLabOrders);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(mockLabOrders[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'STAT' | 'Pathology' | 'Critical'>('All');

  // Power BI Specimen Flow Interactive State
  const [shiftFilter, setShiftFilter] = useState<'Shift 1' | 'Shift 2' | 'Shift 3'>('Shift 1');
  const [hoveredLabPoint, setHoveredLabPoint] = useState<SpecimenIntakePoint | null>(null);
  const [hoveredAnalyzer, setHoveredAnalyzer] = useState<AnalyzerItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [calibratingId, setCalibratingId] = useState<string | null>(null);

  // Analyzer Fleet State with LocalStorage Persistence
  const STORAGE_KEY_ANALYZERS = 'smileclinic_lab_hardware_analyzers';
  const [analyzers, setAnalyzers] = useState<AnalyzerItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANALYZERS);
      return saved ? JSON.parse(saved) : DEFAULT_ANALYZERS;
    } catch {
      return DEFAULT_ANALYZERS;
    }
  });

  const handleRunCalibration = (analyzerId: string, analyzerName: string) => {
    setCalibratingId(analyzerId);
    setTimeout(() => {
      const updated = analyzers.map((a) => {
        if (a.id === analyzerId) {
          return {
            ...a,
            status: 'Online (Calibrated)',
            load: Math.min(100, Math.max(70, a.load + 5)),
            lastQC: 'Just now (Passed)',
            reagentLevel: Math.max(50, a.reagentLevel - 2),
          };
        }
        return a;
      });
      setAnalyzers(updated);
      localStorage.setItem(STORAGE_KEY_ANALYZERS, JSON.stringify(updated));
      setCalibratingId(null);
      outletCtx?.showToast?.('success', 'Analyzer Optics QC Verified', `${analyzerName} internal diagnostic self-test complete. Optical density within ±0.02 delta.`);
    }, 800);
  };

  const handleAutoSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const updated = analyzers.map((a) => ({
        ...a,
        status: 'Online',
        lastQC: 'Auto-Synced (HL7)',
      }));
      setAnalyzers(updated);
      localStorage.setItem(STORAGE_KEY_ANALYZERS, JSON.stringify(updated));
      setIsSyncing(false);
      outletCtx?.showToast?.('success', 'LIS Telemetry Bus Synced', 'Live assay telemetry refreshed from Central Pathology HL7 data exchange.');
    }, 600);
  };

  const shiftDataPoints: Record<'Shift 1' | 'Shift 2' | 'Shift 3', SpecimenIntakePoint[]> = {
    'Shift 1': [
      { time: '06:00 AM', cx: 10, cyEmergency: 130, cyOutpatient: 145, emergencyCount: 18, outpatientCount: 12, tatMins: 12, fastTrackTarget: 14, callOuts: 0, shiftNote: 'Early morning surgery draw baseline' },
      { time: '08:00 AM (Draw Peak)', cx: 150, cyEmergency: 80, cyOutpatient: 115, emergencyCount: 64, outpatientCount: 42, tatMins: 22, fastTrackTarget: 14, callOuts: 1, shiftNote: 'Surgical ICU batch intake surge', isPeak: true },
      { time: '10:00 AM', cx: 300, cyEmergency: 40, cyOutpatient: 90, emergencyCount: 52, outpatientCount: 58, tatMins: 16, fastTrackTarget: 14, callOuts: 0, shiftNote: 'Routine ambulatory biopsy processing' },
      { time: '12:00 PM (Shift Handover)', cx: 450, cyEmergency: 25, cyOutpatient: 75, emergencyCount: 78, outpatientCount: 46, tatMins: 38, fastTrackTarget: 14, callOuts: 2, shiftNote: 'Pre-handover sample rush & QC check', isPeak: true },
      { time: '02:00 PM', cx: 580, cyEmergency: 45, cyOutpatient: 85, emergencyCount: 36, outpatientCount: 32, tatMins: 14, fastTrackTarget: 14, callOuts: 1, shiftNote: 'Shift 1 to Shift 2 custody handover' },
    ],
    'Shift 2': [
      { time: '02:00 PM', cx: 10, cyEmergency: 110, cyOutpatient: 130, emergencyCount: 34, outpatientCount: 28, tatMins: 15, fastTrackTarget: 14, callOuts: 0, shiftNote: 'Afternoon rotation intake' },
      { time: '04:00 PM (OR Batch)', cx: 150, cyEmergency: 55, cyOutpatient: 95, emergencyCount: 58, outpatientCount: 38, tatMins: 20, fastTrackTarget: 14, callOuts: 1, shiftNote: 'Post-op maxillofacial tissue receipts', isPeak: true },
      { time: '06:00 PM', cx: 300, cyEmergency: 75, cyOutpatient: 110, emergencyCount: 42, outpatientCount: 24, tatMins: 14, fastTrackTarget: 14, callOuts: 0, shiftNote: 'Evening trauma standby' },
      { time: '08:00 PM (Emergency Rush)', cx: 450, cyEmergency: 30, cyOutpatient: 120, emergencyCount: 72, outpatientCount: 16, tatMins: 28, fastTrackTarget: 14, callOuts: 2, shiftNote: 'Dental trauma & fracture intake', isPeak: true },
      { time: '10:00 PM', cx: 580, cyEmergency: 90, cyOutpatient: 135, emergencyCount: 26, outpatientCount: 10, tatMins: 13, fastTrackTarget: 14, callOuts: 0, shiftNote: 'Night rotation handover' },
    ],
    'Shift 3': [
      { time: '10:00 PM', cx: 10, cyEmergency: 120, cyOutpatient: 145, emergencyCount: 22, outpatientCount: 8, tatMins: 12, fastTrackTarget: 14, callOuts: 0, shiftNote: 'Night shift opening baseline' },
      { time: '12:00 AM (Midnight STAT)', cx: 150, cyEmergency: 70, cyOutpatient: 140, emergencyCount: 48, outpatientCount: 6, tatMins: 18, fastTrackTarget: 14, callOuts: 1, shiftNote: 'ICU infection markers run', isPeak: true },
      { time: '02:00 AM', cx: 300, cyEmergency: 100, cyOutpatient: 150, emergencyCount: 28, outpatientCount: 4, tatMins: 14, fastTrackTarget: 14, callOuts: 0, shiftNote: 'Maintenance auto-rinsing active' },
      { time: '04:00 AM (Early Inpatient)', cx: 450, cyEmergency: 45, cyOutpatient: 135, emergencyCount: 62, outpatientCount: 14, tatMins: 24, fastTrackTarget: 14, callOuts: 1, shiftNote: 'Pre-surgery morning blood panels', isPeak: true },
      { time: '06:00 AM', cx: 580, cyEmergency: 85, cyOutpatient: 140, emergencyCount: 30, outpatientCount: 12, tatMins: 13, fastTrackTarget: 14, callOuts: 0, shiftNote: 'Morning handover to Shift 1' },
    ],
  };

  const shiftPaths = {
    'Shift 1': {
      emergencyArea: 'M0,130 Q60,115 120,80 T240,40 T360,65 T480,25 T600,45 L600,150 L0,150 Z',
      emergencyLine: 'M0,130 Q60,115 120,80 T240,40 T360,65 T480,25 T600,45',
      outpatientArea: 'M0,145 Q60,140 120,115 T240,90 T360,105 T480,75 T600,85 L600,150 L0,150 Z',
      outpatientLine: 'M0,145 Q60,140 120,115 T240,90 T360,105 T480,75 T600,85',
    },
    'Shift 2': {
      emergencyArea: 'M0,110 Q80,90 160,55 T320,75 T480,30 T600,90 L600,150 L0,150 Z',
      emergencyLine: 'M0,110 Q80,90 160,55 T320,75 T480,30 T600,90',
      outpatientArea: 'M0,130 Q80,120 160,95 T320,110 T480,120 T600,135 L600,150 L0,150 Z',
      outpatientLine: 'M0,130 Q80,120 160,95 T320,110 T480,120 T600,135',
    },
    'Shift 3': {
      emergencyArea: 'M0,120 Q80,100 160,70 T320,100 T480,45 T600,85 L600,150 L0,150 Z',
      emergencyLine: 'M0,120 Q80,100 160,70 T320,100 T480,45 T600,85',
      outpatientArea: 'M0,145 Q80,145 160,140 T320,150 T480,135 T600,140 L600,150 L0,150 Z',
      outpatientLine: 'M0,145 Q80,145 160,140 T320,150 T480,135 T600,140',
    },
  };

  const currentLabPoints = shiftDataPoints[shiftFilter];

  // Modals
  const [newSpecimenModalOpen, setNewSpecimenModalOpen] = useState(false);
  const [statBroadcastModalOpen, setStatBroadcastModalOpen] = useState(false);
  const [signOffModalOpen, setSignOffModalOpen] = useState(false);

  // Freeze background window scrolling when ANY laboratory modal is open
  const isAnyModalOpen = Boolean(newSpecimenModalOpen || statBroadcastModalOpen || signOffModalOpen);
  useBodyScrollLock(isAnyModalOpen);

  // New Specimen Form
  const [newSpecimen, setNewSpecimen] = useState({
    patientName: '',
    mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
    testName: 'Histopathological Biopsy & Tissue Margin Analysis',
    specimenType: 'Gingival / Alveolar Biopsy (Formalin fixed)',
    orderingPhysician: mockDoctors[0].name,
    priority: 'Urgent' as LabPriority,
    analyzerId: 'Sysmex XN-1000',
  });

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.specimenType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTab =
        activeTab === 'All' ||
        (activeTab === 'STAT' && order.priority === 'Stat') ||
        (activeTab === 'Pathology' && order.testName.toLowerCase().includes('biopsy')) ||
        (activeTab === 'Critical' && order.criticalFlag);

      return matchSearch && matchTab;
    });
  }, [orders, searchQuery, activeTab]);

  const handleCreateSpecimen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecimen.patientName.trim()) return;

    const created: LabOrder = {
      id: `lab-${Date.now()}`,
      orderNumber: `LAB-${Math.floor(10000 + Math.random() * 90000)}-BIO`,
      patientName: newSpecimen.patientName,
      mrn: newSpecimen.mrn,
      specimenType: newSpecimen.specimenType,
      testName: newSpecimen.testName,
      orderingPhysician: newSpecimen.orderingPhysician,
      priority: newSpecimen.priority,
      orderTime: 'Just now',
      turnaroundTime: '25m est',
      status: 'In Analysis',
      criticalFlag: newSpecimen.priority === 'Stat',
      analyzerId: newSpecimen.analyzerId,
      resultValue: 'Under Microscopic Sectioning',
      normalRange: 'Benign tissue margins expected',
    };

    setOrders([created, ...orders]);
    setSelectedOrder(created);
    setNewSpecimenModalOpen(false);
    onNotify?.(
      'Specimen Barcode Registered',
      `Barcode #${created.orderNumber} dispatched to ${created.analyzerId} for ${created.patientName}`,
      'system'
    );
  };

  const handleStatCallOut = (order: LabOrder) => {
    onNotify?.(
      'Urgent Call-Out Connected',
      `Direct phone link initiated with ${order.orderingPhysician} regarding ${order.patientName} (${order.testName})`,
      'critical'
    );
  };

  const handleSignOffSubmit = () => {
    if (!selectedOrder) return;
    setOrders(
      orders.map((o) =>
        o.id === selectedOrder.id ? { ...o, status: 'Verified & Signed' } : o
      )
    );
    setSignOffModalOpen(false);
    onNotify?.(
      'Pathologist Signature Affixed',
      `Diagnostic report for ${selectedOrder.patientName} electronically verified and synced to EHR`,
      'system'
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Section: Diagnostic Lab Operations Header & Primary Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
            <FlaskConical className="w-4 h-4 text-[#005c65]" />
            <span>Central Pathology Laboratory • Floor 2 Wing C</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Diagnostic Laboratory &amp; Pathology Operations
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl mt-0.5">
            Real-time specimen intake tracking, automated blood chemistry analyzers, molecular PCR thermal cycles, and statutory panic value alerts dispatch.
          </p>
        </div>

        {/* Quick Operational Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenPowerBI && (
            <button
              onClick={onOpenPowerBI}
              className="flex items-center gap-2 px-4 h-10 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-sm font-semibold transition-all shadow-sm"
            >
              <Radio className="w-4 h-4 text-amber-600" />
              <span>Lab Telemetry (Power BI)</span>
            </button>
          )}

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-2 px-4 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all shadow-sm"
            >
              <FileBadge className="w-4 h-4 text-slate-600" />
              <span>Export HL7 Feed</span>
            </button>
          )}

          <button
            onClick={() => setStatBroadcastModalOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-sm font-semibold shadow-sm transition-all"
          >
            <AlertOctagon className="w-4 h-4 text-red-600 animate-pulse" />
            <span>STAT Results Broadcast</span>
          </button>

          <button
            onClick={() => setNewSpecimenModalOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-[#005c65] hover:bg-[#007782] text-white text-sm font-semibold shadow-md shadow-[#005c65]/20 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Log New Specimen / Barcode</span>
          </button>
        </div>
      </div>

      {/* Metric Badges & Analytical KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Diagnostic Orders Today */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Total Diagnostic Orders
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-slate-900">842</span>
                <span className="text-xs font-semibold text-teal-600">Today</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-[#005c65]">
              <FlaskConical className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#005c65] h-full" style={{ width: '72%' }} />
              <div className="bg-blue-600 h-full" style={{ width: '21%' }} />
              <div className="bg-red-500 h-full" style={{ width: '7%' }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#005c65]" /> 612 Released
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600" /> 178 In-Process
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> 52 STAT
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Average Turnaround Time (TAT) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Average Turnaround Time (TAT)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-slate-900">
                  38 <span className="text-base font-normal text-slate-400">mins</span>
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
              <Timer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">STAT Emergency TAT:</span>
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
              14 mins (Fast-Track)
            </span>
          </div>
        </div>

        {/* KPI 3: Critical Value Alert Flags */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white to-red-50/30">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-red-600 font-semibold flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-red-500" /> Critical Panic Values
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-red-700">4</span>
                <span className="text-xs text-red-600 font-semibold">Pending Call-Outs</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-700 animate-bounce">
              <PhoneCall className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-red-700">Clinician Acknowledgement:</span>
            <span className="text-slate-800 font-semibold">1 Pending / 3 Notified</span>
          </div>
        </div>

        {/* KPI 4: Analyzer Fleet Health */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Analyzer Fleet Health
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-teal-700">98.2%</span>
                <span className="text-xs text-slate-400">Uptime</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">Active Channels:</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" /> 8 Online • 1 Calibrating
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Visualizer Row: Specimen Flow Area Chart & Automated Analyzer Fleet Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Visualizer 1: Specimen Flow Hourly Volume Area Graph (7 Columns) */}
        <div className="xl:col-span-7 bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">Specimen Intake &amp; Release Volume</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
                  Hourly Pulse
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Clinical sample flow distributed across Emergency, Inpatient ICUs, and Ambulatory units
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Shift Slicer Tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {(['Shift 1', 'Shift 2', 'Shift 3'] as const).map((sf) => (
                  <button
                    key={sf}
                    onClick={() => {
                      setShiftFilter(sf);
                      setHoveredLabPoint(null);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                      shiftFilter === sf
                        ? 'bg-white text-[#005c65] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {sf}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#007782]" />
                  <span className="text-slate-600">ICU / ER</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#319796]" />
                  <span className="text-slate-600">Outpatient</span>
                </span>
              </div>
            </div>
          </div>

          {/* SVG Area Chart with Power BI Floating Tooltip */}
          <div className="w-full h-48 relative flex items-end">
            <svg 
              className="w-full h-full overflow-visible" 
              preserveAspectRatio="none" 
              viewBox="0 0 600 160"
              onMouseLeave={() => setHoveredLabPoint(null)}
            >
              <defs>
                <linearGradient id="labTealGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#007782" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#007782" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="labMintGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#319796" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#319796" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glowLab" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#007782" floodOpacity="0.5" />
                </filter>
              </defs>

              <line stroke="#ebeef0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="600" y1="30" y2="30" />
              <line stroke="#ebeef0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="600" y1="70" y2="70" />
              <line stroke="#ebeef0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="600" y1="110" y2="110" />
              <line stroke="#ebeef0" strokeWidth="1" x1="0" x2="600" y1="150" y2="150" />

              {/* Hover Cursor Guideline */}
              {hoveredLabPoint && (
                <motion.line
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  x1={hoveredLabPoint.cx}
                  y1="10"
                  x2={hoveredLabPoint.cx}
                  y2="150"
                  stroke="#007782"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
              )}

              {/* Area 1 (ICU/Emergency - Teal) */}
              <motion.path
                key={`lab-emerg-area-${shiftFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                d={shiftPaths[shiftFilter].emergencyArea}
                fill="url(#labTealGrad)"
              />
              <motion.path
                key={`lab-emerg-line-${shiftFilter}`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                d={shiftPaths[shiftFilter].emergencyLine}
                fill="none"
                stroke="#007782"
                strokeLinecap="round"
                strokeWidth="3"
              />

              {/* Area 2 (Outpatient - Mint) */}
              <motion.path
                key={`lab-out-area-${shiftFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                d={shiftPaths[shiftFilter].outpatientArea}
                fill="url(#labMintGrad)"
              />
              <motion.path
                key={`lab-out-line-${shiftFilter}`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                d={shiftPaths[shiftFilter].outpatientLine}
                fill="none"
                stroke="#319796"
                strokeLinecap="round"
                strokeWidth="2.5"
              />

              {/* Interactive Specimen Nodes */}
              {currentLabPoints.map((pt, idx) => {
                const isHovered = hoveredLabPoint?.time === pt.time;
                return (
                  <g 
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredLabPoint(pt)}
                  >
                    {/* Hover Hitbox */}
                    <rect
                      x={pt.cx - 20}
                      y={0}
                      width={40}
                      height={160}
                      fill="transparent"
                    />

                    {/* Emergency Circle */}
                    <circle
                      cx={pt.cx}
                      cy={pt.cyEmergency}
                      r={isHovered ? 7 : pt.isPeak ? 5.5 : 4.5}
                      fill={isHovered ? '#007782' : pt.isPeak ? '#ba1a1a' : '#007782'}
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-200"
                      filter={isHovered ? 'url(#glowLab)' : undefined}
                    />

                    {/* Outpatient Circle */}
                    <circle
                      cx={pt.cx}
                      cy={pt.cyOutpatient}
                      r={isHovered ? 5.5 : 4}
                      fill="#319796"
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="transition-all duration-200"
                    />

                    {/* Concentric Pulsing Ring */}
                    {isHovered && (
                      <circle
                        cx={pt.cx}
                        cy={pt.cyEmergency}
                        r={12}
                        fill="none"
                        stroke="#007782"
                        strokeWidth="1.5"
                        strokeOpacity="0.5"
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Power BI Floating Data Preview Card */}
            <AnimatePresence>
              {hoveredLabPoint && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    left: `${Math.min(Math.max((hoveredLabPoint.cx / 600) * 100, 15), 78)}%`,
                    top: '5px'
                  }}
                  className="absolute -translate-x-1/2 z-20 pointer-events-none w-64 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-slate-700/80 p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      <span>{hoveredLabPoint.time}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      hoveredLabPoint.isPeak 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    }`}>
                      {hoveredLabPoint.isPeak ? 'Surge Peak' : shiftFilter}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between bg-slate-800/60 p-1.5 rounded-lg">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-[#007782]" />
                        ICU &amp; Emergency:
                      </span>
                      <span className="font-bold text-white text-sm">
                        {hoveredLabPoint.emergencyCount} <span className="text-[10px] text-teal-400 font-normal">specimens</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-800/60 p-1.5 rounded-lg">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-[#319796]" />
                        Ambulatory / Outpatient:
                      </span>
                      <span className="font-bold text-teal-300 text-sm">
                        {hoveredLabPoint.outpatientCount} <span className="text-[10px] text-slate-400 font-normal">specimens</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-400">
                      <div>
                        <span>Emergency TAT:</span>
                        <span className="block font-bold text-white">{hoveredLabPoint.tatMins} mins</span>
                      </div>
                      <div>
                        <span>STAT Benchmark:</span>
                        <span className="block font-bold text-emerald-400">Target &lt; {hoveredLabPoint.fastTrackTarget}m</span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span className="truncate">{hoveredLabPoint.shiftNote}</span>
                      <span className="text-amber-400 font-semibold">{hoveredLabPoint.callOuts} Call-Outs</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive Time Steps */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            {currentLabPoints.map((pt, idx) => (
              <button
                key={idx}
                onClick={() => setHoveredLabPoint(pt)}
                className={`transition-colors hover:text-[#005c65] ${
                  hoveredLabPoint?.time === pt.time 
                    ? 'text-[#005c65] font-bold underline' 
                    : pt.isPeak 
                    ? 'text-slate-700 font-semibold' 
                    : ''
                }`}
              >
                {pt.time}
              </button>
            ))}
          </div>
        </div>

        {/* Visualizer 2: Workstation Analyzer Fleet Live Cluster (5 Columns) with Calibration & Persistence */}
        <div className="xl:col-span-5 bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-base font-bold text-slate-900 block flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#005c65]" />
                Analyzer Hardware Grid
              </span>
              <span className="text-xs text-slate-500">Live telemetry from connected assay lines</span>
            </div>
            <button
              onClick={handleAutoSync}
              disabled={isSyncing}
              className="px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold hover:bg-teal-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Auto-Sync'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analyzers.map((machine) => {
              const isHovered = hoveredAnalyzer?.id === machine.id;
              const isCalibrating = calibratingId === machine.id;
              return (
                <div
                  key={machine.id}
                  onMouseEnter={() => setHoveredAnalyzer(machine)}
                  onMouseLeave={() => setHoveredAnalyzer(null)}
                  className={`p-3 rounded-lg border transition-all flex flex-col justify-between gap-1.5 relative ${
                    isHovered ? 'bg-white shadow-md border-primary/40' : 'bg-slate-50/80 border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold truncate max-w-[120px]">
                      {machine.name}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${machine.statusColor} animate-pulse`} />
                  </div>

                  <span className="text-xs font-bold text-slate-900 truncate">{machine.testType}</span>

                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${machine.load}%` }}
                      transition={{ duration: 0.5 }}
                      className={`${machine.barColor} h-full rounded-full`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Load: <b>{machine.load}%</b></span>
                    <span className="text-teal-700 font-semibold">{machine.testsPerHour} tests/hr</span>
                  </div>

                  {/* Machine Live Telemetry Preview Substrip */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>Temp: {machine.temp}</span>
                    <span>Reagent: {machine.reagentLevel}%</span>
                  </div>

                  {/* Calibration Action on Hover */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] text-slate-400 truncate max-w-[80px]">QC: {machine.lastQC}</span>
                    <button
                      onClick={() => handleRunCalibration(machine.id, machine.name)}
                      disabled={isCalibrating}
                      className="text-[10px] font-semibold text-primary hover:text-primary-container flex items-center gap-1 disabled:opacity-50"
                    >
                      {isCalibrating ? (
                        <>
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-2.5 h-2.5" />
                          <span>Calibrate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content: Live Specimen Results Queue */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-slate-900 mr-2">Active Specimen Worklist</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              {(['All', 'STAT', 'Pathology', 'Critical'] as const).map((tab) => {
                const count =
                  tab === 'All'
                    ? orders.length
                    : tab === 'STAT'
                    ? orders.filter((o) => o.priority === 'Stat').length
                    : tab === 'Pathology'
                    ? orders.filter((o) => o.testName.toLowerCase().includes('biopsy')).length
                    : orders.filter((o) => o.criticalFlag).length;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      activeTab === tab
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === tab ? 'bg-[#005c65]/10 text-[#005c65]' : 'bg-slate-200/80 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter specimen or test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
            />
          </div>
        </div>

        {/* Specimen Queue Cards */}
        <div className="flex flex-col gap-3">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No laboratory specimens found</p>
              <p className="text-xs text-slate-400 mt-1">No orders match the selected category &ldquo;{activeTab}&rdquo; or search query</p>
              <button
                onClick={() => {
                  setActiveTab('All');
                  setSearchQuery('');
                }}
                className="mt-3 px-3.5 py-1.5 bg-[#005c65] text-white rounded-lg text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
            const isStat = order.priority === 'Stat';
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  order.criticalFlag
                    ? 'border-red-200 bg-red-50/20 hover:bg-red-50/40'
                    : 'border-slate-100 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isStat ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1 animate-pulse">
                        <AlertOctagon className="w-3.5 h-3.5" /> STAT EMERGENCY
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                        {order.priority.toUpperCase()}
                      </span>
                    )}

                    <span className="font-mono font-semibold text-xs text-[#005c65]">#{order.orderNumber}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">Order: {order.orderTime}</span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
                    Specimen: <strong>{order.specimenType}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 bg-slate-50/80 rounded-lg border border-slate-100">
                  {/* Patient Info */}
                  <div className="md:col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                      {order.patientName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-900 text-sm truncate">{order.patientName}</span>
                      <span className="text-xs text-slate-500">{order.mrn} • Dr. {order.orderingPhysician}</span>
                    </div>
                  </div>

                  {/* Test Panel & Finding */}
                  <div className="md:col-span-5 flex flex-col">
                    <span className="text-xs font-semibold text-slate-800">{order.testName}</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className={`text-sm font-bold ${order.criticalFlag ? 'text-red-700' : 'text-slate-900'}`}>
                        {order.resultValue || 'Analysis in Progress'}
                      </span>
                      {order.normalRange && (
                        <span className="text-[11px] text-slate-400">({order.normalRange})</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-3 flex items-center justify-end gap-2">
                    {order.criticalFlag && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatCallOut(order);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Call MD
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                        setSignOffModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#005c65] hover:bg-[#007782] text-white text-xs font-semibold"
                    >
                      Sign-Off
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <span>Assay Line: {order.analyzerId} • TAT: {order.turnaroundTime}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNotify?.('Spectral Data Exported', 'Raw chromatographic peaks plotted to viewer', 'system');
                      }}
                      className="hover:text-[#005c65] flex items-center gap-1 font-semibold"
                    >
                      <LineChart className="w-3.5 h-3.5" /> Raw Peaks
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNotify?.('Aliquot Label Printed', `Barcode #${order.orderNumber} sent to lab printer`, 'system');
                      }}
                      className="hover:text-[#005c65] flex items-center gap-1 font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Aliquot
                    </button>
                  </div>
                </div>
              </div>
            );
          }))}
        </div>
      </div>

      {/* MODAL 1: Log New Specimen */}
      <AnimatePresence>
        {newSpecimenModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setNewSpecimenModalOpen(false)}
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
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#005c65] flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Log New Diagnostic Specimen</h3>
                    <p className="text-xs text-slate-500">Scan specimen barcode &amp; route to clinical analyzer</p>
                  </div>
                </div>
                <button
                  onClick={() => setNewSpecimenModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSpecimen} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Patient Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam Sterling"
                      value={newSpecimen.patientName}
                      onChange={(e) => setNewSpecimen({ ...newSpecimen, patientName: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">MRN Identifier</label>
                    <input
                      type="text"
                      readOnly
                      value={newSpecimen.mrn}
                      className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Diagnostic Test Panel</label>
                  <input
                    type="text"
                    value={newSpecimen.testName}
                    onChange={(e) => setNewSpecimen({ ...newSpecimen, testName: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Priority</label>
                    <select
                      value={newSpecimen.priority}
                      onChange={(e) => setNewSpecimen({ ...newSpecimen, priority: e.target.value as LabPriority })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                    >
                      <option value="Stat">STAT (Urgent Flash)</option>
                      <option value="Urgent">Urgent Priority</option>
                      <option value="Routine">Routine Care</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Assigned Analyzer</label>
                    <select
                      value={newSpecimen.analyzerId}
                      onChange={(e) => setNewSpecimen({ ...newSpecimen, analyzerId: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                    >
                      <option value="Sysmex XN-1000">Sysmex XN-1000 (Hematology)</option>
                      <option value="Cobas 8000">Cobas 8000 (Clinical Chemistry)</option>
                      <option value="GeneXpert Infinity">GeneXpert Infinity (PCR)</option>
                      <option value="ORTHO VISION">ORTHO VISION (Blood Bank)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setNewSpecimenModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#005c65] text-white rounded-lg text-sm font-semibold hover:bg-[#007782] shadow-md"
                  >
                    Generate Barcode &amp; Queue Specimen
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* MODAL 2: STAT Results Broadcast */}
      <AnimatePresence>
        {statBroadcastModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setStatBroadcastModalOpen(false)}
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
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900">STAT Results Panic Broadcast</h3>
                    <p className="text-xs text-red-600">Immediate push to ICU &amp; attending physician pagers</p>
                  </div>
                </div>
                <button
                  onClick={() => setStatBroadcastModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-sm text-slate-700">
                <p>
                  Confirming this broadcast will automatically trigger priority alerts to the ICU charge nurse station and attending doctor mobile EHR apps for <strong>4 pending critical panic values</strong>.
                </p>
                <div className="p-3 bg-red-50 text-red-900 rounded-lg text-xs">
                  <strong>Standard Statutory Protocol:</strong> High-sensitivity Troponin I (&gt;0.80 ng/mL) and Critical Serum Potassium require immediate verbal read-back within 15 minutes.
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setStatBroadcastModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setStatBroadcastModalOpen(false);
                    onNotify?.(
                      'STAT Broadcast Dispatched',
                      'High-priority audio chimes and SMS sent to on-call cardiothoracic team',
                      'critical'
                    );
                  }}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 shadow-md shadow-red-500/20"
                >
                  Transmit Panic Broadcast
                </button>
              </div>
            </motion.div>
          </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* MODAL 3: Pathology Sign-Off */}
      <AnimatePresence>
        {signOffModalOpen && selectedOrder && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSignOffModalOpen(false)}
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
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#005c65] flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Sign-Off Diagnostic Pathology Report</h3>
                      <p className="text-xs text-slate-500">{selectedOrder.orderNumber} • {selectedOrder.patientName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSignOffModalOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-4 space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-semibold">Test Panel:</span>
                      <span className="font-semibold text-slate-900">{selectedOrder.testName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Analyzer Value:</span>
                      <span className="font-bold text-slate-900">{selectedOrder.resultValue || '98.4% Normal range'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sign-Off Pathologist:</span>
                      <span className="font-semibold text-slate-800">Dr. Sneha Lal, MD (Chief Clinical Admin)</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSignOffModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSignOffSubmit}
                    className="px-5 py-2 bg-[#005c65] text-white rounded-lg text-sm font-semibold hover:bg-[#007782]"
                  >
                    Affix Electronic Signature &amp; Release
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
