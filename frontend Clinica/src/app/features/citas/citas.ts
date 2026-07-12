import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CitaService, SlotCita } from '../../core/services/cita.service';
import { MedicoService } from '../../core/services/medico.service';
import { PacienteService } from '../../core/services/paciente.service';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { ComprobanteService } from '../../core/services/comprobante.service';
import { Comprobante } from '../../core/models/clinica.model';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './citas.html',
  styleUrl: './citas.css'
})
export class Citas {
  private readonly citaService = inject(CitaService);
  private readonly medicoService = inject(MedicoService);
  public readonly pacienteService = inject(PacienteService);
  public readonly especialidadService = inject(EspecialidadService);
  private readonly fb = inject(FormBuilder);
  private readonly comprobanteService = inject(ComprobanteService);

  // Modal comprobante
  public mostrarModalComprobante = false;
  public ultimoComprobante: Comprobante | null = null;

  public readonly Number = Number;

  // Selectores principales
  public medicos = computed(() => this.medicoService.medicos().filter(m => m.estado === 'Activo'));
  public medicoSeleccionado = signal<number | null>(null);
  public fechaSeleccionada = signal<string>(this.obtenerFechaHoy());

  // Grilla de Turnos
  public turnos = signal<SlotCita[]>([]);
  public sinHorario = signal(false); // True si el médico no trabaja o es feriado
  
  // Estado UI de Reserva
  public panelReserva = false;
  public turnoSeleccionado: SlotCita | null = null;
  public busquedaPaciente = '';
  public pacientesEncontrados = computed(() => {
    if (this.busquedaPaciente.length < 3) return [];
    const term = this.busquedaPaciente.toLowerCase();
    return this.pacienteService.pacientes().filter(p => 
      p.estado === 'Activo' && (p.nombre.toLowerCase().includes(term) || p.ci.includes(term))
    );
  });
  public pacienteASeleccionar: number | null = null;

  // Estado UI "Registro Rápido"
  public mostrandoRegistroRapido = false;
  public formPaciente: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    ci: ['', Validators.required],
    telefono: ['', Validators.required]
  });

  // Estado UI Cancelación
  public panelCancelacion = false;
  public motivoCancelacion = '';

  constructor() {
    // Effect: Reactivo, si cambia médico o fecha, recarga turnos automáticamente
    effect(() => {
      const medId = this.medicoSeleccionado();
      const fecha = this.fechaSeleccionada();
      
      if (medId && fecha) {
        const slots = this.citaService.obtenerDisponibilidad(medId, fecha);
        this.turnos.set(slots);
        this.sinHorario.set(slots.length === 0);
      } else {
        this.turnos.set([]);
        this.sinHorario.set(false);
      }
    });
  }

  private obtenerFechaHoy(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }

  // ACCIONES DE GRILLA
  seleccionarTurno(turno: SlotCita) {
    if (turno.disponible) {
      this.turnoSeleccionado = turno;
      this.busquedaPaciente = '';
      this.pacienteASeleccionar = null;
      this.mostrandoRegistroRapido = false;
      this.cobrarAlReservar.set(false);
      this.metodoPago.set('Efectivo');
      this.estadoQR.set('inactivo');
      this.efectivoRecibido.set(150);
      this.panelReserva = true;
    } else {
      this.turnoSeleccionado = turno;
      this.motivoCancelacion = '';
      this.panelCancelacion = true;
    }
  }

  // ACCIONES DE RESERVA
  seleccionarPaciente(id: number) {
    this.pacienteASeleccionar = id;
    this.busquedaPaciente = '';
  }

  // variables de cobro rapido
  public cobrarAlReservar = signal<boolean>(false);
  public metodoPago = signal<'Efectivo' | 'Tarjeta' | 'QR'>('Efectivo');
  public tarifaCobro = signal<number>(150);
  public efectivoRecibido = signal<number>(150);
  public cambioADevolver = computed(() => Math.max(0, this.efectivoRecibido() - this.tarifaCobro()));

  // Simulación QR en agenda
  public estadoQR = signal<'inactivo' | 'esperando' | 'aprobado'>('inactivo');

  generarQR() {
    this.estadoQR.set('esperando');
    // Simular webhook del banco
    setTimeout(() => {
      this.estadoQR.set('aprobado');
      setTimeout(() => {
        this.confirmarReserva(true); // Bypass efectivo validation
      }, 1500);
    }, 3000);
  }

  confirmarReserva(esPagoDigital: boolean = false) {
    if (!this.turnoSeleccionado || !this.pacienteASeleccionar) return;
    
    if (!esPagoDigital && this.cobrarAlReservar() && this.metodoPago() === 'Efectivo' && this.efectivoRecibido() < this.tarifaCobro()) {
      alert('Error: El efectivo recibido es menor a la tarifa.');
      return;
    }

    const medId = this.medicoSeleccionado();
    if (!medId) return;

    const res = this.citaService.crearCita({
      medicoId: medId,
      pacienteId: this.pacienteASeleccionar,
      fecha: this.fechaSeleccionada(),
      horaInicio: this.turnoSeleccionado.horaInicio,
      horaFin: this.turnoSeleccionado.horaFin
    });

    if (res.success && res.citaId && this.cobrarAlReservar()) {
      // Usar cajeroId 1 por defecto al cobrar desde agenda
      this.citaService.pagarCita(res.citaId, 1, this.tarifaCobro(), this.metodoPago());
      
      // Generar comprobante
      this.ultimoComprobante = this.comprobanteService.generarComprobante(
        res.citaId,
        this.pacienteASeleccionar!,
        medId,
        this.tarifaCobro(),
        this.metodoPago(),
        1
      );
      this.panelReserva = false;
      this.turnoSeleccionado = null;
      this.mostrarModalComprobante = true;
    } else {
      this.panelReserva = false;
      this.turnoSeleccionado = null;
    }
  }

  imprimirComprobante() {
    if (this.ultimoComprobante) {
      this.comprobanteService.imprimirComprobante(this.ultimoComprobante);
    }
  }

  cerrarModalComprobante() {
    this.mostrarModalComprobante = false;
    this.ultimoComprobante = null;
  }

  // REGISTRO RÁPIDO
  activarRegistroRapido() {
    this.mostrandoRegistroRapido = true;
    this.formPaciente.reset();
  }

  guardarPacienteRapido() {
    if (this.formPaciente.invalid) return;
    
    const res = this.pacienteService.crearPaciente(this.formPaciente.value);
    if (res.success && res.paciente) {
      this.pacienteASeleccionar = res.paciente.id;
      this.busquedaPaciente = res.paciente.nombre;
      this.mostrandoRegistroRapido = false;
    } else {
      alert(res.error);
    }
  }

  // CANCELACIÓN
  confirmarCancelacion() {
    if (!this.turnoSeleccionado || !this.turnoSeleccionado.citaId) return;
    
    this.citaService.cancelarCita(this.turnoSeleccionado.citaId, this.motivoCancelacion || 'Cancelada por Recepción');
    this.panelCancelacion = false;
    this.recargarGrilla();
  }

  private recargarGrilla() {
    // Forzamos la reactividad
    this.fechaSeleccionada.set(this.fechaSeleccionada());
  }

  // UTILIDADES UI
  getNombrePaciente(id?: number): string {
    if (!id) return '';
    const pac = this.pacienteService.pacientes().find(p => p.id === id);
    return pac ? pac.nombre : 'Paciente Desconocido';
  }

  cerrarModales() {
    this.panelReserva = false;
    this.panelCancelacion = false;
  }
}
