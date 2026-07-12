<template>
  <div class="p-6">
    <div class="flex items-center mb-6">
      <router-link to="/pagos" class="text-gray-600 hover:text-gray-800 mr-4">
        ← Volver
      </router-link>
      <h1 class="text-2xl font-bold text-gray-800">Registrar Pago</h1>
    </div>

    <div class="max-w-2xl bg-white rounded-lg shadow p-6">
      <form @submit.prevent="guardarPago">
        <!-- Selector de Reserva -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Reserva *
          </label>
          <select
            v-model="form.id_reserva"
            @change="cargarDetallesReserva"
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            <option value="">Seleccione una reserva</option>
            <option v-for="reserva in reservas" :key="reserva.id" :value="reserva.id">
              {{ reserva.huesped?.nombre }} - Hab. {{ reserva.habitacion?.numero }} ({{ reserva.estado }})
            </option>
          </select>
        </div>

        <!-- Detalles de la Reserva -->
        <div v-if="detallesReserva" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-semibold text-gray-900 mb-2">Detalles de la Reserva</h3>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-600">Huésped:</span>
              <span class="font-medium ml-2">{{ detallesReserva.huesped?.nombre }}</span>
            </div>
            <div>
              <span class="text-gray-600">Habitación:</span>
              <span class="font-medium ml-2">{{ detallesReserva.habitacion?.numero }}</span>
            </div>
            <div>
              <span class="text-gray-600">Total:</span>
              <span class="font-medium ml-2">{{ formatCurrency(detallesReserva.total) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Pagado:</span>
              <span class="font-medium ml-2">{{ formatCurrency(totalPagado) }}</span>
            </div>
            <div class="col-span-2">
              <span class="text-gray-600">Saldo Pendiente:</span>
              <span class="font-bold text-lg ml-2" :class="saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'">
                {{ formatCurrency(saldoPendiente) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tipo de Pago -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Pago *
          </label>
          <div class="grid grid-cols-3 gap-3">
            <label
              v-for="tipo in tiposPago"
              :key="tipo.value"
              class="flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all"
              :class="form.tipo_pago === tipo.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'"
            >
              <input
                type="radio"
                v-model="form.tipo_pago"
                :value="tipo.value"
                class="sr-only"
                required
              />
              <span class="text-sm font-medium">{{ tipo.label }}</span>
            </label>
          </div>
        </div>

        <!-- Monto -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Monto (Bs.) *
          </label>
          <input
            type="number"
            v-model.number="form.monto"
            step="0.01"
            min="0.01"
            :max="saldoPendiente"
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="0.00"
            required
          />
          <p v-if="form.monto > saldoPendiente" class="text-xs text-red-600 mt-1">
            El monto no puede exceder el saldo pendiente
          </p>
          <p v-if="form.monto > 0 && form.monto <= saldoPendiente" class="text-xs text-gray-500 mt-1">
            Saldo restante después del pago: {{ formatCurrency(saldoPendiente - form.monto) }}
          </p>
        </div>

        <!-- Fecha -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fecha *
          </label>
          <input
            type="date"
            v-model="form.fecha"
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>

        <!-- Botones -->
        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="!puedeGuardar"
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Registrar Pago
          </button>
          <router-link
            to="/pagos"
            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-center transition-colors"
          >
            Cancelar
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../../axios';

const router = useRouter();

const reservas = ref([]);
const detallesReserva = ref(null);
const totalPagado = ref(0);

const form = ref({
  id_reserva: '',
  tipo_pago: '',
  monto: 0,
  fecha: (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })()
});

const tiposPago = [
  { value: 'EFECTIVO', label: '💵 Efectivo' },
  { value: 'TARJETA', label: '💳 Tarjeta' },
  { value: 'TRANSFERENCIA', label: '🏦 Transferencia' }
];

const saldoPendiente = computed(() => {
  if (!detallesReserva.value) return 0;
  return parseFloat(detallesReserva.value.total || 0) - totalPagado.value;
});

const puedeGuardar = computed(() => {
  return form.value.id_reserva &&
         form.value.tipo_pago &&
         form.value.monto > 0 &&
         form.value.monto <= saldoPendiente.value &&
         form.value.fecha;
});

const cargarReservas = async () => {
  try {
    const response = await axios.get('/reservas', {
      params: { estado: 'CONFIRMADA,EN_PROCESO' }
    });
    
    // Filtrar solo reservas confirmadas o en proceso
    reservas.value = response.data.data.filter(r => 
      r.estado === 'CONFIRMADA' || r.estado === 'EN_PROCESO'
    );
  } catch (error) {
    console.error('Error al cargar reservas:', error);
    alert('Error al cargar las reservas');
  }
};

const cargarDetallesReserva = async () => {
  if (!form.value.id_reserva) {
    detallesReserva.value = null;
    return;
  }

  try {
    const response = await axios.get(`/api/reservas/${form.value.id_reserva}`);
    detallesReserva.value = response.data.data;

    // Cargar pagos de la reserva
    const pagosResponse = await axios.get(`/api/pagos/reserva/${form.value.id_reserva}`);
    totalPagado.value = parseFloat(pagosResponse.data.total_pagado || 0);
  } catch (error) {
    console.error('Error al cargar detalles de reserva:', error);
    alert('Error al cargar los detalles de la reserva');
  }
};

const guardarPago = async () => {
  if (!puedeGuardar.value) {
    alert('Por favor complete todos los campos correctamente');
    return;
  }

  try {
    await axios.post('/pagos', form.value);
    alert('Pago registrado exitosamente');
    router.push('/pagos');
  } catch (error) {
    console.error('Error al guardar pago:', error);
    alert(error.response?.data?.message || 'Error al registrar el pago');
  }
};

const formatCurrency = (value) => {
  return 'Bs. ' + parseFloat(value || 0).toFixed(2);
};

onMounted(() => {
  cargarReservas();
});
</script>
