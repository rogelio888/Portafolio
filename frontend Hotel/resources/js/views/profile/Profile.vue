<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Información del Usuario -->
        <div class="md:col-span-1">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex flex-col items-center">
              <div class="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold mb-4">
                {{ userInitials }}
              </div>
              <h2 class="text-xl font-semibold text-gray-800">{{ authStore.user?.nombre }} {{ authStore.user?.apellido }}</h2>
              <p class="text-gray-500 text-sm">{{ authStore.userRole }}</p>
              
              <div class="w-full mt-6 border-t border-gray-100 pt-4">
                <div class="mb-3">
                  <span class="text-xs text-gray-400 uppercase block">Email</span>
                  <span class="text-gray-700">{{ authStore.user?.email }}</span>
                </div>
                <div class="mb-3">
                  <span class="text-xs text-gray-400 uppercase block">Usuario</span>
                  <span class="text-gray-700">{{ authStore.user?.usuario }}</span>
                </div>
                <div v-if="authStore.userHotel">
                  <span class="text-xs text-gray-400 uppercase block">Hotel Asignado</span>
                  <span class="text-gray-700">{{ authStore.userHotel.nombre }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cambio de Contraseña -->
        <div class="md:col-span-2">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-800 mb-4">Cambiar Contraseña</h3>
            
            <form @submit.prevent="updatePassword">
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="current_password">
                  Contraseña Actual
                </label>
                <input 
                  v-model="form.current_password"
                  type="password" 
                  id="current_password"
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
              </div>

              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                  Nueva Contraseña
                </label>
                <input 
                  v-model="form.password"
                  type="password" 
                  id="password"
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
              </div>

              <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="password_confirmation">
                  Confirmar Nueva Contraseña
                </label>
                <input 
                  v-model="form.password_confirmation"
                  type="password" 
                  id="password_confirmation"
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
              </div>

              <div v-if="message" :class="`mb-4 p-3 rounded ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`">
                {{ message }}
              </div>

              <div class="flex items-center justify-end">
                <button 
                  type="submit" 
                  class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                  :disabled="loading"
                >
                  <span v-if="loading">Actualizando...</span>
                  <span v-else>Actualizar Contraseña</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const loading = ref(false);
const message = ref('');
const messageType = ref('success');

const form = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
});

const userInitials = computed(() => {
  const nombre = authStore.user?.nombre || '';
  const apellido = authStore.user?.apellido || '';
  return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
});

const updatePassword = async () => {
  if (form.value.password !== form.value.password_confirmation) {
    message.value = 'Las contraseñas no coinciden';
    messageType.value = 'error';
    return;
  }

  loading.value = true;
  message.value = '';

  try {
    await authStore.cambiarPassword(form.value);
    message.value = 'Contraseña actualizada correctamente';
    messageType.value = 'success';
    form.value = {
      current_password: '',
      password: '',
      password_confirmation: ''
    };
  } catch (error) {
    message.value = error.response?.data?.message || 'Error al actualizar la contraseña';
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};
</script>
