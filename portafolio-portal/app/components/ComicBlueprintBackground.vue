<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrollY = ref(0)
let ticking = false

const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      scrollY.value = window.scrollY
      ticking = false
    })
    ticking = true
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#08090d] select-none" aria-hidden="true">
    
    <!-- Base Blueprint Grid -->
    <div 
      class="absolute inset-0 bg-blueprint-grid opacity-70"
      :style="{ transform: `translateY(${scrollY * 0.05}px)` }"
    ></div>

    <!-- Secondary Halftone Screentone Matrix -->
    <div 
      class="absolute inset-0 bg-halftone opacity-40 mix-blend-screen"
      :style="{ transform: `translateY(${scrollY * 0.12}px)` }"
    ></div>

    <!-- Technical Architectural Callouts & Registration Crosshairs -->
    <div class="absolute inset-0 max-w-[1600px] mx-auto px-6 lg:px-12 pointer-events-none">
      
      <!-- Top Left Spec -->
      <div class="absolute top-24 left-8 hidden lg:flex flex-col gap-1 text-[9px] font-mono font-bold text-neutral-600 tracking-widest uppercase">
        <span class="text-[#ff5722]/80">REF: ARCH_2026 // DOSSIER</span>
        <span>LAT: 17°46'S · LONG: 63°10'W</span>
        <span class="inline-flex items-center gap-1.5 mt-1">
          <span class="w-1.5 h-1.5 bg-[#06b6d4] rounded-full animate-ping"></span>
          SYS.STATUS: OPERATIONAL
        </span>
      </div>

      <!-- Top Right Crosshair -->
      <div class="absolute top-24 right-8 hidden lg:flex items-center gap-2 text-[9px] font-mono text-neutral-600">
        <span class="text-neutral-500 font-bold">GRID.01</span>
        <div class="w-4 h-4 border border-neutral-700/60 relative flex items-center justify-center">
          <div class="w-2 h-[1px] bg-[#ff5722]"></div>
          <div class="h-2 w-[1px] bg-[#ff5722] absolute"></div>
        </div>
      </div>

      <!-- Left Vertical Axis Guide -->
      <div class="absolute top-1/3 left-4 hidden xl:flex flex-col gap-8 text-[8px] font-mono text-neutral-700">
        <span>+ 001</span>
        <span>+ 002</span>
        <span>+ 003</span>
        <span>+ 004</span>
      </div>

      <!-- Right Vertical Graphic Novel Trim Line -->
      <div class="absolute top-1/4 right-4 hidden xl:flex flex-col items-end gap-2 text-[8px] font-mono text-neutral-700">
        <div class="w-12 h-[1px] bg-neutral-800"></div>
        <span>TRIM // 1920x1080</span>
      </div>

      <!-- Bottom Edge Watermark -->
      <div class="absolute bottom-6 left-8 hidden md:block text-[9px] font-mono text-neutral-600 tracking-wider">
        <span>[ BOLIVIA // LATAM ] &bull; BESPOKE PRODUCTION SYSTEMS</span>
      </div>
    </div>

    <!-- Vignette Gradient for Depth -->
    <div class="absolute inset-0 bg-radial from-transparent via-[#08090d]/60 to-[#08090d] pointer-events-none"></div>
  </div>
</template>
