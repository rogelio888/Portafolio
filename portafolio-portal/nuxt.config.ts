import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { class: 'dark', lang: 'es' },
      title: 'Portafolio Profesional Full-Stack | Demos Interactivas',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Portafolio de Desarrollo de Software a Medida. Explora demos funcionales de sistemas para farmacias, hoteles, clínicas y más.' },
        { property: 'og:title', content: 'Portafolio Profesional Full-Stack | Desarrollo de Software' },
        { property: 'og:description', content: 'Explora mis proyectos y sistemas funcionales (Farmacia, Hotel, Clínica). Desarrollados con Vue, Angular, React, Laravel y NestJS.' },
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
    'shadcn-nuxt'
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
  },
  nitro: {
    routeRules: {
      '/frontend-farmacia': { redirect: '/frontend-farmacia/index.html' },
      '/frontend-hotel': { redirect: '/frontend-hotel/index.html' },
      '/frontend-clinica': { redirect: '/frontend-clinica/index.html' },
      '/frontend-pensiones': { redirect: '/frontend-pensiones/index.html' },
      '/frontend-gym': { redirect: '/frontend-gym/index.html' },
      '/frontend-agroindustrial': { redirect: '/frontend-agroindustrial/index.html' },
      '/landing-page': { redirect: '/landing-page/index.html' },
      '/sitio-corporativo': { redirect: '/sitio-corporativo/index.html' },
      '/blog-recetas': { redirect: '/blog-recetas/index.html' }
    }
  }
})
