<script setup lang="ts">
import { ref } from 'vue'
import { projects } from '../../utils/siteData'
import type { ProjectDemo } from '../../utils/siteData'
import * as LucideIcons from 'lucide-vue-next'
import { 
  ArrowUpRight, 
  Layers, 
  FileText, 
  CheckCircle2, 
  X, 
  Building2, 
  Sparkles, 
  Cpu, 
  MessageSquare 
} from 'lucide-vue-next'

const selectedProject = ref<ProjectDemo | null>(null)
const selectedViñetaNum = ref<string>('')

const getIcon = (name: string) => {
  return (LucideIcons as any)[name] || Layers
}

const openModal = (project: ProjectDemo, index: number) => {
  selectedProject.value = project
  selectedViñetaNum.value = String(index + 1).padStart(2, '0')
}

const closeModal = () => {
  selectedProject.value = null
  selectedViñetaNum.value = ''
}
</script>

<template>
  <section id="proyectos" class="relative max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28 select-none">
    
    <!-- Section Comic Header -->
    <div class="mb-14 border-b-2 border-slate-900 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="max-w-2xl">
        <div class="comic-caption mb-3">
          <span>CAPÍTULO 01 // CATÁLOGO DE SISTEMAS EN VIVO</span>
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-display uppercase leading-tight">
          Sistemas Web Desarrollados
        </h2>
        <p class="text-base sm:text-lg text-slate-700 mt-3 max-w-xl font-medium leading-relaxed">
          Cada viñeta representa una solución completa. Cuentan con datos precargados para que puedas probar altas, bajas, citas, cobros y flujos operativos reales directamente en tu navegador.
        </p>
      </div>

      <div class="comic-panel-flat p-4 bg-yellow-50 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] max-w-xs">
        <div class="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5 mb-1">
          <Sparkles class="w-3.5 h-3.5 text-blue-600" />
          <span>Demos 100% Interactivas</span>
        </div>
        <p class="text-[11px] text-slate-600 leading-normal">
          Sin registros previos. Accede al portal público o al panel administrativo con un solo clic.
        </p>
      </div>
    </div>

    <!-- Uniform Comic Storyboard Grid: All 7 projects treated equally -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
      
      <div 
        v-for="(project, index) in projects" 
        :key="project.name"
        class="comic-panel p-6 sm:p-7 bg-white flex flex-col justify-between"
      >
        <div>
          <!-- Panel Header -->
          <div class="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-5 gap-2">
            <div class="flex items-center gap-2">
              <span class="comic-caption bg-yellow-200">
                VIÑETA {{ String(index + 1).padStart(2, '0') }}
              </span>
              <span class="comic-pill text-[11px] font-bold">
                {{ project.category }}
              </span>
            </div>
            
            <div class="hidden sm:block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Demo Operativa
            </div>
          </div>

          <!-- Thumbnail with Comic Border -->
          <div class="relative overflow-hidden rounded-xl border-2 border-slate-900 bg-slate-100 aspect-video mb-5 group shadow-[3px_3px_0px_#0f172a]">
            <img 
              :src="project.thumbnail" 
              :alt="project.name" 
              class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-103"
              loading="lazy"
            />
            <div class="absolute bottom-2.5 left-2.5 px-3 py-1 bg-white border-2 border-slate-900 rounded-md text-[11px] font-black uppercase text-slate-900 shadow-[2px_2px_0px_#0f172a]">
              Datos Precargados
            </div>
          </div>

          <!-- Title & Icon -->
          <div class="flex items-start gap-2.5 mb-3">
            <div class="w-8 h-8 rounded-lg bg-blue-100 border-2 border-slate-900 flex items-center justify-center shrink-0 mt-0.5 shadow-[2px_2px_0px_#0f172a]">
              <component :is="getIcon(project.iconName)" class="w-4 h-4 text-blue-700" />
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-slate-900 font-display leading-tight">
              {{ project.name }}
            </h3>
          </div>

          <!-- Target Audience Box -->
          <div class="mb-3.5 p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs">
            <span class="font-black text-blue-900 block mb-0.5">🎯 Dirigido a:</span>
            <span class="text-slate-700 font-medium leading-relaxed">{{ project.targetAudience }}</span>
          </div>

          <!-- Business Description -->
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 font-medium">
            {{ project.description }}
          </p>

          <!-- Tech Stack Pills -->
          <div class="grid grid-cols-2 gap-2 text-[11px] mb-5">
            <div class="p-2 rounded bg-slate-50 border border-slate-200">
              <span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Frontend</span>
              <span class="text-slate-800 font-bold truncate block">{{ project.frontendStack }}</span>
            </div>
            <div class="p-2 rounded bg-slate-50 border border-slate-200">
              <span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Backend / BD</span>
              <span class="text-blue-700 font-bold truncate block">{{ project.databaseStack }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 border-t-2 border-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button 
            @click="openModal(project, index)"
            class="comic-btn-secondary w-full sm:w-auto px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <FileText class="w-3.5 h-3.5 text-blue-600" />
            <span>Ficha &amp; Módulos</span>
          </button>

          <a 
            :href="project.demoUrl" 
            target="_blank"
            class="comic-btn-primary w-full sm:w-auto px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <span>Probar Demo</span>
            <ArrowUpRight class="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

    </div>

    <!-- BUSINESS & MODULES MODAL (Zero raw SQL/code dumps) -->
    <div 
      v-if="selectedProject" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs"
      @click.self="closeModal"
    >
      <div class="w-full max-w-2xl bg-[#faf9f6] border-2 border-slate-900 rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_#0f172a] relative font-sans text-xs">
        
        <!-- Modal Top Bar -->
        <div class="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-5">
          <div class="flex items-center gap-2">
            <span class="comic-caption bg-yellow-200">
              VIÑETA {{ selectedViñetaNum }}
            </span>
            <span class="text-slate-900 font-black text-sm uppercase font-display">
              Ficha del Sistema &bull; {{ selectedProject.name }}
            </span>
          </div>

          <button 
            @click="closeModal"
            class="w-8 h-8 rounded-lg bg-white border-2 border-slate-900 flex items-center justify-center text-slate-800 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer shadow-[2px_2px_0px_#0f172a]"
            aria-label="Cerrar modal"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Scrollable Content -->
        <div class="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
          
          <!-- 1. A qué negocios está dirigido -->
          <div class="p-4 rounded-xl bg-blue-50/70 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]">
            <div class="flex items-center gap-2 text-blue-900 font-black text-xs uppercase mb-1.5">
              <Building2 class="w-4 h-4 text-blue-600" />
              <span>¿A qué negocios está dirigido?</span>
            </div>
            <p class="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">
              {{ selectedProject.targetAudience }}
            </p>
          </div>

          <!-- 2. De qué trata el sistema -->
          <div>
            <h4 class="text-slate-900 font-black text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers class="w-4 h-4 text-slate-700" />
              <span>Resumen Operativo del Sistema</span>
            </h4>
            <p class="text-slate-700 text-xs leading-relaxed font-medium">
              {{ selectedProject.description }}
            </p>
          </div>

          <!-- 3. Módulos y Flujos Incluidos -->
          <div>
            <h4 class="text-slate-900 font-black text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-amber-600" />
              <span>Módulos y Flujos de Trabajo Incluidos</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div 
                v-for="item in selectedProject.highlights" 
                :key="item"
                class="p-2.5 rounded-lg bg-white border border-slate-300 flex items-start gap-2 shadow-xs"
              >
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span class="text-slate-700 font-semibold text-[11px] leading-tight">{{ item }}</span>
              </div>
            </div>
          </div>

          <!-- 4. Beneficio Comercial -->
          <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span class="text-emerald-900 font-black text-xs uppercase block mb-1">
              💡 Beneficio e Impacto en el Negocio:
            </span>
            <p class="text-slate-700 text-xs font-medium leading-relaxed">
              {{ selectedProject.businessBenefit }}
            </p>
          </div>

          <!-- 5. Tecnologías Implementadas (Explicación técnica limpia) -->
          <div class="p-3.5 rounded-xl bg-slate-100 border border-slate-300">
            <span class="text-slate-900 font-black text-xs uppercase block mb-2 flex items-center gap-1.5">
              <Cpu class="w-4 h-4 text-slate-700" />
              <span>Arquitectura &amp; Tecnologías</span>
            </span>
            <div class="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span class="text-slate-400 font-bold block uppercase text-[9px]">Frontend</span>
                <span class="font-bold text-slate-800">{{ selectedProject.frontendStack }}</span>
              </div>
              <div>
                <span class="text-slate-400 font-bold block uppercase text-[9px]">Backend</span>
                <span class="font-bold text-slate-800">{{ selectedProject.backendStack }}</span>
              </div>
              <div>
                <span class="text-slate-400 font-bold block uppercase text-[9px]">Persistencia</span>
                <span class="font-bold text-blue-700">{{ selectedProject.databaseStack }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Modal Bottom Actions -->
        <div class="mt-6 pt-4 border-t-2 border-slate-900 flex flex-wrap items-center justify-between gap-3">
          <a 
            :href="'https://wa.me/59168787985?text=' + encodeURIComponent('Hola Rogelio, me interesa saber más sobre el ' + selectedProject.name)"
            target="_blank"
            class="comic-btn-secondary px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
          >
            <MessageSquare class="w-3.5 h-3.5 text-emerald-600" />
            <span>Consultar por WhatsApp</span>
          </a>

          <a 
            :href="selectedProject.demoUrl" 
            target="_blank"
            class="comic-btn-primary px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
          >
            <span>Abrir Demo en Vivo</span>
            <ArrowUpRight class="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>

  </section>
</template>