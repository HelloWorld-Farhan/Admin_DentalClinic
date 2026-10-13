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
  Zap
} from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ModalPortal } from './ModalPortal';

interface PowerBIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport?: () => void;
}

export default function PowerBIModal({ isOpen, onClose }: PowerBIModalProps) {
  // Prevent background window from scrolling when modal is open
  useBodyScrollLock(isOpen);

  const [selectedRange, setSelectedRange] = useState<'24h' | '7d' | '30d' | 'ytd'>('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

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
    }, 800);
  };

  const handleExportPbix = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Animated Backdrop with Click-Outside to Close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
          />

          {/* Animated Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden max-h-[92vh] flex flex-col"
          >
          {/* Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-primary-container to-slate-900 text-white flex items-center justify-between border-b border-primary/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg">Power BI Executive Clinical Intelligence</h3>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    DirectQuery Live
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">Azure Synapse Healthcare Fabric • HL7 FHIR Model R4</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Refresh DirectQuery stream"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader controls */}
          <div className="px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-700/60 p-1 rounded-xl text-xs font-semibold">
              {(['24h', '7d', '30d', 'ytd'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedRange === range
                      ? 'bg-white dark:bg-slate-900 text-primary font-bold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {range === '24h' ? "Today's Telemetry" : range === '7d' ? '7-Day Trend' : range === '30d' ? '30-Day Cycle' : 'Year-to-Date'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                AI Anomaly Detector:
              </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Optimal Operatory Yield
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* KPI Cards Bento */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Billed Production</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">$142,850</span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> +12.4%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 0.8 }}
                    className="bg-primary h-full rounded-full"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Clean Claim Pass</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">94.2%</span>
                  <span className="text-xs font-semibold text-emerald-600">Goal: 90%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '94.2%' }}
                    transition={{ duration: 0.8 }}
                    className="bg-emerald-500 h-full rounded-full"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Chair Turnover</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">11.4 min</span>
                  <span className="text-xs font-semibold text-sky-600">Fast Pace</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 0.8 }}
                    className="bg-secondary h-full rounded-full"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Bed Occupancy</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">92.0%</span>
                  <span className="text-xs font-semibold text-amber-600">High Cap</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 0.8 }}
                    className="bg-amber-500 h-full rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Department Revenue & Margin breakdown */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Department Production &amp; Margin Velocity</h4>
                </div>
                <span className="text-xs text-slate-500">DAX Formula: Calculate(Sum(Billed), All(Depts))</span>
              </div>

              <div className="space-y-3.5 pt-4">
                {[
                  { name: 'Main Pavilion Surgery & OR', amount: '$54,200', pct: 86, color: 'bg-primary' },
                  { name: 'Restorative & Endodontics', amount: '$38,600', pct: 74, color: 'bg-secondary' },
                  { name: 'Orthodontics & Craniofacial', amount: '$31,400', pct: 68, color: 'bg-tertiary' },
                  { name: 'Emergency Triage & Walk-ins', amount: '$18,650', pct: 44, color: 'bg-amber-500' },
                ].map((dept, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300">{dept.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{dept.amount}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${dept.pct}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className={`${dept.color} h-full rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Power BI Anomaly Insights Callout */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-amber-900 dark:text-amber-200 block">
                  Power BI Cognitive Recommendation
                </span>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  Operatory 2 (Oral Surgery) is experiencing a 18% higher procedure turnaround time due to high wisdom tooth complexity. 
                  Recommendation: Allocate an extra sterilization buffer cushion of 10 minutes to maintain schedule punctuality.
                </p>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Real-Time Model Refresh • Azure Lakehouse Latency: 42ms</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Close View
              </button>
              <button
                onClick={handleExportPbix}
                disabled={isExporting}
                className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all"
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
