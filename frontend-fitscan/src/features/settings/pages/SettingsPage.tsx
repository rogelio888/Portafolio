import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  QrCode,
  Save,
  Volume2,
  Clock,
  DollarSign,
  Plus,
  CheckCircle2,
  Edit2,
  Power,
  Trash2,
  Loader2,
  Users,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { useClientStore } from '../../clients/state/useClientStore';
import { BranchFormModal } from '../components/BranchFormModal';
import { AuditLogViewerModal } from '../components/AuditLogViewerModal';
import { useBranchStore } from '../state/useBranchStore';
import { api } from '../../../services/api';
import { useToast } from '../../../components/ui/ToastProvider';
import ConfirmModal from '../../../components/ConfirmModal';

interface BranchItem {
  id: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  opening_time?: string;
  closing_time?: string;
  is_active: boolean;
  clients_count?: number;
  users_count?: number;
}

export const SettingsPage: React.FC = () => {
  const { theme } = useClientStore();
  const toast = useToast();
  const isDark = theme === 'dark';

  const [gymConfig, setGymConfig] = useState({
    name: 'FITSCAN GYM SaaS',
    nit: '102938475019',
    phone: '+591 70012345',
    email: 'contacto@fitscan.bo',
    address: 'Av. San Martín #450, Equipetrol, Santa Cruz',
    currency: 'Bolivianos (Bs.)',
    autoResetSeconds: 2.5,
    soundEnabled: true,
    allowMultipleScanSameDay: false,
  });

  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState<boolean>(true);

  // Modal State for Branch Form & Audit Log
  const [isBranchModalOpen, setIsBranchModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; branchId: string; branchName: string; isLoading: boolean }>({
    isOpen: false, branchId: '', branchName: '', isLoading: false,
  });

  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const fetchBranches = async () => {
    setIsLoadingBranches(true);
    try {
      const response = await api.get('/branches');
      setBranches(response.data.data || []);
    } catch {
      toast.error('Error', 'No se pudieron obtener las sucursales.');
    } finally {
      setIsLoadingBranches(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedBranch(null);
    setIsBranchModalOpen(true);
  };

  const handleOpenEditModal = (branch: BranchItem) => {
    setSelectedBranch(branch);
    setIsBranchModalOpen(true);
  };

  const [togglingBranchId, setTogglingBranchId] = useState<string | null>(null);
  const [deletingBranchId, setDeletingBranchId] = useState<string | null>(null);

  const handleToggleBranchStatus = async (branchId: string, currentStatus: boolean) => {
    setTogglingBranchId(branchId);
    try {
      await api.put(`/branches/${branchId}/toggle-status`);
      toast.success(
        'Estado de Sucursal Actualizado',
        `La sucursal ha sido ${currentStatus ? 'desactivada' : 'activada'} correctamente.`
      );
      useBranchStore.getState().fetchBranches();
      await fetchBranches();
    } catch (err) {
      console.error('Error toggling branch status:', err);
      toast.error('Error', 'No se pudo cambiar el estado de la sucursal.');
    } finally {
      setTogglingBranchId(null);
    }
  };

  const handleDeleteBranch = (branchId: string, branchName: string) => {
    setConfirmModal({ isOpen: true, branchId, branchName, isLoading: false });
  };

  const executeDeleteBranch = async () => {
    const { branchId, branchName } = confirmModal;
    if (!branchId) return;
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    setDeletingBranchId(branchId);
    try {
      await api.delete(`/branches/${branchId}`);
      toast.success('Sucursal Eliminada', `La sucursal "${branchName}" fue eliminada.`);
      useBranchStore.getState().fetchBranches();
      await fetchBranches();
    } catch (err) {
      console.error('Error deleting branch:', err);
      toast.error('Error', 'No se pudo eliminar la sucursal.');
    } finally {
      setDeletingBranchId(null);
      setConfirmModal({ isOpen: false, branchId: '', branchName: '', isLoading: false });
    }
  };

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-wide flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Settings className={`h-5 w-5 sm:h-6 sm:w-6 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            Configuración General del Sistema
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Administra los datos fiscales de la empresa, parámetros del escáner Kiosco QR y sucursales.
          </p>
        </div>

        {isSavedNotice && (
          <div className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ¡Ajustes guardados correctamente!
          </div>
        )}
      </div>

      <form onSubmit={handleSaveGeneralSettings} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Gym Company Information */}
          <div className={`rounded-3xl border p-4 sm:p-6 shadow-sm space-y-4 transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`flex items-center gap-2 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <Building2 className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Información Fiscal & Comercial</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Nombre Comercial del Gimnasio *</label>
                <input
                  type="text"
                  value={gymConfig.name}
                  onChange={(e) => setGymConfig({ ...gymConfig, name: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>NIT / RUC *</label>
                  <input
                    type="text"
                    value={gymConfig.nit}
                    onChange={(e) => setGymConfig({ ...gymConfig, nit: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Teléfono Contacto</label>
                  <input
                    type="text"
                    value={gymConfig.phone}
                    onChange={(e) => setGymConfig({ ...gymConfig, phone: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Dirección Matriz</label>
                <input
                  type="text"
                  value={gymConfig.address}
                  onChange={(e) => setGymConfig({ ...gymConfig, address: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Moneda Principal</label>
                <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 text-xs font-bold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-700'
                }`}>
                  <DollarSign className="h-4 w-4" />
                  <span>{gymConfig.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Scanner Parameters */}
          <div className={`rounded-3xl border p-4 sm:p-6 shadow-sm space-y-4 transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`flex items-center gap-2 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <QrCode className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Parámetros del Lector QR & Modo Kiosco</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs mb-1 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <Clock className={`h-3.5 w-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  Tiempo de Auto-Reset de Overlay (Segundos)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={gymConfig.autoResetSeconds}
                  onChange={(e) => setGymConfig({ ...gymConfig, autoResetSeconds: Number(e.target.value) })}
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-between p-3 rounded-2xl border ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Volume2 className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <span>Efectos de Sonido al Escanear</span>
                </div>
                <input
                  type="checkbox"
                  checked={gymConfig.soundEnabled}
                  onChange={(e) => setGymConfig({ ...gymConfig, soundEnabled: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div className={`flex items-center justify-between p-3 rounded-2xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-xs">
                  <span className={`block font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Permitir Múltiples Asistencias Mismo Día</span>
                  <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Si está desactivo, mostrará alerta amarilla</span>
                </div>
                <input
                  type="checkbox"
                  checked={gymConfig.allowMultipleScanSameDay}
                  onChange={(e) => setGymConfig({ ...gymConfig, allowMultipleScanSameDay: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Branches Card */}
          <div className={`col-span-1 lg:col-span-2 rounded-3xl border p-4 sm:p-6 shadow-sm space-y-4 transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Building2 className={`h-5 w-5 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Gestión de Sucursales Activas ({branches.length})
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(true)}
                  className={`flex-1 sm:flex-initial justify-center border text-xs font-bold px-3 py-2 sm:py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-800 shadow-sm'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Bitácora de Auditoría</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="flex-1 sm:flex-initial justify-center bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 dark:text-emerald-400 border border-emerald-500/40 text-xs font-extrabold px-3 py-2 sm:py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>Nueva Sucursal</span>
                </button>
              </div>
            </div>

            {isLoadingBranches ? (
              <div className="py-8 text-center text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
                <span>Cargando lista de sucursales...</span>
              </div>
            ) : branches.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-bold">
                No hay sucursales registradas en el sistema.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {branches.map((b) => (
                  <div
                    key={b.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-colors ${
                      isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{b.name}</h4>
                        {b.address && (
                          <p className={`text-[11px] flex items-center gap-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{b.address}</span>
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border shrink-0 ${
                          b.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {b.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between pt-2 border-t text-[11px] ${
                      isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-bold">
                          <Users className="h-3.5 w-3.5 text-emerald-400" />
                          {b.clients_count ?? 0} socios
                        </span>
                      </div>

                      {/* Branch Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={togglingBranchId === b.id}
                          onClick={() => handleToggleBranchStatus(b.id, b.is_active)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
                            b.is_active
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                          title={b.is_active ? 'Desactivar Sucursal' : 'Activar Sucursal'}
                        >
                          {togglingBranchId === b.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Power className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(b)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isDark
                              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                          }`}
                          title="Editar Sucursal"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={deletingBranchId === b.id}
                          onClick={() => handleDeleteBranch(b.id, b.name)}
                          className="p-1.5 rounded-lg border bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer disabled:opacity-50"
                          title="Eliminar Sucursal"
                        >
                          {deletingBranchId === b.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`flex justify-end pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            type="submit"
            className="w-full sm:w-auto justify-center bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs py-3 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            Guardar Configuración General
          </button>
        </div>
      </form>

      {/* Branch Form Modal using React Portal */}
      <BranchFormModal
        branch={selectedBranch}
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        onSuccess={fetchBranches}
      />

      {/* Audit Log Viewer Modal using React Portal */}
      <AuditLogViewerModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, branchId: '', branchName: '', isLoading: false })}
        onConfirm={executeDeleteBranch}
        title="Eliminar Sucursal"
        message={`¿Estás seguro de desactivar/eliminar la sucursal "${confirmModal.branchName}"?`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
};
