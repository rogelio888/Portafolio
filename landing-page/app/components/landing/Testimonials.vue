<script setup lang="ts">
const quotes = [
  { text: 'Fui con una foto genérica de Pinterest y salí con un diseño que nadie más va a tener. Eso es lo que pagás acá.', author: 'Valeria N.', piece: 'Blackwork — antebrazo' },
  { text: 'Tres sesiones de realismo y el retrato de mi abuela quedó mejor que la foto original. Sin exagerar.', author: 'Gonzalo P.', piece: 'Realismo — pierna' },
  { text: 'Me hicieron un cover-up de un tatuaje que odiaba hace diez años. Ahora es mi pieza favorita.', author: 'Camila R.', piece: 'Cover-up — espalda' }
]
</script>

<template>
  <section class="relative py-28 sm:py-36 border-b border-paper/10 bg-ink-1 overflow-hidden">
    <div class="px-5 sm:px-10 max-w-6xl mx-auto mb-16">
      <span class="font-mono-label text-xs text-blood block mb-8">06 — VOCES</span>
      <h2 class="font-display text-[10vw] sm:text-[6vw] lg:text-[4vw] leading-[0.95]">
        LO QUE DICEN<br>DESPUÉS
      </h2>
    </div>

    <div class="max-w-6xl mx-auto px-5 sm:px-10 grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
      <Motion
        v-for="(q, i) in quotes"
        :key="q.author"
        :initial="{ opacity: 0, y: 24 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :viewport="{ once: true }"
        :transition="{ duration: 0.5, delay: i * 0.12 }"
        class="border border-paper/15 p-6 sm:p-7 flex flex-col justify-between min-h-[220px]"
      >
        <p class="font-sans text-paper/80 text-sm sm:text-base leading-relaxed">"{{ q.text }}"</p>
        <div class="mt-6 pt-4 border-t border-paper/10">
          <p class="font-mono-label text-xs text-paper">{{ q.author }}</p>
          <p class="font-mono-label text-[10px] text-blood mt-1">{{ q.piece }}</p>
        </div>
      </Motion>
    </div>

    <div class="border-y border-paper/10 py-4">
      <LandingMarquee
        :items="['REVISTA TINTA', 'BOLIVIA STREET ART', 'AGUJA & PAPEL PODCAST', 'FESTIVAL LATAM INK', 'GUÍA URBANA LA PAZ']"
        separator="—"
        reverse
      />
    </div>
  </section>
</template>
