import { Injectable } from '@angular/core';
import { toLocalDateStr } from '../shared/date-utils';
import { emitApiSim } from './api-sim/templates';
import { apiSimBus } from './api-sim/bus';
import {
  PROVEEDOR_CREATE, PROVEEDOR_UPDATE, PROVEEDOR_DELETE,
  PRODUCTO_CREATE, PRODUCTO_UPDATE, PRODUCTO_DELETE, PRODUCTO_IMPORT,
  COMPRA_CREATE, STOCK_ADJUST
} from './api-sim/catalogs/inventario.catalog';
import { VENTA_CREATE, VENTA_ANULAR } from './api-sim/catalogs/ventas.catalog';
import { GASTO_CREATE, GASTO_DELETE } from './api-sim/catalogs/finanzas.catalog';
import {
  AUTH_LOGIN, AUTH_LOGIN_FAILED, AUTH_LOGOUT,
  ROLE_CREATE, ROLE_UPDATE, ROLE_DELETE,
  USER_CREATE, USER_UPDATE, USER_STATUS
} from './api-sim/catalogs/seguridad.catalog';

export interface Lote {
  id: string; // e.g. "L-1029"
  fechaVencimiento: string; // YYYY-MM-DD
  stock: number;
  costoCompra: number; // Bs. unitario de compra
  fechaIngreso: string;
}

export interface Producto {
  id: string; // e.g. "PROD-001"
  nombre: string;
  descripcion: string;
  laboratorio: string;
  principioActivo: string;
  categoria: string; // e.g. "Analgésicos", "Antibióticos"
  stockMinimo: number;
  precioVenta: number; // Bs. unitario de venta
  recetaObligatoria: boolean;
  lotes: Lote[];
}

export interface Proveedor {
  id: number;
  nombre: string;
  nit: string;
  telefono: string;
  direccion: string;
  contacto: string;
}

export interface CompraItem {
  productoId: string;
  productoNombre: string;
  loteId: string;
  fechaVencimiento: string;
  cantidad: number;
  costoUnitario: number;
}

export interface Compra {
  id: string; // e.g. "CMP-001"
  proveedorId: number;
  proveedorNombre: string;
  fecha: string;
  nroFactura: string;
  items: CompraItem[];
  total: number;
}

export interface VentaItem {
  productoId: string;
  productoNombre: string;
  loteId: string;
  cantidad: number;
  costoUnitario: number; // Costo de compra del lote
  precioVenta: number; // Precio al que se vendió
}

export interface Venta {
  id: string; // e.g. "TCK-10052"
  clienteName: string;
  clienteNit: string;
  fecha: string;
  hora: string;
  tipoPago: 'Efectivo' | 'QR';
  items: VentaItem[];
  subtotal: number;
  descuento: number;
  total: number;
  estado: 'Completada' | 'Anulada';
}

export interface Gasto {
  id: string;
  categoria: 'Alquiler' | 'Luz' | 'Agua' | 'Internet' | 'Sueldos' | 'Otros';
  descripcion: string;
  fecha: string;
  monto: number;
}

export interface KardexMovimiento {
  id: string;
  fecha: string;
  hora: string;
  productoId: string;
  productoNombre: string;
  tipoMovimiento: 'Entrada' | 'Salida';
  detalle: string; // e.g. "Compra Fac. Nro. 450", "Venta TCK-10052"
  loteId: string;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
}

export interface Rol {
  id: number;
  name: string;
  permissions: string[];
}

