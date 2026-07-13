<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from '../api/axios'; // Asumiendo que el cliente axios configurado está aquí
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditLog {
  id: number;
  created_at: string;
  user?: { name: string, roles?: { name: string }[] };
  action: string;
  module: string;
  description: string;
}

const registros = ref<AuditLog[]>([]);
const total = ref(0);
const perPage = ref(20);
const currentPage = ref(1);
const lastPage = ref(1);

const search = ref('');
const startDate = ref('');
const endDate = ref('');
const isLoading = ref(false);

const fetchLogs = async (page = 1) => {
  isLoading.value = true;
  try {
    const params: any = { page };
    if (search.value) params.search = search.value;
    if (startDate.value) params.start_date = startDate.value;
    if (endDate.value) params.end_date = endDate.value;

    const response = await axios.get('/audit-logs', { params });
    registros.value = response.data.data;
    total.value = response.data.total;
    perPage.value = response.data.per_page;
    currentPage.value = response.data.current_page;
    lastPage.value = response.data.last_page;
  } catch (error) {
    console.error("Error fetching audit logs:", error);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), "dd MMM yyyy, HH:mm", { locale: es });
};

const applyFilters = () => {
  fetchLogs(1);
};

onMounted(() => {
  fetchLogs();
});
</script>

<template>
  <div class="animate-fade-in max-w-6xl mx-auto space-y-6">
    
    <!-- Filtros de Búsqueda -->
    <div class="bg-white p-5 border border-slate-200 rounded-sm shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-end">
      
      <div class="space-y-1.5 flex-1 w-full">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide">Buscar Usuario / Acción</label>
        <div class="relative w-full">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input type="text" v-model="search" @keyup.enter="applyFilters" placeholder="Ej. Ana Vargas, o 'Cobro en efectivo'" class="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
        </div>
      </div>

      <div class="space-y-1.5 w-full md:w-48">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide">Fecha Inicial</label>
        <input type="date" v-model="startDate" class="w-full px-3 py-2.5 border border-slate-300 rounded-sm text-sm text-slate-600 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
      </div>
      
      <div class="space-y-1.5 w-full md:w-48">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide">Fecha Final</label>
        <input type="date" v-model="endDate" class="w-full px-3 py-2.5 border border-slate-300 rounded-sm text-sm text-slate-600 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
      </div>

      <button @click="applyFilters" :disabled="isLoading" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-sm transition-colors text-sm flex items-center justify-center gap-2 md:w-auto w-full disabled:opacity-50">
        <svg v-if="isLoading" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        Filtrar
      </button>

    </div>

    <!-- Tabla de Bitácora -->
    <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden relative">
      <!-- Indicador de solo lectura -->
      <div class="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase px-3 py-1 border-b border-l border-slate-200 rounded-bl-sm z-10 flex items-center gap-1">
        <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        <span class="hidden sm:inline">Registro Inalterable (Solo Lectura)</span>
        <span class="sm:hidden">Solo Lectura</span>
      </div>

      <div class="overflow-x-auto w-full mt-7 sm:mt-2">
        <table class="w-full text-left text-sm text-slate-600 min-w-[800px]">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-700">
          <tr>
            <th class="px-6 py-4">Fecha y Hora</th>
            <th class="px-6 py-4">Usuario</th>
            <th class="px-6 py-4">Módulo</th>
            <th class="px-6 py-4">Acción Registrada</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-mono text-xs relative">
          <template v-if="isLoading && registros.length === 0">
            <tr v-for="i in 5" :key="'skel-'+i" class="animate-pulse bg-white border-b border-slate-100">
              <td class="px-6 py-4">
                <div class="h-4 bg-slate-200 rounded-sm w-3/4"></div>
              </td>
              <td class="px-6 py-4">
                <div class="h-4 bg-slate-200 rounded-sm w-full mb-2"></div>
                <div class="h-3 bg-slate-100 rounded-sm w-1/2"></div>
              </td>
              <td class="px-6 py-4">
                <div class="h-5 bg-slate-200 rounded-sm w-20"></div>
              </td>
              <td class="px-6 py-4">
                <div class="h-4 bg-slate-200 rounded-sm w-full mb-2"></div>
                <div class="h-3 bg-slate-100 rounded-sm w-5/6"></div>
              </td>
            </tr>
          </template>
          <tr v-if="!isLoading && registros.length === 0">
            <td colspan="4" class="px-6 py-8 text-center text-slate-500 font-sans">No se encontraron registros de bitácora que coincidan con la búsqueda.</td>
          </tr>
          <tr v-for="log in registros" :key="log.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-slate-500">
              {{ formatDate(log.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="font-bold text-slate-800 font-sans">{{ log.user?.name || 'Sistema' }}</span>
              <span class="block text-[10px] text-slate-400 font-sans uppercase">{{ log.user?.roles?.[0]?.name || 'Auto' }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2 py-0.5 rounded-sm font-sans font-bold bg-slate-100 border border-slate-200 text-slate-700">
                {{ log.module || 'General' }}
              </span>
            </td>
            <td class="px-6 py-4 text-slate-700">
              <span class="font-bold">{{ log.action }}</span>
              <span class="block font-sans text-slate-500 text-xs mt-1" v-if="log.description">{{ log.description }}</span>
            </td>
          </tr>
        </tbody>
        </table>
      </div>
      
      <!-- Paginación Real -->
      <div class="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-xs text-slate-500 font-medium text-center sm:text-left">Mostrando página {{ currentPage }} de {{ lastPage }} ({{ total }} registros)</p>
        <div class="flex gap-1" v-if="lastPage > 1">
          <button @click="fetchLogs(currentPage - 1)" :disabled="currentPage === 1" class="px-3 py-1 border border-slate-200 bg-white text-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-slate-50 rounded-sm">Anterior</button>
          
          <span class="px-3 py-1 border border-secondary bg-secondary text-white font-bold rounded-sm shadow-sm">{{ currentPage }}</span>
          
          <button @click="fetchLogs(currentPage + 1)" :disabled="currentPage === lastPage" class="px-3 py-1 border border-slate-200 bg-white text-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-slate-50 rounded-sm">Siguiente</button>
        </div>
      </div>
    </div>

  </div>
</template>
