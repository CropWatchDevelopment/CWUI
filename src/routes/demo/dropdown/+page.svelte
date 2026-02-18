<script lang="ts">
	import { CwDropdown } from '$lib/index.js';

	const options = [
		{ label: 'Apple', value: 'apple' },
		{ label: 'Banana', value: 'banana' },
		{ label: 'Cherry', value: 'cherry' },
		{ label: 'Disabled Item', value: 'none', disabled: true },
		{ label: 'Dragonfruit', value: 'dragonfruit' },
		{ label: 'Elderberry', value: 'elderberry' }
	];

	let val1 = $state('');
	let val2 = $state('banana');
	let errVal = $state('');
</script>

<h2>CwDropdown</h2>
<p class="demo-desc">Keyboard-navigable custom select with ARIA combobox pattern.</p>

<div class="demo-grid">
	<CwDropdown {options} label="Default" placeholder="Choose a fruit…" bind:value={val1} />
	<CwDropdown {options} label="Pre-selected" bind:value={val2} />
	<CwDropdown {options} label="With Error" bind:value={errVal} error="Selection required" />
	<CwDropdown {options} label="Disabled" value="cherry" disabled />
</div>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: var(--cw-space-4); }
</style>
