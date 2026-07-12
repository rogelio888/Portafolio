import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MedicoService } from '../../core/services/medico.service';
import { CitaService } from '../../core/services/cita.service';
import { ComprobanteService } from '../../core/services/comprobante.service';
import { toLocalDateStr } from '../../shared/date-utils';

export type IconoModulo = 'config' | 'admin' | 'reportes';

interface ModuloMenu {
  nombre: string;
  descripcion: string;
  icono: IconoModulo;
  ruta: string;
  permiso?: string;
}

const MODULOS: ModuloMenu[] = [
  { nombre: 'Caja Registradora', icono: 'reportes', descripcion: 'Gestión de ingresos en efectivo y recibos.', ruta: '/caja', permiso: 'administracion' },
  { nombre: 'Calendario General', icono: 'reportes', descripcion: 'Panorama interactivo de la programación clínica.', ruta: '/calendario', permiso: 'administracion' },
  { nombre: 'Mi Consultorio', icono: 'reportes', descripcion: 'Portal exclusivo para doctores (atención y controles).', ruta: '/panel-medico', permiso: 'administracion' },
  { nombre: 'Agenda de Citas', icono: 'reportes', descripcion: 'Gestión y reserva de turnos médicos.', ruta: '/citas', permiso: 'administracion' },
  { nombre: 'Directorio de Pacientes', icono: 'reportes', descripcion: 'Gestión de datos demográficos y contacto.', ruta: '/pacientes', permiso: 'administracion' },
  { nombre: 'Personal Médico', icono: 'reportes', descripcion: 'Registro de doctores y asignación clínica.', ruta: '/medicos', permiso: 'administracion' },
  { nombre: 'Configuración de Horarios', icono: 'reportes', descripcion: 'Motor de disponibilidad de médicos.', ruta: '/horarios', permiso: 'administracion' },
  { nombre: 'Catálogo de Especialidades', icono: 'reportes', descripcion: 'Administrar los servicios médicos de la clínica.', ruta: '/especialidades', permiso: 'administracion' },
  { nombre: 'Reportes Gerenciales', icono: 'reportes', descripcion: 'Estadísticas de ingresos, citas y desempeño médico.', ruta: '/reportes', permiso: 'reportes' },
  { nombre: 'Gestión de Usuarios', icono: 'config', descripcion: 'Administrar cuentas de acceso para el personal.', ruta: '/usuarios', permiso: 'usuarios' },
  { nombre: 'Gestión de Roles', icono: 'admin', descripcion: 'Definir perfiles de acceso y permisos operativos.', ruta: '/roles', permiso: 'roles' },
  { nombre: 'Bitácora de Auditoría', icono: 'reportes', descripcion: 'Registro inmutable de la actividad de los usuarios.', ruta: '/bitacora', permiso: 'usuarios' },
  { nombre: 'Copias de Seguridad', icono: 'config', descripcion: 'Descarga y resguardo seguro de la base de datos.', ruta: '/backup', permiso: 'usuarios' }
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly medicoService = inject(MedicoService);
  private readonly citaService = inject(CitaService);
  private readonly comprobanteService = inject(ComprobanteService);

  readonly modulos = computed(() =>
    MODULOS.filter((m) => !m.permiso || this.auth.tienePermiso(m.permiso))
  );

  readonly metricas = computed(() => {
    const hoy = toLocalDateStr();
    const medicosActivos = this.medicoService.medicos().filter((m) => m.estado === 'Activo').length;
    const citasHoy = this.citaService.citas().filter((c) => c.fecha === hoy && c.estado !== 'Cancelada').length;
    const ingresosHoy = this.comprobanteService.comprobantes()
      .filter((c) => c.fechaEmision.startsWith(hoy))
      .reduce((sum, c) => sum + c.monto, 0);

    return [
      { etiqueta: 'Médicos activos', valor: String(medicosActivos) },
      { etiqueta: 'Citas hoy', valor: String(citasHoy) },
      { etiqueta: 'Ingresos del día', valor: `Bs ${ingresosHoy.toLocaleString('es-BO')}` },
    ];
  });

  volverAlLogin(): void {
    this.router.navigateByUrl('/login');
  }

  navegarA(ruta: string): void {
    if (ruta) {
      this.router.navigate([ruta]);
    }
  }
}
