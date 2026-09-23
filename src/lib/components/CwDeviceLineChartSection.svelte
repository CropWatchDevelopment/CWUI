<script lang="ts" module>
	import { CW_DEFAULT_NO_DATA_MESSAGE } from './cwNoData.js';

	/** Override display labels for i18n. All fields optional; English defaults preserved when omitted. */
	export interface CwDeviceLineChartSectionLabels {
		/** Small uppercase eyebrow above the title. Default: "History" */
		eyebrow?: string;
		/** Section title shown for soil devices. Default: "Soil telemetry" */
		soilTitle?: string;
		/** Section title shown for air devices. Default: "Temperature & Humidity" */
		airTitle?: string;
		/** Placeholder shown while chart data is loading. Default: "Loading chart data…" */
		loading?: string;
		/** Message shown when there is no chart data. Default: the shared no-data message ("No Data Available") */
		noData?: string;
		/** Cell label above the soil temperature chart. Default: "Soil Temperature" */
		soilTemperatureLabel?: string;
		/** Cell label above the soil moisture chart. Default: "Soil Moisture" */
		soilMoistureLabel?: string;
		/** Cell label above the electrical conductivity chart. Default: "Electrical Conductivity" */
		electricalConductivityLabel?: string;
		/** Series label for temperature lines. Default: "Temperature" */
		temperatureSeriesLabel?: string;
		/** Series label for moisture lines. Default: "Moisture" */
		moistureSeriesLabel?: string;
		/** Series label for electrical conductivity lines. Default: "EC" */
		ecSeriesLabel?: string;
		/** Series label for humidity lines. Default: "Humidity" */
		humiditySeriesLabel?: string;
	}

	const DEFAULT_LABELS: Required<CwDeviceLineChartSectionLabels> = {
		eyebrow: 'History',
		soilTitle: 'Soil telemetry',
		airTitle: 'Temperature & Humidity',
		loading: 'Loading chart data…',
		noData: CW_DEFAULT_NO_DATA_MESSAGE,
		soilTemperatureLabel: 'Soil Temperature',
		soilMoistureLabel: 'Soil Moisture',
		electricalConductivityLabel: 'Electrical Conductivity',
		temperatureSeriesLabel: 'Temperature',
		moistureSeriesLabel: 'Moisture',
		ecSeriesLabel: 'EC',
		humiditySeriesLabel: 'Humidity'
	};
</script>

<script lang="ts">
	import type {
		CwLineChartDataPoint,
		CwLineChartSecondaryDataPoint,
		CwNoDataMessage
	} from '../types/index.js';
	import CwLineChart from './CwLineChart.svelte';
	import CwNoDataOverlay from './CwNoDataOverlay.svelte';
	import CwSpinner from './CwSpinner.svelte';
	import { getCwNoDataMessage, hasCwNoData } from './cwNoData.js';

	interface Props {
		/** If true, renders 3-column soil grid; otherwise a single air chart */
		isSoilDevice?: boolean;
		/** Whether data is currently loading */
		historyLoading?: boolean;
		/* ── Soil-specific data ─── */
		soilTemperatureChartData?: CwLineChartDataPoint[] | null;
		soilMoistureChartData?: CwLineChartDataPoint[] | null;
		soilEcChartData?: CwLineChartDataPoint[] | null;
		soilTemperatureThreshold?: number;
		soilMoistureThreshold?: number;
		soilEcThreshold?: number;
		/* ── Air-specific data ──── */
		airTemperatureChartData?: CwLineChartDataPoint[] | null;
		airHumidityChartData?: CwLineChartSecondaryDataPoint[] | null;
		airTemperatureThreshold?: number;
		noData?: CwNoDataMessage;
		/** Heading level for the section title (2–6). Default 2. */
		headingLevel?: 2 | 3 | 4 | 5 | 6;
		/** Unit for temperature series. Default "°C". */
		temperatureUnit?: string;
		/** Unit for electrical conductivity. Default "mS/cm". */
		ecUnit?: string;
		/** BCP 47 locale forwarded to the charts. */
		locale?: string;
		/** Override display labels for i18n */
		labels?: CwDeviceLineChartSectionLabels;
		class?: string;
	}

	let {
		isSoilDevice = false,
		historyLoading = false,
		soilTemperatureChartData: soilTemperatureChartDataInput = [],
		soilMoistureChartData: soilMoistureChartDataInput = [],
		soilEcChartData: soilEcChartDataInput = [],
		soilTemperatureThreshold,
		soilMoistureThreshold,
		soilEcThreshold,
		airTemperatureChartData: airTemperatureChartDataInput = [],
		airHumidityChartData: airHumidityChartDataInput = [],
		airTemperatureThreshold,
		noData,
		headingLevel = 2,
		temperatureUnit = '°C',
		ecUnit = 'mS/cm',
		locale,
		labels = {},
		class: className = ''
	}: Props = $props();

	const l = $derived({ ...DEFAULT_LABELS, ...labels });

	const soilTemperatureChartData = $derived(soilTemperatureChartDataInput ?? []);
	const soilMoistureChartData = $derived(soilMoistureChartDataInput ?? []);
	const soilEcChartData = $derived(soilEcChartDataInput ?? []);
	const airTemperatureChartData = $derived(airTemperatureChartDataInput ?? []);
	const airHumidityChartData = $derived(airHumidityChartDataInput ?? []);
	const hasNoData = $derived(hasCwNoData(noData));
	const noDataMessage = $derived(getCwNoDataMessage(noData));

	const hasData = $derived(
		isSoilDevice
			? soilTemperatureChartData.length > 0 || soilMoistureChartData.length > 0 || soilEcChartData.length > 0
			: airTemperatureChartData.length > 0 || airHumidityChartData.length > 0
	);
	const showEmpty = $derived(!historyLoading && !hasData && !hasNoData);

	const title = $derived(isSoilDevice ? l.soilTitle : l.airTitle);
