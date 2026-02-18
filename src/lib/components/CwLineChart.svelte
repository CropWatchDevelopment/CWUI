<script lang="ts">
	import type { CwLineSeries } from '../types/index.js';

	interface Props {
		series: CwLineSeries[];
		height?: number;
		showGradient?: boolean;
		showLegend?: boolean;
	}

	let {
		series,
		height = 300,
		showGradient = true,
		showLegend = true
	}: Props = $props();

	const uid = $props.id();

	let containerRef = $state<HTMLDivElement | null>(null);
	let containerWidth = $state(600);
	let hiddenSeries = $state<Set<string>>(new Set());

	// Observe container width for responsive SVG sizing
	$effect(() => {
		if (!containerRef) return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				containerWidth = entry.contentRect.width;
			}
		});
		observer.observe(containerRef);
		return () => observer.disconnect();
	});

	const PADDING = { top: 20, right: 20, bottom: 30, left: 50 };

	const visibleSeries = $derived(
		series.filter((s) => !hiddenSeries.has(s.label))
	);

	const allPoints = $derived(
		visibleSeries.flatMap((s) => s.data)
	);

	const xValues = $derived(
		allPoints.map((p) => (typeof p.x === 'number' ? p.x : allPoints.indexOf(p)))
	);

	const yValues = $derived(allPoints.map((p) => p.y));

	const xMin = $derived(xValues.length ? Math.min(...xValues) : 0);
	const xMax = $derived(xValues.length ? Math.max(...xValues) : 1);
	const yMin = $derived(yValues.length ? Math.min(0, Math.min(...yValues)) : 0);
	const yMax = $derived(yValues.length ? Math.max(...yValues) * 1.1 : 1);

	const chartW = $derived(containerWidth - PADDING.left - PADDING.right);
	const chartH = $derived(height - PADDING.top - PADDING.bottom);

	function scaleX(v: number): number {
		if (xMax === xMin) return PADDING.left + chartW / 2;
		return PADDING.left + ((v - xMin) / (xMax - xMin)) * chartW;
	}

	function scaleY(v: number): number {
		if (yMax === yMin) return PADDING.top + chartH / 2;
		return PADDING.top + chartH - ((v - yMin) / (yMax - yMin)) * chartH;
	}

	function buildPath(data: { x: number | string; y: number }[]): string {
		return data
			.map((p, i) => {
				const x = scaleX(typeof p.x === 'number' ? p.x : i);
				const y = scaleY(p.y);
				return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
			})
			.join(' ');
	}

	function buildAreaPath(data: { x: number | string; y: number }[]): string {
		const line = buildPath(data);
		const lastX = scaleX(typeof data[data.length - 1].x === 'number' ? data[data.length - 1].x as number : data.length - 1);
		const firstX = scaleX(typeof data[0].x === 'number' ? data[0].x as number : 0);
		const baseY = scaleY(yMin);
		return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
	}

	const defaultColors = [
		'var(--cw-primary-500)',
		'var(--cw-info-500)',
		'var(--cw-warning-500)',
		'var(--cw-danger-500)',
		'var(--cw-success-500)',
		'var(--cw-secondary-400)'
	];

	function getColor(s: CwLineSeries, i: number): string {
		return s.color ?? defaultColors[i % defaultColors.length];
	}

	function toggleSeries(label: string) {
		const next = new Set(hiddenSeries);
		if (next.has(label)) {
			next.delete(label);
		} else {
			next.add(label);
		}
		hiddenSeries = next;
	}

	// Generate Y axis ticks
	const yTicks = $derived.by(() => {
		const count = 5;
		const ticks: number[] = [];
		const step = (yMax - yMin) / count;
		for (let i = 0; i <= count; i++) {
			ticks.push(yMin + step * i);
		}
		return ticks;
	});
</script>

