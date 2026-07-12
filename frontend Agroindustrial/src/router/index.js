import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import UsuariosView from '../views/UsuariosView.vue'
import RolesView from '../views/RolesView.vue'
import BitacoraView from '../views/BitacoraView.vue'
import ClasificacionesView from '../views/ClasificacionesView.vue'
import FichasTecnicasView from '../views/FichasTecnicasView.vue'
import MaquinariasView from '../views/MaquinariasView.vue'
import MecanicosView from '../views/MecanicosView.vue'
import MantenimientoPreventivoView from '../views/MantenimientoPreventivoView.vue'
import OrdenesTrabajoView from '../views/OrdenesTrabajoView.vue'
import HistorialIntervencionesView from '../views/HistorialIntervencionesView.vue'
import ReporteGastoView from '../views/ReporteGastoView.vue'
import ReporteMantenimientoVencidoView from '../views/ReporteMantenimientoVencidoView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView
  },
  {
    path: '/usuarios',
    name: 'usuarios',
    component: UsuariosView,
    meta: { permission: 'usuarios' }
  },
  {
    path: '/roles',
    name: 'roles',
    component: RolesView,
    meta: { permission: 'roles' }
  },
  {
    path: '/bitacora',
    name: 'bitacora',
    component: BitacoraView,
    meta: { permission: 'bitacora' }
  },
  {
    path: '/clasificaciones',
    name: 'clasificaciones',
    component: ClasificacionesView,
    meta: { permission: 'clasificaciones' }
  },
  {
    path: '/fichas-tecnicas',
    name: 'fichas-tecnicas',
    component: FichasTecnicasView,
    meta: { permission: 'fichas' }
  },
  {
    path: '/maquinarias',
    name: 'maquinarias',
    component: MaquinariasView,
    meta: { permission: 'maquinaria' }
  },
  {
    path: '/mecanicos',
    name: 'mecanicos',
    component: MecanicosView,
    meta: { permission: 'mecanicos' }
  },
  {
    path: '/mantenimiento-preventivo',
    name: 'mantenimiento-preventivo',
    component: MantenimientoPreventivoView,
    meta: { permission: 'preventivos' }
  },
  {
    path: '/ordenes-trabajo',
    name: 'ordenes-trabajo',
    component: OrdenesTrabajoView,
    meta: { permission: 'ordenes' }
  },
  {
    path: '/historial-intervenciones',
    name: 'historial-intervenciones',
    component: HistorialIntervencionesView,
    meta: { permission: 'historial' }
  },
  {
    path: '/reporte-gasto',
    name: 'reporte-gasto',
    component: ReporteGastoView,
    meta: { permission: 'reporte_gasto' }
  },
  {
    path: '/reporte-mantenimiento-vencido',
    name: 'reporte-mantenimiento-vencido',
    component: ReporteMantenimientoVencidoView,
    meta: { permission: 'reporte_vencido' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation Guard (HU1 - Restringir módulos)
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  
  if (to.name !== 'login' && !token) {
    return { name: 'login' }
  }
  if (to.name === 'login' && token) {
    return { name: 'dashboard' }
  }

  // Protección de permisos granulares (HU3)
  if (to.name !== 'login' && token && to.meta && to.meta.permission) {
    try {
      const userJson = localStorage.getItem('user')
      if (userJson) {
        const user = JSON.parse(userJson)
        // El administrador del sistema siempre pasa
        if (user.role === 'Administrador') {
          return
        }
        // Verificar si cuenta con el permiso requerido
        if (!user.permissions || !user.permissions[to.meta.permission]) {
          return { name: 'dashboard' } // Redirigir al dashboard
        }
      }
    } catch (e) {
      console.error('Error verifying route permissions:', e)
    }
  }
})

export default router
