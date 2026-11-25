"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  Pill,
  Dog,
  Cat,
  Clock,
  Calendar,
  History,
  Calculator,
  MessageCircle,
  ArrowRight,
  FileText,
  Printer,
  ShieldCheck,
  User,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Check,
  ChevronDown,
  ListFilter,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Prescripcion {
  id: string;
  medicamento: string;
  lote: string;
  dosis: string;
  indicacion: string;
  aplicadoEnClinica: boolean;
  precio: number;
}

interface PacienteEnConsulta {
  id: string;
  numeroFicha: number;
  nombre: string;
  especie: "Canino" | "Felino";
  raza: string;
  sexo: "Macho" | "Hembra";
  edad: string;
  pesoAnteriorKg: number;
  pesoKg: number;
  tutor: string;
  telefonoTutor: string;
  alergias: string | null;
  camilla: string;
  motivoLlegada: string;
  anamnesis: string;
  diagnostico: string;
}

const PACIENTES_CAMILLA: PacienteEnConsulta[] = [
  {
    id: "pac-1",
    numeroFicha: 1,
    nombre: "Toby",
    especie: "Canino",
    raza: "Poodle Toy",
    sexo: "Macho",
    edad: "3 años y 2 meses",
    pesoAnteriorKg: 8.7,
    pesoKg: 8.5,
    tutor: "Carlos Justiniano",
    telefonoTutor: "77012345",
    alergias: "Alérgico a Dipirona (anafilaxia leve)",
    camilla: "Camilla 1 (Urgencias)",
    motivoLlegada: "Vómitos frecuentes desde anoche y decaimiento marcado",
    anamnesis: "Paciente canino macho entero. Presenta hiporexia de 48 hrs y 3 episodios de vómito bilioso con restos de hueso. Dolor a la palpación en epigastrio.",
    diagnostico: "Gastroenteritis aguda por indiscreción alimentaria / Deshidratación 5%",
  },
  {
    id: "pac-2",
    numeroFicha: 2,
    nombre: "Michi",
    especie: "Felino",
    raza: "Siamés",
    sexo: "Hembra",
    edad: "1 año y 8 meses",
    pesoAnteriorKg: 3.0,
    pesoKg: 3.1,
    tutor: "Valeria Ríos",
    telefonoTutor: "78198765",
    alergias: null,
    camilla: "Camilla 2 (Consultorio)",
    motivoLlegada: "Refuerzo anual Vacuna Triple Felina y control",
    anamnesis: "Felino clínicamente activo, apetito normal, sin antecedentes patológicos recientes. Viene por medicina preventiva.",
    diagnostico: "Control preventivo de rutina / Apto para inmunización",
  },
  {
    id: "pac-3",
    numeroFicha: 3,
    nombre: "Rocky",
    especie: "Canino",
    raza: "Pastor Alemán",
    sexo: "Macho",
    edad: "4 años",
    pesoAnteriorKg: 29.5,
    pesoKg: 29.5,
    tutor: "Juan José Mendoza",
    telefonoTutor: "76345678",
    alergias: null,
    camilla: "Camilla 3 (Post-quirúrgico)",
    motivoLlegada: "Revisión de herida quirúrgica y retiro de vendaje",
    anamnesis: "Revisión a 5 días de orquiectomía. Herida limpia, bordes afrontados, sin signos de seroma ni exudado.",
    diagnostico: "Evolución post-quirúrgica favorable",
  },
  {
    id: "pac-4",
    numeroFicha: 4,
    nombre: "Luna",
    especie: "Canino",
    raza: "Golden Retriever",
    sexo: "Hembra",
    edad: "2 años y 4 meses",
    pesoAnteriorKg: 26.0,
    pesoKg: 26.4,
    tutor: "María René Suárez",
    telefonoTutor: "75044332",
    alergias: "Sensible a penicilinas",
    camilla: "Camilla 4 (Dermatología)",
    motivoLlegada: "Dermatitis pruriginosa en zona dorsal y cola",
    anamnesis: "Prurito intenso de 1 semana de evolución. Eritema lumbosacro compatible con DAPP.",
    diagnostico: "Dermatitis alérgica por pulgas (DAPP) activa",
  },
  {
    id: "pac-5",
    numeroFicha: 5,
    nombre: "Max",
    especie: "Canino",
    raza: "Cocker Spaniel",
    sexo: "Macho",
    edad: "5 años",
    pesoAnteriorKg: 13.0,
    pesoKg: 13.2,
    tutor: "Andrea Vargas",
    telefonoTutor: "76011223",
    alergias: null,
    camilla: "Camilla 1 (Control)",
    motivoLlegada: "Otitis ceruminosa crónica en oído derecho",
    anamnesis: "Sacudidas constantes de cabeza, secreción negruzca con mal olor.",
    diagnostico: "Otitis externa eritemato-ceruminosa",
  },
];

