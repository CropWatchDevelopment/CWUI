<script lang="ts">
	import { CwButton, CwDropdown, CwInput } from '$lib/index.js';
	import moreVertIcon from '$lib/icons/more_vert.svg';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const sizes = ['sm', 'md', 'lg'] as const;
	const siteOptions = [
		{ value: 'north', label: 'North field' },
		{ value: 'south', label: 'South field' }
	];

	let saving = $state(false);
	let lastEvent = $state('none yet');

	function simulateSave() {
		saving = true;
		lastEvent = 'Saving…';
		setTimeout(() => {
			saving = false;
			lastEvent = 'Saved';
		}, 1500);
	}

	const buttonExample = `<CwButton variant="primary">Save changes</CwButton>

<!-- Buttons default to type="button"; opt in to form submission explicitly -->
<CwButton type="submit" variant="primary">Submit</CwButton>`;
	const iconButtonExample = `<script lang="ts">
	import moreVertIcon from '$lib/icons/more_vert.svg';
<\/script>

<CwButton variant="secondary" aria-label="Refresh data">
	<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path
			d="M12.8 7.9A4.8 4.8 0 118 3.2c1.3 0 2.5.5 3.4 1.4"
			stroke="currentColor"
			stroke-width="1.4"
			stroke-linecap="round"
		/>
		<path
			d="M11.7 3.2h2.4v2.4"
			stroke="currentColor"
			stroke-width="1.4"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
</CwButton>

<CwButton variant="primary" aria-label="More actions" icon={moreVertIcon} />
<CwButton variant="primary" icon={moreVertIcon}>More</CwButton>`;
</script>

<h2>CwButton</h2>
<p class="demo-desc">
	Every variant, size and state. Buttons share the same height scale as inputs and dropdowns, so
	controls of the same <code>size</code> line up in a toolbar. Buttons default to
	<code>type="button"</code>; pass <code>type="submit"</code> to submit a form.
</p>

<section class="demo-section">
	<h3>Variants</h3>
	<div class="demo-row">
		<CwButton variant="primary">Primary</CwButton>
		<CwButton variant="secondary">Secondary</CwButton>
		<CwButton variant="ghost">Ghost</CwButton>
		<CwButton variant="danger">Danger</CwButton>
		<CwButton variant="info">Info</CwButton>
	</div>
</section>

<section class="demo-section">
	<h3>Sizes</h3>
	<div class="demo-row">
		<CwButton size="sm">Small</CwButton>
		<CwButton size="md">Medium</CwButton>
		<CwButton size="lg">Large</CwButton>
	</div>
</section>

<section class="demo-section">
	<h3>Alignment with form controls</h3>
	<div class="demo-stack">
		{#each sizes as size (size)}
			<div class="demo-toolbar">
				<div class="demo-toolbar__field">
					<CwInput {size} label="Search ({size})" placeholder="Device name…" />
				</div>
				<div class="demo-toolbar__field">
					<CwDropdown {size} label="Site ({size})" options={siteOptions} placeholder="All sites" />
				</div>
				<CwButton {size} variant="secondary">Reset</CwButton>
				<CwButton {size} variant="primary">Apply</CwButton>
			</div>
		{/each}
	</div>
	<p class="demo-hint">Each row uses one <code>size</code> value; every control in the row is the same height.</p>
</section>

<section class="demo-section">
	<h3>States</h3>
	<div class="demo-row">
		<CwButton>Default</CwButton>
		<CwButton disabled>Disabled</CwButton>
		<CwButton loading>Loading</CwButton>
	</div>
	<div class="demo-row demo-row--spaced">
		<CwButton variant="primary" loading={saving} onclick={simulateSave}>Save changes</CwButton>
		<span class="demo-hint">Click it: the button keeps its width while the spinner shows.</span>
	</div>
	<p class="demo-event" aria-live="polite">Last event: {lastEvent}</p>
	<div class="demo-row demo-row--spaced">
		<CwButton fullWidth>Full width</CwButton>
	</div>
	<DemoCodeExample code={buttonExample} title="CwButton example" />
</section>

<section class="demo-section">
	<h3>Icons</h3>
	<div class="demo-row">
		<CwButton variant="secondary" aria-label="Refresh data">
			<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path
					d="M12.8 7.9A4.8 4.8 0 118 3.2c1.3 0 2.5.5 3.4 1.4"
					stroke="currentColor"
					stroke-width="1.4"
					stroke-linecap="round"
				/>
				<path
					d="M11.7 3.2h2.4v2.4"
					stroke="currentColor"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</CwButton>
		<CwButton variant="primary" aria-label="More actions" icon={moreVertIcon} />
		<CwButton variant="primary" icon={moreVertIcon}>More</CwButton>
	</div>
	<DemoCodeExample code={iconButtonExample} title="CwButton icon examples" />
</section>

<style>
	.demo-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: var(--cw-space-2);
	}

	.demo-toolbar__field {
		flex: 1 1 12rem;
		min-width: 0;
	}

	.demo-row--spaced {
		margin-top: var(--cw-space-3);
	}

	code {
		font-family: var(--cw-font-mono);
		font-size: 0.9em;
	}
</style>
