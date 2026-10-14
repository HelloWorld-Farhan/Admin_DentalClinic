import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Plus,
  Search,
  Download,
  X,
  CreditCard,
  Building,
  Check,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Sparkles,
  RefreshCw,
  Sliders,
  PieChart,
  Info,
} from 'lucide-react';
import { mockBillingClaims } from '../data/mockData';
import { BillingClaim, ClaimStatus } from '../types';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ModalPortal } from '../components/ModalPortal';

interface BillingProps {
  onNotify?: (title: string, message: string, type: 'critical' | 'financial' | 'triage' | 'system') => void;
  onOpenPowerBI?: () => void;
  onOpenExport?: () => void;
}

export interface BillingMonthPoint {
  month: string;
  cx: number;
  cyBilled: number;
  cyReimbursed: number;
  billed: number;
  reimbursed: number;
  cleanRate: string;
  eraRate: string;
  variance: number;
  claimsCount: number;
  isCurrent?: boolean;
}

export interface PayerSegment {
  id: string;
  name: string;
  pct: number;
  amount: number;
  claims: number;
  avgDays: number;
  color: string;
  dashArray: string;
  dashOffset: number;
}

const DEFAULT_DENIAL_CAUSES = [
  { id: 'dc-1', name: 'Missing Radiograph / Narrative', percentage: 35, color: 'bg-red-500', barColor: '#ef4444', claimsBlocked: 14, atRiskAmount: 64200 },
  { id: 'dc-2', name: 'Coding Discrepancy (CDT vs CPT)', percentage: 28, color: 'bg-blue-600', barColor: '#2563eb', claimsBlocked: 11, atRiskAmount: 48500 },
  { id: 'dc-3', name: 'Max Benefit Frequency Exceeded', percentage: 22, color: 'bg-[#005c65]', barColor: '#005c65', claimsBlocked: 9, atRiskAmount: 38100 },
  { id: 'dc-4', name: 'Timely Filing Limit', percentage: 15, color: 'bg-slate-400', barColor: '#94a3b8', claimsBlocked: 6, atRiskAmount: 24300 },
];

