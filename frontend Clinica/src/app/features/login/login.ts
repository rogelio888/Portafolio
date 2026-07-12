import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { RolService } from '../../core/services/rol.service';
import { BitacoraService } from '../../core/services/bitacora.service';
import { BackupService } from '../../core/services/backup.service';
import { DbService } from '../../services/db.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly db = inject(DbService);

  // Inyectamos los servicios para disparar su carga inicial al loguear
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService = inject(RolService);
  private readonly bitacoraService = inject(BitacoraService);
  private readonly backupService = inject(BackupService);

  correo = '';
  clave = '';
  errorMessage = '';
  isResetting = false;

  fillDemo(correo: string, clave: string): void {
    this.correo = correo;
    this.clave = clave;
  }

  resetDemo(): void {
    this.isResetting = true;
    this.db.resetDemoData();
    this.correo = '';
    this.clave = '';
    this.errorMessage = '';
    setTimeout(() => { this.isResetting = false; }, 400);
  }

  ingresar(): void {
    if (!this.correo || !this.clave) {
      this.errorMessage = 'Debe ingresar su correo y contraseña.';
      return;
    }

    this.errorMessage = '';

    this.auth.login(this.correo, this.clave).subscribe({
      next: (res) => {
        if (res.success) {
          // Forzar la recarga de datos en los servicios al iniciar sesión
          this.usuarioService.cargarDatos();
          this.rolService.cargarDatos();
          this.bitacoraService.cargarDatos();
          this.backupService.cargarDatos();

          this.router.navigateByUrl('/dashboard');
        } else {
          this.errorMessage = res.error || 'Credenciales incorrectas.';
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Error al conectar con el servidor.';
      }
    });
  }
}
