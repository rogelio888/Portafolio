import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, Save, Loader2 } from 'lucide-react';
import { api } from '../../../services/api';
import { useBranchStore } from '../state/useBranchStore';

interface BranchData {
  id?: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  opening_time?: string;
  closing_time?: string;
  is_active?: boolean;
}

interface BranchFormModalProps {
  branch: BranchData | null; // Null means creation mode
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BranchFormModal: React.FC<BranchFormModalProps> = ({
  branch,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<BranchData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    opening_time: '06:00',
    closing_time: '22:00',
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (branch) {
      setFormData({
        id: branch.id,
        name: branch.name || '',
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
        opening_time: branch.opening_time || '06:00',
        closing_time: branch.closing_time || '22:00',
        is_active: branch.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        opening_time: '06:00',
        closing_time: '22:00',
        is_active: true,
      });
    }
    setErrorMessage(null);
  }, [branch, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('El nombre de la sucursal es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (branch?.id) {
        // Edit mode
        await api.put(`/branches/${branch.id}`, formData);
      } else {
        // Creation mode
        await api.post('/branches', formData);
      }
      useBranchStore.getState().fetchBranches();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving branch:', err);
      setErrorMessage(
        err.response?.data?.message || 'Error al guardar los datos de la sucursal.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 overflow-y-auto flex items-start sm:items-center justify-center p-3 sm:p-4">
      <div className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 pb-3 pr-8 border-b border-slate-200 dark:border-slate-800">
          <Building2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {branch ? 'Editar Sucursal' : 'Registrar Nueva Sucursal'}
          </h2>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nombre de la Sucursal *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Sucursal Central Equipetrol"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Dirección o Ubicación
            </label>
            <input
              type="text"
              placeholder="Ej. Av. San Martín #450, Santa Cruz"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                placeholder="Ej. +591 70012345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="equipetrol@fitscan.bo"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hora de Apertura
              </label>
              <input
                type="time"
                value={formData.opening_time}
                onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hora de Cierre
              </label>
              <input
                type="time"
                value={formData.closing_time}
                onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Sucursal Activa</span>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer h-4 w-4"
            />
          </div>

          <div className="pt-3 flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{branch ? 'Guardar Cambios' : 'Crear Sucursal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
