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
		/** Text after the room VPD value. Default: `room VPD · {temp} / {rh} RH`. */
		roomVpd?: (temperature: string, humidity: string) => string;
		/** Prefix for the target range line. Default: "Target". */
		target?: string;
		/** Status text when the current VPD is inside the target band. Default: "on target". */
		onTarget?: string;
		/** Status text when the current VPD is outside the target band. Default: "steer back to band". */
		offTarget?: string;
		/** Legend text for the target-band swatch. Default: "in target band". */
		inTargetBand?: string;
		/** Marker shown above the live cell. Default: "Now". */
		now?: string;
		/** Accessible text announced while `loading` is true. Default: "Loading VPD chart". */
		loading?: string;
	}

	/**
	 * One fill per VPD zone. Cells and the legend use the same stepped colours,
	 * so what you see in the grid is exactly what the legend explains.
	 */
	export const CW_VPD_ZONE_COLORS: Record<VpdZoneKey, string> = {
		wet: "#2563eb",
		humid: "#0e97b5",
		balanced: "#14b8a6",
		optimal: "#22c55e",
		firm: "#a3d635",
		dry: "#f59e0b",
		stress: "#dc2626",
	};

	function relativeLuminance(hex: string): number {
		const h = hex.replace("#", "");
		const channel = (i: number) => {
			const c = parseInt(h.slice(i, i + 2), 16) / 255;
			return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		};
		return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
	}

	/** Dark or light text, whichever contrasts more with the zone fill. */
	const ZONE_TEXT: Record<VpdZoneKey, string> = Object.fromEntries(
		Object.entries(CW_VPD_ZONE_COLORS).map(([key, hex]) => {
			const lum = relativeLuminance(hex);
			const onWhite = 1.05 / (lum + 0.05);
			const onInk = (lum + 0.05) / 0.0555;
			return [key, onInk >= onWhite ? "#0b1220" : "#ffffff"];
		}),
	) as Record<VpdZoneKey, string>;
</script>

<script lang="ts">
	import type { CwNoDataMessage } from "../types/index.js";
	import { formatCwNumber } from "../utils/cwFormat.js";
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
	}

	interface MatrixRow {
		temperatureC: number;
		temperatureF: number;
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
		/** Dim the matrix and hide the live readout while data is loading. */
		loading?: boolean;
		/** BCP 47 locale for number formatting. Defaults to the runtime locale. */
		locale?: string;
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
		loading = false,
		locale,
		labels = {},
		class: className = "",
	}: Props = $props();

	const zoneLabels = $derived({ ...DEFAULT_ZONE_LABELS, ...labels.zones });
	const caption = $derived(labels.caption ?? DEFAULT_CAPTION);
	const cellAriaLabel = $derived(labels.cellAriaLabel ?? defaultCellAriaLabel);
	const text = $derived({
		roomVpd:
			labels.roomVpd ??
			((temperature: string, humidity: string) => `room VPD · ${temperature} / ${humidity} RH`),
		target: labels.target ?? "Target",
		onTarget: labels.onTarget ?? "on target",
		offTarget: labels.offTarget ?? "steer back to band",
		inTargetBand: labels.inTargetBand ?? "in target band",
		now: labels.now ?? "Now",
		loading: labels.loading ?? "Loading VPD chart",
	});

	const vpdFormatter = $derived(
		new Intl.NumberFormat(locale, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}),
	);
	const zoneOrder = VPD_ZONES.map((zone) => zone.key);

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

	// The grid itself is static for a given temps/humidities/target combination;
	// the "current reading" highlight is computed in the template instead, so a
	// live temperature/humidity tick doesn't rebuild every cell object and
	// re-diff the whole table.
	const matrixRows = $derived.by<MatrixRow[]>(() =>
		resolvedTemperatures.map((temperatureC) => ({
			temperatureC,
			temperatureF: toFahrenheit(temperatureC),
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
				};
			}),
		})),
	);
	const hasTargetBand = $derived(
		(targetMin !== undefined && targetMin !== null) ||
			(targetMax !== undefined && targetMax !== null),
	);
	const currentRoomVpd = $derived(
		airTemperatureValue === null || relativeHumidityValue === null
			? null
			: calculateRoomVpd(airTemperatureValue, relativeHumidityValue),
	);
	const currentInTarget = $derived(
		currentRoomVpd !== null &&
			hasTargetBand &&
			currentRoomVpd >= normalizedTarget.min &&
			currentRoomVpd <= normalizedTarget.max,
	);
