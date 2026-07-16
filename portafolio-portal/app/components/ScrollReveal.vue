<template>
  <div 
    ref="target" 
    :class="[
      'transition-all transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
      isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.97]'
    ]"
    :style="{ transitionDelay: `${delay}ms` }"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  delay: {
    type: Number,
    default: 0
  }
})

const target = ref(null)
const isVisible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      // Force repaint to guarantee the initial opacity-0 state is registered by browser
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isVisible.value = true
        })
      })
      observer.disconnect()
    }
  }, {
    threshold: 0.05
  })
  
  if (target.value) {
    observer.observe(target.value)
  }
})
</script>
