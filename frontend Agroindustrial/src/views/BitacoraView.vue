<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
    
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <h1 class="text-3xl font-bold text-agro-900 tracking-tight">Bitácora de Auditoría</h1>
        <p class="text-sm text-slate-500 mt-1">Historial clínico e inmutable de operaciones del sistema</p>
      </div>
      
      <!-- Inmutability badge info -->
      <div class="flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-100 px-4 py-2 rounded-xl text-xs font-medium">
        <ShieldAlert class="w-4 h-4 text-amber-600 shrink-0" />
        <span>Registro de solo lectura. Los datos no se pueden editar ni eliminar.</span>
      </div>
    </div>

    <!-- Search & Filters Bar -->
    <div class="bg-white rounded-2xl border border-agro-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="relative w-full md:max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search class="w-4 h-4" />
        </span>
        <input type="text" v-model="searchQuery" placeholder="Buscar por usuario, acción o IP..." class="pl-10 pr-4 py-2 w-full border border-slate-200 bg-slate-50/50 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" />
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <!-- Modulo Filter -->
        <div class="relative min-w-[150px] flex-1 md:flex-none">
          <select v-model="filterModule" class="appearance-none w-full pl-3 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
            <option value="">Todos los Módulos</option>
            <option value="Configuración">Configuración</option>
            <option value="Flota Agrícola">Flota Agrícola</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Reportes">Reportes</option>
          </select>
          <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown class="w-4 h-4" />
          </span>
        </div>

        <!-- Accion Type Filter -->
        <div class="relative min-w-[150px] flex-1 md:flex-none">
          <select v-model="filterType" class="appearance-none w-full pl-3 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
            <option value="">Todas las Acciones</option>
            <option value="Creación">Creación</option>
            <option value="Edición">Edición</option>
            <option value="Inhabilitación">Inhabilitación</option>
            <option value="Inicio de Sesión">Inicio de Sesión</option>
          </select>
          <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown class="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>

    <!-- Audit Logs Table -->
    <div class="bg-white rounded-2xl border border-agro-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-left">
          <thead class="bg-slate-50/75 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Fecha y Hora</th>
              <th class="px-6 py-4">Usuario</th>
              <th class="px-6 py-4">Módulo</th>
              <th class="px-6 py-4">Operación</th>
              <th class="px-6 py-4">Detalle Acción</th>
              <th class="px-6 py-4">Dirección IP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            <tr v-for="log in filteredLogs" :key="log.id" @click="viewDetails(log)" class="hover:bg-slate-50/50 transition-colors cursor-pointer group">
              
              <!-- Date Column -->
              <td class="px-6 py-4 whitespace-nowrap text-slate-500 text-xs font-semibold">
                {{ log.dateTime }}
              </td>
              
              <!-- User Info Column -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                    {{ getInitials(log.userName) }}
                  </div>
                  <div>
                    <p class="font-medium text-slate-800">{{ log.userName }}</p>
                    <p class="text-[10px] text-slate-400">{{ log.userRole }}</p>
                  </div>
                </div>
              </td>
              
              <!-- Module Column -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                      :class="getModuleStyles(log.module)">
                  {{ log.module }}
                </span>
              </td>
              
              <!-- Operation Type Column -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                      :class="getTypeStyles(log.type)">
                  {{ log.type }}
                </span>
              </td>
              
              <!-- Action Description Column -->
              <td class="px-6 py-4 text-slate-600 max-w-xs truncate group-hover:text-agro-600 transition-colors">
                {{ log.action }}
              </td>
              
              <!-- IP / Browser Column -->
              <td class="px-6 py-4 whitespace-nowrap text-slate-400 text-xs">
                {{ log.ip }}
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredLogs.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                <div class="flex flex-col items-center gap-2">
                  <History class="w-8 h-8 text-slate-300" />
                  <p class="font-medium text-slate-500">No se encontraron registros de auditoría</p>
                  <p class="text-xs">Ajuste los filtros o el término de búsqueda.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Side Panel / Details Drawer -->
    <transition name="drawer">
      <div v-if="isDrawerOpen" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" @click="closeDrawer"></div>
        
        <!-- Drawer Container -->
        <div class="bg-white w-full max-w-md h-full shadow-2xl relative z-10 flex flex-col justify-between border-l border-slate-100 animate-slide-in">
          
          <!-- Header -->
          <div class="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold text-agro-600 uppercase tracking-widest">Metadatos de Auditoría</span>
              <h3 class="font-bold text-slate-800 text-lg mt-1">Detalle del Registro</h3>
            </div>
            <button @click="closeDrawer" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 flex-1 overflow-y-auto space-y-6 text-left">
            <!-- Basic Data Grid -->
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID Auditoría</p>
                  <p class="text-sm font-semibold text-slate-700 mt-1">AUD-000{{ selectedLog.id }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha y Hora</p>
                  <p class="text-sm font-semibold text-slate-700 mt-1">{{ selectedLog.dateTime }}</p>
                </div>
              </div>

              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Módulo Afectado</p>
                <p class="text-sm mt-1">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                        :class="getModuleStyles(selectedLog.module)">
                    {{ selectedLog.module }}
                  </span>
                </p>
              </div>
            </div>

            <!-- User details card -->
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usuario Responsable</p>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                  {{ getInitials(selectedLog.userName || '') }}
                </div>
                <div>
                  <p class="text-sm font-bold text-slate-800">{{ selectedLog.userName }}</p>
                  <p class="text-xs text-slate-500">{{ selectedLog.userRole }}</p>
                </div>
              </div>
            </div>

            <!-- Action details -->
            <div class="space-y-3">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acción Realizada</p>
              <div class="p-4 bg-agro-50/30 border border-agro-100 rounded-2xl">
                <p class="text-sm text-slate-800 font-medium leading-relaxed">
                  {{ selectedLog.action }}
                </p>
              </div>
            </div>

            <!-- Technical specs -->
            <div class="space-y-3 border-t border-slate-100 pt-4">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detalles Técnicos</p>
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-slate-400">Dirección IP:</span>
                  <p class="font-semibold text-slate-700 mt-0.5">{{ selectedLog.ip }}</p>
                </div>
                <div>
                  <span class="text-slate-400">Sistema / Navegador:</span>
                  <p class="font-semibold text-slate-700 mt-0.5">{{ selectedLog.device }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer (Status indicator, no action buttons as it is read-only) -->
          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span class="text-xs text-slate-400">Estado de Operación:</span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-100 text-emerald-800">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Exitoso
            </span>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, ChevronDown, ShieldAlert, History, X } from '@lucide/vue'
import api from '../services/api'

// Historial de auditoría obtenido desde la API
const auditLogs = ref([])

const loadAuditLogs = async () => {
  try {
    auditLogs.value = await api.get('/audit-logs')
  } catch (error) {
    console.error('Error al cargar la bitácora:', error)
  }
}

onMounted(loadAuditLogs)

// Variables reactivas de búsqueda y filtros
const searchQuery = ref('')
const filterModule = ref('')
const filterType = ref('')

// Control del panel de detalles lateral
const isDrawerOpen = ref(false)
const selectedLog = ref({})

const viewDetails = (log) => {
  selectedLog.value = log
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}

// Iniciales para Avatar
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Estilos dinámicos para Módulos
const getModuleStyles = (module) => {
  if (module === 'Configuración') return 'bg-agro-50 text-agro-700 border-agro-100'
  if (module === 'Flota Agrícola') return 'bg-amber-50 text-amber-700 border-amber-100'
  if (module === 'Mantenimiento') return 'bg-blue-50 text-blue-700 border-blue-100'
  return 'bg-purple-50 text-purple-700 border-purple-100' // Reportes
}

// Estilos dinámicos para tipos de acción
const getTypeStyles = (type) => {
  if (type === 'Creación') return 'bg-emerald-50 text-emerald-800 border-emerald-100'
  if (type === 'Edición') return 'bg-amber-50 text-amber-800 border-amber-100'
  if (type === 'Inhabilitación') return 'bg-rose-50 text-rose-800 border-rose-100'
  return 'bg-slate-50 text-slate-700 border-slate-200' // Inicio de Sesión
}

// Filtrado de logs en base a queries y filtros
const filteredLogs = computed(() => {
  return auditLogs.value.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          log.ip.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesModule = filterModule.value === '' || log.module === filterModule.value
    const matchesType = filterType.value === '' || log.type === filterType.value
    return matchesSearch && matchesModule && matchesType
  })
})
</script>

<style scoped>
/* Transiciones para el Drawer lateral */
.drawer-enter-active, .drawer-leave-active {
  transition: opacity 0.3s ease;
}
.drawer-enter-from, .drawer-leave-to {
  opacity: 0;
}

.animate-slide-in {
  animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
