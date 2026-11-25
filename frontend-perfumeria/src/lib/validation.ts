/**
 * Utilidades de validación y sanitización defensiva (Zero-Trust Input Validation)
 * Previene:
 * - Desbordamiento de cantidades (ej. pedir 100,000 perfumes)
 * - Números negativos, decimales corruptos o NaN
 * - Inyecciones de scripts (XSS) y manipulación de precios
 */

export const LIMITES_SISTEMA = {
  MAX_CANTIDAD_POR_ITEM: 10,       // Máximo 10 frascos de una misma fragancia por cliente
  MIN_CANTIDAD_POR_ITEM: 1,        // Mínimo 1 frasco
  MAX_ITEMS_TOTALES_CARRITO: 30,   // Máximo 30 frascos en total en un pedido
  MAX_LONGITUD_NOMBRE: 80,         // Nombre de cliente
  MAX_LONGITUD_TEXTO: 120,         // Nombres de fragancias / notas
  PRECIO_MIN_BS: 1,
  PRECIO_MAX_BS: 5000,
  PRECIO_MIN_USD: 1,               // Alias de compatibilidad
  PRECIO_MAX_USD: 5000,            // Alias de compatibilidad
  INSUMO_MAX_UNIDADES: 5000,
} as const;

/**
 * Sanitiza y acota de forma estricta cualquier cantidad numérica de entrada.
 * Si el usuario envía NaN, negativos, números infinitos o strings maliciosos,
 * se normaliza de forma segura.
 */
export function sanitizeCantidad(
  valor: unknown,
  min: number = LIMITES_SISTEMA.MIN_CANTIDAD_POR_ITEM,
  max: number = LIMITES_SISTEMA.MAX_CANTIDAD_POR_ITEM
): number {
  if (typeof valor !== "number" && typeof valor !== "string") {
    return min;
  }

  const num = typeof valor === "number" ? valor : parseInt(String(valor), 10);

  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return min;
  }

  // Clamping estricto: rechaza números negativos y trunca decimales
  const entero = Math.floor(num);
  return Math.max(min, Math.min(max, entero));
}

/**
 * Sanitiza cadenas de texto eliminando etiquetas HTML y caracteres potencialmente peligrosos.
 */
export function sanitizeTexto(texto: unknown, maxLen: number = LIMITES_SISTEMA.MAX_LONGITUD_TEXTO): string {
  if (typeof texto !== "string") return "";

  return texto
    .replace(/[<>]/g, "") // Remueve tags < y >
    .replace(/javascript:/gi, "") // Neutraliza pseudo-protocolos
    .trim()
    .slice(0, maxLen);
}

/**
 * Valida que un precio se encuentre dentro del rango comercial razonable.
 */
export function sanitizePrecio(precio: unknown): number {
  const num = typeof precio === "number" ? precio : parseFloat(String(precio));
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return 180.0;
  }
  const redondeado = Math.round(num * 100) / 100;
  return Math.max(LIMITES_SISTEMA.PRECIO_MIN_BS, Math.min(LIMITES_SISTEMA.PRECIO_MAX_BS, redondeado));
}

/**
 * Valida cantidades de insumos de almacén (frascos vacíos, bolsas).
 */
export function sanitizeInsumo(unidades: unknown): number {
  const num = typeof unidades === "number" ? unidades : parseInt(String(unidades), 10);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return 0;
  }
  return Math.max(0, Math.min(LIMITES_SISTEMA.INSUMO_MAX_UNIDADES, Math.floor(num)));
}
