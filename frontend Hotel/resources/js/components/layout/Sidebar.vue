<!-- resources/js/components/layout/Sidebar.vue -->

<template>
  <aside
    :class="[
      'fixed md:static inset-y-0 left-0 h-screen bg-slate-900/95 backdrop-blur-xl text-white transition-all duration-300 ease-in-out z-50 border-r border-white/5 shadow-2xl md:shadow-none',
      isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      isOpen ? 'w-64' : 'w-64 md:w-16'
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center justify-center h-16 bg-slate-900/50 border-b border-white/10">
      <h1 v-if="isOpen" class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Hotel System</h1>
      <span v-else class="text-2xl"><Icon name="building" class="w-6 h-6 inline-block text-gray-300" /></span>
    </div>

    <!-- Menu Items with Scroll -->
    <nav class="mt-6 overflow-y-auto h-[calc(100vh-4rem)] pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
      <div v-for="item in menuItems" :key="item.name">
        <!-- Si tiene hijos (submenu) -->
        <div v-if="item.children">
          <button
            @click="toggleSubmenu(item.name)"
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors"
          >
            <div class="flex items-center">
              <Icon :name="item.icon" class="w-5 h-5 text-gray-400" />
              <span v-if="isOpen" class="ml-3">{{ item.label }}</span>
            </div>
            <span v-if="isOpen" class="text-sm">
              {{ openSubmenus[item.name] ? '▼' : '▶' }}
            </span>
          </button>
          
          <!-- Submenu -->
          <div v-show="openSubmenus[item.name] && isOpen" class="bg-slate-900/50 pt-2 pb-1">
            <router-link
              v-for="child in item.children"
              :key="child.name"
              :to="child.route"
              class="flex items-center px-8 py-2 hover:bg-slate-800 transition-all rounded-sm mx-2 mb-1"
              active-class="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md font-bold text-white"
              @click="$emit('closeMobile')"
            >
              <span class="text-sm">{{ child.label }}</span>
            </router-link>
          </div>
        </div>

        <!-- Item simple (sin hijos) -->
        <router-link
          v-else
          :to="item.route"
          class="flex items-center px-4 py-3 hover:bg-slate-800 transition-all rounded-sm mx-2 mb-1"
          active-class="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md font-bold text-white"
          @click="$emit('closeMobile')"
        >
          <Icon :name="item.icon" class="w-5 h-5 text-gray-400" />
          <span v-if="isOpen" class="ml-3">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';

const props = defineProps({
  isOpen: Boolean,
  isMobileOpen: Boolean
});

const emit = defineEmits(['toggle', 'closeMobile']);

const authStore = useAuthStore();
const openSubmenus = ref({});

const toggleSubmenu = (name) => {
  openSubmenus.value[name] = !openSubmenus.value[name];
};

const menuItems = computed(() => {
  const items = [
    {
      name: 'dashboard',
      label: 'Dashboard',
      icon: 'bar-chart-2',
      route: '/',
    },
    {
      name: 'hoteles',
      label: 'Hoteles',
      icon: 'building',
      children: [
        { name: 'hoteles-list', label: 'Ver Hoteles', route: '/hoteles' },
        { name: 'pisos-list', label: 'Pisos', route: '/pisos' },
        { name: 'tipos-list', label: 'Tipos Habitación', route: '/tipo-habitaciones' },
        { name: 'habitaciones-list', label: 'Habitaciones', route: '/habitaciones' },
      ]
    },
    {
      name: 'reservas',
      label: 'Reservas',
      icon: 'clipboard',
      children: [
        { name: 'reservas-list', label: 'Ver Reservas', route: '/reservas' },
        { name: 'reservas-create', label: 'Nueva Reserva', route: '/reservas/crear' },
      ]
    },
    {
      name: 'huespedes',
      label: 'Huéspedes',
      icon: 'user',
      route: '/huespedes',
    },
    {
      name: 'servicios',
      label: 'Servicios',
      icon: 'receipt',
      route: '/servicios',
    },
    {
      name: 'consumos',
      label: 'Consumos',
      icon: 'shopping-cart',
      route: '/consumos',
    },
    {
      name: 'pagos',
      label: 'Pagos',
      icon: 'credit-card',
      route: '/pagos',
    },
  ];

  // Solo admin puede ver estas opciones
  if (authStore.isAdmin()) {
    items.push(
      {
        name: 'empleados',
        label: 'Empleados',
        icon: 'briefcase',
        route: '/empleados',
      },
      {
        name: 'roles',
        label: 'Roles',
        icon: 'shield',
        route: '/roles',
      },
      {
        name: 'mantenimientos',
        label: 'Mantenimientos',
        icon: 'wrench',
        route: '/mantenimientos',
      },
      {
        name: 'reportes',
        label: 'Reportes',
        icon: 'trending-up',
        route: '/reportes',
      },
      {
        name: 'auditoria',
        label: 'Auditoría',
        icon: 'history',
        route: '/auditoria',
      },
      {
        name: 'solicitudes',
        label: 'Solicitudes',
        icon: 'lock',
        route: '/solicitudes',
      }
    );
  }

  return items;
});
</script>

<style scoped>
/* Custom scrollbar styles */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thumb-gray-700::-webkit-scrollbar-thumb {
  background-color: #374151;
  border-radius: 3px;
}

.scrollbar-track-gray-900::-webkit-scrollbar-track {
  background-color: #111827;
}
</style>