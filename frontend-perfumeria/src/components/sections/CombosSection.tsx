"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Package, Search, Sparkles } from "lucide-react";
import { Perfume, Presentacion } from "@/types/perfume";
import { PerfumeSearchPickerModal } from "@/components/combos/PerfumeSearchPickerModal";
import {
  ComboPromocion,
  obtenerPromocionesDisponibles,
  obtenerPromocionesDesdeSupabase,
  calcularMejorPromocion,
} from "@/lib/promociones";
import { suscribirCanalSupabase } from "@/lib/supabase";
import { motion } from "framer-motion";

interface CombosSectionProps {
  onArmarCombo: (items: { perfume: Perfume; presentacion: Presentacion }[]) => void;
  perfumesDisponibles?: Perfume[];
}

const NUMEROS_ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/**
 * Normaliza y estructura los datos visuales de una promoción
 * para garantizar una cuadrícula simétrica, elegante y sin saltos de diseño.
 */
function getPromoCardInfo(promo: ComboPromocion) {
  // Limpiar título de paréntesis largos redundantes
  const nombreLimpio = promo.nombre
    .replace(/\(.*?\)/g, "")
    .replace(/Combo/g, "Colección")
    .trim();

  let etiqueta = promo.etiquetaBadge;
  if (!etiqueta) {
    if (promo.tipo === "lleva_x_paga_y") etiqueta = "4to Gratis";
    else if (promo.tipo === "segundo_descuento") etiqueta = "2do al 50%";
    else if (promo.cantidadFrascos === 3) etiqueta = "Más Popular";
    else etiqueta = `${promo.cantidadFrascos} Frascos`;
  }

  const ml = promo.mililitrosRequeridos || 50;
  const precioUnitario = 180;
  let precioRef = 0;

  if (promo.tipo === "precio_fijo" && promo.precioCombo) {
    precioRef = promo.precioCombo;
  } else if (promo.tipo === "lleva_x_paga_y") {
    const paga = promo.cantidadPaga || (promo.cantidadFrascos - 1);
    precioRef = paga * precioUnitario;
  } else if (promo.tipo === "segundo_descuento") {
    precioRef = precioUnitario + Math.round((precioUnitario * (100 - (promo.descuentoPorcentaje || 50))) / 100);
  } else if (promo.descuentoPorcentaje) {
    precioRef = Math.round((promo.cantidadFrascos * precioUnitario * (100 - promo.descuentoPorcentaje)) / 100);
  } else {
    precioRef = promo.cantidadFrascos * precioUnitario;
  }

  const subtotal = promo.cantidadFrascos * precioUnitario;
  const ahorro = promo.ahorroEstimado || Math.max(0, subtotal - precioRef);

  return {
    titulo: nombreLimpio || promo.nombre,
    formato: `${promo.cantidadFrascos} x ${ml}ml`,
    etiqueta,
    precio: precioRef,
    ahorro,
  };
}

