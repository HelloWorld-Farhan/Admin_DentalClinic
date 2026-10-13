import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Table, 
  BarChart3, 
  FileSpreadsheet, 
  X, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle?: string;
}

export default function ExportModal({ isOpen, onClose, reportTitle = 'Executive Operational Report' }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'pbix' | 'csv'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleStartExport = () => {
    setIsExporting(true);
    setProgress(15);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            setIsComplete(true);
            setTimeout(() => {
              setIsComplete(false);
              onClose();
            }, 1800);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          {/* Animated Backdrop with Click-Outside to Close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Animated Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-primary to-primary-container text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base">Export Clinical Data Suite</h3>
                <p className="text-xs text-on-primary-container">{reportTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isExporting}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Formats Grid */}
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Select Export Package Format
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'pdf',
                    name: 'Executive PDF',
                    desc: 'Formal branded summary',
                    icon: FileText,
                    badge: 'Popular',
                  },
                  {
                    id: 'excel',
                    name: 'Excel Workbook',
                    desc: 'Full multi-tab tables',
                    icon: FileSpreadsheet,
                    badge: '.xlsx',
                  },
                  {
                    id: 'pbix',
                    name: 'Power BI Model',
                    desc: 'DirectQuery schema',
                    icon: BarChart3,
                    badge: '.pbix',
                  },
                  {
                    id: 'csv',
                    name: 'Raw CSV Stream',
                    desc: 'EHR records stream',
                    icon: Table,
                    badge: '.csv',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedFormat === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isExporting}
                      onClick={() => setSelectedFormat(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-1 ring-primary'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.badge}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.name}</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progress Bar when exporting */}
            {isExporting && (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    Packaging clinical dataset...
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-primary h-full rounded-full transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {isComplete && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Export generated successfully! Download beginning automatically.</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleStartExport}
              disabled={isExporting || isComplete}
              className="px-5 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compiling...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Generate &amp; Download</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
