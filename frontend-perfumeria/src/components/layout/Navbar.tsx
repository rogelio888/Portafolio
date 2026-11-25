"use client";

import React from "react";
import { Sucursal } from "@/types/perfume";
import { MapPin, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

interface NavbarProps {
  sucursalActiva: Sucursal;
  onAbrirSucursales: () => void;
  totalItems: number;
  onAbrirCarrito: () => void;
  pestanaActiva: string;
  onCambiarPestana: (pestana: string) => void;
}

export function Navbar({
  sucursalActiva,
  onAbrirSucursales,
  totalItems,
  onAbrirCarrito,
  pestanaActiva,
  onCambiarPestana,
}: NavbarProps) {
  const enlaces = [
    { id: "catalogo", label: "Catálogo" },
    { id: "combos", label: "Colecciones" },
    { id: "nosotros", label: "El Atelier" },
    { id: "sucursales", label: "Boutiques" },
    { id: "faq", label: "Preguntas" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0C0B0A]/95 border-b border-[#C5A880]/15 transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 xl:px-12 h-20 sm:h-22 lg:h-24 flex items-center justify-between gap-3 xl:gap-8">
        
        {/* Marca / Logotipo Editorial de Alta Perfumería */}
        <div 
          onClick={() => onCambiarPestana("catalogo")}
          className="flex items-center cursor-pointer group shrink-0"
        >
          <span className="font-serif text-2xl sm:text-3xl lg:text-[28px] xl:text-[32px] font-normal tracking-[0.2em] xl:tracking-[0.24em] text-[#F5EFEB] group-hover:text-[#C5A880] transition-colors whitespace-nowrap">
            L&apos;ATELIER
          </span>
        </div>

        {/* Pestañas de Navegación Centrales: Estilo Editorial & Arquitectónico */}
        <nav className="hidden lg:flex items-center gap-3.5 xl:gap-8 relative shrink-0">
          {enlaces.map((enlace) => {
            const activo = pestanaActiva === enlace.id;
            return (
              <button
                key={enlace.id}
                onClick={() => onCambiarPestana(enlace.id)}
                className={`relative py-2.5 text-[11px] xl:text-xs uppercase tracking-[0.14em] xl:tracking-[0.2em] transition-colors cursor-pointer whitespace-nowrap ${
                  activo
                    ? "text-[#C5A880] font-medium"
                    : "text-[#A8A29E] hover:text-[#F5EFEB]"
                }`}
              >
                <span>{enlace.label}</span>
                {activo && (
                  <motion.div
                    layoutId="desktop-nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#C5A880]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Acciones del Header */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Selector de Sucursal Activa */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onAbrirSucursales}
            className="flex items-center gap-2 px-3 xl:px-4 py-2 sm:py-2.5 text-xs text-[#F5EFEB] bg-[#141312] hover:bg-[#1C1A17] border border-[#C5A880]/20 hover:border-[#C5A880]/50 transition-all cursor-pointer rounded-none whitespace-nowrap"
          >
            <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
            <span className="tracking-wide whitespace-nowrap font-medium">
              {sucursalActiva.nombre}
            </span>
            <span className="text-[10px] uppercase text-[#A8A29E] hidden xl:inline tracking-wider whitespace-nowrap pl-1.5 border-l border-[#C5A880]/20">
              {sucursalActiva.ciudad}
            </span>
          </motion.button>

          {/* Botón Carrito / Pedido */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onAbrirCarrito}
            className="relative flex items-center gap-2 px-3 sm:px-3.5 xl:px-5 py-2 sm:py-2.5 text-xs font-semibold text-[#0C0B0A] bg-[#C5A880] hover:bg-[#D4AF37] transition-all cursor-pointer rounded-none shadow-sm uppercase tracking-[0.14em] xl:tracking-[0.16em] whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4 text-[#0C0B0A]" />
            <span className="hidden xl:inline">Tu Pedido</span>
            {totalItems > 0 && (
              <span className="min-w-4.5 h-4.5 px-1 bg-[#0C0B0A] text-[#C5A880] text-[10px] font-bold flex items-center justify-center -mr-0.5">
                {totalItems}
              </span>
            )}
          </motion.button>

        </div>
      </div>

      {/* Barra de Pestañas Móviles: 2 Barritas sobrias con líneas sutiles */}
      <div className="lg:hidden px-3 py-2 border-t border-[#C5A880]/15 bg-[#0C0B0A] space-y-1.5">
        {/* Barrita 1: 3 secciones principales */}
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: "catalogo", label: "Catálogo" },
            { id: "combos", label: "Colecciones" },
            { id: "nosotros", label: "El Atelier" },
          ].map((enlace) => {
            const activo = pestanaActiva === enlace.id;
            return (
              <button
                key={enlace.id}
                onClick={() => onCambiarPestana(enlace.id)}
                className={`py-2 px-1 text-[11px] uppercase tracking-wider text-center transition-all cursor-pointer border ${
                  activo
                    ? "bg-[#C5A880] text-[#0C0B0A] border-[#C5A880] font-semibold"
                    : "bg-[#141312] text-[#A8A29E] border-stone-800 hover:text-white"
                }`}
              >
                {enlace.label}
              </button>
            );
          })}
        </div>

        {/* Barrita 2: Sedes y Preguntas */}
        <div className="grid grid-cols-2 gap-1">
          {[
            { id: "sucursales", label: "Boutiques & Mapa" },
            { id: "faq", label: "Preguntas" },
          ].map((enlace) => {
            const activo = pestanaActiva === enlace.id;
            return (
              <button
                key={enlace.id}
                onClick={() => onCambiarPestana(enlace.id)}
                className={`py-2 px-2 text-[11px] uppercase tracking-wider text-center transition-all cursor-pointer border ${
                  activo
                    ? "bg-[#C5A880] text-[#0C0B0A] border-[#C5A880] font-semibold"
                    : "bg-[#141312] text-[#A8A29E] border-stone-800 hover:text-white"
                }`}
              >
                {enlace.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
