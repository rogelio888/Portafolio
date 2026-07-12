<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Pagos</h1>
      <router-link
        to="/pagos/crear"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        + Registrar Pago
      </router-link>
    </div>

    <!-- Tarjetas de Resumen -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-600">Total Cobrado Hoy</p>
        <p class="text-2xl font-bold text-green-600">{{ formatCurrency(resumen.totalHoy) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-600">Total Cobrado Este Mes</p>
        <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(resumen.totalMes) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-600">Pagos Anulados Este Mes</p>
        <p class="text-2xl font-bold text-red-600">{{ resumen.anuladosMes }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Pago</label>
          <select v-model="filtros.tipo_pago" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="">Todos</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select v-model="filtros.estado" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="">Activos</option>
            <option value="ACTIVO">Activo</option>
            <option value="ANULADO">Anulado</option>
            <option value="TODOS">Todos</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
          <input type="date" v-model="filtros.fecha_inicio" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
          <input type="date" v-model="filtros.fecha_fin" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button @click="aplicarFiltros" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
          Filtrar
        </button>
        <button @click="limpiarFiltros" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
          Limpiar
        </button>
      </div>
    </div>

    <!-- Tabla de Pagos -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <Table
        :columns="columnas"
        :data="pagos"
        :loading="loading"
      >
        <template #cell-reserva="{ item }">
          <div>
            <p class="font-medium text-gray-900">{{ item.reserva?.huesped?.nombre || 'N/A' }}</p>
            <p class="text-sm text-gray-500">Hab. {{ item.reserva?.habitaciones?.[0]?.numero || 'N/A' }}</p>
          </div>
        </template>

        <template #cell-tipo_pago="{ item }">
          <span
            class="px-2 py-1 text-xs font-semibold rounded-full"
            :class="{
              'bg-green-100 text-green-800': item.tipo_pago === 'EFECTIVO',
              'bg-blue-100 text-blue-800': item.tipo_pago === 'TARJETA',
              'bg-purple-100 text-purple-800': item.tipo_pago === 'TRANSFERENCIA'
            }"
          >
            {{ item.tipo_pago }}
          </span>
        </template>

        <template #cell-monto="{ item }">
          {{ formatCurrency(item.monto) }}
        </template>

        <template #cell-fecha="{ item }">
          {{ formatDate(item.fecha) }}
        </template>

        <template #cell-estado="{ item }">
          <span
            class="px-2 py-1 text-xs font-semibold rounded-full"
            :class="{
              'bg-green-100 text-green-800': item.estado === 'ACTIVO',
              'bg-red-100 text-red-800': item.estado === 'ANULADO'
            }"
          >
            {{ item.estado }}
          </span>
        </template>


        <template #actions="{ item }">
          <div class="flex items-center justify-end space-x-2" v-if="item">
            <button
              v-if="item.estado === 'ACTIVO' && item.reserva && puedeAnular(item)"
              @click="mostrarModalAnular(item)"
              class="text-red-500 hover:text-red-600 p-1"
              title="Anular pago"
            >
              ⊗
            </button>
            <button
              v-if="item.estado === 'ANULADO'"
              @click="verMotivo(item)"
              class="text-blue-500 hover:text-blue-600 p-1"
              title="Ver motivo de anulación"
            >
              ℹ️
            </button>
            <span v-if="item.estado === 'ACTIVO' && item.reserva && !puedeAnular(item)" class="text-sm text-gray-400 italic">
              Reserva {{ item.reserva.estado }}
            </span>
          </div>
        </template>
      </Table>

      <!-- Paginación -->
      <div v-if="pagination.last_page > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Mostrando {{ pagination.from }} a {{ pagination.to }} de {{ pagination.total }} resultados
        </div>
        <div class="flex gap-2">
          <button
            @click="cambiarPagina(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            @click="cambiarPagina(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Anulación -->
    <div v-if="modalAnular.visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Anular Pago</h3>
        <p class="text-sm text-gray-600 mb-4">
          ¿Está seguro que desea anular este pago de <strong>{{ formatCurrency(modalAnular.pago?.monto) }}</strong>?
        </p>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Motivo de anulación *</label>
          <textarea
            v-model="modalAnular.motivo"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Ej: Falla en máquina de tarjetas, error en monto, etc."
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">Mínimo 10 caracteres</p>
        </div>
        <div class="flex gap-2 justify-end">
          <button
            @click="cerrarModalAnular"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="anularPago"
            :disabled="modalAnular.motivo.length < 10"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anular Pago
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../../axios';
import Table from '../../components/Table.vue';

const router = useRouter();
const loading = ref(false);
const pagos = ref([]);
const pagination = ref({
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0
});

const resumen = ref({
  totalHoy: 0,
  totalMes: 0,
  anuladosMes: 0
});

const filtros = ref({
  tipo_pago: '',
  estado: '',
  fecha_inicio: '',
  fecha_fin: ''
});

const modalAnular = ref({
  visible: false,
  pago: null,
  motivo: ''
});

const columnas = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'reserva', label: 'Reserva', sortable: false },
  { key: 'tipo_pago', label: 'Tipo de Pago', sortable: true },
  { key: 'monto', label: 'Monto', sortable: true },
  { key: 'fecha', label: 'Fecha', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true }
];

