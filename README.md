# Portafolio Full-Stack — Demos Interactivas

Portafolio unificado de proyectos web full-stack, construido con múltiples frameworks
(Vue, Nuxt, Angular, React, Astro, SvelteKit) y diseñado para que cada demo funcione
**100% en el navegador**, sin necesidad de levantar un backend real ni una base de datos.

El punto de entrada es **`portafolio-portal/`**, un sitio Nuxt 4 que actúa como hub:
muestra las 9 demos, un cotizador de proyectos, y una sección de tecnologías explicadas
en lenguaje simple.

## Estructura del repositorio

```
Portafolio/
├── portafolio-portal/        → Hub principal (Nuxt 4). Sirve las demos y el cotizador.
├── frontend Farmacia/         → Sistema de Farmacia (Angular 18)
├── frontend Hotel/            → Portal Hotelero & Reservas (Laravel 12 + Vue 3)
├── frontend Clinica/          → Clínica Médica & Citas (Angular)
├── frontend Pensiones/        → Control de Pensiones (Vue 3 + Pinia)
├── frontend gym/               → Plataforma para Gimnasio (React)
├── frontend Agroindustrial/   → Gestión de Flota Agroindustrial (Vue 3)
├── landing-page/               → Landing "Cuervo Tattoo Club" (Nuxt 4 + Motion)
├── sitio-corporativo/          → "Cantera Estudio" — sitio corporativo (Astro)
├── blog-recetas/               → "Sazón" — blog de recetas (SvelteKit + Bits UI)
└── Ctalogo/                    → Prototipo original del cotizador (precursor de portafolio-portal)
```

## Cómo funcionan las demos

Cada demo simula su backend **enteramente en el cliente** (`localStorage`), para que
cualquiera pueda clonar el repo y probarlas sin instalar PHP, Node en el servidor,
ni una base de datos. Las columnas "Backend" y "Base de Datos" que ves en el portafolio
describen la **arquitectura de referencia** (qué se usaría en producción), no una
dependencia real para correr el demo.

Varias demos incluyen además una **consola de simulación de API** flotante que muestra,
en vivo, la petición HTTP, el código de backend equivalente y la respuesta simulada de
cada acción — pensada para que se entienda cómo funcionaría con un backend real.

## Proyectos

| Proyecto | Stack (frontend) | Referencia de backend | Categoría |
|---|---|---|---|
| [Sistema de Farmacia](frontend%20Farmacia) | Angular 18 & Tailwind CSS | Laravel 11 & Eloquent | Sistemas Avanzados |
| [Portal Hotelero & Reservas](frontend%20Hotel) | Vue 3 & Tailwind CSS | Laravel 12 & Eloquent | Sistemas Avanzados |
| [Clínica Médica & Citas](frontend%20Clinica) | Angular & Tailwind CSS | NestJS & Prisma | Sistemas Avanzados |
| [Control de Pensiones](frontend%20Pensiones) | Vue 3 & Pinia | Laravel 11 & Sanctum | Sistemas Avanzados |
| [Plataforma para Gimnasio](frontend%20gym) | React & Tailwind CSS | Supabase Serverless | Sistemas Avanzados |
| [Gestión de Flota Agroindustrial](frontend%20Agroindustrial) | Vue 3 & Tailwind CSS | NestJS & TypeORM | Sistemas Especiales |
| [Landing — Cuervo Tattoo Club](landing-page) | Nuxt 4 & Motion | Sitio estático | Landing Page |
| [Cantera Estudio](sitio-corporativo) | Astro & Motion One & Swiper | Sitio estático | Sitio Corporativo |
| [Sazón — Blog de Recetas](blog-recetas) | SvelteKit & Bits UI | Sitio estático | Blog |

> Todos los nombres de empresas/marcas en las demos son ficticios — se usan solo con
> fines de portafolio, sin ninguna relación con negocios reales.

## Cómo correr el portal principal

```bash
cd portafolio-portal
npm install
npm run dev
```

Abrí `http://localhost:3000`. El portal sirve las demos ya compiladas como archivos
estáticos desde `portafolio-portal/public/`, así que no hace falta levantar cada
proyecto fuente por separado para navegarlas.

## Cómo correr un proyecto individual

Cada carpeta es un proyecto independiente con su propio `package.json`:

```bash
cd "frontend Farmacia"      # o cualquier otro proyecto
npm install
npm run dev
```

`frontend Hotel` es la única excepción: además del frontend Vue, incluye una app
Laravel real (ver `frontend Hotel/README.md` e `INSTALL.md` para levantarla completa).

## Stack general del portafolio

**Frontend:** Vue 3, Nuxt 4, Angular, React, Astro, SvelteKit, Tailwind CSS v4, Pinia, Vite, Motion One, Swiper, Bits UI, Lucide Icons
**Arquitectura de referencia (backend/DB):** Laravel, NestJS, Supabase (PostgreSQL), MySQL, SQL Server

---

Portafolio personal — todos los proyectos son piezas de demostración técnica.
