<script lang="ts">
	import { base } from '$app/paths';
	import { Menu, X } from '@lucide/svelte';

	let mobileOpen = $state(false);

	const today = new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });
</script>

<header class="border-b-4 border-double border-ink/70">
	<div class="max-w-5xl mx-auto px-5 sm:px-8 pt-4 pb-3 flex items-center justify-between text-[11px] tracking-wide text-ink-soft uppercase">
		<span>Edición N.º 12 — Cocina Boliviana</span>
		<span class="hidden sm:inline">{today}</span>
		<button
			type="button"
			aria-label="Abrir menú"
			class="sm:hidden w-8 h-8 -mr-2 flex items-center justify-center text-ink cursor-pointer"
			onclick={() => (mobileOpen = !mobileOpen)}
		>
			{#if mobileOpen}
				<X class="w-4 h-4" />
			{:else}
				<Menu class="w-4 h-4" />
			{/if}
		</button>
	</div>

	<a href="{base}/" class="block text-center pb-5">
		<span class="font-display font-bold text-6xl sm:text-7xl text-ink tracking-tight">Sazón</span>
		<span class="block font-hand text-2xl text-tomato mt-1">recetas bolivianas de casa</span>
	</a>

	<nav class="hidden sm:flex items-center justify-center gap-8 text-xs uppercase tracking-widest text-ink-soft pb-4">
		<a href="{base}/#indice" class="hover:text-tomato transition-colors">Índice</a>
		<span class="text-ink/20">·</span>
		<a href="{base}/#sobre" class="hover:text-tomato transition-colors">Sobre el blog</a>
		<span class="text-ink/20">·</span>
		<button type="button" title="Demo de portafolio — botón no funcional" class="hover:text-tomato transition-colors cursor-pointer uppercase tracking-widest">Suscribirme</button>
	</nav>

	{#if mobileOpen}
		<div class="sm:hidden border-t border-ink/10 bg-cream px-5 py-5 flex flex-col gap-4 text-ink-soft text-sm uppercase tracking-wide">
			<a href="{base}/#indice" onclick={() => (mobileOpen = false)}>Índice</a>
			<a href="{base}/#sobre" onclick={() => (mobileOpen = false)}>Sobre el blog</a>
			<button type="button" title="Demo de portafolio — botón no funcional" class="text-left cursor-pointer">Suscribirme</button>
		</div>
	{/if}
</header>
