import { ItemCarrito, Perfume } from "@/types/perfume";

export interface RecetaIngredientes {
  mililitrosTotales: number;
  esenciaPuraMl: number;
  alcoholPerfumistaMl: number;
  fijadorMolecularMl: number;
  feromonasMl: number;
  gotasFeromonas: number;
  frascoTipo: string;
  atomizadorTipo: string;
}

export interface MateriaPrimaSede {
  alcoholMl: number;          // Tanque de Alcohol 96º Desodorizado
  fijadorMl: number;          // Tanque de Fijador Molecular DPG
  feromonasMl: number;        // Frasco dosificador de Feromonas
  frascos30ml: number;
  frascos50ml: number;
  frascos100ml: number;
  bolsasConLogo: number;
  esenciasMadreMl: Record<string, number>; // perfumeId -> ml disponibles de esencia
}

export type EstadoTicket = "pendiente" | "completado" | "expirado" | "cancelado";

export interface TicketPedido {
  id: string;                 // Ej: "ORD-849201"
  codigoTicket: string;
  fechaEmision: string;       // ISO string o formato legible
  fechaExpiracion: string;    // ISO string (24 horas tras emisión)
  sucursalId: string;
  sucursalNombre: string;
  clienteNombre: string;
  clienteTelefono: string;
  items: ItemCarrito[];
  subtotal: number;
  descuento: number;
  total: number;
  comboNombre?: string;
  estado: EstadoTicket;
  qrPayload: string;
  atendidoPor?: string;
  fechaCompletado?: string;
}

/**
 * Recetas estándar de formulación de L'Atelier (Extrait de Parfum al 30% de concentración)
 */
export const RECETAS_FORMULACION: Record<number, RecetaIngredientes> = {
  30: {
    mililitrosTotales: 30,
    esenciaPuraMl: 9.0,         // 30%
    alcoholPerfumistaMl: 19.5,  // 65%
    fijadorMolecularMl: 1.2,    // 4%
    feromonasMl: 0.3,           // 1%
    gotasFeromonas: 6,
    frascoTipo: "Frasco Cristal 30ml",
    atomizadorTipo: "Atomizador Metálico 30ml",
  },
  50: {
    mililitrosTotales: 50,
    esenciaPuraMl: 15.0,        // 30%
    alcoholPerfumistaMl: 32.5,  // 65%
    fijadorMolecularMl: 2.0,    // 4%
    feromonasMl: 0.5,           // 1%
    gotasFeromonas: 10,
    frascoTipo: "Frasco Cristal 50ml",
    atomizadorTipo: "Atomizador Metálico 50ml",
  },
  100: {
    mililitrosTotales: 100,
    esenciaPuraMl: 30.0,        // 30%
    alcoholPerfumistaMl: 65.0,  // 65%
    fijadorMolecularMl: 4.0,    // 4%
    feromonasMl: 1.0,           // 1%
    gotasFeromonas: 20,
    frascoTipo: "Frasco Cristal 100ml",
    atomizadorTipo: "Atomizador Metálico 100ml",
  },
};

/**
 * Obtiene la receta de formulación para un frasco dado su tamaño en ml
 */
export function obtenerReceta(mililitros: number): RecetaIngredientes {
  if (RECETAS_FORMULACION[mililitros]) {
    return RECETAS_FORMULACION[mililitros];
  }
  // Cálculo proporcional dinámico si el frasco fuera de otro tamaño
  const esencia = mililitros * 0.3;
  const alcohol = mililitros * 0.65;
  const fijador = mililitros * 0.04;
  const feromonas = mililitros * 0.01;
  return {
    mililitrosTotales: mililitros,
    esenciaPuraMl: Math.round(esencia * 10) / 10,
    alcoholPerfumistaMl: Math.round(alcohol * 10) / 10,
    fijadorMolecularMl: Math.round(fijador * 10) / 10,
    feromonasMl: Math.round(feromonas * 10) / 10,
    gotasFeromonas: Math.round(feromonas * 20),
    frascoTipo: `Frasco Cristal ${mililitros}ml`,
    atomizadorTipo: `Atomizador Metálico ${mililitros}ml`,
  };
}

/**
 * Calcula el total de materias primas que consumirá un pedido completo
 */
export function calcularConsumoTotalPedido(items: ItemCarrito[]): {
  alcoholTotalMl: number;
  fijadorTotalMl: number;
  feromonasTotalMl: number;
  frascos30ml: number;
  frascos50ml: number;
  frascos100ml: number;
  esenciasPorPerfume: Record<string, { perfume: Perfume; mlTotal: number }>;
} {
  let alcoholTotalMl = 0;
  let fijadorTotalMl = 0;
  let feromonasTotalMl = 0;
  let frascos30ml = 0;
  let frascos50ml = 0;
  let frascos100ml = 0;
  const esenciasPorPerfume: Record<string, { perfume: Perfume; mlTotal: number }> = {};

  for (const item of items) {
    const receta = obtenerReceta(item.presentacion.mililitros);
    const cant = item.cantidad;

    alcoholTotalMl += receta.alcoholPerfumistaMl * cant;
    fijadorTotalMl += receta.fijadorMolecularMl * cant;
    feromonasTotalMl += receta.feromonasMl * cant;

    if (item.presentacion.mililitros === 30) frascos30ml += cant;
    else if (item.presentacion.mililitros === 50) frascos50ml += cant;
    else if (item.presentacion.mililitros === 100) frascos100ml += cant;

    if (!esenciasPorPerfume[item.perfume.id]) {
      esenciasPorPerfume[item.perfume.id] = {
        perfume: item.perfume,
        mlTotal: 0,
      };
    }
    esenciasPorPerfume[item.perfume.id].mlTotal += receta.esenciaPuraMl * cant;
  }

  return {
    alcoholTotalMl: Math.round(alcoholTotalMl * 10) / 10,
    fijadorTotalMl: Math.round(fijadorTotalMl * 10) / 10,
    feromonasTotalMl: Math.round(feromonasTotalMl * 10) / 10,
    frascos30ml,
    frascos50ml,
    frascos100ml,
    esenciasPorPerfume,
  };
}

/**
 * Determina el estado del ticket en base a su fecha de expiración (24h)
 */
export function calcularTiempoRestanteTicket(fechaExpiracionIso: string): {
  horasRestantes: number;
  minutosRestantes: number;
  expirado: boolean;
  proximoAVencer: boolean;
  etiquetaTiempo: string;
} {
  const ahora = new Date().getTime();
  const expira = new Date(fechaExpiracionIso).getTime();
  const diferenciaMs = expira - ahora;

  if (diferenciaMs <= 0) {
    return {
      horasRestantes: 0,
      minutosRestantes: 0,
      expirado: true,
      proximoAVencer: false,
      etiquetaTiempo: "Expirado hace más de 24h",
    };
  }

  const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
  const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));
  const proximoAVencer = horas < 4;

  return {
    horasRestantes: horas,
    minutosRestantes: minutos,
    expirado: false,
    proximoAVencer,
    etiquetaTiempo: `${horas}h ${minutos}m restantes`,
  };
}



