export type RolUsuario = "superadmin" | "encargado_sede" | "vendedor";

export interface UsuarioSistema {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  sucursalId?: string; // Sede asignada (ej: "suc-1" para La Paz, "suc-2" para Santa Cruz)
  activo: boolean;
  ultimoAcceso?: string;
  creadoEn: string;
}

export interface SesionUsuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  sucursalId?: string;
  exp: number; // Unix timestamp en segundos
}