export interface Usuario {
  id: number;
  name: string;
  email: string;
  password: string; // simulado: solo para el demo local, nunca se envía a UI
  role_id: number;
  status: 'activo' | 'suspendido';
}

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private products: Producto[] = [];
  private suppliers: Proveedor[] = [];
  private purchases: Compra[] = [];
  private sales: Venta[] = [];
  private expenses: Gasto[] = [];
  private kardex: KardexMovimiento[] = [];
  private roles: Rol[] = [];
  private users: Usuario[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.products.length === 0) {
      this.seedDatabase();
    }
    if (this.roles.length === 0) {
      this.seedSecurity();
    }
  }

  private loadFromStorage() {
    try {
      const p = localStorage.getItem('farmacia_products');
      const s = localStorage.getItem('farmacia_suppliers');
      const cmp = localStorage.getItem('farmacia_purchases');
      const v = localStorage.getItem('farmacia_sales');
      const g = localStorage.getItem('farmacia_expenses');
      const k = localStorage.getItem('farmacia_kardex');
      const r = localStorage.getItem('farmacia_roles');
      const u = localStorage.getItem('farmacia_users');

      if (p) this.products = JSON.parse(p);
      if (s) this.suppliers = JSON.parse(s);
      if (cmp) this.purchases = JSON.parse(cmp);
      if (v) this.sales = JSON.parse(v);
      if (g) this.expenses = JSON.parse(g);
      if (k) this.kardex = JSON.parse(k);
      if (r) this.roles = JSON.parse(r);
      if (u) this.users = JSON.parse(u);
    } catch (e) {
      console.error('Error cargando base de datos local:', e);
    }
  }

  private saveToStorage() {
    localStorage.setItem('farmacia_products', JSON.stringify(this.products));
    localStorage.setItem('farmacia_suppliers', JSON.stringify(this.suppliers));
    localStorage.setItem('farmacia_purchases', JSON.stringify(this.purchases));
    localStorage.setItem('farmacia_sales', JSON.stringify(this.sales));
    localStorage.setItem('farmacia_expenses', JSON.stringify(this.expenses));
    localStorage.setItem('farmacia_kardex', JSON.stringify(this.kardex));
    localStorage.setItem('farmacia_roles', JSON.stringify(this.roles));
    localStorage.setItem('farmacia_users', JSON.stringify(this.users));
  }

  private seedSecurity() {
    this.roles = [
      {
        id: 1,
        name: 'Administrador',
        permissions: [
          'ver_roles_usuarios', 'modificar_usuarios', 'ver_bitacora',
          'gestionar_catalogo', 'ver_kardex', 'ajuste_manual_stock',
          'operar_pos', 'cobrar_efectivo_qr',
          'registrar_gastos', 'ver_reporte_ventas', 'generar_reporte_siat'
        ]
      },
      {
        id: 2,
        name: 'Asistente de Farmacia',
        permissions: ['operar_pos', 'cobrar_efectivo_qr', 'gestionar_catalogo', 'ver_kardex']
      }
    ];

    this.users = [
      { id: 1, name: 'Dr./Dra. Propietario', email: 'propietario@farmacia.com', password: 'admin123', role_id: 1, status: 'activo' },
      { id: 2, name: 'Asistente de Turno', email: 'asistente@farmacia.com', password: 'asistente123', role_id: 2, status: 'activo' }
    ];

    this.saveToStorage();
  }

  private seedDatabase() {
    // 1. Sembrado de Proveedores
    this.suppliers = [
      { id: 1, nombre: 'Droguería Inti S.A.', nit: '1020304025', telefono: '3345678', direccion: 'Av. Mutualista, Santa Cruz', contacto: 'Lic. Carla Vargas' },
      { id: 2, nombre: 'Droguería Bagó de Bolivia', nit: '1209384725', telefono: '3367890', direccion: 'Equipetrol, Santa Cruz', contacto: 'Ing. Rodrigo Mercado' },
      { id: 3, nombre: 'Laboratorios Vita S.A.', nit: '1439284729', telefono: '2248596', direccion: 'Av. Busch, La Paz', contacto: 'Dra. Patricia Siles' }
    ];

    // 2. Sembrado de Productos con Lotes (con vencimientos reales para simulaciones FEFO en 2026/2027)
    this.products = [
      {
        id: 'PROD-001',
        nombre: 'Paracetamol 500mg',
        descripcion: 'Analgésico y antipirético de uso general',
        laboratorio: 'Laboratorios Inti',
        principioActivo: 'Paracetamol',
        categoria: 'Analgésicos',
        stockMinimo: 50,
        precioVenta: 1.50,
        recetaObligatoria: false,
        lotes: [
          { id: 'L-1029', fechaVencimiento: '2026-12-31', stock: 84, costoCompra: 0.70, fechaIngreso: '2026-01-10' },
          { id: 'L-1030', fechaVencimiento: '2027-06-30', stock: 200, costoCompra: 0.80, fechaIngreso: '2026-03-15' }
        ]
      },
      {
        id: 'PROD-002',
        nombre: 'Ibuprofeno 400mg',
        descripcion: 'Antiinflamatorio no esteroideo (AINE)',
        laboratorio: 'Laboratorios Bagó',
        principioActivo: 'Ibuprofeno',
        categoria: 'Analgésicos',
        stockMinimo: 30,
        precioVenta: 2.50,
        recetaObligatoria: false,
        lotes: [
          { id: 'L-8842', fechaVencimiento: '2026-08-31', stock: 5, costoCompra: 1.10, fechaIngreso: '2026-02-12' }, // Vence pronto
          { id: 'L-8843', fechaVencimiento: '2027-02-28', stock: 80, costoCompra: 1.25, fechaIngreso: '2026-04-18' }
        ]
      },
      {
        id: 'PROD-003',
        nombre: 'Amoxicilina 500mg',
        descripcion: 'Antibiótico bactericida de amplio espectro',
        laboratorio: 'Laboratorios Vita',
        principioActivo: 'Amoxicilina',
        categoria: 'Antibióticos',
        stockMinimo: 25,
        precioVenta: 4.50,
        recetaObligatoria: true,
        lotes: [
          { id: 'L-7711', fechaVencimiento: '2026-04-30', stock: 5, costoCompra: 2.00, fechaIngreso: '2026-01-20' }, // Lote ya vencido o por vencer muy pronto
          { id: 'L-7712', fechaVencimiento: '2026-10-31', stock: 30, costoCompra: 2.20, fechaIngreso: '2026-03-22' }
        ]
      },
      {
        id: 'PROD-004',
        nombre: 'Aspirina 100mg',
        descripcion: 'Cardioprotector y antiagregante plaquetario',
        laboratorio: 'Bayer S.A.',
        principioActivo: 'Ácido Acetilsalicílico',
        categoria: 'Cardiovasculares',
        stockMinimo: 40,
        precioVenta: 1.20,
        recetaObligatoria: false,
        lotes: [
          { id: 'L-0010', fechaVencimiento: '2026-09-30', stock: 8, costoCompra: 0.50, fechaIngreso: '2026-02-05' } // Bajo stock mínimo
        ]
      }
    ];

    // 3. Sembrado de Gastos Operativos (Fijos de fin de mes)
    this.expenses = [
      { id: 'GST-001', categoria: 'Alquiler', descripcion: 'Pago alquiler de local farmacia', fecha: '2026-06-05', monto: 2000 },
      { id: 'GST-002', categoria: 'Luz', descripcion: 'Factura mensual CRE S.A.', fecha: '2026-06-10', monto: 450 },
      { id: 'GST-003', categoria: 'Internet', descripcion: 'Servicio Fibra Óptica Tigo', fecha: '2026-06-12', monto: 250 }
    ];

    // 4. Sembrado de Ventas: dos históricas (mes anterior, para variedad en reportes)
    //    + una serie de los últimos días relativa a "hoy" para que el gráfico de
    //    Tendencia de Ventas del dashboard siempre tenga datos, sin importar la
    //    fecha real en la que se abra la demo.
    const relDate = (daysAgo: number): string => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return toLocalDateStr(d);
    };

    this.sales = [
      {
        id: 'TCK-10050',
        clienteName: 'Consumidor Final',
        clienteNit: '0',
        fecha: '2026-06-15',
        hora: '11:15:00',
        tipoPago: 'Efectivo',
        items: [
          { productoId: 'PROD-001', productoNombre: 'Paracetamol 500mg', loteId: 'L-1029', cantidad: 8, costoUnitario: 0.70, precioVenta: 1.50 }
        ],
        subtotal: 12.00,
        descuento: 0,
        total: 12.00,
        estado: 'Anulada'
      },
      {
        id: 'TCK-10051',
        clienteName: 'Consumidor Final',
        clienteNit: '0',
        fecha: '2026-06-20',
        hora: '13:42:10',
        tipoPago: 'QR',
        items: [
          { productoId: 'PROD-003', productoNombre: 'Amoxicilina 500mg', loteId: 'L-7712', cantidad: 10, costoUnitario: 2.20, precioVenta: 4.50 }
        ],
        subtotal: 45.00,
        descuento: 0,
        total: 45.00,
        estado: 'Completada'
      },
      {
        id: 'TCK-10052',
        clienteName: 'Consumidor Final',
        clienteNit: '0',
        fecha: relDate(5),
        hora: '10:20:00',
        tipoPago: 'Efectivo',
        items: [
          { productoId: 'PROD-001', productoNombre: 'Paracetamol 500mg', loteId: 'L-1029', cantidad: 6, costoUnitario: 0.70, precioVenta: 1.50 }
        ],
        subtotal: 9.00,
        descuento: 0,
        total: 9.00,
        estado: 'Completada'
      },
      {
        id: 'TCK-10053',
        clienteName: 'Consumidor Final',
        clienteNit: '0',
        fecha: relDate(3),
        hora: '15:05:00',
        tipoPago: 'QR',
        items: [
          { productoId: 'PROD-002', productoNombre: 'Ibuprofeno 400mg', loteId: 'L-8842', cantidad: 4, costoUnitario: 1.10, precioVenta: 2.50 },
          { productoId: 'PROD-001', productoNombre: 'Paracetamol 500mg', loteId: 'L-1029', cantidad: 10, costoUnitario: 0.70, precioVenta: 1.50 }
        ],
        subtotal: 25.00,
        descuento: 0,
        total: 25.00,
        estado: 'Completada'
      },
      {
        id: 'TCK-10054',
        clienteName: 'Consumidor Final',
        clienteNit: '0',
        fecha: relDate(2),
        hora: '09:40:00',
        tipoPago: 'Efectivo',
        items: [
          { productoId: 'PROD-003', productoNombre: 'Amoxicilina 500mg', loteId: 'L-7712', cantidad: 6, costoUnitario: 2.20, precioVenta: 4.50 }
        ],
        subtotal: 27.00,
        descuento: 0,
        total: 27.00,
        estado: 'Completada'
      },
      {
        id: 'TCK-10055',
        clienteName: 'Consumidor Final',
        clienteNit: '0',
        fecha: relDate(1),
        hora: '17:30:00',
        tipoPago: 'QR',
        items: [
          { productoId: 'PROD-001', productoNombre: 'Paracetamol 500mg', loteId: 'L-1029', cantidad: 12, costoUnitario: 0.70, precioVenta: 1.50 },
          { productoId: 'PROD-002', productoNombre: 'Ibuprofeno 400mg', loteId: 'L-8842', cantidad: 6, costoUnitario: 1.10, precioVenta: 2.50 }
        ],
        subtotal: 33.00,
        descuento: 0,
        total: 33.00,
        estado: 'Completada'
      },
      {
        id: 'TCK-10056',
        clienteName: 'Consumidor Final',
        clienteNit: '0',
        fecha: relDate(0),
        hora: '11:50:00',
        tipoPago: 'Efectivo',
        items: [
          { productoId: 'PROD-003', productoNombre: 'Amoxicilina 500mg', loteId: 'L-7712', cantidad: 4, costoUnitario: 2.20, precioVenta: 4.50 },
          { productoId: 'PROD-001', productoNombre: 'Paracetamol 500mg', loteId: 'L-1029', cantidad: 8, costoUnitario: 0.70, precioVenta: 1.50 }
        ],
        subtotal: 30.00,
        descuento: 0,
        total: 30.00,
        estado: 'Completada'
      }
    ];

    // 5. Sembrado de Kardex Histórico (incluye el movimiento de las ventas recientes de arriba)
    this.kardex = [
      { id: 'K-001', fecha: '2026-06-15', hora: '11:15:00', productoId: 'PROD-001', productoNombre: 'Paracetamol 500mg', tipoMovimiento: 'Salida', detalle: 'Venta simulada TCK-10050 (Anulada)', loteId: 'L-1029', cantidad: 8, stockAnterior: 120, stockNuevo: 120 },
      { id: 'K-002', fecha: '2026-06-20', hora: '13:42:10', productoId: 'PROD-003', productoNombre: 'Amoxicilina 500mg', tipoMovimiento: 'Salida', detalle: 'Venta Factura TCK-10051', loteId: 'L-7712', cantidad: 10, stockAnterior: 50, stockNuevo: 40 },
      { id: 'K-003', fecha: relDate(5), hora: '10:20:00', productoId: 'PROD-001', productoNombre: 'Paracetamol 500mg', tipoMovimiento: 'Salida', detalle: 'Venta Ticket TCK-10052', loteId: 'L-1029', cantidad: 6, stockAnterior: 320, stockNuevo: 314 },
      { id: 'K-004', fecha: relDate(3), hora: '15:05:00', productoId: 'PROD-002', productoNombre: 'Ibuprofeno 400mg', tipoMovimiento: 'Salida', detalle: 'Venta Ticket TCK-10053', loteId: 'L-8842', cantidad: 4, stockAnterior: 95, stockNuevo: 91 },
      { id: 'K-005', fecha: relDate(3), hora: '15:05:00', productoId: 'PROD-001', productoNombre: 'Paracetamol 500mg', tipoMovimiento: 'Salida', detalle: 'Venta Ticket TCK-10053', loteId: 'L-1029', cantidad: 10, stockAnterior: 314, stockNuevo: 304 },
      { id: 'K-006', fecha: relDate(2), hora: '09:40:00', productoId: 'PROD-003', productoNombre: 'Amoxicilina 500mg', tipoMovimiento: 'Salida', detalle: 'Venta Ticket TCK-10054', loteId: 'L-7712', cantidad: 6, stockAnterior: 45, stockNuevo: 39 },
      { id: 'K-007', fecha: relDate(1), hora: '17:30:00', productoId: 'PROD-001', productoNombre: 'Paracetamol 500mg', tipoMovimiento: 'Salida', detalle: 'Venta Ticket TCK-10055', loteId: 'L-1029', cantidad: 12, stockAnterior: 304, stockNuevo: 292 },
      { id: 'K-008', fecha: relDate(1), hora: '17:30:00', productoId: 'PROD-002', productoNombre: 'Ibuprofeno 400mg', tipoMovimiento: 'Salida', detalle: 'Venta Ticket TCK-10055', loteId: 'L-8842', cantidad: 6, stockAnterior: 91, stockNuevo: 85 },
      { id: 'K-009', fecha: relDate(0), hora: '11:50:00', productoId: 'PROD-003', productoNombre: 'Amoxicilina 500mg', tipoMovimiento: 'Salida', detalle: 'Venta Ticket TCK-10056', loteId: 'L-7712', cantidad: 4, stockAnterior: 39, stockNuevo: 35 },
      { id: 'K-010', fecha: relDate(0), hora: '11:50:00', productoId: 'PROD-001', productoNombre: 'Paracetamol 500mg', tipoMovimiento: 'Salida', detalle: 'Venta Ticket TCK-10056', loteId: 'L-1029', cantidad: 8, stockAnterior: 292, stockNuevo: 284 }
    ];

    this.saveToStorage();
  }

  // --- MÉTODOS DE PROVEEDORES (CRUD) ---
  getSuppliers(): Proveedor[] {
    return this.suppliers;
  }

  addSupplier(sup: Omit<Proveedor, 'id'>) {
    const newId = this.suppliers.length > 0 ? Math.max(...this.suppliers.map(s => s.id)) + 1 : 1;
    const newSupplier = { id: newId, ...sup };
    this.suppliers.push(newSupplier);
    this.saveToStorage();
    emitApiSim(PROVEEDOR_CREATE, newSupplier, { statusCode: 201, requestBody: sup });
  }

  updateSupplier(sup: Proveedor) {
    const idx = this.suppliers.findIndex(s => s.id === sup.id);
    if (idx !== -1) {
      this.suppliers[idx] = sup;
      this.saveToStorage();
      emitApiSim(PROVEEDOR_UPDATE, sup, { requestBody: sup });
    }
  }

  deleteSupplier(id: number) {
    this.suppliers = this.suppliers.filter(s => s.id !== id);
    this.saveToStorage();
    emitApiSim(PROVEEDOR_DELETE, { id });
  }

  // --- MÉTODOS DE PRODUCTOS (CRUD) ---
  getProducts(): Producto[] {
    return this.products;
  }

  addEmptyProduct(p: Omit<Producto, 'lotes'>) {
    const newProduct = { ...p, lotes: [] };
    this.products.push(newProduct);
    this.saveToStorage();
    emitApiSim(PRODUCTO_CREATE, newProduct, { statusCode: 201, requestBody: p });
  }

  updateProductInfo(p: Producto) {
    const idx = this.products.findIndex(pr => pr.id === p.id);
    if (idx !== -1) {
      this.products[idx].nombre = p.nombre;
      this.products[idx].descripcion = p.descripcion;
      this.products[idx].laboratorio = p.laboratorio;
      this.products[idx].principioActivo = p.principioActivo;
      this.products[idx].categoria = p.categoria;
      this.products[idx].stockMinimo = p.stockMinimo;
      this.products[idx].precioVenta = p.precioVenta;
      this.products[idx].recetaObligatoria = p.recetaObligatoria;
      this.saveToStorage();
      emitApiSim(PRODUCTO_UPDATE, this.products[idx], { requestBody: p });
    }
  }

  deleteProduct(id: string) {
    this.products = this.products.filter(p => p.id !== id);
    this.saveToStorage();
    emitApiSim(PRODUCTO_DELETE, { id });
  }

  // Importar simulado
  importExcelProducts(rows: Array<any>) {
    let imported = 0;
    rows.forEach(r => {
      const exists = this.products.find(p => p.nombre.toLowerCase() === r.nombre.toLowerCase());
      if (!exists) {
        const id = `PROD-${String(this.products.length + 1).padStart(3, '0')}`;
        this.products.push({
          id,
          nombre: r.nombre,
          descripcion: r.descripcion || 'Importado de catálogo maestro',
          laboratorio: r.laboratorio || 'Genérico',
          principioActivo: r.principioActivo || r.nombre,
          categoria: r.categoria || 'Otros',
          stockMinimo: r.stockMinimo || 15,
          precioVenta: r.precioVenta || 5.00,
          recetaObligatoria: r.recetaObligatoria || false,
          lotes: r.lotes || []
        });
        imported++;
      }
    });
    this.saveToStorage();
    emitApiSim(PRODUCTO_IMPORT, { count: imported }, { statusCode: 201 });
  }

  getProductStock(p: Producto): number {
    return p.lotes.reduce((acc, l) => acc + l.stock, 0);
  }

  // --- MÉTODOS DE COMPRAS (INGRESO MERCADERÍA) ---
  getPurchases(): Compra[] {
    return this.purchases;
  }

  addPurchase(compra: Omit<Compra, 'id'>) {
    const newId = `CMP-${String(this.purchases.length + 1).padStart(3, '0')}`;
    const newPurchase: Compra = { id: newId, ...compra };
    
    // Registrar lotes en el inventario e impactar Kardex
    newPurchase.items.forEach(item => {
      const prod = this.products.find(p => p.id === item.productoId);
      if (prod) {
        // Buscar si ya existe el lote
        const lotIdx = prod.lotes.findIndex(l => l.id === item.loteId);
        const oldStock = this.getProductStock(prod);
        
        if (lotIdx !== -1) {
          // Lote existente: Sumar stock
          prod.lotes[lotIdx].stock += item.cantidad;
          prod.lotes[lotIdx].costoCompra = item.costoUnitario; // actualiza costo
        } else {
          // Lote nuevo: Insertar ordenadamente por fecha de vencimiento
          prod.lotes.push({
            id: item.loteId,
            fechaVencimiento: item.fechaVencimiento,
            stock: item.cantidad,
            costoCompra: item.costoUnitario,
            fechaIngreso: newPurchase.fecha
          });
        }

        const newStock = this.getProductStock(prod);

        // Registrar en Kardex
        this.addKardexLog({
          id: `K-${String(this.kardex.length + 1).padStart(3, '0')}`,
          fecha: newPurchase.fecha,
          hora: '09:00:00', // hora por defecto de ingreso
          productoId: prod.id,
          productoNombre: prod.nombre,
          tipoMovimiento: 'Entrada',
          detalle: `Compra Factura Nro. ${newPurchase.nroFactura} (Proveedor: ${newPurchase.proveedorNombre})`,
          loteId: item.loteId,
          cantidad: item.cantidad,
          stockAnterior: oldStock,
          stockNuevo: newStock
        });
      }
    });

    this.purchases.push(newPurchase);
    this.saveToStorage();
    emitApiSim(COMPRA_CREATE, newPurchase, { statusCode: 201, requestBody: compra });
  }

  // --- ALGORITMO FEFO Y COMPRA (POS VENTAS) ---
  
  /**
   * Obtiene los lotes activos (no vencidos, con stock > 0) ordenados por fecha de vencimiento ascendente.
   * Criterio de Aceptación HU8: Primero en expirar, primero en salir.
   */
  getFefoLotesActivos(productoId: string, todayDate: string = '2026-06-30'): Lote[] {
    const prod = this.products.find(p => p.id === productoId);
    if (!prod) return [];
    
    return prod.lotes
      .filter(l => l.stock > 0 && l.fechaVencimiento >= todayDate)
      .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());
  }

  /**
   * Registra una venta descontando stock mediante el método FEFO.
   */
  addSale(saleData: Omit<Venta, 'id' | 'items' | 'estado'>, cartItems: Array<{ productoId: string, cantidad: number }>) {
    const newId = `TCK-${String(10050 + this.sales.length + 1)}`;
    const today = saleData.fecha;
    const finalItems: VentaItem[] = [];

    // Procesar cada ítem aplicando el algoritmo FEFO
    cartItems.forEach(cartItem => {
      const prod = this.products.find(p => p.id === cartItem.productoId);
      if (prod) {
        let qtyToDiscount = cartItem.cantidad;
        
        // Obtener lotes ordenados por FEFO
        const fefoLotes = this.getFefoLotesActivos(prod.id, today);
        const oldStockTotal = this.getProductStock(prod);

        for (const lote of fefoLotes) {
          if (qtyToDiscount <= 0) break;

          const oldLoteStock = lote.stock;
          const discount = Math.min(lote.stock, qtyToDiscount);
          
          lote.stock -= discount;
          qtyToDiscount -= discount;

          finalItems.push({
            productoId: prod.id,
            productoNombre: prod.nombre,
            loteId: lote.id,
            cantidad: discount,
            costoUnitario: lote.costoCompra,
            precioVenta: prod.precioVenta
          });

          // Registrar descuento parcial en el Kardex
          const currentTotalStock = this.getProductStock(prod);
          this.addKardexLog({
            id: `K-${String(this.kardex.length + 1).padStart(3, '0')}`,
            fecha: today,
            hora: saleData.hora,
            productoId: prod.id,
            productoNombre: prod.nombre,
            tipoMovimiento: 'Salida',
            detalle: `Venta Ticket ${newId}`,
            loteId: lote.id,
            cantidad: discount,
            stockAnterior: currentTotalStock + discount,
            stockNuevo: currentTotalStock
          });
        }
      }
    });

    const newSale: Venta = {
      id: newId,
      clienteName: saleData.clienteName,
      clienteNit: saleData.clienteNit,
      fecha: today,
      hora: saleData.hora,
      tipoPago: saleData.tipoPago,
      items: finalItems,
      subtotal: saleData.subtotal,
      descuento: saleData.descuento,
      total: saleData.total,
      estado: 'Completada'
    };

    this.sales.push(newSale);
    this.saveToStorage();
    emitApiSim(VENTA_CREATE, newSale, { statusCode: 201, requestBody: { ...saleData, items: cartItems } });
    return newSale;
  }

  anularSale(saleId: string) {
    const sale = this.sales.find(s => s.id === saleId);
    if (sale && sale.estado === 'Completada') {
      sale.estado = 'Anulada';
      
      // Devolver stock de los lotes y registrar en Kardex
      sale.items.forEach(item => {
        const prod = this.products.find(p => p.id === item.productoId);
        if (prod) {
          const oldStock = this.getProductStock(prod);
          const lot = prod.lotes.find(l => l.id === item.loteId);
          if (lot) {
            lot.stock += item.cantidad;
          } else {
            // Si el lote ya no existiera, lo recreamos
            prod.lotes.push({
              id: item.loteId,
              fechaVencimiento: '2027-12-31', // fecha fallback
              stock: item.cantidad,
              costoCompra: item.costoUnitario,
              fechaIngreso: sale.fecha
            });
          }
          const newStock = this.getProductStock(prod);

          this.addKardexLog({
            id: `K-${String(this.kardex.length + 1).padStart(3, '0')}`,
            fecha: sale.fecha,
            hora: '17:00:00',
            productoId: prod.id,
            productoNombre: prod.nombre,
            tipoMovimiento: 'Entrada',
            detalle: `Anulación Venta Ticket ${sale.id}`,
            loteId: item.loteId,
            cantidad: item.cantidad,
            stockAnterior: oldStock,
            stockNuevo: newStock
          });
        }
      });

      this.saveToStorage();
      emitApiSim(VENTA_ANULAR, { id: sale.id, items: sale.items.length });
    }
  }

  getSales(): Venta[] {
    return this.sales;
  }

  // --- MÉTODOS DE AJUSTES MANUALES ---
  ajusteManualStock(productoId: string, loteId: string, cantidadNueva: number, motivo: string, today: string = '2026-06-30') {
    const prod = this.products.find(p => p.id === productoId);
    if (prod) {
      const lote = prod.lotes.find(l => l.id === loteId);
      if (lote) {
        const oldStockTotal = this.getProductStock(prod);
        const oldLoteStock = lote.stock;
        const diff = cantidadNueva - oldLoteStock;
        
        lote.stock = cantidadNueva;
        const newStockTotal = this.getProductStock(prod);

        if (diff !== 0) {
          this.addKardexLog({
            id: `K-${String(this.kardex.length + 1).padStart(3, '0')}`,
            fecha: today,
            hora: '12:00:00',
            productoId: prod.id,
            productoNombre: prod.nombre,
            tipoMovimiento: diff > 0 ? 'Entrada' : 'Salida',
            detalle: `Ajuste Inventario: ${motivo}`,
            loteId: loteId,
            cantidad: Math.abs(diff),
            stockAnterior: oldStockTotal,
            stockNuevo: newStockTotal
          });
        }
        this.saveToStorage();
        emitApiSim(STOCK_ADJUST, { productoId, loteId, cantidadNueva, motivo });
      }
    }
  }

  // --- MÉTODOS DE GASTOS ---
  getExpenses(): Gasto[] {
    return this.expenses;
  }

  addExpense(g: Omit<Gasto, 'id'>) {
    const newId = `GST-${String(this.expenses.length + 1).padStart(3, '0')}`;
    const newExpense = { id: newId, ...g };
    this.expenses.push(newExpense);
    this.saveToStorage();
    emitApiSim(GASTO_CREATE, newExpense, { statusCode: 201, requestBody: g });
  }

  deleteExpense(id: string) {
    this.expenses = this.expenses.filter(e => e.id !== id);
    this.saveToStorage();
    emitApiSim(GASTO_DELETE, { id });
  }

  // --- MÉTODOS DE KARDEX ---
  getKardex(): KardexMovimiento[] {
    return this.kardex.sort((a, b) => b.id.localeCompare(a.id)); // Orden descendente (más recientes arriba)
  }

  private addKardexLog(log: KardexMovimiento) {
    this.kardex.push(log);
  }

  // --- REPORTES Y METRICAS ---

  /**
   * Reporte de Alertas del Dashboard (HU18)
   */
  getDashboardAlerts(todayDate: string = '2026-06-30') {
    const limitDate = new Date(todayDate);
    limitDate.setDate(limitDate.getDate() + 90); // 90 días adelante

    const stockBajo: Array<{ id: string, nombre: string, stock: number, min: number }> = [];
    const lotesPorVencer: Array<{ productoNombre: string, loteId: string, vencimiento: string, stock: number, diasRestantes: number }> = [];

    this.products.forEach(p => {
      const stock = this.getProductStock(p);
      if (stock <= p.stockMinimo) {
        stockBajo.push({ id: p.id, nombre: p.nombre, stock, min: p.stockMinimo });
      }

      p.lotes.forEach(l => {
        if (l.stock > 0) {
          const vDate = new Date(l.fechaVencimiento);
          const tDate = new Date(todayDate);
          
          if (vDate >= tDate && vDate <= limitDate) {
            const diffTime = Math.abs(vDate.getTime() - tDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            lotesPorVencer.push({
              productoNombre: p.nombre,
              loteId: l.id,
              vencimiento: l.fechaVencimiento,
              stock: l.stock,
              diasRestantes: diffDays
            });
          }
        }
      });
    });

    return {
      stockBajo,
      lotesPorVencer: lotesPorVencer.sort((a, b) => a.diasRestantes - b.diasRestantes)
    };
  }

  /**
   * Estado de Resultados (Reporte Financiero HU16)
   */
  getFinancialStatement(startDate: string, endDate: string) {
    // 1. Ingresos
    const validSales = this.sales.filter(s => s.estado === 'Completada' && s.fecha >= startDate && s.fecha <= endDate);
    const ingresos = validSales.reduce((acc, s) => acc + s.total, 0);

    // 2. Costo de Venta (COGS) calculado dinámicamente según FEFO
    let cogs = 0;
    validSales.forEach(s => {
      s.items.forEach(item => {
        cogs += (item.cantidad * item.costoUnitario);
      });
    });

    // 3. Gastos operativos
    const validExpenses = this.expenses.filter(e => e.fecha >= startDate && e.fecha <= endDate);
    const gastos = validExpenses.reduce((acc, e) => acc + e.monto, 0);

    const utilidadBruta = ingresos - cogs;
    const utilidadNeta = utilidadBruta - gastos;

    return {
      ingresos,
      cogs,
      utilidadBruta,
      gastos,
      utilidadNeta
    };
  }

  /**
   * Reporte SIAT Impuestos de Bolivia (HU17)
   */
  getSiatReport(monthYear: string) {
    // monthYear en formato "YYYY-MM"
    const validSales = this.sales.filter(s => s.estado === 'Completada' && s.fecha.startsWith(monthYear));
    const validPurchases = this.purchases.filter(p => p.fecha.startsWith(monthYear));

    const totalVendido = validSales.reduce((acc, s) => acc + s.total, 0);
    const totalComprado = validPurchases.reduce((acc, p) => acc + p.total, 0);

    // IVA 13% en Bolivia
    const debitoFiscal = totalVendido * 0.13;
    const creditoFiscal = totalComprado * 0.13;
    const ivaPagar = Math.max(0, debitoFiscal - creditoFiscal);

    // IT 3% de las ventas en Bolivia
    const impuestoTransacciones = totalVendido * 0.03;

    return {
      totalVendido,
      totalComprado,
      debitoFiscal,
      creditoFiscal,
      ivaPagar,
      impuestoTransacciones
    };
  }

  /**
   * Devuelve una lista plana de todos los lotes de todos los productos.
   * Usado en el Dashboard para alertas de vencimiento próximo.
   */
  getLotes(): Array<Lote & { productoId: string }> {
    const result: Array<Lote & { productoId: string }> = [];
    this.products.forEach(p => {
      p.lotes.forEach(l => {
        result.push({ ...l, productoId: p.id });
      });
    });
    return result;
  }

  // --- SEGURIDAD: AUTENTICACIÓN ---

  /**
   * Simula POST /api/login: valida credenciales contra la tabla de usuarios local
   * y devuelve un token ficticio + el usuario con su rol embebido.
   */
  authenticate(email: string, password: string): { token: string; user: any } | null {
    const user = this.users.find(u => u.email === email && u.password === password && u.status === 'activo');
    if (!user) {
      emitApiSim(AUTH_LOGIN_FAILED, { email }, { statusCode: 401 });
      return null;
    }
    const token = `demo-token-${user.id}-${Date.now()}`;
    const userDto = this.toUserDTO(user);
    emitApiSim(AUTH_LOGIN, { user: userDto, token }, { statusCode: 200, requestBody: { email } });
    return { token, user: userDto };
  }

  registerLogout(userId: number | null): void {
    emitApiSim(AUTH_LOGOUT, { userId: userId ?? 0 });
  }

  // --- SEGURIDAD: ROLES (CRUD) ---
  getRoles(): Rol[] {
    return this.roles;
  }

  getRole(id: number): Rol | undefined {
    return this.roles.find(r => r.id === id);
  }

  createRole(role: Omit<Rol, 'id'>): Rol {
    const newId = this.roles.length > 0 ? Math.max(...this.roles.map(r => r.id)) + 1 : 1;
    const newRole: Rol = { id: newId, ...role };
    this.roles.push(newRole);
    this.saveToStorage();
    emitApiSim(ROLE_CREATE, newRole, { statusCode: 201, requestBody: role });
    return newRole;
  }

  updateRole(id: number, role: Omit<Rol, 'id'>): Rol | undefined {
    const idx = this.roles.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    this.roles[idx] = { id, ...role };
    this.saveToStorage();
    emitApiSim(ROLE_UPDATE, this.roles[idx], { requestBody: role });
    return this.roles[idx];
  }

  deleteRole(id: number): void {
    this.roles = this.roles.filter(r => r.id !== id);
    this.saveToStorage();
    emitApiSim(ROLE_DELETE, { id });
  }

  // --- SEGURIDAD: USUARIOS (CRUD) ---
  private toUserDTO(u: Usuario): any {
    const { password, ...rest } = u;
    return { ...rest, role: this.getRole(u.role_id) };
  }

  getUsers(search?: string): any[] {
    let list = this.users;
    if (search) {
      const term = search.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    }
    return list.map(u => this.toUserDTO(u));
  }

  getUser(id: number): any {
    const user = this.users.find(u => u.id === id);
    return user ? this.toUserDTO(user) : undefined;
  }

  createUser(u: { name: string; email: string; password: string; role_id: number; status: 'activo' | 'suspendido' }): any {
    const newId = this.users.length > 0 ? Math.max(...this.users.map(x => x.id)) + 1 : 1;
    const newUser: Usuario = { id: newId, ...u };
    this.users.push(newUser);
    this.saveToStorage();
    const dto = this.toUserDTO(newUser);
    emitApiSim(USER_CREATE, dto, { statusCode: 201, requestBody: { ...u, password: '••••••••' } });
    return dto;
  }

  updateUser(id: number, u: { name: string; email: string; password?: string; role_id: number }): any {
    const idx = this.users.findIndex(x => x.id === id);
    if (idx === -1) return undefined;
    this.users[idx] = {
      ...this.users[idx],
      name: u.name,
      email: u.email,
      role_id: u.role_id,
      ...(u.password ? { password: u.password } : {})
    };
    this.saveToStorage();
    const dto = this.toUserDTO(this.users[idx]);
    emitApiSim(USER_UPDATE, dto, { requestBody: { ...u, password: u.password ? '••••••••' : undefined } });
    return dto;
  }

  deleteUser(id: number): void {
    const target = this.users.find(u => u.id === id);
    if (target && this.isLastActiveAdmin(target)) {
      throw new Error('No se puede eliminar al último administrador activo.');
    }
    this.users = this.users.filter(u => u.id !== id);
    this.saveToStorage();
  }

  changeUserStatus(id: number, status: 'activo' | 'suspendido'): any {
    const idx = this.users.findIndex(x => x.id === id);
    if (idx === -1) return undefined;

    if (status === 'suspendido' && this.isLastActiveAdmin(this.users[idx])) {
      throw new Error('No se puede suspender al último administrador activo. Active o cree otro administrador primero.');
    }

    this.users[idx].status = status;
    this.saveToStorage();
    const dto = this.toUserDTO(this.users[idx]);
    emitApiSim(USER_STATUS, dto);
    return dto;
  }

  /**
   * Evita el auto-bloqueo del demo: no permite dejar sin ningún Administrador activo.
   */
  private isLastActiveAdmin(user: Usuario): boolean {
    const role = this.getRole(user.role_id);
    if (role?.name !== 'Administrador' || user.status !== 'activo') return false;
    const activeAdmins = this.users.filter(u => u.status === 'activo' && this.getRole(u.role_id)?.name === 'Administrador');
    return activeAdmins.length <= 1;
  }

  /**
   * Restablece el demo a su estado inicial (seed data), borrando cualquier cambio
   * hecho por un visitante. Se invoca al cerrar sesión para que la demo quede
   * lista para el próximo visitante sin necesidad de intervención manual.
   */
  resetDemoData(): void {
    const keys = [
      'farmacia_products', 'farmacia_suppliers', 'farmacia_purchases',
      'farmacia_sales', 'farmacia_expenses', 'farmacia_kardex',
      'farmacia_roles', 'farmacia_users'
    ];
    keys.forEach(k => localStorage.removeItem(k));

    this.products = [];
    this.suppliers = [];
    this.purchases = [];
    this.sales = [];
    this.expenses = [];
    this.kardex = [];
    this.roles = [];
    this.users = [];

    this.seedDatabase();
    this.seedSecurity();
    apiSimBus.clearHistory();
  }
}
