<script lang="ts">
	import { CwHeatmap, CwSwitch } from '$lib/index.js';
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

	let clicked = $state<string>('none yet');
	let loading = $state(true);

	const heatmapExample = `<CwHeatmap
\tdata={weekData}
\tunit="°C"
\ttitle="Field temperature, last 7 days"
/>

<!-- Cells become buttons only when onCellClick is set -->
<CwHeatmap data={weekData} onCellClick={(cell) => openHour(cell)} />`;
</script>

<h2>CwHeatmap</h2>
<p class="demo-desc">
	A 24-hour × N-day grid with colour-coded cells, a legend and tooltips. Readings in the same hour are
	averaged, days without data stay in the grid, and hours follow the <code>locale</code>.
</p>

<section class="demo-section">
	<h3>Read-only (default)</h3>
	<CwHeatmap data={weekData} unit="°C" title="Field temperature, last 7 days" />
	<p class="demo-hint">
		Without <code>onCellClick</code> the grid is a single image with a text summary for screen readers.
	</p>
	<DemoCodeExample code={heatmapExample} title="CwHeatmap example" />
</section>

<section class="demo-section">
	<h3>Interactive cells</h3>
	<CwHeatmap
		data={weekData}
		unit="°C"
		title="Click or tab to a cell"
		onCellClick={(p) =>
			(clicked = `${p.date} ${String(p.hour).padStart(2, '0')}:00 → ${
				p.value !== null ? p.value.toFixed(1) + '°C' : 'no data'
			}`)}
	/>
	<p class="demo-event" aria-live="polite">Last event: {clicked}</p>
</section>

<section class="demo-section">
	<h3>14 days, custom colours</h3>
	<CwHeatmap
		data={twoWeekData}
		days={14}
		unit="°C"
		title="Soil temperature, last 14 days"
		colors={['var(--cw-info-500)', 'var(--cw-success-400)', 'var(--cw-warning-500)']}
		rowHeight={20}
	/>
	<p class="demo-hint"><code>colors</code> accepts any CSS colour, including <code>var(--token)</code>.</p>
</section>

<section class="demo-section">
	<h3>Fahrenheit scale, fixed range</h3>
	<CwHeatmap
		data={weekData.map((p) => ({ ...p, value: Math.round(((p.value * 9) / 5 + 32) * 10) / 10 }))}
		unit="°F"
		min={50}
		max={90}
		title="Temperature (°F), fixed 50–90 range"
	/>
</section>

<section class="demo-section">
	<h3>Loading and no data</h3>
	<div class="demo-row demo-toggle-row">
		<CwSwitch bind:checked={loading} label="Loading" />
	</div>
	<div class="demo-stack">
		<CwHeatmap data={weekData} unit="°C" title="Loading" {loading} />
		<CwHeatmap data={[]} unit="°C" title="No readings yet" />
	</div>
</section>

<style>
	.demo-toggle-row {
		margin-bottom: var(--cw-space-4);
	}

	code {
		font-family: var(--cw-font-mono);
		font-size: 0.9em;
	}
</style>
