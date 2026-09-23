<script lang="ts">
	import { CwDonutChart, CwSwitch } from '$lib/index.js';
	import type { CwDonutSegment } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const segments: CwDonutSegment[] = [
		{ label: 'Wheat', value: 340 },
		{ label: 'Corn', value: 280 },
		{ label: 'Soybeans', value: 190 },
		{ label: 'Cotton', value: 120 },
		{ label: 'Rice', value: 70 }
	];

	let loading = $state(true);

	const donutExample = `<CwDonutChart {segments} size={280} thickness={30} />

<!-- Skeleton ring while loading; the no-data overlay shows automatically
     when segments are empty or add up to 0 -->
<CwDonutChart segments={data} loading={isLoading} />`;
</script>

<h2>CwDonutChart</h2>
<p class="demo-desc">
	SVG donut with hover interaction, a center total and a legend. Segment colours come from the shared
	categorical chart palette, so they match the other charts in both themes.
</p>

<section class="demo-section">
	<h3>Sizes</h3>
	<div class="demo-chart-row">
		<div>
			<span class="demo-label">Default (200px)</span>
			<CwDonutChart {segments} />
		</div>
		<div>
			<span class="demo-label">Larger and thinner</span>
			<CwDonutChart {segments} size={280} thickness={30} />
		</div>
		<div>
			<span class="demo-label">No legend</span>
			<CwDonutChart {segments} showLegend={false} size={160} />
		</div>
	</div>
	<DemoCodeExample code={donutExample} title="CwDonutChart example" />
</section>

<section class="demo-section">
	<h3>Loading and no data</h3>
	<div class="demo-row demo-toggle-row">
		<CwSwitch bind:checked={loading} label="Loading" />
	</div>
	<div class="demo-chart-row">
		<div>
			<span class="demo-label">Loading</span>
			<CwDonutChart {segments} {loading} />
		</div>
		<div>
			<span class="demo-label">Empty segments</span>
			<CwDonutChart segments={[]} />
		</div>
		<div>
			<span class="demo-label">All values zero</span>
			<CwDonutChart segments={segments.map((segment) => ({ ...segment, value: 0 }))} />
		</div>
	</div>
</section>

<style>
	.demo-chart-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-8);
		align-items: flex-start;
	}

	.demo-toggle-row {
		margin-bottom: var(--cw-space-4);
	}
</style>
