import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { DbService } from '../../../services/db.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private db: DbService,
    private cdr: ChangeDetectorRef
  ) {}

  fillDemo(email: string, password: string): void {
    this.email = email;
    this.password = password;
  }

  /**
   * Escotilla de escape del demo: por si un visitante deja los datos en un
   * estado inconsistente (ej. suspende al único administrador), permite
   * volver al estado inicial sin depender de tener una sesión activa.
   */
  resetDemo(): void {
    this.db.resetDemoData();
    this.email = '';
    this.password = '';
    this.notificationService.success('Demo reiniciada. Los datos volvieron a su estado inicial.');
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (!this.email.trim() || !this.password.trim()) {
      this.notificationService.warning('Por favor ingrese su correo y contraseña.');
      return;
    }

    this.loading = true;
    this.authService.login({
      email: this.email.trim(),
      password: this.password.trim()
    }).subscribe({
      next: (res) => {
        this.notificationService.success('Bienvenido de nuevo, ' + res.user.name + '.');
        this.router.navigate(['/app/dashboard']);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message || 'Credenciales inválidas. Por favor verifique sus datos.';
        this.notificationService.error(msg);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
