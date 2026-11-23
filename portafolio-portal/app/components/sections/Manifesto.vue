<script setup lang="ts">
import { ShieldCheck, Zap, Layers, Sparkles, Check } from 'lucide-vue-next'

const principles = [
  {
    num: '01',
    title: 'CERO PLANTILLAS NI CÓDIGO GENÉRICO',
    desc: 'Cada interfaz se diseña desde la arquitectura hacia afuera. Evito los patrones prefabricados de IA para entregar identidades visuales memorables y estructuradas.',
    icon: Sparkles,
    tag: 'DIRECCIÓN DE ARTE'
  },
  {
    num: '02',
    title: 'OFFLINE-FIRST & REACTIVIDAD LOCAL',
    desc: 'Las aplicaciones gestionan estados locales eficientes (IndexedDB / Pinia / Supabase Cache). El usuario interactúa instantáneamente sin depender de la lentitud de red.',
    icon: Zap,
    tag: 'LATENCIA CERO'
  },
  {
    num: '03',
    title: 'MOTION DESIGN CON PROPÓSITO',
    desc: 'Bajo los estándares de Emil Kowalski y Apple Design: transiciones bajo 300ms, resortes con amortiguación real y respuesta física táctil que nunca interrumpe el flujo.',
    icon: Layers,
    tag: 'SUB-300MS PHYSICS'
  },
  {
    num: '04',
    title: 'SEGURIDAD & ROBUSTEZ ENTERPRISE',
    desc: 'Consultas parametrizadas, control estricto de roles (RBAC), validación en servidor y sanitización contra inyecciones XSS / SQLi.',
    icon: ShieldCheck,
    tag: 'ZERO-TRUST SECURITY'
  }
]
</script>

<template>
  <section id="filosofia" class="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 lg:py-28 select-none">
    
    <div class="mb-14 border-b border-neutral-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 text-[10px] font-mono text-[#ff5722] font-bold uppercase tracking-widest mb-1">
          <span>CAPÍTULO 03</span>
          <span class="text-neutral-600">//</span>
          <span class="text-neutral-300">ESTÁNDARES DE INGENIERÍA</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-white uppercase font-display tracking-tight">
          Filosofía de Construcción
        </h2>
      </div>
      <p class="text-xs font-mono text-neutral-400 max-w-sm">
        Lo que diferencia un proyecto artesanal de calidad de una plantilla desechable.
      </p>
    </div>

    <!-- 4 Blueprint Cards in Asymmetrical Comic Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="p in principles" 
        :key="p.num"
        class="comic-panel p-6 bg-[#0c0e16] border border-neutral-700/80 shadow-ink flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between border-b border-neutral-800 pb-2.5 mb-4 font-mono text-[10px]">
            <span class="text-[#ff5722] font-bold">{{ p.num }} // {{ p.tag }}</span>
            <div class="w-1.5 h-1.5 bg-neutral-600"></div>
          </div>

          <h3 class="text-lg font-black text-white uppercase font-display mb-3 leading-tight">
            {{ p.title }}
          </h3>

          <p class="text-xs text-neutral-300 font-sans leading-relaxed">
            {{ p.desc }}
          </p>
        </div>

        <div class="mt-6 pt-3 border-t border-neutral-800/80 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
          <Check class="w-3.5 h-3.5" />
          <span>ESTÁNDAR ACTIVO</span>
        </div>
      </div>
    </div>

  </section>
</template>
