<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUpdate, onMounted, onUnmounted } from 'vue'
import { projects } from '../../utils/siteData'
import type { ProjectDemo } from '../../utils/siteData'
import * as LucideIcons from 'lucide-vue-next'
import { 
  ArrowUpRight, 
  Layers, 
  CheckCircle2, 
  MonitorPlay,
  ListChecks,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Activity,
  GraduationCap,
  Tractor,
  Flame,
  Globe,
  FileText
} from 'lucide-vue-next'

const selectedCategory = ref('todos')
const expandedSlugs = ref<Record<string, boolean>>({})
const deckRef = ref<HTMLElement | null>(null)
const cardRefs = ref<HTMLElement[]>([])
const activeCardIndex = ref(0)
const isDeckMode = ref(false)
const prefersReducedMotion = ref(false)
const cardTransforms = ref<Record<number, { scale: number; rotate: number; translateY: number; opacity: number }>>({})
let rafId: number | null = null

const toggleExpand = (slug: string) => {
  expandedSlugs.value[slug] = !expandedSlugs.value[slug]
}

const isSalud = (p: ProjectDemo) =>
  p.name.includes('Farmacia') || p.name.includes('Clínica') || p.name.includes('Veterinaria')
const isEducacion = (p: ProjectDemo) => p.name.includes('Pensiones')
const isAgro = (p: ProjectDemo) => p.name.includes('Agroindustrial')
const isComercio = (p: ProjectDemo) =>
  p.name.includes('Gimnasio') ||
  p.name.includes('FitScan') ||
  p.name.includes('Perfumería') ||
  p.category === 'Landing Pages'

const filterCategories = [
  { id: 'todos', label: 'Todos', count: projects.length, icon: Globe },
  { id: 'salud', label: 'Salud & Clínicas', count: projects.filter(isSalud).length, icon: Activity },
  { id: 'educacion', label: 'Educación & Cobros', count: projects.filter(isEducacion).length, icon: GraduationCap },
  { id: 'agro', label: 'Agro & Flotas', count: projects.filter(isAgro).length, icon: Tractor },
  { id: 'comercio', label: 'Servicios & Landing', count: projects.filter(isComercio).length, icon: Flame }
]

const filteredProjects = computed(() => {
  if (selectedCategory.value === 'todos') {
    return projects
  }
  if (selectedCategory.value === 'salud') {
    return projects.filter(isSalud)
  }
  if (selectedCategory.value === 'educacion') {
    return projects.filter(isEducacion)
  }
  if (selectedCategory.value === 'agro') {
    return projects.filter(isAgro)
  }
  if (selectedCategory.value === 'comercio') {
    return projects.filter(isComercio)
  }
  return projects
})

const getIcon = (name: string) => {
  return (LucideIcons as any)[name] || Layers
}

const updateDeckPhysics = () => {
  rafId = null
  const container = deckRef.value
  if (!container || !isDeckMode.value) {
    cardTransforms.value = {}
    return
  }

  const paddingLeft = parseFloat(getComputedStyle(container).paddingLeft) || 16
  const scrollLeft = container.scrollLeft
  const anchorX = scrollLeft + paddingLeft
  const cards = cardRefs.value
  if (!cards.length) return

  let closestIdx = 0
  let closestDist = Infinity
  const nextTransforms: Record<number, { scale: number; rotate: number; translateY: number; opacity: number }> = {}

  cards.forEach((card, idx) => {
    if (!card) return
    const cardLeft = card.offsetLeft
    const cardWidth = card.offsetWidth || 300
    const stride = cardWidth + 16
    const delta = cardLeft - anchorX
    const norm = Math.max(-1.25, Math.min(1.25, delta / stride))
    const absNorm = Math.abs(norm)

    if (absNorm < closestDist) {
      closestDist = absNorm
      closestIdx = idx
    }

    if (prefersReducedMotion.value) {
      nextTransforms[idx] = { scale: 1, rotate: 0, translateY: 0, opacity: 1 }
    } else {
      nextTransforms[idx] = {
        scale: Number((1 - absNorm * 0.05).toFixed(4)),
        rotate: Number((norm * 1.6).toFixed(3)),
        translateY: Number((absNorm * 8).toFixed(2)),
        opacity: Number((1 - absNorm * 0.14).toFixed(3))
      }
    }
  })

  activeCardIndex.value = Math.min(closestIdx, Math.max(filteredProjects.value.length - 1, 0))
  cardTransforms.value = nextTransforms
}

