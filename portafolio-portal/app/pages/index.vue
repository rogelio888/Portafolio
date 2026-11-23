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

// Subtle receding depth for Hero as the sheet slides over it
const heroStyle = computed(() => {
  const progress = Math.min(Math.max(scrollY.value / 700, 0), 1)
  const scale = 1 - progress * 0.04
  const opacity = 1 - progress * 0.25

  return {
    transform: `scale(${scale})`,
    opacity: opacity,
    transition: 'transform 0.08s ease-out, opacity 0.08s ease-out'
  }
})

// Page-level SEO tags
useHead({
  link: [
    { rel: 'canonical', href: 'https://portafoliorogelio888.dpdns.org/' }
  ]
})

useSeoMeta({
  title: 'Rogelio | Portafolio Desarrollador Full-Stack y Sistemas Web a Medida',
  description: 'Desarrollo de Software y Sistemas Web a Medida. Explora demostraciones reales de sistemas para farmacias, clínicas, agroindustria y más.',
  ogTitle: 'Rogelio | Portafolio Desarrollador Full-Stack y Sistemas Web a Medida',
  ogDescription: 'Lleva tu negocio al siguiente nivel con plataformas digitales diseñadas exclusivamente para ti. Explora demostraciones interactivas de sistemas web.',
  ogUrl: 'https://portafoliorogelio888.dpdns.org/',
  ogImage: 'https://portafoliorogelio888.dpdns.org/screenshots/frontend-farmacia.webp',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Rogelio | Portafolio Desarrollador Full-Stack y Sistemas Web a Medida',
  twitterDescription: 'Desarrollo de Software y Sistemas Web a Medida. Explora demostraciones reales de sistemas para farmacias, clínicas, agroindustria y más.',
  twitterImage: 'https://portafoliorogelio888.dpdns.org/screenshots/frontend-farmacia.webp'
})
</script>

<template>
  <main class="relative w-full">
    
    <!-- STICKY HERO: Pinned at top:0, stays centered without scrolling into header -->
    <div class="relative lg:sticky lg:top-0 w-full min-h-screen lg:h-screen z-10 flex flex-col justify-center overflow-hidden bg-[#faf9f6]">
      <div :style="heroStyle" class="w-full flex flex-col justify-center">
        <SectionsHero />
      </div>
    </div>

    <!-- OVERLAPPING COMIC SHEET: Slides cleanly over the pinned Hero -->
    <div class="comic-stack-sheet relative z-20 w-full overflow-hidden bg-[#faf9f6] rounded-t-[2.5rem] border-t-3 border-slate-900 shadow-[0_-25px_50px_rgba(15,23,42,0.18)]">
      
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

    </div>

  </main>
</template>
