<!-- resources/js/App.vue -->

<template>
  <div id="app">
    <router-view />
    <ApiSimConsole />
    <ToastContainer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import ApiSimConsole from './components/ApiSimConsole.vue';
import ToastContainer from './components/ToastContainer.vue';

const authStore = useAuthStore();

onMounted(() => {
  // Verificar si hay usuario logueado
  if (authStore.isAuthenticated) {
    authStore.fetchUser();
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>