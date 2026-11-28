import { useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ExpenseType } from '../types/store';
import { Drawer } from './Drawer';

interface CategoryManagerDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  categories: string[];
  usageCounts: Map<string, number>;
  itemNoun: string;
  expenseCategoryTypes?: Record<string, ExpenseType>;
  onAdd: (name: string, defaultType?: ExpenseType) => { ok: true } | { ok: false; error: string };
  onRename: (oldName: string, newName: string) => { ok: true } | { ok: false; error: string };
  onDelete: (name: string) => { ok: true } | { ok: false; error: string };
  onChangeDefaultType?: (name: string, type: ExpenseType) => void;
}

export function CategoryManagerDrawer({
  open,
  onClose,
  title,
  subtitle,
  categories,
  usageCounts,
  itemNoun,
  expenseCategoryTypes,
  onAdd,
  onRename,
  onDelete,
  onChangeDefaultType,
}: CategoryManagerDrawerProps) {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ExpenseType>('Variable');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const hasExpenseTypes = Boolean(expenseCategoryTypes);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = onAdd(newName, hasExpenseTypes ? newType : undefined);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    toast.success(`Categoría "${newName.trim()}" agregada`);
    setNewName('');
  };

  const handleSaveRename = (oldName: string) => {
    setError(null);
    const res = onRename(oldName, editDraft);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    toast.success(`Categoría actualizada a "${editDraft.trim()}"`);
    setEditingCat(null);
    setEditDraft('');
  };

  const handleRemove = (name: string) => {
    setError(null);
    const res = onDelete(name);
    if (!res.ok) {
      setError(res.error);
      toast.error(res.error);
      return;
    }
    toast.info(`Categoría "${name}" eliminada`);
  };

  return (
    <Drawer open={open} onClose={onClose} title={title} subtitle={subtitle}>
      <div className="space-y-5">
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-3.5 py-2.5 text-xs font-semibold text-[#991B1B]"
          >
            {error}
          </div>
        ) : null}

        <form onSubmit={handleAdd} className="space-y-2.5 rounded-xl border border-[#D6D6CD] bg-[#F8F8F5] p-4">
          <label className="block text-xs font-semibold text-[#434B53]">
            Nueva categoría
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={hasExpenseTypes ? 'Ej. Publicidad / Seguros' : 'Ej. Herramientas Eléctricas'}
                className="h-10 flex-1 rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A] placeholder:text-[#5B636B] focus:border-[#14171A] focus:outline-none"
              />
              <button
                type="submit"
                className="btn-press inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#14171A] px-4 text-xs font-semibold text-white hover:bg-[#272C32]"
              >
                <Plus className="h-3.5 w-3.5 text-[#F59E0B]" />
                Añadir
              </button>
            </div>
          </label>

          {hasExpenseTypes ? (
            <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
              <span className="font-medium text-[#5B636B]">Clasificación por defecto:</span>
              <div className="inline-flex rounded-md border border-[#D6D6CD] bg-white p-0.5">
                {(['Fijo', 'Variable'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewType(t)}
                    className={`rounded px-2.5 py-1 text-[11px] font-semibold ${
                      newType === t ? 'bg-[#14171A] text-white' : 'text-[#434B53]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </form>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
            <span>Categorías activas ({categories.length})</span>
            <span>Registros asociados</span>
          </div>
          <ul className="divide-y divide-[#EAEAE3] rounded-xl border border-[#D6D6CD] bg-white">
            {categories.map((cat) => {
              const count = usageCounts.get(cat) ?? 0;
              const isEditing = editingCat === cat;
              const catType = expenseCategoryTypes?.[cat] ?? 'Variable';

              return (
                <li key={cat} className="flex items-center justify-between gap-2 px-3.5 py-3">
                  {isEditing ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(cat);
                          if (e.key === 'Escape') setEditingCat(null);
                        }}
                        aria-label={`Nuevo nombre para ${cat}`}
                        className="h-9 flex-1 rounded-lg border border-[#14171A] bg-[#F8F8F5] px-2.5 text-sm font-medium text-[#14171A] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(cat)}
                        aria-label="Guardar nombre"
                        className="btn-press inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#14171A] text-white"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCat(null)}
                        aria-label="Cancelar edición"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D6D6CD] bg-white text-[#5B636B]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[#14171A]">{cat}</div>
                        <div className="tabular-nums text-xs text-[#5B636B]">
                          {count} {itemNoun}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {hasExpenseTypes && onChangeDefaultType ? (
                          <button
                            type="button"
                            onClick={() =>
                              onChangeDefaultType(cat, catType === 'Fijo' ? 'Variable' : 'Fijo')
                            }
                            title="Cambiar tipo predeterminado (Fijo / Variable)"
                            className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${
                              catType === 'Fijo'
                                ? 'border-[#CBD5E1] bg-[#F1F5F9] text-[#1E293B]'
                                : 'border-[#F3C898] bg-[#FEF2E4] text-[#8A3A00]'
                            }`}
                          >
                            {catType}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCat(cat);
                            setEditDraft(cat);
                            setError(null);
                          }}
                          aria-label={`Editar categoría ${cat}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] text-[#434B53] hover:border-[#14171A] hover:text-[#14171A]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(cat)}
                          aria-label={`Eliminar categoría ${cat}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] text-[#5B636B] hover:border-[#FCA5A5] hover:bg-[#FEE2E2] hover:text-[#991B1B]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Drawer>
  );
}
