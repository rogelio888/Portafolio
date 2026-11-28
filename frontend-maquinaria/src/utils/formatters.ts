import type { InventoryBatch, MachineItem } from '../types/store';

const bsFormatter = new Intl.NumberFormat('es-BO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const bsWholeFormatter = new Intl.NumberFormat('es-BO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatBs(amount: number, showDecimals = false): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `Bs ${showDecimals ? bsFormatter.format(safe) : bsWholeFormatter.format(safe)}`;
}

export function formatUsd(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `USD ${bsFormatter.format(safe)}`;
}

export function formatDateTime(iso: string): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dt);
}

export function formatDateShort(dateStr: string): string {
  const dt = new Date(dateStr.length === 10 ? `${dateStr}T12:00:00` : dateStr);
  if (Number.isNaN(dt.getTime())) return dateStr;
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
  }).format(dt);
}

/**
 * Regla asimétrica del negocio:
 * - Si el lote se compró en BOB, mantiene costo y precio fijos en Bs.
 * - Si el lote se compró en USD:
 *     TC_aplicado = max(TC_compra_lote, TC_actual)
 *   De modo que si el dólar baja, los saldos antiguos conservan el TC mayor (protección contra pérdida);
 *   y si el dólar sube, todos los saldos se actualizan automáticamente al TC actual.
 */
export function getEffectiveBatchExchangeRate(
  batch: Pick<InventoryBatch, 'currency' | 'purchaseExchangeRate'>,
  currentExchangeRate: number
): number {
  if (batch.currency === 'BOB') return 1;
  return Math.max(batch.purchaseExchangeRate, currentExchangeRate);
}

export function getBatchUnitCostBs(
  batch: Pick<InventoryBatch, 'currency' | 'unitCostOriginal' | 'purchaseExchangeRate'>
): number {
  if (batch.currency === 'BOB') return Math.round(batch.unitCostOriginal);
  return Math.round(batch.unitCostOriginal * batch.purchaseExchangeRate);
}

export function getBatchUnitSaleBs(
  batch: Pick<InventoryBatch, 'currency' | 'unitSaleOriginal' | 'purchaseExchangeRate'>,
  currentExchangeRate: number
): number {
  if (batch.currency === 'BOB') return Math.round(batch.unitSaleOriginal);
  const effectiveTc = getEffectiveBatchExchangeRate(batch, currentExchangeRate);
  return Math.round(batch.unitSaleOriginal * effectiveTc);
}

export function getActiveBatch(item: Pick<MachineItem, 'batches'>): InventoryBatch | null {
  return item.batches.find((b) => b.remainingQty > 0) ?? item.batches[0] ?? null;
}

export function getTotalStock(item: Pick<MachineItem, 'batches'>): number {
  return item.batches.reduce((sum, b) => sum + b.remainingQty, 0);
}

export function getItemDisplayPriceBs(
  item: Pick<MachineItem, 'batches'>,
  currentExchangeRate: number
): number {
  const active = getActiveBatch(item);
  if (!active) return 0;
  return getBatchUnitSaleBs(active, currentExchangeRate);
}

export function getItemDisplayCostBs(item: Pick<MachineItem, 'batches'>): number {
  const active = getActiveBatch(item);
  if (!active) return 0;
  return getBatchUnitCostBs(active);
}

export function getItemStockValueCostBs(item: Pick<MachineItem, 'batches'>): number {
  return item.batches.reduce(
    (sum, b) => sum + b.remainingQty * getBatchUnitCostBs(b),
    0
  );
}

export function getItemStockValueSaleBs(
  item: Pick<MachineItem, 'batches'>,
  currentExchangeRate: number
): number {
  return item.batches.reduce(
    (sum, b) => sum + b.remainingQty * getBatchUnitSaleBs(b, currentExchangeRate),
    0
  );
}

export type StockLevel = 'ok' | 'low' | 'out';

export function getStockLevel(item: Pick<MachineItem, 'batches' | 'minStock'>): StockLevel {
  const stock = getTotalStock(item);
  if (stock <= 0) return 'out';
  if (stock <= item.minStock) return 'low';
  return 'ok';
}

export function getMarginPercent(costBs: number, priceBs: number): number {
  if (priceBs <= 0) return 0;
  return Math.round(((priceBs - costBs) / priceBs) * 100);
}

export function isSameLocalDay(isoA: string, dateB = new Date()): boolean {
  const a = new Date(isoA.length === 10 ? `${isoA}T12:00:00` : isoA);
  return (
    a.getFullYear() === dateB.getFullYear() &&
    a.getMonth() === dateB.getMonth() &&
    a.getDate() === dateB.getDate()
  );
}

export function getDaysSince(iso: string, refDate = new Date()): number {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return 0;
  const diffMs = refDate.getTime() - dt.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 3600 * 24)));
}

export type DateRangePeriod = 'all' | '7d' | '30d' | '90d' | '365d' | 'custom';

export function formatDateWithYear(iso: string): string {
  const dt = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(dt);
}

export function matchesDateRange(
  isoOrDate: string,
  period: DateRangePeriod,
  customFrom: string,
  customTo: string,
  nowMs = Date.now()
): boolean {
  if (period === 'all') return true;
  const normalized = isoOrDate.length === 10 ? `${isoOrDate}T12:00:00` : isoOrDate;
  const ts = new Date(normalized).getTime();
  if (Number.isNaN(ts)) return true;

  if (period === 'custom') {
    const fromMs = customFrom ? new Date(`${customFrom}T00:00:00`).getTime() : 0;
    const toMs = customTo ? new Date(`${customTo}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;
    return ts >= fromMs && ts <= toMs;
  }

  const days =
    period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  return ts >= nowMs - days * 86400_000;
}
