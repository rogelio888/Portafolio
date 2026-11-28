import { useMemo, useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight, FolderCog, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../state/StoreContext';
import type { ExpenseCategory, ExpenseType, PaymentMethod } from '../types/store';
import { formatBs, formatDateShort } from '../utils/formatters';
import { CategoryManagerDrawer } from './CategoryManagerDrawer';
import { Drawer } from './Drawer';

const PAYMENT_METHODS: PaymentMethod[] = ['Efectivo', 'QR Simple'];
const EXPENSES_PAGE_SIZE = 10;

export function ExpensesSection() {
  const {
    expenses,
    expenseCategories,
    expenseCategoryTypes,
    addExpense,
    deleteExpense,
    addExpenseCategory,
    renameExpenseCategory,
    deleteExpenseCategory,
    setExpenseCategoryDefaultType,
  } = useStore();
  const [typeFilter, setTypeFilter] = useState<'all' | ExpenseType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ExpenseCategory>('all');
  const [datePeriod, setDatePeriod] = useState<'all' | '30d' | '90d' | 'custom'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const initialCat = expenseCategories[0] ?? 'Servicios básicos';
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory>(initialCat);
  const [expenseType, setExpenseType] = useState<ExpenseType>(
    expenseCategoryTypes[initialCat] ?? 'Fijo'
  );
  const [description, setDescription] = useState('');
  const [amountBs, setAmountBs] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [reference, setReference] = useState('');

  const categoryUsage = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + 1);
    }
    return map;
  }, [expenses]);

  const filteredByDate = useMemo(() => {
    const now = Date.now();
    const cutoff =
      datePeriod === '30d'
        ? now - 30 * 86400_000
        : datePeriod === '90d'
          ? now - 90 * 86400_000
          : 0;
    const fromMs = datePeriod === 'custom' && fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : 0;
    const toMs = datePeriod === 'custom' && toDate ? new Date(`${toDate}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;

    return expenses.filter((e) => {
      const ts = new Date(`${e.date}T12:00:00`).getTime();
      if (cutoff > 0 && ts < cutoff) return false;
      if (datePeriod === 'custom' && (ts < fromMs || ts > toMs)) return false;
      return true;
    });
  }, [expenses, datePeriod, fromDate, toDate]);

  const totals = useMemo(() => {
    let all = 0;
    let fixed = 0;
    let fixedCount = 0;
    let variable = 0;
    let variableCount = 0;
    let cash = 0;
    for (const e of filteredByDate) {
      all += e.amountBs;
      if (e.expenseType === 'Fijo') {
        fixed += e.amountBs;
        fixedCount += 1;
      } else {
        variable += e.amountBs;
        variableCount += 1;
      }
      if (e.paymentMethod === 'Efectivo') cash += e.amountBs;
    }
    return {
      all,
      fixed,
      fixedCount,
      fixedPct: all > 0 ? (fixed / all) * 100 : 0,
      variable,
      variableCount,
      variablePct: all > 0 ? (variable / all) * 100 : 0,
      cash,
    };
  }, [filteredByDate]);

  const filtered = useMemo(() => {
    return filteredByDate.filter((e) => {
      if (typeFilter !== 'all' && e.expenseType !== typeFilter) return false;
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      return true;
    });
  }, [filteredByDate, typeFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / EXPENSES_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * EXPENSES_PAGE_SIZE;
    return filtered.slice(start, start + EXPENSES_PAGE_SIZE);
  }, [filtered, safePage]);

  const activeCategory = expenseCategories.includes(category)
    ? category
    : (expenseCategories[0] ?? 'Servicios básicos');

  const handleCategoryChange = (nextCat: string) => {
    setCategory(nextCat);
    setExpenseType(expenseCategoryTypes[nextCat] ?? 'Variable');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amt = Number(amountBs);
    if (!description.trim() || !Number.isFinite(amt) || amt <= 0) {
      toast.error('Ingresa descripción y monto válido en Bs.');
      return;
    }
    const created = addExpense({
      date,
      category: activeCategory,
      expenseType,
      description: description.trim(),
      amountBs: Math.round(amt),
      paymentMethod,
      reference: reference.trim() || undefined,
    });
    toast.success(`Gasto ${created.expenseType.toLowerCase()} registrado (${formatBs(created.amountBs)})`);
    setDescription('');
    setAmountBs('');
    setReference('');
    setIsNewOpen(false);
  };

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#D6D6CD] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#14171A] sm:text-3xl">
            Gastos Operativos (Fijos y Variables)
          </h1>
          <p className="mt-1 text-sm text-[#5B636B]">
            Separa costos estructurales del local (alquiler, sueldos, servicios) de gastos variables de operación.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCategoriesOpen(true)}
            className="btn-press inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D6D6CD] bg-white px-3.5 text-sm font-semibold text-[#14171A] hover:border-[#14171A]"
          >
            <FolderCog className="h-4 w-4 text-[#5B636B]" />
            Categorías
          </button>
          <button
            type="button"
            onClick={() => {
              setExpenseType(expenseCategoryTypes[activeCategory] ?? 'Variable');
              setIsNewOpen(true);
            }}
            className="btn-press inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#14171A] px-4 text-sm font-semibold text-white hover:bg-[#272C32]"
          >
            <Plus className="h-4 w-4 text-[#F59E0B]" />
            Registrar gasto
          </button>
        </div>
      </div>

      {/* Separated Fixed vs Variable Summary Strip */}
      <section className="mt-6 grid grid-cols-1 divide-y divide-[#D6D6CD] rounded-xl border border-[#D6D6CD] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#1E293B]">
              Gastos Fijos
            </span>
            <span className="tabular-nums rounded bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-bold text-[#1E293B]">
              {totals.fixedPct.toFixed(0)}%
            </span>
          </div>
          <div className="tabular-nums mt-1.5 font-display text-2xl font-bold text-[#14171A]">
            {formatBs(totals.fixed)}
          </div>
          <div className="mt-1 text-xs text-[#5B636B]">
            {totals.fixedCount} egreso(s) · Alquiler, sueldos y servicios
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#8A3A00]">
              Gastos Variables
            </span>
            <span className="tabular-nums rounded bg-[#FEF2E4] px-2 py-0.5 text-[11px] font-bold text-[#8A3A00]">
              {totals.variablePct.toFixed(0)}%
            </span>
          </div>
          <div className="tabular-nums mt-1.5 font-display text-2xl font-bold text-[#14171A]">
            {formatBs(totals.variable)}
          </div>
          <div className="mt-1 text-xs text-[#5B636B]">
            {totals.variableCount} egreso(s) · Fletes, mantenimiento, otros
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
            Total período / Efectivo
          </div>
          <div className="tabular-nums mt-1.5 font-display text-2xl font-bold text-[#14171A]">
            {formatBs(totals.all)}
          </div>
          <div className="tabular-nums mt-1 text-xs text-[#5B636B]">
            En efectivo (descontado de Caja): <strong className="text-[#14171A]">{formatBs(totals.cash)}</strong>
          </div>
        </div>
      </section>

      {/* Filters: Type + Category + Date Range */}
      <div className="mt-5 space-y-3 rounded-xl border border-[#D6D6CD] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-[#D6D6CD] bg-[#EAEAE3] p-0.5">
            {(
              [
                { id: 'all', label: 'Todos' },
                { id: 'Fijo', label: 'Solo Fijos' },
                { id: 'Variable', label: 'Solo Variables' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setTypeFilter(opt.id);
                  setPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  typeFilter === opt.id ? 'bg-[#14171A] text-white' : 'text-[#434B53]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'Todo' },
                { id: '30d', label: '30 días' },
                { id: '90d', label: '3 meses' },
                { id: 'custom', label: 'Rango' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setDatePeriod(p.id);
                  setPage(1);
                }}
                className={`h-8 rounded-lg border px-2.5 text-xs font-semibold ${
                  datePeriod === p.id
                    ? 'border-[#14171A] bg-[#14171A] text-white'
                    : 'border-[#D6D6CD] bg-[#F8F8F5] text-[#434B53]'
                }`}
              >
                {p.label}
              </button>
            ))}
            {datePeriod === 'custom' ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Gastos desde"
                  className="tabular-nums h-8 rounded border border-[#D6D6CD] bg-white px-2 text-xs"
                />
                <span className="text-xs text-[#5B636B]">a</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Gastos hasta"
                  className="tabular-nums h-8 rounded border border-[#D6D6CD] bg-white px-2 text-xs"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-[#EAEAE3] pt-3">
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              setPage(1);
            }}
            className={`btn-press h-8 rounded-lg border px-2.5 text-xs font-semibold ${
              categoryFilter === 'all'
                ? 'border-[#14171A] bg-[#14171A] text-white'
                : 'border-[#D6D6CD] bg-white text-[#434B53]'
            }`}
          >
            Todas las categorías
          </button>
          {expenseCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategoryFilter(cat);
                setPage(1);
              }}
              className={`btn-press h-8 rounded-lg border px-2.5 text-xs font-semibold ${
                categoryFilter === cat
                  ? 'border-[#14171A] bg-[#14171A] text-white'
                  : 'border-[#D6D6CD] bg-white text-[#434B53]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-[#D6D6CD] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#D6D6CD] bg-[#F8F8F5] text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-right">Quitar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAE3]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#5B636B]">
                    No hay gastos registrados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginated.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#F8F8F5]">
                    <td className="tabular-nums whitespace-nowrap px-4 py-3.5 text-xs text-[#5B636B]">
                      {formatDateShort(exp.date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                          exp.expenseType === 'Fijo'
                            ? 'bg-[#F1F5F9] text-[#1E293B]'
                            : 'bg-[#FEF2E4] text-[#8A3A00]'
                        }`}
                      >
                        {exp.expenseType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="rounded bg-[#EAEAE3] px-2 py-0.5 text-xs font-semibold text-[#434B53]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[#14171A]">{exp.description}</div>
                      {exp.reference ? (
                        <div className="font-mono text-[11px] text-[#5B636B]">
                          Ref: {exp.reference}
                        </div>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-[#434B53]">
                      {exp.paymentMethod}
                    </td>
                    <td className="tabular-nums whitespace-nowrap px-4 py-3.5 text-right font-bold text-[#14171A]">
                      {formatBs(exp.amountBs)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          deleteExpense(exp.id);
                          toast.info('Gasto eliminado');
                        }}
                        aria-label={`Eliminar gasto ${exp.description}`}
                        className="rounded p-1.5 text-[#5B636B] hover:bg-[#FEE2E2] hover:text-[#991B1B]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#D6D6CD] bg-white px-4 py-3 text-xs">
        <span className="tabular-nums text-[#5B636B]">
          Mostrando {filtered.length === 0 ? 0 : (safePage - 1) * EXPENSES_PAGE_SIZE + 1}–
          {Math.min(safePage * EXPENSES_PAGE_SIZE, filtered.length)} de{' '}
          <strong className="text-[#14171A]">{filtered.length}</strong> gastos
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-press inline-flex h-8 items-center gap-1 rounded-md border border-[#D6D6CD] bg-[#F8F8F5] px-2.5 font-semibold text-[#14171A] disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </button>
          <span className="tabular-nums px-2 font-semibold text-[#14171A]">
            Pág. {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="btn-press inline-flex h-8 items-center gap-1 rounded-md border border-[#D6D6CD] bg-[#F8F8F5] px-2.5 font-semibold text-[#14171A] disabled:opacity-40"
          >
            Siguiente
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* New Expense Drawer */}
      <Drawer
        open={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        title="Registrar gasto operativo"
        subtitle="Clasifica si es Fijo o Variable para calcular el punto de equilibrio real."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-[#434B53]">
              Fecha
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] px-3 text-sm text-[#14171A]"
              />
            </label>
            <label className="block text-xs font-semibold text-[#434B53]">
              Categoría
              <select
                value={activeCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] px-3 text-sm text-[#14171A]"
              >
                {expenseCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#434B53]">
              Tipo de gasto
            </span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(
                [
                  {
                    id: 'Fijo',
                    label: 'Gasto Fijo',
                    hint: 'Recurrente cada mes',
                  },
                  {
                    id: 'Variable',
                    label: 'Gasto Variable',
                    hint: 'Depende de operación',
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setExpenseType(opt.id)}
                  className={`rounded-lg border px-3 py-2 text-left ${
                    expenseType === opt.id
                      ? 'border-[#14171A] bg-[#14171A] text-white'
                      : 'border-[#D6D6CD] bg-[#F8F8F5] text-[#14171A]'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div
                    className={`text-[11px] ${
                      expenseType === opt.id ? 'text-[#D6D6CD]' : 'text-[#5B636B]'
                    }`}
                  >
                    {opt.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <label className="block text-xs font-semibold text-[#434B53]">
            Descripción / Concepto *
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Pago factura luz noviembre o flete"
              className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] px-3 text-sm text-[#14171A]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-[#434B53]">
              Monto (Bs) *
              <input
                type="number"
                required
                step="0.01"
                min={1}
                value={amountBs}
                onChange={(e) => setAmountBs(e.target.value)}
                placeholder="350"
                className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] px-3 text-sm font-bold text-[#14171A]"
              />
            </label>
            <label className="block text-xs font-semibold text-[#434B53]">
              Método de pago
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] px-3 text-sm text-[#14171A]"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-xs font-semibold text-[#434B53]">
            N° de factura / recibo (opcional)
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ej. FAC-9921"
              className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] px-3 font-mono text-xs text-[#14171A]"
            />
          </label>

          <button
            type="submit"
            className="btn-press inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#14171A] text-sm font-semibold text-white"
          >
            Guardar gasto
          </button>
        </form>
      </Drawer>

      <CategoryManagerDrawer
        open={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        title="Categorías de gastos"
        subtitle="Crea, renombra o elimina tipos de egresos y define si son Fijos o Variables."
        categories={expenseCategories}
        usageCounts={categoryUsage}
        itemNoun="gasto(s)"
        expenseCategoryTypes={expenseCategoryTypes}
        onAdd={addExpenseCategory}
        onChangeDefaultType={setExpenseCategoryDefaultType}
        onRename={(oldName, newName) => {
          const res = renameExpenseCategory(oldName, newName);
          if (res.ok && categoryFilter === oldName) {
            setCategoryFilter(newName.trim());
          }
          return res;
        }}
        onDelete={(name) => {
          const res = deleteExpenseCategory(name);
          if (res.ok && categoryFilter === name) {
            setCategoryFilter('all');
          }
          return res;
        }}
      />
    </div>
  );
}
