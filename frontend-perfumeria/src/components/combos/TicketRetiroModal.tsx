"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { ItemCarrito, Sucursal, ComboPromocion } from "@/types/perfume";
import { generarCodigoTicket, generarTicketPDF, DatosTicketRetiro } from "@/lib/ticket-pdf";
import { registrarOrdenRetiro } from "@/lib/supabase";
import {
  X,
  Download,
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TicketRetiroModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onPedidoFinalizado?: () => void;
  items: ItemCarrito[];
  sucursal: Sucursal;
  clienteNombre: string;
  clienteTelefono?: string;
  comboAplicado: ComboPromocion | null;
  subtotal: number;
  descuento: number;
  totalFinal: number;
}

export function TicketRetiroModal({
  abierto,
  onCerrar,
  onPedidoFinalizado,
  items,
  sucursal,
  clienteNombre,
  clienteTelefono = "",
  comboAplicado,
  subtotal,
  descuento,
  totalFinal,
}: TicketRetiroModalProps) {
  const [codigoTicket, setCodigoTicket] = useState("");
  const [fechaEmision, setFechaEmision] = useState("");
  const [fechaExpiracion, setFechaExpiracion] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [descargando, setDescargando] = useState(false);
  const [pdfDescargado, setPdfDescargado] = useState(false);
  const [ordenRegistrada, setOrdenRegistrada] = useState(false);

  useEffect(() => {
    if (abierto) {
      const codigo = generarCodigoTicket();
      const ahora = new Date();
      const expira = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

      const fecha = ahora.toLocaleString("es-BO", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      const fechaExp = expira.toLocaleString("es-BO", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      setCodigoTicket(codigo);
      setFechaEmision(fecha);
      setFechaExpiracion(fechaExp);

      const qrPayload = JSON.stringify({
        ticket: codigo,
        fecha,
        vence: fechaExp,
        sede: sucursal.nombre,
        total: totalFinal,
        cliente: clienteNombre || "Cliente Mostrador",
        telefono: clienteTelefono,
        items: items.map((i) => ({
          dupe: i.perfume.inspiracionEn,
          ml: i.presentacion.mililitros,
          cant: i.cantidad,
        })),
      });

      QRCode.toDataURL(qrPayload, {
        width: 220,
        margin: 1,
        color: { dark: "#0C0B0A", light: "#FFFFFF" },
      }).then((url) => setQrDataUrl(url));

      // Registrar directamente en Supabase Cloud para sincronización en tiempo real
      registrarOrdenRetiro({
        codigoTicket: codigo,
        sucursalId: sucursal.id,
        sucursalNombre: sucursal.nombre,
        clienteNombre: clienteNombre.trim() || "Cliente Mostrador",
        clienteTelefono: clienteTelefono.trim() || sucursal.whatsapp,
        items,
        subtotal,
        descuento,
        total: totalFinal,
        comboNombre: comboAplicado?.nombre,
        qrPayload,
        fechaEmision: ahora.toISOString(),
        fechaExpiracion: expira.toISOString(),
      }).then(() => setOrdenRegistrada(true));
    }
  }, [abierto, sucursal, totalFinal, clienteNombre, clienteTelefono, items, subtotal, descuento, comboAplicado]);

  if (!abierto) return null;

  const datosTicket: DatosTicketRetiro = {
    codigoTicket,
    fechaEmision,
    fechaExpiracion,
    sucursal,
    clienteNombre,
    clienteTelefono,
    items,
    comboAplicado,
    subtotal,
    descuento,
    totalFinal,
  };

  const handleDescargarPDF = async () => {
    try {
      setDescargando(true);
      const doc = await generarTicketPDF(datosTicket);
      doc.save(`Ticket_Preparacion_${codigoTicket}_LAtelier.pdf`);
      setPdfDescargado(true);
    } catch (err) {
      console.error("Error al descargar PDF:", err);
    } finally {
      setDescargando(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-2xl bg-[#141312] border border-[#C5A880]/20 rounded-none sm:rounded-xs shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-[#0C0B0A] px-6 py-4 border-b border-[#C5A880]/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#141312] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-white font-normal tracking-wide">
                  L&apos;ATELIER · ORDEN DE PREPARACIÓN
                </h3>
                <p className="text-[11px] text-[#A8A29E] font-light">
                  Ticket de retiro y formulación en vivo en mostrador
                </p>
              </div>
            </div>

            <button
              onClick={onCerrar}
              className="p-1.5 text-[#A8A29E] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cuerpo */}
          <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#CBD5E1]">
            
            {/* Alerta de Vigencia 24h */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  <strong>Vigencia de Reserva:</strong> 24 horas continuas
                </span>
              </div>
              <span className="font-mono text-[11px] text-amber-200/90">
                Vence: {fechaExpiracion}
              </span>
            </div>

            {/* Banner Superior con Código */}
            <div className="p-4 bg-[#0C0B0A] border border-[#C5A880]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-none">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] block font-light">
                  Código de Preparación en Caja
                </span>
                <span className="text-2xl font-serif text-white tracking-widest font-normal">
                  {codigoTicket}
                </span>
              </div>

              <div className="text-left sm:text-right text-[11px]">
                <span className="text-emerald-400 font-medium flex items-center sm:justify-end gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Listo para Mostrador</span>
                </span>
                <span className="text-[#78716C] font-light">{fechaEmision}</span>
              </div>
            </div>

            {/* Sede y QR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#0C0B0A] border border-[#C5A880]/15 rounded-none">
              
              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-2 bg-white text-center rounded-none">
                {qrDataUrl ? (
                  <Image
                    src={qrDataUrl}
                    alt="QR Ticket"
                    width={130}
                    height={130}
                    className="w-32 h-32 object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 bg-slate-200 animate-pulse" />
                )}
                <span className="text-[9px] uppercase tracking-wider text-slate-900 font-semibold mt-1">
                  Escanear en Caja
                </span>
              </div>

              {/* Sede */}
              <div className="sm:col-span-2 space-y-2 flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-light flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Boutique de Preparación:</span>
                </span>

                <h4 className="font-serif text-lg text-white font-normal">
                  {sucursal.nombre} ({sucursal.ciudad})
                </h4>

                <p className="text-xs text-[#A8A29E] font-light">
                  {sucursal.direccion}
                </p>

                <p className="text-[11px] text-[#78716C] font-light">
                  Horario: {sucursal.horario}
                </p>

                <div className="pt-1">
                  <a
                    href={sucursal.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141312] hover:bg-[#1C1A17] text-[#C5A880] text-[11px] uppercase tracking-wider transition-colors border border-[#C5A880]/25 rounded-none"
                  >
                    <span>Ubicación en Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

            </div>

            {/* Desglose de Fragancias */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#C5A880] block font-light">
                Fórmulas y Frascos a Preparar Frente al Cliente:
              </span>

              <div className="border border-stone-800 divide-y divide-stone-800 bg-[#0C0B0A] rounded-none">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3">
                    <div>
                      <strong className="text-white font-serif text-sm block font-normal">
                        {item.cantidad}x {item.perfume.nombre} ({item.presentacion.mililitros}ml)
                      </strong>
                      <span className="text-[11px] text-[#C5A880]">
                        {item.perfume.marcaReferencia} · Concentración 30% Parfum
                      </span>
                      <span className="text-[10px] text-[#A8A29E] block mt-0.5 font-light">
                        Insumo: Frasco cristal de {item.presentacion.mililitros}ml con atomizador metálico sellado
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-white text-sm">
                        {(item.presentacion.precio * item.cantidad).toFixed(0)} Bs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promoción aplicada */}
            {comboAplicado && (
              <div className="p-3 bg-[#181715] border border-[#C5A880]/30 flex items-center justify-between text-[#C5A880] text-xs rounded-none">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    Promoción: <strong>{comboAplicado.nombre}</strong>
                  </span>
                </div>
                <span className="font-serif font-medium">-{descuento.toFixed(0)} Bs</span>
              </div>
            )}

            {/* Resumen Total */}
            <div className="p-4 bg-[#0C0B0A] border border-[#C5A880]/20 flex items-center justify-between rounded-none">
              <div>
                <span className="text-xs text-[#A8A29E] block font-light">Monto Total a Cancelar en Boutique:</span>
                <span className="text-[10px] text-[#78716C] font-light">
                  Pago en efectivo, tarjeta o QR al momento de la entrega
                </span>
              </div>
              <span className="text-2xl font-serif text-[#C5A880] font-light">
                {totalFinal.toFixed(0)} Bs
              </span>
            </div>

            {/* Garantía */}
            <div className="p-3 bg-[#0C0B0A] border border-stone-800 text-[11px] text-[#78716C] flex items-start gap-2.5 rounded-none font-light">
              <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
              <span>
                <strong>Formulación en mostrador:</strong> Tu perfume será preparado en tu presencia a partir de esencias madres puras y sellado con atomizador de ajuste para máxima fijación.
              </span>
            </div>

          </div>

          {/* Footer de Acciones */}
          <div className="p-4 bg-[#0C0B0A] border-t border-[#C5A880]/15 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {ordenRegistrada ? (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-light">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ticket registrado en sistema de boutique</span>
                </span>
              ) : (
                <span className="text-[11px] text-[#78716C] font-light">
                  Presenta este comprobante en la boutique asignada.
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDescargarPDF}
                disabled={descargando}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-[#1C1A17] hover:bg-[#25221F] text-[#C5A880] border border-[#C5A880]/30 font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer rounded-none disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{descargando ? "Generando..." : pdfDescargado ? "Volver a Descargar" : "Descargar PDF"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onPedidoFinalizado) {
                    onPedidoFinalizado();
                  } else {
                    onCerrar();
                  }
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-[#C5A880] hover:bg-[#D4AF37] text-[#0C0B0A] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer rounded-none shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Pedido Realizado (Finalizar)</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