const FARMACOS_PRESETS = [
  { 
    nombre: "Meloxicam 0.5% (5 mg/ml)", 
    dosisMgKg: 0.2, 
    concMgMl: 5.0, 
    via: "Subcutáneo (SC) c/24h", 
    tipo: "Antiinflamatorio / Analgésico", 
    precio: 25.00,
    lote: "MEL-2026-X" 
  },
  { 
    nombre: "Maropitant (Cerenia) 10 mg/ml", 
    dosisMgKg: 1.0, 
    concMgMl: 10.0, 
    via: "Subcutáneo (SC) dosis única", 
    tipo: "Antiemético para vómitos", 
    precio: 45.00,
    lote: "MAR-992" 
  },
  { 
    nombre: "Enrofloxacina 5% (50 mg/ml)", 
    dosisMgKg: 5.0, 
    concMgMl: 50.0, 
    via: "Subcutáneo (SC) c/24h", 
    tipo: "Antibiótico fluoroquinolona", 
    precio: 30.00,
    lote: "ENR-411" 
  },
  { 
    nombre: "Tramadol 50 mg/ml", 
    dosisMgKg: 2.0, 
    concMgMl: 50.0, 
    via: "Subcutáneo (SC) o IV lento", 
    tipo: "Analgésico moderado a severo", 
    precio: 35.00,
    lote: "TRM-089" 
  },
  { 
    nombre: "Ranitidina 25 mg/ml", 
    dosisMgKg: 2.0, 
    concMgMl: 25.0, 
    via: "Intravenoso lento (IV)", 
    tipo: "Protector gástrico H2", 
    precio: 20.00,
    lote: "RAN-120" 
  },
  { 
    nombre: "Metronidazol Oral (250mg/5ml)", 
    dosisMgKg: 15.0, 
    concMgMl: 50.0, 
    via: "Vía oral c/12h x 5 días", 
    tipo: "Antibacteriano / Giardicida", 
    precio: 35.00,
    lote: "MTZ-410" 
  },
  { 
    nombre: "Dipirona 500 mg/ml", 
    dosisMgKg: 25.0, 
    concMgMl: 500.0, 
    via: "Intravenoso / Intramuscular", 
    tipo: "Antipirético / Antiespasmódico", 
    precio: 15.00,
    lote: "DIP-332" 
  },
];

