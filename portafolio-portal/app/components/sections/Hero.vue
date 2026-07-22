<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight, Sparkles, Activity, ShieldCheck, Zap, Code2, Server, CheckCircle2 } from 'lucide-vue-next'

const activeTab = ref<'speed' | 'security' | 'architecture'>('speed')
</script>

<template>
  <section class="relative pt-28 sm:pt-36 lg:pt-40 pb-12 md:pb-16 lg:pb-24 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto min-h-0 lg:min-h-[80vh] flex items-center no-print">
    
    <!-- Ambient Glow Backdrops -->
    <div class="absolute top-0 right-0 w-[55vw] h-[55vh] bg-violet-600/20 dark:bg-violet-600/25 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none -z-10"></div>
    <div class="absolute bottom-0 left-[-10%] w-[45vw] h-[45vh] bg-fuchsia-600/20 dark:bg-fuchsia-600/25 blur-[130px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none -z-10"></div>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
      
      <!-- Left Column: Typography & CTAs -->
      <div class="md:col-span-7 flex flex-col items-start text-left z-10">
        
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/25 text-violet-600 dark:text-violet-400 text-xs font-extrabold tracking-widest uppercase mb-5 lg:mb-6 shadow-sm">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Diseño a Medida &amp; Cotizador Interactivo</span>
        </div>

        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-[0.95] mb-5 lg:mb-6 font-display">
          Tu presencia <br />
          <span class="bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 dark:from-violet-400 dark:via-purple-300 dark:to-fuchsia-400 bg-clip-text text-transparent">digital elevada.</span>
        </h1>
        
        <p class="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mb-8 lg:mb-10 font-normal">
          Transformamos ideas complejas en experiencias web premium. Desde sitios corporativos hasta sistemas SaaS interactivos. Evalúa nuestras demos y cotiza en tiempo real.
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a href="#showcase" class="group flex items-center justify-center gap-2.5 h-13 sm:h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-sm hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto shadow-xl shadow-slate-900/20 dark:shadow-white/10">
            Explorar Demos
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="#cotizador" class="flex items-center justify-center h-13 sm:h-14 px-8 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-sm border-2 border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 w-full sm:w-auto">
            Calculadora de Precios
          </a>
        </div>
      </div>

      <!-- Right Column: Bespoke System Showcase Window (Unique, Non-Generic Architecture Composition) -->
      <div class="md:col-span-5 relative w-full z-10 mt-6 md:mt-0">
        
        <!-- Ambient Backdrop Neon Aura -->
        <div class="absolute -inset-1.5 rounded-[32px] bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-indigo-600 opacity-30 blur-2xl pointer-events-none"></div>

        <!-- Top Floating Status Pill -->
        <div class="absolute -top-4 right-4 z-20 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-xl border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider shadow-lg hover:scale-105 transition-transform duration-300">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Edge SSR Latencia: 12ms</span>
        </div>

        <!-- Main Bespoke Glass Card Container -->
        <div class="relative w-full rounded-[28px] bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-violet-500/30 p-5 md:p-6 shadow-2xl shadow-violet-950/50 space-y-4">
          
          <!-- Card Header & Active Project Identifier -->
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Code2 class="w-4 h-4" />
              </div>
              <div>
                <div class="text-xs font-black text-white tracking-wide font-heading">SISTEMA WEB A MEDIDA</div>
                <div class="text-[10px] text-slate-400 font-semibold">Arquitectura Enterprise Nuxt 4</div>
              </div>
            </div>
            <span class="text-[9px] font-extrabold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md uppercase">PRO</span>
          </div>

          <!-- Interactive Tab Selector -->
          <div class="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold">
            <button 
              @click="activeTab = 'speed'"
              :class="activeTab === 'speed' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
              class="py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Zap class="w-3 h-3" /> Velocidad
            </button>
            <button 
              @click="activeTab = 'security'"
              :class="activeTab === 'security' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
              class="py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <ShieldCheck class="w-3 h-3" /> Seguridad
            </button>
            <button 
              @click="activeTab = 'architecture'"
              :class="activeTab === 'architecture' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
              class="py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Server class="w-3 h-3" /> Stack
            </button>
          </div>

          <!-- Tab Content Panel -->
          <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 min-h-[110px] flex flex-col justify-center">
            
            <!-- Speed Tab -->
            <div v-if="activeTab === 'speed'" class="space-y-2.5">
              <div class="flex items-center justify-between text-xs font-bold text-slate-200">
                <span class="flex items-center gap-1.5 text-slate-300">
                  <Activity class="w-3.5 h-3.5 text-violet-400" /> Rendimiento Lighthouse
                </span>
                <span class="text-emerald-400 font-mono font-bold">100 / 100</span>
              </div>
              <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 w-full rounded-full animate-pulse"></div>
              </div>
              <div class="flex justify-between text-[10px] text-slate-400 font-semibold pt-1">
                <span>FCP: 0.3s</span>
                <span>LCP: 0.7s</span>
                <span>CLS: 0.00</span>
              </div>
            </div>

            <!-- Security Tab -->
            <div v-else-if="activeTab === 'security'" class="space-y-2">
              <div class="flex items-center justify-between text-xs font-bold text-slate-200">
                <span class="text-violet-400 font-bold">Protección de Datos & Auth</span>
                <span class="text-emerald-400 text-[10px] font-extrabold uppercase">Encriptado AES-256</span>
              </div>
              <div class="text-[11px] text-slate-300 space-y-1">
                <div class="flex items-center gap-1.5"><CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" /> Autenticación JWT / Sessions</div>
                <div class="flex items-center gap-1.5"><CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" /> Sanitización contra XSS & SQLi</div>
              </div>
            </div>

            <!-- Architecture Tab -->
            <div v-else class="grid grid-cols-2 gap-2 text-[11px]">
              <div class="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span class="text-[9px] font-extrabold text-slate-400 uppercase block">Frontend</span>
                <span class="font-bold text-white">Nuxt 4 + Vue 3</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span class="text-[9px] font-extrabold text-slate-400 uppercase block">Backend</span>
                <span class="font-bold text-white">Laravel / Node API</span>
              </div>
            </div>

          </div>

          <!-- Bottom Guarantee Badge Pill -->
          <div class="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
            <span class="flex items-center gap-1 text-slate-300">
              <CheckCircle2 class="w-3.5 h-3.5 text-violet-400" /> Código 100% Limpio y Escalable
            </span>
            <a href="#cotizador" class="text-violet-400 hover:text-violet-300 font-extrabold transition-colors">
              Probar Cotizador →
            </a>
          </div>

        </div>

      </div>
      
    </div>
  </section>
</template>
