<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Tipos de Habitaciones</h1>
      <router-link
        v-if="authStore.hasPermission('crear_tipos_habitaciones')"
        to="/tipo-habitaciones/crear"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        + Nuevo Tipo
      </router-link>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            v-model="filtros.estado"
            @change="cargarTipos"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <Table
        :columns="columns"
        :data="tipos"
        :loading="loading"
        :actions="true"
        @edit="editarTipo"
        @delete="eliminarTipo"
      >
        <template #actions="{ item }">
          <div class="flex items-center justify-end space-x-2" v-if="item">
            <button 
              v-if="authStore.hasPermission('editar_tipos_habitaciones')"
              @click.stop="editarTipo(item)" 
              class="text-yellow-500 hover:text-yellow-600 p-1" 
              title="Editar"
            >
              ✏️
            </button>
            <button 
              v-if="authStore.hasPermission('eliminar_tipos_habitaciones')"
              @click.stop="eliminarTipo(item)" 
              class="text-red-500 hover:text-red-600 p-1" 
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        </template>
      </Table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import axios from '../../axios';
import Table from '../../components/Table.vue';

const router = useRouter();
const authStore = useAuthStore();
const tipos = ref([]);
const loading = ref(false);
const filtros = ref({
  estado: ''
});

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'capacidad', label: 'Capacidad', sortable: true },
  { key: 'precio_base', label: 'Precio Base', sortable: true, format: (val) => `Bs. ${parseFloat(val).toFixed(2)}` },
  { key: 'estado', label: 'Estado', badge: true },
];

const cargarTipos = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filtros.value.estado) {
      params.estado = filtros.value.estado;
    }

    const response = await axios.get('/tipo-habitaciones', { params });
    tipos.value = response.data.data;
  } catch (error) {
    console.error('Error al cargar tipos:', error);
    alert('Error al cargar los tipos de habitaciones');
  } finally {
    loading.value = false;
  }
};

const editarTipo = (tipo) => {
  router.push(`/tipo-habitaciones/${tipo.id}/editar`);
};

const eliminarTipo = async (tipo) => {
  if (!confirm(`¿Estás seguro de eliminar el tipo "${tipo.nombre}"?`)) {
    return;
  }

  try {
    await axios.delete(`/tipo-habitaciones/${tipo.id}`);
    alert('Tipo eliminado exitosamente');
    cargarTipos();
  } catch (error) {
    console.error('Error al eliminar tipo:', error);
    alert(error.response?.data?.message || 'Error al eliminar el tipo');
  }
};

onMounted(() => {
  cargarTipos();
});
</script>
