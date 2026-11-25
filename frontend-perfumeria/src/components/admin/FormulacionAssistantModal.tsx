"use client";

import React, { useState } from "react";
import Image from "next/image";
import { TicketPedido, obtenerReceta } from "@/lib/formulacion";
import {
  X,
  FlaskConical,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Droplets,
  Package,
  Layers,
  ShieldCheck,
  Check,
  Clock,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FormulacionAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketPedido | null;
  onCompletar: () => void;
}

export function FormulacionAssistantModal({
  isOpen,
  onClose,
  ticket,
  onCompletar,
}: FormulacionAssistantModalProps) {
  const [indiceItem, setIndiceItem] = useState(0);
  // Estado de frascos preparados: { [numeroFrasco]: boolean }
  const [frascosListos, setFrascosListos] = useState<Record<number, boolean>>({});

  if (!isOpen || !ticket || ticket.items.length === 0) return null;

  // Desglosar los frascos individuales del pedido
  const frascosAFormular: {
    id: string;
    perfume: typeof ticket.items[0]["perfume"];
    presentacion: typeof ticket.items[0]["presentacion"];
    numeroFrasco: number;
    totalFrascos: number;
  }[] = [];

  let contador = 1;
  ticket.items.forEach((item) => {
    for (let c = 0; c < item.cantidad; c++) {
      frascosAFormular.push({
        id: `frasco-${contador}`,
        perfume: item.perfume,
        presentacion: item.presentacion,
        numeroFrasco: contador++,
        totalFrascos: 0,
      });
    }
  });

  const totalFrascos = frascosAFormular.length;
  frascosAFormular.forEach((f) => (f.totalFrascos = totalFrascos));

  const frascoActual = frascosAFormular[indiceItem] || frascosAFormular[0];
  const receta = obtenerReceta(frascoActual.presentacion.mililitros);

  // Cuántos frascos están preparados
  const frascosPreparadosCount = frascosAFormular.filter(
    (f) => frascosListos[f.numeroFrasco]
  ).length;
  const todosLosFrascosListos = frascosPreparadosCount === totalFrascos;

  // Marcar frasco actual como listo y avanzar automáticamente al siguiente
  const handleMarcarFrascoListo = (numeroFrasco: number) => {
    const nuevoEstado = { ...frascosListos, [numeroFrasco]: true };
    setFrascosListos(nuevoEstado);

    // Buscar si queda algún frasco pendiente
    const siguientePendienteIndex = frascosAFormular.findIndex(
      (f) => !nuevoEstado[f.numeroFrasco]
    );

    if (siguientePendienteIndex !== -1) {
      setIndiceItem(siguientePendienteIndex);
    }
  };

  const handleDesmarcarFrasco = (numeroFrasco: number) => {
    setFrascosListos((prev) => ({ ...prev, [numeroFrasco]: false }));
  };

  const frascoActualListo = !!frascosListos[frascoActual.numeroFrasco];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-[#0B0F19] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        >
          {/* Header del Laboratorio */}
          <div className="bg-[#0E1528] px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg text-white font-medium">
                    Laboratorio de Formulación en Mostrador
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold uppercase">
                    30% Extrait de Parfum
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Ticket: <strong className="text-white font-mono">{ticket.codigoTicket}</strong> · Sede: <strong className="text-white">{ticket.sucursalNombre}</strong> · Cliente: <strong className="text-white">{ticket.clienteNombre}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Superior: Pestañas de Frascos del Pedido */}
          <div className="px-6 py-2.5 bg-[#080C14] border-b border-white/[0.06] flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2">
              <span className="text-[#94A3B8] font-mono text-[10px] uppercase tracking-wider shrink-0">
                Frascos a Preparar:
              </span>

              <div className="flex items-center gap-1.5">
                {frascosAFormular.map((f, idx) => {
                  const estaListo = !!frascosListos[f.numeroFrasco];
                  const esActivo = idx === indiceItem;

                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setIndiceItem(idx)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        esActivo
                          ? "bg-amber-500/20 text-amber-300 border-2 border-amber-400 font-bold shadow-xs"
                          : estaListo
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "bg-white/5 text-[#94A3B8] border border-white/10 hover:text-white"
                      }`}
                    >
                      {estaListo ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      )}
                      <span>
                        #{f.numeroFrasco}: {f.perfume.nombre} ({f.presentacion.mililitros}ml)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progreso General */}
            <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
              <span className="text-[#94A3B8]">Preparados:</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                todosLosFrascosListos
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
              }`}>
                {frascosPreparadosCount} de {totalFrascos} listos
              </span>
            </div>
          </div>

          {/* Cuerpo Principal del Asistente */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* Tarjeta de la Fragancia Actual */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              frascoActualListo
                ? "bg-emerald-950/20 border-emerald-500/40"
                : "bg-[#0E1528] border-white/10"
            }`}>
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-[#080C14] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-1 relative">
                  <Image
                    src={frascoActual.perfume.imagenUrl || "/frontend-perfumeria/images/perfumes/bleu-de-chanel.png"}
                    alt={frascoActual.perfume.nombre}
                    width={56}
                    height={56}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                      Frasco #{frascoActual.numeroFrasco} de {totalFrascos}
                    </span>
                    {frascoActualListo && (
                      <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1 border border-emerald-500/30">
                        <Check className="w-3 h-3 stroke-[3]" />
                        PREPARADO
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif text-2xl font-normal text-white">
                    {frascoActual.perfume.nombre}
                  </h4>
                  <p className="text-xs text-[#94A3B8]">
                    Inspiración: <strong className="text-amber-300">{frascoActual.perfume.marcaReferencia}</strong> · {frascoActual.perfume.familiaOlfativa}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center font-mono">
                <div className="px-3.5 py-1.5 rounded-lg bg-[#080C14] border border-white/10 text-center">
                  <span className="text-[10px] text-[#64748B] block uppercase">Volumen</span>
                  <strong className="text-white text-base">{frascoActual.presentacion.mililitros} ml</strong>
                </div>
                <div className="px-3.5 py-1.5 rounded-lg bg-[#080C14] border border-white/10 text-center">
                  <span className="text-[10px] text-[#64748B] block uppercase">Concentración</span>
                  <strong className="text-emerald-400 text-base">30% Parfum</strong>
                </div>
              </div>
            </div>

            {/* Visualizador Gráfico de Proporciones (Barra de Escandallo) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#CBD5E1] font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Fórmula Química Exacta ({receta.mililitrosTotales} ml):
                </span>
                <span className="text-[10px] font-mono text-[#64748B]">100% Volimétrico</span>
              </div>

              {/* Barra segmentada proporcional */}
              <div className="w-full h-8 rounded-lg overflow-hidden flex border border-white/15 bg-[#080C14] p-0.5 gap-0.5 shadow-inner">
                <div
                  style={{ width: "30%" }}
                  title={`Esencia Pura: ${receta.esenciaPuraMl}ml (30%)`}
                  className="bg-amber-500 flex items-center justify-center text-[10px] font-mono font-bold text-slate-950 truncate px-1"
                >
                  {receta.esenciaPuraMl}ml Esencia
                </div>
                <div
                  style={{ width: "4%" }}
                  title={`Fijador Molecular: ${receta.fijadorMolecularMl}ml (4%)`}
                  className="bg-purple-500 flex items-center justify-center text-[9px] font-mono font-bold text-white truncate"
                >
                  {receta.fijadorMolecularMl}ml
                </div>
                <div
                  style={{ width: "2%" }}
                  title={`Feromonas: ${receta.feromonasMl}ml (~${receta.gotasFeromonas} gotas)`}
                  className="bg-emerald-400 flex items-center justify-center text-[8px] font-mono font-bold text-slate-950 truncate"
                >
                  F
                </div>
                <div
                  style={{ width: "64%" }}
                  title={`Alcohol Perfumista: ${receta.alcoholPerfumistaMl}ml (65%)`}
                  className="bg-sky-500/80 flex items-center justify-center text-[10px] font-mono font-bold text-slate-950 truncate px-1"
                >
                  {receta.alcoholPerfumistaMl}ml Alcohol 96º
                </div>
              </div>

              {/* Tarjetas de Medida para el Perfumista */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#0E1528] border border-amber-500/20">
                  <span className="text-[10px] text-[#94A3B8] block uppercase">1. Esencia Pura</span>
                  <strong className="text-base text-amber-400 block mt-0.5">{receta.esenciaPuraMl} ml</strong>
                  <span className="text-[10px] text-[#64748B]">30% Extrait</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0E1528] border border-purple-500/20">
                  <span className="text-[10px] text-[#94A3B8] block uppercase">2. Fijador DPG</span>
                  <strong className="text-base text-purple-300 block mt-0.5">{receta.fijadorMolecularMl} ml</strong>
                  <span className="text-[10px] text-[#64748B]">Pipeta graduada</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0E1528] border border-emerald-500/20">
                  <span className="text-[10px] text-[#94A3B8] block uppercase">3. Feromonas</span>
                  <strong className="text-base text-emerald-400 block mt-0.5">{receta.gotasFeromonas} gotas</strong>
                  <span className="text-[10px] text-[#64748B]">{receta.feromonasMl} ml booster</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0E1528] border border-sky-500/20">
                  <span className="text-[10px] text-[#94A3B8] block uppercase">4. Alcohol 96º</span>
                  <strong className="text-base text-sky-400 block mt-0.5">{receta.alcoholPerfumistaMl} ml</strong>
                  <span className="text-[10px] text-[#64748B]">Enrasar probeta</span>
                </div>
              </div>
            </div>

            {/* Protocolo de Formulación en Mostrador (Guía Visual Rápida) */}
            <div className="p-4 bg-[#080C14] rounded-xl border border-white/5 space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block font-semibold">
                Protocolo Estándar de Mostrador:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#CBD5E1]">
                <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                  <strong className="text-white block font-medium">Paso A · Probeta</strong>
                  <span>Verter {receta.esenciaPuraMl}ml de esencia + {receta.fijadorMolecularMl}ml fijador + {receta.gotasFeromonas} gotas feromonas.</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                  <strong className="text-white block font-medium">Paso B · Aforo</strong>
                  <span>Completar hasta {receta.mililitrosTotales}ml con alcohol desodorizado de 96º.</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                  <strong className="text-white block font-medium">Paso C · Engaste</strong>
                  <span>Verter al frasco de {frascoActual.presentacion.mililitros}ml y sellar el atomizador metálico a presión.</span>
                </div>
              </div>
            </div>

            {/* Botón Único de Confirmación por Frasco */}
            <div className="pt-2">
              {!frascoActualListo ? (
                <button
                  type="button"
                  onClick={() => handleMarcarFrascoListo(frascoActual.numeroFrasco)}
                  className="w-full py-4 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-xl font-mono transition-all transform active:scale-[0.99]"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>
                    Marcar Frasco #{frascoActual.numeroFrasco} ({frascoActual.perfume.nombre} {frascoActual.presentacion.mililitros}ml) como Preparado &amp; Sellado
                  </span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/40 gap-3">
                  <div className="flex items-center gap-2.5 text-emerald-300 text-xs font-mono font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>
                      Frasco #{frascoActual.numeroFrasco}: {frascoActual.perfume.nombre} ({frascoActual.presentacion.mililitros}ml) listo y sellado en mostrador.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDesmarcarFrasco(frascoActual.numeroFrasco)}
                      className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white text-xs font-mono transition-colors cursor-pointer"
                    >
                      Desmarcar
                    </button>

                    {indiceItem < totalFrascos - 1 && (
                      <button
                        type="button"
                        onClick={() => setIndiceItem(indiceItem + 1)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <span>Siguiente Frasco</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer de Acciones con Validación Estricta */}
          <div className="p-5 bg-[#0E1528] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {todosLosFrascosListos ? (
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Todos los perfumes ({totalFrascos}/{totalFrascos}) han sido preparados. Listo para cobrar y entregar.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Falta preparar {totalFrascos - frascosPreparadosCount} frasco(s) para habilitar el botón de finalización.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors cursor-pointer font-mono"
              >
                Cerrar sin Guardar
              </button>

              {/* Botón de Finalización con Validación Estricta */}
              <button
                type="button"
                disabled={!todosLosFrascosListos}
                onClick={onCompletar}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 font-mono transition-all shadow-md ${
                  todosLosFrascosListos
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20 active:scale-95"
                    : "bg-white/5 border border-white/10 text-[#64748B] cursor-not-allowed opacity-50"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {todosLosFrascosListos
                    ? `Formulación Finalizada · Cobrar ${ticket.total} Bs`
                    : `Preparar Todos (${frascosPreparadosCount}/${totalFrascos}) para Cobrar`}
                </span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
