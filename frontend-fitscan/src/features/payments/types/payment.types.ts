export type PaymentMethod = 'QR Pago Simple' | 'Efectivo' | 'Transferencia' | 'Tarjeta de Crédito/Débito';

export interface PaymentTransaction {
  id: string; // Recibo ID
  clientId: string;
  clientName: string;
  membershipPlan: string;
  amountBs: number;
  paymentMethod: PaymentMethod;
  date: string;
  attendedBy: string;
  status: 'completado' | 'pendiente' | 'anulado';
  invoiceNumber: string;
}
