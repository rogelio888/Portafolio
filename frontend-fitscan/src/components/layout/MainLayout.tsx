import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useClientStore } from '../../features/clients/state/useClientStore';
import { LogOut } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { isKioskMode, setKioskMode, theme } = useClientStore();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  useEffect(() => {
    const rootEl = document.documentElement;
    const bodyEl = document.body;

    if (isDark) {
      rootEl.classList.add('dark');
      bodyEl.classList.add('dark');
      bodyEl.style.backgroundColor = '#020617';
    } else {
      rootEl.classList.remove('dark');
      bodyEl.classList.remove('dark');
      bodyEl.style.backgroundColor = '#f1f5f9';
    }
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isKioskMode) {
        setKioskMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isKioskMode, setKioskMode]);

  if (isKioskMode) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 relative">
        {/* Floating Emergency Exit Button in Kiosk Mode */}
        <div className="fixed top-4 right-4 z-[200]">
          <button
            onClick={() => {
              setKioskMode(false);
              navigate('/dashboard');
            }}
            className="bg-slate-900/90 hover:bg-slate-800 text-rose-300 hover:text-rose-200 border border-rose-500/40 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xl backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Presiona ESC o clic para salir del Modo Kiosco"
          >
            <LogOut className="h-4 w-4 text-rose-400" />
            <span>Salir de Kiosco (ESC)</span>
          </button>
        </div>

        <Outlet />
      </main>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className={`flex-1 ml-64 transition-colors duration-200 print:m-0 print:p-0 print:bg-white ${
          isDark ? 'bg-slate-950/40' : 'bg-slate-100/80'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
