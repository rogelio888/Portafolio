import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Edit, Sparkles, Loader2, QrCode, CreditCard, CheckCircle2, Building2, AlertCircle } from 'lucide-react';
import { useClientStore } from '../state/useClientStore';
import { useBranchStore } from '../../settings/state/useBranchStore';
import type { Client, MembershipType, MembershipStatus } from '../types/client.types';
import type { MembershipPlan } from '../../memberships/types/membership.types';
import { useToast } from '../../../components/ui/ToastProvider';
import { api } from '../../../services/api';
import { useAuthStore } from '../../auth/state/useAuthStore';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (clientId: string) => void;
  clientToEdit?: Client | null;
}

export const ClientFormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientToEdit,
}) => {
  const { addClient, updateClient } = useClientStore();
  const { branches, activeBranchId } = useBranchStore();
  const { user } = useAuthStore();
  const toast = useToast();

  const isAdmin = user?.roles?.includes('admin') || user?.role === 'Administrador General';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<MembershipPlan[]>([]);
  const [selectedMembershipId, setSelectedMembershipId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<string | number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr_transfer' | 'card'>('cash');
  const [assignMembershipNow, setAssignMembershipNow] = useState<boolean>(true);

  // Gateway Simulation State
  const [paymentStep, setPaymentStep] = useState<'form' | 'qr_simulator' | 'pos_simulator'>('form');
  const [countdown, setCountdown] = useState<number>(4);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '1998-05-15',
    membershipType: 'VIP Mensual' as MembershipType,
    status: 'active' as MembershipStatus,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    notes: '',
  });

  useEffect(() => {
    if (isOpen && !clientToEdit) {
      setPaymentStep('form');
      setIsPaymentConfirmed(false);

      if (!isAdmin && user?.branch_id) {
        setSelectedBranchId(user.branch_id);
      } else if (activeBranchId && activeBranchId !== 'all') {
        setSelectedBranchId(activeBranchId);
      } else if (branches.length > 0) {
        setSelectedBranchId(branches[0].id);
      }

const DEFAULT_PLANS: MembershipPlan[] = [
  {
    id: 'plan-mensual-vip',
    name: 'Plan Mensual VIP',
    duration_days: 30,
    price: 250,
    description: 'Acceso ilimitado a todas las instalaciones.',
    features: ['Acceso 24/7', 'Área de Pesas', 'Cardio'],
    is_popular: true,
    is_multi_branch: true,
    activeMembersCount: 48,
  },
  {
    id: 'plan-trimestral-pro',
    name: 'Plan Trimestral Pro',
    duration_days: 90,
    price: 650,
    description: 'Ahorro especial y evaluación antropométrica.',
    features: ['Acceso ilimitado', 'Descuento especial'],
    is_popular: false,
    is_multi_branch: true,
    activeMembersCount: 32,
  },
  {
    id: 'plan-anual-elite',
    name: 'Plan Anual Elite',
    duration_days: 365,
    price: 2200,
    description: 'Mejor tarifa anual con congelamiento.',
    features: ['Acceso 365 días', 'Invitados gratis'],
    is_popular: false,
    is_multi_branch: true,
    activeMembersCount: 19,
  },
  {
    id: 'pase-diario',
    name: 'Pase Diario',
    duration_days: 1,
    price: 30,
    description: 'Acceso libre por un día.',
    features: ['Acceso 1 día'],
    is_popular: false,
    is_multi_branch: false,
    activeMembersCount: 5,
  },
];

      api.get('/memberships').then((res) => {
        const list: MembershipPlan[] = res.data.data || res.data || [];
        if (list && list.length > 0) {
          setMemberships(list);
          setSelectedMembershipId(list[0].id);
          setPaidAmount(Number(list[0].price) || 0);
        } else {
          setMemberships(DEFAULT_PLANS);
          setSelectedMembershipId(DEFAULT_PLANS[0].id);
          setPaidAmount(Number(DEFAULT_PLANS[0].price) || 0);
        }
      }).catch(() => {
        setMemberships(DEFAULT_PLANS);
        setSelectedMembershipId(DEFAULT_PLANS[0].id);
        setPaidAmount(Number(DEFAULT_PLANS[0].price) || 0);
      });
    }
  }, [isOpen, clientToEdit, activeBranchId, branches, user, isAdmin]);

  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        firstName: clientToEdit.firstName || '',
        lastName: clientToEdit.lastName || '',
        email: clientToEdit.email || '',
        phone: clientToEdit.phone || '',
        birthDate: clientToEdit.birthDate || '1998-05-15',
        membershipType: clientToEdit.membershipType || 'VIP Mensual',
        status: clientToEdit.status || 'active',
        photoUrl: clientToEdit.photoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        notes: clientToEdit.notes || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthDate: '1998-05-15',
        membershipType: 'VIP Mensual',
        status: 'active',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        notes: '',
      });
    }
  }, [clientToEdit, isOpen]);

  // Simulator Countdown Timer Effect
  useEffect(() => {
    let timer: any = null;
    if ((paymentStep === 'qr_simulator' || paymentStep === 'pos_simulator') && !isPaymentConfirmed) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      } else {
        handleConfirmSimulatedPayment();
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [paymentStep, countdown, isPaymentConfirmed]);

  const handleSelectPlan = (planId: string) => {
    setSelectedMembershipId(planId);
    const selected = memberships.find((m) => m.id === planId);
    if (selected) {
      setPaidAmount(Number(selected.price) || 0);
    }
  };

  const handleConfirmSimulatedPayment = async () => {
    if (isPaymentConfirmed || isSubmitting) return;
    setIsPaymentConfirmed(true);
    setTimeout(async () => {
      await executeFinalSave();
    }, 1200);
  };

  if (!isOpen) return null;

  const isEditing = Boolean(clientToEdit);
  const selectedPlan = memberships.find((m) => m.id === selectedMembershipId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!formData.firstName || !formData.lastName) {
      const msg = 'Por favor ingresa al menos nombre y apellido.';
      setInlineError(msg);
      toast.error('Campos Incompletos', msg);
      return;
    }

    setIsSubmitting(true);

    if (!isEditing && assignMembershipNow && selectedMembershipId) {
      // Pre-check if active cash shift is open for branch
      try {
        const targetBId = selectedBranchId || activeBranchId || '';
        const cashRes = await api.get('/cash-shifts/active', {
          headers: targetBId ? { 'X-Branch-Id': targetBId } : {},
          params: targetBId ? { branch_id: targetBId } : {},
        });
        const resData = cashRes.data;

        let hasOpenShift = false;
        if (resData?.active_shift) {
          hasOpenShift = true;
        } else if (resData?.is_consolidated && Array.isArray(resData?.branches_summary)) {
          const targetSummary = resData.branches_summary.find((b: any) => b.branch?.id === targetBId);
          if (targetSummary?.is_open) {
            hasOpenShift = true;
          } else {
            hasOpenShift = resData.branches_summary.some((b: any) => b.is_open);
          }
        }

        if (!hasOpenShift) {
          const msg = 'No se puede realizar el registro con cobro porque la caja chica de esta sucursal está cerrada. Por favor abre la caja chica primero.';
          setInlineError(msg);
          toast.error('Caja Chica Cerrada', msg);
          setIsSubmitting(false);
          return;
        }
      } catch {
        const msg = 'Debes abrir un turno de caja chica antes de registrar nuevos socios con pago o membresía.';
        setInlineError(msg);
        toast.error('Caja Chica Cerrada', msg);
        setIsSubmitting(false);
        return;
      }

      if (paymentMethod === 'qr_transfer') {
        setCountdown(4);
        setIsPaymentConfirmed(false);
        setPaymentStep('qr_simulator');
        setIsSubmitting(false);
        return;
      } else if (paymentMethod === 'card') {
        setCountdown(3);
        setIsPaymentConfirmed(false);
        setPaymentStep('pos_simulator');
        setIsSubmitting(false);
        return;
      }
    }

    await executeFinalSave();
  };

  const executeFinalSave = async () => {
    setIsSubmitting(true);
    try {
      if (isEditing && clientToEdit) {
        await updateClient(clientToEdit.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
          photoUrl: formData.photoUrl,
          notes: formData.notes,
        });

        toast.success('Cliente Actualizado', `Los datos de ${formData.firstName} ${formData.lastName} han sido guardados.`);
        onSuccess(clientToEdit.id);
      } else {
        // Pre-check cash shift right before database creation
        if (assignMembershipNow && selectedMembershipId) {
          try {
            const targetBId = selectedBranchId || activeBranchId || '';
            const cashRes = await api.get('/cash-shifts/active', {
              headers: targetBId ? { 'X-Branch-Id': targetBId } : {},
              params: targetBId ? { branch_id: targetBId } : {},
            });
            const resData = cashRes.data;

            let hasOpenShift = false;
            if (resData?.active_shift) {
              hasOpenShift = true;
            } else if (resData?.is_consolidated && Array.isArray(resData?.branches_summary)) {
              const targetSummary = resData.branches_summary.find((b: any) => b.branch?.id === targetBId);
              if (targetSummary?.is_open) {
                hasOpenShift = true;
              } else {
                hasOpenShift = resData.branches_summary.some((b: any) => b.is_open);
              }
            }

            if (!hasOpenShift) {
              toast.error(
                'Caja Chica Cerrada',
                'No se creó el cliente ni se procesó el cobro porque la caja chica de esta sucursal está cerrada.'
              );
              setIsSubmitting(false);
              return;
            }
          } catch {
            toast.error(
              'Caja Chica Cerrada',
              'Debes abrir el turno de caja chica antes de realizar cualquier cobro.'
            );
            setIsSubmitting(false);
            return;
          }
        }

        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        const endDate = new Date(today.setMonth(today.getMonth() + 1)).toISOString().split('T')[0];

        const newClient = await addClient({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || '+591 7000 0000',
          address: 'Santa Cruz de la Sierra',
          birthDate: formData.birthDate,
          membershipType: selectedPlan ? (selectedPlan.name as any) : formData.membershipType,
          photoUrl: formData.photoUrl,
          startDate,
          endDate,
          hasPendingPayment: false,
          notes: formData.notes,
          branch_id: selectedBranchId || undefined,
        });

        if (assignMembershipNow && selectedMembershipId) {
          try {
            await api.post(`/clients/${newClient.id}/memberships`, {
              membership_id: selectedMembershipId,
              paid_amount: paidAmount,
              payment_method: paymentMethod,
            });
            const methodLabel = paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'qr_transfer' ? 'Transferencia QR (Libélula Pay)' : 'Tarjeta (POS RedEnlace)';
            toast.success(
              'Socio Registrado y Cobro Confirmado',
              `Se cobró Bs. ${paidAmount} en ${methodLabel} para la membresía de ${newClient.firstName} ${newClient.lastName}.`
            );
          } catch (mErr: any) {
            console.error('Error auto-assigning membership:', mErr);
            toast.error('Cliente Creado (Sin Membresía)', 'El cliente se creó pero no se pudo procesar el cobro.');
          }
        } else {
          toast.success('Cliente Registrado', `El socio ${newClient.firstName} ${newClient.lastName} ha sido dado de alta exitosamente.`);
        }
        onSuccess(newClient.id);
      }
      setPaymentStep('form');
      setIsPaymentConfirmed(false);
      onClose();
    } catch {
      toast.error('Error al Guardar', 'No se pudo guardar la información del cliente en el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 !m-0 z-[9999] bg-slate-950/80 overflow-y-auto flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 15 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative my-8"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              {isEditing ? <Edit className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Editar Expediente de Cliente' : 'Registrar Nuevo Cliente'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Actualiza los datos personales o el estado del socio' : 'Generación automática de UUID y Código QR'}
              </p>
            </div>
          </div>

          {paymentStep === 'qr_simulator' ? (
            <div className="space-y-5 text-center py-2 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <QrCode className="h-4 w-4" />
                  <span>PASARELA LIBÉLULA PAY · PAGO QR BANCO</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  Simple QR / Webhook
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-semibold">Monto a Cobrar para Membresía</p>
                <h3 className="text-3xl font-black text-white mt-0.5">
                  Bs. {Number(paidAmount || 0).toFixed(2)}
                </h3>
                <p className="text-[11px] text-emerald-400 font-bold mt-1">
                  Socio: {formData.firstName} {formData.lastName} — Plan: {selectedPlan?.name || 'Membresía'}
                </p>
              </div>

              <div className="relative mx-auto w-52 h-52 bg-white p-3 rounded-2xl shadow-2xl border-4 border-emerald-500/50 flex flex-col items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FITSCAN_LIBELULA_BS_${paidAmount}&color=022c22&bg=ffffff`}
                  alt="QR Libélula Pay"
                  className="w-full h-full object-contain rounded-lg"
                />
                {isPaymentConfirmed && (
                  <div className="absolute inset-0 bg-slate-950/95 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm">
                    <CheckCircle2 className="h-16 w-16 text-emerald-400 animate-bounce mb-2" />
                    <span className="text-xs font-black text-white">¡PAGO CONFIRMADO!</span>
                    <span className="text-[10px] text-emerald-400 font-bold mt-1">Banco confirmó transferencia</span>
                  </div>
                )}
              </div>

              {!isPaymentConfirmed ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-xs">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <span>Esperando transferencia del cliente desde su App Bancaria ({countdown}s)...</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Webhook activo: Escuchando confirmación bancaria en tiempo real.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-xs font-bold text-emerald-400">
                    ¡Transferencia QR Verificada! Registrando socio y activando membresía...
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setPaymentStep('form')}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Volver al Formulario
                </button>
                <button
                  type="button"
                  disabled={isPaymentConfirmed || isSubmitting}
                  onClick={handleConfirmSimulatedPayment}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {isPaymentConfirmed ? 'Procesando...' : 'Simular Pago Exitoso'}
                </button>
              </div>
            </div>
          ) : paymentStep === 'pos_simulator' ? (
            <div className="space-y-5 text-center py-2 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <CreditCard className="h-4 w-4" />
                  <span>PASARELA REDENLACE / LIBÉLULA · TERMINAL POS</span>
                </div>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  POS Online
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-semibold">Monto a Cobrar con Tarjeta</p>
                <h3 className="text-3xl font-black text-white mt-0.5">
                  Bs. {Number(paidAmount || 0).toFixed(2)}
                </h3>
                <p className="text-[11px] text-cyan-400 font-bold mt-1">
                  Socio: {formData.firstName} {formData.lastName} — Plan: {selectedPlan?.name || 'Membresía'}
                </p>
              </div>

              <div className="mx-auto w-48 h-36 bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl border border-slate-700 p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <CreditCard className="h-8 w-8 text-cyan-400" />
                  <span className="text-[10px] font-mono text-slate-400">POS #RED-9402</span>
                </div>
                {isPaymentConfirmed ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-xs">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>AUTORIZADO #84920</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-xs animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                    <span>Procesando chip / NFC... ({countdown}s)</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>VISA / MASTERCARD</span>
                  <span>LIBELULA PAY</span>
                </div>
              </div>

              {!isPaymentConfirmed ? (
                <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-cyan-300 font-bold text-xs">
                    <span>Acercar o insertar tarjeta en la terminal POS...</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Transacción cifrada directamente con el emisor bancario.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-xs font-bold text-emerald-400">
                    ¡Cobro con Tarjeta Aprobado! Registrando nuevo socio...
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setPaymentStep('form')}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Volver al Formulario
                </button>
                <button
                  type="button"
                  disabled={isPaymentConfirmed || isSubmitting}
                  onClick={handleConfirmSimulatedPayment}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {isPaymentConfirmed ? 'Procesando...' : 'Simular Aprobación POS'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nombre(s) *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Ej. Roberto"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Ej. Morales"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="roberto@email.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+591 7000 0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                    Sucursal de Registro / Pertenencia *
                    {!isAdmin && (
                      <span className="text-[10px] text-emerald-400 font-normal ml-2">
                        (Fijado según su sucursal de sesión)
                      </span>
                    )}
                  </label>
                  <select
                    value={selectedBranchId}
                    disabled={!isAdmin}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code || 'Sede'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isEditing ? (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Estado del Cliente</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MembershipStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="active">Activo</option>
                    <option value="expired">Inactivo / Vencido</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      Inscripción y Cobro de Membresía
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={assignMembershipNow}
                        onChange={(e) => setAssignMembershipNow(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/30"
                      />
                      Cobrar ahora
                    </label>
                  </div>

                  {assignMembershipNow && (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Plan Comercial *</label>
                        <select
                          value={selectedMembershipId}
                          onChange={(e) => handleSelectPlan(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                        >
                          {memberships.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} — Bs. {m.price} ({m.duration_days} días)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Monto Cobrado (Bs.) *</label>
                          <input
                            type="number"
                            required
                            min={0}
                            step="0.50"
                            value={paidAmount}
                            onFocus={() => {
                              if (paidAmount === 0 || paidAmount === '0') setPaidAmount('');
                            }}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            onBlur={() => {
                              if (paidAmount === '' || isNaN(Number(paidAmount))) setPaidAmount(0);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Método de Pago *</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                          >
                            <option value="cash">Efectivo</option>
                            <option value="qr_transfer">Transferencia QR</option>
                            <option value="card">Tarjeta de Débito / Crédito</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1">Observaciones / Notas de Salud</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Alergias, recomendaciones de entrenamiento o anotaciones..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {inlineError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center justify-between gap-3 my-2 animate-in fade-in zoom-in-95 shadow-lg shadow-rose-500/5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-rose-500/20 rounded-xl text-rose-400 shrink-0">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-xs leading-snug">{inlineError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInlineError(null)}
                    className="text-rose-400 hover:text-white p-1 rounded-lg hover:bg-rose-500/20 transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {isEditing
                        ? 'Guardar Cambios'
                        : !assignMembershipNow
                        ? 'Registrar Cliente'
                        : paymentMethod === 'qr_transfer'
                        ? 'Generar QR de Pago (Libélula)'
                        : paymentMethod === 'card'
                        ? 'Cobrar con Tarjeta POS'
                        : 'Registrar y Cobrar en Efectivo'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
