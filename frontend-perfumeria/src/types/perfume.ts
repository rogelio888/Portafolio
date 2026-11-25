export type Genero = 'unisex' | 'masculino' | 'femenino';

export interface Presentacion {
  id: string;
  mililitros: number;
  precio: number;
  envaseTipo?: string;
}

export interface NotaOlfativa {
  nombre: string;
  etapa: 'salida' | 'corazon' | 'fondo';
}

export interface Perfume {
  id: string;
  nombre: string;
  inspiracionEn: string;
  marcaReferencia: string;
  genero: Genero;
  familiaOlfativa: string;
  estela: string;
  descripcion: string;
  imagenUrl: string;
  destacado: boolean;
  notas: {
    salida: string[];
    corazon: string[];
    fondo: string[];
  };
  presentaciones: Presentacion[];
}

export interface Sucursal {
  id: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  whatsapp: string;
  horario: string;
  mapsUrl?: string;
  embedUrl?: string;
}

export interface InsumosMostrador {
  frascos30ml: number;
  frascos50ml: number;
  frascos100ml: number;
  bolsasConLogo: number;
}

export type TipoMecanicaPromocion =
  | 'precio_fijo'
  | 'lleva_x_paga_y'
  | 'segundo_descuento'
  | 'descuento_porcentaje';

export interface ComboPromocion {
  id: string;
  nombre: string;
  descripcion: string;
  tipo?: TipoMecanicaPromocion;
  cantidadFrascos: number;
  cantidadPaga?: number;
  descuentoPorcentaje?: number;
  mililitrosRequeridos: number;
  precioCombo?: number;
  ahorroEstimado?: number;
  activa?: boolean;
  etiquetaBadge?: string;
}

export interface StockPorSucursal {
  perfumeId: string;
  sucursalId: string;
  unidades: number;
  agotado: boolean;
}

export interface ItemCarrito {
  perfume: Perfume;
  presentacion: Presentacion;
  cantidad: number;
}

