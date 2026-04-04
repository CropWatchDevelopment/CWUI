<script lang="ts">
	import { CwLineChart, CwDeviceLineChartSection } from '$lib/index.js';
	import type {
		CwLineChartAlertPoint,
		CwLineChartDataPoint,
		CwLineChartSecondaryDataPoint,
		CwLineChartThreshold
	} from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	/* ── Helper: generate time-series data ─── */
	function genPrimary(count: number, base: number, amplitude: number): CwLineChartDataPoint[] {
		const now = Date.now();
		const step = (24 * 60 * 60 * 1000) / count;
		return Array.from({ length: count }, (_, i) => ({
			timestamp: new Date(now - (count - i) * step),
			value: Math.round((base + Math.sin(i / 5) * amplitude + (Math.random() - 0.5) * 2) * 100) / 100
		}));
	}

	function genSecondary(count: number, base: number, amplitude: number): CwLineChartSecondaryDataPoint[] {
		const now = Date.now();
		const step = (24 * 60 * 60 * 1000) / count;
		return Array.from({ length: count }, (_, i) => ({
			timestamp: new Date(now - (count - i) * step),
			value: Math.round((base + Math.cos(i / 7) * amplitude + (Math.random() - 0.5) * 3) * 100) / 100
		}));
	}

	const tempData = genPrimary(60, 22, 6);
	const humidityData = genSecondary(60, 55, 15);
	const temperatureThresholds: CwLineChartThreshold[] = [
		{ id: 'target-high', name: 'Target high', value: 24 },
		{ id: 'warning-high', name: 'Warning high', value: 27 },
		{ id: 'critical-high', name: 'Critical high', value: 29 }
	];
	const temperatureAlertPoints: CwLineChartAlertPoint[] = [
		{
			id: 'spike',
			timestamp: tempData[18].timestamp,
			value: tempData[18].value,
			message: 'Short spike detected during the irrigation cycle.',
			severity: 'warning'
		},
		{
			id: 'critical',
			timestamp: tempData[45].timestamp,
			value: tempData[45].value,
			message: 'Critical thermal alert triggered after a rapid rise.',
			severity: 'critical'
		}
	];

	const soilTemp = genPrimary(40, 18, 4);
	const soilMoisture = genPrimary(40, 35, 12);
	const soilEc = genPrimary(40, 1.2, 0.5);
	const singleSeriesExample = `<CwLineChart
\tdata={tempData}
\talertPoints={temperatureAlertPoints}
\tthresholds={temperatureThresholds}
\tprimaryLabel="Temperature"
\tprimaryUnit="°C"
\theight={350}
/>`;
	const dualSeriesExample = `<CwLineChart
\tdata={tempData}
\tsecondaryData={humidityData}
\tthreshold={28}
\tprimaryLabel="Temperature"
\tsecondaryLabel="Humidity"
\tprimaryUnit="°C"
\tsecondaryUnit="%"
\theight={350}
/>`;
	const compactChartExample = `<CwLineChart
\tdata={soilTemp}
\tprimaryLabel="Soil Temp"
\tprimaryUnit="°C"
\theight={200}
\tshowGrid={false}
/>`;
	const deviceLineChartExample = `<CwDeviceLineChartSection
\tisSoilDevice={false}
\thairTemperatureChartData={tempData}
\thairHumidityChartData={humidityData}
\thairTemperatureThreshold={28}
/>`;
</script>

<h2>CwLineChart</h2>
<p class="demo-desc">
	Responsive SVG time-series chart with a primary series, optional secondary series, standalone alert markers, named threshold lines, a hover tooltip, and legend toggles. The route reference at the bottom of this page documents the full prop and data-point API.
</p>

<section class="demo-section">
	<h3>Single Series + Named Thresholds + Alert Points</h3>
	<p class="demo-note">
		Hover near the alert markers or threshold lines in this sample. The tooltip now shows multiple named thresholds and alert details without forcing those values into the primary data series.
	</p>
	<CwLineChart
		data={tempData}
		alertPoints={temperatureAlertPoints}
		thresholds={temperatureThresholds}
		primaryLabel="Temperature"
		primaryUnit="°C"
		height={350}
	/>
	<DemoCodeExample code={singleSeriesExample} title="Single-series example" />
</section>

<section class="demo-section">
	<h3>Dual Series + Right Axis</h3>
	<p class="demo-note">
		Add <code>secondaryData</code> only when the comparison metric needs a different unit or scale. The chart automatically adds the dashed line and right-side axis.
	</p>
	<CwLineChart
		data={tempData}
		secondaryData={humidityData}
		threshold={28}
		primaryLabel="Temperature"
		secondaryLabel="Humidity"
		primaryUnit="°C"
		secondaryUnit="%"
		height={350}
	/>
	<DemoCodeExample code={dualSeriesExample} title="Dual-series example" />
</section>

<section class="demo-section">
	<h3>Compact Chart, No Grid</h3>
	<p class="demo-note">
		Lower the height and disable the grid for dashboard tiles or dense cards. Tooltip and legend behavior still work in the compact layout.
	</p>
	<CwLineChart
		data={soilTemp}
		primaryLabel="Soil Temp"
		primaryUnit="°C"
		height={200}
		showGrid={false}
	/>
	<DemoCodeExample code={compactChartExample} title="Compact chart example" />
</section>

<h2 style="margin-top:var(--cw-space-8)">CwDeviceLineChartSection</h2>
<p class="demo-desc">
	Opinionated wrapper that composes one or more <code>CwLineChart</code> instances into the device-history card used by CropWatch dashboards.
</p>

<section class="demo-section">
	<h3>Air Device</h3>
	<CwDeviceLineChartSection
		isSoilDevice={false}
		airTemperatureChartData={tempData}
		airHumidityChartData={humidityData}
		airTemperatureThreshold={28}
	/>
	<DemoCodeExample code={deviceLineChartExample} title="CwDeviceLineChartSection example" />
</section>

<section class="demo-section">
	<h3>Soil Device (3-column)</h3>
	<CwDeviceLineChartSection
		isSoilDevice={true}
		soilTemperatureChartData={soilTemp}
		soilMoistureChartData={soilMoisture}
		soilEcChartData={soilEc}
		soilTemperatureThreshold={25}
		soilMoistureThreshold={40}
		soilEcThreshold={1.5}
	/>
</section>

<section class="demo-section">
	<h3>Loading State</h3>
	<CwDeviceLineChartSection historyLoading={true} />
</section>

<section class="demo-section">
	<h3>Empty State</h3>
	<CwDeviceLineChartSection />
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-note { color: var(--cw-text-secondary); font-size: var(--cw-text-sm); margin: 0 0 var(--cw-space-3); max-width: 72ch; }
	.demo-section { margin-bottom: var(--cw-space-6); }
</style>
