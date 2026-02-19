<script lang="ts">
	import { CwSearchInput } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const fruits = [
		'Apple', 'Apricot', 'Avocado', 'Banana', 'Blackberry', 'Blueberry',
		'Cherry', 'Coconut', 'Cranberry', 'Date', 'Dragonfruit', 'Elderberry',
		'Fig', 'Grape', 'Grapefruit', 'Guava', 'Kiwi', 'Lemon', 'Lime',
		'Mango', 'Melon', 'Nectarine', 'Orange', 'Papaya', 'Peach', 'Pear',
		'Pineapple', 'Plum', 'Pomegranate', 'Raspberry', 'Strawberry', 'Watermelon'
	];

	async function fetchSuggestions(query: string, signal: AbortSignal): Promise<string[]> {
		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 300));
		if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
		return fruits.filter((f) => f.toLowerCase().includes(query.toLowerCase()));
	}

	let val = $state('');
	const searchInputExample = `<CwSearchInput
\tlabel="Search fruits"
\tplaceholder="Type at least 3 chars…"
\tfetchSuggestions={fetchSuggestions}
\tbind:value={value}
/>`;
</script>

<h2>CwSearchInput</h2>
<p class="demo-desc">Debounced async search with AbortController, arrow-key navigation.</p>

<div style="max-width: 24rem;">
	<CwSearchInput
		label="Search fruits"
		placeholder="Type at least 3 chars…"
		bind:value={val}
		{fetchSuggestions}
		mapSuggestionToLabel={(f) => String(f)}
		mapSuggestionToValue={(f) => String(f)}
		onselect={(v) => console.log('Selected:', v)}
	/>
</div>

<DemoCodeExample code={searchInputExample} title="CwSearchInput example" />

{#if val}
	<p class="demo-selected">Selected: <strong>{val}</strong></p>
{/if}

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-selected { margin-top: var(--cw-space-3); font-size: var(--cw-text-sm); color: var(--cw-text-secondary); }
</style>
