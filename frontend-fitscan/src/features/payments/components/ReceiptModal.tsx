import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, CheckCircle2, X, Loader2, Dumbbell } from 'lucide-react';
import { api } from '../../../services/api';

interface ReceiptModalProps {
  paymentId: string | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ paymentId, onClose }) => {
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!paymentId) return;

    const fetchReceipt = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/payments/${paymentId}/receipt`);
        setReceiptData(response.data?.receipt || null);
      } catch (err) {
        console.error('Error fetching receipt:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipt();
  }, [paymentId]);

  if (!paymentId) return null;

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 overflow-y-auto flex items-start sm:items-center justify-center p-3 sm:p-4 print:p-0 print:bg-transparent">
      <div className="my-auto bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-4 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 print:bg-transparent print:border-none print:shadow-none print:p-0">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors print:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Cargando comprobante de pago...</p>
          </div>
        ) : receiptData ? (
          <div id="printable-receipt" className="space-y-4 text-slate-200">
            {/* Header */}
            <div className="text-center pb-3 border-b border-slate-800 space-y-1">
              <div className="flex items-center justify-center gap-2 text-emerald-400 mb-1">
                <Dumbbell className="h-6 w-6" />
                <span className="text-base font-black tracking-widest text-white">FITSCAN GYM OS</span>
              </div>
              <p className="text-[10px] text-slate-400">{receiptData.branch_name || 'Sucursal Central'}</p>
              <p className="text-[9px] text-slate-500">{receiptData.branch_address || 'Av. San Martín #450'}</p>
              <div className="pt-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold">
                  {receiptData.receipt_number}
                </span>
              </div>
            </div>

            {/* Receipt Items */}
            <div className="space-y-2 text-xs py-1">
              <div className="flex justify-between gap-3">
                <span className="text-slate-400 shrink-0">Cliente:</span>
                <span className="font-bold text-white text-right break-words">{receiptData.client_name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400 shrink-0">Concepto / Plan:</span>
                <span className="font-bold text-emerald-300 text-right break-words">{receiptData.plan_name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400 shrink-0">Método de Pago:</span>
                <span className="font-semibold text-slate-200 uppercase text-right">
                  {receiptData.payment_method === 'cash'
                    ? 'Efectivo'
                    : receiptData.payment_method === 'qr_transfer'
                    ? 'Transferencia QR'
                    : 'Tarjeta'}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400 shrink-0">Atendido Por:</span>
                <span className="text-slate-300 text-right break-words">{receiptData.processed_by || 'Recepción'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400 shrink-0">Fecha y Hora:</span>
                <span className="font-mono text-slate-300 text-right">{receiptData.paid_at}</span>
              </div>
            </div>

            {/* Total Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total Pagado</span>
                <span className="text-xs text-emerald-400 font-bold">Bolivianos (Bs.)</span>
              </div>
              <span className="text-xl font-black text-white font-mono">
                Bs. {receiptData.amount_bs?.toFixed(2)}
              </span>
            </div>

            {/* Verification Stamp */}
            <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Comprobante Oficial Verificado</span>
            </div>

            {/* Print Action Buttons */}
            <div className="pt-3 flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 print:hidden">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir Recibo</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-rose-400 text-xs font-bold">
            No se pudo obtener el comprobante de pago.
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
