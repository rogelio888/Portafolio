export type AccionBitacora = 'Creación' | 'Actualización' | 'Eliminación' | 'Autenticación' | 'Permisos';

export interface RegistroBitacora {
  id: number;
  usuario: string;
  fechaHora: Date;
  modulo: string;
  accion: AccionBitacora;
  detalle: string;
}
