import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../core/services/usuario.service';
import { RolService } from '../../core/services/rol.service';
import { Usuario, EstadoUsuario } from '../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios {
  private readonly usuarioService = inject(UsuarioService);
  public readonly rolService = inject(RolService);
  private readonly fb = inject(FormBuilder);

  public readonly usuarios = this.usuarioService.usuarios;
  public readonly rolesDisponibles = this.rolService.roles;
  
  // UI State
  public panelAbierto = signal(false);
  public modoEdicion = signal(false);
  public idEnEdicion = signal<number | null>(null);
  public errorMessage = signal<string | null>(null);

  // Formularios
  public usuarioForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    correo: ['', [Validators.required, Validators.email]],
    rolId: [2, [Validators.required]], // Por defecto ID 2 (Médico)
    estado: ['Activo', [Validators.required]],
    clave: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/)]]
  });

  public readonly estadosDisponibles: EstadoUsuario[] = ['Activo', 'Suspendido'];

  abrirPanelNuevo(): void {
    this.modoEdicion.set(false);
    this.idEnEdicion.set(null);
    this.errorMessage.set(null);
    this.usuarioForm.reset({ rolId: 2, estado: 'Activo' });
    this.usuarioForm.get('clave')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.usuarioForm.get('clave')?.updateValueAndValidity();
    this.panelAbierto.set(true);
  }

  abrirPanelEdicion(usuario: Usuario): void {
    this.modoEdicion.set(true);
    this.idEnEdicion.set(usuario.id);
    this.errorMessage.set(null);
    
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      correo: usuario.correo,
      rolId: usuario.rolId,
      estado: usuario.estado,
      clave: '' 
    });
    
    this.usuarioForm.get('clave')?.clearValidators();
    this.usuarioForm.get('clave')?.updateValueAndValidity();
    
    this.panelAbierto.set(true);
  }

  cerrarPanel(): void {
    this.panelAbierto.set(false);
  }

  guardar(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const formData = this.usuarioForm.value;
    formData.rolId = Number(formData.rolId); // Asegurar que sea numérico
    
    if (this.modoEdicion()) {
      const id = this.idEnEdicion();
      if (id) {
        if (!formData.clave) {
          delete formData.clave;
        }
        this.usuarioService.actualizarUsuario(id, formData).subscribe({
          next: (res) => {
            if (res.success) {
              this.cerrarPanel();
            } else {
              this.errorMessage.set(res.error || 'Error al actualizar.');
            }
          },
          error: (err) => {
            this.errorMessage.set(err.error?.error || 'Error al actualizar.');
          }
        });
      }
    } else {
      this.usuarioService.crearUsuario(formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.cerrarPanel();
          } else {
            this.errorMessage.set(res.error || 'Error al crear.');
          }
        },
        error: (err) => {
          this.errorMessage.set(err.error?.error || 'Error al crear.');
        }
      });
    }
  }

  cambiarEstado(usuario: Usuario, e: Event): void {
    e.stopPropagation();
    const nuevoEstado: EstadoUsuario = usuario.estado === 'Activo' ? 'Suspendido' : 'Activo';
    this.usuarioService.cambiarEstado(usuario.id, nuevoEstado).subscribe({
      error: (err) => console.error('Error al cambiar estado:', err)
    });
  }

  get isEmailInvalid() {
    const c = this.usuarioForm.get('correo');
    return c?.invalid && (c?.dirty || c?.touched);
  }

  get isClaveInvalid() {
    const c = this.usuarioForm.get('clave');
    return c?.invalid && (c?.dirty || c?.touched);
  }
}
