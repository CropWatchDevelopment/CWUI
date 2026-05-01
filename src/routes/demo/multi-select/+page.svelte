<script lang="ts">
	import { CwMultiSelect } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const options = [
		{ label: 'Apple', value: 'apple' },
		{ label: 'Banana', value: 'banana' },
		{ label: 'Cherry', value: 'cherry' },
		{ label: 'Disabled Item', value: 'none', disabled: true },
		{ label: 'Dragonfruit', value: 'dragonfruit' },
		{ label: 'Elderberry', value: 'elderberry' },
		{ label: 'Fig', value: 'fig' },
		{ label: 'Grape', value: 'grape' }
	];

	let val1 = $state<{ id: string; label: string }[]>([]);
	let val2 = $state<{ id: string; label: string }[]>([
		{ id: 'banana', label: 'Banana' },
		{ id: 'cherry', label: 'Cherry' }
	]);
	let errVal = $state<{ id: string; label: string }[]>([]);
	let prefilled = $state<{ id: string; label: string }[]>([
		{ id: 'apple', label: 'Apple' },
		{ id: 'banana', label: 'Banana' },
		{ id: 'cherry', label: 'Cherry' },
		{ id: 'dragonfruit', label: 'Dragonfruit' },
		{ id: 'elderberry', label: 'Elderberry' }
	]);

	const multiSelectExample = `<script lang="ts">
\timport { CwMultiSelect } from '@cropwatchdevelopment/cwui';

\tconst options = [
\t\t{ label: 'Apple', value: 'apple' },
\t\t{ label: 'Banana', value: 'banana' },
\t\t{ label: 'Cherry', value: 'cherry' }
\t];

\tlet selected = $state<{ id: string; label: string }[]>([]);
<\/script>

<CwMultiSelect
\toptions={options}
\tlabel="Fruit"
\tplaceholder="Choose one or more…"
\tbind:value={selected}
/>

<!-- selected => [{ id: 'apple', label: 'Apple' }, ...] -->`;
</script>

<h2>CwMultiSelect</h2>
<p class="demo-desc">
	Same look and behavior as <code>CwDropdown</code>, but with multi-selection. The bound value is an array
	of <code>&#123; id, label &#125;</code> entries — easy to send straight to a backend or render as chips.
</p>

<div class="demo-grid">
	<CwMultiSelect {options} label="Default" placeholder="Choose fruits…" bind:value={val1} />
	<CwMultiSelect {options} label="Pre-selected" bind:value={val2} />
	<CwMultiSelect
		{options}
		label="With Error"
		bind:value={errVal}
		error="Pick at least one option"
	/>
	<CwMultiSelect
		{options}
		label="Disabled"
		value={[{ id: 'cherry', label: 'Cherry' }]}
		disabled
	/>
	<CwMultiSelect
		{options}
		label="Overflow chips (maxVisibleChips=2)"
		maxVisibleChips={2}
		bind:value={prefilled}
	/>
	<CwMultiSelect
		{options}
		label="Show all selected items"
		showAllSelectedItems
		bind:value={prefilled}
	/>
	<CwMultiSelect
		{options}
		label="Not clearable"
		clearable={false}
		bind:value={prefilled}
	/>
</div>

<div class="demo-output">
	<h3>Bound value (Default)</h3>
	<pre>{JSON.stringify(val1, null, 2)}</pre>
</div>

<DemoCodeExample code={multiSelectExample} title="CwMultiSelect example" />

<style>
	h2 {
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-bold);
		margin-bottom: var(--cw-space-2);
	}

	.demo-desc {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		margin-bottom: var(--cw-space-4);
	}

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
		gap: var(--cw-space-4);
	}

	.demo-output {
		margin-top: var(--cw-space-4);
		padding: var(--cw-space-3);
		background: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-md);
	}

	.demo-output h3 {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-secondary);
		margin: 0 0 var(--cw-space-2) 0;
	}

	.demo-output pre {
		margin: 0;
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-primary);
	}
</style>
