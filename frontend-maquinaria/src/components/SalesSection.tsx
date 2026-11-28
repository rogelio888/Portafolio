import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Ban,
  Calculator,
  Check,
  FileText,
  History,
  Lock,
  Minus,
  Plus,
  Printer,
  Receipt,
  Search,
  ShoppingBag,
  Split,
  Trash2,
  Unlock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../state/StoreContext';
import type {
  CashClosureRecord,
  Category,
  InvoiceMode,
  MachineItem,
  PaymentAllocation,
  PaymentMethod,
  QuoteRecord,
  QuoteStatus,
  SaleRecord,
} from '../types/store';
import {
  formatBs,
  formatDateShort,
  formatDateTime,
  formatDateWithYear,
  getActiveBatch,
  getItemDisplayPriceBs,
  getTotalStock,
  isSameLocalDay,
  matchesDateRange,
  type DateRangePeriod,
} from '../utils/formatters';
import { DateFilterBar } from './DateFilterBar';
import { Drawer } from './Drawer';
import { PaginationBar } from './PaginationBar';

const PAYMENT_METHODS: PaymentMethod[] = ['Efectivo', 'QR Simple'];

interface SalesSectionProps {
  preselectedItem: MachineItem | null;
  onClearPreselected: () => void;
}

export function SalesSection({
  preselectedItem,
  onClearPreselected,
}: SalesSectionProps) {
  const {
    exchangeRate,
    cashRegister,
    cashClosures,
    inventory,
    customers,
    sales,
    quotes,
    expenses,
    productCategories,
    openCashRegister,
    closeCashRegister,
    recordSale,
    saveQuote,
    cancelQuote,
    deleteQuote,
    addCustomer,
  } = useStore();

  const [viewMode, setViewMode] = useState<'pos' | 'quotes' | 'history' | 'closing'>('pos');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | Category>('all');

  const [cart, setCart] = useState<{ itemId: string; qty: number; serialNumber?: string }[]>([]);
  const [customerSelection, setCustomerSelection] = useState<'new' | 'walkin' | string>('new');
  const [customerName, setCustomerName] = useState('');
  const [customerDoc, setCustomerDoc] = useState('');
  const [newCusPhone, setNewCusPhone] = useState('');
  const [newCusCity, setNewCusCity] = useState('Santa Cruz');
  const [discountInput, setDiscountInput] = useState('');
  const [activeQuoteId, setActiveQuoteId] = useState<string | undefined>(undefined);

  // History filter & pagination
  const [historyQuery, setHistoryQuery] = useState('');
  const [historyPeriod, setHistoryPeriod] = useState<DateRangePeriod>('all');
  const [historyFrom, setHistoryFrom] = useState('');
  const [historyTo, setHistoryTo] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_PAGE_SIZE = 8;

  // Quotes (Proformas) filter & pagination
  const [quotesQuery, setQuotesQuery] = useState('');
  const [quotesStatus, setQuotesStatus] = useState<'all' | QuoteStatus>('all');
  const [quotesPeriod, setQuotesPeriod] = useState<DateRangePeriod>('all');
  const [quotesFrom, setQuotesFrom] = useState('');
  const [quotesTo, setQuotesTo] = useState('');
  const [quotesPage, setQuotesPage] = useState(1);
  const QUOTES_PAGE_SIZE = 6;

  // Cash Closures (Historial de caja) filter & pagination
  const [closuresQuery, setClosuresQuery] = useState('');
  const [closuresPeriod, setClosuresPeriod] = useState<DateRangePeriod>('all');
  const [closuresFrom, setClosuresFrom] = useState('');
  const [closuresTo, setClosuresTo] = useState('');
  const [closuresPage, setClosuresPage] = useState(1);
  const [activeClosureDetail, setActiveClosureDetail] = useState<CashClosureRecord | null>(null);
  const [closingNotesInput, setClosingNotesInput] = useState('');
  const CLOSURES_PAGE_SIZE = 6;

  // Payment mode: single vs split (mixto)
  const [paymentMode, setPaymentMode] = useState<'single' | 'split'>('single');
  const [singleMethod, setSingleMethod] = useState<PaymentMethod>('Efectivo');
  const [splitRows, setSplitRows] = useState<{ method: PaymentMethod; amount: string }[]>([
    { method: 'QR Simple', amount: '' },
    { method: 'Efectivo', amount: '' },
  ]);

  const [saleError, setSaleError] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<SaleRecord | null>(null);
  const [activeQuotePreview, setActiveQuotePreview] = useState<QuoteRecord | null>(null);
  const [openingCashInput, setOpeningCashInput] = useState(
    String(cashRegister.openingCashBs || 500)
  );
  const [closingCountedInput, setClosingCountedInput] = useState('');

  // Nivel 4 preview: modalidad de emisión y facturación diferenciada (revendedor)
  const [invoiceMode, setInvoiceMode] = useState<InvoiceMode>('nota_interna');
  const [fiscalPctInput, setFiscalPctInput] = useState('16');
  const [resellerInvoiceInput, setResellerInvoiceInput] = useState('');
  const [fiscalRecipientName, setFiscalRecipientName] = useState('');
  const [fiscalRecipientDoc, setFiscalRecipientDoc] = useState('');

  const inventoryById = useMemo(
    () => new Map(inventory.map((it) => [it.id, it])),
    [inventory]
  );

  const openQuotesCount = useMemo(
    () => quotes.filter((q) => q.status === 'Abierta').length,
    [quotes]
  );

  useEffect(() => {
    if (!preselectedItem) return;
    const stock = getTotalStock(preselectedItem);
    setViewMode('pos');
    setCart((prev) => {
      const existing = prev.find((line) => line.itemId === preselectedItem.id);
      if (existing) {
        if (existing.qty >= stock) return prev;
        return prev.map((line) =>
          line.itemId === preselectedItem.id ? { ...line, qty: line.qty + 1 } : line
        );
      }
      if (stock <= 0) return prev;
      return [
        ...prev,
        {
          itemId: preselectedItem.id,
          qty: 1,
          serialNumber: getActiveBatch(preselectedItem)?.serialNumbers[0],
        },
      ];
    });
    onClearPreselected();
  }, [preselectedItem, onClearPreselected]);

  const cartQtyMap = useMemo(
    () => new Map(cart.map((c) => [c.itemId, c.qty])),
    [cart]
  );

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inventory.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q)
      );
    });
  }, [inventory, query, category]);

  const cartLines = useMemo(() => {
    return cart
      .map((entry) => {
        const item = inventoryById.get(entry.itemId);
        if (!item) return null;
        const unitPriceBs = getItemDisplayPriceBs(item, exchangeRate);
        const stock = getTotalStock(item);
        const activeBatch = getActiveBatch(item);
        return {
          item,
          stock,
          unitPriceBs,
          activeBatch,
          qty: entry.qty,
          serialNumber: entry.serialNumber,
          subtotalBs: unitPriceBs * entry.qty,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [cart, inventoryById, exchangeRate]);

  const subtotalBs = useMemo(
    () => cartLines.reduce((sum, l) => sum + l.subtotalBs, 0),
    [cartLines]
  );

  const discountBs = useMemo(() => {
    const parsed = Number(discountInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.min(subtotalBs, Math.round(parsed));
  }, [discountInput, subtotalBs]);

  const netEquipmentBs = Math.max(0, subtotalBs - discountBs);
  const safeFiscalPct = useMemo(() => {
    const n = Number(fiscalPctInput);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.min(50, n);
  }, [fiscalPctInput]);

  const resellerInvoiceAmountBs = useMemo(() => {
    if (resellerInvoiceInput.trim() === '') return 0;
    const n = Number(resellerInvoiceInput);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.round(n);
  }, [resellerInvoiceInput]);

  const fiscalReserveBs = useMemo(() => {
    if (invoiceMode === 'nota_interna' || netEquipmentBs <= 0) return 0;
    if (invoiceMode === 'con_factura') {
      return Math.round(netEquipmentBs * (safeFiscalPct / 100));
    }
    return Math.round(resellerInvoiceAmountBs * (safeFiscalPct / 100));
  }, [invoiceMode, netEquipmentBs, safeFiscalPct, resellerInvoiceAmountBs]);

  const totalBs = netEquipmentBs + fiscalReserveBs;
  const invoicedAmountBs =
    invoiceMode === 'nota_interna'
      ? 0
      : invoiceMode === 'con_factura'
        ? totalBs
        : resellerInvoiceAmountBs;

  const resellerInvalid =
    invoiceMode === 'revendedor_diferenciado' &&
    netEquipmentBs > 0 &&
    resellerInvoiceAmountBs < totalBs;

  const splitSumBs = useMemo(() => {
    return splitRows.reduce((sum, row) => {
      const n = Number(row.amount);
      return sum + (Number.isFinite(n) && n > 0 ? Math.round(n) : 0);
    }, 0);
  }, [splitRows]);

  const splitRemainingBs = totalBs - splitSumBs;

  // Daily Cash Closing (Cierre de caja)
  const closingSummary = useMemo(() => {
    const today = new Date();
    const todayClosureCutoff = cashClosures.reduce((maxMs, c) => {
      if (!isSameLocalDay(c.closedAt, today)) return maxMs;
      const ms = new Date(c.closedAt).getTime();
      return Number.isFinite(ms) && ms > maxMs ? ms : maxMs;
    }, 0);

    const byMethod = new Map<PaymentMethod, number>(
      PAYMENT_METHODS.map((m) => [m, 0])
    );
    let todaySalesCount = 0;
    let todaySalesTotal = 0;
    let splitSalesCount = 0;

    for (const sale of sales) {
      if (!isSameLocalDay(sale.createdAt, today)) continue;
      const saleMs = new Date(sale.createdAt).getTime();
      if (todayClosureCutoff > 0 && saleMs <= todayClosureCutoff) continue;
      todaySalesCount += 1;
      todaySalesTotal += sale.totalBs;
      if (sale.payments.length > 1) splitSalesCount += 1;
      for (const p of sale.payments) {
        byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + p.amountBs);
      }
    }

    let todayCashExpenses = 0;
    let todayAllExpenses = 0;
    for (const exp of expenses) {
      if (!isSameLocalDay(exp.date, today)) continue;
      const expMs = new Date(exp.createdAt).getTime();
      if (todayClosureCutoff > 0 && expMs <= todayClosureCutoff) continue;
      todayAllExpenses += exp.amountBs;
      if (exp.paymentMethod === 'Efectivo') {
        todayCashExpenses += exp.amountBs;
      }
    }

    const grossCash = byMethod.get('Efectivo') ?? 0;

    return {
      todaySalesCount,
      todaySalesTotal,
      splitSalesCount,
      byMethod,
      todayCashExpenses,
      todayAllExpenses,
      expectedCashInDrawer: cashRegister.openingCashBs + grossCash - todayCashExpenses,
    };
  }, [sales, expenses, cashRegister.openingCashBs, cashClosures]);

  const selectedRecurringCustomer = useMemo(
    () =>
      customerSelection !== 'new' && customerSelection !== 'walkin'
        ? customers.find((c) => c.id === customerSelection) ?? null
        : null,
    [customers, customerSelection]
  );

  const filteredHistory = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    return sales.filter((s) => {
      if (!matchesDateRange(s.createdAt, historyPeriod, historyFrom, historyTo)) return false;
      if (!q) return true;
      return (
        s.receiptNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        (s.customerDoc ?? '').toLowerCase().includes(q)
      );
    });
  }, [sales, historyQuery, historyPeriod, historyFrom, historyTo]);

  const historyTotalPages = Math.max(1, Math.ceil(filteredHistory.length / HISTORY_PAGE_SIZE));
  const safeHistoryPage = Math.min(historyPage, historyTotalPages);
  const paginatedHistory = useMemo(() => {
    const start = (safeHistoryPage - 1) * HISTORY_PAGE_SIZE;
    return filteredHistory.slice(start, start + HISTORY_PAGE_SIZE);
  }, [filteredHistory, safeHistoryPage]);

  const filteredQuotes = useMemo(() => {
    const q = quotesQuery.trim().toLowerCase();
    return quotes.filter((qt) => {
      if (quotesStatus !== 'all' && qt.status !== quotesStatus) return false;
      if (!matchesDateRange(qt.createdAt, quotesPeriod, quotesFrom, quotesTo)) return false;
      if (!q) return true;
      return (
        qt.quoteNumber.toLowerCase().includes(q) ||
        qt.customerName.toLowerCase().includes(q) ||
        (qt.customerDoc ?? '').toLowerCase().includes(q) ||
        qt.lines.some((l) => l.name.toLowerCase().includes(q) || l.sku.toLowerCase().includes(q))
      );
    });
  }, [quotes, quotesQuery, quotesStatus, quotesPeriod, quotesFrom, quotesTo]);

  const quotesTotalPages = Math.max(1, Math.ceil(filteredQuotes.length / QUOTES_PAGE_SIZE));
  const safeQuotesPage = Math.min(quotesPage, quotesTotalPages);
  const paginatedQuotes = useMemo(() => {
    const start = (safeQuotesPage - 1) * QUOTES_PAGE_SIZE;
    return filteredQuotes.slice(start, start + QUOTES_PAGE_SIZE);
  }, [filteredQuotes, safeQuotesPage]);

  const filteredClosures = useMemo(() => {
    const q = closuresQuery.trim().toLowerCase();
    return cashClosures.filter((c) => {
      if (!matchesDateRange(c.closedAt, closuresPeriod, closuresFrom, closuresTo)) return false;
      if (!q) return true;
      return (
        c.openedBy.toLowerCase().includes(q) ||
        c.closedBy.toLowerCase().includes(q) ||
        (c.notes ?? '').toLowerCase().includes(q)
      );
    });
  }, [cashClosures, closuresQuery, closuresPeriod, closuresFrom, closuresTo]);

  const closuresTotalPages = Math.max(1, Math.ceil(filteredClosures.length / CLOSURES_PAGE_SIZE));
  const safeClosuresPage = Math.min(closuresPage, closuresTotalPages);
  const paginatedClosures = useMemo(() => {
    const start = (safeClosuresPage - 1) * CLOSURES_PAGE_SIZE;
    return filteredClosures.slice(start, start + CLOSURES_PAGE_SIZE);
  }, [filteredClosures, safeClosuresPage]);

  const handleSelectCustomer = (selection: string) => {
    setCustomerSelection(selection);
    setSaleError(null);
    if (selection === 'new' || selection === 'walkin') {
      setCustomerName('');
      setCustomerDoc('');
      setNewCusPhone('');
      return;
    }
    const found = customers.find((c) => c.id === selection);
    if (found) {
      setCustomerName(found.name);
      setCustomerDoc(found.docNumber ?? '');
    }
  };

  const addToCart = (item: MachineItem) => {
    setSaleError(null);
    const stock = getTotalStock(item);
    if (stock <= 0) {
      toast.error(`Sin stock disponible para ${item.name}`);
      return;
    }
    setCart((prev) => {
      const current = prev.find((l) => l.itemId === item.id);
      if (current) {
        if (current.qty >= stock) {
          toast.warning(`Stock máximo alcanzado (${stock} disponibles)`);
          return prev;
        }
        return prev.map((l) => (l.itemId === item.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [
        ...prev,
        {
          itemId: item.id,
          qty: 1,
          serialNumber: getActiveBatch(item)?.serialNumbers[0],
        },
      ];
    });
  };

  const updateCartQty = (itemId: string, delta: number) => {
    setSaleError(null);
    const item = inventoryById.get(itemId);
    if (!item) return;
    const stock = getTotalStock(item);

    setCart((prev) =>
      prev
        .map((l) => {
          if (l.itemId !== itemId) return l;
          const next = l.qty + delta;
          if (next <= 0) return null;
          if (next > stock) {
            toast.warning(`Solo quedan ${stock} unidades en almacén.`);
            return l;
          }
          return { ...l, qty: next };
        })
        .filter((l): l is NonNullable<typeof l> => l !== null)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((l) => l.itemId !== itemId));
  };

  const resetCartForm = () => {
    setCart([]);
    setCustomerSelection('new');
    setCustomerName('');
    setCustomerDoc('');
    setNewCusPhone('');
    setNewCusCity('Santa Cruz');
    setDiscountInput('');
    setActiveQuoteId(undefined);
    setPaymentMode('single');
    setSplitRows([
      { method: 'QR Simple', amount: '' },
      { method: 'Efectivo', amount: '' },
    ]);
    setInvoiceMode('nota_interna');
    setResellerInvoiceInput('');
    setFiscalRecipientName('');
    setFiscalRecipientDoc('');
  };

  const handleOpenCashRegister = () => {
    const amount = Number(openingCashInput);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error('Ingresa un fondo inicial válido (0 o mayor).');
      return;
    }
    openCashRegister(amount);
    setClosingCountedInput('');
    setSaleError(null);
    toast.success(`Caja abierta con ${formatBs(Math.round(amount))}`, {
      description: 'El mostrador quedó habilitado para registrar ventas.',
    });
  };

  const handleCloseCashRegister = () => {
    const counted = closingCountedInput.trim()
      ? Number(closingCountedInput)
      : closingSummary.expectedCashInDrawer;
    if (!Number.isFinite(counted) || counted < 0) {
      toast.error('Ingresa un monto de conteo válido.');
      return;
    }
    const savedClosure = closeCashRegister(counted, closingNotesInput);
    setClosingCountedInput('');
    setClosingNotesInput('');
    const diffLabel =
      savedClosure.differenceBs === 0
        ? 'Caja cuadrada (diferencia Bs 0)'
        : savedClosure.differenceBs > 0
          ? `Sobrante de ${formatBs(savedClosure.differenceBs)}`
          : `Faltante de ${formatBs(Math.abs(savedClosure.differenceBs))}`;
    toast.info(`Caja cerrada · Conteo: ${formatBs(savedClosure.countedCashBs)}`, {
      description: `${diffLabel} · Guardado en historial de cierres.`,
    });
  };

  const handleConfirmSale = () => {
    setSaleError(null);
    if (!cashRegister.isOpen) {
      const msg = 'La caja está cerrada. Abre la caja en la pestaña Caja para registrar ventas.';
      setSaleError(msg);
      toast.error(msg);
      return;
    }
    if (resellerInvalid) {
      const msg = `En modo Revendedor, la factura (${formatBs(resellerInvoiceAmountBs)}) debe ser mayor o igual al Total a Caja (${formatBs(totalBs)}).`;
      setSaleError(msg);
      toast.error(msg);
      return;
    }

    let resolvedCustomerId: string | undefined;
    let resolvedCustomerName = 'Sin registro';
    let resolvedCustomerDoc: string | undefined;

    if (customerSelection === 'new') {
      if (!customerName.trim()) {
        const msg =
          "Ingresa el nombre del cliente nuevo o selecciona 'Sin registro / Venta sin cliente'.";
        setSaleError(msg);
        toast.error(msg);
        return;
      }
      const createdCust = addCustomer({
        name: customerName.trim(),
        docNumber: customerDoc.trim() || undefined,
        phone: newCusPhone.trim() || undefined,
        city: newCusCity.trim() || undefined,
      });
      resolvedCustomerId = createdCust.id;
      resolvedCustomerName = createdCust.name;
      resolvedCustomerDoc = createdCust.docNumber;
    } else if (selectedRecurringCustomer) {
      resolvedCustomerId = selectedRecurringCustomer.id;
      resolvedCustomerName = selectedRecurringCustomer.name;
      resolvedCustomerDoc = selectedRecurringCustomer.docNumber;
    }

    const payments: PaymentAllocation[] =
      paymentMode === 'single'
        ? [{ method: singleMethod, amountBs: totalBs }]
        : splitRows
            .map((r) => ({
              method: r.method,
              amountBs: Math.round(Number(r.amount) || 0),
            }))
            .filter((p) => p.amountBs > 0);

    const result = recordSale({
      customerId: resolvedCustomerId,
      customerName: resolvedCustomerName,
      customerDoc: resolvedCustomerDoc,
      payments,
      discountBs,
      invoiceMode,
      fiscalSurchargePct: invoiceMode === 'nota_interna' ? undefined : safeFiscalPct,
      fiscalReserveBs,
      invoicedAmountBs: invoicedAmountBs || undefined,
      fiscalRecipientName:
        invoiceMode === 'revendedor_diferenciado' ? fiscalRecipientName : undefined,
      fiscalRecipientDoc:
        invoiceMode === 'revendedor_diferenciado' ? fiscalRecipientDoc : undefined,
      quoteId: activeQuoteId,
      items: cart,
    });

    if (!result.ok) {
      setSaleError(result.error);
      return;
    }

    toast.success(`Venta ${result.sale.receiptNumber} confirmada`, {
      description: `Total ${formatBs(result.sale.totalBs)} · Lotes y Kardex actualizados.`,
    });

    resetCartForm();
    setActiveReceipt(result.sale);
  };

  const handleSaveQuote = () => {
    setSaleError(null);
    if (cartLines.length === 0) {
      setSaleError('Agrega al menos un equipo para generar la proforma.');
      return;
    }
    let resolvedCustomerId: string | undefined;
    let resolvedCustomerName = 'Sin registro';
    let resolvedCustomerDoc: string | undefined;

    if (customerSelection === 'new') {
      if (!customerName.trim()) {
        const msg =
          "Ingresa el nombre del cliente nuevo o selecciona 'Sin registro / Venta sin cliente'.";
        setSaleError(msg);
        toast.error(msg);
        return;
      }
      const createdCust = addCustomer({
        name: customerName.trim(),
        docNumber: customerDoc.trim() || undefined,
        phone: newCusPhone.trim() || undefined,
        city: newCusCity.trim() || undefined,
      });
      resolvedCustomerId = createdCust.id;
      resolvedCustomerName = createdCust.name;
      resolvedCustomerDoc = createdCust.docNumber;
    } else if (selectedRecurringCustomer) {
      resolvedCustomerId = selectedRecurringCustomer.id;
      resolvedCustomerName = selectedRecurringCustomer.name;
      resolvedCustomerDoc = selectedRecurringCustomer.docNumber;
    }

    const created = saveQuote({
      customerId: resolvedCustomerId,
      customerName: resolvedCustomerName,
      customerDoc: resolvedCustomerDoc,
      discountBs,
      items: cart.map((c) => ({ itemId: c.itemId, qty: c.qty })),
    });
    toast.success(`Proforma ${created.quoteNumber} guardada`, {
      description: `Lista para enviar o convertir en venta (${formatBs(created.totalBs)}).`,
    });
    resetCartForm();
    setActiveQuotePreview(created);
  };

  const handleLoadQuoteIntoPos = (quote: QuoteRecord) => {
    const loadable: { itemId: string; qty: number; serialNumber?: string }[] = [];
    for (const line of quote.lines) {
      const item = inventoryById.get(line.itemId);
      const stock = item ? getTotalStock(item) : 0;
      if (!item || stock <= 0) continue;
      loadable.push({
        itemId: item.id,
        qty: Math.min(line.qty, stock),
        serialNumber: getActiveBatch(item)?.serialNumbers[0],
      });
    }
    if (loadable.length === 0) {
      toast.error('Sin stock disponible para los equipos de esta proforma.');
      return;
    }

    setCart(loadable);
    if (quote.customerId && customers.some((c) => c.id === quote.customerId)) {
      setCustomerSelection(quote.customerId);
    } else if (!quote.customerName || quote.customerName === 'Sin registro' || quote.customerName === 'Cliente Mostrador') {
      setCustomerSelection('walkin');
    } else {
      setCustomerSelection('new');
    }
    setCustomerName(quote.customerName);
    setCustomerDoc(quote.customerDoc ?? '');
    setDiscountInput(quote.discountBs > 0 ? String(quote.discountBs) : '');
    setActiveQuoteId(quote.id);
    setActiveQuotePreview(null);
    setViewMode('pos');
    toast.info(`Proforma ${quote.quoteNumber} cargada en mostrador`);
  };

  const handleCompleteSplitRow = (idx: number) => {
    const othersSum = splitRows.reduce((sum, r, i) => {
      if (i === idx) return sum;
      return sum + (Math.round(Number(r.amount) || 0));
    }, 0);
    const missing = Math.max(0, totalBs - othersSum);
    setSplitRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, amount: String(missing) } : row))
    );
  };

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Header & View Switch */}
      <div className="flex flex-col gap-4 border-b border-[#D6D6CD] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#14171A] sm:text-3xl">
            Ventas y Mostrador
          </h1>
          <p className="mt-1 text-sm text-[#5B636B]">
            Soporte de pagos mixtos (QR + Efectivo), proformas, series y control de caja.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Vistas de ventas"
          className="inline-flex flex-wrap gap-1 rounded-lg border border-[#D6D6CD] bg-[#EAEAE3] p-1"
        >
          {(
            [
              { id: 'pos', label: 'Nueva venta', badge: null },
              { id: 'quotes', label: 'Proformas', badge: openQuotesCount || null },
              { id: 'history', label: 'Historial', badge: sales.length },
              {
                id: 'closing',
                label: 'Caja',
                badge: cashRegister.isOpen ? 'Abierta' : 'Cerrada',
              },
            ] as const
          ).map((tab) => {
            const active = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setViewMode(tab.id)}
                className={`btn-press inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold ${
                  active
                    ? 'bg-[#14171A] text-white'
                    : 'text-[#434B53] hover:text-[#14171A]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== null ? (
                  <span
                    className={`tabular-nums rounded px-1.5 py-0.5 text-[11px] ${
                      active
                        ? 'bg-white/15 text-white'
                        : tab.id === 'closing'
                          ? cashRegister.isOpen
                            ? 'bg-[#DCFCE7] text-[#166534]'
                            : 'bg-[#FEE2E2] text-[#991B1B]'
                          : 'bg-white text-[#434B53]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {viewMode === 'pos' ? (
        <div className="mt-6 space-y-4">
          {!cashRegister.isOpen ? (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-2.5">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#991B1B]" />
                <div>
                  <div className="text-sm font-bold text-[#991B1B]">
                    Caja cerrada — Ventas bloqueadas
                  </div>
                  <p className="text-xs text-[#7F1D1D]">
                    Abre un turno en el submódulo Caja para habilitar el cobro y la emisión de comprobantes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('closing')}
                className="btn-press inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#14171A] px-3.5 text-xs font-semibold text-white hover:bg-[#272C32]"
              >
                <Unlock className="h-3.5 w-3.5 text-[#F59E0B]" />
                Ir a Caja para abrir
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Left: Fast Catalog */}
          <div className="space-y-4 xl:col-span-7">
            <div className="flex flex-col gap-3 rounded-xl border border-[#D6D6CD] bg-white p-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B636B]" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar máquina o SKU para agregar..."
                  aria-label="Buscar producto para venta"
                  className="h-10 w-full rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] pl-9 pr-3 text-sm text-[#14171A] placeholder:text-[#5B636B] focus:border-[#14171A] focus:bg-white focus:outline-none"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'all' | Category)}
                aria-label="Filtrar catálogo de venta por categoría"
                className="h-10 rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3 text-sm font-medium text-[#14171A] focus:border-[#14171A] focus:bg-white focus:outline-none sm:w-52"
              >
                <option value="all">Todas las categorías</option>
                {productCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#D6D6CD] bg-white">
              {filteredCatalog.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-[#5B636B]">
                  No se encontraron equipos que coincidan con tu búsqueda.
                </div>
              ) : (
                <ul className="divide-y divide-[#EAEAE3]">
                  {filteredCatalog.map((item) => {
                    const stock = getTotalStock(item);
                    const priceBs = getItemDisplayPriceBs(item, exchangeRate);
                    const activeBatch = getActiveBatch(item);
                    const inCart = cartQtyMap.get(item.id) ?? 0;
                    const outOfStock = stock <= 0;
                    const maxed = inCart >= stock && !outOfStock;

                    return (
                      <li
                        key={item.id}
                        className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="tabular-nums font-mono text-xs font-semibold text-[#5B636B]">
                              {item.sku}
                            </span>
                            <span
                              className={`tabular-nums rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                                outOfStock
                                  ? 'bg-[#FEE2E2] text-[#991B1B]'
                                  : stock <= item.minStock
                                    ? 'bg-[#FEF2E4] text-[#8A3A00]'
                                    : 'bg-[#DCFCE7] text-[#166534]'
                              }`}
                            >
                              {outOfStock ? 'Sin stock' : `${stock} disp.`}
                            </span>
                            {activeBatch ? (
                              <span className="rounded bg-[#EAEAE3] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#434B53]">
                                Lote {activeBatch.code}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-[#14171A]">
                            {item.name}
                          </div>
                          <div className="text-xs text-[#5B636B]">
                            {item.brand} {item.model} · {item.location}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <div className="tabular-nums whitespace-nowrap font-display text-base font-bold text-[#14171A]">
                            {formatBs(priceBs)}
                          </div>
                          <button
                            type="button"
                            disabled={outOfStock || maxed}
                            onClick={() => addToCart(item)}
                            className={`btn-press inline-flex h-9 min-w-[108px] items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold ${
                              inCart > 0
                                ? 'border border-[#14171A] bg-[#FEF2E4] text-[#8A3A00]'
                                : 'bg-[#14171A] text-white hover:bg-[#272C32]'
                            } disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[#EAEAE3] disabled:text-[#5B636B]`}
                          >
                            {outOfStock ? (
                              'Agotado'
                            ) : maxed ? (
                              `Máx (${inCart})`
                            ) : inCart > 0 ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                En carrito ({inCart})
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5 text-[#F59E0B]" />
                                Agregar
                              </>
                            )}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Right: Checkout Panel */}
          <div className="xl:col-span-5">
            <section
              aria-label="Detalle de venta actual"
              className="sticky top-6 rounded-xl border border-[#D6D6CD] bg-white p-5"
            >
              <div className="flex items-center justify-between border-b border-[#EAEAE3] pb-3.5">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-[#C95B06]" />
                  <h2 className="font-display text-lg font-bold text-[#14171A]">
                    Orden de Venta
                  </h2>
                </div>
                {cartLines.length > 0 ? (
                  <button
                    type="button"
                    onClick={resetCartForm}
                    className="text-xs font-semibold text-[#5B636B] hover:text-[#991B1B]"
                  >
                    Vaciar
                  </button>
                ) : null}
              </div>

              {cartLines.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-semibold text-[#14171A]">
                    Selecciona equipos del listado
                  </p>
                  <p className="mt-1 text-xs text-[#5B636B]">
                    Puedes cobrar al contado, combinar pagos mixtos o guardar una proforma.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[#EAEAE3] py-2">
                  {cartLines.map(({ item, stock, unitPriceBs, activeBatch, qty, serialNumber, subtotalBs: lineSub }) => (
                    <li key={item.id} className="py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-mono text-[11px] text-[#5B636B]">
                            {item.sku} · Lote {activeBatch?.code}
                          </div>
                          <div className="text-sm font-semibold text-[#14171A]">{item.name}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Quitar ${item.name}`}
                          className="rounded p-1 text-[#5B636B] hover:bg-[#FEE2E2] hover:text-[#991B1B]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {activeBatch && activeBatch.serialNumbers.length > 0 ? (
                        <div className="mt-1.5">
                          <select
                            value={serialNumber ?? ''}
                            onChange={(e) =>
                              setCart((prev) =>
                                prev.map((c) =>
                                  c.itemId === item.id
                                    ? { ...c, serialNumber: e.target.value }
                                    : c
                                )
                              )
                            }
                            aria-label={`Número de serie para ${item.name}`}
                            className="h-7 rounded border border-[#D6D6CD] bg-[#F8F8F5] px-2 font-mono text-[11px] text-[#434B53]"
                          >
                            {activeBatch.serialNumbers.map((sn) => (
                              <option key={sn} value={sn}>
                                Serie: {sn}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}

                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center gap-1 rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] p-0.5">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, -1)}
                            aria-label={`Disminuir cantidad de ${item.name}`}
                            className="btn-press inline-flex h-7 w-7 items-center justify-center rounded-md bg-white text-[#14171A] hover:bg-[#EAEAE3]"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="tabular-nums min-w-[28px] text-center text-xs font-bold text-[#14171A]">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, 1)}
                            disabled={qty >= stock}
                            aria-label={`Aumentar cantidad de ${item.name}`}
                            className="btn-press inline-flex h-7 w-7 items-center justify-center rounded-md bg-white text-[#14171A] hover:bg-[#EAEAE3] disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="tabular-nums text-[11px] text-[#5B636B]">
                            {qty} × {formatBs(unitPriceBs)}
                          </div>
                          <div className="tabular-nums text-sm font-bold text-[#14171A]">
                            {formatBs(lineSub)}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Customer & Payment Fields */}
              <div className="mt-2 space-y-3 border-t border-[#D6D6CD] pt-4">
                <div>
                  <label htmlFor="pos-customer-select" className="block text-xs font-semibold text-[#434B53]">
                    Cliente
                  </label>
                  <select
                    id="pos-customer-select"
                    value={customerSelection}
                    onChange={(e) => handleSelectCustomer(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-2.5 text-xs font-semibold text-[#14171A] focus:border-[#14171A] focus:bg-white focus:outline-none"
                  >
                    <option value="new">Cliente Mostrador / Nuevo</option>
                    <option value="walkin">Sin registro / Venta sin cliente</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.docNumber ? `(${c.docNumber})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {customerSelection === 'new' ? (
                  <div className="space-y-2.5 rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#14171A]">
                        Registro de cliente nuevo
                      </span>
                      <span className="text-[10px] font-medium text-[#5B636B]">
                        Se guarda al confirmar
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <label className="block text-[11px] font-semibold text-[#434B53]">
                        Nombre / Razón social *
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Ej. Constructora Andina"
                          className="mt-1 h-9 w-full rounded-md border border-[#D6D6CD] bg-white px-2.5 text-xs text-[#14171A] focus:border-[#14171A] focus:outline-none"
                        />
                      </label>
                      <label className="block text-[11px] font-semibold text-[#434B53]">
                        CI / NIT
                        <input
                          type="text"
                          value={customerDoc}
                          onChange={(e) => setCustomerDoc(e.target.value)}
                          placeholder="Ej. NIT 3849102014"
                          className="tabular-nums mt-1 h-9 w-full rounded-md border border-[#D6D6CD] bg-white px-2.5 text-xs text-[#14171A] focus:border-[#14171A] focus:outline-none"
                        />
                      </label>
                      <label className="block text-[11px] font-semibold text-[#434B53]">
                        WhatsApp / Celular
                        <input
                          type="text"
                          value={newCusPhone}
                          onChange={(e) => setNewCusPhone(e.target.value)}
                          placeholder="Ej. 700-12345"
                          className="tabular-nums mt-1 h-9 w-full rounded-md border border-[#D6D6CD] bg-white px-2.5 text-xs text-[#14171A] focus:border-[#14171A] focus:outline-none"
                        />
                      </label>
                      <label className="block text-[11px] font-semibold text-[#434B53]">
                        Ciudad
                        <input
                          type="text"
                          value={newCusCity}
                          onChange={(e) => setNewCusCity(e.target.value)}
                          placeholder="Santa Cruz"
                          className="mt-1 h-9 w-full rounded-md border border-[#D6D6CD] bg-white px-2.5 text-xs text-[#14171A] focus:border-[#14171A] focus:outline-none"
                        />
                      </label>
                    </div>
                  </div>
                ) : customerSelection === 'walkin' ? (
                  <div className="rounded-lg border border-[#EAEAE3] bg-[#F8F8F5] px-3 py-2 text-xs text-[#5B636B]">
                    Venta directa sin registrar ficha en el directorio de clientes.
                  </div>
                ) : selectedRecurringCustomer ? (
                  <div className="rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3 py-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#14171A]">
                        {selectedRecurringCustomer.name}
                      </span>
                      <span className="rounded bg-[#DCFCE7] px-1.5 py-0.5 text-[10px] font-semibold text-[#166534]">
                        Recurrente
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#5B636B]">
                      {selectedRecurringCustomer.docNumber ? (
                        <span className="tabular-nums">
                          Doc: <strong className="text-[#434B53]">{selectedRecurringCustomer.docNumber}</strong>
                        </span>
                      ) : null}
                      {selectedRecurringCustomer.phone ? (
                        <span className="tabular-nums">
                          Tel: <strong className="text-[#434B53]">{selectedRecurringCustomer.phone}</strong>
                        </span>
                      ) : null}
                      {selectedRecurringCustomer.city ? (
                        <span>{selectedRecurringCustomer.city}</span>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {/* Single vs Split Payment Mode */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#434B53]">Modalidad de cobro</span>
                    <div className="inline-flex rounded-md bg-[#EAEAE3] p-0.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMode('single')}
                        className={`rounded px-2.5 py-1 text-[11px] font-semibold ${
                          paymentMode === 'single'
                            ? 'bg-[#14171A] text-white'
                            : 'text-[#434B53]'
                        }`}
                      >
                        Pago único
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMode('split');
                          if (totalBs > 0 && !splitRows[0].amount && !splitRows[1].amount) {
                            const half = Math.round(totalBs / 2);
                            setSplitRows([
                              { method: 'QR Simple', amount: String(half) },
                              { method: 'Efectivo', amount: String(totalBs - half) },
                            ]);
                          }
                        }}
                        className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold ${
                          paymentMode === 'split'
                            ? 'bg-[#14171A] text-white'
                            : 'text-[#434B53]'
                        }`}
                      >
                        <Split className="h-3 w-3" />
                        Pago mixto
                      </button>
                    </div>
                  </div>

                  {paymentMode === 'single' ? (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map((method) => {
                        const active = singleMethod === method;
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setSingleMethod(method)}
                            className={`btn-press h-9 rounded-lg border px-2.5 text-xs font-semibold ${
                              active
                                ? 'border-[#14171A] bg-[#14171A] text-white'
                                : 'border-[#D6D6CD] bg-[#F8F8F5] text-[#434B53] hover:border-[#14171A]'
                            }`}
                          >
                            {method}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2 rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] p-3">
                      {splitRows.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <select
                            value={row.method}
                            onChange={(e) =>
                              setSplitRows((prev) =>
                                prev.map((r, i) =>
                                  i === idx
                                    ? { ...r, method: e.target.value as PaymentMethod }
                                    : r
                                )
                              )
                            }
                            aria-label={`Método de pago ${idx + 1}`}
                            className="h-9 flex-1 rounded-md border border-[#D6D6CD] bg-white px-2 text-xs font-semibold text-[#14171A]"
                          >
                            {PAYMENT_METHODS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={0}
                            value={row.amount}
                            onChange={(e) =>
                              setSplitRows((prev) =>
                                prev.map((r, i) =>
                                  i === idx ? { ...r, amount: e.target.value } : r
                                )
                              )
                            }
                            placeholder="Bs"
                            aria-label={`Monto en Bs para pago ${idx + 1}`}
                            className="tabular-nums h-9 w-28 rounded-md border border-[#D6D6CD] bg-white px-2.5 text-right text-xs font-bold text-[#14171A]"
                          />
                          <button
                            type="button"
                            onClick={() => handleCompleteSplitRow(idx)}
                            title="Completar saldo restante aquí"
                            className="h-9 rounded-md border border-[#D6D6CD] bg-white px-2 text-[11px] font-semibold text-[#434B53] hover:border-[#14171A]"
                          >
                            Saldo
                          </button>
                        </div>
                      ))}

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[#5B636B]">Saldo pendiente por asignar:</span>
                        <span
                          className={`tabular-nums font-bold ${
                            splitRemainingBs === 0 ? 'text-[#166534]' : 'text-[#991B1B]'
                          }`}
                        >
                          {formatBs(splitRemainingBs)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <label className="flex items-center justify-between gap-3 text-xs font-semibold text-[#434B53]">
                  <span>Descuento comercial (Bs)</span>
                  <input
                    type="number"
                    min={0}
                    max={subtotalBs}
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    placeholder="0"
                    className="tabular-nums h-9 w-28 rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3 text-right text-sm text-[#14171A] focus:border-[#14171A] focus:bg-white focus:outline-none"
                  />
                </label>

                {/* Nivel 4 Preview: Emisión Fiscal / Revendedor */}
                <div className="rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#434B53]">
                      Modalidad de emisión
                    </span>
                    <span className="rounded bg-[#FEF2E4] px-1.5 py-0.5 text-[10px] font-bold text-[#8A3A00]">
                      Vista N4 (SIAT)
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'nota_interna', label: 'Nota interna' },
                        { id: 'con_factura', label: 'Con factura' },
                        { id: 'revendedor_diferenciado', label: 'Revendedor' },
                      ] as const
                    ).map((opt) => {
                      const active = invoiceMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setInvoiceMode(opt.id);
                            if (
                              opt.id === 'revendedor_diferenciado' &&
                              resellerInvoiceInput === '' &&
                              netEquipmentBs > 0
                            ) {
                              setResellerInvoiceInput(String(netEquipmentBs * 2));
                            }
                          }}
                          className={`rounded-md border px-2 py-1.5 text-[11px] font-semibold ${
                            active
                              ? 'border-[#14171A] bg-[#14171A] text-white'
                              : 'border-[#D6D6CD] bg-white text-[#434B53] hover:border-[#14171A]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {invoiceMode === 'con_factura' ? (
                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[#EAEAE3] pt-2.5 text-xs">
                      <span className="text-[#5B636B]">Recargo fiscal IVA/IT (%):</span>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={50}
                        value={fiscalPctInput}
                        onChange={(e) => setFiscalPctInput(e.target.value)}
                        aria-label="Porcentaje de recargo fiscal"
                        className="tabular-nums h-8 w-20 rounded border border-[#D6D6CD] bg-white px-2 text-right font-bold text-[#14171A]"
                      />
                    </div>
                  ) : null}

                  {invoiceMode === 'revendedor_diferenciado' ? (
                    <div className="mt-2.5 space-y-2 border-t border-[#EAEAE3] pt-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <label className="block font-medium text-[#434B53]">
                          Monto factura al comprador (Bs)
                          <input
                            type="number"
                            min={0}
                            step="1"
                            value={resellerInvoiceInput}
                            onChange={(e) => setResellerInvoiceInput(e.target.value)}
                            placeholder={String(netEquipmentBs * 2 || 5000)}
                            className={`tabular-nums mt-1 h-8 w-full rounded border bg-white px-2 font-bold text-[#14171A] ${
                              resellerInvalid ? 'border-[#DC2626]' : 'border-[#D6D6CD]'
                            }`}
                          />
                        </label>
                        <label className="block font-medium text-[#434B53]">
                          % Cobertura SIN
                          <input
                            type="number"
                            min={0}
                            max={50}
                            step="0.01"
                            value={fiscalPctInput}
                            onChange={(e) => setFiscalPctInput(e.target.value)}
                            className="tabular-nums mt-1 h-8 w-full rounded border border-[#D6D6CD] bg-white px-2 font-bold text-[#14171A]"
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={fiscalRecipientName}
                          onChange={(e) => setFiscalRecipientName(e.target.value)}
                          placeholder="Nombre comprador final"
                          aria-label="Razón social del comprador final"
                          className="h-8 rounded border border-[#D6D6CD] bg-white px-2 text-[11px] text-[#14171A]"
                        />
                        <input
                          type="text"
                          value={fiscalRecipientDoc}
                          onChange={(e) => setFiscalRecipientDoc(e.target.value)}
                          placeholder="NIT / CI comprador"
                          aria-label="NIT o CI del comprador final"
                          className="tabular-nums h-8 rounded border border-[#D6D6CD] bg-white px-2 text-[11px] text-[#14171A]"
                        />
                      </div>

                      {resellerInvalid ? (
                        <div
                          role="alert"
                          className="rounded border border-[#FCA5A5] bg-[#FEE2E2] px-2.5 py-2 text-[11px] text-[#991B1B]"
                        >
                          <p className="font-semibold">
                            La factura ({formatBs(resellerInvoiceAmountBs)}) no puede ser menor al Total a Caja ({formatBs(totalBs)}).
                          </p>
                          <p className="mt-0.5 text-[#7F1D1D]">
                            Sube el monto a facturar o prueba con un equipo más económico (ej. Motobomba Bs 2.050 o Soldadora Bs 2.290 facturada en Bs 5.000).
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-0.5 rounded border border-[#F3C898] bg-[#FEF2E4] px-2.5 py-2 text-[11px] text-[#434B53]">
                          <div>
                            <strong className="text-[#8A3A00]">A Caja entra:</strong>{' '}
                            <strong className="tabular-nums text-[#14171A]">{formatBs(totalBs)}</strong>{' '}
                            ({formatBs(netEquipmentBs)} equipo + {formatBs(fiscalReserveBs)} provisión SIN).
                          </div>
                          <div>
                            <strong className="text-[#8A3A00]">Factura SIAT sale por:</strong>{' '}
                            <strong className="tabular-nums text-[#14171A]">{formatBs(invoicedAmountBs)}</strong>{' '}
                            · Margen revendedor:{' '}
                            <strong className="tabular-nums text-[#15803D]">
                              {formatBs(Math.max(0, invoicedAmountBs - totalBs))}
                            </strong>
                            .
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-1.5 border-t border-[#D6D6CD] pt-4 text-sm">
                <div className="flex justify-between text-[#5B636B]">
                  <span>Subtotal equipo</span>
                  <span className="tabular-nums font-medium text-[#14171A]">
                    {formatBs(subtotalBs)}
                  </span>
                </div>
                {discountBs > 0 ? (
                  <div className="flex justify-between text-[#5B636B]">
                    <span>Descuento</span>
                    <span className="tabular-nums font-medium text-[#8A3A00]">
                      − {formatBs(discountBs)}
                    </span>
                  </div>
                ) : null}
                {fiscalReserveBs > 0 ? (
                  <div className="flex justify-between text-[#5B636B]">
                    <span>Provisión fiscal SIN ({safeFiscalPct}%)</span>
                    <span className="tabular-nums font-medium text-[#8A3A00]">
                      + {formatBs(fiscalReserveBs)}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-baseline justify-between pt-1">
                  <span className="font-semibold text-[#14171A]">Total real a Caja</span>
                  <span className="tabular-nums font-display text-2xl font-bold text-[#14171A]">
                    {formatBs(totalBs)}
                  </span>
                </div>
                {invoiceMode === 'revendedor_diferenciado' ? (
                  <div className="flex justify-between text-xs font-semibold text-[#8A3A00]">
                    <span>Monto en Factura SIAT al comprador</span>
                    <span className="tabular-nums">{formatBs(invoicedAmountBs)}</span>
                  </div>
                ) : null}
              </div>

              {saleError ? (
                <div
                  role="alert"
                  className="mt-3 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-3 py-2 text-xs font-semibold text-[#991B1B]"
                >
                  {saleError}
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  disabled={cartLines.length === 0}
                  onClick={handleSaveQuote}
                  className="btn-press inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-[#D6D6CD] bg-white px-3 text-xs font-semibold text-[#14171A] hover:border-[#14171A] disabled:opacity-45"
                >
                  <FileText className="h-4 w-4 text-[#5B636B]" />
                  Proforma
                </button>
                <button
                  type="button"
                  disabled={
                    !cashRegister.isOpen ||
                    cartLines.length === 0 ||
                    resellerInvalid ||
                    (paymentMode === 'split' && splitRemainingBs !== 0)
                  }
                  onClick={handleConfirmSale}
                  className="btn-press inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#14171A] px-4 text-sm font-semibold text-white hover:bg-[#272C32] disabled:cursor-not-allowed disabled:bg-[#EAEAE3] disabled:text-[#5B636B] sm:col-span-2"
                >
                  <Receipt className="h-4 w-4 text-[#F59E0B]" />
                  {cashRegister.isOpen
                    ? `Confirmar venta (${formatBs(totalBs)})`
                    : 'Caja cerrada'}
                </button>
              </div>
            </section>
          </div>
          </div>
        </div>
      ) : null}

      {viewMode === 'quotes' ? (
        <div className="mt-6 space-y-4">
          {/* Quotes Filters */}
          <div className="flex flex-col gap-3 rounded-xl border border-[#D6D6CD] bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: 'Todas' },
                    { id: 'Abierta', label: 'Abiertas' },
                    { id: 'Convertida', label: 'Convertidas' },
                    { id: 'Anulada', label: 'Anuladas' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setQuotesStatus(st.id);
                      setQuotesPage(1);
                    }}
                    className={`btn-press h-8 rounded-lg border px-2.5 text-xs font-semibold ${
                      quotesStatus === st.id
                        ? 'border-[#14171A] bg-[#14171A] text-white'
                        : 'border-[#D6D6CD] bg-[#F8F8F5] text-[#434B53]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:w-64">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5B636B]" />
                <input
                  type="search"
                  value={quotesQuery}
                  onChange={(e) => {
                    setQuotesQuery(e.target.value);
                    setQuotesPage(1);
                  }}
                  placeholder="Buscar proforma, cliente o equipo..."
                  aria-label="Buscar proformas"
                  className="h-9 w-full rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] pl-8 pr-3 text-xs text-[#14171A] placeholder:text-[#5B636B] focus:border-[#14171A] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-[#EAEAE3] pt-3">
              <DateFilterBar
                period={quotesPeriod}
                fromDate={quotesFrom}
                toDate={quotesTo}
                onChangePeriod={(p) => {
                  setQuotesPeriod(p);
                  setQuotesPage(1);
                }}
                onChangeFromDate={(d) => {
                  setQuotesFrom(d);
                  setQuotesPage(1);
                }}
                onChangeToDate={(d) => {
                  setQuotesTo(d);
                  setQuotesPage(1);
                }}
              />
            </div>
          </div>

          {filteredQuotes.length === 0 ? (
            <div className="rounded-xl border border-[#D6D6CD] bg-white p-10 text-center text-sm text-[#5B636B]">
              {quotes.length === 0
                ? 'No hay proformas registradas todavía.'
                : 'No hay proformas que coincidan con los filtros seleccionados.'}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {paginatedQuotes.map((qt) => (
                  <article
                    key={qt.id}
                    className="flex flex-col justify-between rounded-xl border border-[#D6D6CD] bg-white p-5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="tabular-nums font-mono text-xs font-bold text-[#14171A]">
                          {qt.quoteNumber}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-semibold ${
                            qt.status === 'Convertida'
                              ? 'bg-[#DCFCE7] text-[#166534]'
                              : qt.status === 'Anulada'
                                ? 'bg-[#FEE2E2] text-[#991B1B]'
                                : 'bg-[#FEF2E4] text-[#8A3A00]'
                          }`}
                        >
                          {qt.status}
                        </span>
                      </div>
                      <h3 className="mt-1.5 font-display text-lg font-bold text-[#14171A]">
                        {qt.customerName}
                      </h3>
                      <div className="text-xs text-[#5B636B]">
                        Emitida: {formatDateWithYear(qt.createdAt)} · Válida hasta{' '}
                        {formatDateShort(qt.validUntil)}
                      </div>

                      <ul className="mt-3 space-y-1 border-t border-[#EAEAE3] pt-3 text-xs text-[#434B53]">
                        {qt.lines.map((l) => (
                          <li key={l.itemId} className="flex justify-between gap-2">
                            <span className="truncate">
                              <strong>{l.qty}×</strong> {l.name}
                            </span>
                            <span className="tabular-nums shrink-0 font-semibold">
                              {formatBs(l.subtotalBs)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EAEAE3] pt-3">
                      <div className="tabular-nums font-display text-xl font-bold text-[#14171A]">
                        {formatBs(qt.totalBs)}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveQuotePreview(qt)}
                          className="btn-press inline-flex h-9 items-center rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3 text-xs font-semibold text-[#14171A]"
                        >
                          Ver PDF
                        </button>
                        {qt.status === 'Abierta' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleLoadQuoteIntoPos(qt)}
                              className="btn-press inline-flex h-9 items-center gap-1 rounded-lg bg-[#14171A] px-3 text-xs font-semibold text-white"
                            >
                              Convertir a venta
                              <ArrowRight className="h-3.5 w-3.5 text-[#F59E0B]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                cancelQuote(qt.id);
                                toast.info(`Proforma ${qt.quoteNumber} anulada`);
                              }}
                              title="Anular proforma"
                              aria-label={`Anular proforma ${qt.quoteNumber}`}
                              className="btn-press inline-flex h-9 items-center gap-1 rounded-lg border border-[#D6D6CD] bg-white px-2.5 text-xs font-semibold text-[#8A3A00] hover:border-[#FCA5A5] hover:bg-[#FEE2E2] hover:text-[#991B1B]"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              Anular
                            </button>
                          </>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            deleteQuote(qt.id);
                            toast.info(`Proforma ${qt.quoteNumber} eliminada`);
                          }}
                          title="Eliminar proforma"
                          aria-label={`Eliminar proforma ${qt.quoteNumber}`}
                          className="btn-press inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D6D6CD] bg-white text-[#5B636B] hover:border-[#FCA5A5] hover:bg-[#FEE2E2] hover:text-[#991B1B]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <PaginationBar
                currentPage={safeQuotesPage}
                totalItems={filteredQuotes.length}
                pageSize={QUOTES_PAGE_SIZE}
                itemLabel="proformas"
                onPageChange={setQuotesPage}
              />
            </>
          )}
        </div>
      ) : null}

      {viewMode === 'history' ? (
        <div className="mt-6 space-y-4">
          {/* Date range & search filters */}
          <div className="flex flex-col gap-3 rounded-xl border border-[#D6D6CD] bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
            <DateFilterBar
              period={historyPeriod}
              fromDate={historyFrom}
              toDate={historyTo}
              onChangePeriod={(p) => {
                setHistoryPeriod(p);
                setHistoryPage(1);
              }}
              onChangeFromDate={(d) => {
                setHistoryFrom(d);
                setHistoryPage(1);
              }}
              onChangeToDate={(d) => {
                setHistoryTo(d);
                setHistoryPage(1);
              }}
            />

            <div className="relative w-full lg:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5B636B]" />
              <input
                type="search"
                value={historyQuery}
                onChange={(e) => {
                  setHistoryQuery(e.target.value);
                  setHistoryPage(1);
                }}
                placeholder="Buscar comprobante o cliente..."
                aria-label="Buscar en historial de ventas"
                className="h-9 w-full rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] pl-8 pr-3 text-xs text-[#14171A] placeholder:text-[#5B636B] focus:border-[#14171A] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-[#D6D6CD] bg-white md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#D6D6CD] bg-[#F8F8F5] text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                  <th className="px-4 py-3">Comprobante</th>
                  <th className="px-4 py-3">Fecha y Hora</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Pagos</th>
                  <th className="px-4 py-3 text-right">Equipos</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAE3]">
                {paginatedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#5B636B]">
                      No hay ventas registradas en el rango seleccionado.
                    </td>
                  </tr>
                ) : (
                  paginatedHistory.map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#F8F8F5]">
                      <td className="tabular-nums whitespace-nowrap px-4 py-3.5 font-mono text-xs font-bold text-[#14171A]">
                        {sale.receiptNumber}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-[#5B636B]">
                        {formatDateTime(sale.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[#14171A]">{sale.customerName}</div>
                        {sale.customerDoc ? (
                          <div className="tabular-nums text-xs text-[#5B636B]">
                            {sale.customerDoc}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#434B53]">
                        {sale.payments.map((p, idx) => (
                          <div key={`${p.method}-${idx}`} className="tabular-nums">
                            {p.method}: <strong>{formatBs(p.amountBs)}</strong>
                          </div>
                        ))}
                      </td>
                      <td className="tabular-nums px-4 py-3.5 text-right text-xs text-[#5B636B]">
                        {sale.lines.reduce((s, l) => s + l.qty, 0)} u.
                      </td>
                      <td className="tabular-nums whitespace-nowrap px-4 py-3.5 text-right font-bold text-[#14171A]">
                        {formatBs(sale.totalBs)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveReceipt(sale)}
                          className="btn-press inline-flex h-8 items-center rounded-md border border-[#D6D6CD] bg-white px-2.5 text-xs font-semibold text-[#14171A] hover:border-[#14171A]"
                        >
                          Ver ticket
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {paginatedHistory.map((sale) => (
              <li key={sale.id} className="rounded-xl border border-[#D6D6CD] bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="tabular-nums font-mono text-xs font-bold text-[#14171A]">
                    {sale.receiptNumber}
                  </span>
                  <span className="text-xs text-[#5B636B]">{formatDateTime(sale.createdAt)}</span>
                </div>
                <div className="mt-1 font-semibold text-[#14171A]">{sale.customerName}</div>
                <div className="mt-2 flex items-center justify-between border-t border-[#EAEAE3] pt-2.5">
                  <span className="text-xs font-medium text-[#5B636B]">
                    {sale.payments.map((p) => p.method).join(' + ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveReceipt(sale)}
                    className="btn-press inline-flex h-9 items-center rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3 text-xs font-bold text-[#14171A]"
                  >
                    {formatBs(sale.totalBs)} · Ticket
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination Bar */}
          <PaginationBar
            currentPage={safeHistoryPage}
            totalItems={filteredHistory.length}
            pageSize={HISTORY_PAGE_SIZE}
            itemLabel="ventas"
            onPageChange={setHistoryPage}
          />
        </div>
      ) : null}

      {viewMode === 'closing' ? (
        <div className="mt-6 space-y-6">
          {/* Open / Close Cash Register Control */}
          <section
            aria-label="Control de apertura y cierre de caja"
            className={`rounded-xl border p-5 ${
              cashRegister.isOpen
                ? 'border-[#BBF7D0] bg-[#F0FDF4]'
                : 'border-[#FCA5A5] bg-[#FEF2F2]'
            }`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      cashRegister.isOpen
                        ? 'bg-[#166534] text-white'
                        : 'bg-[#991B1B] text-white'
                    }`}
                  >
                    {cashRegister.isOpen ? (
                      <Unlock className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    {cashRegister.isOpen ? 'Caja abierta' : 'Caja cerrada'}
                  </span>
                  <span className="text-xs font-semibold text-[#434B53]">
                    {cashRegister.isOpen
                      ? `Apertura ${formatDateTime(cashRegister.openedAt)} · Fondo inicial ${formatBs(cashRegister.openingCashBs)} (${cashRegister.openedBy})`
                      : cashRegister.closedAt
                        ? `Último cierre ${formatDateTime(cashRegister.closedAt)} (${cashRegister.closedBy ?? 'Dueño'})`
                        : 'Sin turno activo'}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-[#434B53]">
                  {cashRegister.isOpen
                    ? 'El mostrador está habilitado para registrar ventas al contado o mixtas. Al finalizar la jornada, realiza el cierre.'
                    : 'Las ventas están bloqueadas. Ingresa el fondo inicial y abre caja para comenzar a vender.'}
                </p>
              </div>

              {cashRegister.isOpen ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <label className="block text-xs font-semibold text-[#434B53]">
                    Observación (opcional)
                    <input
                      type="text"
                      value={closingNotesInput}
                      onChange={(e) => setClosingNotesInput(e.target.value)}
                      placeholder="Ej. Cierre cuadrado"
                      className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-xs text-[#14171A] sm:w-44"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[#434B53]">
                    Efectivo contado en cajón (Bs)
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={closingCountedInput}
                      onChange={(e) => setClosingCountedInput(e.target.value)}
                      placeholder={String(closingSummary.expectedCashInDrawer)}
                      className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm font-bold text-[#14171A] sm:w-40"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleCloseCashRegister}
                    className="btn-press inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#14171A] px-4 text-sm font-semibold text-white hover:bg-[#272C32]"
                  >
                    <Lock className="h-4 w-4 text-[#F59E0B]" />
                    Cerrar caja
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <label className="block text-xs font-semibold text-[#434B53]">
                    Fondo inicial de apertura (Bs)
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={openingCashInput}
                      onChange={(e) => setOpeningCashInput(e.target.value)}
                      placeholder="500"
                      className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm font-bold text-[#14171A] sm:w-44"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenCashRegister}
                    className="btn-press inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#14171A] px-4 text-sm font-semibold text-white hover:bg-[#272C32]"
                  >
                    <Unlock className="h-4 w-4 text-[#F59E0B]" />
                    Abrir caja
                  </button>
                </div>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[#D6D6CD] bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                Total cobrado hoy
              </div>
              <div className="tabular-nums mt-1.5 font-display text-2xl font-bold text-[#14171A]">
                {formatBs(closingSummary.todaySalesTotal)}
              </div>
              <div className="mt-1 text-xs text-[#5B636B]">
                {closingSummary.todaySalesCount} ventas ({closingSummary.splitSalesCount} mixtas)
              </div>
            </div>

            <div className="rounded-xl border border-[#D6D6CD] bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                Ingresos en Efectivo
              </div>
              <div className="tabular-nums mt-1.5 font-display text-2xl font-bold text-[#14171A]">
                {formatBs(closingSummary.byMethod.get('Efectivo') ?? 0)}
              </div>
              <div className="tabular-nums mt-1 text-xs text-[#5B636B]">
                Gastos en efectivo hoy: − {formatBs(closingSummary.todayCashExpenses)}
              </div>
            </div>

            <div className="rounded-xl border border-[#D6D6CD] bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                Cobros por QR Simple
              </div>
              <div className="tabular-nums mt-1.5 font-display text-2xl font-bold text-[#14171A]">
                {formatBs(closingSummary.byMethod.get('QR Simple') ?? 0)}
              </div>
              <div className="mt-1 text-xs text-[#5B636B]">Conciliación bancaria directa</div>
            </div>

            <div className="rounded-xl border-2 border-[#14171A] bg-white p-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#8A3A00]">
                <Calculator className="h-3.5 w-3.5" />
                Efectivo neto esperado en cajón
              </div>
              <div className="tabular-nums mt-1.5 font-display text-2xl font-bold text-[#14171A]">
                {formatBs(closingSummary.expectedCashInDrawer)}
              </div>
              <div className="mt-1 text-xs text-[#5B636B]">
                Fondo ({formatBs(cashRegister.openingCashBs)}) + efectivo − salidas
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#D6D6CD] bg-white p-5">
            <h2 className="font-display text-lg font-bold text-[#14171A]">
              Arqueo detallado por método de pago (Hoy)
            </h2>
            <p className="text-xs text-[#5B636B]">
              Cada abono de una venta mixta suma únicamente a su método correspondiente.
            </p>
            <div className="mt-4 divide-y divide-[#EAEAE3] rounded-lg border border-[#D6D6CD]">
              {PAYMENT_METHODS.map((method) => (
                <div key={method} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-semibold text-[#14171A]">{method}</span>
                  <span className="tabular-nums font-bold text-[#14171A]">
                    {formatBs(closingSummary.byMethod.get(method) ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cash Closures History */}
          <section aria-label="Historial de cierres de caja" className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-[#D6D6CD] bg-white p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[#14171A]">
                    <History className="h-4 w-4 text-[#C95B06]" />
                    Historial de cierres de caja ({cashClosures.length})
                  </h2>
                  <p className="text-xs text-[#5B636B]">
                    Consulta con cuánto efectivo, QR y diferencia cerró la caja en cualquier fecha anterior.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5B636B]" />
                  <input
                    type="search"
                    value={closuresQuery}
                    onChange={(e) => {
                      setClosuresQuery(e.target.value);
                      setClosuresPage(1);
                    }}
                    placeholder="Buscar responsable u observación..."
                    aria-label="Buscar en historial de cierres de caja"
                    className="h-9 w-full rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] pl-8 pr-3 text-xs text-[#14171A] placeholder:text-[#5B636B] focus:border-[#14171A] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-[#EAEAE3] pt-3">
                <DateFilterBar
                  period={closuresPeriod}
                  fromDate={closuresFrom}
                  toDate={closuresTo}
                  onChangePeriod={(p) => {
                    setClosuresPeriod(p);
                    setClosuresPage(1);
                  }}
                  onChangeFromDate={(d) => {
                    setClosuresFrom(d);
                    setClosuresPage(1);
                  }}
                  onChangeToDate={(d) => {
                    setClosuresTo(d);
                    setClosuresPage(1);
                  }}
                />
              </div>
            </div>

            <div className="hidden overflow-hidden rounded-xl border border-[#D6D6CD] bg-white md:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#D6D6CD] bg-[#F8F8F5] text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                      <th className="px-4 py-3">Fecha de cierre</th>
                      <th className="px-4 py-3">Responsable</th>
                      <th className="px-4 py-3 text-right">Fondo inicial</th>
                      <th className="px-4 py-3 text-right">Ventas turno</th>
                      <th className="px-4 py-3 text-right">Esperado</th>
                      <th className="px-4 py-3 text-right">Cerró con</th>
                      <th className="px-4 py-3 text-right">Diferencia</th>
                      <th className="px-4 py-3 text-right">Arqueo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAE3]">
                    {paginatedClosures.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-sm text-[#5B636B]">
                          No hay cierres de caja registrados en el rango seleccionado.
                        </td>
                      </tr>
                    ) : (
                      paginatedClosures.map((closure) => (
                        <tr key={closure.id} className="hover:bg-[#F8F8F5]">
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-[#14171A]">
                              {formatDateWithYear(closure.closedAt)}
                            </div>
                            <div className="text-[11px] text-[#5B636B]">
                              Cierre {formatDateTime(closure.closedAt)}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-[#14171A]">{closure.closedBy}</div>
                            {closure.notes ? (
                              <div className="max-w-[200px] truncate text-[11px] text-[#5B636B]">
                                {closure.notes}
                              </div>
                            ) : (
                              <div className="text-[11px] text-[#5B636B]">
                                Abrió: {closure.openedBy}
                              </div>
                            )}
                          </td>
                          <td className="tabular-nums whitespace-nowrap px-4 py-3.5 text-right text-xs text-[#434B53]">
                            {formatBs(closure.openingCashBs)}
                          </td>
                          <td className="tabular-nums whitespace-nowrap px-4 py-3.5 text-right">
                            <div className="font-semibold text-[#14171A]">
                              {formatBs(closure.salesTotalBs)}
                            </div>
                            <div className="text-[11px] text-[#5B636B]">
                              {closure.salesCount} vtas · QR {formatBs(closure.qrSalesBs)}
                            </div>
                          </td>
                          <td className="tabular-nums whitespace-nowrap px-4 py-3.5 text-right text-xs font-semibold text-[#434B53]">
                            {formatBs(closure.expectedCashBs)}
                          </td>
                          <td className="tabular-nums whitespace-nowrap px-4 py-3.5 text-right font-bold text-[#14171A]">
                            {formatBs(closure.countedCashBs)}
                          </td>
                          <td className="tabular-nums whitespace-nowrap px-4 py-3.5 text-right">
                            <span
                              className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${
                                closure.differenceBs === 0
                                  ? 'bg-[#DCFCE7] text-[#166534]'
                                  : closure.differenceBs > 0
                                    ? 'bg-[#FEF2E4] text-[#8A3A00]'
                                    : 'bg-[#FEE2E2] text-[#991B1B]'
                              }`}
                            >
                              {closure.differenceBs === 0
                                ? 'Cuadrado'
                                : closure.differenceBs > 0
                                  ? `+ ${formatBs(closure.differenceBs)}`
                                  : `− ${formatBs(Math.abs(closure.differenceBs))}`}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setActiveClosureDetail(closure)}
                              className="btn-press inline-flex h-8 items-center rounded-md border border-[#D6D6CD] bg-white px-2.5 text-xs font-semibold text-[#14171A] hover:border-[#14171A]"
                            >
                              Ver cierre
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <ul className="space-y-3 md:hidden">
              {paginatedClosures.map((closure) => (
                <li key={closure.id} className="rounded-xl border border-[#D6D6CD] bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#14171A]">
                      {formatDateWithYear(closure.closedAt)}
                    </span>
                    <span
                      className={`tabular-nums rounded px-2 py-0.5 text-[11px] font-semibold ${
                        closure.differenceBs === 0
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : closure.differenceBs > 0
                            ? 'bg-[#FEF2E4] text-[#8A3A00]'
                            : 'bg-[#FEE2E2] text-[#991B1B]'
                      }`}
                    >
                      {closure.differenceBs === 0
                        ? 'Cuadrado'
                        : closure.differenceBs > 0
                          ? `+ ${formatBs(closure.differenceBs)}`
                          : `− ${formatBs(Math.abs(closure.differenceBs))}`}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-[#5B636B]">
                    Cerró: {closure.closedBy} · Ventas: {formatBs(closure.salesTotalBs)}
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-[#EAEAE3] pt-2.5">
                    <span className="tabular-nums text-xs font-bold text-[#14171A]">
                      Cerró con: {formatBs(closure.countedCashBs)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveClosureDetail(closure)}
                      className="btn-press inline-flex h-8 items-center rounded-md border border-[#D6D6CD] bg-[#F8F8F5] px-2.5 text-xs font-semibold text-[#14171A]"
                    >
                      Detalle
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <PaginationBar
              currentPage={safeClosuresPage}
              totalItems={filteredClosures.length}
              pageSize={CLOSURES_PAGE_SIZE}
              itemLabel="cierres de caja"
              onPageChange={setClosuresPage}
            />
          </section>
        </div>
      ) : null}

      {/* Printable Receipt Drawer */}
      <Drawer
        open={activeReceipt !== null}
        onClose={() => setActiveReceipt(null)}
        title={activeReceipt ? `Comprobante ${activeReceipt.receiptNumber}` : ''}
        subtitle="Comprobante de venta de mostrador · Sucursal Principal"
        footer={
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-press inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#D6D6CD] bg-white text-sm font-semibold text-[#14171A] hover:border-[#14171A]"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button
              type="button"
              onClick={() => setActiveReceipt(null)}
              className="btn-press inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-[#14171A] text-sm font-semibold text-white hover:bg-[#272C32]"
            >
              Listo
            </button>
          </div>
        }
      >
        {activeReceipt ? (
          <div
            id="printable-receipt"
            className="rounded-xl border border-dashed border-[#B9B9AE] bg-[#F8F8F5] p-5"
          >
            <div className="border-b border-dashed border-[#B9B9AE] pb-4 text-center">
              <div className="font-display text-lg font-bold text-[#14171A]">
                Maquinaria Central
              </div>
              <div className="text-xs text-[#5B636B]">Sucursal Principal</div>
              <div className="tabular-nums mt-2 inline-block rounded bg-white px-2.5 py-1 font-mono text-xs font-bold text-[#14171A]">
                COMPROBANTE {activeReceipt.receiptNumber}
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5B636B]">Fecha:</span>
                <span className="font-semibold text-[#14171A]">
                  {formatDateTime(activeReceipt.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B636B]">Cliente:</span>
                <span className="font-semibold text-[#14171A]">
                  {activeReceipt.customerName}
                </span>
              </div>
              {activeReceipt.customerDoc ? (
                <div className="flex justify-between">
                  <span className="text-[#5B636B]">CI / NIT:</span>
                  <span className="tabular-nums font-semibold text-[#14171A]">
                    {activeReceipt.customerDoc}
                  </span>
                </div>
              ) : null}
              {activeReceipt.quoteNumber ? (
                <div className="flex justify-between">
                  <span className="text-[#5B636B]">Proforma origen:</span>
                  <span className="font-mono font-semibold text-[#14171A]">
                    {activeReceipt.quoteNumber}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mt-4 border-t border-dashed border-[#B9B9AE] pt-3">
              <ul className="space-y-2.5 text-xs">
                {activeReceipt.lines.map((line, i) => (
                  <li
                    key={`${activeReceipt.id}-${line.itemId}-${i}`}
                    className="flex justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[#14171A]">{line.name}</div>
                      <div className="tabular-nums text-[#5B636B]">
                        {line.sku} · {line.qty} × {formatBs(line.unitPriceBs)}
                        {line.warrantyMonths > 0 ? ` · Garantía ${line.warrantyMonths}m` : ''}
                      </div>
                      {line.serialNumber ? (
                        <div className="font-mono text-[10px] text-[#434B53]">
                          Serie: {line.serialNumber}
                        </div>
                      ) : null}
                    </div>
                    <div className="tabular-nums shrink-0 font-bold text-[#14171A]">
                      {formatBs(line.subtotalBs)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 space-y-1.5 border-t border-dashed border-[#B9B9AE] pt-3 text-xs">
              <div className="font-semibold uppercase text-[#5B636B]">Desglose de pago</div>
              {activeReceipt.payments.map((p, idx) => (
                <div key={`${p.method}-${idx}`} className="flex justify-between text-[#434B53]">
                  <span>{p.method}</span>
                  <span className="tabular-nums font-semibold text-[#14171A]">
                    {formatBs(p.amountBs)}
                  </span>
                </div>
              ))}
              {activeReceipt.discountBs > 0 ? (
                <div className="flex justify-between text-[#5B636B]">
                  <span>Descuento aplicado</span>
                  <span className="tabular-nums">− {formatBs(activeReceipt.discountBs)}</span>
                </div>
              ) : null}
              {(activeReceipt.fiscalReserveBs ?? 0) > 0 ? (
                <div className="flex justify-between text-[#8A3A00]">
                  <span>
                    Provisión impuestos SIN ({activeReceipt.fiscalSurchargePct ?? 16}%)
                  </span>
                  <span className="tabular-nums font-semibold">
                    + {formatBs(activeReceipt.fiscalReserveBs ?? 0)}
                  </span>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between pt-1 text-sm font-bold text-[#14171A]">
                <span>TOTAL INGRESADO A CAJA</span>
                <span className="tabular-nums font-display text-xl">
                  {formatBs(activeReceipt.totalBs)}
                </span>
              </div>
              {activeReceipt.invoiceMode === 'revendedor_diferenciado' ? (
                <div className="mt-2 rounded border border-[#F3C898] bg-[#FEF2E4] px-2.5 py-2 text-[11px] text-[#434B53]">
                  <div className="flex justify-between font-bold text-[#8A3A00]">
                    <span>Factura SIAT emitida a tercero:</span>
                    <span className="tabular-nums">
                      {formatBs(activeReceipt.invoicedAmountBs ?? activeReceipt.totalBs)}
                    </span>
                  </div>
                  {activeReceipt.fiscalRecipientName || activeReceipt.fiscalRecipientDoc ? (
                    <div className="mt-0.5 text-[#434B53]">
                      Titular factura: {activeReceipt.fiscalRecipientName || 'Por definir'}{' '}
                      {activeReceipt.fiscalRecipientDoc ? `(${activeReceipt.fiscalRecipientDoc})` : ''}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* Quote Preview Drawer */}
      <Drawer
        open={activeQuotePreview !== null}
        onClose={() => setActiveQuotePreview(null)}
        title={activeQuotePreview ? `Proforma ${activeQuotePreview.quoteNumber}` : ''}
        subtitle="Cotización formal lista para imprimir o enviar"
        footer={
          activeQuotePreview ? (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-press inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#D6D6CD] bg-white text-sm font-semibold text-[#14171A]"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </button>
              {activeQuotePreview.status === 'Abierta' ? (
                <button
                  type="button"
                  onClick={() => handleLoadQuoteIntoPos(activeQuotePreview)}
                  className="btn-press inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#14171A] text-sm font-semibold text-white"
                >
                  Convertir a venta
                </button>
              ) : null}
            </div>
          ) : null
        }
      >
        {activeQuotePreview ? (
          <div
            id="printable-receipt"
            className="rounded-xl border border-[#D6D6CD] bg-[#F8F8F5] p-5"
          >
            <div className="border-b border-[#D6D6CD] pb-3">
              <div className="font-display text-lg font-bold text-[#14171A]">
                Maquinaria Central · Proforma
              </div>
              <div className="mt-1 text-xs text-[#5B636B]">
                Cliente: <strong className="text-[#14171A]">{activeQuotePreview.customerName}</strong>
                {activeQuotePreview.customerDoc ? ` · ${activeQuotePreview.customerDoc}` : ''}
              </div>
              <div className="text-xs text-[#5B636B]">
                Válida hasta: {formatDateShort(activeQuotePreview.validUntil)}
              </div>
            </div>

            <ul className="mt-3 space-y-2 border-b border-[#D6D6CD] pb-3 text-xs">
              {activeQuotePreview.lines.map((l) => (
                <li key={l.itemId} className="flex justify-between gap-2">
                  <span>
                    <strong>{l.qty}×</strong> {l.name} ({l.sku})
                  </span>
                  <span className="tabular-nums font-bold text-[#14171A]">
                    {formatBs(l.subtotalBs)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-[#14171A]">Total cotizado</span>
              <span className="tabular-nums font-display text-xl font-bold text-[#14171A]">
                {formatBs(activeQuotePreview.totalBs)}
              </span>
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* Cash Closure Detail Drawer */}
      <Drawer
        open={activeClosureDetail !== null}
        onClose={() => setActiveClosureDetail(null)}
        title={
          activeClosureDetail
            ? `Cierre de caja · ${formatDateWithYear(activeClosureDetail.closedAt)}`
            : ''
        }
        subtitle="Arqueo histórico guardado al finalizar la jornada"
        footer={
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-press inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#D6D6CD] bg-white text-sm font-semibold text-[#14171A] hover:border-[#14171A]"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button
              type="button"
              onClick={() => setActiveClosureDetail(null)}
              className="btn-press inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-[#14171A] text-sm font-semibold text-white"
            >
              Cerrar
            </button>
          </div>
        }
      >
        {activeClosureDetail ? (
          <div
            id="printable-receipt"
            className="space-y-4 rounded-xl border border-[#D6D6CD] bg-[#F8F8F5] p-5 text-xs"
          >
            <div className="space-y-1.5 border-b border-[#D6D6CD] pb-3">
              <div className="flex justify-between">
                <span className="text-[#5B636B]">Apertura:</span>
                <span className="font-semibold text-[#14171A]">
                  {formatDateTime(activeClosureDetail.openedAt)} · {activeClosureDetail.openedBy}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B636B]">Cierre:</span>
                <span className="font-semibold text-[#14171A]">
                  {formatDateTime(activeClosureDetail.closedAt)} · {activeClosureDetail.closedBy}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-b border-[#D6D6CD] pb-3">
              <div className="flex justify-between">
                <span className="text-[#5B636B]">Fondo inicial en cajón</span>
                <span className="tabular-nums font-semibold text-[#14171A]">
                  {formatBs(activeClosureDetail.openingCashBs)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B636B]">
                  Ventas en efectivo ({activeClosureDetail.salesCount} vtas totales)
                </span>
                <span className="tabular-nums font-semibold text-[#14171A]">
                  + {formatBs(activeClosureDetail.cashSalesBs)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B636B]">Cobros por QR Simple (banco)</span>
                <span className="tabular-nums font-semibold text-[#14171A]">
                  {formatBs(activeClosureDetail.qrSalesBs)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B636B]">Salidas en efectivo</span>
                <span className="tabular-nums font-semibold text-[#8A3A00]">
                  − {formatBs(activeClosureDetail.cashExpensesBs)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-[#434B53]">Efectivo esperado en cajón</span>
                <span className="tabular-nums font-bold text-[#14171A]">
                  {formatBs(activeClosureDetail.expectedCashBs)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-[#14171A]">Efectivo contado al cierre</span>
                <span className="tabular-nums font-display text-lg font-bold text-[#14171A]">
                  {formatBs(activeClosureDetail.countedCashBs)}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-xs">
                <span className="text-[#5B636B]">Diferencia de arqueo</span>
                <span
                  className={`tabular-nums font-bold ${
                    activeClosureDetail.differenceBs === 0
                      ? 'text-[#166534]'
                      : activeClosureDetail.differenceBs > 0
                        ? 'text-[#8A3A00]'
                        : 'text-[#991B1B]'
                  }`}
                >
                  {activeClosureDetail.differenceBs === 0
                    ? 'Bs 0 (Cuadrado)'
                    : activeClosureDetail.differenceBs > 0
                      ? `+ ${formatBs(activeClosureDetail.differenceBs)} (Sobrante)`
                      : `− ${formatBs(Math.abs(activeClosureDetail.differenceBs))} (Faltante)`}
                </span>
              </div>
              {activeClosureDetail.notes ? (
                <div className="mt-2 rounded-lg border border-[#D6D6CD] bg-white p-2.5 text-[#434B53]">
                  <strong>Observación:</strong> {activeClosureDetail.notes}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
