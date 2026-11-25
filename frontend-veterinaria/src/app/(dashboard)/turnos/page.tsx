"use client";

import { useState, useMemo } from "react";
import { useDemoStorage } from "@/lib/useDemoStorage";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Phone, 
  ArrowRight,
  Filter,
  Check,
  MessageSquare,
  Monitor,
  RotateCcw,
  Volume2,
  XCircle,
  Search,
  HeartPulse,
  Activity,
  FileText,
  ShieldAlert,
  ArrowLeftRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface TurnoItem {
  id: string;
  numeroFicha: number;
  paciente: string;
  especie: "Canino" | "Felino" | "Ave" | "Otro";
  raza: string;
  pesoKg?: number;
  tutor: string;
  telefono: string;
  motivo: string;
  tipo: "CONSULTA" | "VACUNACION" | "EMERGENCIA" | "CONTROL" | "CIRUGIA";
  prioridad: "NORMAL" | "URGENTE";
  horaLlegada: string;
  tiempoEsperaMin: number;
  estado: "EN_ESPERA" | "EN_CONSULTA" | "FINALIZADO" | "CANCELADO";
  veterinario?: string;
  camilla?: string;
  horaInicioConsulta?: string;
  horaFinConsulta?: string;
}

const TURNOS_INICIALES: TurnoItem[] = [
  {
    id: "t-1",
    numeroFicha: 1,
    paciente: "Toby",
    especie: "Canino",
    raza: "Poodle",
    pesoKg: 8.5,
    tutor: "Carlos Justiniano",
    telefono: "77012345",
    motivo: "Vómitos frecuentes desde anoche y decaimiento marcado",
    tipo: "EMERGENCIA",
    prioridad: "URGENTE",
    horaLlegada: "10:45 AM",
    tiempoEsperaMin: 22,
    estado: "EN_CONSULTA",
    veterinario: "Dr. Rodrigo Paz",
    camilla: "Camilla 1 (Urgencias)",
    horaInicioConsulta: "11:00 AM",
  },
  {
    id: "t-2",
    numeroFicha: 2,
    paciente: "Michi",
    especie: "Felino",
    raza: "Siamés",
    pesoKg: 3.2,
    tutor: "Valeria Ríos",
    telefono: "78198765",
    motivo: "Refuerzo anual Vacuna Triple Felina y control de pulgas",
    tipo: "VACUNACION",
    prioridad: "NORMAL",
    horaLlegada: "11:05 AM",
    tiempoEsperaMin: 14,
    estado: "EN_ESPERA",
  },
  {
    id: "t-3",
    numeroFicha: 3,
    paciente: "Rocky",
    especie: "Canino",
    raza: "Pastor Alemán",
    pesoKg: 29.5,
    tutor: "Juan José Mendoza",
    telefono: "76345678",
    motivo: "Revisión de sutura post-orquiectomía y retiro de vendaje",
    tipo: "CONTROL",
    prioridad: "NORMAL",
    horaLlegada: "11:12 AM",
    tiempoEsperaMin: 7,
    estado: "EN_ESPERA",
  },
  {
    id: "t-4",
    numeroFicha: 4,
    paciente: "Kiara",
    especie: "Canino",
    raza: "Cocker Spaniel",
    pesoKg: 12.0,
    tutor: "Daniela Ortiz",
    telefono: "76099887",
    motivo: "Desparasitación con Praziquantel + corte higiénico",
    tipo: "CONTROL",
    prioridad: "NORMAL",
    horaLlegada: "09:30 AM",
    tiempoEsperaMin: 0,
    estado: "FINALIZADO",
    veterinario: "Dr. Rodrigo Paz",
    camilla: "Camilla 2",
    horaInicioConsulta: "09:40 AM",
    horaFinConsulta: "10:15 AM",
  },
];

