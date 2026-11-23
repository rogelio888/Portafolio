<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Sun, Moon, Menu, X, ArrowUpRight } from 'lucide-vue-next'

const isDark = ref(true)
const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  try {
    localStorage.setItem('portfolio-theme', isDark.value ? 'dark' : 'light')
  } catch (e) {}
}

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
  isDark.value = document.documentElement.classList.contains('dark')
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
          ? 'bg-[#08090d]/90 backdrop-blur-md border-b border-neutral-800 py-2.5 shadow-ink' 
          : 'bg-transparent border-b border-transparent py-4'
      ]"
    >
      <div class="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between">
        
        <!-- Brand Logo / Blueprint Title -->
        <a href="#" class="group flex items-center gap-3 outline-none">
          <div class="w-8 h-8 bg-[#ff5722] text-white flex items-center justify-center font-mono font-black text-xs shadow-ink">
            R8
          </div>
          <div class="flex flex-col font-mono">
            <span class="text-xs font-black tracking-widest text-white uppercase leading-none">
              ROGELIO // ARCH
            </span>
            <span class="text-[9px] font-bold text-neutral-400 tracking-wider uppercase mt-1 leading-none">
              PORTAFOLIO DE SISTEMAS
            </span>
          </div>
        </a>

        <!-- Desktop Chapters Nav -->
        <nav class="hidden md:flex items-center gap-1 bg-neutral-900/80 p-1 border border-neutral-800 text-[11px] font-mono shadow-ink">
          <a href="#sistemas" class="px-3.5 py-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors uppercase tracking-wider font-semibold">
            01. Sistemas
          </a>
          <a href="#arsenal" class="px-3.5 py-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors uppercase tracking-wider font-semibold">
            02. Arsenal
          </a>
          <a href="#filosofia" class="px-3.5 py-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors uppercase tracking-wider font-semibold">
            03. Filosofía
          </a>
          <a href="#contacto" class="px-3.5 py-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors uppercase tracking-wider font-semibold">
            04. Contacto
          </a>
        </nav>

        <!-- Right Actions -->
        <div class="flex items-center gap-3">
          
          <!-- Availability Pill -->
          <div class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>DISPONIBLE</span>
          </div>

          <!-- WhatsApp Button -->
          <a 
            href="https://wa.me/59168787985" 
            target="_blank" 
            class="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ff5722] text-white text-[11px] font-mono font-bold uppercase tracking-wider hover:bg-[#ff6f3d] active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-ink-accent"
          >
            <span>HABLEMOS</span>
            <ArrowUpRight class="w-3.5 h-3.5" />
          </a>

          <!-- Theme Toggle -->
          <button 
            @click="toggleTheme" 
            aria-label="Cambiar tema de color"
            class="w-8 h-8 flex items-center justify-center border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <Sun v-if="isDark" class="w-3.5 h-3.5" />
            <Moon v-else class="w-3.5 h-3.5" />
          </button>

          <!-- Mobile Menu Toggle -->
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen" 
            :aria-label="isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
            class="md:hidden w-8 h-8 flex items-center justify-center border border-neutral-800 bg-neutral-900 text-white cursor-pointer"
          >
            <Menu v-if="!isMobileMenuOpen" class="w-4 h-4" />
            <X v-else class="w-4 h-4" />
          </button>
        </div>

      </div>

      <!-- Mobile Dropdown Menu -->
      <div 
        v-if="isMobileMenuOpen" 
        class="md:hidden border-b border-neutral-800 bg-[#08090d]/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-2 font-mono text-xs uppercase"
      >
        <a 
          href="#sistemas" 
          @click="isMobileMenuOpen = false"
          class="py-2 text-neutral-300 hover:text-[#ff5722] border-b border-neutral-900"
        >
          01. Sistemas y Demos
        </a>
        <a 
          href="#arsenal" 
          @click="isMobileMenuOpen = false"
          class="py-2 text-neutral-300 hover:text-[#ff5722] border-b border-neutral-900"
        >
          02. Arsenal Tecnológico
        </a>
        <a 
          href="#filosofia" 
          @click="isMobileMenuOpen = false"
          class="py-2 text-neutral-300 hover:text-[#ff5722] border-b border-neutral-900"
        >
          03. Filosofía de Ingeniería
        </a>
        <a 
          href="#contacto" 
          @click="isMobileMenuOpen = false"
          class="py-2 text-neutral-300 hover:text-[#ff5722]"
        >
          04. Contacto y Cotización
        </a>
      </div>
    </header>
  </div>
</template>
