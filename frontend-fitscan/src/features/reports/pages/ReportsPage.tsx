import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  DollarSign,
  CreditCard,
  Banknote,
  QrCode,
  Loader2,
  Calendar,
  Users,
  Award,
  TrendingUp,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
} from 'lucide-react';
import { useClientStore } from '../../clients/state/useClientStore';
import { useAuthStore } from '../../auth/state/useAuthStore';
import { useBranchStore } from '../../settings/state/useBranchStore';
import { api } from '../../../services/api';
import { ShieldAlert } from 'lucide-react';
import { CustomDatePicker } from '../../../components/ui/CustomDatePicker';

type ReportTab = 'financial' | 'attendances' | 'memberships' | 'shifts' | 'clients';

export const ReportsPage: React.FC = () => {
  const { theme } = useClientStore();
  const { hasPermission } = useAuthStore();
  const { activeBranchId } = useBranchStore();
  const isDark = theme === 'dark';

  const canViewReports = hasPermission('reports.view');

  const [activeTab, setActiveTab] = useState<ReportTab>('financial');
  const [dateRangePreset, setDateRangePreset] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('all');
  const [scanMethodFilter, setScanMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handlePresetChange = (preset: 'today' | 'week' | 'month' | 'custom') => {
    setDateRangePreset(preset);
    const now = new Date();

    if (preset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'week') {
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      setStartDate(firstDayOfWeek.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'month') {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    }
  };

  const fetchTabReportData = useCallback(async () => {
    setIsLoading(true);
    try {
      let endpoint = '/reports/financial';
      const params: any = {
        start_date: startDate,
        end_date: endDate,
        search: searchQuery.trim() || undefined,
      };

      if (activeTab === 'financial') {
        endpoint = '/reports/financial';
        if (paymentMethod !== 'all') params.payment_method = paymentMethod;
      } else if (activeTab === 'attendances') {
        endpoint = '/reports/attendances';
        if (scanMethodFilter !== 'all') params.scan_method = scanMethodFilter;
      } else if (activeTab === 'memberships') {
        endpoint = '/reports/memberships';
      } else if (activeTab === 'shifts') {
        endpoint = '/reports/shifts';
        if (statusFilter !== 'all') params.status = statusFilter;
      } else if (activeTab === 'clients') {
        endpoint = '/reports/clients';
        if (statusFilter !== 'all') params.status = statusFilter;
      }

      const response = await api.get(endpoint, { params });
      setReportData(response.data);
    } catch (err) {
      console.error(`Error fetching ${activeTab} report:`, err);
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, startDate, endDate, paymentMethod, scanMethodFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchTabReportData();

    const handleBranchChanged = () => fetchTabReportData();
    window.addEventListener('branch-changed', handleBranchChanged);
    return () => window.removeEventListener('branch-changed', handleBranchChanged);
  }, [fetchTabReportData, activeBranchId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTabReportData();
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('/reports/export', {
        params: {
          type: activeTab,
          start_date: startDate,
          end_date: endDate,
          payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_FitScan_${activeTab.toUpperCase()}_${startDate}_al_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!canViewReports) {
    return (
      <div className="p-8 text-center space-y-4 my-12">
        <div className="h-16 w-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Acceso Restringido</h2>
        <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Su perfil actual no cuenta con los permisos necesarios para acceder a los Reportes y Analítica Financiera.
        </p>
      </div>
    );
  }

  const summary = reportData?.summary || {};

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 print:p-0 print:space-y-4 select-none">
      {/* Printable Official Header */}
      <div className="hidden print:block mb-4 pb-4 border-b-2 border-slate-900 text-center">
        <h1 className="text-xl font-black text-slate-900 tracking-wider uppercase">FITSCAN GYM OS — REPORTE OFICIAL AUDITADO</h1>
        <p className="text-xs font-bold text-slate-700 mt-1">Módulo: {activeTab.toUpperCase()} | Período: {startDate} al {endDate}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Emisión: {new Date().toLocaleString('es-BO')}</p>
      </div>

      {/* Header & Export Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Centro de Reportes & Analítica Centralizada
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Inteligencia de Negocio & Auditoría
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Consulta unificada de finanzas, asistencia QR, planes de membresías, arqueo de caja y socios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex-1 sm:flex-initial justify-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className={`flex-1 sm:flex-initial justify-center font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all border flex items-center gap-2 cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200 shadow-sm'
            }`}
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className={`p-1.5 rounded-2xl border flex items-center gap-1 overflow-x-auto print:hidden ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'financial'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Financiero & Cobros</span>
        </button>

        <button
          onClick={() => setActiveTab('attendances')}
          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'attendances'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Asistencias & Afluencia</span>
        </button>

        <button
          onClick={() => setActiveTab('memberships')}
          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'memberships'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Membresías & Planes</span>
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'shifts'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Banknote className="h-4 w-4" />
          <span>Caja Chica & Turnos Auditados</span>
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'clients'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Socios & Afiliaciones</span>
        </button>
      </div>

      {/* Filters & Date Range Bar */}
      <div
        className={`p-3.5 sm:p-4 rounded-3xl border space-y-3.5 print:hidden transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* Row 1: Presets & Dates */}
        <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['today', 'week', 'month', 'custom'] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetChange(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dateRangePreset === preset
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : isDark
                    ? 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {preset === 'today'
                  ? 'Hoy'
                  : preset === 'week'
                  ? 'Esta Semana'
                  : preset === 'month'
                  ? 'Este Mes'
                  : 'Personalizado'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`text-[11px] sm:text-xs font-bold shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Desde:</span>
              <CustomDatePicker
                value={startDate}
                onChange={(val) => {
                  setDateRangePreset('custom');
                  setStartDate(val);
                }}
                isDark={isDark}
                className="w-full sm:w-auto"
              />
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`text-[11px] sm:text-xs font-bold shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Hasta:</span>
              <CustomDatePicker
                value={endDate}
                onChange={(val) => {
                  setDateRangePreset('custom');
                  setEndDate(val);
                }}
                isDark={isDark}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Search & Module Filters */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/60">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-0 sm:min-w-[240px]">
            <input
              type="text"
              placeholder={
                activeTab === 'financial'
                  ? 'Buscar por folio, socio o recibo...'
                  : activeTab === 'attendances'
                  ? 'Buscar socio por nombre, QR o email...'
                  : activeTab === 'memberships'
                  ? 'Buscar socio o plan...'
                  : activeTab === 'shifts'
                  ? 'Buscar usuario o nota de caja...'
                  : 'Buscar socio por nombre, email o teléfono...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:border-emerald-500 transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          </form>

          {/* Module-Specific Dropdown Filter */}
          {activeTab === 'financial' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className={`h-4 w-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <span className={`text-xs font-bold shrink-0 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Método:</span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:border-emerald-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="all">Todos los Métodos</option>
                <option value="cash">Efectivo</option>
                <option value="qr_transfer">QR Transferencia</option>
                <option value="card">Tarjeta</option>
              </select>
            </div>
          )}

          {activeTab === 'attendances' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className={`h-4 w-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <span className={`text-xs font-bold shrink-0 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Método Escaneo:</span>
              <select
                value={scanMethodFilter}
                onChange={(e) => setScanMethodFilter(e.target.value)}
                className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:border-emerald-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="all">Todos los Métodos</option>
                <option value="qr">Cámara QR</option>
                <option value="manual">Ingreso Manual</option>
              </select>
            </div>
          )}

          {(activeTab === 'shifts' || activeTab === 'clients') && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className={`h-4 w-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <span className={`text-xs font-bold shrink-0 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Estado:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:border-emerald-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="all">Todos los Estados</option>
                {activeTab === 'shifts' ? (
                  <>
                    <option value="open">Abiertas</option>
                    <option value="closed">Cerradas</option>
                  </>
                ) : (
                  <>
                    <option value="active">Activos</option>
                    <option value="expired">Vencidos</option>
                    <option value="suspended">Suspendidos</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* DYNAMIC KPI SUMMARY CARDS */}
      {activeTab === 'financial' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Recaudado</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                Bs. {(summary?.total_amount_bs ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {summary?.total_transactions ?? 0} transacciones registradas
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Efectivo en Caja</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Bs. {(summary?.cash_total_bs ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Caja chica física</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Banknote className="h-6 w-6" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>QR Transferencia</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Bs. {(summary?.qr_total_bs ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Bancos / Pago Simple</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <QrCode className="h-6 w-6" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tarjeta Débito/Crédito</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Bs. {(summary?.card_total_bs ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>POS Terminal</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendances' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Asistencias</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {summary?.total_attendances ?? 0}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Ingresos en período</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Lecturas Escáner QR</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {summary?.qr_scans_count ?? 0}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Autónomo en Kiosco</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <QrCode className="h-6 w-6" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ingresos Manuales</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {summary?.manual_scans_count ?? 0}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Asistidos en recepción</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Socios Únicos</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {summary?.unique_clients_count ?? 0}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Afluencia activa</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'memberships' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Membresías Vendidas</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {summary?.total_memberships_assigned ?? 0}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Asignadas en período</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ingresos Generados</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Bs. {(summary?.total_revenue_bs ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Recaudado en ventas</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Socios Activos</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {summary?.active_clients_count ?? 0}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Con membresía vigente</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Socios Vencidos</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                {summary?.expired_clients_count ?? 0}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Requieren renovación</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <XCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Turnos de Caja</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {summary?.total_shifts ?? 0}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Aperturas registradas</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Banknote className="h-6 w-6" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cajas Abiertas</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {summary?.open_shifts_count ?? 0}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>En curso en sucursales</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Efectivo Contado</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Bs. {(summary?.total_actual_bs ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Reportado en arqueos</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Diferencia Auditada</p>
              <h3 className={`text-2xl font-black mt-1 ${
                (summary?.total_difference_bs ?? 0) < 0 ? 'text-rose-400' : (summary?.total_difference_bs ?? 0) > 0 ? 'text-emerald-400' : isDark ? 'text-slate-200' : 'text-slate-900'
              }`}>
                Bs. {(summary?.total_difference_bs ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Faltante / Sobrante</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Nuevas Afiliaciones</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {summary?.new_clients_in_period ?? 0}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Registrados en el período</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Activos en Gimnasio</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {summary?.active_clients_total ?? 0}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Socio con pase al día</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Vencidos en Gimnasio</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                {summary?.expired_clients_total ?? 0}
              </h3>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Socio inactivo / por renovar</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <XCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC DATA TABLE PER TAB */}
      <div
        className={`rounded-3xl border overflow-hidden shadow-xl transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`p-4 sm:p-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} flex flex-col sm:flex-row sm:items-center justify-between gap-1.5`}>
          <h3 className={`font-black text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {activeTab === 'financial' && `Detalle de Comprobantes (${reportData?.payments?.length || 0})`}
            {activeTab === 'attendances' && `Historial de Asistencias (${reportData?.attendances?.length || 0})`}
            {activeTab === 'memberships' && `Registro de Membresías (${reportData?.memberships?.length || 0})`}
            {activeTab === 'shifts' && `Historial Auditado de Cajas (${reportData?.shifts?.length || 0})`}
            {activeTab === 'clients' && `Directorio de Socios (${reportData?.clients?.length || 0})`}
          </h3>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Filtrado del {startDate} al {endDate}
          </span>
        </div>

        <div className="md:hidden px-4 py-1.5 text-[11px] font-medium text-slate-400 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between print:hidden">
          <span>Desliza la tabla horizontalmente</span>
          <span className="font-mono text-emerald-500">↔</span>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'financial' && (
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className={`uppercase tracking-wider text-[10px] font-bold border-b ${isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="py-3.5 px-4">Comprobante</th>
                  <th className="py-3.5 px-4">Sucursal</th>
                  <th className="py-3.5 px-4">Fecha & Hora</th>
                  <th className="py-3.5 px-4">Socio / Cliente</th>
                  <th className="py-3.5 px-4">Concepto / Plan</th>
                  <th className="py-3.5 px-4">Método de Pago</th>
                  <th className="py-3.5 px-4">Monto (Bs.)</th>
                  <th className="py-3.5 px-4">Atendido Por</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                {isLoading ? (
                  <tr><td colSpan={8} className="py-12 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" /><span>Cargando reporte...</span></td></tr>
                ) : !reportData?.payments?.length ? (
                  <tr><td colSpan={8} className="py-12 text-center text-slate-500 font-bold">No se encontraron transacciones en el rango.</td></tr>
                ) : (
                  reportData.payments.map((p: any) => (
                    <tr key={p.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{p.receipt_number}</td>
                      <td className="py-3.5 px-4 font-bold text-indigo-400">{p.branch_name}</td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{p.paid_at}</td>
                      <td className="py-3.5 px-4 font-bold"><div className={isDark ? 'text-white' : 'text-slate-900'}>{p.client_name}</div></td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{p.concept}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${p.payment_method === 'cash' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : p.payment_method === 'qr_transfer' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'bg-purple-500/10 text-purple-400 border-purple-500/30'}`}>
                          {p.payment_method === 'cash' ? <><Banknote className="h-3 w-3" /> Efectivo</> : p.payment_method === 'qr_transfer' ? <><QrCode className="h-3 w-3" /> QR</> : <><CreditCard className="h-3 w-3" /> Tarjeta</>}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Bs. {p.amount.toFixed(2)}</td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{p.processed_by ?? 'Sistema'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'attendances' && (
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className={`uppercase tracking-wider text-[10px] font-bold border-b ${isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="py-3.5 px-4">Socio</th>
                  <th className="py-3.5 px-4">Sucursal</th>
                  <th className="py-3.5 px-4">Fecha & Hora</th>
                  <th className="py-3.5 px-4">Plan Vigente</th>
                  <th className="py-3.5 px-4">Método Escaneo</th>
                  <th className="py-3.5 px-4">Registrado Por</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                {isLoading ? (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" /><span>Cargando asistencias...</span></td></tr>
                ) : !reportData?.attendances?.length ? (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-500 font-bold">No se encontraron asistencias en el rango.</td></tr>
                ) : (
                  reportData.attendances.map((a: any) => (
                    <tr key={a.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                      <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                        {a.client_photo ? <img src={a.client_photo} alt="" className="h-7 w-7 rounded-full object-cover shrink-0" /> : <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center shrink-0"><Users className="h-3.5 w-3.5 text-slate-400" /></div>}
                        <span className={isDark ? 'text-white' : 'text-slate-900'}>{a.client_name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-400">{a.branch_name}</td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{a.check_in_at}</td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{a.membership_type}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${a.scan_method === 'qr' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                          {a.scan_method === 'qr' ? <><QrCode className="h-3 w-3" /> Cámara QR</> : <><UserCheck className="h-3 w-3" /> Manual</>}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{a.scanned_by}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'memberships' && (
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className={`uppercase tracking-wider text-[10px] font-bold border-b ${isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="py-3.5 px-4">Socio</th>
                  <th className="py-3.5 px-4">Membresía / Plan</th>
                  <th className="py-3.5 px-4">Fecha Inicio</th>
                  <th className="py-3.5 px-4">Fecha Vencimiento</th>
                  <th className="py-3.5 px-4">Monto Pagado (Bs.)</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Activado Por</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                {isLoading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" /><span>Cargando membresías...</span></td></tr>
                ) : !reportData?.memberships?.length ? (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-500 font-bold">No se encontraron membresías en el rango.</td></tr>
                ) : (
                  reportData.memberships.map((m: any) => (
                    <tr key={m.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                      <td className={`py-3.5 px-4 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.client_name}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">{m.plan_name}</td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{m.start_date}</td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{m.end_date}</td>
                      <td className="py-3.5 px-4 font-black text-emerald-400">Bs. {m.paid_amount.toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${m.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : m.status === 'expired' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {m.status === 'active' ? 'VIGENTE' : m.status === 'expired' ? 'VENCIDA' : 'CANCELADA'}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{m.activated_by}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'shifts' && (
            <table className="w-full min-w-[780px] text-left text-xs">
              <thead className={`uppercase tracking-wider text-[10px] font-bold border-b ${isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="py-3.5 px-4">Sucursal</th>
                  <th className="py-3.5 px-4">Apertura</th>
                  <th className="py-3.5 px-4">Cierre</th>
                  <th className="py-3.5 px-4">Atendido Por</th>
                  <th className="py-3.5 px-4">Fondo Inicial</th>
                  <th className="py-3.5 px-4">Esperado (Bs.)</th>
                  <th className="py-3.5 px-4">Contado (Bs.)</th>
                  <th className="py-3.5 px-4">Diferencia</th>
                  <th className="py-3.5 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                {isLoading ? (
                  <tr><td colSpan={9} className="py-12 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" /><span>Cargando auditoría de cajas...</span></td></tr>
                ) : !reportData?.shifts?.length ? (
                  <tr><td colSpan={9} className="py-12 text-center text-slate-500 font-bold">No se encontraron turnos de caja en el rango.</td></tr>
                ) : (
                  reportData.shifts.map((s: any) => (
                    <tr key={s.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                      <td className="py-3.5 px-4 font-bold text-indigo-400">{s.branch_name}</td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.opened_at}</td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.closed_at}</td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-white' : 'text-slate-900'} font-bold`}>{s.opened_by}</td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Bs. {s.initial_amount.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-black text-emerald-400">Bs. {s.expected_amount.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-black text-sky-400">Bs. {s.actual_amount.toFixed(2)}</td>
                      <td className={`py-3.5 px-4 font-black ${s.difference < 0 ? 'text-rose-400' : s.difference > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                        Bs. {s.difference.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${s.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {s.status === 'open' ? 'ABIERTA' : 'CERRADA'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'clients' && (
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className={`uppercase tracking-wider text-[10px] font-bold border-b ${isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="py-3.5 px-4">Socio</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Teléfono</th>
                  <th className="py-3.5 px-4">Sucursal</th>
                  <th className="py-3.5 px-4">Fecha Registro</th>
                  <th className="py-3.5 px-4">Último Ingreso</th>
                  <th className="py-3.5 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                {isLoading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" /><span>Cargando directorio de socios...</span></td></tr>
                ) : !reportData?.clients?.length ? (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-500 font-bold">No se encontraron socios en el rango.</td></tr>
                ) : (
                  reportData.clients.map((c: any) => (
                    <tr key={c.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                      <td className={`py-3.5 px-4 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{c.full_name}</td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{c.email}</td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{c.phone}</td>
                      <td className="py-3.5 px-4 font-bold text-indigo-400">{c.branch_name}</td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{c.registered_at}</td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{c.last_attendance}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : c.status === 'expired' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {c.status === 'active' ? 'ACTIVO' : c.status === 'expired' ? 'VENCIDO' : 'INACTIVO'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
