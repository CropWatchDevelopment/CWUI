<script lang="ts">
	import { CwLineChart } from '$lib/index.js';
	import type { CwLineSeries } from '$lib/index.js';

	const days = Array.from({ length: 30 }, (_, i) => i + 1);

	const series: CwLineSeries[] = [
		{
			label: 'Temperature (°C)',
			data: days.map((d) => ({ x: d, y: 15 + Math.sin(d / 5) * 8 + Math.random() * 2 }))
		},
		{
			label: 'Humidity (%)',
			data: days.map((d) => ({ x: d, y: 40 + Math.cos(d / 7) * 20 + Math.random() * 5 }))
		},
		{
			label: 'Soil Moisture (%)',
			data: days.map((d) => ({ x: d, y: 30 + Math.sin(d / 10) * 15 + Math.random() * 3 }))
		}
	];
</script>

<h2>CwLineChart</h2>
<p class="demo-desc">Multi-line SVG chart with gradient fills, interactive legend, and tooltips.</p>

<section class="demo-section">
	<h3>Default</h3>
	<CwLineChart {series} />
</section>

<section class="demo-section">
	<h3>With Gradient + Custom Height</h3>
	<CwLineChart {series} showGradient height={400} />
</section>

<section class="demo-section">
	<h3>No Legend</h3>
	<CwLineChart series={[series[0]]} showLegend={false} height={200} />
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-section { margin-bottom: var(--cw-space-6); }
</style>
