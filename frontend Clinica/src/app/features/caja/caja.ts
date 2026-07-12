import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../core/services/cita.service';
import { PacienteService } from '../../core/services/paciente.service';
import { MedicoService } from '../../core/services/medico.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { ComprobanteService } from '../../core/services/comprobante.service';
import { Cita, Comprobante } from '../../core/models/clinica.model';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './caja.html',
  styleUrl: './caja.css'
})
export class Caja {
  private readonly citaService = inject(CitaService);
  private readonly pacienteService = inject(PacienteService);
  private readonly medicoService = inject(MedicoService);
  private readonly usuarioService = inject(UsuarioService);
  public readonly comprobanteService = inject(ComprobanteService);

  // Modal post-pago
  public mostrarModalComprobante = false;
  public ultimoComprobante: Comprobante | null = null;
  private esNuevoPago = false;

  // Simulador de Cajero Logueado
  public recepcionistas = computed(() => this.usuarioService.usuarios().filter(u => u.rolNombre === 'Recepcionista' || u.rolNombre === 'Administrador'));
  public cajeroLogueado = signal<number | null>(null);

  // Fecha actual para cuentas por cobrar
  public fechaHoy = new Date().toISOString().split('T')[0];

  // Listados
  public citasPendientes = computed(() => {
    return this.citaService.citas()
      .filter(c => c.estadoPago === 'Pendiente' && c.estado !== 'Cancelada')
      .sort((a, b) => {
        if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
        return a.horaInicio.localeCompare(b.horaInicio);
      });
  });

  public citasPagadas = computed(() => {
    return this.citaService.citas()
      .filter(c => c.estadoPago === 'Pagado' && c.fecha === this.fechaHoy)
      .sort((a, b) => b.horaInicio.localeCompare(a.horaInicio)); // Más recientes primero
  });

  public totalRecaudado = computed(() => {
    return this.comprobanteService.comprobantes().reduce((sum, comp) => sum + comp.monto, 0);
  });

  // Modal de Pago
  public panelPago = false;
  public citaAPagar: Cita | null = null;
  public metodoPago = signal<'Efectivo' | 'Tarjeta' | 'QR'>('Efectivo');
  public tarifaCobro = signal<number>(150);
  public efectivoRecibido = signal<number>(150);
  
  // Simulación QR
  public estadoQR = signal<'inactivo' | 'esperando' | 'aprobado'>('inactivo');

  public cambioADevolver = computed(() => {
    return Math.max(0, this.efectivoRecibido() - this.tarifaCobro());
  });

  // Notificaciones
  public mensajeEstado = signal<{tipo: 'exito' | 'error', texto: string} | null>(null);

  abrirCobro(cita: Cita) {
    this.citaAPagar = cita;
    this.metodoPago.set('Efectivo');
    this.estadoQR.set('inactivo');
    this.tarifaCobro.set(cita.tarifa || 150);
    this.efectivoRecibido.set(this.tarifaCobro()); // por defecto paga cabal
    this.panelPago = true;
  }

  cerrarCobro() {
    this.panelPago = false;
    this.citaAPagar = null;
    this.estadoQR.set('inactivo');
  }

  generarQR() {
    if (!this.cajeroLogueado()) {
      this.mostrarMensaje('error', 'Debe seleccionar un cajero en el simulador superior.');
      return;
    }
    
    this.estadoQR.set('esperando');
    
    // Simulación de Webhook del Banco (demora 3 segundos)
    setTimeout(() => {
      this.estadoQR.set('aprobado');
      
      // Auto-confirmar el pago tras la aprobación
      setTimeout(() => {
        this.procesarPago(true); // true = bypass validaciones de efectivo
      }, 1500);
    }, 3000);
  }

  procesarPago(esPagoDigital: boolean = false) {
    if (!this.cajeroLogueado()) {
      this.mostrarMensaje('error', 'Debe seleccionar un cajero en el simulador superior.');
      return;
    }
    
    if (!esPagoDigital && this.metodoPago() === 'Efectivo' && this.efectivoRecibido() < this.tarifaCobro()) {
      this.mostrarMensaje('error', 'El efectivo recibido es menor a la tarifa.');
      return;
    }

    if (this.citaAPagar) {
      const exito = this.citaService.pagarCita(this.citaAPagar.id, this.cajeroLogueado()!, this.tarifaCobro(), this.metodoPago());
      if (exito) {
        // Generar comprobante
        this.ultimoComprobante = this.comprobanteService.generarComprobante(
          this.citaAPagar.id,
          this.citaAPagar.pacienteId,
          this.citaAPagar.medicoId,
          this.tarifaCobro(),
          this.metodoPago(),
          this.cajeroLogueado()!
        );
        this.cerrarCobro();
        this.mostrarModalComprobante = true;
        this.esNuevoPago = true;
      } else {
        this.mostrarMensaje('error', 'Hubo un error al registrar el pago.');
      }
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
    if (this.esNuevoPago) {
      this.mostrarMensaje('exito', 'Pago y comprobante registrados exitosamente.');
      this.esNuevoPago = false;
    }
  }

  private mostrarMensaje(tipo: 'exito' | 'error', texto: string) {
    this.mensajeEstado.set({ tipo, texto });
    setTimeout(() => this.mensajeEstado.set(null), 3000);
  }

  // Utils
  getNombrePaciente(id: number): string {
    return this.pacienteService.pacientes().find(p => p.id === id)?.nombre || 'Desconocido';
  }
  
  getNombreMedico(id: number): string {
    return this.medicoService.medicos().find(m => m.id === id)?.nombre || 'Desconocido';
  }

  verDetalleComprobante(comp: Comprobante) {
    this.ultimoComprobante = comp;
    this.mostrarModalComprobante = true;
    this.esNuevoPago = false;
  }
}
