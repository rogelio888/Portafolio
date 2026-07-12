<!-- resources/js/views/NotFound.vue -->

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-gray-300">404</h1>
      <h2 class="text-3xl font-bold text-gray-800 mt-4">Página no encontrada</h2>
      <p class="text-gray-600 mt-2">La página que buscas no existe</p>
      <router-link
        to="/"
        class="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Volver al inicio
      </router-link>
    </div>
  </div>
</template>