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
      title: 'Rogelio | Portafolio Desarrollador Full-Stack y Sistemas Web a Medida',
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'canonical', href: 'https://nexorasystem.site/' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Desarrollo de Software y Sistemas Web a Medida. Explora demostraciones reales de sistemas para farmacias, clínicas, agroindustria y más.' },
        { property: 'og:site_name', content: 'Nexora System' },
        { property: 'og:title', content: 'Rogelio | Portafolio Desarrollador Full-Stack y Sistemas Web a Medida' },
        { property: 'og:description', content: 'Desarrollo de Software y Sistemas Web a Medida. Explora demostraciones reales de sistemas para farmacias, clínicas, agroindustria y más.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://nexorasystem.site/' },
        { property: 'og:image', content: 'https://nexorasystem.site/screenshots/frontend-farmacia.webp' },
        { property: 'og:image:alt', content: 'Vista previa de sistemas web desarrollados por Rogelio — Nexora System' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Rogelio | Portafolio Desarrollador Full-Stack y Sistemas Web a Medida' },
        { name: 'twitter:description', content: 'Desarrollo de Software y Sistemas Web a Medida. Explora demostraciones reales de sistemas para farmacias, clínicas, agroindustria y más.' },
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
                "name": "Nexora System",
                "alternateName": ["Nexora System | Rogelio", "Rogelio Full-Stack"],
                "url": "https://nexorasystem.site/",
                "description": "Portafolio de desarrollo de software y sistemas web interactivos a medida.",
                "publisher": {
                  "@id": "https://nexorasystem.site/#person"
                }
              },
              {
                "@type": "Person",
                "@id": "https://nexorasystem.site/#person",
                "name": "Rogelio",
                "jobTitle": "Desarrollador Full-Stack & Ingeniero de Software",
                "url": "https://nexorasystem.site/",
                "sameAs": [
                  "https://github.com/rogelio888",
                  "https://www.tiktok.com/@nexoraasystems"
                ]
              },
              {
                "@type": "ProfessionalService",
                "@id": "https://nexorasystem.site/#service",
                "name": "Nexora System",
                "url": "https://nexorasystem.site/",
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
                "provider": {
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
    name: 'Nexora System'
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
      '/proyectos/sistema-gimnasio-fitscan-qr'
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
