<script lang="ts">
	import { CwCard, CwButton, CwSeparator, CwSwitch } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let loading = $state(true);

	const cardExample = `<CwCard title="Device summary" subtitle="Greenhouse 7">
\t<p>All systems nominal.</p>
</CwCard>

<!-- Skeleton while data loads; heading level matches the page outline -->
<CwCard title="Device summary" loading={isLoading} headingLevel={2}>
\t<p>…</p>
</CwCard>`;

	const separatorExample = `<CwSeparator />
<CwSeparator inset="var(--cw-space-4)" />
<CwSeparator orientation="vertical" />`;
</script>

<h2>CwCard</h2>
<p class="demo-desc">
	The base surface for grouped content: title, subtitle, header actions, alignment, elevation and a
	loading skeleton. Set <code>headingLevel</code> so the card title fits the page's heading outline.
</p>

<section class="demo-section">
	<h3>Variants</h3>
	<div class="demo-grid">
		<CwCard title="Basic card">
			<p class="demo-card-copy">Simple card with a title and body content.</p>
		</CwCard>

		<CwCard title="With subtitle" subtitle="Extra context goes here">
			<p class="demo-card-copy">Card with title and subtitle rendered in the header.</p>
		</CwCard>

		<CwCard title="Elevated" elevated>
			<p class="demo-card-copy">This card has a raised shadow for emphasis.</p>
		</CwCard>

		<CwCard title="With actions">
			{#snippet actions()}
				<CwButton size="sm" variant="ghost">Edit</CwButton>
				<CwButton size="sm" variant="primary">Save</CwButton>
			{/snippet}
			<p class="demo-card-copy">Actions rendered in the card header row.</p>
		</CwCard>

		<CwCard title="Centered title" titleAlign="center">
			<p class="demo-card-copy">Center-aligned title support.</p>
		</CwCard>

		<CwCard title="Right aligned" titleAlign="right">
			<p class="demo-card-copy">Right-aligned title support.</p>
		</CwCard>

		<CwCard padded={false}>
			<div class="demo-full-bleed">
				<p class="demo-card-copy">No padding variant, useful for full-bleed content.</p>
			</div>
		</CwCard>
	</div>
</section>

<section class="demo-section">
	<h3>Loading and heading level</h3>
	<div class="demo-row demo-toggle-row">
		<CwSwitch bind:checked={loading} label="Loading" />
	</div>
	<div class="demo-grid">
		<CwCard title="Soil moisture" subtitle="North field" {loading}>
			<p class="demo-card-copy">Average 32% across 6 sensors in the last hour.</p>
		</CwCard>
		<CwCard title="Rendered as an h2" subtitle="headingLevel={'{2}'}" headingLevel={2} {loading}>
			<p class="demo-card-copy">Use a level that matches where the card sits in the page outline.</p>
		</CwCard>
	</div>
	<DemoCodeExample code={cardExample} title="CwCard example" />
</section>

<section class="demo-section" id="separator">
	<h3>CwSeparator</h3>
	<p class="demo-hint">
		Horizontal and vertical dividers with <code>role="separator"</code>. Pass <code>decorative</code>
		when the line is purely visual.
	</p>
	<div class="demo-panel demo-separator-stack">
		<p class="demo-card-copy">Section one</p>
		<CwSeparator />
		<p class="demo-card-copy">Section two (inset separator below)</p>
		<CwSeparator inset="var(--cw-space-8)" />
		<p class="demo-card-copy">Section three</p>
	</div>
	<div class="demo-panel demo-separator-inline">
		<span>Temperature</span>
		<CwSeparator orientation="vertical" />
		<span>Humidity</span>
		<CwSeparator orientation="vertical" />
		<span>CO₂</span>
	</div>
	<DemoCodeExample code={separatorExample} title="CwSeparator example" />
</section>

<style>
	.demo-card-copy {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}

	.demo-full-bleed {
		padding: var(--cw-space-4);
	}

	.demo-toggle-row {
		margin-bottom: var(--cw-space-4);
	}

	.demo-separator-stack {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
		margin-top: var(--cw-space-3);
	}

	.demo-separator-inline {
		display: flex;
		align-items: center;
		gap: var(--cw-space-3);
		height: 3.5rem;
		margin-top: var(--cw-space-3);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}

	code {
		font-family: var(--cw-font-mono);
		font-size: 0.9em;
	}
</style>
