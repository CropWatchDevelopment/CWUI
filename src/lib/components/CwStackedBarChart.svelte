<script lang="ts" module>
	export interface CwStackedBarChartLabels {
		/** Accessible label for the chart container (`role="img"`). Default: "Stacked bar chart" */
		ariaLabel?: string;
		/** Label for the tooltip's total row. Default: "Total" */
		total?: string;
		/** Accessible label for a single bar, combining its bucket label and total. Default: `{label}: {total}` */
		barLabel?: (label: string, total: string) => string;
		/** Accessible text announced while `loading` is true. Default: "Loading chart" */
		loading?: string;
	}

	const DEFAULT_LABELS: Required<CwStackedBarChartLabels> = {
		ariaLabel: 'Stacked bar chart',
		total: 'Total',
		barLabel: (label, total) => `${label}: ${total}`,
		loading: 'Loading chart'
	};

	/**
	 * Theme-aware categorical palette. The `--cw-chart-cat-*` tokens resolve to
	 * the light/dark steps below, so the chart follows the document theme.
	 */
	const TOKEN_CATEGORY_COLORS = [
		'var(--cw-chart-cat-1)',
		'var(--cw-chart-cat-2)',
		'var(--cw-chart-cat-3)',
		'var(--cw-chart-cat-4)',
		'var(--cw-chart-cat-5)',
		'var(--cw-chart-cat-6)',
		'var(--cw-chart-cat-7)',
		'var(--cw-chart-cat-8)'
	];

	/**
	 * Default categorical palettes (light/dark steps of the same hues), assigned
	 * to categories by index in fixed order. Validated for adjacent-pair CVD
	 * separation and normal-vision distance, and each colour reaches 3:1 against
	 * the chart card surface of its theme (WCAG 1.4.11 non-text contrast).
	 */
	const LIGHT_CATEGORY_COLORS = [
		'#2a78d6',
		'#eb652f',
		'#19a271',
		'#bf8200',
		'#e36192',
		'#008300',
		'#4a3aa7',
		'#e34948'
	];
	const DARK_CATEGORY_COLORS = [
		'#3987e5',
		'#da5e2d',
		'#199e70',
		'#c98500',
		'#d75987',
		'#009a00',
		'#9085e9',
		'#e66767'
	];
</script>

