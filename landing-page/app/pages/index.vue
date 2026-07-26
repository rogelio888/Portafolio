<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isBookingOpen = ref(false);
const progress = ref(0);

function updateProgress() {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  progress.value = max > 0 ? Math.min(1, window.scrollY / max) : 0;
}

onMounted(() => {
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress);
});

const openBookingModal = () => {
  isBookingOpen.value = true;
};

const closeBookingModal = () => {
  isBookingOpen.value = false;
};
</script>

<template>
  <div class="bg-black text-white relative min-h-screen">
    <!-- Navbar -->
    <Navbar @open-booking="openBookingModal" />

    <!-- Fixed scroll progress rail -->
    <div class="fixed left-0 top-0 h-full w-[2px] z-40 bg-white/10 hidden lg:block">
      <div
        class="w-full bg-white transition-[height] duration-150 ease-out"
        :style="{ height: `${progress * 100}%` }"
      />
    </div>

    <!-- Main Content -->
    <main>
      <LandingHero @open-booking="openBookingModal" />
      <LandingProcess @open-booking="openBookingModal" />
      <LandingFlashGallery @open-booking="openBookingModal" />
      <LandingArtists @open-booking="openBookingModal" />
      <LandingAftercare @open-booking="openBookingModal" />
      <LandingSiteFooter @open-booking="openBookingModal" />
    </main>

    <!-- Booking Modal -->
    <BookingModal :is-open="isBookingOpen" @close="closeBookingModal" />
  </div>
</template>
