<template>
  <div class="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
    <!-- Deep space gradient (Smooth fade to avoid sharp lines) -->
    <div class="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,_rgba(76,29,149,0.25)_0%,_rgba(2,6,23,0)_100%)]"></div>
    
    <!-- Canvas for Stars -->
    <canvas 
      ref="canvas" 
      class="absolute inset-0 w-full h-full opacity-0 dark:opacity-100 transition-opacity duration-1000"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx = null
let animationFrameId = null
let width = 0
let height = 0
const stars = []

const createStar = (layer) => {
  // Layer 1: Far, Slow, Small
  // Layer 2: Mid, Medium, Violet/Pink tinted
  // Layer 3: Near, Fast, Bright
  
  let size, speedX, speedY, color, baseOpacity
  
  if (layer === 1) {
    size = Math.random() * 1 + 0.5
    speedX = -(Math.random() * 0.1 + 0.05)
    speedY = (Math.random() * 0.05 + 0.02)
    color = '255, 255, 255'
    baseOpacity = Math.random() * 0.3 + 0.1
  } else if (layer === 2) {
    size = Math.random() * 1.5 + 1
    speedX = -(Math.random() * 0.2 + 0.1)
    speedY = (Math.random() * 0.1 + 0.05)
    const colors = ['226, 232, 240', '196, 181, 253', '251, 207, 232'] // slate, violet, pink
    color = colors[Math.floor(Math.random() * colors.length)]
    baseOpacity = Math.random() * 0.4 + 0.3
  } else {
    size = Math.random() * 2 + 1.5
    speedX = -(Math.random() * 0.4 + 0.2)
    speedY = (Math.random() * 0.2 + 0.1)
    color = '255, 255, 255'
    baseOpacity = Math.random() * 0.5 + 0.5
  }

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size,
    color,
    baseOpacity,
    opacity: 0,
    twinkleSpeed: Math.random() * 0.02 + 0.01,
    phase: Math.random() * Math.PI * 2,
    speedX,
    speedY,
    layer
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
  const area = width * height
  
  const countLayer1 = Math.min(Math.floor(area / 8000), 100)
  const countLayer2 = Math.min(Math.floor(area / 15000), 50)
  const countLayer3 = Math.min(Math.floor(area / 30000), 25)

  for (let i = 0; i < countLayer1; i++) stars.push(createStar(1))
  for (let i = 0; i < countLayer2; i++) stars.push(createStar(2))
  for (let i = 0; i < countLayer3; i++) stars.push(createStar(3))
}

let tick = 0
const drawStars = () => {
  if (!ctx || !canvas.value) return
  ctx.clearRect(0, 0, width, height)
  
  tick += 0.5

  stars.forEach(star => {
    // Parallax movement
    star.x += star.speedX
    star.y += star.speedY
    
    // Wrap around screen
    if (star.x < 0) star.x = width
    if (star.y > height) star.y = 0

    // Twinkle
    star.phase += star.twinkleSpeed
    star.opacity = star.baseOpacity + Math.sin(star.phase) * (star.layer === 3 ? 0.3 : 0.15)
    star.opacity = Math.max(0, Math.min(1, star.opacity))

    ctx.beginPath()
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${star.color}, ${star.opacity})`
    
    // Add glow to near stars
    if (star.layer === 3) {
      ctx.shadowBlur = 6
      ctx.shadowColor = `rgba(${star.color}, 0.8)`
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
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', resizeCanvas)
})
</script>
