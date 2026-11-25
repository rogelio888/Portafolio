<script setup lang="ts">
interface Props {
  showHandles?: boolean
  prefixLabel?: string
}

withDefaults(defineProps<Props>(), {
  showHandles: false,
  prefixLabel: ''
})

const links = [
  {
    name: 'GitHub',
    handle: 'github.com/rogelio888',
    url: 'https://github.com/rogelio888',
    ariaLabel: 'GitHub rogelio888',
    path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
  },
  {
    name: 'TikTok',
    handle: '@nexoraasystems',
    url: 'https://www.tiktok.com/@nexoraasystems',
    ariaLabel: 'TikTok @nexoraasystems',
    path: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z'
  }
]
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-500 select-none">
    <span v-if="prefixLabel" class="text-slate-400 mr-0.5">{{ prefixLabel }}</span>
    <template v-for="(item, idx) in links" :key="item.name">
      <a
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="item.ariaLabel"
        class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 transition-colors"
      >
        <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path :d="item.path" />
        </svg>
        <span>{{ showHandles ? item.handle : item.name }}</span>
      </a>
      <span v-if="!showHandles && idx < links.length - 1" class="text-slate-300" aria-hidden="true">&bull;</span>
    </template>
  </div>
</template>
