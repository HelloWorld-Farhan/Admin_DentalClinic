import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastNotification({ toasts, onDismiss }: ToastNotificationProps) {
  return (
    <div className="fixed bottom-3 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-[99999] flex flex-col gap-2.5 max-w-md sm:max-w-sm w-auto sm:w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto p-3.5 sm:p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md w-full ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-100 border-emerald-500/40 ring-1 ring-emerald-500/20'
                : toast.type === 'error'
                ? 'bg-red-950/95 text-red-100 border-red-500/40 ring-1 ring-red-500/20'
                : 'bg-slate-900/95 text-slate-100 border-slate-700/60 ring-1 ring-white/10'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white">{toast.title}</h4>
              {toast.description && (
                <p className="text-[11px] sm:text-xs mt-0.5 text-slate-300 leading-snug break-words">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 text-slate-400 hover:text-white p-1 rounded-lg transition-colors -mr-1 -mt-1"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
