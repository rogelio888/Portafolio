export type ShiftType = 'Mañana' | 'Tarde' | 'Noche';

export interface CashExpense {
  id: string;
  category: string;
  amountBs: number;
  reason: string;
  time: string;
  registeredBy: string;
}

export interface CashSession {
  id: string;
  shift: ShiftType;
  receptionistName: string;
  branchName: string;
  openedAt: string;
  closedAt?: string;
  initialAmountBs: number;
  cashSalesBs: number;
  qrSalesBs: number;
  cardSalesBs: number;
  transferSalesBs: number;
  expensesBs: number;
  expectedCashBs: number;
  actualCashBs?: number;
  differenceBs?: number;
  status: 'abierta' | 'cerrada';
  notes?: string;
  expensesList: CashExpense[];
}
