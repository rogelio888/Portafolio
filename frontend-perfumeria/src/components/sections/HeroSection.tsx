"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Package, ArrowUpRight, MapPin } from "lucide-react";
import { Perfume, Presentacion } from "@/types/perfume";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

interface HeroSectionProps {
  perfumes: Perfume[];
  onExplorarCatalogo: () => void;
  onArmarCombo: () => void;
  onAgregarAlPedido?: (perfume: Perfume, presentacion: Presentacion) => void;
  onVerDetalles?: (perfume: Perfume) => void;
}

interface SignatureFragrance {
  id: string;
  tag: string;
  romano: string;
  nombre: string;
  inspiracion: string;
  familia: string;
  descripcion: string;
  notasClave: string[];
  imagenPngUrl: string;
  colorAura: string;
  precio50ml: number;
}

const SIGNATURE_FRAGRANCES: SignatureFragrance[] = [
  {
    id: "perf-2",
    tag: "Chipre Frutal",
    romano: "I",
    nombre: "Aventus",
    inspiracion: "Creed",
    familia: "Chipre Frutal Ahumado",
    descripcion: "La insignia del carácter. Piña ahumada y bergamota sobre corteza de abedul negro tostado, musgo de roble y almizcle blanco.",
    notasClave: ["Piña Ahumada", "Grosella Negra", "Abedul Negro", "Musgo de Roble"],
    imagenPngUrl: "/frontend-perfumeria/images/perfumes/aventus.png",
    colorAura: "rgba(212, 175, 55, 0.18)",
    precio50ml: 180,
  },
  {
    id: "perf-1",
    tag: "Ámbar Floral",
    romano: "II",
    nombre: "Baccarat Rouge 540",
    inspiracion: "Maison Francis Kurkdjian",
    familia: "Ámbar Floral Amaderado",
    descripcion: "Alquimia de cristal fundido. Azafrán rojo radiante, madera de cedro virgen y la calidez envolvente del ámbar gris mineral.",
    notasClave: ["Azafrán Rojo", "Jazmín Egipcio", "Cedro del Atlas", "Ámbar Gris"],
    imagenPngUrl: "/frontend-perfumeria/images/perfumes/baccarat-rouge-540.png",
    colorAura: "rgba(229, 211, 179, 0.18)",
    precio50ml: 180,
  },
  {
    id: "perf-3",
    tag: "Gourmand Licoroso",
    romano: "III",
    nombre: "Angels' Share",
    inspiracion: "Kilian",
    familia: "Gourmand Licoroso Ambarino",
    descripcion: "Destilado en barricas de roble añejo. Coñac francés refinado con canela de Ceilán, praliné tostado y fondo de haba tonka.",
    notasClave: ["Coñac Francés", "Canela de Ceilán", "Roble Añejo", "Praliné"],
    imagenPngUrl: "/frontend-perfumeria/images/perfumes/angels-share.png",
    colorAura: "rgba(197, 168, 128, 0.18)",
    precio50ml: 180,
  },
];

