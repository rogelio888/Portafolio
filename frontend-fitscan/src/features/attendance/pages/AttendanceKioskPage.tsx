import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  QrCode,
  Maximize2,
  Zap,
  Building2,
  Users,
  CameraOff,
  Camera,
  Smartphone,
  X,
  AlertTriangle,
  Loader2,
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Keyboard,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { CustomDatePicker } from '../../../components/ui/CustomDatePicker';
import { Html5Qrcode } from 'html5-qrcode';
import { useClientStore } from '../../clients/state/useClientStore';
import { useBranchStore } from '../../settings/state/useBranchStore';
import { AttendanceStatusOverlay } from '../components/AttendanceStatusOverlay';
import type { AttendanceRecord } from '../../clients/types/client.types';

export const AttendanceKioskPage: React.FC = () => {
  const {
    attendanceLog,
    isAttendanceLoading,
    activeScanResult,
    processQrScan,
    fetchTodayAttendance,
    fetchAttendanceHistory,
    clearScanResult,
    renewMembership,
    isKioskMode,
    setKioskMode,
    selectedBranch,
    theme,
  } = useClientStore();

  const { branches, activeBranchId, fetchBranches } = useBranchStore();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'kiosk' | 'history'>('kiosk');

  // History / Bitacora state
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [historyLastPage, setHistoryLastPage] = useState<number>(1);
  const [historyTotal, setHistoryTotal] = useState<number>(0);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyStartDate, setHistoryStartDate] = useState<string>('');
  const [historyEndDate, setHistoryEndDate] = useState<string>('');
  const [historyScanMethod, setHistoryScanMethod] = useState<string>('all');

  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showNoDeviceAlert, setShowNoDeviceAlert] = useState(false);
  const [selectedKioskBranchId, setSelectedKioskBranchId] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);
  const activeScanResultRef = useRef(activeScanResult);

  useEffect(() => {
    activeScanResultRef.current = activeScanResult;
  }, [activeScanResult]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (activeBranchId && activeBranchId !== 'all') {
      setSelectedKioskBranchId(activeBranchId);
    } else if (branches.length > 0 && !selectedKioskBranchId) {
      setSelectedKioskBranchId(branches[0].id);
    }
  }, [activeBranchId, branches]);

  const loadHistory = useCallback(async (pageToLoad = 1) => {
    setHistoryLoading(true);
    try {
      const res = await fetchAttendanceHistory({
        page: pageToLoad,
        startDate: historyStartDate || undefined,
        endDate: historyEndDate || undefined,
        search: historySearch || undefined,
        scanMethod: historyScanMethod !== 'all' ? historyScanMethod : undefined,
        branchId: activeBranchId,
      });

      setHistoryItems(res.data || []);
      setHistoryPage(res.current_page || 1);
      setHistoryLastPage(res.last_page || 1);
      setHistoryTotal(res.total || 0);
    } catch {
      setHistoryItems([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [fetchAttendanceHistory, historyStartDate, historyEndDate, historySearch, historyScanMethod, activeBranchId]);

  useEffect(() => {
    fetchTodayAttendance(activeBranchId);

    const handleBranchChanged = () => {
      const currentBranch = useBranchStore.getState().activeBranchId;
      fetchTodayAttendance(currentBranch);
      if (activeTab === 'history') {
        loadHistory(1);
      }
    };
    window.addEventListener('branch-changed', handleBranchChanged);
    return () => window.removeEventListener('branch-changed', handleBranchChanged);
  }, [fetchTodayAttendance, activeBranchId, activeTab, loadHistory]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory(1);
    }
  }, [activeTab, loadHistory]);

  // Handle Webcam Live Scanning with strict Debouncing Lock
  useEffect(() => {
    let isMounted = true;

    if (isCameraActive) {
      const html5QrCode = new Html5Qrcode('webcam-reader');
      scannerRef.current = html5QrCode;

      html5QrCode
        .start(
          { facingMode: 'user' }, // Laptop front camera
          {
            fps: 15,
            qrbox: { width: 340, height: 340 },
          },
          async (decodedText) => {
            const now = Date.now();

            // Strict lockout if already processing, if overlay is visible, or if scanned < 5 seconds ago
            if (
              isProcessingRef.current ||
              activeScanResultRef.current ||
              now - lastScanTimeRef.current < 5000 ||
              !decodedText
            ) {
              return;
            }

            isProcessingRef.current = true;
            lastScanTimeRef.current = now;
            setIsScanning(true);

            try {
              await processQrScan(decodedText.trim(), selectedKioskBranchId || undefined);
            } finally {
              setIsScanning(false);
              setTimeout(() => {
                isProcessingRef.current = false;
              }, 3000);
            }
          },
          () => {
            // Frame error ignore
          }
        )
        .catch((err) => {
          if (isMounted) {
            console.error('Camera access failed', err);
            setCameraError('No se pudo acceder a la cámara. Permite el acceso en los permisos de tu navegador.');
            setIsCameraActive(false);
          }
        });
    }

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isCameraActive, processQrScan, selectedKioskBranchId]);

  const toggleCamera = () => {
    setCameraError(null);
    setIsCameraActive((prev) => !prev);
  };

  const handleCloseOverlay = () => {
    lastScanTimeRef.current = Date.now();
    isProcessingRef.current = false;
    if (scannerRef.current) {
      try { scannerRef.current.resume(); } catch {}
    }
    clearScanResult();
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim() || isScanning || isProcessingRef.current) {
      if (!manualInput.trim()) setShowNoDeviceAlert(true);
      return;
    }
    isProcessingRef.current = true;
    setIsScanning(true);
    try {
      await processQrScan(manualInput.trim(), selectedKioskBranchId || undefined);
    } finally {
      setIsScanning(false);
      setManualInput('');
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 4000);
    }
  };

  return (
    <div className={`min-h-screen ${isKioskMode ? 'bg-slate-950 p-6 flex flex-col justify-between' : 'p-6 space-y-6'}`}>
      {/* Navigation Tab Header when not in Kiosk Mode */}
      {!isKioskMode && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('kiosk')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                activeTab === 'kiosk'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <QrCode className="h-4 w-4" />
              <span>Escáner Live Kiosco</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Bitácora & Historial de Asistencias</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-semibold px-3 py-1 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-400" />
            <span>{selectedBranch}</span>
          </div>
        </div>
      )}

      {/* Top Banner if in Kiosk Mode */}
      {isKioskMode && (
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-4 pr-48 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white tracking-wide flex items-center gap-2">
                FITSCAN KIOSK <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md">LIVE</span>
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                {selectedBranch} • Apunte la cámara hacia el código QR
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Content rendering */}
      {activeTab === 'history' && !isKioskMode ? (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className={`p-5 rounded-3xl border transition-colors shadow-sm ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadHistory(1)}
                  placeholder="Buscar por socio, CI, teléfono o QR..."
                  className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-emerald-500 transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Date Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Desde:</span>
                  <CustomDatePicker
                    value={historyStartDate}
                    onChange={setHistoryStartDate}
                    isDark={isDark}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Hasta:</span>
                  <CustomDatePicker
                    value={historyEndDate}
                    onChange={setHistoryEndDate}
                    isDark={isDark}
                  />
                </div>

                {/* Scan Method Filter */}
                <select
                  value={historyScanMethod}
                  onChange={(e) => setHistoryScanMethod(e.target.value)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="all">Todos los Métodos</option>
                  <option value="qr">Cámara QR</option>
                  <option value="manual">Registro Manual</option>
                </select>

                {/* Action Buttons */}
                <button
                  onClick={() => loadHistory(1)}
                  disabled={historyLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filtrar</span>
                </button>

                <button
                  onClick={() => {
                    if (!historyItems.length) return;
                    const headers = ['Socio', 'Telefono', 'Email', 'Sucursal', 'Membresia', 'Fecha', 'Hora', 'Metodo', 'RegistradoPor'];
                    const rows = historyItems.map((i) => [
                      `"${i.client?.full_name || ''}"`,
                      `"${i.client?.phone || ''}"`,
                      `"${i.client?.email || ''}"`,
                      `"${i.branch_name || ''}"`,
                      `"${i.membership_type || ''}"`,
                      `"${i.check_in_date_formatted || ''}"`,
                      `"${i.check_in_time_formatted || ''}"`,
                      `"${i.scan_method || ''}"`,
                      `"${i.scanned_by_name || ''}"`,
                    ]);
                    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `bitacora_asistencias_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  disabled={!historyItems.length}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Exportar a CSV / Excel"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Exportar CSV</span>
                </button>

                {(historySearch || historyStartDate || historyEndDate || historyScanMethod !== 'all') && (
                  <button
                    onClick={() => {
                      setHistorySearch('');
                      setHistoryStartDate('');
                      setHistoryEndDate('');
                      setHistoryScanMethod('all');
                      setTimeout(() => loadHistory(1), 50);
                    }}
                    className="p-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl border border-slate-700 cursor-pointer"
                    title="Limpiar filtros"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Registros en Filtro</p>
                <h4 className="text-xl font-black text-white mt-1">{historyTotal} asistencias</h4>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div>
                <p className="text-xs text-slate-400 font-medium">Lecturas por Escáner QR</p>
                <h4 className="text-xl font-black text-emerald-400 mt-1">
                  {historyItems.filter(i => i.scan_method === 'qr' || !i.scan_method).length} lecturas
                </h4>
              </div>
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                <QrCode className="h-5 w-5" />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div>
                <p className="text-xs text-slate-400 font-medium">Ingresos Manuales</p>
                <h4 className="text-xl font-black text-amber-400 mt-1">
                  {historyItems.filter(i => i.scan_method === 'manual').length} registros
                </h4>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Keyboard className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Attendance History Table */}
          <div className={`rounded-3xl border overflow-hidden shadow-xl transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {historyLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                <span className="text-xs font-semibold">Cargando Bitácora de Asistencias...</span>
              </div>
            ) : historyItems.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
                <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                  <History className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No se encontraron registros de asistencia</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Pruebe ajustando el rango de fechas o limpiando los filtros de búsqueda.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[11px] uppercase tracking-wider font-extrabold ${
                      isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      <th className="py-3.5 px-5">Socio</th>
                      <th className="py-3.5 px-4">Sucursal</th>
                      <th className="py-3.5 px-4">Membresía / Plan</th>
                      <th className="py-3.5 px-4">Fecha & Hora Exacta</th>
                      <th className="py-3.5 px-4">Método</th>
                      <th className="py-3.5 px-4">Registrado Por</th>
                      <th className="py-3.5 px-5 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-xs ${
                    isDark ? 'divide-slate-800/80 text-slate-200' : 'divide-slate-200 text-slate-800'
                  }`}>
                    {historyItems.map((item) => (
                      <tr key={item.id} className={`transition-colors hover:${isDark ? 'bg-slate-800/40' : 'bg-slate-50'}`}>
                        {/* Socio */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.client?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                              alt={item.client?.full_name || 'Socio'}
                              className="h-10 w-10 rounded-full object-cover border-2 border-emerald-500/40 shadow-sm shrink-0"
                            />
                            <div>
                              <p className="font-bold text-white text-sm">{item.client?.full_name || 'Socio Desconocido'}</p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {item.client?.phone ? `Tel: ${item.client.phone}` : (item.client?.email || 'Socio Registrado')}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Sucursal */}
                        <td className="py-3.5 px-4 font-medium text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>{item.branch_name}</span>
                          </div>
                        </td>

                        {/* Membresia */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {item.membership_type}
                          </span>
                        </td>

                        {/* Fecha y Hora */}
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          <div className="flex flex-col">
                            <span className="font-bold text-white">{item.check_in_date_formatted || item.check_in_at?.split(' ')[0]}</span>
                            <span className="text-[11px] text-emerald-400 font-bold">{item.check_in_time_formatted || item.check_in_at?.split(' ')[1]}</span>
                          </div>
                        </td>

                        {/* Metodo */}
                        <td className="py-3.5 px-4">
                          {item.scan_method === 'manual' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Keyboard className="h-3 w-3" />
                              Manual
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                              <QrCode className="h-3 w-3" />
                              Cámara QR
                            </span>
                          )}
                        </td>

                        {/* Registrado por */}
                        <td className="py-3.5 px-4 text-slate-400 font-medium text-xs">
                          {item.scanned_by_name || 'Kiosco Automático'}
                        </td>

                        {/* Estado */}
                        <td className="py-3.5 px-5 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            Permitido
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {historyTotal > 0 && (
              <div className={`px-5 py-4 border-t flex items-center justify-between ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="text-xs text-slate-400">
                  Mostrando página <span className="font-bold text-white">{historyPage}</span> de <span className="font-bold text-white">{historyLastPage}</span> ({historyTotal} registros en total)
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => historyPage > 1 && loadHistory(historyPage - 1)}
                    disabled={historyPage <= 1 || historyLoading}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs font-bold text-white flex items-center gap-1 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>

                  <button
                    onClick={() => historyPage < historyLastPage && loadHistory(historyPage + 1)}
                    disabled={historyPage >= historyLastPage || historyLoading}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs font-bold text-white flex items-center gap-1 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Main Scanner Section */
        <div className={`grid grid-cols-1 ${isKioskMode ? 'lg:grid-cols-3 flex-1 gap-6 my-4' : 'lg:grid-cols-3 gap-6'}`}>
        
        {/* Camera View Finder (2 Columns) */}
        <div className={`lg:col-span-2 rounded-3xl border p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden transition-colors shadow-2xl min-h-[520px] ${
          isDark || isKioskMode
            ? 'bg-slate-900/80 border-slate-800 shadow-xl'
            : 'bg-white border-slate-200 shadow-sm'
        }`}>

          {/* Camera Error Message */}
          {cameraError && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 max-w-sm z-30">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Live Webcam Scanner Viewfinder */}
          {isCameraActive ? (
            <div className="relative w-full max-w-2xl h-[460px] md:h-[520px] rounded-3xl overflow-hidden border-2 border-emerald-500/60 shadow-2xl bg-black flex flex-col items-center justify-center">
              {/* Real Video Stream Reader */}
              <div id="webcam-reader" className="absolute inset-0 w-full h-full" />

              {/* Integrated Scanner Corner Markers */}
              <div className="absolute top-5 left-5 w-14 h-14 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl pointer-events-none z-10" />
              <div className="absolute top-5 right-5 w-14 h-14 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl pointer-events-none z-10" />
              <div className="absolute bottom-5 left-5 w-14 h-14 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl pointer-events-none z-10" />
              <div className="absolute bottom-5 right-5 w-14 h-14 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl pointer-events-none z-10" />

              {/* Laser Scanning Line Overlay */}
              <div className="absolute inset-x-8 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan-line pointer-events-none z-10" />

              {/* Floating Glassmorphism Stop Button */}
              <button
                onClick={toggleCamera}
                className="absolute bottom-6 z-20 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2 bg-slate-950/85 hover:bg-slate-900 px-5 py-2.5 rounded-full border border-slate-700/80 shadow-2xl backdrop-blur-md cursor-pointer transition-all hover:scale-105"
              >
                <CameraOff className="h-4 w-4 text-rose-400" />
                <span>Detener Cámara</span>
              </button>
            </div>
          ) : (
            <>
              {/* Scanner Corner Borders (Default Inactive State) */}
              <div className="absolute top-6 left-6 w-14 h-14 border-t-4 border-l-4 border-emerald-500/80 rounded-tl-2xl pointer-events-none" />
              <div className="absolute top-6 right-6 w-14 h-14 border-t-4 border-r-4 border-emerald-500/80 rounded-tr-2xl pointer-events-none" />
              <div className="absolute bottom-6 left-6 w-14 h-14 border-b-4 border-l-4 border-emerald-500/80 rounded-bl-2xl pointer-events-none" />
              <div className="absolute bottom-6 right-6 w-14 h-14 border-b-4 border-r-4 border-emerald-500/80 rounded-br-2xl pointer-events-none" />

              {/* Laser Scanning Line Animation */}
              <div className="absolute inset-x-12 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan-line pointer-events-none" />

              {/* Central Camera Target View (Default State) */}
            <div className={`relative z-10 flex flex-col items-center text-center p-8 rounded-3xl border backdrop-blur-md max-w-sm w-full transition-colors ${
              isDark || isKioskMode
                ? 'bg-slate-950/70 border-slate-800/90'
                : 'bg-slate-50 border-slate-200 shadow-inner'
            }`}>
              <button
                onClick={toggleCamera}
                className={`h-24 w-24 rounded-2xl flex flex-col items-center justify-center border mb-4 transition-all cursor-pointer group shadow-lg ${
                  isDark || isKioskMode
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                }`}
                title="Activar cámara de la laptop"
              >
                <Camera className="h-10 w-10 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Activar Cámara</span>
              </button>

              <h2 className={`text-xl font-bold mb-1 ${isDark || isKioskMode ? 'text-white' : 'text-slate-900'}`}>Escáner de Asistencia Activo</h2>
              <p className={`text-xs mb-6 leading-relaxed ${isDark || isKioskMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Presione el botón para encender la cámara o ingrese manualmente el código.
              </p>

              <form onSubmit={handleScanSubmit} className="w-full space-y-3">
                {activeBranchId === 'all' && (
                  <div className={`text-left border p-2.5 rounded-xl space-y-1 ${
                    isDark || isKioskMode
                      ? 'bg-slate-900/90 border-emerald-500/30'
                      : 'bg-slate-100 border-slate-200'
                  }`}>
                    <label className={`block text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider ${
                      isDark || isKioskMode ? 'text-emerald-400' : 'text-emerald-700'
                    }`}>
                      <Building2 className="h-3.5 w-3.5" />
                      Sucursal de Ingreso *
                    </label>
                    <select
                      value={selectedKioskBranchId}
                      onChange={(e) => setSelectedKioskBranchId(e.target.value)}
                      className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-emerald-500 ${
                        isDark || isKioskMode
                          ? 'bg-slate-950 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code || 'Sede'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Ingresar o escanear código QR/UUID..."
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500/80 ${
                      isDark || isKioskMode
                        ? 'bg-slate-900 border-slate-700/80 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isScanning}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all hover:opacity-90 shadow-md shadow-emerald-500/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Validando en Servidor...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>Validar Código QR</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>

        {/* Live Attendance Log Sidebar Feed */}
        <div className={`rounded-3xl border p-5 flex flex-col justify-between shadow-sm transition-colors ${
          isDark || isKioskMode
            ? 'bg-slate-900/80 border-slate-800 shadow-xl'
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className={`flex items-center justify-between pb-4 border-b ${isDark || isKioskMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Users className={`h-5 w-5 ${isDark || isKioskMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h3 className={`font-bold text-sm ${isDark || isKioskMode ? 'text-white' : 'text-slate-900'}`}>Asistencias Recientes</h3>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isDark || isKioskMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
              }`}>
                Hoy: {attendanceLog.length}
              </span>
            </div>

            <div className="mt-4 space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {isAttendanceLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
                </div>
              ) : attendanceLog.length === 0 ? (
                <div className={`text-center py-10 text-xs ${isDark || isKioskMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  No hay asistencias registradas el día de hoy.
                </div>
              ) : (
                attendanceLog.map((log: AttendanceRecord) => (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isDark || isKioskMode
                        ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={log.clientPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={log.clientName}
                        className="h-10 w-10 rounded-xl object-cover border border-emerald-500/30"
                      />
                      <div>
                        <p className={`text-xs font-bold ${isDark || isKioskMode ? 'text-slate-200' : 'text-slate-900'}`}>{log.clientName}</p>
                        <p className={`text-[10px] ${isDark || isKioskMode ? 'text-slate-400' : 'text-slate-500'}`}>{log.membershipType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-mono font-bold ${isDark || isKioskMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {log.checkInTime
                          ? (() => {
                              try {
                                const d = new Date(log.checkInTime);
                                return isNaN(d.getTime())
                                  ? String(log.checkInTime).substring(11, 16)
                                  : d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false });
                              } catch {
                                return String(log.checkInTime).substring(11, 16);
                              }
                            })()
                          : 'Hace instantes'}
                      </span>
                      <span className={`block text-[9px] ${isDark || isKioskMode ? 'text-slate-500' : 'text-slate-400'}`}>Ingreso Exitoso</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {!isKioskMode && (
            <button
              onClick={() => setKioskMode(true)}
              className={`mt-4 w-full text-xs font-bold py-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-800 shadow-md'
              }`}
            >
              <Maximize2 className="h-4 w-4 text-emerald-400" />
              <span>Modo Kiosco Pantalla Completa</span>
            </button>
          )}
        </div>
      </div>
      )}

      {/* Fullscreen Feedback Overlay */}
      {activeScanResult && (
        <AttendanceStatusOverlay
          scanResult={activeScanResult}
          onClose={handleCloseOverlay}
          onRenew={renewMembership}
        />
      )}

      {/* Modal Device Info Alert */}
      {showNoDeviceAlert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Smartphone className="h-5 w-5" />
                <h3 className="font-extrabold text-sm text-white">Dispositivo de Lectura</h3>
              </div>
              <button onClick={() => setShowNoDeviceAlert(false)} className="text-slate-400 hover:text-white p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              El sistema soporta lectura automática mediante la <strong>Cámara de tu Laptop</strong> o con cualquier <strong>Escáner de código de barras USB/Bluetooth</strong>.
            </p>
            <button
              onClick={() => {
                setShowNoDeviceAlert(false);
                toggleCamera();
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
            >
              Encender Cámara de Laptop
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
