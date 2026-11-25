"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Bell, 
  Clock, 
  Calendar, 
  AlertTriangle,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  PawPrint
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMobileNav } from "@/context/MobileNavContext";

export function Header() {
  const router = useRouter();
  const { openNav } = useMobileNav();
  const [modalNotificaciones, setModalNotificaciones] = useState(false);
  const [modalBusqueda, setModalBusqueda] = useState(false);
  const [usuario, setUsuario] = useState({
    nombre: "Dr. Rodrigo Paz",
    rol: "Médico Regente SENASAG",
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
          rol: u.rol || "Médico Regente SENASAG",
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
    router.push("/login");
  };

  // Atajo de teclado Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setModalBusqueda(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-14 sm:h-16 border-b border-border/70 bg-card/85 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Lado Izquierdo: Botón Menú Móvil + Buscador */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-sm">
          {/* Botón Hamburguesa en Móvil (< lg) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openNav}
            className="lg:hidden h-9 w-9 text-foreground hover:bg-muted active:scale-95 shrink-0"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Logo móvil rápido */}
          <div className="flex lg:hidden items-center gap-1.5 font-bold text-xs text-foreground shrink-0">
            <div className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center">
              <PawPrint className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold tracking-tight">VetControl</span>
          </div>

          {/* Buscador Desktop */}
          <button
            onClick={() => setModalBusqueda(true)}
            className="hidden sm:flex w-full items-center justify-between px-3 py-1.5 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/70 hover:text-foreground border border-border/80 rounded-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="truncate">Buscar paciente, fármaco...</span>
            </div>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border/80 rounded text-muted-foreground shadow-2xs">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Lado Derecho: Buscador Móvil + Notificaciones + Perfil */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Botón Lupa Móvil */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setModalBusqueda(true)}
            className="sm:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Notificaciones de Alerta */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setModalNotificaciones(true)}
            className="h-8 w-8 relative text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
            title="Alertas y Notificaciones"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5 ring-2 ring-card animate-pulse" />
          </Button>

          <div className="w-[1px] h-5 bg-border/80 mx-0.5" />

          {/* Perfil del Veterinario en Turno */}
          <div className="flex items-center gap-2 pl-0.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              {usuario.iniciales}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-foreground leading-tight">{usuario.nombre}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{usuario.matricula}</p>
            </div>
          </div>

          {/* Botón Salir / Cambiar Sesión */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCerrarSesion}
            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 cursor-pointer rounded-lg ml-0.5"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* MODAL: Notificaciones Clínicas */}
      <Dialog open={modalNotificaciones} onOpenChange={setModalNotificaciones}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Bell className="w-4 h-4 text-amber-500" />
              Notificaciones y Alertas del Día
            </DialogTitle>
            <DialogDescription className="text-xs">
              Eventos clínicos prioritarios que requieren atención
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 py-2 max-h-[350px] overflow-y-auto">
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Lote por Vencer (15 días)
                </span>
                <Badge variant="destructive" className="text-[9px] h-4">FEFO</Badge>
              </div>
              <p className="text-xs text-foreground font-medium">Ketamina 10% (Lote KT-9024)</p>
              <p className="text-[11px] text-muted-foreground">Quedan 18.5 ml. Priorizar salida en cirugías.</p>
            </div>

            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Vacunas Próximas (3 días)
                </span>
                <span className="text-[10px] text-amber-700 font-mono">2 Pacientes</span>
              </div>
              <p className="text-xs text-foreground">Luna (Séxtuple) y Max (Desparasitación)</p>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button size="sm" onClick={() => setModalNotificaciones(false)} className="text-xs">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Búsqueda Global (Ctrl+K) */}
      <Dialog open={modalBusqueda} onOpenChange={setModalBusqueda}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <div className="p-3 border-b border-border flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground ml-2" />
            <Input 
              placeholder="Buscar paciente, fármaco, tutor o sección..."
              className="border-none shadow-none focus-visible:ring-0 text-xs h-9 bg-transparent"
              autoFocus
            />
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded text-muted-foreground mr-2">
              ESC
            </kbd>
          </div>

          <div className="p-3 max-h-72 overflow-y-auto space-y-1 text-xs">
            <div className="text-[10px] font-bold text-muted-foreground uppercase px-2 mb-1">Navegación Rápida</div>
            <button 
              onClick={() => { setModalBusqueda(false); router.push("/pos"); }}
              className="w-full text-left p-2 rounded-md hover:bg-muted flex items-center justify-between cursor-pointer"
            >
              <span className="font-semibold text-foreground">Punto de Venta (POS) & Cobro en Mostrador</span>
              <span className="text-[11px] text-muted-foreground font-mono">/pos</span>
            </button>
            <button 
              onClick={() => { setModalBusqueda(false); router.push("/farmacia"); }}
              className="w-full text-left p-2 rounded-md hover:bg-muted flex items-center justify-between cursor-pointer"
            >
              <span className="font-semibold text-foreground">Farmacia & Lotes FEFO</span>
              <span className="text-[11px] text-muted-foreground font-mono">/farmacia</span>
            </button>
            <button 
              onClick={() => { setModalBusqueda(false); router.push("/consulta"); }}
              className="w-full text-left p-2 rounded-md hover:bg-muted flex items-center justify-between cursor-pointer"
            >
              <span className="font-semibold text-foreground">Consulta Médica en Camilla</span>
              <span className="text-[11px] text-muted-foreground font-mono">/consulta</span>
            </button>
            <button 
              onClick={() => { setModalBusqueda(false); router.push("/pacientes"); }}
              className="w-full text-left p-2 rounded-md hover:bg-muted flex items-center justify-between cursor-pointer"
            >
              <span className="font-semibold text-foreground">Directorio de Pacientes</span>
              <span className="text-[11px] text-muted-foreground font-mono">/pacientes</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
