<script lang="ts">
	import { onMount } from 'svelte';
	import type { CwHeatmapDataPoint } from '../types/index.js';

	interface Props {
		/** Array of { timestamp, value } data points. */
		data: CwHeatmapDataPoint[];
		/** Number of days to display. Default 7. */
		days?: number;
		/** Minimum value for color scale. Auto-detected from data if omitted. */
		min?: number;
		/** Maximum value for color scale. Auto-detected from data if omitted. */
		max?: number;
		/** Unit label (e.g. "°C", "°F"). */
		unit?: string;
		/** Chart title. */
		title?: string;
		/** Height of each hour row in px. */
		rowHeight?: number;
		/** Color stops: [cold, mid, hot]. Defaults to blue → yellow → red. */
		colors?: [string, string, string];
		/** Called when a cell is clicked. */
		onCellClick?: (point: { date: string; hour: number; value: number | null }) => void;
	}

	let {
		data,
		days = 7,
		min: propMin,
		max: propMax,
		unit = '°C',
		title = 'Temperature Heatmap',
		rowHeight = 24,
		colors = ['#3b82f6', '#facc15', '#ef4444'],
		onCellClick
	}: Props = $props();

	/* ── Build grid: columns = days, rows = 24 hours ────────── */

	/** End date = most recent midnight; start = end - days */
	const dateColumns = $derived.by(() => {
		const end = new Date();
		end.setHours(0, 0, 0, 0);
		const cols: Date[] = [];
		for (let i = days - 1; i >= 0; i--) {
			const d = new Date(end);
			d.setDate(d.getDate() - i);
			cols.push(d);
		}
		return cols;
	});

	/** Map data into a quick-lookup: "YYYY-MM-DD|HH" → value */
	const lookup = $derived.by(() => {
		const map = new Map<string, number>();
		for (const pt of data) {
			const d = new Date(pt.timestamp);
			const key = `${fmtDate(d)}|${d.getHours()}`;
			map.set(key, pt.value);
		}
		return map;
	});

	const computedMin = $derived(propMin ?? Math.min(...data.map((d) => d.value)));
	const computedMax = $derived(propMax ?? Math.max(...data.map((d) => d.value)));

	/* Helper: value → CSS color via 3-stop gradient */
	function cellColor(val: number | null): string {
		if (val === null || val === undefined) return 'var(--cw-bg-muted)';
		const range = computedMax - computedMin || 1;
		const t = Math.max(0, Math.min(1, (val - computedMin) / range));
		if (t <= 0.5) {
			const t2 = t / 0.5;
			return interpolateColor(colors[0], colors[1], t2);
		} else {
			const t2 = (t - 0.5) / 0.5;
			return interpolateColor(colors[1], colors[2], t2);
		}
	}

	function interpolateColor(a: string, b: string, t: number): string {
		const [r1, g1, b1] = hexToRgb(a);
		const [r2, g2, b2] = hexToRgb(b);
		const r = Math.round(r1 + (r2 - r1) * t);
		const g = Math.round(g1 + (g2 - g1) * t);
		const bl = Math.round(b1 + (b2 - b1) * t);
		return `rgb(${r},${g},${bl})`;
	}

	function hexToRgb(hex: string): [number, number, number] {
		const h = hex.replace('#', '');
		return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
	}

	function fmtDate(d: Date): string {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	function fmtDay(d: Date): string {
		return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
	}

	function fmtHour(h: number): string {
		return `${String(h).padStart(2, '0')}:00`;
	}

	function getValue(col: Date, hour: number): number | null {
		return lookup.get(`${fmtDate(col)}|${hour}`) ?? null;
	}

	/* ── Tooltip state ───────────────────────────────────────── */
	let tooltip = $state<{ x: number; y: number; date: string; hour: string; value: number | null } | null>(null);
	let containerEl: HTMLDivElement | undefined = $state();

	function showTooltip(e: MouseEvent, col: Date, hour: number) {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		tooltip = {
			x: e.clientX - rect.left + 12,
			y: e.clientY - rect.top - 8,
			date: fmtDay(col),
			hour: fmtHour(hour),
			value: getValue(col, hour)
		};
	}

	function hideTooltip() {
		tooltip = null;
	}

	function handleClick(col: Date, hour: number) {
		onCellClick?.({ date: fmtDate(col), hour, value: getValue(col, hour) });
	}

	const hours = Array.from({ length: 24 }, (_, i) => i);
</script>

<div class="cw-heatmap" bind:this={containerEl}>
	{#if title}
		<h3 class="cw-heatmap__title">{title}</h3>
	{/if}

	<div class="cw-heatmap__scroll">
		<div class="cw-heatmap__grid" style="grid-template-columns: 3.5rem repeat({dateColumns.length}, 1fr);">
			<!-- Column headers -->
			<div class="cw-heatmap__corner"></div>
			{#each dateColumns as col}
				<div class="cw-heatmap__col-header">{fmtDay(col)}</div>
			{/each}

			<!-- Rows: one per hour -->
			{#each hours as hour}
				<div class="cw-heatmap__row-header">{fmtHour(hour)}</div>
				{#each dateColumns as col}
					{@const val = getValue(col, hour)}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="cw-heatmap__cell"
						style="background-color:{cellColor(val)}; height:{rowHeight}px"
						onmouseenter={(e) => showTooltip(e, col, hour)}
						onmouseleave={hideTooltip}
						onclick={() => handleClick(col, hour)}
					>
						{#if val !== null}
							<span class="cw-heatmap__cell-text">{val.toFixed(1)}</span>
						{/if}
					</div>
				{/each}
			{/each}
		</div>
	</div>

	<!-- Legend gradient bar -->
	<div class="cw-heatmap__legend">
		<span class="cw-heatmap__legend-label">{computedMin.toFixed(1)}{unit}</span>
		<div class="cw-heatmap__legend-bar" style="background: linear-gradient(to right, {colors[0]}, {colors[1]}, {colors[2]})"></div>
		<span class="cw-heatmap__legend-label">{computedMax.toFixed(1)}{unit}</span>
	</div>

	<!-- Tooltip -->
	{#if tooltip}
		<div class="cw-heatmap__tooltip" style="left:{tooltip.x}px; top:{tooltip.y}px;">
			<strong>{tooltip.date}</strong> {tooltip.hour}<br/>
			{tooltip.value !== null ? `${tooltip.value.toFixed(1)}${unit}` : 'No data'}
		</div>
	{/if}
</div>

<style>
	.cw-heatmap {
		position: relative;
		font-family: var(--cw-font-family);
		color: var(--cw-text-primary);
	}

	.cw-heatmap__title {
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
		margin: 0 0 var(--cw-space-3);
	}

	/* ── Scrollable grid ─────────────── */
	.cw-heatmap__scroll {
		overflow-x: auto;
	}

	.cw-heatmap__grid {
		display: grid;
		gap: 1px;
		min-width: max-content;
	}

	/* ── Headers ──────────────────────── */
	.cw-heatmap__corner {
		/* empty top-left */
	}

	.cw-heatmap__col-header {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-muted);
		text-align: center;
		padding: var(--cw-space-1) 0;
		white-space: nowrap;
	}

	.cw-heatmap__row-header {
		font-size: 0.625rem;
		color: var(--cw-text-muted);
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: var(--cw-space-2);
		white-space: nowrap;
	}

	/* ── Cells ────────────────────────── */
	.cw-heatmap__cell {
		position: relative;
		border-radius: 2px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: outline var(--cw-duration-fast) var(--cw-ease-default);
		min-width: 2.5rem;
	}

	.cw-heatmap__cell:hover {
		outline: 2px solid var(--cw-text-primary);
		outline-offset: -1px;
		z-index: 1;
	}

	.cw-heatmap__cell-text {
		font-size: 0.5625rem;
		font-weight: var(--cw-font-medium);
		color: #fff;
		text-shadow: 0 0 3px rgba(0,0,0,0.6);
		pointer-events: none;
	}

	/* ── Legend ────────────────────────── */
	.cw-heatmap__legend {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		margin-top: var(--cw-space-3);
		justify-content: center;
	}

	.cw-heatmap__legend-bar {
		width: 10rem;
		height: 0.625rem;
		border-radius: var(--cw-radius-sm);
	}

	.cw-heatmap__legend-label {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
		font-weight: var(--cw-font-medium);
	}

	/* ── Tooltip ──────────────────────── */
	.cw-heatmap__tooltip {
		position: absolute;
		z-index: 10;
		padding: var(--cw-space-2) var(--cw-space-3);
		border-radius: var(--cw-radius-md);
		background-color: var(--cw-bg-overlay);
		border: 1px solid var(--cw-border-default);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-primary);
		pointer-events: none;
		white-space: nowrap;
		box-shadow: var(--cw-shadow-md);
	}
</style>
