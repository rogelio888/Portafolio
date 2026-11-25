import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface PeriodCalendarProps {
  startDate: string; // ISO format YYYY-MM-DD or full ISO
  endDate: string;   // ISO format YYYY-MM-DD or full ISO
  clientName?: string;
  planName?: string;
  attendanceDates?: string[];
}

export const ClientPeriodCalendar: React.FC<PeriodCalendarProps> = ({
  startDate,
  endDate,
  clientName,
  planName,
  attendanceDates = [],
}) => {
  const parseDate = (dStr: string): Date => {
    if (!dStr) return new Date();
    const clean = dStr.split('T')[0];
    const [y, m, d] = clean.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  // Focus view month on start date initially
  const [viewDate, setViewDate] = useState<Date>(new Date(start.getFullYear(), start.getMonth(), 1));

  useEffect(() => {
    setViewDate(new Date(start.getFullYear(), start.getMonth(), 1));
  }, [startDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  // Days in month calculation
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isInRange = (target: Date) => {
    const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    return t >= s && t <= e;
  };

  const isStartDay = (target: Date) => isSameDay(target, start);
  const isEndDay = (target: Date) => isSameDay(target, end);

  // Build 42 cell grid (6 weeks)
  const calendarCells = [];

  // Previous month padding days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const dateObj = new Date(year, month - 1, dayNum);
    calendarCells.push({ date: dateObj, dayNum, isCurrentMonth: false });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dateObj = new Date(year, month, dayNum);
    calendarCells.push({ date: dateObj, dayNum, isCurrentMonth: true });
  }

  // Next month padding days to complete 35 or 42 cells
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const dateObj = new Date(year, month + 1, dayNum);
    calendarCells.push({ date: dateObj, dayNum, isCurrentMonth: false });
  }

  // Status badge logic
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

  let badgeText = '';
  let badgeStyle = '';

  if (startTime > todayStart) {
    const daysUntilStart = Math.ceil((startTime - todayStart) / (1000 * 3600 * 24));
    badgeText = `Inicia en ${daysUntilStart} día${daysUntilStart === 1 ? '' : 's'}`;
    badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (endTime < todayStart) {
    badgeText = 'Membresía Vencida';
    badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else {
    const daysLeft = Math.max(0, Math.ceil((endTime - todayStart) / (1000 * 3600 * 24)));
    badgeText = `${daysLeft} día${daysLeft === 1 ? '' : 's'} restante${daysLeft === 1 ? '' : 's'}`;
    badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }

  return (
    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-white select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{planName || 'Período de Membresía'}</h4>
            {clientName && <p className="text-[10px] text-slate-400">{clientName}</p>}
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${badgeStyle}`}>
          <Clock className="h-3 w-3" />
          {badgeText}
        </span>
      </div>

      {/* Month Navigator Header */}
      <div className="flex items-center justify-between px-2 mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <h3 className="text-xs font-extrabold tracking-wide text-slate-200">
          {monthNames[month]} {year}
        </h3>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {dayNames.map((d) => (
          <span key={d} className="text-[10px] font-bold text-slate-500 py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-0 text-center">
        {calendarCells.map((cell, idx) => {
          const inRange = isInRange(cell.date);
          const isStart = isStartDay(cell.date);
          const isEnd = isEndDay(cell.date);

          const cellYear = cell.date.getFullYear();
          const cellMonth = String(cell.date.getMonth() + 1).padStart(2, '0');
          const cellDay = String(cell.date.getDate()).padStart(2, '0');
          const cellDateFormatted = `${cellYear}-${cellMonth}-${cellDay}`;

          const hasAttended = attendanceDates.some((dStr) => dStr.split('T')[0] === cellDateFormatted);

          let bgClasses = 'text-slate-400 hover:bg-slate-800/50';

          if (!cell.isCurrentMonth) {
            bgClasses = 'text-slate-600/40 opacity-40';
          }

          if (inRange && cell.isCurrentMonth) {
            bgClasses = 'bg-indigo-950/40 text-slate-200 font-semibold border-y border-indigo-500/20';
          }

          if (hasAttended && inRange && cell.isCurrentMonth) {
            bgClasses = 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.25)]';
          }

          if (isStart) {
            bgClasses = 'bg-sky-500 text-slate-950 font-black rounded-l-xl shadow-md shadow-sky-500/30';
          }

          if (isEnd) {
            bgClasses = 'bg-rose-500 text-white font-black rounded-r-xl shadow-md shadow-rose-500/30';
          }

          if (isStart && isEnd) {
            bgClasses = 'bg-gradient-to-r from-sky-500 to-rose-500 text-slate-950 font-black rounded-xl shadow-md';
          }

          return (
            <div
              key={idx}
              className={`h-8 flex items-center justify-center text-xs relative transition-all ${bgClasses}`}
              title={hasAttended ? `Asistencia registrada el ${cellDateFormatted}` : undefined}
            >
              <span>{cell.dayNum}</span>

              {hasAttended && !isStart && !isEnd && (
                <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black flex items-center justify-center shadow-sm">
                  ✓
                </span>
              )}

              {hasAttended && (isStart || isEnd) && (
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black flex items-center justify-center ring-2 ring-slate-900 shadow-md">
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Range Legend */}
      <div className="mt-4 pt-3 border-t border-slate-800 space-y-2.5 text-[10px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8] inline-block" />
            <span>Inicio: <strong className="text-sky-300">{start.toLocaleDateString('es-BO')}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185] inline-block" />
            <span>Vence: <strong className="text-rose-300">{end.toLocaleDateString('es-BO')}</strong></span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] inline-block" />
            <span>Asistencias Marcadas ({attendanceDates.length})</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span className="h-2 w-4 rounded-sm bg-indigo-950/60 border border-indigo-500/30 inline-block" />
            <span>Cobertura Vigente</span>
          </div>
        </div>
      </div>
    </div>
  );
};
