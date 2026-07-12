import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Producto } from '../../../services/db.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
  private db = inject(DbService);
  private notify = inject(NotificationService);

  // Modales
  showModal = false;
  showDetalleModal = false;
  showImportModal = false;

  // Edición
  isEditing = false;
  editingProductId = '';

  // Formulario de Producto
  form = {
    id: '',
    nombre: '',
    descripcion: '',
    laboratorio: '',
    principioActivo: '',
    categoria: 'Analgésicos',
    stockMinimo: 10,
    precioVenta: 1.00,
    recetaObligatoria: false
  };

  // Producto seleccionado para ver lotes
  selectedProduct: Producto | null = null;

  // Búsqueda y Filtros
  searchQuery = '';
  filterCategory = '';

  // Variables para la simulación de importación Excel
  importStep = 1; // 1: Instrucciones/Subir, 2: Simulando/Cargando, 3: Éxito
  simulatedRows = 0;

  // Obtener listado de productos filtrados
  get products(): Producto[] {
    return this.db.getProducts().filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            p.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            p.principioActivo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            p.laboratorio.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesCategory = !this.filterCategory || p.categoria === this.filterCategory;
      return matchesSearch && matchesCategory;
    });
  }

  // Stock total de un producto sumando lotes
  getProductStock(p: Producto): number {
    return this.db.getProductStock(p);
  }

  // Abrir modal de creación
  openCreateModal() {
    this.isEditing = false;
    this.editingProductId = '';
    this.form = {
      id: '',
      nombre: '',
      descripcion: '',
      laboratorio: '',
      principioActivo: '',
      categoria: 'Analgésicos',
      stockMinimo: 10,
      precioVenta: 1.00,
      recetaObligatoria: false
    };
    this.showModal = true;
  }

  // Abrir modal de edición
  openEditModal(p: Producto, event: Event) {
    event.stopPropagation(); // Evitar abrir detalles
    this.isEditing = true;
    this.editingProductId = p.id;
    this.form = {
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      laboratorio: p.laboratorio,
      principioActivo: p.principioActivo,
      categoria: p.categoria,
      stockMinimo: p.stockMinimo,
      precioVenta: p.precioVenta,
      recetaObligatoria: p.recetaObligatoria
    };
    this.showModal = true;
  }

  // Abrir detalles de producto
  openDetailModal(p: Producto) {
    this.selectedProduct = p;
    this.showDetalleModal = true;
  }

  // Guardar Ficha de Producto
  saveProduct() {
    if (!this.form.nombre || !this.form.precioVenta) {
      this.notify.warning('Por favor complete los campos obligatorios.');
      return;
    }

    if (this.isEditing) {
      const updatedProduct: Producto = {
        ...this.form,
        id: this.editingProductId,
        lotes: this.selectedProduct ? this.selectedProduct.lotes : []
      };
      this.db.updateProductInfo(updatedProduct);
    } else {
      const code = this.form.id || `PROD-${String(this.db.getProducts().length + 1).padStart(3, '0')}`;
      this.db.addEmptyProduct({
        ...this.form,
        id: code
      });
    }

    this.showModal = false;
  }

  // Eliminar Producto
  async deleteProduct(id: string, event: Event) {
    event.stopPropagation();
    if (!(await this.notify.confirm('¿Está seguro de eliminar este producto del catálogo? Se perderán todos sus lotes asociados.'))) return;
    this.db.deleteProduct(id);
    if (this.selectedProduct?.id === id) {
      this.selectedProduct = null;
      this.showDetalleModal = false;
    }
  }

  // Simulación de Importación Excel
  startImportSimulation() {
    this.importStep = 2;
    setTimeout(() => {
      // Mock de filas de Excel
      const mockRows = [
        { nombre: 'Omeprazol 20mg', descripcion: 'Inhibidor de la bomba de protones', laboratorio: 'Laboratorios Vita', principioActivo: 'Omeprazol', categoria: 'Gastrointestinales', stockMinimo: 40, precioVenta: 1.80 },
        { nombre: 'Losartán Potásico 50mg', descripcion: 'Antihipertensivo antagonista II', laboratorio: 'Laboratorios Bagó', principioActivo: 'Losartán', categoria: 'Cardiovasculares', stockMinimo: 30, precioVenta: 3.20 },
        { nombre: 'Complejo B Inyectable', descripcion: 'Suplemento multivitamínico del complejo B', laboratorio: 'Laboratorios Inti', principioActivo: 'Vitaminas B1, B6, B12', categoria: 'Vitaminas', stockMinimo: 15, precioVenta: 12.00 },
        { nombre: 'Paracetamol Jarabe 120mg/5ml', descripcion: 'Analgésico infantil', laboratorio: 'Laboratorios Inti', principioActivo: 'Paracetamol', categoria: 'Analgésicos', stockMinimo: 20, precioVenta: 14.50 },
        { nombre: 'Ciprofloxacina 500mg', descripcion: 'Antibiótico fluoroquinolona', laboratorio: 'Laboratorios Vita', principioActivo: 'Ciprofloxacina', categoria: 'Antibióticos', stockMinimo: 25, precioVenta: 5.00 }
      ];
      
      this.db.importExcelProducts(mockRows);
      this.simulatedRows = mockRows.length;
      this.importStep = 3;
    }, 2000);
  }

  closeImportModal() {
    this.showImportModal = false;
    setTimeout(() => {
      this.importStep = 1;
    }, 300);
  }
}
