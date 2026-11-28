import { useState, type ReactNode } from 'react';
import {
  BarChart3,
  Boxes,
  Check,
  Cog,
  DollarSign,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Shield,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../state/StoreContext';
import type { AppSection, PermissionKey, UserRole } from '../types/store';
import { fetchOfficialBcbRate } from '../utils/bcbRate';
import { Drawer } from './Drawer';

interface AppShellProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  role: UserRole;
  onChangeRole: (role: UserRole) => void;
  exchangeRate: number;
  onChangeExchangeRate: (rate: number) => void;
  lowStockCount: number;
  pendingOrdersCount: number;
  openQuotesCount: number;
  onResetDemo: () => void;
  children: ReactNode;
}

interface NavItem {
  id: AppSection;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
  permission?: PermissionKey;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'resumen', label: 'Resumen Sucursal', shortLabel: 'Resumen', icon: LayoutDashboard },
  { id: 'inventario', label: 'Inventario', shortLabel: 'Inventario', icon: Boxes },
  { id: 'ventas', label: 'Ventas', shortLabel: 'Ventas', icon: ShoppingCart, permission: 'process_sales' },
  { id: 'clientes', label: 'Clientes', shortLabel: 'Clientes', icon: Users, permission: 'manage_customers' },
  { id: 'proveedores', label: 'Proveedores', shortLabel: 'Proveedores', icon: Truck, permission: 'manage_suppliers' },
  { id: 'gastos', label: 'Gastos', shortLabel: 'Gastos', icon: ReceiptText, permission: 'manage_expenses' },
  { id: 'reportes', label: 'Reportes', shortLabel: 'Reportes', icon: BarChart3, permission: 'view_reports' },
  { id: 'usuarios', label: 'Usuarios y Roles', shortLabel: 'Usuarios', icon: Shield, permission: 'manage_users' },
];

