<script setup lang="ts">
const emit = defineEmits(['openBooking']);

const cards = [
  {
    title: 'Línea Fina y Micro-Realismo',
    icon: 'i-lucide-image',
    tags: ['Línea Fina', 'Aguja Única', 'Micro-Detalle', 'Arte Exclusivo'],
    body: 'Simetría geométrica delicada, detalles de aguja única y sombras ingrávidas diseñadas para contornear tu cuerpo y envejecer con absoluta gracia.',
  },
  {
    title: 'Realismo Oscuro y Blackwork',
    icon: 'i-lucide-film',
    tags: ['Realismo Oscuro', 'Claroscuro', 'Manga Completa', 'Tinta Intensa'],
    body: 'Claroscuro de alto contraste y realismo anatómico. Gradientes de sombras profundas e historias oscuras grabadas permanentemente en la piel.',
  },
  {
    title: 'Consultoría y Curación',
    icon: 'i-lucide-lightbulb',
    tags: ['Diseño Personalizado', 'Pigmentos Veganos', 'Grado Médico', 'Kit de Curación'],
    body: 'Desde el concepto digital inicial en alta resolución hasta protocolos médicos de cicatrización. Cada cita es una experiencia privada, estéril y a medida.',
  },
];
</script>

<template>
  <section id="proceso" class="relative min-h-screen w-full bg-black py-28 px-6 md:px-16 lg:px-20 text-white select-none overflow-hidden flex flex-col justify-center">
    <!-- Ambient Background Video -->
    <video
      autoplay
      loop
      muted
      playsinline
      src="/assets/videos/video2.mp4"
      class="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-40 min-h-full min-w-full"
    />

    <!-- Dark Gradient Overlay for Contrast -->
    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80 z-0 pointer-events-none" />

    <div class="relative z-10 max-w-7xl mx-auto w-full">
      <!-- Header -->
      <div class="mb-16">
        <div class="text-xs font-mono-label text-white/70 tracking-widest uppercase mb-3 flex items-center gap-2">
          <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-white" />
          <span>// Filosofía y Especialidades</span>
        </div>
        <h2 class="font-display italic text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.9] tracking-tight text-white">
          TATUAJE DE AUTOR,<br />DE PRINCIPIO A FIN
        </h2>
      </div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="card in cards"
          :key="card.title"
          class="liquid-glass rounded-[1.5rem] p-6 flex flex-col justify-between hover:bg-white/[0.06] transition-all border border-white/10 shadow-2xl backdrop-blur-md"
        >
          <!-- Top Row: Icon + Tags -->
          <div class="flex items-start justify-between gap-3 mb-8">
            <div class="liquid-glass h-11 w-11 rounded-[0.75rem] flex items-center justify-center shrink-0 border border-white/20">
              <UIcon :name="card.icon" class="w-5 h-5 text-white" />
            </div>
            <div class="flex flex-wrap gap-1.5 justify-end">
              <span
                v-for="tag in card.tags"
                :key="tag"
                class="liquid-glass rounded-full px-2.5 py-1 text-[10px] text-white/90 font-mono-label border border-white/10"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Bottom Row: Title + Body -->
          <div>
            <h3 class="font-display italic text-2xl md:text-3xl tracking-tight leading-snug text-white mb-3">
              {{ card.title }}
            </h3>
            <p class="text-xs md:text-sm text-white/80 font-sans font-light leading-relaxed">
              {{ card.body }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
