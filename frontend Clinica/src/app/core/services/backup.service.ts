import { Injectable, signal, inject } from '@angular/core';
import { DbService } from '../../services/db.service';
import type { RespaldoHistorial } from '../models/backup.model';

export type { RespaldoHistorial };

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private readonly db = inject(DbService);

  private readonly _historial = signal<RespaldoHistorial[]>([]);
  public readonly historial = this._historial.asReadonly();

  constructor() {
    this.cargarDatos();
  }

  cargarDatos() {
    this._historial.set(this.db.getBackupHistorial());
  }

  generarRespaldo(): void {
    const res = this.db.generarRespaldo();
    if (res.success) this.cargarDatos();
  }
}
