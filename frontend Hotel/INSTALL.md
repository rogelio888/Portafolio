# Guía de Instalación - Sistema Hotelero

Este documento detalla los pasos necesarios para instalar y ejecutar el Sistema Hotelero en un entorno local.

## Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu sistema:

*   **PHP** >= 8.2
*   **Composer** (Gestor de dependencias de PHP)
*   **Node.js** >= 18.x y **NPM**
*   **MySQL** o **MariaDB**
*   **Git**

## Pasos de Instalación

1.  **Clonar el repositorio**

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd sistema-hotelero
    ```

2.  **Instalar dependencias de Backend (Laravel)**

    ```bash
    composer install
    ```

3.  **Instalar dependencias de Frontend (Vue.js)**

    ```bash
    npm install
    ```

4.  **Configurar el entorno**

    Copia el archivo de ejemplo `.env.example` a `.env`:

    ```bash
    cp .env.example .env
    ```

    Abre el archivo `.env` y configura las credenciales de tu base de datos:

    ```ini
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=sistema_hotelero
    DB_USERNAME=root
    DB_PASSWORD=tu_password
    ```

5.  **Generar clave de aplicación**

    ```bash
    php artisan key:generate
    ```

6.  **Ejecutar migraciones y seeders**

    Esto creará las tablas en la base de datos y poblará datos iniciales (roles, usuarios admin, etc.):

    ```bash
    php artisan migrate --seed
    ```

## Ejecutar la Aplicación

Para ejecutar el proyecto, necesitarás dos terminales abiertas:

**Terminal 1: Servidor Backend**
```bash
php artisan serve
```

**Terminal 2: Servidor de Desarrollo Frontend (Vite)**
```bash
npm run dev
```

Accede a la aplicación en tu navegador en: `http://localhost:8000` (o el puerto que indique `php artisan serve`).

## Credenciales por Defecto

Si se ejecutaron los seeders correctamente, puedes acceder con:

*   **Usuario:** `admin`
*   **Contraseña:** `password` (o la definida en los seeders)

## Estructura del Proyecto

*   `app/`: Lógica del Backend (Controladores, Modelos).
*   `resources/js/`: Código del Frontend (Vue.js).
    *   `views/`: Vistas de la aplicación.
    *   `components/`: Componentes reutilizables.
    *   `stores/`: Gestión de estado con Pinia.
    *   `router/`: Configuración de rutas.
*   `routes/api.php`: Definición de endpoints de la API.
