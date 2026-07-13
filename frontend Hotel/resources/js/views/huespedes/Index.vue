<!-- resources/js/views/huespedes/Index.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Huéspedes</h1>
        <p class="text-gray-600 mt-1">Administra todos los huéspedes registrados</p>
      </div>
      <!-- Todos pueden crear huéspedes -->
      <Button @click="$router.push('/huespedes/crear')">
        <Icon name="plus" class="w-4 h-4 inline-block mr-1" /> Nuevo Huésped
      </Button>
    </div>

    <!-- Tabla -->
    <Table
      :columns="columns"
      :data="huespedesStore.huespedes"
      :loading="huespedesStore.loading"
      :actions="authStore.hasPermission('editar_huespedes') || authStore.hasPermission('eliminar_huespedes')"
    >
      <template #cell-nombre="{ item }">
        {{ item.nombre }} {{ item.apellido }}
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
          <!-- Gerente/Admin o con autorización temporal -->
          <button
            v-if="authStore.hasPermission('gestionar_huespedes') || item.can_edit"
            @click="editarHuesped(item.id)"
            class="text-yellow-600 hover:text-yellow-800"
            title="Editar"
          >
            <Icon name="pencil" class="w-4 h-4 inline-block" />
          </button>
          
          <!-- Recepcionista puede solicitar autorización (si no tiene permiso) -->
          <button
            v-else-if="authStore.user?.rol?.nombre === 'Recepcionista' && !item.can_edit"
            @click="solicitarAutorizacion(item)"
            class="text-blue-600 hover:text-blue-800"
            title="Solicitar autorización para editar"
          >
            🔐
          </button>
          
          <button
            v-if="authStore.hasPermission('gestionar_huespedes')"
            @click="confirmarEliminar(item)"
            class="text-red-600 hover:text-red-800"
            title="Eliminar"
          >
            <Icon name="trash" class="w-4 h-4 inline-block" />
          </button>
        </div>
      </template>
    </Table>

    <!-- Modal confirmar eliminar -->
    <Modal :show="modalEliminar" @close="modalEliminar = false" title="Confirmar eliminación">
      <p class="text-gray-700">
        ¿Estás seguro de inactivar al huésped <strong>{{ huespedSeleccionado?.nombre }} {{ huespedSeleccionado?.apellido }}</strong>?
      </p>
      
      <template #footer>
        <Button variant="secondary" @click="modalEliminar = false">Cancelar</Button>
        <Button variant="danger" @click="eliminarHuesped" :loading="eliminando">Confirmar</Button>
      </template>
    </Modal>

    <!-- Modal solicitar autorización -->
    <Modal :show="modalAutorizacion" @close="modalAutorizacion = false" title="Solicitar Autorización">
      <div class="space-y-4">
        <p class="text-gray-700">
          Necesitas autorización de un gerente o administrador para editar al huésped 
          <strong>{{ huespedSeleccionado?.nombre }} {{ huespedSeleccionado?.apellido }}</strong>
        </p>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Motivo de la solicitud
          </label>
          <textarea
            v-model="motivoSolicitud"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Explica por qué necesitas editar este registro..."
          ></textarea>
        </div>
      </div>
      
      <template #footer>
        <Button variant="secondary" @click="modalAutorizacion = false">Cancelar</Button>
        <Button @click="enviarSolicitud" :loading="enviandoSolicitud">Enviar Solicitud</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { useToastStore } from '../../stores/toast';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useHuespedesStore } from '../../stores/huespedes';
import Table from '../../components/Table.vue';
import Button from '../../components/Button.vue';
import Modal from '../../components/Modal.vue';
import axios from '../../axios';

const toast = useToastStore();

const router = useRouter();
const authStore = useAuthStore();
const huespedesStore = useHuespedesStore();

const modalEliminar = ref(false);
const modalAutorizacion = ref(false);
const huespedSeleccionado = ref(null);
const eliminando = ref(false);
const motivoSolicitud = ref('');
const enviandoSolicitud = ref(false);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre Completo' },
  { key: 'ci', label: 'CI' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'email', label: 'Email' },
  { key: 'estado', label: 'Estado' },
];

const editarHuesped = (id) => {
  router.push(`/huespedes/${id}/editar`);
};

const solicitarAutorizacion = (huesped) => {
  huespedSeleccionado.value = huesped;
  motivoSolicitud.value = '';
  modalAutorizacion.value = true;
};

const enviarSolicitud = async () => {
  if (!motivoSolicitud.value.trim()) {
    toast.success('Por favor ingresa un motivo para la solicitud');
    return;
  }

  enviandoSolicitud.value = true;
  try {
    await axios.post('/solicitudes-autorizacion', {
      tipo: 'editar_huesped',
      modelo: 'App\\Models\\Huesped',
      modelo_id: huespedSeleccionado.value.id,
      motivo: motivoSolicitud.value
    });
    
    toast.success('Solicitud enviada correctamente. Un gerente o administrador la revisará pronto.');
    modalAutorizacion.value = false;
    huespedSeleccionado.value = null;
    motivoSolicitud.value = '';
  } catch (error) {
    toast.error('Error al enviar solicitud: ' + (error.response?.data?.message || 'Error desconocido'));
  } finally {
    enviandoSolicitud.value = false;
  }
};

const confirmarEliminar = (huesped) => {
  huespedSeleccionado.value = huesped;
  modalEliminar.value = true;
};

const eliminarHuesped = async () => {
  eliminando.value = true;
  try {
    await huespedesStore.deleteHuesped(huespedSeleccionado.value.id);
    modalEliminar.value = false;
    huespedSeleccionado.value = null;
  } catch (error) {
    toast.error('Error al eliminar huésped');
  } finally {
    eliminando.value = false;
  }
};

onMounted(() => {
  huespedesStore.fetchHuespedes();
});
</script>