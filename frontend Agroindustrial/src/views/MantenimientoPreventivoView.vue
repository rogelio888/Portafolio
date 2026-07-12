<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
    
    <!-- Toast Notification -->
    <transition name="fade">
      <div v-if="toast.show" class="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg border text-sm font-semibold transition-all"
           :class="toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'">
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <h1 class="text-3xl font-bold text-agro-900 tracking-tight">Mantenimiento Preventivo</h1>
        <p class="text-sm text-slate-500 mt-1">Monitoreo de horómetros en tiempo real y alertas de servicio tipo semáforo</p>
      </div>
    </div>

    <!-- Counters Dashboard Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total -->
      <div class="bg-white border border-agro-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 text-left">
        <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
          <ClipboardList class="w-5 h-5" />
        </div>
        <div>
          <span class="text-xs text-slate-400 font-medium">Alertas Totales</span>
          <h3 class="text-2xl font-bold text-slate-800">{{ preventives.length }} Planes</h3>
        </div>
      </div>
      <!-- Vencidos (Rojo) -->
      <div class="bg-white border border-agro-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 text-left">
        <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div>
          <span class="text-xs text-slate-400 font-medium">Servicios Vencidos</span>
          <h3 class="text-2xl font-bold text-rose-700">{{ countStatus('Vencido') }} Alertas</h3>
        </div>
      </div>
      <!-- Próximos (Amarillo) -->
      <div class="bg-white border border-agro-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 text-left">
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <span class="text-xs text-slate-400 font-medium">Próximos a Vencer</span>
          <h3 class="text-2xl font-bold text-amber-700">{{ countStatus('Próximo') }} Alertas</h3>
        </div>
      </div>
      <!-- Al Día (Verde) -->
      <div class="bg-white border border-agro-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 text-left">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
          <CheckCircle2 class="w-5 h-5" />
        </div>
        <div>
          <span class="text-xs text-slate-400 font-medium">Equipos Al Día</span>
          <h3 class="text-2xl font-bold text-emerald-700">{{ countStatus('Al Día') }} Planes</h3>
        </div>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white rounded-2xl border border-agro-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="relative w-full md:max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search class="w-4 h-4" />
        </span>
        <input type="text" v-model="searchQuery" placeholder="Buscar por código, maquinaria o tarea..." class="pl-10 pr-4 py-2 w-full border border-slate-200 bg-slate-50/50 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" />
      </div>

      <div class="relative min-w-[170px] w-full md:w-auto">
        <select v-model="filterStatus" class="appearance-none w-full pl-3 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
          <option value="">Todos los Estados</option>
          <option value="Vencido">Semáforo Rojo (Vencido)</option>
          <option value="Próximo">Semáforo Amarillo (Próximo)</option>
          <option value="Al Día">Semáforo Verde (Al Día)</option>
        </select>
        <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown class="w-4 h-4" />
        </span>
      </div>
    </div>

    <!-- Preventive Plan Alerts Table -->
    <div class="bg-white rounded-2xl border border-agro-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-left">
          <thead class="bg-slate-50/75 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Código Activo</th>
              <th class="px-6 py-4">Maquinaria</th>
              <th class="px-6 py-4">Tarea de Servicio</th>
              <th class="px-6 py-4 text-center">Límite Servicio</th>
              <th class="px-6 py-4 text-center">Horómetro Actual</th>
              <th class="px-6 py-4 text-center">Desviación / Resto</th>
              <th class="px-6 py-4">Semáforo</th>
              <th class="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            <tr v-for="item in filteredPreventives" :key="item.id" class="hover:bg-slate-50/50 transition-colors">
              
              <!-- Code -->
              <td class="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-800">
                {{ item.code }}
              </td>
              
              <!-- Machinery Name -->
              <td class="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">
                {{ item.brand }} {{ item.model }}
              </td>
              
              <!-- Task -->
              <td class="px-6 py-4 text-slate-600">
                {{ item.taskName }}
              </td>
              
              <!-- Service Limit -->
              <td class="px-6 py-4 whitespace-nowrap text-center font-semibold text-slate-600">
                {{ item.limitHours }} hrs
              </td>
              
              <!-- Current Horometer -->
              <td class="px-6 py-4 whitespace-nowrap text-center font-bold text-slate-800">
                {{ item.hours }} hrs
              </td>
              
              <!-- Hours Deviation -->
              <td class="px-6 py-4 whitespace-nowrap text-center font-semibold"
                  :class="getDeviationStyles(item)">
                {{ formatDeviation(item) }}
              </td>
              
              <!-- Semaphore badge alert -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                      :class="getBadgeStyles(item.alertStatus)">
                  <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="getBulletStyles(item.alertStatus)"></span>
                  {{ item.alertStatus }}
                </span>
              </td>
              
              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center gap-2">
                  <button @click="openHorometerModal(item)" class="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 hover:text-agro-600 hover:bg-agro-50 rounded-xl transition-all cursor-pointer" title="Actualizar Horómetro">
                    <RefreshCw class="w-3.5 h-3.5" />
                    <span>Horómetro</span>
                  </button>
                  <button @click="openScheduleModal(item)" class="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-agro-600 hover:bg-agro-500 text-white rounded-xl transition-all cursor-pointer shadow-sm shadow-agro-600/5 active:scale-98" title="Programar Orden de Trabajo">
                    <ClipboardPlus class="w-3.5 h-3.5" />
                    <span>Programar OT</span>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredPreventives.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-slate-400">
                <div class="flex flex-col items-center gap-2">
                  <Search class="w-8 h-8 text-slate-300" />
                  <p class="font-medium text-slate-500">No se encontraron alertas de mantenimiento preventivo</p>
                  <p class="text-xs">Prueba ajustando los filtros o el término de búsqueda.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal "Actualizar Horómetro" -->
    <transition name="modal">
      <div v-if="isHorometerModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" @click="closeHorometerModal"></div>
        
        <!-- Card -->
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 class="font-bold text-slate-800 text-lg">Actualizar Horómetro</h3>
            <button @click="closeHorometerModal" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <form @submit.prevent="saveHorometer" class="p-6 space-y-4 text-left">
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activo Seleccionado</p>
              <p class="text-sm font-bold text-slate-800 mt-1">
                {{ horometerForm.code }} - {{ horometerForm.brand }} {{ horometerForm.model }}
              </p>
            </div>
            
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Lectura del Horómetro Actual (Horas)</label>
              <input type="number" required v-model="horometerForm.hours" min="0" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all font-semibold" placeholder="Ej. 270" />
              <p class="text-[10px] text-slate-400 mt-1">Se actualizará en todas las alertas asociadas a esta máquina.</p>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button type="button" @click="closeHorometerModal" class="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-center">
                Cancelar
              </button>
              <button type="submit" class="flex-1 py-2.5 text-sm font-semibold text-white bg-agro-600 hover:bg-agro-500 rounded-xl transition-all cursor-pointer text-center shadow-md shadow-agro-600/10">
                Guardar Horas
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Modal "Programar Orden de Trabajo (OT)" -->
    <transition name="modal">
      <div v-if="isScheduleModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" @click="closeScheduleModal"></div>
        
        <!-- Card -->
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 class="font-bold text-slate-800 text-lg">Programar Orden de Trabajo</h3>
            <button @click="closeScheduleModal" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <form @submit.prevent="saveWorkOrder" class="p-6 space-y-4 text-left">
            
            <!-- Target Asset & Task -->
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Maquinaria</p>
                <p class="text-xs font-bold text-slate-700 mt-0.5">{{ scheduleForm.code }} - {{ scheduleForm.brand }} {{ scheduleForm.model }}</p>
              </div>
              <div>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tarea Pendiente</p>
                <p class="text-xs font-semibold text-slate-700 mt-0.5">{{ scheduleForm.taskName }}</p>
              </div>
            </div>

            <!-- Mechanic dropdown select -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Taller o Mecánico Externo</label>
              <div class="relative">
                <select required v-model="scheduleForm.mechanicId" class="appearance-none w-full pl-4 pr-10 py-2.5 border border-slate-200 bg-white rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
                  <option value="" disabled>Seleccione un taller</option>
                  <option v-for="mech in mockMechanics" :key="mech.id" :value="mech.id">
                    {{ mech.name }} ({{ mech.specialty }})
                  </option>
                </select>
                <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown class="w-4 h-4" />
                </span>
              </div>
            </div>

            <!-- Date input -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fecha Programada para Servicio</label>
              <input type="date" required v-model="scheduleForm.scheduledDate" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" />
            </div>

            <!-- Budget estimate -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Presupuesto Estimado (Bs)</label>
              <input type="number" required v-model="scheduleForm.estimatedCost" min="1" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. 150" />
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button type="button" @click="closeScheduleModal" class="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-center">
                Cancelar
              </button>
              <button type="submit" class="flex-1 py-2.5 text-sm font-semibold text-white bg-agro-600 hover:bg-agro-500 rounded-xl transition-all cursor-pointer text-center shadow-md shadow-agro-600/10">
                Emitir Orden
              </button>
            </div>

          </form>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, ClipboardList, AlertTriangle, Clock, CheckCircle2, ChevronDown, X, RefreshCw, ClipboardPlus } from '@lucide/vue'
