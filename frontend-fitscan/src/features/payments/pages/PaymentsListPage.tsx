import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Search,
  DollarSign,
  QrCode,
  Loader2,
  Receipt,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building2,
  X,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../components/ui/ToastProvider';
import { useClientStore } from '../../clients/state/useClientStore';
import { ReceiptModal } from '../components/ReceiptModal';
import { CustomDatePicker } from '../../../components/ui/CustomDatePicker';
import type { MembershipPlan } from '../../memberships/types/membership.types';

export const PaymentsListPage: React.FC = () => {
  const toast = useToast();
  const { clients, fetchClients, theme } = useClientStore();
  const isDark = theme === 'dark';

  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state
  const [search, setSearch] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateRangePreset, setDateRangePreset] = useState<'today' | 'week' | 'month' | 'custom'>('custom');

  const handlePresetChange = (preset: 'today' | 'week' | 'month' | 'custom') => {
    setDateRangePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'week') {
      const dayOfWeek = today.getDay();
      const diffToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diffToMon);
      setStartDate(monday.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(todayStr);
    }
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);

  // Modal State for New Charge
  const [isChargeModalOpen, setIsChargeModalOpen] = useState<boolean>(false);
  const [isSubmittingCharge, setIsSubmittingCharge] = useState<boolean>(false);
  const [clientSearchTerm, setClientSearchTerm] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState<boolean>(false);

  // Membership & Action Sync
  const [availablePlans, setAvailablePlans] = useState<MembershipPlan[]>([]);
  const [actionType, setActionType] = useState<'renewal' | 'additional_service'>('renewal');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const [chargeData, setChargeData] = useState<{
    amount: string | number;
    paymentMethod: 'cash' | 'qr_transfer' | 'card';
    concept: string;
    notes: string;
  }>({
    amount: 250,
    paymentMethod: 'cash',
    concept: 'Renovación de Membresía',
    notes: '',
  });

  const fetchPayments = useCallback(async (pageToLoad = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get('/payments', {
        params: {
          page: pageToLoad,
          search: search || undefined,
          payment_method: selectedMethod !== 'all' ? selectedMethod : undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          per_page: 20,
        },
      });

      const resData = response.data;
      const items = resData?.data || (Array.isArray(resData) ? resData : []);
      setPayments(Array.isArray(items) ? items : []);
      setCurrentPage(resData?.current_page || 1);
      setLastPage(resData?.last_page || 1);
      setTotalCount(resData?.total || (Array.isArray(items) ? items.length : 0));
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedMethod, startDate, endDate]);

  useEffect(() => {
    fetchPayments(1);
  }, [search, selectedMethod, startDate, endDate, fetchPayments]);

  useEffect(() => {
    const handleBranchChanged = () => fetchPayments(1);
    window.addEventListener('branch-changed', handleBranchChanged);
    return () => window.removeEventListener('branch-changed', handleBranchChanged);
  }, [fetchPayments]);

  useEffect(() => {
    if (isChargeModalOpen) {
      if (clients.length === 0) {
        fetchClients();
      }
      api.get('/memberships')
        .then((res) => {
          const data: MembershipPlan[] = res.data?.data || res.data || [];
          if (Array.isArray(data) && data.length > 0) {
            setAvailablePlans(data);
            if (!selectedPlanId) {
              const defaultPlan = data.find((p) => p.is_popular) || data[0];
              setSelectedPlanId(defaultPlan.id);
              setChargeData((prev) => ({
                ...prev,
                amount: Number(defaultPlan.price) || 250,
                concept: `Renovación: ${defaultPlan.name}`,
              }));
            }
          }
        })
        .catch(console.error);
    }
  }, [isChargeModalOpen, clients.length, fetchClients, selectedPlanId]);

  // Financial KPI Summaries from current list
  const totalCollected = payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
  const totalCash = payments.filter(p => p.payment_method === 'cash').reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
  const totalQr = payments.filter(p => p.payment_method === 'qr_transfer').reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
  const totalCard = payments.filter(p => p.payment_method === 'card').reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = availablePlans.find((p) => p.id === planId);
    if (plan) {
      setChargeData((prev) => ({
        ...prev,
        amount: Number(plan.price) || 0,
        concept: `Renovación: ${plan.name}`,
      }));
    }
  };

  const handleActionTypeChange = (type: 'renewal' | 'additional_service') => {
    setActionType(type);
    if (type === 'renewal') {
      const plan = availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0];
      if (plan) {
        setChargeData((prev) => ({
          ...prev,
          amount: Number(plan.price) || 250,
          concept: `Renovación: ${plan.name}`,
        }));
      }
    } else {
      setChargeData((prev) => ({
        ...prev,
        amount: '',
        concept: 'Servicio Adicional / Casillero / PT',
      }));
    }
  };

  const handleSelectClient = (client: any) => {
    setSelectedClientId(client.id);
    setClientSearchTerm('');
    setIsClientDropdownOpen(false);

    // If client has a known membership type, preselect matching plan
    if (client.membershipType && availablePlans.length > 0) {
      const match = availablePlans.find((p) => p.name.toLowerCase() === client.membershipType.toLowerCase());
      if (match) {
        setSelectedPlanId(match.id);
        if (actionType === 'renewal') {
          setChargeData((prev) => ({
            ...prev,
            amount: Number(match.price) || 250,
            concept: `Renovación: ${match.name}`,
          }));
        }
      }
    }
  };

  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      toast.error('Cliente requerido', 'Por favor busque y seleccione un socio registrado.');
      return;
    }

    const amountNum = Number(chargeData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Monto inválido', 'Ingrese un monto a cobrar válido mayor a 0 Bs.');
      return;
    }

    if (actionType === 'renewal' && !selectedPlanId) {
      toast.error('Plan requerido', 'Seleccione un plan de membresía a renovar.');
      return;
    }

    setIsSubmittingCharge(true);
    try {
      const selectedClient = clients.find((c) => c.id === selectedClientId);
      const clientName = selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : 'Socio';

      await api.post('/payments', {
        client_id: selectedClientId,
        action_type: actionType,
        membership_id: actionType === 'renewal' ? selectedPlanId : undefined,
        amount: amountNum,
        payment_method: chargeData.paymentMethod,
        concept: chargeData.concept || (actionType === 'renewal' ? 'Renovación de Membresía' : 'Cobro de Servicio Adicional'),
        notes: chargeData.notes || null,
      });

      const actionSuccessMsg = actionType === 'renewal'
        ? `Cobro de Bs. ${amountNum} registrado y membresía extendida para ${clientName}.`
        : `Cobro de servicio por Bs. ${amountNum} registrado para ${clientName}.`;

      toast.success('Cobro Exitoso', actionSuccessMsg);
      setIsChargeModalOpen(false);
      setSelectedClientId('');
      setClientSearchTerm('');
      setIsClientDropdownOpen(false);
      setChargeData({
        amount: 250,
        paymentMethod: 'cash',
        concept: 'Renovación de Membresía',
        notes: '',
      });
      fetchPayments(1);
      fetchClients();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'No se pudo procesar el cobro.';
      toast.error('Error al Registrar Cobro', errMsg);
    } finally {
      setIsSubmittingCharge(false);
    }
  };

  const handleExportCsv = () => {
    if (!payments.length) return;
    const headers = ['Comprobante', 'Socio', 'Telefono', 'Membresia', 'MontoBs', 'Metodo', 'AtendidoPor', 'Fecha'];
    const rows = payments.map((p) => [
      `"${p.receipt_number || ''}"`,
      `"${p.client ? `${p.client.first_name} ${p.client.last_name}` : 'Socio'}"`,
      `"${p.client?.phone || ''}"`,
      `"${p.client_membership?.membership?.name || p.concept || ''}"`,
      `"${p.amount || 0}"`,
      `"${p.payment_method || ''}"`,
      `"${p.processed_by?.name || 'Recepción'}"`,
      `"${p.paid_at ? new Date(p.paid_at).toLocaleString('es-BO') : ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historial_pagos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredClientsForSelect = clients.filter((c) => {
    const term = clientSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.id && c.id.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span>Pagos, Cobros & Bitácora de Ingresos</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Historial auditado de transacciones, recaudaciones en Bolivianos (Bs.) y emisión de comprobantes.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsChargeModalOpen(true)}
            className="flex-1 sm:flex-initial justify-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Registrar Nuevo Cobro</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={payments.length === 0}
            className="flex-1 sm:flex-initial justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
            title="Exportar bitácora a CSV/Excel"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-sm dark:shadow-md">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Recaudación Total</span>
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
              Bs. {totalCollected.toFixed(2)}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-sm dark:shadow-md">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cobros en Efectivo</span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
              Bs. {totalCash.toFixed(2)}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-sm dark:shadow-md">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">QR Pago Simple</span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
              Bs. {totalQr.toFixed(2)}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <QrCode className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-sm dark:shadow-md">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tarjeta Débito/Crédito</span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
              Bs. {totalCard.toFixed(2)}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-4 space-y-3.5 shadow-sm dark:shadow-md">
        {/* Row 1: Period Presets & Date Range Inputs */}
        <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['today', 'week', 'month', 'custom'] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetChange(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dateRangePreset === preset
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-sm'
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
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Desde:</span>
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
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Hasta:</span>
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

        {/* Row 2: Search Bar & Payment Method Selector */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/60">
          <div className="relative flex-1 min-w-0 sm:min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPayments(1)}
              placeholder="Buscar por folio, socio o teléfono..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
            {(['all', 'cash', 'qr_transfer', 'card'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setSelectedMethod(method)}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                  selectedMethod === method
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {method === 'all'
                  ? 'Todos'
                  : method === 'cash'
                  ? 'Efectivo'
                  : method === 'qr_transfer'
                  ? 'QR Pago'
                  : 'Tarjeta'}
              </button>
            ))}
          </div>

          {(search || startDate || endDate || selectedMethod !== 'all' || dateRangePreset !== 'custom') && (
            <button
              onClick={() => {
                setSearch('');
                setStartDate('');
                setEndDate('');
                setSelectedMethod('all');
                setDateRangePreset('custom');
                setTimeout(() => fetchPayments(1), 50);
              }}
              className="p-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer shrink-0"
              title="Limpiar Filtros"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl">
        {/* Mobile Payment Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-7 w-7 text-emerald-500 dark:text-emerald-400 animate-spin mx-auto mb-2" />
              <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Cargando bitácora de pagos...</span>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
              No se encontraron cobros registrados con los filtros aplicados.
            </div>
          ) : (
            payments.map((p: any) => {
              const clientName = p.client?.full_name || p.client_name || (p.client?.first_name ? `${p.client.first_name} ${p.client.last_name || ''}`.trim() : 'Socio');
              const branchName = p.branch?.name || p.branch_name || p.client?.branch?.name || 'Sucursal Sede';
              return (
              <div key={p.id} className="p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                      {p.receipt_number || 'REC-GENERAL'}
                    </span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {clientName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-base text-slate-900 dark:text-white block">
                      Bs. {parseFloat(p.amount || '0').toFixed(2)}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.payment_method === 'cash'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : p.payment_method === 'qr_transfer'
                        ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                        : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                    }`}>
                      {p.payment_method === 'cash' ? 'Efectivo' : p.payment_method === 'qr_transfer' ? 'QR Pago' : 'Tarjeta'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {p.client_membership?.membership?.name || p.concept || p.plan_name || 'Pago de Membresía'}
                  </span>
                  <span className="font-mono text-[10px]">
                    {p.paid_at ? new Date(p.paid_at).toLocaleString('es-BO') : '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                    <Building2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{branchName}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedReceiptId(p.id)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Recibo</span>
                  </button>
                </div>
              </div>
              );
            })
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider bg-slate-50 dark:bg-slate-950/60">
                <th className="py-3.5 px-4">Comprobante</th>
                <th className="py-3.5 px-4">Sucursal</th>
                <th className="py-3.5 px-4">Socio</th>
                <th className="py-3.5 px-4">Concepto / Plan</th>
                <th className="py-3.5 px-4">Método</th>
                <th className="py-3.5 px-4 text-right">Monto (Bs.)</th>
                <th className="py-3.5 px-4">Procesado Por</th>
                <th className="py-3.5 px-4">Fecha & Hora</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <Loader2 className="h-7 w-7 text-emerald-500 dark:text-emerald-400 animate-spin mx-auto mb-2" />
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Cargando bitácora de pagos...</span>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No se encontraron cobros registrados con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Recibo */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {p.receipt_number || 'REC-GENERAL'}
                      </span>
                    </td>

                    {/* Sucursal */}
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{p.branch?.name || p.branch_name || p.client?.branch?.name || 'Sucursal Sede'}</span>
                      </div>
                    </td>

                    {/* Socio */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {p.client?.full_name || p.client_name || (p.client?.first_name ? `${p.client.first_name} ${p.client.last_name || ''}`.trim() : 'Socio')}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {p.client?.phone ? `Tel: ${p.client.phone}` : (p.client?.email || 'Socio Registrado')}
                        </p>
                      </div>
                    </td>

                    {/* Concepto */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {p.client_membership?.membership?.name || p.concept || p.plan_name || 'Pago de Membresía'}
                    </td>

                    {/* Metodo */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.payment_method === 'cash'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : p.payment_method === 'qr_transfer'
                          ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                          : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                      }`}>
                        {p.payment_method === 'cash' ? (
                          <>
                            <DollarSign className="h-3 w-3" /> Efectivo
                          </>
                        ) : p.payment_method === 'qr_transfer' ? (
                          <>
                            <QrCode className="h-3 w-3" /> QR Transferencia
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-3 w-3" /> Tarjeta
                          </>
                        )}
                      </span>
                    </td>

                    {/* Monto */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 dark:text-white text-sm">
                      Bs. {parseFloat(p.amount || '0').toFixed(2)}
                    </td>

                    {/* Atendido Por */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                      {typeof p.processed_by === 'string' ? p.processed_by : (p.processed_by?.name || 'Recepción')}
                    </td>

                    {/* Fecha */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {p.paid_at ? new Date(p.paid_at).toLocaleString('es-BO') : '-'}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptId(p.id)}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Ver / Imprimir Comprobante"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        <span>Recibo</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalCount > 0 && (
          <div className="px-4 sm:px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/80">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
              Mostrando página <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> de <span className="font-bold text-slate-900 dark:text-white">{lastPage}</span> ({totalCount} cobros registrados)
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => currentPage > 1 && fetchPayments(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>

              <button
                onClick={() => currentPage < lastPage && fetchPayments(currentPage + 1)}
                disabled={currentPage >= lastPage || isLoading}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: New Charge */}
      {isChargeModalOpen && (
        <div className="fixed inset-0 !m-0 z-[100] overflow-y-auto flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => setIsChargeModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mb-1 pr-8 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Registrar Nuevo Cobro Presencial
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Vincula el pago a la renovación de membresía o a un servicio adicional con caja chica activa.
            </p>

            <form onSubmit={handleCreateCharge} className="space-y-4">
              {/* UNIFIED CLIENT SELECTOR (COMBOBOX) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Socio a Cobrar *</span>
                  {selectedClientId && (
                    <span className="text-[10px] text-emerald-500 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Socio Seleccionado
                    </span>
                  )}
                </label>

                {selectedClientId ? (
                  (() => {
                    const client = clients.find((c) => c.id === selectedClientId);
                    return (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {client?.photoUrl ? (
                            <img
                              src={client.photoUrl}
                              alt={client.firstName}
                              className="h-10 w-10 rounded-xl object-cover ring-2 ring-emerald-500/40"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                              {client?.firstName?.charAt(0) || 'S'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {client?.firstName} {client?.lastName}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {client?.branch_name || 'Sucursal Sede'} • Plan: <span className="text-emerald-500 font-bold">{client?.membershipType || 'Sin Plan'}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {client?.phone ? `Tel: ${client.phone}` : ''} {client?.email ? `• ${client.email}` : ''}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClientId('');
                            setClientSearchTerm('');
                            setIsClientDropdownOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex-shrink-0"
                        >
                          Cambiar
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        value={clientSearchTerm}
                        onFocus={() => setIsClientDropdownOpen(true)}
                        onChange={(e) => {
                          setClientSearchTerm(e.target.value);
                          setIsClientDropdownOpen(true);
                        }}
                        placeholder="Escribe nombre, CI o teléfono del socio..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                      />
                      {clientSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setClientSearchTerm('')}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Floating Dropdown Results */}
                    {isClientDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1 space-y-1">
                        {filteredClientsForSelect.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No se encontraron socios con "{clientSearchTerm}".
                          </div>
                        ) : (
                          filteredClientsForSelect.slice(0, 10).map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectClient(c)}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-500/10 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                                  {c.firstName.charAt(0)}
                                </div>
                                <div className="truncate">
                                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                                    {c.firstName} {c.lastName}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {c.branch_name || 'Sede'} • {c.phone || c.email || 'Sin contacto'}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0">
                                {c.membershipType || 'Sin Plan'}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ACTION TYPE: RENEWAL VS ADDITIONAL SERVICE */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tipo de Cobro *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleActionTypeChange('renewal')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      actionType === 'renewal'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Renovación Membresía</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionTypeChange('additional_service')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      actionType === 'additional_service'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Servicio Adicional</span>
                  </button>
                </div>
              </div>

              {/* IF RENEWAL: SELECT MEMBERSHIP PLAN & EXPLANATION */}
              {actionType === 'renewal' && (
                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Plan a Renovar / Extender *
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {availablePlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — Bs. {plan.price} ({plan.duration_days} días de vigencia)
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    Suma vigencia acumulativa si está activo, o activa por duración a partir de hoy si está vencido.
                  </p>
                </div>
              )}

              {/* Concept & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Concepto de Cobro *
                  </label>
                  <input
                    type="text"
                    required
                    value={chargeData.concept}
                    onChange={(e) => setChargeData({ ...chargeData, concept: e.target.value })}
                    placeholder="Ej. Renovación Plan Mensual"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monto A Cobrar (Bs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    step="0.50"
                    value={chargeData.amount === '' ? '' : chargeData.amount}
                    onFocus={(e) => {
                      if (chargeData.amount === 0 || chargeData.amount === '0') {
                        setChargeData((prev) => ({ ...prev, amount: '' }));
                      } else {
                        e.target.select();
                      }
                    }}
                    onChange={(e) => setChargeData((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Método de Pago *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Efectivo', icon: DollarSign },
                    { id: 'qr_transfer', label: 'QR / Transf.', icon: QrCode },
                    { id: 'card', label: 'Tarjeta', icon: CreditCard },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = chargeData.paymentMethod === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setChargeData({ ...chargeData, paymentMethod: item.id as any })}
                        className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsChargeModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60 sm:bg-transparent rounded-xl cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCharge}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingCharge ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Registrando Cobro...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      <span>Confirmar Cobro (Bs.)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        paymentId={selectedReceiptId}
        onClose={() => setSelectedReceiptId(null)}
      />
    </div>
  );
};
