import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import PadresView from '../views/PadresView.vue';
import LoginView from '../views/LoginView.vue';
import AdminLayout from '../views/AdminLayout.vue';
import AdminView from '../views/AdminView.vue';
import UsuariosView from '../views/UsuariosView.vue';
import BitacoraView from '../views/BitacoraView.vue';
import EstudiantesView from '../views/EstudiantesView.vue';
import PeriodosView from '../views/PeriodosView.vue';
import CajaView from '../views/CajaView.vue';
import MorososView from '../views/MorososView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'padres',
      component: PadresView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'admin',
          component: AdminView,
        },
        {
          path: 'usuarios',
          name: 'admin-usuarios',
          component: UsuariosView,
        },
        {
          path: 'estudiantes',
          name: 'admin-estudiantes',
          component: EstudiantesView,
        },
        {
          path: 'periodos',
          name: 'admin-periodos',
          component: PeriodosView,
        },
        {
          path: 'caja',
          name: 'admin-caja',
          component: CajaView,
        },
        {
          path: 'morosos',
          name: 'admin-morosos',
          component: MorososView,
        },
        {
          path: 'bitacora',
          name: 'admin-bitacora',
          component: BitacoraView,
        }
      ]
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login';
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    return '/admin';
  }
});

export default router;
