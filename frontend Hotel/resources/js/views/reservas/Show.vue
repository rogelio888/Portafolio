<!-- resources/js/views/reservas/Show.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <button @click="$router.back()" class="text-blue-600 hover:text-blue-800 mb-4">
        ← Volver
      </button>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Detalle de Reserva #{{ reserva?.id }}</h1>
          <p class="text-gray-600 mt-1">Información completa de la reserva</p>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Estado -->
          <span :class="[
            'px-4 py-2 rounded-full text-sm font-semibold',
            estadoClasses(reserva?.estado)
          ]">
            {{ reserva?.estado }}
          </span>

          <!-- Acciones -->
          <Button
            v-if="reserva?.estado === 'PENDIENTE'"
            @click="confirmarReserva"
            variant="success"
          >
            <Icon name="check" class="w-4 h-4 inline-block mr-1" /> Confirmar
          </Button>
          <Button
            v-if="reserva?.estado === 'CONFIRMADA'"
            @click="realizarCheckIn"
            variant="success"
          >
            <Icon name="check" class="w-4 h-4 inline-block mr-1" /> Check-in
          </Button>
          <Button
            v-if="reserva?.estado === 'EN_PROCESO'"
            @click="realizarCheckOut"
            variant="warning"
          >
            <Icon name="log-out" class="w-4 h-4 inline-block mr-1" /> Check-out
          </Button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
      <p class="text-gray-500">Cargando...</p>
    </div>

    <!-- Contenido -->
    <div v-else-if="reserva" class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <!-- Columna Principal -->
      <div class="lg:col-span-2 space-y-4 sm:space-y-6">
        <!-- Información General -->
        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4"><Icon name="clipboard-list" class="w-6 h-6 inline-block mr-2 text-gray-700" /> Información General</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600">Hotel</p>
              <p class="font-medium">{{ reserva.hotel?.nombre }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Huésped Principal</p>
              <p class="font-medium">{{ reserva.huesped?.nombre }} {{ reserva.huesped?.apellido }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">CI</p>
              <p class="font-medium">{{ reserva.huesped?.ci }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Teléfono</p>
              <p class="font-medium">{{ reserva.huesped?.telefono || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Email</p>
              <p class="font-medium">{{ reserva.huesped?.email || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Fecha de Reserva</p>
              <p class="font-medium">{{ formatDateTime(reserva.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Fechas y Estadía -->
        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4"><Icon name="calendar" class="w-6 h-6 inline-block mr-2 text-gray-700" /> Fechas de Estadía</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-1">Check-in</p>
              <p class="text-lg font-bold text-blue-600">{{ formatDate(reserva.fecha_entrada) }}</p>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-1">Check-out</p>
              <p class="text-lg font-bold text-purple-600">{{ formatDate(reserva.fecha_salida) }}</p>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-1">Noches</p>
              <p class="text-lg font-bold text-green-600">{{ reserva.noches }}</p>
            </div>
          </div>
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600">Adultos</p>
              <p class="font-medium">{{ reserva.adultos }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Niños</p>
              <p class="font-medium">{{ reserva.ninos }}</p>
            </div>
          </div>
        </div>

        <!-- Habitaciones -->
        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4"><Icon name="building" class="w-6 h-6 inline-block mr-2 text-gray-700" /> Habitaciones</h2>
          <div class="space-y-3">
            <div
              v-for="habitacion in reserva.habitaciones"
              :key="habitacion.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium">Habitación {{ habitacion.numero }}</p>
                <p class="text-sm text-gray-600">{{ habitacion.tipo?.nombre }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-blue-600">{{ formatCurrency(habitacion.pivot.total) }}</p>
                <p class="text-xs text-gray-500">{{ formatCurrency(habitacion.pivot.precio_por_noche) }}/noche × {{ habitacion.pivot.noches }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Huéspedes Adicionales -->
        <div v-if="reserva.huespedes_adicionales?.length > 0" class="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4"><Icon name="users" class="w-6 h-6 inline-block mr-2 text-gray-700" /> Huéspedes Adicionales</h2>
          <div class="space-y-2">
            <div
              v-for="huesped in reserva.huespedes_adicionales"
              :key="huesped.id"
              class="flex items-center p-3 bg-gray-50 rounded-lg"
            >
              <span class="mr-3"><Icon name="user" class="w-5 h-5 inline-block mr-2 text-gray-500" /></span>
              <div>
                <p class="font-medium">{{ huesped.nombre }} {{ huesped.apellido }}</p>
                <p class="text-sm text-gray-600">CI: {{ huesped.ci }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Consumos -->
        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-800"><Icon name="shopping-cart" class="w-6 h-6 inline-block mr-2 text-gray-700" /> Consumos</h2>
            <Button
              v-if="['CONFIRMADA', 'EN_PROCESO'].includes(reserva.estado)"
              @click="modalConsumo = true"
              size="sm"
            >
              + Agregar Consumo
            </Button>
          </div>

          <div v-if="reserva.consumos?.length === 0" class="text-center py-8 text-gray-400">
            <p>No hay consumos registrados</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="consumo in reserva.consumos"
              :key="consumo.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium">{{ consumo.servicio?.nombre }}</p>
                <p class="text-sm text-gray-600">
                  Cantidad: {{ consumo.cantidad }} | {{ formatDate(consumo.fecha) }}
                </p>
              </div>
              <p class="font-bold text-blue-600">{{ formatCurrency(consumo.subtotal) }}</p>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex justify-between items-center">
              <span class="font-medium">Total Consumos:</span>
              <span class="text-lg font-bold text-blue-600">{{ formatCurrency(reserva.total_consumos) }}</span>
            </div>
          </div>
        </div>

        <!-- Pagos -->
        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-800"><Icon name="credit-card" class="w-6 h-6 inline-block mr-2 text-gray-700" /> Pagos</h2>
            <Button
              v-if="reserva.saldo > 0"
              @click="modalPago = true"
              size="sm"
              variant="success"
            >
              + Registrar Pago
            </Button>
          </div>

          <div v-if="reserva.pagos?.length === 0" class="text-center py-8 text-gray-400">
            <p>No hay pagos registrados</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="pago in reserva.pagos"
              :key="pago.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium">{{ pago.tipo_pago }}</p>
                <p class="text-sm text-gray-600">{{ formatDateTime(pago.fecha) }}</p>
              </div>
              <p class="font-bold text-green-600">{{ formatCurrency(pago.monto) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Lateral - Resumen Financiero -->
      <div class="space-y-4 sm:space-y-6">
        <!-- Resumen de Costos -->
        <div class="bg-white rounded-lg shadow p-4 sm:p-6 sticky top-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4"><Icon name="circle-dollar-sign" class="w-6 h-6 inline-block mr-2 text-gray-700" /> Resumen Financiero</h2>
          
          <div class="space-y-3">
            <div class="flex justify-between pb-3 border-b">
              <span class="text-gray-600">Habitaciones</span>
              <span class="font-medium">{{ formatCurrency(reserva.total_habitaciones || 0) }}</span>
            </div>
            
            <div class="flex justify-between pb-3 border-b">
              <span class="text-gray-600">Consumos</span>
              <span class="font-medium">{{ formatCurrency(reserva.total_consumos || 0) }}</span>
            </div>
            
            <div class="flex justify-between pb-3 border-b">
              <span class="text-lg font-bold">Total</span>
              <span class="text-lg font-bold text-blue-600">{{ formatCurrency(reserva.total) }}</span>
            </div>
            
            <div class="flex justify-between pb-3 border-b">
              <span class="text-gray-600">Pagado</span>
              <span class="font-medium text-green-600">{{ formatCurrency(reserva.total_pagos || 0) }}</span>
            </div>
            
            <div class="flex justify-between pt-2">
              <span class="text-lg font-bold" :class="reserva.saldo > 0 ? 'text-red-600' : 'text-green-600'">
                {{ reserva.saldo > 0 ? 'Saldo Pendiente' : 'Pagado' }}
              </span>
              <span class="text-xl font-bold" :class="reserva.saldo > 0 ? 'text-red-600' : 'text-green-600'">
                {{ formatCurrency(Math.abs(reserva.saldo || 0)) }}
              </span>
            </div>
          </div>

          <!-- Estado de Pago -->
          <div class="mt-6 p-4 rounded-lg" :class="reserva.saldo > 0 ? 'bg-red-50' : 'bg-green-50'">
            <p class="text-center font-medium" :class="reserva.saldo > 0 ? 'text-red-700' : 'text-green-700'">
              {{ reserva.saldo > 0 ? '⚠️ Pago Pendiente' : '<Icon name="check" class="w-4 h-4 inline-block mr-1" /> Totalmente Pagado' }}
            </p>
          </div>
        </div>

        <!-- Acciones Rápidas -->
        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 class="font-bold text-gray-800 mb-3"><Icon name="zap" class="w-6 h-6 inline-block mr-2 text-gray-700" /> Acciones Rápidas</h3>
          <div class="space-y-2">
            <Button
              v-if="['CONFIRMADA', 'EN_PROCESO'].includes(reserva.estado)"
              @click="modalConsumo = true"
              variant="secondary"
              class="w-full"
            >
              <Icon name="shopping-cart" class="w-6 h-6 inline-block mr-2 text-gray-700" /> Agregar Consumo
            </Button>
            <Button
              v-if="reserva.saldo > 0"
              @click="modalPago = true"
              variant="success"
              class="w-full"
            >
              <Icon name="credit-card" class="w-6 h-6 inline-block mr-2 text-gray-700" /> Registrar Pago
            </Button>
            <Button
              v-if="['PENDIENTE', 'CONFIRMADA'].includes(reserva.estado)"
              @click="confirmarCancelar"
              variant="danger"
              class="w-full"
            >
              <Icon name="x" class="w-4 h-4 inline-block mr-1" /> Cancelar Reserva
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Agregar Consumo -->
    <Modal :show="modalConsumo" @close="cerrarModalConsumo" title="Agregar Consumo">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Servicio *</label>
          <select
            v-model="formConsumo.id_servicio"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona un servicio</option>
            <option v-for="servicio in servicios" :key="servicio.id" :value="servicio.id">
              {{ servicio.nombre }} - {{ formatCurrency(servicio.precio) }} ({{ servicio.frecuencia }})
            </option>
          </select>
        </div>

        <!-- Lógica para Servicios DIARIOS -->
        <div v-if="esServicioDiario" class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 class="font-medium text-blue-800 mb-3"><Icon name="calendar" class="w-6 h-6 inline-block mr-2 text-gray-700" /> Seleccionar días para el servicio diario</h3>
          
          <div class="flex justify-end mb-2 space-x-2">
            <button type="button" @click="seleccionarTodosDias" class="text-xs text-blue-600 hover:underline">Seleccionar Todos</button>
            <button type="button" @click="deseleccionarTodosDias" class="text-xs text-gray-600 hover:underline">Deseleccionar Todos</button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <label 
              v-for="fecha in fechasEstancia" 
              :key="fecha.value" 
              class="flex items-center space-x-2 p-2 bg-white rounded border cursor-pointer hover:bg-gray-50"
              :class="{'border-blue-500 ring-1 ring-blue-500': formConsumo.fechas.includes(fecha.value)}"
            >
              <input 
                type="checkbox" 
                :value="fecha.value" 
                v-model="formConsumo.fechas"
                class="rounded text-blue-600 focus:ring-blue-500"
              >
              <span class="text-sm">{{ fecha.label }}</span>
            </label>
          </div>
          <p class="text-sm text-gray-500 mt-2">
            Se registrará un consumo por cada día seleccionado.
          </p>
        </div>

        <!-- Lógica para Servicios NO DIARIOS (Cantidad y Fecha Única) -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad *</label>
            <input
              v-model.number="formConsumo.cantidad"
              type="number"
              min="1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
            <input
              v-model="formConsumo.fecha"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" @click="cerrarModalConsumo">Cancelar</Button>
        <Button 
          @click="agregarConsumo" 
          :loading="guardandoConsumo"
          :disabled="esServicioDiario && formConsumo.fechas.length === 0"
        >
          Guardar
        </Button>
      </template>
    </Modal>

    <!-- Modal Registrar Pago -->
    <Modal :show="modalPago" @close="modalPago = false" title="Registrar Pago">
      <div class="space-y-4">
        <div class="p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-gray-600">Saldo Pendiente</p>
          <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(reserva?.saldo || 0) }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Pago *</label>
          <select
            v-model="formPago.tipo_pago"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona tipo</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Monto *</label>
          <input
            v-model.number="formPago.monto"
            type="number"
            step="0.01"
            :max="reserva?.saldo || 0"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            @click="formPago.monto = reserva?.saldo || 0"
            class="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Pagar saldo completo
          </button>
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" @click="modalPago = false">Cancelar</Button>
        <Button @click="registrarPago" :loading="guardandoPago" variant="success">Registrar Pago</Button>
      </template>
    </Modal>

    <!-- Modal Cancelar Reserva -->
    <Modal :show="modalCancelar" @close="modalCancelar = false" title="Cancelar Reserva">
      <p class="text-gray-700">¿Estás seguro de cancelar esta reserva?</p>
      <p class="text-sm text-gray-500 mt-2">Las habitaciones quedarán disponibles nuevamente.</p>
      
      <template #footer>
        <Button variant="secondary" @click="modalCancelar = false">No</Button>
        <Button variant="danger" @click="cancelarReserva" :loading="cancelando">Sí, Cancelar</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { useToastStore } from '../../stores/toast';
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useReservasStore } from '../../stores/reservas';
import { useServiciosStore } from '../../stores/servicios';
import axios from '../../axios';
import Button from '../../components/Button.vue';
import Modal from '../../components/Modal.vue';

const toast = useToastStore();

const route = useRoute();
const router = useRouter();
const reservasStore = useReservasStore();
const serviciosStore = useServiciosStore();

const loading = ref(true);
const reserva = ref(null);
const servicios = ref([]);

// Modales
const modalConsumo = ref(false);
const modalPago = ref(false);
const modalCancelar = ref(false);

// Formularios
const formConsumo = ref({
  id_servicio: '',
  cantidad: 1,
  fecha: new Date().toISOString().split('T')[0],
  fechas: [] // Para servicios diarios
});

const formPago = ref({
  tipo_pago: '',
  monto: 0
});

const guardandoConsumo = ref(false);
const guardandoPago = ref(false);
const cancelando = ref(false);

// Computed
const servicioSeleccionado = computed(() => {
  return servicios.value.find(s => s.id === formConsumo.value.id_servicio);
});

const esServicioDiario = computed(() => {
  return servicioSeleccionado.value?.frecuencia === 'DIARIO';
});

const fechasEstancia = computed(() => {
  if (!reserva.value) return [];
  
  const fechas = [];
  let actual = new Date(reserva.value.fecha_entrada);
  actual.setMinutes(actual.getMinutes() + actual.getTimezoneOffset());
  
  const fin = new Date(reserva.value.fecha_salida);
  fin.setMinutes(fin.getMinutes() + fin.getTimezoneOffset());

  while (actual < fin) {
    fechas.push({
      value: actual.toISOString().split('T')[0],
      label: actual.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })
    });
    actual.setDate(actual.getDate() + 1);
  }
  return fechas;
});

// Watchers
watch(() => formConsumo.value.id_servicio, () => {
  formConsumo.value.fechas = [];
});

// Methods
const fetchReserva = async () => {
  loading.value = true;
  try {
    reserva.value = await reservasStore.fetchReserva(route.params.id);
  } catch (error) {
    toast.error('Error al cargar reserva');
    router.push('/reservas');
  } finally {
    loading.value = false;
  }
};

const fetchServicios = async () => {
  try {
    await serviciosStore.fetchServicios({ estado: 'ACTIVO' });
    servicios.value = serviciosStore.serviciosActivos;
  } catch (error) {
    console.error('Error al cargar servicios');
  }
};

const seleccionarTodosDias = () => {
  formConsumo.value.fechas = fechasEstancia.value.map(f => f.value);
};

const deseleccionarTodosDias = () => {
  formConsumo.value.fechas = [];
};

const cerrarModalConsumo = () => {
  modalConsumo.value = false;
  formConsumo.value = {
    id_servicio: '',
    cantidad: 1,
    fecha: new Date().toISOString().split('T')[0],
    fechas: []
  };
};

const confirmarReserva = async () => {
  try {
    await reservasStore.confirmarReserva(route.params.id);
    await fetchReserva();
    toast.success('Reserva confirmada exitosamente');
  } catch (error) {
    toast.error('Error al confirmar reserva');
  }
};

const realizarCheckIn = async () => {
  if (await toast.confirm('¿Realizar check-in ahora?')) {
    try {
      await reservasStore.checkIn(route.params.id);
      await fetchReserva();
      toast.success('Check-in realizado exitosamente');
    } catch (error) {
      toast.error('Error al realizar check-in');
    }
  }
};

const realizarCheckOut = async () => {
  if (reserva.value.saldo > 0) {
    toast.warning('No se puede hacer check-out. Hay saldo pendiente de pago.');
    return;
  }

  if (await toast.confirm('¿Realizar check-out ahora?')) {
    try {
      await reservasStore.checkOut(route.params.id);
      await fetchReserva();
      toast.success('Check-out realizado exitosamente');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al realizar check-out');
    }
  }
};

const agregarConsumo = async () => {
  if (!formConsumo.value.id_servicio) {
    toast.warning('Selecciona un servicio');
    return;
  }

  if (esServicioDiario.value && formConsumo.value.fechas.length === 0) {
    toast.warning('Selecciona al menos un día');
    return;
  }

  if (!esServicioDiario.value && !formConsumo.value.cantidad) {
    toast.success('Ingresa la cantidad');
    return;
  }

  guardandoConsumo.value = true;
  try {
    const payload = {
      id_reserva: route.params.id,
      id_servicio: formConsumo.value.id_servicio,
      cantidad: formConsumo.value.cantidad || 1, // Siempre enviar cantidad
    };

    if (esServicioDiario.value) {
      payload.fechas = formConsumo.value.fechas;
    } else {
      payload.fecha = formConsumo.value.fecha;
    }

    await axios.post('/consumos', payload);
    cerrarModalConsumo();
    await fetchReserva();
    toast.success('Consumo(s) registrado(s) exitosamente');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al agregar consumo');
  } finally {
    guardandoConsumo.value = false;
  }
};

const registrarPago = async () => {
  if (!formPago.value.tipo_pago || !formPago.value.monto) {
    toast.success('Completa todos los campos');
    return;
  }

  guardandoPago.value = true;
  try {
    await axios.post('/pagos', {
      id_reserva: route.params.id,
      ...formPago.value,
      fecha: new Date().toISOString()
    });
    modalPago.value = false;
    await fetchReserva();
    formPago.value = { tipo_pago: '', monto: 0 };
    toast.success('Pago registrado exitosamente');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al registrar pago');
  } finally {
    guardandoPago.value = false;
  }
};

const confirmarCancelar = () => {
  modalCancelar.value = true;
};

const cancelarReserva = async () => {
  cancelando.value = true;
  try {
    await reservasStore.cancelarReserva(route.params.id);
    modalCancelar.value = false;
    router.push('/reservas');
  } catch (error) {
    toast.error('Error al cancelar reserva');
  } finally {
    cancelando.value = false;
  }
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

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(value);
};

onMounted(() => {
  fetchReserva();
  fetchServicios();
});
</script>