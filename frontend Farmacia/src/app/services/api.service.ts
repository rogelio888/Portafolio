import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DbService } from './db.service';

/**
 * Fachada que preserva la interfaz Observable original de ApiService,
 * pero resuelve contra DbService (localStorage) en lugar de un backend real.
 * Los componentes que la consumen (roles.ts, usuarios.ts) no necesitan cambios.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private db: DbService) {}

  // --- Roles API (HU1) ---

  getRoles(): Observable<any[]> {
    return of(this.db.getRoles()).pipe(delay(200));
  }

  getRole(id: number): Observable<any> {
    const role = this.db.getRole(id);
    return role
      ? of(role).pipe(delay(200))
      : throwError(() => ({ error: { message: 'Rol no encontrado.' } }));
  }

  createRole(role: { name: string; permissions: string[] }): Observable<any> {
    return of(this.db.createRole(role)).pipe(delay(300));
  }

  updateRole(id: number, role: { name: string; permissions: string[] }): Observable<any> {
    const updated = this.db.updateRole(id, role);
    return updated
      ? of(updated).pipe(delay(300))
      : throwError(() => ({ error: { message: 'Rol no encontrado.' } }));
  }

  deleteRole(id: number): Observable<any> {
    this.db.deleteRole(id);
    return of({ success: true }).pipe(delay(300));
  }

  // --- Users API (HU2) ---

  getUsers(search?: string): Observable<any[]> {
    return of(this.db.getUsers(search)).pipe(delay(200));
  }

  getUser(id: number): Observable<any> {
    const user = this.db.getUser(id);
    return user
      ? of(user).pipe(delay(200))
      : throwError(() => ({ error: { message: 'Usuario no encontrado.' } }));
  }

  createUser(user: any): Observable<any> {
    return of(this.db.createUser(user)).pipe(delay(300));
  }

  updateUser(id: number, user: any): Observable<any> {
    const updated = this.db.updateUser(id, user);
    return updated
      ? of(updated).pipe(delay(300))
      : throwError(() => ({ error: { message: 'Usuario no encontrado.' } }));
  }

  deleteUser(id: number): Observable<any> {
    try {
      this.db.deleteUser(id);
      return of({ success: true }).pipe(delay(300));
    } catch (e: any) {
      return throwError(() => ({ error: { message: e.message } })).pipe(delay(200));
    }
  }

  changeUserStatus(id: number, status: 'activo' | 'suspendido'): Observable<any> {
    try {
      const updated = this.db.changeUserStatus(id, status);
      return updated
        ? of(updated).pipe(delay(300))
        : throwError(() => ({ error: { message: 'Usuario no encontrado.' } }));
    } catch (e: any) {
      return throwError(() => ({ error: { message: e.message } })).pipe(delay(200));
    }
  }
}