export default function TurnosPage() {
  const [turnos, setTurnos] = useDemoStorage<TurnoItem[]>("vetcontrol_turnos", TURNOS_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");

  // Modal Nueva Ficha
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState("");
  const [nuevaEspecie, setNuevaEspecie] = useState<"Canino" | "Felino" | "Ave" | "Otro">("Canino");
  const [nuevaRaza, setNuevaRaza] = useState("");
  const [nuevoPeso, setNuevoPeso] = useState("");
  const [nuevoTutor, setNuevoTutor] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");
  const [nuevoMotivo, setNuevoMotivo] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState<TurnoItem["tipo"]>("CONSULTA");
  const [nuevaPrioridad, setNuevaPrioridad] = useState<"NORMAL" | "URGENTE">("NORMAL");

  // Modal Llamar a Camilla
  const [modalLlamarAbierto, setModalLlamarAbierto] = useState(false);
  const [turnoSeleccionadoLlamar, setTurnoSeleccionadoLlamar] = useState<TurnoItem | null>(null);
  const [camillaAsignada, setCamillaAsignada] = useState("Camilla 1");
  const [vetAsignado, setVetAsignado] = useState("Dr. Rodrigo Paz");

  // Modal Modo Pantalla TV / Sala de Espera
  const [modalPantallaAbierto, setModalPantallaAbierto] = useState(false);

  // Modal Detalle / Resumen de Atendido
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [turnoDetalle, setTurnoDetalle] = useState<TurnoItem | null>(null);

  // Crear nueva ficha de llegada
  const crearFicha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoPaciente.trim() || !nuevoTutor.trim()) return;

    const maxFicha = turnos.reduce((max, t) => Math.max(max, t.numeroFicha), 0);
    const ahora = new Date();
    const horaFormateada = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const nuevo: TurnoItem = {
      id: `t-${Date.now()}`,
      numeroFicha: maxFicha + 1,
      paciente: nuevoPaciente.trim(),
      especie: nuevaEspecie,
      raza: nuevaRaza.trim() || "Mestizo",
      pesoKg: nuevoPeso ? parseFloat(nuevoPeso) : undefined,
      tutor: nuevoTutor.trim(),
      telefono: nuevoTelefono.trim() || "77000000",
      motivo: nuevoMotivo.trim() || "Revisión general",
      tipo: nuevoTipo,
      prioridad: nuevaPrioridad,
      horaLlegada: horaFormateada,
      tiempoEsperaMin: 1,
      estado: "EN_ESPERA",
    };

    setTurnos([nuevo, ...turnos]);
    setModalAbierto(false);

    // Reset formulario
    setNuevoPaciente("");
    setNuevaEspecie("Canino");
    setNuevaRaza("");
    setNuevoPeso("");
    setNuevoTutor("");
    setNuevoTelefono("");
    setNuevoMotivo("");
    setNuevoTipo("CONSULTA");
    setNuevaPrioridad("NORMAL");
  };

  // Abrir selector de camilla para llamar
  const abrirLlamarACamilla = (turno: TurnoItem) => {
    setTurnoSeleccionadoLlamar(turno);
    setModalLlamarAbierto(true);
  };

  const confirmarLlamarACamilla = () => {
    if (!turnoSeleccionadoLlamar) return;
    const ahora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTurnos(prev => prev.map(t => 
      t.id === turnoSeleccionadoLlamar.id 
        ? { 
            ...t, 
            estado: "EN_CONSULTA", 
            veterinario: vetAsignado,
            camilla: camillaAsignada,
            horaInicioConsulta: ahora
          }
        : t
    ));
    setModalLlamarAbierto(false);
    setTurnoSeleccionadoLlamar(null);
  };

  // Devolver de Consulta a Sala de Espera (para esperar laboratorios, etc.)
  const devolverAEspera = (id: string) => {
    setTurnos(prev => prev.map(t => 
      t.id === id 
        ? { 
            ...t, 
            estado: "EN_ESPERA", 
            motivo: `${t.motivo} (Esperando resultados de laboratorio/ecografía)` 
          }
        : t
    ));
  };

  // Finalizar atención
  const finalizarAtencion = (id: string) => {
    const ahora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTurnos(prev => prev.map(t => 
      t.id === id 
        ? { 
            ...t, 
            estado: "FINALIZADO",
            horaFinConsulta: ahora
          } 
        : t
    ));
  };

  // Cancelar turno (no se presentó o se fue)
  const cancelarTurno = (id: string) => {
    setTurnos(prev => prev.map(t => 
      t.id === id ? { ...t, estado: "CANCELADO" } : t
    ));
  };

  // Reabrir turno finalizado por error
  const reactivarTurno = (id: string) => {
    setTurnos(prev => prev.map(t => 
      t.id === id ? { ...t, estado: "EN_CONSULTA" } : t
    ));
  };

  // Enviar mensaje de WhatsApp al tutor para avisar que pase a camilla
  const avisarPorWhatsApp = (turno: TurnoItem) => {
    const celular = turno.telefono.replace(/\D/g, "");
    const mensaje = encodeURIComponent(
      `Hola *${turno.tutor}*, le informamos de la *Clínica Veterinaria* que ya es el turno de su mascota *${turno.paciente}* (Ficha *#${turno.numeroFicha}*).\n\nPor favor acérquese con ${turno.paciente} a recepción / ${turno.camilla || "Camilla 1"}.`
    );
    window.open(`https://wa.me/591${celular}?text=${mensaje}`, "_blank");
  };

  // Filtrado
  const turnosFiltrados = useMemo(() => {
    return turnos.filter(t => {
      if (t.estado === "CANCELADO") return false;

      const coincideBusqueda = 
        t.paciente.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.tutor.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.numeroFicha.toString().includes(busqueda) ||
        t.motivo.toLowerCase().includes(busqueda.toLowerCase());

      if (!coincideBusqueda) return false;

      if (filtroTipo === "TODOS") return true;
      if (filtroTipo === "URGENTE") return t.prioridad === "URGENTE";
      return t.tipo === filtroTipo;
    });
  }, [turnos, busqueda, filtroTipo]);

  const enEspera = turnosFiltrados.filter(t => t.estado === "EN_ESPERA");
  const enConsulta = turnosFiltrados.filter(t => t.estado === "EN_CONSULTA");
  const finalizados = turnosFiltrados.filter(t => t.estado === "FINALIZADO");

  // Métricas
  const totalEspera = turnos.filter(t => t.estado === "EN_ESPERA").length;
  const totalConsulta = turnos.filter(t => t.estado === "EN_CONSULTA").length;
  const totalUrgencias = turnos.filter(t => t.prioridad === "URGENTE" && t.estado !== "FINALIZADO").length;
  const totalAtendidos = turnos.filter(t => t.estado === "FINALIZADO").length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Cabecera y Acciones Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Sala de Espera & Triage por Turnos
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gestión en tiempo real de fila por orden de llegada, llamado a camilla y avisos directos por WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Botón Modo Pantalla TV */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setModalPantallaAbierto(true)}
            className="flex-1 sm:flex-initial text-xs h-10 sm:h-9 gap-1.5 cursor-pointer font-medium border-border active:scale-95 justify-center"
          >
            <Monitor className="w-4 h-4 text-primary" />
            <span>Pantalla TV</span>
          </Button>

          {/* Botón Nueva Ficha de Llegada */}
          <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
            <DialogTrigger className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-lg text-xs font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-10 sm:h-9 px-4 gap-1.5 cursor-pointer transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Nueva Ficha</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  <Clock className="w-5 h-5 text-primary" />
                  Registrar Llegada de Paciente
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Asigne un número de turno en la fila de espera e ingrese datos rápidos de triage.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={crearFicha} className="space-y-3.5 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Nombre Mascota *
                    </label>
                    <Input 
                      placeholder="ej. Canelo"
                      value={nuevoPaciente}
                      onChange={(e) => setNuevoPaciente(e.target.value)}
                      required
                      className="h-10 sm:h-9 text-base sm:text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Especie
                    </label>
                    <select 
                      value={nuevaEspecie}
                      onChange={(e) => setNuevaEspecie(e.target.value as any)}
                      className="w-full h-10 sm:h-9 rounded-md border border-input bg-background px-2.5 text-base sm:text-xs focus:ring-1 focus:ring-primary font-medium"
                    >
                      <option value="Canino">Canino (Perro)</option>
                      <option value="Felino">Felino (Gato)</option>
                      <option value="Ave">Ave</option>
                      <option value="Otro">Otro / Exótico</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Raza
                    </label>
                    <Input 
                      placeholder="ej. Golden Retriever"
                      value={nuevaRaza}
                      onChange={(e) => setNuevaRaza(e.target.value)}
                      className="h-10 sm:h-9 text-base sm:text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Peso actual (kg)
                    </label>
                    <Input 
                      type="number"
                      step="0.1"
                      placeholder="ej. 14.5"
                      value={nuevoPeso}
                      onChange={(e) => setNuevoPeso(e.target.value)}
                      className="h-10 sm:h-9 text-base sm:text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Tutor / Dueño *
                    </label>
                    <Input 
                      placeholder="ej. María René Aguilera"
                      value={nuevoTutor}
                      onChange={(e) => setNuevoTutor(e.target.value)}
                      required
                      className="h-10 sm:h-9 text-base sm:text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      WhatsApp (+591)
                    </label>
                    <Input 
                      type="tel"
                      placeholder="ej. 75044332"
                      value={nuevoTelefono}
                      onChange={(e) => setNuevoTelefono(e.target.value)}
                      className="h-10 sm:h-9 text-base sm:text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Tipo de Atención
                    </label>
                    <select 
                      value={nuevoTipo}
                      onChange={(e) => setNuevoTipo(e.target.value as any)}
                      className="w-full h-10 sm:h-9 rounded-md border border-input bg-background px-2.5 text-base sm:text-xs focus:ring-1 focus:ring-primary font-medium"
                    >
                      <option value="CONSULTA">Consulta General</option>
                      <option value="EMERGENCIA">Urgencia / Triage Crítico</option>
                      <option value="VACUNACION">Vacunación / Desparasitación</option>
                      <option value="CONTROL">Control Post-operatorio / Curación</option>
                      <option value="CIRUGIA">Cirugía / Procedimiento</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Nivel de Prioridad
                    </label>
                    <select 
                      value={nuevaPrioridad}
                      onChange={(e) => setNuevaPrioridad(e.target.value as any)}
                      className={`w-full h-10 sm:h-9 rounded-md border px-2.5 text-base sm:text-xs font-semibold focus:ring-1 focus:ring-primary ${
                        nuevaPrioridad === "URGENTE" 
                          ? "border-red-500 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-300" 
                          : "border-input bg-background"
                      }`}
                    >
                      <option value="NORMAL">Normal (Fila estándar)</option>
                      <option value="URGENTE">Urgente (Atención Inmediata)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Motivo de Consulta / Signos Clínicos
                  </label>
                  <Input 
                    placeholder="ej. Letargia, falta de apetito desde ayer, fiebre 39.5"
                    value={nuevoMotivo}
                    onChange={(e) => setNuevoMotivo(e.target.value)}
                    className="h-10 sm:h-9 text-base sm:text-xs"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setModalAbierto(false)} className="text-xs h-10 sm:h-9 w-full sm:w-auto">
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold px-4 text-xs h-10 sm:h-9 w-full sm:w-auto">
                    Emitir Ficha de Turno
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 2. Barra de Métricas Rápidas (KPIs de Triage: 2 columnas en móvil) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 sm:p-3.5 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground truncate">En Espera</p>
            <p className="text-lg sm:text-xl font-bold font-mono text-foreground mt-0.5 truncate">{totalEspera} pac.</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground truncate">En Camilla</p>
            <p className="text-lg sm:text-xl font-bold font-mono text-primary mt-0.5 truncate">{totalConsulta} en aten.</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className={`p-3 sm:p-3.5 rounded-xl border shadow-xs flex items-center justify-between transition-all ${
          totalUrgencias > 0 
            ? "border-red-500/50 bg-red-50/50 dark:bg-red-950/20" 
            : "border-border bg-card"
        }`}>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground truncate">Urgencias</p>
            <p className={`text-lg sm:text-xl font-bold font-mono mt-0.5 truncate ${
              totalUrgencias > 0 ? "text-red-600 dark:text-red-400" : "text-foreground"
            }`}>
              {totalUrgencias} activas
            </p>
          </div>
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${
            totalUrgencias > 0 
              ? "bg-red-500 text-white animate-pulse" 
              : "bg-muted text-muted-foreground"
          }`}>
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground truncate">Atendidos</p>
            <p className="text-lg sm:text-xl font-bold font-mono text-emerald-600 mt-0.5 truncate">{totalAtendidos} pac.</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda en Vivo */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-xl bg-card border border-border shadow-xs">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input 
            placeholder="Buscar por mascota, tutor o Nº..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 h-10 sm:h-9 text-base sm:text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "TODOS", label: "Todos" },
            { id: "URGENTE", label: "Urgencias" },
            { id: "CONSULTA", label: "Consultas" },
            { id: "VACUNACION", label: "Vacunas" },
            { id: "CONTROL", label: "Controles" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroTipo(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
                filtroTipo === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Columnas Kanban del Flujo Clínico */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* COLUMNA 1: En Sala de Espera */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500/30">
            <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-amber-500" />
              1. En Espera ({enEspera.length})
            </h3>
            <Badge variant="secondary" className="font-mono text-[10px] text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/50">
              Por llegada
            </Badge>
          </div>

          <div className="space-y-3">
            {enEspera.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/20">
                <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs font-medium text-muted-foreground">
                  No hay pacientes en espera en este momento.
                </p>
              </div>
            ) : (
              enEspera.map((turno) => (
                <Card 
                  key={turno.id} 
                  className={`shadow-xs transition-all hover:shadow-md ${
                    turno.prioridad === "URGENTE"
                      ? "border-red-500/60 bg-red-50/20 dark:bg-red-950/10"
                      : "border-amber-500/30 bg-card hover:border-amber-500/60"
                  }`}
                >
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-8 h-8 rounded-lg font-bold font-mono text-xs flex items-center justify-center shrink-0 ${
                          turno.prioridad === "URGENTE"
                            ? "bg-red-600 text-white"
                            : "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                        }`}>
                          #{turno.numeroFicha}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-foreground">{turno.paciente}</h4>
                            {turno.pesoKg && (
                              <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                                ({turno.pesoKg} kg)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {turno.especie} · {turno.raza}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {turno.prioridad === "URGENTE" ? (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> URGENCIA
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">
                            {turno.tipo}
                          </Badge>
                        )}
                        <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {turno.tiempoEsperaMin} min
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-xs text-foreground/80 bg-muted/40 p-2 rounded-md flex items-start gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{turno.motivo}</span>
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3.5 pt-0 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-2">
                      <span className="truncate max-w-[130px]">
                        Tutor: <strong>{turno.tutor}</strong>
                      </span>
                      <span className="font-mono">Llegada: {turno.horaLlegada}</span>
                    </div>

                    {/* Acciones de la Ficha en Espera */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => avisarPorWhatsApp(turno)}
                        className="text-[11px] h-8 gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40 cursor-pointer"
                        title="Enviar mensaje WhatsApp avisando que es su turno"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Avisar WhatsApp
                      </Button>

                      <Button 
                        size="sm" 
                        onClick={() => abrirLlamarACamilla(turno)}
                        className="text-[11px] h-8 gap-1.5 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 cursor-pointer shadow-xs"
                      >
                        Llamar a Camilla
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Botón secundario para cancelar turno */}
                    <div className="flex justify-end pt-0.5">
                      <button
                        onClick={() => cancelarTurno(turno.id)}
                        className="text-[10px] text-muted-foreground hover:text-red-500 cursor-pointer underline-offset-2 hover:underline transition-colors"
                      >
                        Descartar / Paciente se retiró
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA 2: En Camilla / Consulta Activa */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-primary/50">
            <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
              <Stethoscope className="w-4 h-4 text-primary" />
              2. En Consulta ({enConsulta.length})
            </h3>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">
              Atención Activa
            </Badge>
          </div>

          <div className="space-y-3">
            {enConsulta.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/20">
                <Stethoscope className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs font-medium text-muted-foreground">
                  Ningún paciente en camilla actualmente.
                </p>
              </div>
            ) : (
              enConsulta.map((turno) => (
                <Card 
                  key={turno.id} 
                  className="shadow-sm border-primary/40 bg-card hover:border-primary/80 transition-all ring-1 ring-primary/10"
                >
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold font-mono text-xs flex items-center justify-center shrink-0 shadow-xs">
                          #{turno.numeroFicha}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-foreground">{turno.paciente}</h4>
                            {turno.pesoKg && (
                              <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                                ({turno.pesoKg} kg)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {turno.especie} · {turno.raza}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
                          En Camilla
                        </Badge>
                        <span className="text-[10px] font-mono text-primary font-medium">
                          Desde: {turno.horaInicioConsulta || "11:00 AM"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="p-2 rounded-md bg-primary/5 border border-primary/10 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-primary mb-1">
                          <span>{turno.camilla || "Camilla 1"}</span>
                          <span>{turno.veterinario || "Dr. Rodrigo Paz"}</span>
                        </div>
                        <p className="text-muted-foreground text-[11px] line-clamp-1">
                          Motivo: {turno.motivo}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3.5 pt-0 space-y-2.5">
                    {/* Botones de Atención */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
                      <Link href="/consulta" prefetch={false} className="w-full">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full text-[11px] h-8 gap-1 text-primary border-primary/30 hover:bg-primary/5 cursor-pointer font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Abrir Consulta
                        </Button>
                      </Link>

                      <Button 
                        size="sm" 
                        onClick={() => finalizarAtencion(turno.id)}
                        className="text-[11px] h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Finalizar Atención
                      </Button>
                    </div>

                    {/* Botón para devolver a sala de espera si necesita esperar laboratorio */}
                    <div className="flex justify-between items-center pt-0.5 text-[10px] text-muted-foreground">
                      <span>Tutor: {turno.tutor}</span>
                      <button
                        onClick={() => devolverAEspera(turno.id)}
                        className="flex items-center gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 cursor-pointer underline-offset-2 hover:underline"
                        title="Enviar de vuelta a sala de espera mientras salen resultados de laboratorio o rayos X"
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                        Pausar a Espera
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA 3: Concluidos / Atendidos Hoy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500/30">
            <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              3. Atendidos Hoy ({finalizados.length})
            </h3>
            <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300">
              Concluidos
            </Badge>
          </div>

          <div className="space-y-3">
            {finalizados.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/20">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs font-medium text-muted-foreground">
                  Aún no hay pacientes finalizados en la jornada.
                </p>
              </div>
            ) : (
              finalizados.map((turno) => (
                <Card 
                  key={turno.id} 
                  className="shadow-xs bg-card/70 border-border opacity-90 hover:opacity-100 transition-opacity"
                >
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-muted text-muted-foreground font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          #{turno.numeroFicha}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{turno.paciente}</h4>
                          <p className="text-[11px] text-muted-foreground">
                            {turno.tutor} · {turno.tipo}
                          </p>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 dark:text-emerald-400">
                        Atendido
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3.5 pt-0 space-y-2">
                    <div className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-md flex items-center justify-between">
                      <span>Atendido por: {turno.veterinario || "Dr. Rodrigo Paz"}</span>
                      <span className="font-mono text-[10px]">Fin: {turno.horaFinConsulta || "10:15 AM"}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setTurnoDetalle(turno);
                          setModalDetalleAbierto(true);
                        }}
                        className="text-[11px] h-7 text-muted-foreground hover:text-foreground cursor-pointer px-2"
                      >
                        Ver Detalle Ficha
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reactivarTurno(turno.id)}
                        className="text-[11px] h-7 gap-1 text-muted-foreground hover:text-primary cursor-pointer px-2"
                        title="Reabrir en caso de error o consulta adicional"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reabrir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. MODAL: Asignar Camilla y Llamar a Consulta */}
      <Dialog open={modalLlamarAbierto} onOpenChange={setModalLlamarAbierto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Stethoscope className="w-5 h-5 text-primary" />
              Llamar Paciente a Consulta
            </DialogTitle>
            <DialogDescription className="text-xs">
              Asigne la camilla o consultorio y el médico veterinario a cargo.
            </DialogDescription>
          </DialogHeader>

          {turnoSeleccionadoLlamar && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-primary">
                    Ficha #{turnoSeleccionadoLlamar.numeroFicha}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {turnoSeleccionadoLlamar.tipo}
                  </Badge>
                </div>
                <h4 className="font-bold text-sm text-foreground">
                  {turnoSeleccionadoLlamar.paciente} ({turnoSeleccionadoLlamar.especie} · {turnoSeleccionadoLlamar.raza})
                </h4>
                <p className="text-xs text-muted-foreground">
                  Tutor: {turnoSeleccionadoLlamar.tutor} ({turnoSeleccionadoLlamar.telefono})
                </p>
                <p className="text-xs text-foreground/80 pt-1 border-t border-primary/10">
                  Motivo: {turnoSeleccionadoLlamar.motivo}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Camilla / Box *
                  </label>
                  <select 
                    value={camillaAsignada}
                    onChange={(e) => setCamillaAsignada(e.target.value)}
                    className="w-full h-10 sm:h-9 rounded-lg border border-input bg-background px-3 text-base sm:text-xs focus:ring-1 focus:ring-primary"
                  >
                    <option value="Camilla 1 (General)">Camilla 1 (General)</option>
                    <option value="Camilla 2 (Vacunas)">Camilla 2 (Vacunas)</option>
                    <option value="Camilla 3 (Triage Urgencias)">Camilla 3 (Urgencias)</option>
                    <option value="Box Quirófano">Box Quirófano</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Veterinario Asignado *
                  </label>
                  <select 
                    value={vetAsignado}
                    onChange={(e) => setVetAsignado(e.target.value)}
                    className="w-full h-10 sm:h-9 rounded-lg border border-input bg-background px-3 text-base sm:text-xs focus:ring-1 focus:ring-primary"
                  >
                    <option value="Dr. Rodrigo Paz">Dr. Rodrigo Paz (SENASAG 4819)</option>
                    <option value="Dra. Mariana Suárez">Dra. Mariana Suárez</option>
                    <option value="Dr. Carlos Villarroel">Dr. Carlos Villarroel</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Al confirmar, el turno pasará a <strong>En Consulta</strong> y se notificará en pantalla.
                </span>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="ghost" size="sm" onClick={() => setModalLlamarAbierto(false)} className="h-10 sm:h-8 w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={confirmarLlamarACamilla}
                  className="bg-primary text-primary-foreground font-semibold px-4 cursor-pointer h-10 sm:h-8 w-full sm:w-auto"
                >
                  Confirmar Llamado a Camilla
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 6. MODAL: Pantalla de Sala de Espera (Vista TV) */}
      <Dialog open={modalPantallaAbierto} onOpenChange={setModalPantallaAbierto}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                <Monitor className="w-5 h-5 text-primary" />
                Vista de Pantalla en Sala de Espera
              </DialogTitle>
              <Badge className="bg-primary text-primary-foreground font-mono text-[10px]">
                EN VIVO
              </Badge>
            </div>
            <DialogDescription className="text-xs">
              Esta pantalla se proyecta en la TV o monitor de recepción para llamar a los tutores.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Paciente Actualmente Llamado */}
            <div className="p-4 sm:p-6 rounded-2xl bg-primary text-primary-foreground text-center space-y-2 shadow-md">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                <Volume2 className="w-4 h-4 animate-bounce" />
                Llamando a Camilla
              </div>

              {enConsulta.length > 0 ? (
                <>
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight pt-1">
                    FICHA #{enConsulta[0].numeroFicha}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {enConsulta[0].paciente}
                  </div>
                  <p className="text-xs sm:text-sm text-primary-foreground/90 font-medium">
                    Tutor: <strong>{enConsulta[0].tutor}</strong> · Pasar a: <strong>{enConsulta[0].camilla || "Camilla 1"}</strong>
                  </p>
                </>
              ) : (
                <div className="py-4 text-primary-foreground/80">
                  <p className="text-lg sm:text-xl font-bold">Sin llamado activo en este momento</p>
                  <p className="text-xs">Por favor tome asiento y espere su número de ficha.</p>
                </div>
              )}
            </div>

            {/* Próximos en Fila */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
                <span>Próximas Fichas en Turno</span>
                <span className="font-mono text-[10px]">{enEspera.length} esperando</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {enEspera.slice(0, 4).map((t, idx) => (
                  <div 
                    key={t.id} 
                    className="p-3 rounded-xl border border-border bg-card flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 font-mono font-bold text-sm flex items-center justify-center">
                        #{t.numeroFicha}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-foreground">{t.paciente}</p>
                        <p className="text-[10px] text-muted-foreground">{t.tutor}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Turno {idx + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 7. MODAL: Detalle de Turno Finalizado */}
      <Dialog open={modalDetalleAbierto} onOpenChange={setModalDetalleAbierto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Ficha Clínica Concluida
            </DialogTitle>
            <DialogDescription className="text-xs">
              Resumen de la atención brindada en la jornada de hoy.
            </DialogDescription>
          </DialogHeader>

          {turnoDetalle && (
            <div className="space-y-3 py-2">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-foreground">
                    Ficha #{turnoDetalle.numeroFicha}
                  </span>
                  <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                    Atendido
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Paciente:</span>
                    <strong className="text-foreground">{turnoDetalle.paciente}</strong> ({turnoDetalle.especie})
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Tutor:</span>
                    <strong className="text-foreground">{turnoDetalle.tutor}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Médico:</span>
                    <span>{turnoDetalle.veterinario || "Dr. Rodrigo Paz"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Horario:</span>
                    <span className="font-mono">{turnoDetalle.horaLlegada} - {turnoDetalle.horaFinConsulta || "Concluido"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border text-xs">
                  <span className="text-muted-foreground block text-[10px]">Motivo registrado:</span>
                  <p className="text-foreground/90 font-medium">{turnoDetalle.motivo}</p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-2 pt-2 border-t border-border">
                <Link href="/pos" prefetch={false} className="w-full sm:flex-1">
                  <Button size="sm" variant="outline" className="w-full text-xs font-medium cursor-pointer h-10 sm:h-8">
                    Cobrar en POS
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  onClick={() => setModalDetalleAbierto(false)}
                  className="bg-primary text-primary-foreground text-xs font-semibold px-4 cursor-pointer h-10 sm:h-8 w-full sm:w-auto"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
