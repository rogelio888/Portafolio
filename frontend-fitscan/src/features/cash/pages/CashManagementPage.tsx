import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  QrCode,
  Lock,
  Unlock,
  History,
  TrendingUp,
  Loader2,
  AlertCircle,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { api } from '../../../services/api';
import { OpenCashModal } from '../components/OpenCashModal';
import { CloseCashModal } from '../components/CloseCashModal';
import { useAuthStore } from '../../auth/state/useAuthStore';
import { useBranchStore } from '../../settings/state/useBranchStore';
import { CustomDatePicker } from '../../../components/ui/CustomDatePicker';
import { Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export const CashManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const { activeBranchId } = useBranchStore();
  const isAdmin = user?.roles?.includes('admin') || user?.role === 'Administrador General';

  const [activeShift, setActiveShift] = useState<any>(null);
  const [branchesSummary, setBranchesSummary] = useState<any[]>([]);
  const [isConsolidated, setIsConsolidated] = useState<boolean>(false);
  const [historyShifts, setHistoryShifts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState<boolean>(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState<boolean>(false);

  // History Filter State
  const [historyStartDate, setHistoryStartDate] = useState<string>('');
  const [historyEndDate, setHistoryEndDate] = useState<string>('');
  const [historyPreset, setHistoryPreset] = useState<'today' | 'week' | 'month' | 'custom'>('custom');
  const [historyStatus, setHistoryStatus] = useState<string>('all');

  // History Pagination State
  const [historyCurrentPage, setHistoryCurrentPage] = useState<number>(1);
  const [historyLastPage, setHistoryLastPage] = useState<number>(1);
  const [historyTotal, setHistoryTotal] = useState<number>(0);

  const handlePresetChange = (preset: 'today' | 'week' | 'month' | 'custom') => {
    setHistoryPreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'today') {
      setHistoryStartDate(todayStr);
      setHistoryEndDate(todayStr);
    } else if (preset === 'week') {
      const dayOfWeek = today.getDay();
      const diffToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diffToMon);
      setHistoryStartDate(monday.toISOString().split('T')[0]);
      setHistoryEndDate(todayStr);
    } else if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setHistoryStartDate(firstDay.toISOString().split('T')[0]);
      setHistoryEndDate(todayStr);
    }
  };

  const fetchHistory = async (page = 1) => {
    try {
      const res = await api.get('/cash-shifts/history', {
        params: {
          page,
          start_date: historyStartDate || undefined,
          end_date: historyEndDate || undefined,
          status: historyStatus !== 'all' ? historyStatus : undefined,
          per_page: 15,
        },
      });
      const resData = res.data;
      const items = resData?.data || (Array.isArray(resData) ? resData : []);
      setHistoryShifts(Array.isArray(items) ? items : []);
      setHistoryCurrentPage(resData?.current_page || 1);
      setHistoryLastPage(resData?.last_page || 1);
      setHistoryTotal(resData?.total || (Array.isArray(items) ? items.length : 0));
    } catch (err) {
      console.error('Error fetching cash history:', err);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [activeRes] = await Promise.all([
        api.get('/cash-shifts/active'),
      ]);

      if (activeRes.data?.is_consolidated) {
        setIsConsolidated(true);
        setBranchesSummary(activeRes.data?.branches_summary || []);
        setActiveShift(null);
      } else {
        setIsConsolidated(false);
        setBranchesSummary([]);
        setActiveShift(activeRes.data?.active_shift || null);
      }
      await fetchHistory(1);
    } catch (err) {
      console.error('Error loading cash data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, [historyStartDate, historyEndDate, historyStatus]);

  useEffect(() => {
    fetchData();

    const handleBranchChanged = () => fetchData();
    window.addEventListener('branch-changed', handleBranchChanged);
    return () => window.removeEventListener('branch-changed', handleBranchChanged);
  }, []);

  const openCount = branchesSummary.filter((b) => b.is_open).length;
  const closedCount = branchesSummary.filter((b) => !b.is_open).length;
  const totalCashCollected = branchesSummary.reduce((acc, b) => acc + (b.shift?.expected_cash || 0), 0);
  const totalDigitalSales = branchesSummary.reduce((acc, b) => acc + ((b.shift?.qr_sales || 0) + (b.shift?.card_sales || 0)), 0);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <DollarSign className="h-7 w-7 text-emerald-500 dark:text-emerald-400" />
            Control de Caja Chica & Turnos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestión de apertura, arqueo de caja y rendimiento de cobros en Bolivianos (Bs.)
          </p>
        </div>

        <div>
          {isAdmin && (isConsolidated || activeBranchId === 'all') ? (
            <button
              type="button"
              onClick={() => setIsOpenModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Unlock className="h-4 w-4" />
              <span>Abrir Caja en Sucursal</span>
            </button>
          ) : activeShift ? (
            <button
              type="button"
              onClick={() => setIsCloseModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              <span>Arqueo & Cerrar Caja ({activeShift.branch_name || 'Sede'})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpenModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Unlock className="h-4 w-4" />
              <span>Abrir Caja Chica</span>
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-emerald-500 dark:text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Cargando información de caja chica...</p>
        </div>
      ) : (
        <>
          {/* CONSOLIDATED ADMIN VIEW (TODAS LAS SUCURSALES) */}
          {isAdmin && isConsolidated ? (
            <div className="space-y-6">
              {/* Summary Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm dark:shadow-md">
                  <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cajas Abiertas</span>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{openCount} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">de {branchesSummary.length} sucursales</span></p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm dark:shadow-md">
                  <div className="h-10 w-10 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cajas Cerradas</span>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{closedCount} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">sucursales</span></p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm dark:shadow-md">
                  <div className="h-10 w-10 bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Efectivo Activo Total</span>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">Bs. {totalCashCollected.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm dark:shadow-md">
                  <div className="h-10 w-10 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center shrink-0">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cobros Digitales</span>
                    <p className="text-lg font-black text-purple-600 dark:text-purple-300">Bs. {totalDigitalSales.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Branch Cards Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  Estado de Caja Chica por Sucursal (Cadena FitScan)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {branchesSummary.map((item) => (
                    <div
                      key={item.branch.id}
                      className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm dark:shadow-xl transition-all relative overflow-hidden ${
                        item.is_open
                          ? 'border-emerald-500/40 shadow-emerald-500/5'
                          : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Status Header */}
                      <div className="flex items-start justify-between gap-3 mb-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                        <div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{item.branch.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.branch.address || 'Sede Central'}</p>
                        </div>
                        {item.is_open ? (
                          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm shadow-emerald-500/10">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            CAJA ABIERTA
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 shrink-0">
                            <span className="h-2 w-2 rounded-full bg-rose-500 dark:bg-rose-400" />
                            CAJA CERRADA
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      {item.is_open ? (
                        <div className="space-y-4">
                          {/* Receptionist info */}
                          <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <UserCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                              <span>Atendido por: <strong className="text-slate-900 dark:text-white">{item.shift.opened_by}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{item.shift.opened_at}</span>
                            </div>
                          </div>

                          {/* Financial Details Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">Monto Inicial</span>
                              <span className="text-xs font-black text-slate-900 dark:text-white">Bs. {item.shift.initial_amount.toFixed(2)}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">Ventas Efectivo</span>
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Bs. {item.shift.cash_sales.toFixed(2)}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">Cobros Digitales</span>
                              <span className="text-xs font-black text-purple-600 dark:text-purple-300">Bs. {(item.shift.qr_sales + item.shift.card_sales).toFixed(2)}</span>
                            </div>
                            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400/80 block font-bold">Total en Caja</span>
                              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">Bs. {item.shift.expected_cash.toFixed(2)}</span>
                            </div>
                          </div>

                          {item.shift.notes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-200 dark:border-slate-800/40">
                              "{item.shift.notes}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="py-6 text-center space-y-3">
                          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400 mx-auto">
                            <Lock className="h-6 w-6" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-300">Turno de Caja Chica Sin Aperturar</h5>
                            <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5">
                              No hay un turno de caja activo en {item.branch.name}. Los recepcionistas no pueden procesar cobros hasta su apertura.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* SINGLE BRANCH VIEW (GERENTES, RECEPCIONISTAS O SUCURSAL ESPECÍFICA) */
            activeShift ? (
              <div className="space-y-3">
                {activeShift.is_overdue && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 animate-pulse">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-amber-300 text-xs flex items-center gap-2">
                          ⚠️ Turno de Caja Abierto de Fecha Anterior ({activeShift.opened_at_formatted || activeShift.opened_at})
                          <span className="bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-md font-mono text-[10px]">
                            {activeShift.days_overdue} día{activeShift.days_overdue === 1 ? '' : 's'} sin cerrar
                          </span>
                        </h4>
                        <p className="text-[11px] text-amber-200/90 mt-0.5">
                          Atención: El turno activo no fue cerrado al finalizar el día. Realice el arqueo y cierre extemporáneo inmediatamente para no descuadrar la contabilidad de hoy.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCloseModalOpen(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Arqueo & Cerrar Caja Vencida</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit">
                  <Building2 className="h-4 w-4" />
                  <span>Turno Activo en: {activeShift.branch_name || 'Sucursal Asignada'}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
                      <span>Fondo Inicial en Caja</span>
                      <DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      Bs. {Number(activeShift.initial_amount || 0).toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Apertura: {activeShift.opened_at}</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
                      <span>Ventas en Efectivo</span>
                      <DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      + Bs. {Number(activeShift.cash_sales || 0).toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Sumado a caja física</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
                      <span>Cobros Digitales (QR / POS)</span>
                      <QrCode className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                    </div>
                    <div className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">
                      + Bs. {(Number(activeShift.qr_sales || 0) + Number(activeShift.card_sales || 0)).toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Transferencias y tarjetas</p>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-2">
                      <span>Efectivo Esperado</span>
                      <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                      Bs. {Number(activeShift.expected_cash_in_hand || 0).toFixed(2)}
                    </div>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                      Total recaudación: Bs. {Number(activeShift.total_sales || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-xl">
                <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">No hay un turno de caja abierto</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Para registrar cobros en efectivo y garantizar el arqueo de caja chica en Bolivianos (Bs.), inicia tu turno presionando el botón "Abrir Caja Chica".
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpenModalOpen(true)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Unlock className="h-4 w-4" />
                  <span>Abrir Caja Ahora</span>
                </button>
              </div>
            )
          )}

          {/* History Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm dark:shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Historial Auditado de Turnos de Caja</h2>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Presets & Dates */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {(['today', 'week', 'month', 'custom'] as const).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePresetChange(preset)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          historyPreset === preset
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
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

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Desde:</span>
                    <CustomDatePicker
                      value={historyStartDate}
                      onChange={(val) => {
                        setHistoryPreset('custom');
                        setHistoryStartDate(val);
                      }}
                    />

                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Hasta:</span>
                    <CustomDatePicker
                      value={historyEndDate}
                      onChange={(val) => {
                        setHistoryPreset('custom');
                        setHistoryEndDate(val);
                      }}
                    />
                  </div>
                </div>

                {/* Status & Reset */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Estado:</span>
                    <select
                      value={historyStatus}
                      onChange={(e) => setHistoryStatus(e.target.value)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">Todos los Estados</option>
                      <option value="closed">Cerradas</option>
                      <option value="open">Abiertas</option>
                    </select>
                  </div>

                  {(historyStartDate || historyEndDate || historyStatus !== 'all' || historyPreset !== 'custom') && (
                    <button
                      onClick={() => {
                        setHistoryStartDate('');
                        setHistoryEndDate('');
                        setHistoryStatus('all');
                        setHistoryPreset('custom');
                        setTimeout(() => fetchHistory(1), 50);
                      }}
                      className="p-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
                      title="Limpiar Filtros"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider bg-slate-50 dark:bg-slate-950/60">
                    <th className="py-3 px-4">Sucursal</th>
                    <th className="py-3 px-4">Apertura</th>
                    <th className="py-3 px-4">Cierre</th>
                    <th className="py-3 px-4">Atendido Por</th>
                    <th className="py-3 px-4 text-right">Inicial</th>
                    <th className="py-3 px-4 text-right">Esperado</th>
                    <th className="py-3 px-4 text-right">Contado</th>
                    <th className="py-3 px-4 text-right">Diferencia</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-300">
                  {historyShifts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500 dark:text-slate-400">
                        No se encontraron turnos de caja con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    historyShifts.map((shift: any) => {
                      const diff = parseFloat(shift.difference || '0');
                      const isOpenShift = shift.status === 'open';
                      return (
                        <tr key={shift.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">{shift.branch?.name || 'Sede'}</td>
                          <td className="py-3 px-4 font-mono text-[11px]">{shift.opened_at ? new Date(shift.opened_at).toLocaleString('es-BO') : '-'}</td>
                          <td className="py-3 px-4 font-mono text-[11px]">{shift.closed_at ? new Date(shift.closed_at).toLocaleString('es-BO') : '-'}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                            {shift.opened_by?.name || 'Recepción'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            Bs. {parseFloat(shift.initial_amount || '0').toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                            Bs. {parseFloat(shift.expected_amount || '0').toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            Bs. {parseFloat(shift.actual_amount || '0').toFixed(2)}
                          </td>
                          <td className={`py-3 px-4 text-right font-mono font-bold ${
                            diff === 0 ? 'text-emerald-600 dark:text-emerald-400' : diff > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {diff > 0 ? '+' : ''}Bs. {diff.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isOpenShift
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}>
                              {isOpenShift ? 'Abierta' : 'Cerrada'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {historyTotal > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <p>
                  Página <span className="font-bold text-slate-900 dark:text-white">{historyCurrentPage}</span> de <span className="font-bold text-slate-900 dark:text-white">{historyLastPage}</span> ({historyTotal} turnos de caja)
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => historyCurrentPage > 1 && fetchHistory(historyCurrentPage - 1)}
                    disabled={historyCurrentPage <= 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>
                  <button
                    onClick={() => historyCurrentPage < historyLastPage && fetchHistory(historyCurrentPage + 1)}
                    disabled={historyCurrentPage >= historyLastPage}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <OpenCashModal
        isOpen={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
        onSuccess={fetchData}
      />

      {activeShift && (
        <CloseCashModal
          isOpen={isCloseModalOpen}
          onClose={() => setIsCloseModalOpen(false)}
          onSuccess={fetchData}
          shiftData={{
            initial_amount: activeShift.initial_amount,
            cash_sales: activeShift.cash_sales,
            expected_cash_in_hand: activeShift.expected_cash_in_hand,
          }}
        />
      )}
    </div>
  );
};