export function HeroSection({
  perfumes,
  onExplorarCatalogo,
  onArmarCombo,
  onVerDetalles,
}: HeroSectionProps) {
  const [activoIndex, setActivoIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const actual = SIGNATURE_FRAGRANCES[activoIndex];

  // Rotación suave cada 3.5 segundos de los frascos insignia
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActivoIndex((prev) => (prev + 1) % SIGNATURE_FRAGRANCES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const stageRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x * 0.1);
    mouseY.set(y * 0.1);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleVerPerfumeCompleto = () => {
    if (!onVerDetalles) return;
    const perfumeEncontrado =
      perfumes.find((p) => p.id === actual.id) || perfumes[0];
    if (perfumeEncontrado) {
      onVerDetalles(perfumeEncontrado);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-between border-b border-[#C5A880]/15 bg-[#0C0B0A] overflow-hidden pt-6 pb-0 sm:pt-10">
      
      {/* Fondo sutil con iluminación de ámbar y laboratorio de esencias */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.08)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.04)_0%,transparent_70%)]" />
      </div>

      {/* =========================================================================
          VERSIÓN MÓVIL (HASTA LG)
      ========================================================================= */}
      <div className="lg:hidden relative z-10 px-4 w-full flex flex-col items-center text-center">
        
        {/* Titular Editorial Móvil */}
        <div className="space-y-2 mt-2">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#C5A880] block font-light">
            Alta Perfumería de Inspiración
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#F5EFEB] tracking-tight leading-[1.12]">
            Fórmulas maestras formuladas en mostrador.
          </h1>
          <p className="font-serif italic text-[#C5A880] text-xl font-light">
            Concentración Parfum 30%
          </p>
        </div>

        {/* Frasco Móvil */}
        <div 
          className="relative w-full max-w-[280px] aspect-[4/5] flex items-center justify-center my-4 cursor-pointer"
          onClick={handleVerPerfumeCompleto}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={actual.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45 }}
              className="relative z-10 w-full h-full flex items-center justify-center"
            >
              <Image
                src={actual.imagenPngUrl}
                alt={actual.nombre}
                width={300}
                height={400}
                priority
                style={{ width: "auto", height: "auto" }}
                className="object-contain max-h-[92%] drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Micro-Ficha Móvil */}
        <div 
          onClick={handleVerPerfumeCompleto}
          className="w-full max-w-sm bg-[#141312] border border-[#C5A880]/20 p-4 text-left cursor-pointer rounded-xs"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880] block font-medium">
                {actual.romano} · {actual.tag}
              </span>
              <h2 className="font-serif text-lg font-normal text-[#F5EFEB] mt-0.5">
                {actual.nombre}
              </h2>
              <p className="text-xs text-[#C5A880] mt-0.5 font-light uppercase tracking-wider">
                {actual.inspiracion}
              </p>
            </div>
            <span className="text-xs font-serif text-[#C5A880]">
              180 Bs
            </span>
          </div>
        </div>

        {/* Botones Móvil */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-sm mt-3 pt-1">
          <button
            onClick={onExplorarCatalogo}
            className="py-3 px-3 bg-[#C5A880] text-[#0C0B0A] font-semibold text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-1.5 cursor-pointer rounded-xs"
          >
            <span>Catálogo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onArmarCombo}
            className="py-3 px-3 bg-[#141312] text-[#F5EFEB] border border-[#C5A880]/30 font-medium text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-1.5 cursor-pointer rounded-xs"
          >
            <span>Colección Regalo</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VERSIÓN ESCRITORIO (LG+)
      ========================================================================= */}
      <div className="hidden lg:flex relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex-col justify-center my-auto">
        <div className="grid grid-cols-12 gap-12 items-center">
          
          {/* COLUMNA IZQUIERDA: Manifiesto Editorial */}
          <div className="col-span-6 flex flex-col justify-center">
            
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 bg-[#C5A880]" />
              <span className="text-[11px] tracking-[0.28em] uppercase text-[#C5A880] font-light">
                Haute Parfumerie · Grasse & Ateliers
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[4.2rem] font-normal text-[#F5EFEB] tracking-tight leading-[1.06]">
              Alta perfumería de inspiración.
              <span className="block text-[#C5A880] font-normal italic mt-2">
                Concentración pura al 30%.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#A8A29E] leading-relaxed font-light max-w-xl">
              Fórmulas elaboradas con aceites puros macerados artesanalmente. Recreamos con fidelidad absoluta las pirámides más codiciadas de las grandes casas, formulando cada frasco en vivo frente a ti en nuestras boutiques.
            </p>

            {/* Acciones principales */}
            <div className="mt-8 flex flex-row items-center gap-4">
              <button
                onClick={onExplorarCatalogo}
                className="px-8 py-4 bg-[#C5A880] hover:bg-[#D4AF37] text-[#0C0B0A] font-semibold text-xs uppercase tracking-[0.22em] transition-all cursor-pointer flex items-center justify-center gap-2.5 rounded-none group shadow-md"
              >
                <span>Explorar Colección ({perfumes.length} Fragancias)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onArmarCombo}
                className="px-7 py-4 bg-[#141312] hover:bg-[#1C1A17] text-[#F5EFEB] border border-[#C5A880]/30 hover:border-[#C5A880] font-medium text-xs uppercase tracking-[0.22em] transition-all cursor-pointer flex items-center justify-center gap-2 rounded-none"
              >
                <Package className="w-4 h-4 text-[#C5A880]" />
                <span>Colecciones de Obsequio</span>
              </button>
            </div>

            {/* Selector de Fragancias Insignia */}
            <div 
              className="mt-12 pt-6 border-t border-[#C5A880]/15"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#78716C] block mb-3 font-medium">
                Creaciones Maestras del Atelier:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SIGNATURE_FRAGRANCES.map((frag, idx) => {
                  const esActivo = activoIndex === idx;
                  return (
                    <button
                      key={frag.id}
                      onClick={() => setActivoIndex(idx)}
                      className={`text-left p-3 border transition-all cursor-pointer rounded-none relative overflow-hidden ${
                        esActivo
                          ? "bg-[#1C1A17] border-[#C5A880] text-white"
                          : "bg-[#141312]/60 border-stone-800 text-[#A8A29E] hover:border-stone-700 hover:text-white"
                      }`}
                    >
                      {esActivo && !isHovered && (
                        <motion.div
                          key={`timer-desk-${frag.id}`}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3.5, ease: "linear" }}
                          className="absolute bottom-0 left-0 h-[2px] bg-[#C5A880]"
                        />
                      )}
                      <span className="text-[10px] font-serif text-[#C5A880] block font-light">
                        {frag.romano}
                      </span>
                      <strong className="text-xs font-serif block truncate font-normal text-[#F5EFEB] mt-0.5">
                        {frag.nombre}
                      </strong>
                      <span className="text-[10px] text-[#C5A880] block truncate mt-0.5">
                        {frag.inspiracion}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: Escenario del Frasco de Cristal */}
          <div 
            ref={stageRef}
            className="col-span-6 flex items-center justify-center relative select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setIsHovered(true)}
          >
            <div
              className="relative w-full max-w-lg lg:max-w-xl h-[560px] lg:h-[620px] flex flex-col items-center justify-between group cursor-pointer"
              onClick={handleVerPerfumeCompleto}
            >
              {/* Aura lumínica cenital de fondo */}
              <div 
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full pointer-events-none blur-3xl transition-colors duration-1000"
                style={{ backgroundColor: actual.colorAura || "rgba(197, 168, 128, 0.2)" }}
              />

              {/* Botella PNG pura Hero en escala monumental */}
              <div className="relative w-full flex-1 flex items-center justify-center pb-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={actual.id}
                    initial={{ opacity: 0, scale: 0.94, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -14 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="relative z-10 w-full h-[380px] lg:h-[450px] flex items-center justify-center"
                  >
                    <Image
                      src={actual.imagenPngUrl}
                      alt={actual.nombre}
                      fill
                      priority
                      sizes="(max-width: 1024px) 85vw, 600px"
                      className="object-contain drop-shadow-[0_28px_50px_rgba(0,0,0,0.95)] group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Sombra de base de la botella */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/5 h-6 bg-black/90 blur-xl pointer-events-none" />
              </div>

              {/* Placa Olfativa Flotante Editorial */}
              <div className="relative z-20 w-full bg-[#141312]/95 backdrop-blur-md border border-[#C5A880]/20 p-4 rounded-none shadow-2xl shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-[#C5A880] block font-light">
                      {actual.romano} · {actual.tag} · Parfum 30%
                    </span>
                    <h2 className="font-serif text-xl font-normal text-[#F5EFEB] mt-0.5">
                      {actual.nombre}
                    </h2>
                    <p className="text-xs text-[#C5A880] mt-0.5 font-light uppercase tracking-wider">
                      {actual.inspiracion}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-lg text-white font-light">
                      180 Bs
                    </span>
                    <span className="text-[10px] text-[#78716C] block uppercase tracking-wider">
                      Frasco 50ml
                    </span>
                  </div>
                </div>

                {/* Notas clave sobrias */}
                <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#A8A29E]">
                    {actual.notasClave.slice(0, 3).join(" · ")}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVerPerfumeCompleto();
                    }}
                    className="text-[11px] uppercase tracking-[0.18em] text-[#C5A880] hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>Ver pirámide</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          ZÓCALO ARQUITECTÓNICO DE ATRIBUTOS
      ========================================================================= */}
      <div className="relative z-10 border-t border-[#C5A880]/15 bg-[#100F0E] mt-6 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center divide-x-0 lg:divide-x divide-[#C5A880]/15">
            <div className="px-3">
              <span className="font-serif text-xl sm:text-2xl text-[#F5EFEB] block font-light">30% Parfum</span>
              <span className="text-[10px] text-[#A8A29E] uppercase tracking-[0.22em] block mt-1">Concentración de Aceites Puros</span>
            </div>
            <div className="px-3">
              <span className="font-serif text-xl sm:text-2xl text-[#F5EFEB] block font-light">12 Horas +</span>
              <span className="text-[10px] text-[#A8A29E] uppercase tracking-[0.22em] block mt-1">Fijación Certificada en Piel</span>
            </div>
            <div className="px-3">
              <span className="font-serif text-xl sm:text-2xl text-[#F5EFEB] block font-light">En Mostrador</span>
              <span className="text-[10px] text-[#A8A29E] uppercase tracking-[0.22em] block mt-1">Formulado en tu Presencia</span>
            </div>
            <div className="px-3">
              <span className="font-serif text-xl sm:text-2xl text-[#C5A880] block font-light">3 Boutiques</span>
              <span className="text-[10px] text-[#A8A29E] uppercase tracking-[0.22em] block mt-1">Equipetrol · Las Brisas · Urubó (Santa Cruz)</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
