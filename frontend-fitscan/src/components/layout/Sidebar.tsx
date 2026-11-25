import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  QrCode,
  Users,
  CreditCard,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  Dumbbell,
  ShieldAlert,
  UserCog,
  X,
} from 'lucide-react';
import { useClientStore } from '../../features/clients/state/useClientStore';
import { useAuthStore } from '../../features/auth/state/useAuthStore';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  permission: string;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
  { name: 'Control de Asistencia', path: '/asistencias', icon: QrCode, permission: 'attendance.scan' },
  { name: 'Clientes & Miembros', path: '/clientes', icon: Users, permission: 'clients.view' },
  { name: 'Membresías', path: '/membresias', icon: CreditCard, permission: 'memberships.view' },
  { name: 'Pagos & Cobros', path: '/pagos', icon: Receipt, permission: 'payments.create' },
  { name: 'Caja & Turnos', path: '/caja', icon: Wallet, permission: 'payments.create' },
  { name: 'Reportes & Analítica', path: '/reportes', icon: BarChart3, permission: 'reports.view' },
  { name: 'Usuarios & Roles', path: '/usuarios', icon: UserCog, permission: 'users.manage' },
  { name: 'Configuración', path: '/configuracion', icon: Settings, permission: 'settings.manage' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { setKioskMode, theme } = useClientStore();
  const { hasPermission } = useAuthStore();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const visibleNavItems = NAV_ITEMS.filter((item) => hasPermission(item.permission));

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden print:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 h-dvh fixed left-0 top-0 backdrop-blur-md border-r flex flex-col z-50 lg:z-30 justify-between select-none transition-transform duration-200 ease-out overflow-y-auto print:hidden lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${
          isDark ? 'bg-slate-950/95 lg:bg-slate-950/80 border-slate-800' : 'bg-white/95 lg:bg-white/90 border-slate-200'
        }`}
      >
        {/* Header / Brand */}
        <div>
          <div className={`p-4 sm:p-5 flex items-center justify-between gap-2 border-b ${
            isDark ? 'border-slate-800/80' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                <Dumbbell className="h-5 w-5 text-slate-950 font-black" />
              </div>
              <div>
                <h1 className={`font-black tracking-wider text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>FITSCAN</h1>
                <p className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>SaaS Gym OS</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              className={`lg:hidden p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                  : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                        : isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Kiosk Mode CTA Button */}
        <div className="p-4">
          <div className={`p-4 rounded-2xl border transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Modo Kiosco QR</span>
            </div>
            <p className={`text-[11px] mb-3 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Pantalla completa de escaneo automático sin intervención humana.
            </p>
            <button
              onClick={() => {
                onClose?.();
                setKioskMode(true);
                navigate('/asistencias');
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Iniciar Kiosco</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
