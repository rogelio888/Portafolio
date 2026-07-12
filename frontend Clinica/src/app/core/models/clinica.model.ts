export type EstadoEspecialidad = 'Vigente' | 'Descontinuada';

export interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
  estado: EstadoEspecialidad;
}

export type EstadoMedico = 'Activo' | 'Inactivo' | 'Vacaciones';

export interface Medico {
  id: number;
  nombre: string;
  ci: string;
  telefono: string;
  especialidadId: number;
  usuarioId: number; // ID vinculado al sistema de login
  estado: EstadoMedico;
}

export interface HorarioRegular {
  medicoId: number;
  diaSemana: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  horaInicio: string; // "08:00"
  horaFin: string; // "14:00"
  duracionConsulta: number; // en minutos, ej. 30, 45, 60
}

export type TipoExcepcion = 'Feriado' | 'Vacaciones' | 'Personal';

export interface ExcepcionHorario {
  id: number;
  medicoId: number;
  fecha: string; // "YYYY-MM-DD"
  motivo: TipoExcepcion;
}

export type EstadoPaciente = 'Activo' | 'Inactivo';
export type Genero = 'Masculino' | 'Femenino' | 'Otro';

export interface Paciente {
  id: number;
  nombre: string;
  ci: string;
  telefono: string;
  correo?: string; // Opcional
  fechaNacimiento?: string; // Opcional, formato YYYY-MM-DD
  genero?: Genero; // Opcional
  estado: EstadoPaciente;
  fechaRegistro: string;
}

export type EstadoCita = 'Programada' | 'Completada' | 'Cancelada';
export type EstadoPago = 'Pendiente' | 'Pagado';

export interface Cita {
  id: number;
  pacienteId: number;
  medicoId: number;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  estado: EstadoCita;
  motivoCancelacion?: string;
  esControl?: boolean;
  estadoPago?: EstadoPago;
  metodoPago?: 'Efectivo' | 'Tarjeta' | 'QR';
  tarifa?: number;
  cajeroId?: number;
}

export interface Comprobante {
  id: number;
  numeroCorrelativo: string; // "COMP-000001"
  citaId: number;
  pacienteId: number;
  medicoId: number;
  monto: number;
  metodoPago: 'Efectivo' | 'Tarjeta' | 'QR';
  fechaEmision: string; // ISO date string
  cajeroId: number;
}
