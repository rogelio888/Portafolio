<script setup lang="ts">
const props = withDefaults(defineProps<{
  name: 'dagger' | 'rose' | 'star' | 'snake' | 'anchor' | 'swallow' | 'lightning' | 'eye' | 'raven'
  class?: string
}>(), {
  class: 'w-full h-full'
})
</script>

<template>
  <svg :class="props.class" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <template v-if="name === 'dagger'">
      <path d="M50 8 L58 42 L50 50 L42 42 Z" />
      <line x1="50" y1="50" x2="50" y2="86" />
      <line x1="30" y1="46" x2="70" y2="46" />
      <path d="M40 86 L60 86 L56 92 L44 92 Z" />
      <path d="M50 14 L54 40" opacity="0.5" />
    </template>

    <template v-else-if="name === 'rose'">
      <path d="M50 40 C 45.5 31, 45.5 19, 50 13 C 54.5 19, 54.5 31, 50 40 Z" transform="rotate(0 50 40)" />
      <path d="M50 40 C 45.5 31, 45.5 19, 50 13 C 54.5 19, 54.5 31, 50 40 Z" transform="rotate(72 50 40)" />
      <path d="M50 40 C 45.5 31, 45.5 19, 50 13 C 54.5 19, 54.5 31, 50 40 Z" transform="rotate(144 50 40)" />
      <path d="M50 40 C 45.5 31, 45.5 19, 50 13 C 54.5 19, 54.5 31, 50 40 Z" transform="rotate(216 50 40)" />
      <path d="M50 40 C 45.5 31, 45.5 19, 50 13 C 54.5 19, 54.5 31, 50 40 Z" transform="rotate(288 50 40)" />
      <circle cx="50" cy="40" r="5" opacity="0.7" />
      <path d="M50 46 C 47 58, 47 72, 50 90" />
      <path d="M50 64 C 39 62, 32 68, 29 76" />
      <path d="M50 74 C 61 72, 68 78, 71 84" />
    </template>

    <template v-else-if="name === 'star'">
      <path d="M50 6 L58 38 L92 40 L64 58 L74 90 L50 70 L26 90 L36 58 L8 40 L42 38 Z" />
      <circle cx="50" cy="50" r="6" opacity="0.5" />
    </template>

    <template v-else-if="name === 'snake'">
      <path d="M20 30 C 40 10, 60 50, 80 30 C 95 20, 90 45, 75 50 C 55 58, 60 75, 40 80 C 25 84, 20 70, 30 65" />
      <path d="M20 30 L12 24 M20 30 L14 34" />
      <circle cx="18" cy="28" r="1.6" fill="currentColor" />
    </template>

    <template v-else-if="name === 'anchor'">
      <circle cx="50" cy="16" r="7" />
      <line x1="50" y1="23" x2="50" y2="80" />
      <line x1="34" y1="34" x2="66" y2="34" />
      <path d="M50 80 C 30 80, 22 62, 28 48" />
      <path d="M50 80 C 70 80, 78 62, 72 48" />
      <path d="M20 48 L28 48 L24 40 Z" />
      <path d="M80 48 L72 48 L76 40 Z" />
    </template>

    <template v-else-if="name === 'swallow'">
      <circle cx="50" cy="46" r="3" fill="currentColor" />
      <path d="M48 47 C 36 36, 18 32, 5 37" />
      <path d="M47 50 C 36 47, 22 49, 11 57" />
      <path d="M52 47 C 64 36, 82 32, 95 37" />
      <path d="M53 50 C 64 47, 78 49, 89 57" />
      <path d="M46 49 L41 72 L48 62" />
      <path d="M54 49 L59 72 L52 62" />
    </template>

    <template v-else-if="name === 'lightning'">
      <path d="M58 6 L30 52 L48 52 L40 94 L74 42 L54 42 Z" />
    </template>

    <template v-else-if="name === 'eye'">
      <path d="M8 50 C 26 22, 74 22, 92 50 C 74 78, 26 78, 8 50Z" />
      <circle cx="50" cy="50" r="14" />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
      <path d="M50 12 L50 22 M50 78 L50 88 M12 50 L22 50 M78 50 L88 50" opacity="0.5" />
    </template>

    <template v-else-if="name === 'raven'">
      <path d="M20 60 C 24 40, 40 26, 50 30 C 46 20, 54 12, 64 16 C 60 22, 62 28, 68 30 C 82 34, 88 48, 82 56 C 78 50, 70 48, 64 50 C 70 56, 72 66, 66 74 C 64 66, 58 60, 50 60 C 54 68, 52 78, 44 84 C 46 74, 42 66, 34 62 C 30 68, 22 68, 16 62 C 20 62, 22 60, 20 60Z" />
      <circle cx="58" cy="24" r="1.8" fill="currentColor" />
    </template>
  </svg>
</template>
