import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Building2, Clock, ShieldCheck, LogOut, Sun, Moon, Smartphone, ChevronRight } from 'lucide-react';
import { useClientStore } from '../../features/clients/state/useClientStore';
import { useAuthStore } from '../../features/auth/state/useAuthStore';
import { useBranchStore } from '../../features/settings/state/useBranchStore';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, pendingPayments } = useClientStore();
  const { user, logout } = useAuthStore();
  const { branches, activeBranchId, setActiveBranchId, fetchBranches } = useBranchStore();
  const navigate = useNavigate();
  const [time, setTime] = useState<string>('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const activePendingCount = pendingPayments.filter((p) => p.status === 'pending').length;

  const isAdmin = user?.roles?.includes('admin') || user?.role === 'Administrador General';
  const isSingleBranchLocked = !isAdmin || (user as any)?.access_scope === 'single_branch';

  useEffect(() => {
    fetchBranches();
    if (isSingleBranchLocked && user?.branch_id) {
      setActiveBranchId(user.branch_id);
    }
  }, [user?.id, user?.branch_id, isSingleBranchLocked]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('es-BO', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/60 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 ml-64 transition-colors duration-200 print:hidden">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar cliente, membresía o folio..."
          className="w-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Dynamic Branch Selector Dropdown */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs">
          <Building2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <select
            value={activeBranchId}
            disabled={isSingleBranchLocked}
            onChange={(e) => {
              setActiveBranchId(e.target.value);
              // Trigger a subtle window event so pages re-fetch if needed
              window.dispatchEvent(new Event('branch-changed'));
            }}
            className="bg-transparent text-slate-800 dark:text-slate-200 font-bold text-xs focus:outline-none cursor-pointer max-w-[200px] truncate disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isAdmin && (
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                Todas las Sucursales (Consolidado)
              </option>
            )}
            {branches.map((b) => (
              <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-sm"
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span className="text-xs font-bold text-slate-300">Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Modo Oscuro</span>
            </>
          )}
        </button>

        {/* Live Clock */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold">
          <Clock className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
          <span>{time || '00:00:00'}</span>
        </div>

        {/* Notifications Button & Interactive Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Ver Notificaciones"
          >
            <Bell className="h-4 w-4" />
            {activePendingCount > 0 && (
              <>
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-amber-500 text-[8px] font-black text-slate-950 flex items-center justify-center">
                  {activePendingCount}
                </span>
              </>
            )}
          </button>

          {/* Dropdown Popover Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs select-none">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
                <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-emerald-500" /> Notificaciones
                </h4>
                <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                  {activePendingCount} Renovaciones
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {pendingPayments.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigate('/pagos');
                    }}
                    className="p-2.5 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-emerald-500/40 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={p.clientPhoto} alt={p.clientName} className="h-8 w-8 rounded-xl object-cover" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{p.clientName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.planName} • <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Bs. {p.amountBs}</span></p>
                      </div>
                    </div>

                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg font-bold flex items-center gap-0.5">
                      Revisar <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen(false);
                  navigate('/pagos');
                }}
                className="mt-3 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Smartphone className="h-3.5 w-3.5" /> Ir a Aprobar Pagos Móviles
              </button>
            </div>
          )}
        </div>

        {/* Profile & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name || 'Usuario'}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/40"
          />
          <div className="text-left hidden md:block">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1">
              {user?.name || 'Ana Sofía'} <ShieldCheck className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{user?.role || 'Recepcionista'}</p>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-rose-500/10 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 hover:border-rose-500/30 transition-all cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
