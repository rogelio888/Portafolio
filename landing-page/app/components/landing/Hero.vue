<script setup lang="ts">
const lines = ['CUERVO', 'TATTOO', 'CLUB']
</script>

<template>
  <section class="relative min-h-[100svh] flex flex-col justify-between overflow-hidden border-b border-paper/10 grid-overlay">
    <!-- Floating flash doodles -->
    <div class="pointer-events-none absolute inset-0">
      <Motion
        :initial="{ opacity: 0, y: 20, rotate: -8 }"
        :animate="{ opacity: 0.5, y: 0, rotate: -8 }"
        :transition="{ duration: 1, delay: 0.6 }"
        class="absolute top-[16%] left-[6%] w-16 h-16 sm:w-24 sm:h-24 text-paper/70"
      >
        <FlashIcon name="dagger" />
      </Motion>
      <Motion
        :initial="{ opacity: 0, y: 20, rotate: 10 }"
        :animate="{ opacity: 0.5, y: 0, rotate: 10 }"
        :transition="{ duration: 1, delay: 0.8 }"
        class="absolute top-[20%] right-[8%] w-20 h-20 sm:w-28 sm:h-28 text-blood"
      >
        <FlashIcon name="rose" />
      </Motion>
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 0.4, y: 0 }"
        :transition="{ duration: 1, delay: 1 }"
        class="absolute bottom-[14%] left-[10%] w-14 h-14 sm:w-20 sm:h-20 text-paper/60"
      >
        <FlashIcon name="star" />
      </Motion>
      <Motion
        :initial="{ opacity: 0, y: 20, rotate: -6 }"
        :animate="{ opacity: 0.45, y: 0, rotate: -6 }"
        :transition="{ duration: 1, delay: 1.2 }"
        class="absolute bottom-[20%] right-[12%] w-16 h-16 sm:w-24 sm:h-24 text-paper/60"
      >
        <FlashIcon name="swallow" />
      </Motion>
    </div>

    <!-- Top bar -->
    <div class="relative z-10 flex items-center justify-between px-5 sm:px-10 pt-6">
      <span class="font-mono-label text-[10px] sm:text-xs text-paper/70">EST. 2019 — LA PAZ, BOLIVIA</span>
      <span class="font-mono-label text-[10px] sm:text-xs text-paper/70 flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-blood animate-pulse" />
        AGENDA ABIERTA
      </span>
    </div>

    <!-- Wordmark -->
    <div class="relative z-10 px-4 sm:px-8">
      <div class="flex flex-col items-center leading-[0.82] text-center">
        <Motion
          v-for="(line, i) in lines"
          :key="line"
          :initial="{ opacity: 0, y: 60 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.9, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }"
          class="font-display text-[16vw] sm:text-[13vw] lg:text-[11vw]"
          :class="i === 1 ? 'text-outline' : 'text-paper'"
        >
          {{ line }}
        </Motion>
      </div>
    </div>

    <!-- Bottom ticker -->
    <div class="relative z-10 border-t border-paper/10 py-3 bg-ink-1/60">
      <LandingMarquee
        :items="['BLACKWORK', 'FINE LINE', 'REALISMO', 'COVER-UPS', 'FLASH DAYS', 'PIERCING']"
      />
    </div>

    <!-- Scroll cue -->
    <div class="absolute bottom-24 right-6 sm:right-10 z-10 hidden sm:flex flex-col items-center gap-2 text-paper/50">
      <span class="font-mono-label text-[10px] rotate-90 origin-center translate-y-4">SCROLL</span>
      <span class="w-px h-14 bg-paper/30 mt-6" />
    </div>
  </section>
</template>
