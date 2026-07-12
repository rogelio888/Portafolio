<script lang="ts">
	interface Props {
		name: 'tomato' | 'chili' | 'garlic' | 'knife' | 'pan' | 'pot' | 'herbs' | 'bread' | 'lemon' | 'egg';
		class?: string;
	}

	let { name, class: className = 'w-full h-full' }: Props = $props();
</script>

<svg class={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
	{#if name === 'tomato'}
		<circle cx="50" cy="56" r="32" />
		<path d="M50 24 C 44 16, 34 14, 28 18 C 34 22, 38 26, 40 30" />
		<path d="M50 24 C 56 16, 66 14, 72 18 C 66 22, 62 26, 60 30" />
		<path d="M50 24 L50 32" />
	{:else if name === 'chili'}
		<path d="M32 22 C 20 28, 14 44, 20 58 C 26 74, 44 84, 60 78 C 70 74, 74 62, 66 54 C 58 46, 44 40, 38 28 C 36 24, 34 22, 32 22 Z" />
		<path d="M30 16 L34 22 M38 14 L38 21" opacity="0.6" />
	{:else if name === 'garlic'}
		<path d="M50 90 C 30 90, 24 74, 30 60 C 24 56, 22 48, 28 40 C 24 34, 28 24, 38 22 C 40 14, 60 14, 62 22 C 72 24, 76 34, 72 40 C 78 48, 76 56, 70 60 C 76 74, 70 90, 50 90Z" />
		<line x1="50" y1="22" x2="50" y2="82" opacity="0.4" />
		<line x1="38" y1="30" x2="42" y2="78" opacity="0.3" />
		<line x1="62" y1="30" x2="58" y2="78" opacity="0.3" />
		<path d="M46 14 L46 6 M54 14 L54 6" />
	{:else if name === 'knife'}
		<path d="M14 82 L64 32 C 70 26, 80 26, 86 32 C 92 38, 92 48, 86 54 L36 84Z" />
		<line x1="14" y1="82" x2="8" y2="90" />
		<line x1="30" y1="70" x2="66" y2="34" opacity="0.4" />
	{:else if name === 'pan'}
		<circle cx="42" cy="56" r="26" />
		<line x1="68" y1="56" x2="94" y2="46" />
		<path d="M30 56 A12 12 0 0 0 54 56" opacity="0.4" />
	{:else if name === 'pot'}
		<path d="M20 44 L80 44 L76 82 A6 6 0 0 1 70 88 L30 88 A6 6 0 0 1 24 82 Z" />
		<line x1="14" y1="44" x2="86" y2="44" stroke-width="3" />
		<path d="M14 38 C 14 32, 24 32, 24 38" />
		<path d="M76 38 C 76 32, 86 32, 86 38" />
	{:else if name === 'herbs'}
		<line x1="50" y1="90" x2="50" y2="40" />
		<path d="M50 60 C 40 54, 34 44, 36 32" />
		<path d="M50 50 C 60 44, 66 34, 64 22" />
		<path d="M50 70 C 42 66, 38 58, 40 50" />
		<path d="M50 40 C 58 36, 62 28, 60 18" />
		<path d="M30 88 L70 88" opacity="0.4" />
	{:else if name === 'bread'}
		<path d="M14 60 C 14 40, 30 26, 50 26 C 70 26, 86 40, 86 60 C 86 70, 78 76, 68 76 L32 76 C 22 76, 14 70, 14 60Z" />
		<path d="M32 40 C 34 48, 34 56, 30 62" opacity="0.5" />
		<path d="M50 36 C 52 44, 52 54, 48 62" opacity="0.5" />
		<path d="M68 40 C 70 48, 70 56, 66 62" opacity="0.5" />
	{:else if name === 'lemon'}
		<ellipse cx="50" cy="52" rx="30" ry="24" />
		<path d="M78 46 C 84 44, 90 46, 90 52 C 90 58, 84 58, 80 56" />
		<path d="M40 44 C 46 40, 54 40, 60 44 M38 52 L62 52 M40 60 C 46 64, 54 64, 60 60" opacity="0.4" />
	{:else if name === 'egg'}
		<path d="M50 14 C 34 34, 24 54, 24 68 C 24 82, 36 90, 50 90 C 64 90, 76 82, 76 68 C 76 54, 66 34, 50 14Z" />
		<circle cx="50" cy="66" r="12" opacity="0.5" />
	{/if}
</svg>
