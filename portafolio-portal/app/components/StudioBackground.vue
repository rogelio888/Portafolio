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
  <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#faf9f6] select-none" aria-hidden="true">
    
    <!-- Subtle comic halftones with scroll parallax -->
    <div 
      class="absolute inset-0 bg-comic-dots opacity-75"
      :style="{ transform: `translateY(${scrollY * 0.05}px)` }"
    ></div>

    <!-- Comic panel background grid -->
    <div class="absolute inset-0 bg-comic-grid opacity-40"></div>

    <!-- Soft corner vignette -->
    <div class="absolute inset-0 bg-radial from-transparent via-transparent to-slate-200/40 pointer-events-none"></div>
  </div>
</template>
