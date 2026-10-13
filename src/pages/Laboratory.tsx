import React, { useState, useMemo } from 'react';
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

export const Laboratory: React.FC<LaboratoryProps> = ({ onNotify, onOpenPowerBI, onOpenExport }) => {
  const [orders, setOrders] = useState<LabOrder[]>(mockLabOrders);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(mockLabOrders[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'STAT' | 'Pathology' | 'Critical'>('All');

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
            <span>+ Log New Specimen / Barcode</span>
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
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">Specimen Intake &amp; Release Volume</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  Hourly Pulse
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Clinical sample flow distributed across Emergency, Inpatient ICUs, and Ambulatory units
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">Shift 1 (06:00 - 14:00)</span>
          </div>

          {/* SVG Area Chart */}
          <div className="w-full h-48 relative flex items-end">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 160">
              <defs>
                <linearGradient id="labTealGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#007782" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#007782" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="labMintGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#319796" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#319796" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line stroke="#ebeef0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="600" y1="30" y2="30" />
              <line stroke="#ebeef0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="600" y1="70" y2="70" />
              <line stroke="#ebeef0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="600" y1="110" y2="110" />
              <line stroke="#ebeef0" strokeWidth="1" x1="0" x2="600" y1="150" y2="150" />

              {/* Area 1 (ICU/Emergency - Teal) */}
              <path
                d="M0,130 Q60,115 120,80 T240,40 T360,65 T480,25 T600,45 L600,150 L0,150 Z"
                fill="url(#labTealGrad)"
              />
              <path
                d="M0,130 Q60,115 120,80 T240,40 T360,65 T480,25 T600,45"
                fill="none"
                stroke="#007782"
                strokeLinecap="round"
                strokeWidth="3"
              />

              {/* Area 2 (Outpatient - Mint) */}
              <path
                d="M0,145 Q60,140 120,115 T240,90 T360,105 T480,75 T600,85 L600,150 L0,150 Z"
                fill="url(#labMintGrad)"
              />
              <path
                d="M0,145 Q60,140 120,115 T240,90 T360,105 T480,75 T600,85"
                fill="none"
                stroke="#319796"
                strokeLinecap="round"
                strokeWidth="2.5"
              />

              {/* Points */}
              <circle cx="240" cy="40" fill="#007782" r="4.5" stroke="#ffffff" strokeWidth="2" />
              <circle cx="480" cy="25" fill="#ba1a1a" r="4.5" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>06:00 AM</span>
            <span>08:00 AM (Draw Peak)</span>
            <span>10:00 AM</span>
            <span>12:00 PM (Shift Handover)</span>
            <span>02:00 PM</span>
          </div>
        </div>

        {/* Visualizer 2: Workstation Analyzer Fleet Live Cluster (5 Columns) */}
        <div className="xl:col-span-5 bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-base font-bold text-slate-900 block">Analyzer Hardware Grid</span>
              <span className="text-xs text-slate-500">Live telemetry from connected assay lines</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-xs font-bold">
              Auto-Sync
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Machine 1: Hematology */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Sysmex XN-1000</span>
                <span className="w-2 h-2 rounded-full bg-teal-500" />
              </div>
              <span className="text-xs font-bold text-slate-900">Hematology &amp; CBC</span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#005c65] h-full rounded-full" style={{ width: '94%' }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Load: 94%</span>
                <span className="text-teal-700 font-semibold">45 tests/hr</span>
              </div>
            </div>

            {/* Machine 2: Cobas 8000 */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Cobas 8000</span>
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              </div>
              <span className="text-xs font-bold text-slate-900">Clinical Chemistry</span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '88%' }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Load: 88%</span>
                <span className="text-blue-700 font-semibold">120 tests/hr</span>
              </div>
            </div>

            {/* Machine 3: Molecular PCR */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">GeneXpert Infinity</span>
                <span className="w-2 h-2 rounded-full bg-teal-600" />
              </div>
              <span className="text-xs font-bold text-slate-900">Molecular PCR Assays</span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full" style={{ width: '62%' }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Cycle: 32/40m</span>
                <span className="text-[#005c65] font-semibold">Thermal Cycling</span>
              </div>
            </div>

            {/* Machine 4: Blood Bank */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">ORTHO VISION</span>
                <span className="w-2 h-2 rounded-full bg-teal-500" />
              </div>
              <span className="text-xs font-bold text-slate-900">Blood Bank Serology</span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '100%' }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Cross-Match Ready</span>
                <span className="font-bold text-slate-800">42 units ready</span>
              </div>
            </div>
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
              className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#005c65] w-64"
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
                    <span className="text-slate-300">&bull;</span>
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
                  <span>Assay Line: {order.analyzerId} &bull; TAT: {order.turnaroundTime}</span>
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
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setNewSpecimenModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 overflow-hidden"
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
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setStatBroadcastModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white rounded-2xl shadow-2xl border border-red-200 w-full max-w-md p-6 overflow-hidden"
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
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSignOffModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 overflow-hidden"
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
