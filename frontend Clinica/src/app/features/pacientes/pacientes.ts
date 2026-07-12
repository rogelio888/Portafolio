import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PacienteService } from '../../core/services/paciente.service';
import { Paciente, EstadoPaciente } from '../../core/models/clinica.model';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class Pacientes {
  private readonly pacienteService = inject(PacienteService);
  private readonly fb = inject(FormBuilder);

  public pacientes = this.pacienteService.pacientes;
  
  // Búsqueda
  public terminoBusqueda = signal('');
  public pacientesFiltrados = computed(() => {
    const term = this.terminoBusqueda().toLowerCase().trim();
    if (!term) return this.pacientes();
    
    return this.pacientes().filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.ci.includes(term)
    );
  });

  // Estado del Slide-over
  public panelAbierto = false;
  public modoEdicion = false;
  public pacienteEditando: Paciente | null = null;
  public errorMensaje = '';

  public form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    ci: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    correo: ['', [Validators.email]],
    fechaNacimiento: [''],
    genero: ['']
  });

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }

  abrirPanelNuevo() {
    this.modoEdicion = false;
    this.pacienteEditando = null;
    this.form.reset({ genero: '' }); // Reset con valor por defecto para el select
    this.errorMensaje = '';
    this.panelAbierto = true;
  }

  abrirPanelEdicion(paciente: Paciente) {
    this.modoEdicion = true;
    this.pacienteEditando = paciente;
    this.form.patchValue({
      nombre: paciente.nombre,
      ci: paciente.ci,
      telefono: paciente.telefono,
      correo: paciente.correo || '',
      fechaNacimiento: paciente.fechaNacimiento || '',
      genero: paciente.genero || ''
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
    const datos = this.form.value;

    if (this.modoEdicion && this.pacienteEditando) {
      const res = this.pacienteService.actualizarPaciente(this.pacienteEditando.id, datos);
      if (res.success) {
        this.cerrarPanel();
      } else {
        this.errorMensaje = res.error || 'Error al actualizar.';
      }
    } else {
      const res = this.pacienteService.crearPaciente(datos);
      if (res.success) {
        this.cerrarPanel();
      } else {
        this.errorMensaje = res.error || 'Error al crear.';
      }
    }
  }

  cambiarEstado(id: number, evento: any) {
    const nuevoEstado = evento.target.value as EstadoPaciente;
    this.pacienteService.cambiarEstado(id, nuevoEstado);
  }
}
