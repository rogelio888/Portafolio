<!-- resources/js/views/Dashboard.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p class="text-gray-600 mt-1">Bienvenido, {{ user?.nombre }} {{ user?.apellido }}</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Habitaciones Disponibles"
        :value="stats.habitaciones?.disponibles || 0"
        icon="🏨"
        color="green"
      />
      <StatCard
        title="Habitaciones Ocupadas"
        :value="stats.habitaciones?.ocupadas || 0"
        icon="🔑"
        color="blue"
      />
      <StatCard
        title="Reservas Activas"
        :value="stats.reservas?.activas || 0"
        icon="📝"
        color="yellow"
      />
      <StatCard
        title="Ingresos del Mes"
        :value="formatCurrency(stats.ingresos?.mes || 0)"
        icon="💰"
        color="purple"
      />
    </div>

    <!-- Gráficos y tablas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Reservas próximas -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Reservas Próximas</h2>
        <div v-if="loading" class="text-center py-8">
          <p class="text-gray-500">Cargando...</p>
        </div>
        <div v-else-if="!stats.reservas?.activas" class="text-center py-8">
          <p class="text-gray-500">No hay reservas activas</p>
        </div>
        <div v-else>
          <p class="text-2xl font-bold text-blue-600">{{ stats.reservas.activas }}</p>
          <p class="text-sm text-gray-600">reservas confirmadas</p>
        </div>
      </div>

      <!-- Ocupación -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Tasa de Ocupación</h2>
        <div v-if="loading" class="text-center py-8">
          <p class="text-gray-500">Cargando...</p>
        </div>
        <div v-else>
          <p class="text-4xl font-bold text-green-600">{{ stats.habitaciones?.tasa_ocupacion || 0 }}%</p>
          <p class="text-sm text-gray-600 mt-2">del total de habitaciones</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import axios from '../axios';
import StatCard from '../components/StatCard.vue';

const authStore = useAuthStore();
const user = computed(() => authStore.currentUser);

const stats = ref({
  habitaciones: {},
  reservas: {},
  ingresos: {},
  operaciones: {}
});

const loading = ref(true);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(value);
};

const fetchDashboard = async () => {
  loading.value = true;
  try {
    const hotelId = user.value?.id_hotel || null;
    const params = hotelId ? `?id_hotel=${hotelId}` : '';
    
    const response = await axios.get(`/dashboard${params}`);
    if (response.data.success) {
      stats.value = response.data.data;
    }
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboard();
});
</script>