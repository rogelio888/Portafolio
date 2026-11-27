<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X, ArrowUpRight } from 'lucide-vue-next'

const isMobileMenuOpen = ref(false)

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="no-print">
    <header class="fixed top-0 left-0 w-full z-50 bg-[#faf9f6]/95 backdrop-blur-md border-b-2 border-slate-900 py-2.5 sm:py-3.5 print:hidden">
      <div class="max-w-[1400px] mx-auto px-3.5 sm:px-6 lg:px-12 flex items-center justify-between gap-2">
        
        <!-- Brand Logo / Comic Title -->
        <NuxtLink to="/" class="group flex items-center gap-1.5 sm:gap-3 outline-none min-w-0">
          <img
            src="/favicon-48x48.png"
            alt="Nexora Systems logo"
            class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_#2563eb] transition-transform duration-200 group-hover:scale-95 shrink-0 object-cover bg-[#0b1224]"
          />
          <div class="flex flex-col min-w-0">
            <span class="text-[11px] sm:text-sm font-black tracking-[-0.02em] sm:tracking-tight text-slate-900 uppercase leading-tight font-display whitespace-nowrap">
              Nexora Systems
            </span>
            <span class="text-[10px] sm:text-[11px] font-bold text-slate-600 leading-tight whitespace-nowrap">
              Portafolio · Rogelio
            </span>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation: Comic Chapter Tabs -->
        <nav class="hidden md:flex items-center gap-1.5 lg:gap-2 text-xs font-black uppercase text-slate-800">
          <NuxtLink to="/#proyectos" class="px-3 lg:px-4 py-1.5 rounded-md hover:bg-slate-200/80 transition-colors">
            Proyectos
          </NuxtLink>
          <NuxtLink to="/#tecnologias" class="px-3 lg:px-4 py-1.5 rounded-md hover:bg-slate-200/80 transition-colors">
            Tecnologías
          </NuxtLink>
          <NuxtLink to="/#enfoque" class="px-3 lg:px-4 py-1.5 rounded-md hover:bg-slate-200/80 transition-colors">
            Enfoque
          </NuxtLink>
          <NuxtLink to="/#contacto" class="px-3 lg:px-4 py-1.5 rounded-md hover:bg-slate-200/80 transition-colors">
            Contacto
          </NuxtLink>
        </nav>

        <!-- Right Actions -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          
          <!-- Availability Tag (Tablet & Desktop) -->
          <div class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border-2 border-slate-900 rounded-full text-[11px] font-bold text-slate-900 shadow-[2px_2px_0px_#0f172a] whitespace-nowrap">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Disponible</span>
          </div>

          <!-- WhatsApp Button -->
          <a 
            href="https://wa.me/59168787985" 
            target="_blank" 
            class="comic-btn-primary h-10 sm:h-auto px-2.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
          >
            <span>Hablemos</span>
            <ArrowUpRight class="w-3.5 h-3.5 shrink-0" />
          </a>

          <!-- Mobile Menu Button (40x40px tactile button) -->
          <button 
            type="button"
            @click="isMobileMenuOpen = !isMobileMenuOpen" 
            :aria-expanded="isMobileMenuOpen"
            :aria-label="isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
            class="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border-2 border-slate-900 bg-white text-slate-900 cursor-pointer shadow-[2px_2px_0px_#0f172a] active:translate-y-0.5 shrink-0"
          >
            <Menu v-if="!isMobileMenuOpen" class="w-5 h-5" />
            <X v-else class="w-5 h-5" />
          </button>
        </div>

      </div>

      <!-- Mobile Dropdown Menu with smooth reveal -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div 
          v-if="isMobileMenuOpen" 
          class="md:hidden border-t-2 border-slate-900 bg-[#faf9f6] px-4 py-3 flex flex-col gap-1 text-sm font-black uppercase text-slate-900 shadow-[0_15px_30px_rgba(15,23,42,0.18)]"
        >
          <NuxtLink 
            to="/#proyectos" 
            @click="isMobileMenuOpen = false"
            class="h-12 flex items-center px-3 rounded-lg hover:bg-slate-200/70 border-b border-slate-200/80 active:bg-yellow-100"
          >
            Proyectos y Demos
          </NuxtLink>
          <NuxtLink 
            to="/#tecnologias" 
            @click="isMobileMenuOpen = false"
            class="h-12 flex items-center px-3 rounded-lg hover:bg-slate-200/70 border-b border-slate-200/80 active:bg-yellow-100"
          >
            Tecnologías
          </NuxtLink>
          <NuxtLink 
            to="/#enfoque" 
            @click="isMobileMenuOpen = false"
            class="h-12 flex items-center px-3 rounded-lg hover:bg-slate-200/70 border-b border-slate-200/80 active:bg-yellow-100"
          >
            Enfoque de Trabajo
          </NuxtLink>
          <NuxtLink 
            to="/#contacto" 
            @click="isMobileMenuOpen = false"
            class="h-12 flex items-center px-3 rounded-lg hover:bg-slate-200/70 active:bg-yellow-100 text-blue-700"
          >
            Contacto Directo
          </NuxtLink>
        </div>
      </Transition>
    </header>
  </div>
</template>
