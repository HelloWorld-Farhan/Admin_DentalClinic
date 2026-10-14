import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Activity, 
  RefreshCw, 
  Download, 
  X, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Sliders,
  Save,
  Database,
  ArrowUpRight,
  PieChart,
  Clock,
  RotateCcw,
  Info,
  DollarSign
} from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ModalPortal } from './ModalPortal';

interface PowerBIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport?: () => void;
}

interface CustomTargets {
  productionTarget: string;
  cleanClaimTarget: string;
  turnoverTarget: string;
  occupancyTarget: string;
}

const DEFAULT_TARGETS: CustomTargets = {
  productionTarget: '$150,000',
  cleanClaimTarget: '95.0%',
  turnoverTarget: '10.5 min',
  occupancyTarget: '90.0%'
};

export default function PowerBIModal({ isOpen, onClose }: PowerBIModalProps) {
  useBodyScrollLock(isOpen);

  // Power BI Controls
  const [activeReportTab, setActiveReportTab] = useState<'financial' | 'operatory' | 'lab' | 'payer'>('financial');
  const [selectedRange, setSelectedRange] = useState<'24h' | '7d' | '30d' | 'ytd'>('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // Tooltip Hover States
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    value1: string;
    label1: string;
    value2: string;
    label2: string;
    x: number;
    y: number;
    change?: string;
  } | null>(null);

  const [hoveredDept, setHoveredDept] = useState<number | null>(null);
  const [hoveredPayer, setHoveredPayer] = useState<string | null>(null);

  // Persistent Custom Targets saved in localStorage
  const [targets, setTargets] = useState<CustomTargets>(() => {
    try {
      const saved = localStorage.getItem('smileclinic_powerbi_targets');
      return saved ? JSON.parse(saved) : DEFAULT_TARGETS;
    } catch {
      return DEFAULT_TARGETS;
    }
  });

  const [tempTargets, setTempTargets] = useState<CustomTargets>(targets);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 750);
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    setTargets(tempTargets);
    try {
      localStorage.setItem('smileclinic_powerbi_targets', JSON.stringify(tempTargets));
    } catch (err) {
      console.error(err);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowConfigDrawer(false);
    }, 1200);
  };

  const handleResetTargets = () => {
    setTempTargets(DEFAULT_TARGETS);
    setTargets(DEFAULT_TARGETS);
    try {
      localStorage.removeItem('smileclinic_powerbi_targets');
    } catch (err) {
      console.error(err);
    }
  };

  // Real .pbix file download simulation with actual Blob attachment
  const handleExportPbix = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);

      const pbixMetadata = {
        modelName: "SmileClinic_Clinical_Intelligence_v4.pbix",
        generatedAt: new Date().toISOString(),
        version: "4.2.0-DAX-R4",
        source: "Azure Synapse Healthcare Fabric DirectQuery",
        tables: [
          { name: "Dim_Patient", rows: 14820, connection: "FHIR_Endpoint_US_East" },
          { name: "Fact_ClinicalEncounters", rows: 48920, daxMeasures: ["BilledProduction", "ReimbursementMargin", "ChairVelocity"] },
          { name: "Fact_LaboratoryAssays", rows: 18450, daxMeasures: ["TAT_Minutes", "PanicThresholdRate"] },
          { name: "Dim_Payer", rows: 24, coverage: "Commercial PPO & Direct Health" }
        ],
        activeRange: selectedRange,
        activeTargets: targets
      };

      const blob = new Blob([JSON.stringify(pbixMetadata, null, 2)], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SmileClinic_Executive_Analytics_${selectedRange.toUpperCase()}_v4.pbix`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setTimeout(() => setExportComplete(false), 3500);
    }, 1100);
  };

  // Power BI Range Datasets
  const rangeData = {
    '24h': {
      production: '$142,850',
      productionPct: '94%',
      growth: '+12.4%',
      cleanClaim: '96.2%',
      chairTurnover: '11.4 min',
      bedOccupancy: '92.0%',
      chartPoints: [
        { label: '06:00 AM', v1: 42, v2: 28, val1Str: '$42,000', val2Str: '$38,500', x: 40, y: 150 },
        { label: '09:00 AM', v1: 88, v2: 65, val1Str: '$88,400', val2Str: '$79,200', x: 160, y: 110 },
        { label: '12:00 PM', v1: 142, v2: 118, val1Str: '$142,850', val2Str: '$126,400', x: 280, y: 65 },
        { label: '03:00 PM', v1: 115, v2: 98, val1Str: '$115,200', val2Str: '$104,100', x: 400, y: 90 },
        { label: '06:00 PM', v1: 76, v2: 68, val1Str: '$76,500', val2Str: '$71,000', x: 520, y: 125 },
        { label: '09:00 PM', v1: 34, v2: 30, val1Str: '$34,100', val2Str: '$31,800', x: 640, y: 165 },
      ],
      depts: [
        { name: 'Main Pavilion Surgery & OR', amount: '$54,200', pct: 86, color: 'bg-[#005c65]', cases: 14, margin: '62%' },
        { name: 'Restorative & Endodontics', amount: '$38,600', pct: 74, color: 'bg-[#1560a4]', cases: 28, margin: '54%' },
        { name: 'Orthodontics & Craniofacial', amount: '$31,400', pct: 68, color: 'bg-teal-600', cases: 22, margin: '49%' },
        { name: 'Emergency Triage & Walk-ins', amount: '$18,650', pct: 44, color: 'bg-amber-500', cases: 35, margin: '41%' },
      ],
    },
    '7d': {
      production: '$894,300',
      productionPct: '95%',
      growth: '+14.1%',
      cleanClaim: '96.8%',
      chairTurnover: '10.8 min',
      bedOccupancy: '90.4%',
      chartPoints: [
        { label: 'Monday', v1: 120, v2: 104, val1Str: '$120,500', val2Str: '$108,200', x: 40, y: 140 },
        { label: 'Tuesday', v1: 145, v2: 130, val1Str: '$145,100', val2Str: '$132,000', x: 160, y: 105 },
        { label: 'Wednesday', v1: 168, v2: 152, val1Str: '$168,400', val2Str: '$153,600', x: 280, y: 70 },
        { label: 'Thursday', v1: 154, v2: 141, val1Str: '$154,800', val2Str: '$142,300', x: 400, y: 85 },
        { label: 'Friday', v1: 182, v2: 168, val1Str: '$182,900', val2Str: '$169,400', x: 520, y: 55 },
        { label: 'Saturday', v1: 123, v2: 110, val1Str: '$123,600', val2Str: '$111,200', x: 640, y: 135 },
      ],
      depts: [
        { name: 'Main Pavilion Surgery & OR', amount: '$342,000', pct: 88, color: 'bg-[#005c65]', cases: 94, margin: '64%' },
        { name: 'Restorative & Endodontics', amount: '$248,500', pct: 76, color: 'bg-[#1560a4]', cases: 182, margin: '56%' },
        { name: 'Orthodontics & Craniofacial', amount: '$198,200', pct: 71, color: 'bg-teal-600', cases: 146, margin: '51%' },
        { name: 'Emergency Triage & Walk-ins', amount: '$105,600', pct: 48, color: 'bg-amber-500', cases: 240, margin: '43%' },
      ],
    },
    '30d': {
      production: '$3,480,200',
      productionPct: '97%',
      growth: '+16.8%',
      cleanClaim: '97.2%',
      chairTurnover: '11.2 min',
      bedOccupancy: '89.5%',
      chartPoints: [
        { label: 'Week 1', v1: 780, v2: 710, val1Str: '$780,200', val2Str: '$718,000', x: 40, y: 135 },
        { label: 'Week 2', v1: 890, v2: 830, val1Str: '$890,500', val2Str: '$832,400', x: 240, y: 90 },
        { label: 'Week 3', v1: 940, v2: 885, val1Str: '$940,100', val2Str: '$889,200', x: 440, y: 65 },
        { label: 'Week 4', v1: 869, v2: 820, val1Str: '$869,400', val2Str: '$822,100', x: 640, y: 100 },
      ],
      depts: [
        { name: 'Main Pavilion Surgery & OR', amount: '$1,380,000', pct: 90, color: 'bg-[#005c65]', cases: 380, margin: '65%' },
        { name: 'Restorative & Endodontics', amount: '$980,000', pct: 78, color: 'bg-[#1560a4]', cases: 720, margin: '58%' },
        { name: 'Orthodontics & Craniofacial', amount: '$740,000', pct: 73, color: 'bg-teal-600', cases: 580, margin: '53%' },
        { name: 'Emergency Triage & Walk-ins', amount: '$380,200', pct: 52, color: 'bg-amber-500', cases: 980, margin: '45%' },
      ],
    },
    'ytd': {
      production: '$18,240,000',
      productionPct: '98%',
      growth: '+19.2%',
      cleanClaim: '97.8%',
      chairTurnover: '10.5 min',
      bedOccupancy: '91.8%',
      chartPoints: [
        { label: 'Q1', v1: 4100, v2: 3850, val1Str: '$4,100,000', val2Str: '$3,880,000', x: 40, y: 130 },
        { label: 'Q2', v1: 4650, v2: 4400, val1Str: '$4,650,000', val2Str: '$4,420,000', x: 240, y: 85 },
        { label: 'Q3', v1: 5120, v2: 4890, val1Str: '$5,120,000', val2Str: '$4,910,000', x: 440, y: 50 },
        { label: 'Q4 (Est)', v1: 4370, v2: 4180, val1Str: '$4,370,000', val2Str: '$4,210,000', x: 640, y: 75 },
      ],
      depts: [
        { name: 'Main Pavilion Surgery & OR', amount: '$7,250,000', pct: 94, color: 'bg-[#005c65]', cases: 2100, margin: '67%' },
        { name: 'Restorative & Endodontics', amount: '$5,120,000', pct: 82, color: 'bg-[#1560a4]', cases: 3950, margin: '59%' },
        { name: 'Orthodontics & Craniofacial', amount: '$3,890,000', pct: 75, color: 'bg-teal-600', cases: 3100, margin: '55%' },
        { name: 'Emergency Triage & Walk-ins', amount: '$1,980,000', pct: 56, color: 'bg-amber-500', cases: 5400, margin: '46%' },
      ],
    },
  };

  const currentData = rangeData[selectedRange];

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-2 sm:p-4 md:p-6 pb-6">
            {/* Animated Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[92vh] flex flex-col my-auto"
            >
              {/* Power BI Brand Ribbon Header */}
              <div className="relative p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-[#00373d] to-slate-900 text-white shrink-0 border-b border-[#005c65]/40 shadow-inner">
                <div className="flex items-center justify-between gap-3 pr-20 sm:pr-24">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/40 shadow-sm shrink-0">
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                          Microsoft Power BI • Clinical &amp; Revenue Intelligence
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          DirectQuery Live
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 truncate flex items-center gap-2">
                        <span>Azure Synapse Lakehouse • HL7 FHIR v4 Semantic Model</span>
                        <span className="hidden sm:inline opacity-60">•</span>
                        <span className="hidden sm:inline text-amber-300/90 font-mono text-[10px]">Latency: 38ms</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Top Action Controls */}
                <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-5 flex items-center gap-1.5">
                  <button
                    onClick={() => setShowConfigDrawer(!showConfigDrawer)}
                    className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
                      showConfigDrawer ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white bg-white/10 hover:bg-white/20'
                    }`}
                    title="Configure Custom KPI Targets"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
                    title="Refresh Power BI DirectQuery Stream"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sub-Ribbon: Navigation Report Tabs & Time Horizon Slicers */}
              <div className="px-3 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                {/* Visual Category Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: 'financial', label: 'Financial DAX', icon: DollarSign },
                    { id: 'operatory', label: 'Operatory Velocity', icon: Activity },
                    { id: 'lab', label: 'Lab Diagnostics', icon: Layers },
                    { id: 'payer', label: 'Payer Breakdown', icon: PieChart },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeReportTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveReportTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-[#005c65] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Time Slicers */}
                <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-700/60 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
                  {(['24h', '7d', '30d', 'ytd'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedRange(range)}
                      className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                        selectedRange === range
                          ? 'bg-white dark:bg-slate-900 text-[#005c65] font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {range === '24h' ? 'Today' : range === '7d' ? '7-Day' : range === '30d' ? '30-Day' : 'YTD'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Configuration Drawer (Collapsible) */}
              <AnimatePresence>
                {showConfigDrawer && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-amber-50/70 dark:bg-amber-950/20 border-b border-amber-200/60 dark:border-amber-800/40"
                  >
                    <form onSubmit={handleSaveTargets} className="p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                          <h4 className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                            Custom Hospital KPI Targets (Persisted to Storage)
                          </h4>
                        </div>
                        <span className="text-[11px] text-amber-800/80 dark:text-amber-300">
                          Configure live thresholds for Power BI variance triggers
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                            Production Target
                          </label>
                          <input
                            type="text"
                            value={tempTargets.productionTarget}
                            onChange={(e) => setTempTargets({ ...tempTargets, productionTarget: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                            Clean Claim Target
                          </label>
                          <input
                            type="text"
                            value={tempTargets.cleanClaimTarget}
                            onChange={(e) => setTempTargets({ ...tempTargets, cleanClaimTarget: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                            Chair Turnover Goal
                          </label>
                          <input
                            type="text"
                            value={tempTargets.turnoverTarget}
                            onChange={(e) => setTempTargets({ ...tempTargets, turnoverTarget: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                            Bed Occupancy Target
                          </label>
                          <input
                            type="text"
                            value={tempTargets.occupancyTarget}
                            onChange={(e) => setTempTargets({ ...tempTargets, occupancyTarget: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={handleResetTargets}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset to Defaults</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowConfigDrawer(false)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200/50 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#005c65] text-white flex items-center gap-1.5 shadow-xs hover:bg-[#007782] cursor-pointer"
                          >
                            {saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
                            <span>{saveSuccess ? 'Saved to System!' : 'Save Preset'}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Body Content with Power BI Visualizations */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                {/* Executive KPI Bento Ribbon */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* KPI 1: Production */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden"
                  >
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Gross Production
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono">
                        {currentData.production}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center">
                        <ArrowUpRight className="w-3 h-3" /> {currentData.growth}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Target: {targets.productionTarget}</span>
                      <span className="font-bold text-[#005c65]">{currentData.productionPct}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-[#005c65] h-full rounded-full transition-all duration-500" style={{ width: currentData.productionPct }} />
                    </div>
                  </motion.div>

                  {/* KPI 2: Clean Claim Pass Rate */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden"
                  >
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Clean Claim Pass (ERA)
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono">
                        {currentData.cleanClaim}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600">Optimal</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Goal: {targets.cleanClaimTarget}</span>
                      <span className="font-bold text-emerald-600">Surpassed</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: currentData.cleanClaim }} />
                    </div>
                  </motion.div>

                  {/* KPI 3: Chair Turnover Velocity */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden"
                  >
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Chair Turnover Velocity
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono">
                        {currentData.chairTurnover}
                      </span>
                      <span className="text-xs font-semibold text-sky-600">Pace: Fast</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Goal: {targets.turnoverTarget}</span>
                      <span className="font-bold text-[#1560a4]">92%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-[#1560a4] h-full rounded-full transition-all duration-500" style={{ width: '92%' }} />
                    </div>
                  </motion.div>

                  {/* KPI 4: Bed Occupancy */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden"
                  >
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Bed &amp; Suite Occupancy
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono">
                        {currentData.bedOccupancy}
                      </span>
                      <span className="text-xs font-semibold text-amber-600">High Cap</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Target: {targets.occupancyTarget}</span>
                      <span className="font-bold text-amber-600">+2.0%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: currentData.bedOccupancy }} />
                    </div>
                  </motion.div>
                </div>

                {/* Primary Interactive Longitudinal Power BI Chart with Dynamic Hover Tooltip Preview */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#005c65]" />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Clinical Production &amp; Case Velocity Telemetry
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                          Interactive Canvas
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Hover over any curve node to inspect real-time DirectQuery dimensional metrics
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#005c65]"></span>
                        <span>Gross Production</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1560a4]"></span>
                        <span>Settled Reimbursements</span>
                      </span>
                    </div>
                  </div>

                  {/* SVG Canvas Area with Responsive Hover Points */}
                  <div className="relative pt-4 pb-2">
                    <div className="h-56 sm:h-64 w-full relative">
                      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 200">
                        <defs>
                          <linearGradient id="pbiGrad1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#005c65" stopOpacity="0.32" />
                            <stop offset="100%" stopColor="#005c65" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="pbiGrad2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1560a4" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#1560a4" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1="0" y1="40" x2="700" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="0" y1="90" x2="700" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="0" y1="140" x2="700" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

                        {/* Production Wave Area */}
                        <path
                          d="M0,170 C100,140 200,90 300,70 C400,50 500,80 600,60 L700,50 L700,200 L0,200 Z"
                          fill="url(#pbiGrad1)"
                        />
                        <path
                          d="M0,170 C100,140 200,90 300,70 C400,50 500,80 600,60 L700,50"
                          fill="none"
                          stroke="#005c65"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {/* Reimbursement Wave Area */}
                        <path
                          d="M0,185 C100,160 200,115 300,95 C400,80 500,105 600,85 L700,75 L700,200 L0,200 Z"
                          fill="url(#pbiGrad2)"
                        />
                        <path
                          d="M0,185 C100,160 200,115 300,95 C400,80 500,105 600,85 L700,75"
                          fill="none"
                          stroke="#1560a4"
                          strokeDasharray="5 3"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />

                        {/* Interactive Dynamic Nodes with Hover */}
                        {currentData.chartPoints.map((pt, idx) => (
                          <g key={idx}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={hoveredPoint?.label === pt.label ? 7 : 5}
                              fill="#005c65"
                              stroke="#ffffff"
                              strokeWidth={hoveredPoint?.label === pt.label ? 3 : 2}
                              className="cursor-pointer transition-all hover:scale-125"
                              onMouseEnter={() => {
                                setHoveredPoint({
                                  label: pt.label,
                                  label1: 'Billed Production',
                                  value1: pt.val1Str,
                                  label2: 'Reimbursed',
                                  value2: pt.val2Str,
                                  x: pt.x,
                                  y: pt.y,
                                  change: '+14.2% yield'
                                });
                              }}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                            <circle
                              cx={pt.x}
                              cy={pt.y + 20}
                              r={hoveredPoint?.label === pt.label ? 6 : 4}
                              fill="#1560a4"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              className="cursor-pointer opacity-80"
                            />
                          </g>
                        ))}
                      </svg>

                      {/* Floating Data Preview Tooltip on Hover */}
                      <AnimatePresence>
                        {hoveredPoint && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{ duration: 0.15 }}
                            style={{
                              left: `${(hoveredPoint.x / 700) * 100}%`,
                              top: `${(hoveredPoint.y / 200) * 100}%`,
                              transform: 'translate(-50%, -125%)'
                            }}
                            className="absolute pointer-events-none z-30 bg-slate-900/95 text-white p-3 rounded-xl shadow-2xl border border-slate-700 text-xs w-48 backdrop-blur-md"
                          >
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                              <span className="font-bold text-amber-300">{hoveredPoint.label}</span>
                              <span className="text-[10px] text-emerald-400 font-semibold">{hoveredPoint.change}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">{hoveredPoint.label1}:</span>
                                <span className="font-bold text-white font-mono">{hoveredPoint.value1}</span>
                              </div>
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">{hoveredPoint.label2}:</span>
                                <span className="font-bold text-sky-400 font-mono">{hoveredPoint.value2}</span>
                              </div>
                            </div>
                            <div className="mt-1.5 pt-1 border-t border-slate-800 flex justify-between text-[9px] text-slate-400">
                              <span>Adjudication: Auto-Passed</span>
                              <span>FHIR: Sync 100%</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Time Horizon Axis Labels */}
                    <div className="flex justify-between text-[11px] font-semibold text-slate-400 pt-2 px-1">
                      {currentData.chartPoints.map((pt, idx) => (
                        <span key={idx} className={hoveredPoint?.label === pt.label ? 'text-[#005c65] font-bold' : ''}>
                          {pt.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Secondary Visuals Split Grid: Department Matrix & Payer Decomposition */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Department Production Matrix (Col 7) */}
                  <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#005c65]" />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Department Production &amp; Margin Velocity
                        </h4>
                      </div>
                      <span className="text-xs text-slate-500 font-mono text-[10px]">DAX: CALCULATE(SUM(Billed), ALL(Depts))</span>
                    </div>

                    <div className="space-y-3 pt-3">
                      {currentData.depts.map((dept, idx) => {
                        const isHovered = hoveredDept === idx;
                        return (
                          <div 
                            key={idx} 
                            onMouseEnter={() => setHoveredDept(idx)}
                            onMouseLeave={() => setHoveredDept(null)}
                            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                              isHovered 
                                ? 'bg-slate-100 dark:bg-slate-800/80 shadow-sm ring-1 ring-[#005c65]/30' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-medium">
                              <span className="text-slate-800 dark:text-slate-200 font-semibold">{dept.name}</span>
                              <div className="flex items-center gap-2.5">
                                {isHovered && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                                    {dept.cases} Cases • Margin: {dept.margin}
                                  </span>
                                )}
                                <span className="font-bold text-slate-900 dark:text-white font-mono">{dept.amount}</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-1.5">
                              <div
                                className={`${dept.color} h-full rounded-full transition-all duration-600`}
                                style={{ width: `${dept.pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span>Total Cases Active: <b>380 Encounters</b></span>
                      <span className="text-[#005c65] font-semibold">Weighted Margin: 58.4%</span>
                    </div>
                  </div>

                  {/* Payer Breakdown & Direct Remittance Donut (Col 5) */}
                  <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-[#1560a4]" />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Payer Mix Decomposition
                        </h4>
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">Q4 Claim Pool</span>
                    </div>

                    <div className="flex items-center gap-4 py-3">
                      {/* Donut Visual */}
                      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
                          {/* Delta Dental 38% */}
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="none"
                            stroke="#005c65"
                            strokeWidth={hoveredPayer === 'Delta' ? 6 : 4.5}
                            strokeDasharray="38, 100"
                            strokeDashoffset="0"
                            className="cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredPayer('Delta')}
                            onMouseLeave={() => setHoveredPayer(null)}
                          />
                          {/* MetLife 24% */}
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="none"
                            stroke="#1560a4"
                            strokeWidth={hoveredPayer === 'MetLife' ? 6 : 4.5}
                            strokeDasharray="24, 100"
                            strokeDashoffset="-38"
                            className="cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredPayer('MetLife')}
                            onMouseLeave={() => setHoveredPayer(null)}
                          />
                          {/* Cigna 22% */}
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="none"
                            stroke="#319796"
                            strokeWidth={hoveredPayer === 'Cigna' ? 6 : 4.5}
                            strokeDasharray="22, 100"
                            strokeDashoffset="-62"
                            className="cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredPayer('Cigna')}
                            onMouseLeave={() => setHoveredPayer(null)}
                          />
                          {/* Self-Pay 16% */}
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="none"
                            stroke="#cbd5e1"
                            strokeWidth={hoveredPayer === 'Self-Pay' ? 6 : 4.5}
                            strokeDasharray="16, 100"
                            strokeDashoffset="-84"
                            className="cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredPayer('Self-Pay')}
                            onMouseLeave={() => setHoveredPayer(null)}
                          />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-base font-extrabold text-slate-900 dark:text-white leading-none">100%</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Claims</span>
                        </div>
                      </div>

                      {/* Interactive Legend with Highlights */}
                      <div className="flex-1 space-y-1.5 text-xs">
                        <div 
                          onMouseEnter={() => setHoveredPayer('Delta')}
                          onMouseLeave={() => setHoveredPayer(null)}
                          className={`flex items-center justify-between p-1 rounded-md cursor-pointer transition-colors ${hoveredPayer === 'Delta' ? 'bg-[#005c65]/10 font-bold' : ''}`}
                        >
                          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#005c65]" /> Delta Dental
                          </span>
                          <span className="font-mono text-slate-900 dark:text-white font-bold">38%</span>
                        </div>

                        <div 
                          onMouseEnter={() => setHoveredPayer('MetLife')}
                          onMouseLeave={() => setHoveredPayer(null)}
                          className={`flex items-center justify-between p-1 rounded-md cursor-pointer transition-colors ${hoveredPayer === 'MetLife' ? 'bg-[#1560a4]/10 font-bold' : ''}`}
                        >
                          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#1560a4]" /> MetLife PDP
                          </span>
                          <span className="font-mono text-slate-900 dark:text-white font-bold">24%</span>
                        </div>

                        <div 
                          onMouseEnter={() => setHoveredPayer('Cigna')}
                          onMouseLeave={() => setHoveredPayer(null)}
                          className={`flex items-center justify-between p-1 rounded-md cursor-pointer transition-colors ${hoveredPayer === 'Cigna' ? 'bg-teal-500/10 font-bold' : ''}`}
                        >
                          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Cigna Dental
                          </span>
                          <span className="font-mono text-slate-900 dark:text-white font-bold">22%</span>
                        </div>

                        <div 
                          onMouseEnter={() => setHoveredPayer('Self-Pay')}
                          onMouseLeave={() => setHoveredPayer(null)}
                          className={`flex items-center justify-between p-1 rounded-md cursor-pointer transition-colors ${hoveredPayer === 'Self-Pay' ? 'bg-slate-200 dark:bg-slate-700 font-bold' : ''}`}
                        >
                          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" /> Self-Pay / Copay
                          </span>
                          <span className="font-mono text-slate-900 dark:text-white font-bold">16%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                      <span>Avg Adjudication Time:</span>
                      <strong className="text-slate-900 dark:text-white">12.4 Days (Fast Track)</strong>
                    </div>
                  </div>
                </div>

                {/* Cognitive AI Anomaly Insight Callout */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 shadow-xs">
                  <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-amber-950 dark:text-amber-200 block flex items-center gap-1.5">
                      Power BI Cognitive Anomaly Engine
                      <span className="text-[10px] bg-amber-200/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 px-1.5 py-0.2 rounded font-mono">
                        CONFIDENCE: 94.8%
                      </span>
                    </span>
                    <p className="text-amber-900/90 dark:text-amber-300 leading-relaxed">
                      Operatory Suite 2 (Oral Surgery) turnaround latency increased by 14m due to high molar impaction volume. 
                      Recommended auto-action: Re-route non-surgical cleanings to Operatory 4 to maintain 92% clinic chair punctuality.
                    </p>
                  </div>
                </div>
              </div>

              {/* Power BI Modal Footer Actions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>DirectQuery Lakehouse Sync • Protocol: TLS 1.3 Encryption</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Close Report
                  </button>

                  <button
                    onClick={handleExportPbix}
                    disabled={isExporting}
                    className="flex-1 sm:flex-none px-4 py-2 bg-[#005c65] hover:bg-[#007782] text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Compiling .pbix Model...</span>
                      </>
                    ) : exportComplete ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Report Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Power BI (.pbix)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </ModalPortal>
      )}
    </AnimatePresence>
  );
}
