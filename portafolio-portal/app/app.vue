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

// Scroll-driven physical compression of Hero as the overlapping sheet covers it
const heroStyle = computed(() => {
  const progress = Math.min(Math.max((scrollY.value - 220) / 450, 0), 1)
  const scale = 1 - progress * 0.04
  const opacity = 1 - progress * 0.35
  const translateY = progress * -20

  return {
    transform: `scale(${scale}) translateY(${translateY}px)`,
    opacity: opacity,
    transition: 'transform 0.06s ease-out, opacity 0.06s ease-out'
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#faf9f6] font-sans text-slate-900 selection:bg-blue-600 selection:text-white w-full relative">
    
    <!-- Clean Architectural Background (Subtle Dots & Grid) -->
    <StudioBackground />
    
    <!-- Top Navigation Header -->
    <LayoutHeader />
    
    <main class="relative w-full">
      
      <!-- STICKY HERO SCROLL TRACK -->
      <!-- Pinned in place for 125vh so the cards animate cleanly, then the sheet smoothly covers it -->
      <div class="relative w-full z-10 lg:h-[125vh]">
        <div class="lg:sticky lg:top-0 w-full lg:h-screen flex flex-col justify-start lg:justify-center overflow-hidden">
          <div :style="heroStyle" class="w-full h-full flex flex-col justify-start lg:justify-center">
            <SectionsHero />
          </div>
        </div>
      </div>

      <!-- OVERLAPPING COMIC SHEET -->
      <!-- Physical comic page with 3px solid ink border and shadow that rises over the hero -->
      <div class="comic-stack-sheet relative z-20 w-full overflow-hidden">
        
        <!-- Subtle Top Accent Drag Bar -->
        <div class="w-full flex justify-center pt-5 pb-2 relative z-10 pointer-events-none">
          <div class="w-16 h-1.5 bg-slate-900/20 rounded-full border border-slate-900/30"></div>
        </div>

        <!-- Section 1: Proyectos y Demos -->
        <SectionsShowcase />

        <!-- Section 2: Stack de Tecnologías -->
        <SectionsTechCarousel />

        <!-- Section 3: Enfoque de Desarrollo -->
        <SectionsManifesto />

        <!-- Section 4: Contacto y Cotizaciones -->
        <SectionsContactTerminal />

        <!-- Clean Footer -->
        <footer class="relative z-10 py-10 border-t border-slate-200/80 text-center bg-slate-50 font-sans text-xs text-slate-500 no-print">
          <div class="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-600"></span>
              <span class="text-slate-800 font-bold">Rogelio &bull; Portafolio de Software</span>
            </div>
            <p>
              Desarrollo full-stack de sistemas web y aplicaciones interactivas.
            </p>
            <div class="text-[11px] text-slate-400">
              © {{ new Date().getFullYear() }} Todos los derechos reservados.
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
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8fafc;
}

h1, h2, h3, h4, h5, h6, .font-display {
  font-family: 'Outfit', sans-serif;
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
