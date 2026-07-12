<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import api from '../api/axios';

import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const isLoading = ref(true);
const activeTab = ref('dashboard');

const kpis = ref({ recaudadoMes: 0, morosidadPromedio: 0, pagosHoy: 0, metaMensual: 0 });
const chartData = ref<{ mes: string; valor: number; porcentaje: number }[]>([]);
const moraPorNivel = ref({ primaria: { monto: 0, porcentaje: 0 }, secundaria: { monto: 0, porcentaje: 0 } });

onMounted(async () => {
  if (authStore.userPermissions.includes('gestion_reportes') || authStore.userRoles.includes('Directora')) {
    await fetchReportes();
  }
  isLoading.value = false;
});

watch(() => authStore.userPermissions, async (newPerms) => {
  if (newPerms.includes('gestion_reportes')) {
    isLoading.value = true;
    await fetchReportes();
    isLoading.value = false;
  }
});

const fetchReportes = async () => {
  try {
    const response = await api.get('/reports/dashboard');
    kpis.value = {
      recaudadoMes: response.data.recaudadoMes,
      morosidadPromedio: response.data.morosidadPromedio,
      pagosHoy: response.data.pagosHoy,
      metaMensual: response.data.metaMensual,
    };
    chartData.value = response.data.chartData;
    moraPorNivel.value = response.data.moraPorNivel;
  } catch (error) {
    console.error("Error al cargar reportes", error);
  }
};


</script>

<template>
  <div class="relative">

    <div v-if="isLoading" class="max-w-6xl mx-auto mt-4">
      <SkeletonLoader :rows="5" />
    </div>

    <div v-else-if="authStore.userPermissions.includes('gestion_reportes') || authStore.userRoles.includes('Directora')" class="animate-fade-in space-y-6 max-w-6xl mx-auto">
      
      <!-- VISTA 1: DASHBOARD (HU18) -->
      <div v-if="activeTab === 'dashboard'" class="space-y-6 animate-fade-in">
        <!-- KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white border border-slate-200 rounded-sm p-5 border-l-4 border-l-secondary shadow-sm">
            <p class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Recaudación (Mes Actual)</p>
            <div class="flex items-end gap-2">
              <h3 class="text-2xl font-bold text-slate-800">Bs. {{ kpis.recaudadoMes.toLocaleString() }}</h3>
              <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm mb-1">{{ kpis.metaMensual ? Math.round((kpis.recaudadoMes / kpis.metaMensual) * 100) : 0 }}% Meta</span>
            </div>
          </div>
          <div class="bg-white border border-slate-200 rounded-sm p-5 border-l-4 border-l-rose-500 shadow-sm">
            <p class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Índice Global Morosidad</p>
            <div class="flex items-end gap-2">
              <h3 class="text-2xl font-bold text-slate-800">{{ kpis.morosidadPromedio }}%</h3>
              <span class="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-sm mb-1">Atención</span>
            </div>
          </div>
          <div class="bg-white border border-slate-200 rounded-sm p-5 border-l-4 border-l-slate-400 shadow-sm">
            <p class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Transacciones de Hoy</p>
            <div class="flex items-end gap-2">
              <h3 class="text-2xl font-bold text-slate-800">{{ kpis.pagosHoy }}</h3>
              <span class="text-xs font-medium text-slate-500 mb-1">recibos emitidos</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Gráfico de Ingresos -->
          <div class="lg:col-span-2 bg-white border border-slate-200 rounded-sm shadow-sm p-6">
            <h3 class="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              Evolución de Recaudación (Bs.)
            </h3>
            
            <div class="h-64 flex items-end gap-4 sm:gap-8 justify-around pt-6 border-b border-slate-200 relative pb-2">
              <!-- Grid lines -->
              <div class="absolute inset-0 flex flex-col justify-between pb-2 z-0">
                <div class="border-t border-slate-100 w-full"></div>
                <div class="border-t border-slate-100 w-full"></div>
                <div class="border-t border-slate-100 w-full"></div>
                <div class="border-t border-slate-100 w-full"></div>
              </div>
              
              <!-- Barras -->
              <div v-for="data in chartData" :key="data.mes" class="relative z-10 flex flex-col justify-end items-center w-full h-full group">
                <div class="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded-sm transition-opacity pointer-events-none whitespace-nowrap z-20">
                  Bs. {{ data.valor.toLocaleString() }}
                </div>
                <div class="w-12 sm:w-16 bg-primary rounded-t-sm transition-all duration-1000 ease-out relative overflow-hidden group-hover:bg-primary-dark cursor-default" :style="`height: ${data.porcentaje}%`">
                  <div class="absolute bottom-0 left-0 right-0 top-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <span class="text-xs font-bold text-slate-500 mt-3 shrink-0">{{ data.mes }}</span>
              </div>
            </div>
          </div>

          <!-- Distribución de Morosidad -->
          <div class="bg-white border border-slate-200 rounded-sm shadow-sm p-6">
            <h3 class="font-bold text-slate-800 mb-6">Mora por Niveles</h3>
            <div class="space-y-6">
              <div>
                <div class="flex justify-between text-xs mb-1 font-bold">
                  <span class="text-slate-600">Primaria</span>
                  <span class="text-rose-600">{{ moraPorNivel.primaria.porcentaje }}% (Bs. {{ moraPorNivel.primaria.monto.toLocaleString() }})</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5">
                  <div class="bg-rose-500 h-2.5 rounded-full" :style="`width: ${moraPorNivel.primaria.porcentaje}%`"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1 font-bold">
                  <span class="text-slate-600">Secundaria</span>
                  <span class="text-amber-500">{{ moraPorNivel.secundaria.porcentaje }}% (Bs. {{ moraPorNivel.secundaria.monto.toLocaleString() }})</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5">
                  <div class="bg-amber-400 h-2.5 rounded-full" :style="`width: ${moraPorNivel.secundaria.porcentaje}%`"></div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>


    </div>

    <!-- Si no tiene permisos -->
    <div v-else class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
      <div class="bg-white p-10 rounded-sm shadow-sm border border-slate-200 max-w-md">
        <svg class="w-16 h-16 text-primary mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">Bienvenido(a)</h2>
        <p class="text-slate-500 mb-6">Has iniciado sesión en el sistema. Utiliza el menú lateral para acceder a los módulos que tienes autorizados.</p>
      </div>
    </div>
  </div>
</template>
