"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FaqSection() {
  const [abierta, setAbierta] = useState<number | null>(null);

  const faqs = [
    {
      q: "¿Cuánto tiempo dura la fragancia en piel y textiles?",
      a: "Nuestras formulaciones son Extrait de Parfum al 30% de concentración pura de aceites (no Eau de Toilette ni colonias rebajadas). En piel promedio proyectan entre 8 y 14 horas de estela nítida, y en prendas textiles el secado permanece por más de 24 horas.",
    },
    {
      q: "¿Cómo funciona el Ticket de Retiro en Mostrador?",
      a: "Eliges tus fragancias favoritas y generas tu Ticket de Retiro en PDF con su código QR único. Al presentarte en la boutique de tu ciudad, el perfumista escanea el comprobante y prepara tu fórmula en vivo frente a ti con los mililitros exactos.",
    },
    {
      q: "¿Puedo recibir asesoría y comprar directamente por WhatsApp?",
      a: "Sí. Cada boutique cuenta con una línea oficial atendida por asesores perfumistas. Al pulsar 'Pedir Asesoría o Envío WhatsApp' en el carrito, se abre un chat con tu selección preconfigurada para coordinar envío o resolver cualquier duda.",
    },
    {
      q: "¿Hacen envíos a otras ciudades de Bolivia o fuera de Santa Cruz?",
      a: "Realizamos despachos diarios a todo el país mediante empresas de transporte certificadas y courier exprés. En compras de colecciones de regalo (Dúo o Trío), el envío nacional es totalmente gratuito.",
    },
    {
      q: "¿Qué medios de pago aceptan?",
      a: "Aceptamos pago por QR Simple (transferencia interbancaria inmediata desde cualquier banco), además de efectivo, tarjetas de débito y crédito al retirar presencialmente en nuestras boutiques.",
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28 border-t border-[#C5A880]/15 bg-[#0C0B0A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-14">
          <span className="text-[10px] tracking-[0.28em] uppercase text-[#C5A880] block font-light mb-2">
            Respuestas Claras
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#F5EFEB]">
            Preguntas Frecuentes
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#A8A29E] font-light">
            Todo lo que necesitas conocer sobre nuestras concentraciones, formulación en vivo y entregas.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, index) => {
            const isOpen = abierta === index;
            return (
              <div
                key={faq.q}
                className={`bg-[#141312] border transition-colors overflow-hidden rounded-none ${
                  isOpen ? "border-[#C5A880]" : "border-stone-800/80 hover:border-[#C5A880]/40"
                }`}
              >
                <button
                  onClick={() => setAbierta(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-serif text-base sm:text-lg font-normal text-white">
                    {faq.q}
                  </span>
                  <div className={`shrink-0 text-[#C5A880] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#A8A29E] leading-relaxed border-t border-stone-800 font-light max-w-[70ch]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
