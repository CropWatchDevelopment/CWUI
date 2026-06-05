<script lang="ts">
	import { CwResponsiveLineChart, metricColor } from '$lib/index.js';
	import type {
		CwResponsiveLineSeries,
		CwResponsiveLineDataPoint
	} from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	/* ── Synthetic 7-day farm dataset (≈2-min cadence) ──
	   Mirrors the design-handoff data generator: diurnal cycles,
	   irrigation spikes on soil moisture, a deliberate ~3-hour
	   sensor outage on air temperature, and a few z-score anomalies. */
	const HOUR = 3600 * 1000;
	const TAU = Math.PI * 2;
	const clamp = (x: number, lo: number, hi: number) => (x < lo ? lo : x > hi ? hi : x);

	function mulberry32(seed: number) {
		return function () {
			let t = (seed += 0x6d2b79f5);
			t = Math.imul(t ^ (t >>> 15), t | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function makeFarmData(now: number, days = 7, seed = 11) {
		const stepMin = 2;
		const totalMin = days * 24 * 60;
		const n = Math.floor(totalMin / stepMin);
		const start = now - totalMin * 60 * 1000;
		const rand = mulberry32(seed);
		const noise = (amp: number) => (rand() - 0.5) * 2 * amp;

		const airTemp: CwResponsiveLineDataPoint[] = [];
		const soilTemp: CwResponsiveLineDataPoint[] = [];
		const airHumidity: CwResponsiveLineDataPoint[] = [];
		const soilMoisture: CwResponsiveLineDataPoint[] = [];
		const soilEC: CwResponsiveLineDataPoint[] = [];
		const co2: CwResponsiveLineDataPoint[] = [];
		const light: CwResponsiveLineDataPoint[] = [];

		let sm = 36 + rand() * 4;
		let ec = 1.45;

		const irrigations = new Set<number>();
		const events = 3 + Math.floor(rand() * 3);
		for (let k = 0; k < events; k++) irrigations.add(Math.floor(rand() * n));
		const outageStart = Math.floor(n * 0.42);
		const outageEnd = outageStart + Math.floor((3 * HOUR) / (stepMin * 60 * 1000));

		for (let i = 0; i < n; i++) {
			const t = start + i * stepMin * 60 * 1000;
			const d = new Date(t);
			const hour = d.getHours() + d.getMinutes() / 60;
			const dayProg = i / n;
			const dayPhase = Math.sin(((hour - 9) / 24) * TAU);
			const baseT = 16 - dayProg * 3 + Math.sin(dayProg * TAU * 1.3) * 2.4;
			let temp = baseT + dayPhase * 8.5 + noise(0.5);
			if (dayProg > 0.62 && dayProg < 0.72) {
				temp -= 6 + Math.sin((dayProg - 0.62) * 30) * 1.5;
			}
			if (i === Math.floor(n * 0.27)) temp += 7;
			if (i === Math.floor(n * 0.81)) temp -= 6;
			const isGap = i >= outageStart && i <= outageEnd;
			airTemp.push({ t, v: isGap ? null : temp });

			// Soil temperature: lagged, heavily damped vs. air — warmer and far less swing.
			const soilT = baseT + 2.4 + dayPhase * 2.1 + noise(0.2);
			soilTemp.push({ t, v: soilT });

			let h = 72 - (temp - 14) * 1.9 + noise(2.4);
			h = clamp(h, 22, 98);
			airHumidity.push({ t, v: h });

			const photo = Math.max(0, Math.sin(((hour - 6) / 14) * Math.PI));
			light.push({ t, v: Math.max(0, Math.round(photo * 82000 + noise(900) * photo)) });
			let c = 680 - photo * 230 + noise(15);
			if (i === Math.floor(n * 0.55)) c += 380;
			c = clamp(c, 380, 1400);
			co2.push({ t, v: c });

			ec += noise(0.004);
			if (irrigations.has(i)) ec += 0.08;
			ec -= (ec - 1.45) * 0.0006;
			ec = clamp(ec, 0.9, 2.4);
			soilEC.push({ t, v: ec });

			sm -= 0.012 + rand() * 0.006;
			if (irrigations.has(i)) sm = Math.min(48, sm + 7 + rand() * 5);
			sm = clamp(sm, 18, 50);
			soilMoisture.push({ t, v: sm });
		}

		const gapMs = 8 * 60 * 1000;
		// Colors come from the canonical metric→color conventions (metricColor):
		// temperature = value gradient, soil temp = brown, water = blues, CO₂ = purple,
		// light = gold — all tuned to read on both light and dark chart backgrounds.
		const series: CwResponsiveLineSeries[] = [
			{
				id: 'airTemp',
				label: 'Air temperature',
				unit: '°C',
				...metricColor('air_temperature'),
				data: airTemp,
				decimals: 1,
				gapMs,
				thresholds: [{ value: 0, label: 'Frost', color: 'rgba(59,130,246,0.6)' }]
			},
			{
				id: 'soilTemp',
				label: 'Soil temperature',
				unit: '°C',
				...metricColor('soil_temperature'),
				data: soilTemp,
				decimals: 1,
				gapMs
			},
			{
				id: 'airHumidity',
				label: 'Air humidity',
				unit: '%RH',
				...metricColor('humidity'),
				data: airHumidity,
				decimals: 0,
				gapMs
			},
			{
				id: 'soilMoisture',
				label: 'Soil moisture',
				unit: '%VWC',
				...metricColor('soil_moisture'),
				data: soilMoisture,
				decimals: 1,
				gapMs
			},
			{
				id: 'soilEC',
				label: 'Soil EC',
				unit: 'mS/cm',
				...metricColor('soil_ec'),
				data: soilEC,
				decimals: 2,
				gapMs
			},
			{
				id: 'co2',
				label: 'CO₂',
				unit: 'ppm',
				...metricColor('co2'),
				data: co2,
				decimals: 0,
				gapMs
			},
			{
				id: 'light',
				label: 'Light',
				unit: 'lux',
				...metricColor('light'),
				data: light,
				decimals: 0,
				gapMs
			}
		];
		return { dataStart: start, dataEnd: now, series };
	}

	const FARM = makeFarmData(Date.now(), 7, 11);

	/* ── Soil-only demo (single axis, no gradient) ── */
	const SOIL_ONLY: CwResponsiveLineSeries[] = FARM.series
		.filter((s) => s.id === 'soilMoisture' || s.id === 'soilEC')
		.map((s) => ({ ...s }));

	/* ── Tiny embedded demo ── */
	const MINI = (() => {
		const now = Date.now();
		const data: CwResponsiveLineDataPoint[] = [];
		for (let i = 0; i < 240; i++) {
			data.push({
				t: now - (240 - i) * 5 * 60 * 1000,
				v: 20 + Math.sin(i / 8) * 4 + (Math.random() - 0.5) * 1.5
			});
		}
		return [
			{
				id: 'temp',
				label: 'Temperature',
				unit: '°C',
				color: '#ef4444',
				data,
				decimals: 1
			} satisfies CwResponsiveLineSeries
		];
	})();

	const fullExample = `<script lang="ts">
	import { CwResponsiveLineChart } from '@cropwatchdevelopment/cwui';
	import type { CwResponsiveLineSeries } from '@cropwatchdevelopment/cwui';

	const series: CwResponsiveLineSeries[] = [
		{
			id: 'airTemp',
			label: 'Air temperature',
			unit: '°C',
			color: '#ef4444',
			gradient: true,           // value-mapped temperature gradient
			data: airTempPoints,      // [{ t: epochMs, v: number | null }]
			decimals: 1,
			gapMs: 8 * 60 * 1000,     // mark > 8-min jumps as "no signal"
			thresholds: [{ value: 0, label: 'Frost', color: 'rgba(59,130,246,0.6)' }]
		},
		{
			id: 'airHumidity',
			label: 'Air humidity',
			unit: '%RH',
			color: '#3b82f6',
			data: humidityPoints,
			decimals: 0
		}
	];
<\/script>

<CwResponsiveLineChart
	{series}
	title="North Greenhouse · Bay 3"
	subtitle="Live sensor telemetry"
	initialRange="24h"
	themeAuto
/>`;

	const soilExample = `<CwResponsiveLineChart
	series={soilSeries}
	title="Soil profile"
	subtitle="Last 24 hours"
	initialRange="24h"
	height={420}
/>`;

	const compactExample = `<CwResponsiveLineChart
	series={miniSeries}
	bare
	height={220}
	showLegend={false}
	showThemeToggle={false}
	ranges={[]}
/>`;
</script>

<h2>CwResponsiveLineChart</h2>
<p class="demo-desc">
	A Canvas2D, touch-first multi-series time chart for farm sensor telemetry. Drag horizontally to pan,
	pinch (two fingers) or Ctrl + scroll to zoom, tap to lock the crosshair, double-tap to reset. Built-in support for
	dual Y-axes, a value-mapped temperature gradient, named threshold lines, anomaly markers, explicit
	data-gap bands, night-time shading, and a fully responsive shell that picks a layout from its
	container width.
</p>

<section class="demo-section">
	<h3>Full demo — 5 series, dual axes, gradient temperature</h3>
	<p class="demo-note">
		The reference dataset: ~7 days of two-minute samples for air temperature, air humidity, soil
		moisture, soil EC, and CO₂. Air temperature uses the value-mapped gradient (cold → blue, hot →
		red) and carries a Frost threshold at 0&nbsp;°C. Every visible series gets its own colored Y
		axis — stacked on the left and right as you toggle chips in the legend below the chart.
	</p>
	<CwResponsiveLineChart
		series={FARM.series}
		dataStart={FARM.dataStart}
		dataEnd={FARM.dataEnd}
		title="North Greenhouse · Bay 3"
		subtitle="Live sensor telemetry · one Y-axis per series"
		initialRange="24h"
		height={560}
	/>
	<DemoCodeExample code={fullExample} title="Full configuration" />
</section>

<section class="demo-section">
	<h3>Soil profile — moisture + EC, color-matched axes</h3>
	<p class="demo-note">
		Pass only the series you need. Each gets its own axis colored to match the line; toggle a chip to
		hide both line and axis. With two series, one axis lands on each side.
	</p>
	<CwResponsiveLineChart
		series={SOIL_ONLY}
		title="Soil profile · Bay 3"
		subtitle="Moisture and electrical conductivity"
		initialRange="24h"
		height={420}
	/>
	<DemoCodeExample code={soilExample} title="Soil-focused example" />
</section>

<section class="demo-section">
	<h3>Compact / bare — dashboard tile</h3>
	<p class="demo-note">
		For dense cards, drop the chrome: <code>bare</code>, <code>showLegend={false}</code>,
		<code>showThemeToggle={false}</code>, and an empty <code>ranges</code> array leave just the
		canvas (and tooltip on hover/touch).
	</p>
	<CwResponsiveLineChart
		series={MINI}
		bare
		height={220}
		showLegend={false}
		showThemeToggle={false}
		ranges={[]}
	/>
	<DemoCodeExample code={compactExample} title="Compact tile" />
</section>

<section class="demo-section">
	<h3>Forced dark theme</h3>
	<p class="demo-note">
		Pass <code>theme="dark"</code> (or bind it) for surfaces that always render dark. Pair with
		<code>themeAuto</code> to follow the OS color-scheme preference instead.
	</p>
	<CwResponsiveLineChart
		series={FARM.series}
		dataStart={FARM.dataStart}
		dataEnd={FARM.dataEnd}
		title="North Greenhouse · Bay 3"
		subtitle="Dark surface · 7-day window"
		initialRange="7d"
		theme="dark"
		height={520}
	/>
</section>

<style>
	h2 {
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-bold);
		margin-bottom: var(--cw-space-2);
	}
	h3 {
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
		margin-bottom: var(--cw-space-2);
		color: var(--cw-text-secondary);
	}
	.demo-desc {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		margin-bottom: var(--cw-space-4);
		max-width: 80ch;
	}
	.demo-note {
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		margin: 0 0 var(--cw-space-3);
		max-width: 80ch;
	}
	.demo-section {
		margin-bottom: var(--cw-space-6);
	}
</style>
