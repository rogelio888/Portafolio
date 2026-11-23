<script setup lang="ts">
import { techList } from '../../utils/siteData'
</script>

<template>
  <section id="tecnologias" class="w-full py-16 bg-[#f5f4ef] border-y-2 border-slate-900 overflow-hidden relative no-print select-none">
    
    <div class="max-w-[1400px] mx-auto px-6 lg:px-12 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="comic-caption mb-2">
          <span>CAPÍTULO 02 // HERRAMIENTAS Y LENGUAJES</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 font-display uppercase tracking-tight">
          Stack de Desarrollo
        </h2>
      </div>
      <p class="text-xs sm:text-sm text-slate-700 font-medium max-w-md">
        Tecnologías probadas en producción para garantizar escalabilidad, seguridad y carga instantánea en cada proyecto.
      </p>
    </div>
    
    <!-- Scrolling Track with Soft Gradient Masks -->
    <div 
      class="relative w-full flex select-none marquee-container py-3" 
      style="mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);"
    >
      <div class="flex shrink-0 animate-marquee gap-5 min-w-full pr-5">
        <div 
          v-for="tech in techList" 
          :key="tech.name" 
          tabindex="0"
          class="p-4 w-52 h-40 rounded-xl bg-white border-2 border-slate-900 flex flex-col justify-between shadow-[3px_3px_0px_#0f172a] hover:shadow-[5px_5px_0px_#0f172a] hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div class="flex items-center justify-between border-b-2 border-slate-900/10 pb-2">
            <span class="text-[10px] font-black uppercase text-slate-500 tracking-wider">{{ tech.category }}</span>
            <span class="w-2 h-2 rounded-full bg-blue-600 border border-slate-900"></span>
          </div>

          <div class="flex items-center gap-3">
            <div class="w-8 h-8 shrink-0 flex items-center justify-center" v-html="tech.svg"></div>
            <span class="text-base font-black text-slate-900 font-display">{{ tech.name }}</span>
          </div>

          <div class="text-[11px] text-slate-600 font-medium line-clamp-2 leading-tight">
            {{ tech.role }}
          </div>
        </div>
      </div>

      <!-- Copy 2 for seamless loop -->
      <div class="flex shrink-0 animate-marquee gap-5 min-w-full pr-5" aria-hidden="true">
        <div 
          v-for="tech in techList" 
          :key="tech.name + '-dup'" 
          tabindex="-1"
          class="p-4 w-52 h-40 rounded-xl bg-white border-2 border-slate-900 flex flex-col justify-between shadow-[3px_3px_0px_#0f172a] hover:shadow-[5px_5px_0px_#0f172a] hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div class="flex items-center justify-between border-b-2 border-slate-900/10 pb-2">
            <span class="text-[10px] font-black uppercase text-slate-500 tracking-wider">{{ tech.category }}</span>
            <span class="w-2 h-2 rounded-full bg-blue-600 border border-slate-900"></span>
          </div>

          <div class="flex items-center gap-3">
            <div class="w-8 h-8 shrink-0 flex items-center justify-center" v-html="tech.svg"></div>
            <span class="text-base font-black text-slate-900 font-display">{{ tech.name }}</span>
          </div>

          <div class="text-[11px] text-slate-600 font-medium line-clamp-2 leading-tight">
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