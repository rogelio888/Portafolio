<script setup lang="ts">
import { MessageSquare, ArrowUpRight, MapPin, Clock, Mail, CheckCircle2 } from 'lucide-vue-next'
</script>

<template>
  <section id="contacto" class="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28 select-none">
    
    <div class="studio-card p-8 sm:p-12 lg:p-16 bg-white border border-slate-200 shadow-md shadow-slate-100">
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        <!-- Left: Call to Action -->
        <div class="lg:col-span-7">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-4">
            <span>Contacto y Cotizaciones</span>
          </div>

          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-display leading-[1.1] mb-4">
            ¿Tienes un proyecto o <br />
            <span class="text-blue-600">sistema en mente?</span>
          </h2>

          <p class="text-base text-slate-600 leading-relaxed mb-8 max-w-xl">
            Si necesitas una plataforma web a medida para tu empresa, clínica o negocio, podemos coordinar una reunión rápida para evaluar alcance, presupuesto y arquitectura.
          </p>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
            <a 
              href="https://wa.me/59168787985" 
              target="_blank"
              class="flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
            >
              <MessageSquare class="w-4 h-4" />
              <span>Escribir por WhatsApp</span>
              <ArrowUpRight class="w-4 h-4" />
            </a>
          </div>

          <div class="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
            <div class="flex items-center gap-1.5">
              <MapPin class="w-4 h-4 text-blue-600" />
              <span>Santa Cruz, Bolivia (Remoto Global)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Clock class="w-4 h-4 text-emerald-600" />
              <span>Respuesta en menos de 2 horas</span>
            </div>
          </div>
        </div>

        <!-- Right: Information Box -->
        <div class="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 text-xs">
          
          <div class="text-xs font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-200">
            Resumen de Disponibilidad
          </div>

          <div class="space-y-3 text-slate-600">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Desarrollo de sistemas web completos (Frontend + Backend)</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Modernización y optimización de plataformas existentes</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Integración de bases de datos y pagos en línea</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Demos funcionales antes de iniciar producción</span>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-200 flex items-center justify-between text-slate-500 font-semibold">
            <span>WhatsApp directo:</span>
            <span class="text-slate-900 font-bold">+591 68787985</span>
          </div>

        </div>

      </div>

    </div>

  </section>
</template>
