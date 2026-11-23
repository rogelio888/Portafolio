<script setup lang="ts">
import { MessageSquare, ArrowUpRight, MapPin, Clock, CheckCircle2 } from 'lucide-vue-next'
</script>

<template>
  <section id="contacto" class="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28 select-none">
    
    <div class="comic-panel p-8 sm:p-12 lg:p-16 bg-white">
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        <!-- Left: Call to Action -->
        <div class="lg:col-span-7">
          <div class="comic-caption mb-4">
            <span>CAPÍTULO 04 // CONTACTO Y COORDINACIÓN</span>
          </div>

          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display uppercase leading-tight mb-5">
            ¿Tienes un proyecto o
            <span class="text-blue-600 underline decoration-slate-900 decoration-4 underline-offset-6">
              sistema en mente?
            </span>
          </h2>

          <p class="text-base text-slate-700 font-medium leading-relaxed mb-8 max-w-xl">
            Si tu empresa, clínica o institución necesita una plataforma web a medida o modernizar herramientas existentes, podemos evaluar alcance, requerimientos y cronograma sin compromiso.
          </p>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
            <a 
              href="https://wa.me/59168787985" 
              target="_blank"
              class="comic-btn-primary px-8 py-4 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700"
            >
              <MessageSquare class="w-4 h-4" />
              <span>Escribir por WhatsApp</span>
              <ArrowUpRight class="w-4 h-4" />
            </a>
          </div>

          <div class="flex flex-wrap items-center gap-6 text-xs text-slate-600 font-bold">
            <div class="flex items-center gap-1.5">
              <MapPin class="w-4 h-4 text-blue-600" />
              <span>Santa Cruz, Bolivia (Trabajo Remoto)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Clock class="w-4 h-4 text-emerald-600" />
              <span>Respuesta ágil</span>
            </div>
          </div>
        </div>

        <!-- Right: Information Box -->
        <div class="lg:col-span-5 bg-blue-50/60 rounded-2xl border-2 border-slate-900 p-6 sm:p-8 space-y-4 text-xs shadow-[4px_4px_0px_#0f172a]">
          
          <div class="text-xs font-black text-slate-900 uppercase tracking-wider pb-3 border-b-2 border-slate-900">
            Resumen de Disponibilidad &bull; Servicios
          </div>

          <div class="space-y-3 text-slate-700 font-medium">
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

          <div class="pt-4 border-t-2 border-slate-900 flex items-center justify-between text-slate-700 font-bold">
            <span>Contacto directo:</span>
            <span class="text-slate-900 font-black text-sm">+591 68787985</span>
          </div>

        </div>

      </div>

    </div>

  </section>
</template>