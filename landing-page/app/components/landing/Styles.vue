<script setup lang="ts">
const styles = [
  { icon: 'snake' as const, name: 'Blackwork', desc: 'Masas sólidas, alto contraste, geometría cruda sin escala de grises.' },
  { icon: 'swallow' as const, name: 'Fine Line', desc: 'Trazo mínimo y preciso. Delicado en la piel, exigente en la aguja.' },
  { icon: 'eye' as const, name: 'Realismo', desc: 'Retrato y textura fotográfica trabajados en sombra y sesiones largas.' },
  { icon: 'rose' as const, name: 'Neotradicional', desc: 'Líneas gruesas, color saturado, composición cargada de simbolismo.' },
  { icon: 'anchor' as const, name: 'Cover-Up', desc: 'Rediseño total sobre piezas viejas. Se tapa, no se disimula.' }
]

const active = ref(0)
</script>

<template>
  <section class="relative py-28 sm:py-36 px-5 sm:px-10 border-b border-paper/10 bg-ink-1">
    <div class="max-w-6xl mx-auto">
      <span class="font-mono-label text-xs text-blood block mb-8">02 — ESTILOS</span>
      <h2 class="font-display text-[10vw] sm:text-[6vw] lg:text-[4vw] leading-[0.95] mb-16">
        LO QUE<br>SABEMOS HACER
      </h2>

      <div class="border-t border-paper/15">
        <div
          v-for="(style, i) in styles"
          :key="style.name"
          data-cursor-hover
          class="group border-b border-paper/15 py-6 sm:py-8 cursor-pointer transition-colors"
          @mouseenter="active = i"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-baseline gap-4 sm:gap-8 min-w-0">
              <span class="font-mono-label text-xs text-paper/40 shrink-0">0{{ i + 1 }}</span>
              <h3
                class="font-display text-[9vw] sm:text-[3.6vw] leading-none transition-colors truncate"
                :class="active === i ? 'text-blood' : 'text-paper group-hover:text-paper/70'"
              >
                {{ style.name }}
              </h3>
            </div>
            <div class="w-10 h-10 sm:w-14 sm:h-14 shrink-0 transition-all duration-500" :class="active === i ? 'text-blood rotate-12 scale-110' : 'text-paper/30'">
              <FlashIcon :name="style.icon" />
            </div>
          </div>
          <Motion
            :initial="false"
            :animate="{ height: active === i ? 'auto' : 0, opacity: active === i ? 1 : 0 }"
            :transition="{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }"
            class="overflow-hidden"
          >
            <p class="font-sans text-paper/60 text-sm sm:text-base max-w-lg pt-4 pl-0 sm:pl-24">
              {{ style.desc }}
            </p>
          </Motion>
        </div>
      </div>
    </div>
  </section>
</template>
