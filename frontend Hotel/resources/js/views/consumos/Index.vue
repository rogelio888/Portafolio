<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Consumos</h1>
      <router-link
        to="/consumos/crear"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        + Nuevo Consumo
      </router-link>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
          <input
            v-model="filtros.fecha_inicio"
            type="date"
            @change="cargarConsumos"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
          <input
            v-model="filtros.fecha_fin"
            type="date"
            @change="cargarConsumos"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <Table
        :columns="columns"
        :data="consumos"
        :loading="loading"
        :actions="true"
        @delete="eliminarConsumo"
      >
        <template #cell-reserva="{ item }">
          <div>
            <div class="font-medium text-gray-900">
              Hab. {{ item.reserva?.habitacion?.[0]?.numero || 'N/A' }}
            </div>
            <div class="text-sm text-gray-500">
              {{ item.reserva?.huesped?.nombre || 'Huésped desconocido' }}
            </div>
          </div>
        </template>

        <template #cell-servicio="{ item }">
          {{ item.servicio?.nombre || 'N/A' }}
        </template>

        <template #cell-subtotal="{ item }">
          {{ formatCurrency(item.subtotal) }}
        </template>


        <template #actions="{ item }">
          <div class="flex items-center justify-end space-x-2" v-if="item && puedeModificar(item)">
            <router-link
              :to="`/consumos/editar/${item.id}`"
              class="text-blue-500 hover:text-blue-600 p-1"
              title="Editar"
            >
              ✏️
            </router-link>
             <button 
              @click.stop="eliminarConsumo(item)" 
              class="text-red-500 hover:text-red-600 p-1" 
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
          <div v-else-if="item" class="text-sm text-gray-400 italic">
            Reserva {{ item.reserva?.estado }}
          </div>
        </template>
      </Table>
      
      <!-- Paginación -->
      <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between" v-if="pagination.total > 0">
        <div class="text-sm text-gray-500">
          Mostrando {{ pagination.from }} a {{ pagination.to }} de {{ pagination.total }} resultados
        </div>
        <div class="flex space-x-2">
          <button
            @click="cambiarPagina(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Anterior
          </button>
          <button
            @click="cambiarPagina(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../../axios';
import Table from '../../components/Table.vue';

const consumos = ref([]);
const loading = ref(false);
const pagination = ref({
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0
});
const filtros = ref({
  fecha_inicio: '',
  fecha_fin: ''
});

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'reserva', label: 'Reserva' },
  { key: 'servicio', label: 'Servicio' },
  { key: 'cantidad', label: 'Cantidad', sortable: true },
  { key: 'subtotal', label: 'Subtotal', sortable: true },
  { key: 'fecha', label: 'Fecha', sortable: true }
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(value);
};

const cargarConsumos = async (page = 1) => {
  loading.value = true;
  try {
    const params = { page };
    if (filtros.value.fecha_inicio) {
      params.fecha_inicio = filtros.value.fecha_inicio;
    }
    if (filtros.value.fecha_fin) {
      params.fecha_fin = filtros.value.fecha_fin;
    }

    const response = await axios.get('/consumos', { params });
    consumos.value = response.data.data.data;
    pagination.value = {
      current_page: response.data.data.current_page,
      last_page: response.data.data.last_page,
      from: response.data.data.from,
      to: response.data.data.to,
      total: response.data.data.total
    };
  } catch (error) {
    console.error('Error al cargar consumos:', error);
    alert('Error al cargar los consumos');
  } finally {
    loading.value = false;
  }
};

const cambiarPagina = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    cargarConsumos(page);
  }
};

const eliminarConsumo = async (consumo) => {
  if (!confirm(`¿Estás seguro de eliminar este consumo?`)) {
    return;
  }

  try {
    await axios.delete(`/consumos/${consumo.id}`);
    alert('Consumo eliminado exitosamente');
    cargarConsumos();
  } catch (error) {
    console.error('Error al eliminar consumo:', error);
    alert(error.response?.data?.message || 'Error al eliminar el consumo');
  }
};

const puedeModificar = (consumo) => {
  const estadosPermitidos = ['CONFIRMADA', 'EN_PROCESO'];
  return estadosPermitidos.includes(consumo.reserva?.estado);
};

onMounted(() => {
  cargarConsumos();
});
</script>
