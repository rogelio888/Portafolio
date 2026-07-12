<script setup lang="ts">
const stats = [
  { value: '2,400+', label: 'Sesiones realizadas' },
  { value: '11', label: 'Años tatuando' },
  { value: '6', label: 'Artistas residentes' },
  { value: '100%', label: 'Diseños originales' }
]
</script>

<template>
  <section class="relative py-28 sm:py-36 px-5 sm:px-10 border-b border-paper/10">
    <div class="max-w-6xl mx-auto">
      <Motion
        as="span"
        :initial="{ opacity: 0, x: -20 }"
        :while-in-view="{ opacity: 1, x: 0 }"
        :viewport="{ once: true }"
        :transition="{ duration: 0.6 }"
        class="font-mono-label text-xs text-blood block mb-8"
      >
        01 — MANIFIESTO
      </Motion>

      <Motion
        as="p"
        :initial="{ opacity: 0, y: 30 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :viewport="{ once: true }"
        :transition="{ duration: 0.8 }"
        class="font-display text-[8vw] sm:text-[5vw] lg:text-[3.6vw] leading-[1.05] max-w-5xl text-paper"
      >
        No hacemos tatuajes de catálogo. Cada pieza se dibuja una sola vez, para una sola piel, y después se destruye el boceto.
      </Motion>

      <div class="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-4 max-w-4xl">
        <Motion
          v-for="(stat, i) in stats"
          :key="stat.label"
          :initial="{ opacity: 0, y: 20 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.5, delay: i * 0.1 }"
          class="border-t border-paper/20 pt-4"
        >
          <div class="font-display text-3xl sm:text-4xl text-paper">{{ stat.value }}</div>
          <div class="font-mono-label text-[10px] text-paper/50 mt-1">{{ stat.label }}</div>
        </Motion>
      </div>
    </div>
  </section>
</template>
