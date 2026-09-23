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

	function wait(ms: number, signal: AbortSignal) {
		return new Promise<void>((resolve, reject) => {
			const timer = setTimeout(resolve, ms);
			signal.addEventListener('abort', () => {
				clearTimeout(timer);
				reject(new DOMException('Aborted', 'AbortError'));
			});
		});
	}

	async function fetchSuggestions(query: string, signal: AbortSignal): Promise<string[]> {
		// Simulate network delay
		await wait(300, signal);
		return fruits.filter((f) => f.toLowerCase().includes(query.toLowerCase()));
	}

	async function failingFetch(_query: string, signal: AbortSignal): Promise<string[]> {
		await wait(300, signal);
		throw new Error('Service unavailable');
	}

	let val = $state('');
	let lastEvent = $state('none yet');
	const searchInputExample = `<CwSearchInput
\tlabel="Search fruits"
\tplaceholder="Type at least 3 chars…"
\tfetchSuggestions={fetchSuggestions}
\tbind:value={value}
/>`;
</script>

<h2>CwSearchInput</h2>
<p class="demo-desc">
	Debounced async search with request cancellation, combobox keyboard navigation (arrows, Enter,
	Escape), and built-in loading, no-results and error states.
</p>

<section class="demo-section">
	<h3>Basic</h3>
	<div class="demo-field">
		<CwSearchInput
			label="Search fruits"
			placeholder="Type at least 3 chars…"
			hint="Try “berry”, or “xyz” to see the no-results state."
			bind:value={val}
			{fetchSuggestions}
			mapSuggestionToLabel={(f) => String(f)}
			mapSuggestionToValue={(f) => String(f)}
			onselect={(v) => (lastEvent = `selected ${String(v)}`)}
		/>
	</div>
	<p class="demo-event" aria-live="polite">Last event: {lastEvent}</p>
</section>

<DemoCodeExample code={searchInputExample} title="CwSearchInput example" />

<section class="demo-section">
	<h3>Sizes</h3>
	<div class="demo-grid">
		<CwSearchInput label="Small" size="sm" placeholder="Search…" {fetchSuggestions} />
		<CwSearchInput label="Medium" size="md" placeholder="Search…" {fetchSuggestions} />
		<CwSearchInput label="Large" size="lg" placeholder="Search…" {fetchSuggestions} />
	</div>
</section>

<section class="demo-section">
	<h3>States</h3>
	<div class="demo-grid">
		<CwSearchInput
			label="Fetch error"
			placeholder="Type 3+ chars to trigger an error"
			hint="The request always fails in this example."
			fetchSuggestions={failingFetch}
		/>
		<CwSearchInput
			label="Required with error"
			placeholder="Search…"
			required
			error="Pick a fruit to continue"
			{fetchSuggestions}
		/>
		<CwSearchInput label="Disabled" placeholder="Search…" disabled {fetchSuggestions} />
	</div>
</section>

<style>
	.demo-field {
		max-width: 24rem;
	}
</style>
