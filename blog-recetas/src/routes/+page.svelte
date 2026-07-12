<script lang="ts">
	import { base } from '$app/paths';
	import { recipes } from '$lib/data/recipes';
	import FoodIcon from '$lib/components/FoodIcon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { Clock, Users, ArrowRight } from '@lucide/svelte';

	const featured = recipes[0];
	const rest = recipes.slice(1);

	const chapters = Array.from(new Set(rest.map((r) => r.category))).map((category, i) => ({
		num: String(i + 1).padStart(2, '0'),
		category,
		items: rest.filter((r) => r.category === category)
	}));
</script>

<svelte:head>
	<title>Sazón — Recetas bolivianas de casa</title>
	<meta name="description" content="Recetas bolivianas probadas en casa: salteñas, sopa de maní, humintas y más, explicadas paso a paso." />
</svelte:head>

<!-- Cover story -->
<section class="max-w-5xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 border-b border-ink/10">
	<span class="text-xs uppercase tracking-widest text-tomato font-semibold" use:reveal>Historia de portada</span>

	<div class="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-8 sm:gap-4 items-center">
		<div class="sm:col-span-7 order-2 sm:order-1" use:reveal={80}>
			<h1 class="font-display font-bold text-4xl sm:text-5xl text-ink leading-[1.08]">
				{featured.title}
			</h1>
			<p class="mt-5 text-ink-soft text-base leading-relaxed max-w-md">{featured.excerpt}</p>
			<div class="flex items-center gap-5 mt-6 text-sm text-ink-soft">
				<span class="flex items-center gap-1.5"><Clock class="w-4 h-4 text-tomato" /> {featured.time}</span>
				<span class="flex items-center gap-1.5"><Users class="w-4 h-4 text-tomato" /> {featured.servings}</span>
			</div>
			<a
				href="{base}/recetas/{featured.slug}/"
				class="group inline-flex items-center gap-2 mt-8 font-hand text-2xl text-tomato hover:text-ink transition-colors"
			>
				ir a la receta
				<ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
			</a>
		</div>

		<div class="sm:col-span-5 order-1 sm:order-2 relative" use:reveal>
			<div class="aspect-square rounded-full bg-tomato/10 flex items-center justify-center p-10 -rotate-3">
				<div class="w-full h-full text-tomato">
					<FoodIcon name={featured.icon} />
				</div>
			</div>
			<span class="absolute -bottom-3 left-1/2 -translate-x-1/2 font-hand text-xl text-ink-soft bg-cream px-3">
				{featured.category}
			</span>
		</div>
	</div>
</section>

<!-- Index / table of contents -->
<section id="indice" class="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
	<h2 class="font-display font-bold text-3xl text-ink mb-2" use:reveal>Índice de recetas</h2>
	<p class="text-ink-soft text-sm mb-12" use:reveal={60}>{recipes.length} recetas, organizadas como en un buen recetario.</p>

	<div class="space-y-14">
		{#each chapters as chapter (chapter.category)}
			<div>
				<div class="flex items-baseline gap-4 mb-5" use:reveal>
					<span class="font-display text-5xl text-tomato/25">{chapter.num}</span>
					<h3 class="font-display text-2xl text-ink">{chapter.category}</h3>
				</div>

				<ul>
					{#each chapter.items as recipe, i (recipe.slug)}
						<li use:reveal={i * 50}>
							<a
								href="{base}/recetas/{recipe.slug}/"
								class="group flex items-baseline py-3.5 border-b border-ink/10 hover:border-tomato/40 transition-colors"
							>
								<span class="font-display text-lg sm:text-xl text-ink group-hover:text-tomato transition-colors shrink-0">
									{recipe.title}
								</span>
								<span class="leader group-hover:border-tomato/50 transition-colors"></span>
								<span class="text-xs text-ink-soft shrink-0 font-medium">{recipe.time} · {recipe.difficulty}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</section>
