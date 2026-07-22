<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Sun, Moon, Menu, X } from 'lucide-vue-next'

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

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 20
  })
})
</script>

<template>
  <div class="no-print">
    <header 
      :class="[
        'fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b print:hidden',
        isScrolled 
          ? 'bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-black/[0.05] dark:border-white/[0.05] py-3 shadow-sm' 
          : 'bg-transparent border-transparent py-5'
      ]"
    >
      <div class="relative z-50 max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        
        <!-- Brand Logo -->
        <a href="#" class="group flex items-center gap-3 relative z-10 outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-violet-500">
          <div class="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 overflow-hidden transition-transform duration-500 group-hover:scale-95 group-hover:-rotate-3">
            <div class="absolute inset-0 bg-gradient-to-tr from-violet-600/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <svg class="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-black tracking-widest text-slate-900 dark:text-white uppercase leading-none font-display">
              PORTAFOLIO
            </span>
            <span class="text-[9px] font-bold text-violet-600 dark:text-violet-400 tracking-widest uppercase mt-1 leading-none">
              Software Premium
            </span>
          </div>
        </a>

        <!-- Desktop Nav (Activates on lg screens 1024px+) -->
        <nav class="hidden lg:flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-2xl border border-black/[0.05] dark:border-white/[0.05]">
          <a href="#showcase" class="px-5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-all duration-300 shadow-sm opacity-80 hover:opacity-100">
            Proyectos
          </a>
          <a href="#cotizador" class="px-5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-all duration-300 shadow-sm opacity-80 hover:opacity-100">
            Cotizador
          </a>
          <a href="#habilidades" class="px-5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-all duration-300 shadow-sm opacity-80 hover:opacity-100">
            Tecnologías
          </a>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-3 relative z-10">
          <!-- Contact Button -->
          <a href="https://wa.me/59168787985" target="_blank" class="hidden sm:flex items-center justify-center h-10 px-5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold tracking-wide hover:scale-105 active:scale-95 transition-transform duration-300 hover:shadow-lg hover:shadow-violet-500/20">
            Hablemos
          </a>

          <!-- Theme Toggle -->
          <button 
            @click="toggleTheme" 
            class="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
          >
            <Sun v-if="isDark" class="w-4 h-4" />
            <Moon v-else class="w-4 h-4" />
          </button>

          <!-- Mobile/Tablet Menu Toggle -->
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-900 dark:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors">
            <Menu v-if="!isMobileMenuOpen" class="w-5 h-5" />
            <X v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Menu Overlay (Outside header to prevent backdrop-filter stacking context bugs) -->
    <div 
      class="fixed inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl z-40 transition-all duration-500 lg:hidden flex flex-col items-center justify-center gap-8"
      :class="isMobileMenuOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'"
    >
      <nav class="flex flex-col items-center gap-6">
        <a href="#showcase" @click="isMobileMenuOpen = false" class="text-3xl font-black text-slate-900 dark:text-white hover:text-violet-500 transition-colors tracking-tight">Proyectos</a>
        <a href="#cotizador" @click="isMobileMenuOpen = false" class="text-3xl font-black text-slate-900 dark:text-white hover:text-violet-500 transition-colors tracking-tight">Cotizador</a>
        <a href="#habilidades" @click="isMobileMenuOpen = false" class="text-3xl font-black text-slate-900 dark:text-white hover:text-violet-500 transition-colors tracking-tight">Tecnologías</a>
      </nav>
      <a href="https://wa.me/59168787985" target="_blank" @click="isMobileMenuOpen = false" class="mt-8 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold tracking-wide">
        Hablemos por WhatsApp
      </a>
    </div>
  </div>
</template>
