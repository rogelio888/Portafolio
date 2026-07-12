<script lang="ts">
	import '../lib/styles/global.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={favicon} />
	<meta name="theme-color" content="#faf3e6" />
</svelte:head>

<div class="min-h-screen flex flex-col bg-cream">
	<Header />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>
