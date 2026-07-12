<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Editar Consumo</h1>
      <router-link
        to="/consumos"
        class="text-gray-600 hover:text-gray-800"
      >
        &larr; Volver
      </router-link>
    </div>

    <div class="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Cargando información...</p>
      </div>

      <form v-else @submit.prevent="guardar" class="space-y-6">
        <!-- Información de solo lectura -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label class="block text-sm font-medium text-gray-500">Reserva</label>
            <div class="mt-1 text-gray-900 font-medium">
              Hab. {{ consumo.reserva?.habitacion?.numero || 'N/A' }}
            </div>
            <div class="text-sm text-gray-600">
              {{ consumo.reserva?.huesped?.nombre || 'Huésped desconocido' }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500">Servicio</label>
            <div class="mt-1 text-gray-900 font-medium">
              {{ consumo.servicio?.nombre || 'N/A' }}
            </div>
            <div class="text-sm text-gray-600">
              {{ formatCurrency(consumo.servicio?.precio || 0) }}
            </div>
          </div>
        </div>

        <!-- Campos editables -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <input
              v-model="form.fecha"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
            <input
              v-model.number="form.cantidad"
              type="number"
              min="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Resumen -->
        <div class="border-t pt-4 mt-4">
          <div class="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span class="text-blue-600">{{ formatCurrency(subtotalCalculado) }}</span>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <router-link
            to="/consumos"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </router-link>
          <button
            type="submit"
            :disabled="guardando"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '../../axios';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const guardando = ref(false);
const consumo = ref({});

const form = ref({
  fecha: '',
  cantidad: 1
});

const subtotalCalculado = computed(() => {
  const precio = consumo.value.servicio?.precio || 0;
  return precio * form.value.cantidad;
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(value);
};

const cargarConsumo = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/consumos/${route.params.id}`);
    consumo.value = response.data.data;
    
    // Inicializar formulario
    form.value.fecha = consumo.value.fecha.split('T')[0]; // Ajustar formato si es necesario
    form.value.cantidad = consumo.value.cantidad;
  } catch (error) {
    console.error('Error al cargar consumo:', error);
    alert('Error al cargar la información del consumo');
    router.push('/consumos');
  } finally {
    loading.value = false;
  }
};

const guardar = async () => {
  guardando.value = true;
  try {
    await axios.put(`/consumos/${route.params.id}`, form.value);
    alert('Consumo actualizado exitosamente');
    router.push('/consumos');
  } catch (error) {
    console.error('Error al actualizar:', error);
    alert(error.response?.data?.message || 'Error al actualizar el consumo');
  } finally {
    guardando.value = false;
  }
};

onMounted(() => {
  cargarConsumo();
});
</script>
