<script setup lang="ts">
import { ref } from 'vue'
import { projects } from '../../utils/siteData'
import * as LucideIcons from 'lucide-vue-next'
import { ArrowUpRight, Code2, Layers, ExternalLink } from 'lucide-vue-next'

const selectedArchProject = ref<any | null>(null)

const getIcon = (name: string) => {
  return (LucideIcons as any)[name] || Layers
}

const openArchModal = (project: any) => {
  selectedArchProject.value = project
}

const closeArchModal = () => {
  selectedArchProject.value = null
}

const featuredProject = projects.find(p => p.name.includes('Clínica')) || projects[0]
const otherProjects = projects.filter(p => p !== featuredProject)
</script>

<template>
  <section id="proyectos" class="relative max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28 select-none">
    
    <!-- Section Header -->
    <div class="mb-14 border-b border-slate-200/80 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="max-w-2xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-3">
          <span>Proyectos y Demos Interactivas</span>
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
          Sistemas Web Desarrollados
        </h2>
        <p class="text-base text-slate-600 mt-3 max-w-xl leading-relaxed">
          Cada aplicación está lista para interactuar. Incluyen datos precargados para que puedas probar altas, bajas, cobros, citas y flujos operativos reales.
        </p>
      </div>

      <div class="text-slate-500 text-xs font-medium max-w-xs leading-relaxed">
        Demostraciones 100% funcionales en navegador con persistencia local instantánea.
      </div>
    </div>

    <!-- Projects Layout -->
    <div class="space-y-8">
      
      <!-- Featured Project Spotlight: Clínica Médica -->
      <div 
        v-if="featuredProject" 
        class="studio-card p-6 sm:p-9 bg-white border border-slate-200 shadow-md shadow-slate-100"
      >
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-6 text-xs">
          <span class="font-bold text-blue-600 uppercase tracking-wider">Proyecto Destacado</span>
          <span class="text-slate-500 font-semibold">{{ featuredProject.category }}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          <!-- Image Frame -->
          <div class="lg:col-span-7 relative group overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 aspect-video shadow-xs">
            <img 
              :src="featuredProject.thumbnail" 
              :alt="featuredProject.name" 
              class="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-103"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="absolute bottom-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-lg text-xs font-semibold text-slate-800 shadow-xs border border-slate-200">
              Demo con datos de prueba
            </div>
          </div>

          <!-- Content Column -->
          <div class="lg:col-span-5 flex flex-col justify-between h-full">
            <div>
              <div class="flex items-center gap-2 mb-3">
                <component :is="getIcon(featuredProject.iconName)" class="w-5 h-5 text-blue-600" />
                <h3 class="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                  {{ featuredProject.name }}
                </h3>
              </div>

              <p class="text-sm text-slate-600 leading-relaxed mb-6">
                {{ featuredProject.description }}
              </p>

              <!-- Technical Tags -->
              <div class="grid grid-cols-2 gap-3 mb-6 text-xs">
                <div class="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span class="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">Frontend</span>
                  <span class="text-slate-800 font-bold">{{ featuredProject.frontendStack }}</span>
                </div>
                <div class="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span class="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">Backend / BD</span>
                  <span class="text-blue-600 font-bold">{{ featuredProject.databaseStack }}</span>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
              <a 
                :href="featuredProject.demoUrl" 
                target="_blank"
                class="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 active:scale-95 transition-all shadow-xs"
              >
                <span>Probar Demo en Vivo</span>
                <ArrowUpRight class="w-3.5 h-3.5" />
              </a>

              <button 
                @click="openArchModal(featuredProject)"
                class="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <Code2 class="w-3.5 h-3.5 text-blue-600" />
                <span>Especificaciones</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Other Projects Grid (2 Columns) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <div 
          v-for="project in otherProjects" 
          :key="project.name"
          class="studio-card p-6 bg-white border border-slate-200 flex flex-col justify-between shadow-xs"
        >
          <div>
            <div class="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-4 text-xs">
              <span class="font-semibold text-slate-500">{{ project.category }}</span>
              <span class="text-blue-600 font-semibold">{{ project.frontendStack }}</span>
            </div>

            <div class="relative overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 aspect-video mb-5 group">
              <img 
                :src="project.thumbnail" 
                :alt="project.name" 
                class="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-103"
                loading="lazy"
              />
            </div>

            <div class="flex items-center gap-2 mb-2">
              <component :is="getIcon(project.iconName)" class="w-4 h-4 text-blue-600" />
              <h3 class="text-xl font-bold text-slate-900 font-display">
                {{ project.name }}
              </h3>
            </div>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              {{ project.description }}
            </p>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button 
              @click="openArchModal(project)"
              class="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Code2 class="w-3.5 h-3.5 text-blue-600" />
              <span>Ver Arquitectura</span>
            </button>

            <a 
              :href="project.demoUrl" 
              target="_blank"
              class="flex items-center gap-1 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <span>Lanzar Demo</span>
              <ArrowUpRight class="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

    </div>

    <!-- Architecture Modal -->
    <div 
      v-if="selectedArchProject" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeArchModal"
    >
      <div class="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl relative font-sans text-xs">
        
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <span class="text-slate-900 font-bold text-sm">
              Detalles Técnicos: {{ selectedArchProject.name }}
            </span>
          </div>
          <button 
            @click="closeArchModal"
            class="text-slate-400 hover:text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 text-xs cursor-pointer"
          >
            Cerrar
          </button>
        </div>

        <div class="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <span class="text-slate-800 font-bold text-xs block mb-1.5">Esquema de Base de Datos</span>
            <pre class="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed"><code>{{ selectedArchProject.architectureDetails.schemaDetails }}</code></pre>
          </div>

          <div>
            <span class="text-slate-800 font-bold text-xs block mb-1.5">Lógica de Servidor / Controlador</span>
            <pre class="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed"><code>{{ selectedArchProject.architectureDetails.controllerCode }}</code></pre>
          </div>
        </div>

        <div class="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <a 
            :href="selectedArchProject.demoUrl" 
            target="_blank"
            class="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
          >
            Abrir Demo en Vivo &rarr;
          </a>
        </div>

      </div>
    </div>

  </section>
</template>
