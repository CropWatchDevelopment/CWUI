<script lang="ts">
	import { CwButton, CwCopy, CwDropdown } from '$lib/index.js';
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

	// Enough devices that scrolling for one is slower than typing part of its name.
	const devices = [
		{ label: 'Greenhouse 1 — Air (A840410000000001)', value: 'A840410000000001' },
		{ label: 'Greenhouse 1 — Soil (A840410000000002)', value: 'A840410000000002' },
		{ label: 'Greenhouse 2 — Air (A840410000000003)', value: 'A840410000000003' },
		{ label: 'Greenhouse 2 — Soil (A840410000000004)', value: 'A840410000000004' },
		{ label: 'North field — Weather (2CF7F1C0610000A1)', value: '2CF7F1C0610000A1' },
		{ label: 'South field — Weather (2CF7F1C0610000A2)', value: '2CF7F1C0610000A2' },
		{ label: 'Packing shed — Cold room (0025CA0000005601)', value: '0025CA0000005601' },
		{ label: 'Packing shed — Freezer (0025CA0000005602)', value: '0025CA0000005602' },
		{ label: 'Pump house — Relay (A8404194630000F1)', value: 'A8404194630000F1' },
		{ label: 'Pump house — Flow (A8404194630000F2)', value: 'A8404194630000F2', disabled: true },
		{ label: '冷凍庫センサー A1 (0025CA0000005611)', value: '0025CA0000005611' },
		{ label: '冷蔵庫センサー B2 (0025CA0000005612)', value: '0025CA0000005612' },
		{ label: 'ハウス３号 温湿度 (A840410000000021)', value: 'A840410000000021' }
	];

	let site = $state('');
	let preselected = $state('south');
	let requiredSite = $state('');
	let lastEvent = $state('none yet');
	let device = $state('');
	let smallDevice = $state('');
	let relay = $state('A8404194630000F1');
	let copyDevice = $state('0025CA0000005601');
	let lastAction = $state('none yet');

	const requiredError = $derived(requiredSite ? undefined : 'Choose a site to continue');

	const dropdownExample = `<CwDropdown
\t{options}
\tlabel="Site"
\thint="Readings are filtered to this site"
\trequired
\terror={site ? undefined : 'Choose a site to continue'}
\tbind:value={site}
/>`;

	const searchExample = `<CwDropdown
	{options}
	label="Device"
	searchable
	searchPlaceholder="Search devices…"
	noResultsLabel="No device matches"
	bind:value={device}
/>`;

	const actionsExample = `<!-- Icon buttons: a label (also the tooltip), an icon and what to do. -->
<CwDropdown
	{options}
	label="Relay"
	bind:value={relay}
	actions={[
		{ label: 'Edit relay', icon: editIcon, onclick: () => edit(relay) },
		{ label: 'Remove relay', icon: trashIcon, onclick: () => remove(relay) }
	]}
/>

<!-- Or any components: they sit just left of the arrow. -->
<CwDropdown {options} label="Device" bind:value={device}>
	{#snippet rightSlot()}
		<CwCopy value={device} size="sm" />
		<CwButton variant="secondary" size="sm" onclick={() => open(device)}>Open</CwButton>
	{/snippet}
</CwDropdown>

{#snippet editIcon()}
	<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor">…</svg>
{/snippet}`;
</script>

<!-- Inline SVG follows the theme's text colour; an image file would not. -->
{#snippet editIcon()}
	<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
		<path d="M11 2.5l2.5 2.5L5.5 13H3v-2.5L11 2.5z" />
	</svg>
{/snippet}

{#snippet trashIcon()}
	<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
		<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5M6.75 7v4M9.25 7v4" />
	</svg>
{/snippet}

<h2>CwDropdown</h2>
<p class="demo-desc">
	A custom select using the ARIA combobox pattern. Focus stays on the trigger while arrow keys, Home,
	End and typeahead move through options; disabled options are skipped. It can carry a search field
	for long lists, and buttons or other components inside its box.
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
	<h3>Search</h3>
	<div class="demo-grid">
		<CwDropdown
			options={devices}
			label="Device"
			placeholder="Choose a device…"
			hint="Type part of a name or id. Arrow keys and Enter choose, Escape closes."
			searchable
			searchPlaceholder="Search devices…"
			noResultsLabel="No device matches"
			bind:value={device}
		/>
		<CwDropdown
			options={devices}
			size="sm"
			label="Small, with search"
			placeholder="Choose a device…"
			searchable
			bind:value={smallDevice}
		/>
	</div>
	<p class="demo-hint">
		The search ignores case, and finds Japanese typed in half-width or full-width characters. You can
		also start typing while the closed field has focus.
	</p>
	<DemoCodeExample code={searchExample} title="Searchable dropdown" />
</section>

<section class="demo-section">
	<h3>Actions inside the box</h3>
	<div class="demo-grid">
		<CwDropdown
			options={devices}
			label="Relay (action buttons)"
			searchable
			bind:value={relay}
			actions={[
				{ label: 'Edit relay', icon: editIcon, onclick: () => (lastAction = `Edit ${relay}`) },
				{ label: 'Remove relay', icon: trashIcon, onclick: () => (lastAction = `Remove ${relay}`) }
			]}
		/>
		<CwDropdown options={devices} label="Device (any components)" bind:value={copyDevice}>
			{#snippet rightSlot()}
				<CwCopy value={copyDevice} size="sm" onCopy={(value) => (lastAction = `Copied ${value}`)} />
				<CwButton variant="secondary" size="sm" onclick={() => (lastAction = `Open ${copyDevice}`)}>
					Open
				</CwButton>
			{/snippet}
		</CwDropdown>
		<CwDropdown
			options={devices}
			label="Disabled action"
			value="A840410000000001"
			actions={[{ label: 'Edit device', icon: editIcon, disabled: true, onclick: () => {} }]}
		/>
		{#each sizes as size (size)}
			<CwDropdown
				options={devices}
				{size}
				label={`Size ${size}, with actions`}
				value="A840410000000001"
				actions={[
					{ label: 'Edit device', icon: editIcon, onclick: () => (lastAction = `Edit (${size})`) },
					{ label: 'Remove device', icon: trashIcon, onclick: () => (lastAction = `Remove (${size})`) }
				]}
			/>
		{/each}
	</div>
	<p class="demo-event" aria-live="polite">Last action: {lastAction}</p>
	<p class="demo-hint">
		The actions sit just left of the arrow. Pressing one never opens the list, and Tab reaches them
		after the field.
	</p>
	<DemoCodeExample code={actionsExample} title="Actions and other components in the box" />
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
