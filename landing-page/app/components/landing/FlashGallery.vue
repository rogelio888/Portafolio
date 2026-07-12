<script setup lang="ts">
const flashItems = [
  { icon: 'dagger' as const, name: 'Puñal', price: 420, size: '8cm', rotate: -3 },
  { icon: 'rose' as const, name: 'Rosa Negra', price: 550, size: '10cm', rotate: 2 },
  { icon: 'star' as const, name: 'Estrella Náutica', price: 350, size: '6cm', rotate: -2 },
  { icon: 'snake' as const, name: 'Serpiente', price: 680, size: '14cm', rotate: 3 },
  { icon: 'anchor' as const, name: 'Ancla', price: 400, size: '9cm', rotate: -1 },
  { icon: 'swallow' as const, name: 'Golondrina', price: 320, size: '7cm', rotate: 2 },
  { icon: 'lightning' as const, name: 'Rayo', price: 280, size: '5cm', rotate: -4 },
  { icon: 'eye' as const, name: 'Ojo', price: 460, size: '8cm', rotate: 1 },
  { icon: 'raven' as const, name: 'Cuervo', price: 720, size: '15cm', rotate: -2 }
]
</script>

<template>
  <section id="flash" class="relative py-28 sm:py-36 px-5 sm:px-10 border-b border-paper/10">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-wrap items-end justify-between gap-6 mb-16">
        <div>
          <span class="font-mono-label text-xs text-blood block mb-8">03 — FLASH SHEET</span>
          <h2 class="font-display text-[10vw] sm:text-[6vw] lg:text-[4vw] leading-[0.95]">
            DISEÑOS<br>DISPONIBLES
          </h2>
        </div>
        <p class="font-sans text-paper/50 text-sm max-w-xs">
          Piezas únicas, se tatúan una sola vez. Cuando se van, se van para siempre.
        </p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        <Motion
          v-for="(item, i) in flashItems"
          :key="item.name"
          data-cursor-hover
          :initial="{ opacity: 0, y: 24 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.5, delay: (i % 3) * 0.08 }"
          :while-hover="{ rotate: 0, scale: 1.03 }"
          :style="{ rotate: `${item.rotate}deg` }"
          class="group relative aspect-[3/4] border border-paper/15 bg-ink-1 card-texture p-5 flex flex-col justify-between transition-colors hover:border-blood/60"
        >
          <div class="flex items-start justify-between font-mono-label text-[10px] text-paper/40">
            <span>N.{{ String(i + 1).padStart(2, '0') }}</span>
            <span>{{ item.size }}</span>
          </div>

          <div class="w-full aspect-square max-w-[60%] mx-auto text-paper/80 group-hover:text-blood transition-colors duration-500">
            <FlashIcon :name="item.icon" />
          </div>

          <div class="text-center">
            <h3 class="font-display text-lg sm:text-xl text-paper">{{ item.name }}</h3>
            <span class="font-mono-label text-xs text-blood">Bs {{ item.price }}</span>
          </div>
        </Motion>
      </div>
    </div>
  </section>
</template>
