import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService, SlotCita } from '../../core/services/cita.service';
import { MedicoService } from '../../core/services/medico.service';
import { PacienteService } from '../../core/services/paciente.service';
import { Cita } from '../../core/models/clinica.model';

@Component({
  selector: 'app-panel-medico',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './panel-medico.html',
  styleUrl: './panel-medico.css'
})
export class PanelMedico {
  private readonly citaService = inject(CitaService);
  public readonly medicoService = inject(MedicoService);
  public readonly pacienteService = inject(PacienteService);

  // Simulador de Login
  public medicosActivos = computed(() => this.medicoService.medicos().filter(m => m.estado === 'Activo'));
  public medicoLogueado = signal<number | null>(null);

  // Datos del día
  public fechaHoy = new Date().toISOString().split('T')[0];
  
  public citasDelDia = computed(() => {
    const medId = this.medicoLogueado();
    if (!medId) return [];

    // Citas de HOY, ordenadas por hora, que estén Programadas o Completadas
    return this.citaService.citas()
      .filter(c => c.medicoId === medId && c.fecha === this.fechaHoy && c.estado !== 'Cancelada')
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  });

  // Estado del Modal de Control
  public panelControl = false;
  public pacienteAControl: { id: number, nombre: string } | null = null;
  public fechaControl = signal<string>(this.fechaHoy);
  public turnosControl = signal<SlotCita[]>([]);
  public sinHorarioControl = signal(false);

  // Mensajes de estado UI
  public mensajeEstado = signal<{tipo: 'exito' | 'error' | 'info', texto: string} | null>(null);

  constructor() {
    // Si la fecha de control cambia, recargar la disponibilidad de ESE doctor en esa fecha futura
    effect(() => {
      const medId = this.medicoLogueado();
      const fecha = this.fechaControl();
      
      if (medId && fecha && this.panelControl) {
        const slots = this.citaService.obtenerDisponibilidad(medId, fecha);
        this.turnosControl.set(slots);
        this.sinHorarioControl.set(slots.length === 0);
      }
    });
  }

  // ACCIONES
  marcarComoCompletada(citaId: number) {
    const ok = this.citaService.completarCita(citaId);
    if (ok) {
      this.mostrarMensaje('exito', 'Consulta marcada como completada.');
    } else {
      this.mostrarMensaje('error', 'No se pudo actualizar la cita.');
    }
  }

  abrirAgendamientoControl(cita: Cita) {
    const paciente = this.pacienteService.pacientes().find(p => p.id === cita.pacienteId);
    if (!paciente) return;

    this.pacienteAControl = { id: paciente.id, nombre: paciente.nombre };
    
    // Sugerir fecha 7 días después por defecto
    const fechaSug = new Date();
    fechaSug.setDate(fechaSug.getDate() + 7);
    this.fechaControl.set(fechaSug.toISOString().split('T')[0]);
    
    this.panelControl = true;
  }

  cerrarPanelControl() {
    this.panelControl = false;
    this.pacienteAControl = null;
  }

  agendarControl(turno: SlotCita) {
    if (!turno.disponible || !this.pacienteAControl || !this.medicoLogueado()) return;

    const res = this.citaService.crearCita({
      medicoId: this.medicoLogueado()!,
      pacienteId: this.pacienteAControl.id,
      fecha: this.fechaControl(),
      horaInicio: turno.horaInicio,
      horaFin: turno.horaFin,
      esControl: true // FLAG IMPORTANTE DE LA HU12
    });

    if (res.success) {
      this.mostrarMensaje('exito', 'Cita de control agendada exitosamente.');
      this.cerrarPanelControl();
    } else {
      this.mostrarMensaje('error', res.error || 'Error desconocido.');
    }
  }

  private mostrarMensaje(tipo: 'exito' | 'error' | 'info', texto: string) {
    this.mensajeEstado.set({ tipo, texto });
    setTimeout(() => this.mensajeEstado.set(null), 3000);
  }

  // Utils
  getNombrePaciente(id: number): string {
    return this.pacienteService.pacientes().find(p => p.id === id)?.nombre || 'Desconocido';
  }
}