import { getAlertasPreventivas, getMecanicos, actualizarHorometroManual, crearOrdenTrabajo } from '../data/db'

const preventives = ref([])
const mockMechanics = ref([])

const reload = () => {
  preventives.value = getAlertasPreventivas()
  mockMechanics.value = getMecanicos()
}

onMounted(reload)

const searchQuery = ref('')
const filterStatus = ref('')

// Modales reactivos
const isHorometerModalOpen = ref(false)
const isScheduleModalOpen = ref(false)

const horometerForm = reactive({
  code: '',
  brand: '',
  model: '',
  hours: ''
})

const scheduleForm = reactive({
  code: '',
  brand: '',
  model: '',
  taskName: '',
  mechanicId: '',
  scheduledDate: '',
  estimatedCost: ''
})

// Sistema de Toasts
const toast = reactive({
  show: false,
  message: '',
  type: 'success'
})

const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

// Filtro por Estado/Semáforo (el estado ya viene calculado desde el repositorio)
const filteredPreventives = computed(() => {
  return preventives.value.filter(p => {
    const matchesSearch = p.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          p.model.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          p.taskName.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = filterStatus.value === '' || p.alertStatus === filterStatus.value

    return matchesSearch && matchesStatus
  })
})

const countStatus = (statusName) => {
  return preventives.value.filter(p => p.alertStatus === statusName).length
}

