<!-- resources/js/layouts/MainLayout.vue -->

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <Sidebar :isOpen="sidebarOpen" @toggle="toggleSidebar" />

    <!-- Main Content -->
    <div class="main-content transition-all duration-300" :style="{ marginLeft: sidebarOpen ? '16rem' : '4rem' }">
      <!-- Navbar -->
      <Navbar @toggleSidebar="toggleSidebar" />

      <!-- Page Content -->
      <main class="p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '../components/layout/Sidebar.vue';
import Navbar from '../components/layout/Navbar.vue';

const sidebarOpen = ref(true);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
</script>

<style scoped>
.main-content {
  min-height: 100vh;
}
</style>