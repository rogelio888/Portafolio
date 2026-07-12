<script setup lang="ts">
const artists = [
  { initials: 'MR', name: 'Mara Rojas', specialty: 'Blackwork / Geometría', handle: '@mara.rojas.ink', icon: 'snake' as const },
  { initials: 'DC', name: 'Dante Cuellar', specialty: 'Realismo / Retrato', handle: '@dante.tattoos', icon: 'eye' as const },
  { initials: 'IZ', name: 'Ime Zambrana', specialty: 'Fine Line / Botánica', handle: '@ime.linework', icon: 'swallow' as const },
  { initials: 'JQ', name: 'Joaquín Quispe', specialty: 'Neotradicional', handle: '@quispe.tattoo', icon: 'rose' as const }
]
</script>

<template>
  <section class="relative py-28 sm:py-36 px-5 sm:px-10 border-b border-paper/10 bg-ink-1">
    <div class="max-w-6xl mx-auto">
      <span class="font-mono-label text-xs text-blood block mb-8">04 — RESIDENTES</span>
      <h2 class="font-display text-[10vw] sm:text-[6vw] lg:text-[4vw] leading-[0.95] mb-16">
        QUIÉN<br>TE TATÚA
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-paper/15 border border-paper/15">
        <Motion
          v-for="(artist, i) in artists"
          :key="artist.handle"
          data-cursor-hover
          :initial="{ opacity: 0, y: 24 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.5, delay: i * 0.1 }"
          class="group relative bg-ink-1 p-6 sm:p-7 flex flex-col justify-between min-h-[300px] overflow-hidden"
        >
          <div class="absolute -right-4 -bottom-6 w-32 h-32 text-paper/[0.04] group-hover:text-blood/10 transition-colors duration-500">
            <FlashIcon :name="artist.icon" />
          </div>

          <div class="relative z-10 flex items-center justify-between">
            <span class="font-display text-4xl sm:text-5xl text-paper/15 group-hover:text-blood/40 transition-colors duration-500">{{ artist.initials }}</span>
            <span class="font-mono-label text-[10px] text-paper/40">0{{ i + 1 }}</span>
          </div>

          <div class="relative z-10">
            <h3 class="font-display text-xl sm:text-2xl text-paper leading-tight">{{ artist.name }}</h3>
            <p class="font-mono-label text-[10px] text-blood mt-2">{{ artist.specialty }}</p>
            <p class="font-sans text-paper/40 text-xs mt-3 group-hover:text-paper/70 transition-colors">{{ artist.handle }}</p>
          </div>
        </Motion>
      </div>
    </div>
  </section>
</template>
