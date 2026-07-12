import { Injectable, signal, inject } from '@angular/core';
import { DbService } from '../../services/db.service';
import { Cita } from '../models/clinica.model';
import type { SlotCita } from '../models/agenda.model';

export type { SlotCita };

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private readonly db = inject(DbService);

  private readonly _citas = signal<Cita[]>([]);
  public readonly citas = this._citas.asReadonly();

  constructor() {
    this.cargarDatos();
  }

  cargarDatos() {
    this._citas.set(this.db.getCitas());
  }

  obtenerDisponibilidad(medicoId: number, fecha: string): SlotCita[] {
    return this.db.obtenerDisponibilidad(medicoId, fecha);
  }

  crearCita(datos: Omit<Cita, 'id' | 'estado'>): { success: boolean; error?: string; citaId?: number } {
    const res = this.db.crearCita(datos);
    this.cargarDatos();
    return res;
  }

  cancelarCita(id: number, motivo: string): boolean {
    const ok = this.db.cancelarCita(id, motivo);
    this.cargarDatos();
    return ok;
  }

  completarCita(id: number): boolean {
    const ok = this.db.completarCita(id);
    this.cargarDatos();
    return ok;
  }

  pagarCita(id: number, cajeroId: number, tarifaFinal: number, metodoPago: 'Efectivo' | 'Tarjeta' | 'QR'): boolean {
    const ok = this.db.pagarCita(id, cajeroId, tarifaFinal, metodoPago);
    this.cargarDatos();
    return ok;
  }
}
