"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle, MapPin, ShieldCheck, ExternalLink } from "lucide-react";

interface FooterProps {
  onNavegar: (seccion: string) => void;
}

export function Footer({ onNavegar }: FooterProps) {
  return (
    <footer className="bg-[#080706] text-[#A8A29E] border-t border-[#C5A880]/15 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Fila Principal de Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          
          {/* Columna 1 & 2: Identidad de Marca */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <span className="font-serif text-2xl font-normal tracking-[0.22em] text-[#F5EFEB]">
                L&apos;ATELIER
              </span>
            </div>

            <p className="text-xs text-[#78716C] leading-relaxed max-w-sm font-light">
              Alta perfumería de inspiración elaborada con esencias puras al 30% de concentración (Extrait de Parfum). Recreamos las pirámides olfativas más codiciadas formulando cada frasco en vivo en nuestras boutiques.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs uppercase tracking-wider text-[#A8A29E] font-light">Canal Oficial:</span>
              <a
                href="https://wa.me/59170011223"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 bg-[#141312] border border-[#C5A880]/30 hover:bg-[#C5A880] hover:text-[#0C0B0A] flex items-center justify-center transition-colors text-[#C5A880]"
                title="WhatsApp Oficial"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Columna 3: Colecciones */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#C5A880]">
              Colecciones
            </h4>
            <ul className="space-y-2 text-xs font-light">
              <li>
                <button
                  onClick={() => onNavegar("catalogo")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Todas las Inspiraciones
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavegar("catalogo")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Línea Unisex
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavegar("catalogo")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Línea Masculina
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavegar("catalogo")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Línea Femenina
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavegar("combos")}
                  className="hover:text-[#C5A880] transition-colors cursor-pointer text-[#C5A880]"
                >
                  Colecciones de Obsequio (Dúo / Trío)
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 4: El Atelier */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#C5A880]">
              El Atelier
            </h4>
            <ul className="space-y-2 text-xs font-light">
              <li>
                <button
                  onClick={() => onNavegar("nosotros")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Nuestra Filosofía
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavegar("nosotros")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Concentración 30% Parfum
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavegar("nosotros")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Maceración en Frío
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavegar("faq")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Preguntas Frecuentes
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 5: Boutiques & Consola */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#C5A880]">
              Boutiques Físicas
            </h4>
            <ul className="space-y-2 text-xs font-light">
              <li>
                <button
                  onClick={() => onNavegar("sucursales")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Santa Cruz · Equipetrol
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavegar("sucursales")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Santa Cruz · Las Brisas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavegar("sucursales")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Santa Cruz · Urubó
                </button>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#78716C] hover:text-[#C5A880] transition-colors"
                >
                  <span>Consola Administrativa</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Fila Inferior de Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#78716C] font-light">
          <p>© 2026 L&apos;Atelier Haute Parfumerie. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <span>Aviso de Inspiraciones y Equivalencias</span>
            <span>Términos del Servicio</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
