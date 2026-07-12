<!-- resources/js/views/hoteles/Create.vue -->

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <button @click="$router.back()" class="text-blue-600 hover:text-blue-800 mb-4">
        ← Volver
      </button>
      <h1 class="text-3xl font-bold text-gray-800">Crear Hotel</h1>
      <p class="text-gray-600 mt-1">Registra un nuevo hotel en el sistema</p>
    </div>

    <!-- Formulario -->
    <div class="bg-white rounded-lg shadow p-6 max-w-2xl">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-6">
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Hotel <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.nombre"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Hotel Plaza Grande"
            />
          </div>

          <!-- Dirección -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Dirección <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.direccion"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Av. 16 de Julio #1234"
            />
          </div>

          <!-- Ciudad -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ciudad <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.ciudad"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Santa Cruz"
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
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="CERRADO">Cerrado</option>
            </select>
          </div>

          <!-- Error -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ error }}
          </div>

          <!-- Botones -->
          <div class="flex items-center justify-end space-x-3">
            <Button type="button" variant="secondary" @click="$router.back()">
              Cancelar
            </Button>
            <Button type="submit" :loading="loading">
              Guardar Hotel
            </Button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useHotelesStore } from '../../stores/hoteles';
import Button from '../../components/Button.vue';

const router = useRouter();
const hotelesStore = useHotelesStore();

const form = ref({
  nombre: '',
  direccion: '',
  ciudad: '',
  estado: 'ACTIVO'
});

const loading = ref(false);
const error = ref(null);

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    await hotelesStore.createHotel(form.value);
    router.push('/hoteles');
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al crear hotel';
  } finally {
    loading.value = false;
  }
};
</script>