"use client";

import React, { useState } from "react";
import { Sucursal } from "@/types/perfume";
import { Clock, Phone, MessageCircle, ExternalLink } from "lucide-react";

interface BranchesSectionProps {
  sucursales?: Sucursal[];
}

export function BranchesSection({ sucursales = [] }: BranchesSectionProps) {
  const [sucursalMóvilId, setSucursalMóvilId] = useState<string>("");

  const listaSucursales = sucursales;
  const idActivo = sucursalMóvilId || listaSucursales[0]?.id;
  const sucursalActiva = listaSucursales.find((s) => s.id === idActivo) || listaSucursales[0];

  const obtenerNombreZona = (nombre: string) => {
    return nombre.replace(/^(Atelier|Boutique|Showroom)\s+/i, "").trim();
  };

  const renderSucursalCard = (sucursal: Sucursal) => {
    const embedUrl = sucursal.embedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15194.215201103038!2d-63.195034!3d-17.768912!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93f1e8020a67e411%3A0xbfa7ffea172fa41f!2sEquipetrol%2C%20Santa%20Cruz%20de%20la%20Sierra!5e0!3m2!1ses!2sbo!4v1700000000000!5m2!1ses!2sbo";
    const zona = obtenerNombreZona(sucursal.nombre);

    return (
      <div
        key={sucursal.id}
        className="flex flex-col bg-[#141312] border border-[#C5A880]/15 rounded-none overflow-hidden shadow-lg hover:border-[#C5A880]/40 transition-colors"
      >
        {/* Mapa con filtro oscuro elegante */}
        <div className="relative h-48 w-full bg-[#0C0B0A]">
          <iframe
            src={embedUrl}
            title={`Ubicación de ${sucursal.nombre}`}
            className="w-full h-full border-0 filter invert-[90%] hue-rotate-180 contrast-125 opacity-80"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#0C0B0A]/90 border border-[#C5A880]/30 text-[10px] uppercase tracking-wider text-[#C5A880] font-mono">
            {zona} · Santa Cruz
          </div>
        </div>

        {/* Datos de la Sede */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-xl font-normal text-white">
              {sucursal.nombre}
            </h3>
            <p className="text-xs text-[#A8A29E] mt-2 font-light leading-relaxed">
              {sucursal.direccion}
            </p>

            <div className="mt-4 pt-3 border-t border-stone-800 space-y-2 text-xs text-[#78716C]">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>{sucursal.horario}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>{sucursal.whatsapp.startsWith("+") ? sucursal.whatsapp : `+${sucursal.whatsapp}`}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 flex items-center gap-2">
            <a
              href={sucursal.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 bg-[#0C0B0A] hover:bg-[#1C1A17] text-[#C5A880] border border-[#C5A880]/25 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors font-medium rounded-none"
            >
              <span>Abrir Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={`https://wa.me/${sucursal.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-[#0C0B0A] hover:bg-[#C5A880] hover:text-[#0C0B0A] text-[#C5A880] border border-[#C5A880]/25 transition-colors rounded-none"
              title="Contactar vía WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="sucursales" className="py-20 sm:py-28 border-t border-[#C5A880]/15 bg-[#0C0B0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[10px] tracking-[0.28em] uppercase text-[#C5A880] block font-light mb-2">
            Presencia Física
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#F5EFEB]">
            Boutiques & Ateliers
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#A8A29E] leading-relaxed font-light">
            Visítanos para probar en piel cualquiera de nuestras creaciones antes de decidir, o presenta tu Ticket QR para que formulemos tu perfume al instante.
          </p>
        </div>

        {/* Selector de Sede en Móvil por Zonas */}
        {listaSucursales.length > 0 && (
          <div className="sm:hidden flex items-center justify-center gap-1.5 p-1 bg-[#141312] border border-[#C5A880]/20 mb-6 max-w-sm mx-auto rounded-none">
            {listaSucursales.map((s) => {
              const esActivo = idActivo === s.id;
              const nombreZona = obtenerNombreZona(s.nombre).toUpperCase();
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSucursalMóvilId(s.id)}
                  className={`flex-1 py-2 px-2 text-[11px] uppercase tracking-wider transition-all cursor-pointer rounded-none font-medium ${
                    esActivo
                      ? "bg-[#C5A880] text-[#0C0B0A] font-semibold shadow-xs"
                      : "text-[#A8A29E] hover:text-white"
                  }`}
                >
                  <span>{nombreZona}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Vista Móvil: Muestra la sede seleccionada */}
        <div className="sm:hidden">
          {sucursalActiva && renderSucursalCard(sucursalActiva)}
        </div>

        {/* Vista Escritorio: Grid de 3 Columnas */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listaSucursales.map(renderSucursalCard)}
        </div>

      </div>
    </section>
  );
}
