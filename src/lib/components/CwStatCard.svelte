<script lang="ts">
	import type { CwStatCardData, CwStatCardLabels } from "../types/index.js";
	import CwTooltip from "./CwTooltip.svelte";
	import { CW_EMPTY_VALUE, formatCwNumber, joinCwUnit } from "../utils/cwFormat.js";

	interface Props {
		/** Display title for the stat card */
		title: string;
		/** Statistical data to display */
		stats: CwStatCardData;
		/** Unit shown after values (e.g. "°C", "%", "ppm") */
		unit?: string;
		/** Accent colour for the avg dot and highlighted value. Must meet text contrast on the surface. */
		accentColor?: string;
		/** Whether the card can be expanded to show details */
		expandable?: boolean;
		/** Heading level for the title (default 3). */
		headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
		/** Shows a skeleton while statistics load. */
		loading?: boolean;
		/** BCP 47 locale used for number formatting (defaults to the runtime locale). */
		locale?: string;
		/** Override display labels for i18n */
		labels?: CwStatCardLabels;
		/** Additional CSS class */
		class?: string;
	}

	let {
		title,
		stats,
		unit = "",
		accentColor = "var(--cw-accent-text)",
		expandable = true,
		headingLevel = 3,
		loading = false,
		locale,
		labels: rawLabels = {},
		class: className = "",
	}: Props = $props();

	const uid = $props.id();

	const defaultLabels: Required<CwStatCardLabels> = {
		min: "Min",
		avg: "Avg",
		max: "Max",
		count: "Count",
		median: "Median",
		stdDev: "Std Dev",
		range: "Range",
		aboveAvg: "Above average",
		belowAvg: "Below average",
		atAvg: "At average",
		clickToExpand: "Show details",
		clickToCollapse: "Hide details",
		showDetails: "Show details",
		hideDetails: "Hide details",
	};

	const l = $derived({
		...defaultLabels,
		...rawLabels,
		// Honour the deprecated keys when the new ones aren't supplied.
		showDetails: rawLabels.showDetails ?? rawLabels.clickToExpand ?? defaultLabels.showDetails,
		hideDetails: rawLabels.hideDetails ?? rawLabels.clickToCollapse ?? defaultLabels.hideDetails,
	});

	let expanded = $state(false);

	/** Summary values: at most one decimal. */
	function fmt(v: number | undefined | null): string {
		return formatCwNumber(v, { maximumFractionDigits: 1, locale });
	}

	function fmtUnit(v: number | undefined | null): string {
		if (v == null || !Number.isFinite(v)) return CW_EMPTY_VALUE;
		return joinCwUnit(fmt(v), unit);
	}

	function isCo2Unit(value: string): boolean {
		return /^co(?:2|₂)$/i.test(value.trim());
	}

	function co2UnitPrefix(value: string): string {
		return value.trim().replace(/[2₂]$/u, "");
	}

	function percent(min: number, max: number, val: number): number {
		if (max === min) return 50;
		return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
	}

	const avgPercent = $derived(
		stats.min != null && stats.max != null && stats.avg != null
			? percent(stats.min, stats.max, stats.avg)
			: null,
	);

	const deltaFromAverage = $derived.by(() => {
		if (stats.lastReading == null || stats.avg == null) return null;
		// Round to the displayed precision so the arrow always agrees with the number.
		return Math.round((stats.lastReading - stats.avg) * 10) / 10;
	});

	const deltaState = $derived.by<"above" | "below" | "at" | null>(() => {
		if (deltaFromAverage == null) return null;
		if (deltaFromAverage > 0) return "above";
		if (deltaFromAverage < 0) return "below";
		return "at";
	});

	const deltaText = $derived(
		deltaFromAverage == null
			? ""
			: joinCwUnit(
					formatCwNumber(deltaFromAverage, {
						maximumFractionDigits: 1,
						signed: true,
						locale,
					}),
					unit,
				),
	);

	function deltaLabel(state: "above" | "below" | "at"): string {
		if (state === "above") return l.aboveAvg;
		if (state === "below") return l.belowAvg;
		return l.atAvg;
	}
</script>

<div
	class="cw-stat-card {className}"
	class:cw-stat-card--expanded={expanded}
	style:--cw-stat-accent={accentColor}
	aria-busy={loading || undefined}
