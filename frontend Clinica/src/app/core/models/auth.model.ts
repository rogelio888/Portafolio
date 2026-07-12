export interface UserSession {
  id: number;
  nombre: string;
  correo: string;
  rolId: number;
  rolNombre: string;
  permisos: string[];
  estado: string;
}
