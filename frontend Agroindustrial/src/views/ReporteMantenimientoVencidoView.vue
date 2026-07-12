<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans print:p-0 print:max-w-full">
    
    <!-- Toast Notification -->
    <transition name="fade">
      <div v-if="toast.show" class="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg border text-sm font-semibold transition-all"
           :class="toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'">
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4 print:border-b-0">
      <div>
        <h1 class="text-3xl font-bold text-agro-900 tracking-tight">Reporte de Mantenimiento Vencido</h1>
        <p class="text-sm text-slate-500 mt-1">Monitoreo crítico de activos que superaron sus límites de servicio y carecen de órdenes de trabajo activas</p>
      </div>
      <div class="print:hidden">
        <button @click="printReport" class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-agro-600 hover:bg-agro-500 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-agro-600/10 active:scale-98">
          <Printer class="w-4 h-4" />
          <span>Imprimir / PDF</span>
        </button>
      </div>
    </div>

    <!-- Fleet Risk Banner Alert -->
    <div class="bg-rose-50 border border-rose-100 p-5 rounded-3xl flex items-start gap-4 text-left">
      <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
        <AlertOctagon class="w-5 h-5" />
      </div>
      <div class="space-y-1">
        <h4 class="font-bold text-rose-900 text-sm">Alerta de Seguridad Mecánica e Inactividad Operativa</h4>
        <p class="text-xs text-rose-700 leading-relaxed">
          Las maquinarias listadas a continuación han excedido el rango de horas límite recomendado para sus servicios preventivos de fábrica y **no registran una Orden de Trabajo abierta**. Se recomienda emitir órdenes inmediatas para mitigar el riesgo de avería severa.
        </p>
      </div>
    </div>

    <!-- Search & Filters Bar (Hidden in Print) -->
    <div class="bg-white rounded-2xl border border-agro-100 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden">
      <div class="relative w-full sm:max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search class="w-4 h-4" />
        </span>
        <input type="text" v-model="searchQuery" placeholder="Buscar por maquinaria, código o tarea..." class="pl-10 pr-4 py-2 w-full border border-slate-200 bg-slate-50/50 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agro-500 focus:border-transparent transition-all" />
      </div>

      <div class="relative min-w-[170px] w-full sm:w-auto">
        <select v-model="filterCategory" class="appearance-none w-full pl-3 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
          <option value="">Todas las Categorías</option>
          <option value="Tractores">Tractores</option>
          <option value="Cosechadoras">Cosechadoras</option>
          <option value="Fumigadoras">Fumigadoras</option>
        </select>
        <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown class="w-4 h-4" />
        </span>
      </div>
    </div>

    <!-- KPI Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
      <!-- Total Risk Count -->
      <div class="bg-white border border-agro-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
          <Truck class="w-5 h-5" />
        </div>
        <div>
          <span class="text-xs text-slate-400 font-semibold">Equipos en Riesgo</span>
          <h3 class="text-2xl font-extrabold text-slate-850">{{ filteredItems.length }} Activos</h3>
        </div>
      </div>
      <!-- Max Overdue Hours -->
      <div class="bg-white border border-agro-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <span class="text-xs text-slate-400 font-semibold">Retraso Máximo</span>
          <h3 class="text-2xl font-extrabold text-slate-850">{{ maxOverdue }} hrs</h3>
        </div>
      </div>
      <!-- Critical Task Count -->
      <div class="bg-white border border-agro-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
          <Wrench class="w-5 h-5" />
        </div>
        <div>
          <span class="text-xs text-slate-400 font-semibold">Servicios Críticos</span>
          <h3 class="text-2xl font-extrabold text-slate-850">{{ filteredItems.length }} Pendientes</h3>
        </div>
      </div>
    </div>

    <!-- Overdue Table Grid -->
    <div class="bg-white rounded-2xl border border-agro-100 shadow-sm overflow-hidden text-left">
      <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 class="font-bold text-slate-800 text-sm">Resumen de Criticidad Operativa</h3>
        <span class="text-[10px] font-bold text-rose-600 uppercase tracking-widest bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
          Filtro: Sin OT Abierta
        </span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100">
          <thead class="bg-slate-50/75 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Código Activo</th>
              <th class="px-6 py-4">Maquinaria</th>
              <th class="px-6 py-4">Categoría</th>
              <th class="px-6 py-4 text-center">Horómetro Actual</th>
              <th class="px-6 py-4 text-center">Límite Servicio</th>
              <th class="px-6 py-4 text-center">Exceso de Uso</th>
              <th class="px-6 py-4">Servicio Atrasado</th>
              <th class="px-6 py-4">Estado Alerta</th>
              <th class="px-6 py-4 text-center print:hidden">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-rose-50/20 transition-colors">
              <!-- Code -->
              <td class="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-800">
                {{ item.code }}
              </td>
              <!-- Machinery -->
              <td class="px-6 py-4 whitespace-nowrap font-semibold text-slate-850">
                {{ item.brand }} {{ item.model }}
              </td>
              <!-- Category -->
              <td class="px-6 py-4 text-xs text-slate-600">
                {{ item.category }}
              </td>
              <!-- Current Hours -->
              <td class="px-6 py-4 text-center whitespace-nowrap font-bold text-slate-800">
                {{ item.hours }} hrs
              </td>
              <!-- Limit Hours -->
              <td class="px-6 py-4 text-center whitespace-nowrap text-slate-500">
                {{ item.limitHours }} hrs
              </td>
              <!-- Exceed Hours -->
              <td class="px-6 py-4 text-center whitespace-nowrap font-extrabold text-rose-600">
                +{{ item.hours - item.limitHours }} hrs
              </td>
              <!-- Overdue task -->
              <td class="px-6 py-4 text-slate-600 text-xs">
                {{ item.taskName }}
              </td>
              <!-- Danger Status Badge -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100 animate-pulse">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Crítico / Sin OT
                </span>
              </td>
              <!-- Action triggers (Hidden in Print) -->
              <td class="px-6 py-4 whitespace-nowrap text-center print:hidden">
                <button @click="openQuickOrderModal(item)" class="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all cursor-pointer shadow-sm active:scale-98">
                  <FilePlus class="w-3.5 h-3.5" />
                  <span>Emitir OT</span>
                </button>
              </td>
            </tr>

            <tr v-if="filteredItems.length === 0">
              <td colspan="9" class="px-6 py-12 text-center text-slate-400">
                <div class="flex flex-col items-center gap-2 max-w-sm mx-auto">
                  <CheckCircle2 class="w-8 h-8 text-emerald-500" />
                  <p class="font-semibold text-slate-600">¡Flota Segura y Al Día!</p>
                  <p class="text-xs">No hay maquinarias que superen sus límites de servicio sin contar con una orden de trabajo abierta.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Emit OT Modal -->
    <transition name="modal">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" @click="closeModal"></div>
        
        <!-- Card -->
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 class="font-bold text-slate-800 text-lg">Emitir Orden de Trabajo Urgente</h3>
            <button @click="closeModal" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <form @submit.prevent="saveQuickOrder" class="p-6 space-y-4 text-left">
            <!-- Machine Detail Header -->
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <p class="text-[9px] font-bold text-slate-400 uppercase">Activo Crítico</p>
              <p class="text-xs font-bold text-slate-700">{{ form.code }} - {{ form.brand }} {{ form.model }}</p>
              <p class="text-[10px] text-rose-600 font-semibold mt-1">Servicio: {{ form.taskName }}</p>
            </div>

            <!-- Mechanic Selection (HU8) -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Asignar Mecánico / Taller Externo</label>
              <div class="relative">
                <select required v-model="form.mechanicId" class="appearance-none w-full pl-4 pr-10 py-2.5 border border-slate-200 bg-white rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
                  <option value="" disabled>Seleccione un responsable</option>
                  <option v-for="mech in mockMechanics" :key="mech.id" :value="mech.id">
                    {{ mech.name }} ({{ mech.specialty }})
                  </option>
                </select>
                <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown class="w-4 h-4" />
                </span>
              </div>
            </div>

            <!-- Program Date -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fecha Programada para el Servicio</label>
              <input type="date" required v-model="form.scheduledDate" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" />
            </div>

            <!-- Budget (in Bs) -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Presupuesto Estimado (Bs)</label>
              <input type="number" required v-model="form.estimatedCost" min="1" class="px-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all" placeholder="Ej. 1200" />
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button type="button" @click="closeModal" class="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-center">
                Cancelar
              </button>
              <button type="submit" class="flex-1 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all cursor-pointer text-center shadow-md shadow-rose-600/10">
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
import { Printer, AlertOctagon, Search, ChevronDown, CheckCircle2, X, FilePlus, Truck, Clock, Wrench } from '@lucide/vue'
import { getMaquinariaVencida, getMecanicos, crearOrdenTrabajo } from '../data/db'

