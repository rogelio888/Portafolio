import { Injectable, signal, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Rol } from '../models/usuario.model';
import { DbService, MODULOS_SISTEMA } from '../../services/db.service';

export { MODULOS_SISTEMA };

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private readonly db = inject(DbService);

  private readonly _roles = signal<Rol[]>([]);
  public readonly roles = this._roles.asReadonly();

  constructor() {
    this.cargarDatos();
  }

  cargarDatos() {
    this._roles.set(this.db.getRoles());
  }

  crearRol(nombre: string): Observable<any> {
    const res = this.db.crearRol(nombre);
    if (res.success) this.cargarDatos();
    return of(res);
  }

  actualizarRol(id: number, nombre: string): Observable<any> {
    const res = this.db.actualizarRol(id, nombre);
    if (res.success) this.cargarDatos();
    return of(res);
  }

  actualizarPermisos(id: number, permisos: string[]): Observable<any> {
    const res = this.db.actualizarPermisosRol(id, permisos);
    if (res.success) this.cargarDatos();
    return of(res);
  }

  eliminarRol(id: number): Observable<any> {
    const res = this.db.eliminarRol(id);
    if (res.success) this.cargarDatos();
    return of(res);
  }

  obtenerNombreRol(id: number): string {
    const rol = this._roles().find(r => r.id === id);
    return rol ? rol.nombre : 'Desconocido';
  }
}
