<script lang="ts" module>
	/**
	 * Override display labels for the DLI card (i18n).
	 * All fields are optional; omitted fields fall back to English defaults.
	 */
	export interface DliCardLabels {
		/** Fallback card title shown when no `title` prop is provided. */
		title?: string;
		/** Status label when the value is far below target ("Very low"). */
		statusVeryLow?: string;
		/** Status label when the value is just under target ("Slightly low"). */
		statusSlightlyLow?: string;
		/** Status label when the value is below target ("Low"). */
		statusLow?: string;
		/** Status label when the value is within target ("Good"). */
		statusGood?: string;
		/** Status label when the value is above target ("High"). */
		statusHigh?: string;
		/** Status label when the value is far above target ("Very high"). */
		statusVeryHigh?: string;
		/** Prefix shown before the status value ("Status:"). */
		statusPrefix?: string;
		/** Section heading for the daily history chart ("Daily history"). */
		historyTitle?: string;
		/** Accessible label for the daily history bar list. */
		historyListLabel?: string;
		/** Formats the number of history days shown (e.g. `(7) => "7 days"`). */
		historyCount?: (days: number) => string;
		/** Builds the target text when a crop name is present (e.g. `(crop, range) => "Target for Basil: …"`). */
		targetForCrop?: (cropName: string, range: string) => string;
		/** Builds the target text when no crop name is present (e.g. `(range) => "Target: …"`). */
		target?: (range: string) => string;
		/** Builds the accessible label for the value readout. */
		valueAriaLabel?: (value: string, unit: string, targetText: string, status: string) => string;
		/** Builds the accessible label for the DLI range bar. */
		barAriaLabel?: (
			scaleMax: string,
			value: string,
			unit: string,
			range: string,
			status: string,
		) => string;
	}

	const DEFAULT_LABELS: Required<DliCardLabels> = {
		title: "DLI Today",
		statusVeryLow: "Very low",
		statusSlightlyLow: "Slightly low",
		statusLow: "Low",
		statusGood: "Good",
		statusHigh: "High",
		statusVeryHigh: "Very high",
		statusPrefix: "Status:",
		historyTitle: "Daily history",
		historyListLabel: "Daily DLI history",
		historyCount: (days) => `${days} days`,
		targetForCrop: (cropName, range) => `Target for ${cropName}: ${range}`,
		target: (range) => `Target: ${range}`,
		valueAriaLabel: (value, unit, targetText, status) =>
			`DLI today ${value} ${unit}. ${targetText}. Status: ${status}.`,
		barAriaLabel: (scaleMax, value, unit, range, status) =>
			`DLI range bar from 0 to ${scaleMax} ${unit}. Current value ${value} ${unit}. Target range ${range}. Status: ${status}.`,
	};
</script>

