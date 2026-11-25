<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { techList } from '../../utils/siteData'

const trackRef = ref<HTMLElement | null>(null)
const firstSetRef = ref<HTMLElement | null>(null)
const isAutoPaused = ref(false)

let rafId: number | null = null
let lastTimestamp = 0
let virtualScrollLeft = 0
let expectedScrollLeft = 0
let pausedUntil = 0
let isTouching = false
let isMouseDragging = false
let dragStartX = 0
let dragStartScrollLeft = 0
let isMouseHover = false
let isFocused = false
let prefersReducedMotion = false

const RESUME_DELAY_MS = 1200
const SPEED_PX_PER_SEC = 36

const pauseAutoScroll = (delayMs = RESUME_DELAY_MS) => {
  pausedUntil = Math.max(pausedUntil, performance.now() + delayMs)
  isAutoPaused.value = true
}

const getHalfWidth = () => {
  const firstSet = firstSetRef.value
  return firstSet ? firstSet.getBoundingClientRect().width : 0
}

const wrapBounds = (el: HTMLElement, halfWidth: number) => {
  if (halfWidth <= 0) return
  if (el.scrollLeft >= halfWidth) {
    el.scrollLeft -= halfWidth
    virtualScrollLeft -= halfWidth
    expectedScrollLeft = el.scrollLeft
  } else if (el.scrollLeft <= 1) {
    el.scrollLeft += halfWidth
    virtualScrollLeft += halfWidth
    expectedScrollLeft = el.scrollLeft
  }
}

const step = (now: number) => {
  const el = trackRef.value
  if (!el) {
    rafId = window.requestAnimationFrame(step)
    return
  }

  const dt = lastTimestamp ? Math.min((now - lastTimestamp) / 1000, 0.05) : 0.016
  lastTimestamp = now

  const halfWidth = getHalfWidth()
  const blocked = prefersReducedMotion || isTouching || isMouseHover || isFocused || now < pausedUntil
  isAutoPaused.value = blocked

  if (!blocked && halfWidth > 0) {
    if (Math.abs(virtualScrollLeft - el.scrollLeft) > 3) {
      virtualScrollLeft = el.scrollLeft
    }
    virtualScrollLeft += SPEED_PX_PER_SEC * dt
    el.scrollLeft = virtualScrollLeft
    expectedScrollLeft = el.scrollLeft
    wrapBounds(el, halfWidth)
  }

  rafId = window.requestAnimationFrame(step)
}

const onPointerDown = (e: PointerEvent) => {
  const el = trackRef.value
  if (!el) return
  if (e.pointerType === 'mouse' && e.button === 0) {
    isMouseDragging = true
    dragStartX = e.clientX
    dragStartScrollLeft = el.scrollLeft
    isTouching = true
    pauseAutoScroll()
  } else if (e.pointerType === 'touch' || e.pointerType === 'pen') {
    isTouching = true
    pauseAutoScroll()
  }
}

const onPointerMoveGlobal = (e: PointerEvent) => {
  if (!isMouseDragging) return
  const el = trackRef.value
  if (!el) return
  const dx = e.clientX - dragStartX
  el.scrollLeft = dragStartScrollLeft - dx
  virtualScrollLeft = el.scrollLeft
  expectedScrollLeft = el.scrollLeft
  wrapBounds(el, getHalfWidth())
  pauseAutoScroll()
}

const onPointerUpGlobal = () => {
  isMouseDragging = false
  if (isTouching) {
    isTouching = false
    pauseAutoScroll()
  }
}

const onPointerEnter = (e: PointerEvent) => {
  if (e.pointerType === 'mouse') {
    isMouseHover = true
    isAutoPaused.value = true
  }
}

const onPointerLeave = (e: PointerEvent) => {
  if (e.pointerType === 'mouse') {
    isMouseHover = false
    pauseAutoScroll(500)
  }
}

const onTrackScroll = () => {
  const el = trackRef.value
  if (!el) return
  // Detect user/inertia scroll distinct from our rAF step
  if (Math.abs(el.scrollLeft - expectedScrollLeft) > 2) {
    pauseAutoScroll()
    virtualScrollLeft = el.scrollLeft
    expectedScrollLeft = el.scrollLeft
    wrapBounds(el, getHalfWidth())
  }
}

const onWheel = () => {
  pauseAutoScroll()
}

const onFocusIn = () => {
  isFocused = true
  isAutoPaused.value = true
}

const onFocusOut = () => {
  isFocused = false
  pauseAutoScroll(800)
}

