import { useMemo, useState, type FormEvent } from 'react';
import { Award, MapPin, Phone, Plus, Search, User } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../state/StoreContext';
import type { Customer } from '../types/store';
import { formatBs, formatDateTime, matchesDateRange, type DateRangePeriod } from '../utils/formatters';
import { DateFilterBar } from './DateFilterBar';
import { Drawer } from './Drawer';
import { PaginationBar } from './PaginationBar';

interface CustomerStats {
  customer: Customer;
  totalSpentBs: number;
  ordersCount: number;
  lastPurchaseAt: string | null;
}

export function CustomersSection() {
  const { customers, sales, quotes, addCustomer } = useStore();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [drawerPeriod, setDrawerPeriod] = useState<DateRangePeriod>('all');
  const [drawerFrom, setDrawerFrom] = useState('');
  const [drawerTo, setDrawerTo] = useState('');
  const [drawerSalesPage, setDrawerSalesPage] = useState(1);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const CUSTOMERS_PAGE_SIZE = 10;
  const DRAWER_SALES_PAGE_SIZE = 6;

  const [name, setName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('La Paz');
  const [notes, setNotes] = useState('');

  const rankedCustomers = useMemo<CustomerStats[]>(() => {
    const byCustomer = new Map<
      string,
      { totalBs: number; count: number; lastPurchaseAt: string | null }
    >();

    for (const sale of sales) {
      const key = sale.customerId ?? sale.customerName.toLowerCase();
      const prev = byCustomer.get(key) ?? {
        totalBs: 0,
        count: 0,
        lastPurchaseAt: null,
      };
      const isNewer = !prev.lastPurchaseAt || sale.createdAt > prev.lastPurchaseAt;
      byCustomer.set(key, {
        totalBs: prev.totalBs + sale.totalBs,
        count: prev.count + 1,
        lastPurchaseAt: isNewer ? sale.createdAt : prev.lastPurchaseAt,
      });
    }

    const q = query.trim().toLowerCase();

    return customers
      .map((customer) => {
        const stats =
          byCustomer.get(customer.id) ??
          byCustomer.get(customer.name.toLowerCase()) ?? {
            totalBs: 0,
            count: 0,
            lastPurchaseAt: null,
          };
        return {
          customer,
          totalSpentBs: stats.totalBs,
          ordersCount: stats.count,
          lastPurchaseAt: stats.lastPurchaseAt,
        };
      })
      .filter((row) => {
        if (!q) return true;
        return (
          row.customer.name.toLowerCase().includes(q) ||
          (row.customer.docNumber ?? '').toLowerCase().includes(q) ||
          (row.customer.city ?? '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.totalSpentBs - a.totalSpentBs);
  }, [customers, sales, query]);

  const totalCustomerPages = Math.max(1, Math.ceil(rankedCustomers.length / CUSTOMERS_PAGE_SIZE));
  const safeCustomerPage = Math.min(page, totalCustomerPages);
  const paginatedCustomers = useMemo(() => {
    const start = (safeCustomerPage - 1) * CUSTOMERS_PAGE_SIZE;
    return rankedCustomers.slice(start, start + CUSTOMERS_PAGE_SIZE);
  }, [rankedCustomers, safeCustomerPage]);

  const customerSales = useMemo(() => {
    if (!selectedCustomer) return [];
    return sales.filter(
      (s) =>
        (s.customerId === selectedCustomer.id ||
          s.customerName.toLowerCase() === selectedCustomer.name.toLowerCase()) &&
        matchesDateRange(s.createdAt, drawerPeriod, drawerFrom, drawerTo)
    );
  }, [selectedCustomer, sales, drawerPeriod, drawerFrom, drawerTo]);

  const drawerSalesTotalPages = Math.max(
    1,
    Math.ceil(customerSales.length / DRAWER_SALES_PAGE_SIZE)
  );
  const safeDrawerSalesPage = Math.min(drawerSalesPage, drawerSalesTotalPages);
  const paginatedDrawerSales = useMemo(() => {
    const start = (safeDrawerSalesPage - 1) * DRAWER_SALES_PAGE_SIZE;
    return customerSales.slice(start, start + DRAWER_SALES_PAGE_SIZE);
  }, [customerSales, safeDrawerSalesPage]);

  const customerQuotes = useMemo(() => {
    if (!selectedCustomer) return [];
    return quotes.filter(
      (q) =>
        q.customerId === selectedCustomer.id ||
        q.customerName.toLowerCase() === selectedCustomer.name.toLowerCase()
    );
  }, [selectedCustomer, quotes]);

  const handleCreateCustomer = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const created = addCustomer({
      name: name.trim(),
      docNumber: docNumber.trim() || undefined,
      phone: phone.trim() || undefined,
      city: city.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    toast.success(`Cliente ${created.name} registrado`);
    setName('');
    setDocNumber('');
    setPhone('');
    setNotes('');
    setIsNewOpen(false);
  };

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#D6D6CD] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#14171A] sm:text-3xl">
            Clientes y Mejores Compradores
          </h1>
          <p className="mt-1 text-sm text-[#5B636B]">
            Ranking automático por volumen de compras en Bs e historial de operaciones.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsNewOpen(true)}
          className="btn-press inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#14171A] px-4 text-sm font-semibold text-white hover:bg-[#272C32]"
        >
          <Plus className="h-4 w-4 text-[#F59E0B]" />
          Nuevo cliente
        </button>
      </div>

      {/* Search */}
      <div className="mt-5 rounded-xl border border-[#D6D6CD] bg-white p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B636B]" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar cliente por nombre, CI/NIT o ciudad..."
            aria-label="Buscar cliente"
            className="h-10 w-full rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] pl-9 pr-3 text-sm text-[#14171A] placeholder:text-[#5B636B] focus:border-[#14171A] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Desktop Ranking Table */}
      <div className="mt-5 hidden overflow-hidden rounded-xl border border-[#D6D6CD] bg-white md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#D6D6CD] bg-[#F8F8F5] text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
              <th className="px-4 py-3">Ranking</th>
              <th className="px-4 py-3">Cliente / CI-NIT</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3 text-right">Compras</th>
              <th className="px-4 py-3 text-right">Última compra</th>
              <th className="px-4 py-3 text-right">Total comprado</th>
              <th className="px-4 py-3 text-right">Historial</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEAE3]">
            {paginatedCustomers.map((row, idx) => (
              <tr key={row.customer.id} className="hover:bg-[#F8F8F5]">
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span
                    className={`tabular-nums inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                      (safeCustomerPage - 1) * CUSTOMERS_PAGE_SIZE + idx === 0 &&
                      row.totalSpentBs > 0
                        ? 'bg-[#FEF2E4] text-[#8A3A00]'
                        : 'bg-[#EAEAE3] text-[#434B53]'
                    }`}
                  >
                    {(safeCustomerPage - 1) * CUSTOMERS_PAGE_SIZE + idx === 0 &&
                    row.totalSpentBs > 0 ? (
                      <Award className="h-3 w-3 text-[#C95B06]" />
                    ) : null}
                    #{(safeCustomerPage - 1) * CUSTOMERS_PAGE_SIZE + idx + 1}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-[#14171A]">{row.customer.name}</div>
                  {row.customer.docNumber ? (
                    <div className="tabular-nums text-xs text-[#5B636B]">
                      {row.customer.docNumber}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3.5 text-xs text-[#5B636B]">
                  {row.customer.phone ? (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span className="tabular-nums">{row.customer.phone}</span>
                    </div>
                  ) : null}
                  {row.customer.city ? (
                    <div className="mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{row.customer.city}</span>
                    </div>
                  ) : null}
                </td>
                <td className="tabular-nums px-4 py-3.5 text-right font-semibold text-[#14171A]">
                  {row.ordersCount}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right text-xs text-[#5B636B]">
                  {row.lastPurchaseAt ? formatDateTime(row.lastPurchaseAt) : 'Sin compras'}
                </td>
                <td className="tabular-nums whitespace-nowrap px-4 py-3.5 text-right font-bold text-[#14171A]">
                  {formatBs(row.totalSpentBs)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(row.customer);
                      setDrawerPeriod('all');
                      setDrawerSalesPage(1);
                    }}
                    className="btn-press inline-flex h-8 items-center rounded-md border border-[#D6D6CD] bg-white px-2.5 text-xs font-semibold text-[#14171A] hover:border-[#14171A]"
                  >
                    Ver ficha
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <ul className="mt-4 space-y-3 md:hidden">
        {paginatedCustomers.map((row, idx) => (
          <li key={row.customer.id} className="rounded-xl border border-[#D6D6CD] bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="tabular-nums rounded bg-[#FEF2E4] px-2 py-0.5 text-xs font-bold text-[#8A3A00]">
                Top #{(safeCustomerPage - 1) * CUSTOMERS_PAGE_SIZE + idx + 1}
              </span>
              <span className="tabular-nums text-xs text-[#5B636B]">
                {row.ordersCount} compra(s)
              </span>
            </div>
            <div className="mt-1.5 font-display text-base font-bold text-[#14171A]">
              {row.customer.name}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#EAEAE3] pt-3">
              <div className="tabular-nums font-display text-lg font-bold text-[#14171A]">
                {formatBs(row.totalSpentBs)}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomer(row.customer);
                  setDrawerPeriod('all');
                  setDrawerSalesPage(1);
                }}
                className="btn-press inline-flex h-9 items-center rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3 text-xs font-semibold text-[#14171A]"
              >
                Historial
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <PaginationBar
          currentPage={safeCustomerPage}
          totalItems={rankedCustomers.length}
          pageSize={CUSTOMERS_PAGE_SIZE}
          itemLabel="clientes"
          onPageChange={setPage}
        />
      </div>

      {/* Customer Detail Drawer */}
      <Drawer
        open={selectedCustomer !== null}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name ?? ''}
        subtitle={
          selectedCustomer
            ? `${selectedCustomer.docNumber ?? 'Sin documento'} · ${selectedCustomer.city ?? 'Bolivia'}`
            : undefined
        }
      >
        {selectedCustomer ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-[#14171A]">
                <User className="h-3.5 w-3.5 text-[#C95B06]" />
                Información de contacto
              </div>
              <div className="text-[#434B53]">Teléfono: {selectedCustomer.phone ?? 'No registrado'}</div>
              {selectedCustomer.notes ? (
                <div className="text-[#5B636B]">{selectedCustomer.notes}</div>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                  Compras realizadas ({customerSales.length})
                </h3>
                <DateFilterBar
                  compact
                  period={drawerPeriod}
                  fromDate={drawerFrom}
                  toDate={drawerTo}
                  onChangePeriod={(p) => {
                    setDrawerPeriod(p);
                    setDrawerSalesPage(1);
                  }}
                  onChangeFromDate={(d) => {
                    setDrawerFrom(d);
                    setDrawerSalesPage(1);
                  }}
                  onChangeToDate={(d) => {
                    setDrawerTo(d);
                    setDrawerSalesPage(1);
                  }}
                />
              </div>
              {customerSales.length === 0 ? (
                <p className="mt-2 text-xs text-[#5B636B]">
                  No tiene compras registradas en el rango seleccionado.
                </p>
              ) : (
                <>
                  <ul className="divide-y divide-[#EAEAE3] rounded-lg border border-[#D6D6CD]">
                    {paginatedDrawerSales.map((s) => (
                      <li key={s.id} className="p-3 text-xs">
                        <div className="flex items-center justify-between font-bold text-[#14171A]">
                          <span className="font-mono">{s.receiptNumber}</span>
                          <span className="tabular-nums">{formatBs(s.totalBs)}</span>
                        </div>
                        <div className="mt-0.5 text-[#5B636B]">{formatDateTime(s.createdAt)}</div>
                      </li>
                    ))}
                  </ul>
                  <PaginationBar
                    compact
                    currentPage={safeDrawerSalesPage}
                    totalItems={customerSales.length}
                    pageSize={DRAWER_SALES_PAGE_SIZE}
                    itemLabel="compras"
                    onPageChange={setDrawerSalesPage}
                  />
                </>
              )}
            </div>

            {customerQuotes.length > 0 ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                  Proformas emitidas ({customerQuotes.length})
                </h3>
                <ul className="mt-2 divide-y divide-[#EAEAE3] rounded-lg border border-[#D6D6CD]">
                  {customerQuotes.map((q) => (
                    <li key={q.id} className="flex items-center justify-between p-3 text-xs">
                      <div>
                        <span className="font-mono font-bold text-[#14171A]">
                          {q.quoteNumber}
                        </span>{' '}
                        <span className="text-[#5B636B]">({q.status})</span>
                      </div>
                      <span className="tabular-nums font-bold text-[#14171A]">
                        {formatBs(q.totalBs)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>

      {/* New Customer Drawer */}
      <Drawer
        open={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        title="Registrar nuevo cliente"
        subtitle="Quedará disponible en el buscador del mostrador."
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <label className="block text-xs font-semibold text-[#434B53]">
            Nombre o Razón Social *
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Constructora Los Pinos S.R.L."
              className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] px-3 text-sm text-[#14171A]"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-[#434B53]">
              CI / NIT
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="NIT o CI"
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] px-3 text-sm text-[#14171A]"
              />
            </label>
            <label className="block text-xs font-semibold text-[#434B53]">
              Teléfono
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+591 700-00000"
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] px-3 text-sm text-[#14171A]"
              />
            </label>
          </div>
          <label className="block text-xs font-semibold text-[#434B53]">
            Ciudad / Zona
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] px-3 text-sm text-[#14171A]"
            />
          </label>
          <label className="block text-xs font-semibold text-[#434B53]">
            Notas
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferencias de pago o equipos..."
              className="mt-1 w-full rounded-lg border border-[#D6D6CD] p-3 text-sm text-[#14171A]"
            />
          </label>
          <button
            type="submit"
            className="btn-press inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#14171A] text-sm font-semibold text-white"
          >
            Guardar cliente
          </button>
        </form>
      </Drawer>
    </div>
  );
}
