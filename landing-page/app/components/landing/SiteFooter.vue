<script setup lang="ts">
const socials = ['Instagram', 'TikTok', 'WhatsApp']
</script>

<template>
  <footer class="relative px-5 sm:px-10 pt-16 pb-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-10 pb-10 border-b border-paper/10">
        <span class="font-display text-[16vw] sm:text-[8vw] lg:text-[6vw] leading-[0.85] text-outline">
          CUERVO
        </span>

        <nav class="flex flex-col gap-2 items-start sm:items-end">
          <button
            v-for="s in socials"
            :key="s"
            type="button"
            title="Demo de portafolio — enlace no funcional"
            data-cursor-hover
            class="font-mono-label text-xs text-paper/60 hover:text-blood transition-colors cursor-pointer"
          >
            {{ s }}
          </button>
        </nav>
      </div>

      <div class="flex flex-col sm:flex-row justify-between gap-4 pt-6 font-mono-label text-[10px] text-paper/30">
        <span>© {{ new Date().getFullYear() }} CUERVO TATTOO CLUB — LA PAZ, BOLIVIA</span>
        <span>ESTUDIO FICTICIO — PIEZA DE PORTAFOLIO WEB</span>
      </div>
    </div>
  </footer>
</template>
