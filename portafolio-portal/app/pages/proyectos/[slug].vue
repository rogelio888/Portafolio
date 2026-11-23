<script setup lang="ts">
import { projects } from '../../utils/siteData'
import type { ProjectDemo } from '../../utils/siteData'
import * as LucideIcons from 'lucide-vue-next'
import { 
  ArrowLeft, 
  ArrowUpRight, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Building2,
  TrendingUp,
  Globe,
  ExternalLink
} from 'lucide-vue-next'

const route = useRoute()
const slug = route.params.slug as string
const project = projects.find(p => p.slug === slug)

if (!project) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Proyecto no encontrado',
    fatal: true
  })
}

const canonicalUrl = `https://portafoliorogelio888.dpdns.org/proyectos/${project.slug}`
const ogImageUrl = `https://portafoliorogelio888.dpdns.org${project.thumbnail}`

useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "SoftwareApplication",
            "name": project.name,
            "operatingSystem": "Web Browser",
            "applicationCategory": "BusinessApplication",
            "description": project.seoDescription,
            "url": canonicalUrl,
            "screenshot": ogImageUrl,
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "author": {
              "@type": "Person",
              "name": "Rogelio",
              "url": "https://portafoliorogelio888.dpdns.org"
            }
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Inicio",
                "item": "https://portafoliorogelio888.dpdns.org"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Proyectos",
                "item": "https://portafoliorogelio888.dpdns.org/#proyectos"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": project.name,
                "item": canonicalUrl
              }
            ]
          }
        ]
      }),
      tagPosition: 'head'
    }
  ]
})

useSeoMeta({
  title: `${project.seoTitle} | Rogelio`,
  description: project.seoDescription,
  ogTitle: `${project.seoTitle} | Rogelio`,
  ogDescription: project.seoDescription,
  ogUrl: canonicalUrl,
  ogImage: ogImageUrl,
  ogType: 'article',
  twitterCard: 'summary_large_image',
  twitterTitle: `${project.seoTitle} | Rogelio`,
  twitterDescription: project.seoDescription,
  twitterImage: ogImageUrl
})

const getIcon = (name: string) => {
  return (LucideIcons as any)[name] || Layers
}
</script>

