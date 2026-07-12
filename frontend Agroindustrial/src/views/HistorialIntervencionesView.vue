<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
    
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <h1 class="text-3xl font-bold text-agro-900 tracking-tight">Historial de Intervenciones</h1>
        <p class="text-sm text-slate-500 mt-1">Hoja de vida clínica y trazabilidad cronológica de mantenimiento de activos</p>
      </div>
    </div>

    <!-- Machinery Selector & Resumen Panel Split Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Selector Card (5 cols) -->
      <div class="lg:col-span-5 bg-white border border-agro-100 rounded-3xl p-6 shadow-sm space-y-6 text-left">
        <div class="space-y-4">
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Seleccionar Maquinaria Agrícola</label>
          <div class="relative">
            <select v-model="selectedMachineCode" @change="onMachineSelect" class="appearance-none w-full pl-4 pr-10 py-3 border border-slate-200 bg-slate-50/50 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500 transition-all cursor-pointer">
              <option v-for="m in mockMachines" :key="m.code" :value="m.code">
                {{ m.code }} - {{ m.brand }} {{ m.model }}
              </option>
            </select>
            <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown class="w-4 h-4" />
            </span>
          </div>
        </div>

        <!-- Selected Asset Clinical metadata -->
        <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <h3 class="font-bold text-slate-800 text-sm">Resumen Clínico</h3>
            <span class="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
              {{ activeMachine.code }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
            <div>
              <span class="text-slate-400 block">Categoría:</span>
              <span class="font-bold text-slate-700">{{ activeMachine.category }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Horómetro Actual:</span>
              <span class="font-bold text-slate-800">{{ activeMachine.hours }} hrs</span>
            </div>
            <div class="col-span-2">
              <span class="text-slate-400 block">Número de Chasis (VIN):</span>
              <span class="font-mono font-semibold text-slate-700">{{ activeMachine.vin }}</span>
            </div>
            <div class="col-span-2 border-t border-slate-200/60 pt-3 flex justify-between items-center">
              <span class="text-slate-500 font-semibold">Gasto Total Acumulado:</span>
              <span class="text-sm font-extrabold text-agro-700">Bs {{ totalSpent }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chronological Timeline Card (7 cols) -->
      <div class="lg:col-span-7 bg-white border border-agro-100 rounded-3xl p-6 shadow-sm flex flex-col text-left">
        <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Línea de Tiempo de Intervenciones</h2>
        
        <!-- Timeline wrapper -->
        <div class="relative border-l-2 border-slate-100 pl-6 space-y-8 flex-1">
          
          <div v-for="log in selectedMachineHistory" :key="log.id" class="relative group">
            
            <!-- Timeline Bullet dot indicator -->
            <div class="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full bg-white border-2 border-agro-500 flex items-center justify-center shadow-sm">
              <span class="w-1.5 h-1.5 bg-agro-500 rounded-full"></span>
            </div>

            <!-- Log Node Card -->
            <div class="p-5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2">
                <div>
                  <span class="text-xs text-slate-400 font-semibold">{{ log.date }}</span>
                  <h4 class="font-bold text-slate-800 text-sm mt-0.5">{{ log.code }} - {{ log.taskTitle }}</h4>
                </div>
                <span class="text-xs font-bold text-agro-700 bg-agro-100/50 border border-agro-100/50 px-2.5 py-0.5 rounded-md self-start sm:self-center">
                  Bs {{ log.totalCost }}
                </span>
              </div>

              <!-- General specs -->
              <div class="grid grid-cols-2 gap-4 text-xs text-slate-500 py-3 leading-relaxed">
                <div>
                  <span class="text-slate-400">Responsable / Taller:</span>
                  <p class="font-semibold text-slate-700 mt-0.5">{{ log.mechanicName }}</p>
                </div>
                <div>
                  <span class="text-slate-400">Rango Horómetro:</span>
                  <p class="font-semibold text-slate-700 mt-0.5">{{ log.openHours }}h → {{ log.closeHours }}h</p>
                </div>
                <div class="col-span-2">
                  <span class="text-slate-400">Descripción de Trabajo:</span>
                  <p class="text-slate-600 mt-0.5">{{ log.description }}</p>
                </div>
              </div>

              <!-- Cost breakdown (derivado de la Orden de Trabajo cerrada) -->
              <div class="border-t border-slate-100/60 pt-3 flex justify-between text-[10px] text-slate-400">
                <span>Mano de Obra: Bs {{ log.laborCost }}</span>
                <span>Repuestos: Bs {{ log.partsCost }}</span>
              </div>

            </div>

          </div>

          <!-- Empty state timeline -->
          <div v-if="selectedMachineHistory.length === 0" class="py-8 text-center text-slate-400">
            <History class="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p class="font-semibold text-xs text-slate-500">Sin intervenciones técnicas cerradas</p>
            <p class="text-[10px] max-w-xs mx-auto mt-1">Este equipo no cuenta con órdenes de trabajo finalizadas en su registro histórico.</p>
          </div>

        </div>
      </div>
      
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ChevronDown, History } from '@lucide/vue'
import { getMaquinarias, getHistorialIntervenciones } from '../data/db'

const mockMachines = ref([])
const historicalInterventions = ref([])

const selectedMachineCode = ref('')

const reload = () => {
  mockMachines.value = getMaquinarias()
  historicalInterventions.value = getHistorialIntervenciones()
  if (!selectedMachineCode.value && mockMachines.value.length > 0) {
    selectedMachineCode.value = mockMachines.value[0].code
  }
}

onMounted(reload)

// Datos de la máquina actualmente seleccionada
const activeMachine = computed(() => {
  return mockMachines.value.find(m => m.code === selectedMachineCode.value) || {}
})

// Filtrado de intervenciones de esa máquina en orden cronológico inverso
const selectedMachineHistory = computed(() => {
  return historicalInterventions.value
    .filter(log => log.machineCode === selectedMachineCode.value)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

// Suma de gastos acumulados
const totalSpent = computed(() => {
  return selectedMachineHistory.value.reduce((acc, log) => acc + log.totalCost, 0)
})

const onMachineSelect = () => {}
</script>

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: max-height 0.25s ease-out, opacity 0.2s ease;
  max-height: 200px;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0px;
  opacity: 0;
}
</style>
