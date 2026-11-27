<script setup lang="ts">
import { ref } from 'vue'
import { MessageSquare, ArrowUpRight, MapPin, Clock, CheckCircle2, Phone, Copy, Check } from 'lucide-vue-next'

const copied = ref(false)
const copyPhone = async () => {
  try {
    await navigator.clipboard.writeText('+591 68787985')
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Fallback ignored
  }
}
</script>

<template>
  <section id="contacto" class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-20 lg:py-28">
    
    <div class="comic-panel p-5 sm:p-12 lg:p-16 bg-white">
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-center">
        
        <!-- Left: Call to Action -->
        <div class="lg:col-span-7">
          <div class="comic-caption mb-3 sm:mb-4 text-[10px] sm:text-xs select-none">
            <span>CAPÍTULO 04 // CONTACTO</span>
          </div>

          <h2 class="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display uppercase leading-tight mb-3.5 sm:mb-5">
            ¿Tienes un proyecto o
            <span class="text-blue-600 underline decoration-slate-900 decoration-4 underline-offset-6">
              sistema en mente?
            </span>
          </h2>

          <p class="text-[13px] sm:text-base text-slate-700 font-medium leading-relaxed mb-5 sm:mb-8 max-w-xl">
            Si tu empresa, clínica o institución necesita una plataforma web a medida o modernizar herramientas existentes, podemos evaluar alcance, requerimientos y cronograma sin compromiso.
          </p>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5 sm:mb-8 select-none">
            <a 
              href="https://wa.me/59168787985" 
              target="_blank"
              class="comic-btn-primary w-full sm:w-auto h-12 sm:h-13 px-6 sm:px-8 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700"
            >
              <MessageSquare class="w-4 h-4 shrink-0" />
              <span>Escribir por WhatsApp</span>
              <ArrowUpRight class="w-4 h-4 shrink-0" />
            </a>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-6 text-xs text-slate-600 font-bold">
            <div class="flex items-center gap-1.5">
              <MapPin class="w-4 h-4 text-blue-600 shrink-0" />
              <span>Santa Cruz, Bolivia (Trabajo Remoto)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Clock class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Respuesta ágil</span>
            </div>
          </div>
        </div>

        <!-- Right: Information Box -->
        <div class="lg:col-span-5 bg-blue-50/60 rounded-2xl border-2 border-slate-900 p-4 sm:p-8 space-y-3.5 text-xs shadow-[4px_4px_0px_#0f172a]">
          
          <div class="text-xs font-black text-slate-900 uppercase tracking-wider pb-3 border-b-2 border-slate-900">
            Nexora Systems &bull; Disponibilidad
          </div>

          <div class="space-y-2.5 text-slate-700 font-medium">
            <div class="flex items-start gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Desarrollo de sistemas web completos (Frontend + Backend)</span>
            </div>
            <div class="flex items-start gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Modernización e integración de bases de datos existentes</span>
            </div>
            <div class="flex items-start gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Control de citas, cobros recurrentes y KARDEX de inventario</span>
            </div>
            <div class="flex items-start gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Demos funcionales en navegador previas a la puesta en producción</span>
            </div>
          </div>

          <div class="pt-3.5 border-t-2 border-slate-900 flex flex-wrap items-center justify-between gap-2 text-slate-700 font-bold">
            <a 
              href="tel:+59168787985"
              class="inline-flex items-center gap-1.5 text-slate-900 font-black text-sm hover:text-blue-700 transition-colors py-1"
            >
              <Phone class="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>+591 68787985</span>
            </a>

            <button
              type="button"
              @click="copyPhone"
              class="px-2.5 py-1.5 rounded-lg bg-white border-2 border-slate-900 text-[11px] font-black uppercase text-slate-800 flex items-center gap-1 shadow-[2px_2px_0px_#0f172a] active:translate-y-0.5 cursor-pointer select-none"
            >
              <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-600" />
              <Copy v-else class="w-3.5 h-3.5 text-slate-600" />
              <span>{{ copied ? 'Copiado' : 'Copiar' }}</span>
            </button>
          </div>

        </div>

      </div>

    </div>

  </section>
</template>
