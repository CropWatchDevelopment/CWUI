<script lang="ts">
	import { CwLineChart, CwDeviceLineChartSection } from '$lib/index.js';
	import type { CwLineChartDataPoint, CwLineChartSecondaryDataPoint } from '$lib/index.js';

	/* ── Helper: generate time-series data ─── */
	function genPrimary(count: number, base: number, amplitude: number, unit: string): CwLineChartDataPoint[] {
		const now = Date.now();
		const step = (24 * 60 * 60 * 1000) / count;
		return Array.from({ length: count }, (_, i) => {
			const val = base + Math.sin(i / 5) * amplitude + (Math.random() - 0.5) * 2;
			const point: CwLineChartDataPoint = {
				timestamp: new Date(now - (count - i) * step),
				value: Math.round(val * 100) / 100
			};
			// Sprinkle a couple of alerts
			if (i === Math.floor(count * 0.3)) {
				point.alert = { id: 'a1', message: `Spike detected (${unit})`, severity: 'warning' };
			}
			if (i === Math.floor(count * 0.75)) {
				point.alert = { id: 'a2', message: `Critical value (${unit})`, severity: 'critical' };
			}
			return point;
		});
	}

	function genSecondary(count: number, base: number, amplitude: number): CwLineChartSecondaryDataPoint[] {
		const now = Date.now();
		const step = (24 * 60 * 60 * 1000) / count;
		return Array.from({ length: count }, (_, i) => ({
			timestamp: new Date(now - (count - i) * step),
			value: Math.round((base + Math.cos(i / 7) * amplitude + (Math.random() - 0.5) * 3) * 100) / 100
		}));
	}

	const tempData = genPrimary(60, 22, 6, '°C');
	const humidityData = genSecondary(60, 55, 15);

	const soilTemp = genPrimary(40, 18, 4, '°C');
	const soilMoisture = genPrimary(40, 35, 12, '%');
	const soilEc = genPrimary(40, 1.2, 0.5, 'mS/cm');
</script>

<h2>CwLineChart</h2>
<p class="demo-desc">Pure SVG line chart with gradient-colored primary line, dual Y-axes, threshold, alerts, interactive legend, and tooltip.</p>

<section class="demo-section">
	<h3>Single Series + Threshold</h3>
	<CwLineChart
		data={tempData}
		threshold={28}
		primaryLabel="Temperature"
		primaryUnit="°C"
		height={350}
	/>
</section>

<section class="demo-section">
	<h3>Dual Series (Primary + Secondary)</h3>
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
</section>

<section class="demo-section">
	<h3>Small Chart, No Grid</h3>
	<CwLineChart
		data={soilTemp}
		primaryLabel="Soil Temp"
		primaryUnit="°C"
		height={200}
		showGrid={false}
	/>
</section>

<h2 style="margin-top:var(--cw-space-8)">CwDeviceLineChartSection</h2>
<p class="demo-desc">Container card that switches between a 3-column soil grid and a single air chart.</p>

<section class="demo-section">
	<h3>Air Device</h3>
	<CwDeviceLineChartSection
		isSoilDevice={false}
		airTemperatureChartData={tempData}
		airHumidityChartData={humidityData}
		airTemperatureThreshold={28}
	/>
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
	.demo-section { margin-bottom: var(--cw-space-6); }
</style>
