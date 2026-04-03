<script lang="ts">
	import type { CwStatCardData, CwStatCardLabels } from "../types/index.js";

	interface Props {
		/** Display title for the stat card */
		title: string;
		/** Statistical data to display */
		stats: CwStatCardData;
		/** Unit notation displayed as a superscript (e.g. "°C", "%") */
		unit?: string;
		/** Accent colour for the avg/median dots and highlighted value */
		accentColor?: string;
		/** Whether the card can be expanded to show details */
		expandable?: boolean;
		/** Override display labels for i18n */
		labels?: CwStatCardLabels;
		/** Additional CSS class */
		class?: string;
	}

	let {
		title,
		stats,
		unit = "",
		accentColor = "var(--cw-primary-500)",
		expandable = true,
		labels: rawLabels = {},
		class: className = "",
	}: Props = $props();

	const defaultLabels: Required<CwStatCardLabels> = {
		min: 'Min',
		avg: 'Avg',
		max: 'Max',
		count: 'Count',
		median: 'Median',
		stdDev: 'Std Dev',
		range: 'Range',
		aboveAvg: 'Above average',
		belowAvg: 'Below average',
		atAvg: 'At average',
	};

	const l = $derived({ ...defaultLabels, ...rawLabels });

	let expanded = $state(false);

	function roundForDisplay(v: number): number {
		return Number.isInteger(v) ? v : Number(v.toFixed(1));
	}

	function fmt(v: number | undefined | null): string {
		if (v == null) return "—";
		const rounded = roundForDisplay(v);
		return Number.isInteger(rounded)
			? String(rounded)
			: rounded.toLocaleString('en', {
				minimumFractionDigits: 1,
				maximumFractionDigits: 1,
				useGrouping: true
			});
	}

	function fmtSigned(v: number): string {
		if (v === 0) return "0";
		return `${v > 0 ? "+" : "-"}${fmt(Math.abs(v))}`;
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

	const medianPercent = $derived(
		stats.min != null && stats.max != null && stats.median != null
			? percent(stats.min, stats.max, stats.median)
			: null,
	);

	const deltaFromAverage = $derived.by(() => {
		if (stats.lastReading == null || stats.avg == null) return null;
		return roundForDisplay(stats.lastReading - stats.avg);
	});

	const deltaState = $derived.by<"above" | "below" | "at" | null>(() => {
		if (deltaFromAverage == null) return null;
		if (deltaFromAverage > 0) return "above";
		if (deltaFromAverage < 0) return "below";
		return "at";
	});

	function deltaLabel(state: "above" | "below" | "at"): string {
		if (state === "above") return l.aboveAvg;
		if (state === "below") return l.belowAvg;
		return l.atAvg;
	}

	function toggle() {
		if (expandable) expanded = !expanded;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			toggle();
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="cw-stat-card {className}"
	class:cw-stat-card--expandable={expandable}
	class:cw-stat-card--expanded={expanded}
	role={expandable ? "button" : undefined}
	tabindex={expandable ? 0 : undefined}
	style:--cw-stat-accent={accentColor}
	onclick={toggle}
	onkeydown={expandable ? onKeydown : undefined}
>
	<div class="cw-stat-card__header">
		<h4 class="cw-stat-card__title">{title}</h4>
	</div>

	{#if stats.lastReading != null}
		<div class="cw-stat-card__hero">
			<span class="cw-stat-card__hero-value">
				{stats.lastReading.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 2, useGrouping: true })}{#if unit}
					{#if isCo2Unit(unit)}
						<span
							class="cw-stat-card__hero-unit-group cw-stat-card__hero-unit-group--super"
						>
							{co2UnitPrefix(unit)}<sub
								class="cw-stat-card__hero-unit cw-stat-card__hero-unit--sub"
								>2</sub
							>
						</span>
					{:else}
						<sup
							class="cw-stat-card__hero-unit cw-stat-card__hero-unit--super"
							>{unit}</sup
						>
					{/if}
				{/if}
			</span>
			{#if deltaFromAverage != null && deltaState != null}
				<span
					class="cw-stat-card__comparison"
					title={deltaLabel(deltaState)}
					aria-label={`${fmtSigned(deltaFromAverage)}${unit ? ` ${unit}` : ""} ${deltaLabel(deltaState)}`}
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
					<span class="cw-stat-card__comparison-value">
						{deltaFromAverage.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0, useGrouping: true })}{#if unit}<sup
								class="cw-stat-card__unit">{unit}</sup
							>{/if}
					</span>
				</span>
			{/if}
		</div>
	{/if}

	<div class="cw-stat-card__values">
		<span>
			{fmt(stats.min)}{#if unit && stats.min != null}<sup
					class="cw-stat-card__unit">{unit}</sup
				>{/if}
		</span>
		<span class="cw-stat-card__avg-value">
			{fmt(stats.avg)}{#if unit && stats.avg != null}<sup
					class="cw-stat-card__unit">{unit}</sup
				>{/if}
		</span>
		<span>
			{fmt(stats.max)}{#if unit && stats.max != null}<sup
					class="cw-stat-card__unit">{unit}</sup
				>{/if}
		</span>
	</div>

	<div class="cw-stat-card__bar">
		<div
			class="cw-stat-card__dot cw-stat-card__dot--endpoint"
			style:left="0%"
		></div>
		<div
			class="cw-stat-card__dot cw-stat-card__dot--endpoint"
			style:left="100%"
		></div>

		{#if avgPercent != null}
			<div
				class="cw-stat-card__dot cw-stat-card__dot--avg"
				style:left="{avgPercent}%"
			></div>
		{/if}

		{#if medianPercent != null}
			<div
				class="cw-stat-card__dot cw-stat-card__dot--median"
				style:left="{medianPercent}%"
			></div>
		{/if}
	</div>
	<div class="cw-stat-card__labels">
		<span>{l.min}</span>
		<span>{l.avg}</span>
		<span>{l.max}</span>
	</div>

	{#if expanded}
		<div class="cw-stat-card__details">
			<div class="cw-stat-card__detail-grid">
				<div class="cw-stat-card__detail-item">
					<span class="cw-stat-card__detail-label">{l.count}</span>
					<span class="cw-stat-card__detail-value"
						>{stats.count ?? "—"}</span
					>
				</div>
				<div class="cw-stat-card__detail-item">
					<span class="cw-stat-card__detail-label">{l.median}</span>
					<span class="cw-stat-card__detail-value">
						{fmt(
							stats.median,
						)}{#if unit && stats.median != null}{unit}{/if}
					</span>
				</div>
				<div class="cw-stat-card__detail-item">
					<span class="cw-stat-card__detail-label">{l.stdDev}</span>
					<span class="cw-stat-card__detail-value">
						{fmt(
							stats.stdDev,
						)}{#if unit && stats.stdDev != null}{unit}{/if}
					</span>
				</div>
				<div class="cw-stat-card__detail-item">
					<span class="cw-stat-card__detail-label">{l.range}</span>
					<span class="cw-stat-card__detail-value">
						{#if stats.min != null && stats.max != null}
							{fmt(stats.max - stats.min)}{#if unit}{unit}{/if}
						{:else}
							—
						{/if}
					</span>
				</div>
			</div>
		</div>
	{/if}

	{#if expandable}
		<div class="cw-stat-card__toggle">
			<svg
				class="cw-stat-card__chevron"
				viewBox="0 0 16 16"
				fill="none"
				aria-hidden="true"
			>
				<path
					d="M4 6l4 4 4-4"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<span>{expanded ? "Click to collapse" : "Click to expand"}</span>
		</div>
	{/if}
</div>

<style>
	.cw-stat-card {
		background-color: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-lg);
		padding: var(--cw-space-2);
		font-family: var(--cw-font-family);
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--cw-space-2);
		container-type: inline-size;
		transition: box-shadow var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-stat-card--expandable {
		cursor: pointer;
		user-select: none;
	}

	.cw-stat-card--expandable:hover {
		box-shadow: var(--cw-shadow-sm);
	}

	.cw-stat-card--expandable:focus-visible {
		outline: var(--cw-focus-ring-width) solid var(--cw-primary-400);
		outline-offset: var(--cw-focus-ring-offset);
	}

	.cw-stat-card__header {
		width: 100%;
	}

	.cw-stat-card__title {
		margin: 0;
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-secondary);
	}

	.cw-stat-card__unit {
		font-size: var(--cw-text-md);
		font-weight: var(--cw-font-normal);
	}

	.cw-stat-card__hero {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		min-height: 6.25rem;
		padding: var(--cw-space-3) var(--cw-space-2);
		text-align: center;
		border: 1px solid
			color-mix(
				in srgb,
				var(--cw-stat-accent) 20%,
				var(--cw-border-default)
			);
		border-radius: var(--cw-radius-xl);
		background-color: var(--cw-bg-surface-elevated);
	}

	.cw-stat-card__hero-label {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.cw-stat-card__hero-value {
		font-size: clamp(2.5rem, 9cqw, 4rem);
		font-weight: var(--cw-font-bold);
		line-height: 0.95;
		letter-spacing: -0.04em;
		color: var(--cw-text-primary);
		font-variant-numeric: tabular-nums;
	}

	/* Fluid sup/sub positioning adapted from CSS-Tricks:
	   combine a fixed px floor with em-based scaling, then offset from baseline. */
	.cw-stat-card__hero-unit,
	.cw-stat-card__hero-unit-group {
		font-size: calc(0.5em);
		font-weight: var(--cw-font-medium);
		line-height: 1;
		vertical-align: baseline;
		position: relative;
	}

	.cw-stat-card__hero-unit-group {
		display: inline-flex;
		align-items: baseline;
		gap: 0.02em;
	}

	.cw-stat-card__hero-unit--super,
	.cw-stat-card__hero-unit-group--super {
		top: calc(-0.83em + (-6.32px));
	}

	.cw-stat-card__hero-unit--sub {
		top: calc(0.42em - 1.66px);
	}

	.cw-stat-card__comparison {
		position: absolute;
		top: var(--cw-space-1);
		right: var(--cw-space-1);
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.2rem 0.5rem;
		border: 1px solid
			color-mix(in srgb, var(--cw-border-default) 72%, transparent);
		border-radius: var(--cw-radius-pill);
		background-color: color-mix(
			in srgb,
			var(--cw-bg-muted) 38%,
			var(--cw-bg-surface)
		);
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
		font-weight: var(--cw-font-normal);
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
		font-weight: var(--cw-font-bold);
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
	}

	.cw-stat-card__dot--median {
		width: 0.75rem;
		height: 0.75rem;
		opacity: 0.65;
		background-color: var(--cw-stat-accent);
		border: 2px solid var(--cw-bg-surface);
	}

	.cw-stat-card__details {
		width: 100%;
		padding-top: var(--cw-space-3);
		border-top: 1px solid var(--cw-border-default);
	}

	.cw-stat-card__detail-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--cw-space-2);
	}

	.cw-stat-card__detail-item {
		display: flex;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-base);
	}

	.cw-stat-card__detail-label {
		color: var(--cw-text-muted);
	}

	.cw-stat-card__detail-value {
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-primary);
	}

	.cw-stat-card__toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-1);
		width: 100%;
		padding-top: var(--cw-space-1);
		border-top: 1px solid var(--cw-border-default);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.cw-stat-card__chevron {
		width: 1rem;
		height: 1rem;
		transition: transform var(--cw-duration-normal) var(--cw-ease-default);
	}

	.cw-stat-card--expanded .cw-stat-card__chevron {
		transform: rotate(180deg);
	}

	@container (max-width: 19rem) {
		.cw-stat-card__values {
			font-size: var(--cw-text-lg);
		}
	}
</style>
