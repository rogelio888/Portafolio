import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService, Lote, Producto } from '../../../services/db.service';
import { toLocalDateStr } from '../../../shared/date-utils';

interface ExpiringAlert {
  productoNombre: string;
  loteId: string;
  fechaVencimiento: string;
  diasRestantes: number;
  stock: number;
}

interface LowStockAlert {
  producto: Producto;
  stockActual: number;
  stockMinimo: number;
  deficit: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private db = inject(DbService);

  today = new Date();

  get todayStr(): string {
    return toLocalDateStr(this.today);
  }

  get todayFormatted(): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return `${days[this.today.getDay()]}, ${this.today.getDate()} de ${months[this.today.getMonth()]} de ${this.today.getFullYear()}`;
  }

  // --- KPIs DEL DÍA ---
  get ventasHoy(): number {
    return this.db.getSales()
      .filter(s => s.estado === 'Completada' && s.fecha === this.todayStr)
      .reduce((acc, s) => acc + s.total, 0);
  }

  get ticketsHoy(): number {
    return this.db.getSales()
      .filter(s => s.estado === 'Completada' && s.fecha === this.todayStr).length;
  }

  get unidadesVendidasHoy(): number {
    return this.db.getSales()
      .filter(s => s.estado === 'Completada' && s.fecha === this.todayStr)
      .reduce((acc, s) => acc + s.items.reduce((a, i) => a + i.cantidad, 0), 0);
  }

  get totalProductos(): number {
    return this.db.getProducts().length;
  }

  // --- ALERTAS DE VENCIMIENTO (< 90 días) ---
  get expiringAlerts(): ExpiringAlert[] {
    const today = this.today;
    const alerts: ExpiringAlert[] = [];

    this.db.getLotes().forEach(lote => {
      if (lote.stock <= 0) return;
      const expDate = new Date(lote.fechaVencimiento + 'T00:00:00');
      const diffMs = expDate.getTime() - today.getTime();
      const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (dias <= 90) {
        const prod = this.db.getProducts().find(p => p.id === lote.productoId);
        alerts.push({
          productoNombre: prod?.nombre ?? lote.productoId,
          loteId: lote.id,
          fechaVencimiento: lote.fechaVencimiento,
          diasRestantes: dias,
          stock: lote.stock
        });
      }
    });

    return alerts.sort((a, b) => a.diasRestantes - b.diasRestantes);
  }

  // --- ALERTAS DE STOCK BAJO (bajo el mínimo) ---
  get lowStockAlerts(): LowStockAlert[] {
    return this.db.getProducts()
      .map(p => ({
        producto: p,
        stockActual: this.db.getProductStock(p),
        stockMinimo: p.stockMinimo,
        deficit: p.stockMinimo - this.db.getProductStock(p)
      }))
      .filter(a => a.stockActual <= a.stockMinimo)
      .sort((a, b) => b.deficit - a.deficit);
  }

  // --- GRÁFICA ÚLTIMOS 7 DÍAS ---
  get last7Days(): { label: string; total: number; heightPct: number; isToday: boolean }[] {
    const days = [];
    const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(this.today);
      d.setDate(d.getDate() - i);
      const dateStr = toLocalDateStr(d);
      const total = this.db.getSales()
        .filter(s => s.estado === 'Completada' && s.fecha === dateStr)
        .reduce((acc, s) => acc + s.total, 0);

      days.push({
        label: i === 0 ? 'Hoy' : dayNames[d.getDay()],
        total,
        heightPct: 0,
        isToday: i === 0
      });
    }

    const maxVal = Math.max(...days.map(d => d.total), 1);
    days.forEach(d => {
      d.heightPct = Math.max((d.total / maxVal) * 100, d.total > 0 ? 5 : 3);
    });

    return days;
  }

  getExpiryClass(dias: number): string {
    if (dias <= 15) return 'bg-red-100 text-red-800';
    if (dias <= 45) return 'bg-amber-100 text-amber-800';
    return 'bg-yellow-50 text-yellow-800';
  }
}

