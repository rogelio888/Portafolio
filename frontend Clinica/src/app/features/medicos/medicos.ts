import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicoService } from '../../core/services/medico.service';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { Medico, EstadoMedico } from '../../core/models/clinica.model';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medicos.html',
  styleUrl: './medicos.css'
})
export class Medicos {
  public readonly medicoService = inject(MedicoService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly fb = inject(FormBuilder);

  public medicos = this.medicoService.medicos;
  
  // Computed property: Solo especialidades Vigentes para el formulario
  public especialidadesVigentes = computed(() => 
    this.especialidadService.especialidades().filter(e => e.estado === 'Vigente')
  );

  public panelAbierto = false;
  public modoEdicion = false;
  public medicoEditando: Medico | null = null;
  public errorMensaje = '';

  public form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(4)]],
    ci: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    especialidadId: ['', [Validators.required]]
  });

  abrirPanelNuevo() {
    this.modoEdicion = false;
    this.medicoEditando = null;
    this.form.reset();
    
    // Si estamos creando un médico, habilitamos el CI (ya que genera el usuario)
    this.form.get('ci')?.enable();
    
    this.errorMensaje = '';
    this.panelAbierto = true;
  }

  abrirPanelEdicion(medico: Medico) {
    this.modoEdicion = true;
    this.medicoEditando = medico;
    
    this.form.patchValue({
      nombre: medico.nombre,
      ci: medico.ci,
      telefono: medico.telefono,
      especialidadId: medico.especialidadId
    });
    
    // Al editar, deshabilitamos el CI porque está vinculado a la cuenta de usuario generada
    this.form.get('ci')?.disable();

    this.errorMensaje = '';
    this.panelAbierto = true;
  }

  cerrarPanel() {
    this.panelAbierto = false;
  }

  guardar() {
    if (this.form.invalid) return;

    this.errorMensaje = '';
    // getRawValue() obtiene los valores incluso de campos deshabilitados (como el CI)
    const datos = this.form.getRawValue();
    datos.especialidadId = Number(datos.especialidadId);

    if (this.modoEdicion && this.medicoEditando) {
      const res = this.medicoService.actualizarMedico(this.medicoEditando.id, datos);
      if (res.success) {
        this.cerrarPanel();
      } else {
        this.errorMensaje = res.error || 'Error al actualizar.';
      }
    } else {
      const res = this.medicoService.crearMedico(datos);
      if (res.success) {
        this.cerrarPanel();
      } else {
        this.errorMensaje = res.error || 'Error al crear.';
      }
    }
  }

  cambiarEstado(id: number, evento: any) {
    const nuevoEstado = evento.target.value as EstadoMedico;
    this.medicoService.cambiarEstado(id, nuevoEstado);
  }
}
