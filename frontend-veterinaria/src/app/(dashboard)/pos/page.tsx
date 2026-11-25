"use client";

import { useState } from "react";
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  QrCode, 
  Banknote, 
  CreditCard, 
  User, 
  Printer, 
  CheckCircle2, 
  Weight, 
  AlertCircle,
  Receipt,
  Package,
  Pill,
  Sparkles,
  Tag,
  Building2,
  Calendar,
  MessageCircle,
  Stethoscope,
  Barcode,
  Percent,
  ArrowRight,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PRODUCTOS_MOCK_POS, TUTORES_MOCK, ProductoPOS, TutorMock } from "@/lib/mock-data";

interface ItemCarrito {
  id: string;
  producto: ProductoPOS;
  cantidad: number;
  subtotal: number;
}

interface OrdenConsultaPendiente {
  id: string;
  paciente: string;
  ficha: number;
  tutor: string;
  telefonoTutor: string;
  total: number;
  items: {
    nombre: string;
    cantidad: number;
    precio: number;
  }[];
}

const ORDENES_PENDIENTES_CONSULTA: OrdenConsultaPendiente[] = [
  {
    id: "ord-101",
    paciente: "Toby",
    ficha: 1,
    tutor: "Carlos Justiniano",
    telefonoTutor: "77012345",
    total: 160.00,
    items: [
      { nombre: "Honorarios de Consulta Médica General", cantidad: 1, precio: 80.00 },
      { nombre: "Maropitant (Cerenia) 10 mg/ml (0.85 ml SC)", cantidad: 1, precio: 45.00 },
      { nombre: "Metronidazol Suspensión Oral 250mg/5ml", cantidad: 1, precio: 35.00 },
    ]
  }
];

