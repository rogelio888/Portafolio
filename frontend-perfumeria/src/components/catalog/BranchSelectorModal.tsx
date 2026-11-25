"use client";

import React from "react";
import { Sucursal } from "@/types/perfume";
import { X, MapPin, Phone, Clock, Check, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BranchSelectorModalProps {
  abierto: boolean;
  sucursales: Sucursal[];
  sucursalSeleccionada: Sucursal;
  onSeleccionar: (sucursal: Sucursal) => void;
  onCerrar: () => void;
}

export function BranchSelectorModal({
  abierto,
  sucursales,
  sucursalSeleccionada,
  onSeleccionar,
  onCerrar,
}: BranchSelectorModalProps) {
  if (!abierto) return null;

  const listaSucursales = sucursales && sucursales.length > 0 ? sucursales : [sucursalSeleccionada];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCerrar}
          className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-[#141312] p-6 sm:p-8 shadow-2xl border border-[#C5A880]/20 z-10 overflow-hidden max-h-[85vh] rounded-none sm:rounded-xs"
        >
          {/* Header del Modal */}
          <div className="flex items-start justify-between pb-4 border-b border-[#C5A880]/15">
            <div>
              <span className="text-[10px] font-light tracking-[0.25em] uppercase text-[#C5A880]">
                Red de Boutiques & Ateliers
              </span>
              <h2 className="font-serif text-2xl font-normal text-[#F5EFEB] mt-0.5 tracking-wide">
                Selecciona tu Boutique
              </h2>
              <p className="text-xs text-[#A8A29E] mt-1 font-light">
                Los tickets de retiro y consultas por WhatsApp se asignarán al laboratorio de esta sede.
              </p>
            </div>
            <button
              onClick={onCerrar}
              className="p-1.5 text-[#A8A29E] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Sucursales */}
          <div className="mt-5 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {listaSucursales.map((sucursal) => {
              const esActiva = sucursal.id === sucursalSeleccionada.id;

              return (
                <div
                  key={sucursal.id}
                  onClick={() => {
                    onSeleccionar(sucursal);
                    onCerrar();
                  }}
                  className={`p-4 cursor-pointer border transition-all rounded-none ${
                    esActiva
                      ? "bg-[#1C1A17] border-[#C5A880] shadow-md"
                      : "bg-[#0C0B0A] border-stone-800 hover:border-[#C5A880]/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-none ${
                          esActiva
                            ? "bg-[#C5A880] text-[#0C0B0A]"
                            : "bg-[#141312] text-[#A8A29E] border border-stone-800"
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-serif text-base text-white font-normal">
                          {sucursal.nombre}
                        </h3>
                        <span className="text-[11px] uppercase tracking-wider text-[#C5A880] font-light">
                          {sucursal.direccion.split(',')[0]} · Santa Cruz
                        </span>
                      </div>
                    </div>

                    {esActiva && (
                      <span className="p-1 bg-[#C5A880] text-[#0C0B0A]">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-[#A8A29E] font-light pl-11">
                    {sucursal.direccion}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-[#78716C] pl-11">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{sucursal.horario}</span>
                    </div>

                    {sucursal.mapsUrl && (
                      <span className="text-[10px] text-[#C5A880] flex items-center gap-0.5">
                        <span>Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
