import { Injectable, signal, inject } from '@angular/core';
import { DbService } from '../../services/db.service';
import type { AccionBitacora, RegistroBitacora } from '../models/bitacora.model';

export type { AccionBitacora, RegistroBitacora };

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  private readonly db = inject(DbService);

  private readonly _logs = signal<RegistroBitacora[]>([]);
  public readonly logs = this._logs.asReadonly();

  constructor() {
    this.cargarDatos();
  }

  cargarDatos() {
    this._logs.set(this.db.getBitacora());
  }

  registrar(_modulo: string, _accion: AccionBitacora, _detalle: string): void {
    // El registro real ocurre dentro de cada operación de DbService (crearMedico,
    // crearPaciente, etc.), que ya conoce el actor autenticado. Este método se
    // conserva para no romper las firmas de los servicios que lo invocan, y
    // simplemente refresca la vista local con lo que DbService ya registró.
    this.cargarDatos();
  }
}
