import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { ItemCarrito, Sucursal, ComboPromocion } from "@/types/perfume";

export interface DatosTicketRetiro {
  codigoTicket: string;
  fechaEmision: string;
  fechaExpiracion?: string;
  sucursal: Sucursal;
  clienteNombre: string;
  clienteTelefono?: string;
  items: ItemCarrito[];
  comboAplicado: ComboPromocion | null;
  subtotal: number;
  descuento: number;
  totalFinal: number;
}

/**
 * Genera un código de ticket único (ej: ORD-8492)
 */
export function generarCodigoTicket(): string {
  const aleatorio = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${aleatorio}`;
}

/**
 * Genera el documento PDF de alta gama para retiro y preparación en mostrador.
 */
export async function generarTicketPDF(datos: DatosTicketRetiro): Promise<jsPDF> {
  // Crear documento PDF en formato A4 vertical
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // 1. Fondo elegante del encabezado (Obsidiana Profundo #0B1120)
  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, pageWidth, 42, "F");

  // Acento dorado sutil en borde inferior del encabezado
  doc.setFillColor(212, 175, 55); // Oro L'Atelier
  doc.rect(0, 42, pageWidth, 1.2, "F");

  // Tipografía y textos del Header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("L'ATELIER", pageWidth / 2, 18, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text("HAUTE PARFUMERIE · LABORATORIO DE FORMULACIÓN EN MOSTRADOR", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55);
  doc.text("ORDEN DE PREPARACIÓN ARTESANAL & RETIRO EN BOUTIQUE", pageWidth / 2, 33, { align: "center" });

  // 2. Información del Ticket y Sede
  let currentY = 50;

  // Banner dorado de Vigencia 24 Horas
  const fechaVence = datos.fechaExpiracion || "24 horas tras emisión";
  doc.setFillColor(254, 243, 199); // Fondo ámbar claro
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, currentY, contentWidth, 7, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9); // Ámbar oscuro
  doc.text(`RESERVA PREFERENCIAL ACTIVA • VIGENCIA: 24 HORAS (VENCE: ${fechaVence})`, pageWidth / 2, currentY + 4.8, { align: "center" });

  currentY += 10;

  // Caja de Información General
  doc.setDrawColor(226, 232, 240); // Borde gris suave
  doc.setFillColor(248, 250, 252); // Fondo casi blanco
  doc.roundedRect(margin, currentY, contentWidth, 36, 3, 3, "FD");

  // Columna Izquierda: Datos del Ticket
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`TICKET Nº: ${datos.codigoTicket}`, margin + 5, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Emisión: ${datos.fechaEmision}`, margin + 5, currentY + 14);
  doc.text(
    `Cliente: ${datos.clienteNombre.trim() ? datos.clienteNombre : "Cliente Mostrador"}`,
    margin + 5,
    currentY + 20
  );
  doc.text(
    `WhatsApp: ${datos.clienteTelefono?.trim() ? datos.clienteTelefono : "No registrado"}`,
    margin + 5,
    currentY + 26
  );
  doc.setTextColor(16, 185, 129);
  doc.setFont("helvetica", "bold");
  doc.text(`Estado: PENDIENTE DE FORMULACIÓN EN VIVO`, margin + 5, currentY + 32);

  // Columna Derecha: Sede de Retiro
  const colRightX = margin + contentWidth / 2 + 5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`BOUTIQUE DE RETIRO:`, colRightX, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.text(`${datos.sucursal.nombre} (${datos.sucursal.ciudad})`, colRightX, currentY + 14);
  doc.text(`Dirección: ${datos.sucursal.direccion}`, colRightX, currentY + 20, { maxWidth: contentWidth / 2 - 8 });
  doc.text(`Horario: ${datos.sucursal.horario}`, colRightX, currentY + 26);
  doc.text(`Contacto Sede: +${datos.sucursal.whatsapp}`, colRightX, currentY + 32);

  // 3. Tabla de Desglose de Fragancias e Insumos
  currentY += 42;

  // Cabecera de la tabla
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, contentWidth, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("FRAGANCIA SOLICITADA (INSPIRACIÓN)", margin + 4, currentY + 5.5);
  doc.text("PRESENTACIÓN", margin + 85, currentY + 5.5);
  doc.text("CANT.", margin + 120, currentY + 5.5);
  doc.text("INSUMOS A UTILIZAR", margin + 135, currentY + 5.5);
  doc.text("TOTAL", margin + contentWidth - 4, currentY + 5.5, { align: "right" });

  currentY += 8;

  // Filas de Fragancias
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  datos.items.forEach((item, index) => {
    const rowY = currentY + index * 12;
    const isEven = index % 2 === 0;

    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, rowY, contentWidth, 12, "F");
    }

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(item.perfume.nombre, margin + 4, rowY + 5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.text(`Inspiración: ${item.perfume.inspiracionEn} (${item.perfume.marcaReferencia})`, margin + 4, rowY + 9);

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${item.presentacion.mililitros} ml`, margin + 85, rowY + 7);
    doc.text(`${item.cantidad}`, margin + 122, rowY + 7);

    // Insumos técnicos requeridos
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7.5);
    const insumoTexto = `Frasco ${item.presentacion.mililitros}ml + atomizador metálico`;
    doc.text(insumoTexto, margin + 135, rowY + 7);

    // Precio
    const subtotalItem = item.presentacion.precio * item.cantidad;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(`${subtotalItem.toFixed(0)} Bs`, margin + contentWidth - 4, rowY + 7, { align: "right" });
  });

  currentY += datos.items.length * 12 + 6;

  // Si hay combo aplicado, mostrar el ahorro y empaque
  if (datos.comboAplicado) {
    doc.setFillColor(240, 253, 244); // Verde sutil
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, currentY, contentWidth, 10, 2, 2, "FD");

    doc.setTextColor(22, 101, 52);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`PROMOCIÓN APLICADA: ${datos.comboAplicado.nombre}`, margin + 4, currentY + 6.5);

    doc.setFont("helvetica", "normal");
    doc.text(
      `Ahorro Promocional Aplicado: -${datos.descuento.toFixed(0)} Bs`,
      margin + 80,
      currentY + 6.5
    );

    currentY += 14;
  }

  // 4. Totales y Código QR de Verificación
  const totalsY = currentY;

  // Generar Código QR con payload de verificación para el mostrador
  const qrPayload = JSON.stringify({
    ticket: datos.codigoTicket,
    sede: datos.sucursal.id,
    cliente: datos.clienteNombre || "Mostrador",
    total: datos.totalFinal,
    items: datos.items.map((i) => ({
      dupe: i.perfume.inspiracionEn,
      ml: i.presentacion.mililitros,
      qty: i.cantidad,
    })),
  });

  try {
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 180,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });

    // Dibujar Código QR en el PDF
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, totalsY, 40, 40);
    doc.addImage(qrDataUrl, "PNG", margin + 1, totalsY + 1, 38, 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Escanear en mostrador para", margin, totalsY + 44);
    doc.text("validar fórmula y descontar insumos", margin, totalsY + 47.5);
  } catch (err) {
    console.error("Error generando QR para el ticket:", err);
  }

  // Bloque de Totales Financieros (Alineado a la derecha)
  const totalBoxX = margin + 55;
  const totalBoxWidth = contentWidth - 55;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(totalBoxX, totalsY, totalBoxWidth, 40, 2, 2, "FD");

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal Fragancias:", totalBoxX + 6, totalsY + 10);
  doc.text(`${datos.subtotal.toFixed(0)} Bs`, totalBoxX + totalBoxWidth - 6, totalsY + 10, { align: "right" });

  if (datos.descuento > 0) {
    doc.setTextColor(22, 101, 52);
    doc.text(`Descuento Promoción:`, totalBoxX + 6, totalsY + 18);
    doc.text(`-${datos.descuento.toFixed(0)} Bs`, totalBoxX + totalBoxWidth - 6, totalsY + 18, { align: "right" });
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(totalBoxX + 6, totalsY + 24, totalBoxX + totalBoxWidth - 6, totalsY + 24);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("TOTAL A CANCELAR EN CAJA:", totalBoxX + 6, totalsY + 33);

  doc.setTextColor(16, 185, 129); // Verde esmeralda
  doc.setFontSize(14);
  doc.text(`${datos.totalFinal.toFixed(0)} Bs`, totalBoxX + totalBoxWidth - 6, totalsY + 33, { align: "right" });

  // 5. Pie de Página con Garantía de Formulación y Protocolo
  const footerY = 250;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY, margin + contentWidth, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("PROTOCOLO DE FORMULACIÓN EN VIVO (COUNTER EXPERIENCE):", margin, footerY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "1. Al presentarte en la boutique, entrega este comprobante (impreso o en tu smartphone) al asesor perfumista.",
    margin,
    footerY + 11
  );
  doc.text(
    "2. El perfumista extraerá la esencia madre de nuestro estante sellado y la formulará frente a ti con la concentración exacta.",
    margin,
    footerY + 15
  );
  doc.text(
    "3. Se formulará y sellará en atomizador frente a ti con certificación de concentración 30% Parfum.",
    margin,
    footerY + 19
  );
  doc.setTextColor(180, 83, 9);
  doc.setFont("helvetica", "bold");
  doc.text(
    "4. VALIDEZ 24H: Este comprobante caduca automáticamente a las 24 horas. Pasado este plazo, las esencias retornan a mostrador.",
    margin,
    footerY + 23
  );

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("L'Atelier Haute Parfumerie · Todos los derechos reservados · www.latelier-parfums.com", pageWidth / 2, 280, {
    align: "center",
  });

  return doc;
}
