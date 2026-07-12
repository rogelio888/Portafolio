import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Proveedor } from '../../../services/db.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css',
})
export class Proveedores {
  private db = inject(DbService);
  private notify = inject(NotificationService);

  showModal = false;
  isEditing = false;
  editingId: number | null = null;

  // Formulario
  form = {
    nombre: '',
    nit: '',
    telefono: '',
    direccion: '',
    contacto: ''
  };

  // Filtros
  searchQuery = '';

  get suppliers(): Proveedor[] {
    return this.db.getSuppliers().filter(s => {
      const q = this.searchQuery.toLowerCase();
      return s.nombre.toLowerCase().includes(q) || s.nit.includes(q);
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.form = {
      nombre: '',
      nit: '',
      telefono: '',
      direccion: '',
      contacto: ''
    };
    this.showModal = true;
  }

  openEditModal(sup: Proveedor) {
    this.isEditing = true;
    this.editingId = sup.id;
    this.form = {
      nombre: sup.nombre,
      nit: sup.nit,
      telefono: sup.telefono,
      direccion: sup.direccion,
      contacto: sup.contacto || ''
    };
    this.showModal = true;
  }

  saveSupplier() {
    if (!this.form.nombre || !this.form.nit) {
      this.notify.warning('Por favor complete los campos obligatorios.');
      return;
    }

    if (this.isEditing && this.editingId !== null) {
      this.db.updateSupplier({
        id: this.editingId,
        ...this.form
      });
    } else {
      this.db.addSupplier(this.form);
    }

    this.showModal = false;
  }

  async deleteSupplier(id: number) {
    if (!(await this.notify.confirm('¿Está seguro de eliminar este proveedor?'))) return;
    this.db.deleteSupplier(id);
  }
}
