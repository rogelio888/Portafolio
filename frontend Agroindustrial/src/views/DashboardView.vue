<template>
  <div class="p-6 max-w-7xl mx-auto space-y-8 font-sans">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-agro-900 tracking-tight">Panel de Control</h1>
        <p class="text-sm text-slate-500 mt-1">Resumen de mantenimiento y horómetros de la flota - AgroFlota</p>
      </div>
      <div class="flex items-center gap-2">
        <router-link to="/ordenes-trabajo" class="px-4 py-2.5 text-sm font-semibold bg-agro-600 hover:bg-agro-500 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-agro-600/10">
          Registrar Orden de Trabajo
        </router-link>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-2xl border border-agro-100 p-6 shadow-sm flex items-center gap-4 hover:border-agro-200 transition-all">
        <div class="w-12 h-12 rounded-xl bg-agro-50 flex items-center justify-center text-agro-600 border border-agro-100">
          <Tractor class="w-6 h-6" />
        </div>
        <div>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Flota Total</p>
          <h3 class="text-2xl font-bold text-agro-900">{{ stats.total }} Equipos</h3>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-agro-100 p-6 shadow-sm flex items-center gap-4 hover:border-agro-200 transition-all">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
          <Leaf class="w-6 h-6" />
        </div>
        <div>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Activos en Campo</p>
          <h3 class="text-2xl font-bold text-agro-900">{{ stats.operativas }} Equipos</h3>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-agro-100 p-6 shadow-sm flex items-center gap-4 hover:border-agro-200 transition-all">
        <div class="w-12 h-12 rounded-xl bg-earth-100/50 flex items-center justify-center text-earth-500 border border-earth-100">
          <Wrench class="w-6 h-6" />
        </div>
        <div>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">En Taller Externo</p>
          <h3 class="text-2xl font-bold text-agro-900">{{ stats.enMantenimiento }} Equipos</h3>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-agro-100 p-6 shadow-sm flex items-center gap-4 hover:border-agro-200 transition-all">
        <div class="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-mechanic-danger border border-rose-150">
          <AlertTriangle class="w-6 h-6" />
        </div>
        <div>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Servicios Vencidos</p>
          <h3 class="text-2xl font-bold text-mechanic-danger">{{ stats.alertasVencidas }} Alertas</h3>
        </div>
      </div>
    </div>


    <!-- Quick access / Info grids -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Mantenimientos Preventivos Próximos -->
      <div class="bg-white rounded-2xl border border-agro-100 p-6 shadow-sm lg:col-span-2 space-y-4">
        <div class="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 class="text-lg font-bold text-agro-900 flex items-center gap-2">
            <span>Estado de Servicios Preventivos</span>
          </h3>
          <router-link to="/mantenimiento-preventivo" class="text-xs text-agro-600 hover:text-agro-700 font-semibold">Ver Todo</router-link>
        </div>
        
        <div class="divide-y divide-slate-100">
          <div v-for="alert in stats.alertas" :key="alert.id" class="py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full" :class="alert.alertStatus === 'Vencido' ? 'bg-mechanic-danger animate-pulse' : 'bg-mechanic-alert'"></span>
              <div>
                <p class="text-sm font-semibold text-slate-800">{{ alert.brand }} {{ alert.model }} ({{ alert.code }})</p>
                <p class="text-xs text-slate-500">Servicio: {{ alert.taskName }} (Límite: {{ alert.limitHours }}h | Actual: {{ alert.hours }}h)</p>
              </div>
            </div>
            <span v-if="alert.alertStatus === 'Vencido'" class="text-xs font-bold text-mechanic-danger bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
              Vencido ({{ alert.hours - alert.limitHours }}h)
            </span>
            <span v-else class="text-xs font-bold text-mechanic-alert bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
              Por Vencer ({{ alert.limitHours - alert.hours }}h)
            </span>
          </div>

          <div v-if="stats.alertas.length === 0" class="py-8 text-center text-slate-400 text-sm">
            No hay servicios vencidos ni próximos a vencer.
          </div>
        </div>
      </div>

      <!-- Mecánicos y Talleres Destacados -->
      <div class="bg-white rounded-2xl border border-agro-100 p-6 shadow-sm space-y-4">
        <div class="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 class="text-lg font-bold text-agro-900">Talleres Externos</h3>

          <router-link to="/mecanicos" class="text-xs text-agro-600 hover:text-agro-700 font-semibold">Directorio</router-link>
        </div>

        <div class="space-y-3">
          <div v-for="mech in mechanics.slice(0, 4)" :key="mech.id" class="p-4 bg-agro-50/50 rounded-2xl flex items-center justify-between border border-agro-100/50">
            <div>
              <h4 class="text-sm font-semibold text-agro-900">{{ mech.name }}</h4>
              <p class="text-xs text-slate-500">Especialidad: {{ mech.specialty }}</p>
            </div>
            <span class="text-[10px] bg-agro-100 text-agro-700 px-2.5 py-1 rounded-full font-bold">
              {{ mech.available ? 'Disponible' : 'Asignado' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Tractor, Leaf, Wrench, AlertTriangle } from '@lucide/vue'
import { getDashboardStats, getMecanicos } from '../data/db'

const stats = ref({ total: 0, operativas: 0, enMantenimiento: 0, alertasVencidas: 0, tallesActivos: 0, alertas: [] })
const mechanics = ref([])

onMounted(() => {
  stats.value = getDashboardStats()
  mechanics.value = getMecanicos()
})
</script>