const cargarPagos = async (page = 1) => {
  loading.value = true;
  try {
    const params = { page };
    
    if (filtros.value.tipo_pago) params.tipo_pago = filtros.value.tipo_pago;
    if (filtros.value.estado && filtros.value.estado !== 'TODOS') {
      params.estado = filtros.value.estado;
    }
    if (filtros.value.estado === 'TODOS') {
      params.incluir_anulados = true;
    }
    if (filtros.value.fecha_inicio) params.fecha_inicio = filtros.value.fecha_inicio;
    if (filtros.value.fecha_fin) params.fecha_fin = filtros.value.fecha_fin;

    const response = await axios.get('/pagos', { params });
    
    // Verificar estructura de respuesta
    if (!response.data || !response.data.data) {
      throw new Error('Estructura de respuesta inválida');
    }
    
    pagos.value = response.data.data.data || [];
    pagination.value = {
      current_page: response.data.data.current_page || 1,
      last_page: response.data.data.last_page || 1,
      from: response.data.data.from || 0,
      to: response.data.data.to || 0,
      total: response.data.data.total || 0
    };

    calcularResumen();
  } catch (error) {
    console.error('Error al cargar pagos:', error);
    alert('Error al cargar los pagos');
  } finally {
    loading.value = false;
  }
};

const calcularResumen = () => {
  const hoy = new Date().toISOString().split('T')[0];
  const mesActual = new Date().getMonth();
  const añoActual = new Date().getFullYear();

  resumen.value.totalHoy = pagos.value
    .filter(p => p.estado === 'ACTIVO' && p.fecha.startsWith(hoy))
    .reduce((sum, p) => sum + parseFloat(p.monto), 0);

  resumen.value.totalMes = pagos.value
    .filter(p => {
      const fecha = new Date(p.fecha);
      return p.estado === 'ACTIVO' && fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
    })
    .reduce((sum, p) => sum + parseFloat(p.monto), 0);

  resumen.value.anuladosMes = pagos.value
    .filter(p => {
      if (p.estado !== 'ANULADO' || !p.fecha_anulacion) return false;
      const fecha = new Date(p.fecha_anulacion);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
    }).length;
};

const cambiarPagina = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    cargarPagos(page);
  }
};

const aplicarFiltros = () => {
  cargarPagos(1);
};

const limpiarFiltros = () => {
  filtros.value = {
    tipo_pago: '',
    estado: '',
    fecha_inicio: '',
    fecha_fin: ''
  };
  cargarPagos(1);
};

const puedeAnular = (pago) => {
  const estadosPermitidos = ['CONFIRMADA', 'EN_PROCESO'];
  return estadosPermitidos.includes(pago.reserva?.estado);
};

const mostrarModalAnular = (pago) => {
  modalAnular.value = {
    visible: true,
    pago: pago,
    motivo: ''
  };
};

const cerrarModalAnular = () => {
  modalAnular.value = {
    visible: false,
    pago: null,
    motivo: ''
  };
};

const anularPago = async () => {
  if (modalAnular.value.motivo.length < 10) {
    alert('El motivo debe tener al menos 10 caracteres');
    return;
  }

  try {
    await axios.post(`/pagos/${modalAnular.value.pago.id}/anular`, {
      motivo_anulacion: modalAnular.value.motivo
    });
    
    alert('Pago anulado exitosamente');
    cerrarModalAnular();
    cargarPagos(pagination.value.current_page);
  } catch (error) {
    console.error('Error al anular pago:', error);
    alert(error.response?.data?.message || 'Error al anular el pago');
  }
};

const verMotivo = (pago) => {
  const fecha = formatDate(pago.fecha_anulacion);
  alert(`Motivo de anulación:\n\n${pago.motivo_anulacion}\n\nFecha de anulación: ${fecha}`);
};

const formatCurrency = (value) => {
  return 'Bs. ' + parseFloat(value || 0).toFixed(2);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  // Asegurar que solo tomamos la parte de la fecha YYYY-MM-DD
  const datePart = date.toString().substring(0, 10);
  const [year, month, day] = datePart.split('-');
  
  if (!year || !month || !day) return 'Fecha Inválida';

  return new Date(year, month - 1, day).toLocaleDateString('es-BO');
};

onMounted(() => {
  cargarPagos();
});
</script>
