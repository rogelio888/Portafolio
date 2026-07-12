<script setup lang="ts">
import { cn } from "@/lib/utils"
import { buttonVariants, type ButtonVariants } from "."

const props = withDefaults(defineProps<{
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
  class?: any
  as?: string
  asChild?: boolean
}>(), {
  as: "button",
})
</script>

<template>
  <component
    :is="props.as"
    data-slot="button"
    :data-variant="props.variant"
    :data-size="props.size"
    :class="cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <slot />
  </component>
</template>
