<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans print:p-0 print:max-w-full">
    
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4 print:border-b-0">
      <div>
        <h1 class="text-3xl font-bold text-agro-900 tracking-tight">Reporte de Gastos por Equipo</h1>
        <p class="text-sm text-slate-500 mt-1">Análisis económico acumulado e inversión detallada en repuestos y mano de obra</p>
      </div>
      <div class="print:hidden">
        <button @click="printReport" class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-agro-600 hover:bg-agro-500 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-agro-600/10 active:scale-98">
          <Printer class="w-4 h-4" />
          <span>Imprimir / PDF</span>
        </button>
      </div>
    </div>

    <!-- Filters Bar (Hidden on print) -->
    <div class="bg-white rounded-2xl border border-agro-100 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden">
      <!-- Period Selector -->
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">Periodo:</span>
        <div class="relative w-full sm:w-48">
          <select v-model="filterPeriod" class="appearance-none w-full pl-3 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-agro-500 cursor-pointer">
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="all">Gestión 2026 (Todo)</option>
          </select>
          <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown class="w-4 h-4" />
          </span>
        </div>
      </div>

      <!-- Category Filter -->
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">Familia:</span>
        <div class="relative w-full sm:w-48">
          <select v-model="filterCategory" class="appearance-none w-full pl-3 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-agro-500 cursor-pointer">
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
    </div>

    <!-- Summary Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
      <!-- Total Spent -->
      <div class="bg-white border border-agro-100 p-5 rounded-2xl shadow-sm space-y-1">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gasto Total Acumulado</span>
        <h3 class="text-2xl font-extrabold text-slate-800">Bs {{ stats.total }}</h3>
        <p class="text-[10px] text-slate-400">Órdenes de trabajo cerradas</p>
      </div>
      <!-- Labor Spent -->
      <div class="bg-white border border-agro-100 p-5 rounded-2xl shadow-sm space-y-1">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inversión Mano de Obra</span>
        <h3 class="text-2xl font-extrabold text-slate-700">Bs {{ stats.labor }}</h3>
        <p class="text-[10px] text-emerald-600 font-semibold">{{ stats.laborPercent }}% del gasto total</p>
      </div>
      <!-- Spare Parts Spent -->
      <div class="bg-white border border-agro-100 p-5 rounded-2xl shadow-sm space-y-1">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inversión en Repuestos</span>
        <h3 class="text-2xl font-extrabold text-slate-700">Bs {{ stats.parts }}</h3>
        <p class="text-[10px] text-blue-600 font-semibold">{{ stats.partsPercent }}% del gasto total</p>
      </div>
      <!-- Critical Asset -->
      <div class="bg-white border border-agro-100 p-5 rounded-2xl shadow-sm space-y-1">
        <span class="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Equipo Mayor Gasto</span>
        <h3 class="text-2xl font-extrabold text-rose-700 truncate" :title="stats.criticalName">
          {{ stats.criticalName || 'Ninguno' }}
        </h3>
        <p class="text-[10px] text-slate-400">Acumulado: Bs {{ stats.criticalValue }}</p>
      </div>
    </div>

    <!-- SVG Charts Split Layout (Page Break in Print) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
      
      <!-- Chart 1: Bar Chart (Costo por Activo) -->
      <div class="bg-white border border-agro-100 rounded-3xl p-6 shadow-sm flex flex-col text-left">
        <h3 class="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">Inversión Técnica por Maquinaria</h3>
        <p class="text-xs text-slate-400 mb-6">Comparativa de costos totales de mantenimiento por código de activo (Bs)</p>
        
        <div class="relative h-64 w-full flex items-end">
          <!-- Custom SVG Bar Chart -->
          <svg class="w-full h-full" viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
            <!-- Gridlines -->
            <line x1="40" y1="30" x2="380" y2="30" stroke="#f1f5f9" stroke-width="1" />
            <line x1="40" y1="80" x2="380" y2="80" stroke="#f1f5f9" stroke-width="1" />
            <line x1="40" y1="130" x2="380" y2="130" stroke="#f1f5f9" stroke-width="1" />
            <line x1="40" y1="180" x2="380" y2="180" stroke="#cbd5e1" stroke-width="1" />

            <!-- Y Axis scale text -->
            <text x="5" y="34" font-size="8" fill="#94a3b8" font-family="sans-serif">Bs {{ maxScale }}</text>
            <text x="5" y="109" font-size="8" fill="#94a3b8" font-family="sans-serif">Bs {{ Math.round(maxScale / 2) }}</text>
            <text x="25" y="184" font-size="8" fill="#94a3b8" font-family="sans-serif">0</text>

            <!-- Bars -->
            <g v-for="(bar, idx) in chartBars" :key="idx"
               class="cursor-pointer group"
               @mouseenter="hoverBar = bar"
               @mouseleave="hoverBar = null">
              
              <!-- Transparent overlay for easier hover interaction -->
              <rect :x="50 + idx * 75" y="10" width="40" height="170" fill="transparent" />

              <!-- Bar rect -->
              <rect :x="55 + idx * 75" :y="180 - bar.height" width="30" :height="bar.height"
                    rx="6"
                    fill="#15803d"
                    class="transition-all duration-300 hover:fill-agro-500" />
              
              <!-- X Label -->
              <text :x="70 + idx * 75" y="195" font-size="8" font-weight="bold" fill="#64748b" font-family="sans-serif" text-anchor="middle">
                {{ bar.code }}
              </text>
            </g>
          </svg>

          <!-- Floating Tooltip -->
          <div v-if="hoverBar" class="absolute bg-slate-900 text-white text-[11px] p-2.5 rounded-xl shadow-xl border border-slate-800 z-10 space-y-0.5 pointer-events-none transition-all"
               :style="{ left: tooltipPos.x + 'px', bottom: tooltipPos.y + 'px' }">
            <p class="font-bold">{{ hoverBar.brand }} {{ hoverBar.model }}</p>
            <p class="text-slate-400">Total: <span class="text-emerald-400 font-extrabold">Bs {{ hoverBar.total }}</span></p>
            <p class="text-[9px] text-slate-400">(MO: Bs {{ hoverBar.labor }}, Rep: Bs {{ hoverBar.parts }})</p>
          </div>

        </div>

        <div v-if="chartBars.length === 0" class="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <p class="text-xs">Sin registros gráficos en este periodo.</p>
        </div>
      </div>

      <!-- Chart 2: Donut Chart (Estructura del Gasto) -->
      <div class="bg-white border border-agro-100 rounded-3xl p-6 shadow-sm flex flex-col text-left">
        <h3 class="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">Estructura Financiera del Gasto</h3>
        <p class="text-xs text-slate-400 mb-6">Distribución porcentual entre mano de obra (servicios técnicos) y compra de repuestos</p>
        
        <div class="flex flex-col sm:flex-row items-center justify-around gap-6 h-64">
          <!-- Donut SVG -->
          <div class="relative w-44 h-44 shrink-0" v-if="stats.total > 0">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <!-- Background Circle -->
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" stroke-width="14" />
              
              <!-- Segment 1: Mano de Obra (Green/Emerald) -->
              <circle cx="50" cy="50" r="40" fill="transparent" 
                      stroke="#10b981" 
                      stroke-width="14"
                      :stroke-dasharray="donutDasharray.labor"
                      stroke-dashoffset="0" />
              
              <!-- Segment 2: Repuestos (Blue) -->
              <circle cx="50" cy="50" r="40" fill="transparent" 
                      stroke="#3b82f6" 
                      stroke-width="14"
                      :stroke-dasharray="donutDasharray.parts"
                      :stroke-dashoffset="donutDasharray.partsOffset" />
            </svg>
            <!-- Center Stats text -->
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Invertido</span>
              <span class="text-sm font-extrabold text-slate-800">Bs {{ stats.total }}</span>
            </div>
          </div>

          <!-- Legends and stats breakdown -->
          <div class="space-y-4 w-full sm:w-auto">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 bg-emerald-500 rounded-lg shrink-0"></div>
              <div class="text-xs text-left">
                <p class="font-bold text-slate-700">Mano de Obra (Bs {{ stats.labor }})</p>
                <p class="text-slate-400 text-[10px]">{{ stats.laborPercent }}% del presupuesto total</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 bg-blue-500 rounded-lg shrink-0"></div>
              <div class="text-xs text-left">
                <p class="font-bold text-slate-700">Adquisición Repuestos (Bs {{ stats.parts }})</p>
                <p class="text-slate-400 text-[10px]">{{ stats.partsPercent }}% del presupuesto total</p>
              </div>
            </div>
            
            <div v-if="stats.total === 0" class="text-xs text-slate-400">
              No hay gastos registrados en el periodo seleccionado.
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Consolidated Data Table -->
    <div class="bg-white rounded-2xl border border-agro-100 shadow-sm overflow-hidden text-left">
      <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 class="font-bold text-slate-800 text-sm">Resumen Analítico Consolidado</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100">
          <thead class="bg-slate-50/75 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Código Activo</th>
              <th class="px-6 py-4">Maquinaria</th>
              <th class="px-6 py-4">Categoría</th>
              <th class="px-6 py-4 text-center">Intervenciones Cerradas</th>
              <th class="px-6 py-4 text-right">Mano de Obra</th>
              <th class="px-6 py-4 text-right">Repuestos</th>
              <th class="px-6 py-4 text-right bg-slate-50 font-bold">Total Invertido</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            <tr v-for="item in tableRows" :key="item.code" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4 font-mono font-bold text-slate-800">{{ item.code }}</td>
              <td class="px-6 py-4 font-semibold text-slate-850">{{ item.brand }} {{ item.model }}</td>
              <td class="px-6 py-4 text-xs text-slate-600">{{ item.category }}</td>
              <td class="px-6 py-4 text-center font-bold text-slate-600">{{ item.count }}</td>
              <td class="px-6 py-4 text-right text-slate-500">Bs {{ item.labor }}</td>
              <td class="px-6 py-4 text-right text-slate-500">Bs {{ item.parts }}</td>
              <td class="px-6 py-4 text-right font-extrabold text-slate-900 bg-slate-50/40">Bs {{ item.total }}</td>
            </tr>
            <tr v-if="tableRows.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                No hay registros financieros en este periodo con los filtros seleccionados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Printer, ChevronDown } from '@lucide/vue'
