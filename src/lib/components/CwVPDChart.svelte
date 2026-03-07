<script lang="ts">
	import type {
		CwVPDStageBand,
		CwVPDStageBandTone,
		CwVPDStatus,
	} from "../types/index.js";

	interface Props {
		current?: number;
		targetMin: number;
		targetMax: number;
		plant?: string;
		growthStage?: string;
		unit?: string;
		useF?: boolean;
		airTemperatureC?: number;
		leafTemperatureC?: number;
		relativeHumidity?: number;
		updatedAt?: string | Date | number;
		showSummary?: boolean;
		showLegend?: boolean;
		temperatureValuesC?: number[];
		humidityValues?: number[];
		stageBands?: CwVPDStageBand[];
		class?: string;
	}

	interface ResolvedStageBand {
		label: string;
		min: number;
		max: number;
		tone: CwVPDStageBandTone;
	}

	type VpdZoneKey =
		| "wet"
		| "humid"
		| "balanced"
		| "optimal"
		| "firm"
		| "dry"
		| "stress";

	interface VpdZone {
		key: VpdZoneKey;
		label: string;
		min: number;
		max: number;
		guidance: string;
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

	const DEFAULT_TEMPERATURES_C = Array.from(
		{ length: 21 },
		(_, index) => index + 15,
	);
	const DEFAULT_HUMIDITIES = Array.from(
		{ length: 12 },
		(_, index) => 35 + index * 5,
	);
	const DEFAULT_STAGE_BANDS: ResolvedStageBand[] = [
		{ label: "Propagation / Early veg", min: 0, max: 0.8, tone: "humid" },
		{ label: "Vegetative steering", min: 0.8, max: 1.2, tone: "balanced" },
		{
			label: "Flower / generative",
			min: 1.2,
			max: Number.POSITIVE_INFINITY,
			tone: "flower",
		},
	];
	const VPD_ZONES: VpdZone[] = [
		{
			key: "wet",
			label: "Wet",
			min: 0,
			max: 0.4,
			guidance: "Condensation and pathogen pressure climb quickly.",
		},
		{
			key: "humid",
			label: "Humid",
			min: 0.4,
			max: 0.8,
			guidance: "Low transpiration; common for clones and fresh cuts.",
		},
		{
			key: "balanced",
			label: "Balanced",
			min: 0.8,
			max: 1.0,
			guidance: "Comfortable pull for leafy or vegetative rooms.",
		},
		{
			key: "optimal",
			label: "Optimal",
			min: 1.0,
			max: 1.2,
			guidance: "Classic production sweet spot for many crop phases.",
		},
		{
			key: "firm",
			label: "Firm",
			min: 1.2,
			max: 1.4,
			guidance: "Useful for generative steering and stronger dry-back.",
		},
		{
			key: "dry",
			label: "Dry",
			min: 1.4,
			max: 1.6,
			guidance: "Irrigation demand rises and stress starts to show.",
		},
		{
			key: "stress",
			label: "Stress",
			min: 1.6,
			max: Number.POSITIVE_INFINITY,
			guidance: "Excessively dry for most rooms; burn risk increases.",
		},
	];

	let {
		current,
		targetMin,
		targetMax,
		plant = "",
		growthStage = "",
		unit = "kPa",
		airTemperatureC,
		leafTemperatureC,
		relativeHumidity,
		updatedAt,
		showSummary = true,
		showLegend = true,
		temperatureValuesC,
		useF = false,
		humidityValues,
		stageBands,
		class: className = "",
	}: Props = $props();

	const uid = $props.id();
	const vpdFormatter = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	const rangeFormatter = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	});
	const climateFormatter = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 1,
	});
	const deltaFormatter = new Intl.NumberFormat(undefined, {
		signDisplay: "always",
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	});

	function toDate(input: string | Date | number): Date {
		if (input instanceof Date) return input;
		if (typeof input === "number") {
			return new Date(input < 1_000_000_000_000 ? input * 1000 : input);
		}
		return new Date(input);
	}

	function formatUpdatedAt(input: string | Date | number): string {
		const date = toDate(input);
		return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
	}

	function toFahrenheit(tempC: number): number {
		return Math.round(tempC * (9 / 5) + 32);
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

	function formatRangeValue(value: number): string {
		return rangeFormatter.format(value);
	}

	function formatBandRange(min: number, max: number): string {
		return Number.isFinite(max)
			? `${formatRangeValue(min)}-${formatRangeValue(max)} ${unit}`
			: `${formatRangeValue(min)}+ ${unit}`;
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

	const normalizedTarget = $derived.by(() => ({
		min: Math.min(targetMin, targetMax),
		max: Math.max(targetMin, targetMax),
	}));

	const resolvedTemperatures = $derived.by(() =>
		normalizeNumberList(temperatureValuesC, DEFAULT_TEMPERATURES_C),
	);
	const resolvedHumidities = $derived.by(() =>
		normalizeNumberList(humidityValues, DEFAULT_HUMIDITIES),
	);

	const resolvedStageBands = $derived.by(() => {
		if (!stageBands?.length) {
			return DEFAULT_STAGE_BANDS;
		}

		return stageBands
			.map((band, index) => ({
				label: band.label,
				min: band.min,
				max: band.max ?? Number.POSITIVE_INFINITY,
				tone:
					band.tone ?? DEFAULT_STAGE_BANDS[index]?.tone ?? "balanced",
			}))
			.sort((a, b) => a.min - b.min);
	});

	const derivedCurrent = $derived.by(() => {
		if (airTemperatureC === undefined || relativeHumidity === undefined) {
			return null;
		}

		return calculateRoomVpd(airTemperatureC, relativeHumidity);
	});

	const effectiveCurrent = $derived(current ?? derivedCurrent);
	const currentZone = $derived.by(() => {
		if (effectiveCurrent === null) return null;
		return resolveZone(effectiveCurrent);
	});
	const status = $derived.by<CwVPDStatus | null>(() => {
		if (effectiveCurrent === null) {
			return null;
		}

		if (effectiveCurrent < normalizedTarget.min) return "low";
		if (effectiveCurrent > normalizedTarget.max) return "high";
		return "optimal";
	});
	const statusLabel = $derived(
		status === null
			? "Awaiting reading"
			: status === "low"
				? "Too humid"
				: status === "high"
					? "Too dry"
					: "On target",
	);
	const deltaMessage = $derived.by(() => {
		if (effectiveCurrent === null) {
			return "Provide air temperature and relative humidity to place the live room on the chart.";
		}

		if (status === "low") {
			return `${vpdFormatter.format(normalizedTarget.min - effectiveCurrent)} ${unit} below target. Reduce RH or add heat to move into range.`;
		}

		if (status === "high") {
			return `${vpdFormatter.format(effectiveCurrent - normalizedTarget.max)} ${unit} above target. Raise RH or back off room temperature to soften the pull.`;
		}

		return "Live reading sits inside the selected target band.";
	});

	const formattedCurrent = $derived(
		effectiveCurrent === null
			? "No live reading"
			: `${vpdFormatter.format(effectiveCurrent)} ${unit}`,
	);
	const formattedTargetRange = $derived(
		`${formatRangeValue(normalizedTarget.min)}-${formatRangeValue(normalizedTarget.max)} ${unit}`,
	);
	const updatedLabel = $derived(
		updatedAt === undefined ? "" : formatUpdatedAt(updatedAt),
	);
	const heading = $derived(
		plant.trim() ? `${plant} room VPD` : "Room VPD heatmap",
	);
	const climateLabel = $derived.by(() => {
		if (airTemperatureC === undefined || relativeHumidity === undefined) {
			return "";
		}

		return `${climateFormatter.format(airTemperatureC)}°C at ${climateFormatter.format(relativeHumidity)}% RH`;
	});
	const leafTemperatureLabel = $derived(
		leafTemperatureC === undefined
			? ""
			: `${climateFormatter.format(leafTemperatureC)}°C`,
	);
	const leafDeltaLabel = $derived.by(() => {
		if (leafTemperatureC === undefined || airTemperatureC === undefined) {
			return "";
		}

		return `${deltaFormatter.format(leafTemperatureC - airTemperatureC)}°C vs air`;
	});
	const readingSourceLabel = $derived(
		current !== undefined
			? "Using provided VPD reading"
			: derivedCurrent !== null
				? "Derived from room temperature and RH"
				: "Waiting for live climate inputs",
	);

	const nearestTemperature = $derived.by(() =>
		airTemperatureC === undefined
			? null
			: nearestValue(resolvedTemperatures, airTemperatureC),
	);
	const nearestHumidity = $derived.by(() =>
		relativeHumidity === undefined
			? null
			: nearestValue(resolvedHumidities, relativeHumidity),
	);
	const mappedCellLabel = $derived.by(() => {
		if (nearestTemperature === null || nearestHumidity === null) {
			return "";
		}

		return `${nearestTemperature}°C / ${nearestHumidity}% RH`;
	});

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
					zoneLabel: zone.label,
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

	const srSummary = $derived.by(() => {
		const parts = [
			heading,
			`Selected target ${formattedTargetRange}`,
			`Status ${statusLabel}`,
			deltaMessage,
		];

		if (effectiveCurrent !== null)
			parts.push(`Current VPD ${formattedCurrent}`);
		if (currentZone) parts.push(`Current zone ${currentZone.label}`);
		if (climateLabel) parts.push(`Climate ${climateLabel}`);
		if (mappedCellLabel)
			parts.push(`Nearest chart cell ${mappedCellLabel}`);
		if (leafTemperatureLabel)
			parts.push(`Leaf temperature ${leafTemperatureLabel}`);
		if (leafDeltaLabel) parts.push(`Leaf offset ${leafDeltaLabel}`);
		return `${parts.join(". ")}.`;
	});
</script>

<section class={["cw-vpd-chart", className]} aria-labelledby={`${uid}-title`}>
	<div class="cw-vpd-chart__header">
		<div class="cw-vpd-chart__header-copy">
			<p class="cw-vpd-chart__eyebrow">Vapor Pressure Deficit</p>
			<div class="cw-vpd-chart__title-row">
				<h3 id="{uid}-title" class="cw-vpd-chart__title">{heading}</h3>
				{#if growthStage.trim()}
					<span class="cw-vpd-chart__stage-pill">{growthStage}</span>
				{/if}
			</div>
			<p class="cw-vpd-chart__subtitle">
				Industry-style VPD coloring is mapped directly from the kPa
				value: blue stays wet, green is productive, and yellow through
				red shows progressively drier pressure.
			</p>
		</div>

		<div class="cw-vpd-chart__reading">
			<div class="cw-vpd-chart__reading-head">
				<span class="cw-vpd-chart__reading-label">Current VPD</span>
				{#if currentZone}
					<span
						class={[
							"cw-vpd-chart__zone-pill",
							`cw-vpd-chart__zone-pill--${currentZone.key}`,
						]}
					>
						{currentZone.label}
					</span>
				{/if}
			</div>
			<strong class="cw-vpd-chart__reading-value"
				>{formattedCurrent}</strong
			>
			<small>{readingSourceLabel}</small>
			{#if updatedLabel}
				<small>Updated {updatedLabel}</small>
			{/if}
		</div>
	</div>

	{#if showSummary}
		<dl class="cw-vpd-chart__stats">
			<div class="cw-vpd-chart__stat">
				<dt>Target band</dt>
				<dd>{formattedTargetRange}</dd>
			</div>

			<div
				class={[
					"cw-vpd-chart__stat",
					"cw-vpd-chart__stat--status",
					status
						? `cw-vpd-chart__stat--${status}`
						: "cw-vpd-chart__stat--pending",
				]}
			>
				<dt>Status</dt>
				<dd>{statusLabel}</dd>
			</div>

			<div class="cw-vpd-chart__stat">
				<dt>Heatmap zone</dt>
				<dd>{currentZone ? currentZone.label : "No zone mapped"}</dd>
			</div>

			<div class="cw-vpd-chart__stat">
				<dt>Room climate</dt>
				<dd>{climateLabel || "Waiting for temperature and RH"}</dd>
			</div>

			<div class="cw-vpd-chart__stat">
				<dt>Mapped cell</dt>
				<dd>{mappedCellLabel || "No live cell mapped"}</dd>
			</div>

			{#if leafTemperatureLabel}
				<div class="cw-vpd-chart__stat">
					<dt>Leaf temp</dt>
					<dd>
						{leafTemperatureLabel}{leafDeltaLabel
							? ` (${leafDeltaLabel})`
							: ""}
					</dd>
				</div>
			{/if}
		</dl>
	{/if}

	{#if showLegend}
		<div class="cw-vpd-chart__legend-shell">
			<div class="cw-vpd-chart__legend-group">
				<p class="cw-vpd-chart__legend-title">Heatmap zones</p>
				<div class="cw-vpd-chart__legend-grid">
					{#each VPD_ZONES as zone (zone.key)}
						<div
							class={[
								"cw-vpd-chart__legend-item",
								`cw-vpd-chart__legend-item--${zone.key}`,
							]}
						>
							<span
								class="cw-vpd-chart__legend-swatch"
								aria-hidden="true"
							></span>
							<div>
								<strong>{zone.label}</strong>
								<span
									>{formatBandRange(zone.min, zone.max)}</span
								>
								<small>{zone.guidance}</small>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="cw-vpd-chart__legend-group">
				<p class="cw-vpd-chart__legend-title">
					{stageBands?.length
						? "Program references"
						: "Common program references"}
				</p>
				<div class="cw-vpd-chart__program-grid">
					{#each resolvedStageBands as band (band.label)}
						<div
							class={[
								"cw-vpd-chart__program-chip",
								`cw-vpd-chart__program-chip--${band.tone}`,
							]}
						>
							<strong>{band.label}</strong>
							<span>{formatBandRange(band.min, band.max)}</span>
						</div>
					{/each}

					<div
						class="cw-vpd-chart__program-chip cw-vpd-chart__program-chip--target"
					>
						<strong>Selected target</strong>
						<span>{formattedTargetRange}</span>
					</div>

					<div
						class="cw-vpd-chart__program-chip cw-vpd-chart__program-chip--current"
					>
						<strong>Live room marker</strong>
						<span>White ring on the nearest cell</span>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<div class="cw-vpd-chart__matrix-shell">
		<div class="cw-vpd-chart__matrix-header">
			<div class="cw-vpd-chart__axis-copy">
				<span>Rows: temperature</span>
				<span>Columns: relative humidity</span>
			</div>
			<p id="{uid}-summary" class="cw-vpd-chart__matrix-note">
				The chart follows common grow-room VPD palettes. Blue is wetter,
				green is healthier, and yellow to red is increasingly dry. Cells
				inside your target window get an inset outline.
			</p>
		</div>

		<div class="cw-vpd-chart__matrix-scroll">
			<table
				class="cw-vpd-chart__matrix"
				aria-describedby="{uid}-summary"
			>
				<caption class="cw-vpd-chart__sr-only">{srSummary}</caption>
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
								<span class="cw-vpd-chart__header-text"
									>{humidity}%</span
								>
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
								<span class="cw-vpd-chart__row-label"
									>{row.temperatureC}</span
								>
							</th>
							{#if useF}
								<td
									class={row.isCurrent
										? "cw-vpd-chart__fahrenheit cw-vpd-chart__fahrenheit--current"
										: "cw-vpd-chart__fahrenheit"}
								>
									<span class="cw-vpd-chart__fahrenheit-label"
										>{row.temperatureF}</span
									>
								</td>
							{/if}
							{#each row.cells as cell (`${row.temperatureC}-${cell.humidity}`)}
								<td
									class={[
										"cw-vpd-chart__cell",
										`cw-vpd-chart__cell--${cell.zone}`,
										cell.inTarget &&
											"cw-vpd-chart__cell--target",
										cell.isCurrent &&
											"cw-vpd-chart__cell--current",
									]}
									aria-label={`${row.temperatureC} degrees Celsius, ${cell.humidity} percent relative humidity, ${vpdFormatter.format(cell.vpd)} ${unit}, ${cell.zoneLabel} zone${cell.inTarget ? ", inside target band" : ""}${cell.isCurrent ? ", current room climate cell" : ""}`}
								>
									<span class="cw-vpd-chart__cell-value"
										>{vpdFormatter.format(cell.vpd)}</span
									>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<p class="cw-vpd-chart__delta">{deltaMessage}</p>
</section>

<style>
	.cw-vpd-chart {
		--cw-vpd-sticky-c: 4.5rem;
		--cw-vpd-sticky-f: 4.5rem;
		--cw-vpd-shell-bg: radial-gradient(
				140% 80% at 0% 0%,
				color-mix(
					in srgb,
					var(--cw-info-500, #4aa3c6) 18%,
					transparent
				),
				transparent 58%
			),
			linear-gradient(
				180deg,
				color-mix(
					in srgb,
					var(--cw-chart-card-bg, var(--cw-bg-surface)) 92%,
					transparent
				),
				color-mix(
					in srgb,
					var(--cw-bg-muted, #e2e8f0) 18%,
					var(--cw-chart-card-bg, var(--cw-bg-surface))
				)
			);
		--cw-vpd-panel: color-mix(
			in srgb,
			var(--cw-chart-card-bg, var(--cw-bg-surface)) 92%,
			var(--cw-bg-muted, #e2e8f0)
		);
		--cw-vpd-panel-strong: color-mix(
			in srgb,
			var(--cw-bg-muted, #e2e8f0) 38%,
			var(--cw-chart-card-bg, var(--cw-bg-surface))
		);
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
		--cw-vpd-selection-soft: color-mix(
			in srgb,
			var(--cw-accent, #2563eb) 22%,
			var(--cw-chart-card-bg, var(--cw-bg-surface))
		);
		--cw-vpd-selection-ring: color-mix(
			in srgb,
			white 88%,
			var(--cw-selection, #0f172a)
		);
		--cw-vpd-current-text-scale: 2;
		--cw-vpd-axis-text-scale: 1.35;
		background: var(--cw-vpd-shell-bg);
		border: 1px solid var(--cw-chart-card-border, var(--cw-border-default));
		border-radius: 1.6rem;
		box-shadow: var(--cw-chart-card-shadow, var(--cw-shadow-md));
		display: grid;
		gap: var(--cw-space-5);
		padding: var(--cw-space-6);
	}

	.cw-vpd-chart__header {
		align-items: flex-start;
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-4);
		justify-content: space-between;
	}

	.cw-vpd-chart__header-copy {
		display: grid;
		gap: var(--cw-space-2);
		max-width: 48rem;
	}

	.cw-vpd-chart__eyebrow {
		color: color-mix(
			in srgb,
			var(--cw-accent, #2563eb) 72%,
			var(--cw-text-primary, #0f172a)
		);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.18em;
		margin: 0;
		text-transform: uppercase;
	}

	.cw-vpd-chart__title-row {
		align-items: center;
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-2);
	}

	.cw-vpd-chart__title {
		color: var(--cw-chart-card-title, var(--cw-text-primary));
		font-size: clamp(1.7rem, 3vw, 2.35rem);
		font-weight: var(--cw-font-semibold);
		letter-spacing: -0.03em;
		margin: 0;
	}

	.cw-vpd-chart__stage-pill {
		background: color-mix(
			in srgb,
			var(--cw-accent, #2563eb) 12%,
			transparent
		);
		border: 1px solid
			color-mix(in srgb, var(--cw-accent, #2563eb) 22%, transparent);
		border-radius: var(--cw-radius-full);
		color: var(--cw-text-secondary, #475569);
		font-size: 0.74rem;
		font-weight: var(--cw-font-medium);
		padding: 0.32rem 0.72rem;
	}

	.cw-vpd-chart__subtitle {
		color: var(--cw-text-secondary, #475569);
		font-size: var(--cw-text-sm);
		line-height: 1.6;
		margin: 0;
		max-width: 64ch;
	}

	.cw-vpd-chart__reading {
		background: color-mix(
			in srgb,
			var(--cw-vpd-panel-strong) 84%,
			transparent
		);
		border: 1px solid
			color-mix(
				in srgb,
				var(--cw-border-default, #94a3b8) 68%,
				transparent
			);
		border-radius: 1.2rem;
		display: grid;
		gap: 0.45rem;
		min-width: min(100%, 19rem);
		padding: 1rem 1.1rem;
	}

	.cw-vpd-chart__reading-head {
		align-items: center;
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		justify-content: space-between;
	}

	.cw-vpd-chart__reading-label,
	.cw-vpd-chart__reading small,
	.cw-vpd-chart__zone-pill {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.cw-vpd-chart__reading-label {
		color: var(--cw-chart-card-muted, var(--cw-text-muted));
	}

	.cw-vpd-chart__reading-value {
		color: var(--cw-chart-card-title, var(--cw-text-primary));
		font-size: clamp(1.75rem, 4vw, 2.45rem);
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	.cw-vpd-chart__reading small {
		color: var(--cw-text-secondary, #475569);
	}

	.cw-vpd-chart__zone-pill {
		border-radius: var(--cw-radius-full);
		color: #0f172a;
		padding: 0.34rem 0.68rem;
	}

	.cw-vpd-chart__zone-pill--wet {
		background: var(--cw-vpd-wet);
		color: #eff6ff;
	}
	.cw-vpd-chart__zone-pill--humid {
		background: var(--cw-vpd-humid);
	}
	.cw-vpd-chart__zone-pill--balanced {
		background: var(--cw-vpd-balanced);
	}
	.cw-vpd-chart__zone-pill--optimal {
		background: var(--cw-vpd-optimal);
	}
	.cw-vpd-chart__zone-pill--firm {
		background: var(--cw-vpd-firm);
	}
	.cw-vpd-chart__zone-pill--dry {
		background: var(--cw-vpd-dry);
	}
	.cw-vpd-chart__zone-pill--stress {
		background: var(--cw-vpd-stress);
		color: #fff7ed;
	}

	.cw-vpd-chart__stats {
		display: grid;
		gap: var(--cw-space-3);
		grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
		margin: 0;
	}

	.cw-vpd-chart__stat {
		background: color-mix(in srgb, var(--cw-vpd-panel) 92%, transparent);
		border: 1px solid
			color-mix(
				in srgb,
				var(--cw-border-default, #94a3b8) 72%,
				transparent
			);
		border-radius: 1rem;
		display: grid;
		gap: 0.42rem;
		padding: 0.95rem 1rem;
	}

	.cw-vpd-chart__stat dt {
		color: var(--cw-chart-card-muted, var(--cw-text-muted));
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		margin: 0;
		text-transform: uppercase;
	}

	.cw-vpd-chart__stat dd {
		color: var(--cw-chart-card-title, var(--cw-text-primary));
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		font-variant-numeric: tabular-nums;
		line-height: 1.45;
		margin: 0;
	}

	.cw-vpd-chart__stat--status {
		border-color: transparent;
	}

	.cw-vpd-chart__stat--pending {
		background: color-mix(
			in srgb,
			var(--cw-vpd-panel-strong) 92%,
			transparent
		);
	}

	.cw-vpd-chart__stat--low {
		background: color-mix(in srgb, var(--cw-vpd-humid) 28%, transparent);
	}

	.cw-vpd-chart__stat--optimal {
		background: color-mix(in srgb, var(--cw-vpd-optimal) 32%, transparent);
	}

	.cw-vpd-chart__stat--high {
		background: color-mix(in srgb, var(--cw-vpd-dry) 32%, transparent);
	}

	.cw-vpd-chart__legend-shell {
		display: grid;
		gap: var(--cw-space-4);
	}

	.cw-vpd-chart__legend-group {
		display: grid;
		gap: var(--cw-space-3);
	}

	.cw-vpd-chart__legend-title {
		color: var(--cw-chart-card-muted, var(--cw-text-muted));
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		margin: 0;
		text-transform: uppercase;
	}

	.cw-vpd-chart__legend-grid,
	.cw-vpd-chart__program-grid {
		display: grid;
		gap: var(--cw-space-3);
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
	}

	.cw-vpd-chart__legend-item,
	.cw-vpd-chart__program-chip {
		background: color-mix(in srgb, var(--cw-vpd-panel) 92%, transparent);
		border: 1px solid
			color-mix(
				in srgb,
				var(--cw-border-default, #94a3b8) 72%,
				transparent
			);
		border-radius: 1rem;
		display: flex;
		gap: 0.85rem;
		padding: 0.9rem 1rem;
	}

	.cw-vpd-chart__legend-item > div,
	.cw-vpd-chart__program-chip {
		display: grid;
		gap: 0.16rem;
	}

	.cw-vpd-chart__legend-item strong,
	.cw-vpd-chart__program-chip strong {
		color: var(--cw-chart-card-title, var(--cw-text-primary));
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
	}

	.cw-vpd-chart__legend-item span,
	.cw-vpd-chart__program-chip span {
		color: var(--cw-text-secondary, #475569);
		font-size: var(--cw-text-xs);
		font-variant-numeric: tabular-nums;
	}

	.cw-vpd-chart__legend-item small {
		color: var(--cw-text-muted, #64748b);
		font-size: 0.73rem;
		line-height: 1.45;
	}

	.cw-vpd-chart__legend-swatch {
		border-radius: 0.85rem;
		flex: 0 0 1rem;
		margin-top: 0.15rem;
		min-height: 3.5rem;
	}

	.cw-vpd-chart__legend-item--wet .cw-vpd-chart__legend-swatch {
		background: var(--cw-vpd-wet);
	}
	.cw-vpd-chart__legend-item--humid .cw-vpd-chart__legend-swatch {
		background: var(--cw-vpd-humid);
	}
	.cw-vpd-chart__legend-item--balanced .cw-vpd-chart__legend-swatch {
		background: var(--cw-vpd-balanced);
	}
	.cw-vpd-chart__legend-item--optimal .cw-vpd-chart__legend-swatch {
		background: var(--cw-vpd-optimal);
	}
	.cw-vpd-chart__legend-item--firm .cw-vpd-chart__legend-swatch {
		background: var(--cw-vpd-firm);
	}
	.cw-vpd-chart__legend-item--dry .cw-vpd-chart__legend-swatch {
		background: var(--cw-vpd-dry);
	}
	.cw-vpd-chart__legend-item--stress .cw-vpd-chart__legend-swatch {
		background: var(--cw-vpd-stress);
	}

	.cw-vpd-chart__program-chip {
		align-content: start;
		position: relative;
	}

	.cw-vpd-chart__program-chip::before {
		background: var(--cw-vpd-balanced);
		border-radius: 999px;
		content: "";
		inset: 0.7rem auto 0.7rem 0.7rem;
		position: absolute;
		width: 0.3rem;
	}

	.cw-vpd-chart__program-chip--humid::before {
		background: var(--cw-vpd-humid);
	}
	.cw-vpd-chart__program-chip--balanced::before {
		background: var(--cw-vpd-balanced);
	}
	.cw-vpd-chart__program-chip--flower::before {
		background: var(--cw-vpd-dry);
	}

	.cw-vpd-chart__program-chip strong,
	.cw-vpd-chart__program-chip span {
		padding-left: 0.9rem;
	}

	.cw-vpd-chart__program-chip--target {
		background: color-mix(
			in srgb,
			var(--cw-vpd-selection-soft) 72%,
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--cw-vpd-selection) 46%,
			transparent
		);
		border-style: dashed;
	}

	.cw-vpd-chart__program-chip--target::before {
		background: transparent;
		border: 2px solid var(--cw-vpd-selection-ring);
		box-shadow:
			0 0 0 1px
				color-mix(in srgb, var(--cw-vpd-selection) 40%, transparent),
			0 0 0 5px
				color-mix(in srgb, var(--cw-vpd-selection) 12%, transparent);
	}

	.cw-vpd-chart__program-chip--current::before {
		background: transparent;
		border: 3px solid var(--cw-vpd-selection-ring);
		box-shadow:
			0 0 0 2px
				color-mix(in srgb, var(--cw-vpd-selection) 42%, transparent),
			0 0 0 7px color-mix(in srgb, white 18%, transparent);
	}

	.cw-vpd-chart__matrix-shell {
		background: color-mix(in srgb, var(--cw-vpd-panel) 94%, transparent);
		border: 1px solid
			color-mix(
				in srgb,
				var(--cw-border-default, #94a3b8) 68%,
				transparent
			);
		border-radius: 1.25rem;
		display: grid;
		gap: var(--cw-space-3);
		padding: 1rem;
	}

	.cw-vpd-chart__matrix-header {
		display: grid;
		gap: 0.55rem;
	}

	.cw-vpd-chart__axis-copy {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
	}

	.cw-vpd-chart__axis-copy span {
		background: color-mix(
			in srgb,
			var(--cw-vpd-panel-strong) 76%,
			transparent
		);
		border: 1px solid
			color-mix(
				in srgb,
				var(--cw-border-default, #94a3b8) 54%,
				transparent
			);
		border-radius: var(--cw-radius-full);
		color: var(--cw-text-secondary, #475569);
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		padding: 0.35rem 0.7rem;
		text-transform: uppercase;
	}

	.cw-vpd-chart__matrix-note {
		color: var(--cw-text-secondary, #475569);
		font-size: var(--cw-text-sm);
		line-height: 1.6;
		margin: 0;
		max-width: 74ch;
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

	.cw-vpd-chart__delta {
		color: var(--cw-text-secondary, #475569);
		font-size: var(--cw-text-sm);
		line-height: 1.6;
		margin: 0;
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
		.cw-vpd-chart {
			padding: var(--cw-space-5);
		}

		.cw-vpd-chart__reading {
			min-width: 100%;
		}

		.cw-vpd-chart__legend-grid,
		.cw-vpd-chart__program-grid {
			grid-template-columns: 1fr;
		}

		.cw-vpd-chart__matrix-shell {
			padding: 0.85rem;
		}

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
