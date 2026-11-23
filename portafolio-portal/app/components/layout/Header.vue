<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X, ArrowUpRight } from 'lucide-vue-next'

const isMobileMenuOpen = ref(false)
</script>

<template>
  <div class="no-print">
    <header class="fixed top-0 left-0 w-full z-50 bg-[#faf9f6]/95 backdrop-blur-md border-b-2 border-slate-900 py-3.5 print:hidden">
      <div class="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">
        
        <!-- Brand Logo / Comic Title -->
        <a href="#" class="group flex items-center gap-3 outline-none">
          <div class="w-9 h-9 bg-slate-900 text-white font-black text-xs flex items-center justify-center font-mono border-2 border-slate-900 shadow-[2px_2px_0px_#2563eb] transition-transform duration-200 group-hover:scale-95">
            R8
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-black tracking-tight text-slate-900 uppercase leading-none font-display">
              Rogelio
            </span>
            <span class="text-[11px] font-bold text-slate-600 mt-1 leading-none">
              Desarrollador Full-Stack
            </span>
          </div>
        </a>

        <!-- Desktop Navigation: Comic Chapter Tabs -->
        <nav class="hidden md:flex items-center gap-2 text-xs font-black uppercase text-slate-800">
          <a href="#proyectos" class="px-4 py-1.5 rounded-md hover:bg-slate-200/80 transition-colors">
            Proyectos
          </a>
          <a href="#tecnologias" class="px-4 py-1.5 rounded-md hover:bg-slate-200/80 transition-colors">
            Tecnologías
          </a>
          <a href="#enfoque" class="px-4 py-1.5 rounded-md hover:bg-slate-200/80 transition-colors">
            Enfoque
          </a>
          <a href="#contacto" class="px-4 py-1.5 rounded-md hover:bg-slate-200/80 transition-colors">
            Contacto
          </a>
        </nav>

        <!-- Right Actions -->
        <div class="flex items-center gap-3">
          
          <!-- Availability Tag -->
          <div class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border-2 border-slate-900 rounded-full text-[11px] font-bold text-slate-900 shadow-[2px_2px_0px_#0f172a]">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Disponible</span>
          </div>

          <!-- WhatsApp Button -->
          <a 
            href="https://wa.me/59168787985" 
            target="_blank" 
            class="comic-btn-primary px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
          >
            <span>Hablemos</span>
            <ArrowUpRight class="w-3.5 h-3.5" />
          </a>

          <!-- Mobile Menu Button -->
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen" 
            :aria-label="isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
            class="md:hidden w-9 h-9 flex items-center justify-center border-2 border-slate-900 bg-white text-slate-900 cursor-pointer shadow-[2px_2px_0px_#0f172a]"
          >
            <Menu v-if="!isMobileMenuOpen" class="w-5 h-5" />
            <X v-else class="w-5 h-5" />
          </button>
        </div>

      </div>

      <!-- Mobile Dropdown Menu -->
      <div 
        v-if="isMobileMenuOpen" 
        class="md:hidden border-t-2 border-slate-900 bg-[#faf9f6] px-6 py-4 flex flex-col gap-3 text-sm font-black uppercase text-slate-900"
      >
        <a 
          href="#proyectos" 
          @click="isMobileMenuOpen = false"
          class="py-2 hover:text-blue-600 border-b border-slate-200"
        >
          Proyectos y Demos
        </a>
        <a 
          href="#tecnologias" 
          @click="isMobileMenuOpen = false"
          class="py-2 hover:text-blue-600 border-b border-slate-200"
        >
          Tecnologías
        </a>
        <a 
          href="#enfoque" 
          @click="isMobileMenuOpen = false"
          class="py-2 hover:text-blue-600 border-b border-slate-200"
        >
          Enfoque de Trabajo
        </a>
        <a 
          href="#contacto" 
          @click="isMobileMenuOpen = false"
          class="py-2 hover:text-blue-600"
        >
          Contacto
        </a>
      </div>
    </header>
  </div>
</template>
