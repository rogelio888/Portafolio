<!-- resources/js/views/habitaciones/Create.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <button @click="$router.back()" class="text-blue-600 hover:text-blue-800 mb-4">
        ← Volver
      </button>
      <h1 class="text-3xl font-bold text-gray-800">Crear Habitación</h1>
      <p class="text-gray-600 mt-1">Registra una nueva habitación</p>
    </div>

    <!-- Formulario -->
    <div class="bg-white rounded-lg shadow p-6 max-w-3xl">
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Hotel -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Hotel <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.id_hotel"
              @change="cargarPisos"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un hotel</option>
              <option v-for="hotel in hotelesStore.hotelesActivos" :key="hotel.id" :value="hotel.id">
                {{ hotel.nombre }}
              </option>
            </select>
          </div>

          <!-- Piso -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Piso <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.id_piso"
              required
              :disabled="!form.id_hotel"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un piso</option>
              <option v-for="piso in pisos" :key="piso.id" :value="piso.id">
                Piso {{ piso.numero }}
              </option>
            </select>
          </div>

          <!-- Tipo de Habitación -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Habitación <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.id_tipo"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un tipo</option>
              <option v-for="tipo in tipos" :key="tipo.id" :value="tipo.id">
                {{ tipo.nombre }} - {{ formatCurrency(tipo.precio_base) }}
              </option>
            </select>
          </div>

          <!-- Número -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Número de Habitación <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.numero"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 101"
            />
          </div>

          <!-- Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Estado <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.estado"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="INACTIVA">Inactiva</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
            </select>
          </div>

          <!-- Descripción -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              v-model="form.descripcion"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Características especiales..."
            ></textarea>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Botones -->
        <div class="mt-6 flex items-center justify-end space-x-3">
          <Button type="button" variant="secondary" @click="$router.back()">
            Cancelar
          </Button>
          <Button type="submit" :loading="loading">
            Guardar Habitación
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHabitacionesStore } from '../../stores/habitaciones';
import { useHotelesStore } from '../../stores/hoteles';
import axios from '../../axios';
import Button from '../../components/Button.vue';

const router = useRouter();
const habitacionesStore = useHabitacionesStore();
const hotelesStore = useHotelesStore();

const form = ref({
  id_hotel: '',
  id_piso: '',
  id_tipo: '',
  numero: '',
  estado: 'DISPONIBLE',
  descripcion: ''
});

const pisos = ref([]);
const tipos = ref([]);
const loading = ref(false);
const error = ref(null);

const cargarPisos = async () => {
  if (!form.value.id_hotel) return;
  
  try {
    const response = await axios.get(`/pisos?id_hotel=${form.value.id_hotel}`);
    if (response.data.success) {
      pisos.value = response.data.data;
    }
  } catch (err) {
    console.error('Error al cargar pisos:', err);
  }
};

const cargarTipos = async () => {
  try {
    const response = await axios.get('/tipo-habitaciones?estado=ACTIVO');
    if (response.data.success) {
      tipos.value = response.data.data;
    }
  } catch (err) {
    console.error('Error al cargar tipos:', err);
  }
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    await habitacionesStore.createHabitacion(form.value);
    router.push('/habitaciones');
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al crear habitación';
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(value);
};

onMounted(() => {
  hotelesStore.fetchHoteles();
  cargarTipos();
});
</script>