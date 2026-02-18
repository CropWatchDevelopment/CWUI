<script lang="ts">
	import { CwDonutChart } from '$lib/index.js';
	import type { CwDonutSegment } from '$lib/index.js';

	const segments: CwDonutSegment[] = [
		{ label: 'Wheat', value: 340 },
		{ label: 'Corn', value: 280 },
		{ label: 'Soybeans', value: 190 },
		{ label: 'Cotton', value: 120 },
		{ label: 'Rice', value: 70 }
	];
</script>

<h2>CwDonutChart</h2>
<p class="demo-desc">SVG donut with hover interaction, center label, clickable legend.</p>

<div class="demo-row">
	<div>
		<h3>Default (200px)</h3>
		<CwDonutChart {segments} />
	</div>
	<div>
		<h3>Larger + Thinner</h3>
		<CwDonutChart {segments} size={280} thickness={30} />
	</div>
	<div>
		<h3>No Legend</h3>
		<CwDonutChart {segments} showLegend={false} size={160} />
	</div>
</div>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-row { display: flex; flex-wrap: wrap; gap: var(--cw-space-8); align-items: flex-start; }
</style>
