import { ItemCarrito, ComboPromocion } from "@/types/perfume";

export type { ComboPromocion };

const PROMOS_STORAGE_KEY = "latelier_demo_promos";

export const PROMOCIONES_PREDETERMINADAS: ComboPromocion[] = [
  {
    id: "promo-3x2-30ml",
    nombre: "Colección Discovery 3x2",
    descripcion: "Lleva 3 frascos de 30ml de cualquier aroma y el tercero es cortesía.",
    tipo: "lleva_x_paga_y",
    cantidadFrascos: 3,
    cantidadPaga: 2,
    mililitrosRequeridos: 30,
    ahorroEstimado: 130,
    etiquetaBadge: "3x2 · 30ml",
    activa: true,
  },
  {
    id: "promo-2do-50off",
    nombre: "Dúo Autor 50% OFF",
    descripcion: "El segundo frasco de 50ml recibe 50% de descuento inmediato.",
    tipo: "segundo_descuento",
    cantidadFrascos: 2,
    descuentoPorcentaje: 50,
    mililitrosRequeridos: 50,
    ahorroEstimado: 95,
    etiquetaBadge: "2do al 50%",
    activa: true,
  },
  {
    id: "promo-duo-100ml",
    nombre: "Reserva Privada Dúo",
    descripcion: "Dos frascos de 100ml Extrait de Parfum por precio fijo especial.",
    tipo: "precio_fijo",
    cantidadFrascos: 2,
    mililitrosRequeridos: 100,
    precioCombo: 520,
    ahorroEstimado: 100,
    etiquetaBadge: "Pack 100ml",
    activa: true,
  },
];

function leerPromosLocal(): ComboPromocion[] {
  if (typeof window === "undefined") return PROMOCIONES_PREDETERMINADAS;
  try {
    const raw = localStorage.getItem(PROMOS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROMOS_STORAGE_KEY, JSON.stringify(PROMOCIONES_PREDETERMINADAS));
      return PROMOCIONES_PREDETERMINADAS;
    }
    return JSON.parse(raw) as ComboPromocion[];
  } catch {
    return PROMOCIONES_PREDETERMINADAS;
  }
}

function guardarPromosLocal(promos: ComboPromocion[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROMOS_STORAGE_KEY, JSON.stringify(promos));
  } catch {
    // Ignore
  }
}

export async function obtenerPromocionesDesdeSupabase(): Promise<ComboPromocion[]> {
  return leerPromosLocal();
}

export async function guardarPromocionEnSupabase(
  promo: ComboPromocion
): Promise<{ exito: boolean; error?: string }> {
  const actuales = leerPromosLocal();
  const idx = actuales.findIndex((p) => p.id === promo.id);
  const actualizadas = idx >= 0
    ? actuales.map((p, i) => (i === idx ? promo : p))
    : [...actuales, promo];
  guardarPromosLocal(actualizadas);
  return { exito: true };
}

export async function eliminarPromocionEnSupabase(
  promoId: string
): Promise<{ exito: boolean; error?: string }> {
  const actuales = leerPromosLocal();
  guardarPromosLocal(actuales.filter((p) => p.id !== promoId));
  return { exito: true };
}

export async function togglePromocionEnSupabase(
  promoId: string,
  activa: boolean
): Promise<{ exito: boolean; error?: string }> {
  const actuales = leerPromosLocal();
  guardarPromosLocal(actuales.map((p) => (p.id === promoId ? { ...p, activa } : p)));
  return { exito: true };
}

export function obtenerPromocionesDisponibles(): ComboPromocion[] {
  return leerPromosLocal();
}

export interface ResultadoCalculoPromocion {
  promocionAplicada: ComboPromocion | null;
  descuento: number;
  subtotal: number;
  totalFinal: number;
  mensaje: string;
}

