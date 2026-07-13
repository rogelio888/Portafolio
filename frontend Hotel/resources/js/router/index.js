// resources/js/router/index.js

import { createRouter, createWebHashHistory } from 'vue-router';

// Layouts
import MainLayout from '../layouts/MainLayout.vue';
import AuthLayout from '../layouts/AuthLayout.vue';

const routes = [
  // Public routes
  {
    path: '/login',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('../views/auth/Login.vue'),
      },
    ],
  },

  // Protected routes
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      // Dashboard
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
      },

      // Hoteles
      { path: 'hoteles', name: 'HotelesIndex', component: () => import('../views/hoteles/Index.vue') },
      { path: 'hoteles/crear', name: 'HotelesCreate', component: () => import('../views/hoteles/Create.vue') },
      { path: 'hoteles/:id/editar', name: 'HotelesEdit', component: () => import('../views/hoteles/Edit.vue') },
      { path: 'hoteles/:id', name: 'HotelesShow', component: () => import('../views/hoteles/Show.vue') },

      // Pisos
      { path: 'pisos', name: 'PisosIndex', component: () => import('../views/pisos/Index.vue') },

      // Tipo de Habitaciones
      { path: 'tipo-habitaciones', name: 'TipoHabitacionesIndex', component: () => import('../views/tipo-habitaciones/Index.vue') },
      { path: 'tipo-habitaciones/crear', name: 'TipoHabitacionesCreate', component: () => import('../views/tipo-habitaciones/Create.vue') },
      { path: 'tipo-habitaciones/:id/editar', name: 'TipoHabitacionesEdit', component: () => import('../views/tipo-habitaciones/Edit.vue') },

      // Habitaciones
      { path: 'habitaciones', name: 'HabitacionesIndex', component: () => import('../views/habitaciones/Index.vue') },
      { path: 'habitaciones/crear', name: 'HabitacionesCreate', component: () => import('../views/habitaciones/Create.vue') },
      { path: 'habitaciones/:id/editar', name: 'HabitacionesEdit', component: () => import('../views/habitaciones/Edit.vue') },

      // Huéspedes
      { path: 'huespedes', name: 'HuespedesIndex', component: () => import('../views/huespedes/Index.vue') },
      { path: 'huespedes/crear', name: 'HuespedesCreate', component: () => import('../views/huespedes/Create.vue') },
      { path: 'huespedes/:id/editar', name: 'HuespedesEdit', component: () => import('../views/huespedes/Edit.vue') },

      // Reservas
      { path: 'reservas', name: 'ReservasIndex', component: () => import('../views/reservas/Index.vue') },
      { path: 'reservas/crear', name: 'ReservasCreate', component: () => import('../views/reservas/Create.vue') },
      { path: 'reservas/:id', name: 'ReservasShow', component: () => import('../views/reservas/Show.vue') },

      // Servicios
      { path: 'servicios', name: 'ServiciosIndex', component: () => import('../views/servicios/Index.vue') },

      // Consumos
      { path: 'consumos', name: 'ConsumosIndex', component: () => import('../views/consumos/Index.vue') },
      { path: 'consumos/crear', name: 'ConsumosCreate', component: () => import('../views/consumos/Create.vue') },
      { path: 'consumos/editar/:id', name: 'ConsumosEdit', component: () => import('../views/consumos/Edit.vue') },

      // Pagos
      { path: 'pagos', name: 'PagosIndex', component: () => import('../views/pagos/Index.vue') },
      { path: 'pagos/crear', name: 'PagosCreate', component: () => import('../views/pagos/Create.vue') },

      // Empleados
      { path: 'empleados', name: 'EmpleadosIndex', component: () => import('../views/empleados/Index.vue') },
      { path: 'empleados/crear', name: 'EmpleadosCreate', component: () => import('../views/empleados/Create.vue') },
      { path: 'empleados/:id/editar', name: 'EmpleadosEdit', component: () => import('../views/empleados/Edit.vue') },

      // Roles
      { path: 'roles', name: 'RolesIndex', component: () => import('../views/roles/Index.vue') },

      // Mantenimientos
      { path: 'mantenimientos', name: 'MantenimientosIndex', component: () => import('../views/mantenimientos/Index.vue') },
      { path: 'mantenimientos/crear', name: 'MantenimientosCreate', component: () => import('../views/mantenimientos/Create.vue') },
      { path: 'mantenimientos/:id/editar', name: 'MantenimientosEdit', component: () => import('../views/mantenimientos/Edit.vue') },

      // Reportes
      { path: 'reportes', name: 'ReportesIndex', component: () => import('../views/reportes/Index.vue') },

      // Auditoría
      { path: 'auditoria', name: 'AuditoriaIndex', component: () => import('../views/auditoria/Index.vue') },

      // Solicitudes de Autorización
      { path: 'solicitudes', name: 'SolicitudesIndex', component: () => import('../views/solicitudes/Index.vue') },

      // Perfil
      { path: 'perfil', name: 'Perfil', component: () => import('../views/profile/Profile.vue') },
    ],
  },

  // 404
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFound.vue') },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/');
  } else {
    next();
  }
});

export default router;