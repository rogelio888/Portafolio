<script setup lang="ts">
import { onMounted, ref } from 'vue'
import StarfieldBackground from './components/StarfieldBackground.vue'
import LayoutHeader from './components/layout/Header.vue'
import SectionsHero from './components/sections/Hero.vue'
import SectionsTechCarousel from './components/sections/TechCarousel.vue'
import SectionsShowcase from './components/sections/Showcase.vue'
import SectionsCotizador from './components/sections/Cotizador.vue'

const isDark = ref(true)

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  
  const observer = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-transparent font-sans text-slate-900 dark:text-white transition-colors duration-300 selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100 overflow-clip w-full relative">
    
    <StarfieldBackground v-if="isDark" />
    
    <LayoutHeader class="no-print" />
    
    <main class="relative z-10">
      <SectionsHero />
      <SectionsTechCarousel />
      <SectionsShowcase />
      <SectionsCotizador />
    </main>

    <footer class="relative z-10 py-12 border-t border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-950 no-print">
      <div class="max-w-7xl mx-auto px-6">
        <p class="text-sm font-bold text-slate-500 dark:text-slate-400">
          © {{ new Date().getFullYear() }} Portafolio. Todos los derechos reservados.
        </p>
        <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
          Diseñado y desarrollado con estándares de calidad premium.
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', sans-serif;
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
