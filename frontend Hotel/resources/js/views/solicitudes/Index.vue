<!-- resources/js/views/solicitudes/Index.vue -->

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Solicitudes de Autorización</h1>
        <p class="text-gray-600 mt-1">Gestiona las solicitudes de edición del personal</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
          {{ solicitudesPendientes.length }} Pendientes
        </span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="tabActiva = 'pendientes'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            tabActiva === 'pendientes'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Pendientes ({{ solicitudesPendientes.length }})
        </button>
        <button
          @click="tabActiva = 'historial'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            tabActiva === 'historial'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Historial
        </button>
      </nav>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="text-gray-600 mt-2">Cargando solicitudes...</p>
    </div>

    <!-- Lista de solicitudes -->
    <div v-else class="space-y-4">
      <div
        v-for="solicitud in solicitudesFiltradas"
        :key="solicitud.id"
        class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-lg font-semibold text-gray-900">
                {{ solicitud.solicitante?.nombre }} {{ solicitud.solicitante?.apellido }}
              </span>
              <span
                :class="[
                  'px-2 py-1 text-xs font-semibold rounded-full',
                  solicitud.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                  solicitud.estado === 'APROBADA' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                ]"
              >
                {{ solicitud.estado }}
              </span>
            </div>
            
            <p class="text-sm text-gray-600 mb-2">
              <strong>Tipo:</strong> {{ formatTipo(solicitud.tipo) }}
            </p>
            
            <p class="text-sm text-gray-600 mb-2">
              <strong>Registro:</strong> {{ formatModelo(solicitud.modelo) }} #{{ solicitud.modelo_id }}
            </p>
            
            <div class="bg-gray-50 rounded p-3 mt-3">
              <p class="text-sm font-medium text-gray-700 mb-1">Motivo:</p>
              <p class="text-sm text-gray-600">{{ solicitud.motivo }}</p>
            </div>

            <div v-if="solicitud.estado !== 'PENDIENTE'" class="mt-3 bg-blue-50 rounded p-3">
              <p class="text-sm font-medium text-gray-700 mb-1">
                {{ solicitud.estado === 'APROBADA' ? 'Aprobado' : 'Rechazado' }} por:
                {{ solicitud.autorizador?.nombre }} {{ solicitud.autorizador?.apellido }}
              </p>
              <p class="text-sm text-gray-600">{{ solicitud.comentario_autorizador }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatDate(solicitud.fecha_respuesta) }}</p>
            </div>

            <p class="text-xs text-gray-500 mt-3">
              Solicitado el {{ formatDate(solicitud.created_at) }}
            </p>
          </div>

          <!-- Acciones -->
          <div v-if="solicitud.estado === 'PENDIENTE'" class="flex flex-col gap-2 ml-4">
            <button
              @click="abrirModalAprobar(solicitud)"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              ✓ Aprobar
            </button>
            <button
              @click="abrirModalRechazar(solicitud)"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              ✗ Rechazar
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="solicitudesFiltradas.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">
          {{ tabActiva === 'pendientes' ? 'No hay solicitudes pendientes' : 'No hay historial de solicitudes' }}
        </p>
      </div>
    </div>

    <!-- Modal Aprobar -->
    <Modal :show="modalAprobar" @close="modalAprobar = false" title="Aprobar Solicitud">
      <div class="space-y-4">
        <p class="text-gray-700">
          ¿Estás seguro de aprobar la solicitud de <strong>{{ solicitudSeleccionada?.solicitante?.nombre }}</strong>?
        </p>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Comentario (opcional)
          </label>
          <textarea
            v-model="comentario"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Agrega un comentario..."
          ></textarea>
        </div>
      </div>
      
      <template #footer>
        <button
          @click="modalAprobar = false"
          class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800"
        >
          Cancelar
        </button>
        <button
          @click="aprobarSolicitud"
          :disabled="procesando"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
        >
          {{ procesando ? 'Procesando...' : 'Aprobar' }}
        </button>
      </template>
    </Modal>

    <!-- Modal Rechazar -->
    <Modal :show="modalRechazar" @close="modalRechazar = false" title="Rechazar Solicitud">
      <div class="space-y-4">
        <p class="text-gray-700">
          ¿Estás seguro de rechazar la solicitud de <strong>{{ solicitudSeleccionada?.solicitante?.nombre }}</strong>?
        </p>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Motivo del rechazo <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="comentario"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Explica por qué se rechaza la solicitud..."
          ></textarea>
        </div>
      </div>
      
      <template #footer>
        <button
          @click="modalRechazar = false"
          class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800"
        >
          Cancelar
        </button>
        <button
          @click="rechazarSolicitud"
          :disabled="procesando || !comentario.trim()"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
        >
          {{ procesando ? 'Procesando...' : 'Rechazar' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '../../axios';
import Modal from '../../components/Modal.vue';

const loading = ref(false);
const solicitudes = ref([]);
const tabActiva = ref('pendientes');
const modalAprobar = ref(false);
const modalRechazar = ref(false);
const solicitudSeleccionada = ref(null);
const comentario = ref('');
const procesando = ref(false);

const solicitudesPendientes = computed(() => {
  return solicitudes.value.filter(s => s.estado === 'PENDIENTE');
});

const solicitudesFiltradas = computed(() => {
  if (tabActiva.value === 'pendientes') {
    return solicitudesPendientes.value;
  }
  return solicitudes.value.filter(s => s.estado !== 'PENDIENTE');
});

const cargarSolicitudes = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/solicitudes-autorizacion');
    solicitudes.value = response.data.data;
  } catch (error) {
    console.error('Error cargando solicitudes:', error);
    alert('Error al cargar solicitudes');
  } finally {
    loading.value = false;
  }
};

