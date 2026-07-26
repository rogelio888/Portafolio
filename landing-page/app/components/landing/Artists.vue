<script setup lang="ts">
const emit = defineEmits(['openBooking']);

const artists = [
  {
    name: 'Elena Vance',
    title: 'Maestra en Línea Fina y Micro-Realismo',
    residency: 'Agenda Q3/Q4 2026',
    bio: 'Pionera en geometría de aguja única y contornos botánicos ingrávidos. Formada en ateliers de Florencia y Tokio.',
    styles: ['Aguja Única', 'Micro-Realismo', 'Geometría Botánica'],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    instagram: '@elena.vance.ink',
  },
  {
    name: 'Kaelen Dark',
    title: 'Especialista en Realismo Oscuro y Blackwork',
    residency: 'Últimos 6 Cupos',
    bio: 'Maestro en iluminación de claroscuro, gradientes de sombras profundas en blackwork y composiciones góticas en mangas completas.',
    styles: ['Realismo Oscuro', 'Claroscuro', 'Blackwork Anatómico'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    instagram: '@kaelendark.tattoo',
  },
  {
    name: 'Sora Lin',
    title: 'Especialista en Arte Ilustrativo y Pincelada',
    residency: 'Residencia Sept 2026',
    bio: 'Fusiona la técnica tradicional de pincelada oriental con el trazo de alta precisión contemporáneo para obras narrativas en la piel.',
    styles: ['Arte Ilustrativo', 'Pincelada', 'Mangas de Autor'],
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    instagram: '@soralin.atelier',
  },
];
</script>

<template>
  <section id="artistas" class="relative min-h-screen w-full bg-black py-28 px-6 md:px-16 lg:px-20 text-white select-none">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-16">
        <div class="text-xs font-mono-label text-white/70 tracking-widest uppercase mb-3 flex items-center gap-2">
          <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-white" />
          <span>// Atelier de Artistas Residentes</span>
        </div>
        <h2 class="font-display italic text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.9] tracking-tight text-white">
          MAESTROS RESIDENTES
        </h2>
        <p class="mt-4 text-sm md:text-base text-white/80 font-sans font-light max-w-xl">
          Cada artista residente aporta una filosofía estética propia, maestría en bioseguridad y años de trayectoria en ateliers internacionales.
        </p>
      </div>

      <!-- Artists Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="artist in artists"
          :key="artist.name"
          class="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between hover:bg-white/[0.04] transition-all group border border-white/10"
        >
          <!-- Photo & Residency Badge -->
          <div class="relative aspect-[4/5] rounded-[1.25rem] overflow-hidden mb-6 bg-white/5">
            <img
              :src="artist.image"
              :alt="artist.name"
              class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            />
            <div class="absolute top-3 right-3 liquid-glass-strong rounded-full px-3 py-1 text-[10px] font-mono-label uppercase font-bold text-white border border-white/20">
              {{ artist.residency }}
            </div>
          </div>

          <!-- Bio & Details -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-display italic text-3xl text-white group-hover:translate-x-1 transition-transform">
                {{ artist.name }}
              </h3>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                class="text-white/60 hover:text-white transition-colors"
              >
                <UIcon name="i-lucide-instagram" class="w-5 h-5" />
              </a>
            </div>

            <p class="text-xs font-mono-label text-white/60 tracking-wider uppercase font-semibold">
              {{ artist.title }}
            </p>

            <p class="text-xs text-white/80 font-sans font-light leading-relaxed">
              {{ artist.bio }}
            </p>

            <!-- Style Badges -->
            <div class="flex flex-wrap gap-1.5 pt-2">
              <span
                v-for="st in artist.styles"
                :key="st"
                class="liquid-glass px-2.5 py-1 rounded-full text-[10px] font-mono-label text-white/90 border border-white/10"
              >
                {{ st }}
              </span>
            </div>
          </div>

          <!-- Action Button -->
          <div class="pt-6 border-t border-white/10 mt-6">
            <button
              @click="emit('openBooking')"
              class="w-full liquid-glass rounded-full py-3 text-xs font-mono-label font-bold text-white flex items-center justify-center gap-1.5 hover:bg-white hover:text-black transition-all border border-white/20 cursor-pointer"
            >
              <span>SOLICITAR CITA CON {{ artist.name.split(' ')[0].toUpperCase() }}</span>
              <UIcon name="i-lucide-arrow-up-right" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
