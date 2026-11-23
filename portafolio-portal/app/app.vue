<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'

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

// Scroll-driven physical compression of sticky Hero
const heroStyle = computed(() => {
  const progress = Math.min(Math.max(scrollY.value / 600, 0), 1)
  const scale = 1 - progress * 0.05 // Scales from 1.0 down to 0.95
  const opacity = 1 - progress * 0.35 // Fades from 1.0 down to 0.65
  const translateY = progress * -20 // Gentle upward push

  return {
    transform: `scale(${scale}) translateY(${translateY}px)`,
    opacity: opacity,
    transition: 'transform 0.05s ease-out, opacity 0.05s ease-out'
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#08090d] font-sans text-neutral-100 selection:bg-[#ff5722] selection:text-white w-full relative">
    
    <!-- Background: Cyber-Manga Noir & Technical Blueprint Grid -->
    <ComicBlueprintBackground />
    
    <!-- Navigation Header / Reader Bar -->
    <LayoutHeader />
    
    <main class="relative w-full">
      
      <!-- STICKY HERO CONTAINER (z-index: 10 on desktop, natural flow on mobile) -->
      <!-- Pinned to top on large screens, physically covered by the sheet on scroll -->
      <div class="relative lg:sticky lg:top-0 min-h-screen lg:h-screen w-full z-10 flex flex-col justify-center overflow-hidden">
        <div :style="heroStyle" class="w-full h-full flex flex-col justify-center">
          <SectionsHero />
        </div>
      </div>

      <!-- OVERLAPPING SHEET (z-index: 20) -->
      <!-- Rises up and glides OVER the Hero like a physical graphic novel sheet -->
      <div class="section-stack-sheet relative z-20 w-full overflow-hidden">
        
        <!-- Subtle Halftone Texture inside Sheet -->
        <div class="absolute inset-0 bg-halftone opacity-30 pointer-events-none"></div>

        <!-- Sheet Top Accent Drag Bar Indicator -->
        <div class="w-full flex justify-center pt-4 pb-2 relative z-10 pointer-events-none">
          <div class="w-16 h-1 bg-neutral-700/80 rounded-full"></div>
        </div>

        <!-- Chapter 01: Sistemas & Casos de Estudio -->
        <SectionsShowcase />

        <!-- Chapter 02: Arsenal de Tecnologías -->
        <SectionsTechCarousel />

        <!-- Chapter 03: Filosofía & Estándares de Ingeniería -->
        <SectionsManifesto />

        <!-- Chapter 04: Terminal de Contacto & Cotización -->
        <SectionsContactTerminal />

        <!-- Dossier Footer -->
        <footer class="relative z-10 py-12 border-t border-neutral-800 text-center bg-[#07080b] font-mono no-print">
          <div class="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 bg-[#ff5722]"></span>
              <span class="text-neutral-300 font-bold">ROGELIO PORTAFOLIO // 2026</span>
            </div>
            <p>
              Arquitecturas web sin plantillas &bull; Diseñado con principios de novela gráfica y precisión técnica.
            </p>
            <div class="text-[10px] text-neutral-600">
              [ NUXT 4 &bull; VUE 3 &bull; TAILWIND 4 ]
            </div>
          </div>
        </footer>

      </div>

    </main>
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: #08090d;
}

h1, h2, h3, h4, h5, h6, .font-display {
  font-family: 'Outfit', sans-serif;
}

/* Print optimizations */
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
