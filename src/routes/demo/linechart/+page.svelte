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
\tairTemperatureChartData={tempData}
\tairHumidityChartData={humidityData}
\tairTemperatureThreshold={28}
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

<section class="demo-section">
	<h3>Keyboard navigation</h3>
	<p class="demo-note">
		Tab to any chart plot, then use <kbd>←</kbd> <kbd>→</kbd> to step through readings,
		<kbd>Home</kbd>/<kbd>End</kbd> to jump to the first or last one, and <kbd>Esc</kbd> to hide the
		tooltip. Each reading is announced to screen readers.
	</p>
</section>

<section class="demo-section">
	<h3>Loading, no data &amp; locale</h3>
	<div class="demo-grid">
		<div>
			<span class="demo-label">loading</span>
			<CwLineChart data={[]} loading primaryLabel="Temperature" primaryUnit="°C" height={200} />
		</div>
		<div>
			<span class="demo-label">Empty data (automatic no-data state)</span>
			<CwLineChart data={[]} primaryLabel="Temperature" primaryUnit="°C" height={200} />
		</div>
		<div>
			<span class="demo-label">locale="ja-JP", decimals=1</span>
			<CwLineChart
				data={soilMoisture}
				locale="ja-JP"
				decimals={1}
				primaryLabel="土壌水分"
				primaryUnit="%"
				height={200}
			/>
		</div>
	</div>
</section>

<section class="demo-section" id="device-line-chart-section">
	<h3>CwDeviceLineChartSection</h3>
	<p class="demo-note">
		Opinionated wrapper that composes one or more <code>CwLineChart</code> instances into the
		device-history card used by CropWatch dashboards.
	</p>

	<span class="demo-label">Air device</span>
	<CwDeviceLineChartSection
		isSoilDevice={false}
		airTemperatureChartData={tempData}
		airHumidityChartData={humidityData}
		airTemperatureThreshold={28}
	/>
	<DemoCodeExample code={deviceLineChartExample} title="CwDeviceLineChartSection example" />

	<span class="demo-label demo-label--spaced">Soil device (3-column)</span>
	<CwDeviceLineChartSection
		isSoilDevice={true}
		soilTemperatureChartData={soilTemp}
		soilMoistureChartData={soilMoisture}
		soilEcChartData={soilEc}
		soilTemperatureThreshold={25}
		soilMoistureThreshold={40}
		soilEcThreshold={1.5}
	/>

	<div class="demo-grid demo-grid--spaced">
		<div>
			<span class="demo-label">Loading</span>
			<CwDeviceLineChartSection historyLoading={true} />
		</div>
		<div>
			<span class="demo-label">Empty</span>
			<CwDeviceLineChartSection />
		</div>
	</div>
</section>

<style>
	.demo-note { color: var(--cw-text-secondary); font-size: var(--cw-text-sm); margin: 0 0 var(--cw-space-3); max-width: 72ch; }
	.demo-label--spaced,
	.demo-grid--spaced { margin-top: var(--cw-space-6); }
	kbd {
		padding: 0 var(--cw-space-1);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-sm);
		background: var(--cw-bg-muted);
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-xs);
	}
</style>
