<!-- resources/js/components/layout/Sidebar.vue -->

<template>
  <aside
    :class="[
      'fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-40',
      isOpen ? 'w-64' : 'w-16'
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center justify-center h-16 bg-gray-800 border-b border-gray-700">
      <h1 v-if="isOpen" class="text-xl font-bold">Hotel System</h1>
      <span v-else class="text-2xl">🏨</span>
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
              <span class="text-xl">{{ item.icon }}</span>
              <span v-if="isOpen" class="ml-3">{{ item.label }}</span>
            </div>
            <span v-if="isOpen" class="text-sm">
              {{ openSubmenus[item.name] ? '▼' : '▶' }}
            </span>
          </button>
          
          <!-- Submenu -->
          <div v-show="openSubmenus[item.name] && isOpen" class="bg-gray-800">
            <router-link
              v-for="child in item.children"
              :key="child.name"
              :to="child.route"
              class="flex items-center px-8 py-2 hover:bg-gray-700 transition-colors"
              active-class="bg-blue-600"
            >
              <span class="text-sm">{{ child.label }}</span>
            </router-link>
          </div>
        </div>

        <!-- Item simple (sin hijos) -->
        <router-link
          v-else
          :to="item.route"
          class="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors"
          active-class="bg-blue-600"
        >
          <span class="text-xl">{{ item.icon }}</span>
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
  isOpen: Boolean
});

const emit = defineEmits(['toggle']);

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
      icon: '📊',
      route: '/',
    },
    {
      name: 'hoteles',
      label: 'Hoteles',
      icon: '🏨',
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
      icon: '📝',
      children: [
        { name: 'reservas-list', label: 'Ver Reservas', route: '/reservas' },
        { name: 'reservas-create', label: 'Nueva Reserva', route: '/reservas/crear' },
      ]
    },
    {
      name: 'huespedes',
      label: 'Huéspedes',
      icon: '👤',
      route: '/huespedes',
    },
    {
      name: 'servicios',
      label: 'Servicios',
      icon: '🧾',
      route: '/servicios',
    },
    {
      name: 'consumos',
      label: 'Consumos',
      icon: '🛒',
      route: '/consumos',
    },
    {
      name: 'pagos',
      label: 'Pagos',
      icon: '💳',
      route: '/pagos',
    },
  ];

  // Solo admin puede ver estas opciones
  if (authStore.isAdmin()) {
    items.push(
      {
        name: 'empleados',
        label: 'Empleados',
        icon: '🧑‍💼',
        route: '/empleados',
      },
      {
        name: 'roles',
        label: 'Roles',
        icon: '🎭',
        route: '/roles',
      },
      {
        name: 'mantenimientos',
        label: 'Mantenimientos',
        icon: '🔧',
        route: '/mantenimientos',
      },
      {
        name: 'reportes',
        label: 'Reportes',
        icon: '📈',
        route: '/reportes',
      },
      {
        name: 'auditoria',
        label: 'Auditoría',
        icon: '📜',
        route: '/auditoria',
      },
      {
        name: 'solicitudes',
        label: 'Solicitudes',
        icon: '🔐',
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