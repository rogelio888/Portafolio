<script setup lang="ts">
const ringX = ref(0)
const ringY = ref(0)
const dotX = ref(0)
const dotY = ref(0)
const hovering = ref(false)

let ringPosX = 0
let ringPosY = 0
let rafId = 0

function onPointerMove(e: PointerEvent) {
  dotX.value = e.clientX
  dotY.value = e.clientY

  const target = e.target as HTMLElement
  hovering.value = !!target?.closest?.('a, button, [data-cursor-hover]')
}

function loop() {
  ringPosX += (dotX.value - ringPosX) * 0.18
  ringPosY += (dotY.value - ringPosY) * 0.18
  ringX.value = ringPosX
  ringY.value = ringPosY
  rafId = requestAnimationFrame(loop)
}

onMounted(() => {
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  rafId = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <div
    class="custom-cursor"
    :class="{ 'is-hovering': hovering }"
    :style="{ transform: `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)` }"
  />
  <div
    class="custom-cursor-dot"
    :style="{ transform: `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)` }"
  />
</template>
