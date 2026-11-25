"use client";

import { useState } from "react";
import { 
  Settings, 
  Building2, 
  Stethoscope, 
  QrCode, 
  MessageSquare, 
  Save, 
  CheckCircle2,
  ShieldCheck,
  Receipt,
  FileText,
  Phone,
  Database,
  Download,
  Upload,
  RotateCcw,
  Percent,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ConfiguracionPage() {
  const [tabActiva, setTabActiva] = useState<"GENERAL" | "SENASAG" | "CAJA" | "WHATSAPP" | "BACKUP">("GENERAL");

  // 1. Datos de la Clínica
  const [nombreClinica, setNombreClinica] = useState("Clínica Veterinaria Central");
  const [razonSocial, setRazonSocial] = useState("Veterinaria Central S.R.L.");
  const [ciudad, setCiudad] = useState("Santa Cruz de la Sierra");
  const [departamento, setDepartamento] = useState("Santa Cruz");
  const [direccion, setDireccion] = useState("Av. Cristo Redentor entre 3er y 4to Anillo #240");
  const [nit, setNit] = useState("1029384021");
  const [telefonoWhatsApp, setTelefonoWhatsApp] = useState("77012345");
  const [emailContacto, setEmailContacto] = useState("contacto@veterinariacentral.bo");

  // 2. Registro Profesional & SENASAG
  const [veterinarioPrincipal, setVeterinarioPrincipal] = useState("Dr. Rodrigo Paz");
  const [especialidad, setEspecialidad] = useState("Médico Veterinario Zootecnista (UAGRM)");
  const [matriculaComvet, setMatriculaComvet] = useState("COMVET-SC 1840");
  const [matriculaSenasag, setMatriculaSenasag] = useState("SENASAG Nº 4819-SC");
  const [permisoPsicotropicos, setPermisoPsicotropicos] = useState("RESOLUCION-SENASAG-2025/084");

  // 3. Tarifario & POS
  const [costoConsultaGeneral, setCostoConsultaGeneral] = useState("80.00");
  const [costoUrgenciaNocturna, setCostoUrgenciaNocturna] = useState("140.00");
  const [limiteCreditoDefault, setLimiteCreditoDefault] = useState("1000.00");
  const [anchoTicket, setAnchoTicket] = useState<"80mm" | "58mm">("80mm");
  const [pieTicket, setPieTicket] = useState("Gracias por confiar en nosotros la salud de su mascota.");

  // 4. Plantillas de WhatsApp
  const [plantillaTurno, setPlantillaTurno] = useState(
    "Hola *{tutor}*, le informamos de la Clínica Veterinaria que ya es el turno de su mascota *{paciente}* (Ficha *#{ficha}*). Por favor pase a recepción / camilla."
  );
  const [plantillaReceta, setPlantillaReceta] = useState(
    "Hola *{tutor}*, le compartimos el resumen médico oficial de la atención de *{paciente}*:\n\n*Diagnóstico:* {diagnostico}\n*Tratamiento (Rp/):* {receta}\n\n*Total Atención:* Bs. {total}\n\nMédico Tratante: {veterinario} ({senasag})"
  );
  const [plantillaVacuna, setPlantillaVacuna] = useState(
    "Estimado/a *{tutor}*, le saludamos de la Clínica Veterinaria. Le recordamos cordialmente que a su mascota *{paciente}* le corresponde su refuerzo de vacuna *{vacuna}* el día *{fecha}*. Agende su turno para mantener su inmunidad activa."
  );
  const [plantillaDeuda, setPlantillaDeuda] = useState(
    "Estimado/a *{tutor}*, le saludamos de la Clínica Veterinaria. Le recordamos cordialmente que mantiene un saldo pendiente de *Bs. {monto}* por servicios brindados a sus mascotas. Puede cancelarlo mediante QR Simple o en caja en nuestra recepción. ¡Muchas gracias!"
  );

  // Notificación de Guardado
  const [guardado, setGuardado] = useState(false);

  const guardarConfiguracion = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  // Exportar backup local en JSON
  const exportarDatosJSON = () => {
    const backupData = {
      clinica: {
        nombre: nombreClinica,
        nit,
        ciudad,
        telefono: telefonoWhatsApp,
        veterinario: veterinarioPrincipal,
        senasag: matriculaSenasag,
      },
      tarifas: {
        consultaGeneral: costoConsultaGeneral,
        urgencia: costoUrgenciaNocturna,
        limiteCredito: limiteCreditoDefault,
      },
      exportadoEn: new Date().toISOString(),
      version: "1.0.0-bolivia-mvp"
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-vetcontrol-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Configuración del Sistema Clínico
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Datos legales para facturación y recibos, acreditaciones SENASAG, parámetros de caja y plantillas de WhatsApp.
          </p>
        </div>

        {guardado && (
          <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 text-xs font-semibold animate-pulse w-full sm:w-auto justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Configuración guardada en memoria local!</span>
          </div>
        )}
      </div>

      {/* 2. Pestañas de Navegación de Configuración */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border no-scrollbar">
        {[
          { id: "GENERAL", label: "Establecimiento & Legal", icon: Building2 },
          { id: "SENASAG", label: "Acreditación SENASAG", icon: ShieldCheck },
          { id: "CAJA", label: "Tarifario & Mostrador POS", icon: Receipt },
          { id: "WHATSAPP", label: "Plantillas WhatsApp", icon: MessageSquare },
          { id: "BACKUP", label: "Copia de Seguridad & Datos", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = tabActiva === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg text-xs font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Contenido de las Pestañas */}
      <form onSubmit={guardarConfiguracion} className="space-y-6">
        {/* PESTAÑA 1: Establecimiento & Legal */}
        {tabActiva === "GENERAL" && (
          <Card className="shadow-xs border-border">
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary shrink-0" />
                Datos del Establecimiento Veterinario
              </CardTitle>
              <CardDescription className="text-xs">
                Esta información encabeza los recibos de caja (80mm), comprobantes de abono y carnets sanitarios digitales.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-4 sm:pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Nombre Comercial *
                  </label>
                  <Input 
                    value={nombreClinica} 
                    onChange={(e) => setNombreClinica(e.target.value)} 
                    required 
                    className="h-10 sm:h-9 text-base sm:text-xs" 
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Razón Social / Titular Legal
                  </label>
                  <Input 
                    value={razonSocial} 
                    onChange={(e) => setRazonSocial(e.target.value)} 
                    className="h-10 sm:h-9 text-base sm:text-xs" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    NIT / Registro Tributario *
                  </label>
                  <Input 
                    value={nit} 
                    onChange={(e) => setNit(e.target.value)} 
                    required 
                    className="h-10 sm:h-9 text-base sm:text-xs font-mono font-bold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Ciudad *
                  </label>
                  <Input 
                    value={ciudad} 
                    onChange={(e) => setCiudad(e.target.value)} 
                    required 
                    className="h-10 sm:h-9 text-base sm:text-xs" 
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Departamento
                  </label>
                  <select
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full h-10 sm:h-9 rounded-md border border-input bg-background px-2.5 text-base sm:text-xs focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="La Paz">La Paz</option>
                    <option value="Tarija">Tarija</option>
                    <option value="Chuquisaca">Chuquisaca</option>
                    <option value="Oruro">Oruro</option>
                    <option value="Beni">Beni</option>
                    <option value="Pando">Pando</option>
                    <option value="Potosí">Potosí</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Dirección Física Completa
                  </label>
                  <Input 
                    value={direccion} 
                    onChange={(e) => setDireccion(e.target.value)} 
                    className="h-10 sm:h-9 text-base sm:text-xs" 
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Teléfono WhatsApp de Atención (+591) *
                  </label>
                  <Input 
                    value={telefonoWhatsApp} 
                    onChange={(e) => setTelefonoWhatsApp(e.target.value)} 
                    required 
                    className="h-10 sm:h-9 text-base sm:text-xs font-mono font-bold" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PESTAÑA 2: Acreditación SENASAG & Profesional */}
        {tabActiva === "SENASAG" && (
          <Card className="shadow-xs border-border">
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                Acreditación Profesional & Registro SENASAG
              </CardTitle>
              <CardDescription className="text-xs">
                Obligatorio para la validez de las recetas médicas veterinarias (Rp/) y la custodia legal del Libro de Controlados (Ketamina, Anestésicos).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-4 sm:pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Médico Veterinario Responsable (Director Técnico) *
                  </label>
                  <Input 
                    value={veterinarioPrincipal} 
                    onChange={(e) => setVeterinarioPrincipal(e.target.value)} 
                    required 
                    className="h-10 sm:h-9 text-base sm:text-xs font-bold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Título / Especialidad Profesional
                  </label>
                  <Input 
                    value={especialidad} 
                    onChange={(e) => setEspecialidad(e.target.value)} 
                    className="h-10 sm:h-9 text-base sm:text-xs" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Nº Matrícula SENASAG *
                  </label>
                  <Input 
                    value={matriculaSenasag} 
                    onChange={(e) => setMatriculaSenasag(e.target.value)} 
                    required 
                    className="h-10 sm:h-9 text-base sm:text-xs font-mono font-bold text-primary" 
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Colegio Médico Veterinario (COMVET)
                  </label>
                  <Input 
                    value={matriculaComvet} 
                    onChange={(e) => setMatriculaComvet(e.target.value)} 
                    className="h-10 sm:h-9 text-base sm:text-xs font-mono" 
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Resolución Psicotrópicos / Estupefacientes
                  </label>
                  <Input 
                    value={permisoPsicotropicos} 
                    onChange={(e) => setPermisoPsicotropicos(e.target.value)} 
                    className="h-10 sm:h-9 text-base sm:text-xs font-mono" 
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-foreground flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-purple-600 shrink-0" />
                <p>
                  Estos datos se plasman con firma y sello automático en la emisión de recetas médicas oficiales y en el encabezado legal del <strong>Libro de Registro de Sustancias Controladas</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PESTAÑA 3: Tarifario & POS */}
        {tabActiva === "CAJA" && (
          <Card className="shadow-xs border-border">
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary shrink-0" />
                Parámetros de Caja & Punto de Venta (POS)
              </CardTitle>
              <CardDescription className="text-xs">
                Tarifas base por defecto en bolivianos, formato del comprobante térmico y políticas de crédito a clientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-4 sm:pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Consulta Médica General (Bs.) *
                  </label>
                  <Input 
                    type="number"
                    step="5"
                    value={costoConsultaGeneral} 
                    onChange={(e) => setCostoConsultaGeneral(e.target.value)} 
                    required 
                    className="h-10 sm:h-9 text-base sm:text-xs font-mono font-bold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Consulta Urgencia Nocturna (Bs.) *
                  </label>
                  <Input 
                    type="number"
                    step="5"
                    value={costoUrgenciaNocturna} 
                    onChange={(e) => setCostoUrgenciaNocturna(e.target.value)} 
                    required 
                    className="h-10 sm:h-9 text-base sm:text-xs font-mono font-bold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Límite Crédito por Defecto (Bs.)
                  </label>
                  <Input 
                    type="number"
                    step="50"
                    value={limiteCreditoDefault} 
                    onChange={(e) => setLimiteCreditoDefault(e.target.value)} 
                    className="h-10 sm:h-9 text-base sm:text-xs font-mono" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Formato de Impresora Térmica
                  </label>
                  <select
                    value={anchoTicket}
                    onChange={(e) => setAnchoTicket(e.target.value as any)}
                    className="w-full h-10 sm:h-9 rounded-md border border-input bg-background px-2.5 text-base sm:text-xs focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="80mm">Rollo Térmico 80 mm (Estándar)</option>
                    <option value="58mm">Rollo Térmico 58 mm (Compacto)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Mensaje al Pie del Ticket
                  </label>
                  <Input 
                    value={pieTicket} 
                    onChange={(e) => setPieTicket(e.target.value)} 
                    className="h-10 sm:h-9 text-base sm:text-xs" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PESTAÑA 4: Plantillas de WhatsApp */}
        {tabActiva === "WHATSAPP" && (
          <Card className="shadow-xs border-border">
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                Plantillas de Mensajes WhatsApp para Tutores
              </CardTitle>
              <CardDescription className="text-xs">
                Personalice los mensajes pre-redactados que el sistema dispara al WhatsApp del tutor con 1 click. Variables disponibles: <code className="bg-muted px-1 rounded text-primary">{`{tutor}`}</code>, <code className="bg-muted px-1 rounded text-primary">{`{paciente}`}</code>, <code className="bg-muted px-1 rounded text-primary">{`{ficha}`}</code>, <code className="bg-muted px-1 rounded text-primary">{`{total}`}</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-4 sm:pt-6">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  1. Notificación de Llamado a Turno / Camilla (Sala de Espera)
                </label>
                <textarea
                  value={plantillaTurno}
                  onChange={(e) => setPlantillaTurno(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary min-h-[70px] leading-relaxed font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  2. Receta Médica & Resumen de Atención
                </label>
                <textarea
                  value={plantillaReceta}
                  onChange={(e) => setPlantillaReceta(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary min-h-[90px] leading-relaxed font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  3. Recordatorio de Vacuna Próxima a Vencer
                </label>
                <textarea
                  value={plantillaVacuna}
                  onChange={(e) => setPlantillaVacuna(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary min-h-[70px] leading-relaxed font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  4. Recordatorio Cordial de Cuenta Pendiente / Fiado
                </label>
                <textarea
                  value={plantillaDeuda}
                  onChange={(e) => setPlantillaDeuda(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary min-h-[70px] leading-relaxed font-mono"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* PESTAÑA 5: Copia de Seguridad & Datos */}
        {tabActiva === "BACKUP" && (
          <Card className="shadow-xs border-border">
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Database className="w-4 h-4 text-primary shrink-0" />
                Copia de Seguridad & Estado Local
              </CardTitle>
              <CardDescription className="text-xs">
                Exporte o descargue una copia completa de los expedientes, catálogo de fármacos y cuentas en formato JSON estándar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-4 sm:pt-6">
              <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Exportar Copia de Seguridad (JSON)</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Descarga un archivo con toda la configuración, pacientes, stock de lotes y cuentas corrientes registradas.
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={exportarDatosJSON}
                  className="text-xs h-10 sm:h-9 gap-1.5 cursor-pointer font-semibold shrink-0 active:scale-95 transition-transform w-full sm:w-auto"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  Descargar Respaldo JSON
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    Restablecer Datos Iniciales de Fábrica
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Vuelve a cargar los pacientes de muestra (Toby, Michi, Luna, Rocky) y el stock inicial de farmacia.
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => alert("Los datos iniciales de prueba están activos en memoria.")}
                  className="text-xs h-10 sm:h-9 gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-300 dark:border-amber-800 cursor-pointer font-semibold shrink-0 active:scale-95 transition-transform w-full sm:w-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Recargar Mocks
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barra Inferior con Botón Guardar */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-muted-foreground text-center sm:text-left">
            Los parámetros se aplican de forma inmediata en la emisión de tickets, recetas y módulos clínicos.
          </p>

          <Button 
            type="submit" 
            className="gap-2 text-xs h-11 sm:h-9 bg-primary text-primary-foreground font-semibold px-5 cursor-pointer shadow-xs active:scale-[0.98] transition-transform w-full sm:w-auto"
          >
            <Save className="w-4 h-4" />
            Guardar Configuración
          </Button>
        </div>
      </form>
    </div>
  );
}
