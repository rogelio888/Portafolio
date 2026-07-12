<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApiSimLogStore } from '../stores/apiSimLog';

const log = useApiSimLogStore();
onMounted(() => log.ensureSubscribed());

const expandedId = ref<string | null>(null);
const activeTab = ref('request');

const TABS = [
  { key: 'request', label: 'Request' },
  { key: 'code', label: 'Backend' },
  { key: 'sql', label: 'SQL' },
  { key: 'response', label: 'Response' },
];

const METHOD_CLASS: Record<string, string> = {
  GET: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  POST: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  PUT: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  PATCH: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  DELETE: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

function methodClass(method: string) {
  return METHOD_CLASS[method] || 'bg-slate-500/15 text-slate-300 border-slate-500/30';
}

function relativeTime(iso: string) {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 5) return 'ahora';
  if (diffSec < 60) return `hace ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin}m`;
  return `hace ${Math.floor(diffMin / 60)}h`;
}

function toggleExpand(event: { id: string }) {
  expandedId.value = expandedId.value === event.id ? null : event.id;
  activeTab.value = 'request';
}
</script>

<template>
  <button
    @click="log.toggle()"
    class="fixed bottom-5 right-5 z-[9998] flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 px-4 py-3 transition-all cursor-pointer print:hidden"
    title="Consola de simulación API"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <span class="text-sm font-semibold">API</span>
    <span v-if="log.events.length > 0" class="flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-white text-violet-700 text-xs font-bold">
      {{ log.events.length }}
    </span>
  </button>

  <div v-if="log.isOpen" class="fixed inset-0 z-[9999] flex justify-end print:hidden">
    <div class="absolute inset-0 bg-slate-950/40" @click="log.toggle()"></div>
    <div class="relative w-full max-w-md h-full bg-slate-950 text-slate-100 border-l border-white/10 flex flex-col shadow-2xl">
      <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <h3 class="font-semibold text-sm">Consola API Simulada</h3>
          <p class="text-[11px] text-slate-400">Peticiones que el backend real habría recibido</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="log.clear()" class="text-[11px] px-2 py-1 rounded border border-white/10 text-slate-300 hover:bg-white/5 cursor-pointer">Limpiar</button>
          <button @click="log.toggle()" class="text-slate-400 hover:text-white p-1 cursor-pointer">✕</button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto divide-y divide-white/5">
        <p v-if="log.events.length === 0" class="text-xs text-slate-500 p-4">
          Aún no hay actividad. Interactúa con la app (busca un estudiante, registra un pago...) para ver aquí las peticiones simuladas.
        </p>
        <div v-for="event in log.events" :key="event.id" class="px-4 py-3">
          <button class="w-full flex items-center gap-2 text-left cursor-pointer" @click="toggleExpand(event)">
            <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border" :class="methodClass(event.method)">{{ event.method }}</span>
            <span class="flex-1 min-w-0">
              <span class="block text-xs font-mono text-slate-200 truncate">{{ event.route }}</span>
              <span class="block text-[11px] text-slate-500 truncate">{{ event.operationLabel }}</span>
            </span>
            <span class="text-[10px] text-slate-500 whitespace-nowrap">{{ relativeTime(event.timestamp) }}</span>
          </button>

          <div v-if="expandedId === event.id" class="mt-3 rounded-md border border-white/10 bg-black/30">
            <div class="flex text-[11px] border-b border-white/10">
              <button
                v-for="tab in TABS"
                :key="tab.key"
                @click="activeTab = tab.key"
                class="flex-1 py-1.5 cursor-pointer"
                :class="activeTab === tab.key ? 'text-violet-400' : 'text-slate-500'"
              >
                {{ tab.label }}
              </button>
            </div>
            <div class="p-3 max-h-64 overflow-auto">
              <pre v-if="activeTab === 'request'" class="text-[11px] font-mono text-slate-300 whitespace-pre-wrap">{{ event.method }} {{ event.route }}
Status: {{ event.statusCode }} · {{ event.durationMs }}ms
{{ event.requestBody ? JSON.stringify(event.requestBody, null, 2) : '(sin cuerpo)' }}</pre>
              <pre v-else-if="activeTab === 'code'" class="text-[11px] font-mono text-emerald-300 whitespace-pre-wrap">{{ event.controllerCode }}</pre>
              <pre v-else-if="activeTab === 'sql'" class="text-[11px] font-mono text-sky-300 whitespace-pre-wrap">{{ event.sqlQuery }}</pre>
              <pre v-else class="text-[11px] font-mono text-amber-200 whitespace-pre-wrap">{{ JSON.stringify(event.responseBody, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