import { getReporteGasto } from '../data/db'

// Historial completo de órdenes de trabajo cerradas (con fecha para filtrado por periodos)
const historicalOrders = ref([])

onMounted(() => {
  historicalOrders.value = getReporteGasto()
})

const filterPeriod = ref('all') // "30", "90", "all"
const filterCategory = ref('')

// Tooltip para el gráfico de barras
const hoverBar = ref(null)
const tooltipPos = computed(() => {
  if (!hoverBar.value) return { x: 0, y: 0 }
  // Calculamos una posición aproximada en base al índice
  const idx = chartBars.value.findIndex(b => b.code === hoverBar.value.code)
  return {
    x: 40 + idx * 75,
    y: hoverBar.value.height + 25
  }
})

// Filtrado de las órdenes según periodo y categoría
const filteredOrders = computed(() => {
  const referenceDate = new Date()

  return historicalOrders.value.filter(o => {
    // 1. Filtrar por fecha
    if (filterPeriod.value !== 'all') {
      const days = parseInt(filterPeriod.value)
      const orderDate = new Date(o.date)
      const diffTime = Math.abs(referenceDate - orderDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > days) return false
    }

    // 2. Filtrar por categoría
    if (filterCategory.value !== '' && o.category !== filterCategory.value) {
      return false
    }

    return true
  })
})

