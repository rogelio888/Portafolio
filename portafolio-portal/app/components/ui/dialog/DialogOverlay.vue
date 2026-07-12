<script setup lang="ts">
import { DialogOverlay } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: any
}>()
</script>

<template>
  <DialogOverlay
    data-slot="dialog-overlay"
    v-bind="$attrs"
    :class="cn('data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80', props.class)"
  >
    <slot />
  </DialogOverlay>
</template>
