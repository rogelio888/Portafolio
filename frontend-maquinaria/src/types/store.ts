export type Category = string;

export type PaymentMethod = 'Efectivo' | 'QR Simple';

export type InvoiceMode = 'nota_interna' | 'con_factura' | 'revendedor_diferenciado';

export type PurchaseCurrency = 'BOB' | 'USD';

export type UserRole = 'owner' | 'seller';

export type PermissionKey =
  | 'view_overview'
  | 'manage_inventory'
  | 'view_costs'
  | 'process_sales'
  | 'manage_customers'
  | 'manage_suppliers'
  | 'manage_expenses'
  | 'view_reports'
  | 'manage_users'
  | 'manage_exchange_rate';

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
  isSystem?: boolean;
}

export interface SystemUser {
  id: string;
  fullName: string;
  username: string;
  password: string;
  roleId: string;
  active: boolean;
  createdAt: string;
}

export type OrderStatus = 'Pendiente' | 'En tránsito' | 'Recibida';

export type QuoteStatus = 'Abierta' | 'Convertida' | 'Anulada';

export type ExpenseCategory = string;

export type ExpenseType = 'Fijo' | 'Variable';

export interface InventoryBatch {
  id: string;
  code: string;
  receivedAt: string;
  currency: PurchaseCurrency;
  unitCostOriginal: number;
  baseUnitCostOriginal?: number;
  shippingCostTotalBs?: number;
  shippingCostOriginal?: number;
  shippingCurrency?: PurchaseCurrency;
  shippingExchangeRate?: number;
  targetMarginPct?: number;
  purchaseExchangeRate: number; // 1 for BOB, e.g. 10 or 12 for USD
  unitSaleOriginal: number; // BOB price if BOB, USD target price if USD
  initialQty: number;
  remainingQty: number;
  serialNumbers: string[];
  orderNumber?: string;
}

export interface Supplier {
  id: string;
  name: string;
  city: string;
  contactName: string;
  phone: string;
  email: string;
  leadTimeDays: number;
  categories: Category[];
  paymentTerms: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  docNumber?: string;
  phone?: string;
  city?: string;
  notes?: string;
  createdAt: string;
}

export interface MachineItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  category: Category;
  location: string;
  unit: 'unidad' | 'kit' | 'juego';
  minStock: number;
  warrantyMonths: number;
  supplierId: string;
  specs: string;
  lastSoldAt: string; // ISO date to track stagnant stock
  batches: InventoryBatch[];
}

export interface PaymentAllocation {
  method: PaymentMethod;
  amountBs: number;
}

export interface SaleLine {
  itemId: string;
  sku: string;
  name: string;
  qty: number;
  unitPriceBs: number;
  unitCostBs: number;
  subtotalBs: number;
  batchCode?: string;
  serialNumber?: string;
  warrantyMonths: number;
}

export interface SaleRecord {
  id: string;
  receiptNumber: string;
  createdAt: string;
  customerId?: string;
  customerName: string;
  customerDoc?: string;
  payments: PaymentAllocation[];
  discountBs: number;
  totalBs: number;
  invoiceMode?: InvoiceMode;
  fiscalSurchargePct?: number;
  fiscalReserveBs?: number;
  invoicedAmountBs?: number;
  fiscalRecipientName?: string;
  fiscalRecipientDoc?: string;
  sellerRole: UserRole;
  sellerName?: string;
  quoteNumber?: string;
  lines: SaleLine[];
}

export interface QuoteRecord {
  id: string;
  quoteNumber: string;
  createdAt: string;
  validUntil: string;
  customerId?: string;
  customerName: string;
  customerDoc?: string;
  discountBs: number;
  totalBs: number;
  status: QuoteStatus;
  notes?: string;
  lines: {
    itemId: string;
    sku: string;
    name: string;
    qty: number;
    unitPriceBs: number;
    subtotalBs: number;
  }[];
}

export interface PurchaseOrderLine {
  itemId: string;
  sku: string;
  name: string;
  qty: number;
  currency: PurchaseCurrency;
  unitCostOriginal: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  createdAt: string;
  expectedDate: string;
  status: OrderStatus;
  currency: PurchaseCurrency;
  exchangeRateAtOrder: number;
  shippingCostBs?: number;
  shippingCostOriginal?: number;
  shippingCurrency?: PurchaseCurrency;
  shippingExchangeRate?: number;
  targetMarginPct?: number;
  lines: PurchaseOrderLine[];
  totalOriginal: number;
  totalBs: number;
  receivedAt?: string;
}

export interface ExpenseRecord {
  id: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  expenseType: ExpenseType;
  description: string;
  amountBs: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  createdAt: string;
}

export type KardexMovementType = 'Ingreso compra' | 'Salida venta' | 'Ajuste manual';

export interface KardexEntry {
  id: string;
  createdAt: string;
  itemId: string;
  sku: string;
  itemName: string;
  type: KardexMovementType;
  delta: number;
  balanceAfter: number;
  actorLabel: string;
  reference: string;
  detail: string;
}

export interface DailyRevenuePoint {
  label: string;
  dateKey: string;
  totalBs: number;
  salesCount: number;
}

export interface CashRegisterState {
  isOpen: boolean;
  openingCashBs: number;
  openedAt: string;
  openedBy: string;
  closedAt?: string;
  closedBy?: string;
  closingCountedCashBs?: number;
}

export interface CashClosureRecord {
  id: string;
  openedAt: string;
  closedAt: string;
  openedBy: string;
  closedBy: string;
  openingCashBs: number;
  salesCount: number;
  salesTotalBs: number;
  cashSalesBs: number;
  qrSalesBs: number;
  cashExpensesBs: number;
  expectedCashBs: number;
  countedCashBs: number;
  differenceBs: number;
  notes?: string;
}

export const MAX_CONCURRENT_USERS = 5;

export type AppSection =
  | 'resumen'
  | 'inventario'
  | 'ventas'
  | 'clientes'
  | 'proveedores'
  | 'gastos'
  | 'reportes'
  | 'usuarios';
