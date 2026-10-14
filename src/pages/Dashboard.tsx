import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Stethoscope,
  CalendarCheck,
  FlaskConical,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Download,
  Layers,
  Zap,
  ChevronRight,
  Bed,
  Sparkles,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';
import {
  mockTriageQueue,
  mockDepartmentMetrics
} from '../data/mockData';
import { useClinicDB } from '../lib/db';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ModalPortal } from '../components/ModalPortal';

interface DashboardProps {
  onNotify?: (title: string, message: string, type: 'critical' | 'financial' | 'triage' | 'system') => void;
}

export default function Dashboard({ onNotify }: DashboardProps = {}) {
  const { showToast, openPowerBi, openExport } = useOutletContext<{
    showToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
    openPowerBi: () => void;
    openExport: () => void;
  }>();

  const navigate = useNavigate();

  // Real-time Central Database
  const { doctors, orSuites, patients } = useClinicDB();

  // Active filter tab
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d'>('24h');
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedSuiteDetail, setSelectedSuiteDetail] = useState<any>(null);

  // Power BI Inflow vs Discharge Interactive State
  interface InflowChartPoint {
    time: string;
    cx: number;
    cyInflow: number;
    cyDischarge: number;
    inflow: number;
    discharge: number;
    wait: string;
    occupancy: number;
    badge: string;
    status: string;
    highlight?: boolean;
  }

  const chartDataPoints: Record<'24h' | '7d' | '30d', InflowChartPoint[]> = {
    '24h': [
      { time: '06:00 AM', cx: 40, cyInflow: 200, cyDischarge: 220, inflow: 14, discharge: 8, wait: '4.2m', occupancy: 70, badge: 'Shift Start', status: 'Baseline Intake Flow' },
      { time: '09:00 AM', cx: 180, cyInflow: 135, cyDischarge: 170, inflow: 31, discharge: 16, wait: '7.8m', occupancy: 84, badge: 'Morning Surge', status: 'All Operatories Active' },
      { time: '12:00 PM', cx: 400, cyInflow: 60, cyDischarge: 110, inflow: 49, discharge: 28, wait: '12.4m', occupancy: 94, badge: 'Peak Surge', status: 'Max Chair Utilization', highlight: true },
      { time: '03:00 PM', cx: 520, cyInflow: 110, cyDischarge: 130, inflow: 34, discharge: 36, wait: '8.4m', occupancy: 89, badge: 'Afternoon Turnover', status: 'Discharges Equalizing' },
      { time: '06:00 PM', cx: 640, cyInflow: 130, cyDischarge: 125, inflow: 24, discharge: 29, wait: '6.1m', occupancy: 82, badge: 'Evening Handover', status: 'Post-Op Stable' },
      { time: '09:00 PM', cx: 780, cyInflow: 45, cyDischarge: 80, inflow: 42, discharge: 38, wait: '7.0m', occupancy: 88, badge: 'Emergency Active', status: 'On-Call Inflow Heavy', highlight: true },
    ],
    '7d': [
      { time: 'Mon', cx: 60, cyInflow: 130, cyDischarge: 160, inflow: 380, discharge: 340, wait: '7.2m', occupancy: 88, badge: 'High Intake', status: 'Post-Weekend Inflow' },
      { time: 'Tue', cx: 180, cyInflow: 105, cyDischarge: 135, inflow: 410, discharge: 390, wait: '8.0m', occupancy: 91, badge: 'Surgical Day', status: 'Full OR Load' },
      { time: 'Wed', cx: 320, cyInflow: 50, cyDischarge: 90, inflow: 465, discharge: 420, wait: '11.5m', occupancy: 96, badge: 'Weekly Peak', status: 'Surge Capacity Active', highlight: true },
      { time: 'Thu', cx: 460, cyInflow: 90, cyDischarge: 120, inflow: 425, discharge: 415, wait: '8.4m', occupancy: 90, badge: 'Endo Focus', status: 'Steady Flow' },
      { time: 'Fri', cx: 580, cyInflow: 80, cyDischarge: 100, inflow: 440, discharge: 450, wait: '7.8m', occupancy: 89, badge: 'Turnover Day', status: 'Rapid Discharges' },
      { time: 'Sat', cx: 680, cyInflow: 160, cyDischarge: 175, inflow: 290, discharge: 270, wait: '5.4m', occupancy: 78, badge: 'Weekend Urgent', status: 'Ambulatory Triage' },
      { time: 'Sun', cx: 780, cyInflow: 190, cyDischarge: 210, inflow: 210, discharge: 195, wait: '4.2m', occupancy: 70, badge: 'Baseline', status: 'Maintenance Roster' },
    ],
    '30d': [
      { time: 'Wk 1', cx: 100, cyInflow: 140, cyDischarge: 160, inflow: 2450, discharge: 2310, wait: '7.5m', occupancy: 87, badge: 'Period Opening', status: 'Normal Intake' },
      { time: 'Wk 2', cx: 300, cyInflow: 90, cyDischarge: 120, inflow: 2780, discharge: 2620, wait: '8.8m', occupancy: 92, badge: 'Optimal Surge', status: 'Surgical Inflow High' },
      { time: 'Wk 3', cx: 500, cyInflow: 50, cyDischarge: 80, inflow: 3120, discharge: 2950, wait: '12.0m', occupancy: 97, badge: 'Monthly High', status: 'Peak Capacity', highlight: true },
      { time: 'Wk 4', cx: 720, cyInflow: 110, cyDischarge: 135, inflow: 2650, discharge: 2580, wait: '8.1m', occupancy: 89, badge: 'Rebalance Period', status: 'Steady State' },
    ],
  };

  const chartPaths = {
    '24h': {
      inflowArea: 'M0,200 Q100,160 200,130 T400,60 T600,110 T800,45 L800,240 L0,240 Z',
      inflowLine: 'M0,200 Q100,160 200,130 T400,60 T600,110 T800,45',
      dischargeArea: 'M0,220 Q120,200 220,160 T420,110 T620,130 T800,80 L800,240 L0,240 Z',
      dischargeLine: 'M0,220 Q120,200 220,160 T420,110 T620,130 T800,80',
    },
    '7d': {
      inflowArea: 'M0,150 Q120,120 240,80 T480,70 T700,140 T800,180 L800,240 L0,240 Z',
      inflowLine: 'M0,150 Q120,120 240,80 T480,70 T700,140 T800,180',
      dischargeArea: 'M0,180 Q120,150 240,110 T480,90 T700,160 T800,200 L800,240 L0,240 Z',
      dischargeLine: 'M0,180 Q120,150 240,110 T480,90 T700,160 T800,200',
    },
    '30d': {
      inflowArea: 'M0,160 Q200,120 400,60 T700,90 T800,120 L800,240 L0,240 Z',
      inflowLine: 'M0,160 Q200,120 400,60 T700,90 T800,120',
      dischargeArea: 'M0,180 Q200,140 400,90 T700,120 T800,140 L800,240 L0,240 Z',
      dischargeLine: 'M0,180 Q200,140 400,90 T700,120 T800,140',
    },
  };

  const [hoveredChartPoint, setHoveredChartPoint] = useState<InflowChartPoint | null>(null);
  const currentChartPoints = chartDataPoints[timeFilter];

  // Persistent Department Bed & Chair Capacity
  const STORAGE_KEY_DEPT_METRICS = 'smileclinic_dashboard_department_metrics';
  const [departmentMetrics, setDepartmentMetrics] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEPT_METRICS);
      return saved ? JSON.parse(saved) : mockDepartmentMetrics;
    } catch {
      return mockDepartmentMetrics;
    }
  });

  const [hasCustomCapacity, setHasCustomCapacity] = useState(() => {
    return Boolean(localStorage.getItem(STORAGE_KEY_DEPT_METRICS));
  });

  const [isRebalancing, setIsRebalancing] = useState(false);

  const handleRebalanceOperatories = () => {
    setIsRebalancing(true);
    setTimeout(() => {
      const optimized = departmentMetrics.map((dept: any) => {
        if (dept.id === 'dep-1') {
          // Emergency Dental rebalances from 28 down to 25
          const newOccupied = Math.max(15, dept.occupied - 3);
          return { ...dept, occupied: newOccupied, percentage: Math.round((newOccupied / dept.capacity) * 100) };
        }
        if (dept.id === 'dep-3') {
          // Restorative absorbs 2 buffered cases
          const newOccupied = Math.min(dept.capacity, dept.occupied + 1);
          return { ...dept, occupied: newOccupied, percentage: Math.round((newOccupied / dept.capacity) * 100) };
        }
        return dept;
      });
      setDepartmentMetrics(optimized);
      localStorage.setItem(STORAGE_KEY_DEPT_METRICS, JSON.stringify(optimized));
      setHasCustomCapacity(true);
      setIsRebalancing(false);
      showToast('success', 'AI Operatory Buffer Rebalanced', 'Waitlist autogap buffer reallocated 3 emergency overflow cases into Suite 3 restorative slots.');
    }, 600);
  };

  const handleResetCapacity = () => {
    localStorage.removeItem(STORAGE_KEY_DEPT_METRICS);
    setDepartmentMetrics(mockDepartmentMetrics);
    setHasCustomCapacity(false);
    showToast('info', 'Capacity Reset', 'Department bed and chair capacity restored to clinical defaults.');
  };

  // Dynamic calculations from real-time DB
  const onDutyDoctors = doctors.filter((d) => d.status === 'On Duty' || d.status === 'In Surgery' || d.status === 'On Rounds');
  const inSurgeryDoctors = doctors.filter((d) => d.status === 'In Surgery');
  const onRoundsDoctors = doctors.filter((d) => d.status === 'On Rounds' || d.status === 'On Duty');
  const specialistsCount = doctors.filter((d) => !d.title?.toLowerCase().includes('resident')).length;
  const residentsCount = doctors.filter((d) => d.title?.toLowerCase().includes('resident')).length;
  const onShiftPct = doctors.length > 0 ? Math.round((onDutyDoctors.length / doctors.length) * 100) : 0;

  // Dynamic Patient telemetry
  const patientDiff = Math.max(0, patients.length - 8);
  const activeInpatientsCount = 184 + patientDiff;
  const stablePatientCount = 166 + patientDiff;
  const todaysVisitsCount = 412 + patientDiff;

  // Freeze background window and prevent interaction when popup is open
  useBodyScrollLock(Boolean(broadcastModalOpen || selectedSuiteDetail));

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    showToast('error', 'Emergency Clinical Alert Broadcasted', broadcastMessage);
    setBroadcastModalOpen(false);
    setBroadcastMessage('');
  };

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto">
      {/* Top Welcome & Executive Telemetry Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Hospital Executive Overview
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Autonomous Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time synchronization across surgery suites, triage token flow, laboratory diagnostics, and revenue cycle.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time Filter Pill */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
            {(['24h', '7d', '30d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTimeFilter(t);
                  showToast('info', 'Time Filter Updated', `Viewing hospital metrics for ${t === '24h' ? 'today' : t}`);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${timeFilter === t
                    ? 'bg-white text-primary font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {t === '24h' ? 'Today' : t === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setBroadcastModalOpen(true)}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Emergency Broadcast</span>
          </button>

          <button
            onClick={openPowerBi}
            className="px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Power BI Insights</span>
          </button>
        </div>
      </div>

      {/* 5 Top KPI Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Inpatients & Bed Occupancy */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Inpatients</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{activeInpatientsCount}</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> 92% Occupancy
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">16 ICU Beds • 4 Recovery Suites</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-600">
            <span>Critical Acuity: <b>18</b></span>
            <span>Stable: <b>{stablePatientCount}</b></span>
          </div>
        </motion.div>

        {/* KPI 2: Doctors On-Duty */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Doctors On-Duty</span>
            <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{onDutyDoctors.length} <span className="text-sm font-normal text-slate-400">/ {doctors.length}</span></span>
              <span className="text-xs font-semibold text-sky-600">{onShiftPct}% On-Shift</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{inSurgeryDoctors.length} In Surgery • {onRoundsDoctors.length} On Rounds &amp; Chairs</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-600">
            <span>Specialists: <b>{specialistsCount}</b></span>
            <span>Residents: <b>{residentsCount}</b></span>
          </div>
        </motion.div>

        {/* KPI 3: Today's Appointments & Triage */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Visits</span>
            <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{todaysVisitsCount}</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" /> 310 Done
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">28 In Triage • 74 Pending Seating</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-600">
            <span>Avg Wait: <b>8.4 min</b></span>
            <span className="text-emerald-600 font-semibold">On Target</span>
          </div>
        </motion.div>

        {/* KPI 4: Lab Diagnostic Orders */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lab Orders</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">289</span>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">75 Active</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">214 Results Verified &amp; Signed</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-600">
            <span>Avg Turnaround: <b>46m</b></span>
            <span>Fleet: <b>98%</b></span>
          </div>
        </motion.div>

        {/* KPI 5: Daily Hospital Revenue & Claims */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Revenue &amp; Claims</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">$142.8k</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> 94.2%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">First-Pass Claims Approval Rate</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-600">
            <span>Copays Collected: <b>$28.4k</b></span>
            <span className="font-semibold text-primary">Settled</span>
          </div>
        </motion.div>
      </div>

      {/* Main Charts & Flow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 24h Patient Inflow vs Discharge Area Chart (8 Columns) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">24h Patient Inflow vs. Operatory Discharge</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Continuous hourly patient intake tracking across all 6 treatment suites</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span>Inflow (Visits)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <span>Turnover Discharges</span>
              </span>
            </div>
          </div>

          {/* Graphical SVG Chart */}
          <div className="py-6">
            <div className="h-56 sm:h-64 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 800 240">
                <defs>
                  <linearGradient id="gradInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#005c65" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#005c65" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="gradDischarge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1560a4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1560a4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="0" y1="40" x2="800" y2="40" stroke="#f1f4f6" strokeWidth="1" />
                <line x1="0" y1="90" x2="800" y2="90" stroke="#f1f4f6" strokeWidth="1" />
                <line x1="0" y1="140" x2="800" y2="140" stroke="#f1f4f6" strokeWidth="1" />
                <line x1="0" y1="190" x2="800" y2="190" stroke="#f1f4f6" strokeWidth="1" />

                {/* Area 1: Inflow */}
                <path
                  d="M0,200 Q100,160 200,130 T400,60 T600,110 T800,45 L800,240 L0,240 Z"
                  fill="url(#gradInflow)"
                />
                <path
                  d="M0,200 Q100,160 200,130 T400,60 T600,110 T800,45"
                  fill="none"
                  stroke="#005c65"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Area 2: Discharge */}
                <path
                  d="M0,220 Q120,200 220,160 T420,110 T620,130 T800,80 L800,240 L0,240 Z"
                  fill="url(#gradDischarge)"
                />
                <path
                  d="M0,220 Q120,200 220,160 T420,110 T620,130 T800,80"
                  fill="none"
                  stroke="#1560a4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                />

                {/* Interactive Points */}
                <circle cx="400" cy="60" r="5" fill="#005c65" stroke="#ffffff" strokeWidth="2" />
                <circle cx="800" cy="45" r="5" fill="#005c65" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>

            {/* Time labels */}
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 pt-2 px-1">
              <span>06:00 AM</span>
              <span>09:00 AM</span>
              <span>12:00 PM (Peak Surge)</span>
              <span>03:00 PM</span>
              <span>06:00 PM</span>
              <span>09:00 PM</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span>Peak Patient Velocity: <b>38 visits/hour</b> at 11:30 AM</span>
            <button
              onClick={() => navigate('/dashboard/reception')}
              className="text-primary hover:underline font-bold flex items-center gap-1"
            >
              <span>Inspect Live Triage Queue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Department Capacity & Occupancy Meters (4 Columns) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Department Bed &amp; Chair Capacity</h3>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">Live</span>
            </div>

            <div className="space-y-4 pt-4">
              {mockDepartmentMetrics.map((dept) => (
                <div key={dept.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{dept.name}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {dept.occupied} / {dept.capacity} <span className="text-slate-400 font-normal">({dept.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.percentage}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-full rounded-full ${dept.percentage >= 90 ? 'bg-red-500' : dept.percentage >= 80 ? 'bg-amber-500' : 'bg-primary'
                        }`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{dept.onDutyCount} Staff on Duty</span>
                    <span>{dept.capacity - dept.occupied} Available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-bold text-primary block">AI Operatory Rebalance</span>
                <span className="text-[11px] text-slate-500">Waitlist autogap buffer active</span>
              </div>
              <button
                onClick={() => {
                  showToast('success', 'Operatory Buffer Rebalanced', 'Waitlist gap-fills scheduled across Suite 3 and Suite 5');
                }}
                className="px-2.5 py-1 bg-primary text-white text-[11px] font-semibold rounded-lg hover:bg-primary-container transition-colors shadow-sm"
              >
                Optimize
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: Main Surgery Suite Timeline (OR 1-6) + Live Triage Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Main Pavilion OR Timeline (7 Columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                OR
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Main Pavilion OR Schedule (Suites 1–6)</h3>
                <p className="text-xs text-slate-500">Live surgical suite progress &amp; room turnover countdowns</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard/doctors')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View Full Schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2">
            {orSuites.map((suite) => (
              <div
                key={suite.id}
                onClick={() => setSelectedSuiteDetail(suite)}
                className="py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg shrink-0">
                    {suite.suiteNumber}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{suite.currentProcedure}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Surgeon: <span className="font-semibold text-slate-700 dark:text-slate-300">{suite.primarySurgeon}</span> • {suite.assistingStaff}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Next Case: {suite.nextCase}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${suite.status === 'In Surgery'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : suite.status === 'Turnover Cleaning'
                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                        : suite.status === 'Pre-Op Prep'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                    {suite.status}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 font-medium">
                    {suite.startTime} – {suite.estimatedEnd}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Emergency Triage Live Feed (5 Columns) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Live Front-Desk Triage Queue</h3>
              </div>
              <button
                onClick={() => navigate('/dashboard/reception')}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Open Triage Desk
              </button>
            </div>

            <div className="space-y-3 pt-3">
              {mockTriageQueue.slice(0, 5).map((triage) => (
                <div
                  key={triage.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md shrink-0">
                      {triage.tokenNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{triage.patientName}</span>
                        <span className="text-[10px] text-slate-400">({triage.age}y • {triage.gender})</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{triage.chiefComplaint}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Doctor: {triage.assignedDoctor} • Room: {triage.assignedRoom}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${triage.acuity === 'Immediate'
                        ? 'bg-red-100 text-red-700'
                        : triage.acuity === 'Urgent'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                      {triage.acuity}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 font-medium">
                      Wait: {triage.waitTimeMinutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => navigate('/dashboard/reception')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage Reception &amp; Token Dispatch</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Broadcast Modal */}
      <AnimatePresence>
        {broadcastModalOpen && (
          <ModalPortal>
            <div
              onClick={() => setBroadcastModalOpen(false)}
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-200 relative z-10"
              >
                <div className="p-4 bg-red-600 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-300" />
                    <h3 className="font-bold text-sm">Broadcast Emergency Clinical Alert</h3>
                  </div>
                  <button onClick={() => setBroadcastModalOpen(false)} className="text-white/80 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleBroadcast} className="p-5 space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This message will instantly broadcast across all clinic screens, nursing stations, and operatory displays.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Message Text</label>
                    <textarea
                      rows={3}
                      required
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="E.g., Trauma team code yellow in Operatory 1. All available oral surgeons report to Main Pavilion."
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setBroadcastModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
                    >
                      Send Urgent Broadcast
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* Suite Detail Drawer Modal */}
      <AnimatePresence>
        {selectedSuiteDetail && (
          <ModalPortal>
            <div
              onClick={() => setSelectedSuiteDetail(null)}
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 relative z-10"
              >
                <div className="p-5 bg-gradient-to-r from-primary to-primary-container text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-primary-container block">
                      {selectedSuiteDetail.suiteNumber} Inspection
                    </span>
                    <h3 className="font-bold text-base">{selectedSuiteDetail.suiteName}</h3>
                  </div>
                  <button onClick={() => setSelectedSuiteDetail(null)} className="text-white/80 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Procedure:</span>
                      <span className="font-bold text-slate-900">{selectedSuiteDetail.currentProcedure}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Primary Surgeon:</span>
                      <span className="font-bold text-primary">{selectedSuiteDetail.primarySurgeon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assisting Team:</span>
                      <span className="text-slate-700">{selectedSuiteDetail.assistingStaff}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Schedule Window:</span>
                      <span className="font-semibold text-slate-800">{selectedSuiteDetail.startTime} – {selectedSuiteDetail.estimatedEnd}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>Surgical Stage Completion</span>
                      <span>{selectedSuiteDetail.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${selectedSuiteDetail.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-sky-900">
                    <span className="font-bold block text-[11px]">Upcoming Turnover Protocol:</span>
                    <p className="text-[11px] mt-0.5 text-sky-800">{selectedSuiteDetail.nextCase}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedSuiteDetail(null)}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
                  >
                    Close Window
                  </button>
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
}
