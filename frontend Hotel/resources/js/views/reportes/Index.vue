<!-- resources/js/views/reportes/Index.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Reportes</h1>
      <p class="text-gray-600 mt-1">Consulta estadísticas e informes del sistema</p>
    </div>

    <!-- Filtros Globales -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h3 class="font-bold text-lg mb-4">Filtros</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
          <select
            v-model="filtros.id_hotel"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los hoteles</option>
            <option v-for="hotel in hotelesStore.hoteles" :key="hotel.id" :value="hotel.id">
              {{ hotel.nombre }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
          <input
            v-model="filtros.fecha_inicio"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
          <input
            v-model="filtros.fecha_fin"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex items-end">
          <Button @click="aplicarFiltros" class="w-full">
            📊 Generar Reportes
          </Button>
        </div>
      </div>
    </div>

    <!-- Tabs de Reportes -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-6" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="tabActivo = tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              tabActivo === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.icon }} {{ tab.nombre }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Contenido de Reportes -->
    <div>
      <!-- Reporte de Reservas -->
      <div v-show="tabActivo === 'reservas'">
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">📝 Reporte de Reservas</h3>
          
          <div v-if="loadingReservas" class="text-center py-8">
            <p class="text-gray-500">Cargando...</p>
          </div>

          <div v-else>
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-blue-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Total Reservas</p>
                <p class="text-3xl font-bold text-blue-600">{{ reporteReservas?.totales?.total_reservas || 0 }}</p>
              </div>
              <div class="bg-green-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Adultos</p>
                <p class="text-3xl font-bold text-green-600">{{ reporteReservas?.totales?.adultos || 0 }}</p>
              </div>
              <div class="bg-yellow-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Niños</p>
                <p class="text-3xl font-bold text-yellow-600">{{ reporteReservas?.totales?.ninos || 0 }}</p>
              </div>
              <div class="bg-purple-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Ingresos</p>
                <p class="text-2xl font-bold text-purple-600">{{ formatCurrency(reporteReservas?.totales?.total_ingresos || 0) }}</p>
              </div>
            </div>

            <!-- Tabla de Reservas -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Huésped</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrada</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salida</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="reserva in reporteReservas?.data" :key="reserva.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm">{{ reserva.id }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">{{ reserva.huesped?.nombre }} {{ reserva.huesped?.apellido }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">{{ reserva.hotel?.nombre }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatDate(reserva.fecha_entrada) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatDate(reserva.fecha_salida) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <span :class="['px-2 py-1 rounded-full text-xs', estadoClasses(reserva.estado)]">
                        {{ reserva.estado }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      {{ formatCurrency(reserva.total) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Reporte de Ingresos -->
      <div v-show="tabActivo === 'ingresos'">
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">💰 Reporte de Ingresos</h3>
          
          <div v-if="loadingIngresos" class="text-center py-8">
            <p class="text-gray-500">Cargando...</p>
          </div>

          <div v-else>
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-green-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Total Pagos</p>
                <p class="text-3xl font-bold text-green-600">{{ reporteIngresos?.totales?.total_pagos || 0 }}</p>
              </div>
              <div class="bg-blue-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Efectivo</p>
                <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(reporteIngresos?.totales?.total_efectivo || 0) }}</p>
              </div>
              <div class="bg-purple-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Tarjeta</p>
                <p class="text-2xl font-bold text-purple-600">{{ formatCurrency(reporteIngresos?.totales?.total_tarjeta || 0) }}</p>
              </div>
              <div class="bg-indigo-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Transferencia</p>
                <p class="text-2xl font-bold text-indigo-600">{{ formatCurrency(reporteIngresos?.totales?.total_transferencia || 0) }}</p>
              </div>
            </div>

            <!-- Total General -->
            <div class="p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white mb-6">
              <p class="text-sm opacity-90 mb-1">Total General de Ingresos</p>
              <p class="text-4xl font-bold">{{ formatCurrency(reporteIngresos?.totales?.total_general || 0) }}</p>
            </div>

            <!-- Tabla de Pagos -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Pago</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserva</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="pago in reporteIngresos?.data" :key="pago.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm">{{ pago.id }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">Reserva #{{ pago.reserva?.id }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">{{ pago.reserva?.hotel?.nombre }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {{ pago.tipo_pago }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatDateTime(pago.fecha) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      {{ formatCurrency(pago.monto) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Reporte de Ocupación -->
      <div v-show="tabActivo === 'ocupacion'">
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">🏨 Reporte de Ocupación</h3>
          
          <div v-if="loadingOcupacion" class="text-center py-8">
            <p class="text-gray-500">Cargando...</p>
          </div>

          <div v-else>
            <!-- Stats Grid -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <p class="text-sm text-gray-600 mb-2">Total Habitaciones</p>
                <p class="text-3xl font-bold text-gray-800">{{ reporteOcupacion?.total_habitaciones || 0 }}</p>
              </div>
              <div class="bg-green-50 rounded-lg p-4 text-center">
                <p class="text-sm text-gray-600 mb-2">Disponibles</p>
                <p class="text-3xl font-bold text-green-600">{{ reporteOcupacion?.disponibles || 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ reporteOcupacion?.porcentajes?.disponibles || 0 }}%</p>
              </div>
              <div class="bg-blue-50 rounded-lg p-4 text-center">
                <p class="text-sm text-gray-600 mb-2">Ocupadas</p>
                <p class="text-3xl font-bold text-blue-600">{{ reporteOcupacion?.ocupadas || 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ reporteOcupacion?.porcentajes?.ocupadas || 0 }}%</p>
              </div>
              <div class="bg-yellow-50 rounded-lg p-4 text-center">
                <p class="text-sm text-gray-600 mb-2">Reservadas</p>
                <p class="text-3xl font-bold text-yellow-600">{{ reporteOcupacion?.reservadas || 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ reporteOcupacion?.porcentajes?.reservadas || 0 }}%</p>
              </div>
              <div class="bg-orange-50 rounded-lg p-4 text-center">
                <p class="text-sm text-gray-600 mb-2">Mantenimiento</p>
                <p class="text-3xl font-bold text-orange-600">{{ reporteOcupacion?.mantenimiento || 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ reporteOcupacion?.porcentajes?.mantenimiento || 0 }}%</p>
              </div>
            </div>

            <!-- Tasa de Ocupación -->
            <div class="p-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white text-center">
              <p class="text-lg opacity-90 mb-2">Tasa de Ocupación</p>
              <p class="text-6xl font-bold">{{ reporteOcupacion?.tasa_ocupacion || 0 }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reporte Consolidado -->
      <div v-show="tabActivo === 'consolidado'">
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">📊 Reporte Consolidado</h3>
          
          <div v-if="loadingConsolidado" class="text-center py-8">
            <p class="text-gray-500">Cargando...</p>
          </div>

          <div v-else class="space-y-6">
            <!-- Período -->
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-600">Período del Reporte</p>
              <p class="font-bold">{{ formatDate(reporteConsolidado?.periodo?.fecha_inicio) }} - {{ formatDate(reporteConsolidado?.periodo?.fecha_fin) }}</p>
            </div>

            <!-- Métricas Principales -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-blue-50 rounded-lg p-6">
                <p class="text-sm text-gray-600 mb-2">Total Reservas</p>
                <p class="text-4xl font-bold text-blue-600">{{ reporteConsolidado?.data?.reservas || 0 }}</p>
              </div>
              <div class="bg-green-50 rounded-lg p-6">
                <p class="text-sm text-gray-600 mb-2">Ingresos Totales</p>
                <p class="text-2xl font-bold text-green-600">{{ formatCurrency(reporteConsolidado?.data?.ingresos_totales || 0) }}</p>
              </div>
              <div class="bg-purple-50 rounded-lg p-6">
                <p class="text-sm text-gray-600 mb-2">Consumos</p>
                <p class="text-2xl font-bold text-purple-600">{{ formatCurrency(reporteConsolidado?.data?.ingresos_consumos || 0) }}</p>
              </div>
              <div class="bg-indigo-50 rounded-lg p-6">
                <p class="text-sm text-gray-600 mb-2">Tasa Ocupación</p>
                <p class="text-4xl font-bold text-indigo-600">{{ reporteConsolidado?.data?.tasa_ocupacion || 0 }}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useHotelesStore } from '../../stores/hoteles';
import axios from '../../axios';
import Button from '../../components/Button.vue';

const hotelesStore = useHotelesStore();

const tabActivo = ref('reservas');
const tabs = [
  { id: 'reservas', nombre: 'Reservas', icon: '📝' },
  { id: 'ingresos', nombre: 'Ingresos', icon: '💰' },
  { id: 'ocupacion', nombre: 'Ocupación', icon: '🏨' },
  { id: 'consolidado', nombre: 'Consolidado', icon: '📊' },
];

const filtros = ref({
  id_hotel: '',
  fecha_inicio: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
  fecha_fin: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
});

const reporteReservas = ref(null);
const reporteIngresos = ref(null);
const reporteOcupacion = ref(null);
const reporteConsolidado = ref(null);

const loadingReservas = ref(false);
const loadingIngresos = ref(false);
const loadingOcupacion = ref(false);
const loadingConsolidado = ref(false);

const fetchReporteReservas = async () => {
  loadingReservas.value = true;
  try {
    const params = new URLSearchParams(filtros.value);
    const response = await axios.get(`/reportes/reservas?${params}`);
    if (response.data.success) {
      reporteReservas.value = response.data;
    }
  } catch (error) {
    console.error('Error al cargar reporte de reservas:', error);
  } finally {
    loadingReservas.value = false;
  }
};

const fetchReporteIngresos = async () => {
  loadingIngresos.value = true;
  try {
    const params = new URLSearchParams(filtros.value);
    const response = await axios.get(`/reportes/ingresos?${params}`);
    if (response.data.success) {
      reporteIngresos.value = response.data;
    }
  } catch (error) {
    console.error('Error al cargar reporte de ingresos:', error);
  } finally {
    loadingIngresos.value = false;
  }
};

const fetchReporteOcupacion = async () => {
  loadingOcupacion.value = true;
  try {
    const params = new URLSearchParams({ id_hotel: filtros.value.id_hotel });
    const response = await axios.get(`/reportes/ocupacion?${params}`);
    if (response.data.success) {
      reporteOcupacion.value = response.data.data;
    }
  } catch (error) {
    console.error('Error al cargar reporte de ocupación:', error);
  } finally {
    loadingOcupacion.value = false;
  }
};

const fetchReporteConsolidado = async () => {
  loadingConsolidado.value = true;
  try {
    const params = new URLSearchParams(filtros.value);
    const response = await axios.get(`/reportes/consolidado?${params}`);
    if (response.data.success) {
      reporteConsolidado.value = response.data;
    }
  } catch (error) {
    console.error('Error al cargar reporte consolidado:', error);
  } finally {
    loadingConsolidado.value = false;
  }
};

const aplicarFiltros = () => {
  fetchReporteReservas();
  fetchReporteIngresos();
  fetchReporteOcupacion();
  fetchReporteConsolidado();
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
  hotelesStore.fetchHoteles();
  aplicarFiltros();
});
</script>