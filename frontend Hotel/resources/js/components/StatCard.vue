<!-- resources/js/components/StatCard.vue -->

<template>
  <div :class="[
    'bg-white rounded-lg shadow p-6 border-l-4',
    borderColor
  ]">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-600 mb-1">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-800">{{ value }}</p>
      </div>
      <div :class="['flex items-center justify-center p-3 rounded-full bg-opacity-20 w-14 h-14', iconColorBg, iconColor]">
        <Icon v-if="icon" :name="icon" class="w-8 h-8" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  color: {
    type: String,
    default: 'blue'
  }
});

const borderColor = computed(() => {
  const colors = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    yellow: 'border-yellow-500',
    red: 'border-red-500',
    purple: 'border-purple-500',
  };
  return colors[props.color] || colors.blue;
});

const iconColor = computed(() => {
  const colors = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    purple: 'text-purple-500',
  };
  return colors[props.color] || colors.blue;
});

const iconColorBg = computed(() => {
  const bgColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };
  return bgColors[props.color] || bgColors.blue;
});
</script>