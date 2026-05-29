<script lang="ts" module>
	/** Zone key union for the VPD heatmap colour bands. */
	export type VpdZoneKey =
		| "wet"
		| "humid"
		| "balanced"
		| "optimal"
		| "firm"
		| "dry"
		| "stress";

	/** Optional override labels for {@link CwVPDChart}. All fields optional; omitted fields fall back to English defaults. */
	export interface CwVPDChartLabels {
		/** Displayed zone labels keyed by zone (used in the cell aria-labels). */
		zones?: Partial<Record<VpdZoneKey, string>>;
		/** Screen-reader caption describing the heatmap table. */
		caption?: string;
		/** Matrix cell aria-label builder. */
		cellAriaLabel?: (args: {
			temperatureC: number;
			humidity: number;
			vpd: string;
			unit: string;
			zoneLabel: string;
			inTarget: boolean;
			isCurrent: boolean;
		}) => string;
	}
</script>

<script lang="ts">
	import type { CwNoDataMessage } from "../types/index.js";
	import CwNoDataOverlay from "./CwNoDataOverlay.svelte";
	import { getCwNoDataMessage, hasCwNoData } from "./cwNoData.js";

	interface VpdZone {
		key: VpdZoneKey;
		min: number;
		max: number;
	}

	interface MatrixCell {
		humidity: number;
		vpd: number;
		zone: VpdZoneKey;
		zoneLabel: string;
		inTarget: boolean;
		isCurrent: boolean;
	}

	interface MatrixRow {
		temperatureC: number;
		temperatureF: number;
		isCurrent: boolean;
		cells: MatrixCell[];
	}

	interface Props {
		/** Lower bound of the target VPD band (cells inside the band get an inset outline). */
		targetMin?: number | null;
		/** Upper bound of the target VPD band. */
		targetMax?: number | null;
		/** Unit suffix used in the cell aria-labels. */
		unit?: string;
		/** Show a Fahrenheit axis column alongside Celsius. */
		useF?: boolean;
		/** Live air temperature (°C) — highlights the nearest row/cell. */
		airTemperatureC?: number | null;
		/** Live relative humidity (%) — highlights the nearest column/cell. */
		relativeHumidity?: number | null;
		/** Temperature rows (°C). Defaults to 15–35. */
		temperatureValuesC?: number[];
		/** Humidity columns (%). Defaults to 35–90 in steps of 5. */
		humidityValues?: number[];
		noData?: CwNoDataMessage;
		labels?: CwVPDChartLabels;
		class?: string;
	}

	const DEFAULT_TEMPERATURES_C = Array.from(
		{ length: 21 },
		(_, index) => index + 15,
	);
	const DEFAULT_HUMIDITIES = Array.from(
		{ length: 12 },
		(_, index) => 35 + index * 5,
	);
	const VPD_ZONES: VpdZone[] = [
		{ key: "wet", min: 0, max: 0.4 },
		{ key: "humid", min: 0.4, max: 0.8 },
		{ key: "balanced", min: 0.8, max: 1.0 },
		{ key: "optimal", min: 1.0, max: 1.2 },
		{ key: "firm", min: 1.2, max: 1.4 },
		{ key: "dry", min: 1.4, max: 1.6 },
		{ key: "stress", min: 1.6, max: Number.POSITIVE_INFINITY },
	];

	const DEFAULT_ZONE_LABELS: Record<VpdZoneKey, string> = {
		wet: "Wet",
		humid: "Humid",
		balanced: "Balanced",
		optimal: "Optimal",
		firm: "Firm",
		dry: "Dry",
		stress: "Stress",
	};
	const DEFAULT_CAPTION =
		"Vapor pressure deficit heatmap by temperature and relative humidity";
	const defaultCellAriaLabel = ({
		temperatureC,
		humidity,
		vpd,
		unit: cellUnit,
		zoneLabel,
		inTarget,
		isCurrent,
	}: {
		temperatureC: number;
		humidity: number;
		vpd: string;
		unit: string;
		zoneLabel: string;
		inTarget: boolean;
		isCurrent: boolean;
	}) =>
		`${temperatureC} degrees Celsius, ${humidity} percent relative humidity, ${vpd} ${cellUnit}, ${zoneLabel} zone${inTarget ? ", inside target band" : ""}${isCurrent ? ", current room climate cell" : ""}`;

	let {
		targetMin,
		targetMax,
		unit = "kPa",
		useF = false,
		airTemperatureC,
		relativeHumidity,
		temperatureValuesC,
		humidityValues,
		noData,
		labels = {},
		class: className = "",
	}: Props = $props();

	const zoneLabels = $derived({ ...DEFAULT_ZONE_LABELS, ...labels.zones });
	const caption = $derived(labels.caption ?? DEFAULT_CAPTION);
	const cellAriaLabel = $derived(labels.cellAriaLabel ?? defaultCellAriaLabel);

	const vpdFormatter = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	function toFahrenheit(tempC: number): number {
		return Math.round(tempC * (9 / 5) + 32);
	}

	function toFiniteNumber(input: number | null | undefined, fallback: number): number {
		return typeof input === "number" && Number.isFinite(input) ? input : fallback;
	}

	function normalizeNumberList(
		values: number[] | undefined,
		fallback: number[],
	): number[] {
		const source = values?.length ? values : fallback;
		return Array.from(
			new Set(
				source
					.map((value) => Number(value))
					.filter((value) => Number.isFinite(value)),
			),
		).sort((a, b) => a - b);
	}

	function nearestValue(values: number[], value: number): number | null {
		if (!values.length) return null;

		let nearest = values[0];
		let smallestDistance = Math.abs(values[0] - value);

		for (const candidate of values.slice(1)) {
			const distance = Math.abs(candidate - value);
			if (distance < smallestDistance) {
				nearest = candidate;
				smallestDistance = distance;
			}
		}

		return nearest;
	}

	// Tetens approximation, which matches common horticulture VPD charts.
	function calculateRoomVpd(tempC: number, humidity: number): number {
		const saturationVaporPressure =
			0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
		return saturationVaporPressure * (1 - humidity / 100);
	}

	function resolveZone(value: number): VpdZone {
		for (const zone of VPD_ZONES) {
			const insideUpperBound = Number.isFinite(zone.max)
				? value < zone.max
				: true;
			if (value >= zone.min && insideUpperBound) {
				return zone;
			}
		}

		return VPD_ZONES.at(-1) ?? VPD_ZONES[0];
	}

	const hasNoData = $derived(hasCwNoData(noData));
	const noDataMessage = $derived(getCwNoDataMessage(noData));

	const airTemperatureValue = $derived(
		airTemperatureC === undefined || airTemperatureC === null
			? null
			: toFiniteNumber(airTemperatureC, 0),
	);
	const relativeHumidityValue = $derived(
		relativeHumidity === undefined || relativeHumidity === null
			? null
			: toFiniteNumber(relativeHumidity, 0),
	);
	const normalizedTarget = $derived.by(() => {
		const lower = toFiniteNumber(targetMin, 0);
		const upper = toFiniteNumber(targetMax, lower);

		return {
			min: Math.min(lower, upper),
			max: Math.max(lower, upper),
		};
	});

	const resolvedTemperatures = $derived.by(() =>
		normalizeNumberList(temperatureValuesC, DEFAULT_TEMPERATURES_C),
	);
	const resolvedHumidities = $derived.by(() =>
		normalizeNumberList(humidityValues, DEFAULT_HUMIDITIES),
	);

	const nearestTemperature = $derived.by(() =>
		airTemperatureValue === null
			? null
			: nearestValue(resolvedTemperatures, airTemperatureValue),
	);
	const nearestHumidity = $derived.by(() =>
		relativeHumidityValue === null
			? null
			: nearestValue(resolvedHumidities, relativeHumidityValue),
	);

	const matrixRows = $derived.by<MatrixRow[]>(() =>
		resolvedTemperatures.map((temperatureC) => ({
			temperatureC,
			temperatureF: toFahrenheit(temperatureC),
			isCurrent: nearestTemperature === temperatureC,
			cells: resolvedHumidities.map((humidity) => {
				const vpd = calculateRoomVpd(temperatureC, humidity);
				const zone = resolveZone(vpd);

				return {
					humidity,
					vpd,
					zone: zone.key,
					zoneLabel: zoneLabels[zone.key],
					inTarget:
						vpd >= normalizedTarget.min &&
						vpd <= normalizedTarget.max,
					isCurrent:
						nearestTemperature === temperatureC &&
						nearestHumidity === humidity,
				};
			}),
		})),
	);
