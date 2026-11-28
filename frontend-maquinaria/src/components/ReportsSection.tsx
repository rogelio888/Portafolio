import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  History,
  MessageCircle,
  PieChart,
  Search,
  SlidersHorizontal,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../state/StoreContext';
import type { KardexMovementType, PaymentMethod } from '../types/store';
import {
  formatBs,
  formatDateShort,
  formatDateTime,
  getDaysSince,
  getItemDisplayPriceBs,
  getItemStockValueCostBs,
  getTotalStock,
} from '../utils/formatters';

type ReportTab = 'balance' | 'stagnant' | 'kardex';
type PeriodFilter = '7d' | '30d' | '90d' | '365d' | 'all' | 'custom';
const KARDEX_PAGE_SIZE = 10;

const PAYMENT_METHODS: PaymentMethod[] = ['Efectivo', 'QR Simple'];

const CHART_PALETTE = [
  '#14171A',
  '#C95B06',
  '#0F766E',
  '#D97706',
  '#64748B',
];

function toLocalDateKey(isoOrDate: string): string {
  const dt = isoOrDate.length === 10 ? new Date(`${isoOrDate}T12:00:00`) : new Date(isoOrDate);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDayChip(dateKey: string): string {
  const todayKey = toLocalDateKey(new Date().toISOString());
  if (dateKey === todayKey) return 'Hoy';
  const dt = new Date(`${dateKey}T12:00:00`);
  return new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: 'short' }).format(dt);
}

