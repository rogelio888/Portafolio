<script setup lang="ts">
const progress = ref(0)

function updateProgress() {
  const h = document.documentElement
  const max = h.scrollHeight - h.clientHeight
  progress.value = max > 0 ? Math.min(1, window.scrollY / max) : 0
}

onMounted(() => {
  updateProgress()
  window.addEventListener('scroll', updateProgress, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress)
})
</script>

<template>
  <main class="bg-ink-0">
    <!-- Fixed scroll progress rail -->
    <div class="fixed left-0 top-0 h-full w-[2px] z-40 bg-paper/5 hidden lg:block">
      <div
        class="w-full bg-blood transition-[height] duration-150 ease-out"
        :style="{ height: `${progress * 100}%` }"
      />
    </div>

    <LandingHero />
    <LandingManifesto />
    <LandingStyles />
    <LandingFlashGallery />
    <LandingArtists />
    <LandingProcess />
    <LandingTestimonials />
    <LandingBooking />
    <LandingSiteFooter />
  </main>
</template>
