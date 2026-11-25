import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../state/useAuthStore';
import { useToast } from '../../../components/ui/ToastProvider';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login, loginAsDemo, isLoading, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Por favor ingrese su correo y contraseña.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      toast.success('¡Bienvenido a FitScan!', 'Sesión iniciada en modo demo local.');
      navigate('/dashboard', { replace: true });
    } else {
      setErrorMessage('Credenciales incorrectas. Utiliza los accesos rápidos de demo.');
    }
  };

  const handleQuickDemo = async (type: 'admin' | 'reception') => {
    setErrorMessage('');
    const targetEmail = type === 'admin' ? 'admin@fitscan.com' : 'recepcion@fitscan.com';
    setEmail(targetEmail);
    setPassword('demo2026');
    const success = await loginAsDemo(type);
    if (success) {
      toast.success('Acceso Demo Activado', `Ingresando como ${type === 'admin' ? 'Administrador General' : 'Recepcionista Kiosco'}`);
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-2xl relative z-10 space-y-5">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
            <Dumbbell className="h-8 w-8 text-slate-950 font-black" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            FITSCAN GYM OS
          </h1>
          <p className="text-xs text-slate-400 mt-1">SaaS Comercial de Administración de Gimnasios · Demo Local</p>
        </div>

        {/* Quick 1-Click Demo Access */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Accesos Rápidos Demo
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">1-Clic Directo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickDemo('admin')}
              className="p-3 rounded-2xl bg-slate-950/90 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                  Total
                </span>
              </div>
              <p className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                Administrador
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">admin@fitscan.com</p>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickDemo('reception')}
              className="p-3 rounded-2xl bg-slate-950/90 hover:bg-slate-800 border border-slate-700 hover:border-teal-400 text-left transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1.5 rounded-lg bg-teal-500/15 text-teal-400">
                  <UserCheck className="h-3.5 w-3.5" />
                </span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  Kiosco
                </span>
              </div>
              <p className="text-xs font-black text-white group-hover:text-teal-300 transition-colors">
                Recepcionista
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">recepcion@fitscan.com</p>
            </button>
          </div>
        </div>

        <div className="relative flex items-center">
          <div className="grow border-t border-slate-800" />
          <span className="mx-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            O con credenciales
          </span>
          <div className="grow border-t border-slate-800" />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs text-center font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fitscan.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Iniciando Sesión...</span>
              </>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
