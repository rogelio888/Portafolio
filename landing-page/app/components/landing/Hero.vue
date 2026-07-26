<script setup lang="ts">
const emit = defineEmits(['openBooking']);
</script>

<template>
  <section id="hero" class="relative min-h-screen w-full overflow-hidden bg-black flex flex-col justify-between select-none pt-24 pb-12">
    <!-- Ambient Background Video -->
    <video
      autoplay
      loop
      muted
      playsinline
      src="/assets/videos/video1.mp4"
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-cover w-[120%] h-[120%] z-0 pointer-events-none opacity-45 min-h-full min-w-full"
    />

    <!-- Ambient Vignette Overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black z-0 pointer-events-none" />
    <div class="absolute inset-0 tattoo-grid-bg opacity-30 pointer-events-none z-0" />

    <!-- Main Hero Content -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center max-w-5xl mx-auto my-auto">
      <!-- Badge -->
      <div class="liquid-glass rounded-full px-4 py-1.5 inline-flex items-center gap-2.5 text-xs md:text-sm text-white/90 font-mono-label mb-6 border border-white/10 shadow-lg">
        <span class="bg-white text-black text-[10px] md:text-[11px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">
          RESIDENCIA
        </span>
        <span>Agenda Abierta Q3 2026 &mdash; Citas privadas limitadas</span>
      </div>

      <!-- Main Headline -->
      <div class="my-4 max-w-4xl">
        <h1 class="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] italic text-white leading-[0.88] tracking-tight">
          ARTE VIVO GRABADO CON <span class="text-outline">PRECISIÓN ETERNA</span>
        </h1>
      </div>

      <!-- Subtext -->
      <p class="mt-4 text-sm md:text-base text-white/80 max-w-2xl font-sans font-light leading-relaxed text-center">
        Somos un santuario de artistas residentes dedicados al tatuaje de autor. Trazo fino, realismo oscuro, microdetalles y piezas exclusivas creadas con absoluta esterilidad.
      </p>

      <!-- CTA Buttons -->
      <div class="mt-8 flex items-center justify-center gap-5 flex-wrap">
        <button
          type="button"
          @click="emit('openBooking')"
          class="liquid-glass-strong rounded-full px-8 py-3.5 flex items-center gap-2.5 text-white font-mono-label text-xs tracking-widest hover:scale-105 transition-all shadow-2xl border border-white/20 cursor-pointer"
        >
          <span>RESERVAR SESIÓN</span>
          <UIcon name="i-lucide-arrow-up-right" class="w-4 h-4 text-white" />
        </button>

        <a
          href="#galeria"
          class="liquid-glass rounded-full px-6 py-3.5 flex items-center gap-2.5 text-xs font-mono-label tracking-widest text-white/80 hover:text-white hover:bg-white/10 transition-all border border-white/10"
        >
          <UIcon name="i-lucide-play" class="w-3.5 h-3.5 fill-white text-white" />
          <span>EXPLORAR GALERÍA</span>
        </a>
      </div>

      <!-- Stats Cards -->
      <div class="mt-12 flex items-center justify-center gap-4 flex-wrap">
        <!-- Card 1 -->
        <div class="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left flex flex-col justify-between border border-white/10 hover:border-white/30 transition-colors">
          <div class="flex items-center justify-between text-white/80">
            <UIcon name="i-lucide-clock" class="w-5 h-5 text-white/80" />
          </div>
          <div class="mt-4">
            <div class="text-3xl font-display italic tracking-tight leading-none text-white">
              10+ Años
            </div>
            <p class="text-xs text-white/70 font-sans leading-snug mt-1.5 font-light">
              Maestría Artística y Bioseguridad Médica
            </p>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left flex flex-col justify-between border border-white/10 hover:border-white/30 transition-colors">
          <div class="flex items-center justify-between text-white/80">
            <UIcon name="i-lucide-globe" class="w-5 h-5 text-white/80" />
          </div>
          <div class="mt-4">
            <div class="text-3xl font-display italic tracking-tight leading-none text-white">
              2,500+
            </div>
            <p class="text-xs text-white/70 font-sans leading-snug mt-1.5 font-light">
              Piezas Exclusivas Creadas en el Mundo
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Trust Publications Bar -->
    <div class="relative z-10 flex flex-col items-center gap-3 pt-8 pb-4 px-4 text-center border-t border-white/10 bg-black/50 backdrop-blur-sm">
      <div class="liquid-glass rounded-full px-5 py-1 text-[11px] text-white/80 font-mono-label">
        Destacado y reconocido por coleccionistas de arte y publicaciones internacionales
      </div>
      <div class="flex items-center justify-center gap-8 md:gap-16 flex-wrap opacity-80 py-2">
        <span
          v-for="logo in ['Inked Mag', 'Vogue Ink', 'Blackwork', 'DarkArt', 'TattooLife']"
          :key="logo"
          class="font-display italic text-xl md:text-2xl tracking-tight text-white/80 hover:text-white transition-colors cursor-default"
        >
          {{ logo }}
        </span>
      </div>
    </div>
  </section>
</template>