</script>

<section
	class={["cw-vpd-chart", "cw-no-data-host", hasNoData && "cw-no-data-host--active", className]}
>
	<div class="cw-vpd-chart__matrix-scroll">
		<table class="cw-vpd-chart__matrix">
			<caption class="cw-vpd-chart__sr-only">{caption}</caption>
			<thead>
				<tr>
					<th scope="col">°C</th>
					{#if useF}
						<th scope="col">°F</th>
					{/if}
					{#each resolvedHumidities as humidity (humidity)}
						<th
							scope="col"
							class={nearestHumidity === humidity
								? "cw-vpd-chart__header--current"
								: ""}
						>
							<span class="cw-vpd-chart__header-text">{humidity}%</span>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each matrixRows as row (row.temperatureC)}
					<tr>
						<th
							scope="row"
							class={row.isCurrent
								? "cw-vpd-chart__row-header cw-vpd-chart__row-header--current"
								: "cw-vpd-chart__row-header"}
						>
							<span class="cw-vpd-chart__row-label">{row.temperatureC}</span>
						</th>
						{#if useF}
							<td
								class={row.isCurrent
									? "cw-vpd-chart__fahrenheit cw-vpd-chart__fahrenheit--current"
									: "cw-vpd-chart__fahrenheit"}
							>
								<span class="cw-vpd-chart__fahrenheit-label">{row.temperatureF}</span>
							</td>
						{/if}
						{#each row.cells as cell (`${row.temperatureC}-${cell.humidity}`)}
							<td
								class={[
									"cw-vpd-chart__cell",
									`cw-vpd-chart__cell--${cell.zone}`,
									cell.inTarget && "cw-vpd-chart__cell--target",
									cell.isCurrent && "cw-vpd-chart__cell--current",
								]}
								aria-label={cellAriaLabel({
									temperatureC: row.temperatureC,
									humidity: cell.humidity,
									vpd: vpdFormatter.format(cell.vpd),
									unit,
									zoneLabel: cell.zoneLabel,
									inTarget: cell.inTarget,
									isCurrent: cell.isCurrent,
								})}
							>
								<span class="cw-vpd-chart__cell-value">{vpdFormatter.format(cell.vpd)}</span>
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if hasNoData}
		<CwNoDataOverlay message={noDataMessage} />
	{/if}
</section>

<style>
	.cw-vpd-chart {
		--cw-vpd-sticky-c: 4.5rem;
		--cw-vpd-sticky-f: 4.5rem;
		--cw-vpd-grid: color-mix(
			in srgb,
			var(--cw-border-default, #94a3b8) 78%,
			transparent
		);
		--cw-vpd-axis: color-mix(
			in srgb,
			var(--cw-bg-muted, #e2e8f0) 58%,
			var(--cw-chart-card-bg, var(--cw-bg-surface))
		);
		--cw-vpd-axis-strong: color-mix(
			in srgb,
			var(--cw-border-default, #94a3b8) 78%,
			transparent
		);
		--cw-vpd-header: color-mix(
			in srgb,
			var(--cw-text-primary, #0f172a) 8%,
			var(--cw-chart-card-bg, var(--cw-bg-surface))
		);
		--cw-vpd-wet: #3d75b8;
		--cw-vpd-humid: #53b9d3;
		--cw-vpd-balanced: #7fc65a;
		--cw-vpd-optimal: #b5d448;
		--cw-vpd-firm: #efd04a;
		--cw-vpd-dry: #eea24d;
		--cw-vpd-stress: #d75a4b;
		--cw-vpd-selection: color-mix(
			in srgb,
			var(--cw-accent, #2563eb) 78%,
			var(--cw-text-primary, #0f172a)
		);
		--cw-vpd-selection-ring: color-mix(
			in srgb,
			white 88%,
			var(--cw-selection, #0f172a)
		);
		--cw-vpd-current-text-scale: 2;
		--cw-vpd-axis-text-scale: 1.35;
		background: var(--cw-chart-card-bg, var(--cw-bg-surface));
		border: 1px solid var(--cw-chart-card-border, var(--cw-border-default));
		border-radius: 1.25rem;
		box-shadow: var(--cw-chart-card-shadow, var(--cw-shadow-md));
		overflow: hidden;
		padding: 0.5rem;
		position: relative;
	}

	.cw-vpd-chart__matrix-scroll {
		overflow: auto;
	}

	.cw-vpd-chart__matrix {
		border-collapse: separate;
		border-spacing: 0;
		min-width: max-content;
		width: 100%;
	}

	.cw-vpd-chart__matrix th,
	.cw-vpd-chart__matrix td {
		border-right: 1px solid var(--cw-vpd-grid);
		border-top: 1px solid var(--cw-vpd-grid);
		padding: 0;
		text-align: center;
	}

	.cw-vpd-chart__matrix thead th {
		background: var(--cw-vpd-header);
		color: var(--cw-chart-card-title, var(--cw-text-primary));
		font-size: 0.78rem;
		font-weight: 700;
		padding: 0.8rem 0.7rem;
		position: sticky;
		top: 0;
		z-index: 3;
	}

	.cw-vpd-chart__matrix thead th:first-child {
		left: 0;
		min-width: var(--cw-vpd-sticky-c);
		position: sticky;
		z-index: 6;
	}

	.cw-vpd-chart__matrix thead th:nth-child(2) {
		left: var(--cw-vpd-sticky-c);
		min-width: var(--cw-vpd-sticky-f);
		position: sticky;
		z-index: 6;
	}

	.cw-vpd-chart__header-text,
	.cw-vpd-chart__row-label,
	.cw-vpd-chart__fahrenheit-label,
	.cw-vpd-chart__cell-value {
		display: inline-block;
		line-height: 1;
		transform-origin: center;
	}

	.cw-vpd-chart__header--current {
		background: color-mix(
			in srgb,
			var(--cw-vpd-selection) 34%,
			var(--cw-vpd-header)
		);
		box-shadow:
			inset 0 -4px 0 color-mix(in srgb, var(--cw-vpd-selection) 80%, transparent),
			inset 0 0 0 1px color-mix(in srgb, white 18%, transparent);
		color: #ffffff;
		z-index: 7;
	}

	.cw-vpd-chart__header--current .cw-vpd-chart__header-text {
		font-size: 0.9rem;
		font-weight: 900;
		transform: scale(var(--cw-vpd-axis-text-scale));
	}

	.cw-vpd-chart__row-header,
	.cw-vpd-chart__fahrenheit {
		background: var(--cw-vpd-axis);
		color: var(--cw-chart-card-title, var(--cw-text-primary));
		font-size: 0.8rem;
		font-variant-numeric: tabular-nums;
		min-width: var(--cw-vpd-sticky-c);
		padding: 0.74rem 0.6rem;
		position: sticky;
		z-index: 2;
	}

	.cw-vpd-chart__row-header {
		left: 0;
		z-index: 4;
	}

	.cw-vpd-chart__fahrenheit {
		border-right-color: var(--cw-vpd-axis-strong);
		color: var(--cw-text-secondary, #475569);
		left: var(--cw-vpd-sticky-c);
		min-width: var(--cw-vpd-sticky-f);
		z-index: 4;
	}

	.cw-vpd-chart__row-header--current,
	.cw-vpd-chart__fahrenheit--current {
		background: color-mix(
			in srgb,
			var(--cw-vpd-selection) 26%,
			var(--cw-vpd-axis)
		);
		box-shadow: inset -3px 0 0 color-mix(in srgb, var(--cw-vpd-selection)
					82%, transparent);
		color: var(--cw-chart-card-title, var(--cw-text-primary));
		z-index: 5;
	}

	.cw-vpd-chart__row-header--current .cw-vpd-chart__row-label,
	.cw-vpd-chart__fahrenheit--current .cw-vpd-chart__fahrenheit-label {
		font-size: 0.95rem;
		font-weight: 900;
		transform: scale(var(--cw-vpd-axis-text-scale));
	}

	.cw-vpd-chart__cell {
		color: #102131;
		font-size: 0.8rem;
		font-variant-numeric: tabular-nums;
		font-weight: 700;
		min-width: 4.55rem;
		position: relative;
	}

	.cw-vpd-chart__cell span {
		display: block;
		padding: 0.8rem 0.55rem;
	}

	.cw-vpd-chart__cell--wet {
		background: var(--cw-vpd-wet);
		color: #eff6ff;
	}
	.cw-vpd-chart__cell--humid {
		background: var(--cw-vpd-humid);
	}
	.cw-vpd-chart__cell--balanced {
		background: var(--cw-vpd-balanced);
	}
	.cw-vpd-chart__cell--optimal {
		background: var(--cw-vpd-optimal);
	}
	.cw-vpd-chart__cell--firm {
		background: var(--cw-vpd-firm);
	}
	.cw-vpd-chart__cell--dry {
		background: var(--cw-vpd-dry);
	}
	.cw-vpd-chart__cell--stress {
		background: var(--cw-vpd-stress);
		color: #fff7ed;
	}

	.cw-vpd-chart__cell--target {
		box-shadow:
			inset 0 0 0 2px var(--cw-vpd-selection-ring),
			inset 0 0 0 4px
				color-mix(in srgb, var(--cw-vpd-selection) 32%, transparent);
	}

	.cw-vpd-chart__cell--current {
		z-index: 2;
	}

	.cw-vpd-chart__cell--current .cw-vpd-chart__cell-value {
		font-size: 0.72rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		transform: scale(var(--cw-vpd-current-text-scale));
	}

	.cw-vpd-chart__cell--current::after {
		border: 3px solid var(--cw-vpd-selection-ring);
		border-radius: 0.7rem;
		box-shadow:
			0 0 0 2px
				color-mix(in srgb, var(--cw-vpd-selection) 42%, transparent),
			0 0 0 7px color-mix(in srgb, white 18%, transparent);
		content: "";
		inset: 0.32rem;
		pointer-events: none;
		position: absolute;
	}

	.cw-vpd-chart__matrix tr:last-child th,
	.cw-vpd-chart__matrix tr:last-child td {
		border-bottom: 1px solid var(--cw-vpd-grid);
	}

	.cw-vpd-chart__matrix tr th:first-child,
	.cw-vpd-chart__matrix tr td:first-child {
		border-left: 1px solid var(--cw-vpd-grid);
	}

	.cw-vpd-chart__sr-only {
		border: 0;
		clip: rect(0 0 0 0);
		height: 1px;
		margin: -1px;
		overflow: hidden;
		padding: 0;
		position: absolute;
		white-space: nowrap;
		width: 1px;
	}

	@media (max-width: 48rem) {
		.cw-vpd-chart__matrix thead th,
		.cw-vpd-chart__row-header,
		.cw-vpd-chart__fahrenheit,
		.cw-vpd-chart__cell span {
			padding-inline: 0.5rem;
		}

		.cw-vpd-chart__cell,
		.cw-vpd-chart__matrix thead th:not(:first-child):not(:nth-child(2)) {
			min-width: 4rem;
		}
	}
</style>