const onDeckScroll = () => {
  if (!isDeckMode.value || rafId !== null) return
  rafId = window.requestAnimationFrame(updateDeckPhysics)
}

const scrollToCard = (targetIdx: number) => {
  const container = deckRef.value
  const clamped = Math.max(0, Math.min(targetIdx, filteredProjects.value.length - 1))
  const card = cardRefs.value[clamped]
  if (!container || !card) return
  const paddingLeft = parseFloat(getComputedStyle(container).paddingLeft) || 16
  container.scrollTo({
    left: Math.max(0, card.offsetLeft - paddingLeft),
    behavior: prefersReducedMotion.value ? 'auto' : 'smooth'
  })
}

const handleResize = () => {
  isDeckMode.value = window.innerWidth < 1024
  nextTick(updateDeckPhysics)
}

const { focusedSlug, focusTrigger } = useFocusedProject()
let skipNextReset = false

watch(focusTrigger, async () => {
  const slug = focusedSlug.value
  if (!slug) return
  if (selectedCategory.value !== 'todos') {
    skipNextReset = true
    selectedCategory.value = 'todos'
    await nextTick()
  }
  const idx = filteredProjects.value.findIndex((p) => p.slug === slug)
  if (idx >= 0) {
    await nextTick()
    scrollToCard(idx)
  }
})

watch(filteredProjects, async () => {
  if (skipNextReset) {
    skipNextReset = false
    updateDeckPhysics()
    return
  }
  activeCardIndex.value = 0
  await nextTick()
  if (deckRef.value && isDeckMode.value) {
    deckRef.value.scrollTo({ left: 0, behavior: 'auto' })
  }
  updateDeckPhysics()
})

onBeforeUpdate(() => {
  cardRefs.value = []
})

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  handleResize()
  window.addEventListener('resize', handleResize, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (rafId !== null) window.cancelAnimationFrame(rafId)
})

const getCardStyle = (index: number) => {
  if (!isDeckMode.value) return {}
  const t = cardTransforms.value[index]
  if (!t) return {}
  return {
    transform: `translate3d(0, ${t.translateY}px, 0) scale(${t.scale}) rotate(${t.rotate}deg)`,
    opacity: t.opacity,
    transformOrigin: 'center center'
  }
}
</script>