<script lang="ts">
	import type {
		CwNoDataMessage,
		CwStackedBarBucket,
		CwStackedBarCategory
	} from '../types/index.js';
	import { untrack } from 'svelte';
	import CwNoDataOverlay from './CwNoDataOverlay.svelte';
	import { getCwNoDataMessage, hasCwNoData } from './cwNoData.js';

	interface Props {
		/** Series definitions in fixed display order (bottom of the stack first). */
		categories?: CwStackedBarCategory[] | null;
		/** One entry per bar, in x-axis order. */
		buckets?: CwStackedBarBucket[] | null;
		/** Category ids hidden on first render; the legend can re-enable them. */
		initialHidden?: string[];
		/**
		 * Force the light or dark palette. When omitted (recommended) colours come
		 * from the `--cw-chart-cat-*` tokens and follow the document theme.
		 */
		theme?: 'light' | 'dark';
		height?: number;
		showLegend?: boolean;
		/** Formats values for axis ticks, tooltips, and a11y labels (inject locale formatting). */
		formatValue?: (value: number) => string;
		/**
		 * Show the no-data overlay. When omitted the overlay appears automatically
		 * if there are no buckets or every visible value is zero.
		 */
		noData?: CwNoDataMessage;
		/** Show skeleton bars while data is loading. */
		loading?: boolean;
		/** Override display labels for i18n */
		labels?: CwStackedBarChartLabels;
		class?: string;
	}

	let {
		categories: categoriesInput = [],
		buckets: bucketsInput = [],
		initialHidden = [],
		theme,
		height = 320,
		showLegend = true,
		formatValue = (value) => String(value),
		noData,
		loading = false,
		labels = {},
		class: className = ''
	}: Props = $props();

	const l = $derived({ ...DEFAULT_LABELS, ...labels });
	const categories = $derived(categoriesInput ?? []);
	const buckets = $derived(bucketsInput ?? []);

	// Seeded once from the prop; the legend owns it afterwards.
	let hidden = $state<string[]>(untrack(() => [...initialHidden]));
	let hoveredIndex = $state<number | null>(null);
	let containerWidth = $state(0);

	const palette = $derived(
		theme === 'dark'
			? DARK_CATEGORY_COLORS
			: theme === 'light'
				? LIGHT_CATEGORY_COLORS
				: TOKEN_CATEGORY_COLORS
	);

	// Color follows the category's position in the full list, never the count of
	// visible series — toggling a category must not repaint the survivors.
	const colorById = $derived(
		new Map(categories.map((cat, i) => [cat.id, cat.color ?? palette[i % palette.length]]))
	);

	const visibleCategories = $derived(categories.filter((cat) => !hidden.includes(cat.id)));

	function toggleCategory(id: string) {
		if (hidden.includes(id)) {
			hidden = hidden.filter((h) => h !== id);
			return;
		}
		// Never hide the last visible series — an empty chart with no way back
		// reads as broken.
		if (visibleCategories.length <= 1) return;
		hidden = [...hidden, id];
	}

	function bucketTotal(bucket: CwStackedBarBucket): number {
		return visibleCategories.reduce((sum, cat) => sum + (bucket.values[cat.id] ?? 0), 0);
	}

	const maxTotal = $derived(buckets.reduce((max, b) => Math.max(max, bucketTotal(b)), 0));

	/** Round the axis maximum up to a "nice" number (1/2/2.5/5 × 10^k). */
	function niceCeil(value: number): number {
		if (value <= 0) return 1;
		const exp = Math.floor(Math.log10(value));
		const base = Math.pow(10, exp);
		for (const mult of [1, 2, 2.5, 5, 10]) {
			if (value <= mult * base) return mult * base;
		}
		return 10 * base;
	}

	const TICK_COUNT = 4;
	const axisMax = $derived(niceCeil(maxTotal));
	const ticks = $derived(
		Array.from({ length: TICK_COUNT + 1 }, (_, i) => (axisMax / TICK_COUNT) * i)
	);

	const MARGIN = { top: 12, right: 8, bottom: 26 };
	const marginLeft = $derived(
		12 + Math.max(...ticks.map((t) => formatValue(t).length), 1) * 7.2
	);

	const width = $derived(containerWidth > 0 ? containerWidth : 640);
	const plotWidth = $derived(Math.max(width - marginLeft - MARGIN.right, 40));
	const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 40));
	const baseline = $derived(MARGIN.top + plotHeight);

	const slotWidth = $derived(buckets.length > 0 ? plotWidth / buckets.length : plotWidth);
	const barWidth = $derived(Math.max(Math.min(slotWidth * 0.72, 48), 3));

	// Show every Nth x label so ~34px of room stays between them.
	const labelStep = $derived(Math.max(1, Math.ceil((buckets.length * 34) / plotWidth)));

	const SEGMENT_GAP = 2;
	const CORNER_RADIUS = 4;

	interface Segment {
		categoryId: string;
		color: string;
		x: number;
		y: number;
		height: number;
		rounded: boolean;
	}

	interface Bar {
		bucket: CwStackedBarBucket;
		index: number;
		x: number;
		slotX: number;
		total: number;
		segments: Segment[];
	}

	const bars = $derived.by<Bar[]>(() =>
		buckets.map((bucket, index) => {
			const slotX = marginLeft + index * slotWidth;
			const x = slotX + (slotWidth - barWidth) / 2;
			const total = bucketTotal(bucket);
			const segments: Segment[] = [];
			let cumulative = 0;

			for (const cat of visibleCategories) {
				const value = bucket.values[cat.id] ?? 0;
				if (value <= 0) continue;
				const rawHeight = (value / axisMax) * plotHeight;
				const yTop = baseline - ((cumulative + value) / axisMax) * plotHeight;
				cumulative += value;
				segments.push({
					categoryId: cat.id,
					color: colorById.get(cat.id) ?? palette[0],
					x,
					y: yTop,
					height: rawHeight,
					rounded: false
				});
			}

			// Carve a surface gap between stacked fills (never at the baseline) and
			// round only the topmost segment.
			for (let i = 0; i < segments.length; i++) {
				const isTop = i === segments.length - 1;
				if (!isTop && segments[i].height > SEGMENT_GAP + 1) {
					segments[i].height -= SEGMENT_GAP;
					segments[i].y += SEGMENT_GAP;
				}
				segments[i].rounded = isTop && segments[i].height >= CORNER_RADIUS;
			}

			return { bucket, index, x, slotX, total, segments };
		})
	);

	function roundedTopPath(seg: Segment, barW: number): string {
		const r = CORNER_RADIUS;
		const { x, y, height: h } = seg;
		return [
			`M ${x} ${y + h}`,
			`L ${x} ${y + r}`,
			`Q ${x} ${y} ${x + r} ${y}`,
			`L ${x + barW - r} ${y}`,
			`Q ${x + barW} ${y} ${x + barW} ${y + r}`,
			`L ${x + barW} ${y + h}`,
			'Z'
		].join(' ');
	}

	const hasNoData = $derived(
		!loading && (hasCwNoData(noData) || buckets.length === 0 || maxTotal <= 0)
	);

	const SKELETON_HEIGHTS = [0.55, 0.8, 0.4, 0.95, 0.65, 0.75, 0.5, 0.85];
	const noDataMessage = $derived(getCwNoDataMessage(noData));

	const hoveredBar = $derived(hoveredIndex !== null ? (bars[hoveredIndex] ?? null) : null);
	const hoveredRows = $derived(
		hoveredBar
			? visibleCategories
					.map((cat) => ({
						id: cat.id,
						label: cat.label,
						color: colorById.get(cat.id) ?? palette[0],
						value: hoveredBar.bucket.values[cat.id] ?? 0
					}))
					.filter((row) => row.value > 0)
					.reverse()
			: []
	);

	// Keep the tooltip inside the container: past 60% of the width it flips to
	// the left side of the bar.
	const tooltipLeft = $derived(
		hoveredBar ? Math.min(hoveredBar.slotX + slotWidth / 2, width) : 0
	);
	const tooltipFlipped = $derived(hoveredBar !== null && tooltipLeft > width * 0.6);
