import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { DbService } from '../../services/db.service';
import type { UserSession } from '../models/auth.model';

export type { UserSession };

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly db = inject(DbService);

  public readonly token = signal<string | null>(localStorage.getItem('clinica_token'));
  public readonly usuario = signal<UserSession | null>(
    localStorage.getItem('clinica_usuario') ? JSON.parse(localStorage.getItem('clinica_usuario')!) : null
  );

  login(correo: string, clave: string): Observable<any> {
    const res = this.db.authenticate(correo, clave);
    if (res.success) {
      localStorage.setItem('clinica_token', res.token!);
      localStorage.setItem('clinica_usuario', JSON.stringify(res.usuario));
      this.token.set(res.token!);
      this.usuario.set(res.usuario!);
    }
    return of(res);
  }

  logout(): void {
    this.db.logout(this.usuario()?.nombre);
    this.limpiarSesionLocal();
  }

  public limpiarSesionLocal() {
    localStorage.removeItem('clinica_token');
    localStorage.removeItem('clinica_usuario');
    this.token.set(null);
    this.usuario.set(null);
    this.router.navigateByUrl('/login');
  }

  isAuthenticated(): boolean {
    return this.token() !== null;
  }

  tienePermiso(permiso: string): boolean {
    const user = this.usuario();
    if (!user) return false;
    return user.permisos.includes(permiso);
  }
}
