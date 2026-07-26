<script setup lang="ts">
import { ref, computed } from 'vue';

const emit = defineEmits(['openBooking']);

interface GalleryItem {
  id: string;
  title: string;
  category: 'Línea Fina' | 'Realismo Oscuro' | 'Micro-Realismo' | 'Ilustrativo';
  artist: string;
  image: string;
  description: string;
  placement: string;
}

const selectedCategory = ref<string>('Todos');
const activeItem = ref<GalleryItem | null>(null);

const categories = ['Todos', 'Línea Fina', 'Realismo Oscuro', 'Micro-Realismo', 'Ilustrativo'];

const getAssetUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const clean = url.startsWith('/') ? url.slice(1) : url;
  return `./${clean}`;
};

const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Astrolabio Astronómico y Constelación',
    category: 'Línea Fina',
    artist: 'Elena Vance',
    image: 'assets/tattoos/astrolabe.png',
    description: 'Grabado geométrico de aguja única con coordenadas celestes microscópicas.',
    placement: 'Antebrazo Interior',
  },
  {
    id: '2',
    title: 'Cuervo Anatómico en Claroscuro',
    category: 'Realismo Oscuro',
    artist: 'Kaelen Dark',
    image: 'assets/tattoos/raven.png',
    description: 'Sombras profundas de blackwork con textura fotorrealista de plumaje denso.',
    placement: 'Hombro y Costillas',
  },
  {
    id: '3',
    title: 'Helecho Botánico y Zarcillos Delicados',
    category: 'Micro-Realismo',
    artist: 'Sora Lin',
    image: 'assets/tattoos/botanical.png',
    description: 'Trazo orgánico ingrávido esculpido siguiendo la anatomía natural de la espalda.',
    placement: 'Columna y Espalda',
  },
  {
    id: '4',
    title: 'Serpiente Mitológica y Corona Floral',
    category: 'Ilustrativo',
    artist: 'Elena Vance',
    image: 'assets/tattoos/serpent.png',
    description: 'Pieza de manga personalizada que fusiona arte ilustrativo oscuro con trazos de precisión.',
    placement: 'Manga Completa',
  },
  {
    id: '5',
    title: 'Geometría Sagrada y Anillo Solar',
    category: 'Línea Fina',
    artist: 'Sora Lin',
    image: 'assets/tattoos/geometry.png',
    description: 'Micro-simetría de círculos concéntricos grabados mediante técnica de aguja ultra-fina.',
    placement: 'Muslo Exterior',
  },
  {
    id: '6',
    title: 'Arco Catedralicio y Silueta Gótica',
    category: 'Realismo Oscuro',
    artist: 'Kaelen Dark',
    image: 'assets/tattoos/arch.png',
    description: 'Arquitectura en claroscuro de tonalidades profundas inspirada en arcos medievales.',
    placement: 'Espalda Superior',
  },
];

const filteredItems = computed(() => {
  if (selectedCategory.value === 'Todos') return galleryItems;
  return galleryItems.filter((item) => item.category === selectedCategory.value);
});
</script>

<template>
  <section id="galeria" class="relative min-h-screen w-full bg-black py-16 sm:py-28 px-4 sm:px-12 lg:px-20 text-white select-none">
    <!-- Background Accent Grid -->
    <div class="absolute inset-0 tattoo-grid-bg opacity-30 pointer-events-none" />

    <div class="relative z-10 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
        <div>
          <div class="text-[10px] sm:text-xs font-mono-label text-white/70 tracking-widest uppercase mb-2 flex items-center gap-2">
            <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5 text-white" />
            <span>// Galería de Flash & Portafolio Exclusivo</span>
          </div>
          <h2 class="font-display italic text-3xl sm:text-6xl lg:text-7xl leading-none text-white tracking-tight">
            GRABADO EN LA ETERNIDAD
          </h2>
        </div>

        <!-- Filter Pills (Scrollable on mobile) -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 max-w-full">
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            @click="selectedCategory = cat"
            class="liquid-glass px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-mono-label transition-all cursor-pointer whitespace-nowrap shrink-0"
            :class="selectedCategory === cat ? 'border-2 border-white bg-white/25 text-white font-bold shadow-lg shadow-white/10 scale-105' : 'text-white/70 hover:text-white hover:bg-white/10 border border-white/10'"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Gallery Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          @click="activeItem = item"
          class="liquid-glass group rounded-[1.25rem] sm:rounded-[1.5rem] overflow-hidden border border-white/10 hover:border-white/40 transition-all duration-500 cursor-pointer flex flex-col justify-between active:scale-[0.98]"
        >
          <!-- Image Container -->
          <div class="relative aspect-[4/5] overflow-hidden bg-black">
            <img
              :src="getAssetUrl(item.image)"
              :alt="item.title"
              class="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

            <!-- Category Badge -->
            <div class="absolute top-3 left-3 sm:top-4 sm:left-4 liquid-glass px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono-label text-white border border-white/20">
              {{ item.category }}
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-4 sm:p-6">
            <div class="text-[10px] sm:text-[11px] font-mono-label text-white/50 uppercase tracking-widest mb-1">
              {{ item.artist }} &bull; {{ item.placement }}
            </div>
            <h3 class="font-display italic text-lg sm:text-xl text-white group-hover:text-white transition-colors leading-snug">
              {{ item.title }}
            </h3>
            <p class="text-[11px] sm:text-xs font-sans text-white/60 font-light mt-1.5 line-clamp-2">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Detail Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="activeItem" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div @click="activeItem = null" class="absolute inset-0 bg-black/90 backdrop-blur-xl" />
        <div class="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto liquid-glass-strong rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 border border-white/20 shadow-2xl flex flex-col md:flex-row gap-6 sm:gap-8">
          <button
            @click="activeItem = null"
            class="absolute top-3 right-3 sm:top-4 sm:right-4 liquid-glass h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-white/70 hover:text-white border border-white/20 z-20 cursor-pointer"
          >
            <UIcon name="i-lucide-x" class="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div class="w-full md:w-1/2 aspect-square rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-black shrink-0">
            <img :src="getAssetUrl(activeItem.image)" :alt="activeItem.title" class="w-full h-full object-cover" />
          </div>

          <div class="w-full md:w-1/2 flex flex-col justify-between py-1 text-white">
            <div>
              <span class="liquid-glass px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono-label text-white/80 border border-white/10">
                {{ activeItem.category }}
              </span>
              <h3 class="font-display italic text-2xl sm:text-3xl text-white mt-3 mb-2">
                {{ activeItem.title }}
              </h3>
              <p class="text-xs sm:text-sm font-mono-label text-white/60 mb-3">
                Artista: <strong>{{ activeItem.artist }}</strong> &bull; Ubicación: {{ activeItem.placement }}
              </p>
              <p class="text-xs font-sans font-light text-white/80 leading-relaxed mb-6">
                {{ activeItem.description }}
              </p>
            </div>

            <button
              @click="activeItem = null; emit('openBooking')"
              class="w-full bg-white text-black font-mono-label text-xs font-bold py-3 sm:py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-white/90 transition-colors cursor-pointer shadow-lg active:scale-95"
            >
              <span>SOLICITAR ESTE ESTILO</span>
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>
