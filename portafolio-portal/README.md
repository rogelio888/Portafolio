# Portafolio Portal — Hub Central (Nuxt 4)

Este es el hub central del portafolio, construido con **Nuxt 4**, **Vue 3** y **Tailwind CSS**. Actúa como el portal unificado que sirve las demos interactivas de los proyectos, integra el cotizador interactivo de presupuestos con integración directa a WhatsApp, y presenta un diccionario visual de tecnologías.

## 🚀 Características del Hub

- **Catálogo Unificado:** Visualización de las demos técnicas con filtrado por categoría (Sistemas Avanzados, Sistemas Especiales, Landings, Corporativos, Blogs).
- **Consola de Simulación Backend:** Exposición de endpoints HTTP, controladores de referencia (Laravel/NestJS) y esquemas SQL.
- **Cotizador de Proyectos:** Sistema interactivo que calcula presupuestos estimados según requerimientos y permite solicitar cotizaciones vía WhatsApp.
- **Diccionario Tecnológico:** Explicación pedagógica de tecnologías (Vue, Nuxt, Angular, React, Supabase, Laravel, NestJS, etc.).
- **Diseño Responsive & Glassmorphism:** Interfaz adaptativa optimizada para dispositivos móviles y de escritorio.

## 📁 Estructura del Portal

```text
portafolio-portal/
├── app/
│   ├── components/       → Componentes reutilizables (Hero, Header, TechCarousel, Demos, Cotizador)
│   ├── utils/
│   │   ├── siteData.ts   → Definición de proyectos, stacks, consolas API y tecnologías
│   │   └── plansData.ts  → Lógica y precios del cotizador
│   └── app.vue           → Punto de entrada de la aplicación
├── public/               → Archivos estáticos y builds compilados de las demos
│   ├── frontend-farmacia/
│   ├── frontend-hotel/
│   ├── frontend-clinica/
│   ├── frontend-pensiones/
│   ├── frontend-gym/
│   ├── frontend-agroindustrial/
│   ├── landing-page/
│   └── landing-chronos/
└── nuxt.config.ts        → Configuración de Nuxt 4
```

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (http://localhost:3000)
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview
```
