<script lang="ts">
	const socials = ['Instagram', 'Pinterest', 'YouTube'];
</script>

<footer id="sobre" class="border-t-4 border-double border-ink/70 mt-24 px-5 sm:px-8 pt-10 pb-12">
	<div class="max-w-5xl mx-auto text-center">
		<span class="font-display font-bold text-2xl text-ink">Sazón</span>
		<p class="text-ink-soft text-sm mt-3 max-w-md mx-auto leading-relaxed">
			Recetas bolivianas de casa, probadas y vueltas a probar hasta que salen como las de la abuela.
		</p>

		<nav class="flex items-center justify-center gap-6 mt-6 text-xs uppercase tracking-widest text-ink-soft">
			{#each socials as s, i (s)}
				{#if i > 0}<span class="text-ink/20">·</span>{/if}
				<button
					type="button"
					title="Demo de portafolio — enlace no funcional"
					class="hover:text-tomato transition-colors cursor-pointer"
				>
					{s}
				</button>
			{/each}
		</nav>

		<div class="mt-8 pt-6 border-t border-ink/10 text-[11px] text-ink-soft/60 space-y-1">
			<p>© {new Date().getFullYear()} Sazón — Edición N.º 12, Cocina Boliviana</p>
			<p>Blog ficticio — pieza de portafolio web</p>
		</div>
	</div>
</footer>