export default function PuntoDeVentaPage() {
  const [productos] = useState<ProductoPOS[]>(PRODUCTOS_MOCK_POS);
  const [tutores] = useState<TutorMock[]>(TUTORES_MOCK);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("TODOS");

  // Órdenes pendientes de camilla
  const [ordenesPendientes, setOrdenesPendientes] = useState<OrdenConsultaPendiente[]>(ORDENES_PENDIENTES_CONSULTA);

  // Carrito de compras
  const [carrito, setCarrito] = useState<ItemCarrito[]>([
    {
      id: "cart-1",
      producto: PRODUCTOS_MOCK_POS[0],
      cantidad: 1.5,
      subtotal: 48.00,
    },
    {
      id: "cart-2",
      producto: PRODUCTOS_MOCK_POS[2],
      cantidad: 1,
      subtotal: 210.00,
    },
  ]);

  // Tutor seleccionado
  const [tutorSeleccionado, setTutorSeleccionado] = useState<TutorMock | null>(TUTORES_MOCK[0]);

  // Descuento en Bs.
  const [descuentoBs, setDescuentoBs] = useState<number>(0);

  // Modal de Cobro
  const [modalCobroAbierto, setModalCobroAbierto] = useState(false);
  const [metodoPago, setMetodoPago] = useState<"EFECTIVO" | "QR" | "CREDITO">("QR");
  const [montoRecibidoEfectivo, setMontoRecibidoEfectivo] = useState("");
  const [abonoCredito, setAbonoCredito] = useState("");

  // Modal de Ticket Exitoso
  const [modalTicketAbierto, setModalTicketAbierto] = useState(false);
  const [fechaTicket, setFechaTicket] = useState("21/11/2026");
  const [numeroTicket, setNumeroTicket] = useState("00843");

  // Modal para seleccionar peso en venta a granel
  const [productoGranelSeleccionado, setProductoGranelSeleccionado] = useState<ProductoPOS | null>(null);
  const [pesoIngresado, setPesoIngresado] = useState("1.0");

  // Totales
  const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const total = Math.max(0, subtotal - descuentoBs);

  // Agregar producto al ticket
  const agregarAlCarrito = (prod: ProductoPOS, cantidad = 1) => {
    if (prod.esGranel && cantidad === 1) {
      setProductoGranelSeleccionado(prod);
      setPesoIngresado("1.0");
      return;
    }

    setCarrito(prev => {
      const existe = prev.find(item => item.producto.id === prod.id);
      if (existe) {
        return prev.map(item => 
          item.producto.id === prod.id 
            ? { 
                ...item, 
                cantidad: item.cantidad + cantidad, 
                subtotal: (item.cantidad + cantidad) * prod.precioUnitario 
              }
            : item
        );
      }
      return [...prev, { id: `item-${Date.now()}-${Math.random()}`, producto: prod, cantidad, subtotal: cantidad * prod.precioUnitario }];
    });
  };

  // Lector de código de barras: si presionan enter en el input
  const handleKeyDownBusqueda = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && busqueda.trim()) {
      const matchExacto = productos.find(p => p.codigoBarras === busqueda.trim());
      if (matchExacto) {
        agregarAlCarrito(matchExacto);
        setBusqueda("");
      }
    }
  };

  // Cargar orden de consulta médica pendiente
  const cargarOrdenConsulta = (orden: OrdenConsultaPendiente) => {
    const nuevosItems: ItemCarrito[] = orden.items.map(item => ({
      id: `rx-${Date.now()}-${Math.random()}`,
      producto: {
        id: `prod-rx-${Math.random()}`,
        nombre: `[${orden.paciente}] ${item.nombre}`,
        codigoBarras: "CONSULTA-CAMILLA",
        precioUnitario: item.precio,
        unidad: "servicio",
        categoria: "FARMACIA",
        stockDisponible: 99,
        esGranel: false,
        tipoIcono: "FARMACIA"
      },
      cantidad: item.cantidad,
      subtotal: item.precio * item.cantidad
    }));

    setCarrito(prev => [...prev, ...nuevosItems]);
    // Asignar el tutor automáticamente
    const t = tutores.find(tut => tut.nombre.toLowerCase().includes(orden.tutor.toLowerCase()));
    if (t) setTutorSeleccionado(t);
    // Remover de órdenes pendientes
    setOrdenesPendientes(prev => prev.filter(o => o.id !== orden.id));
  };

  const confirmarGranel = () => {
    if (!productoGranelSeleccionado) return;
    const pesoNum = parseFloat(pesoIngresado) || 1;
    agregarAlCarrito(productoGranelSeleccionado, pesoNum);
    setProductoGranelSeleccionado(null);
  };

  const modificarCantidad = (itemId: string, delta: number) => {
    setCarrito(prev => prev.map(item => {
      if (item.id === itemId) {
        const nuevaCant = Math.max(item.producto.esGranel ? 0.25 : 1, item.cantidad + delta);
        return {
          ...item,
          cantidad: nuevaCant,
          subtotal: nuevaCant * item.producto.precioUnitario,
        };
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (itemId: string) => {
    setCarrito(prev => prev.filter(item => item.id !== itemId));
  };

  const finalizarCobro = () => {
    setNumeroTicket(Math.floor(1000 + Math.random() * 9000).toString());
    setModalCobroAbierto(false);
    setModalTicketAbierto(true);
  };

  const reiniciarVenta = () => {
    setCarrito([]);
    setDescuentoBs(0);
    setModalTicketAbierto(false);
  };

  // Enviar recibo digital por WhatsApp al tutor
  const enviarReciboWhatsApp = () => {
    const telefono = tutorSeleccionado?.telefono || "77012345";
    const lineasTicket = carrito.map(i => `• ${i.cantidad} ${i.producto.unidad} x ${i.producto.nombre} = Bs. ${i.subtotal.toFixed(2)}`).join("\n");
    const texto = encodeURIComponent(
      `Hola *${tutorSeleccionado?.nombre || "Estimado cliente"}*, le saludamos de la *Clínica Veterinaria Central*.\n\nLe compartimos su comprobante de pago digital:\n*Ticket:* #${numeroTicket} | *Fecha:* ${fechaTicket}\n\n*DETALLE:*\n${lineasTicket}\n\n*TOTAL PAGADO:* Bs. ${total.toFixed(2)} (${metodoPago})\n\n¡Gracias por su preferencia!`
    );
    window.open(`https://wa.me/591${telefono.replace(/\D/g, "")}?text=${texto}`, "_blank");
  };

  const renderIconoProducto = (tipo: string) => {
    switch (tipo) {
      case "ALIMENTO": return <Package className="w-5 h-5 text-primary" />;
      case "FARMACIA": return <Pill className="w-5 h-5 text-teal-600" />;
      case "HIGIENE": return <Sparkles className="w-5 h-5 text-sky-600" />;
      default: return <Tag className="w-5 h-5 text-amber-600" />;
    }
  };

  const productosFiltrados = productos.filter(p => {
    const q = busqueda.toLowerCase().trim();
    const coincideBusqueda = 
      !q ||
      p.nombre.toLowerCase().includes(q) ||
      p.codigoBarras.includes(q);

    if (categoria === "TODOS") return coincideBusqueda;
    return coincideBusqueda && p.categoria === categoria;
  });

  const cambioEfectivo = Math.max(0, (parseFloat(montoRecibidoEfectivo) || 0) - total);

  return (
    <div className="space-y-6">
      {/* 1. Cabecera y Selector de Tutor en Caja */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Punto de Venta (POS) & Cobro en Mostrador
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Liquidación de consultas, fármacos de camilla, alimento por peso y cobro con QR Simple o Efectivo.
          </p>
        </div>

        {/* Selector de Tutor / Cliente */}
        <div className="flex items-center gap-2 bg-card border border-border p-2.5 rounded-xl text-xs shadow-xs w-full sm:w-auto">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <User className="w-4 h-4 shrink-0" />
          </div>
          <div className="flex-1 sm:flex-initial">
            <span className="text-muted-foreground block text-[10px] font-semibold">Tutor asignado a la cuenta:</span>
            <select 
              value={tutorSeleccionado?.id || ""} 
              onChange={(e) => {
                const t = tutores.find(x => x.id === e.target.value);
                setTutorSeleccionado(t || null);
              }}
              className="font-bold text-base sm:text-xs bg-transparent border-none focus:outline-none cursor-pointer text-foreground w-full"
            >
              <option value="">Consumidor Final (Sin registrar)</option>
              {tutores.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nombre} {t.saldoDeudor > 0 ? `(Debe Bs. ${t.saldoDeudor})` : ""}
                </option>
              ))}
            </select>
          </div>
          {tutorSeleccionado && tutorSeleccionado.saldoDeudor > 0 && (
            <Badge variant="destructive" className="text-[10px] ml-1 h-5 font-bold shrink-0">
              Debe Bs. {tutorSeleccionado.saldoDeudor}
            </Badge>
          )}
        </div>
      </div>

      {/* 2. Banner de Órdenes Pendientes de Consulta Médica (Integración Camilla -> Caja) */}
      {ordenesPendientes.length > 0 && (
        <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                Orden médica lista: {ordenesPendientes[0].paciente} (Ficha #{ordenesPendientes[0].ficha})
              </p>
              <p className="text-[11px] text-muted-foreground">
                Tutor: {ordenesPendientes[0].tutor} · {ordenesPendientes[0].items.length} ítems por Dr. Rodrigo Paz
              </p>
            </div>
          </div>

          <Button 
            size="sm" 
            onClick={() => cargarOrdenConsulta(ordenesPendientes[0])}
            className="text-xs h-10 sm:h-8 gap-1.5 bg-primary text-primary-foreground font-semibold cursor-pointer shadow-xs w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Cargar Orden Médica (Bs. {ordenesPendientes[0].total.toFixed(2)})
          </Button>
        </div>
      )}

      {/* 3. Cuerpo Principal: Catálogo (7 cols) y Ticket de Venta (5 cols) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Catálogo de Productos y Balanza */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre o escanear código de barras..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={handleKeyDownBusqueda}
                className="pl-9 h-10 sm:h-9 text-base sm:text-xs"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
              {["TODOS", "ALIMENTO", "FARMACIA", "ACCESORIO", "HIGIENE"].map(cat => (
                <Button 
                  key={cat}
                  size="sm"
                  variant={categoria === cat ? "default" : "outline"}
                  onClick={() => setCategoria(cat)}
                  className="text-xs h-10 sm:h-9 font-semibold cursor-pointer whitespace-nowrap"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {productosFiltrados.map((prod) => (
              <div 
                key={prod.id}
                onClick={() => agregarAlCarrito(prod)}
                className="p-3 sm:p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between group active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                      {renderIconoProducto(prod.tipoIcono)}
                    </div>
                    {prod.esGranel ? (
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none font-semibold">
                        Balanza / kg
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Stock: {prod.stockDisponible}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs mt-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {prod.nombre}
                  </h4>
                </div>

                <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Bs. {prod.precioUnitario.toFixed(2)}/{prod.unidad}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket en Vivo / Carrito */}
        <div className="lg:col-span-5">
          <Card className="shadow-xs border-border sticky top-20">
            <CardHeader className="p-3.5 pb-2.5 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  Ticket de Venta en Mostrador
                </CardTitle>
                <Badge variant="outline" className="font-mono text-xs font-bold">
                  {carrito.length} {carrito.length === 1 ? "ítem" : "ítems"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {carrito.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
                  <ShoppingCart className="w-8 h-8 mx-auto opacity-30" />
                  <p>El ticket está vacío. Haz clic en productos del catálogo o carga una orden de consulta médica.</p>
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[300px] overflow-y-auto pr-1">
                  {carrito.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">{item.producto.nombre}</p>
                        <p className="text-muted-foreground text-[11px]">
                          Bs. {item.producto.precioUnitario.toFixed(2)} × {item.cantidad} {item.producto.unidad}
                        </p>
                      </div>

                      {/* Controles de Cantidad */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => modificarCantidad(item.id, item.producto.esGranel ? -0.5 : -1)}
                          className="h-8 w-8 sm:h-6 sm:w-6 text-xs cursor-pointer active:scale-95 transition-transform"
                        >
                          <Minus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                        </Button>
                        <span className="font-bold min-w-[28px] text-center font-mono text-xs">
                          {item.cantidad}
                        </span>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => modificarCantidad(item.id, item.producto.esGranel ? 0.5 : 1)}
                          className="h-8 w-8 sm:h-6 sm:w-6 text-xs cursor-pointer active:scale-95 transition-transform"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                        </Button>
                      </div>

                      <div className="w-16 text-right font-bold text-foreground shrink-0 font-mono text-xs">
                        Bs. {item.subtotal.toFixed(2)}
                      </div>

                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="h-8 w-8 sm:h-6 sm:w-6 text-muted-foreground hover:text-red-600 shrink-0 cursor-pointer active:scale-95 transition-transform"
                      >
                        <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Totales, Descuento y Botón de Cobro */}
              {carrito.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-border">
                  <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                    <span>Subtotal:</span>
                    <span className="font-mono">Bs. {subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Descuento aplicado:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground font-mono">Bs.</span>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={descuentoBs || ""}
                        onChange={(e) => setDescuentoBs(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="h-8 sm:h-7 w-20 text-xs text-right font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-border">
                    <span className="font-bold text-sm text-foreground">Total a Cobrar:</span>
                    <span className="font-extrabold text-xl text-primary font-mono">
                      Bs. {total.toFixed(2)}
                    </span>
                  </div>

                  <Button 
                    className="w-full h-11 sm:h-10 text-xs sm:text-sm font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => {
                      setMontoRecibidoEfectivo(total.toString());
                      setModalCobroAbierto(true);
                    }}
                  >
                    <Banknote className="w-4 h-4" />
                    Proceder al Cobro (Bs. {total.toFixed(2)})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL 1: Selector de Peso en Venta de Alimento a Granel */}
      {productoGranelSeleccionado && (
        <Dialog open={!!productoGranelSeleccionado} onOpenChange={() => setProductoGranelSeleccionado(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Weight className="w-5 h-5 text-primary" />
                Venta de Alimento por Balanza (Granel)
              </DialogTitle>
              <DialogDescription className="text-xs">
                {productoGranelSeleccionado.nombre} (Bs. {productoGranelSeleccionado.precioUnitario.toFixed(2)} / kg)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Ingrese el peso en Kilogramos (balanza):
                </label>
                <div className="relative">
                  <Input 
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={pesoIngresado}
                    onChange={(e) => setPesoIngresado(e.target.value)}
                    className="text-xl font-bold font-mono h-12 pr-12 text-primary"
                    autoFocus
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-muted-foreground">kg</span>
                </div>
              </div>

              {/* Botones de Peso Rápido */}
              <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5">
                {["0.5", "1.0", "1.5", "2.0", "3.0", "5.0"].map(kg => (
                  <Button 
                    key={kg}
                    size="sm" 
                    variant={pesoIngresado === kg ? "default" : "outline"}
                    onClick={() => setPesoIngresado(kg)}
                    className="text-xs h-9 sm:h-8 cursor-pointer font-semibold font-mono active:scale-95 transition-transform"
                  >
                    {kg} kg
                  </Button>
                ))}
              </div>

              {/* Subtotal Calculado */}
              <div className="p-3 bg-muted/40 rounded-xl flex items-center justify-between text-xs border border-border">
                <span className="text-muted-foreground font-semibold">Monto calculado:</span>
                <span className="font-extrabold text-base text-emerald-600 font-mono">
                  Bs. {((parseFloat(pesoIngresado) || 0) * productoGranelSeleccionado.precioUnitario).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-2">
              <Button variant="ghost" size="sm" onClick={() => setProductoGranelSeleccionado(null)} className="h-10 sm:h-8 text-xs cursor-pointer">
                Cancelar
              </Button>
              <Button size="sm" onClick={confirmarGranel} className="bg-primary text-primary-foreground font-semibold text-xs h-10 sm:h-8 cursor-pointer active:scale-95 transition-transform">
                Agregar al Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 2: Cobro Rápido con Efectivo, QR Simple o Crédito */}
      <Dialog open={modalCobroAbierto} onOpenChange={setModalCobroAbierto}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Banknote className="w-5 h-5 text-emerald-600" />
              Finalizar Venta · Total: Bs. {total.toFixed(2)}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Seleccione la modalidad de pago para emitir el comprobante de caja.
            </DialogDescription>
          </DialogHeader>

          {/* Pestañas de Métodos de Pago */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-2">
            <Button 
              type="button"
              variant={metodoPago === "QR" ? "default" : "outline"}
              onClick={() => setMetodoPago("QR")}
              className="gap-1 sm:gap-1.5 text-xs h-10 sm:h-9 font-semibold cursor-pointer active:scale-95 transition-transform"
            >
              <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="truncate">QR Simple</span>
            </Button>
            <Button 
              type="button"
              variant={metodoPago === "EFECTIVO" ? "default" : "outline"}
              onClick={() => setMetodoPago("EFECTIVO")}
              className="gap-1 sm:gap-1.5 text-xs h-10 sm:h-9 font-semibold cursor-pointer active:scale-95 transition-transform"
            >
              <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="truncate">Efectivo</span>
            </Button>
            <Button 
              type="button"
              variant={metodoPago === "CREDITO" ? "default" : "outline"}
              onClick={() => setMetodoPago("CREDITO")}
              className="gap-1 sm:gap-1.5 text-xs h-10 sm:h-9 font-semibold cursor-pointer active:scale-95 transition-transform"
            >
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="truncate">Al Crédito</span>
            </Button>
          </div>

          {/* Contenido según método */}
          <div className="py-3">
            {metodoPago === "QR" && (
              <div className="text-center space-y-3 p-4 bg-muted/30 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground">
                  El cliente debe escanear este código desde la app de su banco (BCP, BNB, Banco Unión, Fie, Ganadero, etc.)
                </p>
                <div className="w-44 h-44 bg-white p-3 mx-auto rounded-xl shadow-xs border border-border flex items-center justify-center">
                  <div className="w-full h-full border-2 border-dashed border-slate-900 rounded-lg flex flex-col items-center justify-center bg-slate-50">
                    <QrCode className="w-24 h-24 text-slate-900" />
                    <span className="text-[10px] font-bold tracking-wider text-slate-800 mt-1 font-mono">
                      PAGO QR SIMPLE
                    </span>
                  </div>
                </div>
                <div className="text-base font-extrabold text-primary font-mono">
                  Monto a transferir: Bs. {total.toFixed(2)}
                </div>
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Código QR Generado y Activo
                </Badge>
              </div>
            )}

            {metodoPago === "EFECTIVO" && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    ¿Con cuánto paga el cliente? (Bs.)
                  </label>
                  <Input 
                    type="number"
                    value={montoRecibidoEfectivo}
                    onChange={(e) => setMontoRecibidoEfectivo(e.target.value)}
                    className="text-xl font-bold font-mono h-11"
                    placeholder="ej. 100"
                    autoFocus
                  />
                </div>

                <div className="flex gap-1.5">
                  {[total, 50, 100, 200].map(val => (
                    <Button 
                      key={val} 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setMontoRecibidoEfectivo(val.toString())}
                      className="text-xs flex-1 h-8 font-semibold cursor-pointer font-mono"
                    >
                      Bs. {val}
                    </Button>
                  ))}
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                    Cambio a entregar al cliente:
                  </span>
                  <span className="font-extrabold text-xl text-emerald-700 dark:text-emerald-300 font-mono">
                    Bs. {cambioEfectivo.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {metodoPago === "CREDITO" && (
              <div className="space-y-3 p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  Esta venta se registrará en la cuenta corriente del tutor
                </div>
                <p className="text-xs text-muted-foreground">
                  Tutor: <strong>{tutorSeleccionado?.nombre || "No asignado"}</strong> (Saldo actual: Bs. {tutorSeleccionado?.saldoDeudor || 0})
                </p>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Abono inicial en efectivo (Opcional):
                  </label>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    value={abonoCredito}
                    onChange={(e) => setAbonoCredito(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-400 font-mono">
                  Deuda añadida a la cuenta: Bs. {(total - (parseFloat(abonoCredito) || 0)).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-border pt-3">
            <Button variant="ghost" size="sm" onClick={() => setModalCobroAbierto(false)} className="h-10 sm:h-8 text-xs cursor-pointer">
              Volver
            </Button>
            <Button size="sm" onClick={finalizarCobro} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 sm:h-9 cursor-pointer px-4 active:scale-95 transition-transform">
              Confirmar Cobro e Imprimir Recibo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Recibo Térmico (80mm) con Impresión y Envío WhatsApp */}
      <Dialog open={modalTicketAbierto} onOpenChange={setModalTicketAbierto}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600 text-base font-bold">
              <CheckCircle2 className="w-5 h-5" />
              ¡Cobro Concluido Exitosamente!
            </DialogTitle>
            <DialogDescription className="text-xs">
              Comprobante de caja generado para el cliente y archivado en sistema.
            </DialogDescription>
          </DialogHeader>

          {/* Vista previa del Recibo Térmico (80mm) */}
          <div className="p-4 bg-white text-slate-900 font-mono text-xs rounded-xl border border-slate-200 shadow-inner space-y-2 min-w-0 overflow-hidden">
            <div className="text-center border-b border-dashed border-slate-300 pb-2 space-y-0.5">
              <p className="font-extrabold text-sm tracking-wider">VETCONTROL PRO</p>
              <p className="text-[10px] text-slate-600 font-sans">Clínica Veterinaria Central · Santa Cruz</p>
              <p className="text-[10px] text-slate-600">NIT: 1029384021 · Tel: 77012345</p>
            </div>

            <div className="flex justify-between text-[11px] pt-1">
              <span>Fecha: {fechaTicket}</span>
              <span>Ticket: #{numeroTicket}</span>
            </div>
            <p className="text-[11px] truncate">Cliente: {tutorSeleccionado?.nombre || "Consumidor Final"}</p>

            <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1.5">
              {carrito.map(item => (
                <div key={item.id} className="flex justify-between items-start text-[11px] gap-2 min-w-0">
                  <span className="truncate flex-1 min-w-0">{item.cantidad} {item.producto.unidad} × {item.producto.nombre}</span>
                  <span className="shrink-0 font-bold font-mono">Bs. {item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {descuentoBs > 0 && (
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Descuento aplicado:</span>
                <span className="font-mono">-Bs. {descuentoBs.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-1 text-right space-y-0.5">
              <p className="font-black text-sm text-slate-900 font-mono">TOTAL: Bs. {total.toFixed(2)}</p>
              <p className="text-[10px] text-slate-500 font-sans">Modalidad: {metodoPago}</p>
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-dashed border-slate-300 font-sans">
              Gracias por confiar en nosotros la salud de su mascota.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-3 pt-2 border-t border-border">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={enviarReciboWhatsApp}
              className="gap-1.5 text-xs h-10 sm:h-9 text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer font-semibold active:scale-95 transition-transform"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              Recibo a WhatsApp
            </Button>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.print()}
                className="gap-1.5 text-xs flex-1 sm:flex-initial h-10 sm:h-9 cursor-pointer font-semibold active:scale-95 transition-transform"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir
              </Button>
              <Button 
                size="sm" 
                onClick={reiniciarVenta} 
                className="bg-primary text-primary-foreground flex-1 sm:flex-initial text-xs h-10 sm:h-9 font-bold cursor-pointer active:scale-95 transition-transform"
              >
                Nueva Venta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