// Estilos del Semáforo
const getBadgeStyles = (status) => {
  if (status === 'Vencido') return 'bg-rose-50 text-rose-700 border-rose-100'
  if (status === 'Próximo') return 'bg-amber-50 text-amber-700 border-amber-100'
  return 'bg-emerald-50 text-emerald-700 border-emerald-100' // Al Día
}

const getBulletStyles = (status) => {
  if (status === 'Vencido') return 'bg-rose-500'
  if (status === 'Próximo') return 'bg-amber-500'
  return 'bg-emerald-500'
}

// Desviación Matemática
const formatDeviation = (item) => {
  const diff = item.limitHours - item.hours
  if (diff <= 0) {
    return `Vencido por ${Math.abs(diff)}h`
  }
  return `Restan ${diff}h`
}

const getDeviationStyles = (item) => {
  const diff = item.limitHours - item.hours
  if (diff <= 0) return 'text-rose-600'
  if (diff <= 25) return 'text-amber-600 font-bold'
  return 'text-slate-500'
}

// Abrir/Cerrar Modal Horómetro
const openHorometerModal = (item) => {
  horometerForm.code = item.code
  horometerForm.brand = item.brand
  horometerForm.model = item.model
  horometerForm.hours = item.hours
  isHorometerModalOpen.value = true
}

const closeHorometerModal = () => {
  isHorometerModalOpen.value = false
}

// Guardar Horómetro y Recalcular
const saveHorometer = () => {
  if (horometerForm.hours === '') {
    showToast('Ingrese un valor de horómetro válido', 'error')
    return
  }

  actualizarHorometroManual(horometerForm.code, parseFloat(horometerForm.hours))
  reload()
  showToast(`Horómetro de ${horometerForm.code} actualizado a ${horometerForm.hours} hrs. Alertas recalculadas.`, 'success')
  closeHorometerModal()
}

// Abrir/Cerrar Modal Orden de Trabajo
const openScheduleModal = (item) => {
  scheduleForm.code = item.code
  scheduleForm.brand = item.brand
  scheduleForm.model = item.model
  scheduleForm.taskName = item.taskName
  scheduleForm.mechanicId = ''
  scheduleForm.scheduledDate = new Date().toISOString().split('T')[0]
  scheduleForm.estimatedCost = ''
  isScheduleModalOpen.value = true
}

const closeScheduleModal = () => {
  isScheduleModalOpen.value = false
}

// Emitir la Orden de Trabajo real (queda "Abierta" en el módulo de Órdenes de Trabajo)
const saveWorkOrder = () => {
  if (!scheduleForm.mechanicId || !scheduleForm.scheduledDate || !scheduleForm.estimatedCost) {
    showToast('Complete todos los campos del servicio técnico', 'error')
    return
  }

  const mech = mockMechanics.value.find(m => m.id === Number(scheduleForm.mechanicId))
  const mechName = mech ? mech.name : 'Taller Externo'

  const created = crearOrdenTrabajo({
    machineCode: scheduleForm.code,
    mechanicId: Number(scheduleForm.mechanicId),
    taskDescription: scheduleForm.taskName,
    laborCost: parseFloat(scheduleForm.estimatedCost)
  })

  showToast(`Orden ${created.code} emitida para ${scheduleForm.code}, asignada a ${mechName} por Bs ${scheduleForm.estimatedCost}.`, 'success')
  closeScheduleModal()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
