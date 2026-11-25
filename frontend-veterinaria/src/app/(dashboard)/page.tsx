"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  MessageCircle, 
  ArrowRight, 
  Pill, 
  CheckCircle2, 
  ExternalLink,
  Plus,
  ShieldAlert,
  ShoppingBag,
  Activity,
  Calendar,
  Layers,
  ThermometerSnowflake,
  PackageOpen,
  Eye,
  Check,
  Dog,
  Cat
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generarEnlaceRecordatorioVacuna } from "@/lib/whatsapp";

interface PacienteEspera {
  ficha: string;
  paciente: string;
  especie: string;
  tutor: string;
  telefono: string;
  motivo: string;
  tiempoEspera: string;
  prioridad: "URGENTE" | "NORMAL";
}

const pacientesSalaEsperaInicial: PacienteEspera[] = [
  {
    ficha: "01",
    paciente: "Toby",
    especie: "Canino · Poodle (8.5 kg)",
    tutor: "Carlos Justiniano",
    telefono: "77012345",
    motivo: "Vómitos frecuentes y decaimiento desde anoche",
    tiempoEspera: "14 min",
    prioridad: "URGENTE",
  },
  {
    ficha: "02",
    paciente: "Michi",
    especie: "Felino · Siamés (3.1 kg)",
    tutor: "Valeria Ríos",
    telefono: "78198765",
    motivo: "Refuerzo anual de Vacuna Triple Felina",
    tiempoEspera: "6 min",
    prioridad: "NORMAL",
  },
  {
    ficha: "03",
    paciente: "Rocky",
    especie: "Canino · Pastor Alemán (29.5 kg)",
    tutor: "Juan José Mendoza",
    telefono: "76345678",
    motivo: "Revisión post-quirúrgica (Extracción de masa)",
    tiempoEspera: "1 min",
    prioridad: "NORMAL",
  },
];

const alertasVacunas = [
  {
    paciente: "Luna",
    tutor: "María René Suárez",
    telefono: "75044332",
    tipo: "Vacuna Séxtuple Canina",
    fecha: "23/11/2026 (en 3 días)",
    token: "luna-77a8",
  },
  {
    paciente: "Max",
    tutor: "Alejandro Torrico",
    telefono: "71288990",
    tipo: "Desparasitación Interna (Drontal)",
    fecha: "21/11/2026 (Mañana)",
    token: "max-12b4",
  },
];

