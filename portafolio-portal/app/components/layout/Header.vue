<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X, ArrowUpRight } from 'lucide-vue-next'

const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)

let ticking = false
const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      isScrolled.value = window.scrollY > 20
      ticking = false
    })
    ticking = true
  }
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="no-print">
    <header 
      :class="[
        'fixed top-0 left-0 w-full z-50 transition-all duration-300 print:hidden',
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-3 shadow-xs' 
          : 'bg-transparent border-b border-transparent py-5'
      ]"
    >
      <div class="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">
        
        <!-- Brand Logo -->
        <a href="#" class="group flex items-center gap-3 outline-none">
          <div class="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-mono font-bold text-xs shadow-xs transition-transform duration-300 group-hover:scale-95">
            R8
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-bold tracking-tight text-slate-900 leading-none">
              Rogelio
            </span>
            <span class="text-[11px] font-medium text-slate-500 tracking-normal mt-1 leading-none">
              Desarrollador Full-Stack
            </span>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/80 text-xs font-semibold text-slate-600">
          <a href="#proyectos" class="px-4 py-1.5 hover:text-slate-900 hover:bg-white rounded-full transition-all">
            Proyectos
          </a>
          <a href="#tecnologias" class="px-4 py-1.5 hover:text-slate-900 hover:bg-white rounded-full transition-all">
            Tecnologías
          </a>
          <a href="#enfoque" class="px-4 py-1.5 hover:text-slate-900 hover:bg-white rounded-full transition-all">
            Enfoque
          </a>
          <a href="#contacto" class="px-4 py-1.5 hover:text-slate-900 hover:bg-white rounded-full transition-all">
            Contacto
          </a>
        </nav>

        <!-- Right Action Buttons -->
        <div class="flex items-center gap-3">
          
          <!-- Availability Badge -->
          <div class="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded-full text-[11px] font-semibold text-emerald-700">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Disponible</span>
          </div>

          <!-- Contact WhatsApp Button -->
          <a 
            href="https://wa.me/59168787985" 
            target="_blank" 
            class="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-full hover:bg-slate-800 active:scale-95 transition-all shadow-xs"
          >
            <span>Hablemos</span>
            <ArrowUpRight class="w-3.5 h-3.5" />
          </a>

          <!-- Mobile Menu Button -->
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen" 
            :aria-label="isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
            class="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 cursor-pointer"
          >
            <Menu v-if="!isMobileMenuOpen" class="w-4 h-4" />
            <X v-else class="w-4 h-4" />
          </button>
        </div>

      </div>

      <!-- Mobile Dropdown Navigation -->
      <div 
        v-if="isMobileMenuOpen" 
        class="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-2 text-sm font-semibold text-slate-700"
      >
        <a 
          href="#proyectos" 
          @click="isMobileMenuOpen = false"
          class="py-2.5 hover:text-blue-600 border-b border-slate-100"
        >
          Proyectos y Demos
        </a>
        <a 
          href="#tecnologias" 
          @click="isMobileMenuOpen = false"
          class="py-2.5 hover:text-blue-600 border-b border-slate-100"
        >
          Tecnologías
        </a>
        <a 
          href="#enfoque" 
          @click="isMobileMenuOpen = false"
          class="py-2.5 hover:text-blue-600 border-b border-slate-100"
        >
          Enfoque de Trabajo
        </a>
        <a 
          href="#contacto" 
          @click="isMobileMenuOpen = false"
          class="py-2.5 hover:text-blue-600"
        >
          Contacto
        </a>
      </div>
    </header>
  </div>
</template>
