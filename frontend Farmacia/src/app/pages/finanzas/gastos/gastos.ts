import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Gasto } from '../../../services/db.service';
import { NotificationService } from '../../../services/notification.service';
import { toLocalDateStr } from '../../../shared/date-utils';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gastos.html',
  styleUrl: './gastos.css',
})
export class Gastos {
  private db = inject(DbService);
  private notify = inject(NotificationService);

  showModal = false;

  // Formulario
  form = {
    fecha: toLocalDateStr(),
    categoria: 'Otros' as Gasto['categoria'],
    descripcion: '',
    monto: 0
  };

  // Filtros
  searchQuery = '';
  filterCategory = '';
  filterMonth = '2026-06';

  get expenses(): Gasto[] {
    return this.db.getExpenses().filter(e => {
      const q = this.searchQuery.toLowerCase();
      const matchSearch = e.descripcion.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
      const matchCategory = !this.filterCategory || e.categoria === this.filterCategory;
      const matchMonth = !this.filterMonth || e.fecha.startsWith(this.filterMonth);
      return matchSearch && matchCategory && matchMonth;
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  // Sumatoria total de gastos del mes seleccionado
  get totalExpensesMonth(): number {
    return this.expenses.reduce((acc, e) => acc + e.monto, 0);
  }

  openCreateModal() {
    this.form = {
      fecha: toLocalDateStr(),
      categoria: 'Otros',
      descripcion: '',
      monto: 0
    };
    this.showModal = true;
  }

  saveExpense() {
    if (!this.form.descripcion || this.form.monto <= 0) {
      this.notify.warning('Por favor complete la descripción y especifique un monto mayor a 0.');
      return;
    }

    this.db.addExpense({
      fecha: this.form.fecha,
      categoria: this.form.categoria,
      descripcion: this.form.descripcion,
      monto: this.form.monto
    });

    this.showModal = false;
  }

  async deleteExpense(id: string) {
    if (!(await this.notify.confirm('¿Está seguro de eliminar este registro de gasto?'))) return;
    this.db.deleteExpense(id);
  }
}
