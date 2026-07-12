<script setup lang="ts">
import { DialogDescription } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: any
}>()
</script>

<template>
  <DialogDescription
    data-slot="dialog-description"
    v-bind="$attrs"
    :class="cn('text-muted-foreground text-sm', props.class)"
  >
    <slot />
  </DialogDescription>
</template>
