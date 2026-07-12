export interface Rol {
  id: number;
  nombre: string;
  permisos: string[];
}

export type EstadoUsuario = 'Activo' | 'Suspendido';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rolId: number; // Relación con el Rol
  rolNombre?: string; // Para mostrar en la tabla fácilmente sin joins en el frontend
  estado: EstadoUsuario;
  clave?: string; // Solo para simulación de base de datos
}
