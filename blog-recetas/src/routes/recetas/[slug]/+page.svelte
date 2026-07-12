<script lang="ts">
	import { base } from '$app/paths';
	import { Accordion } from 'bits-ui';
	import { Clock, Users, ChefHat, ArrowLeft, Pin } from '@lucide/svelte';
	import FoodIcon from '$lib/components/FoodIcon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { recipes } from '$lib/data/recipes';

	let { data } = $props();
	const recipe = data.recipe;

	const related = recipes.filter((r) => r.slug !== recipe.slug && r.category === recipe.category).slice(0, 3);
</script>

<svelte:head>
	<title>{recipe.title} — Sazón</title>
	<meta name="description" content={recipe.excerpt} />
</svelte:head>

<article class="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
	<a href="{base}/" class="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-tomato transition-colors mb-10" use:reveal>
		<ArrowLeft class="w-4 h-4" /> Volver al índice
	</a>

	<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
		<!-- Main column -->
		<div class="lg:col-span-7">
			<span class="text-xs uppercase tracking-widest text-tomato font-semibold" use:reveal>{recipe.category}</span>
			<h1 class="font-display font-bold text-4xl sm:text-5xl text-ink leading-[1.05] mt-3" use:reveal>
				{recipe.title}
			</h1>
			<p class="text-ink-soft text-base mt-4 leading-relaxed" use:reveal={80}>{recipe.excerpt}</p>

			<div class="flex items-center gap-8 mt-8" use:reveal={140}>
				<span class="flex flex-col items-center text-center">
					<Clock class="w-5 h-5 text-tomato mb-1" />
					<span class="text-xs text-ink-soft">{recipe.time}</span>
				</span>
				<span class="flex flex-col items-center text-center">
					<Users class="w-5 h-5 text-tomato mb-1" />
					<span class="text-xs text-ink-soft">{recipe.servings}</span>
				</span>
				<span class="flex flex-col items-center text-center">
					<ChefHat class="w-5 h-5 text-tomato mb-1" />
					<span class="text-xs text-ink-soft">{recipe.difficulty}</span>
				</span>
			</div>

			<div class="mt-12 rounded-2xl ruled-paper pl-6 pr-5 py-6" use:reveal={180}>
				<h2 class="font-hand text-3xl text-tomato mb-5">Preparación</h2>
				<ol class="space-y-5">
					{#each recipe.steps as step, i (i)}
						<li class="flex gap-4">
							<span class="font-display font-bold text-tomato/50 shrink-0 w-5">{i + 1}.</span>
							<p class="text-ink-soft leading-relaxed">{step}</p>
						</li>
					{/each}
				</ol>
			</div>

			<div class="mt-8" use:reveal>
				<Accordion.Root type="single">
					<Accordion.Item value="notas" class="relative">
						<Accordion.Header>
							<Accordion.Trigger class="w-full flex items-center gap-2.5 text-left cursor-pointer group">
								<Pin class="w-4 h-4 text-tomato -rotate-45" />
								<span class="font-hand text-2xl text-ink group-hover:text-tomato transition-colors">Nota de la cocina — tocar para leer</span>
							</Accordion.Trigger>
						</Accordion.Header>
						<Accordion.Content>
							<p class="index-card relative mt-4 mx-2 -rotate-1 rounded-sm px-6 py-5 font-hand text-2xl text-ink-soft leading-snug">
								{recipe.note}
							</p>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			</div>
		</div>

		<!-- Sticky ingredients note -->
		<div class="lg:col-span-5">
			<div class="lg:sticky lg:top-10">
				<div class="relative index-card rounded-sm px-7 py-8 rotate-1" use:reveal={100}>
					<div class="w-24 h-24 mx-auto mb-5 text-tomato/70">
						<FoodIcon name={recipe.icon} />
					</div>
					<h2 class="font-hand text-3xl text-tomato text-center mb-5">Lista de compras</h2>
					<ul class="space-y-2.5">
						{#each recipe.ingredients as ing (ing)}
							<li class="flex items-start gap-2.5 text-ink-soft text-sm">
								<span class="w-1.5 h-1.5 rounded-full bg-tomato/50 mt-1.5 shrink-0"></span>
								<span>{ing}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>
</article>

{#if related.length > 0}
	<section class="max-w-5xl mx-auto px-5 sm:px-8 pb-24 pt-8 border-t border-ink/10">
		<h2 class="font-display font-bold text-xl text-ink mb-6" use:reveal>Más de {recipe.category}</h2>
		<ul>
			{#each related as r (r.slug)}
				<li use:reveal>
					<a
						href="{base}/recetas/{r.slug}/"
						class="group flex items-baseline py-3.5 border-b border-ink/10 hover:border-tomato/40 transition-colors"
					>
						<span class="font-display text-lg text-ink group-hover:text-tomato transition-colors shrink-0">{r.title}</span>
						<span class="leader group-hover:border-tomato/50 transition-colors"></span>
						<span class="text-xs text-ink-soft shrink-0 font-medium">{r.time}</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>
{/if}
