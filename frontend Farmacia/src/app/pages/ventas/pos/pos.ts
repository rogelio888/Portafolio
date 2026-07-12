import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Producto, Venta, Lote } from '../../../services/db.service';
import { NotificationService } from '../../../services/notification.service';
import { toLocalDateStr } from '../../../shared/date-utils';

interface CartItem {
  productoId: string;
  productoNombre: string;
  laboratorio: string;
  loteId: string;
  fechaVencimiento: string;
  cantidad: number;
  precioVenta: number;
  stockDisponible: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.html',
  styleUrl: './pos.css',
})
export class Pos {
  db = inject(DbService);
  notify = inject(NotificationService);

  activeTab: 'caja' | 'historial' = 'caja';

  // Signals — se actualizan reactivamente sin zone.js (Angular 18 zoneless)
  showQrModal        = signal(false);
  showQrSuccessModal = signal(false);
  showEfectivoModal  = signal(false);
  showTicketModal    = signal(false);
  pagoExitoso        = signal(false);

  // Carrito de ventas
  cart: CartItem[] = [];

  // Búsqueda y Facturación
  searchQuery = '';
  clienteName = 'Consumidor Final';
  clienteNit = '0';

  // Cobro en Efectivo
  efectivoRecibido = 10.00;

  // Venta activa/completada para el Ticket de Impresión
  activeTicket: Venta | null = null;

  // Historial filtros
  historialSearchQuery = '';
  historialDateQuery = '';

  // Timer del QR
  private qrTimer: any = null;

  get products(): Producto[] {
    return this.db.getProducts();
  }

