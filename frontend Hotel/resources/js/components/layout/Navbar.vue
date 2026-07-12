<!-- resources/js/components/layout/Navbar.vue -->

<template>
  <nav class="bg-white shadow-sm h-16 flex items-center justify-between px-6">
    <!-- Botón toggle sidebar -->
    <button
      @click="$emit('toggleSidebar')"
      class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <span class="text-2xl">☰</span>
    </button>

    <!-- Info del usuario -->
    <div class="flex items-center space-x-4">
      <!-- Notificaciones -->
      <div class="relative" ref="notificationsRef">
        <button 
          @click="toggleNotifications"
          class="p-2 rounded-lg hover:bg-gray-100 relative transition-colors"
          :class="{ 'bg-gray-100': notificationsOpen }"
        >
          <span class="text-xl">🔔</span>
          <span 
            v-if="hasNotifications" 
            class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"
          ></span>
        </button>

        <!-- Dropdown Notificaciones -->
        <div
          v-show="notificationsOpen"
          class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
        >
          <div class="px-4 py-2 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800">Notificaciones</h3>
          </div>

          <div class="max-h-96 overflow-y-auto">
            <div v-if="notifications.length === 0" class="px-4 py-8 text-center text-gray-500">
              <p>No tienes notificaciones nuevas</p>
            </div>

            <div v-else>
              <div 
                v-for="(notif, index) in notifications" 
                :key="index"
                class="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer"
                @click="handleNotificationClick(notif)"
              >
                <div class="flex items-start space-x-3">
                  <span class="text-xl">{{ notif.icon }}</span>
                  <div>
                    <p class="text-sm font-medium text-gray-800">{{ notif.title }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ notif.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu usuario -->
      <div class="relative" ref="userMenuRef">
        <button
          @click="toggleUserMenu"
          class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {{ userInitials }}
          </div>
          <div class="text-left hidden md:block">
            <p class="text-sm font-medium text-gray-700">{{ user?.nombre }}</p>
            <p class="text-xs text-gray-500">{{ user?.rol?.nombre }}</p>
          </div>
          <span class="text-gray-400">▼</span>
        </button>

        <!-- Dropdown Usuario -->
        <div
          v-show="userMenuOpen"
          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
        >
          <router-link
            to="/perfil"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            @click="userMenuOpen = false"
          >
            👤 Mi Perfil
          </router-link>
          <button
            @click="handleLogout"
            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useReservasStore } from '../../stores/reservas';
import { useHabitacionesStore } from '../../stores/habitaciones';
import axios from '../../axios';

const emit = defineEmits(['toggleSidebar']);
const router = useRouter();

const authStore = useAuthStore();
const reservasStore = useReservasStore();
const habitacionesStore = useHabitacionesStore();

const userMenuOpen = ref(false);
const notificationsOpen = ref(false);
const userMenuRef = ref(null);
const notificationsRef = ref(null);
const solicitudesPendientes = ref(0);

const user = computed(() => authStore.currentUser);

const userInitials = computed(() => {
  if (!user.value) return 'U';
  const nombre = user.value.nombre?.charAt(0) || '';
  const apellido = user.value.apellido?.charAt(0) || '';
  return (nombre + apellido).toUpperCase();
});

// Notificaciones
const notifications = computed(() => {
  const list = [];

  // Solicitudes de Autorización (Solo Gerente/Admin)
  if (solicitudesPendientes.value > 0 && (authStore.isAdmin() || authStore.user?.rol?.nombre === 'Gerente')) {
    list.push({
      type: 'solicitud',
      icon: '🔐',
      title: 'Solicitudes Pendientes',
      description: `Hay ${solicitudesPendientes.value} solicitud(es) de autorización`,
      route: '/solicitudes'
    });
  }

  // Reservas Pendientes
  const pendientes = reservasStore.reservasPendientes.length;
  if (pendientes > 0) {
    list.push({
      type: 'reserva',
      icon: '📝',
      title: 'Reservas Pendientes',
      description: `Tienes ${pendientes} reserva(s) esperando confirmación`,
      route: '/reservas'
    });
  }

  // Habitaciones en Mantenimiento
  const mantenimiento = habitacionesStore.habitacionesMantenimiento.length;
  if (mantenimiento > 0) {
    list.push({
      type: 'mantenimiento',
      icon: '🛠️',
      title: 'Mantenimiento',
      description: `${mantenimiento} habitación(es) en mantenimiento`,
      route: '/habitaciones'
    });
  }

  return list;
});

const hasNotifications = computed(() => notifications.value.length > 0);

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
  notificationsOpen.value = false;
};

const toggleNotifications = () => {
  notificationsOpen.value = !notificationsOpen.value;
  userMenuOpen.value = false;
};

const handleNotificationClick = (notif) => {
  notificationsOpen.value = false;
  if (notif.route) {
    router.push(notif.route);
  }
};

const handleLogout = async () => {
  if (confirm('¿Estás seguro de cerrar sesión?')) {
    await authStore.logout();
  }
};

// Cerrar menus al hacer click fuera
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    userMenuOpen.value = false;
  }
  if (notificationsRef.value && !notificationsRef.value.contains(event.target)) {
    notificationsOpen.value = false;
  }
};

const fetchSolicitudesPendientes = async () => {
  if (authStore.isAdmin() || authStore.user?.rol?.nombre === 'Gerente') {
    try {
      const response = await axios.get('/solicitudes-autorizacion');
      // Filtramos solo las pendientes
      const pendientes = response.data.data.filter(s => s.estado === 'PENDIENTE');
      solicitudesPendientes.value = pendientes.length;
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    }
  }
};

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  
  // Cargar datos iniciales para notificaciones
  if (authStore.token) {
    try {
      await Promise.all([
        reservasStore.fetchReservas(),
        habitacionesStore.fetchHabitaciones(),
        fetchSolicitudesPendientes()
      ]);
      
      // Actualizar solicitudes cada 30 segundos
      setInterval(fetchSolicitudesPendientes, 30000);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>