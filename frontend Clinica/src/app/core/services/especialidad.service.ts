import { Injectable, signal, inject } from '@angular/core';
import { DbService } from '../../services/db.service';
import { Especialidad, EstadoEspecialidad } from '../models/clinica.model';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  private readonly db = inject(DbService);

  private readonly _especialidades = signal<Especialidad[]>([]);
  public readonly especialidades = this._especialidades.asReadonly();

  constructor() {
    this.cargarDatos();
  }

  cargarDatos() {
    this._especialidades.set(this.db.getEspecialidades());
  }

  crearEspecialidad(nombre: string, descripcion: string): { success: boolean; error?: string } {
    const res = this.db.crearEspecialidad(nombre, descripcion);
    this.cargarDatos();
    return res;
  }

  actualizarEspecialidad(id: number, datos: Partial<Especialidad>): { success: boolean; error?: string } {
    const res = this.db.actualizarEspecialidad(id, datos);
    this.cargarDatos();
    return res;
  }

  cambiarEstado(id: number, nuevoEstado: EstadoEspecialidad): boolean {
    const ok = this.db.cambiarEstadoEspecialidad(id, nuevoEstado);
    this.cargarDatos();
    return ok;
  }
}
