<script lang="ts" module>
	/** Override display labels for i18n. All fields optional; English defaults are used when omitted. */
	export interface CwPPFDChartLabels {
		/** Eyebrow text above the heading. Default: "Photosynthetic Photon Flux Density". */
		eyebrow?: string;
		/** Heading shown when no plant name is provided. Default: "PPFD range gauge". */
		heading?: string;
		/** Heading builder when a plant name is provided. Default: `${plant} PPFD`. */
		headingWithPlant?: (plant: string) => string;
		/** Label for the current PPFD reading. Default: "Current PPFD". */
		currentPpfd?: string;
		/** Label for the current marker on the gauge. Default: "Current". */
		current?: string;
		/** Label for the DLI reading box. Default: "DLI Today". */
		dliReading?: string;
		/** Label for the DLI stat. Default: "DLI today". */
		dliStat?: string;
		/** Label for the target range stat. Default: "Target range". */
		targetRange?: string;
		/** Label for the status stat. Default: "Status". */
		status?: string;
		/** Status text when the current value is below target. Default: "Too low". */
		tooLow?: string;
		/** Status text when the current value is above target. Default: "Too high". */
		tooHigh?: string;
		/** Status text when the current value is within target. Default: "Optimal". */
		optimal?: string;
		/** Delta text when the current value is within target. Default: "Inside target band". */
		insideBand?: string;
		/** Delta builder when below target. Default: `${amount} ${unit} below target`. */
		deltaBelow?: (amount: string, unit: string) => string;
		/** Delta builder when above target. Default: `${amount} ${unit} above target`. */
		deltaAbove?: (amount: string, unit: string) => string;
		/** Builder for the "Updated …" timestamp line. Default: `Updated ${when}`. */
		updated?: (when: string) => string;
		/** Scale label for the zone below target. Default: "Low". */
		low?: string;
		/** Scale label for the target zone. Default: "Optimal". */
		optimalZone?: string;
		/** Scale label for the zone above target. Default: "High". */
		high?: string;
		/** Unit shown after the DLI value. Default: "mol/m²/day". */
		dliUnit?: string;
		/** Accessible text announced while `loading` is true. Default: "Loading PPFD". */
		loading?: string;
	}

	const DEFAULT_LABELS: Required<CwPPFDChartLabels> = {
		eyebrow: 'Photosynthetic Photon Flux Density',
		heading: 'PPFD range gauge',
		headingWithPlant: (plant: string) => `${plant} PPFD`,
		currentPpfd: 'Current PPFD',
		current: 'Current',
		dliReading: 'DLI Today',
		dliStat: 'DLI today',
		targetRange: 'Target range',
		status: 'Status',
		tooLow: 'Too low',
		tooHigh: 'Too high',
		optimal: 'Optimal',
		insideBand: 'Inside target band',
		deltaBelow: (amount: string, unit: string) => `${amount} ${unit} below target`,
		deltaAbove: (amount: string, unit: string) => `${amount} ${unit} above target`,
		updated: (when: string) => `Updated ${when}`,
		low: 'Low',
		optimalZone: 'Optimal',
		high: 'High',
		dliUnit: 'mol/m²/day',
		loading: 'Loading PPFD'
	};
</script>

