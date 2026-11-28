import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  features: {
    inlineStyles: true
  },
  alias: {
    '#app-manifest': './app/mock-manifest.ts'
  },
  sourcemap: {
    client: true,
    server: false
  },
  devServer: {
    host: '127.0.0.1',
    port: 3000
  },
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Nexora Systems | Portafolio de Sistemas Web y Software a Medida',
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icon-192.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'canonical', href: 'https://nexorasystem.site/' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Nexora Systems (Portafolio de Rogelio): desarrollo de software y sistemas web a medida en Bolivia. Prueba 10 demos reales para farmacias, clínicas, gimnasios y agroindustria.' },
        { property: 'og:site_name', content: 'Nexora Systems' },
        { property: 'og:title', content: 'Nexora Systems | Portafolio de Sistemas Web y Software a Medida' },
        { property: 'og:description', content: 'Nexora Systems (Portafolio de Rogelio): desarrollo de software y sistemas web a medida en Bolivia. Explora demos interactivas en navegador.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://nexorasystem.site/' },
        { property: 'og:image', content: 'https://nexorasystem.site/screenshots/frontend-farmacia.webp' },
        { property: 'og:image:alt', content: 'Nexora Systems — Portafolio de sistemas web desarrollados por Rogelio' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Nexora Systems | Portafolio de Sistemas Web y Software a Medida' },
        { name: 'twitter:description', content: 'Nexora Systems (Portafolio de Rogelio): desarrollo de software y sistemas web a medida en Bolivia. Explora 10 demos reales en navegador.' },
        { name: 'twitter:image', content: 'https://nexorasystem.site/screenshots/frontend-farmacia.webp' },
        { name: 'theme-color', content: '#faf9f6' }
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://nexorasystem.site/#website",
                "name": "Nexora Systems",
                "alternateName": ["Nexora System", "Portafolio de Rogelio", "Nexora Systems Bolivia"],
                "url": "https://nexorasystem.site/",
                "description": "Nexora Systems — Portafolio de desarrollo de software y sistemas web interactivos a medida por Rogelio en Bolivia.",
                "publisher": {
                  "@id": "https://nexorasystem.site/#service"
                }
              },
              {
                "@type": "Person",
                "@id": "https://nexorasystem.site/#person",
                "name": "Rogelio",
                "alternateName": ["Rogelio Full-Stack", "Portafolio de Rogelio"],
                "jobTitle": "Desarrollador Full-Stack & Fundador de Nexora Systems",
                "url": "https://nexorasystem.site/",
                "worksFor": {
                  "@id": "https://nexorasystem.site/#service"
                },
                "sameAs": [
                  "https://github.com/rogelio888",
                  "https://www.tiktok.com/@nexoraasystems"
                ]
              },
              {
                "@type": "ProfessionalService",
                "@id": "https://nexorasystem.site/#service",
                "name": "Nexora Systems",
                "alternateName": ["Nexora System", "Portafolio de Software Rogelio"],
                "url": "https://nexorasystem.site/",
                "logo": "https://nexorasystem.site/icon-192.png",
                "image": "https://nexorasystem.site/screenshots/frontend-farmacia.webp",
                "sameAs": [
                  "https://github.com/rogelio888",
                  "https://www.tiktok.com/@nexoraasystems"
                ],
                "areaServed": "Santa Cruz, Bolivia",
                "serviceType": [
                  "Desarrollo de Sistemas Web",
                  "Software de Gestión Administrativa",
                  "Aplicaciones Web a Medida",
                  "Diseño y Desarrollo Frontend / Backend"
                ],
                "founder": {
                  "@id": "https://nexorasystem.site/#person"
                }
              }
            ]
          }),
          tagPosition: 'head'
        }
      ]
    }
  },
  modules: [
    'shadcn-nuxt',
    '@vueuse/motion/nuxt',
    '@nuxtjs/sitemap'
  ],
  site: {
    url: 'https://nexorasystem.site',
    name: 'Nexora Systems'
  },
  sitemap: {
    urls: [
      '/',
      '/proyectos/sistema-farmacia-kardex',
      '/proyectos/sistema-clinica-medica-citas',
      '/proyectos/sistema-control-pensiones-escolares',
      '/proyectos/sistema-gimnasio-control-qr',
      '/proyectos/sistema-telemetria-agroindustrial',
      '/proyectos/landing-estudio-tatuajes',
      '/proyectos/landing-chronos-neural-bci',
      '/proyectos/sistema-veterinaria-carnet-digital',
      '/proyectos/sistema-perfumeria-atelier-erp',
      '/proyectos/sistema-gimnasio-fitscan-qr',
      '/proyectos/sistema-maquinaria-control-ventas'
    ]
  },
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  },
  css: ['~/assets/css/app.css'],
  vite: {
    plugins: [
      tailwindcss()
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('@vueuse') || id.includes('motion')) {
              return 'motion-vendor'
            }
          }
        }
      }
    },
    optimizeDeps: {
      include: [
        '@lucide/vue',
        'lucide-vue-next',
        '@vueuse/motion',
        'class-variance-authority',
        'clsx',
        'tailwind-merge'
      ]
    }
  },
  nitro: {
    compressPublicAssets: true,
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/proyectos/sistema-farmacia-kardex',
        '/proyectos/sistema-clinica-medica-citas',
        '/proyectos/sistema-control-pensiones-escolares',
        '/proyectos/sistema-gimnasio-control-qr',
        '/proyectos/sistema-telemetria-agroindustrial',
        '/proyectos/landing-estudio-tatuajes',
        '/proyectos/landing-chronos-neural-bci',
        '/proyectos/sistema-veterinaria-carnet-digital',
        '/proyectos/sistema-perfumeria-atelier-erp',
        '/proyectos/sistema-gimnasio-fitscan-qr'
      ]
    }
  }
})
