<!-- resources/js/views/servicios/Index.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Servicios</h1>
        <p class="text-gray-600 mt-1">Administra todos los servicios del hotel</p>
      </div>
      <Button
        v-if="authStore.hasPermission('crear_servicios')"
        @click="abrirModalCrear"
      >
        ➕ Nuevo Servicio
      </Button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
          <select
            v-model="filtros.tipo"
            @change="fetchServicios"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="PERSONA">Por Persona</option>
            <option value="HABITACION">Por Habitación</option>
            <option value="ESTANCIA">Por Estancia</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Frecuencia</label>
          <select
            v-model="filtros.frecuencia"
            @change="fetchServicios"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="DIARIO">Diario</option>
            <option value="UNICO">Único</option>
            <option value="POR_USO">Por Uso</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            v-model="filtros.estado"
            @change="fetchServicios"
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
      :data="serviciosStore.servicios"
      :loading="serviciosStore.loading"
    >
      <template #cell-tipo="{ item }">
        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
          {{ formatTipo(item.tipo) }}
        </span>
      </template>

      <template #cell-frecuencia="{ item }">
        <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
          {{ formatFrecuencia(item.frecuencia) }}
        </span>
      </template>

      <template #cell-precio="{ item }">
        <span class="font-bold text-green-600">{{ formatCurrency(item.precio) }}</span>
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
            v-if="authStore.hasPermission('editar_servicios')"
            @click="abrirModalEditar(item)"
            class="text-yellow-600 hover:text-yellow-800"
            title="Editar"
          >
            ✏️
          </button>
          <button
            v-if="authStore.hasPermission('eliminar_servicios')"
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
    <Modal :show="modalForm" @close="cerrarModal" :title="modoEdicion ? 'Editar Servicio' : 'Nuevo Servicio'" size="lg">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nombre <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.nombre"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Desayuno Buffet"
          />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
          <textarea
            v-model="form.descripcion"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción del servicio..."
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tipo <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.tipo"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona</option>
            <option value="PERSONA">Por Persona</option>
            <option value="HABITACION">Por Habitación</option>
            <option value="ESTANCIA">Por Estancia</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Define cómo se cobra el servicio</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Frecuencia <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.frecuencia"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona</option>
            <option value="DIARIO">Diario</option>
            <option value="UNICO">Único</option>
            <option value="POR_USO">Por Uso</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Define cuándo se cobra</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Precio <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="form.precio"
            type="number"
            step="0.01"
            min="0"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            v-model="form.estado"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
      </div>

      <!-- Ejemplos de cálculo -->
      <div class="mt-4 p-4 bg-blue-50 rounded-lg">
        <p class="text-sm font-medium text-blue-800 mb-2">💡 Ejemplo de aplicación:</p>
        <ul class="text-xs text-blue-700 space-y-1">
          <li v-if="form.tipo === 'PERSONA' && form.frecuencia === 'DIARIO'">
            ✓ Se cobrará por cada persona, cada día de la estadía
          </li>
          <li v-else-if="form.tipo === 'HABITACION' && form.frecuencia === 'DIARIO'">
            ✓ Se cobrará por cada habitación, cada día de la estadía
          </li>
          <li v-else-if="form.tipo === 'ESTANCIA' && form.frecuencia === 'UNICO'">
            ✓ Se cobrará una sola vez por toda la estadía
          </li>
          <li v-else-if="form.frecuencia === 'POR_USO'">
            ✓ Se cobrará cada vez que se registre un consumo
          </li>
        </ul>
      </div>

      <template #footer>
        <Button variant="secondary" @click="cerrarModal">Cancelar</Button>
        <Button @click="guardarServicio" :loading="guardando">
          {{ modoEdicion ? 'Actualizar' : 'Guardar' }}
        </Button>
      </template>
    </Modal>

    <!-- Modal Eliminar -->
    <Modal :show="modalEliminar" @close="modalEliminar = false" title="Confirmar eliminación">
      <p class="text-gray-700">
        ¿Estás seguro de eliminar el servicio <strong>{{ servicioSeleccionado?.nombre }}</strong>?
      </p>
      
      <template #footer>
        <Button variant="secondary" @click="modalEliminar = false">Cancelar</Button>
        <Button variant="danger" @click="eliminarServicio" :loading="eliminando">Confirmar</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useServiciosStore } from '../../stores/servicios';
import Table from '../../components/Table.vue';
import Button from '../../components/Button.vue';
import Modal from '../../components/Modal.vue';

const authStore = useAuthStore();
const serviciosStore = useServiciosStore();

const filtros = ref({
  tipo: '',
  frecuencia: '',
  estado: ''
});

const modalForm = ref(false);
const modalEliminar = ref(false);
const modoEdicion = ref(false);
const servicioSeleccionado = ref(null);
const guardando = ref(false);
const eliminando = ref(false);

const form = ref({
  nombre: '',
  descripcion: '',
  tipo: '',
  frecuencia: '',
  precio: 0,
  estado: 'ACTIVO'
});

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'frecuencia', label: 'Frecuencia' },
  { key: 'precio', label: 'Precio' },
  { key: 'estado', label: 'Estado' },
];

const fetchServicios = async () => {
  try {
    await serviciosStore.fetchServicios(filtros.value);
  } catch (error) {
    console.error('Error al cargar servicios:', error);
  }
};

const abrirModalCrear = () => {
  modoEdicion.value = false;
  form.value = {
    nombre: '',
    descripcion: '',
    tipo: '',
    frecuencia: '',
    precio: 0,
    estado: 'ACTIVO'
  };
  modalForm.value = true;
};

const abrirModalEditar = (servicio) => {
  modoEdicion.value = true;
  servicioSeleccionado.value = servicio;
  form.value = {
    nombre: servicio.nombre,
    descripcion: servicio.descripcion || '',
    tipo: servicio.tipo,
    frecuencia: servicio.frecuencia,
    precio: servicio.precio,
    estado: servicio.estado
  };
  modalForm.value = true;
};

const cerrarModal = () => {
  modalForm.value = false;
  servicioSeleccionado.value = null;
};

const guardarServicio = async () => {
  guardando.value = true;
  try {
    if (modoEdicion.value) {
      await serviciosStore.updateServicio(servicioSeleccionado.value.id, form.value);
    } else {
      await serviciosStore.createServicio(form.value);
    }
    cerrarModal();
    await fetchServicios();
  } catch (error) {
    alert('Error al guardar servicio');
  } finally {
    guardando.value = false;
  }
};

const confirmarEliminar = (servicio) => {
  servicioSeleccionado.value = servicio;
  modalEliminar.value = true;
};

const eliminarServicio = async () => {
  eliminando.value = true;
  try {
    await serviciosStore.deleteServicio(servicioSeleccionado.value.id);
    modalEliminar.value = false;
    await fetchServicios();
  } catch (error) {
    alert(error.response?.data?.message || 'Error al eliminar servicio');
  } finally {
    eliminando.value = false;
  }
};

const formatTipo = (tipo) => {
  const tipos = {
    'PERSONA': 'Por Persona',
    'HABITACION': 'Por Habitación',
    'ESTANCIA': 'Por Estancia'
  };
  return tipos[tipo] || tipo;
};

const formatFrecuencia = (frecuencia) => {
  const frecuencias = {
    'DIARIO': 'Diario',
    'UNICO': 'Único',
    'POR_USO': 'Por Uso'
  };
  return frecuencias[frecuencia] || frecuencia;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(value);
};

onMounted(() => {
  fetchServicios();
});
</script>