import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
  isDark?: boolean;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  className = '',
  isDark = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or current date
  const parsedDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewDate, setViewDate] = useState<Date>(isNaN(parsedDate.getTime()) ? new Date() : parsedDate);

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewDate(d);
      }
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const daysOfWeek = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay(); // 0 is Sun
    return day === 0 ? 6 : day - 1; // 0 for Mon, 6 for Sun
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  const prevMonthDays = getDaysInMonth(year, month - 1);

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const formatOutputDate = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const handleSelectDay = (dayNum: number) => {
    const formatted = formatOutputDate(year, month, dayNum);
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const formatted = formatOutputDate(today.getFullYear(), today.getMonth(), today.getDate());
    setViewDate(today);
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const formatDisplayDate = (valStr: string) => {
    if (!valStr) return placeholder;
    const parts = valStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return valStr;
  };

  const isSelectedDay = (dayNum: number) => {
    if (!value) return false;
    const parts = value.split('-');
    if (parts.length === 3) {
      return (
        Number(parts[0]) === year &&
        Number(parts[1]) === month + 1 &&
        Number(parts[2]) === dayNum
      );
    }
    return false;
  };

  const isToday = (dayNum: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === dayNum
    );
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-3 py-2 text-xs rounded-xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer select-none ${
          value
            ? isDark
              ? 'bg-slate-900 border-emerald-500/60 text-white shadow-md shadow-emerald-500/10'
              : 'bg-white border-emerald-500 text-slate-900 shadow-sm'
            : isDark
            ? 'bg-slate-950 border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-600'
            : 'bg-slate-50 border-slate-300 text-slate-500 hover:text-slate-900'
        } ${className}`}
      >
        <div className="flex items-center gap-1.5 font-mono font-bold">
          <CalendarIcon className={`h-3.5 w-3.5 shrink-0 ${value ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span>{formatDisplayDate(value)}</span>
        </div>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
            title="Limpiar fecha"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[190] bg-slate-950/50 backdrop-blur-[1px] sm:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className={`fixed sm:absolute left-1/2 sm:left-0 top-1/2 sm:top-full -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 sm:translate-y-0 mt-0 sm:mt-2 z-[200] w-[calc(100vw-2rem)] max-w-[300px] sm:w-72 rounded-3xl p-4 border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-slate-900/95 border-slate-800 text-white shadow-slate-950/80'
              : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
          }`}>
          {/* Calendar Header: Month/Year & Nav */}
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <span className={`font-extrabold text-sm capitalize tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {monthNames[month]} <span className="text-emerald-500 dark:text-emerald-400 font-mono">{year}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Mes anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Mes siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center text-[10px] font-extrabold uppercase text-slate-400 py-2">
            {daysOfWeek.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Prev Month Days */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <span
                key={`prev-${idx}`}
                className="py-1.5 text-slate-600 dark:text-slate-600 font-medium opacity-40 select-none"
              >
                {prevMonthDays - firstDayOfWeek + idx + 1}
              </span>
            ))}

            {/* Current Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const selected = isSelectedDay(dayNum);
              const today = isToday(dayNum);

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/30 scale-105'
                      : today
                      ? 'border border-emerald-500/60 text-emerald-500 dark:text-emerald-400 font-extrabold hover:bg-emerald-500/10'
                      : isDark
                      ? 'hover:bg-slate-800/80 text-slate-200 hover:text-emerald-400'
                      : 'hover:bg-slate-100 text-slate-700 hover:text-emerald-600'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Footer */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/80 text-[11px]">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-rose-400 font-bold transition-colors cursor-pointer"
            >
              Borrar
            </button>

            <button
              type="button"
              onClick={handleSelectToday}
              className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 rounded-lg font-extrabold transition-colors cursor-pointer"
            >
              Hoy
            </button>
          </div>
          </div>
        </>
      )}
    </div>
  );
};
