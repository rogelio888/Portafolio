<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { 
  ArrowDown, 
  MessageSquare, 
  ArrowUpRight, 
  Activity, 
  GraduationCap, 
  Tractor, 
  Pill,
  CheckCircle2,
  ChevronRight
} from 'lucide-vue-next'

const scrollY = ref(0)
const activeCardIndex = ref(0)
let ticking = false

const heroProjects = [
  {
    num: 'VIÑETA 01',
    name: 'Clínica Médica & Citas',
    category: 'Sistemas Web',
    stack: 'Angular 18 & Supabase',
    target: 'Clínicas privadas, policonsultorios y consultorios dentales',
    tagline: 'Gestión integral de turnos, fichas clínicas y caja en recepción.',
    highlights: [
      'Agenda interactiva de citas con disponibilidad en tiempo real',
      'Expediente clínico e historial de consultas por paciente',
      'Caja registradora con arqueo diario y comprobantes'
    ],
    demoUrl: '/frontend-clinica/index.html'
  },
  {
    num: 'VIÑETA 02',
    name: 'Control de Pensiones',
    category: 'Sistemas Web',
    stack: 'Vue 3 & Laravel 11',
    target: 'Colegios privados, institutos y centros educativos',
    tagline: 'Portal de consulta para padres, cobro en ventanilla y control de deudas.',
    highlights: [
      'Consulta pública de mensualidades por código de estudiante',
      'Panel de dirección con índice global de morosidad',
      'Ventanilla de cobros en efectivo y QR con recibos'
    ],
    demoUrl: '/frontend-pensiones/index.html'
  },
  {
    num: 'VIÑETA 03',
    name: 'Telemetría Agroindustrial',
    category: 'Sistemas Web',
    stack: 'Vue 3 & NestJS',
    target: 'Empresas agropecuarias, flotas de transporte y contratistas',
    tagline: 'Monitoreo de tractores, horómetros y órdenes de mantenimiento.',
    highlights: [
      'Ficha técnica por equipo con horómetros y consumo',
      'Órdenes de servicio y control de mecánicos externos',
      'Historial de reparaciones y costos operativos por tractor'
    ],
    demoUrl: '/frontend-agroindustrial/index.html'
  }
]

const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      scrollY.value = window.scrollY
      // Fast cycling: updates card rapidly during the initial scroll
      if (scrollY.value < 100) {
        activeCardIndex.value = 0
      } else if (scrollY.value < 220) {
        activeCardIndex.value = 1
      } else {
        activeCardIndex.value = 2
      }
      ticking = false
    })
    ticking = true
  }
}

const setActiveCard = (index: number) => {
  activeCardIndex.value = index
}

