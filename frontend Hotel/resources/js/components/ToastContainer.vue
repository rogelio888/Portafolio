<!-- resources/js/components/ToastContainer.vue -->
<template>
  <div>
    <!-- Toasts Area (Top Right) -->
    <div class="fixed top-4 right-4 z-50 flex flex-col items-end space-y-3 pointer-events-none w-full max-w-sm px-4 sm:px-0">
      <transition-group 
        enter-active-class="transition ease-out duration-300 transform"
        enter-from-class="opacity-0 translate-y-[-20px]"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200 transform"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 translate-x-10"
      >
        <div 
          v-for="toast in toastStore.toasts" 
          :key="toast.id"
          class="pointer-events-auto flex items-center w-full p-4 rounded-xl shadow-lg border backdrop-blur-md bg-white/80"
          :class="[
            toast.type === 'success' ? 'border-green-200' : '',
            toast.type === 'error' ? 'border-red-200' : '',
            toast.type === 'warning' ? 'border-yellow-200' : '',
            toast.type === 'info' ? 'border-blue-200' : '',
          ]"
        >
          <!-- Icons -->
          <div class="flex-shrink-0 mr-3">
            <svg v-if="toast.type === 'success'" class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <svg v-else-if="toast.type === 'error'" class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            <svg v-else-if="toast.type === 'warning'" class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <svg v-else class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <!-- Message -->
          <div class="flex-1 text-sm font-medium text-gray-800">
            {{ toast.message }}
          </div>
          <!-- Close Button -->
          <button @click="toastStore.remove(toast.id)" class="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </transition-group>
    </div>

    <!-- Confirm Dialog (Centered Modal) -->
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="toastStore.confirmConfig" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="toastStore.resolveConfirm(false)"></div>
        
        <!-- Dialog -->
        <div class="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6 transform transition-all">
          <div class="flex items-start">
            <div class="flex-shrink-0 text-yellow-500">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-bold text-gray-900">Confirmar Acción</h3>
              <p class="mt-2 text-sm text-gray-600">{{ toastStore.confirmConfig.message }}</p>
            </div>
          </div>
          <div class="mt-6 flex flex-row-reverse space-x-2 space-x-reverse">
            <button @click="toastStore.resolveConfirm(true)" class="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-300 transition-colors">
              Confirmar
            </button>
            <button @click="toastStore.resolveConfirm(false)" class="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useToastStore } from '../stores/toast';
const toastStore = useToastStore();
</script>
