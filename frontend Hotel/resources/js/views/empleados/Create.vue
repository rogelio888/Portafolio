<!-- resources/js/views/empleados/Create.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <button @click="$router.back()" class="text-blue-600 hover:text-blue-800 mb-4">
        ← Volver
      </button>
      <h1 class="text-3xl font-bold text-gray-800">Crear Empleado</h1>
      <p class="text-gray-600 mt-1">Registra un nuevo empleado en el sistema</p>
    </div>

    <!-- Formulario -->
    <div class="bg-white rounded-lg shadow p-6 max-w-3xl">
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.nombre"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre"
            />
          </div>

          <!-- Apellido -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Apellido <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.apellido"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Apellido"
            />
          </div>

          <!-- Usuario -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Usuario <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.usuario"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Usuario para login"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Contraseña <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.password"
              type="password"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <!-- Rol -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rol <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.id_rol"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un rol</option>
              <option v-for="rol in roles" :key="rol.id" :value="rol.id">
                {{ rol.nombre }}
              </option>
            </select>
          </div>

          <!-- Hotel -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Hotel
            </label>
            <select
              v-model="form.id_hotel"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin asignar (Admin general)</option>
              <option v-for="hotel in hotelesStore.hotelesActivos" :key="hotel.id" :value="hotel.id">
                {{ hotel.nombre }}
              </option>
            </select>
          </div>

          <!-- Estado -->
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
            Guardar Empleado
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHotelesStore } from '../../stores/hoteles';
import axios from '../../axios';
import Button from '../../components/Button.vue';

const router = useRouter();
const hotelesStore = useHotelesStore();

const form = ref({
  nombre: '',
  apellido: '',
  usuario: '',
  password: '',
  id_rol: '',
  id_hotel: '',
  estado: 'ACTIVO'
});

const roles = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchRoles = async () => {
  try {
    const response = await axios.get('/roles');
    if (response.data.success) {
      roles.value = response.data.data;
    }
  } catch (err) {
    console.error('Error al cargar roles:', err);
  }
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.post('/empleados', form.value);
    if (response.data.success) {
      router.push('/empleados');
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.errors?.usuario?.[0] || 'Error al crear empleado';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  hotelesStore.fetchHoteles();
  fetchRoles();
});
</script>