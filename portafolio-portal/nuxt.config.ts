import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devServer: {
    host: '127.0.0.1',
    port: 3000
  },
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { class: 'dark', lang: 'es' },
      title: 'Portafolio Profesional Full-Stack | Demos Interactivas',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Desarrollo de Software y Sistemas Web a Medida. Explora demostraciones reales de sistemas para farmacias, hoteles, clínicas y calcula tu cotización al instante.' },
        { property: 'og:title', content: 'Desarrollo de Software y Sistemas Web a Medida | Portafolio' },
        { property: 'og:description', content: 'Lleva tu negocio al siguiente nivel con plataformas digitales diseñadas exclusivamente para ti. Explora demostraciones reales de sistemas (Farmacia, Hotel, Clínica) y cotiza en línea.' },
        { property: 'og:type', content: 'website' },
        { name: 'theme-color', content: '#7c3aed' }
      ],
      script: [
        {
          innerHTML: `(function(){try{var t=localStorage.getItem('portfolio-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})();`,
          tagPosition: 'head'
        }
      ]
    }
  },
  modules: [
    'shadcn-nuxt',
    '@vueuse/motion/nuxt'
  ],
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  },
  css: ['~/assets/css/app.css'],
  vite: {
    plugins: [
      tailwindcss()
    ],
    optimizeDeps: {
      include: [
        '@lucide/vue',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@vueuse/motion',
        'class-variance-authority',
        'clsx',
        'tailwind-merge'
      ]
    }
  }
})
