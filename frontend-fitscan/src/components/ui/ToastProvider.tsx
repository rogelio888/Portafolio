import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title: string, message?: string) => addToast('success', title, message),
    error: (title: string, message?: string) => addToast('error', title, message),
    warning: (title: string, message?: string) => addToast('warning', title, message),
    info: (title: string, message?: string) => addToast('info', title, message),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Floating Toasts Container */}
      <div className="fixed bottom-5 right-5 z-[999999] flex flex-col space-y-3 max-w-sm w-full pointer-events-none select-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 flex items-start justify-between gap-3 ${
              t.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10'
                : t.type === 'error'
                  ? 'bg-slate-900/95 border-rose-500/40 text-rose-300 shadow-rose-500/10'
                  : t.type === 'warning'
                    ? 'bg-slate-900/95 border-amber-500/40 text-amber-300 shadow-amber-500/10'
                    : 'bg-slate-900/95 border-teal-500/40 text-teal-300 shadow-teal-500/10'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                {t.type === 'error' && <XCircle className="h-5 w-5 text-rose-400" />}
                {t.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400" />}
                {t.type === 'info' && <Info className="h-5 w-5 text-teal-400" />}
              </div>

              <div>
                <h4 className="font-extrabold text-xs text-white leading-tight">{t.title}</h4>
                {t.message && <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{t.message}</p>}
              </div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context.toast;
};
