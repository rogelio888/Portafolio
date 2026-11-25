"use client";

import React, { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
import { TicketPedido, calcularTiempoRestanteTicket } from "@/lib/formulacion";
import {
  QrCode,
  X,
  Camera,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: TicketPedido[];
  onSeleccionarTicketParaFormular: (ticket: TicketPedido) => void;
}

export function QRScannerModal({
  isOpen,
  onClose,
  tickets,
  onSeleccionarTicketParaFormular,
}: QRScannerModalProps) {
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [ticketEncontrado, setTicketEncontrado] = useState<TicketPedido | null>(null);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Reproducir sonido sutil de confirmación de escaneo (Web Audio API)
  const reproducirBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Nota A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext bloqueado o no soportado
    }
  };

  // Buscar ticket por código o payload JSON
  const procesarEscaneo = (textoEscaneado: string) => {
    let codigoBuscado = textoEscaneado.trim();

    // Si viene como JSON del QR del ticket web
    if (codigoBuscado.startsWith("{")) {
      try {
        const parsed = JSON.parse(codigoBuscado);
        codigoBuscado = parsed.ticket || parsed.codigoTicket || codigoBuscado;
      } catch {
        // mantener texto original
      }
    }

    // Normalizar
    codigoBuscado = codigoBuscado.toUpperCase().replace(/^TICKET:\s*/i, "").trim();

    const coincidencia = tickets.find(
      (t) =>
        t.codigoTicket.toUpperCase() === codigoBuscado ||
        t.id.toUpperCase() === codigoBuscado ||
        t.codigoTicket.toUpperCase().includes(codigoBuscado)
    );

    if (coincidencia) {
      reproducirBeep();
      setTicketEncontrado(coincidencia);
      setErrorBusqueda(null);
    } else {
      setTicketEncontrado(null);
      setErrorBusqueda(`No se encontró ningún ticket emitido con el código "${codigoBuscado}". Verifica si pertenece a otra sede.`);
    }
  };

  const detenerCamara = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCamaraActiva(false);
  };

  const iniciarCamara = async () => {
    setErrorCamara(null);
    setCamaraActiva(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorCamara("El navegador no soporta captura de cámara en este entorno.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setCamaraActiva(true);
        escanearFrame();
      }
    } catch (err: unknown) {
      const e = err as Error;
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setErrorCamara("Permiso de cámara denegado. Puedes usar la pistola lectora o escribir el código manualmente.");
      } else {
        setErrorCamara("Cámara física no disponible. Usa el lector USB o ingresa el código.");
      }
    }
  };

  // Iniciar cámara cuando el modal se abre
  useEffect(() => {
    if (!isOpen) {
      detenerCamara();
      return;
    }

    iniciarCamara();

    return () => {
      detenerCamara();
    };
  }, [isOpen]);

  const escanearFrame = () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (qrCode && qrCode.data) {
          procesarEscaneo(qrCode.data);
          // Pausa temporal para evitar lecturas duplicadas
          setTimeout(() => {
            if (isOpen && !ticketEncontrado) {
              animationFrameRef.current = requestAnimationFrame(escanearFrame);
            }
          }, 1500);
          return;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(escanearFrame);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoIngresado.trim()) return;
    procesarEscaneo(codigoIngresado);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-[#0B0F19] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/[0.08] bg-[#0E1528] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg text-white font-medium">
                    Escáner de Tickets &amp; Proformas QR
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold uppercase">
                    Mostrador
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Apunta el visor al PDF del cliente o usa la pistola lectora de códigos USB.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            
            {/* Visor de Cámara con Retícula de Escaneo */}
            <div className="relative rounded-xl overflow-hidden bg-black border border-white/10 aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${camaraActiva ? "block" : "hidden"}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {camaraActiva ? (
                /* Retícula de Escaneo Láser */
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-amber-400/80 rounded-2xl relative shadow-[0_0_25px_rgba(245,158,11,0.25)] flex items-center justify-center">
                    {/* Esquinas destacadas */}
                    <span className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-amber-400" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-amber-400" />
                    <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-amber-400" />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-amber-400" />

                    {/* Láser escaneando */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent absolute animate-pulse" />
                    <span className="text-[10px] font-mono text-amber-300/80 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded">
                      Enfocar QR
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-2 text-[#94A3B8]">
                  <Camera className="w-10 h-10 mx-auto text-[#64748B] opacity-50" />
                  <p className="text-xs text-white">
                    {errorCamara || "Iniciando visor óptico de mostrador..."}
                  </p>
                  <button
                    type="button"
                    onClick={iniciarCamara}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white font-mono inline-flex items-center gap-1.5 cursor-pointer mt-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reintentar Cámara</span>
                  </button>
                </div>
              )}
            </div>

            {/* Input para Pistola de Códigos de Barra / QR (USB) y Teclado */}
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <label className="text-[11px] font-mono text-[#CBD5E1] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-amber-400" />
                  Lector de Pistola USB / Entrada Manual:
                </span>
                <span className="text-[10px] text-[#64748B] font-mono">Presiona Enter</span>
              </label>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={codigoIngresado}
                    onChange={(e) => setCodigoIngresado(e.target.value)}
                    placeholder="Escanea con la pistola o escribe el código (ej. ORD-8492)..."
                    className="w-full bg-[#0E1528] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder:text-[#64748B] focus:outline-hidden focus:border-amber-400/50"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Buscar</span>
                </button>
              </div>
            </form>

            {/* Alerta de Error si no se encuentra */}
            {errorBusqueda && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 font-mono">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorBusqueda}</span>
              </div>
            )}

            {/* Tarjeta de Ticket Encontrado con Acción Directa */}
            {ticketEncontrado && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-[#0E1528] border-2 border-emerald-500/40 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-mono text-base font-bold text-white tracking-wider">
                        {ticketEncontrado.codigoTicket}
                      </span>
                      <span className="text-[10px] font-mono text-[#94A3B8] block">
                        {ticketEncontrado.sucursalNombre}
                      </span>
                    </div>
                  </div>

                  <div>
                    {ticketEncontrado.estado === "completado" ? (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        YA ENTREGADO
                      </span>
                    ) : ticketEncontrado.estado === "expirado" ? (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        EXPIRADO (+24H)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        VIGENTE EN MOSTRADOR
                      </span>
                    )}
                  </div>
                </div>

                {/* Cliente */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-[#64748B] block uppercase">Cliente:</span>
                    <strong className="text-white text-sm">{ticketEncontrado.clienteNombre}</strong>
                    <span className="text-[11px] font-mono text-[#94A3B8] block">
                      WhatsApp: {ticketEncontrado.clienteTelefono}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#64748B] block uppercase">Total a Cobrar:</span>
                    <strong className="text-lg text-amber-300 font-mono">{ticketEncontrado.total} Bs</strong>
                  </div>
                </div>

                {/* Fragancias a Preparar */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                    Fórmulas Requeridas:
                  </span>
                  <div className="space-y-1">
                    {ticketEncontrado.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded bg-white/[0.03] text-xs font-mono"
                      >
                        <span className="text-white">
                          {item.cantidad}x <strong>{item.perfume.nombre}</strong> ({item.presentacion.mililitros}ml)
                        </span>
                        <span className="text-amber-400">{item.presentacion.precio * item.cantidad} Bs</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón de Formulación Directa */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSeleccionarTicketParaFormular(ticketEncontrado);
                      onClose();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg font-mono transition-all"
                  >
                    <FlaskConical className="w-4 h-4 stroke-[2.5]" />
                    <span>Abrir Asistente de Formulación en Mostrador</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </motion.div>
            )}

          </div>

          {/* Footer */}
          <div className="p-3.5 bg-[#080C14] border-t border-white/[0.06] flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              Cerrar Escáner
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}

