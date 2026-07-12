<!-- resources/js/views/empleados/Index.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Empleados</h1>
        <p class="text-gray-600 mt-1">Administra todos los empleados del sistema</p>
      </div>
      <Button
        v-if="authStore.hasPermission('crear_empleados')"
        @click="$router.push('/empleados/crear')"
      >
        ➕ Nuevo Empleado
      </Button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
          <select
            v-model="filtros.id_hotel"
            @change="fetchEmpleados"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option v-for="hotel in hotelesStore.hoteles" :key="hotel.id" :value="hotel.id">
              {{ hotel.nombre }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
          <select
            v-model="filtros.id_rol"
            @change="fetchEmpleados"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option v-for="rol in roles" :key="rol.id" :value="rol.id">
              {{ rol.nombre }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            v-model="filtros.estado"
            @change="fetchEmpleados"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <Table
      :columns="columns"
      :data="empleados"
      :loading="loading"
    >
      <template #cell-nombre="{ item }">
        {{ item.nombre }} {{ item.apellido }}
      </template>

      <template #cell-rol="{ item }">
        <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
          {{ item.rol?.nombre }}
        </span>
      </template>

      <template #cell-hotel="{ item }">
        {{ item.hotel?.nombre || 'Sin asignar' }}
      </template>

      <template #cell-estado="{ item }">
        <span :class="[
          'px-3 py-1 rounded-full text-xs font-semibold',
          item.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        ]">
          {{ item.estado }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center space-x-2">
          <button
            @click="verPermisos(item)"
            class="text-blue-600 hover:text-blue-800"
            title="Ver permisos"
          >
            🔑
          </button>
          <button
            v-if="authStore.hasPermission('editar_empleados')"
            @click="editarEmpleado(item.id)"
            class="text-yellow-600 hover:text-yellow-800"
            title="Editar"
          >
            ✏️
          </button>
          <button
            v-if="authStore.hasPermission('eliminar_empleados')"
            @click="confirmarEliminar(item)"
            class="text-red-600 hover:text-red-800"
            title="Inactivar"
          >
            🗑️
          </button>
        </div>
      </template>
    </Table>

    <!-- Modal Permisos -->
    <Modal :show="modalPermisos" @close="modalPermisos = false" title="Permisos del Empleado" size="lg">
      <div v-if="empleadoSeleccionado">
        <div class="mb-4 p-4 bg-gray-50 rounded-lg">
          <p class="font-medium">{{ empleadoSeleccionado.nombre }} {{ empleadoSeleccionado.apellido }}</p>
          <p class="text-sm text-gray-600">Rol: {{ empleadoSeleccionado.rol?.nombre }}</p>
        </div>

        <div class="max-h-96 overflow-y-auto">
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="permiso in empleadoSeleccionado.rol?.permisos"
              :key="permiso.id"
              class="flex items-center p-2 bg-green-50 rounded text-sm"
            >
              <span class="mr-2">✓</span>
              <span>{{ permiso.descripcion }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button @click="modalPermisos = false">Cerrar</Button>
      </template>
    </Modal>

    <!-- Modal Eliminar -->
    <Modal :show="modalEliminar" @close="modalEliminar = false" title="Confirmar inactivación">
      <p class="text-gray-700">
        ¿Estás seguro de inactivar al empleado <strong>{{ empleadoSeleccionado?.nombre }} {{ empleadoSeleccionado?.apellido }}</strong>?
      </p>
      
      <template #footer>
        <Button variant="secondary" @click="modalEliminar = false">Cancelar</Button>
        <Button variant="danger" @click="eliminarEmpleado" :loading="eliminando">Confirmar</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useHotelesStore } from '../../stores/hoteles';
import axios from '../../axios';
import Table from '../../components/Table.vue';
import Button from '../../components/Button.vue';
import Modal from '../../components/Modal.vue';

const router = useRouter();
const authStore = useAuthStore();
const hotelesStore = useHotelesStore();

const empleados = ref([]);
const roles = ref([]);
const loading = ref(false);
const modalPermisos = ref(false);
const modalEliminar = ref(false);
const empleadoSeleccionado = ref(null);
const eliminando = ref(false);

const filtros = ref({
  id_hotel: '',
  id_rol: '',
  estado: ''
});

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre Completo' },
  { key: 'usuario', label: 'Usuario' },
  { key: 'rol', label: 'Rol' },
  { key: 'hotel', label: 'Hotel' },
  { key: 'estado', label: 'Estado' },
];

const fetchEmpleados = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams(filtros.value);
    const response = await axios.get(`/empleados?${params}`);
    if (response.data.success) {
      empleados.value = response.data.data;
    }
  } catch (error) {
    console.error('Error al cargar empleados:', error);
  } finally {
    loading.value = false;
  }
};

const fetchRoles = async () => {
  try {
    const response = await axios.get('/roles');
    if (response.data.success) {
      roles.value = response.data.data;
    }
  } catch (error) {
    console.error('Error al cargar roles:', error);
  }
};

const verPermisos = async (empleado) => {
  try {
    const response = await axios.get(`/empleados/${empleado.id}`);
    if (response.data.success) {
      empleadoSeleccionado.value = response.data.data;
      modalPermisos.value = true;
    }
  } catch (error) {
    alert('Error al cargar permisos');
  }
};

const editarEmpleado = (id) => {
  router.push(`/empleados/${id}/editar`);
};

const confirmarEliminar = (empleado) => {
  empleadoSeleccionado.value = empleado;
  modalEliminar.value = true;
};

const eliminarEmpleado = async () => {
  eliminando.value = true;
  try {
    await axios.delete(`/empleados/${empleadoSeleccionado.value.id}`);
    modalEliminar.value = false;
    await fetchEmpleados();
  } catch (error) {
    alert('Error al inactivar empleado');
  } finally {
    eliminando.value = false;
  }
};

onMounted(() => {
  hotelesStore.fetchHoteles();
  fetchRoles();
  fetchEmpleados();
});
</script>