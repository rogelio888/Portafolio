<script setup lang="ts">
import { DialogTitle } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: any
}>()
</script>

<template>
  <DialogTitle
    data-slot="dialog-title"
    v-bind="$attrs"
    :class="cn('text-lg leading-none font-semibold', props.class)"
  >
    <slot />
  </DialogTitle>
</template>
