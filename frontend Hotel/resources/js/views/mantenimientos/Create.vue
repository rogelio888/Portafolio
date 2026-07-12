<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Nuevo Mantenimiento</h1>
    <form @submit.prevent="guardarMantenimiento" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Habitación *</label>
        <select v-model="form.id_habitacion" required class="w-full border border-gray-300 rounded p-2">
          <option value="">Seleccione una habitación</option>
          <option v-for="hab in habitaciones" :key="hab.id" :value="hab.id">
            {{ hab.numero }} - {{ hab.hotel?.nombre || '' }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
        <textarea v-model="form.descripcion" required class="w-full border border-gray-300 rounded p-2" rows="3"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
        <input type="date" v-model="form.fecha" required class="w-full border border-gray-300 rounded p-2" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Costo (opcional)</label>
        <input type="number" v-model.number="form.costo" min="0" step="0.01" class="w-full border border-gray-300 rounded p-2" />
      </div>

      <div class="flex space-x-4">
        <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" :disabled="!puedeGuardar">
          Guardar
        </button>
        <router-link to="/mantenimientos" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
          Cancelar
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../../axios';

const router = useRouter();

const habitaciones = ref([]);
const form = ref({
  id_habitacion: '',
  descripcion: '',
  fecha: new Date().toISOString().split('T')[0],
  costo: null
});

const puedeGuardar = computed(() => {
  return form.value.id_habitacion && form.value.descripcion && form.value.fecha;
});

const cargarHabitaciones = async () => {
  try {
    const response = await axios.get('/habitaciones');
    habitaciones.value = response.data.data;
  } catch (e) {
    console.error('Error al cargar habitaciones', e);
    alert('No se pudieron cargar las habitaciones');
  }
};

const guardarMantenimiento = async () => {
  if (!puedeGuardar.value) {
    alert('Complete los campos obligatorios');
    return;
  }
  try {
    await axios.post('/mantenimientos', form.value);
    alert('Mantenimiento creado exitosamente');
    router.push('/mantenimientos');
  } catch (e) {
    console.error('Error al guardar mantenimiento', e);
    alert(e.response?.data?.message || 'Error al crear el mantenimiento');
  }
};

onMounted(() => {
  cargarHabitaciones();
});
</script>