<template>
  <section id="proyectos" class="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-4 pb-10 sm:py-20 lg:py-28">
    
    <!-- Section Comic Header -->
    <div class="mb-6 sm:mb-12 border-b-2 border-slate-900 pb-5 sm:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
      <div class="max-w-2xl">
        <div class="comic-caption mb-2.5 sm:mb-3 text-[10px] sm:text-xs select-none">
          <span>CAPÍTULO 01 // CATÁLOGO EN VIVO</span>
        </div>
        <h2 class="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-display uppercase leading-tight">
          Sistemas Web Desarrollados
        </h2>
        <p class="text-[13px] sm:text-base lg:text-lg text-slate-700 mt-2 max-w-xl font-medium leading-relaxed">
          Cada sistema cuenta con módulos operativos y datos precargados para que pruebes los flujos en tiempo real sin registros previos.
        </p>
      </div>

      <!-- Live badge banner (Desktop & Tablet only so mobile gets right to the filters) -->
      <div class="hidden md:block comic-panel-flat p-3.5 bg-yellow-50 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] max-w-xs shrink-0">
        <div class="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5 mb-1">
          <MonitorPlay class="w-4 h-4 text-blue-600" />
          <span>Demos 100% Interactivas</span>
        </div>
        <p class="text-[11px] text-slate-600 leading-normal font-medium">
          Haz clic en cualquier demo para navegar como administrador o cliente directamente en tu navegador.
        </p>
      </div>
    </div>

    <!-- Category Filter Tray (Edge-to-edge swipeable tray on mobile, clean flex on sm+) -->
    <div class="mb-6 sm:mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar py-1 snap-x select-none">
      <div class="flex items-center gap-2 min-w-max">
        <button
          v-for="cat in filterCategories"
          :key="cat.id"
          @click="selectedCategory = cat.id"
          class="snap-start h-10 px-3.5 sm:px-4 rounded-xl border-2 border-slate-900 text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_#0f172a] active:translate-y-0.5 whitespace-nowrap shrink-0"
          :class="selectedCategory === cat.id ? 'bg-yellow-200 text-slate-900 shadow-none translate-y-0.5' : 'bg-white text-slate-700 hover:bg-slate-100'"
        >
          <component :is="cat.icon" class="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>{{ cat.label }}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold" :class="selectedCategory === cat.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'">
            {{ cat.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- Mobile/Tablet Deck Controls Bar (< lg) -->
    <div class="lg:hidden flex items-center justify-between mb-3 px-0.5 select-none">
      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
          {{ String(activeCardIndex + 1).padStart(2, '0') }} / {{ String(filteredProjects.length).padStart(2, '0') }}
        </span>
        <span class="text-[11px] font-bold text-slate-500">
          Desliza el mazo lateralmente
        </span>
      </div>

      <div v-if="filteredProjects.length > 1" class="flex items-center gap-1.5">
        <button
          type="button"
          @click="scrollToCard(activeCardIndex - 1)"
          :disabled="activeCardIndex === 0"
          aria-label="Proyecto anterior"
          class="w-9 h-9 rounded-lg border-2 border-slate-900 bg-white flex items-center justify-center shadow-[2px_2px_0px_#0f172a] active:translate-y-0.5 disabled:opacity-35 disabled:shadow-none disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronLeft class="w-4 h-4 text-slate-900" />
        </button>
        <button
          type="button"
          @click="scrollToCard(activeCardIndex + 1)"
          :disabled="activeCardIndex >= filteredProjects.length - 1"
          aria-label="Siguiente proyecto"
          class="w-9 h-9 rounded-lg border-2 border-slate-900 bg-yellow-200 flex items-center justify-center shadow-[2px_2px_0px_#0f172a] active:translate-y-0.5 disabled:opacity-35 disabled:shadow-none disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronRight class="w-4 h-4 text-slate-900" />
        </button>
      </div>
    </div>

    <!-- Storyboard: Horizontal Card Deck on Mobile/Tablet (< lg), 2-Col Grid on Desktop (lg+) -->
    <div 
      ref="deckRef"
      @scroll="onDeckScroll"
      class="-mx-4 px-4 scroll-pl-4 sm:-mx-6 sm:px-6 sm:scroll-pl-6 lg:mx-0 lg:px-0 flex lg:grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none no-scrollbar py-2 pb-4 lg:py-0 items-start lg:items-stretch"
    >
      <article 
        v-for="(project, index) in filteredProjects" 
        :key="project.slug"
        :ref="(el) => { if (el) cardRefs[index] = el as HTMLElement }"
        :style="getCardStyle(index)"
        class="comic-panel p-4 sm:p-7 bg-white flex flex-col justify-between w-[84vw] max-w-[340px] sm:w-[400px] sm:max-w-none lg:w-auto lg:h-full shrink-0 lg:shrink snap-start transition-[transform,opacity] duration-150 ease-out lg:transition-all"
      >
        <div>
          <!-- Panel Header (Single-line compact badges, never wraps on 360px) -->
          <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2.5 sm:pb-3 mb-3.5 sm:mb-4 gap-2 select-none">
            <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span class="comic-caption bg-yellow-200 text-[10px] sm:text-xs">
                <span class="sm:hidden">#{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="hidden sm:inline">CASO {{ String(index + 1).padStart(2, '0') }}</span>
              </span>
              <span class="comic-pill text-[10px] sm:text-[11px] font-bold">
                {{ project.category }}
              </span>
            </div>
            
            <div class="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-slate-700 uppercase tracking-wider whitespace-nowrap shrink-0">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span class="sm:hidden">En vivo</span>
              <span class="hidden sm:inline">Demo Operativa</span>
            </div>
          </div>

          <!-- Thumbnail with Link -->
          <a 
            :href="project.demoUrl" 
            target="_blank"
            class="block relative overflow-hidden rounded-xl border-2 border-slate-900 bg-slate-100 aspect-video mb-3.5 sm:mb-4 group shadow-[3px_3px_0px_#0f172a]"
          >
            <img 
              :src="project.thumbnail" 
              :alt="project.name" 
              class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-103"
              loading="lazy"
            />
            <div class="hidden sm:flex absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors items-center justify-center">
              <span class="opacity-0 group-hover:opacity-100 transition-opacity px-3.5 py-2 bg-white border-2 border-slate-900 rounded-lg text-xs font-black uppercase text-slate-900 shadow-[3px_3px_0px_#0f172a] flex items-center gap-1.5">
                <span>Abrir Demo en Vivo</span>
                <ArrowUpRight class="w-3.5 h-3.5" />
              </span>
            </div>
            <div class="absolute bottom-2 left-2 px-2 py-0.5 bg-white border-2 border-slate-900 rounded-md text-[9px] sm:text-[10px] font-black uppercase text-slate-900 shadow-[2px_2px_0px_#0f172a] whitespace-nowrap">
              Datos Precargados
            </div>
          </a>

          <!-- Title & Icon -->
          <div class="flex items-center gap-2.5 mb-2">
            <div class="w-8 h-8 rounded-lg bg-blue-100 border-2 border-slate-900 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#0f172a]">
              <component :is="getIcon(project.iconName)" class="w-4 h-4 text-blue-700" />
            </div>
            <h3 class="text-lg sm:text-2xl font-black text-slate-900 font-display leading-tight">
              {{ project.name }}
            </h3>
          </div>

          <!-- Description (Concise 2-line preview on mobile unless expanded, full on md+) -->
          <p 
            class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-3 sm:mb-4"
            :class="expandedSlugs[project.slug] ? '' : 'line-clamp-2 md:line-clamp-none'"
          >
            {{ project.description }}
          </p>

          <!-- Mobile Accordion Toggle (Only < md; hidden on desktop where details are visible) -->
          <button
            type="button"
            @click="toggleExpand(project.slug)"
            :aria-expanded="Boolean(expandedSlugs[project.slug])"
            class="md:hidden w-full mb-3 py-2 px-3 rounded-lg border-2 border-slate-900/15 bg-slate-50 hover:bg-slate-100 active:bg-slate-200/70 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-800 transition-colors cursor-pointer select-none"
          >
            <span class="flex items-center gap-1.5">
              <ListChecks class="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{{ expandedSlugs[project.slug] ? 'Ocultar módulos e impacto' : 'Ver módulos e impacto' }}</span>
            </span>
            <ChevronDown 
              class="w-4 h-4 text-slate-600 transition-transform duration-200 shrink-0"
              :class="expandedSlugs[project.slug] ? 'rotate-180' : ''"
            />
          </button>

          <!-- Collapsible on Mobile (< md), Always Open on Desktop (md+) -->
          <div 
            class="grid transition-[grid-template-rows,opacity] duration-250 ease-out md:grid-rows-[1fr] md:opacity-100"
            :class="expandedSlugs[project.slug] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
          >
            <div class="overflow-hidden">
              <!-- Key Operational Modules -->
              <div class="mb-3.5 sm:mb-4 p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div class="text-[10px] font-black uppercase text-slate-600 tracking-wider mb-2 flex items-center gap-1.5">
                  <ListChecks class="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Módulos y Flujos Operativos</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div 
                    v-for="item in project.highlights" 
                    :key="item"
                    class="flex items-start gap-1.5 text-[11px] text-slate-700 font-semibold leading-tight"
                  >
                    <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{{ item }}</span>
                  </div>
                </div>
              </div>

              <!-- Business Benefit Highlight -->
              <div class="mb-3.5 sm:mb-4 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-[11px] text-slate-700 font-medium leading-relaxed">
                <span class="font-black text-emerald-900 block mb-0.5 uppercase text-[10px] tracking-wider">Impacto en el Negocio:</span>
                <span>{{ project.businessBenefit }}</span>
              </div>
            </div>
          </div>

          <!-- Tech Stack Chips -->
          <div class="flex flex-wrap items-center gap-1.5 mb-4 sm:mb-5 text-[10px] font-bold select-none">
            <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 whitespace-nowrap">
              {{ project.frontendStack }}
            </span>
            <span class="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 whitespace-nowrap">
              {{ project.backendStack }}
            </span>
            <span v-if="project.databaseStack !== 'Sin base de datos requerida'" class="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 whitespace-nowrap">
              {{ project.databaseStack }}
            </span>
          </div>
        </div>

        <!-- Action Buttons: Side-by-side 2-col on mobile, flex between on sm+ -->
        <div class="pt-3.5 sm:pt-4 border-t-2 border-slate-900 grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2 sm:gap-2.5 select-none">
          <NuxtLink 
            :to="'/proyectos/' + project.slug"
            class="comic-btn-secondary w-full sm:w-auto h-11 px-3 sm:px-4 text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <FileText class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
            <span class="sm:hidden">Detalles</span>
            <span class="hidden sm:inline">Ver detalles del sistema</span>
          </NuxtLink>

          <a 
            :href="project.demoUrl" 
            target="_blank"
            class="comic-btn-primary w-full sm:w-auto h-11 px-3 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span class="sm:hidden">Probar Demo</span>
            <span class="hidden sm:inline">Probar Demo en Vivo</span>
            <ArrowUpRight class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          </a>
        </div>

      </article>
      <div class="w-1 shrink-0 lg:hidden" aria-hidden="true"></div>
    </div>

  </section>
</template>
