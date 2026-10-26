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
      htmlAttrs: { class: 'dark', lang: 'es' },
      title: 'Rogelio - Desarrollador Full-Stack | Demos Interactivas',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Desarrollo de Software y Sistemas Web a Medida. Explora demostraciones reales de sistemas para farmacias, clínicas, agroindustria y más.' },
        { property: 'og:site_name', content: 'Portafolio de Rogelio' },
        { property: 'og:title', content: 'Rogelio - Desarrollador Full-Stack | Sistemas a Medida' },
        { property: 'og:description', content: 'Lleva tu negocio al siguiente nivel con plataformas digitales diseñadas exclusivamente para ti. Explora demostraciones interactivas de sistemas web.' },
        { property: 'og:type', content: 'website' },
        { name: 'theme-color', content: '#7c3aed' }
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Portafolio de Rogelio",
            "alternateName": "Rogelio Full-Stack",
            "url": "https://portafoliorogelio888.dpdns.org/"
          }),
          tagPosition: 'head'
        },
        {
          innerHTML: `(function(){try{var t=localStorage.getItem('portfolio-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})();`,
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
    url: 'https://portafoliorogelio888.dpdns.org',
    name: 'Portafolio de Rogelio'
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
    compressPublicAssets: true
  }
})
