<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);
const isLoggingOut = ref(false);
const logoUrl = `${import.meta.env.BASE_URL}logo-colegio.svg`;

onMounted(async () => {
  if (authStore.userPermissions.length === 0 && authStore.isAuthenticated) {
    await authStore.fetchUser();
  }
});

watch(route, () => {
  isMobileMenuOpen.value = false;
});

const handleLogout = async () => {
  isLoggingOut.value = true;
  try {
    await authStore.logout();
    router.push('/login');
  } finally {
    isLoggingOut.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex print:block font-sans text-slate-800">
    
    <!-- Overlay Móvil -->
    <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"></div>

    <!-- Sidebar Administrativo Institucional -->
    <aside :class="[isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0']" class="fixed md:static inset-y-0 left-0 z-50 w-64 bg-secondary text-white flex flex-col border-r border-secondary-dark transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none print:hidden">
      
      <div class="p-6 bg-secondary-dark border-b border-slate-700/50">
        <div class="flex items-center gap-3">
          <img :src="logoUrl" alt="Logo Colegio" class="w-10 h-10 object-contain bg-white rounded-full p-1" />
          <div>
            <h2 class="font-serif font-bold text-md leading-tight">Colegio Central</h2>
            <p class="text-[10px] text-slate-300 uppercase tracking-wide">Panel Administrativo</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 py-4">
        <p class="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Módulos</p>
        <ul class="space-y-0.5">
          <li v-if="authStore.userRoles.includes('Directora') || authStore.userPermissions.includes('gestion_reportes')">
            <RouterLink to="/admin" :class="[route.path === '/admin' ? 'bg-primary border-l-4 border-white text-white' : 'text-slate-300 hover:bg-secondary-dark hover:text-white border-l-4 border-transparent', 'flex items-center gap-3 px-6 py-2.5 text-sm transition-colors font-medium']">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              Resumen Financiero
            </RouterLink>
          </li>
          
          <template v-if="authStore.userRoles.includes('Directora') || authStore.userPermissions.includes('gestion_usuarios') || authStore.userPermissions.includes('gestion_bitacora')">
            <p class="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2">Configuración</p>
            <li v-if="authStore.userRoles.includes('Directora') || authStore.userPermissions.includes('gestion_usuarios')">
              <RouterLink to="/admin/usuarios" :class="[route.path === '/admin/usuarios' ? 'bg-primary border-l-4 border-white text-white' : 'text-slate-300 hover:bg-secondary-dark hover:text-white border-l-4 border-transparent', 'flex items-center gap-3 px-6 py-2.5 text-sm transition-colors font-medium']">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Gestión de Usuarios
              </RouterLink>
            </li>
            <li v-if="authStore.userRoles.includes('Directora') || authStore.userPermissions.includes('gestion_bitacora')">
              <RouterLink to="/admin/bitacora" :class="[route.path === '/admin/bitacora' ? 'bg-primary border-l-4 border-white text-white' : 'text-slate-300 hover:bg-secondary-dark hover:text-white border-l-4 border-transparent', 'flex items-center gap-3 px-6 py-2.5 text-sm transition-colors font-medium']">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Registro Bitácora
              </RouterLink>
            </li>
          </template>

          <template v-if="authStore.userRoles.includes('Directora') || authStore.userPermissions.includes('gestion_estudiantes') || authStore.userPermissions.includes('gestion_periodos')">
            <p class="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2">Administración</p>
            <li v-if="authStore.userRoles.includes('Directora') || authStore.userPermissions.includes('gestion_estudiantes')">
              <RouterLink to="/admin/estudiantes" :class="[route.path === '/admin/estudiantes' ? 'bg-primary border-l-4 border-white text-white' : 'text-slate-300 hover:bg-secondary-dark hover:text-white border-l-4 border-transparent', 'flex items-center gap-3 px-6 py-2.5 text-sm transition-colors font-medium']">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                Estudiantes y Cursos
              </RouterLink>
            </li>
            <li v-if="authStore.userRoles.includes('Directora') || authStore.userPermissions.includes('gestion_periodos')">
              <RouterLink to="/admin/periodos" :class="[route.path === '/admin/periodos' ? 'bg-primary border-l-4 border-white text-white' : 'text-slate-300 hover:bg-secondary-dark hover:text-white border-l-4 border-transparent', 'flex items-center gap-3 px-6 py-2.5 text-sm transition-colors font-medium']">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Periodos Escolares
              </RouterLink>
            </li>
          </template>
          
          <template v-if="authStore.userRoles.includes('Directora') || authStore.userPermissions.includes('gestion_pagos') || authStore.userPermissions.includes('gestion_morosidad') || authStore.userPermissions.includes('gestion_reportes')">
            <p class="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2">Caja</p>
            <li v-if="authStore.userRoles.includes('Directora') || authStore.userPermissions.includes('gestion_pagos')">
              <RouterLink to="/admin/caja" :class="[route.path === '/admin/caja' ? 'bg-primary border-l-4 border-white text-white' : 'text-slate-300 hover:bg-secondary-dark hover:text-white border-l-4 border-transparent', 'flex items-center gap-3 px-6 py-2.5 text-sm transition-colors font-medium']">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Registro de Pagos
              </RouterLink>
            </li>
            <li v-if="authStore.userRoles.includes('Directora') || authStore.userPermissions.includes('gestion_morosidad')">
              <RouterLink to="/admin/morosos" :class="[route.path === '/admin/morosos' ? 'bg-primary border-l-4 border-white text-white' : 'text-slate-300 hover:bg-secondary-dark hover:text-white border-l-4 border-transparent', 'flex items-center gap-3 px-6 py-2.5 text-sm transition-colors font-medium']">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Control de Morosidad
              </RouterLink>
            </li>
          </template>
        </ul>
      </nav>

      <div class="p-6 border-t border-slate-700/50">
        <button @click="handleLogout" :disabled="isLoggingOut" class="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white bg-slate-800/50 hover:bg-rose-600 transition-colors py-3 px-4 rounded-sm border border-slate-700 hover:border-rose-500 disabled:opacity-50 disabled:cursor-not-allowed">
          <svg v-if="isLoggingOut" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          {{ isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión' }}
        </button>
      </div>
    </aside>

    <!-- Área Principal -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 print:h-auto print:overflow-visible print:bg-white">
      
      <!-- Header Superior Clásico -->
      <header class="h-16 px-4 md:px-8 flex items-center justify-between border-b border-slate-200 bg-white shadow-sm z-10 shrink-0 print:hidden">
        <div class="flex items-center gap-3">
          <button @click="isMobileMenuOpen = true" class="md:hidden text-slate-500 hover:text-secondary focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <h1 class="text-lg md:text-xl font-bold text-slate-800 capitalize">{{ route.name === 'admin' ? 'Resumen Financiero' : String(route.name).replace('admin-', '') }}</h1>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium text-slate-600">Gestión 2026</span>
          <div class="h-5 w-px bg-slate-300"></div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-sm bg-slate-200 flex items-center justify-center text-secondary font-bold text-xs uppercase">
              {{ authStore.user?.name?.substring(0, 2) || 'US' }}
            </div>
            <span class="text-sm font-medium text-slate-700">{{ authStore.user?.name || 'Usuario' }}</span>
          </div>
        </div>
      </header>

      <!-- Contenido de las Vistas Hijas -->
      <div class="flex-1 overflow-auto p-4 md:p-8 relative print:overflow-visible print:p-0">
        <RouterView />
      </div>
      
    </main>
  </div>
</template>
