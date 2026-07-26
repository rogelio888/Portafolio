<script setup lang="ts">
const emit = defineEmits(['openBooking']);

const getAssetUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const clean = url.startsWith('/') ? url.slice(1) : url;
  return `./${clean}`;
};
</script>

<template>
  <section id="hero" class="relative min-h-screen w-full overflow-x-hidden bg-black flex flex-col justify-between select-none pt-20 sm:pt-24 pb-8">
    <!-- Ambient Background Video -->
    <video
      autoplay
      loop
      muted
      playsinline
      :src="getAssetUrl('assets/videos/video1.mp4')"
      class="absolute inset-0 object-cover w-full h-full z-0 pointer-events-none opacity-40 min-h-full min-w-full"
    />

    <!-- Ambient Vignette Overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/85 via-black/50 to-black z-0 pointer-events-none" />
    <div class="absolute inset-0 tattoo-grid-bg opacity-25 pointer-events-none z-0" />

    <!-- Main Hero Content -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-3 sm:px-6 text-center max-w-5xl mx-auto my-auto py-4 sm:py-6 w-full">
      <!-- Badge -->
      <div class="liquid-glass rounded-2xl sm:rounded-full px-3 py-1.5 inline-flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 sm:gap-2.5 text-[9px] sm:text-xs text-white/90 font-mono-label mb-3 sm:mb-6 border border-white/15 shadow-lg max-w-full">
        <span class="bg-white text-black text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0">
          RESIDENCIA
        </span>
        <span class="text-center sm:text-left">Agenda Q3 2026 &bull; Citas limitadas</span>
      </div>

      <!-- Main Headline -->
      <div class="my-2 sm:my-4 max-w-4xl w-full px-1">
        <h1 class="font-display text-2xl sm:text-5xl md:text-7xl lg:text-[5.5rem] italic text-white leading-[0.95] tracking-tight uppercase max-w-full break-words">
          ARTE VIVO GRABADO CON <span class="text-outline block sm:inline">PRECISIÓN ETERNA</span>
        </h1>
      </div>

      <!-- Subtext -->
      <p class="mt-2 sm:mt-4 text-xs sm:text-sm md:text-base text-white/80 max-w-xl font-sans font-light leading-relaxed text-center px-2">
        Somos un santuario de artistas residentes dedicados al tatuaje de autor. Trazo fino, realismo oscuro, microdetalles y piezas exclusivas creadas con absoluta esterilidad.
      </p>

      <!-- CTA Buttons -->
      <div class="mt-5 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-5 w-full max-w-xs sm:max-w-none">
        <button
          type="button"
          @click="emit('openBooking')"
          class="liquid-glass-strong rounded-full px-6 sm:px-8 py-3 sm:py-3.5 flex items-center justify-center gap-2 text-white font-mono-label text-xs tracking-wider sm:tracking-widest hover:scale-105 transition-all shadow-2xl border border-white/20 cursor-pointer w-full sm:w-auto active:scale-95"
        >
          <span>RESERVAR SESIÓN</span>
          <UIcon name="i-lucide-arrow-up-right" class="w-4 h-4 text-white" />
        </button>

        <a
          href="#galeria"
          class="liquid-glass rounded-full px-5 sm:px-6 py-3 sm:py-3.5 flex items-center justify-center gap-2 text-xs font-mono-label tracking-wider sm:tracking-widest text-white/80 hover:text-white hover:bg-white/10 transition-all border border-white/10 w-full sm:w-auto active:scale-95"
        >
          <UIcon name="i-lucide-play" class="w-3.5 h-3.5 fill-white text-white" />
          <span>EXPLORAR GALERÍA</span>
        </a>
      </div>

      <!-- Stats Cards -->
      <div class="mt-6 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-full w-full">
        <!-- Card 1 -->
        <div class="liquid-glass p-3.5 sm:p-5 rounded-[1.25rem] text-left flex flex-col justify-between border border-white/10 hover:border-white/30 transition-colors">
          <div class="flex items-center justify-between text-white/80">
            <UIcon name="i-lucide-clock" class="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
          </div>
          <div class="mt-2 sm:mt-4">
            <div class="text-xl sm:text-3xl font-display italic tracking-tight leading-none text-white">
              10+ Años
            </div>
            <p class="text-[11px] sm:text-xs text-white/70 font-sans leading-snug mt-1 font-light">
              Maestría Artística y Bioseguridad Médica
            </p>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="liquid-glass p-3.5 sm:p-5 rounded-[1.25rem] text-left flex flex-col justify-between border border-white/10 hover:border-white/30 transition-colors">
          <div class="flex items-center justify-between text-white/80">
            <UIcon name="i-lucide-globe" class="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
          </div>
          <div class="mt-2 sm:mt-4">
            <div class="text-xl sm:text-3xl font-display italic tracking-tight leading-none text-white">
              2,500+
            </div>
            <p class="text-[11px] sm:text-xs text-white/70 font-sans leading-snug mt-1 font-light">
              Piezas Exclusivas Creadas en el Mundo
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Trust Publications Bar -->
    <div class="relative z-10 flex flex-col items-center gap-2 sm:gap-3 pt-4 pb-4 px-3 text-center border-t border-white/10 bg-black/60 backdrop-blur-md w-full">
      <div class="liquid-glass rounded-full px-3 py-1 text-[9px] sm:text-[11px] text-white/80 font-mono-label max-w-full truncate">
        Reconocido por coleccionistas de arte y publicaciones internacionales
      </div>
      <div class="flex items-center justify-center gap-3 sm:gap-12 flex-wrap opacity-80 py-1">
        <span
          v-for="logo in ['Inked Mag', 'Vogue Ink', 'Blackwork', 'DarkArt', 'TattooLife']"
          :key="logo"
          class="font-display italic text-sm sm:text-2xl tracking-tight text-white/80 hover:text-white transition-colors cursor-default"
        >
          {{ logo }}
        </span>
      </div>
    </div>
  </section>
</template>
