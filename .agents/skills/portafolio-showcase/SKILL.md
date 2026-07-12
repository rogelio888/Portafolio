---
name: portafolio-showcase
description: Guías, estructura y simulación de backend para el desarrollo del portafolio unificado e integración del cotizador.
---

# Desarrollo del Portafolio de Proyectos Full-Stack

Este documento es una Skill que guía al agente en las decisiones técnicas, estructura de archivos y simulación de backend necesarias para construir la plataforma unificada del portafolio.

---

## 1. Stack del Proyecto y Viabilidad Técnica

El portafolio se construirá como una web unificada desde cero (usando un framework frontend moderno como React, Vue o Angular). Mostrará proyectos que originalmente requerían backend, simulando el almacenamiento de datos del lado del cliente.

### Tecnologías Clave a Mostrar
* **Frontend:** Vue, Angular, React.
* **Backend simulado:** Laravel, NestJS.
* **Bases de datos/Servicios simulados:** PostgreSQL, MySQL, SQL Server y Supabase.

### Estrategia de Simulación (Mocking)
* **Persistencia Local:** Usar `localStorage` para persistencia básica y `IndexedDB` para aplicaciones complejas que necesiten consultas más avanzadas.
* **Mock Service Worker (MSW) / Capa de Repositorios:** Interceptar peticiones HTTP de Axios o Fetch para retornar datos simulados localmente en lugar de llamar a un servidor real.

---

## 2. Proyectos a Integrar (Workspace)

El portal central debe unificar y proveer demos en vivo para los siguientes proyectos:
1. [frontend Agroindustrial](file:///C:/Users/rogel/OneDrive/Escritorio/Proyectos/Portafolio/frontend%20Agroindustrial)
2. [frontend Clinica](file:///C:/Users/rogel/OneDrive/Escritorio/Proyectos/Portafolio/frontend%20Clinica)
3. [frontend Farmacia](file:///C:/Users/rogel/OneDrive/Escritorio/Proyectos/Portafolio/frontend%20Farmacia)
4. [frontend Hotel](file:///C:/Users/rogel/OneDrive/Escritorio/Proyectos/Portafolio/frontend%20Hotel)
5. [frontend Pensiones](file:///C:/Users/rogel/OneDrive/Escritorio/Proyectos/Portafolio/frontend%20Pensiones)
6. [frontend gym](file:///C:/Users/rogel/OneDrive/Escritorio/Proyectos/Portafolio/frontend%20gym)
7. [Landing Page](file:///C:/Users/rogel/OneDrive/Escritorio/Proyectos/Portafolio/Landing%20Page) (Creada para un cliente)

---

## 3. Integración del Catálogo y Cotizador

El portafolio incorporará de forma nativa la lógica del cotizador y catálogo que actualmente reside en [Ctalogo](file:///C:/Users/rogel/OneDrive/Escritorio/Proyectos/Portafolio/Ctalogo):
* **Lógica del Cotizador:** Selección de requerimientos y cálculo del precio estimado en tiempo real.
* **Acción (WhatsApp):** Botón para generar un mensaje estructurado con el presupuesto detallado y enviarlo a tu WhatsApp.
* **Navegación Fluida:** El usuario podrá saltar de la demo de un proyecto directamente a la sección de cotización de ese tipo de proyecto en el portal principal.

---

## 4. Consola de Simulación API (Visualizador Backend)

En cada demo de proyecto, se integrará un panel lateral que actúe como consola interactiva. Al realizar acciones en la aplicación:
1. **HTTP Request:** Mostrar ruta y método (ej: `POST /api/products`).
2. **Backend Code:** Mostrar el archivo/método correspondiente del controlador (Laravel o NestJS) que resolvería esa petición.
3. **Database Query:** Mostrar la sentencia SQL o llamada de ORM que se realizaría en la base de datos configurada (PostgreSQL, MySQL, SQL Server, Supabase).
4. **JSON Response:** Mostrar el JSON simulado que devuelve el servicio.