const nextCard = () => {
  activeCardIndex.value = (activeCardIndex.value + 1) % heroProjects.length
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Fast physical positioning for the 3 cards
const getCardStyle = (index: number) => {
  const current = activeCardIndex.value
  if (index === current) {
    return {
      zIndex: 30,
      transform: 'translate(0px, 0px) rotate(0deg) scale(1)',
      opacity: 1,
      pointerEvents: 'auto' as const
    }
  } else if ((index === 0 && current === 1) || (index === 1 && current === 2) || (index === 2 && current === 0)) {
    // Previous card (peeled back to the right)
    return {
      zIndex: 10,
      transform: 'translate(28px, -18px) rotate(5deg) scale(0.94)',
      opacity: 0.55,
      pointerEvents: 'none' as const
    }
  } else {
    // Next card (tucked slightly behind to the left)
    return {
      zIndex: 20,
      transform: 'translate(-22px, 14px) rotate(-3.5deg) scale(0.96)',
      opacity: 0.75,
      pointerEvents: 'none' as const
    }
  }
}
</script>

<template>
  <section class="relative w-full min-h-0 lg:min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-12 pt-24 sm:pt-28 lg:pt-24 pb-12 lg:pb-12 select-none">
    
    <div class="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center z-10">
      
      <!-- Left Column: Typography & Narrative -->
      <div class="lg:col-span-6 flex flex-col items-start text-left">
        
        <!-- Comic Narration Box -->
        <div class="comic-caption mb-3 sm:mb-4">
          <span>PORTAFOLIO DE SISTEMAS // CASOS REALES</span>
        </div>

        <!-- Main Headline (Fluid font sizing that fits 360px up to 1440px) -->
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08] mb-4 sm:mb-5 font-display uppercase">
          Desarrollo de <br />
          <span class="text-blue-600 underline decoration-slate-900 decoration-4 underline-offset-6 sm:underline-offset-8">
            Software y Sistemas
          </span> <br />
          a Medida.
        </h1>
        
        <!-- Subtitle -->
        <p class="text-sm sm:text-base lg:text-lg text-slate-700 max-w-xl leading-relaxed mb-6 sm:mb-8 font-medium">
          Diseño e implemento plataformas web completas para empresas, centros médicos y colegios. Cada sistema incluye base de datos interactiva en tu navegador para que pruebes los flujos de punta a punta.
        </p>

        <!-- CTAs (Stack vertically on mobile with 48px height for thumbs, horizontal on sm+) -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-7 sm:mb-9">
          <a 
            href="#proyectos" 
            class="comic-btn-primary w-full sm:w-auto h-12 px-6 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <span>Ver Demos y Proyectos</span>
            <ArrowDown class="w-4 h-4 animate-bounce" />
          </a>

          <a 
            href="https://wa.me/59168787985" 
            target="_blank"
            class="comic-btn-secondary w-full sm:w-auto h-12 px-6 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <MessageSquare class="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Directo</span>
          </a>
        </div>

        <!-- Sector Badges (2-column tactile grid on mobile, horizontal pills on sm+) -->
        <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 pt-4 border-t-2 border-slate-900/10 w-full max-w-xl text-xs font-bold text-slate-800">
          <span class="comic-pill justify-center sm:justify-start">
            <Activity class="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span class="truncate">Clínicas &amp; Salud</span>
          </span>
          <span class="comic-pill justify-center sm:justify-start">
            <GraduationCap class="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span class="truncate">Colegios &amp; Educación</span>
          </span>
          <span class="comic-pill justify-center sm:justify-start">
            <Tractor class="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span class="truncate">Agroindustria &amp; Flota</span>
          </span>
          <span class="comic-pill justify-center sm:justify-start">
            <Pill class="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span class="truncate">Farmacias &amp; Stock</span>
          </span>
        </div>

      </div>

      <!-- Right Column: Interactive Deck of Comic Cards -->
      <div class="lg:col-span-6 relative w-full flex flex-col items-center justify-center mt-2 lg:mt-0">
        
        <!-- Tab Selectors: Comfortable touch targets -->
        <div class="w-full max-w-[430px] flex items-center justify-between gap-1.5 mb-3.5 z-40">
          <div class="flex items-center gap-1.5">
            <button 
              v-for="(p, idx) in heroProjects" 
              :key="p.num"
              @click="setActiveCard(idx)"
              class="h-9 px-2.5 sm:px-3 rounded-lg border-2 border-slate-900 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0px_#0f172a]"
              :class="activeCardIndex === idx ? 'bg-yellow-200 text-slate-900 translate-y-0.5 shadow-none' : 'bg-white text-slate-600 hover:bg-slate-100'"
            >
              {{ p.num }}
            </button>
          </div>

          <button 
            @click="nextCard"
            class="h-9 px-3 rounded-lg border-2 border-slate-900 bg-white text-[10px] sm:text-[11px] font-black uppercase text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-1 shadow-[2px_2px_0px_#0f172a] cursor-pointer"
            title="Ver siguiente viñeta"
          >
            <span>Siguiente</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Card Deck Container: Tuned height so text fits without overflow -->
        <div class="relative w-full max-w-[430px] h-[370px] sm:h-[360px] flex items-center justify-center">
          
          <div 
            v-for="(p, idx) in heroProjects" 
            :key="p.num"
            :style="getCardStyle(idx)"
            class="absolute inset-0 p-4 sm:p-6 bg-white border-2 border-slate-900 rounded-xl shadow-[5px_5px_0px_#0f172a] sm:shadow-[6px_6px_0px_#0f172a] flex flex-col justify-between transition-all duration-300 ease-out overflow-hidden"
          >
            <div>
              <!-- Top bar -->
              <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
                <span class="comic-caption bg-yellow-200 text-[10px] sm:text-[11px]">
                  {{ p.num }}
                </span>
                <span class="text-[11px] sm:text-xs font-black uppercase text-blue-700">
                  {{ p.category }}
                </span>
              </div>

              <!-- Title & Tagline -->
              <h3 class="text-lg sm:text-xl md:text-2xl font-black text-slate-900 font-display leading-tight mb-1.5">
                {{ p.name }}
              </h3>
              <p class="text-xs text-slate-700 font-medium leading-relaxed mb-3">
                {{ p.tagline }}
              </p>

              <!-- Feature Highlights (Directly visible, clean checks) -->
              <div class="space-y-2 mb-3">
                <div 
                  v-for="item in p.highlights" 
                  :key="item"
                  class="flex items-start gap-1.5 text-[11px] sm:text-xs text-slate-800 font-semibold"
                >
                  <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span class="leading-tight">{{ item }}</span>
                </div>
              </div>
            </div>

            <!-- Card Bottom Bar -->
            <div class="pt-3 border-t-2 border-slate-900 flex items-center justify-between text-xs font-bold">
              <span class="text-slate-600 font-bold text-[10px] sm:text-[11px] truncate max-w-[150px] sm:max-w-none">{{ p.stack }}</span>
              
              <a 
                :href="p.demoUrl" 
                target="_blank"
                class="comic-btn-primary px-3 sm:px-3.5 py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0"
              >
                <span>Probar Demo</span>
                <ArrowUpRight class="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

      </div>

    </div>

  </section>
</template>