export function AppShell({
  activeSection,
  onSelectSection,
  exchangeRate,
  onChangeExchangeRate,
  lowStockCount,
  pendingOrdersCount,
  openQuotesCount,
  onResetDemo,
  children,
}: AppShellProps) {
  const {
    currentUser,
    currentRoleDefinition,
    users,
    roles,
    hasPermission,
    loginAsUser,
    logout,
  } = useStore();
  const [editingTc, setEditingTc] = useState(false);
  const [tcDraft, setTcDraft] = useState(String(exchangeRate));
  const [syncingBcb, setSyncingBcb] = useState(false);
  const [bcbSyncedDate, setBcbSyncedDate] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const canEditExchange = hasPermission('manage_exchange_rate');
  const visibleItems = NAV_ITEMS.filter((it) => !it.permission || hasPermission(it.permission));
  const primaryMobileIds: AppSection[] = ['resumen', 'inventario', 'ventas', 'proveedores'];
  const roleById = new Map(roles.map((r) => [r.id, r]));

  const handleApplyTc = () => {
    const parsed = Number(tcDraft.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error('Ingresa un tipo de cambio válido mayor a 0.');
      return;
    }
    onChangeExchangeRate(parsed);
    setBcbSyncedDate(null);
    setEditingTc(false);
    toast.success(`Tipo de cambio actualizado: Bs ${parsed.toFixed(2)}`, {
      description: 'Precios de lotes en USD recalculados según protección cambiaria.',
    });
  };

  const handleSyncBcb = async () => {
    if (syncingBcb) return;
    setSyncingBcb(true);
    try {
      const result = await fetchOfficialBcbRate();
      onChangeExchangeRate(result.rate);
      setTcDraft(result.rate.toFixed(2));
      setBcbSyncedDate(result.date);
      setEditingTc(false);
      toast.success(`TC oficial BCB sincronizado: Bs ${result.rate.toFixed(2)}`, {
        description: `Vigencia ${result.date} · Fuente ${result.source}`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de conexión con el servicio BCB.';
      toast.error('No se pudo obtener el TC oficial del BCB', {
        description: msg,
      });
    } finally {
      setSyncingBcb(false);
    }
  };

  const getBadge = (id: AppSection): number | null => {
    if (id === 'inventario' && lowStockCount > 0) return lowStockCount;
    if (id === 'proveedores' && pendingOrdersCount > 0) return pendingOrdersCount;
    if (id === 'ventas' && openQuotesCount > 0) return openQuotesCount;
    return null;
  };

  const handleReset = () => {
    setBcbSyncedDate(null);
    setEditingTc(false);
    onResetDemo();
  };

  return (
    <div className="min-h-screen bg-[#F3F3EF] text-[#14171A]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-[#14171A] focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Ir al contenido principal
      </a>

      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        {/* Desktop Sticky Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-[#D6D6CD] bg-[#EAEAE3] lg:sticky lg:top-0 lg:flex lg:h-screen lg:overflow-y-auto">
          <div>
            <div className="border-b border-[#D6D6CD] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#14171A] text-[#F59E0B]">
                  <Cog className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-base font-bold leading-tight text-[#14171A]">
                    Maquinaria Central
                  </div>
                  <div className="text-xs font-medium text-[#5B636B]">
                    Sucursal Principal
                  </div>
                </div>
              </div>

              {/* Exchange Rate Widget */}
              <div className="mt-3 rounded-lg border border-[#D6D6CD] bg-white px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5B636B]">
                    <DollarSign className="h-3 w-3 text-[#C95B06]" />
                    TC Dólar
                  </span>
                  {canEditExchange && !editingTc ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSyncBcb}
                        disabled={syncingBcb}
                        title="Consultar tipo de cambio oficial del BCB en vivo"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#14171A] hover:text-[#8A3A00] disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3 w-3 ${syncingBcb ? 'animate-spin' : ''}`} />
                        {syncingBcb ? 'Sync...' : 'BCB'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTcDraft(exchangeRate.toFixed(2));
                          setEditingTc(true);
                        }}
                        className="text-[11px] font-semibold text-[#8A3A00] hover:underline"
                      >
                        Ajustar
                      </button>
                    </div>
                  ) : null}
                </div>

                {editingTc && canEditExchange ? (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={tcDraft}
                      onChange={(e) => setTcDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleApplyTc();
                        if (e.key === 'Escape') setEditingTc(false);
                      }}
                      aria-label="Tipo de cambio en Bs por dólar"
                      className="tabular-nums h-8 w-full rounded border border-[#14171A] bg-[#F8F8F5] px-2 text-xs font-bold text-[#14171A] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyTc}
                      aria-label="Guardar tipo de cambio"
                      className="btn-press inline-flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#14171A] text-white"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="tabular-nums mt-0.5 font-display text-base font-bold text-[#14171A]">
                      Bs {exchangeRate.toFixed(2)}{' '}
                      <span className="font-sans text-[11px] font-normal text-[#5B636B]">
                        / 1 USD
                      </span>
                    </div>
                    {bcbSyncedDate ? (
                      <div className="text-[11px] font-medium text-[#166534]">
                        Oficial BCB · {bcbSyncedDate}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <nav aria-label="Navegación principal" className="px-3 py-3">
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  const badge = getBadge(item.id);

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSelectSection(item.id)}
                        aria-current={active ? 'page' : undefined}
                        className={`btn-press flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium ${
                          active
                            ? 'bg-[#14171A] text-white'
                            : 'text-[#434B53] hover:bg-[#DFDFD6] hover:text-[#14171A]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon
                            className={`h-4 w-4 ${
                              active ? 'text-[#F59E0B]' : 'text-[#5B636B]'
                            }`}
                          />
                          <span>{item.label}</span>
                        </span>
                        {badge !== null ? (
                          <span
                            className={`tabular-nums rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                              active
                                ? 'bg-white/15 text-white'
                                : 'bg-[#FEF2E4] text-[#8A3A00]'
                            }`}
                          >
                            {badge}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="border-t border-[#D6D6CD] p-4 space-y-3">
            {/* Active Session & Quick User Switcher */}
            <div className="rounded-lg border border-[#D6D6CD] bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-[#14171A]">
                    {currentUser?.fullName ?? 'Usuario'}
                  </div>
                  <div className="truncate text-[11px] font-medium text-[#8A3A00]">
                    {currentRoleDefinition?.name ?? 'Rol activo'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Cerrar sesión y volver al Login"
                  aria-label="Cerrar sesión"
                  className="btn-press inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-[#D6D6CD] bg-[#F8F8F5] px-2 text-[11px] font-semibold text-[#14171A] hover:border-[#14171A]"
                >
                  <LogOut className="h-3 w-3" />
                  Salir
                </button>
              </div>

              <label className="mt-2.5 block text-[11px] font-semibold text-[#5B636B]">
                Cambiar cuenta (Demo)
                <select
                  value={currentUser?.id ?? ''}
                  onChange={(e) => {
                    const res = loginAsUser(e.target.value);
                    if (res.ok) {
                      const rName = roleById.get(res.user.roleId)?.name ?? 'Rol';
                      toast.info(`Sesión cambiada a ${res.user.fullName}`, {
                        description: rName,
                      });
                    }
                  }}
                  aria-label="Cambiar usuario activo"
                  className="mt-1 h-8 w-full rounded border border-[#D6D6CD] bg-[#F8F8F5] px-2 text-xs font-medium text-[#14171A] focus:border-[#14171A] focus:outline-none"
                >
                  {users
                    .filter((u) => u.active)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({roleById.get(u.roleId)?.name ?? 'Rol'})
                      </option>
                    ))}
                </select>
              </label>

              <button
                type="button"
                onClick={handleReset}
                className="btn-press mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-[#D6D6CD] bg-[#F8F8F5] px-2.5 py-2 text-xs font-semibold text-[#14171A] hover:border-[#14171A] hover:bg-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restablecer datos
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#D6D6CD] bg-[#EAEAE3] px-4 py-2.5 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#14171A] text-[#F59E0B]">
              <Cog className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display text-sm font-bold leading-tight text-[#14171A]">
                Maquinaria Central
              </div>
              <div className="tabular-nums text-[11px] font-medium text-[#5B636B]">
                {currentUser?.fullName ?? 'Usuario'} · TC Bs {exchangeRate.toFixed(2)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="btn-press inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#D6D6CD] bg-white px-3 text-xs font-semibold text-[#14171A]"
          >
            Opciones
          </button>
        </header>

        {/* Main Workspace */}
        <main id="main-content" className="min-w-0 flex-1 pb-6 lg:pb-10">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav
          aria-label="Navegación móvil"
          className="sticky bottom-0 z-30 mt-auto border-t border-[#D6D6CD] bg-white/95 backdrop-blur-sm lg:hidden"
        >
          <ul className="grid grid-cols-5">
            {NAV_ITEMS.filter(
              (it) =>
                primaryMobileIds.includes(it.id) &&
                (!it.permission || hasPermission(it.permission))
            ).map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSection(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-[56px] w-full flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-semibold ${
                      active ? 'text-[#14171A]' : 'text-[#5B636B]'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${active ? 'text-[#C95B06]' : 'text-[#5B636B]'}`}
                    />
                    <span>{item.shortLabel}</span>
                  </button>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className={`flex min-h-[56px] w-full flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-semibold ${
                  !primaryMobileIds.includes(activeSection) ? 'text-[#14171A]' : 'text-[#5B636B]'
                }`}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span>Más</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Drawer for Extra Modules, Role, and Exchange Rate */}
      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Módulos y Control"
        subtitle="Navegación completa, perfil y tipo de cambio"
      >
        <div className="space-y-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
              Secciones
            </div>
            <div className="mt-2 space-y-1.5">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                      active ? 'bg-[#14171A] text-white' : 'bg-[#F8F8F5] text-[#14171A]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-[#F59E0B]' : 'text-[#5B636B]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#D6D6CD] pt-4 space-y-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                Sesión activa
              </div>
              <div className="mt-1 text-sm font-bold text-[#14171A]">
                {currentUser?.fullName ?? 'Usuario'}
              </div>
              <div className="text-xs font-medium text-[#8A3A00]">
                {currentRoleDefinition?.name ?? 'Rol'}
              </div>
            </div>

            <label className="block text-xs font-semibold text-[#434B53]">
              Cambiar cuenta (Demo)
              <select
                value={currentUser?.id ?? ''}
                onChange={(e) => {
                  const res = loginAsUser(e.target.value);
                  if (res.ok) {
                    setMobileMenuOpen(false);
                  }
                }}
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm font-medium text-[#14171A]"
              >
                {users
                  .filter((u) => u.active)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({roleById.get(u.roleId)?.name ?? 'Rol'})
                    </option>
                  ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="btn-press inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#14171A] text-xs font-semibold text-white"
            >
              <LogOut className="h-3.5 w-3.5 text-[#F59E0B]" />
              Cerrar sesión (Ir al Login)
            </button>
          </div>

          {canEditExchange ? (
            <div className="border-t border-[#D6D6CD] pt-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                Tipo de Cambio (Bs / 1 USD)
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={tcDraft}
                    onChange={(e) => setTcDraft(e.target.value)}
                    className="tabular-nums h-10 flex-1 rounded-lg border border-[#D6D6CD] px-3 text-sm font-bold text-[#14171A]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyTc}
                    className="btn-press rounded-lg bg-[#14171A] px-4 text-xs font-semibold text-white"
                  >
                    Aplicar
                  </button>
                </div>
              </label>
              <button
                type="button"
                onClick={handleSyncBcb}
                disabled={syncingBcb}
                className="btn-press mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#D6D6CD] bg-white text-xs font-semibold text-[#14171A] hover:border-[#14171A] disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncingBcb ? 'animate-spin' : ''}`} />
                {syncingBcb ? 'Consultando BCB...' : 'Sincronizar oficial BCB'}
              </button>
              {bcbSyncedDate ? (
                <div className="mt-1.5 text-center text-[11px] font-medium text-[#166534]">
                  Oficial BCB · {bcbSyncedDate}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="border-t border-[#D6D6CD] pt-4">
            <button
              type="button"
              onClick={() => {
                handleReset();
                setMobileMenuOpen(false);
              }}
              className="btn-press inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] text-xs font-semibold text-[#14171A]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restablecer datos iniciales
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
