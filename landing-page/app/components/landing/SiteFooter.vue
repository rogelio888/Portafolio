<script setup lang="ts">
const emit = defineEmits(['openBooking']);
</script>

<template>
  <footer id="contacto" class="relative bg-black border-t border-white/10 py-14 sm:py-20 px-4 sm:px-12 lg:px-20 text-white select-none">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
      <!-- Brand Column -->
      <div class="space-y-3 sm:space-y-4 md:col-span-1">
        <div class="flex items-center gap-3">
          <div class="liquid-glass h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-display text-lg sm:text-xl text-white border border-white/20">
            C
          </div>
          <span class="font-display italic text-xl sm:text-2xl tracking-wider text-white">CUERVO</span>
        </div>
        <p class="text-xs font-sans font-light text-white/70 leading-relaxed">
          Santuario de artistas residentes dedicados al tatuaje de autor. Trazo fino, realismo oscuro, microdetalles y bioseguridad estéril.
        </p>
        <div class="flex items-center gap-3 pt-1">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            class="liquid-glass h-8 w-8 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors border border-white/10"
          >
            <UIcon name="i-lucide-instagram" class="w-4 h-4" />
          </a>
        </div>
      </div>

      <!-- Studio Locations -->
      <div class="space-y-2.5 sm:space-y-3">
        <h4 class="text-xs font-mono-label uppercase tracking-widest text-white/60 font-semibold">Ubicaciones de Estudio</h4>
        <ul class="space-y-2 text-xs font-sans text-white/80 font-light">
          <li class="hover:text-white cursor-default">
            <strong class="text-white block font-medium">Santuario Principal, La Paz</strong>
            Av. Arce #2415, Zona Sopocachi
          </li>
          <li class="hover:text-white cursor-default pt-1">
            <strong class="text-white block font-medium">Atelier Residencia, Santa Cruz</strong>
            Equipetrol Norte, Calle 7 Este #12
          </li>
        </ul>
      </div>

      <!-- Studio Hours -->
      <div class="space-y-2.5 sm:space-y-3">
        <h4 class="text-xs font-mono-label uppercase tracking-widest text-white/60 font-semibold">Horarios de Residencia</h4>
        <ul class="space-y-2 text-xs font-sans text-white/80 font-light">
          <li>Martes &mdash; Sábado: 11:00 AM &ndash; 8:00 PM</li>
          <li>Domingos y Lunes: Únicamente Citas Privadas</li>
          <li class="pt-1 text-white/60">&bull; Consulta previa de evaluación estéril requerida</li>
        </ul>
      </div>

      <!-- CTA Column -->
      <div class="space-y-3 sm:space-y-4">
        <h4 class="text-xs font-mono-label uppercase tracking-widest text-white/60 font-semibold">Residencia Privada</h4>
        <p class="text-xs font-sans text-white/70 font-light leading-relaxed">
          La agenda para Q3/Q4 2026 está abierta para piezas personalizadas, mangas completas y micro-realismo.
        </p>
        <button
          @click="emit('openBooking')"
          class="w-full bg-white text-black font-mono-label text-xs font-bold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-white/90 transition-colors shadow-lg cursor-pointer active:scale-95"
        >
          <span>RESERVAR CITA PRIVADA</span>
          <UIcon name="i-lucide-arrow-up-right" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="max-w-7xl mx-auto pt-6 sm:pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-[10px] sm:text-[11px] font-mono-label text-white/50 gap-3 text-center md:text-left">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-shield-check" class="w-4 h-4 text-white/70 shrink-0" />
        <span>&copy; {{ new Date().getFullYear() }} CUERVO TATTOO STUDIO &bull; Santuario de Tatuaje de Autor</span>
      </div>
      <div class="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
        <a href="#cuidados" class="hover:text-white transition-colors">Cuidados</a>
        <a href="#proceso" class="hover:text-white transition-colors">Especialidades</a>
        <button @click="emit('openBooking')" class="hover:text-white transition-colors cursor-pointer">Reservar Cita</button>
      </div>
    </div>
  </footer>
</template>
