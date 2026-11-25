import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Building2,
  RefreshCw,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Client } from '../../clients/types/client.types';

import { sounds } from '../utils/soundEffects';

interface ScanOverlayProps {
  scanResult: {
    client?: Client;
    status: 'success' | 'already_checked' | 'expired' | 'pending_payment' | 'not_found' | 'wrong_branch';
    message: string;
    previousCheckIn?: string;
  } | null;
  onClose: () => void;
  onRenew?: (clientId: string) => void;
}

export const AttendanceStatusOverlay: React.FC<ScanOverlayProps> = ({
  scanResult,
  onClose,
  onRenew,
}) => {
  const playedResultRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!scanResult) {
      playedResultRef.current = null;
      return;
    }

    const resultKey = `${scanResult.client?.id || 'noclient'}_${scanResult.status}_${scanResult.message}_${scanResult.previousCheckIn || ''}`;

    if (playedResultRef.current !== resultKey) {
      playedResultRef.current = resultKey;

      if (scanResult.status === 'success') {
        sounds.playSuccess();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7'],
        });
      } else if (scanResult.status === 'already_checked') {
        sounds.playWarning();
      } else {
        sounds.playError();
      }
    }

    // Auto close timer for all scan results (3s for success, 4s for errors/warnings)
    const delay = scanResult.status === 'success' || scanResult.status === 'already_checked' ? 3000 : 4000;
    const timer = setTimeout(() => {
      onClose();
    }, delay);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scanResult, onClose]);

  if (!scanResult) return null;

  const { client, status, message, previousCheckIn } = scanResult;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 !m-0 z-[100] overflow-y-auto flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
      >
        <motion.div
          initial={{ scale: 0.85, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-lg my-auto rounded-3xl p-5 sm:p-8 border text-center shadow-2xl relative overflow-hidden cursor-default ${
            status === 'success'
              ? 'bg-slate-900/95 border-emerald-500/50 shadow-emerald-500/20'
              : status === 'already_checked'
              ? 'bg-slate-900/95 border-amber-500/50 shadow-amber-500/20'
              : status === 'wrong_branch'
              ? 'bg-slate-900/95 border-purple-500/50 shadow-purple-500/20'
              : status === 'expired'
              ? 'bg-slate-900/95 border-rose-500/50 shadow-rose-500/20'
              : 'bg-slate-900/95 border-orange-500/50 shadow-orange-500/20'
          }`}
        >
          <div
            className={`absolute top-0 left-0 right-0 h-3 ${
              status === 'success'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : status === 'already_checked'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : status === 'wrong_branch'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-500'
                : status === 'expired'
                ? 'bg-gradient-to-r from-rose-600 to-red-500'
                : 'bg-gradient-to-r from-orange-500 to-amber-500'
            }`}
          />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-all z-10"
            title="Cerrar (Esc)"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex justify-center mb-6 mt-2">
            {status === 'success' && (
              <div className="h-20 w-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 animate-bounce">
                <CheckCircle2 className="h-12 w-12" />
              </div>
            )}
            {status === 'already_checked' && (
              <div className="h-20 w-20 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <Clock className="h-12 w-12" />
              </div>
            )}
            {status === 'wrong_branch' && (
              <div className="h-20 w-20 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40">
                <Building2 className="h-12 w-12" />
              </div>
            )}
            {status === 'expired' && (
              <div className="h-20 w-20 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                <XCircle className="h-12 w-12" />
              </div>
            )}
            {status === 'pending_payment' && (
              <div className="h-20 w-20 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/40">
                <AlertTriangle className="h-12 w-12" />
              </div>
            )}
          </div>

          <h2
            className={`text-2xl font-black uppercase tracking-wider mb-1 ${
              status === 'success'
                ? 'text-emerald-400'
                : status === 'already_checked'
                ? 'text-amber-400'
                : status === 'wrong_branch'
                ? 'text-purple-400'
                : status === 'expired'
                ? 'text-rose-400'
                : 'text-orange-400'
            }`}
          >
            {status === 'success' && '¡BIENVENIDO(A)!'}
            {status === 'already_checked' && 'ASISTENCIA YA REGISTRADA'}
            {status === 'wrong_branch' && 'SUCURSAL NO PERMITIDA'}
            {status === 'expired' && 'ACCESO DENEGADO'}
            {status === 'pending_payment' && 'ADVERTENCIA DE PAGO'}
          </h2>

          <p className="text-slate-300 font-medium text-sm mb-6 max-w-xs mx-auto">
            {message}
          </p>

          {client && (
            <div className="bg-slate-950/60 rounded-2xl p-4 mb-6 border border-slate-800/80 text-left">
              <div className="flex items-center gap-4 mb-3 pb-3 border-b border-slate-800/60">
                <img
                  src={client.photoUrl}
                  alt={`${client.firstName} ${client.lastName}`}
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-slate-700"
                />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {client.firstName} {client.lastName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {client.id.substring(0, 8)}...
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Tipo Membresía</span>
                  <span className="text-slate-200 font-semibold">{client.membershipType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Sucursal Asignada</span>
                  <span className="text-purple-400 font-semibold flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {client.branch_name || 'Sucursal Base'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Vencimiento</span>
                  <span
                    className={`font-semibold ${
                      status === 'expired' ? 'text-rose-400 font-bold' : 'text-slate-200'
                    }`}
                  >
                    {client.endDate ? String(client.endDate).split('T')[0] : 'Sin registro'}
                  </span>
                </div>
                {previousCheckIn && (
                  <div className="sm:col-span-2 bg-amber-500/10 rounded-xl p-2.5 border border-amber-500/20 text-amber-300">
                    <span className="block text-[11px] font-bold">Último Ingreso Registrado Hoy:</span>
                    <span className="font-mono text-sm font-extrabold">{previousCheckIn} hrs</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {status === 'expired' && client && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  if (onRenew) onRenew(client.id);
                  onClose();
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Renovar Membresía Ahora
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
              >
                Cerrar
              </button>
            </div>
          )}

          {status === 'wrong_branch' && (
            <button
              onClick={onClose}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-purple-600/30"
            >
              Entendido / Cerrar
            </button>
          )}

          {(status === 'success' || status === 'already_checked') && (
            <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Reinicio automático al escáner en 3 segundos...
            </div>
          )}

          {status === 'not_found' && (
            <button
              onClick={onClose}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl transition-all"
            >
              Regresar al Escáner
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
