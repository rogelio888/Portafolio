export interface RespaldoHistorial {
  id: number;
  fechaHora: Date;
  usuario: string;
  tamanoBytes: number;
  estado: 'Exitoso' | 'Fallido';
  nombreArchivo: string;
}
