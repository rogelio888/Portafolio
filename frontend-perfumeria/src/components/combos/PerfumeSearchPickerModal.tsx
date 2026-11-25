"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Search, X, Check } from "lucide-react";
import { Perfume } from "@/types/perfume";
import { motion, AnimatePresence } from "framer-motion";

interface PerfumeSearchPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  perfumes: Perfume[];
  slotNumber: number;
  perfumeActualId: string;
  onSelectPerfume: (perfume: Perfume) => void;
}

export function PerfumeSearchPickerModal({
  isOpen,
  onClose,
  perfumes,
  slotNumber,
  perfumeActualId,
  onSelectPerfume,
}: PerfumeSearchPickerModalProps) {
  const [busqueda, setBusqueda] = useState("");
  const [generoFiltro, setGeneroFiltro] = useState<string>("todos");

  const perfumesFiltrados = useMemo(() => {
    return perfumes.filter((p) => {
      if (generoFiltro !== "todos" && p.genero !== generoFiltro) {
        return false;
      }
      if (busqueda.trim() !== "") {
        const query = busqueda.toLowerCase().trim();
        const coincideNombre = p.nombre.toLowerCase().includes(query);
        const coincideInspiracion = p.inspiracionEn.toLowerCase().includes(query);
        const coincideMarca = p.marcaReferencia.toLowerCase().includes(query);
        const coincideFamilia = p.familiaOlfativa.toLowerCase().includes(query);
        const coincideNotas = [
          ...p.notas.salida,
          ...p.notas.corazon,
          ...p.notas.fondo,
        ].some((nota) => nota.toLowerCase().includes(query));

        return (
          coincideNombre ||
          coincideInspiracion ||
          coincideMarca ||
          coincideFamilia ||
          coincideNotas
        );
      }
      return true;
    });
  }, [perfumes, busqueda, generoFiltro]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        
        {/* Fondo clicable */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Contenedor */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-[#141312] border border-[#C5A880]/20 rounded-none sm:rounded-xs shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabecera del Buscador */}
          <div className="p-5 sm:p-6 border-b border-[#C5A880]/15 bg-[#100F0E]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-light">
                  Configuración de Colección
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#F5EFEB] mt-0.5">
                  Seleccionar Fragancia {slotNumber} (50ml)
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-[#A8A29E] hover:text-white transition-colors cursor-pointer"
                aria-label="Cerrar buscador"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Búsqueda */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por fragancia, inspiración (ej. Baccarat, Aventus) o notas..."
                className="w-full pl-11 pr-10 py-3 bg-[#0C0B0A] border border-[#C5A880]/20 rounded-none text-xs sm:text-sm text-white placeholder-[#78716C] focus:outline-hidden focus:border-[#C5A880] transition-colors"
                autoFocus
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtros Rápidos por Género */}
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "todos", label: "Todas" },
                { id: "masculino", label: "Hombre" },
                { id: "femenino", label: "Mujer" },
                { id: "unisex", label: "Unisex" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setGeneroFiltro(pill.id)}
                  className={`px-3 py-1 text-[11px] uppercase tracking-wider transition-all cursor-pointer border rounded-none ${
                    generoFiltro === pill.id
                      ? "bg-[#C5A880] text-[#0C0B0A] border-[#C5A880] font-semibold"
                      : "bg-[#0C0B0A] text-[#A8A29E] border-stone-800 hover:text-white"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Resultados */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 divide-y divide-white/5">
            {perfumesFiltrados.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-white font-serif">No se encontraron fragancias para &ldquo;{busqueda}&rdquo;</p>
                <p className="text-xs text-[#78716C] mt-1">Prueba buscando por marca o ingredientes como vainilla o madera.</p>
              </div>
            ) : (
              perfumesFiltrados.map((perfume) => {
                const esElSeleccionado = perfume.id === perfumeActualId;
                return (
                  <div
                    key={perfume.id}
                    onClick={() => {
                      onSelectPerfume(perfume);
                      onClose();
                    }}
                    className={`pt-2.5 first:pt-0 p-3 flex items-center justify-between gap-4 cursor-pointer transition-all border rounded-none ${
                      esElSeleccionado
                        ? "bg-[#1C1A17] border-[#C5A880]"
                        : "hover:bg-[#1C1A17]/60 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-none overflow-hidden bg-[#0A0908] shrink-0 border border-[#C5A880]/20 flex items-center justify-center">
                        <Image
                          src={perfume.imagenUrl}
                          alt={perfume.nombre}
                          fill
                          sizes="48px"
                          className="object-contain p-1 drop-shadow-md"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-[#C5A880] font-medium">
                            {perfume.marcaReferencia}
                          </span>
                          <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.2 bg-[#0C0B0A] text-[#A8A29E] border border-stone-800">
                            {perfume.genero}
                          </span>
                        </div>
                        <h4 className="font-serif text-[#F5EFEB] text-base truncate">
                          {perfume.nombre}
                        </h4>
                        <p className="text-[11px] text-[#78716C] truncate">
                          {perfume.familiaOlfativa}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {esElSeleccionado ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#C5A880] text-[#0C0B0A] text-xs font-semibold rounded-none">
                          <Check className="w-3.5 h-3.5" />
                          Activo
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-3 py-1 bg-[#0C0B0A] hover:bg-[#C5A880] hover:text-[#0C0B0A] text-[#C5A880] border border-[#C5A880]/25 text-xs uppercase tracking-wider transition-all cursor-pointer rounded-none font-medium"
                        >
                          Elegir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pie */}
          <div className="p-3.5 bg-[#0C0B0A] border-t border-[#C5A880]/15 flex items-center justify-between text-xs text-[#A8A29E]">
            <span>{perfumesFiltrados.length} fragancias en catálogo</span>
            <button
              onClick={onClose}
              className="text-xs text-[#C5A880] hover:underline cursor-pointer uppercase tracking-wider"
            >
              Cerrar
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
