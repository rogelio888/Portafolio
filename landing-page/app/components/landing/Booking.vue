<script setup lang="ts">
const info = [
  { label: 'Dirección', value: 'Av. Arce 2450, Zona Sopocachi, La Paz' },
  { label: 'Horario', value: 'Mar – Sáb · 11:00 – 20:00' },
  { label: 'WhatsApp', value: '+591 700 00 000' },
  { label: 'Instagram', value: '@cuervo.tattooclub' }
]
</script>

<template>
  <section id="reserva" class="relative py-28 sm:py-40 px-5 sm:px-10 border-b border-paper/10 grid-overlay">
    <div class="max-w-6xl mx-auto">
      <span class="font-mono-label text-xs text-blood block mb-8">07 — RESERVA</span>

      <Motion
        :initial="{ opacity: 0, y: 30 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :viewport="{ once: true }"
        :transition="{ duration: 0.7 }"
        class="mb-16"
      >
        <h2 class="font-display text-[13vw] sm:text-[7vw] lg:text-[5.5vw] leading-[0.9] mb-8">
          TU PIEL<br>ES TUYA.<br><span class="text-blood">EMPEZAMOS</span>
        </h2>

        <button
          type="button"
          title="Demo de portafolio — botón no funcional"
          data-cursor-hover
          class="group inline-flex items-center gap-4 border-2 border-paper px-8 py-4 sm:px-10 sm:py-5 hover:bg-paper hover:text-ink-0 transition-colors duration-300 cursor-pointer"
        >
          <span class="font-display text-xl sm:text-2xl">AGENDAR POR WHATSAPP</span>
          <Icon name="i-lucide-arrow-up-right" class="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:rotate-45" />
        </button>
      </Motion>

      <div class="grid grid-cols-1 sm:grid-cols-4 gap-8 border-t border-paper/15 pt-10">
        <Motion
          v-for="(item, i) in info"
          :key="item.label"
          :initial="{ opacity: 0, y: 16 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.4, delay: i * 0.08 }"
        >
          <p class="font-mono-label text-[10px] text-paper/40 mb-2">{{ item.label.toUpperCase() }}</p>
          <p class="font-sans text-paper text-sm sm:text-base">{{ item.value }}</p>
        </Motion>
      </div>
    </div>
  </section>
</template>
