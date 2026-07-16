<template>
  <canvas 
    ref="canvas" 
    class="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-transparent opacity-0 dark:opacity-100 transition-opacity duration-500"
  ></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx = null
let animationFrameId = null
let width = 0
let height = 0
const stars = []

const createStar = () => {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.2 + 0.3,
    baseOpacity: Math.random() * 0.4 + 0.2,
    opacity: 0,
    twinkleSpeed: Math.random() * 0.02 + 0.005,
    phase: Math.random() * Math.PI * 2,
    speedY: Math.random() * 0.05 + 0.01 // Subtle drift downward
  }
}

const resizeCanvas = () => {
  if (!canvas.value) return
  width = window.innerWidth
  height = window.innerHeight
  canvas.value.width = width
  canvas.value.height = height
}

const setupStars = () => {
  stars.length = 0
  const starCount = Math.min(Math.floor((width * height) / 10000), 150)
  for (let i = 0; i < starCount; i++) {
    stars.push(createStar())
  }
}

let tick = 0
const drawStars = () => {
  if (!ctx || !canvas.value) return
  ctx.clearRect(0, 0, width, height)
  
  tick++
  
  stars.forEach((s) => {
    s.y += s.speedY
    if (s.y > height) s.y = 0 // loop star back to top
    
    // Twinkle opacity using sine wave
    s.opacity = s.baseOpacity + Math.sin(tick * s.twinkleSpeed + s.phase) * 0.15
    s.opacity = Math.max(0.1, Math.min(1, s.opacity))
    
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(167, 139, 250, ${s.opacity})` // subtle violet glowing stars
    
    if (s.size > 1.0) {
      ctx.shadowBlur = 4
      ctx.shadowColor = '#a78bfa'
    } else {
      ctx.shadowBlur = 0
    }
    
    ctx.fill()
  })
  
  animationFrameId = requestAnimationFrame(drawStars)
}

onMounted(() => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')
  resizeCanvas()
  setupStars()
  drawStars()
  window.addEventListener('resize', () => {
    resizeCanvas()
    setupStars()
  })
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', resizeCanvas)
})
</script>
