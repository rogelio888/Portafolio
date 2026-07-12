import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  users: any[] = [];
  roles: any[] = [];
  showModal = false;

  // Form Fields
  userName = '';
  userEmail = '';
  userPassword = '';
  userRoleId: number | string = '';
  selectedUserId: number | null = null;

  searchTerm = '';

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.apiService.getUsers(this.searchTerm).subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Error al cargar la lista de usuarios.');
        console.error(err);
      }
    });
  }

  loadRoles(): void {
    this.apiService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar roles para select:', err);
      }
    });
  }

  onSearch(): void {
    this.loadUsers();
  }

  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  editUser(user: any): void {
    this.resetForm();
    this.selectedUserId = user.id;
    this.userName = user.name;
    this.userEmail = user.email;
    this.userRoleId = user.role_id;
    this.showModal = true;
  }

  onSubmit(): void {
    if (!this.userName.trim() || !this.userEmail.trim() || !this.userRoleId) {
      this.notificationService.warning('Por favor complete todos los campos obligatorios.');
      return;
    }

    const payload: any = {
      name: this.userName.trim(),
      email: this.userEmail.trim(),
      role_id: Number(this.userRoleId)
    };

    if (this.userPassword) {
      payload.password = this.userPassword;
    }

    if (this.selectedUserId) {
      // Update
      this.apiService.updateUser(this.selectedUserId, payload).subscribe({
        next: () => {
          this.notificationService.success('Usuario actualizado con éxito.');
          this.loadUsers();
          this.showModal = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al actualizar el usuario.';
          this.notificationService.error(msg);
        }
      });
    } else {
      // Create (requires password)
      if (!this.userPassword) {
        this.notificationService.warning('La contraseña es obligatoria para nuevos usuarios.');
        return;
      }
      payload.status = 'activo';

      this.apiService.createUser(payload).subscribe({
        next: () => {
          this.notificationService.success('Usuario creado con éxito.');
          this.loadUsers();
          this.showModal = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al crear el usuario.';
          this.notificationService.error(msg);
        }
      });
    }
  }

  toggleStatus(user: any): void {
    const newStatus = user.status === 'activo' ? 'suspendido' : 'activo';
    const actionText = newStatus === 'activo' ? 'activar' : 'suspender';

    this.notificationService.confirm(`¿Está seguro de que desea ${actionText} el acceso para el usuario "${user.name}"?`, {
      title: `${newStatus === 'activo' ? 'Activar' : 'Suspender'} Usuario`,
      confirmText: newStatus === 'activo' ? 'Activar' : 'Suspender',
      danger: newStatus === 'suspendido'
    }).then((confirmed) => {
      if (confirmed) {
        this.apiService.changeUserStatus(user.id, newStatus).subscribe({
          next: () => {
            this.notificationService.success(`Usuario ${newStatus === 'activo' ? 'activado' : 'suspendido'} con éxito.`);
            this.loadUsers();
            this.cdr.detectChanges();
          },
          error: (err) => {
            const msg = err.error?.message || 'Error al cambiar el estado del usuario.';
            this.notificationService.error(msg);
          }
        });
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  resetForm(): void {
    this.selectedUserId = null;
    this.userName = '';
    this.userEmail = '';
    this.userPassword = '';
    this.userRoleId = '';
  }
}
