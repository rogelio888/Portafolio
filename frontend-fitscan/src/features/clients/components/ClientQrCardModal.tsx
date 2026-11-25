import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Share2, Printer, Dumbbell, ShieldCheck, Copy, Check, Building2, Loader2 } from 'lucide-react';
import type { Client } from '../types/client.types';
import { useToast } from '../../../components/ui/ToastProvider';

interface QrModalProps {
  client: Client | null;
  onClose: () => void;
}

export const ClientQrCardModal: React.FC<QrModalProps> = ({ client, onClose }) => {
  const toast = useToast();
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!client) return null;

  const handleCopyUuid = async () => {
    try {
      await navigator.clipboard.writeText(client.id);
      setCopiedUuid(true);
      toast.success('UUID Copiado', 'ID único copiado al portapapeles.');
      setTimeout(() => setCopiedUuid(false), 2000);
    } catch {
      toast.error('Error al copiar', 'No se pudo acceder al portapapeles.');
    }
  };

  const handlePrint = () => {
    toast.info('Imprimiendo Tarjeta QR', `Enviando credencial de ${client.firstName} ${client.lastName} a la impresora...`);
    window.print();
  };

  const getQrImage = async (svgElement: SVGSVGElement): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const xml = new XMLSerializer().serializeToString(svgElement);
      const svg64 = btoa(unescape(encodeURIComponent(xml)));
      const image64 = 'data:image/svg+xml;base64,' + svg64;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = image64;
    });
  };

  const generateCardCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const cardElement = cardRef.current;
    if (!cardElement) return null;

    const svgElement = cardElement.querySelector('svg');
    if (!svgElement) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 480, 600);
    gradient.addColorStop(0, '#020617');
    gradient.addColorStop(0.5, '#0f172a');
    gradient.addColorStop(1, '#064e3b');
    ctx.fillStyle = gradient;

    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(0, 0, 480, 600, 24);
    } else {
      ctx.rect(0, 0, 480, 600);
    }
    ctx.fill();

    // Border
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Header Title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('FITSCAN GYM', 36, 56);

    // Membership Pill
    const planText = (client.membershipType || 'SOCIO').toUpperCase();
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    const planWidth = ctx.measureText(planText).width;
    const pillX = 444 - planWidth - 24;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(pillX, 36, planWidth + 24, 28, 14);
    } else {
      ctx.rect(pillX, 36, planWidth + 24, 28);
    }
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText(planText, pillX + 12, 55);

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(36, 78);
    ctx.lineTo(444, 78);
    ctx.stroke();

    // Client Name
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${client.firstName} ${client.lastName}`, 240, 120);

    // Branch & Expiration
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Sucursal: ${client.branch_name || 'Sede Central'}`, 240, 148);

    const cleanEndDate = client.endDate ? (client.endDate.includes('T') ? client.endDate.split('T')[0] : client.endDate) : 'N/A';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Válido hasta: ${cleanEndDate}`, 240, 172);

    // QR Code Background Box
    ctx.fillStyle = '#ffffff';
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(120, 198, 240, 240, 20);
    } else {
      ctx.rect(120, 198, 240, 240);
    }
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw QR Code Image
    const qrImg = await getQrImage(svgElement);
    ctx.drawImage(qrImg, 140, 218, 200, 200);

    // ID & Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.fillText(`UUID: ${client.id}`, 240, 480);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('CREDENCIAL OFICIAL DE ACCESO', 240, 520);

    ctx.fillStyle = '#475569';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText('Presenta este código en el torniquete o kiosco', 240, 545);

    return canvas;
  };

  const handleDownload = async () => {
    setIsProcessing(true);
    try {
      const canvas = await generateCardCanvas();
      if (!canvas) throw new Error('No se pudo generar el carnet');

      const safeName = `${client.firstName}_${client.lastName}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Carnet_QR_${safeName}.png`;

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Error al descargar', 'No se pudo procesar la imagen PNG.');
          setIsProcessing(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Descarga Exitosa', `Archivo ${filename} guardado correctamente.`);
        setIsProcessing(false);
      }, 'image/png');
    } catch (err: any) {
      toast.error('Error al generar imagen', err.message || 'Ocurrió un error al procesar el carnet.');
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    setIsProcessing(true);
    try {
      const canvas = await generateCardCanvas();
      const safeName = `${client.firstName}_${client.lastName}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanEndDate = client.endDate ? (client.endDate.includes('T') ? client.endDate.split('T')[0] : client.endDate) : 'N/A';
      
      const shareText = `*Carnet Digital FitScan*\nSocio: ${client.firstName} ${client.lastName}\nMembresía: ${client.membershipType}\nSucursal: ${client.branch_name || 'Sede Central'}\nVigencia: ${cleanEndDate}\nCódigo QR: ${client.qrCode || client.id}`;

      if (canvas && navigator.share && navigator.canShare) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `Carnet_QR_${safeName}.png`, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({
                  title: `Carnet QR - ${client.firstName} ${client.lastName}`,
                  text: shareText,
                  files: [file],
                });
                toast.success('Carnet Compartido', 'El carnet se compartió exitosamente.');
                setIsProcessing(false);
                return;
              } catch (shareErr: any) {
                if (shareErr.name === 'AbortError') {
                  setIsProcessing(false);
                  return;
                }
              }
            }
          }
          // Fallback if file sharing fails or is cancelled
          fallbackShare(shareText);
        }, 'image/png');
      } else {
        fallbackShare(shareText);
      }
    } catch {
      fallbackShare(`Carnet QR - ${client.firstName} ${client.lastName}`);
    }
  };

  const fallbackShare = (text: string) => {
    setIsProcessing(false);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    navigator.clipboard?.writeText(text);
    toast.success('Abriendo WhatsApp', 'Los datos del carnet han sido copiados y preparados para enviar por WhatsApp.');
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 !m-0 z-[9999] bg-slate-950/80 overflow-y-auto flex items-start sm:items-center justify-center p-3 sm:p-4 print:p-0 print:bg-transparent"
      >
        <motion.div
          initial={{ scale: 0.9, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 15 }}
          className="w-full max-w-md my-auto bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative print:border-none print:shadow-none print:p-0"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition-all print:hidden"
          >
            <X className="h-4 w-4" />
          </button>

          <h2 className="text-base sm:text-lg font-bold text-white mb-4 pr-8 text-center print:hidden">Tarjeta Digital de Acceso QR</h2>

          <div
            ref={cardRef}
            id="printable-qr-card"
            className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/70 border border-emerald-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl text-white relative overflow-hidden mb-5 sm:mb-6"
          >
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none print:hidden" />

            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <span className="font-extrabold tracking-wider text-sm">FITSCAN GYM</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                {client.membershipType}
              </span>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 my-2">
              <img
                src={client.photoUrl}
                alt={client.firstName}
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-emerald-500/50 shadow-lg"
              />

              <div>
                <h3 className="text-base font-bold text-white flex items-center justify-center gap-1">
                  {client.firstName} {client.lastName}
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </h3>
                <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1 mt-0.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {client.branch_name || 'Sucursal Sede'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Vence: {client.endDate ? (client.endDate.includes('T') ? client.endDate.split('T')[0] : client.endDate) : 'N/A'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-2xl shadow-xl inline-block border-2 border-emerald-400">
                <QRCodeSVG
                  value={client.qrCode}
                  size={140}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="truncate max-w-[175px] sm:max-w-[240px]">UUID: {client.id}</span>
                <button
                  type="button"
                  onClick={handleCopyUuid}
                  className="p-1 rounded-md bg-slate-800/80 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 transition-colors border border-slate-700/60 flex items-center gap-1 cursor-pointer print:hidden"
                  title="Copiar UUID al portapapeles"
                >
                  {copiedUuid ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-[9px] text-emerald-400 font-sans font-bold">Copiado</span>
                    </>
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 print:hidden">
            <button
              onClick={handlePrint}
              disabled={isProcessing}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-4 w-4 text-emerald-400" />
              Imprimir
            </button>
            <button
              onClick={handleShare}
              disabled={isProcessing}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4 text-emerald-400" />
              )}
              Compartir
            </button>
            <button
              onClick={handleDownload}
              disabled={isProcessing}
              className="col-span-2 sm:col-span-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Descargar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

