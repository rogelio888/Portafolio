import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORY_TYPES,
  DEFAULT_PRODUCT_CATEGORIES,
  INITIAL_CASH_CLOSURES,
  INITIAL_CUSTOMERS,
  INITIAL_EXCHANGE_RATE,
  INITIAL_EXPENSES,
  INITIAL_INVENTORY,
  INITIAL_KARDEX,
  INITIAL_ORDERS,
  INITIAL_QUOTES,
  INITIAL_ROLES,
  INITIAL_SALES,
  INITIAL_SUPPLIERS,
  INITIAL_USERS,
} from '../data/seedData';
import type {
  CashClosureRecord,
  CashRegisterState,
  Customer,
  ExpenseCategory,
  ExpenseRecord,
  ExpenseType,
  InventoryBatch,
  InvoiceMode,
  KardexEntry,
  MachineItem,
  OrderStatus,
  PaymentAllocation,
  PaymentMethod,
  PermissionKey,
  PurchaseCurrency,
  PurchaseOrder,
  PurchaseOrderLine,
  QuoteRecord,
  RoleDefinition,
  SaleLine,
  SaleRecord,
  Supplier,
  SystemUser,
  UserRole,
} from '../types/store';
import {
  getBatchUnitCostBs,
  getBatchUnitSaleBs,
  getTotalStock,
  isSameLocalDay,
} from '../utils/formatters';

const STORAGE_KEY = 'maquinaria_central_demo_v5';

interface PersistedState {
  version: 5;
  currentUserId: string | null;
  roles: RoleDefinition[];
  users: SystemUser[];
  productCategories: string[];
  expenseCategories: string[];
  expenseCategoryTypes: Record<string, ExpenseType>;
  exchangeRate: number;
  cashRegister: CashRegisterState;
  cashClosures: CashClosureRecord[];
  inventory: MachineItem[];
  suppliers: Supplier[];
  customers: Customer[];
  sales: SaleRecord[];
  quotes: QuoteRecord[];
  orders: PurchaseOrder[];
  expenses: ExpenseRecord[];
  kardex: KardexEntry[];
}

export interface NewMachineInput {
  sku: string;
  name: string;
  brand: string;
  model: string;
  category: MachineItem['category'];
  location: string;
  unit: MachineItem['unit'];
  stock: number;
  minStock: number;
  currency: PurchaseCurrency;
  costOriginal: number;
  shippingCostBs?: number;
  shippingCostOriginal?: number;
  shippingCurrency?: PurchaseCurrency;
  shippingExchangeRate?: number;
  targetMarginPct?: number;
  saleOriginal: number;
  purchaseExchangeRate: number;
  warrantyMonths: number;
  supplierId: string;
  specs: string;
  serialNumbers?: string[];
}

export interface NewSaleInput {
  customerId?: string;
  customerName: string;
  customerDoc?: string;
  payments: PaymentAllocation[];
  discountBs: number;
  invoiceMode?: InvoiceMode;
  fiscalSurchargePct?: number;
  fiscalReserveBs?: number;
  invoicedAmountBs?: number;
  fiscalRecipientName?: string;
  fiscalRecipientDoc?: string;
  quoteId?: string;
  items: { itemId: string; qty: number; serialNumber?: string }[];
}

export interface NewQuoteInput {
  customerId?: string;
  customerName: string;
  customerDoc?: string;
  discountBs: number;
  validDays?: number;
  notes?: string;
  items: { itemId: string; qty: number }[];
}

export interface NewOrderInput {
  supplierId: string;
  expectedDate: string;
  currency: PurchaseCurrency;
  exchangeRateAtOrder: number;
  shippingCostBs?: number;
  shippingCostOriginal?: number;
  shippingCurrency?: PurchaseCurrency;
  shippingExchangeRate?: number;
  targetMarginPct?: number;
  items: { itemId: string; qty: number; unitCostOriginal: number }[];
}

export interface NewSupplierInput {
  name: string;
  city: string;
  contactName: string;
  phone: string;
  email: string;
  leadTimeDays: number;
  categories: Supplier['categories'];
  paymentTerms: string;
  notes?: string;
}

export interface NewCustomerInput {
  name: string;
  docNumber?: string;
  phone?: string;
  city?: string;
  notes?: string;
}

export interface NewExpenseInput {
  date: string;
  category: ExpenseCategory;
  expenseType: ExpenseType;
  description: string;
  amountBs: number;
  paymentMethod: PaymentMethod;
  reference?: string;
}

type OpResult = { ok: true } | { ok: false; error: string };

