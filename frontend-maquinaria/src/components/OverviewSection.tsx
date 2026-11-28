import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  PackagePlus,
  Plus,
  Receipt,
  ShoppingCart,
  Timer,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../state/StoreContext';
import type {
  AppSection,
  DailyRevenuePoint,
  MachineItem,
  PurchaseOrder,
  SaleRecord,
} from '../types/store';
import {
  formatBs,
  formatDateShort,
  formatDateTime,
  getDaysSince,
  getItemStockValueCostBs,
  getItemStockValueSaleBs,
  getStockLevel,
  getTotalStock,
  isSameLocalDay,
} from '../utils/formatters';
import { Drawer } from './Drawer';

interface OverviewSectionProps {
  onNavigate: (section: AppSection) => void;
  onOpenNewMachine: () => void;
  onRequestRestock: (item: MachineItem) => void;
}

export function OverviewSection({
  onNavigate,
  onOpenNewMachine,
  onRequestRestock,
}: OverviewSectionProps) {
  const {
    role,
    exchangeRate,
    inventory,
    sales,
    orders,
    expenses,
    suppliers,
    hasPermission,
    advanceOrderStatus,
  } = useStore();
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [hoveredDayKey, setHoveredDayKey] = useState<string | null>(null);

  const supplierById = useMemo(
    () => new Map(suppliers.map((s) => [s.id, s])),
    [suppliers]
  );

  const metrics = useMemo(() => {
    const today = new Date();
    let todaySalesBs = 0;
    let todaySalesCount = 0;
    for (const s of sales) {
      if (isSameLocalDay(s.createdAt, today)) {
        todaySalesBs += s.totalBs;
        todaySalesCount += 1;
      }
    }

    let todayExpensesBs = 0;
    for (const exp of expenses) {
      if (isSameLocalDay(exp.date, today)) {
        todayExpensesBs += exp.amountBs;
      }
    }

    let stockSaleBs = 0;
    let stockCostBs = 0;
    let totalUnits = 0;
    const alerts: MachineItem[] = [];
    let outCount = 0;
    let stagnantCount = 0;

    for (const item of inventory) {
      const qty = getTotalStock(item);
      stockSaleBs += getItemStockValueSaleBs(item, exchangeRate);
      stockCostBs += getItemStockValueCostBs(item);
      totalUnits += qty;
      const level = getStockLevel(item);
      if (level !== 'ok') {
        alerts.push(item);
        if (level === 'out') outCount += 1;
      }
      if (qty > 0 && getDaysSince(item.lastSoldAt, today) >= 60) {
        stagnantCount += 1;
      }
    }

    alerts.sort((a, b) => getTotalStock(a) - getTotalStock(b));

    const activeOrders = orders.filter((o) => o.status !== 'Recibida');
    const activeOrdersBs = activeOrders.reduce((sum, o) => sum + o.totalBs, 0);

    return {
      todaySalesBs,
      todaySalesCount,
      todayExpensesBs,
      stockSaleBs,
      stockCostBs,
      totalUnits,
      alerts,
      outCount,
      stagnantCount,
      activeOrders,
      activeOrdersBs,
    };
  }, [inventory, sales, orders, expenses, exchangeRate]);

  const weeklySeries = useMemo<DailyRevenuePoint[]>(() => {
    const points: DailyRevenuePoint[] = [];
    const byKey = new Map<string, { totalBs: number; count: number }>();

    for (let offset = 6; offset >= 0; offset -= 1) {
      const dt = new Date();
      dt.setHours(0, 0, 0, 0);
      dt.setDate(dt.getDate() - offset);
      const dateKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
        dt.getDate()
      ).padStart(2, '0')}`;
      const label =
        offset === 0
          ? 'Hoy'
          : new Intl.DateTimeFormat('es-BO', { weekday: 'short' })
              .format(dt)
              .replace('.', '');
      points.push({ label, dateKey, totalBs: 0, salesCount: 0 });
      byKey.set(dateKey, { totalBs: 0, count: 0 });
    }

    for (const sale of sales) {
      const dt = new Date(sale.createdAt);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
        dt.getDate()
      ).padStart(2, '0')}`;
      const bucket = byKey.get(key);
      if (bucket) {
        bucket.totalBs += sale.totalBs;
        bucket.count += 1;
      }
    }

    return points.map((p) => {
      const bucket = byKey.get(p.dateKey);
      return {
        ...p,
        totalBs: bucket?.totalBs ?? 0,
        salesCount: bucket?.count ?? 0,
      };
    });
  }, [sales]);

  const maxBarBs = useMemo(
    () => Math.max(1000, ...weeklySeries.map((d) => d.totalBs)),
    [weeklySeries]
  );

  const activePoint = useMemo(() => {
    if (hoveredDayKey) {
      return (
        weeklySeries.find((p) => p.dateKey === hoveredDayKey) ??
        weeklySeries[weeklySeries.length - 1]
      );
    }
    return weeklySeries[weeklySeries.length - 1];
  }, [hoveredDayKey, weeklySeries]);

  const handleQuickReceive = (order: PurchaseOrder) => {
    const { receivedUnits } = advanceOrderStatus(order.id, 'Recibida');
    toast.success(`Orden ${order.orderNumber} recibida`, {
      description: `Se creó el nuevo lote y se sumaron ${receivedUnits} unidades al inventario.`,
    });
  };

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-[#D6D6CD] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#14171A] sm:text-3xl">
            Resumen Operativo de Sucursal
          </h1>
          <p className="mt-1 text-sm text-[#5B636B]">
            Estado en vivo de caja, lotes USD/Bs en almacén y abastecimiento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {hasPermission('manage_inventory') ? (
            <button
              type="button"
              onClick={onOpenNewMachine}
              className="btn-press inline-flex h-10 items-center gap-2 rounded-lg border border-[#D6D6CD] bg-white px-3.5 text-sm font-semibold text-[#14171A] hover:border-[#14171A]"
            >
              <Plus className="h-4 w-4 text-[#5B636B]" />
              Nueva máquina
            </button>
          ) : null}
          {hasPermission('process_sales') ? (
            <button
              type="button"
              data-primary-cta="true"
              onClick={() => onNavigate('ventas')}
              className="btn-press inline-flex h-10 items-center gap-2 rounded-lg bg-[#14171A] px-4 text-sm font-semibold text-white hover:bg-[#272C32]"
            >
              <ShoppingCart className="h-4 w-4 text-[#F59E0B]" />
              Registrar venta
            </button>
          ) : null}
        </div>
      </div>

      {/* Unified Operational Strip */}
      <section
        aria-label="Indicadores principales de la sucursal"
        className="mt-6 grid grid-cols-1 divide-y divide-[#D6D6CD] rounded-xl border border-[#D6D6CD] bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4"
      >
        <div className="p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
            Ventas de hoy
          </div>
          <div className="tabular-nums mt-1.5 font-display text-2xl font-bold text-[#14171A]">
            {formatBs(metrics.todaySalesBs)}
          </div>
          <div className="mt-1 text-xs text-[#5B636B]">
            <span className="tabular-nums font-semibold text-[#14171A]">
              {metrics.todaySalesCount}
            </span>{' '}
            {metrics.todaySalesCount === 1 ? 'operación' : 'operaciones'}
            {role === 'owner' && metrics.todayExpensesBs > 0 ? (
              <> · Gastos hoy: {formatBs(metrics.todayExpensesBs)}</>
            ) : null}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
            {role === 'owner' ? 'Valor inventario (venta)' : 'Unidades en bodega'}
          </div>
          <div className="tabular-nums mt-1.5 font-display text-2xl font-bold text-[#14171A]">
            {role === 'owner' ? formatBs(metrics.stockSaleBs) : `${metrics.totalUnits} u.`}
          </div>
          <div className="tabular-nums mt-1 text-xs text-[#5B636B]">
            {role === 'owner'
              ? `Costo: ${formatBs(metrics.stockCostBs)} · ${metrics.totalUnits} u. · TC ${exchangeRate.toFixed(2)}`
              : `${inventory.length} referencias activas en catálogo`}
          </div>
        </div>

        <div className="p-4 sm:border-t sm:border-[#D6D6CD] sm:p-5 xl:border-t-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
            Equipos con alerta
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="tabular-nums font-display text-2xl font-bold text-[#14171A]">
              {metrics.alerts.length}
            </span>
            {metrics.outCount > 0 ? (
              <span className="rounded bg-[#FEE2E2] px-1.5 py-0.5 text-xs font-semibold text-[#991B1B]">
                {metrics.outCount} agotado{metrics.outCount > 1 ? 's' : ''}
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-[#5B636B]">
            {role === 'owner' && metrics.stagnantCount > 0 ? (
              <button
                type="button"
                onClick={() => onNavigate('reportes')}
                className="inline-flex items-center gap-1 font-semibold text-[#8A3A00] hover:underline"
              >
                <Timer className="h-3 w-3" />
                {metrics.stagnantCount} sin rotación (+60 días)
              </button>
            ) : (
              'Bajo stock mínimo en almacén'
            )}
          </div>
        </div>

        <div className="p-4 sm:border-t sm:border-[#D6D6CD] sm:p-5 xl:border-t-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
            Compras en curso
          </div>
          <div className="tabular-nums mt-1.5 font-display text-2xl font-bold text-[#14171A]">
            {role === 'owner'
              ? formatBs(metrics.activeOrdersBs)
              : `${metrics.activeOrders.length} pedidos`}
          </div>
          <div className="mt-1 text-xs text-[#5B636B]">
            <span className="tabular-nums font-semibold text-[#14171A]">
              {metrics.activeOrders.length}
            </span>{' '}
            {metrics.activeOrders.length === 1 ? 'orden por recibir' : 'órdenes por recibir'}
          </div>
        </div>
      </section>

      {/* Main 2-column Asymmetric Workspace */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left: Revenue Chart + Recent Sales */}
        <div className="space-y-6 xl:col-span-7">
          <section className="rounded-xl border border-[#D6D6CD] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#14171A]">
                  Ingresos de los últimos 7 días
                </h2>
                <p className="text-xs text-[#5B636B]">
                  Pasa el cursor o enfoca una barra para inspeccionar el cierre diario.
                </p>
              </div>
              {activePoint ? (
                <div className="rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3 py-1.5 text-right">
                  <div className="text-[11px] font-semibold uppercase text-[#5B636B]">
                    {activePoint.label} · {activePoint.salesCount}{' '}
                    {activePoint.salesCount === 1 ? 'venta' : 'ventas'}
                  </div>
                  <div className="tabular-nums font-display text-base font-bold text-[#14171A]">
                    {formatBs(activePoint.totalBs)}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5">
              <div
                className="grid h-44 grid-cols-7 items-end gap-2 sm:gap-3"
                role="img"
                aria-label="Gráfica de ventas diarias de los últimos 7 días en Bolivianos"
              >
                {weeklySeries.map((day, idx) => {
                  const ratio = day.totalBs / maxBarBs;
                  const heightPct = day.totalBs === 0 ? 4 : Math.max(10, Math.round(ratio * 100));
                  const isToday = idx === weeklySeries.length - 1;
                  const isSelected = activePoint?.dateKey === day.dateKey;

                  return (
                    <button
                      key={day.dateKey}
                      type="button"
                      onMouseEnter={() => setHoveredDayKey(day.dateKey)}
                      onFocus={() => setHoveredDayKey(day.dateKey)}
                      onMouseLeave={() => setHoveredDayKey(null)}
                      className="group flex h-full flex-col items-center justify-end gap-2 rounded-md px-1 py-1 text-center focus-visible:outline-[#C95B06]"
                    >
                      <span className="tabular-nums text-[11px] font-semibold text-[#5B636B] group-hover:text-[#14171A]">
                        {day.totalBs > 0 ? `${Math.round(day.totalBs / 100) / 10}k` : '0'}
                      </span>
                      <div className="flex h-28 w-full items-end">
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t-md transition-colors duration-150 ${
                            day.totalBs === 0
                              ? 'bg-[#EAEAE3]'
                              : isToday
                                ? 'bg-[#C95B06]'
                                : isSelected
                                  ? 'bg-[#14171A]'
                                  : 'bg-[#2C333A] group-hover:bg-[#14171A]'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium capitalize ${
                          isToday ? 'font-bold text-[#8A3A00]' : 'text-[#5B636B]'
                        }`}
                      >
                        {day.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#D6D6CD] bg-white">
            <div className="flex items-center justify-between border-b border-[#D6D6CD] px-5 py-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#14171A]">
                  Últimas ventas registradas
                </h2>
                <p className="text-xs text-[#5B636B]">
                  Haz clic en cualquier operación para revisar el comprobante y pagos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('ventas')}
                className="btn-press inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#14171A] hover:bg-[#EAEAE3]"
              >
                Ir a Ventas
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {sales.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#5B636B]">
                Todavía no hay ventas registradas en esta sucursal.
              </div>
            ) : (
              <ul className="divide-y divide-[#EAEAE3]">
                {sales.slice(0, 5).map((sale) => {
                  const paySummary =
                    sale.payments.length > 1
                      ? `Mixto (${sale.payments.map((p) => p.method).join(' + ')})`
                      : sale.payments[0]?.method ?? 'Efectivo';

                  return (
                    <li key={sale.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedSale(sale)}
                        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors duration-150 hover:bg-[#F8F8F5]"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="tabular-nums font-mono text-xs font-semibold text-[#434B53]">
                              {sale.receiptNumber}
                            </span>
                            <span className="truncate text-sm font-semibold text-[#14171A]">
                              {sale.customerName}
                            </span>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#5B636B]">
                            <span>{formatDateTime(sale.createdAt)}</span>
                            <span>·</span>
                            <span>{paySummary}</span>
                            <span>·</span>
                            <span className="tabular-nums">
                              {sale.lines.reduce((s, l) => s + l.qty, 0)} art.
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="tabular-nums text-sm font-bold text-[#14171A]">
                            {formatBs(sale.totalBs)}
                          </div>
                          <span className="text-[11px] font-medium text-[#5B636B]">
                            Ver ticket
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Right: Stock Alerts + Pending POs */}
        <div className="space-y-6 xl:col-span-5">
          <section className="rounded-xl border border-[#D6D6CD] bg-white">
            <div className="flex items-center justify-between border-b border-[#D6D6CD] px-5 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#C95B06]" />
                <h2 className="font-display text-lg font-bold text-[#14171A]">
                  Atención en bodega
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('inventario')}
                className="btn-press inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#14171A] hover:bg-[#EAEAE3]"
              >
                Ver inventario
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {metrics.alerts.length === 0 ? (
              <div className="flex items-center gap-2.5 px-5 py-6 text-sm text-[#166534]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Todo el catálogo supera el stock mínimo configurado.
              </div>
            ) : (
              <ul className="divide-y divide-[#EAEAE3]">
                {metrics.alerts.map((item) => {
                  const stock = getTotalStock(item);
                  const isOut = stock <= 0;
                  const supplier = supplierById.get(item.supplierId);
                  return (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                              isOut
                                ? 'bg-[#FEE2E2] text-[#991B1B]'
                                : 'bg-[#FEF2E4] text-[#8A3A00]'
                            }`}
                          >
                            {isOut ? 'Agotado' : 'Stock bajo'}
                          </span>
                          <span className="tabular-nums font-mono text-xs text-[#5B636B]">
                            {item.sku}
                          </span>
                        </div>
                        <div className="mt-1 truncate text-sm font-semibold text-[#14171A]">
                          {item.name}
                        </div>
                        <div className="tabular-nums mt-0.5 text-xs text-[#5B636B]">
                          Actual: <strong className="text-[#14171A]">{stock}</strong> / Mín:{' '}
                          {item.minStock} · {supplier?.name ?? 'Proveedor asignado'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRequestRestock(item)}
                        className="btn-press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3 text-xs font-semibold text-[#14171A] hover:border-[#14171A] hover:bg-white"
                      >
                        <PackagePlus className="h-3.5 w-3.5 text-[#C95B06]" />
                        Pedir
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-[#D6D6CD] bg-white">
            <div className="flex items-center justify-between border-b border-[#D6D6CD] px-5 py-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#434B53]" />
                <h2 className="font-display text-lg font-bold text-[#14171A]">
                  Órdenes por recibir
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('proveedores')}
                className="btn-press inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#14171A] hover:bg-[#EAEAE3]"
              >
                Proveedores
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {metrics.activeOrders.length === 0 ? (
              <div className="px-5 py-6 text-sm text-[#5B636B]">
                No hay órdenes pendientes de ingreso a almacén.
              </div>
            ) : (
              <ul className="divide-y divide-[#EAEAE3]">
                {metrics.activeOrders.map((order) => {
                  const supplier = supplierById.get(order.supplierId);
                  const totalUnits = order.lines.reduce((s, l) => s + l.qty, 0);
                  return (
                    <li
                      key={order.id}
                      className="flex items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums font-mono text-xs font-semibold text-[#14171A]">
                            {order.orderNumber}
                          </span>
                          <span className="rounded bg-[#FEF2E4] px-1.5 py-0.5 text-[11px] font-semibold text-[#8A3A00]">
                            {order.status}
                          </span>
                          <span className="rounded bg-[#EAEAE3] px-1.5 py-0.5 text-[10px] font-bold text-[#434B53]">
                            {order.currency}
                          </span>
                        </div>
                        <div className="mt-1 truncate text-sm font-semibold text-[#14171A]">
                          {supplier?.name ?? 'Proveedor'}
                        </div>
                        <div className="tabular-nums mt-0.5 text-xs text-[#5B636B]">
                          {totalUnits} u.
                          {role === 'owner' ? ` · ${formatBs(order.totalBs)}` : ''} · Llega{' '}
                          {formatDateShort(order.expectedDate)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuickReceive(order)}
                        className="btn-press inline-flex h-9 shrink-0 items-center rounded-lg bg-[#14171A] px-3 text-xs font-semibold text-white hover:bg-[#272C32]"
                      >
                        Recibir
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Sale Inspection Drawer */}
      <Drawer
        open={selectedSale !== null}
        onClose={() => setSelectedSale(null)}
        title={selectedSale ? `Comprobante ${selectedSale.receiptNumber}` : ''}
        subtitle={
          selectedSale
            ? `${selectedSale.customerName} · ${formatDateTime(selectedSale.createdAt)}`
            : undefined
        }
      >
        {selectedSale ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] p-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                Pagos registrados
              </div>
              {selectedSale.payments.map((p, idx) => (
                <div key={`${p.method}-${idx}`} className="flex items-center justify-between text-xs">
                  <span className="text-[#434B53]">{p.method}</span>
                  <span className="tabular-nums font-semibold text-[#14171A]">
                    {formatBs(p.amountBs)}
                  </span>
                </div>
              ))}
              {selectedSale.customerDoc ? (
                <div className="flex items-center justify-between border-t border-[#EAEAE3] pt-2 text-xs text-[#5B636B]">
                  <span>Documento</span>
                  <span className="tabular-nums font-semibold text-[#14171A]">
                    {selectedSale.customerDoc}
                  </span>
                </div>
              ) : null}
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                Detalle de equipos vendidos
              </h3>
              <ul className="mt-2 divide-y divide-[#EAEAE3] rounded-lg border border-[#D6D6CD]">
                {selectedSale.lines.map((line, i) => (
                  <li
                    key={`${selectedSale.id}-${line.itemId}-${i}`}
                    className="flex justify-between gap-3 p-3.5"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-[#5B636B]">
                        {line.sku}
                        {line.batchCode ? ` · Lote ${line.batchCode}` : ''}
                      </div>
                      <div className="text-sm font-semibold text-[#14171A]">{line.name}</div>
                      <div className="tabular-nums mt-0.5 text-xs text-[#5B636B]">
                        {line.qty} × {formatBs(line.unitPriceBs)}
                        {line.serialNumber ? ` · Serie: ${line.serialNumber}` : ''}
                      </div>
                    </div>
                    <div className="tabular-nums shrink-0 text-sm font-bold text-[#14171A]">
                      {formatBs(line.subtotalBs)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 border-t border-[#D6D6CD] pt-4 text-sm">
              {selectedSale.discountBs > 0 ? (
                <div className="flex justify-between text-[#5B636B]">
                  <span>Descuento aplicado</span>
                  <span className="tabular-nums font-medium text-[#14171A]">
                    − {formatBs(selectedSale.discountBs)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-bold text-[#14171A]">
                <span>Total cobrado</span>
                <span className="tabular-nums font-display text-xl">
                  {formatBs(selectedSale.totalBs)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('ventas')}
              className="btn-press inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#D6D6CD] bg-white text-sm font-semibold text-[#14171A] hover:border-[#14171A]"
            >
              <Receipt className="h-4 w-4" />
              Ir al módulo de Ventas
            </button>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