const abrirModalAprobar = (solicitud) => {
  solicitudSeleccionada.value = solicitud;
  comentario.value = '';
  modalAprobar.value = true;
};

const abrirModalRechazar = (solicitud) => {
  solicitudSeleccionada.value = solicitud;
  comentario.value = '';
  modalRechazar.value = true;
};

const aprobarSolicitud = async () => {
  procesando.value = true;
  try {
    await axios.post(`/solicitudes-autorizacion/${solicitudSeleccionada.value.id}/aprobar`, {
      comentario: comentario.value
    });
    
    alert('Solicitud aprobada correctamente');
    modalAprobar.value = false;
    await cargarSolicitudes();
  } catch (error) {
    console.error('Error aprobando solicitud:', error);
    alert('Error al aprobar solicitud: ' + (error.response?.data?.message || 'Error desconocido'));
  } finally {
    procesando.value = false;
  }
};

const rechazarSolicitud = async () => {
  if (!comentario.value.trim()) {
    alert('Debes ingresar un motivo para rechazar');
    return;
  }

  procesando.value = true;
  try {
    await axios.post(`/solicitudes-autorizacion/${solicitudSeleccionada.value.id}/rechazar`, {
      comentario: comentario.value
    });
    
    alert('Solicitud rechazada');
    modalRechazar.value = false;
    await cargarSolicitudes();
  } catch (error) {
    console.error('Error rechazando solicitud:', error);
    alert('Error al rechazar solicitud: ' + (error.response?.data?.message || 'Error desconocido'));
  } finally {
    procesando.value = false;
  }
};

const formatTipo = (tipo) => {
  const tipos = {
    'editar_huesped': 'Editar Huésped',
    'editar_habitacion': 'Editar Habitación',
    'editar_reserva': 'Editar Reserva'
  };
  return tipos[tipo] || tipo;
};

const formatModelo = (modelo) => {
  return modelo.replace('App\\Models\\', '');
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('es-BO');
};

onMounted(() => {
  cargarSolicitudes();
  
  // Recargar cada 30 segundos para ver nuevas solicitudes
  setInterval(cargarSolicitudes, 30000);
});
</script>
