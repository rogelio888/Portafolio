import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Venta } from '../../../services/db.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes {
  private db = inject(DbService);
  private notify = inject(NotificationService);

  activeTab = 'ventas';

  // Filtros de fecha (por defecto mes de Junio 2026)
  fechaInicio = '2026-06-01';
  fechaFin = '2026-06-30';

  // Filtro de periodo fiscal (SIAT)
  periodoFiscal = '2026-06';

  // --- REPORTE DE VENTAS (HU15) ---
  get filteredSales(): Venta[] {
    return this.db.getSales().filter(s => 
      s.estado === 'Completada' && 
      s.fecha >= this.fechaInicio && 
      s.fecha <= this.fechaFin
    ).sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));
  }

  get totalSales(): number {
    return this.filteredSales.reduce((acc, s) => acc + s.total, 0);
  }

  get totalEfectivo(): number {
    return this.filteredSales
      .filter(s => s.tipoPago === 'Efectivo')
      .reduce((acc, s) => acc + s.total, 0);
  }

  get totalQr(): number {
    return this.filteredSales
      .filter(s => s.tipoPago === 'QR')
      .reduce((acc, s) => acc + s.total, 0);
  }

  // --- REPORTE FINANCIERO / ESTADO DE RESULTADOS (HU16) ---
  get statement() {
    return this.db.getFinancialStatement(this.fechaInicio, this.fechaFin);
  }

  get categorizedExpenses() {
    const list = this.db.getExpenses().filter(e => e.fecha >= this.fechaInicio && e.fecha <= this.fechaFin);
    const cats: Array<'Alquiler' | 'Luz' | 'Agua' | 'Internet' | 'Sueldos' | 'Otros'> = [
      'Alquiler', 'Luz', 'Agua', 'Internet', 'Sueldos', 'Otros'
    ];
    return cats.map(c => {
      const sum = list.filter(e => e.categoria === c).reduce((acc, e) => acc + e.monto, 0);
      return { label: c, value: sum };
    });
  }

  // --- REPORTE SIAT (HU17) ---
  get siat() {
    return this.db.getSiatReport(this.periodoFiscal);
  }

  // Acciones de Exportación
  exportExcel() {
    this.notify.info('Generando archivo Excel del reporte y descargándolo en tu equipo...');
  }

  exportPdf() {
    this.notify.info('Generando documento PDF optimizado para impresión...');
  }

  descargarLcv() {
    this.notify.info('Descargando archivo consolidado de Libro de Compras y Ventas (LCV) en formato compatible con el portal del SIAT en Línea...');
  }
}
