<!-- resources/js/views/huespedes/Edit.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <button @click="$router.back()" class="text-blue-600 hover:text-blue-800 mb-4">
        ← Volver
      </button>
      <h1 class="text-3xl font-bold text-gray-800">Editar Huésped</h1>
      <p class="text-gray-600 mt-1">Actualiza la información del huésped</p>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="bg-white rounded-lg shadow p-6 text-center">
      <p class="text-gray-500">Cargando...</p>
    </div>

    <!-- Formulario -->
    <div v-else class="bg-white rounded-lg shadow p-6 max-w-3xl">
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
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- CI -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Cédula de Identidad <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.ci"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Teléfono -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              v-model="form.telefono"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Email -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              v-model="form.estado"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            Actualizar Huésped
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useHuespedesStore } from '../../stores/huespedes';
import Button from '../../components/Button.vue';

const router = useRouter();
const route = useRoute();
const huespedesStore = useHuespedesStore();

const form = ref({
  nombre: '',
  apellido: '',
  ci: '',
  telefono: '',
  email: '',
  estado: 'ACTIVO'
});

const loading = ref(false);
const cargando = ref(true);
const error = ref(null);

const fetchHuesped = async () => {
  cargando.value = true;
  try {
    const huesped = await huespedesStore.fetchHuesped(route.params.id);
    form.value = {
      nombre: huesped.nombre,
      apellido: huesped.apellido,
      ci: huesped.ci,
      telefono: huesped.telefono || '',
      email: huesped.email || '',
      estado: huesped.estado
    };
  } catch (err) {
    error.value = 'Error al cargar huésped';
  } finally {
    cargando.value = false;
  }
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    await huespedesStore.updateHuesped(route.params.id, form.value);
    router.push('/huespedes');
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al actualizar huésped';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHuesped();
});
</script>