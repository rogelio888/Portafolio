import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { DbService } from './db.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private db: DbService,
    private router: Router
  ) {}

  /**
   * Simula el login contra el backend: valida credenciales en DbService (localStorage)
   * y guarda token + perfil, igual que haría una respuesta real de /api/login.
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    const result = this.db.authenticate(credentials.email, credentials.password);

    if (!result) {
      return throwError(() => ({ error: { message: 'Credenciales inválidas. Por favor verifique sus datos.' } })).pipe(
        delay(400)
      );
    }

    return of(result).pipe(
      delay(400),
      tap((res) => {
        localStorage.setItem('authToken', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res.user));
      })
    );
  }

  /**
   * Log out user, clean local storage, and redirect.
   */
  logout(): void {
    const user = this.getCurrentUser();
    this.db.registerLogout(user?.id ?? null);

    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    this.router.navigate(['/login']);
  }

  /**
   * Check if user is logged in.
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Get the current logged-in user profile.
   */
  getCurrentUser(): any {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }

  /**
   * Validate if user has a specific permission.
   * If user is Administrador, they bypass all permission checks (access total).
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Administrador role bypass
    if (user.role?.name === 'Administrador') {
      return true;
    }

    const permissions = user.role?.permissions;
    if (Array.isArray(permissions)) {
      return permissions.includes(permission);
    }

    return false;
  }
}
