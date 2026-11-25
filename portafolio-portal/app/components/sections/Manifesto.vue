<script setup lang="ts">
import { ref } from 'vue'
import { ShieldCheck, Zap, Layers, Cpu, CheckCircle } from 'lucide-vue-next'

const activeSlide = ref(0)
const trackRef = ref<HTMLElement | null>(null)

const pillars = [
  {
    num: '01',
    title: 'Arquitectura Modular',
    desc: 'Separación rigurosa de responsabilidades entre vistas reactivas, lógica de negocio y servicios de persistencia para facilitar mantenimiento y crecimiento.',
    icon: Layers,
    tag: 'Estructura'
  },
  {
    num: '02',
    title: 'Rendimiento y Carga Rápida',
    desc: 'Optimización de bundles, compresión de recursos multimedia en formato WebP y tiempos de respuesta inmediatos para retener usuarios.',
    icon: Zap,
    tag: 'Velocidad'
  },
  {
    num: '03',
    title: 'Persistencia Segura',
    desc: 'Bases de datos estructuradas con soporte para transacciones íntegras, persistencia local para navegación fluida y sincronización en la nube.',
    icon: Cpu,
    tag: 'Datos'
  },
  {
    num: '04',
    title: 'Seguridad y Control de Roles',
    desc: 'Autenticación fiable, control estricto de accesos según el perfil de usuario y validación de datos en servidor y cliente.',
    icon: ShieldCheck,
    tag: 'Seguridad'
  }
]

const onMobileScroll = () => {
  const el = trackRef.value
  if (!el) return
  const cardWidth = el.firstElementChild?.getBoundingClientRect().width || 280
  const idx = Math.round(el.scrollLeft / (cardWidth + 16))
  activeSlide.value = Math.min(Math.max(idx, 0), pillars.length - 1)
}
</script>

<template>
  <section id="enfoque" class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-20 lg:py-28">
    
    <div class="mb-7 sm:mb-14 border-b-2 border-slate-900 pb-5 sm:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
      <div>
        <div class="comic-caption mb-2 text-[10px] sm:text-xs select-none">
          <span>CAPÍTULO 03 // METODOLOGÍA</span>
        </div>
        <h2 class="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display uppercase tracking-tight">
          Enfoque de Desarrollo
        </h2>
      </div>
      <p class="text-xs sm:text-sm text-slate-700 font-medium max-w-sm">
        Prácticas y estándares técnicos aplicados a cada sistema para asegurar software robusto, escalable y mantenible.
      </p>
    </div>

    <!-- Mobile (< sm): Horizontal swipeable snap deck; Tablet/Desktop (sm+): 2-col / 4-col Grid -->
    <div 
      ref="trackRef"
      @scroll.passive="onMobileScroll"
      class="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0"
    >
      <div 
        v-for="p in pillars" 
        :key="p.num"
        class="snap-start w-[82vw] max-w-[300px] sm:w-auto sm:max-w-none shrink-0 comic-panel p-5 sm:p-6 bg-white flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between border-b-2 border-slate-900/10 pb-3 mb-4 select-none">
            <span class="comic-caption bg-blue-100 text-[10px]">{{ p.num }}</span>
            <span class="comic-pill text-[10px] font-bold uppercase">{{ p.tag }}</span>
          </div>

          <div class="w-10 h-10 rounded-xl bg-blue-50 border-2 border-slate-900 flex items-center justify-center text-blue-600 mb-3.5 shadow-[2px_2px_0px_#0f172a]">
            <component :is="p.icon" class="w-5 h-5" />
          </div>

          <h3 class="text-base sm:text-lg font-black text-slate-900 font-display mb-2 uppercase">
            {{ p.title }}
          </h3>

          <p class="text-xs text-slate-600 font-medium leading-relaxed">
            {{ p.desc }}
          </p>
        </div>

        <div class="mt-5 sm:mt-6 pt-3 border-t-2 border-slate-900/10 flex items-center gap-1.5 text-xs font-bold text-emerald-800 select-none">
          <CheckCircle class="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Estándar en cada entrega</span>
        </div>
      </div>
    </div>

    <!-- Mobile swipe indicator dots -->
    <div class="flex sm:hidden items-center justify-center gap-1.5 mt-4 select-none" aria-hidden="true">
      <span 
        v-for="(p, i) in pillars" 
        :key="'dot-' + p.num"
        class="h-1.5 rounded-full transition-all duration-200 border border-slate-900/40"
        :class="activeSlide === i ? 'w-6 bg-slate-900' : 'w-2 bg-slate-300'"
      ></span>
    </div>

  </section>
</template>
