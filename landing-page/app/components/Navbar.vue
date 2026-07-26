<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['openBooking']);
const isScrolled = ref(false);
const mobileMenuOpen = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 py-3"
    :class="isScrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-2xl py-2.5' : 'bg-gradient-to-b from-black/80 to-transparent'"
  >
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Logo -->
      <a href="#" class="flex items-center gap-2.5 group">
        <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
          <span class="font-display text-base sm:text-lg text-white">C</span>
        </div>
        <div>
          <span class="font-display text-base sm:text-lg tracking-wider text-white block leading-none">CUERVO</span>
          <span class="font-mono-label text-[8px] sm:text-[9px] text-white/50 tracking-widest block uppercase mt-0.5">Tattoo Studio</span>
        </div>
      </a>

      <!-- Desktop Nav Links -->
      <nav class="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-mono-label tracking-widest text-white/70">
        <a href="#hero" class="hover:text-white transition-colors">INICIO</a>
        <a href="#galeria" class="hover:text-white transition-colors">GALERÍA</a>
        <a href="#artistas" class="hover:text-white transition-colors">ARTISTAS</a>
        <a href="#proceso" class="hover:text-white transition-colors">PROCESO</a>
        <a href="#cuidados" class="hover:text-white transition-colors">CUIDADOS</a>
      </nav>

      <!-- CTA Button & Mobile Toggle -->
      <div class="flex items-center gap-2 sm:gap-4">
        <button
          @click="emit('openBooking')"
          class="liquid-glass-strong rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-mono-label tracking-wider text-white hover:bg-white/20 transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer shadow-lg active:scale-95"
        >
          <span>RESERVAR</span>
          <UIcon name="i-lucide-arrow-up-right" class="w-3.5 h-3.5 text-white/80" />
        </button>

        <!-- Mobile menu toggle -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white active:scale-95 cursor-pointer"
          aria-label="Toggle Menu"
        >
          <UIcon :name="mobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Mobile Dropdown Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileMenuOpen"
        class="md:hidden mt-2.5 liquid-glass-strong rounded-2xl p-5 border border-white/15 shadow-2xl flex flex-col gap-3.5 text-xs font-mono-label tracking-widest text-white/90 bg-black/95 backdrop-blur-2xl"
      >
        <a href="#hero" @click="mobileMenuOpen = false" class="hover:text-white py-1 flex items-center justify-between border-b border-white/5">
          <span>01. INICIO</span>
          <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5 text-white/40" />
        </a>
        <a href="#galeria" @click="mobileMenuOpen = false" class="hover:text-white py-1 flex items-center justify-between border-b border-white/5">
          <span>02. GALERÍA</span>
          <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5 text-white/40" />
        </a>
        <a href="#artistas" @click="mobileMenuOpen = false" class="hover:text-white py-1 flex items-center justify-between border-b border-white/5">
          <span>03. ARTISTAS</span>
          <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5 text-white/40" />
        </a>
        <a href="#proceso" @click="mobileMenuOpen = false" class="hover:text-white py-1 flex items-center justify-between border-b border-white/5">
          <span>04. PROCESO</span>
          <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5 text-white/40" />
        </a>
        <a href="#cuidados" @click="mobileMenuOpen = false" class="hover:text-white py-1 flex items-center justify-between">
          <span>05. CUIDADOS</span>
          <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5 text-white/40" />
        </a>
      </div>
    </Transition>
  </header>
</template>