interface StoreContextValue {
  role: UserRole;
  currentUser: SystemUser | null;
  currentRoleDefinition: RoleDefinition | null;
  roles: RoleDefinition[];
  users: SystemUser[];
  productCategories: string[];
  expenseCategories: string[];
  expenseCategoryTypes: Record<string, ExpenseType>;
  exchangeRate: number;
  cashRegister: CashRegisterState;
  cashClosures: CashClosureRecord[];
  inventory: MachineItem[];
  suppliers: Supplier[];
  customers: Customer[];
  sales: SaleRecord[];
  quotes: QuoteRecord[];
  orders: PurchaseOrder[];
  expenses: ExpenseRecord[];
  kardex: KardexEntry[];
  hasPermission: (permission: PermissionKey) => boolean;
  login: (username: string, password: string) => { ok: true; user: SystemUser } | { ok: false; error: string };
  loginAsUser: (userId: string) => { ok: true; user: SystemUser } | { ok: false; error: string };
  logout: () => void;
  setRole: (role: UserRole) => void;
  setExchangeRate: (rate: number) => void;
  openCashRegister: (openingCashBs: number) => void;
  closeCashRegister: (closingCountedCashBs?: number, notes?: string) => CashClosureRecord;
  addMachine: (input: NewMachineInput) => MachineItem;
  importMachinesBulk: (items: NewMachineInput[]) => { added: number; skipped: number };
  updateMachineMeta: (
    id: string,
    patch: Partial<Pick<MachineItem, 'minStock' | 'location' | 'warrantyMonths' | 'specs' | 'category'>>
  ) => void;
  updateActiveBatchPricing: (
    itemId: string,
    batchId: string,
    patch: { unitCostOriginal?: number; unitSaleOriginal?: number }
  ) => void;
  adjustStock: (id: string, delta: number, reason?: string) => void;
  addProductCategory: (name: string) => OpResult;
  renameProductCategory: (oldName: string, newName: string) => OpResult;
  deleteProductCategory: (name: string) => OpResult;
  addExpenseCategory: (name: string, defaultType?: ExpenseType) => OpResult;
  renameExpenseCategory: (oldName: string, newName: string) => OpResult;
  deleteExpenseCategory: (name: string) => OpResult;
  setExpenseCategoryDefaultType: (name: string, type: ExpenseType) => void;
  recordSale: (input: NewSaleInput) => { ok: true; sale: SaleRecord } | { ok: false; error: string };
  saveQuote: (input: NewQuoteInput) => QuoteRecord;
  cancelQuote: (quoteId: string) => void;
  deleteQuote: (quoteId: string) => void;
  createPurchaseOrder: (input: NewOrderInput) => PurchaseOrder;
  advanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => { receivedUnits: number };
  addSupplier: (input: NewSupplierInput) => Supplier;
  addCustomer: (input: NewCustomerInput) => Customer;
  addExpense: (input: NewExpenseInput) => ExpenseRecord;
  deleteExpense: (id: string) => void;
  addUser: (input: {
    fullName: string;
    username: string;
    password: string;
    roleId: string;
  }) => { ok: true; user: SystemUser } | { ok: false; error: string };
  updateUser: (
    id: string,
    patch: Partial<Pick<SystemUser, 'fullName' | 'username' | 'password' | 'roleId' | 'active'>>
  ) => OpResult;
  deleteUser: (id: string) => OpResult;
  addRole: (input: {
    name: string;
    description: string;
    permissions: PermissionKey[];
  }) => { ok: true; role: RoleDefinition } | { ok: false; error: string };
  updateRole: (
    id: string,
    patch: Partial<Pick<RoleDefinition, 'name' | 'description' | 'permissions'>>
  ) => OpResult;
  deleteRole: (id: string) => OpResult;
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function createDefaultState(): PersistedState {
  return {
    version: 5,
    currentUserId: null,
    roles: INITIAL_ROLES,
    users: INITIAL_USERS,
    productCategories: DEFAULT_PRODUCT_CATEGORIES,
    expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
    expenseCategoryTypes: DEFAULT_EXPENSE_CATEGORY_TYPES,
    exchangeRate: INITIAL_EXCHANGE_RATE,
    cashRegister: {
      isOpen: true,
      openingCashBs: 500,
      openedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      openedBy: 'Carlos Mendoza',
    },
    cashClosures: INITIAL_CASH_CLOSURES,
    inventory: INITIAL_INVENTORY,
    suppliers: INITIAL_SUPPLIERS,
    customers: INITIAL_CUSTOMERS,
    sales: INITIAL_SALES,
    quotes: INITIAL_QUOTES,
    orders: INITIAL_ORDERS,
    expenses: INITIAL_EXPENSES,
    kardex: INITIAL_KARDEX,
  };
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (
      parsed.version !== 5 ||
      !Array.isArray(parsed.inventory) ||
      !Array.isArray(parsed.suppliers) ||
      !Array.isArray(parsed.customers) ||
      !Array.isArray(parsed.sales) ||
      !Array.isArray(parsed.quotes) ||
      !Array.isArray(parsed.orders) ||
      !Array.isArray(parsed.expenses) ||
      !Array.isArray(parsed.kardex)
    ) {
      return createDefaultState();
    }
    const defaults = createDefaultState();
    return {
      ...(parsed as PersistedState),
      roles: Array.isArray(parsed.roles) && parsed.roles.length > 0 ? parsed.roles : defaults.roles,
      users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : defaults.users,
      productCategories:
        Array.isArray(parsed.productCategories) && parsed.productCategories.length > 0
          ? parsed.productCategories
          : defaults.productCategories,
      expenseCategories:
        Array.isArray(parsed.expenseCategories) && parsed.expenseCategories.length > 0
          ? parsed.expenseCategories
          : defaults.expenseCategories,
      expenseCategoryTypes: parsed.expenseCategoryTypes ?? defaults.expenseCategoryTypes,
      cashRegister: parsed.cashRegister ?? defaults.cashRegister,
      cashClosures: Array.isArray(parsed.cashClosures) ? parsed.cashClosures : defaults.cashClosures,
      currentUserId: parsed.currentUserId ?? null,
    };
  } catch {
    return createDefaultState();
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota issues in demo mode
    }
  }, [state]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId && u.active) ?? null,
    [state.users, state.currentUserId]
  );

  const currentRoleDefinition = useMemo(
    () =>
      currentUser
        ? state.roles.find((r) => r.id === currentUser.roleId) ?? null
        : null,
    [currentUser, state.roles]
  );

  const role: UserRole = useMemo(() => {
    if (!currentRoleDefinition) return 'seller';
    return currentRoleDefinition.permissions.includes('view_costs') ||
      currentRoleDefinition.permissions.includes('manage_users')
      ? 'owner'
      : 'seller';
  }, [currentRoleDefinition]);

  const actorLabel = currentUser?.fullName ?? 'Carlos Mendoza';

  const hasPermission = (permission: PermissionKey): boolean => {
    if (!currentRoleDefinition) return false;
    return currentRoleDefinition.permissions.includes(permission);
  };

  const login = (username: string, password: string) => {
    const cleanUser = username.trim().toLowerCase();
    const found = state.users.find((u) => u.username.toLowerCase() === cleanUser);
    if (!found || found.password !== password) {
      return { ok: false as const, error: 'Usuario o contraseña incorrectos.' };
    }
    if (!found.active) {
      return { ok: false as const, error: 'Este usuario está desactivado. Pide al dueño habilitarlo.' };
    }
    setState((prev) => ({ ...prev, currentUserId: found.id }));
    return { ok: true as const, user: found };
  };

  const loginAsUser = (userId: string) => {
    const found = state.users.find((u) => u.id === userId);
    if (!found) {
      return { ok: false as const, error: 'El usuario seleccionado no existe.' };
    }
    if (!found.active) {
      return { ok: false as const, error: 'Este usuario está inactivo.' };
    }
    setState((prev) => ({ ...prev, currentUserId: found.id }));
    return { ok: true as const, user: found };
  };

  const logout = () => {
    setState((prev) => ({ ...prev, currentUserId: null }));
  };

  const setRole = (targetRole: UserRole) => {
    const matchingUser =
      targetRole === 'owner'
        ? state.users.find(
            (u) =>
              u.active &&
              state.roles
                .find((r) => r.id === u.roleId)
                ?.permissions.includes('manage_users')
          )
        : state.users.find(
            (u) =>
              u.active &&
              !state.roles
                .find((r) => r.id === u.roleId)
                ?.permissions.includes('view_costs')
          );
    if (matchingUser) {
      setState((prev) => ({ ...prev, currentUserId: matchingUser.id }));
    }
  };

  const setExchangeRate = (rate: number) => {
    const safe = Number.isFinite(rate) && rate > 0 ? Math.round(rate * 100) / 100 : state.exchangeRate;
    setState((prev) => ({ ...prev, exchangeRate: safe }));
  };

  const openCashRegister = (openingCashBs: number) => {
    const safe = Number.isFinite(openingCashBs) && openingCashBs >= 0 ? Math.round(openingCashBs) : 0;
    setState((prev) => ({
      ...prev,
      cashRegister: {
        isOpen: true,
        openingCashBs: safe,
        openedAt: new Date().toISOString(),
        openedBy: actorLabel,
      },
    }));
  };

  const closeCashRegister = (closingCountedCashBs?: number, notes?: string): CashClosureRecord => {
    const nowDate = new Date();
    const nowIso = nowDate.toISOString();
    const todayClosureCutoff = state.cashClosures.reduce((maxMs, c) => {
      if (!isSameLocalDay(c.closedAt, nowDate)) return maxMs;
      const ms = new Date(c.closedAt).getTime();
      return Number.isFinite(ms) && ms > maxMs ? ms : maxMs;
    }, 0);

    let salesCount = 0;
    let salesTotalBs = 0;
    let cashSalesBs = 0;
    let qrSalesBs = 0;

    for (const sale of state.sales) {
      if (!isSameLocalDay(sale.createdAt, nowDate)) continue;
      const saleMs = new Date(sale.createdAt).getTime();
      if (todayClosureCutoff > 0 && saleMs <= todayClosureCutoff) continue;
      salesCount += 1;
      salesTotalBs += sale.totalBs;
      for (const p of sale.payments) {
        if (p.method === 'Efectivo') cashSalesBs += p.amountBs;
        else if (p.method === 'QR Simple') qrSalesBs += p.amountBs;
      }
    }

    let cashExpensesBs = 0;
    for (const exp of state.expenses) {
      if (!isSameLocalDay(exp.date, nowDate)) continue;
      const expMs = new Date(exp.createdAt).getTime();
      if (todayClosureCutoff > 0 && expMs <= todayClosureCutoff) continue;
      if (exp.paymentMethod === 'Efectivo') {
        cashExpensesBs += exp.amountBs;
      }
    }

    const expectedCashBs = state.cashRegister.openingCashBs + cashSalesBs - cashExpensesBs;
    const safeCounted =
      closingCountedCashBs !== undefined &&
      Number.isFinite(closingCountedCashBs) &&
      closingCountedCashBs >= 0
        ? Math.round(closingCountedCashBs)
        : expectedCashBs;

    const closureRecord: CashClosureRecord = {
      id: `cc-${Date.now().toString(36)}`,
      openedAt: state.cashRegister.openedAt,
      closedAt: nowIso,
      openedBy: state.cashRegister.openedBy,
      closedBy: actorLabel,
      openingCashBs: state.cashRegister.openingCashBs,
      salesCount,
      salesTotalBs,
      cashSalesBs,
      qrSalesBs,
      cashExpensesBs,
      expectedCashBs,
      countedCashBs: safeCounted,
      differenceBs: safeCounted - expectedCashBs,
      notes: notes?.trim() || undefined,
    };

    setState((prev) => ({
      ...prev,
      cashRegister: {
        ...prev.cashRegister,
        isOpen: false,
        closedAt: nowIso,
        closedBy: actorLabel,
        closingCountedCashBs: safeCounted,
      },
      cashClosures: [closureRecord, ...prev.cashClosures],
    }));

    return closureRecord;
  };

  const addMachine = (input: NewMachineInput): MachineItem => {
    const now = new Date().toISOString();
    const batchId = `bat-${Date.now().toString(36)}`;
    const loteCode = `L-${String(Math.floor(120 + Math.random() * 800))}`;
    const itemId = `itm-${Date.now().toString(36)}`;
    const safeQty = Math.max(0, input.stock);
    const tc = input.currency === 'USD' ? Math.max(0.01, input.purchaseExchangeRate) : 1;
    const shippingBs = Math.max(0, Math.round(input.shippingCostBs ?? 0));
    const divisor = safeQty > 0 ? safeQty : 1;
    const shippingPerUnitOrig = shippingBs > 0 ? shippingBs / tc / divisor : 0;
    const landedUnitCostOrig =
      Math.round((input.costOriginal + shippingPerUnitOrig) * 100) / 100;

    const batch: InventoryBatch = {
      id: batchId,
      code: loteCode,
      receivedAt: now,
      currency: input.currency,
      unitCostOriginal: landedUnitCostOrig,
      baseUnitCostOriginal: input.costOriginal,
      shippingCostTotalBs: shippingBs > 0 ? shippingBs : undefined,
      shippingCostOriginal: input.shippingCostOriginal,
      shippingCurrency: input.shippingCurrency,
      shippingExchangeRate: input.shippingExchangeRate,
      targetMarginPct: input.targetMarginPct,
      purchaseExchangeRate: tc,
      unitSaleOriginal: input.saleOriginal,
      initialQty: safeQty,
      remainingQty: safeQty,
      serialNumbers: input.serialNumbers ?? [],
    };

    const item: MachineItem = {
      id: itemId,
      sku: input.sku,
      name: input.name,
      brand: input.brand,
      model: input.model,
      category: input.category,
      location: input.location,
      unit: input.unit,
      minStock: input.minStock,
      warrantyMonths: input.warrantyMonths,
      supplierId: input.supplierId,
      specs: input.specs,
      lastSoldAt: now,
      batches: [batch],
    };

    const shipNote = shippingBs > 0 ? ` (+ envío Bs ${shippingBs} prorrateado)` : '';
    const kdx: KardexEntry = {
      id: `kdx-${Date.now().toString(36)}`,
      createdAt: now,
      itemId,
      sku: item.sku,
      itemName: item.name,
      type: 'Ingreso compra',
      delta: batch.initialQty,
      balanceAfter: batch.initialQty,
      actorLabel,
      reference: loteCode,
      detail:
        input.currency === 'USD'
          ? `Alta inicial en USD a TC Bs ${tc.toFixed(2)}${shipNote}`
          : `Alta inicial en Bs${shipNote}`,
    };

    setState((prev) => ({
      ...prev,
      inventory: [item, ...prev.inventory],
      kardex: [kdx, ...prev.kardex],
    }));
    return item;
  };

  const importMachinesBulk = (items: NewMachineInput[]) => {
    const existingSkus = new Set(state.inventory.map((it) => it.sku.toUpperCase()));
    const now = new Date().toISOString();
    const toAdd: MachineItem[] = [];
    const newKardex: KardexEntry[] = [];
    let skipped = 0;

    items.forEach((input, idx) => {
      const sku = input.sku.trim().toUpperCase();
      if (!sku || existingSkus.has(sku)) {
        skipped += 1;
        return;
      }
      existingSkus.add(sku);
      const itemId = `itm-imp-${Date.now().toString(36)}-${idx}`;
      const loteCode = `L-${200 + idx}`;
      const qty = Math.max(0, input.stock);

      toAdd.push({
        id: itemId,
        sku,
        name: input.name,
        brand: input.brand,
        model: input.model,
        category: input.category,
        location: input.location,
        unit: input.unit,
        minStock: input.minStock,
        warrantyMonths: input.warrantyMonths,
        supplierId: input.supplierId || state.suppliers[0]?.id || '',
        specs: input.specs,
        lastSoldAt: now,
        batches: [
          {
            id: `bat-imp-${Date.now().toString(36)}-${idx}`,
            code: loteCode,
            receivedAt: now,
            currency: input.currency,
            unitCostOriginal: input.costOriginal,
            purchaseExchangeRate: input.currency === 'USD' ? input.purchaseExchangeRate : 1,
            unitSaleOriginal: input.saleOriginal,
            initialQty: qty,
            remainingQty: qty,
            serialNumbers: [],
          },
        ],
      });

      newKardex.push({
        id: `kdx-imp-${Date.now().toString(36)}-${idx}`,
        createdAt: now,
        itemId,
        sku,
        itemName: input.name,
        type: 'Ingreso compra',
        delta: qty,
        balanceAfter: qty,
        actorLabel,
        reference: 'IMPORT-CSV',
        detail: `Importación masiva (${input.currency})`,
      });
    });

    if (toAdd.length > 0) {
      setState((prev) => ({
        ...prev,
        inventory: [...toAdd, ...prev.inventory],
        kardex: [...newKardex, ...prev.kardex],
      }));
    }

    return { added: toAdd.length, skipped };
  };

  const updateMachineMeta = (
    id: string,
    patch: Partial<Pick<MachineItem, 'minStock' | 'location' | 'warrantyMonths' | 'specs' | 'category'>>
  ) => {
    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const updateActiveBatchPricing = (
    itemId: string,
    batchId: string,
    patch: { unitCostOriginal?: number; unitSaleOriginal?: number }
  ) => {
    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((item) =>
        item.id === itemId
          ? {
              ...item,
              batches: item.batches.map((b) => (b.id === batchId ? { ...b, ...patch } : b)),
            }
          : item
      ),
    }));
  };

  const adjustStock = (id: string, delta: number, reason = 'Ajuste de inventario') => {
    if (delta === 0) return;
    const target = state.inventory.find((it) => it.id === id);
    if (!target) return;

    const currentStock = getTotalStock(target);
    const nextStock = Math.max(0, currentStock + delta);
    const actualDelta = nextStock - currentStock;
    if (actualDelta === 0) return;

    const now = new Date().toISOString();

    setState((prev) => {
      const updatedInv = prev.inventory.map((item) => {
        if (item.id !== id) return item;
        const batches = item.batches.map((b) => ({ ...b }));
        if (actualDelta > 0) {
          const targetBatch = batches[batches.length - 1];
          if (targetBatch) {
            targetBatch.remainingQty += actualDelta;
            targetBatch.initialQty += actualDelta;
          }
        } else {
          let toDeduct = Math.abs(actualDelta);
          for (const b of batches) {
            if (toDeduct <= 0) break;
            const take = Math.min(b.remainingQty, toDeduct);
            b.remainingQty -= take;
            toDeduct -= take;
          }
        }
        return { ...item, batches };
      });

      const kdx: KardexEntry = {
        id: `kdx-${Date.now().toString(36)}`,
        createdAt: now,
        itemId: target.id,
        sku: target.sku,
        itemName: target.name,
        type: 'Ajuste manual',
        delta: actualDelta,
        balanceAfter: nextStock,
        actorLabel,
        reference: 'AJUSTE',
        detail: reason,
      };

      return {
        ...prev,
        inventory: updatedInv,
        kardex: [kdx, ...prev.kardex],
      };
    });
  };

  const addProductCategory = (name: string): OpResult => {
    const clean = name.trim();
    if (!clean) return { ok: false, error: 'Escribe el nombre de la categoría.' };
    if (state.productCategories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      return { ok: false, error: `La categoría "${clean}" ya existe.` };
    }
    setState((prev) => ({
      ...prev,
      productCategories: [...prev.productCategories, clean],
    }));
    return { ok: true };
  };

  const renameProductCategory = (oldName: string, newName: string): OpResult => {
    const clean = newName.trim();
    if (!clean) return { ok: false, error: 'El nombre no puede quedar vacío.' };
    if (
      clean.toLowerCase() !== oldName.toLowerCase() &&
      state.productCategories.some((c) => c.toLowerCase() === clean.toLowerCase())
    ) {
      return { ok: false, error: `Ya existe otra categoría llamada "${clean}".` };
    }
    setState((prev) => ({
      ...prev,
      productCategories: prev.productCategories.map((c) => (c === oldName ? clean : c)),
      inventory: prev.inventory.map((it) =>
        it.category === oldName ? { ...it, category: clean } : it
      ),
      suppliers: prev.suppliers.map((s) => ({
        ...s,
        categories: s.categories.map((c) => (c === oldName ? clean : c)),
      })),
    }));
    return { ok: true };
  };

  const deleteProductCategory = (name: string): OpResult => {
    if (state.productCategories.length <= 1) {
      return { ok: false, error: 'Debe existir al menos una categoría activa.' };
    }
    const usedCount = state.inventory.filter((it) => it.category === name).length;
    if (usedCount > 0) {
      return {
        ok: false,
        error: `Hay ${usedCount} equipo(s) usando "${name}". Cámbialos de categoría antes de eliminarla.`,
      };
    }
    setState((prev) => ({
      ...prev,
      productCategories: prev.productCategories.filter((c) => c !== name),
      suppliers: prev.suppliers.map((s) => ({
        ...s,
        categories: s.categories.filter((c) => c !== name),
      })),
    }));
    return { ok: true };
  };

  const addExpenseCategory = (name: string, defaultType: ExpenseType = 'Variable'): OpResult => {
    const clean = name.trim();
    if (!clean) return { ok: false, error: 'Escribe el nombre de la categoría de gasto.' };
    if (state.expenseCategories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      return { ok: false, error: `La categoría "${clean}" ya existe.` };
    }
    setState((prev) => ({
      ...prev,
      expenseCategories: [...prev.expenseCategories, clean],
      expenseCategoryTypes: { ...prev.expenseCategoryTypes, [clean]: defaultType },
    }));
    return { ok: true };
  };

  const renameExpenseCategory = (oldName: string, newName: string): OpResult => {
    const clean = newName.trim();
    if (!clean) return { ok: false, error: 'El nombre no puede quedar vacío.' };
    if (
      clean.toLowerCase() !== oldName.toLowerCase() &&
      state.expenseCategories.some((c) => c.toLowerCase() === clean.toLowerCase())
    ) {
      return { ok: false, error: `Ya existe otra categoría llamada "${clean}".` };
    }
    setState((prev) => {
      const nextTypes = { ...prev.expenseCategoryTypes };
      const prevType = nextTypes[oldName] ?? 'Variable';
      delete nextTypes[oldName];
      nextTypes[clean] = prevType;
      return {
        ...prev,
        expenseCategories: prev.expenseCategories.map((c) => (c === oldName ? clean : c)),
        expenseCategoryTypes: nextTypes,
        expenses: prev.expenses.map((ex) =>
          ex.category === oldName ? { ...ex, category: clean } : ex
        ),
      };
    });
    return { ok: true };
  };

  const deleteExpenseCategory = (name: string): OpResult => {
    if (state.expenseCategories.length <= 1) {
      return { ok: false, error: 'Debe existir al menos una categoría de gasto.' };
    }
    const usedCount = state.expenses.filter((ex) => ex.category === name).length;
    if (usedCount > 0) {
      return {
        ok: false,
        error: `Hay ${usedCount} gasto(s) registrados bajo "${name}". No puede borrarse mientras tenga historial.`,
      };
    }
    setState((prev) => {
      const nextTypes = { ...prev.expenseCategoryTypes };
      delete nextTypes[name];
      return {
        ...prev,
        expenseCategories: prev.expenseCategories.filter((c) => c !== name),
        expenseCategoryTypes: nextTypes,
      };
    });
    return { ok: true };
  };

  const setExpenseCategoryDefaultType = (name: string, type: ExpenseType) => {
    setState((prev) => ({
      ...prev,
      expenseCategoryTypes: { ...prev.expenseCategoryTypes, [name]: type },
    }));
  };

  const recordSale = (
    input: NewSaleInput
  ): { ok: true; sale: SaleRecord } | { ok: false; error: string } => {
    if (!state.cashRegister.isOpen) {
      return {
        ok: false,
        error: 'La caja está cerrada. Abre la caja en la pestaña Caja antes de registrar ventas.',
      };
    }
    if (input.items.length === 0) {
      return { ok: false, error: 'Agrega al menos un equipo o repuesto a la venta.' };
    }

    const byId = new Map(state.inventory.map((it) => [it.id, it]));
    const lines: SaleLine[] = [];
    const batchDeductions = new Map<string, Map<string, number>>();
    const now = new Date().toISOString();

    for (const req of input.items) {
      const item = byId.get(req.itemId);
      if (!item) {
        return { ok: false, error: 'Uno de los productos ya no existe en inventario.' };
      }
      const totalAvailable = getTotalStock(item);
      if (req.qty <= 0) {
        return { ok: false, error: `Cantidad inválida para ${item.name}.` };
      }
      if (totalAvailable < req.qty) {
        return {
          ok: false,
          error: `Stock insuficiente para ${item.name} (disponible: ${totalAvailable}).`,
        };
      }

      let remainingNeed = req.qty;
      const itemDeductions = new Map<string, number>();

      for (const batch of item.batches) {
        if (remainingNeed <= 0) break;
        if (batch.remainingQty <= 0) continue;
        const take = Math.min(batch.remainingQty, remainingNeed);
        itemDeductions.set(batch.id, take);
        remainingNeed -= take;

        const unitPriceBs = getBatchUnitSaleBs(batch, state.exchangeRate);
        const unitCostBs = getBatchUnitCostBs(batch);

        lines.push({
          itemId: item.id,
          sku: item.sku,
          name: item.name,
          qty: take,
          unitPriceBs,
          unitCostBs,
          subtotalBs: unitPriceBs * take,
          batchCode: batch.code,
          serialNumber: req.serialNumber || batch.serialNumbers[0],
          warrantyMonths: item.warrantyMonths,
        });
      }

      batchDeductions.set(item.id, itemDeductions);
    }

    const gross = lines.reduce((acc, l) => acc + l.subtotalBs, 0);
    const safeDiscount = Math.max(0, Math.min(gross, Math.round(input.discountBs)));
    const netEquipmentBs = gross - safeDiscount;
    const invoiceMode: InvoiceMode = input.invoiceMode ?? 'nota_interna';
    const fiscalReserveBs =
      invoiceMode === 'nota_interna'
        ? 0
        : Math.max(0, Math.round(input.fiscalReserveBs ?? 0));
    const totalBs = netEquipmentBs + fiscalReserveBs;
    const invoicedAmountBs =
      invoiceMode === 'nota_interna'
        ? undefined
        : Math.max(totalBs, Math.round(input.invoicedAmountBs ?? totalBs));

    const cleanPayments = input.payments
      .filter((p) => p.amountBs > 0)
      .map((p) => ({ ...p, amountBs: Math.round(p.amountBs) }));

    const paidSum = cleanPayments.reduce((sum, p) => sum + p.amountBs, 0);
    if (cleanPayments.length === 0 || paidSum !== totalBs) {
      return {
        ok: false,
        error: `La suma de pagos (${paidSum} Bs) debe coincidir exactamente con el total a cobrar (${totalBs} Bs).`,
      };
    }

    const maxNum = state.sales.reduce((max, s) => {
      const parsed = Number.parseInt(s.receiptNumber.replace(/\D/g, ''), 10);
      return Number.isFinite(parsed) && parsed > max ? parsed : max;
    }, 418);
    const receiptNumber = `V-${String(maxNum + 1).padStart(5, '0')}`;

    const linkedQuote = input.quoteId
      ? state.quotes.find((q) => q.id === input.quoteId)
      : undefined;

    const sale: SaleRecord = {
      id: `sal-${Date.now().toString(36)}`,
      receiptNumber,
      createdAt: now,
      customerId: input.customerId,
      customerName: input.customerName.trim() || 'Cliente Mostrador',
      customerDoc: input.customerDoc?.trim() || undefined,
      payments: cleanPayments,
      discountBs: safeDiscount,
      totalBs,
      invoiceMode,
      fiscalSurchargePct: input.fiscalSurchargePct,
      fiscalReserveBs,
      invoicedAmountBs,
      fiscalRecipientName: input.fiscalRecipientName?.trim() || undefined,
      fiscalRecipientDoc: input.fiscalRecipientDoc?.trim() || undefined,
      sellerRole: role,
      sellerName: actorLabel,
      quoteNumber: linkedQuote?.quoteNumber,
      lines,
    };

    const newKardex: KardexEntry[] = [];

    setState((prev) => {
      const nextInventory = prev.inventory.map((item) => {
        const deductMap = batchDeductions.get(item.id);
        if (!deductMap) return item;
        let totalDeducted = 0;
        const nextBatches = item.batches.map((b) => {
          const take = deductMap.get(b.id) ?? 0;
          totalDeducted += take;
          return {
            ...b,
            remainingQty: Math.max(0, b.remainingQty - take),
          };
        });
        const newBal = nextBatches.reduce((sum, b) => sum + b.remainingQty, 0);
        newKardex.push({
          id: `kdx-${Date.now().toString(36)}-${item.id}`,
          createdAt: now,
          itemId: item.id,
          sku: item.sku,
          itemName: item.name,
          type: 'Salida venta',
          delta: -totalDeducted,
          balanceAfter: newBal,
          actorLabel,
          reference: receiptNumber,
          detail: `Venta a ${sale.customerName}`,
        });
        return {
          ...item,
          lastSoldAt: now,
          batches: nextBatches,
        };
      });

      const nextQuotes = input.quoteId
        ? prev.quotes.map((q) =>
            q.id === input.quoteId ? { ...q, status: 'Convertida' as const } : q
          )
        : prev.quotes;

      return {
        ...prev,
        inventory: nextInventory,
        sales: [sale, ...prev.sales],
        quotes: nextQuotes,
        kardex: [...newKardex, ...prev.kardex],
      };
    });

    return { ok: true, sale };
  };

  const saveQuote = (input: NewQuoteInput): QuoteRecord => {
    const byId = new Map(state.inventory.map((it) => [it.id, it]));
    const lines = input.items
      .map((req) => {
        const item = byId.get(req.itemId);
        if (!item) return null;
        const active = item.batches.find((b) => b.remainingQty > 0) ?? item.batches[0];
        const unitPriceBs = active ? getBatchUnitSaleBs(active, state.exchangeRate) : 0;
        return {
          itemId: item.id,
          sku: item.sku,
          name: item.name,
          qty: req.qty,
          unitPriceBs,
          subtotalBs: unitPriceBs * req.qty,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const gross = lines.reduce((sum, l) => sum + l.subtotalBs, 0);
    const safeDiscount = Math.max(0, Math.min(gross, Math.round(input.discountBs)));
    const totalBs = gross - safeDiscount;

    const maxNum = state.quotes.reduce((max, q) => {
      const parsed = Number.parseInt(q.quoteNumber.replace(/\D/g, ''), 10);
      return Number.isFinite(parsed) && parsed > max ? parsed : max;
    }, 12);

    const validDt = new Date();
    validDt.setDate(validDt.getDate() + (input.validDays ?? 7));

    const quote: QuoteRecord = {
      id: `qt-${Date.now().toString(36)}`,
      quoteNumber: `PROF-${String(maxNum + 1).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
      validUntil: validDt.toISOString().slice(0, 10),
      customerId: input.customerId,
      customerName: input.customerName.trim() || 'Cliente Mostrador',
      customerDoc: input.customerDoc?.trim() || undefined,
      discountBs: safeDiscount,
      totalBs,
      status: 'Abierta',
      notes: input.notes?.trim() || 'Cotización válida según disponibilidad de stock.',
      lines,
    };

    setState((prev) => ({
      ...prev,
      quotes: [quote, ...prev.quotes],
    }));
    return quote;
  };

  const cancelQuote = (quoteId: string) => {
    setState((prev) => ({
      ...prev,
      quotes: prev.quotes.map((q) =>
        q.id === quoteId && q.status === 'Abierta' ? { ...q, status: 'Anulada' } : q
      ),
    }));
  };

  const deleteQuote = (quoteId: string) => {
    setState((prev) => ({
      ...prev,
      quotes: prev.quotes.filter((q) => q.id !== quoteId),
    }));
  };

  const createPurchaseOrder = (input: NewOrderInput): PurchaseOrder => {
    const byId = new Map(state.inventory.map((it) => [it.id, it]));
    const lines: PurchaseOrderLine[] = input.items.map((req) => {
      const item = byId.get(req.itemId);
      return {
        itemId: req.itemId,
        sku: item?.sku ?? 'SKU',
        name: item?.name ?? 'Equipo',
        qty: Math.max(1, req.qty),
        currency: input.currency,
        unitCostOriginal: Math.max(0, req.unitCostOriginal),
      };
    });

    const maxNum = state.orders.reduce((max, o) => {
      const parsed = Number.parseInt(o.orderNumber.replace(/\D/g, ''), 10);
      return Number.isFinite(parsed) && parsed > max ? parsed : max;
    }, 94);

    const totalOriginal = lines.reduce((acc, l) => acc + l.qty * l.unitCostOriginal, 0);
    const tc = input.currency === 'USD' ? input.exchangeRateAtOrder : 1;
    const shippingCostBs = Math.max(0, Math.round(input.shippingCostBs ?? 0));
    const totalBs = Math.round(totalOriginal * tc) + shippingCostBs;

    const order: PurchaseOrder = {
      id: `po-${Date.now().toString(36)}`,
      orderNumber: `OC-${String(maxNum + 1).padStart(4, '0')}`,
      supplierId: input.supplierId,
      createdAt: new Date().toISOString(),
      expectedDate: input.expectedDate,
      status: 'Pendiente',
      currency: input.currency,
      exchangeRateAtOrder: tc,
      shippingCostBs: shippingCostBs > 0 ? shippingCostBs : undefined,
      shippingCostOriginal: input.shippingCostOriginal,
      shippingCurrency: input.shippingCurrency,
      shippingExchangeRate: input.shippingExchangeRate,
      targetMarginPct: input.targetMarginPct,
      lines,
      totalOriginal,
      totalBs,
    };

    setState((prev) => ({
      ...prev,
      orders: [order, ...prev.orders],
    }));

    return order;
  };

  const advanceOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    const target = state.orders.find((o) => o.id === orderId);
    if (!target || target.status === nextStatus) {
      return { receivedUnits: 0 };
    }

    const receivingNow = target.status !== 'Recibida' && nextStatus === 'Recibida';
    let receivedUnits = 0;
    const now = new Date().toISOString();

    if (receivingNow) {
      for (const line of target.lines) {
        receivedUnits += line.qty;
      }
    }

    setState((prev) => {
      const newKardex: KardexEntry[] = [];
      let nextInventory = prev.inventory;

      if (receivingNow) {
        const lineByItem = new Map(target.lines.map((l) => [l.itemId, l]));
        const orderShippingBs = Math.max(0, Math.round(target.shippingCostBs ?? 0));
        const totalCatalogOrig = target.lines.reduce(
          (sum, l) => sum + l.qty * l.unitCostOriginal,
          0
        );

        nextInventory = prev.inventory.map((item) => {
          const line = lineByItem.get(item.id);
          if (!line) return item;

          const tcUsed = line.currency === 'USD' ? prev.exchangeRate : 1;
          const lineShare =
            totalCatalogOrig > 0
              ? (line.qty * line.unitCostOriginal) / totalCatalogOrig
              : 1 / Math.max(1, target.lines.length);
          const lineShippingBs = Math.round(orderShippingBs * lineShare);
          const shipPerUnitOrig =
            line.qty > 0 && lineShippingBs > 0 ? lineShippingBs / tcUsed / line.qty : 0;
          const landedUnitCostOrig =
            Math.round((line.unitCostOriginal + shipPerUnitOrig) * 100) / 100;

          const latestBatch = item.batches[item.batches.length - 1];
          const roundPrice = (val: number) =>
            line.currency === 'USD' ? Math.round(val * 100) / 100 : Math.round(val);
          let unitSaleOriginal = roundPrice(landedUnitCostOrig * 1.32);
          if (target.targetMarginPct !== undefined && target.targetMarginPct > 0) {
            unitSaleOriginal = roundPrice(
              landedUnitCostOrig * (1 + target.targetMarginPct / 100)
            );
          } else if (
            latestBatch &&
            latestBatch.currency === line.currency &&
            latestBatch.unitCostOriginal > 0
          ) {
            const ratio = latestBatch.unitSaleOriginal / latestBatch.unitCostOriginal;
            unitSaleOriginal = roundPrice(landedUnitCostOrig * ratio);
          }

          const loteCode = `L-${String(Math.floor(115 + Math.random() * 880))}`;
          const newBatch: InventoryBatch = {
            id: `bat-${Date.now().toString(36)}-${item.id}`,
            code: loteCode,
            receivedAt: now,
            currency: line.currency,
            unitCostOriginal: landedUnitCostOrig,
            baseUnitCostOriginal: line.unitCostOriginal,
            shippingCostTotalBs: lineShippingBs > 0 ? lineShippingBs : undefined,
            targetMarginPct: target.targetMarginPct,
            purchaseExchangeRate: tcUsed,
            unitSaleOriginal,
            initialQty: line.qty,
            remainingQty: line.qty,
            serialNumbers: [],
            orderNumber: target.orderNumber,
          };

          const shipDetail =
            lineShippingBs > 0 ? ` (+ envío Bs ${lineShippingBs} prorrateado)` : '';
          const newBalance = getTotalStock(item) + line.qty;
          newKardex.push({
            id: `kdx-${Date.now().toString(36)}-${item.id}`,
            createdAt: now,
            itemId: item.id,
            sku: item.sku,
            itemName: item.name,
            type: 'Ingreso compra',
            delta: line.qty,
            balanceAfter: newBalance,
            actorLabel,
            reference: target.orderNumber,
            detail:
              line.currency === 'USD'
                ? `Nuevo lote ${loteCode} en USD a TC Bs ${prev.exchangeRate.toFixed(2)}${shipDetail}`
                : `Nuevo lote ${loteCode} en Bs${shipDetail}`,
          });

          return {
            ...item,
            batches: [...item.batches, newBatch],
          };
        });
      }

      return {
        ...prev,
        inventory: nextInventory,
        orders: prev.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: nextStatus,
                receivedAt: receivingNow ? now : o.receivedAt,
              }
            : o
        ),
        kardex: [...newKardex, ...prev.kardex],
      };
    });

    return { receivedUnits };
  };

  const addSupplier = (input: NewSupplierInput): Supplier => {
    const supplier: Supplier = {
      ...input,
      id: `sup-${Date.now().toString(36)}`,
    };
    setState((prev) => ({
      ...prev,
      suppliers: [supplier, ...prev.suppliers],
    }));
    return supplier;
  };

  const addCustomer = (input: NewCustomerInput): Customer => {
    const customer: Customer = {
      ...input,
      id: `cus-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      customers: [customer, ...prev.customers],
    }));
    return customer;
  };

  const addExpense = (input: NewExpenseInput): ExpenseRecord => {
    const expense: ExpenseRecord = {
      ...input,
      id: `exp-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      expenses: [expense, ...prev.expenses],
    }));
    return expense;
  };

  const deleteExpense = (id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  const addUser = (input: {
    fullName: string;
    username: string;
    password: string;
    roleId: string;
  }) => {
    const fullName = input.fullName.trim();
    const username = input.username.trim().toLowerCase().replace(/\s+/g, '');
    const password = input.password.trim();
    if (!fullName || !username || !password) {
      return { ok: false as const, error: 'Completa nombre, usuario y contraseña.' };
    }
    if (state.users.some((u) => u.username.toLowerCase() === username)) {
      return { ok: false as const, error: `El usuario "${username}" ya existe.` };
    }
    const newUser: SystemUser = {
      id: `usr-${Date.now().toString(36)}`,
      fullName,
      username,
      password,
      roleId: input.roleId,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
    }));
    return { ok: true as const, user: newUser };
  };

  const updateUser = (
    id: string,
    patch: Partial<Pick<SystemUser, 'fullName' | 'username' | 'password' | 'roleId' | 'active'>>
  ): OpResult => {
    const target = state.users.find((u) => u.id === id);
    if (!target) return { ok: false, error: 'Usuario no encontrado.' };
    if (patch.username !== undefined) {
      const cleanU = patch.username.trim().toLowerCase().replace(/\s+/g, '');
      if (!cleanU) return { ok: false, error: 'El nombre de usuario no puede quedar vacío.' };
      if (state.users.some((u) => u.id !== id && u.username.toLowerCase() === cleanU)) {
        return { ok: false, error: `Ya existe otro usuario llamado "${cleanU}".` };
      }
      patch = { ...patch, username: cleanU };
    }
    if (id === state.currentUserId && patch.active === false) {
      return { ok: false, error: 'No puedes desactivar tu propio usuario con sesión abierta.' };
    }
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    }));
    return { ok: true };
  };

  const deleteUser = (id: string): OpResult => {
    if (id === state.currentUserId) {
      return { ok: false, error: 'No puedes eliminar el usuario con sesión activa.' };
    }
    const remainingAdmins = state.users.filter((u) => {
      if (u.id === id || !u.active) return false;
      const r = state.roles.find((roleDef) => roleDef.id === u.roleId);
      return Boolean(r?.permissions.includes('manage_users'));
    });
    if (remainingAdmins.length === 0) {
      return { ok: false, error: 'Debe quedar al menos un administrador activo.' };
    }
    setState((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
    }));
    return { ok: true };
  };

  const addRole = (input: {
    name: string;
    description: string;
    permissions: PermissionKey[];
  }) => {
    const name = input.name.trim();
    if (!name) return { ok: false as const, error: 'Escribe el nombre del rol.' };
    if (state.roles.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      return { ok: false as const, error: `Ya existe un rol llamado "${name}".` };
    }
    if (input.permissions.length === 0) {
      return { ok: false as const, error: 'Asigna al menos un permiso al rol.' };
    }
    const newRole: RoleDefinition = {
      id: `role-${Date.now().toString(36)}`,
      name,
      description: input.description.trim() || 'Rol personalizado de sucursal.',
      permissions: input.permissions,
    };
    setState((prev) => ({
      ...prev,
      roles: [...prev.roles, newRole],
    }));
    return { ok: true as const, role: newRole };
  };

  const updateRole = (
    id: string,
    patch: Partial<Pick<RoleDefinition, 'name' | 'description' | 'permissions'>>
  ): OpResult => {
    const target = state.roles.find((r) => r.id === id);
    if (!target) return { ok: false, error: 'Rol no encontrado.' };
    if (patch.permissions && patch.permissions.length === 0) {
      return { ok: false, error: 'El rol debe conservar al menos un permiso.' };
    }
    if (target.id === 'role-owner' && patch.permissions && !patch.permissions.includes('manage_users')) {
      return { ok: false, error: 'El rol principal de Dueño siempre mantiene administración de usuarios.' };
    }
    setState((prev) => ({
      ...prev,
      roles: prev.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
    return { ok: true };
  };

  const deleteRole = (id: string): OpResult => {
    const target = state.roles.find((r) => r.id === id);
    if (!target) return { ok: false, error: 'Rol no encontrado.' };
    if (target.isSystem) {
      return { ok: false, error: 'Los roles base del sistema no se eliminan (puedes editar sus permisos).' };
    }
    const assigned = state.users.filter((u) => u.roleId === id).length;
    if (assigned > 0) {
      return {
        ok: false,
        error: `Hay ${assigned} usuario(s) asignados a este rol. Reasígnalos antes de eliminarlo.`,
      };
    }
    setState((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => r.id !== id),
    }));
    return { ok: true };
  };

  const resetDemoData = () => {
    setState({
      ...createDefaultState(),
      currentUserId: state.currentUserId,
    });
  };

  return (
    <StoreContext.Provider
      value={{
        role,
        currentUser,
        currentRoleDefinition,
        roles: state.roles,
        users: state.users,
        productCategories: state.productCategories,
        expenseCategories: state.expenseCategories,
        expenseCategoryTypes: state.expenseCategoryTypes,
        exchangeRate: state.exchangeRate,
        cashRegister: state.cashRegister,
        cashClosures: state.cashClosures,
        inventory: state.inventory,
        suppliers: state.suppliers,
        customers: state.customers,
        sales: state.sales,
        quotes: state.quotes,
        orders: state.orders,
        expenses: state.expenses,
        kardex: state.kardex,
        hasPermission,
        login,
        loginAsUser,
        logout,
        setRole,
        setExchangeRate,
        openCashRegister,
        closeCashRegister,
        addMachine,
        importMachinesBulk,
        updateMachineMeta,
        updateActiveBatchPricing,
        adjustStock,
        addProductCategory,
        renameProductCategory,
        deleteProductCategory,
        addExpenseCategory,
        renameExpenseCategory,
        deleteExpenseCategory,
        setExpenseCategoryDefaultType,
        recordSale,
        saveQuote,
        cancelQuote,
        deleteQuote,
        createPurchaseOrder,
        advanceOrderStatus,
        addSupplier,
        addCustomer,
        addExpense,
        deleteExpense,
        addUser,
        updateUser,
        deleteUser,
        addRole,
        updateRole,
        deleteRole,
        resetDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore debe usarse dentro de StoreProvider');
  }
  return ctx;
}
