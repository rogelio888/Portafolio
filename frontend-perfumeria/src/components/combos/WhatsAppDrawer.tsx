"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { ItemCarrito, Sucursal } from "@/types/perfume";
import { calcularMejorPromocion, obtenerPromocionesDisponibles } from "@/lib/promociones";
import { generarMensajePedidoWhatsApp } from "@/lib/whatsapp";
import { sanitizeTexto, LIMITES_SISTEMA } from "@/lib/validation";
import { TicketRetiroModal } from "@/components/combos/TicketRetiroModal";
import {
  X,
  Trash2,
  Plus,
  Minus,
  Package,
  ShoppingBag,
  Send,
  MessageCircle,
  MapPin,
  ChevronRight,
  ShieldCheck,
  FileText,
  QrCode,
} from "lucide-react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WhatsAppDrawerProps {
  abierto: boolean;
  onCerrar: () => void;
  onPedidoFinalizado?: () => void;
  onVaciarCarrito?: () => void;
  items: ItemCarrito[];
  sucursalActiva: Sucursal;
  onModificarCantidad: (perfumeId: string, presentacionId: string, delta: number) => void;
  onEliminarItem: (perfumeId: string, presentacionId: string) => void;
  onAbrirSucursales: () => void;
}

export function WhatsAppDrawer({
  abierto,
  onCerrar,
  onPedidoFinalizado,
  onVaciarCarrito,
  items,
  sucursalActiva,
  onModificarCantidad,
  onEliminarItem,
  onAbrirSucursales,
}: WhatsAppDrawerProps) {
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [mostrarModalTicket, setMostrarModalTicket] = useState(false);
  const [mensajeWhatsAppEnviado, setMensajeWhatsAppEnviado] = useState(false);

  const totalFrascos50ml = items
    .filter((i) => i.presentacion.mililitros === 50)
    .reduce((acc, curr) => acc + curr.cantidad, 0);

  const calculoPromo = useMemo(() => {
    return calcularMejorPromocion(items, obtenerPromocionesDisponibles());
  }, [items]);

  const comboAplicado = calculoPromo.promocionAplicada;
  const descuento = calculoPromo.descuento;
  const subtotalRegular = calculoPromo.subtotal;
  const totalFinal = calculoPromo.totalFinal;

  const handleEnviarWhatsApp = () => {
    if (items.length === 0) return;
    const url = generarMensajePedidoWhatsApp({
      sucursal: sucursalActiva,
      items,
      comboAplicado,
      total: totalFinal,
      nombreCliente: sanitizeTexto(nombreCliente, LIMITES_SISTEMA.MAX_LONGITUD_NOMBRE),
    });
    setMensajeWhatsAppEnviado(true);
    window.open(url, "_blank");
  };

  return (
    <AnimatePresence>
      {abierto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCerrar}
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="relative w-full max-w-md bg-[#141312] h-full shadow-2xl flex flex-col z-10 border-l border-[#C5A880]/20"
          >
            {/* Header del Carrito */}
            <div className="p-5 border-b border-[#C5A880]/15 flex items-center justify-between bg-[#0C0B0A]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#141312] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-normal text-white tracking-wide">
                    Tu Pedido & Formulación
                  </h2>
                  <p className="text-[11px] text-[#A8A29E]">
                    {items.length} {items.length === 1 ? "fragancia seleccionada" : "fragancias seleccionadas"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && onVaciarCarrito && (
                  <button
                    type="button"
                    onClick={onVaciarCarrito}
                    className="text-[11px] uppercase tracking-wider text-[#A8A29E] hover:text-rose-400 transition-colors cursor-pointer mr-1"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={onCerrar}
                  className="p-1.5 text-[#A8A29E] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Banner de Sede */}
            <div className="px-5 py-3 bg-[#100F0E] border-b border-stone-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#A8A29E]">
                <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="truncate max-w-[200px]">
                  Boutique: <strong className="font-medium text-white">{sucursalActiva.nombre}</strong>
                </span>
              </div>
              <button
                onClick={onAbrirSucursales}
                className="text-xs text-[#C5A880] hover:underline flex items-center cursor-pointer uppercase tracking-wider"
              >
                Cambiar
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            {/* Promociones / Combos Activos */}
            <div className="px-5 py-3 bg-[#181715] border-b border-[#C5A880]/15">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[11px] text-[#C5A880] uppercase tracking-wider font-medium flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  {comboAplicado
                    ? `¡${comboAplicado.nombre} activo!`
                    : "Promociones y colecciones activas en mostrador"}
                </span>
                {comboAplicado && descuento > 0 && (
                  <span className="text-[10px] font-semibold text-[#0C0B0A] bg-[#C5A880] px-2 py-0.5 rounded-none">
                    -{descuento.toFixed(0)} Bs OFF
                  </span>
                )}
              </div>

              <div className="w-full bg-stone-800 h-1 overflow-hidden">
                <motion.div
                  className="bg-[#C5A880] h-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, (totalFrascos50ml / 3) * 100)}%`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              </div>
            </div>

            {/* Lista de Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#A8A29E]">
                  <div className="w-14 h-14 bg-[#141312] border border-[#C5A880]/20 flex items-center justify-center mb-3 text-[#C5A880]">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg text-white font-normal">
                    Tu pedido está vacío
                  </h3>
                  <p className="text-xs text-[#78716C] max-w-xs mt-1.5 leading-relaxed font-light">
                    Explora el catálogo o selecciona una colección de obsequio para solicitarla en mostrador.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.perfume.id}-${item.presentacion.id}`}
                    className="p-3 bg-[#0C0B0A] border border-[#C5A880]/15 flex items-center justify-between gap-3 rounded-none"
                  >
                    <div className="relative w-12 h-14 overflow-hidden shrink-0 border border-stone-800 bg-[#0E0D0C] flex items-center justify-center">
                      <Image
                        src={item.perfume.imagenUrl}
                        alt={item.perfume.nombre}
                        fill
                        className="object-contain p-1 drop-shadow-sm"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-normal text-base text-white truncate">
                        {item.perfume.nombre}
                      </h4>
                      <span className="text-[10px] uppercase tracking-wider text-[#C5A880] truncate block font-medium">
                        {item.perfume.marcaReferencia}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#A8A29E]">
                          {item.presentacion.mililitros}ml
                        </span>
                        <span className="text-xs font-serif text-white tabular-nums">
                          {item.presentacion.precio} Bs c/u
                        </span>
                      </div>
                    </div>

                    {/* Controles de Cantidad */}
                    <div className="flex items-center gap-1.5 bg-[#141312] p-1 border border-stone-800">
                      <button
                        onClick={() =>
                          onModificarCantidad(
                            item.perfume.id,
                            item.presentacion.id,
                            -1
                          )
                        }
                        className="w-5 h-5 flex items-center justify-center text-white hover:bg-stone-800 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-medium text-white tabular-nums">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() =>
                          onModificarCantidad(
                            item.perfume.id,
                            item.presentacion.id,
                            1
                          )
                        }
                        disabled={item.cantidad >= LIMITES_SISTEMA.MAX_CANTIDAD_POR_ITEM}
                        className="w-5 h-5 flex items-center justify-center text-white hover:bg-stone-800 disabled:opacity-30 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        onEliminarItem(item.perfume.id, item.presentacion.id)
                      }
                      className="p-1 text-stone-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}

              {/* Datos de Contacto Obligatorios para la Reserva 24h */}
              {items.length > 0 && (
                <div className="pt-2 space-y-2.5 bg-[#141312] p-3 border border-[#C5A880]/15">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-[#C5A880] font-medium">
                      Datos de Reserva (Vigencia 24h)
                    </span>
                    <span className="text-[9px] text-[#A8A29E] font-light">* Obligatorio</span>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#A8A29E] block mb-1 font-light">
                      Nombre y Apellido:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={nombreCliente}
                      maxLength={LIMITES_SISTEMA.MAX_LONGITUD_NOMBRE}
                      onChange={(e) => {
                        setNombreCliente(sanitizeTexto(e.target.value, LIMITES_SISTEMA.MAX_LONGITUD_NOMBRE));
                        setErrorValidacion(null);
                      }}
                      className="w-full px-3 py-2 border border-[#C5A880]/20 bg-[#0C0B0A] text-xs text-white placeholder:text-[#78716C] focus:outline-hidden focus:border-[#C5A880] rounded-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#A8A29E] block mb-1 font-light">
                      WhatsApp / Celular:
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej. 71234567"
                      value={telefonoCliente}
                      maxLength={20}
                      onChange={(e) => {
                        setTelefonoCliente(sanitizeTexto(e.target.value, 20));
                        setErrorValidacion(null);
                      }}
                      className="w-full px-3 py-2 border border-[#C5A880]/20 bg-[#0C0B0A] text-xs text-white placeholder:text-[#78716C] focus:outline-hidden focus:border-[#C5A880] rounded-none"
                    />
                  </div>

                  {errorValidacion && (
                    <p className="text-[11px] text-rose-400 font-medium">
                      {errorValidacion}
                    </p>
                  )}

                  <p className="text-[9.5px] text-[#78716C] leading-relaxed">
                    Tu ticket se reserva por 24 horas en boutique. Te avisaremos si tu pedido está por expirar.
                  </p>
                </div>
              )}
            </div>

            {/* Footer con Resumen y Acciones */}
            {items.length > 0 && (
              <div className="p-5 bg-[#0C0B0A] border-t border-[#C5A880]/15 space-y-3">
                <div className="space-y-1 text-xs text-[#A8A29E]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-serif text-white">
                      {subtotalRegular.toFixed(0)} Bs
                    </span>
                  </div>

                  {comboAplicado && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Descuento ({comboAplicado.nombre}):</span>
                      <span className="font-serif">
                        -{descuento.toFixed(0)} Bs
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-base text-white pt-2 border-t border-stone-800">
                    <span className="font-serif">Total a Pagar:</span>
                    <span className="font-serif text-2xl text-[#C5A880]">
                      {totalFinal.toFixed(0)} Bs
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {/* Banner de confirmación tras abrir WhatsApp */}
                  {mensajeWhatsAppEnviado && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex flex-col gap-2 rounded-none"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>¿Enviaste tu pedido a nuestro atelier?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMensajeWhatsAppEnviado(false);
                          if (onPedidoFinalizado) onPedidoFinalizado();
                        }}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0C0B0A] font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer rounded-none"
                      >
                        Pedido Realizado (Vaciar Carrito)
                      </button>
                    </motion.div>
                  )}

                  {/* Botón 1: Generar Ticket */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!nombreCliente.trim() || !telefonoCliente.trim()) {
                        setErrorValidacion("Por favor completa tu Nombre y WhatsApp para emitir tu reserva de 24 horas.");
                        return;
                      }
                      setMostrarModalTicket(true);
                    }}
                    className="w-full py-3.5 px-5 bg-[#C5A880] hover:bg-[#D4AF37] text-[#0C0B0A] font-semibold text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer transition-all rounded-none shadow-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Generar Ticket de Retiro (PDF + QR)</span>
                  </button>

                  {/* Botón 2: WhatsApp */}
                  <button
                    type="button"
                    onClick={handleEnviarWhatsApp}
                    className="w-full py-3 px-5 bg-[#141312] hover:bg-[#1C1A17] text-[#F5EFEB] border border-[#C5A880]/25 text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer transition-all rounded-none font-medium"
                  >
                    <MessageCircle className="w-4 h-4 text-[#C5A880]" />
                    <span>Pedir Asesoría o Envío WhatsApp</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#78716C] pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Formulado en vivo en sucursal {sucursalActiva.nombre}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Modal de Ticket de Retiro */}
          <TicketRetiroModal
            abierto={mostrarModalTicket}
            onCerrar={() => setMostrarModalTicket(false)}
            onPedidoFinalizado={() => {
              setMostrarModalTicket(false);
              if (onPedidoFinalizado) onPedidoFinalizado();
            }}
            items={items}
            sucursal={sucursalActiva}
            clienteNombre={nombreCliente}
            clienteTelefono={telefonoCliente}
            comboAplicado={comboAplicado}
            subtotal={subtotalRegular}
            descuento={descuento}
            totalFinal={totalFinal}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
