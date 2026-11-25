"use client";

import React from "react";
import Image from "next/image";
import { Perfume, Presentacion } from "@/types/perfume";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface PerfumeCardProps {
  perfume: Perfume;
  onVerDetalles: (perfume: Perfume) => void;
  onAgregarAlPedido?: (perfume: Perfume, presentacion: Presentacion) => void;
}

export function PerfumeCard({
  perfume,
  onVerDetalles,
}: PerfumeCardProps) {
  const precioMinimo = Math.min(...perfume.presentaciones.map((p) => p.precio));

  return (
    <motion.div
      onClick={() => onVerDetalles(perfume)}
      whileHover={{ y: -5, transition: { duration: 0.22, ease: "easeOut" } }}
      className="group relative flex flex-col bg-[#141312] border border-[#C5A880]/20 hover:border-[#C5A880]/60 transition-all duration-300 shadow-xl overflow-hidden cursor-pointer rounded-none hover:shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
    >
      {/* Línea dorada superior de acabado joyero */}
      <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#C5A880]/30 to-transparent group-hover:via-[#C5A880] transition-colors" />

      {/* 1. Vitrina del Frasco: Enmarcado estilo galería de arte */}
      <div className="p-3.5 bg-[#0E0D0C]/80">
        <div className="relative aspect-[4/5] sm:aspect-square w-full overflow-hidden border border-[#C5A880]/15 bg-gradient-to-b from-[#171614] via-[#0E0D0C] to-[#080706] shadow-inner flex items-center justify-center">
          <Image
            src={perfume.imagenUrl}
            alt={perfume.nombre}
            fill
            sizes="(max-width: 768px) 85vw, (max-width: 1200px) 33vw, 25vw"
            className="object-contain p-3.5 group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-[0_12px_20px_rgba(0,0,0,0.9)]"
            loading="lazy"
          />

          {/* Sutil halo de pedestal */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B0A]/70 via-transparent to-transparent pointer-events-none" />

          {/* Sellos superiores minimalistas */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
            <span className="px-2 py-0.5 bg-[#0C0B0A]/90 backdrop-blur-md text-[#C5A880] border border-[#C5A880]/25 text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-light">
              30% Parfum
            </span>

            <span className="px-2 py-0.5 bg-[#0C0B0A]/90 backdrop-blur-md text-[#D6D3D1] border border-stone-800 text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-light">
              {perfume.genero}
            </span>
          </div>


        </div>
      </div>

      {/* 2. Información Esencial & Editorial */}
      <div className="p-4 sm:p-5 pt-3 flex flex-col flex-1 justify-between bg-[#141312]">
        <div>
          {/* Familia Olfativa */}
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.26em] text-[#A8A29E] block font-light mb-1">
            {perfume.familiaOlfativa}
          </span>

          {/* Nombre Real del Perfume (TÍTULO PRINCIPAL) */}
          <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#F5EFEB] group-hover:text-[#C5A880] transition-colors leading-tight line-clamp-1">
            {perfume.nombre}
          </h3>

          {/* Casa Diseñadora / Marca Original */}
          <p className="text-xs uppercase tracking-[0.2em] text-[#C5A880] font-medium mt-1 truncate">
            {perfume.marcaReferencia}
          </p>
        </div>

        {/* 3. Precios y Botón de Apertura de Tamaños */}
        <div className="mt-4 pt-3 border-t border-[#C5A880]/15">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#78716C] font-light">
              30ml · 50ml · 100ml
            </span>
            <span className="font-serif text-lg text-[#C5A880] font-light tracking-wide">
              Desde {precioMinimo} Bs
            </span>
          </div>

          {/* Botón Añadir que abre el modal de tamaños directamente */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onVerDetalles(perfume);
            }}
            className="w-full py-3 px-4 bg-[#1C1A17] hover:bg-[#C5A880] text-[#C5A880] hover:text-[#0C0B0A] border border-[#C5A880]/30 hover:border-[#C5A880] text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs rounded-none"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Añadir al Pedido</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
