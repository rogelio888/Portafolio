<script setup lang="ts">
import { ShieldCheck, Zap, Layers, Cpu, CheckCircle } from 'lucide-vue-next'

const pillars = [
  {
    num: '01',
    title: 'Arquitectura Escalable',
    desc: 'Estructuración modular de código con separación estricta de responsabilidades entre vistas, lógica de negocio y consumo de APIs.',
    icon: Layers,
    tag: 'Estructura'
  },
  {
    num: '02',
    title: 'Rendimiento y Velocidad',
    desc: 'Tiempos de carga rápidos, optimización de bundles, compresión de imágenes WebP y minimización del tiempo de respuesta.',
    icon: Zap,
    tag: 'Velocidad'
  },
  {
    num: '03',
    title: 'Persistencia y Tiempo Real',
    desc: 'Bases de datos optimizadas con soporte para transacciones seguras, almacenamiento local para navegación instantánea y sincronización cloud.',
    icon: Cpu,
    tag: 'Datos'
  },
  {
    num: '04',
    title: 'Seguridad y Control de Roles',
    desc: 'Autenticación robusta, sesiones seguras, sanitización de entradas y permisos granulares según el perfil de cada usuario.',
    icon: ShieldCheck,
    tag: 'Seguridad'
  }
]
</script>

<template>
  <section id="enfoque" class="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28 select-none">
    
    <div class="mb-14 border-b border-slate-200/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Metodología</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
          Enfoque de Desarrollo
        </h2>
      </div>
      <p class="text-xs sm:text-sm text-slate-500 max-w-sm">
        Prácticas clave implementadas en cada proyecto para asegurar software robusto y fácil de mantener.
      </p>
    </div>

    <!-- 4 Clean Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="p in pillars" 
        :key="p.num"
        class="studio-card p-6 bg-white border border-slate-200 flex flex-col justify-between shadow-xs"
      >
        <div>
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <span class="text-xs font-bold text-blue-600">{{ p.num }}</span>
            <span class="text-[11px] font-semibold text-slate-400 uppercase">{{ p.tag }}</span>
          </div>

          <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
            <component :is="p.icon" class="w-5 h-5" />
          </div>

          <h3 class="text-lg font-bold text-slate-900 font-display mb-2">
            {{ p.title }}
          </h3>

          <p class="text-xs text-slate-600 leading-relaxed">
            {{ p.desc }}
          </p>
        </div>

        <div class="mt-6 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle class="w-4 h-4 text-emerald-600" />
          <span>Estándar en cada proyecto</span>
        </div>
      </div>
    </div>

  </section>
</template>
