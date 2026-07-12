<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'es' },
  link: [{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }]
})

const title = 'CUERVO — Tattoo Club'
const description = 'Estudio de tatuaje y arte urbano. Blackwork, fine line, realismo y cover-ups. Sin cliché, sin plantilla — como tu piel.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  themeColor: '#0a0a0a'
})
</script>

<template>
  <UApp>
    <CustomCursor />
    <div class="grain-overlay" />
    <NuxtPage />
  </UApp>
</template>