<script lang="ts">
	import type { CwNoDataMessage, DliHistoryPoint, DliStatusLabel } from "../types/index.js";
	import CwNoDataOverlay from "./CwNoDataOverlay.svelte";
	import { getCwNoDataMessage, hasCwNoData } from "./cwNoData.js";

	interface Props {
		value?: number | null;
		targetMin?: number | null;
		targetMax?: number | null;
		max?: number | null;
		cropName?: string;
		title?: string;
		unit?: string;
		showStatus?: boolean;
		history?: DliHistoryPoint[];
		compact?: boolean;
		noData?: CwNoDataMessage;
		labels?: DliCardLabels;
		class?: string;
	}

	interface DisplayHistoryPoint {
		key: string;
		date: string;
		shortDate: string;
		value: number;
		percent: number;
		title: string;
	}

	let {
		value,
		targetMin,
		targetMax,
		max = 40,
		cropName = "",
		title,
		unit = "mol/m²/day",
		showStatus = true,
		history,
		compact = false,
		noData,
		labels = {},
		class: className = "",
	}: Props = $props();

	const l = $derived({ ...DEFAULT_LABELS, ...labels });

	const uid = $props.id();
	const valueFormatter = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 1,
	});
	const scaleFormatter = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 1,
	});
	const historyDateFormatter = new Intl.DateTimeFormat(undefined, {
		month: "short",
		day: "numeric",
	});

	function toFiniteNumber(input: number | null | undefined, fallback: number): number {
		return typeof input === "number" && Number.isFinite(input) ? input : fallback;
	}

	function clamp(input: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, input));
	}

	function percentOnScale(input: number, scaleMax: number): number {
		const bounded = clamp(toFiniteNumber(input, 0), 0, scaleMax);
		return clamp((bounded / scaleMax) * 100, 0, 100);
	}

	function formatDli(input: number): string {
		return valueFormatter.format(toFiniteNumber(input, 0));
	}

	function formatScale(input: number): string {
		return scaleFormatter.format(toFiniteNumber(input, 0));
	}

	function parseLocalDate(input: string): Date | null {
		const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
		if (dateOnly) {
			const [, year, month, day] = dateOnly;
			return new Date(Number(year), Number(month) - 1, Number(day));
		}

		const date = new Date(input);
		return Number.isNaN(date.getTime()) ? null : date;
	}

	function formatHistoryDate(input: string): string {
		const date = parseLocalDate(input);
		return date ? historyDateFormatter.format(date) : input;
	}

	const currentValue = $derived(toFiniteNumber(value, 0));
	const hasNoData = $derived(hasCwNoData(noData));
	const noDataMessage = $derived(getCwNoDataMessage(noData));
	const scaleMax = $derived.by(() => {
		const requestedMax = toFiniteNumber(max, 40);
		return requestedMax > 0 ? requestedMax : 40;
	});

	const normalizedTarget = $derived.by(() => {
		const lowerInput = toFiniteNumber(targetMin, 0);
		const upperInput = toFiniteNumber(targetMax, lowerInput);

		return {
			min: Math.min(lowerInput, upperInput),
			max: Math.max(lowerInput, upperInput),
		};
	});

	const markerPercent = $derived(percentOnScale(currentValue, scaleMax));
	const targetStartPercent = $derived(
		percentOnScale(normalizedTarget.min, scaleMax),
	);
	const targetEndPercent = $derived(
		percentOnScale(normalizedTarget.max, scaleMax),
	);
	const targetWidthPercent = $derived(
		Math.max(0, targetEndPercent - targetStartPercent),
	);
	const markerAlign = $derived(
		markerPercent <= 8 ? "start" : markerPercent >= 92 ? "end" : "center",
	);

	const status = $derived.by<DliStatusLabel>(() => {
		if (currentValue < normalizedTarget.min * 0.5) return "Very low";
		if (
			currentValue >= normalizedTarget.min * 0.85 &&
			currentValue < normalizedTarget.min
		) {
			return "Slightly low";
		}
		if (currentValue < normalizedTarget.min) return "Low";
		if (
			currentValue >= normalizedTarget.min &&
			currentValue <= normalizedTarget.max
		) {
			return "Good";
		}
		if (currentValue > normalizedTarget.max && currentValue <= normalizedTarget.max * 1.2) {
			return "High";
		}
		return "Very high";
	});

	const statusKey = $derived(status.toLowerCase().replaceAll(" ", "-"));
	const statusText = $derived.by(() => {
		switch (status) {
			case "Very low":
				return l.statusVeryLow;
			case "Slightly low":
				return l.statusSlightlyLow;
			case "Low":
				return l.statusLow;
			case "Good":
				return l.statusGood;
			case "High":
				return l.statusHigh;
			case "Very high":
				return l.statusVeryHigh;
		}
	});
	const resolvedTitle = $derived(title ?? l.title);
	const formattedValue = $derived(formatDli(currentValue));
	const formattedScaleMax = $derived(formatScale(scaleMax));
	const formattedTargetRange = $derived(
		`${formatDli(normalizedTarget.min)}–${formatDli(normalizedTarget.max)} ${unit}`,
	);
	const trimmedCropName = $derived(cropName.trim());
	const targetText = $derived(
		trimmedCropName
			? l.targetForCrop(trimmedCropName, formattedTargetRange)
			: l.target(formattedTargetRange),
	);
	const valueAriaLabel = $derived(
		l.valueAriaLabel(formattedValue, unit, targetText, statusText),
	);
	const barAriaLabel = $derived(
		l.barAriaLabel(formattedScaleMax, formattedValue, unit, formattedTargetRange, statusText),
	);

	const historyItems = $derived.by<DisplayHistoryPoint[]>(() => {
		if (!history?.length) return [];

		return history.map((point, index) => {
			const historyValue = toFiniteNumber(point.value, 0);
			const rawPercent = percentOnScale(historyValue, scaleMax);
			const percent = historyValue > 0 ? Math.max(4, rawPercent) : 0;
			const formattedHistoryValue = formatDli(historyValue);
			const shortDate = formatHistoryDate(point.date);

			return {
				key: `${point.date}-${index}`,
				date: point.date,
				shortDate,
				value: historyValue,
				percent,
				title: `${shortDate}: ${formattedHistoryValue} ${unit}`,
			};
		});
	});
