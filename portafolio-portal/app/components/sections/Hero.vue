<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ArrowDown, MessageSquare, Layers, Sparkles, CheckCircle2 } from 'lucide-vue-next'

const scrollY = ref(0)
let ticking = false

const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      scrollY.value = window.scrollY
      ticking = false
    })
    ticking = true
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Scroll progress from 0 to 600px
const scrollProgress = computed(() => {
  return Math.min(Math.max(scrollY.value / 500, 0), 1)
})

// 3D Scroll-Driven Transform for Comic Panel Deck
const panel1Style = computed(() => {
  const p = scrollProgress.value
  const rotate = -3 + p * 8 // -3deg to 5deg
  const x = p * 40
  const y = p * -20
  return {
    transform: `rotate(${rotate}deg) translate(${x}px, ${y}px)`,
    transition: 'transform 0.08s ease-out'
  }
})

const panel2Style = computed(() => {
  const p = scrollProgress.value
  const rotate = 4 - p * 6 // 4deg to -2deg
  const x = p * -30
  const y = p * 30
  return {
    transform: `rotate(${rotate}deg) translate(${x}px, ${y}px)`,
    transition: 'transform 0.08s ease-out'
  }
})

const panel3Style = computed(() => {
  const p = scrollProgress.value
  const rotate = -1 + p * 4
  const scale = 0.95 + p * 0.08
  return {
    transform: `rotate(${rotate}deg) scale(${scale})`,
    transition: 'transform 0.08s ease-out'
  }
})
</script>

