import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  DollarSign,
  UserCheck,
  UserX,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  AlertTriangle,
  CreditCard,
  Banknote,
  Calendar,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useClientStore } from '../../clients/state/useClientStore';
import { useBranchStore } from '../../settings/state/useBranchStore';
import { api } from '../../../services/api';

interface DashboardStatsData {
  stats: {
    active_clients_count: number;
    expired_clients_count: number;
    expiring_soon_count: number;
    today_attendances_count: number;
    total_clients_count: number;
    month_revenue_bs: number;
    prev_month_revenue_bs: number;
    revenue_growth_percent: number;
    payment_breakdown: {
      cash: number;
      qr_transfer: number;
      card: number;
    };
    cash_shift_active: boolean;
    cash_shift_opened_at?: string;
    open_shifts_count?: number;
    active_branch_name?: string;
  };
  weekly_chart: Array<{
    day: string;
    date: string;
    asistencias: number;
    ingresos: number;
  }>;
  peak_hours_chart: Array<{
    hour: string;
    count: number;
  }>;
  branch_comparison?: Array<{
    branch_id: string;
    branch_name: string;
    revenue_bs: number;
    attendances_today: number;
    clients_count: number;
  }>;
}

const DashboardSkeleton: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const cardBg = isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200';
  const pulseBg = isDark ? 'bg-slate-800/80' : 'bg-slate-200/80';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Alert Skeleton */}
      <div className={`h-14 rounded-2xl border p-4 ${cardBg} flex items-center justify-between`}>
        <div className="flex items-center gap-3 w-1/2 sm:w-1/3">
          <div className={`h-5 w-5 rounded-full ${pulseBg} animate-pulse shrink-0`} />
          <div className={`h-4 w-full rounded-lg ${pulseBg} animate-pulse`} />
        </div>
        <div className={`h-4 w-28 rounded-lg ${pulseBg} animate-pulse`} />
      </div>

      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`rounded-2xl border p-5 ${cardBg} flex items-center justify-between shadow-sm`}>
            <div className="space-y-3 w-2/3">
              <div className={`h-3 w-24 rounded-md ${pulseBg} animate-pulse`} />
              <div className={`h-8 w-20 rounded-xl ${pulseBg} animate-pulse`} />
              <div className={`h-3 w-28 rounded-md ${pulseBg} animate-pulse`} />
            </div>
            <div className={`h-12 w-12 rounded-2xl ${pulseBg} animate-pulse shrink-0`} />
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment breakdown Skeleton */}
        <div className={`rounded-3xl border p-6 ${cardBg} space-y-4 shadow-sm`}>
          <div className={`h-5 w-44 rounded-md ${pulseBg} animate-pulse`} />
          <div className={`h-3 w-56 rounded-md ${pulseBg} animate-pulse`} />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-16 rounded-2xl ${pulseBg} animate-pulse`} />
            ))}
          </div>
        </div>

        {/* Weekly Chart Skeleton */}
        <div className={`lg:col-span-2 rounded-3xl border p-6 ${cardBg} space-y-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className={`h-5 w-48 rounded-md ${pulseBg} animate-pulse`} />
              <div className={`h-3 w-64 rounded-md ${pulseBg} animate-pulse`} />
            </div>
            <div className={`h-6 w-28 rounded-full ${pulseBg} animate-pulse`} />
          </div>
          <div className={`h-64 w-full rounded-2xl ${pulseBg} animate-pulse mt-2`} />
        </div>
      </div>

      {/* Branch Comparison Chart Skeleton */}
      <div className={`rounded-3xl border p-6 ${cardBg} space-y-4 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className={`h-5 w-56 rounded-md ${pulseBg} animate-pulse`} />
            <div className={`h-3 w-72 rounded-md ${pulseBg} animate-pulse`} />
          </div>
          <div className={`h-6 w-32 rounded-full ${pulseBg} animate-pulse`} />
        </div>
        <div className={`h-64 w-full rounded-2xl ${pulseBg} animate-pulse mt-2`} />
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { setKioskMode, theme } = useClientStore();
  const { activeBranchId } = useBranchStore();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [data, setData] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDashboardStats = async (showSkeleton = false) => {
    if (showSkeleton) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats(true);

    const handleBranchChanged = () => fetchDashboardStats(true);
    window.addEventListener('branch-changed', handleBranchChanged);
    return () => window.removeEventListener('branch-changed', handleBranchChanged);
  }, []);

  const handleLaunchKiosk = () => {
    setKioskMode(true);
    navigate('/asistencias');
  };

  const stats = data?.stats;
  const weeklyChart = data?.weekly_chart || [];
  const peakHoursChart = data?.peak_hours_chart || [];

  return (
    <div className="p-6 space-y-6">
      {/* Banner Superior */}
      <div
        className={`rounded-3xl border p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl transition-colors ${
          isDark
            ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border-emerald-500/20'
            : 'bg-gradient-to-r from-white via-slate-50 to-emerald-50 border-emerald-200'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Panel de Control Principal
            </span>
          </div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Resumen General del Gimnasio
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Monitoreo en tiempo real de asistencias por QR, membresías e ingresos en Bolivianos (Bs.).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardStats(true)}
            disabled={isRefreshing}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Actualizar datos"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={handleLaunchKiosk}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 px-5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="h-4 w-4" />
            Abrir Módulo de Asistencia Kiosco
          </button>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton isDark={isDark} />
      ) : (
        <>
          {/* Alerta de Caja Chica */}
          {stats && (activeBranchId !== 'all' || stats.cash_shift_active) && (
            <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            stats.cash_shift_active
              ? isDark
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : isDark
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {stats.cash_shift_active ? (
              <DollarSign className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            )}
            <span>
              {stats.cash_shift_active
                ? `Caja Chica Abierta ${stats.active_branch_name ? `(${stats.active_branch_name})` : ''} hoy a las ${stats.cash_shift_opened_at} hrs.`
                : 'No hay un turno de caja chica abierto en este momento.'}
            </span>
          </div>

          <button
            onClick={() => navigate('/caja')}
            className={`font-bold underline cursor-pointer text-xs ${
              stats.cash_shift_active
                ? 'text-emerald-400 hover:text-emerald-300'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            {stats.cash_shift_active ? 'Ver Estado de Caja' : 'Abrir Caja Chica'}
          </button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Socios Activos */}
        <div
          className={`rounded-2xl border p-5 flex items-center justify-between shadow-sm transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Socios Activos
            </p>
            {isLoading ? (
              <div className="h-7 w-16 bg-slate-800 animate-pulse rounded mt-1" />
            ) : (
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {stats?.active_clients_count ?? 0}
              </h3>
            )}
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold mt-2 ${
                (stats?.expiring_soon_count ?? 0) > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              <Calendar className="h-3 w-3" />
              {stats?.expiring_soon_count ?? 0} por vencer en 7 días
            </span>
          </div>
          <div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${
              isDark
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}
          >
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Asistencias Hoy */}
        <div
          className={`rounded-2xl border p-5 flex items-center justify-between shadow-sm transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Asistencias Hoy
            </p>
            {isLoading ? (
              <div className="h-7 w-16 bg-slate-800 animate-pulse rounded mt-1" />
            ) : (
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {stats?.today_attendances_count ?? 0}
              </h3>
            )}
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-bold mt-2 ${
                isDark ? 'text-teal-400' : 'text-teal-600'
              }`}
            >
              <Clock className="h-3 w-3" /> Escaneos QR hoy
            </span>
          </div>
          <div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${
              isDark
                ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                : 'bg-teal-50 text-teal-600 border-teal-200'
            }`}
          >
            <QrCode className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Socios Vencidos */}
        <div
          className={`rounded-2xl border p-5 flex items-center justify-between shadow-sm transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Membresías Vencidas
            </p>
            {isLoading ? (
              <div className="h-7 w-16 bg-slate-800 animate-pulse rounded mt-1" />
            ) : (
              <h3 className="text-2xl font-black text-rose-500 mt-1">
                {stats?.expired_clients_count ?? 0}
              </h3>
            )}
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-500 mt-2">
              Requieren renovación
            </span>
          </div>
          <div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${
              isDark
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}
          >
            <UserX className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Ingresos del Mes */}
        <div
          className={`rounded-2xl border p-5 flex items-center justify-between shadow-sm transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Ingresos del Mes
            </p>
            {isLoading ? (
              <div className="h-7 w-24 bg-slate-800 animate-pulse rounded mt-1" />
            ) : (
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Bs. {(stats?.month_revenue_bs ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </h3>
            )}
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-bold mt-2 ${
                (stats?.revenue_growth_percent ?? 0) >= 0
                  ? isDark
                    ? 'text-emerald-400'
                    : 'text-emerald-600'
                  : 'text-rose-500'
              }`}
            >
              {(stats?.revenue_growth_percent ?? 0) >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {stats?.revenue_growth_percent ?? 0}% vs mes anterior
            </span>
          </div>
          <div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${
              isDark
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}
          >
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Desglose por Método de Pago */}
      <div
        className={`rounded-3xl border p-5 transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Desglose de Recaudación del Mes
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Distribución de ingresos por canal de pago
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Banknote className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Efectivo</p>
                <h4 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Bs. {(stats?.payment_breakdown.cash ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </h4>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>QR Transferencia</p>
                <h4 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Bs. {(stats?.payment_breakdown.qr_transfer ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </h4>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tarjeta Débito/Crédito</p>
                <h4 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Bs. {(stats?.payment_breakdown.card ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos Estadísticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Horas Pico */}
        <div
          className={`rounded-3xl border p-5 transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Horas Pico de Asistencia
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Flujo promedio de ingresos por hora en el gimnasio hoy
              </p>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Hoy
            </span>
          </div>

          <div className="h-64 w-full">
            {isLoading ? (
              <div className="h-full w-full bg-slate-950/50 animate-pulse rounded-2xl flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursChart}>
                  <XAxis dataKey="hour" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} />
                  <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '12px',
                      color: isDark ? '#ffffff' : '#0f172a',
                    }}
                    labelStyle={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} name="Asistencias" minPointSize={2} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico 2: Tendencia Semanal */}
        <div
          className={`rounded-3xl border p-5 transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Tendencia de Asistencias e Ingresos
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Rendimiento de los últimos 7 días
              </p>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Últimos 7 Días
            </span>
          </div>

          <div className="h-64 w-full">
            {isLoading ? (
              <div className="h-full w-full bg-slate-950/50 animate-pulse rounded-2xl flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyChart}>
                  <defs>
                    <linearGradient id="colorAsistencias" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} />
                  <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '12px',
                      color: isDark ? '#ffffff' : '#0f172a',
                    }}
                    labelStyle={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="asistencias"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorAsistencias)"
                    name="Asistencias"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico 3: Rendimiento Comparativo por Sucursal */}
      {data?.branch_comparison && data.branch_comparison.length > 0 && (
        <div
          className={`rounded-3xl border p-5 transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Rendimiento Comparativo por Sucursal
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Recaudación del mes (Bs.) y asistencias registradas hoy entre sedes
              </p>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              Consolidado de Cadena
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.branch_comparison}>
                <XAxis dataKey="branch_name" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderRadius: '12px',
                    color: isDark ? '#ffffff' : '#0f172a',
                  }}
                  labelStyle={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 'bold' }}
                />
                <Bar dataKey="revenue_bs" fill="#10b981" radius={[6, 6, 0, 0]} name="Recaudación Mes (Bs.)" />
                <Bar dataKey="attendances_today" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Asistencias Hoy" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  )}
</div>
);
};
