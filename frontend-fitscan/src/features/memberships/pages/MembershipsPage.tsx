import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CreditCard,
  Plus,
  Check,
  Sparkles,
  Edit,
  Trash2,
  Users,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import type { MembershipPlan } from '../types/membership.types';
import { useClientStore } from '../../clients/state/useClientStore';
import { useAuthStore } from '../../auth/state/useAuthStore';
import { useToast } from '../../../components/ui/ToastProvider';
import { api } from '../../../services/api';
import ConfirmModal from '../../../components/ConfirmModal';

export const MembershipsPage: React.FC = () => {
  const { theme } = useClientStore();
  const { hasPermission } = useAuthStore();
  const toast = useToast();
  const isDark = theme === 'dark';

  const canManageMemberships = hasPermission('memberships.create');

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; plan: MembershipPlan | null; isLoading: boolean }>({
    isOpen: false, plan: null, isLoading: false,
  });

  const [formData, setFormData] = useState<{
    name: string;
    durationDays: string | number;
    priceBs: string | number;
    description: string;
    featuresStr: string;
    isPopular: boolean;
    isMultiBranch: boolean;
  }>({
    name: '',
    durationDays: 30,
    priceBs: 250,
    description: '',
    featuresStr: '',
    isPopular: false,
    isMultiBranch: false,
  });

  const fetchMemberships = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/memberships');
      const data: MembershipPlan[] = response.data?.data || response.data || [];
      if (Array.isArray(data)) {
        setPlans(data);
      } else {
        setPlans([]);
      }
    } catch (err: any) {
      setPlans([]);
      const errMsg = err?.response?.data?.message || 'No se pudieron sincronizar los planes de membresía desde el servidor.';
      setError(errMsg);
      toast.error('Error al cargar membresías', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();

    const handleBranchChanged = () => fetchMemberships();
    window.addEventListener('branch-changed', handleBranchChanged);
    return () => window.removeEventListener('branch-changed', handleBranchChanged);
  }, []);

  const handleOpenModal = (plan?: MembershipPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        durationDays: plan.duration_days || 30,
        priceBs: Number(plan.price) || 0,
        description: plan.description || '',
        featuresStr: plan.features ? plan.features.join(', ') : '',
        isPopular: Boolean(plan.is_popular),
        isMultiBranch: Boolean(plan.is_multi_branch),
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        durationDays: 30,
        priceBs: 250,
        description: '',
        featuresStr: '',
        isPopular: false,
        isMultiBranch: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(formData.priceBs);
    const durationNum = Number(formData.durationDays);
    if (!formData.name || isNaN(priceNum) || priceNum <= 0) {
      toast.error('Campos incompletos', 'Ingresa el nombre del plan y un precio válido en Bs.');
      return;
    }

    const featuresList = formData.featuresStr
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        duration_days: durationNum > 0 ? durationNum : 30,
        price: priceNum,
        description: formData.description,
        features: featuresList,
        is_popular: formData.isPopular,
        is_multi_branch: formData.isMultiBranch,
      };

      if (editingPlan) {
        await api.put(`/memberships/${editingPlan.id}`, payload);
        toast.success('Plan Actualizado', `El plan "${formData.name}" ha sido actualizado.`);
      } else {
        await api.post('/memberships', { ...payload, is_active: true });
        toast.success('Plan Creado', `El plan "${formData.name}" ha sido registrado.`);
      }

      setIsModalOpen(false);
      fetchMemberships();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'No se pudo guardar el plan de membresía.';
      toast.error('Error al guardar', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = (plan: MembershipPlan) => {
    setConfirmModal({ isOpen: true, plan, isLoading: false });
  };

  const executeDeletePlan = async () => {
    const plan = confirmModal.plan;
    if (!plan) return;
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await api.delete(`/memberships/${plan.id}`);
      toast.success('Plan Eliminado', `El plan "${plan.name}" ha sido eliminado.`);
      setPlans(plans.filter((p) => p.id !== plan.id));
    } catch {
      toast.error('Error al eliminar', 'No se pudo eliminar el plan seleccionado.');
    } finally {
      setConfirmModal({ isOpen: false, plan: null, isLoading: false });
    }
  };

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black tracking-wide flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <CreditCard className={`h-7 w-7 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            Catálogo de Planes de Membresía
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Configuración de oferta comercial, precios en Bolivianos (Bs.), días de vigencia y características.
          </p>
        </div>

        {canManageMemberships && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Crear Nuevo Plan de Membresía
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          <span className="ml-3 text-xs font-bold text-slate-400">Cargando catálogo de membresías desde la API...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-rose-500/10 rounded-3xl border border-rose-500/30 p-8 space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Error al sincronizar membresías</h3>
          <p className="text-xs text-rose-300/80 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchMemberships()}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar Conexión
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3">
          <CreditCard className="h-10 w-10 text-emerald-500 mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-white">No hay planes registrados</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No hay planes de membresía registrados. Crea uno nuevo para comenzar.
          </p>
          {canManageMemberships && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl mt-2 cursor-pointer transition-colors"
            >
              + Crear Plan Inicial
            </button>
          )}
        </div>
      ) : (
        /* Plans Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl border p-6 flex flex-col justify-between relative transition-all duration-300 ${
                plan.is_popular
                  ? 'border-emerald-500/50 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : isDark
                    ? 'bg-slate-900/80 border-slate-800'
                    : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Más Popular
                </div>
              )}

              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                    <p className={`text-xs mt-1 min-h-[32px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.description || 'Sin descripción especificada'}
                    </p>
                  </div>
                </div>

                <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">Bs. {plan.price}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold ml-1">/ {plan.duration_days} días</span>
                  </div>
                  {plan.is_multi_branch ? (
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-sm">
                      Pase Libre Cadena
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900">
                      Sucursal Única
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Beneficios Incluidos:
                  </p>
                  {(plan.features && plan.features.length > 0
                    ? plan.features
                    : ['Acceso ilimitado por código QR', 'Musculación y Cardio']
                  ).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                  <Users className="h-3.5 w-3.5 text-emerald-400" /> Activo en Gimnasio
                </span>

                {canManageMemberships && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(plan)}
                      className="p-2 rounded-xl text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 transition-all cursor-pointer"
                      title="Editar Plan"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan)}
                      className="p-2 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all cursor-pointer"
                      title="Eliminar Plan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT PLAN MODAL */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 !m-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-black text-base flex items-center gap-2">
                {editingPlan ? <Edit className="h-5 w-5 text-sky-400" /> : <CreditCard className="h-5 w-5 text-emerald-500" />}
                {editingPlan ? 'Editar Plan de Membresía' : 'Registrar Nuevo Plan de Membresía'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Nombre del Plan *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Plan Trimestral VIP"
                  className={`w-full border rounded-xl p-2.5 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Duración (Días de Vigencia) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.durationDays === '' ? '' : formData.durationDays}
                    onFocus={(e) => {
                      if (formData.durationDays === 0 || formData.durationDays === '0') {
                        setFormData({ ...formData, durationDays: '' });
                      } else {
                        e.target.select();
                      }
                    }}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    className={`w-full border rounded-xl p-2.5 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Precio en Bolivianos (Bs.) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.50"
                    value={formData.priceBs === '' ? '' : formData.priceBs}
                    onFocus={(e) => {
                      if (formData.priceBs === 0 || formData.priceBs === '0') {
                        setFormData({ ...formData, priceBs: '' });
                      } else {
                        e.target.select();
                      }
                    }}
                    onChange={(e) => setFormData({ ...formData, priceBs: e.target.value })}
                    placeholder="250.00"
                    className={`w-full border rounded-xl p-2.5 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Descripción Breve</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Acceso ilimitado por 3 meses con asesoría inicial..."
                  className={`w-full border rounded-xl p-2.5 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Características / Beneficios (Separados por coma)</label>
                <textarea
                  rows={2}
                  value={formData.featuresStr}
                  onChange={(e) => setFormData({ ...formData, featuresStr: e.target.value })}
                  placeholder="Acceso 24/7, Evaluación inicial, Locker personal, Clases de Zumba"
                  className={`w-full border rounded-xl p-2.5 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPopularCheck"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="isPopularCheck" className="font-bold text-slate-300 cursor-pointer">
                    Destacar este plan como "Más Popular" en la recepción
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl border bg-slate-950/80 border-slate-800">
                  <div>
                    <span className="font-bold block text-slate-200">Pase Libre Cadena (Multi-Sucursal)</span>
                    <span className="text-[10px] text-slate-400">Si está activo, el socio puede ingresar en cualquier sucursal</span>
                  </div>
                  <input
                    type="checkbox"
                    id="isMultiBranchCheck"
                    checked={formData.isMultiBranch}
                    onChange={(e) => setFormData({ ...formData, isMultiBranch: e.target.checked })}
                    className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl shadow-lg mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Guardando Plan...</span>
                  </>
                ) : (
                  <span>{editingPlan ? 'Guardar Cambios' : 'Crear Plan'}</span>
                )}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, plan: null, isLoading: false })}
        onConfirm={executeDeletePlan}
        title="Eliminar Plan"
        message={`¿Estás seguro de eliminar el plan "${confirmModal.plan?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
};
