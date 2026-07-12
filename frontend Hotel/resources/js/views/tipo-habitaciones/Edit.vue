<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Editar Tipo de Habitación</h1>
      <router-link
        to="/tipo-habitaciones"
        class="text-blue-600 hover:underline"
      >
        ← Volver al listado
      </router-link>
    </div>

    <form @submit.prevent="actualizar" class="space-y-4 max-w-lg">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input v-model="form.nombre" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea v-model="form.descripcion" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
        <input v-model.number="form.capacidad" type="number" min="1" required class="w-full px-3 py-2 border border-gray-300 rounded" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Precio Base</label>
        <input v-model.number="form.precio_base" type="number" step="0.01" min="0" required class="w-full px-3 py-2 border border-gray-300 rounded" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select v-model="form.estado" class="w-full px-3 py-2 border border-gray-300 rounded">
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
      </div>

      <div class="flex items-center space-x-4 mt-4">
        <button type="submit" :disabled="loading" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50">
          {{ loading ? 'Guardando...' : 'Actualizar' }}
        </button>
        <button type="button" @click="resetForm" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">
          Resetear
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from '../../axios';

const router = useRouter();
const route = useRoute();
const tipoId = route.params.id;

const loading = ref(false);
const form = ref({
  nombre: '',
  descripcion: '',
  capacidad: 1,
  precio_base: 0,
  estado: 'ACTIVO',
});

const resetForm = () => {
  // reload original data
  cargarTipo();
};

const cargarTipo = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/tipo-habitaciones/${tipoId}`);
    const data = response.data.data;
    form.value = {
      nombre: data.nombre || '',
      descripcion: data.descripcion || '',
      capacidad: data.capacidad || 1,
      precio_base: data.precio_base || 0,
      estado: data.estado || 'ACTIVO',
    };
  } catch (e) {
    console.error(e);
    alert('Error al cargar el tipo de habitación');
    router.push('/tipo-habitaciones');
  } finally {
    loading.value = false;
  }
};

const actualizar = async () => {
  loading.value = true;
  try {
    await axios.put(`/tipo-habitaciones/${tipoId}`, form.value);
    alert('Tipo de habitación actualizado exitosamente');
    router.push('/tipo-habitaciones');
  } catch (e) {
    console.error(e);
    alert(e.response?.data?.message || 'Error al actualizar');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  cargarTipo();
});
</script>
