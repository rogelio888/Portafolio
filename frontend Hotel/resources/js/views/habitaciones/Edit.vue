<!-- resources/js/views/habitaciones/Edit.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <button @click="$router.back()" class="text-blue-600 hover:text-blue-800 mb-4">
        ← Volver
      </button>
      <h1 class="text-3xl font-bold text-gray-800">Editar Habitación</h1>
      <p class="text-gray-600 mt-1">Actualiza la información de la habitación</p>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="bg-white rounded-lg shadow p-6 text-center">
      <p class="text-gray-500">Cargando...</p>
    </div>

    <!-- Formulario -->
    <div v-else class="bg-white rounded-lg shadow p-6 max-w-3xl">
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Número -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Número de Habitación <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.numero"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Estado <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.estado"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="OCUPADA">Ocupada</option>
              <option value="RESERVADA">Reservada</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
              <option value="INACTIVA">Inactiva</option>
              <option value="DEMOLIDA">Demolida</option>
            </select>
          </div>

          <!-- Descripción -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              v-model="form.descripcion"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Botones -->
        <div class="mt-6 flex items-center justify-end space-x-3">
          <Button type="button" variant="secondary" @click="$router.back()">
            Cancelar
          </Button>
          <Button type="submit" :loading="loading">
            Actualizar Habitación
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useHabitacionesStore } from '../../stores/habitaciones';
import Button from '../../components/Button.vue';

const router = useRouter();
const route = useRoute();
const habitacionesStore = useHabitacionesStore();

const form = ref({
  numero: '',
  estado: 'DISPONIBLE',
  descripcion: ''
});

const loading = ref(false);
const cargando = ref(true);
const error = ref(null);

const fetchHabitacion = async () => {
  cargando.value = true;
  try {
    const habitacion = await habitacionesStore.fetchHabitacion(route.params.id);
    form.value = {
      numero: habitacion.numero,
      estado: habitacion.estado,
      descripcion: habitacion.descripcion || ''
    };
  } catch (err) {
    error.value = 'Error al cargar habitación';
  } finally {
    cargando.value = false;
  }
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    await habitacionesStore.updateHabitacion(route.params.id, form.value);
    router.push('/habitaciones');
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al actualizar habitación';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHabitacion();
});
</script>