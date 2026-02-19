<script lang="ts">
	import { CwHeatmap } from '$lib/index.js';
	import type { CwHeatmapDataPoint } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	/* ── Generate fake temperature data for the last 7 days ── */
	function generateData(days: number): CwHeatmapDataPoint[] {
		const pts: CwHeatmapDataPoint[] = [];
		const now = new Date();
		now.setMinutes(0, 0, 0);

		for (let d = days - 1; d >= 0; d--) {
			for (let h = 0; h < 24; h++) {
				const date = new Date(now);
				date.setDate(date.getDate() - d);
				date.setHours(h);

				// Simulate a diurnal curve: warmest at 14:00, coolest at 05:00
				const base = 18 + 8 * Math.sin(((h - 5) / 24) * Math.PI * 2 - Math.PI / 2);
				const noise = (Math.random() - 0.5) * 4;
				// Slight day‑to‑day drift
				const dayDrift = (Math.random() - 0.5) * 2;

				pts.push({ timestamp: date.toISOString(), value: Math.round((base + noise + dayDrift) * 10) / 10 });
			}
		}
		return pts;
	}

	const weekData = generateData(7);
	const twoWeekData = generateData(14);

	let clicked = $state<string>('');
	const heatmapExample = `<CwHeatmap
\tdata={weekData}
\tunit="°C"
\ttitle="Field Temperature – Last 7 Days"
/>`;
</script>

<h2>CwHeatmap</h2>
<p class="demo-desc">24-hour × N-day temperature heatmap with colour-coded cells, legend, and hover tooltips. Defaults to 1 week.</p>

<section class="demo-section">
	<h3>Default (7 days)</h3>
	<CwHeatmap
		data={weekData}
		unit="°C"
		title="Field Temperature – Last 7 Days"
		onCellClick={(p) => (clicked = `${p.date} ${String(p.hour).padStart(2,'0')}:00 → ${p.value !== null ? p.value.toFixed(1) + '°C' : 'no data'}`)}
	/>
	{#if clicked}
		<p class="demo-click">Clicked: <strong>{clicked}</strong></p>
	{/if}
	<DemoCodeExample code={heatmapExample} title="CwHeatmap example" />
</section>

<section class="demo-section">
	<h3>14 days, custom colours</h3>
	<CwHeatmap
		data={twoWeekData}
		days={14}
		unit="°C"
		title="Soil Temperature – Last 14 Days"
		colors={['#06b6d4', '#a3e635', '#f97316']}
		rowHeight={20}
	/>
</section>

<section class="demo-section">
	<h3>Fahrenheit scale, fixed range</h3>
	<CwHeatmap
		data={weekData.map(p => ({ ...p, value: Math.round((p.value * 9/5 + 32) * 10) / 10 }))}
		unit="°F"
		min={50}
		max={90}
		title="Temperature (°F) – Fixed 50–90 Range"
	/>
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-6); }
	.demo-section { margin-bottom: var(--cw-space-8); }
	.demo-click { margin-top: var(--cw-space-2); font-size: var(--cw-text-xs); color: var(--cw-text-muted); }
	.demo-click strong { color: var(--cw-accent); }
</style>
