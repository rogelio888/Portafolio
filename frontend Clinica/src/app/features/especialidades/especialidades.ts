import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { Especialidad, EstadoEspecialidad } from '../../core/models/clinica.model';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './especialidades.html',
  styleUrl: './especialidades.css'
})
export class Especialidades {
  private readonly especialidadService = inject(EspecialidadService);
  private readonly fb = inject(FormBuilder);

  public readonly especialidades = this.especialidadService.especialidades;
  
  // Estado del Slide-over (Panel lateral)
  public panelAbierto = false;
  public modoEdicion = false;
  public especialidadEditando: Especialidad | null = null;
  public errorMensaje = '';

  public form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', [Validators.required, Validators.maxLength(200)]]
  });

  abrirPanelNuevo() {
    this.modoEdicion = false;
    this.especialidadEditando = null;
    this.form.reset();
    this.errorMensaje = '';
    this.panelAbierto = true;
  }

  abrirPanelEdicion(esp: Especialidad) {
    this.modoEdicion = true;
    this.especialidadEditando = esp;
    this.form.patchValue({
      nombre: esp.nombre,
      descripcion: esp.descripcion
    });
    this.errorMensaje = '';
    this.panelAbierto = true;
  }

  cerrarPanel() {
    this.panelAbierto = false;
  }

  guardar() {
    if (this.form.invalid) return;

    this.errorMensaje = '';
    const { nombre, descripcion } = this.form.value;

    if (this.modoEdicion && this.especialidadEditando) {
      const res = this.especialidadService.actualizarEspecialidad(this.especialidadEditando.id, { nombre, descripcion });
      if (res.success) {
        this.cerrarPanel();
      } else {
        this.errorMensaje = res.error || 'Error al actualizar.';
      }
    } else {
      const res = this.especialidadService.crearEspecialidad(nombre, descripcion);
      if (res.success) {
        this.cerrarPanel();
      } else {
        this.errorMensaje = res.error || 'Error al crear.';
      }
    }
  }

  cambiarEstado(id: number, estadoActual: EstadoEspecialidad) {
    const nuevoEstado = estadoActual === 'Vigente' ? 'Descontinuada' : 'Vigente';
    this.especialidadService.cambiarEstado(id, nuevoEstado);
  }
}
