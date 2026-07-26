<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['openBooking']);
const isScrolled = ref(false);
const mobileMenuOpen = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40;
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
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 py-4"
    :class="isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3' : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Logo -->
      <a href="#" class="flex items-center gap-3 group">
        <div class="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
          <span class="font-display text-lg text-white">C</span>
        </div>
        <div>
          <span class="font-display text-lg tracking-wider text-white block leading-none">CUERVO</span>
          <span class="font-mono-label text-[9px] text-white/50 tracking-widest block uppercase mt-0.5">Tattoo Studio</span>
        </div>
      </a>

      <!-- Desktop Nav Links -->
      <nav class="hidden md:flex items-center gap-8 text-xs font-mono-label tracking-widest text-white/70">
        <a href="#hero" class="hover:text-white transition-colors">INICIO</a>
        <a href="#galeria" class="hover:text-white transition-colors">GALERÍA</a>
        <a href="#artistas" class="hover:text-white transition-colors">ARTISTAS</a>
        <a href="#proceso" class="hover:text-white transition-colors">PROCESO</a>
        <a href="#cuidados" class="hover:text-white transition-colors">CUIDADOS</a>
      </nav>

      <!-- CTA Button -->
      <div class="flex items-center gap-4">
        <button
          @click="emit('openBooking')"
          class="liquid-glass-strong rounded-full px-5 py-2.5 text-xs font-mono-label tracking-wider text-white hover:bg-white/20 transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
        >
          <span>RESERVAR CITA</span>
          <UIcon name="i-lucide-arrow-up-right" class="w-3.5 h-3.5 text-white/80" />
        </button>

        <!-- Mobile menu toggle -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white"
        >
          <UIcon :name="mobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Mobile Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="mobileMenuOpen"
        class="md:hidden mt-3 liquid-glass-strong rounded-2xl p-6 border border-white/10 flex flex-col gap-4 text-sm font-mono-label tracking-widest text-white/80"
      >
        <a href="#hero" @click="mobileMenuOpen = false" class="hover:text-white">INICIO</a>
        <a href="#galeria" @click="mobileMenuOpen = false" class="hover:text-white">GALERÍA</a>
        <a href="#artistas" @click="mobileMenuOpen = false" class="hover:text-white">ARTISTAS</a>
        <a href="#proceso" @click="mobileMenuOpen = false" class="hover:text-white">PROCESO</a>
        <a href="#cuidados" @click="mobileMenuOpen = false" class="hover:text-white">CUIDADOS</a>
      </div>
    </Transition>
  </header>
</template>
