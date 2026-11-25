<script setup lang="ts">
import SocialLinks from './components/SocialLinks.vue'
</script>

<template>
  <div class="min-h-screen bg-[#faf9f6] font-sans text-slate-900 selection:bg-blue-600 selection:text-white w-full relative">
    
    <!-- Clean Architectural Background (Subtle Dots & Grid) -->
    <StudioBackground />
    
    <!-- Top Navigation Header -->
    <LayoutHeader />
    
    <!-- Active Page Content -->
    <NuxtPage />

    <!-- Clean Global Footer -->
    <footer class="relative z-10 py-8 sm:py-10 border-t border-slate-200/80 text-center bg-slate-50 font-sans text-xs text-slate-500 no-print">
      <div class="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-blue-600"></span>
          <span class="text-slate-800 font-bold">Rogelio &bull; Portafolio de Software</span>
        </div>
        <p>
          Desarrollo full-stack de sistemas web y aplicaciones interactivas.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
          <span>© {{ new Date().getFullYear() }} Todos los derechos reservados.</span>
          <SocialLinks />
        </div>
      </div>
    </footer>

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
