# Portafolio Full-Stack — Demos Interactivas & Showcase de Ingeniería

Un repositorio monorepo unificado de **10 proyectos web full-stack**, construidos con diversas tecnologías de vanguardia (**Vue 3, Nuxt 4, Next.js 16, Angular 18, React, Astro, SvelteKit**) y diseñados para que cada demostración funcione **100% en el navegador** (`localStorage` / `IndexedDB` / mocks client-side), sin necesidad de instalar ni configurar servidores de backend o bases de datos locales.

El punto de entrada principal es **[`portafolio-portal/`](file:///c:/Users/rogel/OneDrive/Escritorio/Proyectos/Portafolio/portafolio-portal)**, una aplicación central desarrollada en **Nuxt 4** que actúa como hub interactivo: sirve las demos compiladas, incorpora un **cotizador dinámico de proyectos con envío a WhatsApp**, y despliega un diccionario de tecnologías explicadas en lenguaje simple para clientes y reclutadores.

---

## 📁 Estructura del Repositorio

```text
Portafolio/
├── portafolio-portal/        → Hub principal (Nuxt 4 + Tailwind CSS). Sirve las demos y el cotizador.
├── frontend Farmacia/         → Sistema de Farmacia y KARDEX (Angular 18 & Tailwind CSS)
├── frontend Hotel/            → Portal Hotelero & Reservas (Vue 3 & Tailwind CSS / Laravel 12)
├── frontend Clinica/          → Clínica Médica & Citas (Angular & Tailwind CSS)
├── frontend Pensiones/        → Control de Pensiones Escolares (Vue 3 & Pinia)
├── frontend gym/               → Plataforma para Gimnasio con QR (React & Tailwind CSS)
├── frontend Agroindustrial/   → Gestión de Flota Agroindustrial (Vue 3 & Tailwind CSS)
├── landing-page/               → "Cuervo Tattoo Club" — Landing interactiva (Nuxt 4 & Motion)
├── landing-chronos/            → "CHRONOS" — Wearable Neural & BCI Landing (Next.js 16 & Framer Motion)
├── sitio-corporativo/          → "Cantera Estudio" — Sitio corporativo ultra rápido (Astro & Motion One)
├── blog-recetas/               → "Sazón" — Blog de recetas (SvelteKit & Bits UI)
└── Ctalogo/                    → Prototipo original del cotizador (precursor de portafolio-portal)
```

---

## ⚡ ¿Cómo funcionan las Demos?

1. **Simulación Client-Side 100% Funcional:**  
   Cada aplicación simula la capa de persistencia de datos directamente en el cliente (usando `localStorage` y repositorios mockeados). Esto permite clonar el repositorio y explorar cualquier demo al instante sin instalar PHP, Node backend, Python, ni bases de datos MySQL/PostgreSQL.
2. **Consola de Simulación de API Flotante:**  
   Varias de las aplicaciones incluyen un panel lateral/inferior interactivo que expone la arquitectura backend de referencia. Al ejecutar cualquier acción en la interfaz (ej. crear un turno, registrar una venta en Kardex, o realizar una reserva):
   - **HTTP Request:** Método y endpoint simulado (ej. `POST /api/kardex/movements`).
   - **Backend Controller:** Código real del controlador (Laravel Eloquent o NestJS TypeORM/Prisma).
   - **Database Query:** Consulta SQL o sentencia ORM equivalente ejecutada en producción.
   - **JSON Response:** Estructura de respuesta devuelta al cliente.

---

## 🚀 Catálogo de Proyectos

| # | Proyecto | Stack Frontend | Arquitectura Backend (Referencia) | Base de Datos (Referencia) | Categoría |
|---|---|---|---|---|---|
| 1 | [Sistema de Farmacia](frontend%20Farmacia) | Angular 18 & Tailwind CSS | Laravel 11 & Eloquent | MySQL / Supabase | Sistemas Avanzados |
| 2 | [Portal Hotelero & Reservas](frontend%20Hotel) | Vue 3 & Tailwind CSS | Laravel 12 & Eloquent | PostgreSQL | Sistemas Avanzados |
| 3 | [Clínica Médica & Citas](frontend%20Clinica) | Angular & Tailwind CSS | NestJS & Prisma | PostgreSQL / SQL Server | Sistemas Avanzados |
| 4 | [Control de Pensiones](frontend%20Pensiones) | Vue 3 & Pinia | Laravel 11 & Sanctum | MySQL / PostgreSQL | Sistemas Avanzados |
| 5 | [Plataforma para Gimnasio](frontend%20gym) | React & Tailwind CSS | Supabase Serverless | PostgreSQL (RLS) | Sistemas Avanzados |
| 6 | [Gestión de Flota Agroindustrial](frontend%20Agroindustrial) | Vue 3 & Tailwind CSS | NestJS & TypeORM | PostgreSQL | Sistemas Especiales |
| 7 | [Landing — Cuervo Tattoo Club](landing-page) | Nuxt 4 & Motion | Sitio estático | N/A | Landing Page |
| 8 | [CHRONOS — Wearable Neural & BCI](landing-chronos) | Next.js 16 & Framer Motion | Sitio estático | N/A | Landing Page |
| 9 | [Cantera Estudio](sitio-corporativo) | Astro & Motion One & Swiper | Sitio estático | N/A | Sitio Corporativo |
| 10 | [Sazón — Blog de Recetas](blog-recetas) | SvelteKit & Bits UI | Sitio estático | N/A | Blog |

> **Nota:** Todos los nombres de empresas, servicios y productos mostrados en los proyectos son ficticios y se utilizan exclusivamente con fines de demostración técnica y portafolio.

---

## 💻 Instrucciones de Ejecución

### 1. Servidor Central del Portafolio (`portafolio-portal`)

Para ejecutar la plataforma central que consolida todas las demos y el cotizador:

```bash
cd portafolio-portal
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.  
*El portal sirve las aplicaciones compiladas de forma estática desde `portafolio-portal/public/`, permitiendo navegar todas las demos sin tener que iniciar cada frontend por separado.*

### 2. Proyectos Individuales (Entorno de Desarrollo)

Cada subcarpeta es una aplicación autónoma con sus propios scripts de desarrollo:

```bash
# Ejemplo: Ejecutar el Sistema de Farmacia
cd "frontend Farmacia"
npm install
npm run dev
```

```bash
# Ejemplo: Ejecutar CHRONOS Landing (Next.js)
cd landing-chronos
npm install
npm run dev
```

> **Excepción Backend:** La carpeta [`frontend Hotel/`](file:///c:/Users/rogel/OneDrive/Escritorio/Proyectos/Portafolio/frontend%20Hotel) incluye adicionalmente la estructura de una aplicación Laravel 12 completa para quienes deseen probar el servidor real en entorno PHP (ver `frontend Hotel/README.md` e `INSTALL.md`).

---

## 🛠️ Stack Tecnológico Unificado

- **Frameworks Frontend:** Nuxt 4, Next.js 16, Vue 3, Angular 18, React, Astro, SvelteKit
- **Estilos & UI:** Tailwind CSS v4, Bits UI, CSS Modules, Modern Glassmorphism & Custom Themes
- **Gestión de Estado:** Pinia, React Context, Angular Services & RxJS
- **Animaciones & Interacción:** Framer Motion, Motion One, Swiper.js, Custom Scroll-Snap
- **Ecosystem Backend & DB (Referencias de Producción):** Laravel 11/12 (Eloquent, Sanctum), NestJS (TypeORM, Prisma), Supabase Serverless, PostgreSQL, MySQL, SQL Server

---

Desarrollado como demostración técnica de capacidades Full-Stack y Arquitectura Frontend.
