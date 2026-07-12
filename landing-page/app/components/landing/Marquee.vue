<script setup lang="ts">
withDefaults(defineProps<{
  items: string[]
  reverse?: boolean
  separator?: string
}>(), {
  reverse: false,
  separator: '✦'
})
</script>

<template>
  <div class="overflow-hidden select-none">
    <div class="marquee-track" :class="{ reverse }">
      <div v-for="rep in 2" :key="rep" class="flex items-center shrink-0">
        <template v-for="(item, idx) in items" :key="`${rep}-${idx}`">
          <span class="font-display text-[clamp(1.5rem,4vw,3rem)] px-6 whitespace-nowrap">{{ item }}</span>
          <span class="text-blood text-2xl px-2">{{ separator }}</span>
        </template>
      </div>
    </div>
  </div>
</template>
