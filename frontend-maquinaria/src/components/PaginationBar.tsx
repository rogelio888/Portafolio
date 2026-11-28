import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  compact?: boolean;
}

export function PaginationBar({
  currentPage,
  totalItems,
  pageSize,
  itemLabel,
  onPageChange,
  compact = false,
}: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#D6D6CD] bg-white text-xs ${
        compact ? 'px-3 py-2' : 'px-4 py-3'
      }`}
    >
      <span className="tabular-nums text-[#5B636B]">
        Mostrando {start}–{end} de <strong className="text-[#14171A]">{totalItems}</strong>{' '}
        {itemLabel}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
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
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          className="btn-press inline-flex h-8 items-center gap-1 rounded-md border border-[#D6D6CD] bg-[#F8F8F5] px-2.5 font-semibold text-[#14171A] disabled:opacity-40"
        >
          Siguiente
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
