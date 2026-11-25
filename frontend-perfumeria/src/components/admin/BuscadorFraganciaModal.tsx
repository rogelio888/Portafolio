"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Perfume, Genero } from "@/types/perfume";
import {
  Search,
  X,
  Sparkles,
  Droplets,
  Check,
  Tag,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BuscadorFraganciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  perfumes: Perfume[];
  esenciasStockMl?: Record<string, number>;
  fraganciaSeleccionadaId: string;
  onSeleccionar: (perfume: Perfume) => void;
}

export function BuscadorFraganciaModal({
  isOpen,
  onClose,
  perfumes,
  esenciasStockMl = {},
  fraganciaSeleccionadaId,
  onSeleccionar,
}: BuscadorFraganciaModalProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroGenero, setFiltroGenero] = useState<string>("todos");

  const perfumesFiltrados = useMemo(() => {
    return perfumes.filter((p) => {
      // Filtro de género
      if (filtroGenero !== "todos" && p.genero !== filtroGenero) {
        return false;
      }

      // Filtro de búsqueda inteligente por nombre, marca o familia
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const coincideNombre = p.nombre.toLowerCase().includes(q);
        const coincideInspiracion = p.inspiracionEn.toLowerCase().includes(q);
        const coincideMarca = p.marcaReferencia.toLowerCase().includes(q);
        const coincideFamilia = p.familiaOlfativa.toLowerCase().includes(q);
        const coincideNotas =
          p.notas.salida.some((n) => n.toLowerCase().includes(q)) ||
          p.notas.fondo.some((n) => n.toLowerCase().includes(q));

        if (
          !coincideNombre &&
          !coincideInspiracion &&
          !coincideMarca &&
          !coincideFamilia &&
          !coincideNotas
        ) {
          return false;
        }
      }

      return true;
    });
  }, [perfumes, busqueda, filtroGenero]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-2xl bg-[#0B0F19] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header del Buscador Inteligente */}
          <div className="p-5 border-b border-white/[0.08] bg-[#0E1528] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-white font-medium">
                  Buscador Inteligente de Fragancias
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Selecciona la fórmula madre de perfume para recargar su tanque de esencia pura.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de Búsqueda y Filtros de Género */}
          <div className="p-4 bg-[#080C14] border-b border-white/[0.06] space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Escribe el nombre o casa de referencia (ej. Sauvage, Dior, Aventus, Tom Ford)..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-[#0E1528] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-[#64748B] focus:outline-hidden focus:border-amber-400/50 transition-colors"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtros de Género */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5">
                {[
                  { id: "todos", label: "Todas las Fragancias" },
                  { id: "masculino", label: "Masculino" },
                  { id: "femenino", label: "Femenino" },
                  { id: "unisex", label: "Unisex" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFiltroGenero(tab.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                      filtroGenero === tab.id
                        ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40"
                        : "bg-white/[0.03] text-[#94A3B8] hover:text-white border border-white/[0.06]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-mono text-[#64748B] shrink-0">
                {perfumesFiltrados.length} encontradas
              </span>
            </div>
          </div>

          {/* Lista de Resultados con Información Clara */}
          <div className="p-4 overflow-y-auto space-y-2 flex-1">
            {perfumesFiltrados.length === 0 ? (
              <div className="py-12 text-center text-[#94A3B8] space-y-2">
                <Search className="w-8 h-8 mx-auto text-[#64748B] opacity-40" />
                <p className="text-sm">No encontramos fragancias que coincidan con &quot;{busqueda}&quot;.</p>
                <p className="text-xs text-[#64748B]">Prueba buscando por marca de inspiración o género.</p>
              </div>
            ) : (
              perfumesFiltrados.map((p) => {
                const esSeleccionado = p.id === fraganciaSeleccionadaId;
                const stockActualMl = esenciasStockMl[p.id] ?? 400;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSeleccionar(p);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      esSeleccionado
                        ? "bg-amber-500/15 border-amber-500/50 shadow-md"
                        : "bg-[#0E1528] border-white/5 hover:border-white/20 hover:bg-[#121B33]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Miniatura del Frasco */}
                      <div className="w-12 h-12 rounded-lg bg-[#080C14] border border-white/10 shrink-0 overflow-hidden flex items-center justify-center p-1 relative">
                        <Image
                          src={p.imagenUrl || "/frontend-perfumeria/images/perfumes/bleu-de-chanel.png"}
                          alt={p.nombre}
                          width={48}
                          height={48}
                          className="object-contain w-full h-full"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-base font-normal text-white truncate">
                            {p.nombre}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[#CBD5E1] uppercase shrink-0">
                            {p.genero}
                          </span>
                        </div>

                        <p className="text-xs text-[#94A3B8] truncate">
                          Inspiración: <strong className="text-amber-300 font-medium">{p.marcaReferencia}</strong> · {p.familiaOlfativa}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Nivel actual de tanque */}
                      <div className="text-right font-mono">
                        <span className="text-[10px] text-[#64748B] block uppercase">Tanque Esencia</span>
                        <strong className="text-xs text-amber-400">{stockActualMl} ml</strong>
                      </div>

                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1 transition-colors ${
                          esSeleccionado
                            ? "bg-amber-500 text-slate-950 font-semibold"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {esSeleccionado ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Seleccionada</span>
                          </>
                        ) : (
                          <>
                            <span>Elegir</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#080C14] border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#64748B]">
            <span>Tip: Escribe &quot;Dior&quot;, &quot;Creed&quot; o &quot;Ámbar&quot; para filtrado rápido</span>
            <button
              type="button"
              onClick={onClose}
              className="text-[#94A3B8] hover:text-white underline cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