</script>

<section
	class={[
		"cw-vpd-chart",
		"cw-no-data-host",
		hasNoData && "cw-no-data-host--active",
		loading && "cw-vpd-chart--loading",
		className,
	]}
	aria-busy={loading || undefined}
>
	{#if loading}
		<p class="cw-vpd-chart__sr-only" role="status">{text.loading}</p>
	{:else if currentRoomVpd !== null}
		<div class="cw-vpd-chart__readout">
			<div class="cw-vpd-chart__readout-main">
				<b>{vpdFormatter.format(currentRoomVpd)}&nbsp;{unit}</b>
				<span
					>{text.roomVpd(
						`${formatCwNumber(airTemperatureValue, { locale, maximumFractionDigits: 1 })}°C`,
						`${formatCwNumber(relativeHumidityValue, { locale, maximumFractionDigits: 0 })}%`,
					)}</span
				>
			</div>
			{#if hasTargetBand}
				<p class="cw-vpd-chart__readout-target">
					{text.target}
					{vpdFormatter.format(normalizedTarget.min)}–{vpdFormatter.format(
						normalizedTarget.max,
					)}&nbsp;{unit} ·
					<strong class={currentInTarget ? "is-on" : "is-off"}
						>{currentInTarget ? text.onTarget : text.offTarget}</strong
					>
				</p>
			{/if}
		</div>
	{/if}

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
					{@const rowIsCurrent = nearestTemperature === row.temperatureC}
					<tr>
						<th
							scope="row"
							class={rowIsCurrent
								? "cw-vpd-chart__row-header cw-vpd-chart__row-header--current"
								: "cw-vpd-chart__row-header"}
						>
							<span class="cw-vpd-chart__row-label">{row.temperatureC}</span>
						</th>
						{#if useF}
							<td
								class={rowIsCurrent
									? "cw-vpd-chart__fahrenheit cw-vpd-chart__fahrenheit--current"
									: "cw-vpd-chart__fahrenheit"}
							>
								<span class="cw-vpd-chart__fahrenheit-label">{row.temperatureF}</span>
							</td>
						{/if}
						{#each row.cells as cell (`${row.temperatureC}-${cell.humidity}`)}
							{@const cellIsCurrent = !loading && rowIsCurrent && nearestHumidity === cell.humidity}
							<td
								class={[
									"cw-vpd-chart__cell",
									cell.inTarget && "cw-vpd-chart__cell--target",
									cellIsCurrent && "cw-vpd-chart__cell--current",
								]}
								style:background={CW_VPD_ZONE_COLORS[cell.zone]}
								style:color={ZONE_TEXT[cell.zone]}
								aria-label={cellAriaLabel({
									temperatureC: row.temperatureC,
									humidity: cell.humidity,
									vpd: vpdFormatter.format(cell.vpd),
									unit,
									zoneLabel: cell.zoneLabel,
									inTarget: cell.inTarget,
									isCurrent: cellIsCurrent,
								})}
							>
								<span class="cw-vpd-chart__cell-value">{vpdFormatter.format(cell.vpd)}</span>
									{#if cellIsCurrent}
										<b class="cw-vpd-chart__cell-marker" aria-hidden="true">{text.now}</b>
									{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="cw-vpd-chart__legend" aria-hidden="true">
		<ul class="cw-vpd-chart__legend-zones">
			{#each zoneOrder as zone (zone)}
				<li>
					<span class="cw-vpd-chart__legend-zone" style:background={CW_VPD_ZONE_COLORS[zone]}
					></span>
					{zoneLabels[zone]}
				</li>
			{/each}
		</ul>
		{#if hasTargetBand}
			<span class="cw-vpd-chart__legend-target">
				<span class="cw-vpd-chart__legend-swatch"></span>
				{text.inTargetBand}
			</span>
		{/if}
	</div>

	{#if hasNoData}
		<CwNoDataOverlay message={noDataMessage} />
	{/if}
</section>

<style>
	.cw-vpd-chart {
		background: var(--cw-chart-card-bg, var(--cw-bg-surface));
		border: 1px solid var(--cw-chart-card-border, var(--cw-border-default));
		border-radius: var(--cw-card-radius, var(--cw-radius-xl));
		box-shadow: var(--cw-chart-card-shadow, var(--cw-shadow-md));
		color: var(--cw-text-primary);
		display: flex;
		flex-direction: column;
		font-family: var(--cw-font-family);
		gap: var(--cw-space-4);
		padding: var(--cw-space-5);
		position: relative;
	}

	.cw-vpd-chart--loading .cw-vpd-chart__cell {
		filter: saturate(0.2);
		opacity: 0.5;
		animation: cw-vpd-pulse 1.4s var(--cw-ease-default) infinite;
	}

	@keyframes cw-vpd-pulse {
		50% {
			opacity: 0.3;
		}
	}

	.cw-vpd-chart__readout {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.cw-vpd-chart__readout-main {
		align-items: baseline;
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
	}

	.cw-vpd-chart__readout-main b {
		color: var(--cw-text-primary);
		font-size: var(--cw-text-xl);
		font-variant-numeric: tabular-nums;
		font-weight: var(--cw-font-bold);
		white-space: nowrap;
	}

	.cw-vpd-chart__readout-main span {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
	}

	.cw-vpd-chart__readout-target {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		margin: 0;
	}

	.cw-vpd-chart__readout-target .is-on {
		color: var(--cw-tone-success-text);
	}

	.cw-vpd-chart__readout-target .is-off {
		color: var(--cw-tone-danger-text);
	}

	.cw-vpd-chart__matrix-scroll {
		overflow-x: auto;
	}

	.cw-vpd-chart__matrix {
		border-collapse: separate;
		border-spacing: 3px;
		min-width: max-content;
		width: 100%;
	}

	.cw-vpd-chart__matrix thead th {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-xs);
		font-variant-numeric: tabular-nums;
		font-weight: var(--cw-font-bold);
		padding: 0.15rem 0.2rem;
		text-align: center;
	}

	.cw-vpd-chart__matrix thead th:first-child {
		color: var(--cw-text-primary);
		text-align: left;
	}

	.cw-vpd-chart__header-text,
	.cw-vpd-chart__row-label,
	.cw-vpd-chart__fahrenheit-label,
	.cw-vpd-chart__cell-value {
		display: inline-block;
		line-height: 1;
	}

	.cw-vpd-chart__header--current {
		color: var(--cw-accent);
	}

	.cw-vpd-chart__header--current .cw-vpd-chart__header-text {
		font-weight: 900;
	}

	.cw-vpd-chart__row-header,
	.cw-vpd-chart__fahrenheit {
		color: var(--cw-text-primary);
		font-size: var(--cw-text-xs);
		font-variant-numeric: tabular-nums;
		font-weight: var(--cw-font-bold);
		padding-right: var(--cw-space-2);
		text-align: right;
		white-space: nowrap;
	}

	.cw-vpd-chart__fahrenheit {
		color: var(--cw-text-muted);
	}

	.cw-vpd-chart__row-header--current,
	.cw-vpd-chart__fahrenheit--current {
		color: var(--cw-accent);
	}

	.cw-vpd-chart__row-header--current .cw-vpd-chart__row-label,
	.cw-vpd-chart__fahrenheit--current .cw-vpd-chart__fahrenheit-label {
		font-weight: 900;
	}

	.cw-vpd-chart__cell {
		border-radius: var(--cw-radius-sm);
		font-size: var(--cw-text-xs);
		font-variant-numeric: tabular-nums;
		font-weight: var(--cw-font-semibold);
		min-width: 2.6rem;
		position: relative;
		text-align: center;
	}

	.cw-vpd-chart__cell span {
		display: block;
		padding: 0.45rem 0.3rem;
	}

	.cw-vpd-chart__cell--target {
		/* Ring in the cell's own text colour, so it contrasts with every zone fill. */
		box-shadow:
			inset 0 0 0 2px currentColor,
			0 0 0 1px rgba(0, 0, 0, 0.18);
	}

	.cw-vpd-chart__cell--current {
		overflow: visible;
		z-index: 3;
	}

	/* Radar-ping halo pulsing outward to draw the eye to the live cell. */
	.cw-vpd-chart__cell--current::before {
		content: "";
		position: absolute;
		inset: -3px;
		border-radius: 7px;
		pointer-events: none;
		z-index: 0;
		animation: cw-vpd-current-ping 1.6s ease-out infinite;
	}

	/* Lifted high-contrast frame (white + ink rings + shadow) so the cell pops off the grid. */
	.cw-vpd-chart__cell--current::after {
		content: "";
		position: absolute;
		inset: -3px;
		border-radius: 7px;
		box-shadow:
			inset 0 0 0 2px #ffffff,
			inset 0 0 0 4px var(--cw-gray-950),
			0 0 0 2px #ffffff,
			0 8px 18px color-mix(in srgb, var(--cw-gray-950) 60%, transparent);
		pointer-events: none;
		z-index: 1;
	}

	.cw-vpd-chart__cell--current .cw-vpd-chart__cell-value {
		font-size: var(--cw-text-sm);
		font-weight: 900;
		letter-spacing: -0.01em;
		position: relative;
		z-index: 2;
	}

	/* "Now" pin floating above the live cell with a pointer aimed at it. */
	.cw-vpd-chart__cell-marker {
		position: absolute;
		bottom: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
		z-index: 4;
		display: block;
		padding: 2px 8px;
		background: var(--cw-gray-950);
		border-radius: var(--cw-radius-full);
		box-shadow:
			0 0 0 1.5px #ffffff,
			0 5px 12px color-mix(in srgb, var(--cw-gray-950) 60%, transparent);
		color: #ffffff;
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-xs);
		font-weight: 800;
		letter-spacing: 0.1em;
		line-height: 1.4;
		text-shadow: none;
		text-transform: uppercase;
		white-space: nowrap;
		pointer-events: none;
	}

	.cw-vpd-chart__cell-marker::after {
		content: "";
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: var(--cw-gray-950);
	}

	@keyframes cw-vpd-current-ping {
		0% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--cw-accent) 80%, transparent);
		}
		70% {
			box-shadow: 0 0 0 11px color-mix(in srgb, var(--cw-accent) 0%, transparent);
		}
		100% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--cw-accent) 0%, transparent);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cw-vpd-chart__cell--current::before {
			animation: none;
			box-shadow: 0 0 0 3px color-mix(in srgb, var(--cw-accent) 65%, transparent);
		}
	}

	.cw-vpd-chart__legend {
		align-items: center;
		color: var(--cw-text-muted);
		display: flex;
		flex-wrap: wrap;
		font-size: var(--cw-text-xs);
		gap: var(--cw-space-2) var(--cw-space-4);
	}

	.cw-vpd-chart__legend-zones {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-1) var(--cw-space-3);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.cw-vpd-chart__legend-zones li {
		align-items: center;
		display: inline-flex;
		gap: var(--cw-space-1);
	}

	.cw-vpd-chart__legend-zone {
		border-radius: var(--cw-radius-sm);
		display: inline-block;
		height: 0.625rem;
		width: 0.625rem;
	}

	.cw-vpd-chart__legend-target {
		align-items: center;
		display: inline-flex;
		gap: 0.35rem;
		margin-left: auto;
	}

	.cw-vpd-chart__legend-swatch {
		background: var(--cw-bg-muted);
		border-radius: var(--cw-radius-sm);
		box-shadow:
			inset 0 0 0 2px var(--cw-text-primary),
			0 0 0 1px rgba(0, 0, 0, 0.2);
		display: inline-block;
		height: 0.7rem;
		width: 0.7rem;
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

	@media (max-width: 480px) {
		.cw-vpd-chart {
			padding: var(--cw-space-3);
		}
	}

	@media (max-width: 48rem) {
		.cw-vpd-chart__cell {
			min-width: 2.2rem;
		}

		.cw-vpd-chart__cell span {
			padding-inline: 0.25rem;
		}
	}
</style>
