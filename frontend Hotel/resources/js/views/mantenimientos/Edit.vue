<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Editar Mantenimiento</h1>
    <form @submit.prevent="actualizarMantenimiento" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Habitación *</label>
        <select v-model="form.id_habitacion" required class="w-full border border-gray-300 rounded p-2" disabled>
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
          Guardar cambios
        </button>
        <router-link :to="`/mantenimientos`" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
          Cancelar
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from '../../axios';

const router = useRouter();
const route = useRoute();
const id = route.params.id;

const habitaciones = ref([]);
const form = ref({
  id_habitacion: '',
  descripcion: '',
  fecha: '',
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

const cargarMantenimiento = async () => {
  try {
    const response = await axios.get(`/api/mantenimientos/${id}`);
    const data = response.data.data;
    form.value.id_habitacion = data.id_habitacion;
    form.value.descripcion = data.descripcion;
    form.value.fecha = data.fecha;
    form.value.costo = data.costo;
  } catch (e) {
    console.error('Error al cargar mantenimiento', e);
    alert('No se pudo cargar el mantenimiento');
    router.push('/mantenimientos');
  }
};

const actualizarMantenimiento = async () => {
  if (!puedeGuardar.value) {
    alert('Complete los campos obligatorios');
    return;
  }
  try {
    await axios.put(`/api/mantenimientos/${id}`, form.value);
    alert('Mantenimiento actualizado');
    router.push('/mantenimientos');
  } catch (e) {
    console.error('Error al actualizar', e);
    alert(e.response?.data?.message || 'Error al actualizar');
  }
};

onMounted(() => {
  cargarHabitaciones();
  cargarMantenimiento();
});
</script>
