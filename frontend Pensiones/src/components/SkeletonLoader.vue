<script setup lang="ts">
defineProps({
  rows: {
    type: Number,
    default: 4
  }
});
</script>

<template>
  <div class="animate-pulse space-y-4 w-full">
    <!-- Header simulado -->
    <div class="h-12 bg-slate-200 rounded-sm w-full opacity-70"></div>
    
    <!-- Filas simuladas -->
    <div class="space-y-2">
      <div v-for="i in rows" :key="i" class="flex gap-4 p-4 border border-slate-100 rounded-sm bg-white">
        <div class="h-10 w-10 bg-slate-200 rounded-full shrink-0"></div>
        <div class="flex-1 space-y-2 py-1">
          <div class="h-3 bg-slate-200 rounded w-1/4"></div>
          <div class="h-2 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div class="w-24 h-6 bg-slate-200 rounded-full mt-2"></div>
      </div>
    </div>
  </div>
</template>
