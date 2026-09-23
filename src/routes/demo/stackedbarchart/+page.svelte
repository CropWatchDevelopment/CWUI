<script lang="ts">
	import { onMount } from 'svelte';
	import { CwButton, CwStackedBarChart, CwSwitch } from '$lib/index.js';
	import type { CwStackedBarBucket, CwStackedBarCategory } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const categories: CwStackedBarCategory[] = [
		{ id: 'car', label: 'Cars' },
		{ id: 'truck', label: 'Trucks' },
		{ id: 'bike', label: 'Bicycles' },
		{ id: 'pedestrian', label: 'Pedestrians' }
	];

	const hours = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

	function seededValue(seed: number, max: number) {
		const x = Math.sin(seed * 9301 + 49297) * 233280;
		return Math.round((x - Math.floor(x)) * max);
	}

	const buckets: CwStackedBarBucket[] = hours.map((label, index) => ({
		key: `2026-09-23T${label}:00`,
		label,
		values: {
			car: 20 + seededValue(index + 1, 60),
			truck: 4 + seededValue(index + 11, 14),
			bike: seededValue(index + 21, 22),
			pedestrian: 5 + seededValue(index + 31, 30)
		}
	}));

	const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
	const formatVehicles = (value: number) => `${numberFormat.format(value)} counted`;

	let loading = $state(true);
	let showLegend = $state(true);

	function reload() {
		loading = true;
		setTimeout(() => (loading = false), 1500);
	}

	// Simulate the first fetch so the skeleton is visible on page load.
	onMount(() => {
		const timer = setTimeout(() => (loading = false), 1200);
		return () => clearTimeout(timer);
	});

	const basicExample = `<script lang="ts">
	import { CwStackedBarChart } from '@cropwatchdevelopment/cwui';
	import type { CwStackedBarBucket, CwStackedBarCategory } from '@cropwatchdevelopment/cwui';

	const categories: CwStackedBarCategory[] = [
		{ id: 'car', label: 'Cars' },
		{ id: 'truck', label: 'Trucks' }
	];

	const buckets: CwStackedBarBucket[] = [
		{ key: '2026-09-23T06:00', label: '06:00', values: { car: 42, truck: 9 } },
		{ key: '2026-09-23T07:00', label: '07:00', values: { car: 58, truck: 12 } }
	];
</${'script'}>

<CwStackedBarChart {categories} {buckets} height={280} />`;

	const statesExample = `<!-- Skeleton bars while data loads -->
<CwStackedBarChart {categories} {buckets} loading={isLoading} />

<!-- Empty buckets show the shared no-data overlay automatically -->
<CwStackedBarChart {categories} buckets={[]} />

<!-- Custom message -->
<CwStackedBarChart {categories} buckets={[]} noData="No traffic recorded today" />`;
</script>

<h2>Stacked Bar Chart</h2>
<p class="demo-desc">
	<code>CwStackedBarChart</code> compares how several categories add up over time, such as traffic
	counts per hour. Colours come from the shared <code>--cw-chart-cat-*</code> palette and follow the
	document theme, the legend toggles series, and bars, ticks and tooltips format values with your
	<code>formatValue</code> function.
</p>

<section class="demo-section">
	<h3>Basic usage</h3>
	<div class="demo-panel">
		<CwStackedBarChart {categories} {buckets} height={300} {showLegend} />
	</div>
	<div class="demo-row demo-controls">
		<CwSwitch bind:checked={showLegend} label="Show legend" />
	</div>
	<p class="demo-hint">
		Click a legend item to hide a series. The last visible series can't be hidden. Switch the theme
		in the header to see the palette follow it.
	</p>
	<DemoCodeExample code={basicExample} title="CwStackedBarChart example" />
</section>

<section class="demo-section">
	<h3>Hidden series and value formatting</h3>
	<p class="demo-hint">
		<code>initialHidden</code> starts with Bicycles and Pedestrians switched off, and
		<code>formatValue</code> adds a unit to ticks and tooltips.
	</p>
	<div class="demo-panel">
		<CwStackedBarChart
			{categories}
			{buckets}
			height={260}
			initialHidden={['bike', 'pedestrian']}
			formatValue={formatVehicles}
			labels={{ ariaLabel: 'Vehicles counted per hour', total: 'All vehicles' }}
		/>
	</div>
</section>

<section class="demo-section">
	<h3>Loading and no data</h3>
	<div class="demo-grid">
		<div class="demo-panel">
			<span class="demo-label">Loading</span>
			<CwStackedBarChart {categories} {buckets} height={220} {loading} />
			<div class="demo-row demo-controls">
				<CwButton size="sm" variant="secondary" onclick={reload} disabled={loading}>
					Reload data
				</CwButton>
			</div>
		</div>
		<div class="demo-panel">
			<span class="demo-label">No buckets</span>
			<CwStackedBarChart {categories} buckets={[]} height={220} />
		</div>
		<div class="demo-panel">
			<span class="demo-label">Custom message</span>
			<CwStackedBarChart
				{categories}
				buckets={[]}
				height={220}
				noData="No traffic recorded today"
			/>
		</div>
	</div>
	<DemoCodeExample code={statesExample} title="Loading and empty states" />
</section>

<style>
	.demo-controls {
		margin-top: var(--cw-space-3);
	}

	code {
		font-family: var(--cw-font-mono);
		font-size: 0.9em;
	}
</style>
