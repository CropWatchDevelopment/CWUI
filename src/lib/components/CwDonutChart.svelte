<script lang="ts" module>
	export interface CwDonutChartLabels {
		/** Accessible label for the chart graphic. Default: "Donut chart" */
		ariaLabel?: string;
		/** Fallback label shown in the center when no segment is hovered. Default: "Total" */
		total?: string;
		/** Suffix shown under the hovered segment's value, e.g. "of 120". Default: `of {total}` */
		ofTotal?: (total: string | number) => string;
		/** Accessible label / tooltip for a single arc, combining its label and value. Default: `{label}: {value}` */
		segmentLabel?: (label: string, value: string | number) => string;
		/** Accessible text announced while `loading` is true. Default: "Loading chart" */
		loading?: string;
	}

	const DEFAULT_LABELS: Required<CwDonutChartLabels> = {
		ariaLabel: 'Donut chart',
		total: 'Total',
		ofTotal: (total) => `of ${total}`,
		segmentLabel: (label, value) => `${label}: ${value}`,
		loading: 'Loading chart'
	};

	/** Shared categorical palette (theme-aware tokens). */
	const DEFAULT_COLORS = [
		'var(--cw-chart-cat-1)',
		'var(--cw-chart-cat-2)',
		'var(--cw-chart-cat-3)',
		'var(--cw-chart-cat-4)',
		'var(--cw-chart-cat-5)',
		'var(--cw-chart-cat-6)',
		'var(--cw-chart-cat-7)',
		'var(--cw-chart-cat-8)'
	];
</script>

<script lang="ts">
	import type { CwDonutSegment, CwNoDataMessage } from '../types/index.js';
	import { formatCwNumber } from '../utils/cwFormat.js';
	import CwNoDataOverlay from './CwNoDataOverlay.svelte';
	import { getCwNoDataMessage, hasCwNoData } from './cwNoData.js';

	interface Props {
		segments?: CwDonutSegment[] | null;
		size?: number;
		thickness?: number;
		showLegend?: boolean;
		/**
		 * Show the no-data overlay. When omitted the overlay appears automatically
		 * if there are no segments or every value is zero.
		 */
		noData?: CwNoDataMessage;
		/** Show a skeleton ring while data is loading. */
		loading?: boolean;
		/** BCP 47 locale for number formatting. Defaults to the runtime locale. */
		locale?: string;
		/** Maximum fraction digits for displayed values. Default: 2 */
		decimals?: number;
		/** Override display labels for i18n */
		labels?: CwDonutChartLabels;
		class?: string;
	}

	let {
		segments: segmentsInput = [],
		size = 200,
		thickness = 40,
		showLegend = true,
		noData,
		loading = false,
		locale,
		decimals = 2,
		labels = {},
		class: className = ''
	}: Props = $props();

	const l = $derived({ ...DEFAULT_LABELS, ...labels });

	const segments = $derived(
		(segmentsInput ?? []).filter((s) => Number.isFinite(s.value) && s.value >= 0)
	);

	let hoveredIndex = $state<number | null>(null);

	const total = $derived(segments.reduce((sum, s) => sum + s.value, 0));
	const isEmpty = $derived(segments.length === 0 || total <= 0);
	const hasNoData = $derived(!loading && (hasCwNoData(noData) || isEmpty));
	const noDataMessage = $derived(getCwNoDataMessage(noData));

	const radius = $derived((size - thickness) / 2);
	const center = $derived(size / 2);

	function fmt(value: number): string {
		return formatCwNumber(value, { locale, maximumFractionDigits: decimals });
	}

	function getColor(seg: CwDonutSegment, i: number): string {
		return seg.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
	}

	const arcs = $derived.by(() => {
		let startAngle = -90; // Start from top
		return segments.map((seg, i) => {
			// Cap a full-circle sweep just under 360°: an arc whose start and end
			// points coincide renders as zero-length, making a 100% segment (or a
			// single-segment donut) invisible.
			const angle = total > 0 ? Math.min((seg.value / total) * 360, 359.99) : 0;
			const endAngle = startAngle + angle;
			const path = describeArc(center, center, radius, startAngle, endAngle);
			const result = { ...seg, path, index: i };
			startAngle = endAngle;
			return result;
		});
	});

	function describeArc(
		cx: number,
		cy: number,
		r: number,
		startAngle: number,
		endAngle: number
	): string {
		const startRad = (startAngle * Math.PI) / 180;
		const endRad = (endAngle * Math.PI) / 180;
		const x1 = cx + r * Math.cos(startRad);
		const y1 = cy + r * Math.sin(startRad);
		const x2 = cx + r * Math.cos(endRad);
		const y2 = cy + r * Math.sin(endRad);
		const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
		return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
	}

	const hoveredSegment = $derived(hoveredIndex !== null ? segments[hoveredIndex] : null);

	/** Summary read by screen readers in place of the visual arcs. */
	const summary = $derived(
		isEmpty
			? l.ariaLabel
			: `${l.ariaLabel}. ${l.total}: ${fmt(total)}. ${segments
					.map((s) => l.segmentLabel(s.label, fmt(s.value)))
					.join('; ')}`
	);
</script>

<div
	class="cw-donut-chart cw-no-data-host {className}"
	class:cw-no-data-host--active={hasNoData}
	aria-busy={loading || undefined}