<template>
  <main class="relative w-full pt-24 sm:pt-28 pb-20 select-none bg-[#faf9f6]">
    
    <article class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Top Breadcrumb & Back Link -->
      <nav aria-label="Breadcrumb" class="mb-6 flex items-center justify-between gap-3 text-xs font-bold text-slate-500 border-b-2 border-slate-900/10 pb-4">
        <ol class="flex items-center gap-1.5 flex-wrap">
          <li>
            <NuxtLink to="/" class="hover:text-blue-600 transition-colors">
              Inicio
            </NuxtLink>
          </li>
          <li class="text-slate-400">/</li>
          <li>
            <NuxtLink to="/#proyectos" class="hover:text-blue-600 transition-colors">
              Proyectos
            </NuxtLink>
          </li>
          <li class="text-slate-400">/</li>
          <li class="text-slate-900 font-black truncate max-w-[200px] sm:max-w-none" aria-current="page">
            {{ project.name }}
          </li>
        </ol>

        <NuxtLink 
          to="/#proyectos" 
          class="comic-btn-secondary px-3 py-1.5 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Volver</span>
        </NuxtLink>
      </nav>

      <!-- Case Study Hero Header -->
      <header class="mb-8 sm:mb-10">
        <div class="flex items-center gap-2 mb-3">
          <span class="comic-caption bg-yellow-200 text-xs">
            CASO DE ESTUDIO // {{ project.category.toUpperCase() }}
          </span>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 border border-slate-900 rounded-full text-[10px] font-bold text-slate-900">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Demo en Vivo</span>
          </div>
        </div>

        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display uppercase tracking-tight leading-tight mb-4">
          {{ project.name }}
        </h1>

        <p class="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-3xl">
          {{ project.description }}
        </p>
      </header>

      <!-- Visual Showcase & Direct Access Banner -->
      <section class="comic-panel p-4 sm:p-6 bg-white mb-10 overflow-hidden">
        
        <div class="relative overflow-hidden rounded-xl border-2 border-slate-900 bg-slate-100 aspect-video mb-6 shadow-[4px_4px_0px_#0f172a]">
          <img 
            :src="project.thumbnail" 
            :alt="'Captura de pantalla de ' + project.name + ' - Demostración en vivo'" 
            class="w-full h-full object-cover object-top"
          />
          <div class="absolute bottom-3 left-3 px-3 py-1 bg-white border-2 border-slate-900 rounded-md text-xs font-black uppercase text-slate-900 shadow-[2px_2px_0px_#0f172a]">
            Datos de Prueba Precargados
          </div>
        </div>

        <!-- Action Ribbon -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t-2 border-slate-900/10">
          <div class="flex items-center gap-2 text-xs text-slate-600 font-bold">
            <Globe class="w-4 h-4 text-blue-600 shrink-0" />
            <span>Navegación interactiva completa sin registro previo</span>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <a 
              :href="'https://wa.me/59168787985?text=' + encodeURIComponent('Hola Rogelio, vi el caso de estudio de ' + project.name + ' y me gustaría consultarte detalles técnicos.')" 
              target="_blank"
              class="comic-btn-secondary px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <MessageSquare class="w-4 h-4 text-emerald-600" />
              <span>Consultar Sistema</span>
            </a>

            <a 
              :href="project.demoUrl" 
              target="_blank"
              class="comic-btn-primary px-6 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <span>Probar Demo en Vivo</span>
              <ArrowUpRight class="w-4 h-4" />
            </a>
          </div>
        </div>

      </section>

      <!-- Detailed Analysis Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        <!-- Left: Business Solution & Workflows (8 cols) -->
        <div class="lg:col-span-8 space-y-8">
          
          <!-- 1. Problema de Negocio que Resuelve -->
          <section class="comic-panel p-6 sm:p-8 bg-white">
            <div class="flex items-center gap-2 text-blue-900 font-black text-xs uppercase tracking-wider mb-2">
              <Building2 class="w-4 h-4 text-blue-600" />
              <span>Problema Operativo que Resuelve</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 font-display uppercase mb-3">
              ¿Por qué surge esta plataforma?
            </h2>
            <p class="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
              {{ project.problemSolved }}
            </p>
          </section>

          <!-- 2. Módulos y Flujos de Trabajo Incluidos -->
          <section class="comic-panel p-6 sm:p-8 bg-white">
            <div class="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider mb-2">
              <Sparkles class="w-4 h-4 text-amber-600" />
              <span>Funcionalidades &bull; Flujos Clave</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 font-display uppercase mb-4">
              Módulos y Funcionalidades Desarrolladas
            </h2>
            <ul class="space-y-3">
              <li 
                v-for="feature in project.features" 
                :key="feature"
                class="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/90"
              >
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span class="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">{{ feature }}</span>
              </li>
            </ul>
          </section>

          <!-- 3. Beneficio e Impacto Comercial -->
          <section class="comic-panel p-6 sm:p-8 bg-emerald-50/60 border-emerald-300">
            <div class="flex items-center gap-2 text-emerald-900 font-black text-xs uppercase tracking-wider mb-2">
              <TrendingUp class="w-4 h-4 text-emerald-600" />
              <span>Retorno de Inversión</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 font-display uppercase mb-3">
              Impacto y Beneficio Comercial
            </h2>
            <p class="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
              {{ project.businessBenefit }}
            </p>
          </section>

        </div>

        <!-- Right: Technical Specs & Metadata (4 cols) -->
        <aside class="lg:col-span-4 space-y-6">
          
          <!-- Technical Specs Box -->
          <div class="comic-panel p-6 bg-white space-y-5">
            <div class="flex items-center gap-2 pb-3 border-b-2 border-slate-900/10">
              <Cpu class="w-4 h-4 text-blue-600" />
              <h3 class="text-xs font-black uppercase text-slate-900 tracking-wider">
                Ficha Técnica
              </h3>
            </div>

            <div>
              <span class="text-[10px] font-black uppercase text-slate-400 block mb-1">Frontend</span>
              <span class="text-xs font-bold text-slate-900 block p-2 rounded bg-slate-100 border border-slate-200">
                {{ project.frontendStack }}
              </span>
            </div>

            <div>
              <span class="text-[10px] font-black uppercase text-slate-400 block mb-1">Backend &amp; API</span>
              <span class="text-xs font-bold text-slate-900 block p-2 rounded bg-slate-100 border border-slate-200">
                {{ project.backendStack }}
              </span>
            </div>

            <div>
              <span class="text-[10px] font-black uppercase text-slate-400 block mb-1">Persistencia</span>
              <span class="text-xs font-bold text-blue-700 block p-2 rounded bg-blue-50 border border-blue-200">
                {{ project.databaseStack }}
              </span>
            </div>

            <div class="pt-2 border-t-2 border-slate-900/10">
              <span class="text-[10px] font-black uppercase text-slate-400 block mb-1">Sector Recomendado</span>
              <span class="text-xs font-medium text-slate-700 leading-relaxed block">
                {{ project.targetAudience }}
              </span>
            </div>
          </div>

          <!-- Quick Action Card -->
          <div class="comic-panel p-6 bg-yellow-50 border-2 border-slate-900 text-center space-y-3">
            <span class="comic-caption bg-yellow-200 text-[10px]">
              EVALUACIÓN EN VIVO
            </span>
            <h4 class="text-base font-black text-slate-900 font-display uppercase">
              Prueba este sistema ahora
            </h4>
            <p class="text-xs text-slate-600 font-medium">
              Accede al entorno de demostración interactivo con datos ya cargados.
            </p>
            <a 
              :href="project.demoUrl" 
              target="_blank"
              class="comic-btn-primary w-full py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <span>Abrir Demo en Vivo</span>
              <ArrowUpRight class="w-4 h-4" />
            </a>
          </div>

          <!-- Return Link -->
          <NuxtLink 
            to="/#proyectos" 
            class="comic-btn-secondary w-full py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Volver a todos los proyectos</span>
          </NuxtLink>

        </aside>

      </div>

    </article>

  </main>
</template>
