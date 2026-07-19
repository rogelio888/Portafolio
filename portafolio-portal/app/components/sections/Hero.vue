<script setup lang="ts">
import { ArrowRight, Sparkles, Layers, Activity } from 'lucide-vue-next'
</script>

<template>
  <section class="relative pt-40 pb-20 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto min-h-[90vh] flex items-center">
    
    <!-- Decorative Ambient Glows -->
    <div class="absolute top-0 right-0 w-[50vw] h-[50vh] bg-violet-500/20 dark:bg-violet-600/20 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none -z-10"></div>
    <div class="absolute bottom-0 left-[-10%] w-[40vw] h-[40vh] bg-fuchsia-500/20 dark:bg-fuchsia-600/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none -z-10"></div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 w-full items-center">
      
      <!-- Left Column: Typography & CTAs -->
      <div class="lg:col-span-7 flex flex-col items-start text-left z-10 animate-[slideUp_0.8s_ease-out_forwards]">
        
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-violet-600 dark:text-violet-400 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Diseño a Medida & Cotizador Interactivo</span>
        </div>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] sm:leading-[0.95] mb-6">
          Tu presencia <br />
          <span class="bg-gradient-to-br from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">digital elevada.</span>
        </h1>
        
        <p class="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed mb-10">
          Transformamos ideas complejas en experiencias web premium. Desde sitios corporativos hasta sistemas SaaS interactivos. Evalúa nuestras demos y cotiza en tiempo real.
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a href="#showcase" class="group flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:scale-105 active:scale-95 transition-all w-full sm:w-auto shadow-xl shadow-slate-900/20 dark:shadow-white/10">
            Explorar Demos
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="#cotizador" class="flex items-center justify-center h-14 px-8 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm border-2 border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all w-full sm:w-auto">
            Calculadora de Precios
          </a>
        </div>
      </div>

      <!-- Right Column: Interactive / Asymmetrical Widget -->
      <div class="lg:col-span-5 relative w-full h-[400px] lg:h-[500px] hidden md:block z-10 animate-[fadeIn_1s_ease-out_0.3s_forwards] opacity-0">
        
        <!-- Floating Glass Card 1 -->
        <div class="absolute top-[10%] right-[5%] w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 shadow-2xl shadow-violet-500/10 hover:-translate-y-2 transition-transform duration-500">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Activity class="w-5 h-5" />
            </div>
            <div>
              <div class="text-sm font-bold text-slate-900 dark:text-white">Rendimiento</div>
              <div class="text-xs text-slate-500">Optimizado al 100%</div>
            </div>
          </div>
          <div class="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 w-[95%]"></div>
          </div>
        </div>

        <!-- Floating Glass Card 2 -->
        <div class="absolute bottom-[20%] left-[5%] w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 shadow-2xl shadow-indigo-500/10 hover:-translate-y-2 transition-transform duration-500">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
              <Layers class="w-5 h-5 text-indigo-500" />
              Arquitectura
            </div>
            <span class="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md">Escalable</span>
          </div>
          <div class="space-y-2">
            <div class="h-8 rounded-lg bg-slate-100 dark:bg-slate-800 w-full animate-pulse"></div>
            <div class="h-8 rounded-lg bg-slate-100 dark:bg-slate-800 w-3/4 animate-pulse" style="animation-delay: 150ms"></div>
          </div>
        </div>

        <!-- Central Abstract Element -->
        <div class="absolute inset-0 m-auto w-64 h-64 border-[1px] border-violet-500/30 rounded-full flex items-center justify-center animate-[spin_30s_linear_infinite]">
          <div class="w-48 h-48 border-[1px] border-fuchsia-500/30 rounded-full border-dashed animate-[spin_20s_linear_infinite_reverse]"></div>
        </div>
      </div>
      
    </div>
  </section>
</template>

<style scoped>
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
