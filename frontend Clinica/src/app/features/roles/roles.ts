import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RolService, MODULOS_SISTEMA } from '../../core/services/rol.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Rol } from '../../core/models/usuario.model';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})
export class Roles {
  private readonly rolService = inject(RolService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly fb = inject(FormBuilder);

  public readonly roles = this.rolService.roles;
  public readonly modulosSistema = MODULOS_SISTEMA;
  
  // UI State - Panel Principal (Crear/Editar)
  public panelAbierto = signal(false);
  public modoEdicion = signal(false);
  public idEnEdicion = signal<number | null>(null);
  public errorMessage = signal<string | null>(null);

  // UI State - Panel de Permisos
  public panelPermisosAbierto = signal(false);
  public rolActualPermisos = signal<Rol | null>(null);
  public permisosSeleccionados = signal<string[]>([]);
  public permisosErrorMessage = signal<string | null>(null);

  // Formulario Principal
  public rolForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]]
  });

  // --- MÉTODOS DEL PANEL PRINCIPAL (CRUD) ---
  abrirPanelNuevo(): void {
    this.modoEdicion.set(false);
    this.idEnEdicion.set(null);
    this.errorMessage.set(null);
    this.rolForm.reset();
    this.panelAbierto.set(true);
  }

  abrirPanelEdicion(rol: Rol): void {
    this.modoEdicion.set(true);
    this.idEnEdicion.set(rol.id);
    this.errorMessage.set(null);
    this.rolForm.patchValue({ nombre: rol.nombre });
    this.panelAbierto.set(true);
  }

  cerrarPanel(): void {
    this.panelAbierto.set(false);
  }

  guardar(): void {
    if (this.rolForm.invalid) {
      this.rolForm.markAllAsTouched();
      return;
    }

    const { nombre } = this.rolForm.value;
    
    if (this.modoEdicion()) {
      const id = this.idEnEdicion();
      if (id) {
        this.rolService.actualizarRol(id, nombre).subscribe({
          next: (res) => {
            if (res.success) {
              this.cerrarPanel();
            } else {
              this.errorMessage.set(res.error || 'Error al actualizar el rol.');
            }
          },
          error: (err) => {
            this.errorMessage.set(err.error?.error || 'Error al actualizar el rol.');
          }
        });
      }
    } else {
      this.rolService.crearRol(nombre).subscribe({
        next: (res) => {
          if (res.success) {
            this.cerrarPanel();
          } else {
            this.errorMessage.set(res.error || 'Error al crear el rol.');
          }
        },
        error: (err) => {
          this.errorMessage.set(err.error?.error || 'Error al crear el rol.');
        }
      });
    }
  }

  eliminarRol(rol: Rol, e: Event): void {
    e.stopPropagation();
    
    if (confirm(`¿Estás seguro que deseas eliminar el rol "${rol.nombre}"?`)) {
      this.rolService.eliminarRol(rol.id).subscribe({
        next: (res) => {
          if (!res.success) {
            alert(res.error); 
          }
        },
        error: (err) => {
          alert(err.error?.error || 'Error al eliminar el rol.');
        }
      });
    }
  }

  contarUsuarios(rolId: number): number {
    return this.usuarioService.usuarios().filter(u => u.rolId === rolId).length;
  }

  // --- MÉTODOS DEL PANEL DE PERMISOS ---
  abrirPanelPermisos(rol: Rol, e: Event): void {
    e.stopPropagation();
    this.rolActualPermisos.set(rol);
    this.permisosSeleccionados.set([...rol.permisos]);
    this.permisosErrorMessage.set(null);
    this.panelPermisosAbierto.set(true);
  }

  cerrarPanelPermisos(): void {
    this.panelPermisosAbierto.set(false);
    this.rolActualPermisos.set(null);
  }

  togglePermiso(moduloId: string): void {
    const rol = this.rolActualPermisos();
    if (!rol || rol.id === 1) return; // Superadmin no puede modificarse por UX

    const actuales = this.permisosSeleccionados();
    if (actuales.includes(moduloId)) {
      this.permisosSeleccionados.set(actuales.filter(id => id !== moduloId));
    } else {
      this.permisosSeleccionados.set([...actuales, moduloId]);
    }
  }

  tienePermiso(moduloId: string): boolean {
    return this.permisosSeleccionados().includes(moduloId);
  }

  guardarPermisos(): void {
    const rol = this.rolActualPermisos();
    if (!rol) return;

    this.rolService.actualizarPermisos(rol.id, this.permisosSeleccionados()).subscribe({
      next: (res) => {
        if (res.success) {
          this.cerrarPanelPermisos();
        } else {
          this.permisosErrorMessage.set(res.error || 'Error al guardar permisos.');
        }
      },
      error: (err) => {
        this.permisosErrorMessage.set(err.error?.error || 'Error al guardar permisos.');
      }
    });
  }
}
