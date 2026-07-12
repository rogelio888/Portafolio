import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

import { LoginLayout } from './layout/login-layout/login-layout';
import { MainLayout } from './layout/main-layout/main-layout';

import { Login } from './pages/auth/login/login';
import { Roles } from './pages/auth/roles/roles';
import { Usuarios } from './pages/auth/usuarios/usuarios';
import { Bitacora } from './pages/auth/bitacora/bitacora';

import { Proveedores } from './pages/compras/proveedores/proveedores';
import { IngresoCompra } from './pages/compras/ingreso-compra/ingreso-compra';

import { Catalogo } from './pages/inventario/catalogo/catalogo';
import { Kardex } from './pages/inventario/kardex/kardex';

import { Pos } from './pages/ventas/pos/pos';

import { Gastos } from './pages/finanzas/gastos/gastos';
import { Reportes } from './pages/finanzas/reportes/reportes';
import { Home } from './pages/dashboard/home/home';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginLayout,
    children: [
      { path: '', component: Login }
    ]
  },
  {
    path: 'app',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Home },
      { path: 'roles', component: Roles, data: { permission: 'ver_roles_usuarios' } },
      { path: 'usuarios', component: Usuarios, data: { permission: 'ver_roles_usuarios' } },
      { path: 'bitacora', component: Bitacora, data: { permission: 'ver_bitacora' } },
      { path: 'proveedores', component: Proveedores, data: { permission: 'gestionar_catalogo' } },
      { path: 'compras', component: IngresoCompra, data: { permission: 'gestionar_catalogo' } },
      { path: 'catalogo', component: Catalogo, data: { permission: 'gestionar_catalogo' } },
      { path: 'kardex', component: Kardex, data: { permission: 'ver_kardex' } },
      { path: 'pos', component: Pos, data: { permission: 'operar_pos' } },
      { path: 'gastos', component: Gastos, data: { permission: 'registrar_gastos' } },
      { path: 'reportes', component: Reportes, data: { permission: 'generar_reporte_siat' } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
