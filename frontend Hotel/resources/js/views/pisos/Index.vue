<!-- resources/js/views/pisos/Index.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Pisos</h1>
        <p class="text-gray-600 mt-1">Administra los pisos del hotel</p>
      </div>
      <Button
        v-if="authStore.hasPermission('crear_pisos')"
        @click="abrirModalCrear"
      >
        ➕ Nuevo Piso
      </Button>
    </div>

    <!-- Tabla -->
    <Table
      :columns="columns"
      :data="pisosStore.pisos"
      :loading="pisosStore.loading"
    >
      <template #cell-numero="{ item }">
        Piso {{ item.numero }}
      </template>

      <template #cell-hotel="{ item }">
        {{ item.hotel?.nombre }}
      </template>

      <template #cell-estado="{ item }">
        <span :class="[
          'px-2 py-1 rounded-full text-xs font-semibold',
          item.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        ]">
          {{ item.estado }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center space-x-2">
          <button
            v-if="authStore.hasPermission('editar_pisos')"
            @click="abrirModalEditar(item)"
            class="text-yellow-600 hover:text-yellow-800"
            title="Editar"
          >
            ✏️
          </button>
          <button
            v-if="authStore.hasPermission('eliminar_pisos')"
            @click="confirmarEliminar(item)"
            class="text-red-600 hover:text-red-800"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </template>
    </Table>

    <!-- Modal Crear/Editar -->
    <Modal :show="modalForm" @close="cerrarModalForm" :title="modoEdicion ? 'Editar Piso' : 'Nuevo Piso'">
      <form @submit.prevent="guardarPiso">
        <div class="space-y-4">
          <!-- Hotel Selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hotel</label>
            <select
              v-model="form.id_hotel"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled>Seleccione un hotel</option>
              <option v-for="hotel in hotelesStore.hotelesActivos" :key="hotel.id" :value="hotel.id">
                {{ hotel.nombre }}
              </option>
            </select>
          </div>

          <!-- Número de Piso -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Número de Piso</label>
            <input 
              v-model="form.numero" 
              type="number" 
              min="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ej. 1"
            >
          </div>

          <!-- Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              v-model="form.estado"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3">
          <Button type="button" variant="secondary" @click="cerrarModalForm">Cancelar</Button>
          <Button type="submit" :loading="guardando">Guardar</Button>
        </div>
      </form>
    </Modal>

    <!-- Modal confirmar eliminar -->
    <Modal :show="modalEliminar" @close="modalEliminar = false" title="Confirmar eliminación">
      <p class="text-gray-700">¿Estás seguro de eliminar el piso <strong>{{ pisoSeleccionado?.numero }}</strong> del hotel <strong>{{ pisoSeleccionado?.hotel?.nombre }}</strong>?</p>
      
      <template #footer>
        <Button variant="secondary" @click="modalEliminar = false">Cancelar</Button>
        <Button variant="danger" @click="eliminarPiso" :loading="eliminando">Eliminar</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { usePisosStore } from '../../stores/pisos';
import { useHotelesStore } from '../../stores/hoteles';
import Table from '../../components/Table.vue';
import Button from '../../components/Button.vue';
import Modal from '../../components/Modal.vue';

const authStore = useAuthStore();
const pisosStore = usePisosStore();
const hotelesStore = useHotelesStore();

const modalForm = ref(false);
const modalEliminar = ref(false);
const modoEdicion = ref(false);
const pisoSeleccionado = ref(null);
const guardando = ref(false);
const eliminando = ref(false);

const form = ref({
  id: null,
  id_hotel: '',
  numero: '',
  estado: 'ACTIVO'
});

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'numero', label: 'Piso' },
  { key: 'hotel', label: 'Hotel' },
  { key: 'estado', label: 'Estado' },
];

const fetchPisos = async () => {
  try {
    await pisosStore.fetchPisos();
  } catch (error) {
    console.error('Error al cargar pisos:', error);
  }
};

const abrirModalCrear = () => {
  modoEdicion.value = false;
  form.value = { id: null, id_hotel: '', numero: '', estado: 'ACTIVO' };
  modalForm.value = true;
};

const abrirModalEditar = (item) => {
  modoEdicion.value = true;
  form.value = { 
    id: item.id,
    id_hotel: item.id_hotel,
    numero: item.numero,
    estado: item.estado
  };
  modalForm.value = true;
};

const cerrarModalForm = () => {
  modalForm.value = false;
  form.value = { id: null, id_hotel: '', numero: '', estado: 'ACTIVO' };
};

const guardarPiso = async () => {
  guardando.value = true;
  try {
    if (modoEdicion.value) {
      await pisosStore.updatePiso(form.value.id, form.value);
    } else {
      await pisosStore.createPiso(form.value);
    }
    modalForm.value = false;
    fetchPisos();
  } catch (error) {
    alert(error.response?.data?.message || 'Error al guardar piso');
  } finally {
    guardando.value = false;
  }
};

const confirmarEliminar = (item) => {
  pisoSeleccionado.value = item;
  modalEliminar.value = true;
};

const eliminarPiso = async () => {
  eliminando.value = true;
  try {
    await pisosStore.deletePiso(pisoSeleccionado.value.id);
    modalEliminar.value = false;
    pisoSeleccionado.value = null;
  } catch (error) {
    alert('Error al eliminar piso');
  } finally {
    eliminando.value = false;
  }
};

onMounted(() => {
  fetchPisos();
  hotelesStore.fetchHoteles();
});
</script>
