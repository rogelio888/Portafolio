import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

export type IconoModulo = 'config' | 'admin' | 'reportes';

export interface MenuItem {
  nombre: string;
  icono: string;
  ruta: string;
  permiso?: string;
}

export interface GrupoMenu {
  titulo: string;
  items: MenuItem[];
  permiso?: string;
}

const MENU_DATA: GrupoMenu[] = [
  {
    titulo: 'Principal',
    items: [
      { nombre: 'Panel Inicial', icono: 'reportes', ruta: '/dashboard' }
    ]
  },
  {
    titulo: 'Recepción y Atención',
    permiso: 'administracion',
    items: [
      { nombre: 'Agenda de Citas', icono: 'reportes', ruta: '/citas' },
      { nombre: 'Calendario General', icono: 'reportes', ruta: '/calendario' }
    ]
  },
  {
    titulo: 'Finanzas y Facturación',
    permiso: 'administracion',
    items: [
      { nombre: 'Caja Registradora', icono: 'reportes', ruta: '/caja' }
    ]
  },
  {
    titulo: 'Reportes y Analíticas',
    permiso: 'reportes',
    items: [
      { nombre: 'Reportes Gerenciales', icono: 'reportes', ruta: '/reportes' }
    ]
  },
  {
    titulo: 'Portal del Médico',
    permiso: 'administracion',
    items: [
      { nombre: 'Mi Consultorio', icono: 'medic', ruta: '/panel-medico' }
    ]
  },
  {
    titulo: 'Administración Médica',
    permiso: 'administracion',
    items: [
      { nombre: 'Pacientes', icono: 'medic', ruta: '/pacientes' },
      { nombre: 'Especialidades', icono: 'medic', ruta: '/especialidades' },
      { nombre: 'Personal Médico', icono: 'medic', ruta: '/medicos' },
      { nombre: 'Horarios Médicos', icono: 'reportes', ruta: '/horarios' }
    ]
  },
  {
    titulo: 'Configuración del Sistema',
    items: [
      { nombre: 'Gestión de Usuarios', icono: 'config', ruta: '/usuarios', permiso: 'usuarios' },
      { nombre: 'Gestión de Roles', icono: 'admin', ruta: '/roles', permiso: 'roles' },
      { nombre: 'Bitácora', icono: 'reportes', ruta: '/bitacora', permiso: 'usuarios' },
      { nombre: 'Copias de Seguridad', icono: 'config', ruta: '/backup', permiso: 'usuarios' }
    ]
  }
];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  private readonly router = inject(Router);
  public readonly auth = inject(AuthService);

  public get grupos(): GrupoMenu[] {
    const user = this.auth.usuario();
    if (!user) return [];

    return MENU_DATA.map(grupo => {
      // Filtrar el grupo por permisos
      if (grupo.permiso && !user.permisos.includes(grupo.permiso)) {
        return null;
      }

      // Filtrar items del grupo por permisos
      const itemsFiltrados = grupo.items.filter(item => {
        if (item.permiso && !user.permisos.includes(item.permiso)) {
          return false;
        }
        return true;
      });

      if (itemsFiltrados.length === 0) {
        return null;
      }

      return {
        ...grupo,
        items: itemsFiltrados
      };
    }).filter(g => g !== null) as GrupoMenu[];
  }

  getInicial(): string {
    const u = this.auth.usuario();
    return u ? u.nombre.charAt(0).toUpperCase() : 'U';
  }

  getNombreCompleto(): string {
    const u = this.auth.usuario();
    return u ? `${u.nombre} (${u.rolNombre})` : 'Usuario';
  }

  cerrarSesion(): void {
    this.auth.logout();
  }
}
