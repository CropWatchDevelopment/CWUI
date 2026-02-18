<script lang="ts">
	import type { CwLineChartDataPoint, CwLineChartSecondaryDataPoint } from '../types/index.js';
	import CwLineChart from './CwLineChart.svelte';

	interface Props {
		/** If true, renders 3-column soil grid; otherwise a single air chart */
		isSoilDevice?: boolean;
		/** Whether data is currently loading */
		historyLoading?: boolean;
		/* ── Soil-specific data ─── */
		soilTemperatureChartData?: CwLineChartDataPoint[];
		soilMoistureChartData?: CwLineChartDataPoint[];
		soilEcChartData?: CwLineChartDataPoint[];
		soilTemperatureThreshold?: number;
		soilMoistureThreshold?: number;
		soilEcThreshold?: number;
		/* ── Air-specific data ──── */
		airTemperatureChartData?: CwLineChartDataPoint[];
		airHumidityChartData?: CwLineChartSecondaryDataPoint[];
		airTemperatureThreshold?: number;
	}

	let {
		isSoilDevice = false,
		historyLoading = false,
		soilTemperatureChartData = [],
		soilMoistureChartData = [],
		soilEcChartData = [],
		soilTemperatureThreshold,
		soilMoistureThreshold,
		soilEcThreshold,
		airTemperatureChartData = [],
		airHumidityChartData = [],
		airTemperatureThreshold
	}: Props = $props();

	const hasData = $derived(
		isSoilDevice
			? soilTemperatureChartData.length > 0 || soilMoistureChartData.length > 0 || soilEcChartData.length > 0
			: airTemperatureChartData.length > 0
	);

	const title = $derived(isSoilDevice ? 'Soil telemetry' : 'Temperature & Humidity');
</script>

<section class="cw-chart-section">
	<div class="cw-chart-section__header">
		<div class="cw-chart-section__header-text">
			<p class="cw-chart-section__eyebrow">Line chart</p>
			<h2 class="cw-chart-section__title">{title}</h2>
		</div>
	</div>

	{#if historyLoading}
		<div class="cw-chart-section__placeholder">Loading chart data…</div>
	{:else if !hasData}
		<div class="cw-chart-section__placeholder">No data available for chart</div>
	{:else if isSoilDevice}
		<div class="cw-chart-section__grid">
			<div class="cw-chart-section__cell">
				<p class="cw-chart-section__cell-label">Soil Temperature</p>
				<CwLineChart
					data={soilTemperatureChartData}
					threshold={soilTemperatureThreshold}
					primaryLabel="Temperature"
					primaryUnit="°C"
					height={260}
				/>
			</div>
			<div class="cw-chart-section__cell">
				<p class="cw-chart-section__cell-label">Soil Moisture</p>
				<CwLineChart
					data={soilMoistureChartData}
					threshold={soilMoistureThreshold}
					primaryLabel="Moisture"
					primaryUnit="%"
					height={260}
				/>
			</div>
			<div class="cw-chart-section__cell">
				<p class="cw-chart-section__cell-label">Electrical Conductivity</p>
				<CwLineChart
					data={soilEcChartData}
					threshold={soilEcThreshold}
					primaryLabel="EC"
					primaryUnit=" mS/cm"
					height={260}
				/>
			</div>
		</div>
	{:else}
		<CwLineChart
			data={airTemperatureChartData}
			secondaryData={airHumidityChartData}
			threshold={airTemperatureThreshold}
			primaryLabel="Temperature"
			secondaryLabel="Humidity"
			primaryUnit="°C"
			secondaryUnit="%"
			height={350}
		/>
	{/if}
</section>

<style>
	/* ── Outer card ────────────────────────── */
	.cw-chart-section {
		border-radius: 1.5rem;
		border: 1px solid #1e293b;
		background-color: #0f172a;
		padding: 1.5rem;
		box-shadow: 0 10px 15px -3px rgba(2, 6, 23, 0.40);
	}

	/* ── Header ───────────────────────────── */
	.cw-chart-section__header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.cw-chart-section__eyebrow {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: #94a3b8;
	}
	.cw-chart-section__title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #ffffff;
		margin: 0;
	}

	/* ── Loading / empty ──────────────────── */
	.cw-chart-section__placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 350px;
		color: #94a3b8;
	}

	/* ── Soil 3-col grid ──────────────────── */
	.cw-chart-section__grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: 1fr;
	}
	@media (min-width: 1024px) {
		.cw-chart-section__grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* ── Individual cell ──────────────────── */
	.cw-chart-section__cell {
		border-radius: 1rem;
		border: 1px solid #1e293b;
		background-color: rgba(2, 6, 23, 0.40);
		padding: 1rem;
	}
	.cw-chart-section__cell-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: #94a3b8;
		margin-bottom: 0.75rem;
	}
</style>