</script>

<section
	class="cw-chart-section cw-no-data-host {className}"
	class:cw-no-data-host--active={hasNoData}
	aria-busy={historyLoading || undefined}
>
	<div class="cw-chart-section__header">
		<div class="cw-chart-section__header-text">
			{#if l.eyebrow}
				<p class="cw-chart-section__eyebrow">{l.eyebrow}</p>
			{/if}
			<svelte:element this={`h${headingLevel}`} class="cw-chart-section__title">{title}</svelte:element>
		</div>
	</div>

	{#if historyLoading}
		<div class="cw-chart-section__placeholder" role="status">
			<CwSpinner size="lg" />
			<span>{l.loading}</span>
		</div>
	{:else if !hasData}
		<!-- Empty state covers the plot area only, so the heading stays readable. -->
		<div class="cw-chart-section__placeholder">
			{#if showEmpty}
				<CwNoDataOverlay message={l.noData} />
			{/if}
		</div>
	{:else if isSoilDevice}
		<div class="cw-chart-section__grid">
			<div class="cw-chart-section__cell">
				<p class="cw-chart-section__cell-label">{l.soilTemperatureLabel}</p>
				<CwLineChart
					data={soilTemperatureChartData}
					threshold={soilTemperatureThreshold}
					primaryLabel={l.temperatureSeriesLabel}
					primaryUnit={temperatureUnit}
					height={260}
					{locale}
				/>
			</div>
			<div class="cw-chart-section__cell">
				<p class="cw-chart-section__cell-label">{l.soilMoistureLabel}</p>
				<CwLineChart
					data={soilMoistureChartData}
					threshold={soilMoistureThreshold}
					primaryLabel={l.moistureSeriesLabel}
					primaryUnit="%"
					height={260}
					{locale}
				/>
			</div>
			<div class="cw-chart-section__cell">
				<p class="cw-chart-section__cell-label">{l.electricalConductivityLabel}</p>
				<CwLineChart
					data={soilEcChartData}
					threshold={soilEcThreshold}
					primaryLabel={l.ecSeriesLabel}
					primaryUnit={ecUnit}
					height={260}
					{locale}
				/>
			</div>
		</div>
	{:else}
		<CwLineChart
			data={airTemperatureChartData}
			secondaryData={airHumidityChartData}
			threshold={airTemperatureThreshold}
			primaryLabel={l.temperatureSeriesLabel}
			secondaryLabel={l.humiditySeriesLabel}
			primaryUnit={temperatureUnit}
			secondaryUnit="%"
			height={350}
			{locale}
		/>
	{/if}

	{#if hasNoData}
		<CwNoDataOverlay message={noDataMessage} />
	{/if}
</section>

<style>
	/* ── Outer card ────────────────────────── */
	.cw-chart-section {
		border-radius: var(--cw-radius-2xl);
		border: 1px solid var(--cw-chart-card-border);
		background-color: var(--cw-chart-card-bg);
		padding: var(--cw-space-5);
		box-shadow: var(--cw-chart-card-shadow);
		font-family: var(--cw-font-family);
	}

	@media (max-width: 480px) {
		.cw-chart-section {
			padding: var(--cw-space-3);
		}
	}

	/* ── Header ───────────────────────────── */
	.cw-chart-section__header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-4);
		margin-bottom: var(--cw-space-4);
	}
	.cw-chart-section__eyebrow {
		margin: 0 0 var(--cw-space-1);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--cw-chart-card-muted);
	}
	.cw-chart-section__title {
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-tight);
		color: var(--cw-chart-card-title);
		margin: 0;
	}

	/* ── Loading / empty ──────────────────── */
	.cw-chart-section__placeholder {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-2);
		min-height: 350px;
		color: var(--cw-chart-card-muted);
		font-size: var(--cw-text-sm);
	}

	/* ── Soil 3-col grid ──────────────────── */
	.cw-chart-section__grid {
		display: grid;
		gap: var(--cw-space-4);
		grid-template-columns: 1fr;
	}
	@media (min-width: 1024px) {
		.cw-chart-section__grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* ── Individual cell ──────────────────── */
	.cw-chart-section__cell {
		min-width: 0;
		border-radius: var(--cw-radius-xl);
		border: 1px solid var(--cw-chart-card-cell-border);
		background-color: var(--cw-chart-card-cell-bg);
		padding: var(--cw-space-4);
	}
	.cw-chart-section__cell-label {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--cw-chart-card-muted);
		margin: 0 0 var(--cw-space-3);
	}
</style>
