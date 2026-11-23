<script setup lang="ts">
import { ref } from 'vue'
import { ArrowDown, MessageSquare, Zap, ShieldCheck, Database, Layers, CheckCircle2, ArrowRight } from 'lucide-vue-next'

const activeTab = ref<'overview' | 'security' | 'performance'>('overview')
</script>

<template>
  <section class="relative w-full h-full min-h-0 lg:min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-12 pt-28 sm:pt-32 pb-16 lg:py-0 select-none">
    
    <div class="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center z-10">
      
      <!-- Left Column: Typography & Presentation -->
      <div class="lg:col-span-7 flex flex-col items-start text-left">
        
        <!-- Clean Category Tag -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-6">
          <span class="w-2 h-2 rounded-full bg-blue-600"></span>
          <span>Desarrollo Full-Stack &amp; Sistemas Web</span>
        </div>

        <!-- Main Headline -->
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6 font-display">
          Desarrollo de Software y <br />
          <span class="text-blue-600">Sistemas Web a Medida.</span>
        </h1>
        
        <!-- Subtitle -->
        <p class="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mb-8 font-normal">
          Diseño e implemento plataformas digitales completas: sistemas para clínicas de salud, control de pensiones y cobros recurrentes, telemetría industrial y aplicaciones interactivas. Cada proyecto cuenta con demostración en vivo funcional en el navegador.
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
          <a 
            href="#proyectos" 
            class="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:scale-95 transition-all shadow-xs"
          >
            <span>Ver Demos y Proyectos</span>
            <ArrowDown class="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </a>

          <a 
            href="https://wa.me/59168787985" 
            target="_blank"
            class="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-slate-700 border border-slate-200 text-sm font-semibold hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all"
          >
            <MessageSquare class="w-4 h-4 text-emerald-600" />
            <span>Contactar por WhatsApp</span>
          </a>
        </div>

        <!-- Fast Feature Bullet Points -->
        <div class="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/80 w-full max-w-xl text-xs text-slate-600">
          <div>
            <span class="text-slate-400 font-medium block text-[11px] mb-0.5">Frontend</span>
            <span class="text-slate-800 font-semibold">Vue 3 / Nuxt / React</span>
          </div>
          <div>
            <span class="text-slate-400 font-medium block text-[11px] mb-0.5">Backend</span>
            <span class="text-slate-800 font-semibold">Laravel / NestJS / Node</span>
          </div>
          <div>
            <span class="text-slate-400 font-medium block text-[11px] mb-0.5">Bases de Datos</span>
            <span class="text-slate-800 font-semibold">PostgreSQL / Supabase</span>
          </div>
        </div>

      </div>

      <!-- Right Column: Clean Interactive Architecture Card -->
      <div class="lg:col-span-5 relative w-full">
        
        <div class="studio-card p-6 sm:p-7 bg-white border border-slate-200/90 shadow-lg shadow-slate-200/50">
          
          <!-- Card Header -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Layers class="w-4 h-4" />
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900 font-heading">Panel de Demostración</div>
                <div class="text-[11px] text-slate-500 font-medium">Sistemas interactivos en tiempo real</div>
              </div>
            </div>
            <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              Activo
            </span>
          </div>

          <!-- Interactive Tabs -->
          <div class="grid grid-cols-3 gap-1 bg-slate-100/90 p-1 rounded-lg text-xs font-medium mb-5">
            <button 
              @click="activeTab = 'overview'"
              :class="activeTab === 'overview' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'"
              class="py-1.5 rounded-md transition-all cursor-pointer"
            >
              General
            </button>
            <button 
              @click="activeTab = 'security'"
              :class="activeTab === 'security' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'"
              class="py-1.5 rounded-md transition-all cursor-pointer"
            >
              Seguridad
            </button>
            <button 
              @click="activeTab = 'performance'"
              :class="activeTab === 'performance' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'"
              class="py-1.5 rounded-md transition-all cursor-pointer"
            >
              Rendimiento
            </button>
          </div>

          <!-- Tab Content -->
          <div class="min-h-[160px] flex flex-col justify-center">
            
            <!-- Overview -->
            <div v-if="activeTab === 'overview'" class="space-y-3 text-xs">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <span class="text-slate-500">Persistencia de Datos:</span>
                <span class="text-slate-800 font-semibold">Local Storage + Supabase</span>
              </div>
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <span class="text-slate-500">Navegación:</span>
                <span class="text-slate-800 font-semibold">Single-Page App (SPA)</span>
              </div>
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <span class="text-slate-500">Modo Demo:</span>
                <span class="text-blue-600 font-semibold">Autocompletado con 1 clic</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Compatibilidad:</span>
                <span class="text-slate-800 font-semibold">Escritorio, Tablet y Móvil</span>
              </div>
            </div>

            <!-- Security -->
            <div v-else-if="activeTab === 'security'" class="space-y-2.5 text-xs">
              <div class="flex items-center gap-2 text-slate-800 font-semibold">
                <ShieldCheck class="w-4 h-4 text-emerald-600" />
                <span>Control de Acceso y Roles</span>
              </div>
              <p class="text-slate-600 leading-relaxed text-[11px]">
                Validación de credenciales, protección de rutas y perfiles administrativos diferenciados para doctores, administradores y personal operativo.
              </p>
              <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                Autenticación segura por tokens y sesiones persistentes.
              </div>
            </div>

            <!-- Performance -->
            <div v-else class="space-y-3.5 text-xs">
              <div>
                <div class="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Velocidad de Carga</span>
                  <span class="text-emerald-600 font-bold">0.4 segundos</span>
                </div>
                <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 w-[96%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Rendimiento Lighthouse</span>
                  <span class="text-blue-600 font-bold">98 / 100</span>
                </div>
                <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-600 w-[98%] rounded-full"></div>
                </div>
              </div>
              <p class="text-[11px] text-slate-500">
                Optimizaciones de compresión, lazy loading y respuesta inmediata sin recargas de página.
              </p>
            </div>

          </div>

          <!-- Bottom Card Footer -->
          <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
              <span>5 Demos operativas</span>
            </span>
            <a href="#proyectos" class="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors">
              <span>Probar sistemas</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>

    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1 text-slate-400 text-xs font-medium pointer-events-none">
      <span>Desliza para ver proyectos</span>
      <ArrowDown class="w-3.5 h-3.5 animate-bounce text-slate-500" />
    </div>

  </section>
</template>