<script lang="ts">
	import type { CwNoDataMessage, CwPPFDStatus, CwPPFDTick } from '../types/index.js';
	import { CW_EMPTY_VALUE, isCwFiniteNumber } from '../utils/cwFormat.js';
	import CwNoDataOverlay from './CwNoDataOverlay.svelte';
	import { getCwNoDataMessage, hasCwNoData } from './cwNoData.js';

	interface Props {
		current?: number | null;
		targetMin?: number | null;
		targetMax?: number | null;
		plant?: string;
		unit?: string;
		domainMin?: number | null;
		domainMax?: number | null;
		ticks?: Array<number | CwPPFDTick>;
		dliToday?: number | null;
		updatedAt?: string | Date | number;
		showSummary?: boolean;
		showDelta?: boolean;
		/** @deprecated Use `labels.low`. */
		lowLabel?: string;
		/** @deprecated Use `labels.optimalZone`. */
		optimalLabel?: string;
		/** @deprecated Use `labels.high`. */
		highLabel?: string;
		labels?: CwPPFDChartLabels;
		/**
		 * Show the no-data overlay. When omitted the overlay appears automatically
		 * if `current` is missing.
		 */
		noData?: CwNoDataMessage;
		/** Dim the gauge and hide values while data is loading. */
		loading?: boolean;
		/** BCP 47 locale for numbers and dates. Defaults to the runtime locale. */
		locale?: string;
		class?: string;
	}

	let {
		current,
		targetMin,
		targetMax,
		plant = '',
		unit = 'µmol/m²/s',
		domainMin = 0,
		domainMax,
		ticks,
		dliToday,
		updatedAt,
		showSummary = true,
		showDelta = true,
		lowLabel,
		optimalLabel,
		highLabel,
		labels = {},
		noData,
		loading = false,
		locale,
		class: className = ''
	}: Props = $props();

	const l = $derived({ ...DEFAULT_LABELS, ...labels });
	const lowText = $derived(lowLabel ?? l.low);
	const optimalText = $derived(optimalLabel ?? l.optimalZone);
	const highText = $derived(highLabel ?? l.high);

	const uid = $props.id();
	const ppfdFormatter = $derived(new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }));
	const dliFormatter = $derived(
		new Intl.NumberFormat(locale, {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1
		})
	);

	function roundUpToStep(value: number, step: number): number {
		return Math.ceil(value / step) * step;
	}

	function clampPercent(value: number): number {
		return Math.max(0, Math.min(100, value));
	}

	function toFiniteNumber(input: number | null | undefined, fallback: number): number {
		return typeof input === 'number' && Number.isFinite(input) ? input : fallback;
	}

	function toDate(input: string | Date | number): Date {
		if (input instanceof Date) return input;
		if (typeof input === 'number') {
			return new Date(input < 1_000_000_000_000 ? input * 1000 : input);
		}
		return new Date(input);
	}

	function formatUpdatedAt(input: string | Date | number): string {
		const date = toDate(input);
		return Number.isNaN(date.getTime()) ? '' : date.toLocaleString(locale);
	}

	function normalizeTick(tick: number | CwPPFDTick): CwPPFDTick {
		if (typeof tick === 'number') {
			return { value: tick, label: ppfdFormatter.format(tick) };
		}

		return {
			value: tick.value,
			label: tick.label ?? ppfdFormatter.format(tick.value)
		};
	}

	const hasCurrent = $derived(!loading && isCwFiniteNumber(current));
	const hasTarget = $derived(isCwFiniteNumber(targetMin) || isCwFiniteNumber(targetMax));
	const hasNoData = $derived(!loading && (hasCwNoData(noData) || !hasCurrent));
	const noDataMessage = $derived(getCwNoDataMessage(noData));
	const currentValue = $derived(toFiniteNumber(current, 0));
	const domainMinValue = $derived(toFiniteNumber(domainMin, 0));
	const requestedDomainMax = $derived(
		domainMax === undefined || domainMax === null ? undefined : toFiniteNumber(domainMax, domainMinValue + 200)
	);
	const normalizedRange = $derived.by(() => {
		const lower = toFiniteNumber(targetMin, 0);
		const upper = toFiniteNumber(targetMax, lower);

		return {
			min: Math.min(lower, upper),
			max: Math.max(lower, upper)
		};
	});

	const computedDomainMax = $derived.by(() => {
		const baseline = Math.max(
			1200,
			normalizedRange.max * 1.3,
			currentValue * 1.1,
			domainMinValue + 200
		);
		const requested = requestedDomainMax ?? baseline;
		const guaranteedMax = Math.max(
			requested,
			normalizedRange.max,
			currentValue,
			domainMinValue + 200
		);

		return roundUpToStep(guaranteedMax, 200);
	});

	function scale(value: number): number {
		const span = computedDomainMax - domainMinValue || 1;
		return ((value - domainMinValue) / span) * 100;
	}

	const lowBoundaryPercent = $derived(clampPercent(scale(normalizedRange.min)));
	const highBoundaryPercent = $derived(clampPercent(scale(normalizedRange.max)));
	const markerPercent = $derived(clampPercent(scale(currentValue)));
	const optimalWidth = $derived(Math.max(0, highBoundaryPercent - lowBoundaryPercent));
	const markerAlign = $derived(
		markerPercent <= 10 ? 'start' : markerPercent >= 90 ? 'end' : 'center'
	);
	/** No status without both a reading and a target — a missing value is never "Too low". */
	const status = $derived.by<CwPPFDStatus | null>(() => {
		if (!hasCurrent || !hasTarget) return null;
		if (currentValue < normalizedRange.min) return 'low';
		if (currentValue > normalizedRange.max) return 'high';
		return 'optimal';
	});

	const statusLabel = $derived(
		status === null
			? CW_EMPTY_VALUE
			: status === 'low'
				? l.tooLow
				: status === 'high'
					? l.tooHigh
					: l.optimal
	);
	const heading = $derived(plant.trim() ? l.headingWithPlant(plant) : l.heading);
	const currentText = $derived(hasCurrent ? ppfdFormatter.format(currentValue) : CW_EMPTY_VALUE);
	const formattedCurrent = $derived(hasCurrent ? `${currentText}\u00a0${unit}` : CW_EMPTY_VALUE);
	const targetRangeText = $derived(
		hasTarget
			? `${ppfdFormatter.format(normalizedRange.min)}–${ppfdFormatter.format(normalizedRange.max)}`
			: CW_EMPTY_VALUE
	);
	const formattedTargetRange = $derived(
		hasTarget ? `${targetRangeText}\u00a0${unit}` : CW_EMPTY_VALUE
	);
	const hasDli = $derived(!loading && isCwFiniteNumber(dliToday));
	const formattedDli = $derived(
		hasDli ? `${dliFormatter.format(dliToday as number)}\u00a0${l.dliUnit}` : ''
	);
	const updatedLabel = $derived(updatedAt === undefined ? '' : formatUpdatedAt(updatedAt));
	const deltaMessage = $derived.by(() => {
		if (!showDelta || status === null) return '';
		if (status === 'low') {
			return l.deltaBelow(ppfdFormatter.format(normalizedRange.min - currentValue), unit);
		}
		if (status === 'high') {
			return l.deltaAbove(ppfdFormatter.format(currentValue - normalizedRange.max), unit);
		}
		return l.insideBand;
	});

	/** Center of each zone, so the Low / Optimal / High labels sit under their zones. */
	const zoneCenters = $derived({
		low: lowBoundaryPercent / 2,
		optimal: lowBoundaryPercent + optimalWidth / 2,
		high: highBoundaryPercent + (100 - highBoundaryPercent) / 2
	});

	const gaugeTicks = $derived.by(() => {
		if (ticks?.length) {
			return ticks
				.map(normalizeTick)
				.filter((tick) => tick.value >= domainMinValue && tick.value <= computedDomainMax)
				.sort((a, b) => a.value - b.value);
		}

		const count = Math.floor((computedDomainMax - domainMinValue) / 200) + 1;
		return Array.from({ length: count }, (_, index) => {
			const value = domainMinValue + index * 200;
			return { value, label: ppfdFormatter.format(value) };
		});
	});

	const srSummary = $derived.by(() => {
		if (loading) return l.loading;
		const parts = [
			heading,
			`${l.current} ${formattedCurrent}`,
			`${l.targetRange} ${formattedTargetRange}`,
			`${l.status} ${statusLabel}`
		];

		if (deltaMessage) parts.push(deltaMessage);
		if (formattedDli) parts.push(`${l.dliStat} ${formattedDli}`);
		return `${parts.join('. ')}.`;
	});