export function CombosSection({ onArmarCombo, perfumesDisponibles = [] }: CombosSectionProps) {
  const [promociones, setPromociones] = useState<ComboPromocion[]>([]);
  const [promoSeleccionadaId, setPromoSeleccionadaId] = useState<string>("");

  const listaPerfumes = perfumesDisponibles;

  // Frascos seleccionados para las ranuras dinámicas
  const [frascos, setFrascos] = useState<Perfume[]>(() => {
    if (perfumesDisponibles.length >= 2) {
      return [
        perfumesDisponibles[0],
        perfumesDisponibles[1],
        perfumesDisponibles[2] || perfumesDisponibles[0],
        perfumesDisponibles[3] || perfumesDisponibles[1],
      ];
    }
    return [];
  });

  // Sincronizar frascos si cambian los perfumes recibidos desde Supabase
  useEffect(() => {
    if (perfumesDisponibles.length >= 2) {
      setFrascos([
        perfumesDisponibles[0],
        perfumesDisponibles[1],
        perfumesDisponibles[2] || perfumesDisponibles[0],
        perfumesDisponibles[3] || perfumesDisponibles[1],
      ]);
    }
  }, [perfumesDisponibles]);

  // Estado del modal de búsqueda de perfume por ranura (índice 0..N o null)
  const [slotActivoModal, setSlotActivoModal] = useState<number | null>(null);

  // Cargar promociones activas desde Supabase Cloud con suscripción Realtime
  useEffect(() => {
    let activo = true;

    const cargarPromos = async () => {
      // 1. Iniciar con caché inmediata
      const iniciales = obtenerPromocionesDisponibles();
      if (iniciales && iniciales.length > 0 && activo) {
        setPromociones(iniciales);
      }

      // 2. Consultar versión fresca en Supabase Cloud
      const desdeNube = await obtenerPromocionesDesdeSupabase();
      if (activo && desdeNube && desdeNube.length > 0) {
        setPromociones(desdeNube);
        if (!promoSeleccionadaId) {
          const primeraActiva = desdeNube.find((p) => p.activa !== false) || desdeNube[0];
          if (primeraActiva) setPromoSeleccionadaId(primeraActiva.id);
        }
      }
    };

    cargarPromos();

    // Suscripción WebSocket en vivo a cambios en la base de datos
    const desuscribirRealtime = suscribirCanalSupabase("promociones_combos", () => {
      cargarPromos();
    });

    window.addEventListener("latelier_promos_updated", cargarPromos);
    return () => {
      activo = false;
      desuscribirRealtime();
      window.removeEventListener("latelier_promos_updated", cargarPromos);
    };
  }, [promoSeleccionadaId]);

  const promosActivas = promociones.filter((p) => p.activa !== false);
  const promoActual = promosActivas.find((p) => p.id === promoSeleccionadaId) || promosActivas[0];

  const cantidadFrascosRequeridos = promoActual ? Math.max(1, promoActual.cantidadFrascos) : 3;

  // Frascos activos según la promo seleccionada
  const frascosActivos: Perfume[] = [];
  if (listaPerfumes && listaPerfumes.length > 0) {
    for (let i = 0; i < cantidadFrascosRequeridos; i++) {
      const p = frascos[i] || listaPerfumes[i % listaPerfumes.length];
      if (p) frascosActivos.push(p);
    }
  }

  const mlPromo = promoActual?.mililitrosRequeridos || 50;

  // Calcular precio y ahorro en vivo con el motor matemático de promociones
  const itemsParaCalculo = frascosActivos
    .filter((p): p is Perfume => Boolean(p && p.presentaciones && p.presentaciones.length > 0))
    .map((p) => {
      const pres = p.presentaciones.find((pr) => pr.mililitros === mlPromo) || p.presentaciones[0];
      return {
        perfume: p,
        presentacion: pres,
        cantidad: 1,
      };
    });

  const resultadoCalculo = calcularMejorPromocion(
    itemsParaCalculo,
    promoActual ? [promoActual] : undefined
  );

  const subtotalRegular = resultadoCalculo.subtotal;
  const descuento = resultadoCalculo.descuento;
  const precioCombo = resultadoCalculo.totalFinal;
  const ahorro = descuento > 0 ? descuento : (promoActual?.ahorroEstimado || 0);

  const handleAgregarCombo = () => {
    if (frascosActivos.length === 0) return;
    const itemsParaCarrito = frascosActivos
      .filter((p): p is Perfume => Boolean(p && p.presentaciones && p.presentaciones.length > 0))
      .map((p) => {
        const pres = p.presentaciones.find((pr) => pr.mililitros === mlPromo) || p.presentaciones[0];
        return { perfume: p, presentacion: pres };
      });

    if (itemsParaCarrito.length > 0) {
      onArmarCombo(itemsParaCarrito);
    }
  };

  const abrirBuscador = (slotIndex: number) => {
    setSlotActivoModal(slotIndex);
  };

  const handleSeleccionarFragancia = (perfume: Perfume) => {
    if (slotActivoModal !== null) {
      setFrascos((prev) => {
        const nuevos = [...prev];
        nuevos[slotActivoModal] = perfume;
        return nuevos;
      });
      setSlotActivoModal(null);
    }
  };

  const getPerfumeActualId = () => {
    if (slotActivoModal !== null && frascosActivos[slotActivoModal]) {
      return frascosActivos[slotActivoModal].id;
    }
    return "";
  };

  // Clases responsivas según la cantidad de frascos (centradas y proporcionadas)
  const getGridColsClass = (cantidad: number) => {
    if (cantidad === 1) return "max-w-md mx-auto";
    if (cantidad === 2) return "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto";
    if (cantidad === 3) return "grid-cols-1 sm:grid-cols-3 max-w-5xl mx-auto";
    if (cantidad === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto";
  };

  return (
    <section id="combos" className="py-16 sm:py-24 border-t border-[#C5A880]/15 bg-[#0C0B0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera Editorial */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-[10px] tracking-[0.28em] uppercase text-[#C5A880] block font-light mb-2">
            Alta Perfumería · Colecciones de Atelier
          </span>

          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#F5EFEB] tracking-tight">
            Arma tu Colección de Fragancias
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#A8A29E] leading-relaxed font-light">
            Selecciona tus fórmulas maestras de 50ml y disfruta de formulación artesanal en mostrador a precio preferencial.
          </p>
        </div>

        {/* Selector Arquitectónico de Colecciones (Cuadrícula Fija sin Saltos de Línea) */}
        {promosActivas.length > 0 && (
          <div className="mb-12">
            <div className={`grid ${
              promosActivas.length <= 2 
                ? "grid-cols-1 sm:grid-cols-2 max-w-2xl" 
                : promosActivas.length === 3 
                ? "grid-cols-1 sm:grid-cols-3 max-w-4xl" 
                : "grid-cols-2 lg:grid-cols-4 max-w-5xl"
            } gap-3 mx-auto`}>
              {promosActivas.map((promo) => {
                const esActiva = (promoActual?.id === promo.id);
                const info = getPromoCardInfo(promo);

                return (
                  <button
                    key={promo.id}
                    type="button"
                    onClick={() => setPromoSeleccionadaId(promo.id)}
                    className={`p-4 text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between border rounded-none group select-none ${
                      esActiva
                        ? "bg-[#181614] border-[#C5A880] shadow-[0_4px_20px_rgba(197,168,128,0.12)] ring-1 ring-[#C5A880]"
                        : "bg-[#121110] border-white/10 hover:border-[#C5A880]/40 hover:bg-[#161413]"
                    }`}
                  >
                    <div>
                      {/* Fila superior: Formato y Badge */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8A29E]">
                          {info.formato}
                        </span>
                        {info.etiqueta && (
                          <span className={`text-[8.5px] font-mono px-1.5 py-0.5 tracking-wider uppercase ${
                            esActiva
                              ? "bg-[#C5A880] text-[#0C0B0A] font-bold"
                              : "bg-white/5 text-[#C5A880] border border-[#C5A880]/20"
                          }`}>
                            {info.etiqueta}
                          </span>
                        )}
                      </div>

                      {/* Título de la Colección */}
                      <h3 className={`font-serif text-base sm:text-lg font-normal tracking-wide transition-colors ${
                        esActiva ? "text-white" : "text-[#D6D3D1] group-hover:text-white"
                      }`}>
                        {info.titulo}
                      </h3>
                    </div>

                    {/* Fila inferior: Precio y Ahorro */}
                    <div className="mt-4 pt-2.5 border-t border-white/5 flex items-baseline justify-between">
                      <span className={`font-serif text-base sm:text-lg font-light ${
                        esActiva ? "text-[#C5A880]" : "text-stone-300"
                      }`}>
                        {info.precio} Bs
                      </span>
                      {info.ahorro > 0 && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          Ahorras {info.ahorro} Bs
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Barra Editorial de Resumen y Ahorro (Limpia y sin Desbordes) */}
        {promoActual && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-8 border-b border-[#C5A880]/15 gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] uppercase font-medium tracking-[0.2em] text-[#C5A880] bg-[#141312] px-3.5 py-1.5 border border-[#C5A880]/25">
                {cantidadFrascosRequeridos} Frascos de {mlPromo}ml
              </span>

              {ahorro > 0 && (
                <span className="text-xs text-emerald-400 font-serif flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Ahorro exclusivo de {ahorro.toFixed(0)} Bs</span>
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-xs uppercase tracking-wider text-[#78716C]">
                Total Colección:
              </span>
              <span className="font-serif text-3xl sm:text-4xl text-white font-light">
                {precioCombo.toFixed(0)} Bs
              </span>
              {descuento > 0 && (
                <span className="font-serif text-base text-[#78716C] line-through">
                  {subtotalRegular.toFixed(0)} Bs
                </span>
              )}
            </div>
          </div>
        )}

        {/* Vitrinas de Selección Dinámicas con Transición Suave */}
        <motion.div
          key={promoActual?.id || "coleccion"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`grid ${getGridColsClass(cantidadFrascosRequeridos)} gap-5`}
        >
          {frascosActivos.length > 0 ? (
            frascosActivos.map((frasco, idx) => {
              const numeroRomano = NUMEROS_ROMANOS[idx] || (idx + 1).toString();
              return (
                <div
                  key={idx}
                  className="p-5 bg-[#141312] border border-[#C5A880]/15 rounded-none flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880] font-light">
                        Frasco {numeroRomano} · {mlPromo}ml
                      </span>
                      <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[#0C0B0A] text-[#A8A29E] border border-stone-800">
                        {frasco.genero}
                      </span>
                    </div>

                    {/* Pedestal de Vidrio y Frasco Real en Alta Resolución */}
                    <div className="relative h-64 sm:h-72 w-full overflow-hidden mb-3 border border-[#C5A880]/15 bg-gradient-to-b from-[#181715] via-[#0E0D0C] to-[#080706] flex items-center justify-center p-2 shadow-inner">
                      {frasco.imagenUrl ? (
                        <Image
                          src={frasco.imagenUrl}
                          alt={frasco.nombre}
                          fill
                          sizes="(max-width: 640px) 100vw, 320px"
                          className="object-contain p-1 drop-shadow-[0_14px_24px_rgba(0,0,0,0.95)] hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-16 h-28 border border-[#C5A880]/30 rounded-t-sm" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B0A]/70 via-transparent to-transparent pointer-events-none" />
                    </div>

                    <h4 className="font-serif text-lg text-white font-normal truncate mt-0.5">
                      {frasco.nombre}
                    </h4>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880] block truncate">
                      {frasco.marcaReferencia}
                    </span>
                    <p className="text-xs text-[#78716C] truncate mt-0.5">
                      {frasco.familiaOlfativa}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => abrirBuscador(idx)}
                      className="w-full py-2.5 px-3 bg-[#0C0B0A] hover:bg-[#1C1A17] text-[#C5A880] text-xs uppercase tracking-wider font-medium border border-[#C5A880]/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer rounded-none"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Cambiar Fragancia {numeroRomano}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            Array.from({ length: cantidadFrascosRequeridos }).map((_, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#141312] border border-[#C5A880]/15 rounded-none flex flex-col justify-between shadow-lg animate-pulse"
              >
                <div>
                  <div className="h-3 w-24 bg-white/5 mb-3" />
                  <div className="h-64 sm:h-72 w-full bg-white/5 mb-3" />
                  <div className="h-5 w-36 bg-white/5 mb-2" />
                  <div className="h-3 w-28 bg-white/5" />
                </div>
                <div className="h-9 w-full bg-white/5 mt-4" />
              </div>
            ))
          )}
        </motion.div>

        {/* Botón de Cargar Pack al Pedido */}
        <div className="mt-12 pt-6 border-t border-[#C5A880]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#A8A29E] font-light text-center sm:text-left">
            {promoActual?.descripcion || "Formulación personalizada con concentración pura al 30% en mostrador."}
          </p>

          <button
            type="button"
            onClick={handleAgregarCombo}
            className="w-full sm:w-auto px-8 py-4 bg-[#C5A880] hover:bg-[#D4AF37] text-[#0C0B0A] font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer transition-all rounded-none shadow-md"
          >
            <Package className="w-4 h-4 text-[#0C0B0A]" />
            <span>Agregar Colección al Pedido ({precioCombo.toFixed(0)} Bs)</span>
          </button>
        </div>

      </div>

      {/* Modal Inteligente de Búsqueda de Fragancias */}
      <PerfumeSearchPickerModal
        isOpen={slotActivoModal !== null}
        onClose={() => setSlotActivoModal(null)}
        perfumes={listaPerfumes}
        slotNumber={(slotActivoModal ?? 0) + 1}
        perfumeActualId={getPerfumeActualId()}
        onSelectPerfume={handleSeleccionarFragancia}
      />
    </section>
  );
}
