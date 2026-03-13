<script lang="ts">
	import { CwStatCard } from '$lib/index.js';
	import type { CwStatCardData } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const temperatureStats: CwStatCardData = {
		min: 18.2,
		max: 32.7,
		avg: 24.5,
		median: 24.1,
		stdDev: 3.2,
		count: 288,
		lastReading: 25.3,
		trend: 'up'
	};

	const humidityStats: CwStatCardData = {
		min: 35,
		max: 92,
		avg: 68.4,
		median: 70,
		stdDev: 12.1,
		count: 288,
		lastReading: 72,
		trend: 'stable'
	};

	const co2Stats: CwStatCardData = {
		min: 380,
		max: 1200,
		avg: 620,
		median: 580,
		stdDev: 180,
		count: 288,
		lastReading: 450,
		trend: 'down'
	};

	const lightStats: CwStatCardData = {
		min: 0,
		max: 850,
		avg: 420,
		count: 288,
		lastReading: 620,
		trend: 'up'
	};

	const minimalStats: CwStatCardData = {
		min: 10,
		max: 50,
		avg: 30
	};

	const basicExample = `<script lang="ts">
\timport { CwStatCard } from '@cropwatchdevelopment/cwui';
\timport type { CwStatCardData } from '@cropwatchdevelopment/cwui';

\tconst stats: CwStatCardData = {
\t\tmin: 18.2,
\t\tmax: 32.7,
\t\tavg: 24.5,
\t\tmedian: 24.1,
\t\tstdDev: 3.2,
\t\tcount: 288,
\t\tlastReading: 25.3,
\t\ttrend: 'up'
\t};
<\/script>

<CwStatCard title="Temperature" stats={stats} unit="°C" />`;

	const customColorExample = `<CwStatCard
\ttitle="Humidity"
\tstats={humidityStats}
\tunit="%"
\taccentColor="var(--cw-info-500)"
/>`;

	const nonExpandableExample = `<CwStatCard
\ttitle="Light Intensity"
\tstats={lightStats}
\tunit="lux"
\texpandable={false}
/>`;
</script>

<h2>CwStatCard</h2>
<p class="demo-desc">
	Displays statistical summaries (min / avg / max) with a visual range bar, trend indicator, and expandable details.
</p>

<h3>Default (expandable)</h3>
<div class="demo-grid">
	<CwStatCard title="Temperature" stats={temperatureStats} unit="°C" />
	<CwStatCard title="Humidity" stats={humidityStats} unit="%" accentColor="var(--cw-info-500)" />
	<CwStatCard title="CO₂" stats={co2Stats} unit="ppm" accentColor="var(--cw-warning-500)" />
</div>

<h3>Custom accent colour</h3>
<div class="demo-grid">
	<CwStatCard title="Light Intensity" stats={lightStats} unit="lux" accentColor="var(--cw-warning-600)" />
	<CwStatCard title="Soil Moisture" stats={humidityStats} unit="%" accentColor="var(--cw-success-500)" />
	<CwStatCard title="VPD" stats={temperatureStats} unit="kPa" accentColor="var(--cw-danger-500)" />
</div>

<h3>Non-expandable</h3>
<div class="demo-grid">
	<CwStatCard title="Quick Glance" stats={minimalStats} unit="%" expandable={false} />
	<CwStatCard title="CO₂ Summary" stats={co2Stats} unit="ppm" expandable={false} accentColor="var(--cw-warning-500)" />
</div>

<h3>Trend indicators</h3>
<div class="demo-grid">
	<CwStatCard title="Rising" stats={{ ...minimalStats, lastReading: 45, trend: 'up' }} unit="°C" />
	<CwStatCard title="Falling" stats={{ ...minimalStats, lastReading: 15, trend: 'down' }} unit="°C" accentColor="var(--cw-danger-500)" />
	<CwStatCard title="Stable" stats={{ ...minimalStats, lastReading: 30, trend: 'stable' }} unit="°C" accentColor="var(--cw-info-500)" />
</div>

<DemoCodeExample code={basicExample} title="Basic usage" />
<DemoCodeExample code={customColorExample} title="Custom accent colour" />
<DemoCodeExample code={nonExpandableExample} title="Non-expandable" />

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); color: var(--cw-text-secondary); margin: var(--cw-space-6) 0 var(--cw-space-3); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); gap: var(--cw-space-4); }
</style>
