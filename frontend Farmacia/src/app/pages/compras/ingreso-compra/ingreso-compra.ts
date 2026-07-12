import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Compra, CompraItem, Producto, Proveedor } from '../../../services/db.service';
import { NotificationService } from '../../../services/notification.service';
import { toLocalDateStr } from '../../../shared/date-utils';

@Component({
  selector: 'app-ingreso-compra',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingreso-compra.html',
  styleUrl: './ingreso-compra.css',
})
export class IngresoCompra {
  private db = inject(DbService);
  private notify = inject(NotificationService);

  activeTab: 'nueva' | 'historial' = 'nueva';
  showDetailModal = false;

  // Búsqueda de Producto para agregar al lote
  searchQuery = '';

  // Formulario de nueva compra
  nuevaCompra = {
    proveedorId: 1,
    fecha: toLocalDateStr(),
    nroFactura: '',
    items: [] as Omit<CompraItem, 'productoNombre'>[]
  };

  // Historial búsqueda
  historialSearchQuery = '';
  historialMonthQuery = '';

  // Compra seleccionada para ver detalles
  selectedPurchase: Compra | null = null;

  get suppliers(): Proveedor[] {
    return this.db.getSuppliers();
  }

  get products(): Producto[] {
    return this.db.getProducts();
  }

  // Filtrado de productos para el buscador de ingreso
  get filteredProducts(): Producto[] {
    if (!this.searchQuery) return [];
    const q = this.searchQuery.toLowerCase();
    return this.products.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.principioActivo.toLowerCase().includes(q)
    );
  }

  get purchaseTotal(): number {
    return this.nuevaCompra.items.reduce((acc, item) => acc + (item.cantidad * item.costoUnitario), 0);
  }

  // Obtener listado de compras registradas
  get purchases(): Compra[] {
    return this.db.getPurchases().filter(p => {
      const q = this.historialSearchQuery.toLowerCase();
      const matchSearch = p.proveedorNombre.toLowerCase().includes(q) || p.nroFactura.includes(q);
      const matchMonth = !this.historialMonthQuery || p.fecha.startsWith(this.historialMonthQuery);
      return matchSearch && matchMonth;
    }).sort((a, b) => b.id.localeCompare(a.id));
  }

  // Agregar ítem al carrito de compras
  agregarItem(prod: Producto) {
    // Evitar duplicados
    const exists = this.nuevaCompra.items.find(item => item.productoId === prod.id);
    if (exists) {
      this.notify.warning('Este producto ya está en la lista de recepción.');
      return;
    }

    // Generar lote sugerido autoincremental
    const randSuffix = Math.floor(Math.random() * 9000) + 1000;
    const suggLote = `L-${randSuffix}`;

    // Vencimiento por defecto (1 año adelante)
    const oneYearAhead = new Date();
    oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);
    const suggVenc = toLocalDateStr(oneYearAhead);

    this.nuevaCompra.items.push({
      productoId: prod.id,
      loteId: suggLote,
      fechaVencimiento: suggVenc,
      cantidad: 50,
      costoUnitario: Number((prod.precioVenta * 0.6).toFixed(2)) // Costo sugerido (60% del PVP)
    });

    this.searchQuery = '';
  }

  eliminarItem(index: number) {
    this.nuevaCompra.items.splice(index, 1);
  }

  // Confirmar ingreso de mercadería
  confirmarIngreso() {
    if (!this.nuevaCompra.nroFactura) {
      this.notify.warning('Por favor ingrese el número de factura física de compra.');
      return;
    }

    if (this.nuevaCompra.items.length === 0) {
      this.notify.warning('Debe agregar al menos un medicamento a la recepción de mercadería.');
      return;
    }

    // Validar ítems
    for (const item of this.nuevaCompra.items) {
      if (!item.loteId) {
        this.notify.warning('Todos los productos deben tener un número de lote.');
        return;
      }
      if (!item.fechaVencimiento) {
        this.notify.warning('Todos los productos deben tener una fecha de vencimiento.');
        return;
      }
      if (item.cantidad <= 0 || item.costoUnitario <= 0) {
        this.notify.warning('Las cantidades y costos de compra unitarios deben ser mayores a 0.');
        return;
      }
    }

    const prov = this.suppliers.find(s => s.id === Number(this.nuevaCompra.proveedorId));
    const provNombre = prov ? prov.nombre : 'Proveedor Genérico';

    // Armar estructura final
    const finalItems: CompraItem[] = this.nuevaCompra.items.map(item => {
      const prod = this.products.find(p => p.id === item.productoId);
      return {
        productoId: item.productoId,
        productoNombre: prod ? prod.nombre : 'Producto Desconocido',
        loteId: item.loteId,
        fechaVencimiento: item.fechaVencimiento,
        cantidad: item.cantidad,
        costoUnitario: item.costoUnitario
      };
    });

    this.db.addPurchase({
      proveedorId: Number(this.nuevaCompra.proveedorId),
      proveedorNombre: provNombre,
      fecha: this.nuevaCompra.fecha,
      nroFactura: this.nuevaCompra.nroFactura,
      items: finalItems,
      total: this.purchaseTotal
    });

    // Resetear formulario
    this.nuevaCompra = {
      proveedorId: this.suppliers[0]?.id || 1,
      fecha: toLocalDateStr(),
      nroFactura: '',
      items: []
    };

    this.notify.success('La compra se ha procesado con éxito. Se crearon los lotes de vencimiento correspondientes y se registró el ingreso en el Kardex.');
    this.activeTab = 'historial';
  }

  // Ver detalles del historial
  verDetalles(c: Compra) {
    this.selectedPurchase = c;
    this.showDetailModal = true;
  }

  getProductName(prodId: string): string {
    const p = this.products.find(prod => prod.id === prodId);
    return p ? p.nombre : '';
  }

  getProductPvp(prodId: string): number {
    const p = this.products.find(prod => prod.id === prodId);
    return p ? p.precioVenta : 0;
  }

  imprimirComprobante() {
    this.notify.info('Imprimiendo comprobante de ingreso de almacén...');
  }
}
