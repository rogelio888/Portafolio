import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, ArrowRightLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../../../services/api';
import { useBranchStore } from '../../settings/state/useBranchStore';
import { useToast } from '../../../components/ui/ToastProvider';

interface TransferBranchModalProps {
  client: {
    id: string;
    full_name: string;
    branch_id?: string;
    branch_name?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransferBranchModal: React.FC<TransferBranchModalProps> = ({
  client,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { branches, fetchBranches } = useBranchStore();
  const toast = useToast();

  const [targetBranchId, setTargetBranchId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchBranches();
      setReason('');
      setErrorMessage(null);
      if (branches.length > 0) {
        const otherBranch = branches.find((b) => b.id !== client?.branch_id);
        setTargetBranchId(otherBranch ? otherBranch.id : branches[0].id);
      }
    }
  }, [isOpen]);

  if (!isOpen || !client) return null;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBranchId) {
      setErrorMessage('Selecciona la sucursal de destino.');
      return;
    }

    if (targetBranchId === client.branch_id) {
      setErrorMessage('La sucursal de destino debe ser diferente a la sucursal matriz actual.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await api.put(`/clients/${client.id}/transfer-branch`, {
        target_branch_id: targetBranchId,
        reason,
      });

      toast.success(
        'Transferencia Exitosa',
        response.data.message || `El cliente ${client.full_name} fue transferido.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error transferring client branch:', err);
      setErrorMessage(
        err.response?.data?.message || 'Error al procesar la transferencia de sucursal.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentBranch = branches.find((b) => b.id === client.branch_id);
  const currentBranchName = client.branch_name || currentBranch?.name || 'Sucursal Matriz Actual';

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

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <ArrowRightLeft className="h-5 w-5 text-emerald-400" />
          <div>
            <h2 className="text-base font-bold text-white">Transferir Socio de Sucursal</h2>
            <p className="text-[11px] text-slate-400">Conserva 100% de asistencias, pagos y membresías</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-400 font-medium block">Socio Afectado:</span>
            <p className="text-sm font-bold text-white">{client.full_name}</p>
            <div className="flex items-center gap-2 text-xs pt-1 text-slate-300">
              <Building2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Sede Actual: <strong className="text-emerald-400">{currentBranchName}</strong></span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Nueva Sucursal Matriz de Destino *
            </label>
            <select
              value={targetBranchId}
              onChange={(e) => setTargetBranchId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {branches
                .filter((b) => b.id !== client.branch_id)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.address || 'Bolivia'})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Motivo o Observación de la Transferencia
            </label>
            <input
              type="text"
              placeholder="Ej. Mudanza de domicilio a la zona norte"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Confirmar Transferencia</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