const alertasFarmaciaInicial = [
  {
    id: "f-1",
    medicamento: "Ketamina 10% (Inyectable)",
    principioActivo: "Ketamina Clorhidrato 100 mg/ml",
    lote: "KT-9024",
    vencimiento: "30/11/2026 (9 días)",
    stockRestante: "18.5 ml en frasco",
    estado: "ROJO",
    controlado: true,
    movimientos: [
      { fecha: "18/11/2026", tipo: "Salida", cantidad: "-0.85 ml", motivo: "Cirugía Limpieza Dental (Toby)" },
      { fecha: "14/11/2026", tipo: "Salida", cantidad: "-0.65 ml", motivo: "Sedación Ecografía (Michi)" },
      { fecha: "01/10/2026", tipo: "Entrada", cantidad: "+20.00 ml", motivo: "Recepción Distribuidora FarmaVet" },
    ]
  },
  {
    id: "f-2",
    medicamento: "Amoxicilina + Ácido Clavulánico",
    principioActivo: "Amoxicilina 500mg / Clavulánico 125mg",
    lote: "AMX-810",
    vencimiento: "15/12/2026 (24 días)",
    stockRestante: "34 tabletas sueltas",
    estado: "AMARILLO",
    controlado: false,
    movimientos: [
      { fecha: "19/11/2026", tipo: "Salida", cantidad: "-6 tabletas", motivo: "Tratamiento Pioderma canina" },
      { fecha: "10/11/2026", tipo: "Entrada", cantidad: "+40 tabletas", motivo: "Fraccionamiento de caja 100" },
    ]
  },
  {
    id: "f-3",
    medicamento: "Alimento Pro Plan Puppy Mediano (Granel)",
    principioActivo: "Alimento balanceado cachorros",
    lote: "PP-2026-11",
    vencimiento: "28/02/2027 (3 meses)",
    stockRestante: "2.8 kg en mostrador",
    estado: "ROJO",
    controlado: false,
    movimientos: [
      { fecha: "19/11/2026", tipo: "Salida", cantidad: "-1.5 kg", motivo: "Venta mostrador tutor Toby" },
      { fecha: "15/11/2026", tipo: "Apertura", cantidad: "+15.0 kg", motivo: "Apertura bolsa nueva" },
    ]
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<PacienteEspera[]>(pacientesSalaEsperaInicial);
  const [farmacia, setFarmacia] = useState(alertasFarmaciaInicial);
  
  // Modales
  const [modalFichaRapida, setModalFichaRapida] = useState(false);
  const [modalDetalleLote, setModalDetalleLote] = useState<any | null>(null);
  const [modalAbrirBolsa, setModalAbrirBolsa] = useState(false);
  const [pacienteLlamado, setPacienteLlamado] = useState<PacienteEspera | null>(null);

  // Formulario Ficha Rápida
  const [nombreMascota, setNombreMascota] = useState("");
  const [especieMascota, setEspecieMascota] = useState("Canino");
  const [tutorMascota, setTutorMascota] = useState("");
  const [telefonoMascota, setTelefonoMascota] = useState("");
  const [motivoRapido, setMotivoRapido] = useState("");
  const [prioridadRapida, setPrioridadRapida] = useState<"NORMAL" | "URGENTE">("NORMAL");

  const registrarFichaRapida = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreMascota || !tutorMascota) return;

    const nuevaFicha = (pacientes.length + 1).toString().padStart(2, "0");
    const nuevo: PacienteEspera = {
      ficha: nuevaFicha,
      paciente: nombreMascota,
      especie: especieMascota,
      tutor: tutorMascota,
      telefono: telefonoMascota || "77000000",
      motivo: motivoRapido || "Consulta general",
      tiempoEspera: "Ahora",
      prioridad: prioridadRapida,
    };

    setPacientes([...pacientes, nuevo]);
    setModalFichaRapida(false);

    // Reset
    setNombreMascota("");
    setTutorMascota("");
    setTelefonoMascota("");
    setMotivoRapido("");
  };

  const ejecutarLlamadaCamilla = () => {
    if (!pacienteLlamado) return;
    setPacientes(prev => prev.filter(p => p.ficha !== pacienteLlamado.ficha));
    setPacienteLlamado(null);
    router.push("/consulta");
  };

  const ejecutarAperturaBolsa = () => {
    setFarmacia(prev => prev.map(item => {
      if (item.id === "f-3") {
        return {
          ...item,
          stockRestante: "17.8 kg en mostrador",
          estado: "AMARILLO",
        };
      }
      return item;
    }));
    setModalAbrirBolsa(false);
  };

  const handleEnviarWhatsapp = (alerta: typeof alertasVacunas[0]) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const url = generarEnlaceRecordatorioVacuna({
      telefonoTutor: alerta.telefono,
      nombreTutor: alerta.tutor,
      nombreMascota: alerta.paciente,
      tipoVacuna: alerta.tipo,
      fechaProgramada: alerta.fecha,
      nombreClinica: "VetControl Santa Cruz",
      tokenCarnet: alerta.token,
    }, origin);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Encabezado del Dashboard: Acciones adaptativas para móvil y desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-1">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Panel de Control Clínico
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitoreo en tiempo real de sala de espera, farmacia con semáforo FEFO y alertas de pacientes.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href="/pos" prefetch={false} className="flex-1 sm:flex-initial">
            <Button variant="outline" size="sm" className="w-full sm:w-auto gap-1.5 text-xs h-10 sm:h-9 font-semibold text-muted-foreground hover:text-foreground cursor-pointer active:scale-95">
              <ShoppingBag className="w-3.5 h-3.5 text-primary" />
              <span>POS Caja</span>
            </Button>
          </Link>
          <Button 
            size="sm"
            onClick={() => setModalFichaRapida(true)}
            className="flex-1 sm:flex-initial gap-1.5 text-xs h-10 sm:h-9 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Llegada</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas Principales (Grid 2 columnas en móvil, 4 en desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* KPI 1: Sala de Espera */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-3.5 sm:p-5 pb-1 sm:pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              En Espera
            </CardTitle>
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 sm:p-5 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-extrabold text-foreground">{pacientes.length} Pacientes</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
              Media: 9 min espera
            </p>
          </CardContent>
        </Card>

        {/* KPI 2: Atenciones del día */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-3.5 sm:p-5 pb-1 sm:pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Atenciones Hoy
            </CardTitle>
            <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 sm:p-5 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-extrabold text-foreground">14 Pacientes</div>
            <p className="text-[10px] sm:text-xs text-emerald-600 font-semibold mt-0.5 truncate flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" /> 8 consult. · 4 vac.
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Caja del Día */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-3.5 sm:p-5 pb-1 sm:pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Caja del Día
            </CardTitle>
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 shrink-0">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 sm:p-5 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono truncate">
              Bs. 2,140
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
              QR Simple & Efectivo
            </p>
          </CardContent>
        </Card>

        {/* KPI 4: Deudas / Fiados */}
        <Card className="shadow-xs border-amber-500/30 bg-amber-500/5">
          <CardHeader className="p-3.5 sm:p-5 pb-1 sm:pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider truncate">
              Cuentas x Cobrar
            </CardTitle>
            <div className="p-1.5 rounded-md bg-amber-500/15 text-amber-600 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 sm:p-5 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-extrabold text-amber-800 dark:text-amber-300 font-mono truncate">
              Bs. 890
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
              4 tutores pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fila Principal: Sala de Espera y Notificaciones WhatsApp */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-7">
        
        {/* Sala de Espera (4 columnas) */}
        <Card className="lg:col-span-4 shadow-xs border-border/80">
          <CardHeader className="p-4 sm:p-5 flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Sala de Espera (Orden de Llegada)
              </CardTitle>
              <CardDescription className="text-xs">
                Mascotas esperando atención médica o vacuna
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs font-bold">
              {pacientes.length} en fila
            </Badge>
          </CardHeader>

          <CardContent className="p-0">
            {pacientes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                No hay pacientes en sala de espera en este momento.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pacientes.map((p) => (
                  <div key={p.ficha} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center font-mono text-xs shrink-0">
                        #{p.ficha}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-xs sm:text-sm text-foreground">{p.paciente}</h4>
                          <span className="text-[11px] text-muted-foreground">({p.especie})</span>
                          {p.prioridad === "URGENTE" && (
                            <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 font-bold">
                              Urgencia
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Tutor: <span className="font-semibold text-foreground">{p.tutor}</span> · {p.motivo}
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                          Llegó hace {p.tiempoEspera}
                        </p>
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      onClick={() => setPacienteLlamado(p)}
                      className="w-full sm:w-auto gap-1.5 text-xs h-9 sm:h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer active:scale-95 shrink-0 justify-center"
                    >
                      <span>Llamar a Camilla</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recordatorios Preventivos WhatsApp (3 columnas) */}
        <Card className="lg:col-span-3 shadow-xs border-border/80">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Recordatorios de Vacunación
              </CardTitle>
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 text-xs border-emerald-200 font-semibold">
                WhatsApp
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Envío de mensaje con enlace al carnet digital
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
            {alertasVacunas.map((alerta) => (
              <div key={alerta.token} className="p-3 rounded-xl border border-border bg-card hover:border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{alerta.paciente} ({alerta.tutor})</p>
                  <p className="text-xs text-primary font-semibold">{alerta.tipo}</p>
                  <p className="text-[11px] text-muted-foreground">Vence: {alerta.fecha}</p>
                </div>

                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleEnviarWhatsapp(alerta)}
                  className="w-full sm:w-auto gap-1.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 h-9 sm:h-8 font-semibold cursor-pointer active:scale-95 shrink-0 justify-center"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enviar Recordatorio</span>
                </Button>
              </div>
            ))}

            <div className="p-3 bg-muted/30 rounded-xl text-xs text-muted-foreground border border-border/60">
              El mensaje incluye automáticamente el enlace al carnet digital oficial para que el tutor consulte las vacunas en su celular.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección Farmacia & Stock Crítico (Semáforo FEFO) - Responsive Table + Mobile Cards */}
      <Card className="shadow-xs border-border/80">
        <CardHeader className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Pill className="w-4 h-4 text-primary" />
              Farmacia Veterinaria: Lotes Próximos a Vencer (FEFO)
            </CardTitle>
            <CardDescription className="text-xs">
              Trazabilidad estricta por lotes para evitar mermas en la veterinaria
            </CardDescription>
          </div>
          <Link href="/farmacia" prefetch={false}>
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs h-9 sm:h-8 gap-1.5 font-semibold cursor-pointer active:scale-95 justify-center">
              <span>Ver Inventario Completo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0 sm:p-5 sm:pt-0">
          {/* VISTA 1: Móvil (< md) - Tarjetas Táctiles */}
          <div className="divide-y divide-border md:hidden border-t border-border">
            {farmacia.map((item) => (
              <div key={item.id} className="p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {item.controlado && (
                        <span title="Sustancia Controlada SENASAG">
                          <ShieldAlert className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        </span>
                      )}
                      <p className="font-bold text-xs text-foreground truncate">{item.medicamento}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{item.principioActivo}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] font-bold shrink-0 ${
                      item.estado === "ROJO" 
                        ? "bg-red-500/10 text-red-700 border-red-500/20" 
                        : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                    }`}
                  >
                    {item.vencimiento}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px]">
                    <span className="text-muted-foreground">Lote: </span>
                    <span className="font-mono font-bold text-foreground">{item.lote}</span>
                    <span className="text-muted-foreground ml-2">Stock: </span>
                    <span className="font-bold text-primary">{item.stockRestante}</span>
                  </div>

                  {item.id === "f-3" ? (
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => setModalAbrirBolsa(true)}
                      className="text-xs h-8 font-semibold cursor-pointer gap-1 active:scale-95"
                    >
                      <PackageOpen className="w-3.5 h-3.5 text-primary" />
                      <span>Abrir Bolsa</span>
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setModalDetalleLote(item)}
                      className="text-xs h-8 text-primary font-semibold hover:bg-primary/10 active:scale-95 cursor-pointer gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Kardex</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* VISTA 2: Desktop (>= md) - Tabla Completa */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-[30%]">Medicamento / Insumo</TableHead>
                  <TableHead className="text-xs w-[22%]">Principio Activo</TableHead>
                  <TableHead className="text-xs w-[12%]">Lote</TableHead>
                  <TableHead className="text-xs w-[16%]">Vencimiento (FEFO)</TableHead>
                  <TableHead className="text-xs w-[10%]">Stock Actual</TableHead>
                  <TableHead className="text-xs w-[10%] text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {farmacia.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-xs">
                      <div className="flex items-center gap-2">
                        {item.controlado && (
                          <span title="Sustancia Controlada SENASAG">
                            <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0" />
                          </span>
                        )}
                        <span>{item.medicamento}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{item.principioActivo}</TableCell>
                    <TableCell className="font-mono text-xs">{item.lote}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-semibold ${
                          item.estado === "ROJO" 
                            ? "bg-red-500/10 text-red-700 border-red-500/20" 
                            : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                        }`}
                      >
                        {item.vencimiento}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-xs">{item.stockRestante}</TableCell>
                    <TableCell className="text-right">
                      {item.id === "f-3" ? (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={() => setModalAbrirBolsa(true)}
                          className="text-xs h-7 font-semibold cursor-pointer gap-1"
                        >
                          <PackageOpen className="w-3 h-3 text-primary" />
                          Abrir Bolsa (+15kg)
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setModalDetalleLote(item)}
                          className="text-xs h-7 text-primary font-semibold hover:bg-primary/10 cursor-pointer gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Ver Kardex
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL 1: Ficha Rápida Paciente (Adaptativa Touch / Mobile) */}
      <Dialog open={modalFichaRapida} onOpenChange={setModalFichaRapida}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Plus className="w-5 h-5 text-primary" />
              Nueva Ficha Rápida de Entrada
            </DialogTitle>
            <DialogDescription className="text-xs">
              Registra una mascota que acaba de llegar a la clínica en 30 segundos
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={registrarFichaRapida} className="space-y-3.5 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Nombre de la Mascota *
                </label>
                <Input 
                  placeholder="ej. Canela"
                  value={nombreMascota}
                  onChange={(e) => setNombreMascota(e.target.value)}
                  required
                  className="h-10 sm:h-9 text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Especie *
                </label>
                <select 
                  value={especieMascota}
                  onChange={(e) => setEspecieMascota(e.target.value)}
                  className="w-full h-10 sm:h-9 rounded-md border border-input bg-background px-3 text-base sm:text-xs font-medium"
                >
                  <option value="Canino">Canino (Perro)</option>
                  <option value="Felino">Felino (Gato)</option>
                  <option value="Exótico">Exótico</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Tutor / Dueño *
                </label>
                <Input 
                  placeholder="ej. Andrea Morales"
                  value={tutorMascota}
                  onChange={(e) => setTutorMascota(e.target.value)}
                  required
                  className="h-10 sm:h-9 text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  WhatsApp (+591)
                </label>
                <Input 
                  type="tel"
                  placeholder="ej. 77012345"
                  value={telefonoMascota}
                  onChange={(e) => setTelefonoMascota(e.target.value)}
                  className="h-10 sm:h-9 text-base sm:text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Motivo de la Consulta
              </label>
              <Input 
                placeholder="ej. Tos seca, decaimiento, vacuna antirrábica..."
                value={motivoRapido}
                onChange={(e) => setMotivoRapido(e.target.value)}
                className="h-10 sm:h-9 text-base sm:text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Prioridad de Atención
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button"
                  variant={prioridadRapida === "NORMAL" ? "default" : "outline"}
                  onClick={() => setPrioridadRapida("NORMAL")}
                  className="h-9 sm:h-8 text-xs active:scale-95"
                >
                  Fila Normal
                </Button>
                <Button 
                  type="button"
                  variant={prioridadRapida === "URGENTE" ? "destructive" : "outline"}
                  onClick={() => setPrioridadRapida("URGENTE")}
                  className="h-9 sm:h-8 text-xs font-bold active:scale-95"
                >
                  Urgencia Médica
                </Button>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalFichaRapida(false)} className="text-xs h-10 sm:h-9 w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold text-xs h-10 sm:h-9 w-full sm:w-auto">
                Asignar Turno
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Confirmar Llamada a Camilla */}
      {pacienteLlamado && (
        <Dialog open={!!pacienteLlamado} onOpenChange={() => setPacienteLlamado(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <ArrowRight className="w-5 h-5 text-primary" />
                Llamar a Camilla: {pacienteLlamado.paciente}
              </DialogTitle>
              <DialogDescription className="text-xs">
                El paciente ingresará a la consulta médica
              </DialogDescription>
            </DialogHeader>

            <div className="p-3.5 bg-muted/40 rounded-xl space-y-2 text-xs border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ficha:</span>
                <span className="font-bold">#{pacienteLlamado.ficha}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paciente:</span>
                <span className="font-bold">{pacienteLlamado.paciente} ({pacienteLlamado.especie})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tutor:</span>
                <span className="font-medium">{pacienteLlamado.tutor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Motivo:</span>
                <span className="font-medium text-foreground">{pacienteLlamado.motivo}</span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setPacienteLlamado(null)} className="text-xs h-10 sm:h-9 w-full sm:w-auto">
                Cancelar
              </Button>
              <Button size="sm" onClick={ejecutarLlamadaCamilla} className="bg-primary text-primary-foreground font-bold text-xs gap-1.5 h-10 sm:h-9 w-full sm:w-auto">
                Ingresar a Consulta
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 3: Kardex y Movimientos del Lote */}
      {modalDetalleLote && (
        <Dialog open={!!modalDetalleLote} onOpenChange={() => setModalDetalleLote(null)}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Layers className="w-5 h-5 text-primary" />
                Kardex de Trazabilidad: {modalDetalleLote.medicamento}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Lote: <strong className="font-mono">{modalDetalleLote.lote}</strong> · Stock Actual: <strong>{modalDetalleLote.stockRestante}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="text-xs font-bold text-muted-foreground uppercase">Historial de Salidas y Entradas</div>
              <div className="divide-y divide-border border border-border rounded-xl max-h-56 overflow-y-auto">
                {modalDetalleLote.movimientos.map((m: any, idx: number) => (
                  <div key={idx} className="p-3 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{m.motivo}</p>
                      <p className="text-[11px] text-muted-foreground">{m.fecha} · {m.tipo}</p>
                    </div>
                    <span className={`font-mono font-bold text-xs ${m.cantidad.startsWith("-") ? "text-red-600" : "text-emerald-600"}`}>
                      {m.cantidad}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button size="sm" onClick={() => setModalDetalleLote(null)} className="text-xs w-full sm:w-auto h-10 sm:h-9">
                Cerrar Kardex
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 4: Abrir Bolsa a Granel */}
      <Dialog open={modalAbrirBolsa} onOpenChange={setModalAbrirBolsa}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <PackageOpen className="w-5 h-5 text-primary" />
              Apertura de Bolsa para Granel
            </DialogTitle>
            <DialogDescription className="text-xs">
              Pro Plan Puppy Razas Medianas (Bolsa 15 kg)
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 bg-muted/40 rounded-xl space-y-2 text-xs border border-border">
            <p className="text-muted-foreground">
              Esta operación descuenta <strong>1 bolsa sellada de 15 kg</strong> del almacén general y suma <strong>15.00 kg</strong> al inventario suelto de mostrador.
            </p>
            <div className="pt-2 border-t border-border flex justify-between font-bold">
              <span>Stock actual en mostrador:</span>
              <span className="text-red-600">2.8 kg (Crítico)</span>
            </div>
            <div className="flex justify-between font-bold text-primary">
              <span>Nuevo stock resultante:</span>
              <span>17.8 kg</span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => setModalAbrirBolsa(false)} className="text-xs h-10 sm:h-9 w-full sm:w-auto">
              Cancelar
            </Button>
            <Button size="sm" onClick={ejecutarAperturaBolsa} className="bg-primary text-primary-foreground font-bold text-xs h-10 sm:h-9 w-full sm:w-auto">
              Confirmar Apertura (+15 kg)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
