<!-- resources/js/views/reservas/Index.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Reservas</h1>
        <p class="text-gray-600 mt-1">Administra todas las reservas del sistema</p>
      </div>
      <Button
        v-if="authStore.hasPermission('crear_reservas')"
        @click="$router.push('/reservas/crear')"
      >
        ➕ Nueva Reserva
      </Button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
          <select
            v-model="filtros.id_hotel"
            @change="fetchReservas"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option v-for="hotel in hotelesStore.hoteles" :key="hotel.id" :value="hotel.id">
              {{ hotel.nombre }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            v-model="filtros.estado"
            @change="fetchReservas"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="COMPLETADA">Completada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Entrada</label>
          <input
            v-model="filtros.fecha_entrada"
            @change="fetchReservas"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex items-end">
          <Button variant="secondary" @click="limpiarFiltros" class="w-full">
            🔄 Limpiar
          </Button>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <Table
      :columns="columns"
      :data="reservasStore.reservas"
      :loading="reservasStore.loading"
    >
      <template #cell-huesped="{ item }">
        {{ item?.huesped?.nombre }} {{ item?.huesped?.apellido }}
      </template>

      <template #cell-hotel="{ item }">
        {{ item?.hotel?.nombre }}
      </template>

      <template #cell-fechas="{ item }">
        <div class="text-sm">
          <div>📅 {{ formatDate(item?.fecha_entrada) }}</div>
          <div>📅 {{ formatDate(item?.fecha_salida) }}</div>
        </div>
      </template>

      <template #cell-total="{ item }">
        {{ formatCurrency(item?.total) }}
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
            @click="verReserva(item.id)"
            class="text-blue-600 hover:text-blue-800"
            title="Ver detalles"
          >
            👁️
          </button>
          <button
            v-if="item?.estado === 'CONFIRMADA' && authStore.hasPermission('checkin')"
            @click="realizarCheckIn(item)"
            class="text-green-600 hover:text-green-800"
            title="Check-in"
          >
            ✅
          </button>
          <button
            v-if="item?.estado === 'EN_PROCESO' && authStore.hasPermission('checkout')"
            @click="realizarCheckOut(item)"
            class="text-purple-600 hover:text-purple-800"
            title="Check-out"
          >
            🚪
          </button>
          <button
            v-if="['PENDIENTE', 'CONFIRMADA'].includes(item?.estado) && authStore.hasPermission('cancelar_reservas')"
            @click="confirmarCancelar(item)"
            class="text-red-600 hover:text-red-800"
            title="Cancelar"
          >
            ❌
          </button>
        </div>
      </template>
    </Table>

    <!-- Modal Cancelar -->
    <Modal :show="modalCancelar" @close="modalCancelar = false" title="Cancelar Reserva">
      <p class="text-gray-700">
        ¿Estás seguro de cancelar la reserva de <strong>{{ reservaSeleccionada?.huesped?.nombre }}</strong>?
      </p>
      <p class="text-sm text-gray-500 mt-2">Las habitaciones quedarán disponibles nuevamente.</p>
      
      <template #footer>
        <Button variant="secondary" @click="modalCancelar = false">No</Button>
        <Button variant="danger" @click="cancelarReserva" :loading="cancelando">Sí, Cancelar</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useReservasStore } from '../../stores/reservas';
import { useHotelesStore } from '../../stores/hoteles';
import Table from '../../components/Table.vue';
import Button from '../../components/Button.vue';
import Modal from '../../components/Modal.vue';

const router = useRouter();
const authStore = useAuthStore();
const reservasStore = useReservasStore();
const hotelesStore = useHotelesStore();

const filtros = ref({
  id_hotel: '',
  estado: '',
  fecha_entrada: ''
});

const modalCancelar = ref(false);
const reservaSeleccionada = ref(null);
const cancelando = ref(false);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'huesped', label: 'Huésped' },
  { key: 'hotel', label: 'Hotel' },
  { key: 'fechas', label: 'Fechas' },
  { key: 'total', label: 'Total' },
  { key: 'estado', label: 'Estado' },
];

const fetchReservas = async () => {
  try {
    await reservasStore.fetchReservas(filtros.value);
  } catch (error) {
    console.error('Error al cargar reservas:', error);
  }
};

const limpiarFiltros = () => {
  filtros.value = {
    id_hotel: '',
    estado: '',
    fecha_entrada: ''
  };
  fetchReservas();
};

const verReserva = (id) => {
  router.push(`/reservas/${id}`);
};

const realizarCheckIn = async (reserva) => {
  if (confirm(`¿Realizar check-in para ${reserva.huesped.nombre}?`)) {
    try {
      await reservasStore.checkIn(reserva.id);
      await fetchReservas();
      alert('Check-in realizado exitosamente');
    } catch (error) {
      alert('Error al realizar check-in');
    }
  }
};

const realizarCheckOut = async (reserva) => {
  if (confirm(`¿Realizar check-out para ${reserva.huesped.nombre}?`)) {
    try {
      await reservasStore.checkOut(reserva.id);
      await fetchReservas();
      alert('Check-out realizado exitosamente');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al realizar check-out');
    }
  }
};

const confirmarCancelar = (reserva) => {
  reservaSeleccionada.value = reserva;
  modalCancelar.value = true;
};

const cancelarReserva = async () => {
  cancelando.value = true;
  try {
    await reservasStore.cancelarReserva(reservaSeleccionada.value.id);
    modalCancelar.value = false;
    await fetchReservas();
  } catch (error) {
    alert('Error al cancelar reserva');
  } finally {
    cancelando.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(value);
};

const estadoClasses = (estado) => {
  const classes = {
    'PENDIENTE': 'bg-yellow-100 text-yellow-800',
    'CONFIRMADA': 'bg-blue-100 text-blue-800',
    'EN_PROCESO': 'bg-green-100 text-green-800',
    'COMPLETADA': 'bg-gray-100 text-gray-800',
    'CANCELADA': 'bg-red-100 text-red-800',
  };
  return classes[estado] || 'bg-gray-100 text-gray-800';
};

onMounted(() => {
  hotelesStore.fetchHoteles();
  fetchReservas();
});
</script>