</script>

<section
	class="cw-dli-card cw-no-data-host cw-dli-card--{statusKey} {className}"
	class:cw-dli-card--compact={compact}
	class:cw-no-data-host--active={hasNoData}
	aria-labelledby="{uid}-title"
>
	<header class="cw-dli-card__header">
		<div class="cw-dli-card__heading">
			<h3 id="{uid}-title" class="cw-dli-card__title">{resolvedTitle}</h3>
			<p id="{uid}-target" class="cw-dli-card__target">{targetText}</p>
		</div>

		{#if showStatus}
			<p
				id="{uid}-status"
				class="cw-dli-card__status"
				aria-label="{l.statusPrefix} {statusText}"
			>
				<span>{l.statusPrefix}</span>
				<strong>{statusText}</strong>
			</p>
		{/if}
	</header>

	<div class="cw-dli-card__value" aria-label={valueAriaLabel}>
		<strong>{formattedValue}</strong>
		<span>{unit}</span>
	</div>

	<div class="cw-dli-card__range" role="img" aria-label={barAriaLabel}>
		<div class="cw-dli-card__stage">
			<div
				class="cw-dli-card__marker cw-dli-card__marker--{markerAlign}"
				style:left="{markerPercent}%"
				aria-hidden="true"
			>
				<span class="cw-dli-card__marker-label">{formattedValue}</span>
				<span class="cw-dli-card__marker-line"></span>
			</div>

			<div class="cw-dli-card__track">
				<span
					class="cw-dli-card__target-range"
					style:left="{targetStartPercent}%"
					style:width="{targetWidthPercent}%"
				></span>
			</div>
		</div>

		<div class="cw-dli-card__scale" aria-hidden="true">
			<span>0</span>
			<span>{formattedScaleMax}</span>
		</div>
	</div>

	{#if historyItems.length > 0}
		<section class="cw-dli-card__history" aria-labelledby="{uid}-history-title">
			<div class="cw-dli-card__history-head">
				<h4 id="{uid}-history-title">{l.historyTitle}</h4>
				<span>{l.historyCount(historyItems.length)}</span>
			</div>

			<ol class="cw-dli-card__history-bars" aria-label={l.historyListLabel}>
				{#each historyItems as point (point.key)}
					<li
						class="cw-dli-card__history-item"
						title={point.title}
						aria-label={point.title}
					>
						<span
							class="cw-dli-card__history-bar"
							style:height="{point.percent}%"
							aria-hidden="true"
						></span>
						<span class="cw-dli-card__history-date" aria-hidden="true">
							{point.shortDate}
						</span>
					</li>
				{/each}
			</ol>
		</section>
	{/if}

	{#if hasNoData}
		<CwNoDataOverlay message={noDataMessage} />
	{/if}
</section>

<style>
	.cw-dli-card {
		--cw-dli-marker: var(--cw-accent);
		--cw-dli-status-bg: var(--cw-tone-info-bg-subtle);
		--cw-dli-status-text: var(--cw-tone-info-text);
		--cw-dli-status-border: var(--cw-tone-info-border);
		container-type: inline-size;
		display: grid;
		gap: var(--cw-space-5);
		padding: var(--cw-space-5);
		border: 1px solid var(--cw-chart-card-border, var(--cw-border-default));
		border-radius: var(--cw-radius-lg);
		background-color: var(--cw-chart-card-bg, var(--cw-bg-surface));
		box-shadow: var(--cw-chart-card-shadow, var(--cw-shadow-sm));
		color: var(--cw-text-primary);
		min-width: 0;
	}

	.cw-dli-card--very-low,
	.cw-dli-card--very-high {
		--cw-dli-marker: var(--cw-danger-500);
		--cw-dli-status-bg: var(--cw-tone-danger-bg-subtle);
		--cw-dli-status-text: var(--cw-tone-danger-text);
		--cw-dli-status-border: var(--cw-tone-danger-border);
	}

	.cw-dli-card--low,
	.cw-dli-card--slightly-low,
	.cw-dli-card--high {
		--cw-dli-marker: var(--cw-warning-500);
		--cw-dli-status-bg: var(--cw-tone-warning-bg-subtle);
		--cw-dli-status-text: var(--cw-tone-warning-text);
		--cw-dli-status-border: var(--cw-tone-warning-border);
	}

	.cw-dli-card--good {
		--cw-dli-marker: var(--cw-success-500);
		--cw-dli-status-bg: var(--cw-tone-success-bg-subtle);
		--cw-dli-status-text: var(--cw-tone-success-text);
		--cw-dli-status-border: var(--cw-tone-success-border);
	}

	.cw-dli-card--compact {
		gap: var(--cw-space-4);
		padding: var(--cw-space-4);
	}

	.cw-dli-card__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--cw-space-4);
		min-width: 0;
	}

	.cw-dli-card__heading {
		display: grid;
		gap: var(--cw-space-1);
		min-width: 0;
	}

	.cw-dli-card__title {
		margin: 0;
		color: var(--cw-chart-card-title, var(--cw-text-primary));
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-tight);
	}

	.cw-dli-card__target {
		margin: 0;
		color: var(--cw-chart-card-muted, var(--cw-text-secondary));
		font-size: var(--cw-text-sm);
		line-height: var(--cw-leading-normal);
	}

	.cw-dli-card__status {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin: 0;
		padding: 0.35rem 0.65rem;
		border: 1px solid var(--cw-dli-status-border);
		border-radius: var(--cw-radius-full);
		background-color: var(--cw-dli-status-bg);
		color: var(--cw-dli-status-text);
		font-size: var(--cw-text-xs);
		line-height: 1.2;
		white-space: nowrap;
	}

	.cw-dli-card__status strong {
		font-weight: var(--cw-font-semibold);
	}

	.cw-dli-card__value {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: var(--cw-space-2);
		min-width: 0;
	}

	.cw-dli-card__value strong {
		color: var(--cw-text-primary);
		font-size: var(--cw-text-3xl);
		font-variant-numeric: tabular-nums;
		font-weight: var(--cw-font-bold);
		letter-spacing: 0;
		line-height: 1;
	}

	.cw-dli-card--compact .cw-dli-card__value strong {
		font-size: var(--cw-text-2xl);
	}

	.cw-dli-card__value span {
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		line-height: var(--cw-leading-tight);
	}

	.cw-dli-card__range {
		display: grid;
		gap: var(--cw-space-2);
		min-width: 0;
	}

	.cw-dli-card__stage {
		position: relative;
		padding-top: 2rem;
	}

	.cw-dli-card__track {
		position: relative;
		height: 0.9rem;
		overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 78%, transparent);
		border-radius: var(--cw-radius-sm);
		background-color: color-mix(in srgb, var(--cw-bg-muted) 74%, var(--cw-bg-surface));
	}

	.cw-dli-card__target-range {
		position: absolute;
		inset-block: 0;
		min-width: 2px;
		border-inline: 1px solid color-mix(in srgb, var(--cw-success-500) 58%, var(--cw-bg-surface));
		background-color: color-mix(in srgb, var(--cw-success-500) 28%, var(--cw-bg-surface));
	}

	.cw-dli-card__marker {
		position: absolute;
		z-index: 2;
		top: 0;
		display: grid;
		justify-items: center;
		gap: 0.2rem;
		transform: translateX(-50%);
		pointer-events: none;
	}

	.cw-dli-card__marker--start {
		justify-items: start;
		transform: translateX(0);
	}

	.cw-dli-card__marker--end {
		justify-items: end;
		transform: translateX(-100%);
	}

	.cw-dli-card__marker-label {
		padding: 0.15rem 0.45rem;
		border: 1px solid color-mix(in srgb, var(--cw-dli-marker) 58%, var(--cw-bg-surface));
		border-radius: var(--cw-radius-sm);
		background-color: var(--cw-chart-card-bg, var(--cw-bg-surface));
		color: var(--cw-text-primary);
		font-size: var(--cw-text-xs);
		font-variant-numeric: tabular-nums;
		font-weight: var(--cw-font-semibold);
		line-height: 1.2;
		box-shadow: var(--cw-shadow-sm);
	}

	.cw-dli-card__marker-line {
		display: block;
		width: 2px;
		height: 1.2rem;
		border-radius: var(--cw-radius-full);
		background-color: var(--cw-dli-marker);
	}

	.cw-dli-card__scale {
		display: flex;
		justify-content: space-between;
		gap: var(--cw-space-3);
		color: var(--cw-text-muted);
		font-size: var(--cw-text-xs);
		font-variant-numeric: tabular-nums;
	}

	.cw-dli-card__history {
		display: grid;
		gap: var(--cw-space-3);
		padding-top: var(--cw-space-4);
		border-top: 1px solid color-mix(in srgb, var(--cw-border-default) 70%, transparent);
	}

	.cw-dli-card__history-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--cw-space-3);
	}

	.cw-dli-card__history-head h4 {
		margin: 0;
		color: var(--cw-text-primary);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-tight);
	}

	.cw-dli-card__history-head span {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-xs);
		white-space: nowrap;
	}

	.cw-dli-card__history-bars {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(1.75rem, 1fr));
		align-items: end;
		gap: var(--cw-space-2);
		min-height: 6.4rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.cw-dli-card__history-item {
		display: grid;
		grid-template-rows: minmax(4.6rem, 1fr) auto;
		align-items: end;
		gap: 0.35rem;
		min-width: 0;
	}

	.cw-dli-card__history-bar {
		display: block;
		width: 100%;
		max-height: 4.6rem;
		border: 1px solid color-mix(in srgb, var(--cw-accent) 48%, transparent);
		border-radius: var(--cw-radius-sm) var(--cw-radius-sm) 0 0;
		background-color: color-mix(in srgb, var(--cw-accent) 38%, var(--cw-bg-muted));
	}

	.cw-dli-card__history-date {
		overflow: hidden;
		color: var(--cw-text-muted);
		font-size: 0.68rem;
		line-height: 1.2;
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@container (max-width: 24rem) {
		.cw-dli-card__header {
			display: grid;
			gap: var(--cw-space-3);
		}

		.cw-dli-card__status {
			width: fit-content;
		}

		.cw-dli-card__history-date {
			display: none;
		}
	}
</style>
