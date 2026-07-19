<script setup lang="ts">
import { techList } from '../../utils/siteData'
</script>

<template>
  <section id="habilidades" class="w-full py-16 bg-transparent overflow-hidden relative">
    
    <div class="text-center mb-10 px-4">
      <h2 class="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-2">Nuestro Stack Tecnológico</h2>
      <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Herramientas de grado empresarial para máxima velocidad y seguridad.</p>
    </div>
    
    <!-- Scrolling Track with CSS Mask for transparent edge fading -->
    <div 
      class="relative w-full flex select-none marquee-container" 
      style="mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);"
    >
      <div class="flex shrink-0 animate-marquee gap-6 min-w-full pr-6">
        <!-- Copy 1 -->
        <div 
          v-for="tech in techList" 
          :key="tech.name" 
          tabindex="0"
          class="group relative flex flex-col items-center justify-center gap-4 w-40 h-40 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-2 focus:shadow-xl focus:shadow-violet-500/10 focus:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden focus:outline-none"
        >
          <!-- Hover Effect Background -->
          <div class="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div class="w-10 h-10 flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-110 group-focus:scale-110" v-html="tech.svg"></div>
          <span class="text-sm font-bold text-slate-700 dark:text-slate-200 relative z-10">{{ tech.name }}</span>
          
          <!-- Tooltip overlay (Curtain Drop Effect) -->
          <div class="absolute inset-0 bg-violet-600/95 dark:bg-violet-900/95 backdrop-blur-sm -translate-y-full group-hover:translate-y-0 group-focus:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center p-4 text-center z-20">
            <div class="flex flex-col items-center justify-center translate-y-4 group-hover:translate-y-0 group-focus:translate-y-0 transition-transform duration-500 delay-75">
              <span class="text-xs font-bold text-white leading-snug">{{ tech.role }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Copy 2 for seamless loop -->
      <div class="flex shrink-0 animate-marquee gap-6 min-w-full pr-6" aria-hidden="true">
        <div 
          v-for="tech in techList" 
          :key="tech.name + '-dup'" 
          tabindex="0"
          class="group relative flex flex-col items-center justify-center gap-4 w-40 h-40 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-2 focus:shadow-xl focus:shadow-violet-500/10 focus:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden focus:outline-none"
        >
          <div class="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="w-10 h-10 flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-110 group-focus:scale-110" v-html="tech.svg"></div>
          <span class="text-sm font-bold text-slate-700 dark:text-slate-200 relative z-10">{{ tech.name }}</span>
          
          <!-- Tooltip overlay (Curtain Drop Effect) -->
          <div class="absolute inset-0 bg-violet-600/95 dark:bg-violet-900/95 backdrop-blur-sm -translate-y-full group-hover:translate-y-0 group-focus:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center p-4 text-center z-20">
            <div class="flex flex-col items-center justify-center translate-y-4 group-hover:translate-y-0 group-focus:translate-y-0 transition-transform duration-500 delay-75">
              <span class="text-xs font-bold text-white leading-snug">{{ tech.role }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-marquee {
  animation: marquee 35s linear infinite;
}
.marquee-container:hover .animate-marquee {
  animation-play-state: paused;
}

@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-100%); }
}
</style>
