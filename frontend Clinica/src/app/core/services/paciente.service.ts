import { Injectable, signal, inject } from '@angular/core';
import { DbService } from '../../services/db.service';
import { Paciente, EstadoPaciente } from '../models/clinica.model';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private readonly db = inject(DbService);

  private readonly _pacientes = signal<Paciente[]>([]);
  public readonly pacientes = this._pacientes.asReadonly();

  constructor() {
    this.cargarDatos();
  }

  cargarDatos() {
    this._pacientes.set(this.db.getPacientes());
  }

  crearPaciente(datos: Omit<Paciente, 'id' | 'estado' | 'fechaRegistro'>): { success: boolean; error?: string; paciente?: Paciente } {
    const res = this.db.crearPaciente(datos);
    this.cargarDatos();
    return res;
  }

  actualizarPaciente(id: number, datos: Partial<Paciente>): { success: boolean; error?: string } {
    const res = this.db.actualizarPaciente(id, datos);
    this.cargarDatos();
    return res;
  }

  cambiarEstado(id: number, nuevoEstado: EstadoPaciente): boolean {
    const ok = this.db.cambiarEstadoPaciente(id, nuevoEstado);
    this.cargarDatos();
    return ok;
  }
}
