import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';

interface PermissionItem {
  module: string;
  label: string;
  slug: string;
  checked: boolean;
}

@Component({
  selector: 'app-roles',
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
})
export class Roles implements OnInit {
  roles: any[] = [];
  showModal = false;
  roleName = '';
  selectedRoleId: number | null = null;

  permissionsList: PermissionItem[] = [
    // Seguridad
    { module: 'Seguridad', label: 'Ver Roles y Usuarios', slug: 'ver_roles_usuarios', checked: false },
    { module: 'Seguridad', label: 'Modificar Usuarios', slug: 'modificar_usuarios', checked: false },
    { module: 'Seguridad', label: 'Ver Bitácora', slug: 'ver_bitacora', checked: false },
    // Inventario
    { module: 'Inventario', label: 'Gestionar Catálogo', slug: 'gestionar_catalogo', checked: false },
    { module: 'Inventario', label: 'Ver Kardex', slug: 'ver_kardex', checked: false },
    { module: 'Inventario', label: 'Ajuste Manual de Stock', slug: 'ajuste_manual_stock', checked: false },
    // Ventas
    { module: 'Ventas', label: 'Operar Punto de Venta (POS)', slug: 'operar_pos', checked: false },
    { module: 'Ventas', label: 'Cobrar en Efectivo / QR', slug: 'cobrar_efectivo_qr', checked: false },
    // Finanzas
    { module: 'Finanzas', label: 'Registrar Gastos', slug: 'registrar_gastos', checked: false },
    { module: 'Finanzas', label: 'Ver Reporte de Ventas', slug: 'ver_reporte_ventas', checked: false },
    { module: 'Finanzas', label: 'Generar Reporte Tributario (SIAT)', slug: 'generar_reporte_siat', checked: false },
  ];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.apiService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Error cargando los roles de seguridad.');
        console.error(err);
      }
    });
  }

  getPermissionsByModule(module: string): PermissionItem[] {
    return this.permissionsList.filter(p => p.module === module);
  }

  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  editRole(role: any): void {
    this.resetForm();
    this.selectedRoleId = role.id;
    this.roleName = role.name;

    // Mark active permissions from backend
    const activeSlugs = Array.isArray(role.permissions) ? role.permissions : [];
    this.permissionsList.forEach(p => {
      p.checked = activeSlugs.includes(p.slug);
    });

    this.showModal = true;
  }

  onSubmit(): void {
    if (!this.roleName.trim()) {
      this.notificationService.warning('El nombre del rol es obligatorio.');
      return;
    }

    const permissions = this.permissionsList.filter(p => p.checked).map(p => p.slug);
    if (permissions.length === 0) {
      this.notificationService.warning('Debe seleccionar al menos un permiso.');
      return;
    }

    const payload = {
      name: this.roleName.trim(),
      permissions
    };

    if (this.selectedRoleId) {
      // Update
      this.apiService.updateRole(this.selectedRoleId, payload).subscribe({
        next: (res) => {
          this.notificationService.success('Rol actualizado con éxito.');
          this.loadRoles();
          this.showModal = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al actualizar el rol.';
          this.notificationService.error(msg);
        }
      });
    } else {
      // Create
      this.apiService.createRole(payload).subscribe({
        next: (res) => {
          this.notificationService.success('Rol creado con éxito.');
          this.loadRoles();
          this.showModal = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al crear el rol.';
          this.notificationService.error(msg);
        }
      });
    }
  }

  deleteRole(role: any): void {
    const message = `¿Está seguro de eliminar el rol "${role.name}"? Esta acción no se puede deshacer si tiene usuarios asignados.`;
    
    this.notificationService.confirm(message, {
      title: 'Eliminar Rol',
      confirmText: 'Eliminar',
      danger: true
    }).then((confirmed) => {
      if (confirmed) {
        this.apiService.deleteRole(role.id).subscribe({
          next: () => {
            this.notificationService.success('Rol eliminado con éxito.');
            this.loadRoles();
            this.cdr.detectChanges();
          },
          error: (err) => {
            const msg = err.error?.message || 'No se puede eliminar el rol.';
            this.notificationService.error(msg);
          }
        });
      }
    });
  }

  resetForm(): void {
    this.selectedRoleId = null;
    this.roleName = '';
    this.permissionsList.forEach(p => p.checked = false);
  }
}
