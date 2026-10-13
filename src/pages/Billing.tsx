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

export const Billing: React.FC<BillingProps> = ({ onNotify, onOpenPowerBI, onOpenExport }) => {
  const outletCtx = useOutletContext<{
    showToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  } | null>();

  const [claims, setClaims] = useState<BillingClaim[]>(mockBillingClaims);
  const [selectedClaim, setSelectedClaim] = useState<BillingClaim | null>(mockBillingClaims[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClaimStatus>('ALL');

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Revenue Recovery &amp; Billed Comparison</h2>
              <p className="text-xs text-slate-500">6-Month longitudinal review of Gross Invoiced vs Approved Reimbursements</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#005c65]" />
                <span className="text-slate-700 font-medium">Billed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1560a4]" />
                <span className="text-slate-700 font-medium">Reimbursed</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">FY 2026</span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="w-full h-56 relative pt-2">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 640 220">
              <defs>
                <linearGradient id="primaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#007782" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#007782" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="secondaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1560a4" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#1560a4" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line stroke="#ebeef0" strokeDasharray="4" strokeWidth="1" x1="0" x2="640" y1="20" y2="20" />
              <line stroke="#ebeef0" strokeDasharray="4" strokeWidth="1" x1="0" x2="640" y1="70" y2="70" />
              <line stroke="#ebeef0" strokeDasharray="4" strokeWidth="1" x1="0" x2="640" y1="120" y2="120" />
              <line stroke="#ebeef0" strokeDasharray="4" strokeWidth="1" x1="0" x2="640" y1="170" y2="170" />

              {/* Billed Area Path */}
              <path
                d="M 20 130 C 120 110, 180 80, 260 70 C 340 60, 420 40, 500 35 C 560 30, 600 24, 620 22 L 620 180 L 20 180 Z"
                fill="url(#primaryAreaGrad)"
              />
              <path
                d="M 20 130 C 120 110, 180 80, 260 70 C 340 60, 420 40, 500 35 C 560 30, 600 24, 620 22"
                fill="none"
                stroke="#007782"
                strokeLinecap="round"
                strokeWidth="3"
              />

              {/* Reimbursed Area Path */}
              <path
                d="M 20 150 C 120 135, 180 105, 260 95 C 340 85, 420 60, 500 52 C 560 48, 600 42, 620 38 L 620 180 L 20 180 Z"
                fill="url(#secondaryAreaGrad)"
              />
              <path
                d="M 20 150 C 120 135, 180 105, 260 95 C 340 85, 420 60, 500 52 C 560 48, 600 42, 620 38"
                fill="none"
                stroke="#1560a4"
                strokeDasharray="5 4"
                strokeLinecap="round"
                strokeWidth="3"
              />

              {/* Points */}
              <circle cx="260" cy="70" fill="#ffffff" r="4.5" stroke="#007782" strokeWidth="2.5" />
              <circle cx="500" cy="35" fill="#ffffff" r="4.5" stroke="#007782" strokeWidth="2.5" />
              <circle cx="620" cy="22" fill="#007782" r="5" stroke="#ffffff" strokeWidth="2" />
              <circle cx="260" cy="95" fill="#ffffff" r="4" stroke="#1560a4" strokeWidth="2" />
              <circle cx="500" cy="52" fill="#ffffff" r="4" stroke="#1560a4" strokeWidth="2" />
              <circle cx="620" cy="38" fill="#1560a4" r="4.5" stroke="#ffffff" strokeWidth="2" />
            </svg>

            <div className="flex justify-between text-slate-500 text-xs pt-2">
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span className="text-[#005c65] font-bold">Oct (Current)</span>
            </div>
          </div>

          {/* Quick KPI Substrip */}
          <div className="grid grid-cols-3 gap-3 pt-3 mt-2 bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
            <div>
              <span className="text-[11px] text-slate-500 block">Avg Clean Claim Rate</span>
              <span className="text-base font-bold text-[#005c65]">98.1%</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Electronic Remittance (ERA)</span>
              <span className="text-base font-bold text-blue-700">94.7%</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Write-Off Rate</span>
              <span className="text-base font-bold text-teal-700">1.2%</span>
            </div>
          </div>
        </div>

        {/* Payer Mix & Denial Analytics (Col 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Payer Breakdown Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Payer Mix Breakdown</h3>
              <span className="text-xs text-slate-400">Q4 Invoiced</span>
            </div>

            <div className="flex items-center gap-4 my-2">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4.5"
                  />
                  {/* Delta Dental 38% */}
                  <path
                    className="text-[#005c65]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="38, 100"
                    strokeWidth="4.5"
                  />
                  {/* MetLife 24% */}
                  <path
                    className="text-blue-600"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="24, 100"
                    strokeDashoffset="-38"
                    strokeWidth="4.5"
                  />
                  {/* Cigna 22% */}
                  <path
                    className="text-teal-500"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="22, 100"
                    strokeDashoffset="-62"
                    strokeWidth="4.5"
                  />
                  {/* Self-Pay 16% */}
                  <path
                    className="text-slate-300"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="16, 100"
                    strokeDashoffset="-84"
                    strokeWidth="4.5"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-slate-800">100%</span>
                  <span className="text-[10px] text-slate-400">Pool</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-0 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-[#005c65]" /> Delta Dental
                  </span>
                  <span className="font-semibold text-slate-900">38%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-blue-600" /> MetLife PDP
                  </span>
                  <span className="font-semibold text-slate-900">24%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-teal-500" /> Cigna Dental
                  </span>
                  <span className="font-semibold text-slate-900">22%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-slate-300" /> Self-Pay / Copay
                  </span>
                  <span className="font-semibold text-slate-900">16%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Denial Root Causes */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">Denial Root Causes</h3>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                Action Required
              </span>
            </div>
            <div className="flex flex-col gap-2 mt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Missing Radiograph / Narrative</span>
                  <span className="text-red-600 font-semibold">35%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: '35%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Coding Discrepancy (CDT vs CPT)</span>
                  <span className="text-blue-600 font-semibold">28%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '28%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Max Benefit Frequency Exceeded</span>
                  <span className="text-teal-600 font-semibold">22%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#005c65] h-full rounded-full" style={{ width: '22%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Timely Filing Limit</span>
                  <span className="text-slate-400 font-semibold">15%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-300 h-full rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
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
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setInvoiceModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl p-6 overflow-hidden"
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
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setBatchEdiModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 overflow-hidden"
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
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSuperbillModalOpen(false)}
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
