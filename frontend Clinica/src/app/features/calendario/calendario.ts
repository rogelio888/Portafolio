import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../core/services/cita.service';
import { MedicoService } from '../../core/services/medico.service';
import { PacienteService } from '../../core/services/paciente.service';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { Cita } from '../../core/models/clinica.model';

type VistaCalendario = 'Mes' | 'Semana' | 'Dia';

interface DiaCalendario {
  fecha: Date;
  esOtroMes: boolean;
  esHoy: boolean;
  citas: Cita[];
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './calendario.html',
  styleUrl: './calendario.css'
})
export class Calendario {
  public readonly citaService = inject(CitaService);
  public readonly medicoService = inject(MedicoService);
  public readonly pacienteService = inject(PacienteService);
  public readonly especialidadService = inject(EspecialidadService);

  public vistaActual = signal<VistaCalendario>('Mes');
  public fechaBase = signal<Date>(new Date());
  
  // Filtros
  public medicos = computed(() => this.medicoService.medicos().filter(m => m.estado === 'Activo'));
  public filtroMedico = signal<number | null>(null);

  // Computados
  public tituloVista = computed(() => {
    const f = this.fechaBase();
    if (this.vistaActual() === 'Mes') {
      return f.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
    } else if (this.vistaActual() === 'Semana') {
      return `Semana del ${this.obtenerInicioSemana(f).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
    } else {
      return f.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
  });

  public diasMes = computed(() => this.generarCalendarioMensual());
  public diasSemana = computed(() => this.generarCalendarioSemanal());
  public diaUnico = computed(() => this.generarCalendarioDiario());

  // Modal Detalles
  public panelDetalle = false;
  public citaSeleccionada: Cita | null = null;

  // NAVEGACIÓN
  cambiarVista(vista: VistaCalendario) {
    this.vistaActual.set(vista);
  }

  navegar(direccion: 'prev' | 'next' | 'hoy') {
    if (direccion === 'hoy') {
      this.fechaBase.set(new Date());
      return;
    }

    const fecha = new Date(this.fechaBase());
    const factor = direccion === 'next' ? 1 : -1;

    if (this.vistaActual() === 'Mes') {
      fecha.setMonth(fecha.getMonth() + factor);
    } else if (this.vistaActual() === 'Semana') {
      fecha.setDate(fecha.getDate() + (7 * factor));
    } else {
      fecha.setDate(fecha.getDate() + factor);
    }
    
    this.fechaBase.set(fecha);
  }

  // GENERADORES DE GRILLA
  private generarCalendarioMensual(): DiaCalendario[] {
    const fecha = this.fechaBase();
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    
    // Ajustar para que Lunes sea el primer día de la grilla (0 = domingo en JS, lo mapeamos)
    let diaInicioSemana = primerDia.getDay() - 1;
    if (diaInicioSemana === -1) diaInicioSemana = 6; // Si es domingo

    const dias: DiaCalendario[] = [];
    const hoyStr = new Date().toISOString().split('T')[0];
    const todasLasCitas = this.obtenerCitasFiltradas();

    // Rellenar días del mes anterior
    for (let i = diaInicioSemana; i > 0; i--) {
      const d = new Date(año, mes, 1 - i);
      dias.push(this.crearDia(d, true, hoyStr, todasLasCitas));
    }

    // Días del mes actual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const d = new Date(año, mes, i);
      dias.push(this.crearDia(d, false, hoyStr, todasLasCitas));
    }

    // Rellenar días del mes siguiente para completar la cuadrícula (42 celdas)
    const faltantes = 42 - dias.length;
    for (let i = 1; i <= faltantes; i++) {
      const d = new Date(año, mes + 1, i);
      dias.push(this.crearDia(d, true, hoyStr, todasLasCitas));
    }

    return dias;
  }

  private generarCalendarioSemanal(): DiaCalendario[] {
    const inicio = this.obtenerInicioSemana(this.fechaBase());
    const dias: DiaCalendario[] = [];
    const hoyStr = new Date().toISOString().split('T')[0];
    const todasLasCitas = this.obtenerCitasFiltradas();

    for (let i = 0; i < 7; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      dias.push(this.crearDia(d, false, hoyStr, todasLasCitas));
    }
    return dias;
  }

  private generarCalendarioDiario(): DiaCalendario {
    const hoyStr = new Date().toISOString().split('T')[0];
    return this.crearDia(this.fechaBase(), false, hoyStr, this.obtenerCitasFiltradas());
  }

  // UTILIDADES
  private obtenerInicioSemana(fecha: Date): Date {
    const f = new Date(fecha);
    const dia = f.getDay();
    const diff = f.getDate() - dia + (dia === 0 ? -6 : 1); // Ajuste a Lunes
    return new Date(f.setDate(diff));
  }

  private crearDia(fecha: Date, esOtroMes: boolean, hoyStr: string, todasLasCitas: Cita[]): DiaCalendario {
    // Normalizar zona horaria para sacar el string YYYY-MM-DD correcto
    const fLocal = new Date(fecha.getTime() - (fecha.getTimezoneOffset() * 60000));
    const dateStr = fLocal.toISOString().split('T')[0];

    const citasDia = todasLasCitas.filter(c => c.fecha === dateStr).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    
    return {
      fecha,
      esOtroMes,
      esHoy: dateStr === hoyStr,
      citas: citasDia
    };
  }

  private obtenerCitasFiltradas(): Cita[] {
    const medId = this.filtroMedico();
    if (medId) {
      return this.citaService.citas().filter(c => c.medicoId === medId);
    }
    return this.citaService.citas();
  }

  // UI Y MODALES
  public panelDia = false;
  public diaSeleccionado: DiaCalendario | null = null;

  verDetalleCita(cita: Cita) {
    this.citaSeleccionada = cita;
    this.panelDetalle = true;
  }

  cerrarPanel() {
    this.panelDetalle = false;
  }

  verDetalleDia(dia: DiaCalendario) {
    if (dia.citas.length > 0) {
      this.diaSeleccionado = dia;
      this.panelDia = true;
    }
  }

  cerrarPanelDia() {
    this.panelDia = false;
    this.diaSeleccionado = null;
  }


  getNombreMedico(id: number): string {
    const m = this.medicoService.medicos().find(x => x.id === id);
    if (!m) return 'Desconocido';
    const esp = this.especialidadService.especialidades().find(e => e.id === m.especialidadId);
    return `Dr. ${m.nombre} (${esp?.nombre || 'General'})`;
  }

  getNombrePaciente(id: number): string {
    return this.pacienteService.pacientes().find(x => x.id === id)?.nombre || 'Desconocido';
  }
}