export default function ConsultaMedicaPage() {
  const router = useRouter();

  // Paciente Activo en Consulta
  const [pacienteIndex, setPacienteIndex] = useState(0);
  const pacienteActivo = PACIENTES_CAMILLA[pacienteIndex];

  // Constantes Fisiológicas
  const [peso, setPeso] = useState(pacienteActivo.pesoKg.toString());
  const [temperatura, setTemperatura] = useState("38.6");
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState("112");
  const [frecuenciaRespiratoria, setFrecuenciaRespiratoria] = useState("24");
  const [mucosas, setMucosas] = useState("Rosadas y húmedas");
  const [tllc, setTllc] = useState("< 2 segundos (Normal)");

  // Evolución Clínica
  const [anamnesis, setAnamnesis] = useState(pacienteActivo.anamnesis);
  const [hallazgosFisicos, setHallazgosFisicos] = useState("Abdomen tenso con dolor a la palpación en fosa gástrica. Ganglios palpables sin adenomegalia. Auscultación cardíaca sin soplos.");
  const [diagnostico, setDiagnostico] = useState(pacienteActivo.diagnostico);

  // Modales
  const [modalHistorial, setModalHistorial] = useState(false);
  const [modalAgregarFarmaco, setModalAgregarFarmaco] = useState(false);
  const [modalReceta, setModalReceta] = useState(false);
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [modalListaCamilla, setModalListaCamilla] = useState(false);
  const [busquedaCamilla, setBusquedaCamilla] = useState("");

  // Formulario Calculadora de Fármacos
  const [farmacoIndex, setFarmacoIndex] = useState(0);
  const farmacoSeleccionado = FARMACOS_PRESETS[farmacoIndex];
  const [dosisMgKg, setDosisMgKg] = useState(farmacoSeleccionado.dosisMgKg.toString());
  const [concentracionMgMl, setConcentracionMgMl] = useState(farmacoSeleccionado.concMgMl.toString());
  const [indicacionManual, setIndicacionManual] = useState(farmacoSeleccionado.via);
  const [esEnClinica, setEsEnClinica] = useState(true);

  // Lista de prescripciones en esta consulta
  const [prescripciones, setPrescripciones] = useState<Prescripcion[]>([
    {
      id: "rx-1",
      medicamento: "Maropitant (Cerenia) 10 mg/ml",
      lote: "MAR-992",
      dosis: "0.85 ml",
      indicacion: "Dosis única aplicada en camilla SC (1 mg/kg)",
      aplicadoEnClinica: true,
      precio: 45.00,
    },
    {
      id: "rx-2",
      medicamento: "Metronidazol Suspensión Oral (250mg/5ml)",
      lote: "MTZ-410",
      dosis: "1.7 ml cada 12 horas",
      indicacion: "Vía oral durante 5 días junto con alimento blando",
      aplicadoEnClinica: false,
      precio: 35.00,
    },
  ]);

  // Cambiar paciente
  const cambiarPaciente = (idx: number) => {
    setPacienteIndex(idx);
    const p = PACIENTES_CAMILLA[idx];
    setPeso(p.pesoKg.toString());
    setAnamnesis(p.anamnesis);
    setDiagnostico(p.diagnostico);
    setModalListaCamilla(false);
  };

  // Cálculo de dosis en vivo: Volumen = (Peso en kg * Dosis mg/kg) / Concentración mg/ml
  const volumenCalculadoMl = useMemo(() => {
    const p = parseFloat(peso) || 0;
    const d = parseFloat(dosisMgKg) || 0;
    const c = parseFloat(concentracionMgMl) || 1;
    if (c <= 0 || p <= 0 || d <= 0) return "0.00";
    return ((p * d) / c).toFixed(2);
  }, [peso, dosisMgKg, concentracionMgMl]);

  // Selección de fármaco del preset
  const seleccionarPreset = (idx: number) => {
    setFarmacoIndex(idx);
    const f = FARMACOS_PRESETS[idx];
    setDosisMgKg(f.dosisMgKg.toString());
    setConcentracionMgMl(f.concMgMl.toString());
    setIndicacionManual(f.via);
  };

  // Alerta de alergia si el fármaco seleccionado coincide con la alergia del paciente
  const esFarmacoAlergenico = useMemo(() => {
    if (!pacienteActivo.alergias) return false;
    const nombreF = farmacoSeleccionado.nombre.toLowerCase();
    const alergia = pacienteActivo.alergias.toLowerCase();
    if (alergia.includes("dipirona") && nombreF.includes("dipirona")) return true;
    if (alergia.includes("penicilina") && (nombreF.includes("penicilina") || nombreF.includes("amoxicilina"))) return true;
    return false;
  }, [farmacoSeleccionado, pacienteActivo.alergias]);

  const agregarPrescripcion = (e: React.FormEvent) => {
    e.preventDefault();
    if (esFarmacoAlergenico) {
      alert(`BLOQUEO DE SEGURIDAD: El paciente ${pacienteActivo.nombre} tiene registrada alergia crítica: ${pacienteActivo.alergias}`);
      return;
    }

    const nueva: Prescripcion = {
      id: `rx-${Date.now()}`,
      medicamento: farmacoSeleccionado.nombre,
      lote: farmacoSeleccionado.lote,
      dosis: `${volumenCalculadoMl} ml`,
      indicacion: indicacionManual,
      aplicadoEnClinica: esEnClinica,
      precio: farmacoSeleccionado.precio,
    };
    setPrescripciones([...prescripciones, nueva]);
    setModalAgregarFarmaco(false);
  };

  const eliminarPrescripcion = (id: string) => {
    setPrescripciones(prev => prev.filter(p => p.id !== id));
  };

  // Honorarios e importes
  const costoConsulta = 80.00;
  const subtotalFarmacos = prescripciones.reduce((acc, p) => acc + p.precio, 0);
  const totalOrden = costoConsulta + subtotalFarmacos;

  // Estado térmico según especie y temperatura
  const tempNum = parseFloat(temperatura) || 38.5;
  const estadoTemperatura = useMemo(() => {
    if (tempNum < 37.5) return { texto: "Hipotermia", color: "text-blue-600 bg-blue-50 border-blue-200" };
    if (tempNum > 39.2) return { texto: "Fiebre / Hipertermia", color: "text-red-600 bg-red-50 border-red-200" };
    return { texto: "Normotérmico", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  }, [tempNum]);

  // Filtrado de pacientes en camilla para el modal
  const pacientesCamillaFiltrados = useMemo(() => {
    if (!busquedaCamilla.trim()) return PACIENTES_CAMILLA;
    const q = busquedaCamilla.toLowerCase();
    return PACIENTES_CAMILLA.filter(p => 
      p.nombre.toLowerCase().includes(q) ||
      p.tutor.toLowerCase().includes(q) ||
      p.raza.toLowerCase().includes(q) ||
      p.camilla.toLowerCase().includes(q) ||
      p.numeroFicha.toString().includes(q)
    );
  }, [busquedaCamilla]);

  // Enviar receta formal por WhatsApp
  const enviarRecetaWhatsApp = () => {
    const celular = pacienteActivo.telefonoTutor.replace(/\D/g, "");
    const lineasRx = prescripciones.map((p, i) => `${i + 1}. *${p.medicamento}* - Dosis: ${p.dosis}\n   Indicación: ${p.indicacion}`).join("\n\n");
    const texto = encodeURIComponent(
      `Hola *${pacienteActivo.tutor}*, le saludamos de la *Clínica Veterinaria Central*.\n\nLe enviamos el resumen médico oficial de la atención de *${pacienteActivo.nombre}*:\n\n*Diagnóstico:* ${diagnostico}\n*Peso registrado:* ${peso} kg | *Temp:* ${temperatura} °C\n\n*PRESCRIPCIÓN MÉDICA (Rp/):*\n${lineasRx}\n\n*Total Atención:* Bs. ${totalOrden.toFixed(2)}\n\nMédico Tratante: Dr. Rodrigo Paz (SENASAG Nº 4819)`
    );
    window.open(`https://wa.me/591${celular}?text=${texto}`, "_blank");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Cabecera Clínica & Selector Escalable de Paciente */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            {pacienteActivo.especie === "Canino" ? (
              <Dog className="w-6 h-6 text-primary" />
            ) : (
              <Cat className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-foreground">{pacienteActivo.nombre}</h2>
              <Badge variant="outline" className="text-[10px] font-mono font-bold bg-muted">
                Ficha #{pacienteActivo.numeroFicha}
              </Badge>
              <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold">
                {pacienteActivo.camilla}
              </Badge>
              {pacienteActivo.alergias && (
                <Badge variant="destructive" className="text-[10px] gap-1 font-bold animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  {pacienteActivo.alergias}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pacienteActivo.especie} · {pacienteActivo.raza} · {pacienteActivo.sexo} · {pacienteActivo.edad}
            </p>
            <p className="text-xs text-muted-foreground">
              Tutor: <strong className="text-foreground">{pacienteActivo.tutor}</strong> (WhatsApp: +591 {pacienteActivo.telefonoTutor})
            </p>
          </div>
        </div>

        {/* Acciones de la Cabecera de Camilla */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Selector Desplegable Compacto y Escalable (hasta decenas de pacientes) */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={pacienteIndex}
                onChange={(e) => cambiarPaciente(parseInt(e.target.value))}
                className="h-10 sm:h-9 pl-8 pr-8 rounded-xl sm:rounded-lg border border-border bg-background text-base sm:text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer w-full sm:w-52 appearance-none truncate shadow-xs"
              >
                {PACIENTES_CAMILLA.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    #{p.numeroFicha} {p.nombre} ({p.camilla.split(" ")[0]})
                  </option>
                ))}
              </select>
              <Stethoscope className="w-4 h-4 text-primary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Botón para ver lista completa y llamar nuevos turnos */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalListaCamilla(true)}
              className="h-10 sm:h-9 px-3 text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer border-border gap-1 shrink-0"
              title="Ver panel completo de turnos en atención"
            >
              <ListFilter className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs font-bold text-primary">
                {PACIENTES_CAMILLA.length}
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalHistorial(true)}
              className="flex-1 sm:flex-initial gap-1 text-xs h-10 sm:h-9 font-semibold cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-primary" />
              Historial
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalReceta(true)}
              className="flex-1 sm:flex-initial gap-1 text-xs h-10 sm:h-9 font-semibold text-foreground border-border cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              Receta Rp/
            </Button>

            <Button
              size="sm"
              onClick={() => setModalFinalizar(true)}
              className="flex-1 sm:flex-initial gap-1.5 text-xs h-10 sm:h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finalizar (Bs. {totalOrden.toFixed(2)})
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Cuerpo Clínico Principal (Constantes Fisiológicas + Diagnóstico y Fármacos) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Columna Izquierda: Constantes Fisiológicas en Consulta (1 col) */}
        <Card className="shadow-xs border-border md:col-span-1">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-primary" />
                Constantes Fisiológicas
              </span>
              <span className="text-[10px] text-emerald-600 font-mono font-bold">Camilla Activa</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Peso */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Peso Actual en Camilla (kg) *
              </label>
              <div className="relative">
                <Input
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  className="font-bold text-base h-11 sm:h-10 pr-9 font-mono text-primary"
                />
                <span className="absolute right-3 top-3 sm:top-2.5 text-xs text-muted-foreground font-semibold">kg</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
                <span>Anterior: {pacienteActivo.pesoAnteriorKg} kg</span>
                <span className="font-mono text-amber-600 font-semibold">
                  Diff: {(parseFloat(peso) - pacienteActivo.pesoAnteriorKg).toFixed(2)} kg
                </span>
              </p>
            </div>

            {/* Temperatura */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  Temperatura (°C)
                </label>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${estadoTemperatura.color}`}>
                  {estadoTemperatura.texto}
                </span>
              </div>
              <div className="relative">
                <Input
                  value={temperatura}
                  onChange={(e) => setTemperatura(e.target.value)}
                  className="h-10 sm:h-9 pr-9 text-base sm:text-xs font-mono font-bold"
                />
                <span className="absolute right-3 top-2.5 sm:top-2 text-xs text-muted-foreground font-semibold">°C</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Rango normal: 38.0 - 39.2 °C</p>
            </div>

            {/* Frecuencia Cardíaca */}
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                Frecuencia Cardíaca (LPM)
              </label>
              <Input
                value={frecuenciaCardiaca}
                onChange={(e) => setFrecuenciaCardiaca(e.target.value)}
                className="h-10 sm:h-9 text-base sm:text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">Normal: 70 - 140 LPM en caninos</p>
            </div>

            {/* Frecuencia Respiratoria */}
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                <Wind className="w-3.5 h-3.5 text-sky-500" />
                Frecuencia Respiratoria (RPM)
              </label>
              <Input
                value={frecuenciaRespiratoria}
                onChange={(e) => setFrecuenciaRespiratoria(e.target.value)}
                className="h-10 sm:h-9 text-base sm:text-xs font-mono"
              />
            </div>

            {/* Mucosas y TLLC */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Mucosas
                </label>
                <select
                  value={mucosas}
                  onChange={(e) => setMucosas(e.target.value)}
                  className="w-full h-10 sm:h-8 rounded-lg sm:rounded-md border border-input bg-background px-2 text-base sm:text-[11px]"
                >
                  <option value="Rosadas y húmedas">Rosadas (Normal)</option>
                  <option value="Pálidas">Pálidas (Anemia/Shock)</option>
                  <option value="Cianóticas">Cianóticas (Hipoxia)</option>
                  <option value="Ictéricas">Ictéricas (Hepatopatía)</option>
                  <option value="Congestivas">Congestivas</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  TLLC
                </label>
                <select
                  value={tllc}
                  onChange={(e) => setTllc(e.target.value)}
                  className="w-full h-10 sm:h-8 rounded-lg sm:rounded-md border border-input bg-background px-2 text-base sm:text-[11px]"
                >
                  <option value="< 2 seg (Normal)">&lt; 2 seg (Normal)</option>
                  <option value="> 2 seg (Deshidratado)">&gt; 2 seg (Deshidratación)</option>
                  <option value="Inmediato (< 1 seg)">Inmediato (&lt; 1 seg)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Columna Derecha: Anamnesis, Diagnóstico y Prescripción Farmacológica (2 cols) */}
        <div className="space-y-6 md:col-span-2">
          {/* Tarjeta de Anamnesis y Diagnóstico */}
          <Card className="shadow-xs border-border">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" />
                Anamnesis & Diagnóstico Clínico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Motivo & Anamnesis Referida por el Tutor
                </label>
                <textarea
                  className="w-full text-base sm:text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary min-h-[65px] leading-relaxed"
                  value={anamnesis}
                  onChange={(e) => setAnamnesis(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Hallazgos al Examen Físico (Palpación / Auscultación)
                </label>
                <Input
                  value={hallazgosFisicos}
                  onChange={(e) => setHallazgosFisicos(e.target.value)}
                  className="text-base sm:text-xs h-10 sm:h-9"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Diagnóstico Presuntivo / Definitivo *
                </label>
                <Input
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  className="text-base sm:text-xs h-10 sm:h-9 font-bold text-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta de Prescripción y Descuento en Camilla */}
          <Card className="shadow-xs border-border">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" />
                  Prescripción & Aplicación en Camilla
                </CardTitle>
                <CardDescription className="text-xs">
                  Los fármacos aplicados en consulta descuentan el lote de farmacia automáticamente.
                </CardDescription>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalAgregarFarmaco(true)}
                className="text-xs h-8 gap-1.5 text-primary border-primary/30 font-semibold hover:bg-primary/5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Medicamento
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {prescripciones.length === 0 ? (
                <div className="p-6 text-center border border-dashed rounded-xl bg-muted/20">
                  <Pill className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">
                    No se han registrado medicamentos en esta atención.
                  </p>
                </div>
              ) : (
                prescripciones.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground">{p.medicamento}</span>
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          Lote: {p.lote}
                        </span>
                        {p.aplicadoEnClinica ? (
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold">
                            Aplicado en camilla
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-sky-50 text-sky-700 border-sky-300 font-semibold">
                            Receta para casa
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        Dosis: <strong className="text-foreground">{p.dosis}</strong> · {p.indicacion}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-emerald-600 font-mono text-sm">
                        Bs. {p.precio.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => eliminarPrescripcion(p.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-red-600 cursor-pointer"
                        title="Eliminar prescripción"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}

              {/* Totalizador de la Consulta */}
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between text-xs gap-2">
                <span className="text-muted-foreground">
                  Honorarios de Consulta: <strong>Bs. {costoConsulta.toFixed(2)}</strong> + Fármacos e insumos: <strong>Bs. {subtotalFarmacos.toFixed(2)}</strong>
                </span>
                <span className="font-bold text-sm text-foreground">
                  Total Orden: <span className="text-primary font-mono font-extrabold text-base">Bs. {totalOrden.toFixed(2)}</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL 0: Panel Completo de Turnos en Camilla (Escalable para 5, 10 o 20 pacientes) */}
      <Dialog open={modalListaCamilla} onOpenChange={setModalListaCamilla}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Stethoscope className="w-5 h-5 text-primary" />
                Pacientes en Atención Clínica ({PACIENTES_CAMILLA.length})
              </DialogTitle>
              <Badge variant="outline" className="font-mono text-xs">
                {PACIENTES_CAMILLA.length} activos
              </Badge>
            </div>
            <DialogDescription className="text-xs">
              Seleccione el paciente para cargar su ficha en camilla sin saturar la barra de herramientas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar por paciente, ficha, raza, tutor o camilla..."
                value={busquedaCamilla}
                onChange={(e) => setBusquedaCamilla(e.target.value)}
                className="pl-9 h-10 sm:h-9 text-base sm:text-xs"
              />
            </div>

            <div className="space-y-2">
              {pacientesCamillaFiltrados.map((p) => {
                const indexReal = PACIENTES_CAMILLA.findIndex(item => item.id === p.id);
                const esActivo = pacienteIndex === indexReal;

                return (
                  <div
                    key={p.id}
                    onClick={() => cambiarPaciente(indexReal)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      esActivo
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        esActivo ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        #{p.numeroFicha}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">{p.nombre}</h4>
                          <span className="text-[11px] text-muted-foreground font-mono">({p.pesoKg} kg)</span>
                          {p.alergias && (
                            <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                              Alergia
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {p.especie} · {p.raza} · Tutor: {p.tutor}
                        </p>
                        <p className="text-[10px] text-primary font-medium mt-0.5">
                          {p.camilla} · Motivo: {p.motivoLlegada}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {esActivo ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                          <Check className="w-3.5 h-3.5" /> En Camilla
                        </span>
                      ) : (
                        <Button size="sm" variant="outline" className="text-xs h-8 text-muted-foreground">
                          Atender
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 1: Historial Previo de Consultas */}
      <Dialog open={modalHistorial} onOpenChange={setModalHistorial}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <History className="w-5 h-5 text-primary" />
              Historial Clínico: {pacienteActivo.nombre}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Atenciones previas registradas en la clínica
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-80 overflow-y-auto">
            <div className="p-3 rounded-xl border border-border bg-card space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">15/09/2026 · Control Dermatológico</span>
                <Badge variant="secondary" className="text-[10px]">Dr. Rodrigo Paz</Badge>
              </div>
              <p className="text-muted-foreground">
                Peso registrado: 8.7 kg · Diagnóstico: Dermatitis alérgica por picadura de pulga (DAPP).
              </p>
              <p className="text-[11px] text-primary font-medium">
                Tratamiento: Bravecto Masticable + Shampoo de Clorhexidina.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border bg-card space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">10/03/2026 · Refuerzo Anual Vacunación</span>
                <Badge variant="secondary" className="text-[10px]">Dra. Mariana Suárez</Badge>
              </div>
              <p className="text-muted-foreground">
                Peso: 8.4 kg · Aplicación de Séxtuple Vanguard Plus (Lote VG-4412).
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button size="sm" onClick={() => setModalHistorial(false)} className="text-xs w-full sm:w-auto h-10 sm:h-8">
              Cerrar Historial
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Calculadora de Dosis por Peso & Agregar Fármaco */}
      <Dialog open={modalAgregarFarmaco} onOpenChange={setModalAgregarFarmaco}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Calculator className="w-5 h-5 text-primary" />
              Calculadora de Dosis Pediátrica y Adulta
            </DialogTitle>
            <DialogDescription className="text-xs">
              Cálculo farmacológico automático para <strong>{pacienteActivo.nombre}</strong> ({peso} kg).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={agregarPrescripcion} className="space-y-4 py-2">
            {/* Alerta de Seguridad si hay alergia */}
            {esFarmacoAlergenico && (
              <div className="p-3 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-2 animate-bounce">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>
                  ¡CONTRAINDICACIÓN CRÍTICA! Paciente alérgico a este fármaco ({pacienteActivo.alergias}).
                </span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Fármaco / Principio Activo
              </label>
              <select
                value={farmacoIndex}
                onChange={(e) => seleccionarPreset(parseInt(e.target.value))}
                className="w-full h-10 sm:h-9 rounded-lg border border-input bg-background px-3 text-base sm:text-xs focus:ring-1 focus:ring-primary"
              >
                {FARMACOS_PRESETS.map((f, i) => (
                  <option key={i} value={i}>
                    {f.nombre} · {f.tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Dosis Terapéutica (mg/kg)
                </label>
                <Input
                  value={dosisMgKg}
                  onChange={(e) => setDosisMgKg(e.target.value)}
                  className="h-10 sm:h-9 text-base sm:text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Concentración (mg/ml)
                </label>
                <Input
                  value={concentracionMgMl}
                  onChange={(e) => setConcentracionMgMl(e.target.value)}
                  className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                />
              </div>
            </div>

            {/* Fórmula y Resultado de Dosificación */}
            <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Volumen a Administrar:</span>
                <span className="font-mono font-black text-xl text-primary">
                  {volumenCalculadoMl} ml
                </span>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">
                Fórmula: ({peso} kg × {dosisMgKg} mg/kg) ÷ {concentracionMgMl} mg/ml = {volumenCalculadoMl} ml
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Vía de Administración / Posología
              </label>
              <Input
                value={indicacionManual}
                onChange={(e) => setIndicacionManual(e.target.value)}
                className="h-10 sm:h-9 text-base sm:text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="chk-camilla-aplica"
                checked={esEnClinica}
                onChange={(e) => setEsEnClinica(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <label htmlFor="chk-camilla-aplica" className="text-xs font-medium text-foreground cursor-pointer select-none">
                Aplicar directamente en camilla (descontar de farmacia)
              </label>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalAgregarFarmaco(false)} className="h-10 sm:h-8 w-full sm:w-auto">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                disabled={esFarmacoAlergenico}
                className="bg-primary text-primary-foreground font-semibold px-4 cursor-pointer disabled:opacity-50 h-10 sm:h-8 w-full sm:w-auto"
              >
                Agregar a la Orden
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Receta Médica Oficial (Rp/) para Impresión o Envío */}
      <Dialog open={modalReceta} onOpenChange={setModalReceta}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <FileText className="w-5 h-5 text-primary" />
                Receta Médica Veterinaria (Rp/)
              </DialogTitle>
              <Badge variant="outline" className="font-mono text-[10px]">
                SENASAG Nº 4819
              </Badge>
            </div>
            <DialogDescription className="text-xs">
              Documento clínico oficial con posología e indicaciones para el tutor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 border rounded-xl p-4 bg-white dark:bg-card text-foreground">
            {/* Membrete Oficial */}
            <div className="text-center pb-3 border-b border-border space-y-0.5">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-primary">
                Clínica Veterinaria Central
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Dr. Rodrigo Paz · Médico Veterinario Zootecnista (UAGRM)
              </p>
              <p className="text-[10px] font-mono text-muted-foreground">
                Reg. SENASAG Nº 4819 · Santa Cruz de la Sierra, Bolivia
              </p>
            </div>

            {/* Datos Paciente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-muted/20 p-2.5 rounded-lg border border-border">
              <div>
                <span>Paciente: <strong>{pacienteActivo.nombre}</strong> ({pacienteActivo.especie})</span>
                <span className="block text-[11px] text-muted-foreground">Peso: {peso} kg</span>
              </div>
              <div>
                <span>Tutor: <strong>{pacienteActivo.tutor}</strong></span>
                <span className="block text-[11px] text-muted-foreground">Fecha: 21/11/2026</span>
              </div>
            </div>

            {/* Lista Rp/ */}
            <div className="space-y-3 py-2">
              <span className="font-serif italic font-bold text-lg text-primary block">Rp/</span>
              {prescripciones.map((p, i) => (
                <div key={p.id} className="text-xs space-y-1 pl-3 border-l-2 border-primary/40">
                  <p className="font-bold text-foreground">
                    {i + 1}. {p.medicamento}
                  </p>
                  <p className="text-muted-foreground font-medium">
                    Dosificación: <strong>{p.dosis}</strong>
                  </p>
                  <p className="text-foreground/80 text-[11px]">
                    Indicaciones: {p.indicacion}
                  </p>
                </div>
              ))}
            </div>

            {/* Firma */}
            <div className="pt-6 text-center text-xs text-muted-foreground border-t border-dashed border-border">
              <div className="w-40 border-b border-foreground/40 mx-auto mb-1"></div>
              <p className="font-bold text-foreground">Dr. Rodrigo Paz</p>
              <p className="text-[10px] font-mono">Firma y Sello Profesional</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={enviarRecetaWhatsApp}
              className="text-xs gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer h-10 sm:h-8"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              Enviar por WhatsApp
            </Button>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="text-xs gap-1.5 cursor-pointer flex-1 sm:flex-initial h-10 sm:h-8"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir
              </Button>
              <Button
                size="sm"
                onClick={() => setModalReceta(false)}
                className="bg-primary text-primary-foreground text-xs font-semibold px-4 cursor-pointer flex-1 sm:flex-initial h-10 sm:h-8"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: Finalizar Consulta & Pasar a Cobro en POS */}
      <Dialog open={modalFinalizar} onOpenChange={setModalFinalizar}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              Concluir Atención Médica
            </DialogTitle>
            <DialogDescription className="text-xs">
              Se guardará la evolución clínica y se generará la orden de cobro en caja.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-muted/30 rounded-xl space-y-2 text-xs border border-border">
            <div className="flex justify-between font-medium">
              <span>Honorarios de Consulta:</span>
              <span className="font-mono">Bs. {costoConsulta.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Fármacos e Insumos ({prescripciones.length}):</span>
              <span className="font-mono">Bs. {subtotalFarmacos.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between font-bold text-sm text-foreground">
              <span>Total a Liquidar:</span>
              <span className="text-primary font-mono font-extrabold text-base">Bs. {totalOrden.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={enviarRecetaWhatsApp}
              className="w-full sm:flex-1 text-xs h-10 sm:h-9 gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-semibold cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              Enviar a WhatsApp
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setModalFinalizar(false);
                router.push("/pos");
              }}
              className="w-full sm:flex-1 text-xs h-10 sm:h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer gap-1.5"
            >
              Cobrar en POS
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
