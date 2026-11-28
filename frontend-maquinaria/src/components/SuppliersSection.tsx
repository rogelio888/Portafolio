import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Mail,
  PackageCheck,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../state/StoreContext';
import type { Category, OrderStatus, PurchaseCurrency } from '../types/store';
import {
  formatBs,
  formatDateShort,
  formatDateWithYear,
  formatUsd,
  getActiveBatch,
  matchesDateRange,
  type DateRangePeriod,
} from '../utils/formatters';
import { DateFilterBar } from './DateFilterBar';
import { Drawer } from './Drawer';
import { PaginationBar } from './PaginationBar';

interface RestockPrefill {
  itemId: string;
  supplierId: string;
}

interface SuppliersSectionProps {
  restockPrefill: RestockPrefill | null;
  onClearRestockPrefill: () => void;
}

interface DraftOrderLine {
  itemId: string;
  qty: number;
  unitCostOriginal: number;
}

export function SuppliersSection({
  restockPrefill,
  onClearRestockPrefill,
}: SuppliersSectionProps) {
  const {
    role,
    exchangeRate,
    suppliers,
    orders,
    inventory,
    productCategories,
    hasPermission,
    createPurchaseOrder,
    advanceOrderStatus,
    addSupplier,
  } = useStore();
  const canManageSuppliers = hasPermission('manage_suppliers');

  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [isSupplierDrawerOpen, setIsSupplierDrawerOpen] = useState(false);

  // Orders filter & pagination
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [orderPeriod, setOrderPeriod] = useState<DateRangePeriod>('all');
  const [orderFrom, setOrderFrom] = useState('');
  const [orderTo, setOrderTo] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const ORDERS_PAGE_SIZE = 8;

  // Order form state
  const [orderSupplierId, setOrderSupplierId] = useState(suppliers[0]?.id ?? '');
  const [orderCurrency, setOrderCurrency] = useState<PurchaseCurrency>('USD');
  const [orderTc, setOrderTc] = useState(String(exchangeRate));
  const [orderShippingAmount, setOrderShippingAmount] = useState('');
  const [orderShippingCurrency, setOrderShippingCurrency] = useState<PurchaseCurrency>('BOB');
  const [orderShippingTc, setOrderShippingTc] = useState(String(exchangeRate));
  const [orderTargetMarginPct, setOrderTargetMarginPct] = useState('30');
  const [orderExpectedDate, setOrderExpectedDate] = useState(() => {
    const dt = new Date();
    dt.setDate(dt.getDate() + 3);
    return dt.toISOString().slice(0, 10);
  });
  const [orderLines, setOrderLines] = useState<DraftOrderLine[]>([]);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Supplier form state
  const [supName, setSupName] = useState('');
  const [supCity, setSupCity] = useState('Santa Cruz');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supLeadDays, setSupLeadDays] = useState('3');
  const [supTerms, setSupTerms] = useState('Crédito 15 días / QR o Efectivo');
  const [supCategory, setSupCategory] = useState<Category>(
    productCategories[0] ?? 'Compresión y Aire'
  );
  const [supError, setSupError] = useState<string | null>(null);

  const supplierById = useMemo(
    () => new Map(suppliers.map((s) => [s.id, s])),
    [suppliers]
  );

  const inventoryById = useMemo(
    () => new Map(inventory.map((it) => [it.id, it])),
    [inventory]
  );

  const filteredOrders = useMemo(() => {
    const q = orderQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) return false;
      if (!matchesDateRange(order.createdAt, orderPeriod, orderFrom, orderTo)) return false;
      if (!q) return true;
      const supplierName = supplierById.get(order.supplierId)?.name.toLowerCase() ?? '';
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        supplierName.includes(q) ||
        order.lines.some((l) => l.name.toLowerCase().includes(q) || l.sku.toLowerCase().includes(q))
      );
    });
  }, [orders, orderQuery, orderStatusFilter, orderPeriod, orderFrom, orderTo, supplierById]);

  const orderTotalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PAGE_SIZE));
  const safeOrderPage = Math.min(orderPage, orderTotalPages);
  const paginatedOrders = useMemo(() => {
    const start = (safeOrderPage - 1) * ORDERS_PAGE_SIZE;
    return filteredOrders.slice(start, start + ORDERS_PAGE_SIZE);
  }, [filteredOrders, safeOrderPage]);

  useEffect(() => {
    if (!restockPrefill) return;
    const item = inventoryById.get(restockPrefill.itemId);
    const chosenSupplier = restockPrefill.supplierId || suppliers[0]?.id || '';
    const supplier = supplierById.get(chosenSupplier);

    setOrderSupplierId(chosenSupplier);
    setOrderTc(String(exchangeRate));
    setOrderShippingTc(String(exchangeRate));
    if (supplier) {
      const dt = new Date();
      dt.setDate(dt.getDate() + supplier.leadTimeDays);
      setOrderExpectedDate(dt.toISOString().slice(0, 10));
    }
    if (item) {
      const active = getActiveBatch(item);
      const cur = active?.currency ?? 'USD';
      setOrderCurrency(cur);
      const currentStock = item.batches.reduce((s, b) => s + b.remainingQty, 0);
      const suggestedQty = Math.max(2, item.minStock * 2 - currentStock);
      setOrderLines([
        {
          itemId: item.id,
          qty: suggestedQty,
          unitCostOriginal: active?.unitCostOriginal ?? 100,
        },
      ]);
    }
    setOrderError(null);
    setIsOrderDrawerOpen(true);
    onClearRestockPrefill();
  }, [restockPrefill, inventoryById, supplierById, suppliers, exchangeRate, onClearRestockPrefill]);

  const openBlankOrderDrawer = (preferredSupplierId?: string) => {
    const sid = preferredSupplierId || suppliers[0]?.id || '';
    const sup = supplierById.get(sid);
    setOrderSupplierId(sid);
    setOrderTc(String(exchangeRate));
    setOrderShippingTc(String(exchangeRate));
    const dt = new Date();
    dt.setDate(dt.getDate() + (sup?.leadTimeDays ?? 3));
    setOrderExpectedDate(dt.toISOString().slice(0, 10));

    const matchingItem =
      inventory.find((it) => it.supplierId === sid) ?? inventory[0];
    const active = matchingItem ? getActiveBatch(matchingItem) : null;
    setOrderCurrency(active?.currency ?? 'USD');
    setOrderLines(
      matchingItem
        ? [
            {
              itemId: matchingItem.id,
              qty: 2,
              unitCostOriginal: active?.unitCostOriginal ?? 100,
            },
          ]
        : []
    );
    setOrderError(null);
    setIsOrderDrawerOpen(true);
  };

  const draftOrderTotalOriginal = useMemo(
    () => orderLines.reduce((sum, l) => sum + l.qty * l.unitCostOriginal, 0),
    [orderLines]
  );

  const draftOrderTc =
    orderCurrency === 'USD' ? Math.max(0.01, Number(orderTc) || exchangeRate) : 1;
  const draftShippingTc =
    orderShippingCurrency === 'USD' ? Math.max(0.01, Number(orderShippingTc) || exchangeRate) : 1;
  const draftOrderRawShipping = Math.max(0, Number(orderShippingAmount) || 0);
  const draftOrderShippingBs =
    draftOrderRawShipping > 0
      ? Math.round(draftOrderRawShipping * draftShippingTc)
      : 0;
  const draftOrderGoodsBs = Math.round(draftOrderTotalOriginal * draftOrderTc);
  const draftOrderTotalBs = draftOrderGoodsBs + draftOrderShippingBs;

  const handleAddOrderLine = () => {
    const fallback =
      inventory.find((it) => !orderLines.some((l) => l.itemId === it.id)) ??
      inventory[0];
    if (!fallback) return;
    const active = getActiveBatch(fallback);
    setOrderLines((prev) => [
      ...prev,
      {
        itemId: fallback.id,
        qty: 1,
        unitCostOriginal: active?.unitCostOriginal ?? 100,
      },
    ]);
  };

  const handleCreateOrder = (e: FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    if (!orderSupplierId) {
      setOrderError('Selecciona un proveedor.');
      return;
    }
    if (orderLines.length === 0) {
      setOrderError('Agrega al menos un equipo a la orden de compra.');
      return;
    }

    const marginPctNum = Number(orderTargetMarginPct);
    const created = createPurchaseOrder({
      supplierId: orderSupplierId,
      expectedDate: orderExpectedDate,
      currency: orderCurrency,
      exchangeRateAtOrder: orderCurrency === 'USD' ? draftOrderTc : 1,
      shippingCostBs: draftOrderShippingBs > 0 ? draftOrderShippingBs : undefined,
      shippingCostOriginal: draftOrderRawShipping > 0 ? draftOrderRawShipping : undefined,
      shippingCurrency: draftOrderRawShipping > 0 ? orderShippingCurrency : undefined,
      shippingExchangeRate:
        draftOrderRawShipping > 0 && orderShippingCurrency === 'USD' ? draftShippingTc : undefined,
      targetMarginPct:
        Number.isFinite(marginPctNum) && marginPctNum > 0 ? marginPctNum : undefined,
      items: orderLines,
    });

    toast.success(`Orden ${created.orderNumber} emitida`, {
      description: `Total ${formatBs(created.totalBs)} · Pendiente.`,
    });
    setOrderShippingAmount('');
    setOrderShippingCurrency('BOB');
    setOrderShippingTc(String(exchangeRate));
    setIsOrderDrawerOpen(false);
  };

  const handleStatusChange = (orderId: string, orderNum: string, next: OrderStatus) => {
    const { receivedUnits } = advanceOrderStatus(orderId, next);
    if (next === 'Recibida') {
      toast.success(`Orden ${orderNum} recibida en almacén`, {
        description: `Se creó un nuevo lote y se sumaron ${receivedUnits} unidades al inventario.`,
      });
    } else {
      toast.info(`Orden ${orderNum} marcada como ${next}`);
    }
  };

  const handleCreateSupplier = (e: FormEvent) => {
    e.preventDefault();
    setSupError(null);
    if (!supName.trim() || !supContact.trim()) {
      setSupError('Ingresa el nombre de la empresa y la persona de contacto.');
      return;
    }

    const created = addSupplier({
      name: supName.trim(),
      city: supCity.trim() || 'La Paz',
      contactName: supContact.trim(),
      phone: supPhone.trim() || '+591 700-00000',
      email: supEmail.trim() || 'contacto@proveedor.example',
      leadTimeDays: Math.max(1, Number.parseInt(supLeadDays || '3', 10)),
      categories: [supCategory],
      paymentTerms: supTerms.trim() || 'Contado / Transferencia',
    });

    toast.success(`Proveedor ${created.name} registrado`);
    setSupName('');
    setSupContact('');
    setSupPhone('');
    setSupEmail('');
    setIsSupplierDrawerOpen(false);
  };

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#D6D6CD] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#14171A] sm:text-3xl">
            Proveedores y Compras
          </h1>
          <p className="mt-1 text-sm text-[#5B636B]">
            Órdenes en USD o Bs; al recibir una orden se crea el lote con su tipo de cambio.
          </p>
        </div>
        {canManageSuppliers ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSupplierDrawerOpen(true)}
              className="btn-press inline-flex h-10 items-center gap-2 rounded-lg border border-[#D6D6CD] bg-white px-3.5 text-sm font-semibold text-[#14171A] hover:border-[#14171A]"
            >
              <Plus className="h-4 w-4 text-[#5B636B]" />
              Nuevo proveedor
            </button>
            <button
              type="button"
              onClick={() => openBlankOrderDrawer()}
              className="btn-press inline-flex h-10 items-center gap-2 rounded-lg bg-[#14171A] px-4 text-sm font-semibold text-white hover:bg-[#272C32]"
            >
              <Truck className="h-4 w-4 text-[#F59E0B]" />
              Nueva orden de compra
            </button>
          </div>
        ) : null}
      </div>

      {/* Purchase Orders Section */}
      <section className="mt-6 space-y-4" aria-label="Órdenes de compra">
        <div className="flex flex-col gap-3 rounded-xl border border-[#D6D6CD] bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="mr-1 font-display text-lg font-bold text-[#14171A]">
                Órdenes de compra ({orders.length})
              </h2>
              {(
                [
                  { id: 'all', label: 'Todas' },
                  { id: 'Pendiente', label: 'Pendientes' },
                  { id: 'En tránsito', label: 'En tránsito' },
                  { id: 'Recibida', label: 'Recibidas' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setOrderStatusFilter(st.id);
                    setOrderPage(1);
                  }}
                  className={`btn-press h-8 rounded-lg border px-2.5 text-xs font-semibold ${
                    orderStatusFilter === st.id
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
                value={orderQuery}
                onChange={(e) => {
                  setOrderQuery(e.target.value);
                  setOrderPage(1);
                }}
                placeholder="Buscar orden, proveedor o equipo..."
                aria-label="Buscar órdenes de compra"
                className="h-9 w-full rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] pl-8 pr-3 text-xs text-[#14171A] placeholder:text-[#5B636B] focus:border-[#14171A] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-[#EAEAE3] pt-3">
            <DateFilterBar
              period={orderPeriod}
              fromDate={orderFrom}
              toDate={orderTo}
              onChangePeriod={(p) => {
                setOrderPeriod(p);
                setOrderPage(1);
              }}
              onChangeFromDate={(d) => {
                setOrderFrom(d);
                setOrderPage(1);
              }}
              onChangeToDate={(d) => {
                setOrderTo(d);
                setOrderPage(1);
              }}
            />
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-xl border border-[#D6D6CD] bg-white md:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#D6D6CD] bg-[#F8F8F5] text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Detalle de reposición</th>
                <th className="px-4 py-3">Fecha / Est.</th>
                <th className="px-4 py-3">Estado</th>
                {role === 'owner' ? <th className="px-4 py-3 text-right">Total</th> : null}
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAE3]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={role === 'owner' ? 7 : 6}
                    className="px-4 py-8 text-center text-sm text-[#5B636B]"
                  >
                    No hay órdenes de compra que coincidan con el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                const supplier = supplierById.get(order.supplierId);
                return (
                  <tr key={order.id} className="hover:bg-[#F8F8F5]">
                    <td className="tabular-nums whitespace-nowrap px-4 py-3.5 font-mono text-xs font-bold text-[#14171A]">
                      <div>{order.orderNumber}</div>
                      <span className="mt-0.5 inline-block rounded bg-[#EAEAE3] px-1.5 py-0.5 font-sans text-[10px] font-bold text-[#434B53]">
                        {order.currency}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[#14171A]">
                        {supplier?.name ?? 'Proveedor'}
                      </div>
                      <div className="text-xs text-[#5B636B]">{supplier?.city}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#434B53]">
                      {order.lines.map((l) => (
                        <div key={`${order.id}-${l.itemId}`} className="tabular-nums">
                          <span className="font-semibold text-[#14171A]">{l.qty}×</span> {l.name}
                        </div>
                      ))}
                    </td>
                    <td className="tabular-nums whitespace-nowrap px-4 py-3.5 text-xs text-[#5B636B]">
                      <div className="font-medium text-[#14171A]">
                        {formatDateWithYear(order.createdAt)}
                      </div>
                      <div>Est. {formatDateShort(order.expectedDate)}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ${
                          order.status === 'Recibida'
                            ? 'bg-[#DCFCE7] text-[#166534]'
                            : order.status === 'En tránsito'
                              ? 'bg-[#FEF2E4] text-[#8A3A00]'
                              : 'bg-[#EAEAE3] text-[#434B53]'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    {role === 'owner' ? (
                      <td className="tabular-nums whitespace-nowrap px-4 py-3.5 text-right font-bold text-[#14171A]">
                        <div>{formatBs(order.totalBs)}</div>
                        {order.currency === 'USD' ? (
                          <div className="text-[11px] font-normal text-[#5B636B]">
                            {formatUsd(order.totalOriginal)} · TC {order.exchangeRateAtOrder.toFixed(1)}
                          </div>
                        ) : null}
                        {order.shippingCostBs ? (
                          <div className="text-[11px] font-medium text-[#8A3A00]">
                            {order.shippingCurrency === 'USD' && order.shippingCostOriginal
                              ? `Inc. envío USD ${order.shippingCostOriginal} (${formatBs(order.shippingCostBs)})`
                              : `Inc. envío ${formatBs(order.shippingCostBs)}`}
                          </div>
                        ) : null}
                      </td>
                    ) : null}
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      {order.status === 'Pendiente' ? (
                        <div className="inline-flex gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(order.id, order.orderNumber, 'En tránsito')
                            }
                            className="btn-press inline-flex h-8 items-center rounded-md border border-[#D6D6CD] bg-white px-2.5 text-xs font-semibold text-[#14171A] hover:border-[#14171A]"
                          >
                            En camino
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(order.id, order.orderNumber, 'Recibida')
                            }
                            className="btn-press inline-flex h-8 items-center rounded-md bg-[#14171A] px-2.5 text-xs font-semibold text-white hover:bg-[#272C32]"
                          >
                            Recibir
                          </button>
                        </div>
                      ) : order.status === 'En tránsito' ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(order.id, order.orderNumber, 'Recibida')
                          }
                          className="btn-press inline-flex h-8 items-center gap-1 rounded-md bg-[#14171A] px-2.5 text-xs font-semibold text-white hover:bg-[#272C32]"
                        >
                          <PackageCheck className="h-3.5 w-3.5 text-[#F59E0B]" />
                          Marcar recibida
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Lote en bodega
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Purchase Orders */}
        <ul className="space-y-3 md:hidden">
          {paginatedOrders.map((order) => {
            const supplier = supplierById.get(order.supplierId);
            return (
              <li key={order.id} className="rounded-xl border border-[#D6D6CD] bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="tabular-nums font-mono text-xs font-bold text-[#14171A]">
                    {order.orderNumber} · {order.currency}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                      order.status === 'Recibida'
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : order.status === 'En tránsito'
                          ? 'bg-[#FEF2E4] text-[#8A3A00]'
                          : 'bg-[#EAEAE3] text-[#434B53]'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="mt-1 font-semibold text-[#14171A]">
                  {supplier?.name ?? 'Proveedor'}
                </div>
                <div className="mt-1 space-y-0.5 text-xs text-[#5B636B]">
                  {order.lines.map((l) => (
                    <div key={`${order.id}-${l.itemId}`} className="tabular-nums">
                      {l.qty}× {l.name}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[#EAEAE3] pt-3">
                  <div className="tabular-nums font-display text-base font-bold text-[#14171A]">
                    {role === 'owner' ? formatBs(order.totalBs) : `${order.lines.length} línea(s)`}
                  </div>
                  {order.status !== 'Recibida' ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(order.id, order.orderNumber, 'Recibida')
                      }
                      className="btn-press inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#14171A] px-3 text-xs font-semibold text-white"
                    >
                      <PackageCheck className="h-3.5 w-3.5 text-[#F59E0B]" />
                      Marcar recibida
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-[#166534]">Ingresada</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <PaginationBar
          currentPage={safeOrderPage}
          totalItems={filteredOrders.length}
          pageSize={ORDERS_PAGE_SIZE}
          itemLabel="órdenes de compra"
          onPageChange={setOrderPage}
        />
      </section>

      {/* Suppliers Directory */}
      <section className="mt-8" aria-label="Directorio de proveedores">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[#14171A]">
            Directorio de proveedores ({suppliers.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {suppliers.map((sup) => (
            <article
              key={sup.id}
              className="flex flex-col justify-between rounded-xl border border-[#D6D6CD] bg-white p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 shrink-0 text-[#C95B06]" />
                    <h3 className="font-display text-base font-bold leading-snug text-[#14171A]">
                      {sup.name}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded bg-[#EAEAE3] px-2 py-0.5 text-[11px] font-semibold text-[#434B53]">
                    {sup.city}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-[#434B53]">
                  <div className="font-semibold text-[#14171A]">
                    Contacto: {sup.contactName}
                  </div>
                  <div className="flex items-center gap-1.5 text-[#5B636B]">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="tabular-nums">{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#5B636B]">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{sup.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#5B636B]">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span className="tabular-nums">
                      Entrega promedio: {sup.leadTimeDays} días
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {sup.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded border border-[#D6D6CD] bg-[#F8F8F5] px-2 py-0.5 text-[11px] font-medium text-[#434B53]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-[#EAEAE3] pt-3">
                <div className="text-[11px] text-[#5B636B]">{sup.paymentTerms}</div>
                {canManageSuppliers ? (
                  <button
                    type="button"
                    onClick={() => openBlankOrderDrawer(sup.id)}
                    className="btn-press mt-2.5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] text-xs font-semibold text-[#14171A] hover:border-[#14171A] hover:bg-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Crear orden con este proveedor
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* New Purchase Order Drawer */}
      <Drawer
        open={isOrderDrawerOpen}
        onClose={() => setIsOrderDrawerOpen(false)}
        title="Nueva orden de compra"
        subtitle="Al recibirla, se generará un lote nuevo con la moneda y tipo de cambio elegidos."
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          {orderError ? (
            <div
              role="alert"
              className="rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-3 py-2 text-xs font-semibold text-[#991B1B]"
            >
              {orderError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-[#434B53]">
              Proveedor
              <select
                value={orderSupplierId}
                onChange={(e) => setOrderSupplierId(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A] focus:border-[#14171A] focus:outline-none"
              >
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-[#434B53]">
              Fecha estimada de llegada
              <input
                type="date"
                value={orderExpectedDate}
                onChange={(e) => setOrderExpectedDate(e.target.value)}
                className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A] focus:border-[#14171A] focus:outline-none"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] p-3">
            <div>
              <span className="text-xs font-semibold text-[#434B53]">Moneda de compra</span>
              <div className="mt-1 grid grid-cols-2 gap-1 rounded-md bg-[#EAEAE3] p-0.5">
                {(['USD', 'BOB'] as const).map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => setOrderCurrency(cur)}
                    className={`h-8 rounded text-xs font-semibold ${
                      orderCurrency === cur
                        ? 'bg-[#14171A] text-white'
                        : 'text-[#434B53]'
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            {orderCurrency === 'USD' ? (
              <label className="block text-xs font-semibold text-[#434B53]">
                TC producto (Bs / USD)
                <input
                  type="number"
                  step="0.01"
                  min={1}
                  value={orderTc}
                  onChange={(e) => setOrderTc(e.target.value)}
                  className="tabular-nums mt-1 h-9 w-full rounded-md border border-[#D6D6CD] bg-white px-2.5 text-sm font-bold text-[#14171A]"
                />
              </label>
            ) : (
              <div className="flex items-end pb-1.5 text-xs text-[#5B636B]">
                Mercadería comprada en Bs
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                Equipos solicitados
              </span>
              <button
                type="button"
                onClick={handleAddOrderLine}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A3A00] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar línea
              </button>
            </div>

            <div className="mt-2 space-y-3">
              {orderLines.map((line, index) => (
                <div
                  key={`${line.itemId}-${index}`}
                  className="rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] p-3"
                >
                  <div className="flex items-center gap-2">
                    <select
                      value={line.itemId}
                      onChange={(e) => {
                        const chosen = inventoryById.get(e.target.value);
                        const active = chosen ? getActiveBatch(chosen) : null;
                        setOrderLines((prev) =>
                          prev.map((row, idx) =>
                            idx === index
                              ? {
                                  ...row,
                                  itemId: e.target.value,
                                  unitCostOriginal:
                                    active?.unitCostOriginal ?? row.unitCostOriginal,
                                }
                              : row
                          )
                        );
                      }}
                      aria-label="Seleccionar equipo"
                      className="h-9 flex-1 rounded-md border border-[#D6D6CD] bg-white px-2.5 text-xs font-semibold text-[#14171A]"
                    >
                      {inventory.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.sku} · {it.name}
                        </option>
                      ))}
                    </select>
                    {orderLines.length > 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setOrderLines((prev) => prev.filter((_, idx) => idx !== index))
                        }
                        aria-label="Quitar línea"
                        className="rounded p-1.5 text-[#5B636B] hover:bg-[#FEE2E2] hover:text-[#991B1B]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2.5">
                    <label className="block text-[11px] font-semibold text-[#5B636B]">
                      Cantidad
                      <input
                        type="number"
                        min={1}
                        value={line.qty}
                        onChange={(e) => {
                          const val = Math.max(1, Number.parseInt(e.target.value || '1', 10));
                          setOrderLines((prev) =>
                            prev.map((row, idx) => (idx === index ? { ...row, qty: val } : row))
                          );
                        }}
                        className="tabular-nums mt-1 h-9 w-full rounded-md border border-[#D6D6CD] bg-white px-2.5 text-sm font-semibold text-[#14171A]"
                      />
                    </label>
                    <label className="block text-[11px] font-semibold text-[#5B636B]">
                      Costo unitario ({orderCurrency})
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.unitCostOriginal}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value || 0));
                          setOrderLines((prev) =>
                            prev.map((row, idx) =>
                              idx === index ? { ...row, unitCostOriginal: val } : row
                            )
                          );
                        }}
                        className="tabular-nums mt-1 h-9 w-full rounded-md border border-[#D6D6CD] bg-white px-2.5 text-sm font-semibold text-[#14171A]"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Target Margin on Receive */}
          <div className="space-y-3 rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <label htmlFor="po-shipping-input" className="text-xs font-semibold text-[#434B53]">
                    Costo envío / flete (opc.)
                  </label>
                  <div className="inline-flex rounded bg-[#EAEAE3] p-0.5">
                    {(['BOB', 'USD'] as const).map((cur) => (
                      <button
                        key={cur}
                        type="button"
                        onClick={() => setOrderShippingCurrency(cur)}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          orderShippingCurrency === cur
                            ? 'bg-[#14171A] text-white'
                            : 'text-[#434B53]'
                        }`}
                      >
                        {cur === 'BOB' ? 'Bs' : 'USD'}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  id="po-shipping-input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={orderShippingAmount}
                  onChange={(e) => setOrderShippingAmount(e.target.value)}
                  placeholder={orderShippingCurrency === 'USD' ? 'Ej. 45' : 'Ej. 450'}
                  className="tabular-nums mt-1 h-9 w-full rounded-md border border-[#D6D6CD] bg-white px-2.5 text-sm font-semibold text-[#14171A]"
                />
              </div>

              {orderShippingCurrency === 'USD' ? (
                <label className="block text-xs font-semibold text-[#434B53]">
                  TC del flete (Bs / USD)
                  <input
                    type="number"
                    step="0.01"
                    min={1}
                    value={orderShippingTc}
                    onChange={(e) => setOrderShippingTc(e.target.value)}
                    className="tabular-nums mt-1 h-9 w-full rounded-md border border-[#D6D6CD] bg-white px-2.5 text-sm font-bold text-[#14171A]"
                  />
                </label>
              ) : (
                <div className="flex items-end pb-1.5 text-xs text-[#5B636B]">
                  Flete directo en Bolivianos
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EAEAE3] pt-2.5">
              <span className="text-xs font-semibold text-[#434B53]">
                % Ganancia sugerida al recibir
              </span>
              <div className="flex items-center gap-1">
                {(['25', '30', '35'] as const).map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setOrderTargetMarginPct(pct)}
                    className={`h-8 rounded border px-2 text-xs font-bold ${
                      orderTargetMarginPct === pct
                        ? 'border-[#14171A] bg-[#14171A] text-white'
                        : 'border-[#D6D6CD] bg-white text-[#434B53]'
                    }`}
                  >
                    +{pct}%
                  </button>
                ))}
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={orderTargetMarginPct}
                  onChange={(e) => setOrderTargetMarginPct(e.target.value)}
                  aria-label="Porcentaje de ganancia al recibir orden"
                  className="tabular-nums h-8 w-14 rounded-md border border-[#D6D6CD] bg-white px-1.5 text-center text-xs font-bold text-[#14171A]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-[#D6D6CD] pt-4">
            <div className="flex justify-between text-xs text-[#5B636B]">
              <span>
                Mercadería{orderCurrency === 'USD' ? ` (${formatUsd(draftOrderTotalOriginal)} × TC ${draftOrderTc})` : ''}
              </span>
              <span className="tabular-nums font-semibold text-[#14171A]">
                {formatBs(draftOrderGoodsBs)}
              </span>
            </div>
            {draftOrderShippingBs > 0 ? (
              <div className="flex justify-between text-xs text-[#8A3A00]">
                <span>
                  Flete prorrateado{orderShippingCurrency === 'USD' ? ` (USD ${draftOrderRawShipping} × TC ${draftShippingTc})` : ''}
                </span>
                <span className="tabular-nums font-semibold">+ {formatBs(draftOrderShippingBs)}</span>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-[#434B53]">Costo total puesto en tienda</span>
              <span className="tabular-nums font-display text-2xl font-bold text-[#14171A]">
                {formatBs(draftOrderTotalBs)}
              </span>
            </div>
            {draftOrderShippingBs > 0 ? (
              <p className="text-[11px] text-[#5B636B]">
                Al marcarla <strong>Recibida</strong>, el envío se suma proporcionalmente al costo de cada equipo (sin duplicarse en Gastos) y calcula su nuevo precio sugerido (+{orderTargetMarginPct || '30'}%).
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="btn-press inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#14171A] text-sm font-semibold text-white hover:bg-[#272C32]"
          >
            Emitir orden de compra
          </button>
        </form>
      </Drawer>

      {/* New Supplier Drawer */}
      <Drawer
        open={isSupplierDrawerOpen}
        onClose={() => setIsSupplierDrawerOpen(false)}
        title="Registrar nuevo proveedor"
        subtitle="Disponible de inmediato para asignar máquinas y órdenes de compra."
      >
        <form onSubmit={handleCreateSupplier} className="space-y-4">
          {supError ? (
            <div
              role="alert"
              className="rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-3 py-2 text-xs font-semibold text-[#991B1B]"
            >
              {supError}
            </div>
          ) : null}

          <label className="block text-xs font-semibold text-[#434B53]">
            Nombre de empresa *
            <input
              type="text"
              required
              value={supName}
              onChange={(e) => setSupName(e.target.value)}
              placeholder="Ej. Maquinarias Oriente S.A."
              className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A] focus:border-[#14171A] focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-[#434B53]">
              Ciudad
              <input
                type="text"
                value={supCity}
                onChange={(e) => setSupCity(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
              />
            </label>
            <label className="block text-xs font-semibold text-[#434B53]">
              Plazo entrega (días)
              <input
                type="number"
                min={1}
                value={supLeadDays}
                onChange={(e) => setSupLeadDays(e.target.value)}
                className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-[#434B53]">
            Persona de contacto *
            <input
              type="text"
              required
              value={supContact}
              onChange={(e) => setSupContact(e.target.value)}
              placeholder="Nombre completo"
              className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-[#434B53]">
              Teléfono
              <input
                type="text"
                value={supPhone}
                onChange={(e) => setSupPhone(e.target.value)}
                placeholder="+591 700-00000"
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
              />
            </label>
            <label className="block text-xs font-semibold text-[#434B53]">
              Correo
              <input
                type="email"
                value={supEmail}
                onChange={(e) => setSupEmail(e.target.value)}
                placeholder="ventas@empresa.example"
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-[#434B53]">
            Rubro principal que surte
            <select
              value={supCategory}
              onChange={(e) => setSupCategory(e.target.value as Category)}
              className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
            >
              {productCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold text-[#434B53]">
            Condiciones de pago
            <input
              type="text"
              value={supTerms}
              onChange={(e) => setSupTerms(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
            />
          </label>

          <button
            type="submit"
            className="btn-press inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#14171A] text-sm font-semibold text-white hover:bg-[#272C32]"
          >
            Guardar proveedor
          </button>
        </form>
      </Drawer>
    </div>
  );
}
