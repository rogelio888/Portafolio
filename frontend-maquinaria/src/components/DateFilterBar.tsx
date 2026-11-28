import type { DateRangePeriod } from '../utils/formatters';

interface DateFilterBarProps {
  period: DateRangePeriod;
  fromDate: string;
  toDate: string;
  onChangePeriod: (period: DateRangePeriod) => void;
  onChangeFromDate: (date: string) => void;
  onChangeToDate: (date: string) => void;
  presets?: { id: DateRangePeriod; label: string }[];
  compact?: boolean;
}

const DEFAULT_PRESETS: { id: DateRangePeriod; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: '7d', label: '7 días' },
  { id: '90d', label: '3 meses' },
  { id: '365d', label: '1 año' },
  { id: 'custom', label: 'Rango fechas' },
];

export function DateFilterBar({
  period,
  fromDate,
  toDate,
  onChangePeriod,
  onChangeFromDate,
  onChangeToDate,
  presets = DEFAULT_PRESETS,
  compact = false,
}: DateFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {presets.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChangePeriod(p.id)}
          className={`btn-press rounded-lg border font-semibold ${
            compact ? 'h-7 px-2 text-[11px]' : 'h-8 px-2.5 text-xs'
          } ${
            period === p.id
              ? 'border-[#14171A] bg-[#14171A] text-white'
              : 'border-[#D6D6CD] bg-[#F8F8F5] text-[#434B53] hover:border-[#14171A]'
          }`}
        >
          {p.label}
        </button>
      ))}
      {period === 'custom' ? (
        <div className="flex flex-wrap items-center gap-1.5 pl-1">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onChangeFromDate(e.target.value)}
            aria-label="Fecha desde"
            className="tabular-nums h-8 rounded-md border border-[#D6D6CD] bg-white px-2 text-xs text-[#14171A]"
          />
          <span className="text-xs text-[#5B636B]">a</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onChangeToDate(e.target.value)}
            aria-label="Fecha hasta"
            className="tabular-nums h-8 rounded-md border border-[#D6D6CD] bg-white px-2 text-xs text-[#14171A]"
          />
        </div>
      ) : null}
    </div>
  );
}
