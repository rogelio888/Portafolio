<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrollY = ref(0)
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

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#f8fafc] select-none" aria-hidden="true">
    
    <!-- Soft Ambient Light Glow at Top -->
    <div class="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-gradient-to-b from-blue-100/50 via-slate-100/30 to-transparent blur-3xl pointer-events-none"></div>

    <!-- Architectural Studio Dot Pattern -->
    <div 
      class="absolute inset-0 bg-studio-dots opacity-60"
      :style="{ transform: `translateY(${scrollY * 0.04}px)` }"
    ></div>

    <!-- Subtle Structural Grid Lines -->
    <div class="absolute inset-0 bg-studio-grid opacity-35"></div>

    <!-- Soft Vignette to Frame the Content -->
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f8fafc] pointer-events-none"></div>
  </div>
</template>
