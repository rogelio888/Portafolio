import { useState, type FormEvent } from 'react';
import { ArrowRight, Cog, Eye, EyeOff, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../state/StoreContext';

export function LoginScreen() {
  const { users, roles, login, loginAsUser } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleById = new Map(roles.map((r) => [r.id, r]));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = login(username, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const roleName = roleById.get(res.user.roleId)?.name ?? 'Usuario';
    toast.success(`Bienvenido, ${res.user.fullName}`, {
      description: `Sesión iniciada con rol ${roleName}.`,
    });
  };

  const handleQuickEnter = (userId: string) => {
    setError(null);
    const res = loginAsUser(userId);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const roleName = roleById.get(res.user.roleId)?.name ?? 'Usuario';
    toast.success(`Sesión iniciada: ${res.user.fullName}`, {
      description: `Rol activo: ${roleName}`,
    });
  };

  return (
    <div className="min-h-screen bg-[#F3F3EF] text-[#14171A] flex flex-col justify-center px-4 py-8 sm:px-6">
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-[#D6D6CD] bg-white lg:grid-cols-12">
        {/* Left: Brand & Operational Context */}
        <div className="flex flex-col justify-between bg-[#14171A] p-6 text-white sm:p-8 lg:col-span-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#272C32] text-[#F59E0B]">
                <Cog className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-lg font-bold leading-tight text-white">
                  Maquinaria Central
                </div>
                <div className="text-xs font-medium text-[#D6D6CD]">
                  Control de Sucursal · Demo Operativa
                </div>
              </div>
            </div>

            <h1 className="mt-7 font-display text-2xl font-bold tracking-tight text-white">
              Acceso al sistema de gestión
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-[#D6D6CD]">
              Cada miembro del equipo ingresa con sus credenciales y accede únicamente a los módulos y costos autorizados por su rol.
            </p>
          </div>

          <div className="mt-8 space-y-2.5 border-t border-white/15 pt-5 text-xs text-[#D6D6CD]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#F59E0B]" />
              <span>Control por roles y permisos editables</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 shrink-0 text-[#F59E0B]" />
              <span>Protección de costos USD/Bs, gastos y reportes</span>
            </div>
          </div>
        </div>

        {/* Right: Login Form & Demo Quick Access */}
        <div className="p-6 sm:p-8 lg:col-span-7">
          <h2 className="font-display text-xl font-bold text-[#14171A]">
            Iniciar sesión
          </h2>
          <p className="mt-1 text-sm text-[#5B636B]">
            Ingresa tu usuario y contraseña o elige un perfil de demostración abajo.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-3.5 py-2.5 text-xs font-semibold text-[#991B1B]"
              >
                {error}
              </div>
            ) : null}

            <label className="block text-xs font-semibold text-[#434B53]">
              Usuario
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. carlos"
                className="mt-1.5 h-11 w-full rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3 text-sm text-[#14171A] placeholder:text-[#5B636B] focus:border-[#14171A] focus:bg-white focus:outline-none"
              />
            </label>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-[#434B53]">
                Contraseña / PIN
              </label>
              <div className="relative mt-1.5">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu clave (demo: 1234)"
                  className="h-11 w-full rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] pl-3 pr-10 text-sm text-[#14171A] placeholder:text-[#5B636B] focus:border-[#14171A] focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#5B636B] hover:text-[#14171A]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-press inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#14171A] px-4 text-sm font-semibold text-white hover:bg-[#272C32]"
            >
              <span>Entrar al sistema</span>
              <ArrowRight className="h-4 w-4 text-[#F59E0B]" />
            </button>
          </form>

          {/* Quick Demo Users */}
          <div className="mt-6 border-t border-[#EAEAE3] pt-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#434B53]">
                Acceso rápido de prueba (Demo)
              </span>
              <span className="text-[11px] text-[#5B636B]">
                Clave por defecto: <strong className="font-mono text-[#14171A]">1234</strong>
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {users
                .filter((u) => u.active)
                .slice(0, 6)
                .map((usr) => {
                  const roleName = roleById.get(usr.roleId)?.name ?? 'Rol';
                  return (
                    <button
                      key={usr.id}
                      type="button"
                      onClick={() => handleQuickEnter(usr.id)}
                      className="btn-press flex flex-col items-start rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3 py-2.5 text-left hover:border-[#14171A] hover:bg-white"
                    >
                      <div className="flex w-full items-center justify-between gap-1">
                        <span className="truncate text-xs font-bold text-[#14171A]">
                          {usr.fullName}
                        </span>
                        <UserCheck className="h-3.5 w-3.5 shrink-0 text-[#C95B06]" />
                      </div>
                      <span className="mt-0.5 truncate text-[11px] font-medium text-[#5B636B]">
                        {roleName}
                      </span>
                      <span className="mt-1 font-mono text-[10px] text-[#434B53]">
                        @{usr.username}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
