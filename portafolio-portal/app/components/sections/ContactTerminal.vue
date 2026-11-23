<script setup lang="ts">
import { ref } from 'vue'
import { Terminal, Send, ArrowUpRight, MessageSquare, Mail, MapPin, Clock } from 'lucide-vue-next'

const projectType = ref('SaaS a Medida')
</script>

<template>
  <section id="contacto" class="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 lg:py-28 select-none">
    
    <div class="comic-panel p-8 sm:p-12 bg-[#090a0f] border-2 border-neutral-700/80 shadow-ink">
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        <!-- Left: Proposal & Statement -->
        <div class="lg:col-span-7">
          <div class="inline-flex items-center gap-2 text-[10px] font-mono text-[#ff5722] font-bold uppercase tracking-widest mb-3">
            <span>CAPÍTULO 04</span>
            <span class="text-neutral-600">//</span>
            <span class="text-neutral-400">FIN DEL TOMO &bull; CONTACTO DIRECTO</span>
          </div>

          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase font-display leading-[1.05] mb-4">
            Construyamos tu próximo <br />
            <span class="text-[#ff5722]">sistema a medida.</span>
          </h2>

          <p class="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed mb-6 max-w-xl">
            ¿Tienes una clínica, empresa comercial, colegio o proyecto SaaS que necesita una plataforma robusta sin fallos? Conversemos directamente para evaluar alcance, presupuesto y arquitectura.
          </p>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
            <a 
              href="https://wa.me/59168787985" 
              target="_blank"
              class="flex items-center justify-center gap-2 px-8 py-4 bg-[#ff5722] text-white font-mono text-sm font-black uppercase tracking-wider hover:bg-[#ff6f3d] active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-ink-accent"
            >
              <MessageSquare class="w-4 h-4" />
              <span>ESCRIBIR POR WHATSAPP</span>
              <ArrowUpRight class="w-4 h-4" />
            </a>
          </div>

          <div class="flex flex-wrap items-center gap-6 text-[11px] font-mono text-neutral-400">
            <div class="flex items-center gap-1.5">
              <MapPin class="w-3.5 h-3.5 text-[#06b6d4]" />
              <span>Bolivia // Proyectos Globales</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5 text-emerald-400" />
              <span>Respuesta en menos de 2 horas</span>
            </div>
          </div>
        </div>

        <!-- Right: Interactive Terminal Simulation -->
        <div class="lg:col-span-5 bg-neutral-950 border border-neutral-800 p-5 font-mono text-xs shadow-ink">
          
          <div class="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3 text-[10px] text-neutral-500">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-500/80"></span>
              <span class="w-2 h-2 rounded-full bg-yellow-500/80"></span>
              <span class="w-2 h-2 rounded-full bg-emerald-500/80"></span>
              <span class="ml-2 font-bold text-neutral-400">console://client-handshake</span>
            </div>
            <span>BASH 5.2</span>
          </div>

          <div class="space-y-2 text-neutral-300 text-[11px] leading-relaxed">
            <p class="text-neutral-500">$ rogelio --check-availability</p>
            <p class="text-emerald-400">&gt; Estado: DISPONIBLE PARA NUEVAS PLATAFORMAS</p>
            <p class="text-neutral-500 mt-2">$ rogelio --contact-info</p>
            <p class="text-[#06b6d4]">&gt; WhatsApp: +591 68787985</p>
            <p class="text-neutral-300">&gt; Especialidad: Sistemas Web a Medida, Nuxt, Laravel, Vue, Supabase</p>
            
            <div class="pt-3 border-t border-neutral-900 mt-3 flex items-center justify-between text-[10px]">
              <span class="text-neutral-500">Listo para producción.</span>
              <span class="text-[#ff5722] font-bold">2026 EDITION</span>
            </div>
          </div>

        </div>

      </div>

    </div>

  </section>
</template>