>
	<div class="cw-donut-chart__chart" style:width="{size}px" style:height="{size}px">
		{#if loading}
			<svg viewBox="0 0 {size} {size}" width={size} height={size} role="img" aria-label={l.loading}>
				<circle
					class="cw-donut-chart__skeleton"
					cx={center}
					cy={center}
					r={radius}
					fill="none"
					stroke-width={thickness}
				/>
			</svg>
		{:else}
			<svg viewBox="0 0 {size} {size}" width={size} height={size} role="img" aria-label={summary}>
				{#if isEmpty}
					<circle
						class="cw-donut-chart__track"
						cx={center}
						cy={center}
						r={radius}
						fill="none"
						stroke-width={thickness}
					/>
				{/if}
				{#each arcs as arc, i (`${arc.label}-${i}`)}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<path
						d={arc.path}
						fill="none"
						style:stroke={getColor(arc, i)}
						stroke-width={hoveredIndex === i ? thickness + 6 : thickness}
						stroke-linecap="butt"
						class="cw-donut-chart__arc"
						class:cw-donut-chart__arc--dimmed={hoveredIndex !== null && hoveredIndex !== i}
						onmouseenter={() => (hoveredIndex = i)}
						onmouseleave={() => (hoveredIndex = null)}
					>
						<title>{l.segmentLabel(arc.label, fmt(arc.value))}</title>
					</path>
				{/each}
			</svg>

			{#if !isEmpty}
				<!-- Center label (decorative; the SVG's aria-label carries the data) -->
				<div class="cw-donut-chart__center" aria-hidden="true">
					{#if hoveredSegment}
						<span class="cw-donut-chart__center-value">{fmt(hoveredSegment.value)}</span>
						<span class="cw-donut-chart__center-label">{hoveredSegment.label}</span>
						<span class="cw-donut-chart__center-total">{l.ofTotal(fmt(total))}</span>
					{:else}
						<span class="cw-donut-chart__center-value">{fmt(total)}</span>
						<span class="cw-donut-chart__center-label">{l.total}</span>
					{/if}
				</div>
			{/if}
		{/if}
	</div>

	{#if showLegend && !loading && !isEmpty}
		<ul class="cw-donut-chart__legend" aria-hidden="true">
			{#each segments as seg, i (`${seg.label}-${i}`)}
				<li
					class="cw-donut-chart__legend-item"
					class:cw-donut-chart__legend-item--active={hoveredIndex === i}
					onmouseenter={() => (hoveredIndex = i)}
					onmouseleave={() => (hoveredIndex = null)}
				>
					<span class="cw-donut-chart__legend-swatch" style:background-color={getColor(seg, i)}
					></span>
					<span class="cw-donut-chart__legend-label">{seg.label}</span>
					<span class="cw-donut-chart__legend-value">{fmt(seg.value)}</span>
				</li>
			{/each}
		</ul>
	{/if}

	{#if hasNoData}
		<CwNoDataOverlay message={noDataMessage} />
	{/if}
</div>

<style>
	.cw-donut-chart {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--cw-space-4);
		font-family: var(--cw-font-family);
	}

	.cw-donut-chart__chart {
		position: relative;
		display: inline-block;
		max-width: 100%;
	}

	.cw-donut-chart__chart svg {
		display: block;
		max-width: 100%;
		height: auto;
	}

	.cw-donut-chart__arc {
		transition:
			stroke-width var(--cw-duration-fast) var(--cw-ease-default),
			opacity var(--cw-duration-fast) var(--cw-ease-default);
		cursor: pointer;
	}

	.cw-donut-chart__arc--dimmed {
		opacity: 0.45;
	}

	.cw-donut-chart__track {
		stroke: var(--cw-chart-grid);
	}

	.cw-donut-chart__skeleton {
		stroke: var(--cw-bg-muted);
		animation: cw-donut-pulse 1.4s var(--cw-ease-default) infinite;
	}

	@keyframes cw-donut-pulse {
		50% {
			opacity: 0.5;
		}
	}

	/* ── Center label ────────────────────── */
	.cw-donut-chart__center {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		text-align: center;
	}

	.cw-donut-chart__center-value {
		font-size: var(--cw-text-2xl);
		font-weight: var(--cw-font-bold);
		line-height: var(--cw-leading-tight);
		color: var(--cw-text-primary);
		font-variant-numeric: tabular-nums;
	}

	.cw-donut-chart__center-label,
	.cw-donut-chart__center-total {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	/* ── Legend ───────────────────────────── */
	.cw-donut-chart__legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-1) var(--cw-space-3);
		justify-content: center;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.cw-donut-chart__legend-item {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-sm);
		padding: var(--cw-space-1) var(--cw-space-2);
		border-radius: var(--cw-radius-sm);
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-donut-chart__legend-item:hover,
	.cw-donut-chart__legend-item--active {
		background-color: var(--cw-bg-muted);
	}

	.cw-donut-chart__legend-swatch {
		width: 0.625rem;
		height: 0.625rem;
		border-radius: var(--cw-radius-sm);
		flex-shrink: 0;
	}

	.cw-donut-chart__legend-label {
		color: var(--cw-text-primary);
	}

	.cw-donut-chart__legend-value {
		color: var(--cw-text-muted);
		font-variant-numeric: tabular-nums;
	}
</style>
