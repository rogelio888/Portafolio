import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, AlertTriangle, Loader2, X, Calculator } from 'lucide-react';
import { api } from '../../../services/api';

interface CloseCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shiftData: {
    initial_amount: number;
    cash_sales: number;
    expected_cash_in_hand: number;
  };
}

export const CloseCashModal: React.FC<CloseCashModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  shiftData,
}) => {
  const [actualAmount, setActualAmount] = useState<string>(
    shiftData.expected_cash_in_hand.toFixed(2)
  );
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const actualNum = parseFloat(actualAmount) || 0;
  const difference = actualNum - shiftData.expected_cash_in_hand;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(actualNum) || actualNum < 0) {
      setErrorMsg('Ingrese el total de efectivo contado en caja.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.post('/cash-shifts/close', {
        actual_amount: actualNum,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al cerrar el turno de caja.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 overflow-y-auto flex items-start sm:items-center justify-center p-3 sm:p-4">
      <div className="my-auto bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Arqueo & Cierre de Caja</h2>
            <p className="text-xs text-slate-400">Rendición de cuentas de efectivo (Bs.)</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Financial Summary Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Saldo Inicial de Caja:</span>
            <span className="font-mono text-slate-200">Bs. {shiftData.initial_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Ventas en Efectivo (+):</span>
            <span className="font-mono text-emerald-400">+ Bs. {shiftData.cash_sales.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
            <span className="text-slate-200">Efectivo Esperado en Caja:</span>
            <span className="font-mono text-emerald-400">Bs. {shiftData.expected_cash_in_hand.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Efectivo Físico Contado en Caja (Bs.) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Bs.</span>
              <input
                type="number"
                step="0.50"
                min="0"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Difference Indicator */}
          <div className={`p-3 rounded-xl text-xs font-bold flex flex-wrap items-center justify-between gap-2 border ${
            difference === 0
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : difference > 0
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>
                {difference === 0
                  ? 'Caja Cuadrada Perfecta'
                  : difference > 0
                  ? 'Sobrante de Caja'
                  : 'Faltante de Caja'}
              </span>
            </span>
            <span className="font-mono text-sm">
              {difference > 0 ? '+' : ''}Bs. {difference.toFixed(2)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Observaciones del Arqueo
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Justificación si existe diferencia o notas de cierre."
            />
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>Confirmar Cierre de Caja</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