// Agrupación por máquina para la tabla y gráficos
const tableRows = computed(() => {
  const groups = {}
  
  filteredOrders.value.forEach(o => {
    if (!groups[o.machineCode]) {
      groups[o.machineCode] = {
        code: o.machineCode,
        brand: o.brand,
        model: o.model,
        category: o.category,
        count: 0,
        labor: 0,
        parts: 0,
        total: 0
      }
    }
    groups[o.machineCode].count++
    groups[o.machineCode].labor += o.laborCost
    groups[o.machineCode].parts += o.partsCost
    groups[o.machineCode].total += (o.laborCost + o.partsCost)
  })

  // Retornamos ordenado de mayor a menor costo total
  return Object.values(groups).sort((a, b) => b.total - a.total)
})

// Estadísticas Consolidadas (KPI Cards)
const stats = computed(() => {
  let total = 0
  let labor = 0
  let parts = 0
  
  tableRows.value.forEach(r => {
    total += r.total
    labor += r.labor
    parts += r.parts
  })

  // Obtener equipo crítico
  const critical = tableRows.value[0] || {}

  const laborPercent = total > 0 ? Math.round((labor / total) * 100) : 0
  const partsPercent = total > 0 ? Math.round((parts / total) * 100) : 0

  return {
    total,
    labor,
    parts,
    laborPercent,
    partsPercent,
    criticalName: critical.code ? `${critical.brand} ${critical.model}` : '',
    criticalValue: critical.total || 0
  }
})

// Escala del gráfico de barras
const maxScale = computed(() => {
  const maxVal = tableRows.value.length > 0 ? tableRows.value[0].total : 1000
  // Redondear al siguiente millar
  return Math.ceil(maxVal / 1000) * 1000
})

// Alturas y coordenadas de las barras del gráfico SVG
const chartBars = computed(() => {
  return tableRows.value.slice(0, 4).map(r => {
    // Calculamos el alto de la barra (máximo 150px de SVG)
    const height = maxScale.value > 0 ? (r.total / maxScale.value) * 150 : 0
    return {
      code: r.code,
      brand: r.brand,
      model: r.model,
      total: r.total,
      labor: r.labor,
      parts: r.parts,
      height
    }
  })
})

// Cálculo de la circunferencia del Donut SVG (C = 2 * PI * r = 2 * 3.14159 * 40 = 251.3)
const donutDasharray = computed(() => {
  const circumference = 251.327
  const laborPct = stats.value.laborPercent
  const partsPct = stats.value.partsPercent

  const laborStroke = (laborPct / 100) * circumference
  const partsStroke = (partsPct / 100) * circumference

  return {
    labor: `${laborStroke} ${circumference - laborStroke}`,
    parts: `${partsStroke} ${circumference - partsStroke}`,
    partsOffset: -laborStroke
  }
})

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
  .print\:grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
  }
}
</style>
