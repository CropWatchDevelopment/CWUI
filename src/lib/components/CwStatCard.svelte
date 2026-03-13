<script lang="ts">
	import type { CwStatCardData, CwStatCardTrend } from '../types/index.js';

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
		/** Additional CSS class */
		class?: string;
	}

	let {
		title,
		stats,
		unit = '',
		accentColor = 'var(--cw-primary-500)',
		expandable = true,
		class: className = ''
	}: Props = $props();

	let expanded = $state(false);

	function fmt(v: number | undefined | null): string {
		if (v == null) return '—';
		return Number.isInteger(v) ? String(v) : v.toFixed(1);
	}

	function percent(min: number, max: number, val: number): number {
		if (max === min) return 50;
		return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
	}

	const avgPercent = $derived(
		stats.min != null && stats.max != null && stats.avg != null
			? percent(stats.min, stats.max, stats.avg)
			: null
	);

	const medianPercent = $derived(
		stats.min != null && stats.max != null && stats.median != null
			? percent(stats.min, stats.max, stats.median)
			: null
	);

	function trendIcon(trend: CwStatCardTrend): string {
		if (trend === 'up') return 'M7 14l5-10M12 4l-5 10M4 8h8';
		if (trend === 'down') return 'M7 4l5 10M12 14L7 4M4 10h8';
		return 'M3 8h10'; // stable
	}

	function trendLabel(trend: CwStatCardTrend): string {
		if (trend === 'up') return 'Trending up';
		if (trend === 'down') return 'Trending down';
		return 'Stable';
	}

	function toggle() {
		if (expandable) expanded = !expanded;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
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
	role={expandable ? 'button' : undefined}
	tabindex={expandable ? 0 : undefined}
	onclick={toggle}
	onkeydown={expandable ? onKeydown : undefined}
>
	<!-- Header: title + current reading & trend -->
	<div class="cw-stat-card__header">
		<h4 class="cw-stat-card__title">{title}</h4>

		{#if stats.lastReading != null}
			<div class="cw-stat-card__current">
				<span class="cw-stat-card__current-value">
					{fmt(stats.lastReading)}{#if unit}<sup class="cw-stat-card__unit">{unit}</sup>{/if}
				</span>
				{#if stats.trend}
					<span class="cw-stat-card__trend cw-stat-card__trend--{stats.trend}" title={trendLabel(stats.trend)}>
						<svg class="cw-stat-card__trend-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							{#if stats.trend === 'up'}
								<path d="M8 12V4m0 0L5 7m3-3 3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							{:else if stats.trend === 'down'}
								<path d="M8 4v8m0 0 3-3m-3 3L5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							{:else}
								<path d="M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							{/if}
						</svg>
					</span>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Labels row -->
	<div class="cw-stat-card__labels">
		<span>Min</span>
		<span>Avg</span>
		<span>Max</span>
	</div>

	<!-- Values row -->
	<div class="cw-stat-card__values">
		<span>
			{fmt(stats.min)}{#if unit && stats.min != null}<sup class="cw-stat-card__unit">{unit}</sup>{/if}
		</span>
		<span class="cw-stat-card__avg-value" style:color={accentColor}>
			{fmt(stats.avg)}{#if unit && stats.avg != null}<sup class="cw-stat-card__unit">{unit}</sup>{/if}
		</span>
		<span>
			{fmt(stats.max)}{#if unit && stats.max != null}<sup class="cw-stat-card__unit">{unit}</sup>{/if}
		</span>
	</div>

	<!-- Range bar -->
	<div class="cw-stat-card__bar">
		<!-- Min dot -->
		<div class="cw-stat-card__dot cw-stat-card__dot--endpoint" style:left="0%"></div>
		<!-- Max dot -->
		<div class="cw-stat-card__dot cw-stat-card__dot--endpoint" style:left="100%"></div>

		<!-- Avg dot -->
		{#if avgPercent != null}
			<div
				class="cw-stat-card__dot cw-stat-card__dot--avg"
				style:left="{avgPercent}%"
				style:background-color={accentColor}
			></div>
		{/if}

		<!-- Median dot -->
		{#if medianPercent != null}
			<div
				class="cw-stat-card__dot cw-stat-card__dot--median"
				style:left="{medianPercent}%"
				style:background-color={accentColor}
			></div>
		{/if}
	</div>

	<!-- Expanded details -->
	{#if expanded}
		<div class="cw-stat-card__details">
			<div class="cw-stat-card__detail-grid">
				<div class="cw-stat-card__detail-item">
					<span class="cw-stat-card__detail-label">Count</span>
					<span class="cw-stat-card__detail-value">{stats.count ?? '—'}</span>
				</div>
				<div class="cw-stat-card__detail-item">
					<span class="cw-stat-card__detail-label">Median</span>
					<span class="cw-stat-card__detail-value">
						{fmt(stats.median)}{#if unit && stats.median != null}{unit}{/if}
					</span>
				</div>
				<div class="cw-stat-card__detail-item">
					<span class="cw-stat-card__detail-label">Std Dev</span>
					<span class="cw-stat-card__detail-value">
						{fmt(stats.stdDev)}{#if unit && stats.stdDev != null}{unit}{/if}
					</span>
				</div>
				<div class="cw-stat-card__detail-item">
					<span class="cw-stat-card__detail-label">Range</span>
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

	<!-- Expand / collapse indicator -->
	{#if expandable}
		<div class="cw-stat-card__toggle">
			<svg class="cw-stat-card__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>{expanded ? 'Click to collapse' : 'Click to expand'}</span>
		</div>
	{/if}
</div>

<style>
	.cw-stat-card {
		background-color: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-lg);
		padding: var(--cw-space-4);
		font-family: var(--cw-font-family);
		display: flex;
		flex-direction: column;
		align-items: center;
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

	/* ── Header ──────────────────────── */
	.cw-stat-card__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		margin-bottom: var(--cw-space-2);
	}

	.cw-stat-card__title {
		margin: 0;
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	.cw-stat-card__current {
		display: flex;
		align-items: center;
		gap: var(--cw-space-1);
	}

	.cw-stat-card__current-value {
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-bold);
		color: var(--cw-text-primary);
	}

	.cw-stat-card__unit {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-normal);
	}

	/* ── Trend ──────────────────────── */
	.cw-stat-card__trend {
		display: inline-flex;
		align-items: center;
	}

	.cw-stat-card__trend-icon {
		width: 1rem;
		height: 1rem;
	}

	.cw-stat-card__trend--up {
		color: var(--cw-success-500);
	}

	.cw-stat-card__trend--down {
		color: var(--cw-danger-500);
	}

	.cw-stat-card__trend--stable {
		color: var(--cw-gray-400);
	}

	/* ── Labels ──────────────────────── */
	.cw-stat-card__labels {
		display: flex;
		justify-content: space-between;
		width: 100%;
		padding: 0 var(--cw-space-1);
		margin-bottom: 2px;
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-normal);
		color: var(--cw-text-muted);
	}

	/* ── Values ──────────────────────── */
	.cw-stat-card__values {
		display: flex;
		justify-content: space-between;
		width: 100%;
		padding: 0 var(--cw-space-1);
		margin-bottom: var(--cw-space-2);
		font-size: var(--cw-text-2xl);
		font-weight: var(--cw-font-bold);
		color: var(--cw-text-primary);
	}

	.cw-stat-card__avg-value {
		font-weight: var(--cw-font-bold);
	}

	/* ── Bar ──────────────────────── */
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
	}

	.cw-stat-card__dot--median {
		width: 0.75rem;
		height: 0.75rem;
		opacity: 0.65;
		border: 2px solid var(--cw-bg-surface);
	}

	/* ── Expanded Details ──────────── */
	.cw-stat-card__details {
		width: 100%;
		margin-top: var(--cw-space-4);
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

	/* ── Toggle ──────────────────────── */
	.cw-stat-card__toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-1);
		width: 100%;
		margin-top: var(--cw-space-2);
		padding-top: var(--cw-space-3);
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
</style>
