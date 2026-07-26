<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);

const step = ref(1);

const formData = ref({
  style: 'Línea Fina y Micro-Realismo',
  placement: 'Antebrazo / Brazo',
  artist: 'Elena Vance',
  size: 'Mediano (5-10 cm)',
  date: 'Agenda Abierta Q3 2026',
  name: '',
  email: '',
  notes: '',
});

const stylesList = [
  'Línea Fina y Micro-Realismo',
  'Realismo Oscuro y Blackwork',
  'Geometría de Aguja Única',
  'Manga Completa de Autor',
];

const placementsList = [
  'Antebrazo / Brazo',
  'Costillas / Torso',
  'Espalda Completa',
  'Pierna / Muslo',
  'Ubicación Especial',
];

const artistsList = [
  { name: 'Elena Vance', role: 'Maestra en Línea Fina y Micro-Realismo' },
  { name: 'Kaelen Dark', role: 'Maestro en Realismo Oscuro y Blackwork' },
  { name: 'Sora Lin', role: 'Especialista en Arte Ilustrativo' },
  { name: 'Primer Artista Disponible', role: 'Selección del Santuario' },
];

const sizesList = [
  'Micro (2-5 cm)',
  'Mediano (5-10 cm)',
  'Grande (10-20 cm)',
  'Manga / Espalda Completa',
];

const whatsappUrl = computed(() => {
  const text = `Hola Cuervo Tattoo Studio! Quiero solicitar una cita de residencia:
- *Nombre*: ${formData.value.name || 'Cliente'}
- *Estilo*: ${formData.value.style}
- *Artista*: ${formData.value.artist}
- *Ubicación*: ${formData.value.placement}
- *Tamaño*: ${formData.value.size}
- *Idea*: ${formData.value.notes || 'Consulta general'}`;
  return `https://wa.me/59170000000?text=${encodeURIComponent(text)}`;
});

