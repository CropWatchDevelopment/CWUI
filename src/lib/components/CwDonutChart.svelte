<script lang="ts">
	import type { CwDonutSegment } from '../types/index.js';

	interface Props {
		segments: CwDonutSegment[];
		size?: number;
		thickness?: number;
		showLegend?: boolean;
	}

	let {
		segments,
		size = 200,
		thickness = 40,
		showLegend = true
	}: Props = $props();

	const uid = $props.id();

	let hoveredIndex = $state<number | null>(null);

	const total = $derived(segments.reduce((sum, s) => sum + s.value, 0));

	const radius = $derived((size - thickness) / 2);
	const centerX = $derived(size / 2);
	const centerY = $derived(size / 2);

	const defaultColors = [
		'var(--cw-primary-500)',
		'var(--cw-info-500)',
		'var(--cw-warning-500)',
		'var(--cw-danger-500)',
		'var(--cw-success-500)',
		'var(--cw-secondary-400)',
	];

	function getColor(seg: CwDonutSegment, i: number): string {
		return seg.color ?? defaultColors[i % defaultColors.length];
	}

	const arcs = $derived.by(() => {
		let startAngle = -90; // Start from top
		return segments.map((seg, i) => {
			const angle = total > 0 ? (seg.value / total) * 360 : 0;
			const endAngle = startAngle + angle;
			const arc = describeArc(centerX, centerY, radius, startAngle, endAngle);
			const result = { ...seg, startAngle, endAngle, path: arc, index: i };
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
</script>

<div class="cw-donut-chart" role="img" aria-label="Donut chart">
	<div class="cw-donut-chart__chart">
		<svg viewBox="0 0 {size} {size}" width={size} height={size}>
			{#each arcs as arc, i}
				<path
					d={arc.path}
					fill="none"
					stroke={getColor(arc, i)}
					stroke-width={thickness}
					stroke-linecap="butt"
					class="cw-donut-chart__arc"
					class:cw-donut-chart__arc--hovered={hoveredIndex === i}
					onmouseenter={() => (hoveredIndex = i)}
					onmouseleave={() => (hoveredIndex = null)}
					role="graphics-symbol"
					aria-label="{arc.label}: {arc.value}"
				>
					<title>{arc.label}: {arc.value}</title>
				</path>
			{/each}
		</svg>

		<!-- Center label -->
		<div class="cw-donut-chart__center">
			{#if hoveredSegment}
				<span class="cw-donut-chart__center-value">{hoveredSegment.value}</span>
				<span class="cw-donut-chart__center-label">{hoveredSegment.label}</span>
				<span class="cw-donut-chart__center-total">of {total}</span>
			{:else}
				<span class="cw-donut-chart__center-value">{total}</span>
				<span class="cw-donut-chart__center-label">Total</span>
			{/if}
		</div>
	</div>

	{#if showLegend}
		<div class="cw-donut-chart__legend">
			{#each segments as seg, i}
				<div
					class="cw-donut-chart__legend-item"
					onmouseenter={() => (hoveredIndex = i)}
					onmouseleave={() => (hoveredIndex = null)}
					role="listitem"
				>
					<span
						class="cw-donut-chart__legend-swatch"
						style:background-color={getColor(seg, i)}
					></span>
					<span class="cw-donut-chart__legend-label">{seg.label}</span>
					<span class="cw-donut-chart__legend-value">{seg.value}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.cw-donut-chart {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--cw-space-4);
	}

	.cw-donut-chart__chart {
		position: relative;
		display: inline-block;
	}

	.cw-donut-chart__arc {
		transition:
			stroke-width var(--cw-duration-fast) var(--cw-ease-default),
			opacity var(--cw-duration-fast) var(--cw-ease-default);
		cursor: pointer;
	}

	.cw-donut-chart__arc--hovered {
		stroke-width: calc(var(--thickness, 40) + 6);
		filter: brightness(1.15);
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
	}

	.cw-donut-chart__center-value {
		font-size: var(--cw-text-2xl);
		font-weight: var(--cw-font-bold);
		color: var(--cw-text-primary);
		font-variant-numeric: tabular-nums;
	}

	.cw-donut-chart__center-label {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.cw-donut-chart__center-total {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	/* ── Legend ───────────────────────────── */
	.cw-donut-chart__legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-3);
		justify-content: center;
	}

	.cw-donut-chart__legend-item {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		cursor: pointer;
		padding: var(--cw-space-1);
		border-radius: var(--cw-radius-sm);
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-donut-chart__legend-item:hover {
		background-color: var(--cw-bg-muted);
	}

	.cw-donut-chart__legend-swatch {
		width: 0.75rem;
		height: 0.75rem;
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
