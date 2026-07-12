<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { resetDemoData } from '../data/db';

const router = useRouter();
const authStore = useAuthStore();
const logoUrl = `${import.meta.env.BASE_URL}logo-colegio.svg`;
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoggingIn = ref(false);
const errorMessage = ref('');
const isResetting = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) return;

  isLoggingIn.value = true;
  errorMessage.value = '';

  const result = await authStore.login(email.value, password.value, rememberMe.value);

  isLoggingIn.value = false;
  if (result.success) {
    router.push('/admin');
  } else {
    errorMessage.value = result.message || 'Error al iniciar sesión';
  }
};

const fillDemoCredentials = (which: 'directora' | 'caja') => {
  if (which === 'directora') {
    email.value = 'directora@colegiocentral.edu.bo';
    password.value = 'directora123';
  } else {
    email.value = 'caja@colegiocentral.edu.bo';
    password.value = 'caja123';
  }
};

const resetDemo = () => {
  isResetting.value = true;
  resetDemoData();
  setTimeout(() => {
    isResetting.value = false;
    errorMessage.value = '';
  }, 400);
};
</script>

<template>
  <main class="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4 relative overflow-hidden">
    
    <!-- Fondo dinámico pero formal -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-100 z-0"></div>
    
    <!-- Toques sutiles de color institucional (vida sin ser extravagante) -->
    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary z-0"></div>
    <div class="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl z-0"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl z-0"></div>

    <div class="w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-sm overflow-hidden z-10 animate-fade-in-up relative">
      
      <!-- Cabecera del Login -->
      <div class="bg-secondary p-8 text-center text-white border-b-4 border-primary">
        <div class="w-20 h-20 bg-white mx-auto rounded-xl flex items-center justify-center shadow-inner mb-4 p-2">
          <img :src="logoUrl" alt="Logo Colegio" class="w-full h-full object-contain" />
        </div>
        <h1 class="font-serif font-bold text-2xl tracking-wide uppercase">Colegio Central</h1>
        <p class="text-slate-300 text-xs font-semibold tracking-widest uppercase mt-1">Portal Administrativo</p>
      </div>

      <!-- Formulario -->
      <div class="p-8">
        <h2 class="text-lg font-bold text-slate-800 mb-6 text-center">Inicio de Sesión</h2>

        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm rounded-sm">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          
          <div class="space-y-1.5">
            <label for="email" class="block text-xs font-bold text-slate-600 uppercase tracking-wide">Correo Electrónico</label>
            <input 
              id="email" 
              v-model="email" 
              type="email" 
              required
              class="block w-full px-4 py-3 border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors rounded-sm text-sm"
              placeholder="ejemplo@colegiocentral.edu.bo"
            >
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between items-center">
              <label for="password" class="block text-xs font-bold text-slate-600 uppercase tracking-wide">Contraseña</label>
            </div>
            <input 
              id="password" 
              v-model="password" 
              type="password" 
              required
              class="block w-full px-4 py-3 border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors rounded-sm text-sm"
              placeholder="••••••••"
            >
          </div>

          <div class="flex items-center mt-2">
            <input 
              id="remember-me" 
              type="checkbox" 
              v-model="rememberMe" 
              class="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary focus:ring-2"
            >
            <label for="remember-me" class="ml-2 text-sm text-slate-600 cursor-pointer">
              Recordarme en este equipo
            </label>
          </div>

          <button 
            type="submit"
            :disabled="isLoggingIn"
            class="w-full mt-4 bg-primary hover:bg-primary-dark disabled:bg-slate-400 text-white font-bold py-3.5 px-4 rounded-sm transition-colors text-sm uppercase tracking-wide flex justify-center items-center gap-2"
          >
            <svg v-if="isLoggingIn" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
            {{ isLoggingIn ? 'Autenticando...' : 'Ingresar al Sistema' }}
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-100 text-center">
          <RouterLink to="/" class="text-xs text-slate-500 hover:text-secondary flex items-center justify-center gap-1 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Volver al Portal Público
          </RouterLink>
        </div>

        <div class="mt-6 pt-6 border-t border-dashed border-slate-200">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3">Demo — credenciales de prueba</p>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <button type="button" @click="fillDemoCredentials('directora')" class="border border-slate-200 hover:border-secondary hover:bg-slate-50 rounded-sm py-2 px-2 text-left transition-colors">
              <span class="block font-bold text-slate-700">Directora</span>
              <span class="block text-slate-400">Acceso total</span>
            </button>
            <button type="button" @click="fillDemoCredentials('caja')" class="border border-slate-200 hover:border-secondary hover:bg-slate-50 rounded-sm py-2 px-2 text-left transition-colors">
              <span class="block font-bold text-slate-700">Secretaria</span>
              <span class="block text-slate-400">Caja y estudiantes</span>
            </button>
          </div>
          <button type="button" @click="resetDemo" :disabled="isResetting" class="mt-3 w-full text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            {{ isResetting ? 'Reiniciando...' : '¿Cuenta bloqueada o datos alterados? Reiniciar demo' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
