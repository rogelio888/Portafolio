import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComprobanteService } from '../../core/services/comprobante.service';
import { CitaService } from '../../core/services/cita.service';
import { MedicoService } from '../../core/services/medico.service';
import { PacienteService } from '../../core/services/paciente.service';
import { EspecialidadService } from '../../core/services/especialidad.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes {
  private readonly comprobanteService = inject(ComprobanteService);
  private readonly citaService = inject(CitaService);
  public readonly medicoService = inject(MedicoService);
  private readonly pacienteService = inject(PacienteService);
  private readonly especialidadService = inject(EspecialidadService);

  // Tabs
  public activeTab = signal<'ingresos' | 'citas' | 'rendimiento'>('ingresos');

  // Filtros de fecha (por defecto mes actual)
  public fechaDesde = signal<string>(this.obtenerFechaInicioMes());
  public fechaHasta = signal<string>(this.obtenerFechaHoy());

  // --- SEÑALES COMPUTADAS ---

  // 1. Ingresos
  public readonly ingresosFiltrados = computed(() => {
    const desde = this.fechaDesde();
    const hasta = this.fechaHasta();
    return this.comprobanteService.comprobantes().filter(comp => {
      const fecha = comp.fechaEmision.split('T')[0];
      return fecha >= desde && fecha <= hasta;
    });
  });

  public readonly ingresoTotal = computed(() => {
    return this.ingresosFiltrados().reduce((sum, comp) => sum + comp.monto, 0);
  });

  public readonly ingresoEfectivo = computed(() => {
    return this.ingresosFiltrados()
      .filter(comp => comp.metodoPago === 'Efectivo')
      .reduce((sum, comp) => sum + comp.monto, 0);
  });

  public readonly ingresoDigital = computed(() => {
    return this.ingresosFiltrados()
      .filter(comp => comp.metodoPago === 'Tarjeta' || comp.metodoPago === 'QR')
      .reduce((sum, comp) => sum + comp.monto, 0);
  });

  // 2. Citas
  public readonly citasFiltradas = computed(() => {
    const desde = this.fechaDesde();
    const hasta = this.fechaHasta();
    return this.citaService.citas().filter(cita => 
      cita.fecha >= desde && cita.fecha <= hasta
    );
  });

  public readonly citasTotal = computed(() => this.citasFiltradas().length);

  public readonly citasCompletadas = computed(() => 
    this.citasFiltradas().filter(c => c.estado === 'Completada').length
  );

  public readonly citasCanceladas = computed(() => 
    this.citasFiltradas().filter(c => c.estado === 'Cancelada').length
  );

  public readonly porcentajeAusentismo = computed(() => {
    const total = this.citasTotal();
    if (total === 0) return 0;
    return Math.round((this.citasCanceladas() / total) * 100);
  });

  // 3. Rendimiento
  public readonly rendimientoMedicos = computed(() => {
    const medicos = this.medicoService.medicos();
    const citas = this.citasFiltradas();
    
    return medicos.map(medico => {
      const citasCompletadas = citas.filter(c => c.medicoId === medico.id && c.estado === 'Completada').length;
      const especialidad = this.especialidadService.especialidades().find(e => e.id === medico.especialidadId)?.nombre || 'General';
      return {
        medicoNombre: medico.nombre,
        especialidad,
        citasCompletadas
      };
    }).sort((a, b) => b.citasCompletadas - a.citasCompletadas);
  });

  // Funciones de utilidad
  private obtenerFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private obtenerFechaInicioMes(): string {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  }

  cambiarTab(tab: 'ingresos' | 'citas' | 'rendimiento') {
    this.activeTab.set(tab);
  }

  getNombrePaciente(id: number): string {
    return this.pacienteService.pacientes().find(p => p.id === id)?.nombre || 'Desconocido';
  }

  getNombreMedico(id: number): string {
    return this.medicoService.medicos().find(m => m.id === id)?.nombre || 'Desconocido';
  }

  imprimirReporte() {
    window.print();
  }

  exportarCSV() {
    const tab = this.activeTab();
    let csvContent = "\ufeff"; // BOM for UTF-8
    let filename = `reporte_${tab}_${this.fechaDesde()}_to_${this.fechaHasta()}.csv`;

    if (tab === 'ingresos') {
      csvContent += "Fecha,No. Comprobante,Paciente,Método de Pago,Monto (Bs.)\n";
      this.ingresosFiltrados().forEach(comp => {
        const fecha = new Date(comp.fechaEmision).toLocaleDateString('es-BO');
        const paciente = this.getNombrePaciente(comp.pacienteId);
        csvContent += `"${fecha}","${comp.numeroCorrelativo}","${paciente}","${comp.metodoPago}",${comp.monto.toFixed(2)}\n`;
      });
    } else if (tab === 'citas') {
      csvContent += "Fecha/Hora,Paciente,Médico,Estado\n";
      this.citasFiltradas().forEach(cita => {
        const paciente = this.getNombrePaciente(cita.pacienteId);
        const medico = this.getNombreMedico(cita.medicoId);
        csvContent += `"${cita.fecha} ${cita.horaInicio}","${paciente}","${medico}","${cita.estado}"\n`;
      });
    } else {
      csvContent += "Rango,Médico Profesional,Especialidad,Consultas Completadas\n";
      this.rendimientoMedicos().forEach((m, idx) => {
        csvContent += `${idx + 1},"${m.medicoNombre}","${m.especialidad}",${m.citasCompletadas}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
