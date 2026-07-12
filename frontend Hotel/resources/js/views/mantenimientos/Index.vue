<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Mantenimientos</h1>
    <div class="flex space-x-4 mb-4">
      <select v-model="filtros.id_habitacion" class="border rounded p-2">
        <option value="">Todas las habitaciones</option>
        <option v-for="hab in habitaciones" :key="hab.id" :value="hab.id">
          {{ hab.numero }} - {{ hab.hotel?.nombre || '' }}
        </option>
      </select>
      <input type="date" v-model="filtros.fecha_inicio" class="border rounded p-2" placeholder="Fecha inicio" />
      <input type="date" v-model="filtros.fecha_fin" class="border rounded p-2" placeholder="Fecha fin" />
      <button @click="cargarMantenimientos" class="bg-blue-500 text-white px-4 py-2 rounded">Filtrar</button>
      <router-link :to="{ name: 'MantenimientosCreate' }" class="bg-green-500 text-white px-4 py-2 rounded">Nuevo Mantenimiento</router-link>
    </div>
    <Table
      :columns="columnas"
      :data="mantenimientos"
      :loading="loading"
    >
      <template #cell-reserva="{ item }">
        <div>
          <p class="font-medium text-gray-900">{{ item.habitacion?.numero || 'N/A' }}</p>
          <p class="text-sm text-gray-500">{{ item.habitacion?.hotel?.nombre || '' }}</p>
        </div>
      </template>

      <template #cell-estado="{ item }">
        <span
          class="px-2 py-1 text-xs font-semibold rounded-full"
          :class="{
            'bg-green-100 text-green-800': item.estado === 'ACTIVO',
            'bg-red-100 text-red-800': item.estado === 'COMPLETADO',
          }"
        >
          {{ item.estado }}
        </span>
      </template>

      <template #cell-acciones="{ item }">
        <div class="flex space-x-2 justify-end">
          <button @click="editarMantenimiento(item.id)" class="text-blue-500 hover:text-blue-600" title="Editar">
            ✏️
          </button>
          <button @click="eliminarMantenimiento(item.id)" class="text-red-500 hover:text-red-600" title="Eliminar">
            🗑️
          </button>
          <button v-if="item.estado !== 'COMPLETADO'" @click="completarMantenimiento(item.id)" class="text-green-500 hover:text-green-600" title="Completar">
            ✅
          </button>
        </div>
      </template>
    </Table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../../axios';
import Table from '../../components/Table.vue';

const router = useRouter();

const mantenimientos = ref([]);
const habitaciones = ref([]);
const loading = ref(false);

const filtros = ref({
  id_habitacion: '',
  fecha_inicio: '',
  fecha_fin: ''
});

const columnas = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'reserva', label: 'Habitación', sortable: false },
  { key: 'descripcion', label: 'Descripción', sortable: true },
  { key: 'fecha', label: 'Fecha', sortable: true },
  { key: 'costo', label: 'Costo', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true },
  { key: 'acciones', label: 'Acciones', sortable: false }
];

const cargarHabitaciones = async () => {
  try {
    const response = await axios.get('/habitaciones');
    habitaciones.value = response.data.data;
  } catch (e) {
    console.error('Error al cargar habitaciones', e);
    alert('No se pudieron cargar las habitaciones');
  }
};

const cargarMantenimientos = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filtros.value.id_habitacion) params.id_habitacion = filtros.value.id_habitacion;
    if (filtros.value.fecha_inicio) params.fecha_inicio = filtros.value.fecha_inicio;
    if (filtros.value.fecha_fin) params.fecha_fin = filtros.value.fecha_fin;
    const response = await axios.get('/mantenimientos', { params });
    mantenimientos.value = response.data.data;
  } catch (e) {
    console.error('Error al cargar mantenimientos', e);
    alert('Error al obtener los mantenimientos');
  } finally {
    loading.value = false;
  }
};

const editarMantenimiento = (id) => {
  router.push(`/mantenimientos/${id}/editar`);
};

const eliminarMantenimiento = async (id) => {
  if (!confirm('¿Eliminar este mantenimiento?')) return;
  try {
    await axios.delete(`/api/mantenimientos/${id}`);
    alert('Mantenimiento eliminado');
    cargarMantenimientos();
  } catch (e) {
    console.error('Error al eliminar', e);
    alert('No se pudo eliminar');
  }
};

const completarMantenimiento = async (id) => {
  if (!confirm('¿Marcar como completado?')) return;
  try {
    await axios.post(`/api/mantenimientos/${id}/completar`);
    alert('Mantenimiento completado');
    cargarMantenimientos();
  } catch (e) {
    console.error('Error al completar', e);
    alert('No se pudo completar');
  }
};

onMounted(() => {
  cargarHabitaciones();
  cargarMantenimientos();
});
</script>
