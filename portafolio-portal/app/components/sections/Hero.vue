<script setup lang="ts">
import { ref } from 'vue'
import { ArrowDownRight, Terminal, Cpu, Database, CheckCircle2, Shield, Zap, Code2, ExternalLink } from 'lucide-vue-next'

const activeTab = ref<'specs' | 'architecture' | 'metrics'>('specs')

const copySnippet = ref(false)
const copySnippetText = () => {
  navigator.clipboard?.writeText('npm run dev')
  copySnippet.value = true
  setTimeout(() => copySnippet.value = false, 2000)
}
</script>

<template>
  <section class="relative w-full h-full min-h-0 lg:min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-12 pt-24 sm:pt-28 pb-12 lg:py-0 select-none">
    
    <div class="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
      
      <!-- Left Column: Typography, Narrative & High-Impact Callouts -->
      <div class="lg:col-span-7 flex flex-col items-start text-left">
        
        <!-- Graphic Novel Issue Header Tag -->
        <div class="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-none border border-neutral-700 bg-neutral-900/90 text-neutral-300 text-[10px] font-mono tracking-widest uppercase mb-4 sm:mb-5 shadow-ink">
          <span class="w-2 h-2 bg-[#ff5722] inline-block animate-pulse"></span>
          <span class="font-extrabold text-[#ff5722]">VOL. 2026</span>
          <span class="text-neutral-500">//</span>
          <span class="font-semibold text-neutral-200">DOSSIER DE INGENIERÍA & PRODUCTO</span>
        </div>

        <!-- Main Headline (Bespoke, Anti-AI Slop) -->
        <h1 class="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] mb-5 sm:mb-6 font-display uppercase">
          Sistemas Web <br />
          <span class="text-[#ff5722] underline decoration-neutral-800 decoration-4 underline-offset-8">
            de Alto Rendimiento
          </span>
          <span class="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-mono text-neutral-400 font-normal tracking-normal mt-2 lowercase text-left">
            // código artesanal sin plantillas
          </span>
        </h1>
        
        <!-- Subtitle / Value Proposition -->
        <p class="text-sm sm:text-base lg:text-lg text-neutral-300 max-w-2xl leading-relaxed mb-8 font-sans font-normal border-l-2 border-[#ff5722] pl-4 bg-neutral-900/30 py-1">
          Diseño y construyo aplicaciones web completas: plataformas clínicas, sistemas de cobro recurrente, telemetría de flota industrial y sitios corporativos. Interfaces reactivas con datos locales para que pruebes cada demo sin latencia.
        </p>

        <!-- CTA Action Buttons with Ink Shadows -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-8">
          <a 
            href="#sistemas" 
            class="group flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#ff5722] text-white font-mono text-xs font-black uppercase tracking-wider hover:bg-[#ff6f3d] active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-ink-accent"
          >
            <span>[ ABRIR CAPÍTULO 01: DEMOS ]</span>
            <ArrowDownRight class="w-4 h-4 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
          </a>

          <a 
            href="https://wa.me/59168787985" 
            target="_blank"
            class="flex items-center justify-center gap-2 px-6 py-3.5 bg-neutral-900 text-neutral-200 border border-neutral-700 font-mono text-xs font-bold uppercase tracking-wider hover:border-[#06b6d4] hover:text-white transition-all shadow-ink"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>WHATSAPP DIRECTO</span>
          </a>
        </div>

        <!-- Bottom Technical Micro-Specs -->
        <div class="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-800/80 w-full max-w-xl text-[10px] font-mono text-neutral-400">
          <div>
            <span class="text-neutral-500 block">ARQUITECTURA</span>
            <span class="text-neutral-200 font-bold">Full-Stack SSR</span>
          </div>
          <div>
            <span class="text-neutral-500 block">PERSISTENCIA</span>
            <span class="text-neutral-200 font-bold">SQL & Offline Mock</span>
          </div>
          <div>
            <span class="text-neutral-500 block">DESPLIEGUE</span>
            <span class="text-neutral-200 font-bold">Edge Nuxt 4</span>
          </div>
        </div>

      </div>

      <!-- Right Column: The Blueprint Engineering Frame (Comic Technical Panel) -->
      <div class="lg:col-span-5 relative w-full">
        
        <!-- Registration Corner Marks -->
        <div class="absolute -top-3 -left-3 w-4 h-4 border-t-2 border-l-2 border-[#ff5722] pointer-events-none z-20"></div>
        <div class="absolute -bottom-3 -right-3 w-4 h-4 border-b-2 border-r-2 border-[#06b6d4] pointer-events-none z-20"></div>

        <!-- The Comic Blueprint Container -->
        <div class="comic-panel rounded-none p-5 sm:p-6 bg-[#0c0e15] border-2 border-neutral-700/80 shadow-ink">
          
          <!-- Top Window Bar with Comic Frame Coordinates -->
          <div class="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4 font-mono text-[10px]">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 bg-[#ff5722]"></span>
              <span class="font-bold text-neutral-200 tracking-wider">FIG 01 // ESQUEMA DE PRODUCCIÓN</span>
            </div>
            <span class="text-[#06b6d4] tracking-widest font-bold">LATENCIA: 12ms</span>
          </div>

          <!-- Interactive Tab Switcher -->
          <div class="grid grid-cols-3 gap-1 bg-neutral-950 p-1 border border-neutral-800 mb-4 font-mono text-[10px]">
            <button 
              @click="activeTab = 'specs'"
              :class="activeTab === 'specs' ? 'bg-[#ff5722] text-white font-bold' : 'text-neutral-400 hover:text-neutral-200'"
              class="py-1.5 px-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer uppercase"
            >
              <Cpu class="w-3 h-3" />
              <span>Specs</span>
            </button>
            <button 
              @click="activeTab = 'architecture'"
              :class="activeTab === 'architecture' ? 'bg-[#ff5722] text-white font-bold' : 'text-neutral-400 hover:text-neutral-200'"
              class="py-1.5 px-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer uppercase"
            >
              <Terminal class="w-3 h-3" />
              <span>Arquitectura</span>
            </button>
            <button 
              @click="activeTab = 'metrics'"
              :class="activeTab === 'metrics' ? 'bg-[#ff5722] text-white font-bold' : 'text-neutral-400 hover:text-neutral-200'"
              class="py-1.5 px-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer uppercase"
            >
              <Zap class="w-3 h-3" />
              <span>Métricas</span>
            </button>
          </div>

          <!-- Dynamic Panel Content -->
          <div class="min-h-[170px] bg-neutral-950/70 border border-neutral-800/80 p-4 font-mono text-xs">
            
            <!-- Tab 1: Specs -->
            <div v-if="activeTab === 'specs'" class="space-y-2.5">
              <div class="flex items-center justify-between text-neutral-300 text-[11px] pb-1 border-b border-neutral-900">
                <span class="text-neutral-400">Motor Frontend:</span>
                <span class="text-white font-bold">Nuxt 4 / Vue 3 / React</span>
              </div>
              <div class="flex items-center justify-between text-neutral-300 text-[11px] pb-1 border-b border-neutral-900">
                <span class="text-neutral-400">Bases de Datos:</span>
                <span class="text-[#06b6d4] font-bold">Supabase PostgreSQL / SQL Server</span>
              </div>
              <div class="flex items-center justify-between text-neutral-300 text-[11px] pb-1 border-b border-neutral-900">
                <span class="text-neutral-400">Seguridad:</span>
                <span class="text-emerald-400 font-bold">Sanitización & Zero-Trust</span>
              </div>
              <div class="flex items-center justify-between text-neutral-300 text-[11px]">
                <span class="text-neutral-400">Animación Física:</span>
                <span class="text-[#ff5722] font-bold">Motion &lt; 300ms</span>
              </div>
            </div>

            <!-- Tab 2: Architecture -->
            <div v-else-if="activeTab === 'architecture'" class="space-y-2 text-[11px] text-neutral-300">
              <div class="text-[10px] text-[#ff5722] font-bold uppercase tracking-wider">// FLUJO CLIENTE-SERVIDOR REACTIVO</div>
              <p class="leading-relaxed text-neutral-400 text-[11px]">
                Cada sistema funciona con persistencia bidireccional: si hay backend disponible sincroniza vía API REST / GraphQL; si se usa en modo demo, conmuta instantáneamente al mock local sin romper la experiencia.
              </p>
              <div class="flex items-center gap-2 pt-1 text-[10px] text-[#06b6d4]">
                <Shield class="w-3 h-3" />
                <span>Control de roles RBAC & Token Auth</span>
              </div>
            </div>

            <!-- Tab 3: Metrics -->
            <div v-else class="space-y-3">
              <div>
                <div class="flex justify-between text-[11px] mb-1 font-bold">
                  <span class="text-neutral-300">Lighthouse Performance</span>
                  <span class="text-emerald-400">100 / 100</span>
                </div>
                <div class="w-full h-1.5 bg-neutral-800">
                  <div class="h-full bg-emerald-500 w-full"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-[11px] mb-1 font-bold">
                  <span class="text-neutral-300">Core Web Vitals (CLS & LCP)</span>
                  <span class="text-[#06b6d4]">0.00 CLS &bull; 0.4s LCP</span>
                </div>
                <div class="w-full h-1.5 bg-neutral-800">
                  <div class="h-full bg-[#06b6d4] w-full"></div>
                </div>
              </div>
              <p class="text-[10px] text-neutral-500 pt-1">
                Optimizado para carga instantánea en cualquier conexión móvil o de escritorio.
              </p>
            </div>

          </div>

          <!-- Bottom Status Pill in Frame -->
          <div class="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono">
            <span class="text-neutral-400 flex items-center gap-1.5">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" />
              <span>4 PLATAFORMAS LISTAS</span>
            </span>
            <a href="#sistemas" class="text-[#ff5722] hover:underline font-bold flex items-center gap-1">
              <span>VER CADA SISTEMA</span>
              <span>&rarr;</span>
            </a>
          </div>

        </div>

      </div>

    </div>

    <!-- Scroll Indicator Bottom Anchor -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 text-neutral-500 text-[10px] font-mono tracking-widest uppercase pointer-events-none">
      <span class="text-[#ff5722] animate-bounce">&darr;</span>
      <span>DESLIZA PARA CUBRIR HERO // CAPÍTULO 01</span>
    </div>

  </section>
</template>