>
	<div class="cw-stat-card__header">
		<svelte:element this={`h${headingLevel}`} class="cw-stat-card__title">{title}</svelte:element>
	</div>

	{#if loading}
		<div class="cw-stat-card__skeleton" aria-hidden="true">
			<span class="cw-stat-card__skeleton-block cw-stat-card__skeleton-block--hero"></span>
			<span class="cw-stat-card__skeleton-block"></span>
			<span class="cw-stat-card__skeleton-block cw-stat-card__skeleton-block--thin"></span>
		</div>
	{:else}
		<div class="cw-stat-card__hero">
			<span class="cw-stat-card__hero-value">
				{formatCwNumber(stats.lastReading, { maximumFractionDigits: 2, locale })}{#if unit && stats.lastReading != null}
					{#if isCo2Unit(unit)}
						<span class="cw-stat-card__hero-unit">{co2UnitPrefix(unit)}<sub>2</sub></span>
					{:else}
						<span class="cw-stat-card__hero-unit">{unit}</span>
					{/if}
				{/if}
			</span>
			{#if deltaFromAverage != null && deltaState != null}
				<span
					class="cw-stat-card__comparison"
					class:cw-stat-card__comparison--above={deltaState === "above"}
					class:cw-stat-card__comparison--below={deltaState === "below"}
				>
					<svg
						class="cw-stat-card__comparison-icon"
						viewBox="0 0 16 16"
						fill="none"
						aria-hidden="true"
					>
						{#if deltaState === "above"}
							<path
								d="M8 12V4m0 0L5 7m3-3 3 3"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						{:else if deltaState === "below"}
							<path
								d="M8 4v8m0 0 3-3m-3 3L5 9"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						{:else}
							<path
								d="M3 8h10"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							/>
						{/if}
					</svg>
					<CwTooltip value={deltaLabel(deltaState)}>
						<span class="cw-stat-card__comparison-value">
							{deltaText}
							<span class="cw-visually-hidden">{deltaLabel(deltaState)}</span>
						</span>
					</CwTooltip>
				</span>
			{/if}
		</div>

		<div class="cw-stat-card__values">
			<span>{fmt(stats.min)}</span>
			<span class="cw-stat-card__avg-value">{fmt(stats.avg)}</span>
			<span>{fmt(stats.max)}</span>
		</div>

		<div class="cw-stat-card__bar" aria-hidden="true">
			<div class="cw-stat-card__dot cw-stat-card__dot--endpoint" style:left="0%"></div>
			<div class="cw-stat-card__dot cw-stat-card__dot--endpoint" style:left="100%"></div>
			{#if avgPercent != null}
				<div class="cw-stat-card__dot cw-stat-card__dot--avg" style:left="{avgPercent}%"></div>
			{/if}
		</div>
		<div class="cw-stat-card__labels">
			<span>{l.min}</span>
			<span>{l.avg}</span>
			<span>{l.max}</span>
		</div>

		{#if expandable && expanded}
			<div class="cw-stat-card__details" id="{uid}-details">
				<dl class="cw-stat-card__detail-grid">
					<div class="cw-stat-card__detail-item">
						<dt class="cw-stat-card__detail-label">{l.count}</dt>
						<dd class="cw-stat-card__detail-value">
							{formatCwNumber(stats.count, { maximumFractionDigits: 0, locale })}
						</dd>
					</div>
					<div class="cw-stat-card__detail-item">
						<dt class="cw-stat-card__detail-label">{l.median}</dt>
						<dd class="cw-stat-card__detail-value">{fmtUnit(stats.median)}</dd>
					</div>
					<div class="cw-stat-card__detail-item">
						<dt class="cw-stat-card__detail-label">{l.stdDev}</dt>
						<dd class="cw-stat-card__detail-value">{fmtUnit(stats.stdDev)}</dd>
					</div>
					<div class="cw-stat-card__detail-item">
						<dt class="cw-stat-card__detail-label">{l.range}</dt>
						<dd class="cw-stat-card__detail-value">
							{stats.min != null && stats.max != null
								? fmtUnit(stats.max - stats.min)
								: CW_EMPTY_VALUE}
						</dd>
					</div>
				</dl>
			</div>
		{/if}

		{#if expandable}
			<button
				type="button"
				class="cw-stat-card__toggle"
				aria-expanded={expanded}
				aria-controls={expanded ? `${uid}-details` : undefined}
				onclick={() => (expanded = !expanded)}
			>
				<svg class="cw-stat-card__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path
						d="M4 6l4 4 4-4"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<span>{expanded ? l.hideDetails : l.showDetails}</span>
			</button>
		{/if}
	{/if}
</div>

<style>
	.cw-stat-card {
		background-color: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-card-radius);
		box-shadow: var(--cw-shadow-sm);
		padding: var(--cw-space-3);
		font-family: var(--cw-font-family);
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--cw-space-2);
		container-type: inline-size;
	}

	.cw-stat-card__header {
		width: 100%;
		min-width: 0;
	}

	.cw-stat-card__title {
		margin: 0;
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-tight);
		color: var(--cw-text-primary);
		overflow-wrap: anywhere;
	}

	.cw-stat-card__hero {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		min-height: 5rem;
		padding: var(--cw-space-2) var(--cw-space-2) var(--cw-space-6);
		text-align: center;
		border: 1px solid color-mix(in srgb, var(--cw-stat-accent) 20%, var(--cw-border-default));
		border-radius: var(--cw-radius-lg);
		background-color: var(--cw-bg-surface-elevated);
	}

	.cw-stat-card__hero-value {
		display: inline-flex;
		align-items: baseline;
		gap: 0.25rem;
		font-size: var(--cw-text-3xl);
		font-weight: var(--cw-font-bold);
		line-height: 1;
		letter-spacing: -0.02em;
		color: var(--cw-text-primary);
		font-variant-numeric: tabular-nums;
	}

	.cw-stat-card__hero-unit {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		letter-spacing: 0;
		color: var(--cw-text-muted);
	}

	.cw-stat-card__comparison {
		position: absolute;
		bottom: var(--cw-space-1);
		right: var(--cw-space-1);
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-1);
		padding: 0.125rem var(--cw-space-2);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 72%, transparent);
		border-radius: var(--cw-radius-full);
		background-color: color-mix(in srgb, var(--cw-bg-muted) 38%, var(--cw-bg-surface));
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.cw-stat-card__comparison-icon {
		width: 0.875rem;
		height: 0.875rem;
		flex: none;
	}

	.cw-stat-card__comparison-value {
		font-size: var(--cw-text-xs);
	}

	.cw-stat-card__labels {
		display: flex;
		justify-content: space-between;
		width: 100%;
		padding: 0 var(--cw-space-1);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.cw-stat-card__values {
		display: flex;
		justify-content: space-between;
		width: 100%;
		padding: 0 var(--cw-space-1);
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
		font-variant-numeric: tabular-nums;
	}

	.cw-stat-card__avg-value {
		font-weight: var(--cw-font-bold);
		color: var(--cw-stat-accent);
	}

	.cw-stat-card__bar {
		position: relative;
		width: 100%;
		height: 0.5rem;
		border-radius: var(--cw-radius-full);
		background-color: var(--cw-bg-subtle);
	}

	.cw-stat-card__dot {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		border-radius: var(--cw-radius-full);
	}

	.cw-stat-card__dot--endpoint {
		width: 0.5rem;
		height: 0.5rem;
		background-color: var(--cw-text-muted);
	}

	.cw-stat-card__dot--avg {
		width: 0.75rem;
		height: 0.75rem;
		background-color: var(--cw-stat-accent);
		border: 2px solid var(--cw-bg-surface);
	}

	.cw-stat-card__details {
		width: 100%;
		padding-top: var(--cw-space-3);
		border-top: 1px solid var(--cw-border-muted);
	}

	.cw-stat-card__detail-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--cw-space-2) var(--cw-space-4);
		margin: 0;
	}

	.cw-stat-card__detail-item {
		display: flex;
		justify-content: space-between;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-sm);
		min-width: 0;
	}

	.cw-stat-card__detail-label {
		color: var(--cw-text-muted);
	}

	.cw-stat-card__detail-value {
		margin: 0;
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.cw-stat-card__toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-1);
		width: 100%;
		min-height: var(--cw-control-h-sm);
		padding: var(--cw-space-1) 0 0;
		border: none;
		border-top: 1px solid var(--cw-border-muted);
		background: none;
		font: inherit;
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-muted);
		cursor: pointer;
		transition: color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-stat-card__toggle:hover {
		color: var(--cw-text-primary);
	}

	.cw-stat-card__chevron {
		width: 1rem;
		height: 1rem;
		transition: transform var(--cw-duration-normal) var(--cw-ease-default);
	}

	.cw-stat-card--expanded .cw-stat-card__chevron {
		transform: rotate(180deg);
	}

	.cw-stat-card__skeleton {
		display: grid;
		gap: var(--cw-space-2);
	}

	.cw-stat-card__skeleton-block {
		display: block;
		height: 1.5rem;
		border-radius: var(--cw-radius-md);
		background: linear-gradient(90deg, var(--cw-bg-muted) 0%, var(--cw-bg-subtle) 50%, var(--cw-bg-muted) 100%);
		background-size: 200% 100%;
		animation: cw-stat-card-shimmer 1.4s ease-in-out infinite;
	}

	.cw-stat-card__skeleton-block--hero {
		height: 5rem;
		border-radius: var(--cw-radius-lg);
	}

	.cw-stat-card__skeleton-block--thin {
		height: 0.5rem;
	}

	@keyframes cw-stat-card-shimmer {
		from {
			background-position: 100% 0;
		}
		to {
			background-position: -100% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cw-stat-card__skeleton-block {
			animation: none;
		}
	}

	@container (max-width: 19rem) {
		.cw-stat-card__values {
			font-size: var(--cw-text-lg);
		}

		.cw-stat-card__hero-value {
			font-size: var(--cw-text-2xl);
		}

		.cw-stat-card__detail-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
