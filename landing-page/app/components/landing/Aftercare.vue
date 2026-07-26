<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['openBooking']);

const activeTab = ref(0);

const steps = [
  {
    phase: 'Fase 1: Protección Inmediata',
    timeline: '0 &mdash; 48 Horas',
    title: 'Película Médica Segunda Piel',
    points: [
      'Mantén la película médica transpirable de 24 a 48 horas para proteger la tinta fresca.',
      'Lava suavemente con jabón neutro antibacteriano sin fragancia y agua tibia.',
      'Seca dando toques suaves con toallas de papel estéril de un solo uso.',
    ],
  },
  {
    phase: 'Fase 2: Regeneración Cutánea',
    timeline: 'Días 3 &mdash; 14',
    title: 'Balance de Hidratación y Curación',
    points: [
      'Aplica una capa fina de bálsamo orgánico vegano 2 o 3 veces al día.',
      'Evita sumergirte en piscinas, saunas, tinas de agua caliente o agua de mar durante la cicatrización.',
      'Permite que la micro-descamación ocurra de forma natural sin rascar la piel.',
    ],
  },
  {
    phase: 'Fase 3: Conservación de la Tinta',
    timeline: 'Día 15 &mdash; De Por Vida',
    title: 'Protección Solar y Longevidad',
    points: [
      'Aplica protector solar mineral FPS 50+ siempre que te expongas al sol directo.',
      'Mantén la piel hidratada diariamente con cremas hidratantes naturales no comedogénicas.',
      'Agenda una evaluación de retoque de cortesía dentro de los 60 días posteriores a la sesión.',
    ],
  },
];
</script>

<template>
  <section id="cuidados" class="relative min-h-screen w-full bg-black py-16 sm:py-28 px-4 sm:px-12 lg:px-20 text-white select-none">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
        <div class="liquid-glass rounded-full px-3.5 py-1.5 inline-flex items-center gap-2 text-[10px] sm:text-xs font-mono-label text-white/80 mb-3 border border-white/10">
          <UIcon name="i-lucide-shield-check" class="w-3.5 h-3.5 text-white" />
          <span>Protocolo Médico de Cicatrización</span>
        </div>
        <h2 class="font-display italic text-3xl sm:text-6xl lg:text-7xl leading-tight text-white tracking-tight">
          PRESERVANDO EL ARTE PARA GENERACIONES
        </h2>
        <p class="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base font-sans font-light text-white/80 leading-relaxed px-2">
          Nuestra responsabilidad trasciende la aguja. Cada sesión incluye film médico transpirable, bálsamo vegano de cicatrización y garantía de conservación a 60 días.
        </p>
      </div>

      <!-- Timeline Step Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div
          v-for="(step, index) in steps"
          :key="step.phase"
          @click="activeTab = index"
          class="liquid-glass rounded-[1.25rem] sm:rounded-[1.5rem] p-5 sm:p-6 cursor-pointer transition-all border"
          :class="activeTab === index ? 'border-white bg-white/[0.06] shadow-2xl scale-[1.01]' : 'border-white/10 hover:border-white/30'"
        >
          <div class="flex items-center justify-between text-[11px] sm:text-xs font-mono-label text-white/60 uppercase tracking-wider mb-3">
            <span>{{ step.phase }}</span>
            <span class="liquid-glass rounded-full px-2.5 py-0.5 text-white/90 font-bold border border-white/10" v-html="step.timeline" />
          </div>

          <h3 class="font-display italic text-xl sm:text-2xl text-white mb-3 leading-snug">
            {{ step.title }}
          </h3>

          <ul class="space-y-2.5 text-xs font-sans text-white/80 font-light leading-relaxed">
            <li v-for="(pt, i) in step.points" :key="i" class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{{ pt }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Guarantee Banner -->
      <div class="mt-8 sm:mt-12 liquid-glass-strong rounded-[1.25rem] sm:rounded-[1.5rem] p-5 sm:p-6 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-5 border border-white/20">
        <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
          <div class="liquid-glass h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shrink-0 border border-white/20">
            <UIcon name="i-lucide-sparkles" class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h4 class="font-display italic text-xl sm:text-2xl text-white">Garantía de Esterilización 100% en Autoclave</h4>
            <p class="text-[11px] sm:text-xs font-sans text-white/70 mt-0.5">Agujas quirúrgicas de un solo uso &bull; Pigmentos orgánicos veganos &bull; Desinfección de nivel hospitalario</p>
          </div>
        </div>
        <button
          @click="emit('openBooking')"
          class="w-full sm:w-auto bg-white text-black font-mono-label text-xs font-bold px-6 py-3 rounded-full hover:bg-white/90 transition-colors whitespace-nowrap cursor-pointer shadow-lg active:scale-95"
        >
          RESERVAR TU PIEZA
        </button>
      </div>
    </div>
  </section>
</template>