const resetAndClose = () => {
  step.value = 1;
  emit('close');
};
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <!-- Backdrop -->
      <div @click="resetAndClose" class="absolute inset-0 bg-black/85 backdrop-blur-md" />

      <!-- Modal Container -->
      <div class="relative z-10 w-full max-w-2xl liquid-glass-strong rounded-[1.75rem] p-6 md:p-8 border border-white/20 shadow-2xl text-white overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="liquid-glass h-10 w-10 rounded-full flex items-center justify-center border border-white/20">
              <UIcon name="i-lucide-sparkles" class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="font-display text-xl text-white tracking-wider leading-none">
                CUERVO TATTOO &mdash; RESERVA DE CITA
              </h3>
              <p class="text-xs font-mono-label text-white/60 mt-1">
                Residencia Privada &bull; Paso {{ step }} de 3
              </p>
            </div>
          </div>
          <button
            @click="resetAndClose"
            class="liquid-glass h-9 w-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors border border-white/10 cursor-pointer"
          >
            <UIcon name="i-lucide-x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Step 1 -->
        <div v-if="step === 1" class="space-y-6">
          <div>
            <label class="block text-xs font-mono-label uppercase tracking-widest text-white/70 mb-3">
              1. Estilo de Tatuaje
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="st in stylesList"
                :key="st"
                type="button"
                @click="formData.style = st"
                class="liquid-glass p-3.5 rounded-xl text-left text-sm font-sans transition-all flex items-center justify-between cursor-pointer"
                :class="formData.style === st ? 'border-2 border-white bg-white/25 text-white font-bold shadow-md' : 'text-white/70 hover:text-white hover:bg-white/5 border border-white/5'"
              >
                <span>{{ st }}</span>
                <UIcon v-if="formData.style === st" name="i-lucide-check" class="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-mono-label uppercase tracking-widest text-white/70 mb-3">
              2. Ubicación Anatómica
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="pl in placementsList"
                :key="pl"
                type="button"
                @click="formData.placement = pl"
                class="liquid-glass px-4 py-2 rounded-full text-xs font-mono-label transition-all cursor-pointer"
                :class="formData.placement === pl ? 'border-2 border-white bg-white/25 text-white font-bold shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10 border border-white/5'"
              >
                {{ pl }}
              </button>
            </div>
          </div>

          <div class="pt-4 flex justify-end">
            <button
              type="button"
              @click="step = 2"
              class="bg-white text-black font-mono-label text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-white/90 transition-colors cursor-pointer"
            >
              <span>Continuar a Selección de Artista</span>
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Step 2 -->
        <div v-else-if="step === 2" class="space-y-6">
          <div>
            <label class="block text-xs font-mono-label uppercase tracking-widest text-white/70 mb-3">
              3. Artista Residente Preferido
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="art in artistsList"
                :key="art.name"
                type="button"
                @click="formData.artist = art.name"
                class="liquid-glass p-4 rounded-xl text-left transition-all cursor-pointer"
                :class="formData.artist === art.name ? 'border-2 border-white bg-white/25 shadow-md' : 'hover:bg-white/5 border border-white/5'"
              >
                <div class="font-display text-sm text-white tracking-wider">{{ art.name }}</div>
                <div class="text-xs text-white/60 font-sans mt-0.5">{{ art.role }}</div>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-mono-label uppercase tracking-widest text-white/70 mb-3">
              4. Dimensiones Estimadas
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="sz in sizesList"
                :key="sz"
                type="button"
                @click="formData.size = sz"
                class="liquid-glass px-4 py-2.5 rounded-xl text-xs font-mono-label text-center transition-all cursor-pointer"
                :class="formData.size === sz ? 'border-2 border-white bg-white/25 text-white font-bold shadow-md' : 'text-white/80 hover:bg-white/10 border border-white/5'"
              >
                {{ sz }}
              </button>
            </div>
          </div>

          <div class="pt-4 flex justify-between">
            <button
              type="button"
              @click="step = 1"
              class="text-xs font-mono-label text-white/70 hover:text-white px-4 py-2"
            >
              Volver
            </button>
            <button
              type="button"
              @click="step = 3"
              class="bg-white text-black font-mono-label text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-white/90 transition-colors cursor-pointer"
            >
              <span>Continuar a Datos de Contacto</span>
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Step 3 -->
        <div v-else-if="step === 3" class="space-y-4">
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-mono-label uppercase tracking-widest text-white/70 mb-1">Nombre Completo</label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="Ej. Carlos Mendoza"
                class="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label class="block text-xs font-mono-label uppercase tracking-widest text-white/70 mb-1">Correo Electrónico</label>
              <input
                v-model="formData.email"
                type="email"
                placeholder="carlos@ejemplo.com"
                class="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label class="block text-xs font-mono-label uppercase tracking-widest text-white/70 mb-1">Descripción de tu Idea / Referencias</label>
              <textarea
                v-model="formData.notes"
                rows="3"
                placeholder="Describe los elementos visuales, tamaño o historia detrás de tu tatuaje..."
                class="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Summary card -->
          <div class="liquid-glass rounded-xl p-4 border border-white/10 text-xs space-y-1 font-sans text-white/80">
            <div class="font-mono-label uppercase text-[10px] text-white/50 mb-1">Resumen de Cita:</div>
            <div><strong>Estilo:</strong> {{ formData.style }}</div>
            <div><strong>Artista:</strong> {{ formData.artist }} &bull; <strong>Ubicación:</strong> {{ formData.placement }}</div>
            <div><strong>Dimensión:</strong> {{ formData.size }}</div>
          </div>

          <div class="pt-2 flex justify-between items-center">
            <button
              type="button"
              @click="step = 2"
              class="text-xs font-mono-label text-white/70 hover:text-white px-2"
            >
              Volver
            </button>
            <a
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              @click="resetAndClose"
              class="bg-emerald-500 hover:bg-emerald-400 text-black font-mono-label text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              <UIcon name="i-lucide-send" class="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