export function calcularMejorPromocion(
  items: ItemCarrito[],
  promocionesDisponibles: ComboPromocion[] = PROMOCIONES_PREDETERMINADAS
): ResultadoCalculoPromocion {
  const subtotal = items.reduce(
    (acc, curr) => acc + curr.presentacion.precio * curr.cantidad,
    0
  );

  if (!items || items.length === 0) {
    return {
      promocionAplicada: null,
      descuento: 0,
      subtotal: 0,
      totalFinal: 0,
      mensaje: "",
    };
  }

  const botellas: { precio: number; mililitros: number; nombre: string }[] = [];
  items.forEach((item) => {
    for (let i = 0; i < item.cantidad; i++) {
      botellas.push({
        precio: item.presentacion.precio,
        mililitros: item.presentacion.mililitros,
        nombre: item.perfume.nombre,
      });
    }
  });

  const activas = promocionesDisponibles.filter((p) => p.activa);

  let mejorPromo: ComboPromocion | null = null;
  let mayorDescuento = 0;
  let mejorMensaje = "";

  for (const promo of activas) {
    const botellasValidas = promo.mililitrosRequeridos > 0
      ? botellas.filter((b) => b.mililitros === promo.mililitrosRequeridos)
      : botellas;

    const conteo = botellasValidas.length;
    if (conteo < promo.cantidadFrascos) {
      continue;
    }

    let descuentoCalculado = 0;
    let mensaje = "";

    if (promo.tipo === "lleva_x_paga_y") {
      const grupos = Math.floor(conteo / promo.cantidadFrascos);
      if (grupos > 0) {
        const ordenadas = [...botellasValidas].sort((a, b) => a.precio - b.precio);
        const botellasGratis = grupos * (promo.cantidadFrascos - (promo.cantidadPaga ?? (promo.cantidadFrascos - 1)));
        for (let i = 0; i < botellasGratis && i < ordenadas.length; i++) {
          descuentoCalculado += ordenadas[i].precio;
        }
        mensaje = `¡${promo.nombre} activada! ${botellasGratis} frasco(s) de cortesía.`;
      }
    } else if (promo.tipo === "segundo_descuento") {
      const pares = Math.floor(conteo / 2);
      if (pares > 0) {
        const pct = (promo.descuentoPorcentaje ?? 50) / 100;
        const ordenadas = [...botellasValidas].sort((a, b) => a.precio - b.precio);
        for (let i = 0; i < pares && i < ordenadas.length; i++) {
          descuentoCalculado += ordenadas[i].precio * pct;
        }
        mensaje = `¡${promo.nombre} activada! ${(promo.descuentoPorcentaje ?? 50)}% OFF en segundo frasco.`;
      }
    } else if (promo.tipo === "precio_fijo" && promo.precioCombo) {
      const grupos = Math.floor(conteo / promo.cantidadFrascos);
      if (grupos > 0) {
        const ordenadas = [...botellasValidas].sort((a, b) => b.precio - a.precio);
        const afectadas = ordenadas.slice(0, grupos * promo.cantidadFrascos);
        const subtotalAfectadas = afectadas.reduce((acc, b) => acc + b.precio, 0);
        const precioConPromo = grupos * promo.precioCombo;
        descuentoCalculado = Math.max(0, subtotalAfectadas - precioConPromo);
        mensaje = `¡${promo.nombre} activado! Precio especial de ${promo.precioCombo * grupos} Bs.`;
      }
    } else if (promo.tipo === "descuento_porcentaje" && promo.descuentoPorcentaje) {
      const subtotalAfectadas = botellasValidas.reduce((acc, b) => acc + b.precio, 0);
      descuentoCalculado = subtotalAfectadas * (promo.descuentoPorcentaje / 100);
      mensaje = `¡${promo.descuentoPorcentaje}% de descuento por volumen aplicado!`;
    }

    if (descuentoCalculado > mayorDescuento) {
      mayorDescuento = descuentoCalculado;
      mejorPromo = promo;
      mejorMensaje = mensaje;
    }
  }

  const descuentoFinal = Math.round(mayorDescuento * 100) / 100;
  const totalFinal = Math.max(0, Math.round((subtotal - descuentoFinal) * 100) / 100);

  return {
    promocionAplicada: mejorPromo,
    descuento: descuentoFinal,
    subtotal,
    totalFinal,
    mensaje: mejorMensaje,
  };
}
