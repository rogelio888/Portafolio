<!-- resources/js/components/Table.vue -->

<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <!-- Header con búsqueda y acciones -->
    <div class="p-4 border-b border-gray-200 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <input
          v-if="searchable"
          v-model="searchQuery"
          type="text"
          placeholder="Buscar..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <slot name="header-actions"></slot>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ column.label }}
            </th>
            <th v-if="actions" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading">
            <td :colspan="columns.length + (actions ? 1 : 0)" class="px-6 py-4 text-center text-gray-500">
              Cargando...
            </td>
          </tr>
          <tr v-else-if="filteredData.length === 0">
            <td :colspan="columns.length + (actions ? 1 : 0)" class="px-6 py-4 text-center text-gray-500">
              No hay datos disponibles
            </td>
          </tr>
          <tr v-else v-for="(item, index) in filteredData" :key="item.id || index" class="hover:bg-gray-50">
            <td v-for="column in columns" :key="column.key" class="px-6 py-4 whitespace-nowrap">
              <slot :name="`cell-${column.key}`" :item="item">
                {{ getNestedValue(item, column.key) }}
              </slot>
            </td>
            <td v-if="actions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <slot name="actions" :item="item"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && filteredData.length > 0" class="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Mostrando {{ filteredData.length }} de {{ data.length }} resultados
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  searchable: {
    type: Boolean,
    default: true
  },
  actions: {
    type: Boolean,
    default: true
  },
  pagination: {
    type: Boolean,
    default: false
  }
});

const searchQuery = ref('');

const filteredData = computed(() => {
  const validData = props.data.filter(item => item);
  
  if (!searchQuery.value) return validData;
  
  const query = searchQuery.value.toLowerCase();
  return validData.filter(item => {
    return props.columns.some(column => {
      const value = getNestedValue(item, column.key);
      return String(value).toLowerCase().includes(query);
    });
  });
});

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};
</script>