  // Filtrado de productos en caja
  get filteredProducts(): Producto[] {
    if (!this.searchQuery) return [];
    const q = this.searchQuery.toLowerCase();
    return this.products.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.principioActivo.toLowerCase().includes(q)
    );
  }

  // Obtener las ventas ordenadas por fecha/hora
  get salesList(): Venta[] {
    return this.db.getSales().filter(s => {
      const q = this.historialSearchQuery.toLowerCase();
      const matchSearch = s.id.toLowerCase().includes(q) ||
                          s.clienteName.toLowerCase().includes(q) ||
                          s.clienteNit.includes(q);
      const matchDate = !this.historialDateQuery || s.fecha === this.historialDateQuery;
      return matchSearch && matchDate;
    }).sort((a, b) => b.id.localeCompare(a.id));
  }

  // Sumarizaciones del carrito
  get subtotal(): number {
    return this.cart.reduce((acc, item) => acc + (item.cantidad * item.precioVenta), 0);
  }

  get descuento(): number {
    return 0.00;
  }

  get total(): number {
    return this.subtotal - this.descuento;
  }

  get efectivoCambio(): number {
    const val = this.efectivoRecibido - this.total;
    return val > 0 ? Number(val.toFixed(2)) : 0;
  }

  // Agregar al carrito aplicando FEFO
  addToCart(prod: Producto) {
    const activeLotes = this.db.getFefoLotesActivos(prod.id);
    const stockTotal = this.db.getProductStock(prod);

    if (stockTotal <= 0 || activeLotes.length === 0) {
      this.notify.warning('Medicamento agotado. No hay lotes con stock disponibles para la venta.');
      return;
    }

    const idx = this.cart.findIndex(item => item.productoId === prod.id);
    if (idx !== -1) {
      if (this.cart[idx].cantidad < stockTotal) {
        this.cart[idx].cantidad++;
      } else {
        this.notify.warning('Stock máximo disponible del producto alcanzado en los lotes activos.');
      }
    } else {
      const targetLote = activeLotes[0];
      this.cart.push({
        productoId: prod.id,
        productoNombre: prod.nombre,
        laboratorio: prod.laboratorio,
        loteId: targetLote.id,
        fechaVencimiento: targetLote.fechaVencimiento,
        cantidad: 1,
        precioVenta: prod.precioVenta,
        stockDisponible: stockTotal
      });
    }

    this.searchQuery = '';
  }

  updateQty(item: CartItem, delta: number) {
    const newQty = item.cantidad + delta;
    if (newQty >= 1 && newQty <= item.stockDisponible) {
      item.cantidad = newQty;
    } else if (newQty > item.stockDisponible) {
      this.notify.warning('No hay suficiente stock en los lotes activos para esta cantidad.');
    }
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
  }

  vaciarCarrito() {
    this.cart = [];
  }

  // --- COBRO POR EFECTIVO (HU12) ---
  abrirEfectivoModal() {
    if (this.cart.length === 0) {
      this.notify.warning('El carrito está vacío.');
      return;
    }
    this.efectivoRecibido = Math.ceil(this.total / 10) * 10;
    this.pagoExitoso.set(false);
    this.showEfectivoModal.set(true);
  }

  confirmarPagoEfectivo() {
    if (this.efectivoRecibido < this.total) {
      this.notify.warning('El monto recibido es menor al total a pagar.');
      return;
    }
    this.pagoExitoso.set(true);
    this.registrarVenta('Efectivo');
  }

  // --- COBRO POR QR (HU13 - BANCO ECONÓMICO API) ---
  abrirQrModal() {
    if (this.cart.length === 0) {
      this.notify.warning('El carrito está vacío.');
      return;
    }
    // Paso 1: mostrar modal QR con código y spinner
    this.showQrModal.set(true);
    this.showQrSuccessModal.set(false);

    // Paso 2: a los 3 s → confirmar pago (signal actualiza vista automáticamente)
    this.qrTimer = setTimeout(() => {
      this.registrarVenta('QR');
      this.showQrModal.set(false);
      this.showQrSuccessModal.set(true);

      // Paso 3: a los 2.5 s → cerrar overlay y abrir ticket
      this.qrTimer = setTimeout(() => {
        this.showQrSuccessModal.set(false);
        this.showTicketModal.set(true);
      }, 2500);
    }, 3000);
  }

  cancelarCobroQr() {
    if (this.qrTimer) {
      clearTimeout(this.qrTimer);
      this.qrTimer = null;
    }
    this.showQrModal.set(false);
    this.showQrSuccessModal.set(false);
  }

  // --- TRANSACCIÓN Y REGISTRO ---
  private registrarVenta(tipoPago: 'Efectivo' | 'QR') {
    const today = new Date();
    const dateStr = toLocalDateStr(today);
    const timeStr = today.toTimeString().split(' ')[0];

    const saleData = {
      clienteName: this.clienteName,
      clienteNit: this.clienteNit,
      fecha: dateStr,
      hora: timeStr,
      tipoPago,
      subtotal: this.subtotal,
      descuento: this.descuento,
      total: this.total
    };

    const cartItems = this.cart.map(item => ({
      productoId: item.productoId,
      cantidad: item.cantidad
    }));

    const sale = this.db.addSale(saleData, cartItems);
    this.activeTicket = sale;

    this.cart = [];
    this.clienteName = 'Consumidor Final';
    this.clienteNit = '0';

    // Efectivo: el ticket abre inmediatamente (QR lo abre su propio timer)
    if (tipoPago === 'Efectivo') {
      this.showTicketModal.set(true);
    }
  }

  async anularVenta(saleId: string) {
    if (!(await this.notify.confirm(`¿Está seguro de anular la venta ${saleId}? Esto devolverá los productos a su lote original.`))) return;
    this.db.anularSale(saleId);
  }

  verTicket(s: Venta) {
    this.activeTicket = s;
    this.showTicketModal.set(true);
  }

  cerrarModalPago() {
    this.pagoExitoso.set(false);
    this.showEfectivoModal.set(false);
  }

  imprimirTicket() {
    this.notify.info('Imprimiendo recibo fiscal de venta en la impresora térmica...');
  }
}