<template>
  <section class="relative w-full min-h-0 lg:min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-12 pt-28 sm:pt-32 lg:pt-28 pb-16 lg:pb-12 select-none">
    
    <div class="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center z-10">
      
      <!-- Left Column: Typography & Comic Narrative -->
      <div class="lg:col-span-6 flex flex-col items-start text-left">
        
        <!-- Comic Narration Box -->
        <div class="comic-caption mb-5">
          <span>PORTAFOLIO DE SISTEMAS // CASOS REALES</span>
        </div>

        <!-- Main Headline -->
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.05] mb-5 font-display uppercase">
          Desarrollo de <br />
          <span class="text-blue-600 underline decoration-slate-900 decoration-4 underline-offset-8">
            Software y Sistemas
          </span> <br />
          a Medida.
        </h1>
        
        <!-- Subtitle -->
        <p class="text-base sm:text-lg text-slate-700 max-w-xl leading-relaxed mb-8 font-medium">
          Diseño e implemento plataformas web completas para empresas, centros médicos y colegios. Cada sistema incluye base de datos interactiva en tu navegador para que pruebes los flujos de punta a punta.
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
          <a 
            href="#proyectos" 
            class="comic-btn-primary px-7 py-3.5 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <span>Ver Demos y Proyectos</span>
            <ArrowDown class="w-4 h-4 animate-bounce" />
          </a>

          <a 
            href="https://wa.me/59168787985" 
            target="_blank"
            class="comic-btn-secondary px-6 py-3.5 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <MessageSquare class="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Directo</span>
          </a>
        </div>

        <!-- Business Target Badges -->
        <div class="flex flex-wrap gap-2 pt-4 border-t-2 border-slate-900/10 w-full max-w-xl">
          <span class="comic-pill">🏥 Clínicas &amp; Salud</span>
          <span class="comic-pill">🎓 Colegios &amp; Pensiones</span>
          <span class="comic-pill">🚜 Agroindustria &amp; Flota</span>
          <span class="comic-pill">💊 Farmacias &amp; Stock</span>
        </div>

      </div>

      <!-- Right Column: SCROLL-DRIVEN ANIMATED COMIC STORYBOARD DECK -->
      <!-- Drives layered comic cards that fan out and reveal themselves directly on scroll -->
      <div class="lg:col-span-6 relative w-full h-[460px] sm:h-[500px] flex items-center justify-center">
        
        <!-- Background Comic Action Lines / Halftone Bubble -->
        <div class="absolute inset-0 bg-radial from-blue-100/60 via-slate-100/40 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        <!-- Scroll Dynamic Notice Tag -->
        <div class="absolute -top-6 right-2 sm:right-6 comic-caption z-30">
          <span>SCROLL DRIVE // VIÑETAS INTERACTIVAS</span>
        </div>

        <!-- PANEL 3 (Bottom Layer: AgroFlota) -->
        <div 
          :style="panel3Style"
          class="absolute w-[85%] sm:w-[380px] h-[260px] comic-panel-flat p-4 bg-emerald-50 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between"
        >
          <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2">
            <span class="comic-caption bg-emerald-200">VIÑETA 03</span>
            <span class="text-xs font-black uppercase text-emerald-800">Telemetría Agroindustrial</span>
          </div>
          <div class="space-y-1 text-xs text-slate-800 font-medium">
            <p class="font-bold text-slate-900">Control de maquinaria y órdenes de trabajo en tiempo real.</p>
            <p class="text-[11px] text-slate-600">Para empresas agropecuarias, flotas de transporte y talleres.</p>
          </div>
          <div class="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-900/20 text-emerald-900">
            <span>Vue 3 + NestJS</span>
            <span class="text-blue-600">Demo Lista &rarr;</span>
          </div>
        </div>

        <!-- PANEL 2 (Middle Layer: Pensiones Escolares) -->
        <div 
          :style="panel2Style"
          class="absolute w-[88%] sm:w-[400px] h-[280px] comic-panel-flat p-5 bg-amber-50 border-2 border-slate-900 shadow-[6px_6px_0px_#0f172a] flex flex-col justify-between z-10"
        >
          <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2">
            <span class="comic-caption bg-amber-200">VIÑETA 02</span>
            <span class="text-xs font-black uppercase text-amber-900">Cobro de Pensiones</span>
          </div>
          <div class="space-y-1.5 text-xs text-slate-800 font-medium">
            <p class="font-bold text-slate-900 text-sm">Emisión de recibos, control de mensualidades y deudas.</p>
            <p class="text-[11px] text-slate-600">Para colegios, institutos y centros de formación continua.</p>
          </div>
          <div class="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-900/20 text-amber-900">
            <span>Vue 3 + Laravel 11</span>
            <span class="text-blue-600">Demo Lista &rarr;</span>
          </div>
        </div>

        <!-- PANEL 1 (Top Hero Layer: Clínica Médica) -->
        <div 
          :style="panel1Style"
          class="absolute w-[92%] sm:w-[420px] h-[300px] comic-panel p-5 bg-white border-2 border-slate-900 shadow-[8px_8px_0px_#0f172a] flex flex-col justify-between z-20"
        >
          <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2">
            <span class="comic-caption">VIÑETA 01</span>
            <span class="text-xs font-black uppercase text-blue-700">Clínica Médica &amp; Citas</span>
          </div>

          <div class="space-y-2 text-xs text-slate-800 font-medium">
            <h3 class="font-black text-slate-900 text-base leading-tight">
              Gestión Integral de Consultorios y Pacientes
            </h3>
            <p class="text-slate-600 text-xs leading-relaxed">
              Reserva de turnos en línea, fichas clínicas e historial médico digital sin esperas.
            </p>
            <div class="inline-block px-2.5 py-1 bg-blue-50 border border-blue-200 rounded text-[11px] font-bold text-blue-800">
              Dirigido a: Clínicas, consultorios dentales y centros de salud
            </div>
          </div>

          <div class="flex items-center justify-between text-xs font-bold pt-2 border-t-2 border-slate-900">
            <span class="text-slate-700">Angular + Supabase</span>
            <a href="#proyectos" class="text-blue-600 hover:underline flex items-center gap-1 font-black">
              <span>Deslizar para explorar</span>
              <span>&darr;</span>
            </a>
          </div>
        </div>

      </div>

    </div>

  </section>
</template>
