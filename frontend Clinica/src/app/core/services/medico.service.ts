import { Injectable, signal, inject } from '@angular/core';
import { DbService } from '../../services/db.service';
import { Medico, EstadoMedico } from '../models/clinica.model';
import { EspecialidadService } from './especialidad.service';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private readonly db = inject(DbService);
  private readonly especialidadService = inject(EspecialidadService);

  private readonly _medicos = signal<Medico[]>([]);
  public readonly medicos = this._medicos.asReadonly();

  constructor() {
    this.cargarDatos();
  }

  cargarDatos() {
    this._medicos.set(this.db.getMedicos());
  }

  crearMedico(datos: Omit<Medico, 'id' | 'usuarioId' | 'estado'>): { success: boolean; error?: string } {
    const res = this.db.crearMedico(datos);
    this.cargarDatos();
    return res;
  }

  actualizarMedico(id: number, datos: Partial<Medico>): { success: boolean; error?: string } {
    const res = this.db.actualizarMedico(id, datos);
    this.cargarDatos();
    return res;
  }

  eliminarMedico(id: number): boolean {
    const ok = this.db.eliminarMedico(id);
    this.cargarDatos();
    return ok;
  }

  cambiarEstado(id: number, nuevoEstado: EstadoMedico): boolean {
    const ok = this.db.cambiarEstadoMedico(id, nuevoEstado);
    this.cargarDatos();
    return ok;
  }

  obtenerNombreEspecialidad(id: number): string {
    const esp = this.especialidadService.especialidades().find(e => e.id === id);
    return esp ? esp.nombre : 'Sin asignar';
  }
}
