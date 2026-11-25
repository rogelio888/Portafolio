"use client";

import React from "react";
import Image from "next/image";
import { Perfume, Presentacion } from "@/types/perfume";
import { X, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PerfumeDetailModalProps {
  perfume: Perfume | null;
  onCerrar: () => void;
  onAgregarAlPedido: (perfume: Perfume, presentacion: Presentacion) => void;
}

export function PerfumeDetailModal({
  perfume,
  onCerrar,
  onAgregarAlPedido,
}: PerfumeDetailModalProps) {
  const [presentacionSeleccionada, setPresentacionSeleccionada] = React.useState<Presentacion | null>(null);
  const [agregado, setAgregado] = React.useState(false);

  React.useEffect(() => {
    if (perfume) {
      setPresentacionSeleccionada(perfume.presentaciones[1] || perfume.presentaciones[0]);
      setAgregado(false);
    }
  }, [perfume]);

  if (!perfume || !presentacionSeleccionada) return null;

  const handleAgregar = () => {
    onAgregarAlPedido(perfume, presentacionSeleccionada);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCerrar}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Contenedor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-[#141312] border border-[#C5A880]/20 shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[92vh] sm:max-h-[90vh] rounded-none sm:rounded-xs"
        >
          {/* Botón Cerrar */}
          <button
            onClick={onCerrar}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 bg-[#0C0B0A]/80 text-[#A8A29E] hover:text-white transition-colors cursor-pointer rounded-none border border-stone-800"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Imagen Lateral con Pedestal de Galería */}
          <div className="relative w-full md:w-5/12 h-64 sm:h-72 md:h-auto min-h-[280px] bg-gradient-to-b from-[#181715] via-[#0E0D0C] to-[#080706] shrink-0 border-b md:border-b-0 md:border-r border-[#C5A880]/15 flex items-center justify-center p-6">
            <Image
              src={perfume.imagenUrl}
              alt={perfume.nombre}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-contain p-6 drop-shadow-[0_16px_32px_rgba(0,0,0,0.9)]"
            />
          </div>

          {/* Información Detallada */}
          <div className="p-6 md:p-8 flex-1 overflow-y-auto flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] block font-light">
                {perfume.marcaReferencia} · {perfume.familiaOlfativa}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-normal text-white mt-1">
                {perfume.nombre}
              </h2>
              <span className="text-xs text-[#A8A29E] block mt-1 font-light uppercase tracking-wider">
                Concentración 30% Parfum · Género: {perfume.genero}
              </span>

              <p className="text-xs sm:text-sm text-[#A8A29E] mt-4 leading-relaxed font-light">
                {perfume.descripcion}
              </p>

              {/* Pirámide Olfativa */}
              <div className="mt-6 pt-5 border-t border-stone-800 space-y-3">
                <h4 className="text-[10px] uppercase tracking-[0.22em] text-[#C5A880] font-medium">
                  Pirámide Olfativa Completa
                </h4>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[#78716C] uppercase text-[10px] tracking-wider block font-light">
                      Notas de Salida (Primeros 15 min):
                    </span>
                    <span className="text-[#F5EFEB]">{perfume.notas.salida.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-[#78716C] uppercase text-[10px] tracking-wider block font-light">
                      Notas de Corazón (2 a 4 horas):
                    </span>
                    <span className="text-[#F5EFEB]">{perfume.notas.corazon.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-[#78716C] uppercase text-[10px] tracking-wider block font-light">
                      Notas de Fondo (Fijación 12+ horas):
                    </span>
                    <span className="text-[#F5EFEB]">{perfume.notas.fondo.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selector de Tamaño & Botón */}
            <div className="mt-8 pt-5 border-t border-[#C5A880]/15">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880] font-medium">
                  Tamaño del Frasco:
                </span>
                <span className="font-serif text-2xl text-[#F5EFEB] font-light tabular-nums whitespace-nowrap">
                  {presentacionSeleccionada.precio} Bs
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-5 p-1 bg-[#0C0B0A] border border-[#C5A880]/20">
                {perfume.presentaciones.map((pres) => {
                  const activo = pres.id === presentacionSeleccionada.id;
                  return (
                    <button
                      key={pres.id}
                      onClick={() => setPresentacionSeleccionada(pres)}
                      className={`py-3 px-2 text-center transition-all cursor-pointer rounded-none border ${
                        activo
                          ? "bg-[#C5A880] text-[#0C0B0A] border-[#C5A880] font-semibold shadow-xs"
                          : "bg-transparent text-[#A8A29E] hover:text-[#F5EFEB] border-transparent hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="block text-xs uppercase tracking-wider font-semibold">
                        {pres.mililitros} ml
                      </span>
                      <span className={`block text-[11px] font-mono mt-0.5 ${activo ? "text-[#0C0B0A]" : "text-[#C5A880]"}`}>
                        {pres.precio} Bs
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleAgregar}
                className={`w-full py-4 px-4 font-semibold text-xs uppercase tracking-[0.22em] flex items-center justify-center gap-2 transition-all cursor-pointer rounded-none shadow-md ${
                  agregado
                    ? "bg-emerald-600 text-white"
                    : "bg-[#C5A880] hover:bg-[#D4AF37] text-[#0C0B0A]"
                }`}
              >
                {agregado ? (
                  <>
                    <Check className="w-4 h-4 text-white stroke-[2.5]" />
                    <span>Añadido al Pedido</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Añadir Frasco ({presentacionSeleccionada.mililitros}ml · {presentacionSeleccionada.precio} Bs)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