function formatCompactAmount(amount: number): string {
  if (amount >= 1000) {
    const k = amount / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return String(Math.round(amount));
}

export function ReportsSection() {
  const { exchangeRate, sales, expenses, inventory, kardex, quotes } = useStore();
  const [tab, setTab] = useState<ReportTab>('balance');
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [kardexFilter, setKardexFilter] = useState<'all' | KardexMovementType>('all');
  const [kardexQuery, setKardexQuery] = useState('');
  const [kardexPeriod, setKardexPeriod] = useState<'all' | '7d' | '90d' | '365d' | 'custom'>('all');
  const [kardexFrom, setKardexFrom] = useState('');
  const [kardexTo, setKardexTo] = useState('');
  const [kardexPage, setKardexPage] = useState(1);
  const [hoveredDayKey, setHoveredDayKey] = useState<string | null>(null);
  const [hoveredExpenseCat, setHoveredExpenseCat] = useState<string | null>(null);

  const inventoryById = useMemo(
    () => new Map(inventory.map((it) => [it.id, it])),
    [inventory]
  );

  const analytics = useMemo(() => {
    const now = Date.now();
    const cutoffMs =
      period === '7d'
        ? now - 7 * 24 * 3600 * 1000
        : period === '30d'
          ? now - 30 * 24 * 3600 * 1000
          : period === '90d'
            ? now - 90 * 24 * 3600 * 1000
            : period === '365d'
              ? now - 365 * 24 * 3600 * 1000
              : 0;
    const fromMs =
      period === 'custom' && customFrom ? new Date(`${customFrom}T00:00:00`).getTime() : 0;
    const toMs =
      period === 'custom' && customTo
        ? new Date(`${customTo}T23:59:59`).getTime()
        : Number.POSITIVE_INFINITY;
    const inPeriod = (ts: number) =>
      period === 'custom' ? ts >= fromMs && ts <= toMs : ts >= cutoffMs;

    let revenueBs = 0;
    let collectedTotalBs = 0;
    let fiscalReserveTotalBs = 0;
    let invoicedNominalBs = 0;
    let cogsBs = 0;
    let salesCount = 0;

    const byPaymentMethod = new Map<PaymentMethod, number>(
      PAYMENT_METHODS.map((m) => [m, 0])
    );
    const byCategory = new Map<
      string,
      { revenueBs: number; costBs: number; units: number }
    >();
    const byProduct = new Map<
      string,
      { sku: string; name: string; revenueBs: number; costBs: number; units: number }
    >();
    const byDay = new Map<
      string,
      { revenueBs: number; cogsBs: number; expensesBs: number; salesCount: number }
    >();

    const ensureDay = (key: string) => {
      const existing = byDay.get(key);
      if (existing) return existing;
      const created = { revenueBs: 0, cogsBs: 0, expensesBs: 0, salesCount: 0 };
      byDay.set(key, created);
      return created;
    };

    if (period === '7d') {
      for (let i = 6; i >= 0; i -= 1) {
        const dt = new Date();
        dt.setDate(dt.getDate() - i);
        ensureDay(toLocalDateKey(dt.toISOString()));
      }
    }

    for (const s of sales) {
      if (!inPeriod(new Date(s.createdAt).getTime())) continue;
      salesCount += 1;
      const reserve = s.fiscalReserveBs ?? 0;
      const netStoreRev = Math.max(0, s.totalBs - reserve);
      revenueBs += netStoreRev;
      collectedTotalBs += s.totalBs;
      fiscalReserveTotalBs += reserve;
      invoicedNominalBs += s.invoicedAmountBs ?? 0;

      const dayBucket = ensureDay(toLocalDateKey(s.createdAt));
      dayBucket.revenueBs += netStoreRev;
      dayBucket.salesCount += 1;

      for (const p of s.payments) {
        byPaymentMethod.set(p.method, (byPaymentMethod.get(p.method) ?? 0) + p.amountBs);
      }

      const saleGross = s.lines.reduce((sum, l) => sum + l.subtotalBs, 0);
      const discountRatio = saleGross > 0 ? netStoreRev / saleGross : 1;

      for (const l of s.lines) {
        const lineCost = l.unitCostBs * l.qty;
        const lineNetRev = Math.round(l.subtotalBs * discountRatio);
        cogsBs += lineCost;
        dayBucket.cogsBs += lineCost;

        const cat = inventoryById.get(l.itemId)?.category ?? 'Otros';
        const catEntry = byCategory.get(cat) ?? { revenueBs: 0, costBs: 0, units: 0 };
        catEntry.revenueBs += lineNetRev;
        catEntry.costBs += lineCost;
        catEntry.units += l.qty;
        byCategory.set(cat, catEntry);

        const prodEntry = byProduct.get(l.itemId) ?? {
          sku: l.sku,
          name: l.name,
          revenueBs: 0,
          costBs: 0,
          units: 0,
        };
        prodEntry.revenueBs += lineNetRev;
        prodEntry.costBs += lineCost;
        prodEntry.units += l.qty;
        byProduct.set(l.itemId, prodEntry);
      }
    }

    let totalExpensesBs = 0;
    let fixedExpensesBs = 0;
    let variableExpensesBs = 0;
    const byExpenseCategory = new Map<string, number>();
    for (const e of expenses) {
      const ts = new Date(`${e.date}T12:00:00`).getTime();
      if (!inPeriod(ts)) continue;
      totalExpensesBs += e.amountBs;
      if (e.expenseType === 'Fijo') fixedExpensesBs += e.amountBs;
      else variableExpensesBs += e.amountBs;
      byExpenseCategory.set(
        e.category,
        (byExpenseCategory.get(e.category) ?? 0) + e.amountBs
      );
      const dayBucket = ensureDay(e.date);
      dayBucket.expensesBs += e.amountBs;
    }

    const grossProfitBs = revenueBs - cogsBs;
    const netProfitBs = grossProfitBs - totalExpensesBs;
    const avgTicketBs = salesCount > 0 ? Math.round(revenueBs / salesCount) : 0;
    const grossMarginPct = revenueBs > 0 ? (grossProfitBs / revenueBs) * 100 : 0;
    const netMarginPct = revenueBs > 0 ? (netProfitBs / revenueBs) * 100 : 0;

    const expenseList = Array.from(byExpenseCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, amountBs], idx) => ({
        category,
        amountBs,
        pct: totalExpensesBs > 0 ? (amountBs / totalExpensesBs) * 100 : 0,
        color: CHART_PALETTE[idx % CHART_PALETTE.length],
      }));

    const paymentList = PAYMENT_METHODS.map((method) => {
      const amountBs = byPaymentMethod.get(method) ?? 0;
      return {
        method,
        amountBs,
        pct: collectedTotalBs > 0 ? (amountBs / collectedTotalBs) * 100 : 0,
      };
    }).sort((a, b) => b.amountBs - a.amountBs);

    const categoryRanking = Array.from(byCategory.entries())
      .map(([category, data]) => ({
        category,
        ...data,
        profitBs: data.revenueBs - data.costBs,
        marginPct:
          data.revenueBs > 0 ? ((data.revenueBs - data.costBs) / data.revenueBs) * 100 : 0,
      }))
      .sort((a, b) => b.revenueBs - a.revenueBs);

    const topProducts = Array.from(byProduct.values())
      .map((p) => ({
        ...p,
        profitBs: p.revenueBs - p.costBs,
        marginPct: p.revenueBs > 0 ? ((p.revenueBs - p.costBs) / p.revenueBs) * 100 : 0,
      }))
      .sort((a, b) => b.revenueBs - a.revenueBs)
      .slice(0, 5);

    const dailySeries = Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([dateKey, d]) => ({
        dateKey,
        label: formatDayChip(dateKey),
        ...d,
        outflowBs: d.cogsBs + d.expensesBs,
      }));

    // Quotes funnel
    const periodQuotes = quotes.filter((q) => inPeriod(new Date(q.createdAt).getTime()));
    const convertedQuotes = periodQuotes.filter((q) => q.status === 'Convertida');
    const openQuotes = periodQuotes.filter((q) => q.status === 'Abierta');
    const quoteConversionPct =
      periodQuotes.length > 0 ? (convertedQuotes.length / periodQuotes.length) * 100 : 0;
    const openQuotesValueBs = openQuotes.reduce((sum, q) => sum + q.totalBs, 0);

    return {
      revenueBs,
      collectedTotalBs,
      fiscalReserveTotalBs,
      invoicedNominalBs,
      cogsBs,
      grossProfitBs,
      totalExpensesBs,
      fixedExpensesBs,
      variableExpensesBs,
      netProfitBs,
      salesCount,
      avgTicketBs,
      grossMarginPct,
      netMarginPct,
      expenseList,
      paymentList,
      categoryRanking,
      topProducts,
      dailySeries,
      periodQuotesCount: periodQuotes.length,
      convertedQuotesCount: convertedQuotes.length,
      openQuotesCount: openQuotes.length,
      quoteConversionPct,
      openQuotesValueBs,
    };
  }, [sales, expenses, inventoryById, quotes, period, customFrom, customTo]);

  const stagnantItems = useMemo(() => {
    const today = new Date();
    return inventory
      .map((item) => {
        const stock = getTotalStock(item);
        const days = getDaysSince(item.lastSoldAt, today);
        const costLockedBs = getItemStockValueCostBs(item);
        const priceBs = getItemDisplayPriceBs(item, exchangeRate);
        const potentialSaleBs = priceBs * stock;
        return { item, stock, days, costLockedBs, priceBs, potentialSaleBs };
      })
      .filter((row) => row.stock > 0 && row.days >= 60)
      .sort((a, b) => b.days - a.days);
  }, [inventory, exchangeRate]);

  const stagnantSummary = useMemo(() => {
    let cost60to89 = 0;
    let cost90Plus = 0;
    let potentialTotal = 0;
    for (const row of stagnantItems) {
      potentialTotal += row.potentialSaleBs;
      if (row.days >= 90) cost90Plus += row.costLockedBs;
      else cost60to89 += row.costLockedBs;
    }
    const totalCost = cost60to89 + cost90Plus;
    return {
      totalCost,
      potentialTotal,
      cost60to89,
      cost90Plus,
      pct90Plus: totalCost > 0 ? (cost90Plus / totalCost) * 100 : 0,
    };
  }, [stagnantItems]);

  const kardexSummary = useMemo(() => {
    let entriesUnits = 0;
    let salesUnits = 0;
    let manualEvents = 0;
    for (const k of kardex) {
      if (k.type === 'Ingreso compra') entriesUnits += Math.abs(k.delta);
      else if (k.type === 'Salida venta') salesUnits += Math.abs(k.delta);
      else manualEvents += 1;
    }
    return { entriesUnits, salesUnits, manualEvents, totalEvents: kardex.length };
  }, [kardex]);

  const filteredKardex = useMemo(() => {
    const q = kardexQuery.trim().toLowerCase();
    const now = Date.now();
    const daysCutoff =
      kardexPeriod === '7d'
        ? now - 7 * 86400_000
        : kardexPeriod === '90d'
          ? now - 90 * 86400_000
          : kardexPeriod === '365d'
            ? now - 365 * 86400_000
            : 0;
    const fromMs =
      kardexPeriod === 'custom' && kardexFrom ? new Date(`${kardexFrom}T00:00:00`).getTime() : 0;
    const toMs =
      kardexPeriod === 'custom' && kardexTo
        ? new Date(`${kardexTo}T23:59:59`).getTime()
        : Number.POSITIVE_INFINITY;

    return kardex.filter((k) => {
      const ts = new Date(k.createdAt).getTime();
      if (daysCutoff > 0 && ts < daysCutoff) return false;
      if (kardexPeriod === 'custom' && (ts < fromMs || ts > toMs)) return false;
      const matchType = kardexFilter === 'all' || k.type === kardexFilter;
      if (!matchType) return false;
      if (!q) return true;
      return (
        k.sku.toLowerCase().includes(q) ||
        k.itemName.toLowerCase().includes(q) ||
        k.reference.toLowerCase().includes(q) ||
        k.actorLabel.toLowerCase().includes(q)
      );
    });
  }, [kardex, kardexFilter, kardexQuery, kardexPeriod, kardexFrom, kardexTo]);

  const kardexTotalPages = Math.max(1, Math.ceil(filteredKardex.length / KARDEX_PAGE_SIZE));
  const safeKardexPage = Math.min(kardexPage, kardexTotalPages);
  const paginatedKardex = useMemo(() => {
    const start = (safeKardexPage - 1) * KARDEX_PAGE_SIZE;
    return filteredKardex.slice(start, start + KARDEX_PAGE_SIZE);
  }, [filteredKardex, safeKardexPage]);

  const handleExportBalanceCsv = () => {
    const rows: string[][] = [
      ['REPORTE GERENCIAL', `Periodo: ${period}`],
      ['Concepto', 'Monto (Bs)'],
      ['Ingresos por Ventas', String(analytics.revenueBs)],
      ['Costo de Mercadería Vendida', String(analytics.cogsBs)],
      ['Utilidad Bruta', String(analytics.grossProfitBs)],
      ['Gastos Operativos', String(analytics.totalExpensesBs)],
      ['Utilidad Neta Real', String(analytics.netProfitBs)],
      [],
      ['GASTOS POR CATEGORIA', 'Monto (Bs)'],
      ...analytics.expenseList.map((e) => [e.category, String(e.amountBs)]),
      [],
      ['COBROS POR METODO DE PAGO', 'Monto (Bs)'],
      ...analytics.paymentList.map((p) => [p.method, String(p.amountBs)]),
      [],
      ['VENTAS POR CATEGORIA', 'Ingresos (Bs)', 'Costo (Bs)', 'Utilidad (Bs)', 'Unidades'],
      ...analytics.categoryRanking.map((c) => [
        c.category,
        String(c.revenueBs),
        String(c.costBs),
        String(c.profitBs),
        String(c.units),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_gerencial_${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Reporte gerencial completo exportado en CSV / Excel');
  };

  const handleExportKardexCsv = () => {
    const rows = [
      ['Fecha', 'Tipo', 'SKU', 'Equipo', 'Movimiento', 'Saldo', 'Referencia', 'Usuario', 'Detalle'],
      ...filteredKardex.map((k) => [
        k.createdAt,
        k.type,
        k.sku,
        k.itemName,
        String(k.delta),
        String(k.balanceAfter),
        k.reference,
        k.actorLabel,
        k.detail,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kardex_sucursal.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Kardex exportado en CSV / Excel');
  };

  const handleCopyPromoWhatsApp = async (name: string, sku: string, priceBs: number) => {
    const text = `¡Oferta especial en Maquinaria Central!\n*${name}* (${sku})\nPrecio promocional hoy: *${formatBs(priceBs)}*\nConsulta disponibilidad inmediata en sucursal.`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Ignore clipboard error in headless env
    }
    toast.success(`Mensaje promocional copiado (${sku})`);
  };

  const maxDailyChartValue = Math.max(
    1,
    ...analytics.dailySeries.map((d) => Math.max(d.revenueBs, d.outflowBs))
  );
  const activeDayDetail =
    analytics.dailySeries.find((d) => d.dateKey === hoveredDayKey) ??
    analytics.dailySeries[analytics.dailySeries.length - 1] ??
    null;

  const maxCatRevenue = Math.max(
    1,
    ...analytics.categoryRanking.map((c) => c.revenueBs)
  );

  // Donut SVG geometry (radius 54, circumference 2 * PI * 54 ≈ 339.292)
  const donutRadius = 54;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let cumulativeFraction = 0;
  const donutSegments = analytics.expenseList.map((item) => {
    const fraction =
      analytics.totalExpensesBs > 0 ? item.amountBs / analytics.totalExpensesBs : 0;
    const dash = fraction * donutCircumference;
    const offset = -cumulativeFraction * donutCircumference;
    cumulativeFraction += fraction;
    return { ...item, dash, offset };
  });

  const waterfallBase = Math.max(1, analytics.revenueBs);
  const waterfallSteps = [
    {
      label: 'Ingresos por ventas',
      amountBs: analytics.revenueBs,
      pct: analytics.revenueBs > 0 ? 100 : 0,
      barColor: '#14171A',
      textColor: 'text-[#14171A]',
    },
    {
      label: '− Costo de mercadería',
      amountBs: analytics.cogsBs,
      pct: analytics.revenueBs > 0 ? (analytics.cogsBs / waterfallBase) * 100 : 0,
      barColor: '#6B7280',
      textColor: 'text-[#434B53]',
    },
    {
      label: '= Utilidad bruta',
      amountBs: analytics.grossProfitBs,
      pct: analytics.revenueBs > 0 ? Math.max(0, (analytics.grossProfitBs / waterfallBase) * 100) : 0,
      barColor: '#C95B06',
      textColor: 'text-[#8A3A00]',
    },
    {
      label: '− Gastos fijos (Alquiler, sueldos, servicios)',
      amountBs: analytics.fixedExpensesBs,
      pct: analytics.revenueBs > 0 ? Math.min(100, (analytics.fixedExpensesBs / waterfallBase) * 100) : 0,
      barColor: '#1E293B',
      textColor: 'text-[#1E293B]',
    },
    {
      label: '− Gastos variables (Fletes, mantenimientos)',
      amountBs: analytics.variableExpensesBs,
      pct: analytics.revenueBs > 0 ? Math.min(100, (analytics.variableExpensesBs / waterfallBase) * 100) : 0,
      barColor: '#D97706',
      textColor: 'text-[#8A3A00]',
    },
    {
      label: '= Utilidad neta real',
      amountBs: analytics.netProfitBs,
      pct: analytics.revenueBs > 0 ? Math.max(0, (analytics.netProfitBs / waterfallBase) * 100) : 0,
      barColor: analytics.netProfitBs >= 0 ? '#166534' : '#991B1B',
      textColor: analytics.netProfitBs >= 0 ? 'text-[#166534]' : 'text-[#991B1B]',
    },
  ];

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 border-b border-[#D6D6CD] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#14171A] sm:text-3xl">
            Reportes Gerenciales y Kardex
          </h1>
          <p className="mt-1 text-sm text-[#5B636B]">
            Indicadores visuales de rentabilidad, estructura de gastos, categorías y auditoría de stock.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Reportes"
          className="inline-flex flex-wrap gap-1 rounded-lg border border-[#D6D6CD] bg-[#EAEAE3] p-1"
        >
          {(
            [
              { id: 'balance', label: 'Balance Neto', icon: TrendingUp },
              { id: 'stagnant', label: `Capital Parado (${stagnantItems.length})`, icon: Timer },
              { id: 'kardex', label: 'Kardex', icon: History },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`btn-press inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold ${
                  active ? 'bg-[#14171A] text-white' : 'text-[#434B53] hover:text-[#14171A]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'balance' ? (
        <div className="mt-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex flex-wrap rounded-lg border border-[#D6D6CD] bg-white p-1">
                {(
                  [
                    { id: '7d', label: '7 días' },
                    { id: '30d', label: '30 días' },
                    { id: '90d', label: '3 meses' },
                    { id: '365d', label: '1 año' },
                    { id: 'all', label: 'Todo' },
                    { id: 'custom', label: 'Rango fechas' },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriod(p.id)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                      period === p.id ? 'bg-[#14171A] text-white' : 'text-[#434B53] hover:text-[#14171A]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {period === 'custom' ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    aria-label="Reporte desde"
                    className="tabular-nums h-9 rounded-lg border border-[#D6D6CD] bg-white px-2.5 text-xs text-[#14171A]"
                  />
                  <span className="text-xs text-[#5B636B]">a</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    aria-label="Reporte hasta"
                    className="tabular-nums h-9 rounded-lg border border-[#D6D6CD] bg-white px-2.5 text-xs text-[#14171A]"
                  />
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleExportBalanceCsv}
              className="btn-press inline-flex h-10 items-center gap-2 rounded-lg border border-[#D6D6CD] bg-white px-3.5 text-xs font-semibold text-[#14171A] hover:border-[#14171A]"
            >
              <Download className="h-4 w-4 text-[#C95B06]" />
              Exportar CSV / Excel
            </button>
          </div>

          {/* 4 Executive Metrics */}
          <section className="grid grid-cols-1 divide-y divide-[#D6D6CD] rounded-xl border border-[#D6D6CD] bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
            <div className="p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                Ingresos por ventas
              </div>
              <div className="tabular-nums mt-1.5 font-display text-2xl font-bold text-[#14171A]">
                {formatBs(analytics.revenueBs)}
              </div>
              <div className="tabular-nums mt-1 text-xs text-[#5B636B]">
                {analytics.salesCount} op. · Ticket prom. {formatBs(analytics.avgTicketBs)}
              </div>
            </div>

            <div className="p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                Costo de mercadería
              </div>
              <div className="tabular-nums mt-1.5 font-display text-2xl font-bold text-[#14171A]">
                {formatBs(analytics.cogsBs)}
              </div>
              <div className="tabular-nums mt-1 text-xs text-[#5B636B]">
                Utilidad bruta: {formatBs(analytics.grossProfitBs)} ({analytics.grossMarginPct.toFixed(1)}%)
              </div>
            </div>

            <div className="p-5 sm:border-t sm:border-[#D6D6CD] xl:border-t-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                Gastos operativos
              </div>
              <div className="tabular-nums mt-1.5 font-display text-2xl font-bold text-[#14171A]">
                {formatBs(analytics.totalExpensesBs)}
              </div>
              <div className="tabular-nums mt-1 text-xs text-[#5B636B]">
                Fijos: {formatBs(analytics.fixedExpensesBs)} · Var.: {formatBs(analytics.variableExpensesBs)}
              </div>
            </div>

            <div className="p-5 sm:border-t sm:border-[#D6D6CD] xl:border-t-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#8A3A00]">
                Utilidad neta real
              </div>
              <div
                className={`tabular-nums mt-1.5 font-display text-2xl font-bold ${
                  analytics.netProfitBs >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'
                }`}
              >
                {formatBs(analytics.netProfitBs)}
              </div>
              <div className="tabular-nums mt-1 text-xs text-[#5B636B]">
                Margen neto: {analytics.netMarginPct.toFixed(1)}% · Ingresos − Costos − Gastos
              </div>
            </div>
          </section>

          {analytics.fiscalReserveTotalBs > 0 || analytics.invoicedNominalBs > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#F3C898] bg-[#FEF2E4] px-4 py-3 text-xs text-[#434B53]">
              <div>
                <strong className="text-[#8A3A00]">Separación Fiscal (Vista N4):</strong>{' '}
                La utilidad neta excluye la provisión de impuestos para no inflar ganancias reales.
              </div>
              <div className="tabular-nums flex flex-wrap gap-4 font-semibold text-[#14171A]">
                <span>Cobrado en caja: {formatBs(analytics.collectedTotalBs)}</span>
                <span className="text-[#8A3A00]">
                  Fondo SIN reservado: {formatBs(analytics.fiscalReserveTotalBs)}
                </span>
                <span>Facturado nominal: {formatBs(analytics.invoicedNominalBs)}</span>
              </div>
            </div>
          ) : null}

          {/* Row 1: Daily Revenue vs Costs/Expenses Bar Chart + Profitability Waterfall */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <section className="rounded-xl border border-[#D6D6CD] bg-white p-5 xl:col-span-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#14171A]">
                    Ingresos vs. Costos y Gastos por día
                  </h2>
                  <p className="text-xs text-[#5B636B]">
                    Compara facturación diaria frente a costo de reposición y gastos operativos.
                  </p>
                </div>

                {activeDayDetail ? (
                  <div className="rounded-lg border border-[#EAEAE3] bg-[#F8F8F5] px-3 py-1.5 text-right">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-[#5B636B]">
                      {activeDayDetail.label} · {activeDayDetail.salesCount} venta(s)
                    </div>
                    <div className="tabular-nums text-xs font-bold text-[#14171A]">
                      Ing: {formatBs(activeDayDetail.revenueBs)} · Egr: {formatBs(activeDayDetail.outflowBs)}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#434B53]">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#14171A]" />
                  Ingresos por ventas
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#C95B06]" />
                  Costos + Gastos
                </span>
              </div>

              {analytics.dailySeries.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#5B636B]">
                  No hay movimientos registrados en este período.
                </div>
              ) : (
                <div className="mt-5 overflow-x-auto pb-1">
                  <div
                    className="grid min-w-[420px] gap-2 sm:min-w-0 sm:gap-3"
                    style={{ gridTemplateColumns: `repeat(${analytics.dailySeries.length}, minmax(0, 1fr))` }}
                  >
                    {analytics.dailySeries.map((day) => {
                      const revPct =
                        day.revenueBs > 0
                          ? Math.max(8, Math.round((day.revenueBs / maxDailyChartValue) * 100))
                          : 3;
                      const outPct =
                        day.outflowBs > 0
                          ? Math.max(8, Math.round((day.outflowBs / maxDailyChartValue) * 100))
                          : 3;
                      const focused = activeDayDetail?.dateKey === day.dateKey;

                      return (
                        <button
                          key={day.dateKey}
                          type="button"
                          onMouseEnter={() => setHoveredDayKey(day.dateKey)}
                          onFocus={() => setHoveredDayKey(day.dateKey)}
                          aria-label={`${day.label}: Ingresos ${formatBs(day.revenueBs)}, Costos y gastos ${formatBs(day.outflowBs)}`}
                          className={`group flex flex-col items-center rounded-lg px-1 py-1.5 focus-visible:outline-2 focus-visible:outline-[#14171A] ${
                            focused ? 'bg-[#F8F8F5]' : ''
                          }`}
                        >
                          <div className="tabular-nums text-[10px] font-semibold text-[#5B636B]">
                            {day.revenueBs > 0 ? formatCompactAmount(day.revenueBs) : '—'}
                          </div>
                          <div className="mt-1.5 flex h-36 w-full items-end justify-center gap-1">
                            <div
                              className={`w-2.5 rounded-t sm:w-3.5 ${
                                day.revenueBs > 0 ? 'bg-[#14171A]' : 'bg-[#EAEAE3]'
                              }`}
                              style={{ height: `${revPct}%` }}
                            />
                            <div
                              className={`w-2.5 rounded-t sm:w-3.5 ${
                                day.outflowBs > 0 ? 'bg-[#C95B06]' : 'bg-[#EAEAE3]'
                              }`}
                              style={{ height: `${outPct}%` }}
                            />
                          </div>
                          <div className="mt-2 truncate text-[11px] font-semibold text-[#434B53]">
                            {day.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* Waterfall Profitability */}
            <section className="rounded-xl border border-[#D6D6CD] bg-white p-5 xl:col-span-5">
              <h2 className="font-display text-lg font-bold text-[#14171A]">
                Cascada de Rentabilidad
              </h2>
              <p className="text-xs text-[#5B636B]">
                Cómo se distribuye cada Boliviano facturado hasta llegar a la utilidad neta.
              </p>

              <div className="mt-5 space-y-3.5">
                {waterfallSteps.map((step) => (
                  <div key={step.label}>
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#14171A]">{step.label}</span>
                      <div className="tabular-nums flex items-baseline gap-2">
                        <span className={`font-bold ${step.textColor}`}>
                          {formatBs(step.amountBs)}
                        </span>
                        <span className="w-11 text-right text-[11px] text-[#5B636B]">
                          {step.pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#F3F3EF]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(step.amountBs > 0 ? 4 : 0, Math.min(100, step.pct))}%`,
                          backgroundColor: step.barColor,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                className={`mt-4 rounded-lg border px-3 py-2 text-xs ${
                  analytics.grossProfitBs >= analytics.fixedExpensesBs
                    ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]'
                    : 'border-[#F3C898] bg-[#FEF2E4] text-[#8A3A00]'
                }`}
              >
                <strong>Punto de equilibrio (Gastos Fijos):</strong>{' '}
                {analytics.grossProfitBs >= analytics.fixedExpensesBs
                  ? `Cubierto al 100% — excedente de ${formatBs(analytics.grossProfitBs - analytics.fixedExpensesBs)} sobre gastos fijos.`
                  : `Faltan ${formatBs(analytics.fixedExpensesBs - analytics.grossProfitBs)} de utilidad bruta para cubrir los gastos fijos del período.`}
              </div>
            </section>
          </div>

          {/* Row 2: Expenses Donut + Payment Methods & Quote Funnel */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Donut SVG Expenses */}
            <section className="rounded-xl border border-[#D6D6CD] bg-white p-5 lg:col-span-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#14171A]">
                    Estructura de Gastos Operativos
                  </h2>
                  <p className="text-xs text-[#5B636B]">
                    Participación porcentual por rubro de gasto en el período.
                  </p>
                </div>
                <PieChart className="h-4 w-4 text-[#5B636B]" />
              </div>

              {analytics.expenseList.length === 0 ? (
                <p className="mt-6 text-sm text-[#5B636B]">Sin gastos registrados en el período.</p>
              ) : (
                <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
                  <div className="relative h-44 w-44 shrink-0">
                    <svg
                      viewBox="0 0 180 180"
                      className="h-full w-full -rotate-90"
                      role="img"
                      aria-label={`Distribución de gastos operativos por ${formatBs(analytics.totalExpensesBs)}`}
                    >
                      <circle
                        cx="90"
                        cy="90"
                        r={donutRadius}
                        fill="none"
                        stroke="#F3F3EF"
                        strokeWidth="22"
                      />
                      {donutSegments.map((seg) => (
                        <circle
                          key={seg.category}
                          cx="90"
                          cy="90"
                          r={donutRadius}
                          fill="none"
                          stroke={seg.color}
                          strokeWidth={hoveredExpenseCat === seg.category ? '26' : '22'}
                          strokeDasharray={`${seg.dash} ${donutCircumference}`}
                          strokeDashoffset={seg.offset}
                          onMouseEnter={() => setHoveredExpenseCat(seg.category)}
                          onMouseLeave={() => setHoveredExpenseCat(null)}
                          className="cursor-pointer"
                        />
                      ))}
                    </svg>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#5B636B]">
                        Total gastos
                      </span>
                      <span className="tabular-nums font-display text-base font-bold text-[#14171A]">
                        {formatBs(analytics.totalExpensesBs)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full flex-1 space-y-2.5">
                    {analytics.expenseList.map((e) => (
                      <div
                        key={e.category}
                        onMouseEnter={() => setHoveredExpenseCat(e.category)}
                        onMouseLeave={() => setHoveredExpenseCat(null)}
                        className={`rounded-lg border px-3 py-2 ${
                          hoveredExpenseCat === e.category
                            ? 'border-[#14171A] bg-[#F8F8F5]'
                            : 'border-[#EAEAE3] bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="inline-flex items-center gap-2 font-semibold text-[#14171A]">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-sm"
                              style={{ backgroundColor: e.color }}
                            />
                            {e.category}
                          </span>
                          <span className="tabular-nums font-bold text-[#14171A]">
                            {formatBs(e.amountBs)}{' '}
                            <span className="font-normal text-[#5B636B]">
                              ({e.pct.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Payment Mix & Proforma Conversion */}
            <section className="flex flex-col justify-between rounded-xl border border-[#D6D6CD] bg-white p-5 lg:col-span-6">
              <div>
                <h2 className="font-display text-lg font-bold text-[#14171A]">
                  Mix de Cobros y Efectividad de Proformas
                </h2>
                <p className="text-xs text-[#5B636B]">
                  Desglose real por medio de pago (incluyendo pagos mixtos) y cierre comercial.
                </p>

                <div className="mt-4 space-y-3">
                  {analytics.paymentList.map((pm) => (
                    <div key={pm.method}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#14171A]">{pm.method}</span>
                        <span className="tabular-nums font-bold text-[#14171A]">
                          {formatBs(pm.amountBs)}{' '}
                          <span className="font-normal text-[#5B636B]">
                            ({pm.pct.toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#F3F3EF]">
                        <div
                          className="h-full rounded-full bg-[#14171A]"
                          style={{
                            width: `${pm.amountBs > 0 ? Math.max(3, pm.pct) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 rounded-lg border border-[#EAEAE3] bg-[#F8F8F5] p-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase text-[#5B636B]">
                    Proformas
                  </div>
                  <div className="tabular-nums mt-0.5 font-display text-base font-bold text-[#14171A]">
                    {analytics.periodQuotesCount} emitidas
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase text-[#5B636B]">
                    Conversión
                  </div>
                  <div className="tabular-nums mt-0.5 font-display text-base font-bold text-[#166534]">
                    {analytics.quoteConversionPct.toFixed(0)}% ({analytics.convertedQuotesCount})
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase text-[#5B636B]">
                    Por cerrar
                  </div>
                  <div className="tabular-nums mt-0.5 font-display text-base font-bold text-[#8A3A00]">
                    {formatBs(analytics.openQuotesValueBs)}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Row 3: Category Performance + Top 5 Machines */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <section className="rounded-xl border border-[#D6D6CD] bg-white p-5 lg:col-span-6">
              <h2 className="font-display text-lg font-bold text-[#14171A]">
                Rentabilidad por Línea de Maquinaria
              </h2>
              <p className="text-xs text-[#5B636B]">
                Facturación, volumen y margen bruto por categoría vendida.
              </p>

              {analytics.categoryRanking.length === 0 ? (
                <p className="mt-6 text-sm text-[#5B636B]">Sin ventas registradas en este período.</p>
              ) : (
                <div className="mt-4 space-y-3.5">
                  {analytics.categoryRanking.map((c) => {
                    const widthPct = Math.max(6, (c.revenueBs / maxCatRevenue) * 100);
                    return (
                      <div key={c.category}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                          <span className="font-semibold text-[#14171A]">
                            {c.category}{' '}
                            <span className="font-normal text-[#5B636B]">· {c.units} u.</span>
                          </span>
                          <span className="tabular-nums font-bold text-[#14171A]">
                            {formatBs(c.revenueBs)}{' '}
                            <span className="font-semibold text-[#166534]">
                              (+{formatBs(c.profitBs)} · {c.marginPct.toFixed(0)}%)
                            </span>
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#F3F3EF]">
                          <div
                            className="h-full rounded-full bg-[#C95B06]"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-[#D6D6CD] bg-white p-5 lg:col-span-6">
              <h2 className="font-display text-lg font-bold text-[#14171A]">
                Top 5 Equipos más Rentables del Período
              </h2>
              <p className="text-xs text-[#5B636B]">
                Equipos con mayor facturación y utilidad bruta generada.
              </p>

              {analytics.topProducts.length === 0 ? (
                <p className="mt-6 text-sm text-[#5B636B]">Sin ventas registradas en este período.</p>
              ) : (
                <div className="mt-4 divide-y divide-[#EAEAE3] rounded-lg border border-[#D6D6CD]">
                  {analytics.topProducts.map((p, idx) => (
                    <div
                      key={p.sku}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums font-mono text-[11px] font-bold text-[#8A3A00]">
                            #{idx + 1}
                          </span>
                          <span className="font-mono text-[11px] text-[#5B636B]">{p.sku}</span>
                          <span className="tabular-nums rounded bg-[#F3F3EF] px-1.5 py-0.5 text-[10px] font-semibold text-[#434B53]">
                            {p.units} u.
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-sm font-semibold text-[#14171A]">
                          {p.name}
                        </div>
                      </div>
                      <div className="tabular-nums shrink-0 text-right">
                        <div className="font-bold text-[#14171A]">{formatBs(p.revenueBs)}</div>
                        <div className="text-[11px] font-semibold text-[#166534]">
                          +{formatBs(p.profitBs)} ({p.marginPct.toFixed(0)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}

      {tab === 'stagnant' ? (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#F3C898] bg-[#FEF2E4] p-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#C95B06]" />
              <div>
                <div className="font-display text-base font-bold text-[#14171A]">
                  Capital inmovilizado sin rotación (+60 días sin ventas)
                </div>
                <p className="text-xs text-[#434B53]">
                  Equipos con existencias detenidas. Ideales para armar combos o liquidación por WhatsApp.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <div className="text-[11px] font-semibold uppercase text-[#8A3A00]">
                  Capital parado (costo)
                </div>
                <div className="tabular-nums font-display text-xl font-bold text-[#14171A]">
                  {formatBs(stagnantSummary.totalCost)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-semibold uppercase text-[#5B636B]">
                  Recuperable (venta)
                </div>
                <div className="tabular-nums font-display text-xl font-bold text-[#166534]">
                  {formatBs(stagnantSummary.potentialTotal)}
                </div>
              </div>
            </div>
          </div>

          {stagnantSummary.totalCost > 0 ? (
            <div className="rounded-xl border border-[#D6D6CD] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#14171A]">
                  Distribución por antigüedad sin venta
                </span>
                <div className="tabular-nums flex items-center gap-4 text-[#434B53]">
                  <span>
                    <strong className="text-[#8A3A00]">60–89 días:</strong>{' '}
                    {formatBs(stagnantSummary.cost60to89)}
                  </span>
                  <span>
                    <strong className="text-[#991B1B]">90+ días (crítico):</strong>{' '}
                    {formatBs(stagnantSummary.cost90Plus)}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 flex h-3 w-full overflow-hidden rounded-full bg-[#EAEAE3]">
                <div
                  className="h-full bg-[#C95B06]"
                  style={{ width: `${100 - stagnantSummary.pct90Plus}%` }}
                  title="60–89 días"
                />
                <div
                  className="h-full bg-[#991B1B]"
                  style={{ width: `${stagnantSummary.pct90Plus}%` }}
                  title="90+ días"
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            {stagnantItems.map(({ item, stock, days, costLockedBs, priceBs }) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-[#D6D6CD] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`tabular-nums rounded px-2 py-0.5 text-xs font-bold ${
                        days >= 90
                          ? 'bg-[#FEE2E2] text-[#991B1B]'
                          : 'bg-[#FEF2E4] text-[#8A3A00]'
                      }`}
                    >
                      {days} días sin rotación
                    </span>
                    <span className="font-mono text-xs text-[#5B636B]">{item.sku}</span>
                  </div>
                  <div className="mt-1 font-display text-base font-bold text-[#14171A]">
                    {item.name}
                  </div>
                  <div className="tabular-nums mt-0.5 text-xs text-[#5B636B]">
                    {stock} u. en bodega · Última venta: {formatDateShort(item.lastSoldAt)} · Costo inmovilizado: <strong className="text-[#14171A]">{formatBs(costLockedBs)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyPromoWhatsApp(item.name, item.sku, priceBs)}
                  className="btn-press inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3.5 text-xs font-semibold text-[#14171A] hover:border-[#14171A]"
                >
                  <MessageCircle className="h-4 w-4 text-[#C95B06]" />
                  Copiar promo WhatsApp
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'kardex' ? (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-xl border border-[#D6D6CD] bg-white px-4 py-3.5">
              <div>
                <div className="text-[11px] font-semibold uppercase text-[#5B636B]">
                  Entradas registradas
                </div>
                <div className="tabular-nums mt-0.5 font-display text-xl font-bold text-[#166534]">
                  +{kardexSummary.entriesUnits} u.
                </div>
              </div>
              <ArrowDownLeft className="h-5 w-5 text-[#166534]" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#D6D6CD] bg-white px-4 py-3.5">
              <div>
                <div className="text-[11px] font-semibold uppercase text-[#5B636B]">
                  Salidas por ventas
                </div>
                <div className="tabular-nums mt-0.5 font-display text-xl font-bold text-[#8A3A00]">
                  −{kardexSummary.salesUnits} u.
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-[#C95B06]" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#D6D6CD] bg-white px-4 py-3.5">
              <div>
                <div className="text-[11px] font-semibold uppercase text-[#5B636B]">
                  Ajustes / Total eventos
                </div>
                <div className="tabular-nums mt-0.5 font-display text-xl font-bold text-[#14171A]">
                  {kardexSummary.manualEvents} / {kardexSummary.totalEvents}
                </div>
              </div>
              <SlidersHorizontal className="h-5 w-5 text-[#5B636B]" />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-[#D6D6CD] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {(['all', 'Ingreso compra', 'Salida venta', 'Ajuste manual'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setKardexFilter(type);
                      setKardexPage(1);
                    }}
                    className={`btn-press h-8 rounded-lg border px-2.5 text-xs font-semibold ${
                      kardexFilter === type
                        ? 'border-[#14171A] bg-[#14171A] text-white'
                        : 'border-[#D6D6CD] bg-[#F8F8F5] text-[#434B53]'
                    }`}
                  >
                    {type === 'all' ? 'Todos' : type}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: 'Todo' },
                    { id: '7d', label: '7 días' },
                    { id: '90d', label: '3 meses' },
                    { id: '365d', label: '1 año' },
                    { id: 'custom', label: 'Rango' },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setKardexPeriod(p.id);
                      setKardexPage(1);
                    }}
                    className={`h-8 rounded-lg border px-2.5 text-xs font-semibold ${
                      kardexPeriod === p.id
                        ? 'border-[#14171A] bg-[#14171A] text-white'
                        : 'border-[#D6D6CD] bg-[#F8F8F5] text-[#434B53]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                {kardexPeriod === 'custom' ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="date"
                      value={kardexFrom}
                      onChange={(e) => {
                        setKardexFrom(e.target.value);
                        setKardexPage(1);
                      }}
                      aria-label="Kardex desde"
                      className="tabular-nums h-8 rounded border border-[#D6D6CD] bg-white px-2 text-xs"
                    />
                    <input
                      type="date"
                      value={kardexTo}
                      onChange={(e) => {
                        setKardexTo(e.target.value);
                        setKardexPage(1);
                      }}
                      aria-label="Kardex hasta"
                      className="tabular-nums h-8 rounded border border-[#D6D6CD] bg-white px-2 text-xs"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-[#EAEAE3] pt-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5B636B]" />
                <input
                  type="search"
                  value={kardexQuery}
                  onChange={(e) => {
                    setKardexQuery(e.target.value);
                    setKardexPage(1);
                  }}
                  placeholder="Filtrar SKU, equipo o referencia..."
                  aria-label="Filtrar movimientos del Kardex"
                  className="h-9 w-full rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] pl-8 pr-3 text-xs text-[#14171A] placeholder:text-[#5B636B] focus:border-[#14171A] focus:bg-white focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleExportKardexCsv}
                className="btn-press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#D6D6CD] bg-white px-3 text-xs font-semibold text-[#14171A] hover:border-[#14171A]"
              >
                <Download className="h-3.5 w-3.5 text-[#C95B06]" />
                CSV
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#D6D6CD] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#D6D6CD] bg-[#F8F8F5] text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                    <th className="px-4 py-3">Fecha y Hora</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Equipo / Detalle</th>
                    <th className="px-4 py-3">Ref. / Usuario</th>
                    <th className="px-4 py-3 text-right">Movimiento</th>
                    <th className="px-4 py-3 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAE3]">
                  {paginatedKardex.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#5B636B]">
                        No hay movimientos en el rango seleccionado.
                      </td>
                    </tr>
                  ) : (
                    paginatedKardex.map((k) => (
                    <tr key={k.id} className="hover:bg-[#F8F8F5]">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[#5B636B]">
                        {formatDateTime(k.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-semibold ${
                            k.type === 'Ingreso compra'
                              ? 'bg-[#DCFCE7] text-[#166534]'
                              : k.type === 'Salida venta'
                                ? 'bg-[#FEF2E4] text-[#8A3A00]'
                                : 'bg-[#EAEAE3] text-[#434B53]'
                          }`}
                        >
                          {k.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#14171A]">
                          <span className="font-mono text-xs text-[#5B636B]">{k.sku}</span> · {k.itemName}
                        </div>
                        <div className="text-xs text-[#5B636B]">{k.detail}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs">
                        <span className="font-mono font-bold text-[#14171A]">{k.reference}</span>
                        <div className="text-[#5B636B]">Por: {k.actorLabel}</div>
                      </td>
                      <td
                        className={`tabular-nums whitespace-nowrap px-4 py-3 text-right font-bold ${
                          k.delta > 0 ? 'text-[#166534]' : 'text-[#991B1B]'
                        }`}
                      >
                        {k.delta > 0 ? `+${k.delta}` : k.delta}
                      </td>
                      <td className="tabular-nums whitespace-nowrap px-4 py-3 text-right font-semibold text-[#14171A]">
                        {k.balanceAfter} u.
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#D6D6CD] bg-white px-4 py-3 text-xs">
            <span className="tabular-nums text-[#5B636B]">
              Mostrando {filteredKardex.length === 0 ? 0 : (safeKardexPage - 1) * KARDEX_PAGE_SIZE + 1}–
              {Math.min(safeKardexPage * KARDEX_PAGE_SIZE, filteredKardex.length)} de{' '}
              <strong className="text-[#14171A]">{filteredKardex.length}</strong> movimientos
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safeKardexPage <= 1}
                onClick={() => setKardexPage((p) => Math.max(1, p - 1))}
                className="btn-press inline-flex h-8 items-center gap-1 rounded-md border border-[#D6D6CD] bg-[#F8F8F5] px-2.5 font-semibold text-[#14171A] disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </button>
              <span className="tabular-nums px-2 font-semibold text-[#14171A]">
                Pág. {safeKardexPage} / {kardexTotalPages}
              </span>
              <button
                type="button"
                disabled={safeKardexPage >= kardexTotalPages}
                onClick={() => setKardexPage((p) => Math.min(kardexTotalPages, p + 1))}
                className="btn-press inline-flex h-8 items-center gap-1 rounded-md border border-[#D6D6CD] bg-[#F8F8F5] px-2.5 font-semibold text-[#14171A] disabled:opacity-40"
              >
                Siguiente
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
