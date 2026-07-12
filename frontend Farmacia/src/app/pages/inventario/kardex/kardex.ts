import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Producto, KardexMovimiento } from '../../../services/db.service';
import { NotificationService } from '../../../services/notification.service';
import { toLocalDateStr } from '../../../shared/date-utils';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kardex.html',
  styleUrl: './kardex.css',
})
export class Kardex {
  private db = inject(DbService);
  private notify = inject(NotificationService);

  showModal = false;

  // Filtros
  selectedProductId = 'PROD-001';
  selectedLoteId = '';

  // Formulario de Ajuste Manual (HU9)
  ajusteLoteId = '';
  ajusteTipo: 'entrada' | 'salida' = 'salida';
  ajusteCantidad = 0;
  ajusteMotivo = '';

  get products(): Producto[] {
    return this.db.getProducts();
  }

  get activeProduct(): Producto | undefined {
    return this.products.find(p => p.id === this.selectedProductId);
  }

  getProductStock(p: Producto): number {
    return this.db.getProductStock(p);
  }

  // Filtrar los movimientos según el producto y lote seleccionado
  get movements(): KardexMovimiento[] {
    return this.db.getKardex().filter(m => {
      const matchesProduct = m.productoId === this.selectedProductId;
      const matchesLote = !this.selectedLoteId || m.loteId === this.selectedLoteId;
      return matchesProduct && matchesLote;
    });
  }

  // Abrir modal de ajuste manual
  openAjusteModal() {
    if (!this.activeProduct || this.activeProduct.lotes.length === 0) {
      this.notify.warning('Debe tener al menos un lote registrado para realizar un ajuste manual.');
      return;
    }
    this.ajusteLoteId = this.activeProduct.lotes[0].id;
    this.ajusteTipo = 'salida';
    this.ajusteCantidad = 1;
    this.ajusteMotivo = '';
    this.showModal = true;
  }

  // Confirmar y aplicar Ajuste Manual
  confirmarAjuste() {
    const prod = this.activeProduct;
    if (!prod) return;

    const lote = prod.lotes.find(l => l.id === this.ajusteLoteId);
    if (!lote) {
      this.notify.warning('Lote no válido.');
      return;
    }

    if (this.ajusteCantidad <= 0) {
      this.notify.warning('La cantidad a ajustar debe ser mayor a 0.');
      return;
    }

    let nuevaCantidad = lote.stock;
    if (this.ajusteTipo === 'salida') {
      if (lote.stock < this.ajusteCantidad) {
        this.notify.warning('No puede egresar más de la cantidad existente en el lote.');
        return;
      }
      nuevaCantidad = lote.stock - this.ajusteCantidad;
    } else {
      nuevaCantidad = lote.stock + this.ajusteCantidad;
    }

    const todayStr = toLocalDateStr();
    const detalleAjuste = `${this.ajusteTipo === 'entrada' ? 'Ingreso Sobrante' : 'Egreso Merma'}: ${this.ajusteMotivo}`;
    
    this.db.ajusteManualStock(prod.id, lote.id, nuevaCantidad, detalleAjuste, todayStr);
    
    this.showModal = false;
    this.notify.success('Ajuste de inventario aplicado con éxito y guardado en la bitácora del Kardex.');
  }

  // Resetear filtro de lote al cambiar de producto
  onProductChange() {
    this.selectedLoteId = '';
  }
}