export const Billing: React.FC<BillingProps> = ({ onNotify, onOpenPowerBI, onOpenExport }) => {
  const outletCtx = useOutletContext<{
    showToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  } | null>();

  const [claims, setClaims] = useState<BillingClaim[]>(mockBillingClaims);
  const [selectedClaim, setSelectedClaim] = useState<BillingClaim | null>(mockBillingClaims[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClaimStatus>('ALL');

  // Power BI Financial Analytics Interactive State
  const [selectedFY, setSelectedFY] = useState<'FY 2026' | 'FY 2025' | 'Q4'>('FY 2026');
  const [hoveredBillingMonth, setHoveredBillingMonth] = useState<BillingMonthPoint | null>(null);
  const [hoveredPayer, setHoveredPayer] = useState<PayerSegment | null>(null);

  // Denial Root Causes State with LocalStorage Persistence
  const STORAGE_KEY_DENIALS = 'smileclinic_billing_denial_causes';
  const [denialCauses, setDenialCauses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DENIALS);
      return saved ? JSON.parse(saved) : DEFAULT_DENIAL_CAUSES;
    } catch {
      return DEFAULT_DENIAL_CAUSES;
    }
  });

  const handleRemediateDenial = (id: string, name: string) => {
    const updated = denialCauses.map((dc: any) => {
      if (dc.id === id) {
        const newPct = Math.max(5, dc.percentage - 12);
        return { ...dc, percentage: newPct, claimsBlocked: Math.max(1, dc.claimsBlocked - 4), atRiskAmount: Math.round(dc.atRiskAmount * 0.6) };
      }
      return dc;
    });
    setDenialCauses(updated);
    localStorage.setItem(STORAGE_KEY_DENIALS, JSON.stringify(updated));
    outletCtx?.showToast?.('success', 'AI Denial Auto-Remediation Executed', `Applied pre-submission radiograph/narrative batch validation to resolve "${name}".`);
  };

  const handleResetDenials = () => {
    localStorage.removeItem(STORAGE_KEY_DENIALS);
    setDenialCauses(DEFAULT_DENIAL_CAUSES);
    outletCtx?.showToast?.('info', 'Denial Benchmarks Reset', 'Root cause percentages restored to clinical default baseline.');
  };

  const payerSegments: PayerSegment[] = [
    { id: 'delta', name: 'Delta Dental Premier PPO', pct: 38, amount: 563500, claims: 182, avgDays: 12.4, color: '#005c65', dashArray: '38, 100', dashOffset: 0 },
    { id: 'metlife', name: 'MetLife PDP Plus', pct: 24, amount: 355900, claims: 114, avgDays: 14.8, color: '#2563eb', dashArray: '24, 100', dashOffset: -38 },
    { id: 'cigna', name: 'Cigna Dental Total Cigna DPPO', pct: 22, amount: 326200, claims: 98, avgDays: 13.2, color: '#0d9488', dashArray: '22, 100', dashOffset: -62 },
    { id: 'selfpay', name: 'Self-Pay / Patient Copay', pct: 16, amount: 237300, claims: 76, avgDays: 1.0, color: '#94a3b8', dashArray: '16, 100', dashOffset: -84 },
  ];

  const monthlyDataPoints: Record<'FY 2026' | 'FY 2025' | 'Q4', BillingMonthPoint[]> = {
    'FY 2026': [
      { month: 'May', cx: 20, cyBilled: 130, cyReimbursed: 150, billed: 1120000, reimbursed: 1050000, cleanRate: '97.2%', eraRate: '92.4%', variance: 70000, claimsCount: 242 },
      { month: 'Jun', cx: 140, cyBilled: 105, cyReimbursed: 130, billed: 1210000, reimbursed: 1145000, cleanRate: '97.6%', eraRate: '93.1%', variance: 65000, claimsCount: 265 },
      { month: 'Jul', cx: 260, cyBilled: 70, cyReimbursed: 95, billed: 1295000, reimbursed: 1230000, cleanRate: '97.9%', eraRate: '93.8%', variance: 65000, claimsCount: 280 },
      { month: 'Aug', cx: 380, cyBilled: 50, cyReimbursed: 75, billed: 1380000, reimbursed: 1310000, cleanRate: '98.0%', eraRate: '94.2%', variance: 70000, claimsCount: 298 },
      { month: 'Sep', cx: 500, cyBilled: 35, cyReimbursed: 52, billed: 1440000, reimbursed: 1375000, cleanRate: '98.1%', eraRate: '94.5%', variance: 65000, claimsCount: 308 },
      { month: 'Oct (Current)', cx: 620, cyBilled: 22, cyReimbursed: 38, billed: 1482900, reimbursed: 1429515, cleanRate: '98.1%', eraRate: '94.7%', variance: 53385, claimsCount: 318, isCurrent: true },
    ],
    'FY 2025': [
      { month: 'May', cx: 20, cyBilled: 150, cyReimbursed: 170, billed: 980000, reimbursed: 910000, cleanRate: '95.4%', eraRate: '89.2%', variance: 70000, claimsCount: 210 },
      { month: 'Jun', cx: 140, cyBilled: 135, cyReimbursed: 155, billed: 1050000, reimbursed: 985000, cleanRate: '96.1%', eraRate: '90.5%', variance: 65000, claimsCount: 228 },
      { month: 'Jul', cx: 260, cyBilled: 110, cyReimbursed: 130, billed: 1120000, reimbursed: 1060000, cleanRate: '96.5%', eraRate: '91.2%', variance: 60000, claimsCount: 245 },
      { month: 'Aug', cx: 380, cyBilled: 95, cyReimbursed: 115, billed: 1180000, reimbursed: 1120000, cleanRate: '96.8%', eraRate: '91.8%', variance: 60000, claimsCount: 256 },
      { month: 'Sep', cx: 500, cyBilled: 80, cyReimbursed: 100, billed: 1240000, reimbursed: 1180000, cleanRate: '97.0%', eraRate: '92.3%', variance: 60000, claimsCount: 270 },
      { month: 'Oct', cx: 620, cyBilled: 65, cyReimbursed: 85, billed: 1310000, reimbursed: 1255000, cleanRate: '97.3%', eraRate: '93.0%', variance: 55000, claimsCount: 285 },
    ],
    'Q4': [
      { month: 'Aug', cx: 50, cyBilled: 90, cyReimbursed: 110, billed: 460000, reimbursed: 435000, cleanRate: '98.0%', eraRate: '94.2%', variance: 25000, claimsCount: 98 },
      { month: 'Sep', cx: 240, cyBilled: 65, cyReimbursed: 85, billed: 480000, reimbursed: 458000, cleanRate: '98.1%', eraRate: '94.5%', variance: 22000, claimsCount: 105 },
      { month: 'Oct (M-T-D)', cx: 430, cyBilled: 35, cyReimbursed: 52, billed: 542900, reimbursed: 536515, cleanRate: '98.1%', eraRate: '94.7%', variance: 6385, claimsCount: 115, isCurrent: true },
      { month: 'Nov (Proj)', cx: 620, cyBilled: 20, cyReimbursed: 35, billed: 560000, reimbursed: 545000, cleanRate: '98.5%', eraRate: '95.0%', variance: 15000, claimsCount: 120 },
    ],
  };

  const billingPaths = {
    'FY 2026': {
      billedArea: 'M 20 130 C 120 110, 180 80, 260 70 C 340 60, 420 40, 500 35 C 560 30, 600 24, 620 22 L 620 180 L 20 180 Z',
      billedLine: 'M 20 130 C 120 110, 180 80, 260 70 C 340 60, 420 40, 500 35 C 560 30, 600 24, 620 22',
      reimbursedArea: 'M 20 150 C 120 135, 180 105, 260 95 C 340 85, 420 60, 500 52 C 560 48, 600 42, 620 38 L 620 180 L 20 180 Z',
      reimbursedLine: 'M 20 150 C 120 135, 180 105, 260 95 C 340 85, 420 60, 500 52 C 560 48, 600 42, 620 38',
    },
    'FY 2025': {
      billedArea: 'M 20 150 C 120 135, 180 110, 260 110 C 340 95, 420 80, 500 80 C 560 65, 600 65, 620 65 L 620 180 L 20 180 Z',
      billedLine: 'M 20 150 C 120 135, 180 110, 260 110 C 340 95, 420 80, 500 80 C 560 65, 600 65, 620 65',
      reimbursedArea: 'M 20 170 C 120 155, 180 130, 260 130 C 340 115, 420 100, 500 100 C 560 85, 600 85, 620 85 L 620 180 L 20 180 Z',
      reimbursedLine: 'M 20 170 C 120 155, 180 130, 260 130 C 340 115, 420 100, 500 100 C 560 85, 600 85, 620 85',
    },
    'Q4': {
      billedArea: 'M 50 90 C 150 75, 240 65, 340 50 C 430 35, 520 25, 620 20 L 620 180 L 50 180 Z',
      billedLine: 'M 50 90 C 150 75, 240 65, 340 50 C 430 35, 520 25, 620 20',
      reimbursedArea: 'M 50 110 C 150 95, 240 85, 340 70 C 430 52, 520 40, 620 35 L 620 180 L 50 180 Z',
      reimbursedLine: 'M 50 110 C 150 95, 240 85, 340 70 C 430 52, 520 40, 620 35',
    },
  };

  const currentMonthlyPoints = monthlyDataPoints[selectedFY];

  // Modals
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [batchEdiModalOpen, setBatchEdiModalOpen] = useState(false);
  const [superbillModalOpen, setSuperbillModalOpen] = useState(false);

  // Freeze background scrolling when any billing modal is open
  const isAnyModalOpen = Boolean(invoiceModalOpen || batchEdiModalOpen || superbillModalOpen);
  useBodyScrollLock(isAnyModalOpen);

  // New Invoice Form with Sensible Defaults so clicking Generate immediately works
  const [newInvoice, setNewInvoice] = useState({
    patientName: 'Jessica Montgomery',
    mrn: 'MRN-60117',
    procedureName: 'Full Arch Fixed Restoration (All-on-4)',
    cdtCode: 'D6010, D6058, D6114',
    billedAmount: 4850.0,
    insuranceCoverage: 3880.0,
    patientCopay: 970.0,
    insuranceProvider: 'Delta Dental Premier PPO',
  });

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchSearch =
        claim.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.insuranceProvider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.procedureName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || claim.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [claims, searchQuery, statusFilter]);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const patientName = newInvoice.patientName.trim() || 'Jessica Montgomery';
    const mrn = newInvoice.mrn.trim() || `MRN-${Math.floor(10000 + Math.random() * 90000)}`;

    const created: BillingClaim = {
      id: `claim-${Date.now()}`,
      claimNumber: `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName,
      mrn,
      insuranceProvider: newInvoice.insuranceProvider,
      cdtCodes: newInvoice.cdtCode.split(',').map((s) => s.trim()),
      procedureName: newInvoice.procedureName || 'Full Arch Fixed Restoration (All-on-4)',
      billedAmount: Number(newInvoice.billedAmount) || 4850,
      insuranceCoverage: Number(newInvoice.insuranceCoverage) || 3880,
      patientCopay: Number(newInvoice.patientCopay) || 970,
      submissionDate: 'Today (Pending Adjudication)',
      status: 'Processing',
      hasRadiographs: true,
    };

    setClaims([created, ...claims]);
    setSelectedClaim(created);
    setInvoiceModalOpen(false);
    outletCtx?.showToast?.(
      'success',
      'Clinical Invoice Formulated',
      `Claim ${created.claimNumber} generated for ${created.patientName} ($${created.billedAmount.toLocaleString()}) and posted to ledger.`
    );
    onNotify?.(
      'New Inpatient Invoice Formulated',
      `Claim ${created.claimNumber} generated for ${created.patientName} ($${created.billedAmount.toLocaleString()})`,
      'financial'
    );
  };

  const handleBatchEdiSubmit = () => {
    setBatchEdiModalOpen(false);
    outletCtx?.showToast?.(
      'success',
      'EDI 837D Dental Batch Transmitted',
      '48 claims securely pushed to Change Healthcare Clearinghouse.'
    );
    onNotify?.(
      'EDI 837D Dental Batch Transmitted',
      '48 claims securely pushed to Change Healthcare Clearinghouse (ANSI ASC X12 Standards)',
      'financial'
    );
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Approved
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Under Review
          </span>
        );
      case 'Pending Docs':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending Docs
          </span>
        );
      case 'Denied':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Denied
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Bar / Breadcrumb & High-Level Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
            <span>Finance &amp; Operations</span>
            <span>•</span>
            <span className="text-[#005c65]">Revenue Cycle Management</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Billing Team &amp; Revenue Cycle Administration
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Claims processing, insurance pre-authorization, patient invoices, and hospital ledger reconciliation
          </p>
        </div>

        {/* Quick Toolstrip Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenPowerBI && (
            <button
              onClick={onOpenPowerBI}
              className="flex items-center gap-2 px-4 h-10 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-sm font-semibold transition-all shadow-sm"
            >
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>Financial Power BI</span>
            </button>
          )}

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-2 px-4 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export CMS-1500</span>
            </button>
          )}

          <button
            onClick={() => setBatchEdiModalOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium transition-all shadow-sm"
          >
            <Send className="w-4 h-4 text-blue-600" />
            <span>Batch EDI 837 Submission</span>
          </button>

          <button
            onClick={() => setInvoiceModalOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-[#005c65] hover:bg-[#007782] text-white text-sm font-semibold shadow-md shadow-[#005c65]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Invoice</span>
          </button>
        </div>
      </div>

      {/* Primary Metric Bento Strip (4 KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Gross Billed Revenue */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Gross Billed Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#005c65]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">$1,482,900</div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="text-teal-600 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +12.4%
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#005c65] h-full rounded-full" style={{ width: '78%' }} />
          </div>
        </div>

        {/* Card 2: Claims Approval Rate */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Claims Approval Rate</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">96.4%</div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="text-teal-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Target 92%
              </span>
              <span className="text-slate-400">+4.4% cushion</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-teal-600 h-full rounded-full" style={{ width: '96.4%' }} />
          </div>
        </div>

        {/* Card 3: Pending Adjudication */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Pending Adjudication</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">$184,200</div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="text-blue-700 font-semibold">48 claims</span>
              <span className="text-slate-400">in active review</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '42%' }} />
          </div>
        </div>

        {/* Card 4: Avg Reimbursement Cycle */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Avg Reimbursement Cycle
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-teal-100 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              14.2 <span className="text-base font-normal text-slate-400">Days</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="text-teal-600 font-semibold">-2.1 Days</span>
              <span className="text-slate-400">faster turn-around</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#005c65] h-full rounded-full" style={{ width: '82%' }} />
          </div>
        </div>
      </div>

      {/* Analytical Charts & Visualizers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Trend Graph (Col 8) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#007782]" />
                <h2 className="text-base font-bold text-slate-900">Revenue Recovery &amp; Billed Comparison</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">6-Month longitudinal review of Gross Invoiced vs Approved Reimbursements</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* FY Slicer Tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {(['FY 2026', 'FY 2025', 'Q4'] as const).map((fy) => (
                  <button
                    key={fy}
                    onClick={() => {
                      setSelectedFY(fy);
                      setHoveredBillingMonth(null);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                      selectedFY === fy
                        ? 'bg-white text-[#005c65] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {fy}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#005c65]" />
                <span className="text-slate-700 font-medium">Billed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1560a4]" />
                <span className="text-slate-700 font-medium">Reimbursed</span>
              </div>
            </div>
          </div>

          {/* SVG Chart with Power BI Interactive Tooltip Preview */}
          <div className="w-full h-56 relative pt-2">
            <svg 
              className="w-full h-full overflow-visible" 
              preserveAspectRatio="none" 
              viewBox="0 0 640 220"
              onMouseLeave={() => setHoveredBillingMonth(null)}
            >
              <defs>
                <linearGradient id="primaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#007782" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#007782" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="secondaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1560a4" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#1560a4" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glowBilling" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#007782" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Grid Lines */}
              <line stroke="#ebeef0" strokeDasharray="4" strokeWidth="1" x1="0" x2="640" y1="20" y2="20" />
              <line stroke="#ebeef0" strokeDasharray="4" strokeWidth="1" x1="0" x2="640" y1="70" y2="70" />
              <line stroke="#ebeef0" strokeDasharray="4" strokeWidth="1" x1="0" x2="640" y1="120" y2="120" />
              <line stroke="#ebeef0" strokeDasharray="4" strokeWidth="1" x1="0" x2="640" y1="170" y2="170" />

              {/* Hover Cursor Guideline */}
              {hoveredBillingMonth && (
                <motion.line
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  x1={hoveredBillingMonth.cx}
                  y1="10"
                  x2={hoveredBillingMonth.cx}
                  y2="190"
                  stroke="#005c65"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
              )}

              {/* Billed Area Path */}
              <motion.path
                key={`billed-area-${selectedFY}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                d={billingPaths[selectedFY].billedArea}
                fill="url(#primaryAreaGrad)"
              />
              <motion.path
                key={`billed-line-${selectedFY}`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                d={billingPaths[selectedFY].billedLine}
                fill="none"
                stroke="#007782"
                strokeLinecap="round"
                strokeWidth="3"
              />

              {/* Reimbursed Area Path */}
              <motion.path
                key={`reimb-area-${selectedFY}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                d={billingPaths[selectedFY].reimbursedArea}
                fill="url(#secondaryAreaGrad)"
              />
              <motion.path
                key={`reimb-line-${selectedFY}`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                d={billingPaths[selectedFY].reimbursedLine}
                fill="none"
                stroke="#1560a4"
                strokeDasharray="5 4"
                strokeLinecap="round"
                strokeWidth="3"
              />

              {/* Interactive Month Nodes */}
              {currentMonthlyPoints.map((pt, idx) => {
                const isHovered = hoveredBillingMonth?.month === pt.month;
                return (
                  <g 
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredBillingMonth(pt)}
                  >
                    {/* Hover Hitbox */}
                    <rect
                      x={pt.cx - 22}
                      y={0}
                      width={44}
                      height={200}
                      fill="transparent"
                    />

                    {/* Billed Node */}
                    <circle
                      cx={pt.cx}
                      cy={pt.cyBilled}
                      r={isHovered ? 7 : pt.isCurrent ? 5.5 : 4.5}
                      fill={isHovered ? '#007782' : pt.isCurrent ? '#007782' : '#ffffff'}
                      stroke="#007782"
                      strokeWidth={isHovered ? 3 : 2.5}
                      className="transition-all duration-200"
                      filter={isHovered ? 'url(#glowBilling)' : undefined}
                    />

                    {/* Reimbursed Node */}
                    <circle
                      cx={pt.cx}
                      cy={pt.cyReimbursed}
                      r={isHovered ? 6 : pt.isCurrent ? 5 : 4}
                      fill={isHovered ? '#1560a4' : pt.isCurrent ? '#1560a4' : '#ffffff'}
                      stroke="#1560a4"
                      strokeWidth={2}
                      className="transition-all duration-200"
                    />

                    {/* Concentric Ping on Hover */}
                    {isHovered && (
                      <circle
                        cx={pt.cx}
                        cy={pt.cyBilled}
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
              {hoveredBillingMonth && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    left: `${Math.min(Math.max((hoveredBillingMonth.cx / 640) * 100, 15), 78)}%`,
                    top: '5px'
                  }}
                  className="absolute -translate-x-1/2 z-20 pointer-events-none w-64 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-slate-700/80 p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      <span>{hoveredBillingMonth.month}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {hoveredBillingMonth.isCurrent ? 'Current Period' : selectedFY}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between bg-slate-800/60 p-1.5 rounded-lg">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-[#007782]" />
                        Gross Invoiced:
                      </span>
                      <span className="font-bold text-white text-sm">
                        ${hoveredBillingMonth.billed.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-800/60 p-1.5 rounded-lg">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-[#1560a4]" />
                        Reimbursed:
                      </span>
                      <span className="font-bold text-blue-300 text-sm">
                        ${hoveredBillingMonth.reimbursed.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-400">
                      <div>
                        <span>Clean Claim Pass:</span>
                        <span className="block font-bold text-emerald-400">{hoveredBillingMonth.cleanRate}</span>
                      </div>
                      <div>
                        <span>Adjudicated:</span>
                        <span className="block font-bold text-slate-200">{hoveredBillingMonth.claimsCount} claims</span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Remittance (ERA): <b className="text-white">{hoveredBillingMonth.eraRate}</b></span>
                      <span className="text-teal-400 font-semibold">Yield: {((hoveredBillingMonth.reimbursed / hoveredBillingMonth.billed) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Month Labels with Interactive Clicks */}
            <div className="flex justify-between text-slate-500 text-xs pt-2">
              {currentMonthlyPoints.map((pt, idx) => (
                <button
                  key={idx}
                  onClick={() => setHoveredBillingMonth(pt)}
                  className={`transition-colors hover:text-[#005c65] ${
                    pt.isCurrent
                      ? 'text-[#005c65] font-bold'
                      : hoveredBillingMonth?.month === pt.month
                      ? 'text-[#005c65] font-semibold underline'
                      : ''
                  }`}
                >
                  {pt.month}
                </button>
              ))}
            </div>
          </div>

          {/* Quick KPI Substrip */}
          <div className="grid grid-cols-3 gap-3 pt-3 mt-2 bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
            <div className="hover:bg-white p-1 rounded-md transition-all cursor-pointer">
              <span className="text-[11px] text-slate-500 block">Avg Clean Claim Rate</span>
              <span className="text-base font-bold text-[#005c65]">98.1%</span>
            </div>
            <div className="hover:bg-white p-1 rounded-md transition-all cursor-pointer">
              <span className="text-[11px] text-slate-500 block">Electronic Remittance (ERA)</span>
              <span className="text-base font-bold text-blue-700">94.7%</span>
            </div>
            <div className="hover:bg-white p-1 rounded-md transition-all cursor-pointer">
              <span className="text-[11px] text-slate-500 block">Write-Off Rate</span>
              <span className="text-base font-bold text-teal-700">1.2%</span>
            </div>
          </div>
        </div>

        {/* Payer Mix & Denial Analytics (Col 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Payer Breakdown Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-[#005c65]" />
                <h3 className="text-base font-bold text-slate-900">Payer Mix Breakdown</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">Q4 Invoiced</span>
            </div>

            <div className="flex items-center gap-4 my-2">
              <div 
                className="relative w-28 h-28 shrink-0 flex items-center justify-center cursor-pointer"
                onMouseLeave={() => setHoveredPayer(null)}
              >
                <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-slate-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4.5"
                  />
                  {/* Payer Segments */}
                  {payerSegments.map((seg) => {
                    const isHovered = hoveredPayer?.id === seg.id;
                    return (
                      <path
                        key={seg.id}
                        onMouseEnter={() => setHoveredPayer(seg)}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={seg.color}
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={seg.dashOffset}
                        strokeWidth={isHovered ? 6 : 4.5}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    );
                  })}
                </svg>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
                  {hoveredPayer ? (
                    <motion.div
                      key={hoveredPayer.id}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {hoveredPayer.pct}%
                      </span>
                      <span className="text-[9px] font-semibold text-primary truncate max-w-[70px]">
                        ${(hoveredPayer.amount / 1000).toFixed(0)}k
                      </span>
                    </motion.div>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-slate-800">100%</span>
                      <span className="text-[10px] text-slate-400">Pool</span>
                    </>
                  )}
                </div>
              </div>

              {/* Payer Legend List */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0 text-xs">
                {payerSegments.map((seg) => {
                  const isHovered = hoveredPayer?.id === seg.id;
                  return (
                    <div 
                      key={seg.id}
                      onMouseEnter={() => setHoveredPayer(seg)}
                      onMouseLeave={() => setHoveredPayer(null)}
                      className={`flex items-center justify-between p-1 rounded-md transition-all cursor-pointer ${
                        isHovered ? 'bg-slate-100/90 font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: seg.color }}
                        /> 
                        <span className="truncate">{seg.name}</span>
                      </span>
                      <span className="font-semibold text-slate-900 shrink-0 ml-1">{seg.pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Floating Tooltip Card for Payer Details */}
            <AnimatePresence>
              {hoveredPayer && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="mt-2 p-2.5 bg-slate-900 text-white rounded-lg text-xs space-y-1 shadow-lg"
                >
                  <div className="flex justify-between items-center font-bold text-teal-300">
                    <span className="truncate">{hoveredPayer.name}</span>
                    <span>${hoveredPayer.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{hoveredPayer.claims} Active Claims</span>
                    <span>Avg Turnaround: <b>{hoveredPayer.avgDays} Days</b></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Denial Root Causes with AI Remediate & Persistence */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900">Denial Root Causes</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                Action Required
              </span>
            </div>

            <div className="flex flex-col gap-2.5 mt-1">
              {denialCauses.map((cause: any) => (
                <div 
                  key={cause.id}
                  className="group relative p-1.5 rounded-lg transition-colors hover:bg-slate-50"
                >
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium truncate max-w-[210px]">{cause.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{cause.percentage}%</span>
                      <button
                        onClick={() => handleRemediateDenial(cause.id, cause.name)}
                        title="Auto-remediate with AI batch validation"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-primary text-white px-1.5 py-0.5 rounded hover:bg-primary-container"
                      >
                        Auto-Fix
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cause.percentage}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-full rounded-full ${cause.color}`} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>{cause.claimsBlocked} Claims Blocked</span>
                    <span>${cause.atRiskAmount.toLocaleString()} at risk</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>AI Radiography validator active</span>
              <button 
                onClick={handleResetDenials}
                className="text-[10px] text-slate-400 hover:text-slate-600 underline"
              >
                Reset Benchmarks
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Master Ledger Table & Detail Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {/* Table Filter Bar Header */}
        <div className="p-4 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by Claim ID, Patient, or Insurer..."
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
              />
            </div>

            {/* Segmented Filter Pills */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg">
              {(['ALL', 'Processing', 'Approved', 'Pending Docs', 'Denied'] as const).map((st) => {
                const count = st === 'ALL' ? claims.length : claims.filter((c) => c.status === st).length;
                return (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 text-xs rounded-md transition-all flex items-center gap-1.5 ${
                      statusFilter === st
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{st === 'ALL' ? 'All' : st}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      statusFilter === st ? 'bg-[#005c65]/10 text-[#005c65]' : 'bg-slate-200/80 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => onNotify?.('Filter Applied', 'Showing all claims sorting by highest balance due', 'system')}
              className="h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-xs font-semibold"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Sort: Balance</span>
            </button>
          </div>
        </div>

        {/* Ledger Table Element */}
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Claim &amp; MRN</th>
                <th className="py-3 px-4">Patient &amp; Clinical Encounter</th>
                <th className="py-3 px-4">Insurer / Payer</th>
                <th className="py-3 px-4 text-right">Billed / Expected</th>
                <th className="py-3 px-4 text-right">Patient Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CreditCard className="w-10 h-10 text-slate-300" />
                      <p className="text-sm font-bold text-slate-700">No claims match the filter criteria</p>
                      <p className="text-xs text-slate-400">Try clearing your search or selecting &ldquo;All&rdquo; claims</p>
                      <button
                        onClick={() => {
                          setStatusFilter('ALL');
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
                filteredClaims.map((claim) => {
                  const isSelected = selectedClaim?.id === claim.id;
                  return (
                    <tr
                      key={claim.id}
                      onClick={() => setSelectedClaim(claim)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      isSelected ? 'bg-teal-50/60 dark:bg-teal-950/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-[#005c65] flex items-center gap-1 font-mono">
                        <span>{claim.claimNumber}</span>
                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">{claim.mrn}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{claim.patientName}</div>
                      <div className="text-slate-500 truncate max-w-[200px]">{claim.procedureName}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{claim.insuranceProvider}</div>
                      <div className="text-slate-400 text-[11px]">
                        CDT: {claim.cdtCodes.join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-bold text-slate-900">${claim.billedAmount.toLocaleString()}</div>
                      <div className="text-teal-600 text-[11px] font-semibold">
                        Exp: ${claim.insuranceCoverage.toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-semibold text-slate-900">${claim.patientCopay.toLocaleString()}</div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-semibold">
                        Copay
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">{getStatusBadge(claim.status)}</td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setSelectedClaim(claim);
                            setSuperbillModalOpen(true);
                          }}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-[#005c65] transition-all"
                          title="View Superbill"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            onNotify?.(
                              'CMS-1500 PDF Ready',
                              `Standard claim form downloaded for ${claim.patientName}`,
                              'system'
                            );
                          }}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-[#005c65] transition-all"
                          title="Download CMS-1500"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredClaims.length} billing claims in cycle</span>
          <span className="font-semibold text-[#005c65]">Total Active Ledger: $1,482,900.00</span>
        </div>
      </div>

      {/* MODAL 1: Create New Invoice */}
      <AnimatePresence>
        {invoiceModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setInvoiceModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl p-4 sm:p-6 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#005c65] flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Formulate Clinical Invoice</h3>
                    <p className="text-xs text-slate-500">Itemize surgical CDT codes, insurance coverage &amp; copay</p>
                  </div>
                </div>
                <button
                  onClick={() => setInvoiceModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Patient Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jessica Montgomery"
                      value={newInvoice.patientName}
                      onChange={(e) => setNewInvoice({ ...newInvoice, patientName: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">MRN</label>
                    <input
                      type="text"
                      readOnly
                      value={newInvoice.mrn}
                      className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Procedure Description</label>
                  <input
                    type="text"
                    value={newInvoice.procedureName}
                    onChange={(e) => setNewInvoice({ ...newInvoice, procedureName: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Gross Billed ($)</label>
                    <input
                      type="number"
                      value={newInvoice.billedAmount}
                      onChange={(e) => setNewInvoice({ ...newInvoice, billedAmount: Number(e.target.value) })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Ins. Coverage ($)</label>
                    <input
                      type="number"
                      value={newInvoice.insuranceCoverage}
                      onChange={(e) => setNewInvoice({ ...newInvoice, insuranceCoverage: Number(e.target.value) })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Patient Copay ($)</label>
                    <input
                      type="number"
                      value={newInvoice.patientCopay}
                      onChange={(e) => setNewInvoice({ ...newInvoice, patientCopay: Number(e.target.value) })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setInvoiceModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#005c65] hover:bg-[#007782] text-white rounded-lg text-sm font-semibold shadow-md"
                  >
                    Generate Invoice &amp; Post to Ledger
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* MODAL 2: Batch EDI 837 Submission */}
      <AnimatePresence>
        {batchEdiModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setBatchEdiModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-4 sm:p-6 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Batch EDI 837D Transmission</h3>
                    <p className="text-xs text-slate-500">Electronic Dental Claim Transmission</p>
                  </div>
                </div>
                <button
                  onClick={() => setBatchEdiModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Clearinghouse:</span>
                    <span className="font-semibold text-slate-800">Change Healthcare / Optum</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pending Claims in Batch:</span>
                    <span className="font-semibold text-[#005c65]">48 Claims</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Billed Volume:</span>
                    <span className="font-semibold text-slate-800">$184,200.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">DICOM Radiographs Attached:</span>
                    <span className="font-semibold text-teal-600">100% Verified</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Submitting this batch will generate transaction control numbers (ST-SE segments) and trigger automated 277CA acceptance acknowledgments.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setBatchEdiModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBatchEdiSubmit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md"
                >
                  Transmit EDI Batch Now
                </button>
              </div>
            </motion.div>
          </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* MODAL 3: View Superbill */}
      <AnimatePresence>
        {superbillModalOpen && selectedClaim && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSuperbillModalOpen(false)}
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
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Hospital Superbill Breakdown</h3>
                    <p className="text-xs text-slate-500">{selectedClaim.claimNumber} • {selectedClaim.patientName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSuperbillModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500 font-semibold">Service Description</span>
                    <span className="font-semibold text-slate-900">{selectedClaim.procedureName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payer / Plan:</span>
                    <span className="font-semibold text-slate-800">{selectedClaim.insuranceProvider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Invoiced:</span>
                    <span className="font-bold text-slate-900">${selectedClaim.billedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Insurer Payment Expected:</span>
                    <span className="font-bold text-teal-700">${selectedClaim.insuranceCoverage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient Responsibility (Copay):</span>
                    <span className="font-bold text-blue-700">${selectedClaim.patientCopay.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSuperbillModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSuperbillModalOpen(false);
                    onNotify?.('Superbill Exported', 'Clean PDF statement saved to downloads folder.', 'system');
                  }}
                  className="px-5 py-2 bg-[#005c65] text-white rounded-lg text-sm font-semibold hover:bg-[#007782]"
                >
                  Download PDF Statement
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
