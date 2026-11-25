"use client";

import { useState, useMemo } from "react";
import { useDemoStorage } from "@/lib/useDemoStorage";
import { 
  Wallet, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Phone, 
  User, 
  MessageCircle, 
  QrCode, 
  Banknote, 
  CreditCard,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  FileText,
  Printer,
  History,
  Dog,
  DollarSign,
  Check,
  Building2,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface MovimientoCuenta {
  id: string;
  fecha: string;
  tipo: "CARGO_DEUDA" | "ABONO_PAGO";
  concepto: string;
  monto: number;
  saldoPosterior: number;
  metodo?: string;
  comprobante?: string;
}

export interface TutorExtendido {
  id: string;
  nombre: string;
  telefono: string;
  carnet: string;
  direccion: string;
  saldoDeudor: number;
  limiteCredito: number;
  mascotas: string[];
  movimientos: MovimientoCuenta[];
}

const TUTORES_INICIALES: TutorExtendido[] = [
  {
    id: "tut-1",
    nombre: "Carlos Justiniano",
    telefono: "77012345",
    carnet: "6234901 SC",
    direccion: "Barrio Sirari, Calle Los Claveles #14",
    saldoDeudor: 320.00,
    limiteCredito: 1000.00,
    mascotas: ["Toby (Poodle)"],
    movimientos: [
      {
        id: "mov-1",
        fecha: "10/11/2026",
        tipo: "CARGO_DEUDA",
        concepto: "Consulta de Urgencia y Ecografía abdominal (Toby)",
        monto: 220.00,
        saldoPosterior: 220.00,
        comprobante: "TK-00812",
      },
      {
        id: "mov-2",
        fecha: "15/11/2026",
        tipo: "CARGO_DEUDA",
        concepto: "Alimento Pro Plan Puppy 3kg a granel + Pipeta antipulgas",
        monto: 150.00,
        saldoPosterior: 370.00,
        comprobante: "TK-00829",
      },
      {
        id: "mov-3",
        fecha: "18/11/2026",
        tipo: "ABONO_PAGO",
        concepto: "Abono parcial en mostrador",
        monto: 50.00,
        saldoPosterior: 320.00,
        metodo: "Efectivo",
        comprobante: "REC-00104",
      },
    ]
  },
  {
    id: "tut-2",
    nombre: "Valeria Ríos",
    telefono: "78198765",
    carnet: "5489012 CB",
    direccion: "Av. Melchor Pinto #450, Edif. Los Pinos 3B",
    saldoDeudor: 0.00,
    limiteCredito: 800.00,
    mascotas: ["Michi (Siamés)"],
    movimientos: [
      {
        id: "mov-4",
        fecha: "12/10/2026",
        tipo: "CARGO_DEUDA",
        concepto: "Vacuna Triple Felina y control preventivo",
        monto: 85.00,
        saldoPosterior: 85.00,
        comprobante: "TK-00780",
      },
      {
        id: "mov-5",
        fecha: "12/10/2026",
        tipo: "ABONO_PAGO",
        concepto: "Pago total con QR Simple",
        monto: 85.00,
        saldoPosterior: 0.00,
        metodo: "QR Simple",
        comprobante: "REC-00088",
      },
    ]
  },
  {
    id: "tut-3",
    nombre: "María René Suárez",
    telefono: "75044332",
    carnet: "7194012 SC",
    direccion: "Condominio La Floresta, Casa 18",
    saldoDeudor: 180.00,
    limiteCredito: 1500.00,
    mascotas: ["Luna (Golden Retriever)"],
    movimientos: [
      {
        id: "mov-6",
        fecha: "05/09/2026",
        tipo: "CARGO_DEUDA",
        concepto: "Tratamiento dermatológico Apoquel + Simparica Trio",
        monto: 280.00,
        saldoPosterior: 280.00,
        comprobante: "TK-00690",
      },
      {
        id: "mov-7",
        fecha: "20/09/2026",
        tipo: "ABONO_PAGO",
        concepto: "Abono bancario QR",
        monto: 100.00,
        saldoPosterior: 180.00,
        metodo: "QR Simple",
        comprobante: "REC-00095",
      },
    ]
  },
  {
    id: "tut-4",
    nombre: "Juan José Mendoza",
    telefono: "76345678",
    carnet: "4920199 LP",
    direccion: "Zona Equipetrol, Calle 9 Este",
    saldoDeudor: 0.00,
    limiteCredito: 2000.00,
    mascotas: ["Rocky (Pastor Alemán)"],
    movimientos: [
      {
        id: "mov-8",
        fecha: "18/11/2026",
        tipo: "CARGO_DEUDA",
        concepto: "Procedimiento quirúrgico orquiectomía y post-operatorio",
        monto: 350.00,
        saldoPosterior: 350.00,
        comprobante: "TK-00835",
      },
      {
        id: "mov-9",
        fecha: "18/11/2026",
        tipo: "ABONO_PAGO",
        concepto: "Cancelación total en recepción",
        monto: 350.00,
        saldoPosterior: 0.00,
        metodo: "Efectivo",
        comprobante: "REC-00102",
      },
    ]
  },
];

export default function TutoresPage() {
  const [tutores, setTutores] = useDemoStorage<TutorExtendido[]>("vetcontrol_tutores", TUTORES_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  const [filtroDeuda, setFiltroDeuda] = useState<"TODOS" | "CON_DEUDA" | "AL_DIA">("TODOS");

  // Modal de Abono
  const [tutorAbono, setTutorAbono] = useState<TutorExtendido | null>(null);
  const [montoAbono, setMontoAbono] = useState("");
  const [metodoAbono, setMetodoAbono] = useState<"EFECTIVO" | "QR">("QR");

  // Modal de Extracto / Historial de Cuenta
  const [tutorExtracto, setTutorExtracto] = useState<TutorExtendido | null>(null);
  const [modalExtractoAbierto, setModalExtractoAbierto] = useState(false);

  // Modal de Nuevo Tutor
  const [modalNuevoTutor, setModalNuevoTutor] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCarnet, setNuevoCarnet] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");
  const [nuevaDireccion, setNuevaDireccion] = useState("");
  const [nuevoLimite, setNuevoLimite] = useState("1000");

  // Modal de Cargar Fiado Manual
  const [modalNuevoCargo, setModalNuevoCargo] = useState(false);
  const [tutorCargo, setTutorCargo] = useState<TutorExtendido | null>(null);
  const [conceptoCargo, setConceptoCargo] = useState("");
  const [montoCargo, setMontoCargo] = useState("");

  const totalDeudaClinica = useMemo(() => {
    return tutores.reduce((acc, t) => acc + t.saldoDeudor, 0);
  }, [tutores]);

  // Procesar abono a la cuenta corriente
  const procesarAbono = () => {
    if (!tutorAbono) return;
    const pago = parseFloat(montoAbono) || 0;
    if (pago <= 0) return;

    const fechaHoy = new Date().toLocaleDateString("es-BO");
    const nuevoMov: MovimientoCuenta = {
      id: `mov-${Date.now()}`,
      fecha: fechaHoy,
      tipo: "ABONO_PAGO",
      concepto: `Abono parcial / pago de deuda (${metodoAbono})`,
      monto: pago,
      saldoPosterior: Math.max(0, tutorAbono.saldoDeudor - pago),
      metodo: metodoAbono === "QR" ? "QR Simple" : "Efectivo",
      comprobante: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setTutores(prev => prev.map(t => {
      if (t.id === tutorAbono.id) {
        return {
          ...t,
          saldoDeudor: Math.max(0, t.saldoDeudor - pago),
          movimientos: [nuevoMov, ...t.movimientos],
        };
      }
      return t;
    }));

    setTutorAbono(null);
    setMontoAbono("");
  };

  // Registrar nuevo tutor
  const guardarNuevoTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevoTelefono.trim()) return;

    const nuevo: TutorExtendido = {
      id: `tut-${Date.now()}`,
      nombre: nuevoNombre.trim(),
      telefono: nuevoTelefono.trim(),
      carnet: nuevoCarnet.trim() || "S/N",
      direccion: nuevaDireccion.trim() || "Santa Cruz de la Sierra",
      saldoDeudor: 0,
      limiteCredito: parseFloat(nuevoLimite) || 1000,
      mascotas: [],
      movimientos: [],
    };

    setTutores([nuevo, ...tutores]);
    setModalNuevoTutor(false);

    // Reset
    setNuevoNombre("");
    setNuevoCarnet("");
    setNuevoTelefono("");
    setNuevaDireccion("");
    setNuevoLimite("1000");
  };

  // Cargar nuevo fiado / consumo
  const guardarCargoManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorCargo || !conceptoCargo.trim()) return;
    const monto = parseFloat(montoCargo) || 0;
    if (monto <= 0) return;

    const fechaHoy = new Date().toLocaleDateString("es-BO");
    const nuevoMov: MovimientoCuenta = {
      id: `mov-${Date.now()}`,
      fecha: fechaHoy,
      tipo: "CARGO_DEUDA",
      concepto: conceptoCargo.trim(),
      monto: monto,
      saldoPosterior: tutorCargo.saldoDeudor + monto,
      comprobante: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setTutores(prev => prev.map(t => {
      if (t.id === tutorCargo.id) {
        return {
          ...t,
          saldoDeudor: t.saldoDeudor + monto,
          movimientos: [nuevoMov, ...t.movimientos],
        };
      }
      return t;
    }));

    setModalNuevoCargo(false);
    setTutorCargo(null);
    setConceptoCargo("");
    setMontoCargo("");
  };

  // Enviar extracto o recordatorio cordial de deuda por WhatsApp
  const enviarRecordatorioWA = (tutor: TutorExtendido) => {
    const celular = tutor.telefono.replace(/\D/g, "");
    const mensaje = encodeURIComponent(
      `Estimado/a *${tutor.nombre}*, le saludamos de la *Clínica Veterinaria Central*.\n\nLe recordamos cordialmente que mantiene un saldo pendiente de *Bs. ${tutor.saldoDeudor.toFixed(2)}* correspondiente a la atención de sus mascotas.\n\nPuede realizar su abono cómodamente mediante transferencia *QR Simple* o en caja en nuestra recepción. Si ya realizó el pago, por favor remítanos el comprobante por este medio.\n\n¡Muchas gracias por su confianza!`
    );
    window.open(`https://wa.me/591${celular}?text=${mensaje}`, "_blank");
  };

  // Enviar estado de cuenta por WhatsApp
  const enviarExtractoWA = (tutor: TutorExtendido) => {
    const celular = tutor.telefono.replace(/\D/g, "");
    const lineasMov = tutor.movimientos.slice(0, 4).map(m => 
      `• ${m.fecha}: ${m.concepto} (${m.tipo === "CARGO_DEUDA" ? "+" : "-"}Bs. ${m.monto.toFixed(2)})`
    ).join("\n");

    const texto = encodeURIComponent(
      `Hola *${tutor.nombre}*, le compartimos el extracto de su cuenta corriente en *Clínica Veterinaria Central*:\n\n*ÚLTIMOS MOVIMIENTOS:*\n${lineasMov}\n\n*SALDO ACTUAL PENDIENTE:* Bs. ${tutor.saldoDeudor.toFixed(2)}\n\nCualquier duda estamos a su disposición.`
    );
    window.open(`https://wa.me/591${celular}?text=${texto}`, "_blank");
  };

  const tutoresFiltrados = useMemo(() => {
    return tutores.filter(t => {
      const q = busqueda.toLowerCase().trim();
      const coincideTexto = 
        !q ||
        t.nombre.toLowerCase().includes(q) ||
        t.telefono.includes(q) ||
        t.carnet.toLowerCase().includes(q) ||
        t.direccion.toLowerCase().includes(q);

      if (!coincideTexto) return false;

      if (filtroDeuda === "CON_DEUDA") return t.saldoDeudor > 0;
      if (filtroDeuda === "AL_DIA") return t.saldoDeudor === 0;
      return true;
    });
  }, [tutores, busqueda, filtroDeuda]);

  return (
    <div className="space-y-6">
      {/* 1. Cabecera y Resumen de Créditos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Cuentas Corrientes & Clientes Tutores
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Control de saldos deudores, fiados de confianza autorizados y registro de abonos parciales con QR Simple o Efectivo.
          </p>
        </div>

        <div className="flex items-stretch sm:items-center gap-2 flex-wrap sm:flex-nowrap">
          <Badge variant="outline" className="text-xs px-3 py-1.5 border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300 font-medium justify-center flex-1 sm:flex-initial">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />
            Deuda en Clínica: <strong className="ml-1 text-sm font-mono font-bold">Bs. {totalDeudaClinica.toFixed(2)}</strong>
          </Badge>

          <Button 
            size="sm" 
            onClick={() => setModalNuevoTutor(true)}
            className="text-xs h-10 sm:h-9 gap-1.5 bg-primary text-primary-foreground font-semibold cursor-pointer shadow-xs active:scale-[0.98] transition-transform w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Nuevo Tutor / Cliente
          </Button>
        </div>
      </div>

      {/* 2. Tarjetas de Métricas de Crédito */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card className="shadow-xs border-border">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Total Tutores Registrados
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold font-mono text-foreground">{tutores.length} Clientes</div>
            <p className="text-xs text-muted-foreground mt-1">Con expediente y ficha legal de contacto</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/20">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase">
              Clientes con Saldo Pendiente
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {tutores.filter(t => t.saldoDeudor > 0).length} Tutores
            </div>
            <p className="text-xs text-muted-foreground mt-1">Suman Bs. {totalDeudaClinica.toFixed(2)} por cobrar</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 uppercase">
              Clientes al Día (Sin Deuda)
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {tutores.filter(t => t.saldoDeudor === 0).length} Tutores
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cuentas 100% saneadas al día</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Buscador y Filtro de Deuda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-card border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input 
            placeholder="Buscar por nombre, CI, teléfono o dirección..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 h-10 sm:h-9 text-base sm:text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1 hidden sm:inline">
            Mostrar:
          </span>
          <Button 
            size="sm" 
            variant={filtroDeuda === "TODOS" ? "default" : "outline"}
            onClick={() => setFiltroDeuda("TODOS")}
            className="text-xs h-9 sm:h-8 px-3 cursor-pointer font-semibold shrink-0 active:scale-95 transition-transform"
          >
            Todos ({tutores.length})
          </Button>
          <Button 
            size="sm" 
            variant={filtroDeuda === "CON_DEUDA" ? "default" : "outline"}
            onClick={() => setFiltroDeuda("CON_DEUDA")}
            className="text-xs h-9 sm:h-8 px-3 gap-1.5 text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-50 cursor-pointer font-semibold shrink-0 active:scale-95 transition-transform"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Con Deuda ({tutores.filter(t => t.saldoDeudor > 0).length})
          </Button>
          <Button 
            size="sm" 
            variant={filtroDeuda === "AL_DIA" ? "default" : "outline"}
            onClick={() => setFiltroDeuda("AL_DIA")}
            className="text-xs h-9 sm:h-8 px-3 gap-1.5 text-emerald-700 border-emerald-300 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-50 cursor-pointer font-semibold shrink-0 active:scale-95 transition-transform"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Al Día ({tutores.filter(t => t.saldoDeudor === 0).length})
          </Button>
        </div>
      </div>

      {/* 4. Lista de Tarjetas de Tutores */}
      <div className="grid gap-4 md:grid-cols-2">
        {tutoresFiltrados.length === 0 ? (
          <div className="col-span-2 p-12 text-center border border-dashed border-border rounded-xl bg-muted/20">
            <User className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-foreground">No se encontraron tutores</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Verifique los términos de búsqueda o registre un nuevo cliente.
            </p>
          </div>
        ) : (
          tutoresFiltrados.map((tutor) => (
            <Card key={tutor.id} className="shadow-xs border-border/80 hover:border-primary/40 transition-all bg-card">
              <CardHeader className="p-3.5 sm:p-4 pb-2.5 sm:pb-3 flex flex-row items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base font-bold text-foreground">{tutor.nombre}</CardTitle>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      CI: {tutor.carnet}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-0.5">
                    WhatsApp: <span className="font-mono text-primary font-bold">{tutor.telefono}</span> · <span className="text-muted-foreground">{tutor.direccion}</span>
                  </CardDescription>
                </div>

                <div className="shrink-0">
                  {tutor.saldoDeudor > 0 ? (
                    <Badge variant="destructive" className="font-mono text-xs font-bold px-2 py-0.5">
                      Debe Bs. {tutor.saldoDeudor.toFixed(2)}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Al Día
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-3.5 sm:p-4 pt-0 space-y-3">
                {/* Mascotas a cargo y límite de crédito */}
                <div className="p-2.5 rounded-xl bg-muted/30 border border-border text-xs flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Mascotas registradas:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {tutor.mascotas.length > 0 ? (
                        tutor.mascotas.map((m, i) => (
                          <span key={i} className="text-xs font-bold text-foreground">
                            {m}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">Sin mascotas vinculadas</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-muted-foreground text-[10px] block">Límite de crédito:</span>
                    <span className="font-mono font-bold text-xs text-foreground">
                      Bs. {tutor.limiteCredito.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Acciones de la Tarjeta */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-border">
                  {/* Ver Extracto */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setTutorExtracto(tutor);
                      setModalExtractoAbierto(true);
                    }}
                    className="text-xs sm:text-[11px] h-9 sm:h-8 gap-1 font-medium cursor-pointer active:scale-95 transition-transform"
                  >
                    <History className="w-3.5 h-3.5 text-primary" />
                    Extracto
                  </Button>

                  {/* Cargar Fiado Manual */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setTutorCargo(tutor);
                      setConceptoCargo("");
                      setMontoCargo("");
                      setModalNuevoCargo(true);
                    }}
                    className="text-xs sm:text-[11px] h-9 sm:h-8 gap-1 text-muted-foreground hover:text-foreground cursor-pointer active:scale-95 transition-transform"
                    title="Cargar un nuevo consumo o fiado a la cuenta"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Fiado
                  </Button>

                  {/* Registrar Abono (si tiene deuda) */}
                  {tutor.saldoDeudor > 0 ? (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setTutorAbono(tutor);
                          setMontoAbono(tutor.saldoDeudor.toString());
                        }}
                        className="text-xs sm:text-[11px] h-9 sm:h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs active:scale-95 transition-transform"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        Abonar
                      </Button>

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => enviarRecordatorioWA(tutor)}
                        className="text-xs sm:text-[11px] h-9 sm:h-8 gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 cursor-pointer font-semibold active:scale-95 transition-transform"
                        title="Enviar recordatorio cordial de deuda por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Cobrar WA
                      </Button>
                    </>
                  ) : (
                    <div className="col-span-2 text-right flex items-center justify-end text-xs sm:text-[11px] text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Sin saldo pendiente
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 5. MODAL: Extracto Detallado de Cuenta Corriente */}
      <Dialog open={modalExtractoAbierto} onOpenChange={setModalExtractoAbierto}>
        <DialogContent className="sm:max-w-3xl">
          {tutorExtracto && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <DialogTitle className="flex items-center gap-2 text-base font-bold">
                    <History className="w-5 h-5 text-primary shrink-0" />
                    <span>Extracto: {tutorExtracto.nombre}</span>
                  </DialogTitle>
                  <Badge 
                    variant={tutorExtracto.saldoDeudor > 0 ? "destructive" : "outline"}
                    className="font-mono text-xs font-bold"
                  >
                    Saldo: Bs. {tutorExtracto.saldoDeudor.toFixed(2)}
                  </Badge>
                </div>
                <DialogDescription className="text-xs">
                  CI: {tutorExtracto.carnet} · WhatsApp: +591 {tutorExtracto.telefono} · Dirección: {tutorExtracto.direccion}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* VISTA MÓVIL: Tarjetas de Movimientos */}
                <div className="sm:hidden space-y-2">
                  {tutorExtracto.movimientos.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                      Sin movimientos registrados en esta cuenta.
                    </div>
                  ) : (
                    tutorExtracto.movimientos.map((m) => (
                      <div key={m.id} className="p-3 bg-muted/20 border border-border rounded-xl space-y-1.5 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[11px] text-muted-foreground">{m.fecha}</span>
                          <span className={`font-mono font-bold text-xs ${m.tipo === "CARGO_DEUDA" ? "text-red-600" : "text-emerald-600"}`}>
                            {m.tipo === "CARGO_DEUDA" ? "+" : "-"}Bs. {m.monto.toFixed(2)}
                          </span>
                        </div>
                        <p className="font-semibold text-foreground">{m.concepto}</p>
                        <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                          <span className="truncate">{m.comprobante ? `Ref: ${m.comprobante}` : ""}{m.metodo ? ` · ${m.metodo}` : ""}</span>
                          <span className="shrink-0 font-medium">Saldo: <strong className="font-mono text-foreground">Bs. {m.saldoPosterior.toFixed(2)}</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* VISTA ESCRITORIO: Tabla Completa */}
                <div className="hidden sm:block border border-border rounded-xl bg-card overflow-hidden">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/40 text-[11px]">
                        <TableHead className="font-bold w-[18%]">Fecha</TableHead>
                        <TableHead className="font-bold w-[42%]">Concepto / Comprobante</TableHead>
                        <TableHead className="font-bold w-[20%] text-right">Movimiento (Bs.)</TableHead>
                        <TableHead className="font-bold w-[20%] text-right">Saldo Posterior</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tutorExtracto.movimientos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-xs text-muted-foreground">
                            Sin movimientos registrados en esta cuenta.
                          </TableCell>
                        </TableRow>
                      ) : (
                        tutorExtracto.movimientos.map((m) => (
                          <TableRow key={m.id} className="text-xs">
                            <TableCell className="font-mono text-[11px] align-top py-2.5">
                              {m.fecha}
                            </TableCell>
                            <TableCell className="align-top py-2.5">
                              <p className="font-semibold text-foreground">{m.concepto}</p>
                              {m.comprobante && (
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  Ref: {m.comprobante} {m.metodo ? `· ${m.metodo}` : ""}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="align-top py-2.5 text-right font-mono font-bold">
                              {m.tipo === "CARGO_DEUDA" ? (
                                <span className="text-red-600">
                                  +Bs. {m.monto.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-emerald-600">
                                  -Bs. {m.monto.toFixed(2)}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="align-top py-2.5 text-right font-mono font-semibold text-foreground">
                              Bs. {m.saldoPosterior.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-3 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => enviarExtractoWA(tutorExtracto)}
                  className="text-xs h-10 sm:h-9 gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer font-semibold active:scale-95 transition-transform w-full sm:w-auto"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Enviar Extracto por WhatsApp
                </Button>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.print()} 
                    className="text-xs h-10 sm:h-9 gap-1.5 cursor-pointer font-semibold flex-1 sm:flex-initial active:scale-95 transition-transform"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setModalExtractoAbierto(false)} 
                    className="bg-primary text-primary-foreground text-xs h-10 sm:h-9 font-semibold px-4 cursor-pointer flex-1 sm:flex-initial active:scale-95 transition-transform"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 6. MODAL: Registrar Abono a Cuenta Corriente */}
      {tutorAbono && (
        <Dialog open={!!tutorAbono} onOpenChange={() => setTutorAbono(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-600 text-base font-bold">
                <Receipt className="w-5 h-5" />
                Registrar Abono / Pago de Deuda
              </DialogTitle>
              <DialogDescription className="text-xs">
                Tutor: <strong>{tutorAbono.nombre}</strong> · Deuda actual: <strong className="font-mono text-foreground">Bs. {tutorAbono.saldoDeudor.toFixed(2)}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Monto a Abonar (Bs.) *
                </label>
                <div className="relative">
                  <Input 
                    type="number"
                    step="0.5"
                    min="1"
                    max={tutorAbono.saldoDeudor}
                    value={montoAbono}
                    onChange={(e) => setMontoAbono(e.target.value)}
                    className="text-2xl font-bold font-mono h-12 pr-12 text-emerald-700 dark:text-emerald-400"
                    autoFocus
                  />
                  <span className="absolute right-4 top-3 text-sm font-semibold text-muted-foreground">Bs.</span>
                </div>
              </div>

              {/* Botones de sugerencia */}
              <div className="flex gap-1.5">
                {[50, 100, tutorAbono.saldoDeudor].map((val) => (
                  <Button 
                    key={val}
                    type="button"
                    size="sm" 
                    variant={montoAbono === val.toString() ? "default" : "outline"}
                    onClick={() => setMontoAbono(val.toString())}
                    className="flex-1 text-xs h-10 sm:h-8 font-mono font-semibold cursor-pointer active:scale-95 transition-transform"
                  >
                    {val === tutorAbono.saldoDeudor ? "Total (Bs. " + val + ")" : "Bs. " + val}
                  </Button>
                ))}
              </div>

              {/* Selector de Método */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Modalidad de Recepción del Abono
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="button"
                    variant={metodoAbono === "QR" ? "default" : "outline"}
                    onClick={() => setMetodoAbono("QR")}
                    className="gap-1.5 text-xs h-10 sm:h-9 font-semibold cursor-pointer active:scale-95 transition-transform"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR Simple
                  </Button>
                  <Button 
                    type="button"
                    variant={metodoAbono === "EFECTIVO" ? "default" : "outline"}
                    onClick={() => setMetodoAbono("EFECTIVO")}
                    className="gap-1.5 text-xs h-10 sm:h-9 font-semibold cursor-pointer active:scale-95 transition-transform"
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    Efectivo
                  </Button>
                </div>
              </div>

              {/* Saldo Resultante */}
              <div className="p-3 bg-muted/40 rounded-xl flex items-center justify-between text-xs border border-border">
                <span className="text-muted-foreground font-semibold">Nuevo saldo deudor:</span>
                <span className="font-extrabold text-base font-mono text-primary">
                  Bs. {Math.max(0, tutorAbono.saldoDeudor - (parseFloat(montoAbono) || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setTutorAbono(null)} className="h-10 sm:h-8 text-xs cursor-pointer">
                Cancelar
              </Button>
              <Button size="sm" onClick={procesarAbono} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 sm:h-9 cursor-pointer px-4 active:scale-95 transition-transform">
                Confirmar Abono
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 7. MODAL: Registrar Nuevo Tutor / Cliente */}
      <Dialog open={modalNuevoTutor} onOpenChange={setModalNuevoTutor}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <User className="w-5 h-5 text-primary" />
              Registrar Nuevo Tutor / Cliente
            </DialogTitle>
            <DialogDescription className="text-xs">
              Cree la cuenta corriente y asigne un límite de crédito autorizado.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={guardarNuevoTutor} className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Nombre Completo del Tutor *
              </label>
              <Input
                placeholder="ej. Mariana Salvatierra"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                required
                className="h-10 sm:h-9 text-base sm:text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  C.I. / Expedido *
                </label>
                <Input
                  placeholder="ej. 8920194 SC"
                  value={nuevoCarnet}
                  onChange={(e) => setNuevoCarnet(e.target.value)}
                  className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Teléfono WhatsApp (+591) *
                </label>
                <Input
                  placeholder="ej. 76099887"
                  value={nuevoTelefono}
                  onChange={(e) => setNuevoTelefono(e.target.value)}
                  required
                  className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Dirección / Barrio
                </label>
                <Input
                  placeholder="ej. Barrio Las Palmas, Calle 3"
                  value={nuevaDireccion}
                  onChange={(e) => setNuevaDireccion(e.target.value)}
                  className="h-10 sm:h-9 text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Límite de Crédito (Bs.)
                </label>
                <Input
                  type="number"
                  placeholder="1000.00"
                  value={nuevoLimite}
                  onChange={(e) => setNuevoLimite(e.target.value)}
                  className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalNuevoTutor(false)} className="h-10 sm:h-8 text-xs cursor-pointer">
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold px-4 h-11 sm:h-9 text-xs cursor-pointer active:scale-95 transition-transform">
                Registrar Tutor
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 8. MODAL: Cargar Nuevo Fiado / Consumo Manual */}
      <Dialog open={modalNuevoCargo} onOpenChange={setModalNuevoCargo}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-amber-700 dark:text-amber-400">
              <Plus className="w-5 h-5" />
              Cargar Fiado a Cuenta Corriente
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tutor: <strong>{tutorCargo?.nombre}</strong> (Saldo actual: Bs. {tutorCargo?.saldoDeudor.toFixed(2)})
            </DialogDescription>
          </DialogHeader>

          {tutorCargo && (
            <form onSubmit={guardarCargoManual} className="space-y-3.5 py-2">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Concepto del Consumo / Fiado *
                </label>
                <Input
                  placeholder="ej. Medicamento en urgencia nocturna, collar Isabelino"
                  value={conceptoCargo}
                  onChange={(e) => setConceptoCargo(e.target.value)}
                  required
                  className="h-10 sm:h-9 text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Importe a Cargar (Bs.) *
                </label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="ej. 85.00"
                  value={montoCargo}
                  onChange={(e) => setMontoCargo(e.target.value)}
                  required
                  className="h-10 sm:h-9 text-base sm:text-xs font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-xl flex items-center justify-between text-xs border border-border">
                <span className="text-muted-foreground font-semibold">Nuevo saldo deudor:</span>
                <span className="font-extrabold text-base font-mono text-red-600">
                  Bs. {(tutorCargo.saldoDeudor + (parseFloat(montoCargo) || 0)).toFixed(2)}
                </span>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="ghost" size="sm" onClick={() => setModalNuevoCargo(false)} className="h-10 sm:h-8 text-xs cursor-pointer">
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold px-4 h-11 sm:h-9 text-xs cursor-pointer active:scale-95 transition-transform">
                  Añadir a la Cuenta
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