<div class="cw-line-chart" bind:this={containerRef} role="img" aria-label="Line chart">
	<svg
		viewBox="0 0 {containerWidth} {height}"
		width={containerWidth}
		{height}
		class="cw-line-chart__svg"
	>
		<defs>
			{#each series as s, i}
				{#if showGradient}
					<linearGradient id="{uid}-grad-{i}" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color={getColor(s, i)} stop-opacity="0.3" />
						<stop offset="100%" stop-color={getColor(s, i)} stop-opacity="0" />
					</linearGradient>
				{/if}
			{/each}
		</defs>

		<!-- Y axis grid lines -->
		{#each yTicks as tick}
			<line
				x1={PADDING.left}
				y1={scaleY(tick)}
				x2={PADDING.left + chartW}
				y2={scaleY(tick)}
				class="cw-line-chart__grid"
			/>
			<text
				x={PADDING.left - 8}
				y={scaleY(tick) + 4}
				class="cw-line-chart__axis-label"
				text-anchor="end"
			>
				{Math.round(tick)}
			</text>
		{/each}

		<!-- Areas (gradient fills) -->
		{#if showGradient}
			{#each series as s, i}
				{#if !hiddenSeries.has(s.label) && s.data.length > 1}
					<path
						d={buildAreaPath(s.data)}
						fill="url(#{uid}-grad-{i})"
						class="cw-line-chart__area"
					/>
				{/if}
			{/each}
		{/if}

		<!-- Lines -->
		{#each series as s, i}
			{#if !hiddenSeries.has(s.label) && s.data.length > 1}
				<path
					d={buildPath(s.data)}
					fill="none"
					stroke={getColor(s, i)}
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="cw-line-chart__line"
				/>
			{/if}
		{/each}

		<!-- Data points -->
		{#each series as s, i}
			{#if !hiddenSeries.has(s.label)}
				{#each s.data as p, pi}
					<circle
						cx={scaleX(typeof p.x === 'number' ? p.x : pi)}
						cy={scaleY(p.y)}
						r="3"
						fill={getColor(s, i)}
						class="cw-line-chart__point"
					>
						<title>{s.label}: {p.y}</title>
					</circle>
				{/each}
			{/if}
		{/each}
	</svg>

	{#if showLegend && series.length > 1}
		<div class="cw-line-chart__legend">
			{#each series as s, i}
				<button
					type="button"
					class="cw-line-chart__legend-item"
					class:cw-line-chart__legend-item--hidden={hiddenSeries.has(s.label)}
					onclick={() => toggleSeries(s.label)}
				>
					<span
						class="cw-line-chart__legend-swatch"
						style:background-color={getColor(s, i)}
					></span>
					{s.label}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.cw-line-chart {
		width: 100%;
	}

	.cw-line-chart__svg {
		display: block;
		overflow: visible;
	}

	.cw-line-chart__grid {
		stroke: var(--cw-border-muted);
		stroke-width: 1;
		stroke-dasharray: 4 2;
	}

	.cw-line-chart__axis-label {
		font-family: var(--cw-font-family);
		font-size: 10px;
		fill: var(--cw-text-muted);
	}

	.cw-line-chart__line {
		transition: opacity var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-line-chart__area {
		transition: opacity var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-line-chart__point {
		transition: r var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-line-chart__point:hover {
		r: 5;
	}

	/* ── Legend ───────────────────────────── */
	.cw-line-chart__legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-3);
		padding: var(--cw-space-3) 0 0;
		justify-content: center;
	}

	.cw-line-chart__legend-item {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-1);
		background: none;
		border: none;
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-secondary);
		cursor: pointer;
		padding: var(--cw-space-1) var(--cw-space-2);
		border-radius: var(--cw-radius-sm);
		transition: opacity var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-line-chart__legend-item:hover {
		background-color: var(--cw-bg-muted);
	}

	.cw-line-chart__legend-item--hidden {
		opacity: 0.4;
		text-decoration: line-through;
	}

	.cw-line-chart__legend-swatch {
		display: block;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: var(--cw-radius-sm);
	}
</style>
