<script lang="ts">
	import { CwDropdown } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const options = [
		{ label: 'North field', value: 'north' },
		{ label: 'South field', value: 'south' },
		{ label: 'Greenhouse 1', value: 'gh1' },
		{ label: 'Greenhouse 2 (decommissioned)', value: 'gh2', disabled: true },
		{ label: 'Orchard', value: 'orchard' },
		{ label: 'Packing shed', value: 'shed' }
	];

	const sizes = ['sm', 'md', 'lg'] as const;

	let site = $state('');
	let preselected = $state('south');
	let requiredSite = $state('');
	let lastEvent = $state('none yet');

	const requiredError = $derived(requiredSite ? undefined : 'Choose a site to continue');

	const dropdownExample = `<CwDropdown
\t{options}
\tlabel="Site"
\thint="Readings are filtered to this site"
\trequired
\terror={site ? undefined : 'Choose a site to continue'}
\tbind:value={site}
/>`;
</script>

<h2>CwDropdown</h2>
<p class="demo-desc">
	A custom select using the ARIA combobox pattern. Focus stays on the trigger while arrow keys, Home,
	End and typeahead move through options; disabled options are skipped.
</p>

<section class="demo-section">
	<h3>Basics</h3>
	<div class="demo-grid">
		<CwDropdown
			{options}
			label="Site"
			placeholder="Choose a site…"
			bind:value={site}
			onchange={(value) => (lastEvent = `Selected "${value}"`)}
		/>
		<CwDropdown {options} label="Pre-selected" bind:value={preselected} />
		<CwDropdown {options} label="With hint" hint="Readings are filtered to this site" />
		<CwDropdown {options} label="Disabled" value="orchard" disabled />
	</div>
	<p class="demo-event" aria-live="polite">Last event: {lastEvent}</p>
</section>

<section class="demo-section">
	<h3>Validation</h3>
	<div class="demo-grid">
		<CwDropdown
			{options}
			label="Required site"
			required
			error={requiredError}
			bind:value={requiredSite}
		/>
		<CwDropdown options={[]} label="Empty list" placeholder="No sites yet" />
	</div>
	<p class="demo-hint">The required marker is visual; the control also sets <code>aria-required</code>.</p>
</section>

<section class="demo-section">
	<h3>Sizes</h3>
	<div class="demo-grid">
		{#each sizes as size (size)}
			<CwDropdown {options} {size} label={`Size ${size}`} placeholder="Choose a site…" />
		{/each}
	</div>
	<DemoCodeExample code={dropdownExample} title="CwDropdown example" />
</section>

<style>
	code {
		font-family: var(--cw-font-mono);
		font-size: 0.9em;
	}
</style>
