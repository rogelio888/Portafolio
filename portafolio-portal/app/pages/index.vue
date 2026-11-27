<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'

const scrollY = ref(0)
const isMobile = ref(false)
const prefersReducedMotion = ref(false)
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

const handleResize = () => {
  isMobile.value = window.innerWidth < 1024
}

onMounted(() => {
  handleResize()
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})

// Scroll-driven depth recede as the Bottom Sheet rises over the Hero
const heroStyle = computed(() => {
  if (prefersReducedMotion.value) {
    return {}
  }
  const threshold = isMobile.value ? 420 : 700
  const progress = Math.min(Math.max(scrollY.value / threshold, 0), 1)
  const scale = 1 - progress * (isMobile.value ? 0.06 : 0.04)
  const opacity = 1 - progress * (isMobile.value ? 0.45 : 0.25)
  const translateY = progress * (isMobile.value ? -14 : -8)

  return {
    transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
    opacity,
    transformOrigin: 'center top',
    willChange: 'transform, opacity'
  }
})

// Page-level SEO tags
useHead({
  link: [
    { rel: 'canonical', href: 'https://nexorasystem.site/' }
  ]
})

useSeoMeta({
  title: 'Nexora Systems | Portafolio de Sistemas Web y Software a Medida',
  description: 'Nexora Systems (Portafolio de Rogelio): desarrollo de software y sistemas web a medida en Bolivia. Prueba 10 demos reales para farmacias, clínicas, gimnasios y agroindustria.',
  ogTitle: 'Nexora Systems | Portafolio de Sistemas Web y Software a Medida',
  ogDescription: 'Lleva tu negocio al siguiente nivel con Nexora Systems. Explora nuestro portafolio con 10 demostraciones interactivas de sistemas web.',
  ogUrl: 'https://nexorasystem.site/',
  ogImage: 'https://nexorasystem.site/screenshots/frontend-farmacia.webp',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Nexora Systems | Portafolio de Sistemas Web y Software a Medida',
  twitterDescription: 'Nexora Systems (Portafolio de Rogelio): desarrollo de software y sistemas web a medida en Bolivia.',
  twitterImage: 'https://nexorasystem.site/screenshots/frontend-farmacia.webp'
})
</script>

<template>
  <main class="relative w-full">
    
    <!-- STICKY HERO: Hugs natural content height on mobile so Bottom Sheet rises immediately beneath it, full viewport on desktop -->
    <div class="sticky top-0 w-full lg:h-screen z-10 flex flex-col justify-start lg:justify-center overflow-hidden bg-[#faf9f6]">
      <div :style="heroStyle" class="w-full flex flex-col justify-start lg:justify-center">
        <SectionsHero />
      </div>
    </div>

    <!-- OVERLAPPING BOTTOM SHEET: Slides smoothly up over the pinned Hero on mobile & desktop -->
    <div class="comic-stack-sheet relative z-20 w-full overflow-x-clip bg-[#faf9f6]">
      
      <!-- Tactile Bottom Sheet Grabber Handle -->
      <div class="w-full flex flex-col items-center pt-3.5 sm:pt-5 pb-1 relative z-10 pointer-events-none">
        <div class="w-14 sm:w-16 h-1.5 bg-slate-900/25 rounded-full border border-slate-900/35"></div>
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
