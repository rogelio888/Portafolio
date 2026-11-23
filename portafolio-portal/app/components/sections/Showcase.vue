<script setup lang="ts">
import { ref } from 'vue'
import { projects } from '../../utils/siteData'
import * as LucideIcons from 'lucide-vue-next'
import { ArrowUpRight, Code2, Database, Shield, Layers, Terminal, ExternalLink, Play, CheckCircle } from 'lucide-vue-next'

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

// Separate featured hero project (Clinica Medica) from the rest
const featuredProject = projects.find(p => p.name.includes('Clínica')) || projects[0]
const otherProjects = projects.filter(p => p !== featuredProject)
</script>

<template>
  <section id="sistemas" class="relative max-w-[1440px] mx-auto px-6 lg:px-12 py-20 lg:py-28 select-none">
    
    <!-- Chapter Header / Comic Registration Title -->
    <div class="mb-16 border-b border-neutral-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="max-w-2xl">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-[#ff5722] font-bold uppercase tracking-widest mb-3">
          <span>CAPÍTULO 01</span>
          <span class="text-neutral-600">//</span>
          <span class="text-neutral-300">SISTEMAS &amp; ARQUITECTURAS</span>
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase font-display leading-[1.05]">
          Casos de Estudio <br />
          <span class="text-neutral-400 font-mono text-2xl sm:text-3xl font-normal lowercase">
            // aplicaciones reales en producción
          </span>
        </h2>
      </div>

      <div class="text-neutral-400 text-xs font-mono max-w-sm leading-relaxed">
        <p>
          Cada sistema corre de forma autónoma con datos mock reactivos precargados. Puedes iniciar sesión, crear registros, emitir cobros y explorar flujos de punta a punta.
        </p>
      </div>
    </div>

    <!-- Asymmetrical Graphic Novel Panels Layout -->
    <div class="space-y-8">
      
      <!-- FEATURE SPOTLIGHT PANEL (Full Width): Clínica Médica -->
      <div 
        v-if="featuredProject" 
        class="comic-panel p-6 sm:p-8 bg-[#0c0e16] border-2 border-neutral-700/80 shadow-ink"
      >
        <div class="flex items-center justify-between border-b border-neutral-800 pb-3 mb-6 font-mono text-[10px]">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 bg-[#ff5722]"></span>
            <span class="font-bold text-white uppercase tracking-wider">PANEL PRINCIPAL // SPOTLIGHT</span>
          </div>
          <span class="text-[#06b6d4] uppercase font-bold tracking-widest">{{ featuredProject.category }}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- Image Mockup Frame -->
          <div class="lg:col-span-7 relative group overflow-hidden border border-neutral-800 bg-neutral-950 aspect-video">
            <img 
              :src="featuredProject.thumbnail" 
              :alt="featuredProject.name" 
              class="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-neutral-300 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 border border-neutral-700">
              <span class="text-emerald-400 font-bold">&bull; BASE DE DATOS MOCK LISTA</span>
              <span class="text-neutral-400">{{ featuredProject.frontendStack }}</span>
            </div>
          </div>

          <!-- Description & Technical Info -->
          <div class="lg:col-span-5 flex flex-col justify-between h-full">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <component :is="getIcon(featuredProject.iconName)" class="w-5 h-5 text-[#ff5722]" />
                <h3 class="text-2xl sm:text-3xl font-black text-white uppercase font-display">
                  {{ featuredProject.name }}
                </h3>
              </div>

              <p class="text-sm text-neutral-300 font-sans leading-relaxed mb-6">
                {{ featuredProject.description }}
              </p>

              <!-- Stack Breakdown -->
              <div class="grid grid-cols-2 gap-3 mb-6 font-mono text-[11px]">
                <div class="p-2.5 bg-neutral-950 border border-neutral-800">
                  <span class="text-[9px] text-neutral-500 block uppercase">FRONTEND</span>
                  <span class="text-white font-bold">{{ featuredProject.frontendStack }}</span>
                </div>
                <div class="p-2.5 bg-neutral-950 border border-neutral-800">
                  <span class="text-[9px] text-neutral-500 block uppercase">BACKEND / BD</span>
                  <span class="text-[#06b6d4] font-bold">{{ featuredProject.databaseStack }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-neutral-800">
              <a 
                :href="featuredProject.demoUrl" 
                target="_blank"
                class="flex items-center gap-2 px-5 py-2.5 bg-[#ff5722] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#ff6f3d] transition-colors shadow-ink-accent"
              >
                <span>PROBAR DEMO EN VIVO</span>
                <ArrowUpRight class="w-3.5 h-3.5" />
              </a>

              <button 
                @click="openArchModal(featuredProject)"
                class="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono text-xs uppercase hover:text-white hover:border-[#06b6d4] transition-colors cursor-pointer"
              >
                <Code2 class="w-3.5 h-3.5 text-[#06b6d4]" />
                <span>ARQUITECTURA</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- GRID OF OTHER BESPOKE SYSTEMS (2 Columns) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <div 
          v-for="(project, idx) in otherProjects" 
          :key="project.name"
          class="comic-panel p-6 bg-[#0c0e16] border border-neutral-700/80 shadow-ink flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between border-b border-neutral-800 pb-2.5 mb-4 font-mono text-[10px]">
              <span class="font-bold text-white uppercase tracking-wider">PANEL // CASO 0{{ idx + 2 }}</span>
              <span class="text-[#06b6d4] font-bold uppercase">{{ project.category }}</span>
            </div>

            <div class="relative overflow-hidden border border-neutral-800 bg-neutral-950 aspect-video mb-5 group">
              <img 
                :src="project.thumbnail" 
                :alt="project.name" 
                class="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div class="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 font-mono text-[9px] text-neutral-300">
                {{ project.frontendStack }}
              </div>
            </div>

            <div class="flex items-center gap-2 mb-2">
              <component :is="getIcon(project.iconName)" class="w-4 h-4 text-[#ff5722]" />
              <h3 class="text-xl font-black text-white uppercase font-display">
                {{ project.name }}
              </h3>
            </div>

            <p class="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed mb-4">
              {{ project.description }}
            </p>
          </div>

          <div class="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <button 
              @click="openArchModal(project)"
              class="text-[11px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Code2 class="w-3.5 h-3.5 text-[#06b6d4]" />
              <span>Ver Especificaciones</span>
            </button>

            <a 
              :href="project.demoUrl" 
              target="_blank"
              class="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 border border-neutral-700 text-white font-mono text-xs uppercase hover:border-[#ff5722] transition-colors"
            >
              <span>LANZAR DEMO</span>
              <ArrowUpRight class="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

    </div>

    <!-- ARCHITECTURE / CODE MODAL (Bespoke Blueprint Drawer) -->
    <div 
      v-if="selectedArchProject" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
      @click.self="closeArchModal"
    >
      <div class="w-full max-w-3xl bg-[#090b10] border-2 border-[#ff5722] p-6 shadow-2xl relative font-mono text-xs">
        
        <!-- Modal Top Bar -->
        <div class="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-[#06b6d4]"></span>
            <span class="text-white font-bold uppercase tracking-wider">
              BLUEPRINT: {{ selectedArchProject.name }}
            </span>
          </div>
          <button 
            @click="closeArchModal"
            class="text-neutral-400 hover:text-white px-2 py-0.5 border border-neutral-700 text-xs cursor-pointer"
          >
            ✕ CERRAR
          </button>
        </div>

        <!-- Architecture Content -->
        <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          
          <div>
            <span class="text-[#ff5722] font-bold block mb-1">// ESQUEMA DE BASE DE DATOS (DDL / SQL)</span>
            <pre class="bg-neutral-950 p-4 border border-neutral-800 text-neutral-300 text-[11px] overflow-x-auto"><code>{{ selectedArchProject.architectureDetails.schemaDetails }}</code></pre>
          </div>

          <div>
            <span class="text-[#06b6d4] font-bold block mb-1">// CONTROLADOR / LÓGICA DE SERVIDOR</span>
            <pre class="bg-neutral-950 p-4 border border-neutral-800 text-neutral-300 text-[11px] overflow-x-auto"><code>{{ selectedArchProject.architectureDetails.controllerCode }}</code></pre>
          </div>

        </div>

        <div class="mt-4 pt-3 border-t border-neutral-800 flex justify-end">
          <a 
            :href="selectedArchProject.demoUrl" 
            target="_blank"
            class="px-4 py-2 bg-[#ff5722] text-white font-bold uppercase text-xs hover:bg-[#ff6f3d]"
          >
            ABRIR DEMO CORRESPONDIENTE &rarr;
          </a>
        </div>

      </div>
    </div>

  </section>
</template>
