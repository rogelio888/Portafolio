"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Stethoscope, 
  AlertCircle,
  HelpCircle,
  PawPrint,
  Dog,
  Cat,
  Syringe,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function LoginPage() {
  const router = useRouter();

  // Estados del formulario
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [recordarEquipo, setRecordarEquipo] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  const [modalAyuda, setModalAyuda] = useState(false);

  // Cuentas de demostración para acceso rápido (adaptadas para mobile y desktop)
  const cuentasDemo = [
    {
      rol: "Médico Veterinario",
      nombre: "Dr. Rodrigo Paz",
      user: "dr.paz",
      pass: "vet2026",
      icon: Stethoscope
    },
    {
      rol: "Cirugía & Tratamientos",
      nombre: "Dra. Carla Méndez",
      user: "carla.vet",
      pass: "vet2026",
      icon: Syringe
    },
    {
      rol: "Recepción & Pet Shop",
      nombre: "Lic. Valeria Ríos",
      user: "valeria.pos",
      pass: "caja2026",
      icon: PawPrint
    }
  ];

  const handleCargarDemo = (cuenta: typeof cuentasDemo[0]) => {
    setUsername(cuenta.user);
    setPassword(cuenta.pass);
    setErrorLogin(null);
    setCargando(true);

    setTimeout(() => {
      const usuarioSesion = {
        username: cuenta.user,
        nombre: cuenta.nombre,
        rol: cuenta.rol,
        matricula: cuenta.user.includes("paz") ? "COMVETCRUZ Nº 4819" : cuenta.user.includes("carla") ? "COMVETCRUZ Nº 5201" : "CAJA-POS Nº 104",
        fechaIngreso: new Date().toISOString()
      };

      try {
        localStorage.setItem("vetcontrol_user", JSON.stringify(usuarioSesion));
      } catch (err) {
        console.error(err);
      }

      setCargando(false);
      router.push("/");
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin(null);

    if (!username.trim() || !password.trim()) {
      setErrorLogin("Por favor ingresa tu usuario y contraseña.");
      return;
    }

    setCargando(true);

    // Inicio de sesión
    setTimeout(() => {
      const usuarioSesion = {
        username: username.trim(),
        nombre: username.includes("paz") ? "Dr. Rodrigo Paz" : username.includes("carla") ? "Dra. Carla Méndez" : username.includes("valeria") ? "Lic. Valeria Ríos" : "Administrador",
        rol: username.includes("paz") ? "Médico Veterinario" : username.includes("carla") ? "Cirujana Veterinaria" : username.includes("valeria") ? "Caja & Pet Shop" : "Administración Veterinaria",
        matricula: username.includes("paz") ? "COMVETCRUZ Nº 4819" : "COMVETCRUZ Nº 5201",
        fechaIngreso: new Date().toISOString()
      };

      try {
        localStorage.setItem("vetcontrol_user", JSON.stringify(usuarioSesion));
      } catch (err) {
        console.error(err);
      }

      setCargando(false);
      router.push("/");
    }, 500);
  };

  return (
    <div className="min-h-[100dvh] lg:h-screen lg:max-h-screen w-full flex flex-col lg:flex-row bg-slate-50 selection:bg-teal-500/20 selection:text-teal-900 overflow-y-auto lg:overflow-hidden select-none">
      
      {/* PANEL IZQUIERDO: Visible en pantallas medianas y grandes (Desktop & Tablet horizontal) */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[44%] bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 lg:p-8 xl:p-10 flex-col justify-between relative overflow-hidden h-full shrink-0">
        {/* Patrón de fondo geométrico sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f766e15_1px,transparent_1px),linear-gradient(to_bottom,#0f766e15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado Desktop */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-teal-500/20 ring-4 ring-teal-400/20">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">VetControl Pro</span>
              <p className="text-xs text-teal-200/70 font-medium">Software Clínico Veterinario</p>
            </div>
          </div>
        </div>

        {/* Contenido Central Desktop: Enfocado en Mascotas */}
        <div className="relative z-10 my-auto py-4 space-y-4 xl:space-y-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
              <Dog className="w-3.5 h-3.5 text-teal-400" />
              <Cat className="w-3.5 h-3.5 text-teal-400" />
              <span>Cuidado y salud de mascotas</span>
            </div>
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Toda la atención de tus pacientes peludos en un solo lugar.
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 leading-relaxed max-w-md">
              Fichas clínicas de perros y gatos, control de vacunas y desparasitaciones, dosis veterinarias calculadas por peso y venta de alimento a granel.
            </p>
          </div>

          {/* Tarjetas de Beneficios Veterinarios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-1">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
                <Dog className="w-3.5 h-3.5 text-teal-400" />
                <span>Mascotas & Vacunas</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Historial de caninos y felinos, calendario séxtuple/antirrábica y carnet digital para tutores.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-1">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dosis por Peso & Pet Shop</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Cálculo de antibióticos por kilo, fraccionamiento en ml y venta de croquetas por kilo.
              </p>
            </div>
          </div>
        </div>

        {/* Pie del panel izquierdo */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <PawPrint className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-300 font-medium">Clínica & Farmacia Veterinaria</span>
          </div>
          <span>Santa Cruz · Bolivia</span>
        </div>
      </div>

      {/* PANEL DERECHO: Formulario de Inicio de Sesión (Totalmente adaptativo Mobile / Desktop) */}
      <div className="flex-1 flex flex-col justify-between lg:justify-center items-center px-4 py-6 sm:p-8 lg:p-8 xl:p-10 min-h-[100dvh] lg:min-h-0 lg:h-full">
        
        {/* Cabecera Mobile (Solo visible en pantallas pequeñas < lg) */}
        <div className="w-full max-w-sm lg:hidden pt-2 pb-4 text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-teal-500 text-white items-center justify-center font-bold shadow-lg shadow-teal-500/20 ring-4 ring-teal-400/20 mx-auto">
            <PawPrint className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">VetControl Pro</h2>
            <div className="flex items-center justify-center gap-1.5 text-xs text-teal-700 font-medium mt-0.5">
              <Dog className="w-3.5 h-3.5" />
              <Cat className="w-3.5 h-3.5" />
              <span>Software Clínico Veterinario</span>
            </div>
          </div>
        </div>

        {/* Caja Central del Formulario */}
        <div className="w-full max-w-sm xl:max-w-md space-y-4 xl:space-y-5 my-auto">
          
          {/* Encabezado del Formulario (Desktop) */}
          <div className="hidden lg:block space-y-1 text-left">
            <h1 className="text-2xl xl:text-3xl font-extrabold text-foreground tracking-tight">
              Acceso Veterinario
            </h1>
            <p className="text-xs text-muted-foreground">
              Ingresa tus credenciales para acceder a la atención de pacientes y caja.
            </p>
          </div>

          {/* Subtítulo amigable en móvil */}
          <div className="lg:hidden text-center pb-1">
            <p className="text-xs text-muted-foreground">
              Ingresa tus credenciales para comenzar tu turno.
            </p>
          </div>

          {/* Mensaje de error si falla validación */}
          {errorLogin && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 text-xs sm:text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-medium">{errorLogin}</span>
            </div>
          )}

          {/* Formulario con campos touch-friendly */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Campo: Usuario */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Usuario
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="ej. dr.paz"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-11 sm:h-10 text-base sm:text-xs bg-card border-border/80 focus-visible:ring-primary shadow-2xs rounded-lg"
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                />
              </div>
            </div>

            {/* Campo: Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setModalAyuda(true)}
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer py-1"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type={mostrarPassword ? "text" : "password"}
                  placeholder="Introduce tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-11 h-11 sm:h-10 text-base sm:text-xs bg-card border-border/80 focus-visible:ring-primary font-mono shadow-2xs rounded-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 cursor-pointer transition-transform"
                  title={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {mostrarPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Checkbox: Recordar equipo */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none py-1">
                <input
                  type="checkbox"
                  checked={recordarEquipo}
                  onChange={(e) => setRecordarEquipo(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                />
                <span className="text-xs text-muted-foreground">Recordar en este equipo</span>
              </label>
            </div>

            {/* Botón Principal de Acceso (Touch target 48px en móvil) */}
            <Button
              type="submit"
              disabled={cargando}
              className="w-full h-11 sm:h-10 text-sm sm:text-xs font-bold tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 rounded-lg"
            >
              {cargando ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* ACCESO RÁPIDO: Cuentas de Demostración Veterinarias */}
          <div className="pt-3 border-t border-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Cuentas de demostración
              </span>
              <span className="text-[10px] text-teal-700 font-semibold">Acceso directo en 1 clic</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {cuentasDemo.map((cuenta, idx) => {
                const Icon = cuenta.icon;
                const isSelected = username === cuenta.user;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCargarDemo(cuenta)}
                    className={`w-full py-2 px-3 sm:py-1.5 sm:px-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer active:scale-[0.99] ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                        : "border-border/70 hover:border-primary/50 bg-card active:bg-muted/60 text-muted-foreground hover:text-foreground shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 sm:w-6 sm:h-6 rounded-md flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground leading-tight truncate">{cuenta.nombre}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">{cuenta.rol}</p>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[11px] sm:text-[10px] shrink-0">
                      <span className="text-primary font-bold">{cuenta.user}</span>
                      <span className="text-muted-foreground block text-[10px] sm:text-[9px]">{cuenta.pass}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pie de Página Simple */}
          <div className="text-center text-[11px] sm:text-[10px] text-muted-foreground pt-1 pb-2">
            <p>© 2026 VetControl Pro · Software Veterinario</p>
          </div>

        </div>

        {/* Espaciador inferior para safe area en móvil */}
        <div className="lg:hidden h-2" />
      </div>

      {/* MODAL: Ayuda / Recuperación de Contraseña (Adaptativo Mobile) */}
      <Dialog open={modalAyuda} onOpenChange={setModalAyuda}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <HelpCircle className="w-4 h-4 text-primary" />
              Recuperar Acceso
            </DialogTitle>
            <DialogDescription className="text-xs">
              Instrucciones para restablecer tu contraseña médica.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-1">
              <p className="font-bold text-foreground">Contacta al Administrador</p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                El encargado de la veterinaria puede restablecer tu contraseña desde el módulo de Configuración del sistema.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-teal-500/20 bg-teal-500/5 space-y-1">
              <p className="font-bold text-teal-800">Soporte Técnico VetControl</p>
              <p className="text-muted-foreground text-[11px]">
                WhatsApp de asistencia: <strong className="text-foreground font-mono">+591 77012345</strong>
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button size="sm" onClick={() => setModalAyuda(false)} className="text-xs w-full sm:w-auto h-10 sm:h-9">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
