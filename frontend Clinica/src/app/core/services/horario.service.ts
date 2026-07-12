import { Injectable, inject } from '@angular/core';
import { DbService } from '../../services/db.service';
import { HorarioRegular, ExcepcionHorario } from '../models/clinica.model';
import type { BloqueHorario } from '../models/agenda.model';

export type { BloqueHorario };

@Injectable({
  providedIn: 'root'
})
export class HorarioService {
  private readonly db = inject(DbService);

  obtenerHorarioMedico(medicoId: number): HorarioRegular[] {
    return this.db.obtenerHorarioMedico(medicoId);
  }

  obtenerExcepcionesMedico(medicoId: number): ExcepcionHorario[] {
    return this.db.obtenerExcepcionesMedico(medicoId);
  }

  guardarHorarioMedico(medicoId: number, horarios: HorarioRegular[]) {
    this.db.guardarHorarioMedico(medicoId, horarios);
  }

  agregarExcepcion(excepcion: Omit<ExcepcionHorario, 'id'>) {
    return this.db.agregarExcepcion(excepcion);
  }

  eliminarExcepcion(id: number) {
    this.db.eliminarExcepcion(id);
  }

  generarBloquesDisponibles(medicoId: number, fechaStr: string): BloqueHorario[] {
    return this.db.generarBloquesDisponibles(medicoId, fechaStr);
  }
}
