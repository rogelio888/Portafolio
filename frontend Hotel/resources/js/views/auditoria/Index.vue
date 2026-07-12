<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Auditoría del Sistema</h1>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <select v-model="filtros.user_id" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="">Todos</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Acción</label>
          <select v-model="filtros.accion" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="">Todas</option>
            <option value="CREATE">Creación</option>
            <option value="UPDATE">Edición</option>
            <option value="DELETE">Eliminación</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
          <input 
            type="text" 
            v-model="filtros.modelo" 
            placeholder="Ej. Reserva" 
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
          <input type="date" v-model="filtros.fecha_inicio" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button @click="limpiarFiltros" class="px-4 py-2 text-gray-600 hover:text-gray-800">
          Limpiar
        </button>
        <button @click="aplicarFiltros" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          Filtrar
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <Table
        :columns="columnas"
        :data="auditorias"
        :loading="loading"
      >
        <template #cell-user="{ item }">
          <div class="flex items-center">
            <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-2">
              {{ item.user?.name?.charAt(0) || '?' }}
            </div>
            <span>{{ item.user?.name || 'Sistema' }}</span>
          </div>
        </template>

        <template #cell-accion="{ item }">
          <span
            class="px-2 py-1 text-xs font-semibold rounded-full"
            :class="{
              'bg-green-100 text-green-800': item.accion === 'CREATE',
              'bg-blue-100 text-blue-800': item.accion === 'UPDATE',
              'bg-red-100 text-red-800': item.accion === 'DELETE'
            }"
          >
            {{ item.accion }}
          </span>
        </template>

        <template #cell-modelo="{ item }">
          <span class="text-sm font-mono text-gray-600">
            {{ formatModelo(item.modelo) }} #{{ item.modelo_id }}
          </span>
        </template>

        <template #cell-created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #cell-detalles="{ item }">
          <button 
            @click="verDetalles(item)"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Ver Cambios
          </button>
        </template>
      </Table>

      <!-- Paginación -->
      <div v-if="pagination.last_page > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Mostrando {{ pagination.from }} a {{ pagination.to }} de {{ pagination.total }} registros
        </div>
        <div class="flex gap-2">
          <button
            @click="cambiarPagina(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            @click="cambiarPagina(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Detalles -->
    <div v-if="modalDetalles.visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-900">Detalles del Cambio</h3>
          <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-sm text-gray-500">Usuario</p>
              <p class="font-medium">{{ modalDetalles.item?.user?.name || 'Sistema' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Fecha</p>
              <p class="font-medium">{{ formatDate(modalDetalles.item?.created_at) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Modelo</p>
              <p class="font-medium">{{ formatModelo(modalDetalles.item?.modelo) }} #{{ modalDetalles.item?.modelo_id }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">IP</p>
              <p class="font-medium">{{ modalDetalles.item?.ip_address }}</p>
            </div>
          </div>

          <div v-if="modalDetalles.item?.accion === 'UPDATE'" class="space-y-4">
            <h4 class="font-semibold text-gray-800 border-b pb-2">Cambios Realizados</h4>
            <div v-for="(valor, key) in modalDetalles.item.valores_nuevos" :key="key" class="grid grid-cols-3 gap-2 text-sm border-b border-gray-100 py-2">
              <div class="font-medium text-gray-600">{{ key }}</div>
              <div class="text-red-600 break-all bg-red-50 p-1 rounded">
                {{ formatValor(modalDetalles.item.valores_antiguos?.[key]) }}
              </div>
              <div class="text-green-600 break-all bg-green-50 p-1 rounded">
                {{ formatValor(valor) }}
              </div>
            </div>
          </div>

          <div v-else class="space-y-4">
             <h4 class="font-semibold text-gray-800 border-b pb-2">
               {{ modalDetalles.item?.accion === 'CREATE' ? 'Valores Iniciales' : 'Valores Eliminados' }}
             </h4>
             <div class="bg-gray-50 p-4 rounded-lg overflow-x-auto">
               <pre class="text-xs">{{ JSON.stringify(modalDetalles.item?.valores_nuevos || modalDetalles.item?.valores_antiguos, null, 2) }}</pre>
             </div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 flex justify-end">
          <button @click="cerrarModal" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800">
            Cerrar
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

const loading = ref(false);
const auditorias = ref([]);
const users = ref([]);
const pagination = ref({ current_page: 1, last_page: 1, total: 0 });

const filtros = ref({
  user_id: '',
  accion: '',
  modelo: '',
  fecha_inicio: '',
  fecha_fin: ''
});

const modalDetalles = ref({
  visible: false,
  item: null
});

const columnas = [
  { key: 'created_at', label: 'Fecha', sortable: true },
  { key: 'user', label: 'Usuario', sortable: false },
  { key: 'accion', label: 'Acción', sortable: true },
  { key: 'modelo', label: 'Modelo', sortable: true },
  { key: 'detalles', label: 'Detalles', sortable: false }
];

const cargarAuditorias = async (page = 1) => {
  loading.value = true;
  try {
    const params = { page, ...filtros.value };
    const response = await axios.get('/auditoria', { params });
    auditorias.value = response.data.data.data;
    pagination.value = {
      current_page: response.data.data.current_page,
      last_page: response.data.data.last_page,
      from: response.data.data.from,
      to: response.data.data.to,
      total: response.data.data.total
    };
  } catch (error) {
    console.error('Error cargando auditoría:', error);
  } finally {
    loading.value = false;
  }
};

const cargarUsuarios = async () => {
  try {
    const response = await axios.get('/empleados'); // Endpoint para obtener empleados
    users.value = response.data;
  } catch (e) {
    // Silently fail if endpoint doesn't exist
  }
};

const aplicarFiltros = () => cargarAuditorias(1);
const limpiarFiltros = () => {
  filtros.value = { user_id: '', accion: '', modelo: '', fecha_inicio: '', fecha_fin: '' };
  cargarAuditorias(1);
};
const cambiarPagina = (page) => cargarAuditorias(page);

const verDetalles = (item) => {
  modalDetalles.value = { visible: true, item };
};
const cerrarModal = () => {
  modalDetalles.value = { visible: false, item: null };
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('es-BO');
};

const formatModelo = (modelo) => {
  return modelo.replace('App\\Models\\', '');
};

const formatValor = (valor) => {
  if (valor === null) return 'null';
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
  return valor;
};

onMounted(() => {
  cargarAuditorias();
  cargarUsuarios();
});
</script>
