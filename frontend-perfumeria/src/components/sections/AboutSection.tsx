"use client";

import React from "react";
import Image from "next/image";
import { Clock, Droplets, ShieldCheck, Award } from "lucide-react";
import { motion } from "framer-motion";

export function AboutSection() {
  const pilares = [
    {
      icono: Droplets,
      titulo: "30% Extrait de Parfum",
      descripcion:
        "Fórmulas con 30% de aceites aromáticos puros importados de Grasse. Fijación de más de 12 horas en piel.",
    },
    {
      icono: Clock,
      titulo: "Maceración en Frío de 45 Días",
      descripcion:
        "Reposo prolongado en oscuridad para que las moléculas aromáticas se fundan sin estridencias alcohólicas.",
    },
    {
      icono: Award,
      titulo: "Formulación Frente al Cliente",
      descripcion:
        "Cada contratipo es envasado al instante en la boutique, garantizando frescura y pureza de fórmula.",
    },
    {
      icono: ShieldCheck,
      titulo: "Fidelidad Olfativa 1:1",
      descripcion:
        "Calibración precisa para replicar la salida, el corazón y el fondo de las obras de diseñador más codiciadas.",
    },
  ];

  return (
    <section id="nosotros" className="py-20 sm:py-28 border-t border-[#C5A880]/15 bg-[#0C0B0A] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          <div className="max-w-xl">
            <span className="text-[10px] tracking-[0.28em] uppercase text-[#C5A880] block font-light mb-2">
              El Arte de la Inspiración
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F5EFEB] leading-tight">
              La misma emoción olfativa, formulada con devoción artesanal.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#A8A29E] leading-relaxed font-light">
              Nacimos con una premisa clara: el aroma selecto no debería ser un lujo inalcanzable. Seleccionamos materias primas de la más alta concentración y envasamos cada fragancia en mostrador, eliminando los sobrecostos de marketing de las grandes marcas.
            </p>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden border border-[#C5A880]/20 bg-[#141312] rounded-none shadow-2xl">
            <Image
              src="/frontend-perfumeria/images/about-atelier-perfume.jpg"
              alt="Frasco de alta perfumería artesanal y esencias selectas"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
              <span className="text-xs font-serif italic text-[#C5A880] font-light">
                &ldquo;El perfume es la forma más intensa del recuerdo.&rdquo; — Jean-Paul Guerlain
              </span>
            </div>
          </div>
        </div>

        {/* 4 Pilares */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pilares.map((pilar) => {
            const Icon = pilar.icono;
            return (
              <div
                key={pilar.titulo}
                className="p-6 bg-[#141312] border border-[#C5A880]/15 rounded-none flex flex-col justify-between shadow-sm hover:border-[#C5A880]/40 transition-colors"
              >
                <div>
                  <div className="w-10 h-10 flex items-center justify-center bg-[#0C0B0A] border border-[#C5A880]/25 text-[#C5A880] mb-4 rounded-none">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-base font-normal text-white mb-2">
                    {pilar.titulo}
                  </h3>
                  <p className="text-xs text-[#A8A29E] leading-relaxed font-light">
                    {pilar.descripcion}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
