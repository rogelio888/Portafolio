<script setup lang="ts">
const steps = [
  { num: '01', title: 'Contanos la idea', desc: 'Nos escribís por WhatsApp o Instagram con la referencia, zona del cuerpo y tamaño aproximado.' },
  { num: '02', title: 'Diseño y presupuesto', desc: 'El artista boceta la pieza y te confirma precio y duración de la sesión antes de agendar.' },
  { num: '03', title: 'Seña y agenda', desc: 'Con una seña reservás fecha y hora. El boceto final se ve recién el día de la cita.' },
  { num: '04', title: 'Sesión', desc: 'Tatuás en un espacio privado, con material estéril de un solo uso y música a tu elección.' }
]
</script>

<template>
  <section class="relative py-28 sm:py-36 px-5 sm:px-10 border-b border-paper/10">
    <div class="max-w-6xl mx-auto">
      <span class="font-mono-label text-xs text-blood block mb-8">05 — CÓMO RESERVAR</span>
      <h2 class="font-display text-[10vw] sm:text-[6vw] lg:text-[4vw] leading-[0.95] mb-16">
        DE LA IDEA<br>A LA PIEL
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
        <Motion
          v-for="(step, i) in steps"
          :key="step.num"
          :initial="{ opacity: 0, y: 24 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.5, delay: i * 0.12 }"
          class="relative"
        >
          <span class="font-display text-outline text-6xl sm:text-7xl block mb-4">{{ step.num }}</span>
          <h3 class="font-display text-xl sm:text-2xl text-paper mb-3">{{ step.title }}</h3>
          <p class="font-sans text-paper/50 text-sm leading-relaxed">{{ step.desc }}</p>
        </Motion>
      </div>
    </div>
  </section>
</template>
