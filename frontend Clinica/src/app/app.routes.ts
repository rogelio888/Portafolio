import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/usuarios/usuarios').then((m) => m.Usuarios),
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/roles').then((m) => m.Roles),
      },
      {
        path: 'bitacora',
        loadComponent: () => import('./features/bitacora/bitacora').then((m) => m.Bitacora),
      },
      {
        path: 'backup',
        loadComponent: () => import('./features/backup/backup').then((m) => m.Backup),
      },
      {
        path: 'especialidades',
        loadComponent: () => import('./features/especialidades/especialidades').then((m) => m.Especialidades),
      },
      {
        path: 'medicos',
        loadComponent: () => import('./features/medicos/medicos').then((m) => m.Medicos),
      },
      {
        path: 'horarios',
        loadComponent: () => import('./features/horarios/horarios').then((m) => m.Horarios),
      },
      {
        path: 'pacientes',
        loadComponent: () => import('./features/pacientes/pacientes').then((m) => m.Pacientes),
      },
      {
        path: 'citas',
        loadComponent: () => import('./features/citas/citas').then((m) => m.Citas),
      },
      {
        path: 'panel-medico',
        loadComponent: () => import('./features/panel-medico/panel-medico').then((m) => m.PanelMedico),
      },
      {
        path: 'calendario',
        loadComponent: () => import('./features/calendario/calendario').then((m) => m.Calendario),
      },
      {
        path: 'caja',
        loadComponent: () => import('./features/caja/caja').then((m) => m.Caja),
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/reportes/reportes').then((m) => m.Reportes),
      }
    ]
  },
  { path: '**', redirectTo: 'login' },
];
