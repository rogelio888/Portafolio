export interface BloqueHorario {
  horaInicio: string;
  horaFin: string;
}

export interface SlotCita extends BloqueHorario {
  disponible: boolean;
  citaId?: number;
  pacienteId?: number;
  esControl?: boolean;
}
