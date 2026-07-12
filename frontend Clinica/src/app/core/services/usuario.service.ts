import { Injectable, signal, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Usuario, EstadoUsuario } from '../models/usuario.model';
import { DbService } from '../../services/db.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly db = inject(DbService);

  private readonly _usuarios = signal<Usuario[]>([]);
  public readonly usuarios = this._usuarios.asReadonly();

  constructor() {
    this.cargarDatos();
  }

  cargarDatos() {
    this._usuarios.set(this.db.getUsuarios());
  }

  crearUsuario(nuevoUsuario: Omit<Usuario, 'id'>): Observable<any> {
    const res = this.db.crearUsuario(nuevoUsuario);
    if (res.success) this.cargarDatos();
    return of(res);
  }

  actualizarUsuario(id: number, datos: Partial<Usuario>): Observable<any> {
    const res = this.db.actualizarUsuario(id, datos);
    if (res.success) this.cargarDatos();
    return of(res);
  }

  cambiarEstado(id: number, nuevoEstado: EstadoUsuario): Observable<any> {
    const res = this.db.cambiarEstadoUsuario(id, nuevoEstado);
    if (res.success) this.cargarDatos();
    return of(res);
  }
}
