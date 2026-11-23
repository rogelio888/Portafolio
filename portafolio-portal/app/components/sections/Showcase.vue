<script setup lang="ts">
import { ref, computed } from 'vue'
import { projects } from '../../utils/siteData'
import type { ProjectDemo } from '../../utils/siteData'
import * as LucideIcons from 'lucide-vue-next'
import { 
  ArrowUpRight, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare,
  Activity,
  GraduationCap,
  Tractor,
  Flame,
  Globe,
  FileText
} from 'lucide-vue-next'

const selectedCategory = ref('todos')

const filterCategories = [
  { id: 'todos', label: 'Todos', count: 7, icon: Globe },
  { id: 'salud', label: 'Salud & Clínicas', count: 2, icon: Activity },
  { id: 'educacion', label: 'Educación & Cobros', count: 1, icon: GraduationCap },
  { id: 'agro', label: 'Agro & Flotas', count: 1, icon: Tractor },
  { id: 'comercio', label: 'Servicios & Landing', count: 3, icon: Flame }
]

const filteredProjects = computed(() => {
  if (selectedCategory.value === 'todos') {
    return projects
  }
  if (selectedCategory.value === 'salud') {
    return projects.filter(p => p.name.includes('Farmacia') || p.name.includes('Clínica'))
  }
  if (selectedCategory.value === 'educacion') {
    return projects.filter(p => p.name.includes('Pensiones'))
  }
  if (selectedCategory.value === 'agro') {
    return projects.filter(p => p.name.includes('Agroindustrial'))
  }
  if (selectedCategory.value === 'comercio') {
    return projects.filter(p => p.name.includes('Gimnasio') || p.category === 'Landing Pages')
  }
  return projects
})

const getIcon = (name: string) => {
  return (LucideIcons as any)[name] || Layers
}
</script>

