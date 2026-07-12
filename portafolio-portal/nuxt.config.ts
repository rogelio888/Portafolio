import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: { class: 'dark' },
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
    ]
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
