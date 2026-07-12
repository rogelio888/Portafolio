import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorarioService } from '../../core/services/horario.service';
import { MedicoService } from '../../core/services/medico.service';
import { HorarioRegular, ExcepcionHorario, Medico, TipoExcepcion } from '../../core/models/clinica.model';

interface DiaConfig {
  diaSemana: number; // 0-6
  nombre: string;
  activo: boolean;
  horaInicio: string;
  horaFin: string;
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios.html',
  styleUrl: './horarios.css'
})
export class Horarios {
  private readonly horarioService = inject(HorarioService);
  private readonly medicoService = inject(MedicoService);

  public medicos = this.medicoService.medicos;
  public medicoSeleccionado = signal<number | null>(null);
  
  // Pestañas
  public tabActiva = signal<'regular' | 'excepciones'>('regular');

  // Configuración de Horario Regular
  public duracionGlobal = 30; // Minutos estándar sugerido por el usuario en la HU9
  public diasSemana: DiaConfig[] = [
    { diaSemana: 1, nombre: 'Lunes', activo: false, horaInicio: '08:00', horaFin: '14:00' },
    { diaSemana: 2, nombre: 'Martes', activo: false, horaInicio: '08:00', horaFin: '14:00' },
    { diaSemana: 3, nombre: 'Miércoles', activo: false, horaInicio: '08:00', horaFin: '14:00' },
    { diaSemana: 4, nombre: 'Jueves', activo: false, horaInicio: '08:00', horaFin: '14:00' },
    { diaSemana: 5, nombre: 'Viernes', activo: false, horaInicio: '08:00', horaFin: '14:00' },
    { diaSemana: 6, nombre: 'Sábado', activo: false, horaInicio: '08:00', horaFin: '12:00' },
    { diaSemana: 0, nombre: 'Domingo', activo: false, horaInicio: '08:00', horaFin: '12:00' }
  ];

  // Excepciones
  public excepciones = computed(() => {
    const medId = this.medicoSeleccionado();
    if (!medId) return [];
    return this.horarioService.obtenerExcepcionesMedico(medId);
  });
  
  public nuevaExcepcionFecha = '';
  public nuevaExcepcionMotivo: TipoExcepcion = 'Vacaciones';

  // Alerta UI
  public mensaje = '';
  public esError = false;

  seleccionarMedico(event: any) {
    const id = Number(event.target.value);
    this.medicoSeleccionado.set(id || null);
    this.mensaje = '';

    if (id) {
      this.cargarHorario(id);
    }
  }

  cambiarTab(tab: 'regular' | 'excepciones') {
    this.tabActiva.set(tab);
    this.mensaje = '';
  }

  cargarHorario(medicoId: number) {
    // Resetear
    this.diasSemana.forEach(d => d.activo = false);
    
    const horarios = this.horarioService.obtenerHorarioMedico(medicoId);
    
    if (horarios.length > 0) {
      this.duracionGlobal = horarios[0].duracionConsulta; // Asumimos misma duración para todos sus días
      horarios.forEach(h => {
        const diaConf = this.diasSemana.find(d => d.diaSemana === h.diaSemana);
        if (diaConf) {
          diaConf.activo = true;
          diaConf.horaInicio = h.horaInicio;
          diaConf.horaFin = h.horaFin;
        }
      });
    } else {
      this.duracionGlobal = 30; // default
    }
  }

  guardarHorarioRegular() {
    const medId = this.medicoSeleccionado();
    if (!medId) return;

    const nuevosHorarios: HorarioRegular[] = this.diasSemana
      .filter(d => d.activo)
      .map(d => ({
        medicoId: medId,
        diaSemana: d.diaSemana,
        horaInicio: d.horaInicio,
        horaFin: d.horaFin,
        duracionConsulta: this.duracionGlobal
      }));

    this.horarioService.guardarHorarioMedico(medId, nuevosHorarios);
    this.mostrarMensaje('Horario regular guardado exitosamente.', false);
  }

  agregarExcepcion() {
    const medId = this.medicoSeleccionado();
    if (!medId || !this.nuevaExcepcionFecha) return;

    const exito = this.horarioService.agregarExcepcion({
      medicoId: medId,
      fecha: this.nuevaExcepcionFecha,
      motivo: this.nuevaExcepcionMotivo
    });

    if (exito) {
      this.nuevaExcepcionFecha = ''; // clear form
      this.mostrarMensaje('Excepción agregada. Ese día no habrá disponibilidad.', false);
    } else {
      this.mostrarMensaje('Ya existe una excepción para esa fecha.', true);
    }
  }

  eliminarExcepcion(id: number) {
    this.horarioService.eliminarExcepcion(id);
    this.mostrarMensaje('Excepción eliminada.', false);
  }

  private mostrarMensaje(msj: string, error: boolean) {
    this.mensaje = msj;
    this.esError = error;
    setTimeout(() => this.mensaje = '', 3000);
  }
}
