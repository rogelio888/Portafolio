<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <button @click="$router.back()" class="text-blue-600 hover:text-blue-800 mb-4">
        ← Volver
      </button>
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-800">Detalles del Hotel</h1>
        <router-link 
          v-if="hotel"
          :to="`/hoteles/${hotel.id}/editar`"
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Editar
        </router-link>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-lg shadow p-6 text-center">
      <p class="text-gray-500">Cargando...</p>
    </div>

    <!-- Detalles -->
    <div v-else-if="hotel" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Información General</h3>
      </div>
      <div class="px-6 py-4">
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <dt class="text-sm font-medium text-gray-500">Nombre</dt>
            <dd class="mt-1 text-lg text-gray-900">{{ hotel.nombre }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Estado</dt>
            <dd class="mt-1">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800': hotel.estado === 'ACTIVO',
                  'bg-red-100 text-red-800': hotel.estado === 'INACTIVO',
                  'bg-gray-100 text-gray-800': hotel.estado === 'CERRADO'
                }"
              >
                {{ hotel.estado }}
              </span>
            </dd>
          </div>
          <div class="md:col-span-2">
            <dt class="text-sm font-medium text-gray-500">Dirección</dt>
            <dd class="mt-1 text-gray-900">{{ hotel.direccion }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Ciudad</dt>
            <dd class="mt-1 text-gray-900">{{ hotel.ciudad }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Fecha de Registro</dt>
            <dd class="mt-1 text-gray-900">{{ formatDate(hotel.created_at) }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Error -->
    <div v-else class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      No se encontró el hotel.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHotelesStore } from '../../stores/hoteles';

const route = useRoute();
const hotelesStore = useHotelesStore();

const hotel = ref(null);
const loading = ref(true);

const fetchHotel = async () => {
  loading.value = true;
  try {
    hotel.value = await hotelesStore.fetchHotel(route.params.id);
  } catch (error) {
    console.error('Error al cargar hotel:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

onMounted(() => {
  fetchHotel();
});
</script>
