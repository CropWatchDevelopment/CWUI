<script lang="ts">
	import { CwChip } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const tones = ['primary', 'secondary', 'info', 'warning', 'danger', 'success'] as const;
	const variants = ['solid', 'soft', 'outline'] as const;
	const variantTitles = { solid: 'Solid', soft: 'Soft', outline: 'Outline' } as const;

	let filters = $state(['North field', 'Temperature', 'Last 24 hours', 'Online only']);
	let lastEvent = $state('none yet');

	function dismiss(filter: string) {
		filters = filters.filter((item) => item !== filter);
		lastEvent = `Removed filter "${filter}"`;
	}

	const chipExample = `<CwChip tone="success" variant="soft" label="Online" />

<CwChip
\tlabel="North field"
\tdismissible
\tdismissLabel="Remove filter: North field"
\tondismiss={() => removeFilter('north')}
/>`;
</script>

<h2>CwChip</h2>
<p class="demo-desc">
	Compact labels for status, tags and active filters. Every tone comes in solid, soft and outline
	variants, and all variants share the same height.
</p>

{#each variants as variant (variant)}
	<section class="demo-section">
		<h3>{variantTitles[variant]}</h3>
		<div class="demo-row">
			{#each tones as tone (tone)}
				<CwChip {tone} {variant} label={tone} />
			{/each}
		</div>
	</section>
{/each}

<section class="demo-section">
	<h3>Dismissible filters</h3>
	<div class="demo-row">
		{#each filters as filter (filter)}
			<CwChip
				tone="info"
				variant="soft"
				label={filter}
				dismissible
				dismissLabel={`Remove filter: ${filter}`}
				ondismiss={() => dismiss(filter)}
			/>
		{:else}
			<span class="demo-hint">All filters removed.</span>
		{/each}
	</div>
	<p class="demo-event" aria-live="polite">Last event: {lastEvent}</p>
</section>

<section class="demo-section">
	<h3>Disabled</h3>
	<div class="demo-row">
		<CwChip tone="primary" label="Disabled" disabled />
		<CwChip tone="success" variant="outline" label="Disabled outline" disabled />
		<CwChip tone="danger" label="Disabled dismissible" dismissible disabled />
	</div>
</section>

<section class="demo-section">
	<h3>Sizes</h3>
	<div class="demo-row">
		<CwChip tone="primary" label="Small" size="sm" />
		<CwChip tone="primary" label="Medium" size="md" />
		<CwChip tone="primary" label="Large" size="lg" />
	</div>
	<DemoCodeExample code={chipExample} title="CwChip example" />
</section>