const overdueFleet = ref([])
const mockMechanics = ref([])

const reload = () => {
  overdueFleet.value = getMaquinariaVencida()
  mockMechanics.value = getMecanicos()
}

onMounted(reload)

const searchQuery = ref('')
const filterCategory = ref('')

// Modales y formularios
const isModalOpen = ref(false)
const form = reactive({
  id: null,
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

// Filtrado de equipos vencidos y sin orden abierta (Criterio de Aceptación)
const filteredItems = computed(() => {
  return overdueFleet.value.filter(item => {
    // REGLA DE NEGOCIO: Excedió el límite Y no tiene orden abierta
    const isOverdue = item.hours > item.limitHours
    const matchesOverdueRule = isOverdue && !item.hasOpenOrder
    
    const matchesSearch = item.code.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          item.brand.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          item.model.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          item.taskName.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesCategory = filterCategory.value === '' || item.category === filterCategory.value
    
    return matchesOverdueRule && matchesSearch && matchesCategory
  })
})

// Retraso Máximo de Flota
const maxOverdue = computed(() => {
  if (filteredItems.value.length === 0) return 0
  const overdues = filteredItems.value.map(item => item.hours - item.limitHours)
  return Math.max(...overdues)
})

// Abrir emisión rápida de orden
const openQuickOrderModal = (item) => {
  form.id = item.id
  form.code = item.code
  form.brand = item.brand
  form.model = item.model
  form.taskName = item.taskName
  form.mechanicId = ''
  form.scheduledDate = new Date().toISOString().split('T')[0]
  form.estimatedCost = ''
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// Confirmar Emisión de Orden real: crea la OT (queda "Abierta"), lo que
// automáticamente saca al equipo de este reporte en el próximo reload.
const saveQuickOrder = () => {
  if (!form.mechanicId || !form.scheduledDate || !form.estimatedCost) {
    showToast('Complete todos los campos de la orden', 'error')
    return
  }

  const mech = mockMechanics.value.find(m => m.id === Number(form.mechanicId))
  const mechName = mech ? mech.name : 'Mecánico Externo'

  const created = crearOrdenTrabajo({
    machineCode: form.code,
    mechanicId: Number(form.mechanicId),
    taskDescription: form.taskName,
    laborCost: parseFloat(form.estimatedCost)
  })
  reload()

  showToast(`Orden ${created.code} de emergencia emitida para ${form.code}, asignada a ${mechName} por Bs ${form.estimatedCost}. Equipo en reparación.`, 'success')

  closeModal()
}

const printReport = () => {
  window.print()
}
</script>

<style scoped>
@media print {
  body {
    background-color: white !important;
    color: black !important;
  }
  .print\:hidden {
    display: none !important;
  }
  .print\:p-0 {
    padding: 0 !important;
  }
  .print\:max-w-full {
    max-width: 100% !important;
    width: 100% !important;
  }
  .print\:border-b-0 {
    border-bottom: 0 !important;
  }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