<template>
  <section id="proyectos" class="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-14 sm:py-20 lg:py-28 select-none">
    
    <!-- Section Comic Header -->
    <div class="mb-8 sm:mb-12 border-b-2 border-slate-900 pb-6 sm:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="max-w-2xl">
        <div class="comic-caption mb-3 text-[10px] sm:text-xs">
          <span>CAPÍTULO 01 // CATÁLOGO DE SISTEMAS EN VIVO</span>
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-display uppercase leading-tight">
          Sistemas Web Desarrollados
        </h2>
        <p class="text-sm sm:text-base lg:text-lg text-slate-700 mt-2.5 max-w-xl font-medium leading-relaxed">
          Cada viñeta representa una plataforma funcional completa. Incluye módulos operativos y datos precargados para que pruebes los flujos en tiempo real sin registros.
        </p>
      </div>

      <!-- Live badge banner -->
      <div class="comic-panel-flat p-3.5 bg-yellow-50 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] max-w-xs shrink-0">
        <div class="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5 mb-1">
          <Sparkles class="w-3.5 h-3.5 text-blue-600" />
          <span>Demos 100% Interactivas</span>
        </div>
        <p class="text-[11px] text-slate-600 leading-normal font-medium">
          Haz clic en cualquier demo para navegar como administrador o cliente directamente en tu navegador.
        </p>
      </div>
    </div>

    <!-- Category Filter Tray (Mobile Horizontal Scrollable Tray, Desktop Flex) -->
    <div class="mb-8 sm:mb-10 w-full overflow-x-auto no-scrollbar py-1">
      <div class="flex items-center gap-2 min-w-max">
        <button
          v-for="cat in filterCategories"
          :key="cat.id"
          @click="selectedCategory = cat.id"
          class="h-10 px-4 rounded-xl border-2 border-slate-900 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_#0f172a] active:translate-y-0.5"
          :class="selectedCategory === cat.id ? 'bg-yellow-200 text-slate-900 shadow-none translate-y-0.5' : 'bg-white text-slate-700 hover:bg-slate-100'"
        >
          <component :is="cat.icon" class="w-3.5 h-3.5 text-blue-600" />
          <span>{{ cat.label }}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold" :class="selectedCategory === cat.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'">
            {{ cat.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- Storyboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
      <div 
        v-for="(project, index) in filteredProjects" 
        :key="project.name"
        class="comic-panel p-5 sm:p-7 bg-white flex flex-col justify-between"
      >
        <div>
          <!-- Panel Header -->
          <div class="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4 gap-2">
            <div class="flex items-center gap-2">
              <span class="comic-caption bg-yellow-200 text-[10px] sm:text-xs">
                VIÑETA {{ String(index + 1).padStart(2, '0') }}
              </span>
              <span class="comic-pill text-[10px] sm:text-[11px] font-bold">
                {{ project.category }}
              </span>
            </div>
            
            <div class="flex items-center gap-1.5 text-[11px] font-black text-slate-700 uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Demo Operativa</span>
            </div>
          </div>

          <!-- Thumbnail with Link -->
          <a 
            :href="project.demoUrl" 
            target="_blank"
            class="block relative overflow-hidden rounded-xl border-2 border-slate-900 bg-slate-100 aspect-video mb-4 group shadow-[3px_3px_0px_#0f172a]"
          >
            <img 
              :src="project.thumbnail" 
              :alt="project.name" 
              class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-103"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
              <span class="opacity-0 group-hover:opacity-100 transition-opacity px-3.5 py-2 bg-white border-2 border-slate-900 rounded-lg text-xs font-black uppercase text-slate-900 shadow-[3px_3px_0px_#0f172a] flex items-center gap-1.5">
                <span>Abrir Demo en Vivo</span>
                <ArrowUpRight class="w-3.5 h-3.5" />
              </span>
            </div>
            <div class="absolute bottom-2 left-2 px-2.5 py-0.5 bg-white border-2 border-slate-900 rounded-md text-[10px] font-black uppercase text-slate-900 shadow-[2px_2px_0px_#0f172a]">
              Datos Precargados
            </div>
          </a>

          <!-- Title & Icon -->
          <div class="flex items-center gap-2.5 mb-2.5">
            <div class="w-8 h-8 rounded-lg bg-blue-100 border-2 border-slate-900 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#0f172a]">
              <component :is="getIcon(project.iconName)" class="w-4 h-4 text-blue-700" />
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-slate-900 font-display leading-tight">
              {{ project.name }}
            </h3>
          </div>

          <!-- Description (Single rich narrative, no separate "Dirigido a" redundant box) -->
          <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-4">
            {{ project.description }}
          </p>

          <!-- Key Operational Modules (Visible right away) -->
          <div class="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div class="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-amber-500" />
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
          <div class="mb-4 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-[11px] text-slate-700 font-medium leading-relaxed">
            <span class="font-black text-emerald-900 block mb-0.5 uppercase text-[10px] tracking-wider">Impacto en el Negocio:</span>
            <span>{{ project.businessBenefit }}</span>
          </div>

          <!-- Tech Stack Chips -->
          <div class="flex flex-wrap items-center gap-1.5 mb-5 text-[10px] font-bold">
            <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700">
              {{ project.frontendStack }}
            </span>
            <span class="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800">
              {{ project.backendStack }}
            </span>
            <span v-if="project.databaseStack !== 'Sin base de datos requerida'" class="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
              {{ project.databaseStack }}
            </span>
          </div>
        </div>

        <!-- Action Buttons (Internal SEO link & Live Demo) -->
        <div class="pt-4 border-t-2 border-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <NuxtLink 
            :to="'/proyectos/' + project.slug"
            class="comic-btn-secondary w-full sm:w-auto h-12 sm:h-11 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <FileText class="w-4 h-4 text-blue-600" />
            <span>Ver detalles del sistema</span>
          </NuxtLink>

          <a 
            :href="project.demoUrl" 
            target="_blank"
            class="comic-btn-primary w-full sm:w-auto h-12 sm:h-11 px-5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <span>Probar Demo en Vivo</span>
            <ArrowUpRight class="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>

  </section>
</template>
