<!-- resources/js/views/hoteles/Index.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Hoteles</h1>
        <p class="text-gray-600 mt-1">Administra todos los hoteles del sistema</p>
      </div>
      <Button
        v-if="authStore.hasPermission('crear_hoteles')"
        @click="$router.push('/hoteles/crear')"
      >
        ➕ Nuevo Hotel
      </Button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            v-model="filtros.estado"
            @change="fetchHoteles"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="CERRADO">Cerrado</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <Table
      :columns="columns"
      :data="hotelesStore.hoteles"
      :loading="hotelesStore.loading"
    >
      <template #cell-estado="{ item }">
        <span :class="[
          'px-3 py-1 rounded-full text-xs font-semibold',
          item?.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' :
          item?.estado === 'INACTIVO' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        ]">
          {{ item?.estado }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center space-x-2">
          <button
            @click="verHotel(item.id)"
            class="text-blue-600 hover:text-blue-800"
            title="Ver detalles"
          >
            👁️
          </button>
          <button
            v-if="authStore.hasPermission('editar_hoteles')"
            @click="editarHotel(item.id)"
            class="text-yellow-600 hover:text-yellow-800"
            title="Editar"
          >
            ✏️
          </button>
          <button
            v-if="authStore.hasPermission('eliminar_hoteles')"
            @click="confirmarEliminar(item)"
            class="text-red-600 hover:text-red-800"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </template>
    </Table>

    <!-- Modal confirmar eliminar -->
    <Modal :show="modalEliminar" @close="modalEliminar = false" title="Confirmar eliminación">
      <p class="text-gray-700">¿Estás seguro de cerrar el hotel <strong>{{ hotelSeleccionado?.nombre }}</strong>?</p>
      <p class="text-sm text-gray-500 mt-2">Esta acción cambiará el estado del hotel a "CERRADO".</p>
      
      <template #footer>
        <Button variant="secondary" @click="modalEliminar = false">Cancelar</Button>
        <Button variant="danger" @click="eliminarHotel" :loading="eliminando">Confirmar</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useHotelesStore } from '../../stores/hoteles';
import Table from '../../components/Table.vue';
import Button from '../../components/Button.vue';
import Modal from '../../components/Modal.vue';

const router = useRouter();
const authStore = useAuthStore();
const hotelesStore = useHotelesStore();

const filtros = ref({
  estado: ''
});

const modalEliminar = ref(false);
const hotelSeleccionado = ref(null);
const eliminando = ref(false);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'direccion', label: 'Dirección' },
  { key: 'ciudad', label: 'Ciudad' },
  { key: 'estado', label: 'Estado' },
];

const fetchHoteles = async () => {
  try {
    await hotelesStore.fetchHoteles(filtros.value);
  } catch (error) {
    console.error('Error al cargar hoteles:', error);
  }
};

const verHotel = (id) => {
  router.push(`/hoteles/${id}`);
};

const editarHotel = (id) => {
  router.push(`/hoteles/${id}/editar`);
};

const confirmarEliminar = (hotel) => {
  hotelSeleccionado.value = hotel;
  modalEliminar.value = true;
};

const eliminarHotel = async () => {
  eliminando.value = true;
  try {
    await hotelesStore.deleteHotel(hotelSeleccionado.value.id);
    modalEliminar.value = false;
    hotelSeleccionado.value = null;
  } catch (error) {
    alert('Error al eliminar hotel');
  } finally {
    eliminando.value = false;
  }
};

onMounted(() => {
  fetchHoteles();
});
</script>