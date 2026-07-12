<template>
  <div v-if="$route.name === 'login'" class="min-h-screen bg-earth-50">
    <router-view />
  </div>
  <div v-else class="h-screen flex overflow-hidden bg-agro-50 font-sans text-slate-800">
    <!-- Sidebar Navigation -->
    <aside class="w-64 h-full bg-agro-900 text-agro-100 flex flex-col shrink-0 border-r border-agro-800/50">
      <!-- Sidebar Header -->
      <div class="h-16 flex items-center px-6 border-b border-agro-800/50 gap-3">
        <div class="w-8 h-8 rounded-lg bg-agro-500 flex items-center justify-center shadow-md shadow-agro-500/20">
          <Tractor class="w-5 h-5 text-white" />
        </div>
        <span class="text-xl font-bold bg-gradient-to-r from-emerald-400 to-agro-200 bg-clip-text text-transparent">AgroFlota</span>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-dark">
        <!-- Dashboard / General -->
        <div class="space-y-1">
          <router-link to="/" class="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-agro-850 hover:text-agro-100 transition-colors text-agro-200" active-class="bg-agro-800/50 text-white font-semibold border-l-2 border-emerald-400">
            <LayoutDashboard class="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Panel de Control</span>
          </router-link>
        </div>

        <!-- Grupo Flota -->
        <div v-if="hasPermission('maquinaria') || hasPermission('clasificaciones') || hasPermission('fichas') || hasPermission('mecanicos')">
          <h3 class="text-[10px] font-bold text-agro-500 uppercase tracking-wider px-3 mb-2">Flota Agrícola</h3>
          <ul class="space-y-1">
            <li v-if="hasPermission('maquinaria')">
              <router-link to="/maquinarias" class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-agro-850 hover:text-agro-100 transition-colors text-agro-200" active-class="bg-agro-800/50 text-white font-semibold border-l-2 border-emerald-400">
                <Tractor class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Inventario Maquinaria</span>
              </router-link>
            </li>
            <li v-if="hasPermission('clasificaciones')">
              <router-link to="/clasificaciones" class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-agro-850 hover:text-agro-100 transition-colors text-agro-200" active-class="bg-agro-800/50 text-white font-semibold border-l-2 border-emerald-400">
                <LayoutGrid class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Clasificación Equipos</span>
              </router-link>
            </li>
            <li v-if="hasPermission('fichas')">
              <router-link to="/fichas-tecnicas" class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-agro-850 hover:text-agro-100 transition-colors text-agro-200" active-class="bg-agro-800/50 text-white font-semibold border-l-2 border-emerald-400">
                <FileText class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Fichas Técnicas</span>
              </router-link>
            </li>
            <li v-if="hasPermission('mecanicos')">
              <router-link to="/mecanicos" class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-agro-850 hover:text-agro-100 transition-colors text-agro-200" active-class="bg-agro-800/50 text-white font-semibold border-l-2 border-emerald-400">
                <Wrench class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Mecánicos Externos</span>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Grupo Mantenimiento -->
        <div v-if="hasPermission('preventivos') || hasPermission('ordenes') || hasPermission('historial')">
          <h3 class="text-[10px] font-bold text-agro-500 uppercase tracking-wider px-3 mb-2">Control Mantenimiento</h3>
          <ul class="space-y-1">
            <li v-if="hasPermission('preventivos')">
              <router-link to="/mantenimiento-preventivo" class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-agro-850 hover:text-agro-100 transition-colors text-agro-200" active-class="bg-agro-800/50 text-white font-semibold border-l-2 border-emerald-400">
                <Calendar class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Planes Preventivos</span>
              </router-link>
            </li>
            <li v-if="hasPermission('ordenes')">
              <router-link to="/ordenes-trabajo" class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-agro-850 hover:text-agro-100 transition-colors text-agro-200" active-class="bg-agro-800/50 text-white font-semibold border-l-2 border-emerald-400">
                <ClipboardList class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Órdenes de Trabajo</span>
              </router-link>
            </li>
            <li v-if="hasPermission('historial')">
              <router-link to="/historial-intervenciones" class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-agro-850 hover:text-agro-100 transition-colors text-agro-200" active-class="bg-agro-800/50 text-white font-semibold border-l-2 border-emerald-400">
                <History class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Historial Clínico</span>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Grupo Reportes -->
        <div v-if="hasPermission('reporte_gasto') || hasPermission('reporte_vencido')">
          <h3 class="text-[10px] font-bold text-agro-500 uppercase tracking-wider px-3 mb-2">Indicadores y Reportes</h3>
          <ul class="space-y-1">
            <li v-if="hasPermission('reporte_gasto')">
              <router-link to="/reporte-gasto" class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-agro-850 hover:text-agro-100 transition-colors text-agro-200" active-class="bg-agro-800/50 text-white font-semibold border-l-2 border-emerald-400">
                <TrendingUp class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Reporte de Gasto</span>
              </router-link>
            </li>
            <li v-if="hasPermission('reporte_vencido')">
              <router-link to="/reporte-mantenimiento-vencido" class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-agro-850 hover:text-agro-100 transition-colors text-agro-200" active-class="bg-agro-800/50 text-white font-semibold border-l-2 border-emerald-400">
                <AlertTriangle class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Mantenimientos Vencidos</span>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Grupo Configuración -->
        <div v-if="hasPermission('usuarios') || hasPermission('roles') || hasPermission('bitacora')">
          <h3 class="text-[10px] font-bold text-agro-500 uppercase tracking-wider px-3 mb-2">Configuración</h3>
          <ul class="space-y-1">
            <li v-if="hasPermission('usuarios')">
              <router-link to="/usuarios" class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-agro-850 hover:text-agro-100 transition-colors text-agro-200" active-class="bg-agro-800/50 text-white font-semibold border-l-2 border-emerald-400">
                <Users class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Usuarios</span>
              </router-link>
            </li>
            <li v-if="hasPermission('roles')">
              <router-link to="/roles" class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-agro-850 hover:text-agro-100 transition-colors text-agro-200" active-class="bg-agro-800/50 text-white font-semibold border-l-2 border-emerald-400">
                <Shield class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Roles y Permisos</span>
              </router-link>
            </li>
            <li v-if="hasPermission('bitacora')">
              <router-link to="/bitacora" class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-agro-850 hover:text-agro-100 transition-colors text-agro-200" active-class="bg-agro-800/50 text-white font-semibold border-l-2 border-emerald-400">
                <ListTodo class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Bitácora</span>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>
      
      <!-- User Profile Footer -->
      <div class="h-16 border-t border-agro-800/50 p-4 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2 overflow-hidden">
          <div class="w-8 h-8 rounded-full bg-agro-500 text-white flex items-center justify-center font-bold shrink-0">
            {{ currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U' }}
          </div>
          <div class="overflow-hidden">
            <p class="font-semibold text-white truncate">{{ currentUser.name }}</p>
            <p class="text-[10px] text-agro-400 truncate">{{ currentUser.email }}</p>
          </div>
        </div>
        <button @click="handleLogout" class="text-agro-400 hover:text-rose-400 transition-colors shrink-0 cursor-pointer focus:outline-none" title="Cerrar Sesión">
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Navbar / Top Header -->
      <header class="h-16 bg-white border-b border-agro-100 px-6 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xs bg-agro-100 text-agro-700 px-2.5 py-1 rounded-md font-semibold">Región Montero</span>
          <span class="text-xs bg-earth-100 text-earth-600 px-2.5 py-1 rounded-md font-semibold">Santa Cruz</span>
        </div>
        
        <div class="flex items-center gap-4 text-xs">
          <div class="relative cursor-pointer text-slate-500 hover:text-agro-600 flex items-center gap-1.5 font-medium">
            <span class="w-2.5 h-2.5 bg-agro-500 rounded-full animate-pulse"></span>
            <span>Maquinaria Sincronizada</span>
          </div>
        </div>
      </header>

      <!-- Subview Content -->
      <main class="flex-1 overflow-y-auto bg-agro-50/20 scrollbar-light">
        <router-view />
      </main>
    </div>
  </div>
  <ApiSimConsole />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from './services/api'
import { setCurrentActor } from './data/db'
import ApiSimConsole from './components/ApiSimConsole.vue'
import {
  Tractor, 
  LayoutDashboard, 
  LayoutGrid, 
  FileText, 
  Wrench, 
  Calendar, 
  ClipboardList, 
  History, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Shield, 
  ListTodo, 
  LogOut 
} from '@lucide/vue'

const router = useRouter()
const route = useRoute()
const currentUser = ref({ name: 'Usuario', email: '', role: '', permissions: {} })

// Sincronizar datos de usuario y permisos
const syncUser = async () => {
  const userJson = localStorage.getItem('user')
  if (userJson) {
    try {
      currentUser.value = JSON.parse(userJson)
      setCurrentActor(currentUser.value)
    } catch (e) {
      // Ignore
    }
  }

  // Sincronizar perfil y permisos en tiempo real desde el backend si hay token
  if (localStorage.getItem('token')) {
    try {
      const freshUser = await api.get('/user')
      currentUser.value = freshUser
      localStorage.setItem('user', JSON.stringify(freshUser))
      setCurrentActor(freshUser)
    } catch (e) {
      console.error('Error syncing user profile:', e)
    }
  }
}

onMounted(syncUser)

// Sincronizar en cada cambio de ruta para reflejar cambios inmediatos tras login/logout
watch(() => route.path, syncUser)

// Helper para validar permisos
const hasPermission = (permissionKey) => {
  if (currentUser.value.role === 'Administrador') {
    return true
  }
  return !!currentUser.value.permissions?.[permissionKey]
}

const handleLogout = async () => {
  try {
    await api.post('/logout')
  } catch (error) {
    console.error('Error during backend logout:', error)
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentActor(null)
    router.push('/login')
  }
}
</script>

<style>
/* Base transition settings */
.router-link-active {
  transition: all 0.2s ease-in-out;
}
</style>
