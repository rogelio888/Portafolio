"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Activity, 
  Stethoscope, 
  Pill, 
  ShoppingCart, 
  Wallet, 
  Calendar, 
  Settings,
  HeartPulse,
  ShieldCheck,
  LogOut,
  X,
  PawPrint
} from "lucide-react";
import { useMobileNav } from "@/context/MobileNavContext";

const navItems = [
  { name: "Panel Principal", href: "/", icon: Activity },
  { name: "Sala de Espera", href: "/turnos", icon: Calendar, badge: "3" },
  { name: "Pacientes", href: "/pacientes", icon: HeartPulse },
  { name: "Consulta Médica", href: "/consulta", icon: Stethoscope },
  { name: "Farmacia & Lotes", href: "/farmacia", icon: Pill, alert: true },
  { name: "Punto de Venta (POS)", href: "/pos", icon: ShoppingCart },
  { name: "Tutores & Cuentas", href: "/tutores", icon: Wallet },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, closeNav } = useMobileNav();

  const [usuario, setUsuario] = useState({
    nombre: "Dr. Rodrigo Paz",
    rol: "Médico Veterinario",
    matricula: "SENASAG Nº 4819",
    iniciales: "RP"
  });

  useEffect(() => {
    try {
      const data = localStorage.getItem("vetcontrol_user");
      if (data) {
        const u = JSON.parse(data);
        const partes = (u.nombre || "Dr. Rodrigo Paz").split(" ").filter((w: string) => !w.toLowerCase().includes("dr") && !w.toLowerCase().includes("lic"));
        const iniciales = partes.length >= 2 ? (partes[0][0] + partes[1][0]) : (partes[0]?.[0] || "RP");
        setUsuario({
          nombre: u.nombre || "Dr. Rodrigo Paz",
          rol: u.rol || "Médico Veterinario",
          matricula: u.matricula || "SENASAG Nº 4819",
          iniciales: iniciales.toUpperCase()
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleCerrarSesion = () => {
    try {
      localStorage.removeItem("vetcontrol_user");
    } catch (e) {
      console.error(e);
    }
    closeNav();
    router.push("/login");
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-foreground leading-tight">VetControl Pro</h1>
            <p className="text-[11px] font-medium text-muted-foreground">Bolivia · Software Clínico</p>
          </div>
        </div>

        {/* Botón cerrar en móvil */}
        <button
          type="button"
          onClick={closeNav}
          className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95"
          title="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Módulos Clínicos
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={closeNav}
              className={`flex items-center justify-between px-3.5 py-3 lg:py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                }`}>
                  {item.badge}
                </span>
              )}

              {item.alert && (
                <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-background animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Perfil Médico */}
      <div className="p-3.5 border-t border-border bg-muted/20 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {usuario.iniciales}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{usuario.nombre}</p>
              <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-primary shrink-0" /> {usuario.matricula}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCerrarSesion}
            className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 active:scale-95 transition-colors cursor-pointer shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Sidebar Fijo Desktop (>= lg) */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col h-screen sticky top-0 shadow-xs select-none shrink-0">
        {navContent}
      </aside>

      {/* 2. Drawer Móvil Desplegable (< lg) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Fondo oscuro traslúcido para cerrar con tap */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={closeNav}
          />
          {/* Panel deslizante */}
          <div className="relative w-72 max-w-[85vw] bg-card h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200 border-r border-border">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
