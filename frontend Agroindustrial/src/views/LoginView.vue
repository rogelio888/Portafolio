<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden font-sans bg-agro-950">
    <!-- Background Image with Blur -->
    <div class="absolute inset-0 bg-cover bg-center filter blur-[4px] scale-105 opacity-60" :style="{ backgroundImage: `url(${loginBgField})` }"></div>
    <!-- Dark/Green tint overlay -->
    <div class="absolute inset-0 bg-gradient-to-tr from-agro-950/90 via-agro-900/50 to-agro-950/90"></div>
    
    <!-- Centered Login Card -->
    <div class="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl relative z-10 mx-4">
      <div class="text-center">
        <div class="h-12 w-12 rounded-xl bg-agro-500 flex items-center justify-center mx-auto shadow-lg shadow-agro-500/20">
          <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="7" cy="18" r="2" />
            <circle cx="18" cy="18" r="3" />
            <path d="M7 16H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h7l3 3h5a1 1 0 0 1 1 1v3" />
            <path d="M12 8V5a1 1 0 0 1 1-1h2" />
          </svg>
        </div>
        <h2 class="mt-4 text-3xl font-extrabold text-agro-900 tracking-tight">AgroFlota</h2>
        <p class="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Control de Mantenimiento Preventivo de Maquinaria Agrícola
        </p>
      </div>

      <!-- Error Message Alert -->
      <div v-if="errorMessage" class="mt-4 bg-red-50 text-red-600 p-3 rounded-2xl border border-red-200 text-xs font-semibold flex items-center gap-2">
        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <div v-if="resetMessage" class="mt-4 bg-emerald-50 text-emerald-700 p-3 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
        <span>{{ resetMessage }}</span>
      </div>

      <div class="mt-4 bg-agro-50 border border-agro-200 rounded-2xl p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-agro-700 mb-2">Credenciales de prueba (demo sin backend)</p>
        <div class="flex flex-col gap-1.5">
          <button
            v-for="cred in demoCredentials"
            :key="cred.email"
            type="button"
            @click="fillDemo(cred)"
            class="flex items-center justify-between bg-white border border-agro-100 rounded-lg px-3 py-2 text-left hover:bg-agro-50 transition-colors cursor-pointer"
          >
            <span class="text-[11px] text-slate-600"><strong>{{ cred.label }}</strong> · {{ cred.email }}</span>
            <span class="text-[10px] text-agro-600 font-mono">{{ cred.password }}</span>
          </button>
        </div>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
            <input id="email" type="email" autocomplete="email" required v-model="email" :disabled="isLoading" class="appearance-none rounded-2xl block w-full px-4 py-3 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all text-sm disabled:opacity-50" placeholder="usuario@agroflota.com" />
          </div>
          
          <div>
            <label for="password" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Contraseña</label>
            <input id="password" type="password" autocomplete="current-password" required v-model="password" :disabled="isLoading" class="appearance-none rounded-2xl block w-full px-4 py-3 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all text-sm disabled:opacity-50" placeholder="••••••••" />
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :disabled="isLoading" class="rounded border-slate-300 bg-slate-50 text-agro-500 focus:ring-agro-500" />
            <span>Recordar sesión</span>
          </label>
          <button type="button" @click="handleResetDemo" class="font-medium text-agro-600 hover:text-agro-500 cursor-pointer">¿Cuenta bloqueada? Reiniciar demo</button>
        </div>

        <div>
          <button type="submit" :disabled="isLoading" class="w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-2xl text-white bg-agro-500 hover:bg-agro-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-500 transition-all cursor-pointer shadow-lg shadow-agro-500/25 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isLoading">Iniciando sesión...</span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </div>
      </form>
      
      <!-- Footer details centered in card -->
      <div class="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-4 flex justify-between">
        <span>© 2026 AgroFlota</span>
        <span>Versión 1.0</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import loginBgField from '../assets/login_bg_field.png'
import api from '../services/api'
import { resetDemoData } from '../data/db'

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const resetMessage = ref('')
const isLoading = ref(false)

const demoCredentials = [
  { label: 'Administrador', email: 'admin@agroflota.com', password: 'admin123' },
  { label: 'Encargado de Mantenimiento', email: 'mantenimiento@agroflota.com', password: 'mant123' },
]

const fillDemo = (cred) => {
  email.value = cred.email
  password.value = cred.password
}

const handleResetDemo = () => {
  resetDemoData()
  email.value = ''
  password.value = ''
  errorMessage.value = ''
  resetMessage.value = 'Demo reiniciada. Los datos volvieron a su estado inicial.'
  setTimeout(() => { resetMessage.value = '' }, 4000)
}

const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true
  try {
    const data = await api.post('/login', {
      email: email.value,
      password: password.value
    })
    
    // Almacenar credenciales reales y redirigir
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    router.push('/')
  } catch (error) {
    if (error.errors && error.errors.email) {
      errorMessage.value = error.errors.email[0]
    } else {
      errorMessage.value = error.message || 'Error de conexión con el servidor.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
