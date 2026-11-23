<script setup lang="ts">
import { techList } from '../../utils/siteData'
</script>

<template>
  <section id="arsenal" class="w-full py-16 bg-[#090b10] border-y border-neutral-800 overflow-hidden relative no-print select-none">
    
    <div class="max-w-[1440px] mx-auto px-6 lg:px-12 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 text-[10px] font-mono text-[#06b6d4] font-bold uppercase tracking-widest mb-1">
          <span>CAPÍTULO 02</span>
          <span class="text-neutral-600">//</span>
          <span class="text-neutral-400">ARSENAL TÉCNICO</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-white uppercase font-display tracking-tight">
          Stack &amp; Herramientas de Grado Enterprise
        </h2>
      </div>
      <p class="text-xs font-mono text-neutral-400 max-w-md">
        Tecnologías seleccionadas por estabilidad, velocidad de render y soporte a largo plazo.
      </p>
    </div>
    
    <!-- Scrolling Track with Technical Masks -->
    <div 
      class="relative w-full flex select-none marquee-container py-2" 
      style="mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);"
    >
      <div class="flex shrink-0 animate-marquee gap-4 min-w-full pr-4">
        <div 
          v-for="tech in techList" 
          :key="tech.name" 
          tabindex="0"
          class="comic-panel p-4 w-48 h-36 flex flex-col justify-between bg-neutral-950 border border-neutral-800 hover:border-[#ff5722] transition-colors cursor-pointer"
        >
          <div class="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span class="text-[9px] font-mono font-bold uppercase text-neutral-500 tracking-wider">{{ tech.category }}</span>
            <span class="w-1.5 h-1.5 bg-[#06b6d4]"></span>
          </div>

          <div class="flex items-center gap-3">
            <div class="w-7 h-7 shrink-0 flex items-center justify-center" v-html="tech.svg"></div>
            <span class="text-sm font-black text-white font-mono">{{ tech.name }}</span>
          </div>

          <div class="text-[10px] font-mono text-neutral-400 line-clamp-2 leading-tight">
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
          class="comic-panel p-4 w-48 h-36 flex flex-col justify-between bg-neutral-950 border border-neutral-800 hover:border-[#ff5722] transition-colors cursor-pointer"
        >
          <div class="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span class="text-[9px] font-mono font-bold uppercase text-neutral-500 tracking-wider">{{ tech.category }}</span>
            <span class="w-1.5 h-1.5 bg-[#06b6d4]"></span>
          </div>

          <div class="flex items-center gap-3">
            <div class="w-7 h-7 shrink-0 flex items-center justify-center" v-html="tech.svg"></div>
            <span class="text-sm font-black text-white font-mono">{{ tech.name }}</span>
          </div>

          <div class="text-[10px] font-mono text-neutral-400 line-clamp-2 leading-tight">
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