</script>

<section
	class="cw-ppfd-chart cw-no-data-host {className}"
	class:cw-no-data-host--active={hasNoData}
	class:cw-ppfd-chart--loading={loading}
	aria-labelledby="{uid}-title"
	aria-busy={loading || undefined}
>
	<div class="cw-ppfd-chart__header">
		<p class="cw-ppfd-chart__eyebrow">{l.eyebrow}</p>
		<h3 id="{uid}-title" class="cw-ppfd-chart__title">{heading}</h3>
		{#if updatedLabel}
			<p class="cw-ppfd-chart__updated">{l.updated(updatedLabel)}</p>
		{/if}
	</div>

	{#if showSummary}
		<dl class="cw-ppfd-chart__summary">
			<div class="cw-ppfd-chart__stat">
				<dt>{l.currentPpfd}</dt>
				<dd>
					{currentText}{#if hasCurrent}&nbsp;<small>{unit}</small>{/if}
				</dd>
			</div>

			<div class="cw-ppfd-chart__stat">
				<dt>{l.targetRange}</dt>
				<dd>{targetRangeText}</dd>
			</div>

			{#if formattedDli}
				<div class="cw-ppfd-chart__stat">
					<dt>{l.dliStat}</dt>
					<dd>{dliFormatter.format(dliToday as number)}&nbsp;<small>{l.dliUnit}</small></dd>
				</div>
			{/if}
		</dl>
	{/if}

	{#if status !== null}
	<p class="cw-ppfd-chart__status cw-ppfd-chart__status--{status}">
		{#if status === 'optimal'}
			<svg class="cw-ppfd-chart__status-icon" viewBox="0 0 24 24" aria-hidden="true"
				><path
					fill="currentColor"
					d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.1 14.2-4-4 1.4-1.4 2.6 2.6 5.4-5.4 1.4 1.4-6.8 6.8Z"
				/></svg
			>
		{:else if status === 'low'}
			<svg class="cw-ppfd-chart__status-icon" viewBox="0 0 24 24" aria-hidden="true"
				><path fill="currentColor" d="M11 4h2v12l5-5 1.4 1.4L12 19.8 4.6 12.4 6 11l5 5V4Z" /></svg
			>
		{:else}
			<svg class="cw-ppfd-chart__status-icon" viewBox="0 0 24 24" aria-hidden="true"
				><path fill="currentColor" d="M13 20h-2V8L6 13 4.6 11.6 12 4.2l7.4 7.4L18 13l-5-5v12Z" /></svg
			>
		{/if}
		<span
			>{statusLabel}{#if showDelta && deltaMessage}
				· {deltaMessage}{/if}</span
		>
	</p>
	{/if}

	<div
		class="cw-ppfd-chart__gauge-shell"
		role="img"
		aria-labelledby="{uid}-title"
		aria-describedby="{uid}-summary"
	>
		<p id="{uid}-summary" class="cw-ppfd-chart__sr-only">{srSummary}</p>

		<div class="cw-ppfd-chart__stage">
			<div class="cw-ppfd-chart__track" class:cw-ppfd-chart__track--no-target={!hasTarget}>
				{#if hasTarget}
				<div
					class="cw-ppfd-chart__zone cw-ppfd-chart__zone--low"
					style:width="{lowBoundaryPercent}%"
				></div>
				<div
					class="cw-ppfd-chart__zone cw-ppfd-chart__zone--optimal"
					style:width="{optimalWidth}%"
				>
					{#if optimalWidth >= 14}
						<span class="cw-ppfd-chart__zone-label">{optimalText}</span>
					{/if}
				</div>
				<div
					class="cw-ppfd-chart__zone cw-ppfd-chart__zone--high"
					style:width="{Math.max(0, 100 - lowBoundaryPercent - optimalWidth)}%"
				></div>
				{/if}
			</div>

			{#if hasCurrent}
				<div
					class="cw-ppfd-chart__marker cw-ppfd-chart__marker--{markerAlign}"
					style:left="{markerPercent}%"
				>
					<span class="cw-ppfd-chart__marker-value">{formattedCurrent}</span>
				</div>
			{/if}
		</div>

		<div class="cw-ppfd-chart__ticks" aria-hidden="true">
			{#each gaugeTicks as tick (tick.value)}
				<span class="cw-ppfd-chart__tick" style:left="{clampPercent(scale(tick.value))}%"
					>{tick.label}</span
				>
			{/each}
		</div>

		{#if hasTarget}
			<div class="cw-ppfd-chart__scale-labels" aria-hidden="true">
				{#if lowBoundaryPercent >= 8}
					<span style:left="{zoneCenters.low}%">{lowText}</span>
				{/if}
				<span style:left="{zoneCenters.optimal}%">{optimalText}</span>
				{#if 100 - highBoundaryPercent >= 8}
					<span style:left="{zoneCenters.high}%">{highText}</span>
				{/if}
			</div>
		{/if}
	</div>

	{#if hasNoData}
		<CwNoDataOverlay message={noDataMessage} />
	{/if}
</section>

<style>
	.cw-ppfd-chart {
		border: 1px solid var(--cw-chart-card-border, var(--cw-border-default));
		border-radius: var(--cw-card-radius, var(--cw-radius-xl));
		background: var(--cw-chart-card-bg, var(--cw-bg-surface));
		box-shadow: var(--cw-chart-card-shadow, var(--cw-shadow-md));
		color: var(--cw-text-primary);
		display: flex;
		flex-direction: column;
		font-family: var(--cw-font-family);
		gap: var(--cw-space-5);
		padding: var(--cw-space-5);
		position: relative;
	}

	.cw-ppfd-chart--loading .cw-ppfd-chart__track {
		animation: cw-ppfd-pulse 1.4s var(--cw-ease-default) infinite;
	}

	@keyframes cw-ppfd-pulse {
		50% {
			opacity: 0.5;
		}
	}

	.cw-ppfd-chart__track--no-target {
		background: var(--cw-bg-muted);
	}

	.cw-ppfd-chart__header {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
	}

	.cw-ppfd-chart__eyebrow {
		color: var(--cw-chart-card-muted, var(--cw-text-muted));
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.12em;
		margin: 0;
		text-transform: uppercase;
	}

	.cw-ppfd-chart__title {
		color: var(--cw-chart-card-title, var(--cw-text-primary));
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-tight);
		margin: 0;
	}

	.cw-ppfd-chart__updated {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		margin: 0;
	}

	.cw-ppfd-chart__summary {
		display: grid;
		gap: var(--cw-space-3);
		grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
		margin: 0;
	}

	.cw-ppfd-chart__stat {
		background: color-mix(in srgb, var(--cw-bg-muted) 70%, var(--cw-chart-card-bg, var(--cw-bg-surface)));
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 70%, transparent);
		border-radius: var(--cw-radius-lg);
		padding: var(--cw-space-3) var(--cw-space-4);
	}

	.cw-ppfd-chart__stat dt {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-bold);
		letter-spacing: 0.05em;
		margin: 0;
		text-transform: uppercase;
	}

	.cw-ppfd-chart__stat dd {
		color: var(--cw-text-primary);
		font-size: var(--cw-text-xl);
		font-variant-numeric: tabular-nums;
		font-weight: var(--cw-font-bold);
		margin: var(--cw-space-1) 0 0;
	}

	.cw-ppfd-chart__stat dd small {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
	}

	.cw-ppfd-chart__status {
		align-items: center;
		align-self: flex-start;
		display: inline-flex;
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-bold);
		gap: 0.4rem;
		margin: 0;
	}

	.cw-ppfd-chart__status-icon {
		flex: none;
		height: 1.15rem;
		width: 1.15rem;
	}

	.cw-ppfd-chart__status--optimal {
		color: var(--cw-tone-success-text);
	}

	.cw-ppfd-chart__status--low {
		color: var(--cw-tone-info-text);
	}

	.cw-ppfd-chart__status--high {
		color: var(--cw-tone-danger-text);
	}

	.cw-ppfd-chart__gauge-shell {
		display: flex;
		flex-direction: column;
	}

	.cw-ppfd-chart__stage {
		padding-top: 2.4rem;
		position: relative;
	}

	.cw-ppfd-chart__track {
		background: var(--cw-bg-elevated);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 70%, transparent);
		border-radius: var(--cw-radius-lg);
		display: flex;
		height: 2.875rem;
		overflow: hidden;
		position: relative;
	}

	.cw-ppfd-chart__zone {
		height: 100%;
	}

	.cw-ppfd-chart__zone--low {
		background: repeating-linear-gradient(
			45deg,
			color-mix(in srgb, var(--cw-bg-subtle) 55%, var(--cw-chart-card-bg, var(--cw-bg-surface))) 0 8px,
			color-mix(in srgb, var(--cw-bg-subtle) 80%, var(--cw-chart-card-bg, var(--cw-bg-surface))) 8px 16px
		);
	}

	.cw-ppfd-chart__zone--optimal {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--cw-status-online) 28%, var(--cw-chart-card-bg, var(--cw-bg-surface))),
			color-mix(in srgb, var(--cw-status-online) 16%, var(--cw-chart-card-bg, var(--cw-bg-surface)))
		);
		border-left: 2px dashed var(--cw-status-online);
		border-right: 2px dashed var(--cw-status-online);
		position: relative;
	}

	.cw-ppfd-chart__zone-label {
		color: var(--cw-tone-success-text);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-bold);
		left: 50%;
		letter-spacing: 0.04em;
		pointer-events: none;
		position: absolute;
		text-transform: uppercase;
		top: 50%;
		transform: translate(-50%, -50%);
		white-space: nowrap;
	}

	.cw-ppfd-chart__zone--high {
		background: repeating-linear-gradient(
			45deg,
			color-mix(in srgb, var(--cw-status-alarm) 13%, var(--cw-chart-card-bg, var(--cw-bg-surface))) 0 8px,
			color-mix(in srgb, var(--cw-status-alarm) 7%, var(--cw-chart-card-bg, var(--cw-bg-surface))) 8px 16px
		);
	}

	.cw-ppfd-chart__marker {
		background: var(--cw-text-primary);
		border-radius: var(--cw-radius-sm);
		height: calc(2.875rem + 12px);
		position: absolute;
		top: calc(2.4rem - 6px);
		transform: translateX(-50%);
		transition: left var(--cw-duration-slow) var(--cw-ease-default);
		width: 3px;
		z-index: 3;
	}

	.cw-ppfd-chart__marker::before {
		background: var(--cw-text-primary);
		border-radius: 2px;
		content: '';
		height: 11px;
		left: 50%;
		position: absolute;
		top: -3px;
		transform: translateX(-50%) rotate(45deg);
		width: 11px;
	}

	.cw-ppfd-chart__marker-value {
		background: var(--cw-text-primary);
		border-radius: var(--cw-radius-md);
		bottom: calc(100% + 7px);
		color: var(--cw-text-inverse);
		font-size: var(--cw-text-xs);
		font-variant-numeric: tabular-nums;
		font-weight: var(--cw-font-bold);
		left: 50%;
		padding: 0.2rem 0.5rem;
		position: absolute;
		transform: translateX(-50%);
		white-space: nowrap;
	}

	.cw-ppfd-chart__marker--start .cw-ppfd-chart__marker-value {
		left: 0;
		transform: translateX(0);
	}

	.cw-ppfd-chart__marker--end .cw-ppfd-chart__marker-value {
		left: auto;
		right: 0;
		transform: translateX(0);
	}

	.cw-ppfd-chart__ticks {
		height: 1.4rem;
		margin-top: 0.4rem;
		position: relative;
	}

	.cw-ppfd-chart__tick {
		color: var(--cw-text-muted);
		font-size: var(--cw-chart-tick-size, 0.6875rem);
		font-variant-numeric: tabular-nums;
		position: absolute;
		top: 0.5rem;
		transform: translateX(-50%);
		white-space: nowrap;
	}

	.cw-ppfd-chart__tick::before {
		background: var(--cw-border-strong);
		content: '';
		height: 4px;
		left: 50%;
		position: absolute;
		top: -0.4rem;
		width: 1px;
	}

	.cw-ppfd-chart__scale-labels {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		height: 1.25rem;
		letter-spacing: 0.06em;
		margin-top: var(--cw-space-2);
		position: relative;
		text-transform: uppercase;
	}

	.cw-ppfd-chart__scale-labels span {
		position: absolute;
		top: 0;
		transform: translateX(-50%);
		white-space: nowrap;
	}

	.cw-ppfd-chart__sr-only {
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
		.cw-ppfd-chart {
			padding: var(--cw-space-3);
		}

		.cw-ppfd-chart__summary {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
