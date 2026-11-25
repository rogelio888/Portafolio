"use client";

import { useState, useMemo } from "react";
import { useDemoStorage } from "@/lib/useDemoStorage";
import Link from "next/link";
import { 
  HeartPulse, 
  Search, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  User, 
  Phone, 
  ExternalLink, 
  MessageCircle,
  Stethoscope,
  Dog,
  Cat,
  Bird,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  Edit,
  Syringe,
  Pill,
  ArrowRight,
  ClipboardList,
  History,
  QrCode,
  Tag,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface ConsultaHistorial {
  id: string;
  fecha: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  veterinario: string;
  pesoRegistrado: number;
}

export interface VacunaHistorial {
  id: string;
  vacuna: string;
  lote: string;
  fechaAplicada: string;
  proximaFecha: string;
  veterinario: string;
  estado: "VIGENTE" | "PROXIMA" | "VENCIDA";
}

export interface PacienteData {
  id: string;
  nombre: string;
  especie: "CANINO" | "FELINO" | "EXOTICO";
  raza: string;
  color: string;
  sexo: "Macho" | "Hembra";
  esterilizado: boolean;
  edad: string;
  pesoKg: number;
  microchip?: string;
  tutor: string;
  telefonoTutor: string;
  ciTutor: string;
  direccionTutor?: string;
  alergias: string | null;
  tokenCarnet: string;
  ultimaVisita: string;
  proximaVacuna: string;
  consultasPrevias: ConsultaHistorial[];
  vacunas: VacunaHistorial[];
}

const PACIENTES_INICIALES: PacienteData[] = [
  {
    id: "pac-1",
    nombre: "Toby",
    especie: "CANINO",
    raza: "Poodle Toy",
    color: "Blanco rizado",
    sexo: "Macho",
    esterilizado: false,
    edad: "3 años y 2 meses",
    pesoKg: 8.5,
    microchip: "BO-7821903",
    tutor: "Carlos Justiniano",
    telefonoTutor: "77012345",
    ciTutor: "6234901 SC",
    direccionTutor: "Barrio Sirari, Calle Los Claveles #14",
    alergias: "Alérgico a Dipirona (anafilaxia leve)",
    tokenCarnet: "toby-99a1",
    ultimaVisita: "Hoy (En camilla)",
    proximaVacuna: "15/12/2026",
    consultasPrevias: [
      {
        id: "c-101",
        fecha: "20/11/2026",
        motivo: "Vómitos frecuentes y decaimiento marcado",
        diagnostico: "Gastroenteritis aguda por transgresión alimentaria",
        tratamiento: "Maropitant 10mg/ml (0.85 ml SC), Metronidazol suspensión 5ml c/12h x 5 días",
        veterinario: "Dr. Rodrigo Paz (SENASAG 4819)",
        pesoRegistrado: 8.5,
      },
      {
        id: "c-102",
        fecha: "14/06/2026",
        motivo: "Otitis externa bilateral con rascado profuso",
        diagnostico: "Otitis por levaduras (Malassezia)",
        tratamiento: "Limpieza con ceruminolítico + gotas óticas con ketoconazol y dexametasona",
        veterinario: "Dr. Rodrigo Paz",
        pesoRegistrado: 8.2,
      }
    ],
    vacunas: [
      {
        id: "v-1",
        vacuna: "Séxtuple Canina (DHPPi+L)",
        lote: "L-2025-SX",
        fechaAplicada: "15/12/2025",
        proximaFecha: "15/12/2026",
        veterinario: "Dr. Rodrigo Paz",
        estado: "PROXIMA",
      },
      {
        id: "v-2",
        vacuna: "Antirrábica Canina",
        lote: "L-2026-AR",
        fechaAplicada: "02/03/2026",
        proximaFecha: "02/03/2027",
        veterinario: "Dr. Rodrigo Paz",
        estado: "VIGENTE",
      }
    ]
  },
  {
    id: "pac-2",
    nombre: "Michi",
    especie: "FELINO",
    raza: "Siamés",
    color: "Seal Point",
    sexo: "Hembra",
    esterilizado: true,
    edad: "1 año y 8 meses",
    pesoKg: 3.1,
    microchip: "BO-5591023",
    tutor: "Valeria Ríos",
    telefonoTutor: "78198765",
    ciTutor: "5489012 CB",
    direccionTutor: "Av. Melchor Pinto #450, Edif. Los Pinos 3B",
    alergias: null,
    tokenCarnet: "michi-44b2",
    ultimaVisita: "12/10/2026",
    proximaVacuna: "22/11/2026 (en 2 días)",
    consultasPrevias: [
      {
        id: "c-201",
        fecha: "12/10/2026",
        motivo: "Revisión preventiva y desparasitación trimestral",
        diagnostico: "Paciente clínicamente sano",
        tratamiento: "Pipeta antipulgas Advantage + Praziquantel pasta 1g",
        veterinario: "Dra. Mariana Suárez",
        pesoRegistrado: 3.1,
      }
    ],
    vacunas: [
      {
        id: "v-3",
        vacuna: "Triple Felina (FVRCP)",
        lote: "TF-8821",
        fechaAplicada: "22/11/2025",
        proximaFecha: "22/11/2026",
        veterinario: "Dra. Mariana Suárez",
        estado: "PROXIMA",
      }
    ]
  },
  {
    id: "pac-3",
    nombre: "Luna",
    especie: "CANINO",
    raza: "Golden Retriever",
    color: "Dorado claro",
    sexo: "Hembra",
    esterilizado: true,
    edad: "2 años y 4 meses",
    pesoKg: 26.4,
    microchip: "BO-9812400921",
    tutor: "María René Suárez",
    telefonoTutor: "75044332",
    ciTutor: "7194012 SC",
    direccionTutor: "Condominio La Floresta, Casa 18",
    alergias: "Sensible a penicilinas (reacción dérmica previa)",
    tokenCarnet: "luna-77a8",
    ultimaVisita: "05/09/2026",
    proximaVacuna: "23/11/2026 (Séxtuple)",
    consultasPrevias: [
      {
        id: "c-301",
        fecha: "05/09/2026",
        motivo: "Dermatitis por picadura de pulgas en zona lumbosacra",
        diagnostico: "Dermatitis alérgica por pulgas (DAPP)",
        tratamiento: "Simparica Trio 20-40kg + Apoquel 16mg x 7 días",
        veterinario: "Dr. Rodrigo Paz",
        pesoRegistrado: 26.4,
      }
    ],
    vacunas: [
      {
        id: "v-4",
        vacuna: "Séxtuple (DHPPi+L)",
        lote: "SX-9912",
        fechaAplicada: "20/11/2025",
        proximaFecha: "23/11/2026",
        veterinario: "Dr. Rodrigo Paz",
        estado: "PROXIMA",
      },
      {
        id: "v-5",
        vacuna: "Tos de las Perreras (KC)",
        lote: "KC-4410",
        fechaAplicada: "10/06/2026",
        proximaFecha: "10/06/2027",
        veterinario: "Dra. Sofía Mendoza",
        estado: "VIGENTE",
      }
    ]
  },
  {
    id: "pac-4",
    nombre: "Rocky",
    especie: "CANINO",
    raza: "Pastor Alemán",
    color: "Negro y fuego",
    sexo: "Macho",
    esterilizado: false,
    edad: "4 años",
    pesoKg: 29.5,
    microchip: "BO-1102934",
    tutor: "Juan José Mendoza",
    telefonoTutor: "76345678",
    ciTutor: "4920199 LP",
    direccionTutor: "Zona Equipetrol, Calle 9 Este",
    alergias: null,
    tokenCarnet: "rocky-10x9",
    ultimaVisita: "18/11/2026",
    proximaVacuna: "10/01/2027",
    consultasPrevias: [
      {
        id: "c-401",
        fecha: "18/11/2026",
        motivo: "Orquiectomía programada y profilaxis dental",
        diagnostico: "Post-quirúrgico satisfactorio",
        tratamiento: "Cefalexina 500mg c/12h x 7 días + Meloxicam 4mg",
        veterinario: "Dr. Rodrigo Paz",
        pesoRegistrado: 29.5,
      }
    ],
    vacunas: [
      {
        id: "v-6",
        vacuna: "Rabia Monovalente",
        lote: "RB-091",
        fechaAplicada: "10/01/2026",
        proximaFecha: "10/01/2027",
        veterinario: "Dr. Rodrigo Paz",
        estado: "VIGENTE",
      }
    ]
  },
];

export default function PacientesPage() {
  const [pacientes, setPacientes] = useDemoStorage<PacienteData[]>("vetcontrol_pacientes", PACIENTES_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("TODOS");

  // Modal Nuevo Paciente
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaEspecie, setNuevaEspecie] = useState<"CANINO" | "FELINO" | "EXOTICO">("CANINO");
  const [nuevaRaza, setNuevaRaza] = useState("");
  const [nuevoColor, setNuevoColor] = useState("");
  const [nuevoSexo, setNuevoSexo] = useState<"Macho" | "Hembra">("Macho");
  const [nuevoEsterilizado, setNuevoEsterilizado] = useState(false);
  const [nuevaEdad, setNuevaEdad] = useState("");
  const [nuevoPeso, setNuevoPeso] = useState("");
  const [nuevoMicrochip, setNuevoMicrochip] = useState("");
  const [nuevoTutor, setNuevoTutor] = useState("");
  const [nuevoCi, setNuevoCi] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");
  const [nuevaDireccion, setNuevaDireccion] = useState("");
  const [nuevasAlergias, setNuevasAlergias] = useState("");

  // Modal Ver Ficha Completa
  const [modalFichaAbierto, setModalFichaAbierto] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteData | null>(null);

  // Modal Editar Paciente
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState<PacienteData | null>(null);

  // Modal Enviar a Sala de Espera
  const [modalDerivarAbierto, setModalDerivarAbierto] = useState(false);
  const [pacienteDerivar, setPacienteDerivar] = useState<PacienteData | null>(null);
  const [motivoDerivacion, setMotivoDerivacion] = useState("");
  const [prioridadDerivacion, setPrioridadDerivacion] = useState<"NORMAL" | "URGENTE">("NORMAL");
  const [derivacionExitosa, setDerivacionExitosa] = useState(false);

  // Guardar nuevo paciente
  const guardarNuevoPaciente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevoTutor.trim()) return;

    const tokenNuevo = `${nuevoNombre.toLowerCase().replace(/\s+/g, "")}-${Date.now().toString(36)}`;
    const nuevo: PacienteData = {
      id: `pac-${Date.now()}`,
      nombre: nuevoNombre.trim(),
      especie: nuevaEspecie,
      raza: nuevaRaza.trim() || "Mestizo",
      color: nuevoColor.trim() || "No especificado",
      sexo: nuevoSexo,
      esterilizado: nuevoEsterilizado,
      edad: nuevaEdad.trim() || "1 año aprox.",
      pesoKg: parseFloat(nuevoPeso) || 5.0,
      microchip: nuevoMicrochip.trim() || undefined,
      tutor: nuevoTutor.trim(),
      telefonoTutor: nuevoTelefono.trim() || "77000000",
      ciTutor: nuevoCi.trim() || "S/N",
      direccionTutor: nuevaDireccion.trim() || undefined,
      alergias: nuevasAlergias.trim() ? nuevasAlergias.trim() : null,
      tokenCarnet: tokenNuevo,
      ultimaVisita: "Hoy (Registro inicial)",
      proximaVacuna: "Pendiente programar",
      consultasPrevias: [],
      vacunas: []
    };

    setPacientes([nuevo, ...pacientes]);
    setModalNuevoAbierto(false);

    // Reset formulario
    setNuevoNombre("");
    setNuevaEspecie("CANINO");
    setNuevaRaza("");
    setNuevoColor("");
    setNuevoSexo("Macho");
    setNuevoEsterilizado(false);
    setNuevaEdad("");
    setNuevoPeso("");
    setNuevoMicrochip("");
    setNuevoTutor("");
    setNuevoCi("");
    setNuevoTelefono("");
    setNuevaDireccion("");
    setNuevasAlergias("");
  };

  // Guardar edición de paciente
  const guardarEdicionPaciente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteEditando) return;

    setPacientes(prev => prev.map(p => p.id === pacienteEditando.id ? pacienteEditando : p));
    setModalEditarAbierto(false);
    if (pacienteSeleccionado?.id === pacienteEditando.id) {
      setPacienteSeleccionado(pacienteEditando);
    }
  };

  // Abrir modal de edición
  const abrirEdicion = (paciente: PacienteData) => {
    setPacienteEditando({ ...paciente });
    setModalEditarAbierto(true);
  };

  // Derivar directamente a la Sala de Espera
  const abrirDerivarAEspera = (paciente: PacienteData) => {
    setPacienteDerivar(paciente);
    setMotivoDerivacion("Consulta de rutina / Revisión");
    setPrioridadDerivacion("NORMAL");
    setDerivacionExitosa(false);
    setModalDerivarAbierto(true);
  };

  const confirmarDerivacionAEspera = () => {
    if (!pacienteDerivar) return;
    setDerivacionExitosa(true);
    setTimeout(() => {
      setModalDerivarAbierto(false);
      setDerivacionExitosa(false);
    }, 1200);
  };

  // Enviar carnet por WhatsApp de forma segura
  const enviarCarnetWhatsApp = (paciente: PacienteData) => {
    const celular = paciente.telefonoTutor.replace(/\D/g, "");
    const urlCarnet = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/carnet/${paciente.tokenCarnet}`;
    const mensaje = encodeURIComponent(
      `Hola *${paciente.tutor}*, le saludamos de la *Clínica Veterinaria*.\n\nLe compartimos el enlace oficial del carnet sanitario digital de su mascota *${paciente.nombre}*:\n${urlCarnet}\n\nEn este enlace puede consultar su historial de vacunas, desparasitaciones y próxima fecha de control.`
    );
    window.open(`https://wa.me/591${celular}?text=${mensaje}`, "_blank");
  };

  const renderIconoEspecie = (esp: string) => {
    switch (esp) {
      case "CANINO": return <Dog className="w-5 h-5 text-primary" />;
      case "FELINO": return <Cat className="w-5 h-5 text-amber-600" />;
      default: return <Bird className="w-5 h-5 text-sky-600" />;
    }
  };

  // Filtrado y Búsqueda
  const filtrados = useMemo(() => {
    return pacientes.filter(p => {
      const q = busqueda.toLowerCase().trim();
      const coincideTexto = 
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.tutor.toLowerCase().includes(q) ||
        p.ciTutor.toLowerCase().includes(q) ||
        p.raza.toLowerCase().includes(q) ||
        p.telefonoTutor.includes(q);

      if (!coincideTexto) return false;

      if (filtroEspecie === "TODOS") return true;
      if (filtroEspecie === "ALERGIAS") return p.alergias !== null;
      if (filtroEspecie === "PROX_VACUNA") return p.proximaVacuna.includes("2026");
      return p.especie === filtroEspecie;
    });
  }, [pacientes, busqueda, filtroEspecie]);

  // Contadores
  const totalPacientes = pacientes.length;
  const totalCaninos = pacientes.filter(p => p.especie === "CANINO").length;
  const totalFelinos = pacientes.filter(p => p.especie === "FELINO").length;
  const totalAlergias = pacientes.filter(p => p.alergias !== null).length;

  return (
    <div className="space-y-6">
      {/* 1. Cabecera y Botón Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Directorio de Pacientes & Fichas Clínicas
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registro de mascotas, alertas de contraindicaciones médicas, carnet digital y vinculación con tutores.
          </p>
        </div>

        <Dialog open={modalNuevoAbierto} onOpenChange={setModalNuevoAbierto}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-xl text-xs sm:text-xs font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-11 sm:h-9 px-4 gap-2 cursor-pointer transition-all active:scale-[0.98] w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Registrar Mascota & Tutor
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <HeartPulse className="w-5 h-5 text-primary" />
                Registrar Nueva Ficha Médica
              </DialogTitle>
              <DialogDescription className="text-xs">
                Ingrese los datos clínicos de la mascota y la información legal de su tutor responsable.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={guardarNuevoPaciente} className="space-y-4 py-2">
              {/* Sección 1: Datos de la Mascota */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider pb-1 border-b border-border">
                  <Dog className="w-4 h-4 text-primary" />
                  1. Datos de la Mascota
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Nombre de la Mascota *
                    </label>
                    <Input 
                      placeholder="ej. Firulais"
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                      required
                      className="h-10 sm:h-9 text-base sm:text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Especie *
                    </label>
                    <select 
                      value={nuevaEspecie}
                      onChange={(e) => setNuevaEspecie(e.target.value as any)}
                      className="w-full h-10 sm:h-9 rounded-lg border border-input bg-background px-3 text-base sm:text-xs focus:ring-1 focus:ring-primary"
                    >
                      <option value="CANINO">Canino (Perro)</option>
                      <option value="FELINO">Felino (Gato)</option>
                      <option value="EXOTICO">Exótico / Ave / Roedor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Raza
                    </label>
                    <Input 
                      placeholder="ej. Schnauzer"
                      value={nuevaRaza}
                      onChange={(e) => setNuevaRaza(e.target.value)}
                      className="h-10 sm:h-9 text-base sm:text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Color / Pelaje
                    </label>
                    <Input 
                      placeholder="ej. Negro con blanco"
                      value={nuevoColor}
                      onChange={(e) => setNuevoColor(e.target.value)}
                      className="h-10 sm:h-9 text-base sm:text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Sexo
                    </label>
                    <select 
                      value={nuevoSexo}
                      onChange={(e) => setNuevoSexo(e.target.value as any)}
                      className="w-full h-10 sm:h-9 rounded-lg border border-input bg-background px-3 text-base sm:text-xs focus:ring-1 focus:ring-primary"
                    >
                      <option value="Macho">Macho</option>
                      <option value="Hembra">Hembra</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Edad aproximada
                    </label>
                    <Input 
                      placeholder="ej. 2 años"
                      value={nuevaEdad}
                      onChange={(e) => setNuevaEdad(e.target.value)}
                      className="h-10 sm:h-9 text-base sm:text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Peso actual (kg) *
                    </label>
                    <Input 
                      type="number"
                      step="0.1"
                      placeholder="ej. 6.5"
                      value={nuevoPeso}
                      onChange={(e) => setNuevoPeso(e.target.value)}
                      required
                      className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Microchip / RUAC
                    </label>
                    <Input 
                      placeholder="ej. BO-129384"
                      value={nuevoMicrochip}
                      onChange={(e) => setNuevoMicrochip(e.target.value)}
                      className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input 
                    type="checkbox"
                    id="esterilizado"
                    checked={nuevoEsterilizado}
                    onChange={(e) => setNuevoEsterilizado(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
                  />
                  <label htmlFor="esterilizado" className="text-xs text-foreground cursor-pointer select-none">
                    Mascota esterilizada / castrada
                  </label>
                </div>

                {/* Alerta de Alergia */}
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                  <label className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Alergias o Contraindicaciones Médicas (Crítico)
                  </label>
                  <Input 
                    placeholder="ej. Alérgico a Dipirona / Penicilina"
                    value={nuevasAlergias}
                    onChange={(e) => setNuevasAlergias(e.target.value)}
                    className="h-10 sm:h-9 text-base sm:text-xs bg-background"
                  />
                </div>
              </div>

              {/* Sección 2: Datos del Tutor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider pb-1 border-b border-border">
                  <User className="w-4 h-4 text-primary" />
                  2. Datos del Tutor Responsable
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Nombre Completo del Tutor *
                    </label>
                    <Input 
                      placeholder="ej. Juan Carlos Pérez"
                      value={nuevoTutor}
                      onChange={(e) => setNuevoTutor(e.target.value)}
                      required
                      className="h-10 sm:h-9 text-base sm:text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      C.I. / Expedido *
                    </label>
                    <Input 
                      placeholder="ej. 6234901 SC"
                      value={nuevoCi}
                      onChange={(e) => setNuevoCi(e.target.value)}
                      className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Teléfono WhatsApp (+591) *
                    </label>
                    <Input 
                      placeholder="ej. 77012345"
                      value={nuevoTelefono}
                      onChange={(e) => setNuevoTelefono(e.target.value)}
                      required
                      className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Dirección / Barrio
                    </label>
                    <Input 
                      placeholder="ej. Barrio Equipetrol, Calle 9"
                      value={nuevaDireccion}
                      onChange={(e) => setNuevaDireccion(e.target.value)}
                      className="h-10 sm:h-9 text-base sm:text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="ghost" size="sm" onClick={() => setModalNuevoAbierto(false)} className="h-10 sm:h-8 w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold px-4 h-10 sm:h-8 w-full sm:w-auto">
                  Guardar Ficha del Paciente
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>


      {/* 2. Barra de Métricas y KPIs de Población Animal */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Total Mascotas</p>
            <p className="text-xl font-bold font-mono text-foreground mt-0.5">{totalPacientes}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Población Canina</p>
            <p className="text-xl font-bold font-mono text-primary mt-0.5">{totalCaninos} perros</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Dog className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Población Felina</p>
            <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{totalFelinos} gatos</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Cat className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-50/30 dark:bg-red-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Alertas de Alergias</p>
            <p className="text-xl font-bold font-mono text-red-600 dark:text-red-400 mt-0.5">
              {totalAlergias} {totalAlergias === 1 ? "crítica" : "críticas"}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Buscador y Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-card border border-border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input 
            placeholder="Buscar por mascota, raza, tutor, CI o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 h-10 sm:h-9 text-base sm:text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1 hidden sm:inline">
            Especie:
          </span>
          {[
            { id: "TODOS", label: `Todos (${pacientes.length})` },
            { id: "CANINO", label: "Caninos" },
            { id: "FELINO", label: "Felinos" },
            { id: "ALERGIAS", label: "Con Alergias" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroEspecie(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filtroEspecie === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Cuadrícula de Tarjetas de Pacientes */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtrados.length === 0 ? (
          <div className="col-span-2 p-12 text-center border border-dashed border-border rounded-xl bg-muted/20">
            <HeartPulse className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-foreground">No se encontraron pacientes</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Verifique los términos de búsqueda o registre una nueva mascota.
            </p>
          </div>
        ) : (
          filtrados.map((paciente) => (
            <Card key={paciente.id} className="shadow-xs border-border/80 hover:border-primary/40 transition-all bg-card">
              <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 mt-0.5">
                    {renderIconoEspecie(paciente.especie)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base font-bold text-foreground">{paciente.nombre}</CardTitle>
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {paciente.sexo} {paciente.esterilizado && "· Esterilizado"}
                      </Badge>
                      {paciente.microchip && (
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {paciente.microchip}
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-xs mt-0.5">
                      {paciente.raza} · {paciente.edad} · <span className="font-bold text-foreground font-mono">{paciente.pesoKg} kg</span>
                    </CardDescription>
                  </div>
                </div>

                {/* Botón rápido para pasar a consulta médica */}
                <Link href="/consulta" prefetch={false}>
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 text-primary border-primary/30 font-semibold hover:bg-primary/10 cursor-pointer shadow-xs">
                    <Stethoscope className="w-3.5 h-3.5" />
                    Atender
                  </Button>
                </Link>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-3">
                {/* Banner de Alergia si existe */}
                {paciente.alergias && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span className="font-semibold truncate">{paciente.alergias}</span>
                  </div>
                )}

                {/* Resumen Tutor y Próximo Control */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-xl border border-border">
                  <div>
                    <p className="text-muted-foreground text-[10px] font-semibold">Tutor Responsable:</p>
                    <p className="font-bold text-foreground truncate">{paciente.tutor}</p>
                    <p className="text-muted-foreground text-[11px] flex items-center gap-1 mt-0.5 font-mono">
                      <Phone className="w-3 h-3 text-primary" /> {paciente.telefonoTutor}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">CI: {paciente.ciTutor}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-[10px] font-semibold">Próxima Vacuna / Control:</p>
                    <p className="font-bold text-primary truncate">{paciente.proximaVacuna}</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Última visita: {paciente.ultimaVisita}
                    </p>
                  </div>
                </div>

                {/* Barra de Acciones de la Tarjeta */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-border">
                  {/* 1. Ver Ficha Completa */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setPacienteSeleccionado(paciente);
                      setModalFichaAbierto(true);
                    }}
                    className="text-[11px] h-8 gap-1 font-medium cursor-pointer"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-primary" />
                    Ficha
                  </Button>

                  {/* 2. Derivar a Sala de Espera */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => abrirDerivarAEspera(paciente)}
                    className="text-[11px] h-8 gap-1 font-medium text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-50 cursor-pointer"
                    title="Poner en cola de atención en Sala de Espera"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    A Espera
                  </Button>

                  {/* 3. Ver Carnet Digital */}
                  <Link href={`/carnet/${paciente.tokenCarnet}`} target="_blank" prefetch={false} className="w-full">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-[11px] h-8 gap-1 text-muted-foreground hover:text-foreground cursor-pointer font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Carnet
                    </Button>
                  </Link>

                  {/* 4. Enviar Carnet por WhatsApp */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => enviarCarnetWhatsApp(paciente)}
                    className="text-[11px] h-8 gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 cursor-pointer font-medium"
                    title="Enviar carnet digital por WhatsApp al tutor"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    WA
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 5. MODAL: Ficha Clínica Completa & Historial */}
      <Dialog open={modalFichaAbierto} onOpenChange={setModalFichaAbierto}>
        <DialogContent className="sm:max-w-3xl">
          {pacienteSeleccionado && (
            <>
              <DialogHeader>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      {renderIconoEspecie(pacienteSeleccionado.especie)}
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold flex items-center gap-2 flex-wrap">
                        {pacienteSeleccionado.nombre}
                        <Badge variant="outline" className="text-xs">
                          {pacienteSeleccionado.sexo} {pacienteSeleccionado.esterilizado && "· Esterilizado"}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        {pacienteSeleccionado.especie} · {pacienteSeleccionado.raza} ({pacienteSeleccionado.edad}) · Peso: <strong className="text-foreground">{pacienteSeleccionado.pesoKg} kg</strong>
                      </DialogDescription>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => abrirEdicion(pacienteSeleccionado)}
                    className="text-xs h-9 sm:h-8 gap-1 font-medium cursor-pointer w-full sm:w-auto"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Editar Ficha
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Alerta de Alergia */}
                {pacienteSeleccionado.alergias && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span><strong>Contraindicación Médica:</strong> {pacienteSeleccionado.alergias}</span>
                  </div>
                )}

                {/* Resumen Ficha y Tutor */}
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Tutor Legal:</span>
                    <strong className="text-foreground">{pacienteSeleccionado.tutor}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">C.I. Tutor:</span>
                    <strong className="font-mono text-foreground">{pacienteSeleccionado.ciTutor}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">WhatsApp:</span>
                    <span className="font-mono text-primary font-bold">{pacienteSeleccionado.telefonoTutor}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Color / Manto:</span>
                    <span>{pacienteSeleccionado.color}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Microchip / RUAC:</span>
                    <span className="font-mono">{pacienteSeleccionado.microchip || "No registrado"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Dirección:</span>
                    <span className="truncate block">{pacienteSeleccionado.direccionTutor || "Santa Cruz de la Sierra"}</span>
                  </div>
                </div>

                {/* Historial de Consultas Médicas */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-primary" />
                    Historial de Consultas Médicas ({pacienteSeleccionado.consultasPrevias.length})
                  </h4>

                  {pacienteSeleccionado.consultasPrevias.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-3 bg-muted/20 rounded-lg text-center border border-dashed">
                      Sin consultas registradas previamente.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {pacienteSeleccionado.consultasPrevias.map((c) => (
                        <div key={c.id} className="p-3 rounded-xl border border-border bg-card space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="font-mono font-bold text-primary">{c.fecha}</span>
                            <span className="font-mono text-[11px] font-semibold">{c.pesoRegistrado} kg</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[11px]">Motivo: </span>
                            <strong className="text-foreground">{c.motivo}</strong>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[11px]">Diagnóstico: </span>
                            <span className="text-foreground/90">{c.diagnostico}</span>
                          </div>
                          <div className="p-2 rounded bg-muted/40 text-[11px] font-mono text-foreground/80">
                            Tratamiento: {c.tratamiento}
                          </div>
                          <div className="text-[10px] text-muted-foreground text-right pt-0.5">
                            Atendido por: {c.veterinario}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Plan de Vacunación Registrado */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Syringe className="w-3.5 h-3.5 text-primary" />
                    Registro de Vacunación y Desparasitación
                  </h4>

                  <div className="space-y-1.5">
                    {pacienteSeleccionado.vacunas.map((v) => (
                      <div key={v.id} className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-foreground">{v.vacuna}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            Lote: {v.lote} · Aplicada: {v.fechaAplicada}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${
                              v.estado === "VIGENTE" 
                                ? "text-emerald-700 border-emerald-300 bg-emerald-50" 
                                : "text-amber-700 border-amber-300 bg-amber-50"
                            }`}
                          >
                            Próx: {v.proximaFecha}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pie de Acciones */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-3 border-t border-border">
                  <Link href={`/carnet/${pacienteSeleccionado.tokenCarnet}`} target="_blank" prefetch={false} className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="text-xs gap-1.5 cursor-pointer w-full sm:w-auto h-10 sm:h-8">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Abrir Carnet Digital Oficial
                    </Button>
                  </Link>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setModalFichaAbierto(false)}
                      className="text-xs flex-1 sm:flex-initial h-10 sm:h-8"
                    >
                      Cerrar
                    </Button>
                    <Link href="/consulta" prefetch={false} className="flex-1 sm:flex-initial">
                      <Button size="sm" className="bg-primary text-primary-foreground font-semibold text-xs gap-1.5 cursor-pointer w-full h-10 sm:h-8">
                        <Stethoscope className="w-3.5 h-3.5" />
                        Iniciar Consulta Médica
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 6. MODAL: Editar Datos de Ficha */}
      <Dialog open={modalEditarAbierto} onOpenChange={setModalEditarAbierto}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Edit className="w-5 h-5 text-primary" />
              Editar Ficha de Paciente
            </DialogTitle>
            <DialogDescription className="text-xs">
              Modifique los datos clínicos, peso actualizado o contacto del tutor.
            </DialogDescription>
          </DialogHeader>

          {pacienteEditando && (
            <form onSubmit={guardarEdicionPaciente} className="space-y-3.5 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Nombre Mascota *
                  </label>
                  <Input 
                    value={pacienteEditando.nombre}
                    onChange={(e) => setPacienteEditando({ ...pacienteEditando, nombre: e.target.value })}
                    required
                    className="h-10 sm:h-9 text-base sm:text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Raza
                  </label>
                  <Input 
                    value={pacienteEditando.raza}
                    onChange={(e) => setPacienteEditando({ ...pacienteEditando, raza: e.target.value })}
                    className="h-10 sm:h-9 text-base sm:text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Peso actual (kg) *
                  </label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={pacienteEditando.pesoKg}
                    onChange={(e) => setPacienteEditando({ ...pacienteEditando, pesoKg: parseFloat(e.target.value) || 0 })}
                    required
                    className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Edad
                  </label>
                  <Input 
                    value={pacienteEditando.edad}
                    onChange={(e) => setPacienteEditando({ ...pacienteEditando, edad: e.target.value })}
                    className="h-10 sm:h-9 text-base sm:text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Microchip / RUAC
                  </label>
                  <Input 
                    value={pacienteEditando.microchip || ""}
                    onChange={(e) => setPacienteEditando({ ...pacienteEditando, microchip: e.target.value })}
                    className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                <label className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Alergias o Contraindicaciones
                </label>
                <Input 
                  value={pacienteEditando.alergias || ""}
                  onChange={(e) => setPacienteEditando({ ...pacienteEditando, alergias: e.target.value.trim() ? e.target.value : null })}
                  placeholder="Sin alergias registradas"
                  className="h-10 sm:h-8 text-base sm:text-xs bg-background"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Tutor Responsable *
                  </label>
                  <Input 
                    value={pacienteEditando.tutor}
                    onChange={(e) => setPacienteEditando({ ...pacienteEditando, tutor: e.target.value })}
                    required
                    className="h-10 sm:h-9 text-base sm:text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Teléfono WhatsApp *
                  </label>
                  <Input 
                    value={pacienteEditando.telefonoTutor}
                    onChange={(e) => setPacienteEditando({ ...pacienteEditando, telefonoTutor: e.target.value })}
                    required
                    className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="ghost" size="sm" onClick={() => setModalEditarAbierto(false)} className="h-10 sm:h-8 w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold px-4 h-10 sm:h-8 w-full sm:w-auto">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 7. MODAL: Derivar a Sala de Espera */}
      <Dialog open={modalDerivarAbierto} onOpenChange={setModalDerivarAbierto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Clock className="w-5 h-5 text-amber-500" />
              Poner Paciente en Sala de Espera
            </DialogTitle>
            <DialogDescription className="text-xs">
              Asigne un turno de atención inmediata o regular sin volver a escribir sus datos.
            </DialogDescription>
          </DialogHeader>

          {pacienteDerivar && (
            <div className="space-y-4 py-2">
              {derivacionExitosa ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                  <h4 className="font-bold text-sm text-foreground">
                    ¡Ficha generada exitosamente!
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {pacienteDerivar.nombre} ya figura en la cola de Sala de Espera.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">
                        {pacienteDerivar.nombre}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground font-semibold">
                        {pacienteDerivar.pesoKg} kg
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pacienteDerivar.especie} · {pacienteDerivar.raza} · Tutor: {pacienteDerivar.tutor}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Motivo de la Consulta de Hoy *
                    </label>
                    <Input 
                      value={motivoDerivacion}
                      onChange={(e) => setMotivoDerivacion(e.target.value)}
                      placeholder="ej. Diarrea desde ayer, control post-operatorio"
                      className="h-10 sm:h-9 text-base sm:text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Prioridad de Triage
                    </label>
                    <select 
                      value={prioridadDerivacion}
                      onChange={(e) => setPrioridadDerivacion(e.target.value as any)}
                      className="w-full h-10 sm:h-9 rounded-lg border border-input bg-background px-3 text-base sm:text-xs focus:ring-1 focus:ring-primary"
                    >
                      <option value="NORMAL">Normal (Fila por orden de llegada)</option>
                      <option value="URGENTE">Urgencia (Priorizar llamado a camilla)</option>
                    </select>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setModalDerivarAbierto(false)} className="h-10 sm:h-8 w-full sm:w-auto">
                      Cancelar
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={confirmarDerivacionAEspera}
                      className="bg-primary text-primary-foreground font-semibold px-4 cursor-pointer h-10 sm:h-8 w-full sm:w-auto"
                    >
                      Generar Turno en Sala
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
