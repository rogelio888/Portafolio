"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { PerfumeCard } from "@/components/catalog/PerfumeCard";
import { PerfumeDetailModal } from "@/components/catalog/PerfumeDetailModal";
import { BranchSelectorModal } from "@/components/catalog/BranchSelectorModal";
import { WhatsAppDrawer } from "@/components/combos/WhatsAppDrawer";
import { CombosSection } from "@/components/sections/CombosSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { BranchesSection } from "@/components/sections/BranchesSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { Footer } from "@/components/layout/Footer";
import { obtenerCatalogoPerfumes, obtenerSucursales } from "@/lib/supabase";
import { sanitizeCantidad, LIMITES_SISTEMA } from "@/lib/validation";
import { Perfume, Presentacion, ItemCarrito, Sucursal } from "@/types/perfume";
import {
  Search,
  Filter,
  X,
  MessageCircle,
  Package,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalActiva, setSucursalActiva] = useState<Sucursal>({
    id: "suc-1",
    nombre: "Atelier Equipetrol",
    ciudad: "Santa Cruz",
    direccion: "Av. San Martín esq. Calle 7 Este, Barrio Equipetrol",
    whatsapp: "59170044556",
    horario: "Lun a Dom: 10:00 - 21:00",
    mapsUrl: "https://maps.app.goo.gl/equipetrol-santacruz",
  });
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [cargandoNube, setCargandoNube] = useState(true);
  const [notificacionPedido, setNotificacionPedido] = useState<string | null>(null);

  // Cargar Catálogo Maestro y Sedes Oficiales en vivo desde Supabase Cloud
  React.useEffect(() => {
    async function cargarDatosNube() {
      try {
        const [catalogo, sedes] = await Promise.all([
          obtenerCatalogoPerfumes(),
          obtenerSucursales(),
        ]);
        if (catalogo && catalogo.length > 0) {
          setPerfumes(catalogo);
        }
        if (sedes && sedes.length > 0) {
          setSucursales(sedes);
          setSucursalActiva(sedes[0]);
        }
      } catch (err) {
        console.error("Error conectando con Supabase:", err);
      } finally {
        setCargandoNube(false);
      }
    }
    cargarDatosNube();
  }, []);

  const [modalSucursalesAbierto, setModalSucursalesAbierto] = useState(false);
  const [drawerCarritoAbierto, setDrawerCarritoAbierto] = useState(false);
  const [perfumeParaDetalle, setPerfumeParaDetalle] = useState<Perfume | null>(null);
  const [pestanaActiva, setPestanaActiva] = useState<string>("catalogo");

  const [busqueda, setBusqueda] = useState("");
  const [filtroGenero, setFiltroGenero] = useState<string>("todos");
  const [filtroNotaActiva, setFiltroNotaActiva] = useState<string | null>(null);

  // Paginación del Catálogo (8 fragancias por página)
  const ITEMS_POR_PAGINA = 8;
  const [paginaActual, setPaginaActual] = useState(1);

  const [itemsCarrito, setItemsCarrito] = useState<ItemCarrito[]>([]);

  // Agregar al carrito con validación de límites anti-abuso
  const handleAgregarAlPedido = (perfume: Perfume, presentacion: Presentacion) => {
    setItemsCarrito((prev) => {
      const frascosTotales = prev.reduce((acc, curr) => acc + curr.cantidad, 0);
      if (frascosTotales >= LIMITES_SISTEMA.MAX_ITEMS_TOTALES_CARRITO) {
        return prev;
      }

      const index = prev.findIndex(
        (i) => i.perfume.id === perfume.id && i.presentacion.id === presentacion.id
      );
      if (index > -1) {
        const copia = [...prev];
        const cantActual = copia[index].cantidad;
        copia[index].cantidad = Math.min(
          LIMITES_SISTEMA.MAX_CANTIDAD_POR_ITEM,
          cantActual + 1
        );
        return copia;
      }
      return [...prev, { perfume, presentacion, cantidad: 1 }];
    });
  };

  // Cargar combo completo en el carrito con límites
  const handleArmarCombo = (items: { perfume: Perfume; presentacion: Presentacion }[]) => {
    setItemsCarrito((prev) => {
      const copia = [...prev];
      items.forEach(({ perfume, presentacion }) => {
        const frascosTotales = copia.reduce((acc, curr) => acc + curr.cantidad, 0);
        if (frascosTotales >= LIMITES_SISTEMA.MAX_ITEMS_TOTALES_CARRITO) return;

        const index = copia.findIndex(
          (i) => i.perfume.id === perfume.id && i.presentacion.id === presentacion.id
        );
        if (index > -1) {
          copia[index].cantidad = Math.min(
            LIMITES_SISTEMA.MAX_CANTIDAD_POR_ITEM,
            copia[index].cantidad + 1
          );
        } else {
          copia.push({ perfume, presentacion, cantidad: 1 });
        }
      });
      return copia;
    });
    setDrawerCarritoAbierto(true);
  };

  // Modificar cantidad con clamping (previene números negativos y desbordamiento > 10)
  const handleModificarCantidad = (perfumeId: string, presentacionId: string, delta: number) => {
    setItemsCarrito((prev) => {
      return prev
        .map((item) => {
          if (item.perfume.id === perfumeId && item.presentacion.id === presentacionId) {
            const nuevaCantidad = sanitizeCantidad(
              item.cantidad + delta,
              0,
              LIMITES_SISTEMA.MAX_CANTIDAD_POR_ITEM
            );
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
          }
          return item;
        })
        .filter(Boolean) as ItemCarrito[];
    });
  };

  const handleEliminarItem = (perfumeId: string, presentacionId: string) => {
    setItemsCarrito((prev) =>
      prev.filter(
        (item) => !(item.perfume.id === perfumeId && item.presentacion.id === presentacionId)
      )
    );
  };

  const handleVaciarCarrito = () => {
    setItemsCarrito([]);
  };

  const handlePedidoFinalizado = () => {
    setItemsCarrito([]);
    setDrawerCarritoAbierto(false);
    setNotificacionPedido("¡Pedido completado con éxito! Tu ticket ha sido generado y registrado para retiro en boutique.");
    setTimeout(() => {
      setNotificacionPedido(null);
    }, 6000);
  };

  // Navegación fluida por pestañas
  const handleCambiarPestana = (id: string) => {
    setPestanaActiva(id);
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filtrado de fragancias desde Supabase
  const perfumesFiltrados = useMemo(() => {
    return perfumes.filter((perfume) => {
      if (filtroGenero !== "todos" && perfume.genero !== filtroGenero) {
        return false;
      }

      if (filtroNotaActiva) {
        const todasLasNotas = [
          ...perfume.notas.salida,
          ...perfume.notas.corazon,
          ...perfume.notas.fondo,
        ].map((n) => n.toLowerCase());
        if (!todasLasNotas.includes(filtroNotaActiva.toLowerCase())) {
          return false;
        }
      }

      if (busqueda.trim() !== "") {
        const q = busqueda.toLowerCase();
        const coincideNombre = perfume.nombre.toLowerCase().includes(q);
        const coincideInspiracion = perfume.inspiracionEn.toLowerCase().includes(q);
        const coincideMarca = perfume.marcaReferencia.toLowerCase().includes(q);
        const coincideFamilia = perfume.familiaOlfativa.toLowerCase().includes(q);
        return coincideNombre || coincideInspiracion || coincideMarca || coincideFamilia;
      }

      return true;
    });
  }, [perfumes, busqueda, filtroGenero, filtroNotaActiva]);

  const totalItemsCount = itemsCarrito.reduce((acc, curr) => acc + curr.cantidad, 0);
  const totalFrascos50ml = itemsCarrito
    .filter((i) => i.presentacion.mililitros === 50)
    .reduce((acc, curr) => acc + curr.cantidad, 0);

  // Cálculo de Paginación para Tienda con Catálogo Extenso (8 por página)
  const totalPaginas = Math.ceil(perfumesFiltrados.length / ITEMS_POR_PAGINA) || 1;
  const inicioIndice = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const perfumesPaginados = perfumesFiltrados.slice(
    inicioIndice,
    inicioIndice + ITEMS_POR_PAGINA
  );

  const cambiarPagina = (nuevaPagina: number) => {
    setPaginaActual(nuevaPagina);
    const catalogoEl = document.getElementById("catalogo");
    if (catalogoEl) {
      catalogoEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0C0B0A] text-[#F5EFEB]">
      {/* 1. Header con pestañas de navegación */}
      <Navbar
        sucursalActiva={sucursalActiva}
        onAbrirSucursales={() => setModalSucursalesAbierto(true)}
        totalItems={totalItemsCount}
        onAbrirCarrito={() => setDrawerCarritoAbierto(true)}
        pestanaActiva={pestanaActiva}
        onCambiarPestana={handleCambiarPestana}
      />

      {/* 2. HERO PRINCIPAL: ALTA PERFUMERÍA EDITORIAL */}
      <HeroSection
        perfumes={perfumes}
        onExplorarCatalogo={() => handleCambiarPestana("catalogo")}
        onArmarCombo={() => handleCambiarPestana("combos")}
        onAgregarAlPedido={handleAgregarAlPedido}
        onVerDetalles={(p) => setPerfumeParaDetalle(p)}
      />

      {/* 3. PESTAÑA: CATÁLOGO DE PERFUMES */}
      <section id="catalogo" className="w-full bg-[#0C0B0A] py-16 sm:py-20 border-b border-[#C5A880]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Cabecera del Catálogo */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#C5A880]/15">
            <div>
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#C5A880] block font-light mb-1">
                Catálogo de Contratipos
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#F5EFEB]">
                Colección de Fragancias
              </h2>
              <p className="text-xs sm:text-sm text-[#A8A29E] mt-2 font-light">
                Explora nuestras creaciones o pulsa cualquier nota para encontrar perfumes con pirámides afines.
              </p>
            </div>

          {/* Filtros de Género: Estilo Arquitectónico */}
          <div className="flex items-center gap-1 p-1 bg-[#141312] border border-[#C5A880]/20 self-start md:self-auto rounded-none">
            {[
              { id: "todos", label: "Todas" },
              { id: "unisex", label: "Unisex" },
              { id: "masculino", label: "Hombre" },
              { id: "femenino", label: "Mujer" },
            ].map((tab) => {
              const esActivo = filtroGenero === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFiltroGenero(tab.id);
                    setPaginaActual(1);
                  }}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.15em] transition-all cursor-pointer rounded-none ${
                    esActivo
                      ? "bg-[#C5A880] text-[#0C0B0A] font-semibold shadow-xs"
                      : "text-[#A8A29E] hover:text-[#F5EFEB]"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Buscador & Filtro de Nota Activa */}
        <div className="py-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
            <input
              type="text"
              placeholder="Busca por nombre, diseñador o nota (Baccarat, Vainilla)..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full pl-11 pr-10 py-3 bg-[#141312] border border-[#C5A880]/20 text-sm text-[#F5EFEB] placeholder:text-[#78716C] focus:outline-hidden focus:border-[#C5A880] rounded-none transition-colors"
            />
            {busqueda && (
              <button
                onClick={() => {
                  setBusqueda("");
                  setPaginaActual(1);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#78716C] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro de Nota Activa */}
          <AnimatePresence>
            {filtroNotaActiva && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 p-3 bg-[#1C1A17] text-xs sm:text-sm text-[#F5EFEB] border border-[#C5A880]/30 max-w-fit rounded-none"
              >
                <Filter className="w-4 h-4 text-[#C5A880]" />
                <span>
                  Filtrando por ingrediente: <strong className="text-[#C5A880] font-medium">{filtroNotaActiva}</strong>
                </span>
                <button
                  onClick={() => {
                    setFiltroNotaActiva(null);
                    setPaginaActual(1);
                  }}
                  className="ml-3 inline-flex items-center gap-1 text-xs font-semibold underline cursor-pointer text-[#C5A880]"
                >
                  Quitar filtro <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grilla de Perfumes */}
        {perfumesFiltrados.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="font-serif text-3xl text-[#F5EFEB]">No encontramos creaciones</h3>
            <p className="text-sm text-[#A8A29E] mt-2 font-light">
              Prueba buscando otro diseñador o ingrediente olfativo.
            </p>
            <button
              onClick={() => {
                setBusqueda("");
                setFiltroGenero("todos");
                setFiltroNotaActiva(null);
                setPaginaActual(1);
              }}
              className="mt-6 px-6 py-3 rounded-none bg-[#141312] border border-[#C5A880]/30 text-[#C5A880] hover:bg-[#C5A880] hover:text-[#0C0B0A] text-xs uppercase tracking-[0.18em] transition-all cursor-pointer font-medium"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <>
            {/* =========================================================================
                CATÁLOGO EN MÓVIL: TRACK HORIZONTAL COMPLETO (SCROLL TÁCTIL SIN COMPRESIÓN)
            ========================================================================= */}
            <div className="lg:hidden">
              <div className="flex items-center justify-between text-xs text-[#A8A29E] mb-3 px-1">
                <span>
                  <strong className="text-[#F5EFEB] font-normal">{perfumesFiltrados.length}</strong> fragancias disponibles
                </span>
                <span className="text-[#C5A880] font-medium flex items-center gap-1">
                  <span>Desliza para ver más</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Riel Horizontal Deslizable con Snap y Tarjetas de Tamaño Completo */}
              <div className="flex gap-4 overflow-x-auto pb-5 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
                {perfumesFiltrados.map((perfume) => (
                  <div
                    key={`mob-${perfume.id}`}
                    className="snap-center shrink-0 w-[84vw] max-w-[320px]"
                  >
                    <PerfumeCard
                      perfume={perfume}
                      onAgregarAlPedido={handleAgregarAlPedido}
                      onVerDetalles={(p) => setPerfumeParaDetalle(p)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* =========================================================================
                CATÁLOGO EN ESCRITORIO: REJILLA DE 4 COLUMNAS CON PAGINACIÓN NUMÉRICA
            ========================================================================= */}
            <div className="hidden lg:block">
              <motion.div 
                key={`page-${paginaActual}-${filtroGenero}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className="grid grid-cols-4 gap-8"
              >
                {perfumesPaginados.map((perfume) => (
                  <PerfumeCard
                    key={perfume.id}
                    perfume={perfume}
                    onAgregarAlPedido={handleAgregarAlPedido}
                    onVerDetalles={(p) => setPerfumeParaDetalle(p)}
                  />
                ))}
              </motion.div>

              {/* Selector de Páginas de Escritorio: Estilo Editorial */}
              {totalPaginas > 1 && (
                <div className="mt-12 pt-8 border-t border-[#C5A880]/15 flex items-center justify-between gap-4">
                  <span className="text-xs text-[#A8A29E] font-light">
                    Mostrando <strong className="text-white font-medium">{inicioIndice + 1}</strong> –{" "}
                    <strong className="text-white font-medium">
                      {Math.min(inicioIndice + ITEMS_POR_PAGINA, perfumesFiltrados.length)}
                    </strong>{" "}
                    de <strong className="text-[#C5A880] font-medium">{perfumesFiltrados.length}</strong> creaciones
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => cambiarPagina(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className="px-4 py-2 text-xs uppercase tracking-wider bg-[#141312] border border-[#C5A880]/20 text-[#F5EFEB] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#C5A880] transition-all flex items-center gap-1 cursor-pointer rounded-none"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Anterior</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          onClick={() => cambiarPagina(num)}
                          className={`w-8 h-8 text-xs font-serif transition-all cursor-pointer rounded-none ${
                            paginaActual === num
                              ? "bg-[#C5A880] text-[#0C0B0A] font-semibold"
                              : "bg-[#141312] border border-stone-800 text-[#A8A29E] hover:text-white hover:border-[#C5A880]/40"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => cambiarPagina(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                      className="px-4 py-2 text-xs uppercase tracking-wider bg-[#141312] border border-[#C5A880]/20 text-[#F5EFEB] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#C5A880] transition-all flex items-center gap-1 cursor-pointer rounded-none"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        </div>
      </section>

      {/* 4. PESTAÑA: COMBOS VIRALES (TIKTOK DEALS) */}
      <CombosSection
        onArmarCombo={handleArmarCombo}
        perfumesDisponibles={perfumes}
      />

      {/* 5. PESTAÑA: NOSOTROS (FILOSOFÍA & CALIDAD) */}
      <AboutSection />

      {/* 6. PESTAÑA: SUCURSALES & MAPA DE CADA SEDE */}
      <BranchesSection sucursales={sucursales} />

      {/* 7. PESTAÑA: PREGUNTAS FRECUENTES & CONTACTO */}
      <FaqSection />

      {/* 8. FOOTER COMPLETO DE ALTA PERFUMERÍA */}
      <Footer onNavegar={handleCambiarPestana} />

      {/* 9. FLOATING DOCK INFERIOR DE WHATSAPP (MÓVIL & DESKTOP) */}
      <AnimatePresence>
        {totalItemsCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-4 right-4 max-w-lg mx-auto z-40"
          >
            <div
              onClick={() => setDrawerCarritoAbierto(true)}
              className="p-4 bg-[#141312] text-[#F5EFEB] rounded-none sm:rounded-xs shadow-2xl border border-[#C5A880]/30 flex items-center justify-between cursor-pointer hover:border-[#C5A880] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-[#C5A880] text-[#0C0B0A] flex items-center justify-center font-semibold text-base">
                  {totalItemsCount}
                </div>
                <div>
                  <span className="font-serif text-base font-normal block text-[#F5EFEB]">
                    {totalFrascos50ml >= 2
                      ? `Colección 50ml (${totalFrascos50ml} frascos)`
                      : "Tu Pedido en Curso"}
                  </span>
                  <span className="text-xs text-[#C5A880] tracking-wider uppercase font-light">
                    Toca para revisar o generar ticket →
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-none bg-[#C5A880] flex items-center justify-center text-[#0C0B0A]">
                  <MessageCircle className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 10. MODALES & DRAWERS */}
      <PerfumeDetailModal
        perfume={perfumeParaDetalle}
        onCerrar={() => setPerfumeParaDetalle(null)}
        onAgregarAlPedido={handleAgregarAlPedido}
      />

      <BranchSelectorModal
        abierto={modalSucursalesAbierto}
        sucursales={sucursales}
        sucursalSeleccionada={sucursalActiva}
        onSeleccionar={(sucursal) => setSucursalActiva(sucursal)}
        onCerrar={() => setModalSucursalesAbierto(false)}
      />

      <WhatsAppDrawer
        abierto={drawerCarritoAbierto}
        onCerrar={() => setDrawerCarritoAbierto(false)}
        onPedidoFinalizado={handlePedidoFinalizado}
        onVaciarCarrito={handleVaciarCarrito}
        items={itemsCarrito}
        sucursalActiva={sucursalActiva}
        onModificarCantidad={handleModificarCantidad}
        onEliminarItem={handleEliminarItem}
        onAbrirSucursales={() => {
          setDrawerCarritoAbierto(false);
          setModalSucursalesAbierto(true);
        }}
      />

      {/* Notificación de Pedido Finalizado */}
      <AnimatePresence>
        {notificacionPedido && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#141312] border border-[#C5A880] p-4 shadow-2xl max-w-sm flex items-center gap-3 text-xs"
          >
            <div className="w-8 h-8 bg-[#C5A880] flex items-center justify-center text-[#0C0B0A] shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-serif text-white font-medium text-sm">Pedido Realizado</p>
              <p className="text-[#A8A29E] mt-0.5 leading-relaxed">{notificacionPedido}</p>
            </div>
            <button
              onClick={() => setNotificacionPedido(null)}
              className="text-[#78716C] hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
