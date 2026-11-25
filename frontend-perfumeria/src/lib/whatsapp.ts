import { ItemCarrito, Sucursal, ComboPromocion } from "@/types/perfume";
import { sanitizeTexto, LIMITES_SISTEMA } from "@/lib/validation";

export function generarMensajePedidoWhatsApp({
  sucursal,
  items,
  comboAplicado,
  total,
  nombreCliente,
}: {
  sucursal: Sucursal;
  items: ItemCarrito[];
  comboAplicado?: ComboPromocion | null;
  total: number;
  nombreCliente?: string;
}): string {
  const lineas: string[] = [];

  lineas.push("*NUEVO PEDIDO • L'ATELIER PERFUMERÍA*");
  lineas.push("───────────────────────────");

  const nombreLimpio = sanitizeTexto(nombreCliente, LIMITES_SISTEMA.MAX_LONGITUD_NOMBRE);
  if (nombreLimpio.length > 0) {
    lineas.push(`*Cliente:* ${nombreLimpio}`);
  }

  lineas.push(`*Sucursal de recojo / entrega:* ${sucursal.nombre} (${sucursal.ciudad})`);
  lineas.push("");

  if (comboAplicado) {
    lineas.push(`*PROMOCIÓN APLICADA:* ${comboAplicado.nombre}`);
    lineas.push(`   _Ahorro estimado: ${(comboAplicado.ahorroEstimado ?? 0).toFixed(0)} Bs_`);
    lineas.push("");
  }

  lineas.push("*Detalle del Pedido:*");
  items.forEach((item, index) => {
    const cantSegura = Math.max(1, Math.min(LIMITES_SISTEMA.MAX_CANTIDAD_POR_ITEM, Math.floor(item.cantidad || 1)));
    const precioSeguro = Math.max(0, item.presentacion.precio || 0);

    lineas.push(
      `${index + 1}. *${sanitizeTexto(item.perfume.nombre)}* [${item.presentacion.mililitros}ml]`
    );
    lineas.push(
      `   • Casa: _${sanitizeTexto(item.perfume.marcaReferencia)}_ · Concentración 30% Parfum`
    );
    lineas.push(
      `   • Cantidad: ${cantSegura} x ${precioSeguro} Bs = *${(cantSegura * precioSeguro)} Bs*`
    );
  });

  lineas.push("───────────────────────────");
  lineas.push(`*TOTAL A PAGAR: ${Math.max(0, total).toFixed(0)} Bs*`);
  lineas.push("───────────────────────────");
  lineas.push("_Hola, he armado este pedido desde su catálogo web y deseo coordinar el pago y la entrega/recojo. ¿Tienen disponibilidad inmediata?_");

  const textoCompleto = lineas.join("\n");
  const urlEncoded = encodeURIComponent(textoCompleto);

  return `https://wa.me/${sucursal.whatsapp}?text=${urlEncoded}`;
}

