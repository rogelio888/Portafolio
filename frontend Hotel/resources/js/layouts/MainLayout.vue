<!-- resources/js/layouts/MainLayout.vue -->

<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Mobile overlay -->
    <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"></div>

    <!-- Sidebar -->
    <Sidebar :isOpen="sidebarOpen" :isMobileOpen="isMobileMenuOpen" @toggle="toggleSidebar" @closeMobile="isMobileMenuOpen = false" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-screen overflow-hidden">
      <!-- Navbar -->
      <Navbar @toggleSidebar="toggleSidebar" @openMobileMenu="isMobileMenuOpen = true" />

      <!-- Page Content -->
      <main class="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '../components/layout/Sidebar.vue';
import Navbar from '../components/layout/Navbar.vue';

const route = useRoute();
const sidebarOpen = ref(true);
const isMobileMenuOpen = ref(false);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

watch(() => route.path, () => {
  isMobileMenuOpen.value = false;
});
</script>