<script setup lang="ts">
import { techList } from '../../utils/siteData'
</script>

<template>
  <section id="tecnologias" class="w-full py-16 bg-slate-50/70 border-y border-slate-200/80 overflow-hidden relative no-print select-none">
    
    <div class="max-w-[1400px] mx-auto px-6 lg:px-12 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Tecnologías</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          Stack de Desarrollo
        </h2>
      </div>
      <p class="text-xs sm:text-sm text-slate-500 max-w-md">
        Herramientas probadas para garantizar escalabilidad, seguridad y carga instantánea.
      </p>
    </div>
    
    <!-- Scrolling Track with Soft Gradient Masks -->
    <div 
      class="relative w-full flex select-none marquee-container py-2" 
      style="mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);"
    >
      <div class="flex shrink-0 animate-marquee gap-4 min-w-full pr-4">
        <div 
          v-for="tech in techList" 
          :key="tech.name" 
          tabindex="0"
          class="p-4 w-48 h-36 rounded-xl bg-white border border-slate-200/90 flex flex-col justify-between shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
        >
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <span class="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">{{ tech.category }}</span>
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          </div>

          <div class="flex items-center gap-3">
            <div class="w-7 h-7 shrink-0 flex items-center justify-center" v-html="tech.svg"></div>
            <span class="text-sm font-bold text-slate-800">{{ tech.name }}</span>
          </div>

          <div class="text-[11px] text-slate-500 line-clamp-2 leading-tight">
            {{ tech.role }}
          </div>
        </div>
      </div>

      <!-- Copy 2 for seamless loop -->
      <div class="flex shrink-0 animate-marquee gap-4 min-w-full pr-4" aria-hidden="true">
        <div 
          v-for="tech in techList" 
          :key="tech.name + '-dup'" 
          tabindex="-1"
          class="p-4 w-48 h-36 rounded-xl bg-white border border-slate-200/90 flex flex-col justify-between shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
        >
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <span class="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">{{ tech.category }}</span>
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          </div>

          <div class="flex items-center gap-3">
            <div class="w-7 h-7 shrink-0 flex items-center justify-center" v-html="tech.svg"></div>
            <span class="text-sm font-bold text-slate-800">{{ tech.name }}</span>
          </div>

          <div class="text-[11px] text-slate-500 line-clamp-2 leading-tight">
            {{ tech.role }}
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
