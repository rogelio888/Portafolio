import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DollarSign, AlertCircle, Loader2, X, Building2 } from 'lucide-react';
import { api } from '../../../services/api';
import { useBranchStore } from '../../settings/state/useBranchStore';
import { useAuthStore } from '../../auth/state/useAuthStore';

interface OpenCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OpenCashModal: React.FC<OpenCashModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { branches, activeBranchId } = useBranchStore();
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes('admin') || user?.role === 'Administrador General';

  const [initialAmount, setInitialAmount] = useState<string>('0.00');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (!isAdmin && user?.branch_id) {
        setSelectedBranchId(user.branch_id);
      } else if (activeBranchId && activeBranchId !== 'all') {
        setSelectedBranchId(activeBranchId);
      } else if (branches.length > 0) {
        setSelectedBranchId(branches[0].id);
      }
    }
  }, [isOpen, activeBranchId, branches, user, isAdmin]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(initialAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      setErrorMsg('Ingrese un monto inicial válido en Bs.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.post('/cash-shifts/open', {
        initial_amount: amountNum,
        notes: notes.trim() || undefined,
        branch_id: selectedBranchId || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al abrir el turno de caja.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Apertura de Caja Chica</h2>
            <p className="text-xs text-slate-400">Iniciar turno de recepción en Bolivianos (Bs.)</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-emerald-400" />
              Sucursal a Operar / Abrir Caja *
              {!isAdmin && (
                <span className="text-[10px] text-emerald-400 font-normal ml-2">
                  (Fijado según su sucursal de sesión)
                </span>
              )}
            </label>
            <select
              value={selectedBranchId}
              disabled={!isAdmin}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code || 'Sede'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Monto Inicial de Caja (Bs.) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Bs.</span>
              <input
                type="number"
                step="0.50"
                min="0"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="0.00"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Efectivo en cambio/sencillo disponible al iniciar turno.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Notas u Observaciones (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Ej. Recibido con cambio de billetes de Bs. 10 y 20"
            />
          </div>

          <div className="pt-3 flex gap-3">
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
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Abriendo...</span>
                </>
              ) : (
                <span>Abrir Caja Chica</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