onMounted(() => {
  prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const el = trackRef.value
  if (el) {
    const halfWidth = getHalfWidth()
    if (halfWidth > 0) {
      el.scrollLeft = 24
      virtualScrollLeft = el.scrollLeft
      expectedScrollLeft = el.scrollLeft
    }
  }
  window.addEventListener('pointermove', onPointerMoveGlobal, { passive: true })
  window.addEventListener('pointerup', onPointerUpGlobal, { passive: true })
  window.addEventListener('pointercancel', onPointerUpGlobal, { passive: true })
  rafId = window.requestAnimationFrame(step)
})

onUnmounted(() => {
  window.removeEventListener('pointermove', onPointerMoveGlobal)
  window.removeEventListener('pointerup', onPointerUpGlobal)
  window.removeEventListener('pointercancel', onPointerUpGlobal)
  if (rafId !== null) window.cancelAnimationFrame(rafId)
})
</script>

<template>
  <section id="tecnologias" class="w-full py-10 sm:py-16 bg-[#f5f4ef] border-y-2 border-slate-900 overflow-hidden relative no-print">
    
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 mb-5 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-2.5 sm:gap-4">
      <div>
        <div class="comic-caption mb-2 text-[10px] sm:text-xs select-none">
          <span>CAPÍTULO 02 // HERRAMIENTAS</span>
        </div>
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 font-display uppercase tracking-tight">
          Stack de Desarrollo
        </h2>
      </div>
      <p class="text-xs sm:text-sm text-slate-700 font-medium max-w-md">
        Tecnologías probadas en producción para garantizar escalabilidad, seguridad y carga instantánea en cada proyecto.
      </p>
    </div>

    <!-- Interactive Infinite Carousel (Auto-glides at 60fps; pauses instantly on touch/scroll/hover & resumes cleanly after 1.2s) -->
    <div 
      ref="trackRef"
      @scroll="onTrackScroll"
      @pointerdown="onPointerDown"
      @pointerenter="onPointerEnter"
      @pointerleave="onPointerLeave"
      @wheel.passive="onWheel"
      @focusin="onFocusIn"
      @focusout="onFocusOut"
      class="flex w-full overflow-x-auto no-scrollbar select-none py-3 cursor-grab active:cursor-grabbing"
      style="mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent); touch-action: pan-x pan-y;"
    >
      <div ref="firstSetRef" class="flex shrink-0 gap-3 sm:gap-5 pr-3 sm:pr-5">
        <div 
          v-for="tech in techList" 
          :key="tech.name" 
          tabindex="0"
          class="p-3.5 sm:p-4 w-44 h-36 sm:w-52 sm:h-40 rounded-xl bg-white border-2 border-slate-900 flex flex-col justify-between shadow-[3px_3px_0px_#0f172a] hover:shadow-[5px_5px_0px_#0f172a] hover:-translate-y-1 transition-all shrink-0"
        >
          <div class="flex items-center justify-between border-b-2 border-slate-900/10 pb-1.5 sm:pb-2">
            <span class="text-[9px] sm:text-[10px] font-black uppercase text-slate-500 tracking-wider">{{ tech.category }}</span>
            <span class="w-2 h-2 rounded-full bg-blue-600 border border-slate-900"></span>
          </div>

          <div class="flex items-center gap-2.5 sm:gap-3">
            <div class="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center" v-html="tech.svg"></div>
            <span class="text-sm sm:text-base font-black text-slate-900 font-display leading-tight">{{ tech.name }}</span>
          </div>

          <div class="text-[11px] text-slate-600 font-medium line-clamp-2 leading-tight">
            {{ tech.role }}
          </div>
        </div>
      </div>

      <!-- Copy 2 for seamless endless loop -->
      <div class="flex shrink-0 gap-3 sm:gap-5 pr-3 sm:pr-5" aria-hidden="true">
        <div 
          v-for="tech in techList" 
          :key="tech.name + '-dup'" 
          tabindex="-1"
          class="p-3.5 sm:p-4 w-44 h-36 sm:w-52 sm:h-40 rounded-xl bg-white border-2 border-slate-900 flex flex-col justify-between shadow-[3px_3px_0px_#0f172a] hover:shadow-[5px_5px_0px_#0f172a] hover:-translate-y-1 transition-all shrink-0"
        >
          <div class="flex items-center justify-between border-b-2 border-slate-900/10 pb-1.5 sm:pb-2">
            <span class="text-[9px] sm:text-[10px] font-black uppercase text-slate-500 tracking-wider">{{ tech.category }}</span>
            <span class="w-2 h-2 rounded-full bg-blue-600 border border-slate-900"></span>
          </div>

          <div class="flex items-center gap-2.5 sm:gap-3">
            <div class="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center" v-html="tech.svg"></div>
            <span class="text-sm sm:text-base font-black text-slate-900 font-display leading-tight">{{ tech.name }}</span>
          </div>

          <div class="text-[11px] text-slate-600 font-medium line-clamp-2 leading-tight">
            {{ tech.role }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
