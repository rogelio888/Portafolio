import React from 'react';
import { createPortal } from 'react-dom';
import { useClientStore } from '../features/clients/state/useClientStore';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}) => {
  const isDark = useClientStore((s: { theme: string }) => s.theme === 'dark');

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <Trash2 className="h-6 w-6 text-red-400" />,
      iconBg: isDark ? 'bg-red-500/15 ring-1 ring-red-500/30' : 'bg-red-50 ring-1 ring-red-200',
      confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-amber-400" />,
      iconBg: isDark ? 'bg-amber-500/15 ring-1 ring-amber-500/30' : 'bg-amber-50 ring-1 ring-amber-200',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    },
    info: {
      icon: <AlertTriangle className="h-6 w-6 text-blue-400" />,
      iconBg: isDark ? 'bg-blue-500/15 ring-1 ring-blue-500/30' : 'bg-blue-50 ring-1 ring-blue-200',
      confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
  };

  const styles = variantStyles[variant];

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl border animate-scaleIn ${
          isDark
            ? 'bg-slate-800/95 border-slate-700/60'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-700'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${styles.iconBg}`}>
            {styles.icon}
          </div>

          {/* Title */}
          <h3 className={`text-lg font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h3>

          {/* Message */}
          <p className={`text-sm text-center leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className={`flex gap-3 p-4 pt-0`}>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isDark
                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${
              isDark ? 'focus:ring-offset-slate-800' : 'focus:ring-offset-white'
            } ${styles.confirmBtn} ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>,
    document.body
  );
};

export default ConfirmModal;
