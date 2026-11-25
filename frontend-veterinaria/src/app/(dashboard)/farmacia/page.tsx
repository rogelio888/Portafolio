"use client";

import { useState, useMemo } from "react";
import { 
  Pill, 
  Search, 
  Plus, 
  AlertTriangle, 
  ShieldAlert, 
  ThermometerSnowflake, 
  PackageOpen, 
  Layers, 
  Clock,
  FileText,
  CheckCircle2,
  Printer,
  ArrowDownRight,
  ArrowUpRight,
  Edit,
  SlidersHorizontal,
  History,
  Check,
  ShieldCheck,
  XCircle,
  TrendingDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface FarmacoItem {
  id: string;
  nombreComercial: string;
  principioActivo: string;
  categoria: "MEDICAMENTO" | "MEDICAMENTO_CONTROLADO" | "BIOLOGICO_VACUNA" | "COMPRIMIDOS" | "ALIMENTO_GRANEL";
  unidadCompra: string;
  unidadMinima: string;
  factorConversion: number;
  precioUnidadMin: number;
  precioFrasco: number;
  lote: string;
  vencimiento: string;
  diasParaVencer: number;
  stockMinimo: number; // Stock en UMA
  controlado: boolean;
  refrigeracion: boolean;
  ubicacion: string;
}

export interface RegistroSenasag {
  id: string;
  fecha: string;
  farmaco: string;
  lote: string;
  paciente: string;
  especie: string;
  tutor: string;
  dosisAplicada: string;
  motivoProcedimiento: string;
  saldoRestante: string;
  veterinario: string;
  matriculaSenasag: string;
}

const INVENTARIO_INICIAL: FarmacoItem[] = [
  {
    id: "prod-1",
    nombreComercial: "Ketamina 10% Inyectable (50 ml)",
    principioActivo: "Ketamina Clorhidrato 100 mg/ml",
    categoria: "MEDICAMENTO_CONTROLADO",
    unidadCompra: "Frasco 50 ml",
    unidadMinima: "ml",
    factorConversion: 50,
    precioUnidadMin: 3.50,
    precioFrasco: 150.00,
    lote: "KT-9024",
    vencimiento: "05/12/2026",
    diasParaVencer: 14,
    stockMinimo: 18.5,
    controlado: true,
    refrigeracion: false,
    ubicacion: "Armario de Seguridad con Llave",
  },
  {
    id: "prod-2",
    nombreComercial: "Vacuna Séxtuple Canina Vanguard Plus",
    principioActivo: "Antígeno DHPPI + Leptospira Canicola/Icterohaemorrhagiae",
    categoria: "BIOLOGICO_VACUNA",
    unidadCompra: "Dosis monodosis c/diluyente",
    unidadMinima: "dosis",
    factorConversion: 1,
    precioUnidadMin: 85.00,
    precioFrasco: 85.00,
    lote: "VG-2026-B",
    vencimiento: "18/01/2027",
    diasParaVencer: 58,
    stockMinimo: 24,
    controlado: false,
    refrigeracion: true,
    ubicacion: "Refrigerador Clínico Nº 1 (Bandeja A)",
  },
  {
    id: "prod-3",
    nombreComercial: "Amoxicilina + Ácido Clavulánico (250 mg)",
    principioActivo: "Amoxicilina 200mg + Ac. Clavulánico 50mg",
    categoria: "COMPRIMIDOS",
    unidadCompra: "Caja de 20 comprimidos",
    unidadMinima: "tableta",
    factorConversion: 20,
    precioUnidadMin: 6.00,
    precioFrasco: 100.00,
    lote: "AMX-812",
    vencimiento: "28/12/2026",
    diasParaVencer: 37,
    stockMinimo: 14,
    controlado: false,
    refrigeracion: false,
    ubicacion: "Estante 2 - Antibióticos",
  },
  {
    id: "prod-4",
    nombreComercial: "Meloxicam Gotas 0.5% (Frasco 10 ml)",
    principioActivo: "Meloxicam 5 mg/ml",
    categoria: "MEDICAMENTO",
    unidadCompra: "Frasco gotero 10 ml",
    unidadMinima: "ml",
    factorConversion: 10,
    precioUnidadMin: 4.50,
    precioFrasco: 40.00,
    lote: "MLX-101",
    vencimiento: "14/09/2027",
    diasParaVencer: 297,
    stockMinimo: 65.0,
    controlado: false,
    refrigeracion: false,
    ubicacion: "Estante 1 - AINEs",
  },
  {
    id: "prod-5",
    nombreComercial: "Alimento Pro Plan Puppy Razas Medianas 15kg",
    principioActivo: "Alimento balanceado Súper Premium para cachorros",
    categoria: "ALIMENTO_GRANEL",
    unidadCompra: "Bolsa sellada 15 kg",
    unidadMinima: "kg",
    factorConversion: 15,
    precioUnidadMin: 32.00,
    precioFrasco: 440.00,
    lote: "LOTE-GRANEL-15K",
    vencimiento: "15/06/2027",
    diasParaVencer: 571,
    stockMinimo: 3.2,
    controlado: false,
    refrigeracion: false,
    ubicacion: "Contenedor de Mostrador Nº 2",
  },
  {
    id: "prod-6",
    nombreComercial: "Tramadol Clorhidrato 50 mg/ml Inyectable",
    principioActivo: "Tramadol Clorhidrato 50 mg/ml",
    categoria: "MEDICAMENTO_CONTROLADO",
    unidadCompra: "Frasco ampolla 20 ml",
    unidadMinima: "ml",
    factorConversion: 20,
    precioUnidadMin: 5.00,
    precioFrasco: 85.00,
    lote: "TRM-402",
    vencimiento: "10/05/2027",
    diasParaVencer: 535,
    stockMinimo: 16.5,
    controlado: true,
    refrigeracion: false,
    ubicacion: "Armario de Seguridad con Llave",
  },
];

const REGISTROS_SENASAG_INICIAL: RegistroSenasag[] = [
  {
    id: "sen-1",
    fecha: "20/11/2026 11:20",
    farmaco: "Ketamina 10% (KT-9024)",
    lote: "KT-9024",
    paciente: "Toby",
    especie: "Canino (Poodle)",
    tutor: "Carlos Justiniano (CI 6234901 SC)",
    dosisAplicada: "0.85 ml (85 mg)",
    motivoProcedimiento: "Sujeción química para lavado gástrico y ecografía",
    saldoRestante: "18.50 ml en frasco",
    veterinario: "Dr. Rodrigo Paz",
    matriculaSenasag: "SENASAG Nº 4819",
  },
  {
    id: "sen-2",
    fecha: "18/11/2026 16:45",
    farmaco: "Tramadol 50 mg/ml (TRM-402)",
    lote: "TRM-402",
    paciente: "Rocky",
    especie: "Canino (Pastor Alemán)",
    tutor: "Juan José Mendoza (CI 4920199 LP)",
    dosisAplicada: "1.20 ml (60 mg)",
    motivoProcedimiento: "Analgesia post-quirúrgica inmediata orquiectomía",
    saldoRestante: "16.50 ml en frasco",
    veterinario: "Dr. Rodrigo Paz",
    matriculaSenasag: "SENASAG Nº 4819",
  },
  {
    id: "sen-3",
    fecha: "12/11/2026 10:15",
    farmaco: "Ketamina 10% (KT-9024)",
    lote: "KT-9024",
    paciente: "Simba",
    especie: "Felino (Mestizo)",
    tutor: "Lorena Arteaga (CI 8102941 SC)",
    dosisAplicada: "0.30 ml (30 mg)",
    motivoProcedimiento: "Anestesia disociativa para desbridamiento de absceso facial",
    saldoRestante: "19.35 ml en frasco",
    veterinario: "Dr. Rodrigo Paz",
    matriculaSenasag: "SENASAG Nº 4819",
  },
];

export default function ModuloFarmacia() {
  const [inventario, setInventario] = useState<FarmacoItem[]>(INVENTARIO_INICIAL);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("TODOS");

  // Modales
  const [modalNuevoLote, setModalNuevoLote] = useState(false);
  const [modalLibroSenasag, setModalLibroSenasag] = useState(false);
  const [modalAperturaBolsa, setModalAperturaBolsa] = useState(false);
  const [productoApertura, setProductoApertura] = useState<FarmacoItem | null>(null);
  const [modalKardex, setModalKardex] = useState(false);
  const [productoKardex, setProductoKardex] = useState<FarmacoItem | null>(null);
  const [modalAjusteStock, setModalAjusteStock] = useState(false);
  const [productoAjuste, setProductoAjuste] = useState<FarmacoItem | null>(null);
  const [cantidadAjuste, setCantidadAjuste] = useState("");
  const [motivoAjuste, setMotivoAjuste] = useState("Ajuste por recuento físico");

  // Formulario Nuevo Producto / Lote
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoPrincipio, setNuevoPrincipio] = useState("");
  const [nuevaCat, setNuevaCat] = useState<FarmacoItem["categoria"]>("MEDICAMENTO");
  const [nuevaUnidadCompra, setNuevaUnidadCompra] = useState("Frasco 50 ml");
  const [nuevaUnidadMin, setNuevaUnidadMin] = useState("ml");
  const [nuevoFactor, setNuevoFactor] = useState("50");
  const [nuevoLoteCodigo, setNuevoLoteCodigo] = useState("");
  const [nuevaFechaVenc, setNuevaFechaVenc] = useState("2027-06-30");
  const [nuevoStockInicial, setNuevoStockInicial] = useState("");
  const [nuevoPrecioCompra, setNuevoPrecioCompra] = useState("");
  const [nuevoPrecioVentaMin, setNuevoPrecioVentaMin] = useState("");
  const [nuevoPrecioCerrado, setNuevoPrecioCerrado] = useState("");
  const [esControlado, setEsControlado] = useState(false);
  const [esRefrigerado, setEsRefrigerado] = useState(false);
  const [nuevaUbicacion, setNuevaUbicacion] = useState("Estante Principal");

  // Apertura de bolsa para granel
  const confirmarAperturaBolsa = () => {
    if (!productoApertura) return;
    setInventario(prev => prev.map(item => {
      if (item.id === productoApertura.id) {
        return {
          ...item,
          stockMinimo: item.stockMinimo + item.factorConversion,
        };
      }
      return item;
    }));
    setModalAperturaBolsa(false);
    setProductoApertura(null);
  };

  // Guardar nuevo lote / producto
  const guardarNuevoLote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevoLoteCodigo.trim()) return;

    const dias = Math.max(1, Math.round((new Date(nuevaFechaVenc).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    const nuevo: FarmacoItem = {
      id: `prod-${Date.now()}`,
      nombreComercial: nuevoNombre.trim(),
      principioActivo: nuevoPrincipio.trim() || "No especificado",
      categoria: esControlado ? "MEDICAMENTO_CONTROLADO" : nuevaCat,
      unidadCompra: nuevaUnidadCompra.trim(),
      unidadMinima: nuevaUnidadMin.trim(),
      factorConversion: parseFloat(nuevoFactor) || 1,
      precioUnidadMin: parseFloat(nuevoPrecioVentaMin) || 1.0,
      precioFrasco: parseFloat(nuevoPrecioCerrado) || 10.0,
      lote: nuevoLoteCodigo.trim().toUpperCase(),
      vencimiento: nuevaFechaVenc,
      diasParaVencer: dias,
      stockMinimo: parseFloat(nuevoStockInicial) || 0,
      controlado: esControlado,
      refrigeracion: esRefrigerado,
      ubicacion: nuevaUbicacion.trim() || "Almacén Central",
    };

    setInventario([nuevo, ...inventario]);
    setModalNuevoLote(false);

    // Reset
    setNuevoNombre("");
    setNuevoPrincipio("");
    setNuevoLoteCodigo("");
    setNuevoStockInicial("");
    setNuevoPrecioVentaMin("");
    setNuevoPrecioCerrado("");
    setEsControlado(false);
    setEsRefrigerado(false);
  };

  // Ajustar stock
  const aplicarAjusteStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoAjuste) return;
    const nuevoValor = parseFloat(cantidadAjuste);
    if (isNaN(nuevoValor) || nuevoValor < 0) return;

    setInventario(prev => prev.map(p => 
      p.id === productoAjuste.id ? { ...p, stockMinimo: nuevoValor } : p
    ));
    setModalAjusteStock(false);
    setProductoAjuste(null);
  };

  // Filtrado reactivo
  const filtrados = useMemo(() => {
    return inventario.filter(item => {
      const q = busqueda.toLowerCase().trim();
      const coincideBusqueda = 
        !q ||
        item.nombreComercial.toLowerCase().includes(q) ||
        item.principioActivo.toLowerCase().includes(q) ||
        item.lote.toLowerCase().includes(q) ||
        item.ubicacion.toLowerCase().includes(q);

      if (!coincideBusqueda) return false;

      if (filtroCategoria === "CONTROLADOS") return item.controlado;
      if (filtroCategoria === "REFRIGERADOS") return item.refrigeracion;
      if (filtroCategoria === "VENCIMIENTOS") return item.diasParaVencer <= 60;
      if (filtroCategoria === "ALIMENTO") return item.categoria === "ALIMENTO_GRANEL";
      return true;
    });
  }, [inventario, busqueda, filtroCategoria]);

  // Métricas
  const totalLotes = inventario.length;
  const lotesCriticos = inventario.filter(i => i.diasParaVencer <= 30).length;
  const lotesControlados = inventario.filter(i => i.controlado).length;
  const dosisRefrigeradas = inventario.filter(i => i.refrigeracion).reduce((acc, i) => acc + i.stockMinimo, 0);

  return (
    <div className="space-y-6">
      {/* 1. Cabecera y Acciones Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Pill className="w-6 h-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Farmacia Veterinaria & Almacén de Lotes
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Control de dosis fraccionadas (ml, tabletas, kg a granel), semáforo FEFO y libro oficial SENASAG.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-col sm:flex-row w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setModalLibroSenasag(true)}
            className="w-full sm:w-auto gap-2 text-xs h-11 sm:h-9 font-semibold text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 hover:bg-purple-50 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            Libro SENASAG
          </Button>

          <Button 
            size="sm"
            onClick={() => setModalNuevoLote(true)}
            className="w-full sm:w-auto gap-2 text-xs h-11 sm:h-9 bg-primary text-primary-foreground font-semibold cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Registrar Fármaco / Lote
          </Button>
        </div>
      </div>

      {/* 2. Tarjetas de Alerta Rápida y Auditoría de Almacén */}
      <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Total Catálogo Activo</p>
            <p className="text-xl font-bold font-mono text-foreground mt-0.5">{totalLotes} ítems</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border shadow-xs flex items-center justify-between transition-all ${
          lotesCriticos > 0 ? "border-red-500/40 bg-red-50/30 dark:bg-red-950/20" : "border-border bg-card"
        }`}>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Lotes Críticos FEFO (&lt; 30d)</p>
            <p className={`text-xl font-bold font-mono mt-0.5 ${
              lotesCriticos > 0 ? "text-red-600 dark:text-red-400 font-extrabold" : "text-foreground"
            }`}>
              {lotesCriticos} por vencer
            </p>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            lotesCriticos > 0 ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground"
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-50/20 dark:bg-purple-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Sustancias Controladas</p>
            <p className="text-xl font-bold font-mono text-purple-700 dark:text-purple-300 mt-0.5">
              {lotesControlados} anestésicos
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-sky-500/30 bg-sky-50/20 dark:bg-sky-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Cadena de Frío (2°C - 8°C)</p>
            <p className="text-xl font-bold font-mono text-sky-700 dark:text-sky-300 mt-0.5">
              {dosisRefrigeradas} dosis
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
            <ThermometerSnowflake className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filtros y Buscador Universal */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-card border border-border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input 
            placeholder="Buscar por marca, principio activo, lote o ubicación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1 hidden sm:inline">
            Filtrar:
          </span>
          {[
            { id: "TODOS", label: `Todos (${inventario.length})` },
            { id: "VENCIMIENTOS", label: "Por Vencer (<60d)" },
            { id: "CONTROLADOS", label: "SENASAG Controlados" },
            { id: "REFRIGERADOS", label: "Cadena de Frío" },
            { id: "ALIMENTO", label: "Granel" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroCategoria(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filtroCategoria === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tabla de Existencias, Lotes FEFO y Acciones */}
      <Card className="shadow-xs border-border">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Catálogo Activo & Existencias Fraccionadas (UMA)
              </CardTitle>
              <CardDescription className="text-xs">
                El sistema descuenta automáticamente los lotes más próximos a vencer al recetar en camilla o cobrar en caja (Regla FEFO).
              </CardDescription>
            </div>
            <span className="text-xs font-mono text-muted-foreground font-semibold">
              {filtrados.length} resultados
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* VISTA MÓVIL: Tarjetas Táctiles (< md) */}
          <div className="md:hidden divide-y divide-border p-3 space-y-3">
            {filtrados.length === 0 ? (
              <p className="text-center py-8 text-xs text-muted-foreground">
                No se encontraron fármacos o lotes que coincidan con la búsqueda.
              </p>
            ) : (
              filtrados.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl border border-border bg-card space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{item.nombreComercial}</span>
                        {item.controlado && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-purple-50 text-purple-700 border-purple-300 font-bold">
                            SENASAG
                          </Badge>
                        )}
                        {item.refrigeracion && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-sky-50 text-sky-700 border-sky-300 font-semibold">
                            Frío 2-8°C
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.principioActivo}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                      {item.lote}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-xl border border-border">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-medium">Stock Fraccionado:</span>
                      <strong className="text-sm font-mono text-foreground font-extrabold">
                        {item.stockMinimo.toFixed(1)} {item.unidadMinima}
                      </strong>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        {item.unidadCompra}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground block font-medium">Precios (Bs.):</span>
                      <strong className="text-sm font-mono text-emerald-600 block">
                        Bs. {item.precioUnidadMin.toFixed(2)} / {item.unidadMinima}
                      </strong>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Bs. {item.precioFrasco.toFixed(2)} cerrado
                      </span>
                    </div>
                  </div>

                  {/* Estado FEFO & Ubicación */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div>
                      {item.diasParaVencer <= 30 ? (
                        <Badge variant="destructive" className="text-[10px] h-5 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Vence en {item.diasParaVencer}d ({item.vencimiento})
                        </Badge>
                      ) : item.diasParaVencer <= 60 ? (
                        <Badge variant="outline" className="text-[10px] h-5 text-amber-800 border-amber-300 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40 font-semibold">
                          <Clock className="w-3 h-3" /> Vence en {item.diasParaVencer}d
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Vence: {item.vencimiento}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-primary truncate max-w-[140px]">
                      {item.ubicacion}
                    </span>
                  </div>

                  {/* Botones de Acción Táctiles */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border">
                    {item.categoria === "ALIMENTO_GRANEL" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setProductoApertura(item);
                          setModalAperturaBolsa(true);
                        }}
                        className="text-xs h-9 gap-1 text-primary border-primary/30 hover:bg-primary/5 cursor-pointer font-semibold flex-1"
                      >
                        <PackageOpen className="w-3.5 h-3.5" />
                        Abrir Bolsa (+{item.factorConversion}kg)
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setProductoKardex(item);
                        setModalKardex(true);
                      }}
                      className="text-xs h-9 text-muted-foreground hover:text-foreground cursor-pointer px-3 flex-1"
                    >
                      <History className="w-3.5 h-3.5 text-primary" />
                      Kardex
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setProductoAjuste(item);
                        setCantidadAjuste(item.stockMinimo.toString());
                        setModalAjusteStock(true);
                      }}
                      className="text-xs h-9 text-muted-foreground hover:text-foreground cursor-pointer px-3 flex-1"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Ajustar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* VISTA ESCRITORIO: Tabla Completa (>= md) */}
          <div className="hidden md:block">
            <Table className="w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-bold text-foreground w-[25%]">Producto & Presentación</TableHead>
                <TableHead className="text-xs font-bold text-foreground w-[21%]">Principio Activo & Ubicación</TableHead>
                <TableHead className="text-xs font-bold text-foreground w-[17%]">Lote & Semáforo FEFO</TableHead>
                <TableHead className="text-xs font-bold text-foreground w-[13%]">Stock Fraccionado (UMA)</TableHead>
                <TableHead className="text-xs font-bold text-foreground w-[11%]">Precios (Bs.)</TableHead>
                <TableHead className="text-xs font-bold text-foreground w-[13%] text-right">Acciones Operativas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filtrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                      No se encontraron fármacos o lotes que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtrados.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      {/* Columna 1: Producto */}
                      <TableCell className="py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-foreground">{item.nombreComercial}</span>
                            {item.controlado && (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-purple-50 text-purple-700 border-purple-300 font-bold">
                                SENASAG
                              </Badge>
                            )}
                            {item.refrigeracion && (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-sky-50 text-sky-700 border-sky-300 font-semibold">
                                Frío 2-8°C
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Presentación: <strong className="text-foreground">{item.unidadCompra}</strong> (1 = {item.factorConversion} {item.unidadMinima})
                          </p>
                        </div>
                      </TableCell>

                      {/* Columna 2: Principio Activo y Ubicación */}
                      <TableCell className="py-3 text-xs">
                        <p className="text-muted-foreground font-medium">{item.principioActivo}</p>
                        <p className="text-[10px] text-primary font-mono mt-0.5">{item.ubicacion}</p>
                      </TableCell>

                      {/* Columna 3: Lote y FEFO */}
                      <TableCell className="py-3">
                        <div className="space-y-1">
                          <span className="font-mono text-xs font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">
                            {item.lote}
                          </span>
                          <div>
                            {item.diasParaVencer <= 30 ? (
                              <Badge variant="destructive" className="text-[10px] h-4 font-bold flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3" /> Vence en {item.diasParaVencer}d ({item.vencimiento})
                              </Badge>
                            ) : item.diasParaVencer <= 60 ? (
                              <Badge variant="outline" className="text-[10px] h-4 text-amber-800 border-amber-300 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40 font-semibold w-fit">
                                <Clock className="w-3 h-3" /> Vence en {item.diasParaVencer}d
                              </Badge>
                            ) : (
                              <span className="text-[11px] text-muted-foreground font-mono">
                                Venc: {item.vencimiento}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Columna 4: Stock Fraccionado */}
                      <TableCell className="py-3">
                        <div className="space-y-0.5">
                          <span className="font-bold font-mono text-sm text-foreground">
                            {item.stockMinimo.toFixed(1)} {item.unidadMinima}
                          </span>
                          {item.stockMinimo <= 3 && item.unidadMinima === "kg" && (
                            <p className="text-[10px] text-red-600 font-bold animate-pulse flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" /> Bolsa por agotarse
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Columna 5: Precios */}
                      <TableCell className="py-3">
                        <div className="text-xs space-y-0.5">
                          <p className="font-bold text-emerald-600 font-mono">
                            Bs. {item.precioUnidadMin.toFixed(2)} / {item.unidadMinima}
                          </p>
                          <p className="text-muted-foreground text-[10px] font-mono">
                            Bs. {item.precioFrasco.toFixed(2)} cerrado
                          </p>
                        </div>
                      </TableCell>

                      {/* Columna 6: Acciones */}
                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.categoria === "ALIMENTO_GRANEL" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setProductoApertura(item);
                                setModalAperturaBolsa(true);
                              }}
                              className="text-[11px] h-7 gap-1 text-primary border-primary/30 hover:bg-primary/5 cursor-pointer font-semibold"
                            >
                              <PackageOpen className="w-3 h-3" />
                              Abrir Bolsa (+{item.factorConversion}kg)
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setProductoKardex(item);
                              setModalKardex(true);
                            }}
                            className="text-[11px] h-7 text-muted-foreground hover:text-foreground cursor-pointer px-2"
                            title="Ver Kardex de movimientos de este lote"
                          >
                            <History className="w-3 h-3 text-primary" />
                            Kardex
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setProductoAjuste(item);
                              setCantidadAjuste(item.stockMinimo.toString());
                              setModalAjusteStock(true);
                            }}
                            className="text-[11px] h-7 text-muted-foreground hover:text-foreground cursor-pointer px-2"
                            title="Ajustar stock por merma o inventario"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            Ajustar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 5. MODAL: Registrar Fármaco & Lote Inicial */}
      <Dialog open={modalNuevoLote} onOpenChange={setModalNuevoLote}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Pill className="w-5 h-5 text-primary" />
              Registrar Fármaco / Nuevo Lote en Farmacia
            </DialogTitle>
            <DialogDescription className="text-xs">
              Ingrese los datos de catálogo, presentación de compra, factor de fraccionamiento y caducidad.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={guardarNuevoLote} className="space-y-3.5 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Nombre Comercial del Producto *
                </label>
                <Input 
                  placeholder="ej. Cefalexina 500 mg"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  required
                  className="h-10 sm:h-9 text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Categoría *
                </label>
                <select 
                  value={nuevaCat}
                  onChange={(e) => setNuevaCat(e.target.value as any)}
                  className="w-full h-10 sm:h-9 rounded-lg border border-input bg-background px-3 text-base sm:text-xs focus:ring-1 focus:ring-primary"
                >
                  <option value="MEDICAMENTO">Inyectable / Solución</option>
                  <option value="COMPRIMIDOS">Comprimidos / Tabletas</option>
                  <option value="BIOLOGICO_VACUNA">Biológico / Vacuna</option>
                  <option value="ALIMENTO_GRANEL">Alimento a Granel</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Principio Activo & Concentración
              </label>
              <Input 
                placeholder="ej. Cefalexina Monohidrato 500 mg"
                value={nuevoPrincipio}
                onChange={(e) => setNuevoPrincipio(e.target.value)}
                className="h-10 sm:h-9 text-base sm:text-xs"
              />
            </div>

            {/* Fraccionamiento y Unidades */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-muted/30 border border-border">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Unidad de Compra
                </label>
                <Input 
                  placeholder="ej. Caja de 20 comp."
                  value={nuevaUnidadCompra}
                  onChange={(e) => setNuevaUnidadCompra(e.target.value)}
                  className="h-10 sm:h-9 text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Unidad Mínima (UMA)
                </label>
                <select 
                  value={nuevaUnidadMin}
                  onChange={(e) => setNuevaUnidadMin(e.target.value)}
                  className="w-full h-10 sm:h-9 rounded-lg border border-input bg-background px-3 text-base sm:text-xs"
                >
                  <option value="ml">ml (Inyectable / Jarabe)</option>
                  <option value="tableta">tableta (Pastillas)</option>
                  <option value="dosis">dosis (Monodosis)</option>
                  <option value="kg">kg (Alimento en balanza)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Factor Conversión
                </label>
                <Input 
                  type="number"
                  placeholder="ej. 20"
                  value={nuevoFactor}
                  onChange={(e) => setNuevoFactor(e.target.value)}
                  className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                />
              </div>
            </div>

            {/* Lote y Vencimiento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Código de Lote *
                </label>
                <Input 
                  placeholder="ej. CFX-2026-09"
                  value={nuevoLoteCodigo}
                  onChange={(e) => setNuevoLoteCodigo(e.target.value)}
                  required
                  className="h-10 sm:h-9 text-base sm:text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Fecha de Vencimiento *
                </label>
                <Input 
                  type="date"
                  value={nuevaFechaVenc}
                  onChange={(e) => setNuevaFechaVenc(e.target.value)}
                  required
                  className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                />
              </div>
            </div>

            {/* Stock y Precios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Stock Inicial (en {nuevaUnidadMin}) *
                </label>
                <Input 
                  type="number"
                  step="0.1"
                  placeholder="ej. 40"
                  value={nuevoStockInicial}
                  onChange={(e) => setNuevoStockInicial(e.target.value)}
                  required
                  className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Precio Venta / {nuevaUnidadMin} (Bs.)
                </label>
                <Input 
                  type="number"
                  step="0.5"
                  placeholder="ej. 5.00"
                  value={nuevoPrecioVentaMin}
                  onChange={(e) => setNuevoPrecioVentaMin(e.target.value)}
                  required
                  className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Precio Empaque Cerrado (Bs.)
                </label>
                <Input 
                  type="number"
                  step="1"
                  placeholder="ej. 90.00"
                  value={nuevoPrecioCerrado}
                  onChange={(e) => setNuevoPrecioCerrado(e.target.value)}
                  required
                  className="h-10 sm:h-9 text-base sm:text-xs font-mono"
                />
              </div>
            </div>

            {/* Ubicación y Flags Regulatorios */}
            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Ubicación en Farmacia
                </label>
                <Input 
                  placeholder="ej. Estante 2 - Bandeja B"
                  value={nuevaUbicacion}
                  onChange={(e) => setNuevaUbicacion(e.target.value)}
                  className="h-10 sm:h-9 text-base sm:text-xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="chk-controlado-reg"
                    checked={esControlado}
                    onChange={(e) => setEsControlado(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                  />
                  <label htmlFor="chk-controlado-reg" className="text-xs font-semibold text-purple-700 dark:text-purple-300 cursor-pointer select-none">
                    Sustancia Controlada (SENASAG)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="chk-refrigerado-reg"
                    checked={esRefrigerado}
                    onChange={(e) => setEsRefrigerado(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer accent-sky-600"
                  />
                  <label htmlFor="chk-refrigerado-reg" className="text-xs font-semibold text-sky-700 dark:text-sky-300 cursor-pointer select-none">
                    Cadena de Frío (2°C - 8°C)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalNuevoLote(false)} className="h-10 sm:h-8 w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold px-4 cursor-pointer h-10 sm:h-8 w-full sm:w-auto">
                Registrar en Inventario
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. MODAL: Libro Oficial SENASAG de Sustancias Controladas (Dualidad Móvil / Desktop) */}
      <Dialog open={modalLibroSenasag} onOpenChange={setModalLibroSenasag}>
        <DialogContent className="sm:max-w-6xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-purple-700 dark:text-purple-300">
                <ShieldAlert className="w-5 h-5 text-purple-600" />
                Libro Oficial de Sustancias Controladas (SENASAG)
              </DialogTitle>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono text-[10px] sm:text-xs px-2.5 py-1 font-bold">
                SENASAG Nº 4819
              </Badge>
            </div>
            <DialogDescription className="text-xs">
              Registro legal obligatorio de ingresos, egresos y dosis de ketamina y psicotrópicos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-bold text-sm">Establecimiento: Clínica Veterinaria Central</p>
                <p className="text-muted-foreground">Responsable Técnico: Dr. Rodrigo Paz (Médico Veterinario - UAGRM)</p>
              </div>
              <div className="text-left sm:text-right font-mono text-[11px] text-muted-foreground">
                <p>Santa Cruz de la Sierra, Bolivia</p>
                <p className="font-semibold text-purple-700 dark:text-purple-300">Auditoría: 21/11/2026</p>
              </div>
            </div>

            {/* Vista Móvil: Tarjetas de Registros SENASAG */}
            <div className="md:hidden space-y-3">
              {REGISTROS_SENASAG_INICIAL.map((reg) => (
                <div key={reg.id} className="p-3 rounded-xl border border-border bg-card space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm">{reg.farmaco}</span>
                    <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Lote: {reg.lote}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-lg border border-border">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Paciente & Tutor:</span>
                      <strong className="text-foreground">{reg.paciente}</strong> ({reg.especie})
                      <span className="text-[10px] text-muted-foreground block">{reg.tutor}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground block">Dosis & Saldo:</span>
                      <span className="font-mono font-bold text-purple-700 dark:text-purple-400 block">
                        {reg.dosisAplicada}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Saldo: {reg.saldoRestante}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Motivo: <strong className="text-foreground/90">{reg.motivoProcedimiento}</strong>
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-border text-[10px] text-muted-foreground font-mono">
                    <span>{reg.fecha}</span>
                    <span className="text-primary font-bold">{reg.veterinario} ({reg.matriculaSenasag})</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista Escritorio: Tabla SENASAG */}
            <div className="hidden md:block border border-border rounded-xl bg-card overflow-hidden">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-muted/40 text-[11px] hover:bg-muted/40">
                    <TableHead className="font-bold w-[13%]">Fecha / Hora</TableHead>
                    <TableHead className="font-bold w-[17%]">Fármaco & Lote</TableHead>
                    <TableHead className="font-bold w-[20%]">Paciente & Tutor</TableHead>
                    <TableHead className="font-bold w-[26%]">Dosis & Procedimiento</TableHead>
                    <TableHead className="font-bold w-[12%]">Saldo Frasco</TableHead>
                    <TableHead className="font-bold w-[12%]">Médico Firmante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {REGISTROS_SENASAG_INICIAL.map((reg) => (
                    <TableRow key={reg.id} className="text-xs hover:bg-muted/20">
                      <TableCell className="font-mono text-[11px] font-semibold align-top py-3 whitespace-normal">
                        {reg.fecha}
                      </TableCell>
                      <TableCell className="align-top py-3 whitespace-normal">
                        <p className="font-bold text-foreground">{reg.farmaco}</p>
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                          Lote: {reg.lote}
                        </span>
                      </TableCell>
                      <TableCell className="align-top py-3 whitespace-normal">
                        <p className="font-bold text-foreground">{reg.paciente} ({reg.especie})</p>
                        <span className="text-[11px] text-muted-foreground">{reg.tutor}</span>
                      </TableCell>
                      <TableCell className="align-top py-3 whitespace-normal">
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded text-[11px] inline-block mb-1">
                          {reg.dosisAplicada}
                        </span>
                        <p className="text-[11px] text-muted-foreground leading-snug">{reg.motivoProcedimiento}</p>
                      </TableCell>
                      <TableCell className="align-top py-3 whitespace-normal">
                        <span className="font-mono text-foreground font-bold text-[11px] block">
                          {reg.saldoRestante}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium">Verificado en balanza</span>
                      </TableCell>
                      <TableCell className="align-top py-3 text-[11px] whitespace-normal">
                        <p className="font-semibold text-foreground">{reg.veterinario}</p>
                        <span className="font-mono text-[10px] text-primary font-bold">{reg.matriculaSenasag}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Total salidas registradas este mes: <strong>3 aplicaciones auditadas</strong>
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.print()}
                className="flex-1 sm:flex-initial text-xs gap-1.5 cursor-pointer font-semibold h-10 sm:h-8"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir Folio Oficial
              </Button>
              <Button 
                size="sm" 
                onClick={() => setModalLibroSenasag(false)}
                className="flex-1 sm:flex-initial bg-primary text-primary-foreground text-xs font-semibold px-4 cursor-pointer h-10 sm:h-8"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 7. MODAL: Apertura de Bolsa para Alimento a Granel */}
      <Dialog open={modalAperturaBolsa} onOpenChange={setModalAperturaBolsa}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <PackageOpen className="w-5 h-5 text-primary" />
              Abrir Bolsa para Venta a Granel
            </DialogTitle>
            <DialogDescription className="text-xs">
              Descuenta 1 bolsa sellada de almacén y añade los kilos netos al mostrador.
            </DialogDescription>
          </DialogHeader>

          {productoApertura && (
            <div className="space-y-4 py-2">
              <div className="p-3.5 bg-muted/40 rounded-xl space-y-2 text-xs border border-border">
                <p className="text-foreground">
                  <strong>Producto:</strong> {productoApertura.nombreComercial}
                </p>
                <p className="text-muted-foreground font-mono">
                  Lote: {productoApertura.lote} · Vence: {productoApertura.vencimiento}
                </p>
                <div className="pt-2 border-t border-border grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Stock actual:</span>
                    <strong className="text-sm font-mono text-foreground">{productoApertura.stockMinimo.toFixed(1)} kg</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Nuevo stock:</span>
                    <strong className="text-sm font-mono text-emerald-600">
                      {(productoApertura.stockMinimo + productoApertura.factorConversion).toFixed(1)} kg
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setModalAperturaBolsa(false)} className="h-10 sm:h-8 w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  onClick={confirmarAperturaBolsa}
                  className="bg-primary text-primary-foreground font-semibold px-4 cursor-pointer h-10 sm:h-8 w-full sm:w-auto"
                >
                  Confirmar Apertura (+{productoApertura.factorConversion} kg)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 8. MODAL: Kardex de Movimientos del Lote */}
      <Dialog open={modalKardex} onOpenChange={setModalKardex}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <History className="w-5 h-5 text-primary" />
              Kardex de Movimientos: {productoKardex?.nombreComercial}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Historial de ingresos por compra, aplicaciones en camilla y ventas en mostrador.
            </DialogDescription>
          </DialogHeader>

          {productoKardex && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 bg-muted/30 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Lote: {productoKardex.lote}</p>
                  <p className="text-muted-foreground text-[11px]">Vencimiento: {productoKardex.vencimiento}</p>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-[10px]">Saldo Actual:</span>
                  <strong className="font-mono text-sm text-primary">
                    {productoKardex.stockMinimo.toFixed(1)} {productoKardex.unidadMinima}
                  </strong>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-foreground">Ingreso por Compra a Proveedor</p>
                      <span className="text-[10px] text-muted-foreground font-mono">10/11/2026 · Factura Nº 9840</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-600">+50.0 {productoKardex.unidadMinima}</span>
                </div>

                <div className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="font-semibold text-foreground">Salida por Consulta en Camilla (Toby)</p>
                      <span className="text-[10px] text-muted-foreground font-mono">20/11/2026 · Dr. Rodrigo Paz</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-red-600">-0.85 {productoKardex.unidadMinima}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <Button size="sm" onClick={() => setModalKardex(false)} className="text-xs w-full sm:w-auto h-10 sm:h-8">
                  Cerrar Kardex
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 9. MODAL: Ajuste de Stock / Merma */}
      <Dialog open={modalAjusteStock} onOpenChange={setModalAjusteStock}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              Ajuste de Stock / Declaración de Merma
            </DialogTitle>
            <DialogDescription className="text-xs">
              Modifique el stock físico con justificación para auditoría de almacén.
            </DialogDescription>
          </DialogHeader>

          {productoAjuste && (
            <form onSubmit={aplicarAjusteStock} className="space-y-3.5 py-2">
              <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs">
                <p className="font-bold text-foreground">{productoAjuste.nombreComercial}</p>
                <p className="text-muted-foreground">Lote: {productoAjuste.lote} · Stock actual: {productoAjuste.stockMinimo} {productoAjuste.unidadMinima}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Nuevo Stock Físico Verificado ({productoAjuste.unidadMinima}) *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={cantidadAjuste}
                  onChange={(e) => setCantidadAjuste(e.target.value)}
                  required
                  className="h-10 sm:h-9 text-base sm:text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Motivo del Ajuste *
                </label>
                <select
                  value={motivoAjuste}
                  onChange={(e) => setMotivoAjuste(e.target.value)}
                  className="w-full h-10 sm:h-9 rounded-lg border border-input bg-background px-3 text-base sm:text-xs"
                >
                  <option value="Ajuste por recuento físico">Ajuste por recuento físico periódico</option>
                  <option value="Merma por rotura de frasco">Merma por rotura / caída de frasco</option>
                  <option value="Descarte por caducidad">Descarte por caducidad vencida</option>
                  <option value="Corrección de ingreso erróneo">Corrección de registro erróneo inicial</option>
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="ghost" size="sm" onClick={() => setModalAjusteStock(false)} className="h-10 sm:h-8 w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold px-4 cursor-pointer h-10 sm:h-8 w-full sm:w-auto">
                  Guardar Ajuste
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