</script>

<div
	class="cw-stacked-bar-chart cw-no-data-host {className}"
	class:cw-no-data-host--active={hasNoData}
	aria-busy={loading || undefined}
>
	<div class="cw-stacked-bar-chart__plot" bind:clientWidth={containerWidth}>
		{#if loading}
			<svg viewBox="0 0 {width} {height}" width="100%" {height} role="img" aria-label={l.loading}>
				{#each SKELETON_HEIGHTS as h, i (i)}
					{@const slot = (width - 16) / SKELETON_HEIGHTS.length}
					<rect
						class="cw-stacked-bar-chart__skeleton"
						x={8 + i * slot + slot * 0.18}
						y={MARGIN.top + (1 - h) * plotHeight}
						width={slot * 0.64}
						height={h * plotHeight}
						rx="4"
					/>
				{/each}
			</svg>
		{:else}
		<svg
			viewBox="0 0 {width} {height}"
			width="100%"
			{height}
			role="img"
			aria-label={l.ariaLabel}
			onmouseleave={() => (hoveredIndex = null)}
		>
			<!-- Gridlines + y-axis tick labels -->
			{#each ticks as tick (tick)}
				{@const y = baseline - (tick / axisMax) * plotHeight}
				<line
					x1={marginLeft}
					y1={y}
					x2={width - MARGIN.right}
					y2={y}
					class="cw-stacked-bar-chart__gridline"
					class:cw-stacked-bar-chart__gridline--baseline={tick === 0}
				/>
				<text x={marginLeft - 6} y={y + 3} text-anchor="end" class="cw-stacked-bar-chart__tick">
					{formatValue(tick)}
				</text>
			{/each}

			<!-- Bars -->
			{#each bars as bar (bar.bucket.key)}
				<g
					class="cw-stacked-bar-chart__bar"
					class:cw-stacked-bar-chart__bar--dimmed={hoveredIndex !== null &&
						hoveredIndex !== bar.index}
				>
					{#each bar.segments as seg (seg.categoryId)}
						{#if seg.rounded}
							<path d={roundedTopPath(seg, barWidth)} style:fill={seg.color} />
						{:else}
							<rect x={seg.x} y={seg.y} width={barWidth} height={seg.height} style:fill={seg.color} />
						{/if}
					{/each}
				</g>

				<!-- x label -->
				{#if bar.index % labelStep === 0}
					<text
						x={bar.slotX + slotWidth / 2}
						y={height - 8}
						text-anchor="middle"
						class="cw-stacked-bar-chart__tick"
					>
						{bar.bucket.label}
					</text>
				{/if}

				<!-- Full-height hover target: larger than the mark itself -->
				<rect
					x={bar.slotX}
					y={MARGIN.top}
					width={slotWidth}
					height={plotHeight}
					fill="transparent"
					role="graphics-symbol"
					aria-label={l.barLabel(bar.bucket.label, formatValue(bar.total))}
					onmouseenter={() => (hoveredIndex = bar.index)}
				>
					<title>{l.barLabel(bar.bucket.label, formatValue(bar.total))}</title>
				</rect>
			{/each}
		</svg>
		{/if}

		{#if hoveredBar}
			<div
				class="cw-stacked-bar-chart__tooltip"
				class:cw-stacked-bar-chart__tooltip--flipped={tooltipFlipped}
				style:left="{tooltipLeft}px"
				style:top="{MARGIN.top}px"
			>
				<p class="cw-stacked-bar-chart__tooltip-title">{hoveredBar.bucket.label}</p>
				{#each hoveredRows as row (row.id)}
					<div class="cw-stacked-bar-chart__tooltip-row">
						<span class="cw-stacked-bar-chart__swatch" style:background-color={row.color}></span>
						<span class="cw-stacked-bar-chart__tooltip-label">{row.label}</span>
						<span class="cw-stacked-bar-chart__tooltip-value">{formatValue(row.value)}</span>
					</div>
				{/each}
				<div
					class="cw-stacked-bar-chart__tooltip-row cw-stacked-bar-chart__tooltip-row--total"
				>
					<span class="cw-stacked-bar-chart__tooltip-label">{l.total}</span>
					<span class="cw-stacked-bar-chart__tooltip-value">{formatValue(hoveredBar.total)}</span>
				</div>
			</div>
		{/if}
	</div>

	{#if showLegend && categories.length > 1 && !loading}
		<div class="cw-stacked-bar-chart__legend">
			{#each categories as cat (cat.id)}
				<button
					type="button"
					class="cw-stacked-bar-chart__legend-item"
					class:cw-stacked-bar-chart__legend-item--hidden={hidden.includes(cat.id)}
					aria-pressed={!hidden.includes(cat.id)}
					aria-disabled={!hidden.includes(cat.id) && visibleCategories.length <= 1
						? true
						: undefined}
					onclick={() => toggleCategory(cat.id)}
				>
					<span
						class="cw-stacked-bar-chart__swatch"
						style:background-color={colorById.get(cat.id)}
					></span>
					<span class="cw-stacked-bar-chart__legend-label">{cat.label}</span>
				</button>
			{/each}
		</div>
	{/if}

	{#if hasNoData}
		<CwNoDataOverlay message={noDataMessage} />
	{/if}
</div>

<style>
	.cw-stacked-bar-chart {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-2);
		width: 100%;
	}

	.cw-stacked-bar-chart__plot {
		position: relative;
		width: 100%;
	}

	.cw-stacked-bar-chart__skeleton {
		fill: var(--cw-bg-muted);
		animation: cw-stacked-bar-pulse 1.4s var(--cw-ease-default) infinite;
	}

	@keyframes cw-stacked-bar-pulse {
		50% {
			opacity: 0.5;
		}
	}

	.cw-stacked-bar-chart__gridline {
		stroke: var(--cw-chart-grid);
		stroke-width: 1;
	}

	.cw-stacked-bar-chart__gridline--baseline {
		stroke: color-mix(in srgb, var(--cw-border-strong) 70%, transparent);
	}

	.cw-stacked-bar-chart__tick {
		fill: var(--cw-chart-tick, var(--cw-text-muted));
		font-size: var(--cw-chart-tick-size, 0.6875rem);
		font-variant-numeric: tabular-nums;
	}

	.cw-stacked-bar-chart__bar {
		transition: opacity var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-stacked-bar-chart__bar--dimmed {
		opacity: 0.45;
	}

	/* ── Tooltip ──────────────────────────── */
	.cw-stacked-bar-chart__tooltip {
		position: absolute;
		transform: translateX(8px);
		min-width: 9rem;
		max-width: 16rem;
		padding: var(--cw-space-2) var(--cw-space-3);
		background-color: var(--cw-chart-tooltip-bg);
		border: 1px solid var(--cw-chart-tooltip-border);
		border-radius: var(--cw-radius-md);
		box-shadow: var(--cw-shadow-md);
		color: var(--cw-chart-tooltip-text);
		pointer-events: none;
		z-index: 2;
	}

	.cw-stacked-bar-chart__tooltip--flipped {
		transform: translateX(calc(-100% - 8px));
	}

	.cw-stacked-bar-chart__tooltip-title {
		margin: 0 0 var(--cw-space-1);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-chart-tooltip-text);
	}

	.cw-stacked-bar-chart__tooltip-row {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-xs);
		line-height: 1.5;
	}

	.cw-stacked-bar-chart__tooltip-row--total {
		margin-top: var(--cw-space-1);
		padding-top: var(--cw-space-1);
		border-top: 1px solid var(--cw-chart-tooltip-border);
		font-weight: var(--cw-font-semibold);
	}

	.cw-stacked-bar-chart__tooltip-label {
		flex: 1;
		color: var(--cw-chart-tooltip-muted);
	}

	.cw-stacked-bar-chart__tooltip-value {
		color: var(--cw-chart-tooltip-text);
		font-variant-numeric: tabular-nums;
	}

	/* ── Legend ───────────────────────────── */
	.cw-stacked-bar-chart__legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-2);
		justify-content: center;
	}

	.cw-stacked-bar-chart__legend-item {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
		padding: var(--cw-space-1) var(--cw-space-2);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		background: none;
		border: none;
		border-radius: var(--cw-radius-sm);
		cursor: pointer;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			opacity var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-stacked-bar-chart__legend-item:hover {
		background-color: var(--cw-bg-muted);
	}

	.cw-stacked-bar-chart__legend-item--hidden {
		opacity: 0.45;
	}

	.cw-stacked-bar-chart__legend-item[aria-disabled='true'] {
		cursor: not-allowed;
	}

	.cw-stacked-bar-chart__legend-item--hidden .cw-stacked-bar-chart__legend-label {
		text-decoration: line-through;
	}

	.cw-stacked-bar-chart__swatch {
		width: 0.625rem;
		height: 0.625rem;
		border-radius: var(--cw-radius-sm);
		flex-shrink: 0;
	}

	.cw-stacked-bar-chart__legend-label {
		color: var(--cw-text-primary);
	}
</style>
