<script setup lang="ts">
import { ref } from 'vue'
import { projects } from '../../utils/siteData'
import * as LucideIcons from 'lucide-vue-next'
import { ArrowRight, AlertTriangle } from 'lucide-vue-next'

const selectedDemoUrl = ref('')
const showWarningModal = ref(false)

const getIcon = (name: string) => {
  return (LucideIcons as any)[name]
}

const openWarningModal = (url: string) => {
  // Mostrar modal solo en pantallas pequeñas (menor al breakpoint 'lg' de Tailwind: 1024px)
  if (window.innerWidth < 1024) {
    selectedDemoUrl.value = url
    showWarningModal.value = true
  } else {
    // En PC, abrir directamente sin advertencia
    window.open(url, '_blank')
  }
}

const proceedToDemo = () => {
  showWarningModal.value = false
  if (selectedDemoUrl.value) {
    window.open(selectedDemoUrl.value, '_blank')
  }
}
</script>

<template>
  <section id="showcase" class="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 no-print">
    <div class="mb-16 max-w-2xl">
      <h2 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-4">
        Demos y <br/> <span class="text-violet-500">Casos de Éxito.</span>
      </h2>
      <p class="text-lg text-slate-500 dark:text-slate-400">
        Aplicaciones y sistemas 100% interactivos corriendo con bases de datos locales en tu navegador para que pruebes su rendimiento sin esperas.
      </p>
    </div>

    <!-- Premium Alternating Layout (Zig-Zag) -->
    <div class="flex flex-col gap-24 lg:gap-32 mt-16">
      <div 
        v-for="(project, index) in projects" 
        :key="project.name"
        class="group relative flex flex-col lg:flex-row gap-8 lg:gap-16 items-center"
        :class="index % 2 === 1 ? 'lg:flex-row-reverse' : ''"
      >
        <!-- Image Section (60%) -->
        <div class="w-full lg:w-3/5 relative rounded-[2rem] lg:rounded-[3rem] overflow-hidden bg-slate-100 dark:bg-slate-900 aspect-video shadow-2xl shadow-slate-200/50 dark:shadow-black/50 group-hover:shadow-violet-500/10 transition-all duration-700">
          <img 
            :src="project.thumbnail" 
            :alt="`Vista previa de ${project.name}`" 
            class="w-full h-full object-cover object-top transform group-hover:scale-105 group-hover:-translate-y-2 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
            loading="lazy" 
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <!-- Floating Badge -->
          <div class="absolute top-6 left-6 flex items-center gap-2 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/50 dark:border-white/10 shadow-xl transform -translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
             <component :is="getIcon(project.iconName)" class="w-4 h-4 text-violet-600 dark:text-violet-400" />
             <span class="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">{{ project.category }}</span>
          </div>
        </div>

        <!-- Text Section (40%) -->
        <div class="w-full lg:w-2/5 flex flex-col justify-center">
          <!-- Small category tag (visible when badge is hidden) -->
          <div class="flex items-center gap-2 mb-4 lg:hidden">
            <component :is="getIcon(project.iconName)" class="w-4 h-4 text-violet-500" />
            <span class="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">{{ project.category }}</span>
          </div>

          <h3 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
            {{ project.name }}
          </h3>
          
          <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            {{ project.description }}
          </p>

          <!-- Tech Stack -->
          <div class="flex flex-wrap gap-6 mb-12">
            <div class="flex flex-col gap-1 border-l-2 border-violet-500/50 dark:border-violet-500/30 pl-4">
              <span class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Frontend</span>
              <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ project.frontendStack }}</span>
            </div>
            <div class="flex flex-col gap-1 border-l-2 border-violet-500/50 dark:border-violet-500/30 pl-4">
              <span class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Backend</span>
              <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ project.backendStack }}</span>
            </div>
          </div>

          <!-- Action Button -->
          <div class="flex flex-wrap items-center gap-4">
            <a 
              :href="project.demoUrl" 
              @click.prevent="openWarningModal(project.demoUrl)"
              class="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-violet-600 dark:hover:bg-violet-500 hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-violet-500/25 group/btn"
            >
              <span>Probar Demo Interactiva</span>
              <ArrowRight class="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Premium Warning Modal -->
    <div 
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300"
      :class="showWarningModal ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'"
    >
      <div 
        class="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        @click="showWarningModal = false"
      ></div>
      <div 
        class="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300"
        :class="showWarningModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'"
      >
        <div class="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
          <LucideIcons.AlertTriangle class="w-6 h-6" />
        </div>
        
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Recomendación de Visualización</h3>
        <p class="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
          Para una experiencia óptima, te recomendamos visualizar estas demostraciones interactivas desde una computadora (PC o Laptop). Al ser sistemas completos y complejos, están optimizados para pantallas grandes.
        </p>

        <div class="flex flex-col-reverse sm:flex-row gap-3">
          <button 
            @click="showWarningModal = false"
            class="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="proceedToDemo"
            class="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/20"
          >
            Continuar a la Demo
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
