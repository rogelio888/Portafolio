<!-- resources/js/views/huespedes/Create.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <button @click="$router.back()" class="text-blue-600 hover:text-blue-800 mb-4">
        ← Volver
      </button>
      <h1 class="text-3xl font-bold text-gray-800">Registrar Huésped</h1>
      <p class="text-gray-600 mt-1">Registra un nuevo huésped en el sistema</p>
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
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Apellido"
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
              placeholder="CI"
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
              placeholder="Teléfono"
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
              placeholder="email@ejemplo.com"
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
            Guardar Huésped
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useHuespedesStore } from '../../stores/huespedes';
import Button from '../../components/Button.vue';

const router = useRouter();
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
const error = ref(null);

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    await huespedesStore.createHuesped(form.value);
    router.push('/huespedes');
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.errors?.ci?.[0] || 'Error al crear huésped';
  } finally {
    loading.value = false;
  }
};
</script>