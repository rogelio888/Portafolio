<!-- resources/js/views/habitaciones/Index.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Habitaciones</h1>
        <p class="text-gray-600 mt-1">Administra todas las habitaciones del sistema</p>
      </div>
      <Button
        v-if="authStore.hasPermission('crear_habitaciones')"
        @click="$router.push('/habitaciones/crear')"
      >
        ➕ Nueva Habitación
      </Button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
          <select
            v-model="filtros.id_hotel"
            @change="fetchHabitaciones"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option v-for="hotel in hotelesStore.hoteles" :key="hotel.id" :value="hotel.id">
              {{ hotel.nombre }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Piso</label>
          <select
            v-model="filtros.id_piso"
            @change="fetchHabitaciones"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option v-for="piso in pisosFiltrados" :key="piso.id" :value="piso.id">
              Piso {{ piso.numero }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            v-model="filtros.estado"
            @change="fetchHabitaciones"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="OCUPADA">Ocupada</option>
            <option value="RESERVADA">Reservada</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="INACTIVA">Inactiva</option>
          </select>
        </div>

        <div class="flex items-end">
          <Button variant="secondary" @click="limpiarFiltros" class="w-full">
            🔄 Limpiar
          </Button>
        </div>
      </div>
    </div>

    <!-- Stats rápidas -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <p class="text-3xl font-bold text-green-600">{{ stats.disponibles }}</p>
        <p class="text-sm text-gray-600 mt-1">Disponibles</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <p class="text-3xl font-bold text-blue-600">{{ stats.ocupadas }}</p>
        <p class="text-sm text-gray-600 mt-1">Ocupadas</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <p class="text-3xl font-bold text-yellow-600">{{ stats.reservadas }}</p>
        <p class="text-sm text-gray-600 mt-1">Reservadas</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <p class="text-3xl font-bold text-orange-600">{{ stats.mantenimiento }}</p>
        <p class="text-sm text-gray-600 mt-1">Mantenimiento</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <p class="text-3xl font-bold text-gray-600">{{ stats.total }}</p>
        <p class="text-sm text-gray-600 mt-1">Total</p>
      </div>
    </div>

    <!-- Tabla -->
    <Table
      :columns="columns"
      :data="habitacionesStore.habitaciones"
      :loading="habitacionesStore.loading"
    >
      <template #cell-hotel="{ item }">
        {{ item?.hotel?.nombre }}
      </template>

      <template #cell-piso="{ item }">
        Piso {{ item?.piso?.numero }}
      </template>

      <template #cell-tipo="{ item }">
        {{ item?.tipo?.nombre }}
      </template>

      <template #cell-precio="{ item }">
        {{ formatCurrency(item?.tipo?.precio_base) }}
      </template>

      <template #cell-estado="{ item }">
        <span :class="[
          'px-3 py-1 rounded-full text-xs font-semibold',
          estadoClasses(item?.estado)
        ]">
          {{ item?.estado }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center space-x-2" v-if="item">
          <button
            v-if="authStore.hasPermission('cambiar_estado_habitaciones')"
            @click="abrirCambiarEstado(item)"
            class="text-purple-600 hover:text-purple-800"
            title="Cambiar estado"
          >
            🔄
          </button>
          <button
            v-if="authStore.hasPermission('editar_habitaciones')"
            @click="editarHabitacion(item.id)"
            class="text-yellow-600 hover:text-yellow-800"
            title="Editar"
          >
            ✏️
          </button>
          <button
            v-if="authStore.hasPermission('eliminar_habitaciones')"
            @click="confirmarEliminar(item)"
            class="text-red-600 hover:text-red-800"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </template>
    </Table>

    <!-- Modal Cambiar Estado -->
    <Modal :show="modalEstado" @close="modalEstado = false" title="Cambiar Estado">
      <div>
        <p class="text-gray-700 mb-4">
          Habitación: <strong>{{ habitacionSeleccionada?.numero }}</strong>
        </p>
        <label class="block text-sm font-medium text-gray-700 mb-2">Nuevo Estado</label>
        <select
          v-model="nuevoEstado"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="DISPONIBLE">Disponible</option>
          <option value="OCUPADA">Ocupada</option>
          <option value="RESERVADA">Reservada</option>
          <option value="MANTENIMIENTO">Mantenimiento</option>
          <option value="INACTIVA">Inactiva</option>
        </select>
      </div>

      <template #footer>
        <Button variant="secondary" @click="modalEstado = false">Cancelar</Button>
        <Button @click="cambiarEstado" :loading="cambiandoEstado">Cambiar</Button>
      </template>
    </Modal>

    <!-- Modal Eliminar -->
    <Modal :show="modalEliminar" @close="modalEliminar = false" title="Confirmar eliminación">
      <p class="text-gray-700">
        ¿Estás seguro de marcar como DEMOLIDA la habitación <strong>{{ habitacionSeleccionada?.numero }}</strong>?
      </p>
      
      <template #footer>
        <Button variant="secondary" @click="modalEliminar = false">Cancelar</Button>
        <Button variant="danger" @click="eliminarHabitacion" :loading="eliminando">Confirmar</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useHabitacionesStore } from '../../stores/habitaciones';
import { useHotelesStore } from '../../stores/hoteles';
import axios from '../../axios';
import Table from '../../components/Table.vue';
import Button from '../../components/Button.vue';
import Modal from '../../components/Modal.vue';

const router = useRouter();
const authStore = useAuthStore();
const habitacionesStore = useHabitacionesStore();
const hotelesStore = useHotelesStore();

const filtros = ref({
  id_hotel: '',
  id_piso: '',
  estado: ''
});

const pisos = ref([]);
const modalEstado = ref(false);
const modalEliminar = ref(false);
const habitacionSeleccionada = ref(null);
const nuevoEstado = ref('');
const cambiandoEstado = ref(false);
const eliminando = ref(false);

const columns = [
  { key: 'numero', label: 'Número' },
  { key: 'hotel', label: 'Hotel' },
  { key: 'piso', label: 'Piso' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'precio', label: 'Precio/Noche' },
  { key: 'estado', label: 'Estado' },
];

const pisosFiltrados = computed(() => {
  if (!filtros.value.id_hotel) return pisos.value;
  return pisos.value.filter(p => p.id_hotel === filtros.value.id_hotel);
});

const stats = computed(() => {
  const habitaciones = habitacionesStore.habitaciones;
  return {
    total: habitaciones.length,
    disponibles: habitaciones.filter(h => h.estado === 'DISPONIBLE').length,
    ocupadas: habitaciones.filter(h => h.estado === 'OCUPADA').length,
    reservadas: habitaciones.filter(h => h.estado === 'RESERVADA').length,
    mantenimiento: habitaciones.filter(h => h.estado === 'MANTENIMIENTO').length,
  };
});

const fetchHabitaciones = async () => {
  try {
    await habitacionesStore.fetchHabitaciones(filtros.value);
  } catch (error) {
    console.error('Error al cargar habitaciones:', error);
  }
};

const fetchPisos = async () => {
  try {
    const response = await axios.get('/pisos');
    if (response.data.success) {
      pisos.value = response.data.data;
    }
  } catch (error) {
    console.error('Error al cargar pisos:', error);
  }
};

const limpiarFiltros = () => {
  filtros.value = {
    id_hotel: '',
    id_piso: '',
    estado: ''
  };
  fetchHabitaciones();
};

const editarHabitacion = (id) => {
  router.push(`/habitaciones/${id}/editar`);
};

const abrirCambiarEstado = (habitacion) => {
  habitacionSeleccionada.value = habitacion;
  nuevoEstado.value = habitacion.estado;
  modalEstado.value = true;
};

const cambiarEstado = async () => {
  cambiandoEstado.value = true;
  try {
    await habitacionesStore.cambiarEstado(habitacionSeleccionada.value.id, nuevoEstado.value);
    modalEstado.value = false;
    await fetchHabitaciones();
  } catch (error) {
    alert('Error al cambiar estado');
  } finally {
    cambiandoEstado.value = false;
  }
};

const confirmarEliminar = (habitacion) => {
  habitacionSeleccionada.value = habitacion;
  modalEliminar.value = true;
};

const eliminarHabitacion = async () => {
  eliminando.value = true;
  try {
    await habitacionesStore.deleteHabitacion(habitacionSeleccionada.value.id);
    modalEliminar.value = false;
    await fetchHabitaciones();
  } catch (error) {
    alert('Error al eliminar habitación');
  } finally {
    eliminando.value = false;
  }
};

const estadoClasses = (estado) => {
  const classes = {
    'DISPONIBLE': 'bg-green-100 text-green-800',
    'OCUPADA': 'bg-blue-100 text-blue-800',
    'RESERVADA': 'bg-yellow-100 text-yellow-800',
    'MANTENIMIENTO': 'bg-orange-100 text-orange-800',
    'INACTIVA': 'bg-gray-100 text-gray-800',
    'DEMOLIDA': 'bg-red-100 text-red-800',
  };
  return classes[estado] || 'bg-gray-100 text-gray-800';
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(value);
};

onMounted(() => {
  hotelesStore.fetchHoteles();
  fetchPisos();
  fetchHabitaciones();
});
</script>