<script lang="ts" module>
	/** Overridable user-facing labels for {@link CwHeatmap}. All fields are optional; English defaults are used when omitted. */
	export interface CwHeatmapLabels {
		/** Default chart title, used when the `title` prop is not provided. Defaults to "Temperature Heatmap". */
		title?: string;
		/** Text shown in the tooltip when a cell has no value. Defaults to "No data". */
		noData?: string;
		/** Accessible text announced while `loading` is true. Defaults to "Loading heatmap". */
		loading?: string;
		/** Accessible summary of the chart. Defaults to "{title}: {days} days, {min} to {max}". */
		summary?: (info: { title: string; days: number; min: string; max: string }) => string;
	}

	const DEFAULT_LABELS: Required<CwHeatmapLabels> = {
		title: 'Temperature Heatmap',
		noData: 'No data',
		loading: 'Loading heatmap',
		summary: ({ title, days, min, max }) => `${title}: ${days} days, ${min} to ${max}`
	};

	/** Blue → pale yellow → orange-red: a diverging scale that stays distinguishable with colour-vision deficiency. */
	const DEFAULT_COLORS: [string, string, string] = ['#3b82f6', '#f5d76e', '#d9480f'];

	const HOURS = Array.from({ length: 24 }, (_, i) => i);
</script>

<script lang="ts">
	import type { CwHeatmapDataPoint, CwNoDataMessage } from '../types/index.js';
	import { formatCwMeasurement } from '../utils/cwFormat.js';
	import CwNoDataOverlay from './CwNoDataOverlay.svelte';
	import { getCwNoDataMessage, hasCwNoData } from './cwNoData.js';

	interface Props {
		/** Array of { timestamp, value } data points. */
		data?: CwHeatmapDataPoint[] | null;
		/** Number of days to display (ending at the most recent reading). Default 7. */
		days?: number;
		/** Minimum value for color scale. Auto-detected from data if omitted. */
		min?: number;
		/** Maximum value for color scale. Auto-detected from data if omitted. */
		max?: number;
		/** Unit label (e.g. "°C", "°F"). */
		unit?: string;
		/** Chart title. Defaults to `labels.title` ("Temperature Heatmap"). Pass "" to hide. */
		title?: string;
		/** Height of each hour row in px. */
		rowHeight?: number;
		/**
		 * Color stops: [low, mid, high]. Any CSS color works, including
		 * `var(--token)`. Defaults to a blue → yellow → orange diverging scale.
		 */
		colors?: [string, string, string];
		/** Called when a cell is activated. Cells are only interactive when this is set. */
		onCellClick?: (point: { date: string; hour: number; value: number | null }) => void;
		/**
		 * Show the no-data overlay. When omitted the overlay appears automatically
		 * if there are no finite readings.
		 */
		noData?: CwNoDataMessage;
		/** Show a skeleton grid while data is loading. */
		loading?: boolean;
		/** BCP 47 locale for dates, hours and numbers. Defaults to the runtime locale. */
		locale?: string;
		/** Fraction digits for displayed values. Default 1. */
		decimals?: number;
		/** Override display labels for i18n. */
		labels?: CwHeatmapLabels;
		class?: string;
	}

	let {
		data: dataInput = [],
		days = 7,
		min: propMin,
		max: propMax,
		unit = '°C',
		title,
		rowHeight = 24,
		colors = DEFAULT_COLORS,
		onCellClick,
		noData,
		loading = false,
		locale,
		decimals = 1,
		labels = {},
		class: className = ''
	}: Props = $props();

	const l = $derived({ ...DEFAULT_LABELS, ...labels });
	const resolvedTitle = $derived(title ?? l.title);
	const interactive = $derived(typeof onCellClick === 'function');

	const data = $derived((dataInput ?? []).filter((pt) => Number.isFinite(pt.value)));
	const isEmpty = $derived(data.length === 0);
	const hasNoData = $derived(!loading && (hasCwNoData(noData) || isEmpty));
	const noDataMessage = $derived(getCwNoDataMessage(noData));

	const dayFormatter = $derived(
		new Intl.DateTimeFormat(locale, { weekday: 'short', month: 'short', day: 'numeric' })
	);
	const hourFormatter = $derived(new Intl.DateTimeFormat(locale, { hour: 'numeric' }));

	function fmtDate(d: Date): string {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	function fmtDay(d: Date): string {
		return dayFormatter.format(d);
	}

	function fmtHour(h: number): string {
		return hourFormatter.format(new Date(2000, 0, 1, h));
	}

	function fmtValue(v: number | null): string {
		return v === null ? l.noData : formatCwMeasurement(v, unit, { locale, decimals });
	}

	/* ── Build grid: columns = days, rows = 24 hours ────────── */

	/**
	 * A continuous run of `days` calendar days ending at the most recent reading.
	 * Days without readings stay in the grid (as empty cells) so gaps are visible.
	 */
	const dateColumns = $derived.by(() => {
		let latest = -Infinity;
		for (const pt of data) {
			const t = new Date(pt.timestamp).getTime();
			if (Number.isFinite(t) && t > latest) latest = t;
		}
		const count = Math.max(1, Math.floor(days));
		const end = Number.isFinite(latest) ? new Date(latest) : new Date();
		const cols: Date[] = [];
		for (let i = count - 1; i >= 0; i--) {
			cols.push(new Date(end.getFullYear(), end.getMonth(), end.getDate() - i));
		}
		return cols;
	});

	/** "YYYY-MM-DD|H" → average of all readings in that hour. */
	const lookup = $derived.by(() => {
		const sums = new Map<string, { sum: number; count: number }>();
		for (const pt of data) {
			const d = new Date(pt.timestamp);
			if (Number.isNaN(d.getTime())) continue;
			const key = `${fmtDate(d)}|${d.getHours()}`;
			const entry = sums.get(key);
			if (entry) {
				entry.sum += pt.value;
				entry.count += 1;
			} else {
				sums.set(key, { sum: pt.value, count: 1 });
			}
		}
		const map = new Map<string, number>();
		for (const [key, { sum, count }] of sums) map.set(key, sum / count);
		return map;
	});

	// Loop instead of Math.min(...spread): spreading tens of thousands of points
	// into one call overflows the JS argument limit and throws.
	const dataRange = $derived.by(() => {
		let lo = Infinity;
		let hi = -Infinity;
		for (const value of lookup.values()) {
			if (value < lo) lo = value;
			if (value > hi) hi = value;
		}
		return lo <= hi ? { min: lo, max: hi } : null;
	});
	const computedMin = $derived(propMin ?? dataRange?.min ?? 0);
	const computedMax = $derived(propMax ?? dataRange?.max ?? 1);

	/** Value → CSS color via a 3-stop scale. `color-mix` lets any CSS color (including tokens) be used. */
	function cellColor(val: number | null): string {
		if (val === null) return 'var(--cw-bg-muted)';
		const range = computedMax - computedMin || 1;
		const t = Math.max(0, Math.min(1, (val - computedMin) / range));
		const [a, b] = t <= 0.5 ? [colors[0], colors[1]] : [colors[1], colors[2]];
		const local = t <= 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
		const pct = Math.round(local * 1000) / 10;
		return `color-mix(in oklab, ${b} ${pct}%, ${a})`;
	}

	function getValue(col: Date, hour: number): number | null {
		return lookup.get(`${fmtDate(col)}|${hour}`) ?? null;
	}

	const summary = $derived(
		l.summary({
			title: resolvedTitle || l.title,
			days: dateColumns.length,
			min: fmtValue(dataRange?.min ?? null),
			max: fmtValue(dataRange?.max ?? null)
		})
	);

	/* ── Tooltip state ───────────────────────────────────────── */
	let tooltip = $state<{
		x: number;
		y: number;
		date: string;
		hour: string;
		value: number | null;
	} | null>(null);
	let containerEl: HTMLDivElement | undefined = $state();

	function placeTooltip(x: number, y: number, col: Date, hour: number) {
		tooltip = { x, y, date: fmtDay(col), hour: fmtHour(hour), value: getValue(col, hour) };
	}

	function showTooltipAtPointer(e: MouseEvent, col: Date, hour: number) {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		placeTooltip(e.clientX - rect.left + 12, e.clientY - rect.top - 8, col, hour);
	}

	function showTooltipAtElement(e: FocusEvent, col: Date, hour: number) {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const cell = (e.currentTarget as HTMLElement).getBoundingClientRect();
		placeTooltip(cell.right - rect.left + 6, cell.top - rect.top, col, hour);
	}

	function hideTooltip() {
		tooltip = null;
	}

	function handleClick(col: Date, hour: number) {
		onCellClick?.({ date: fmtDate(col), hour, value: getValue(col, hour) });
	}
</script>

<div
	class="cw-heatmap cw-no-data-host {className}"
	class:cw-no-data-host--active={hasNoData}
	aria-busy={loading || undefined}
	bind:this={containerEl}
>
	{#if resolvedTitle}
		<h3 class="cw-heatmap__title">{resolvedTitle}</h3>
	{/if}

	<div
		class="cw-heatmap__scroll"
		role={interactive ? 'group' : 'img'}
		aria-label={loading ? l.loading : summary}
	>
		<div
			class="cw-heatmap__grid"
			style:grid-template-columns="auto repeat({dateColumns.length}, minmax(1.75rem, 1fr))"
		>
			<!-- Column headers -->
			<div class="cw-heatmap__corner" aria-hidden="true"></div>
			{#each dateColumns as col (fmtDate(col))}
				<div class="cw-heatmap__col-header" aria-hidden="true">{fmtDay(col)}</div>
			{/each}

			<!-- Rows: one per hour -->
			{#each HOURS as hour (hour)}
				<div class="cw-heatmap__row-header" aria-hidden="true">{fmtHour(hour)}</div>
				{#each dateColumns as col (`${fmtDate(col)}-${hour}`)}
					{@const val = loading ? null : getValue(col, hour)}
					{#if interactive && !loading}
						<button
							type="button"
							class="cw-heatmap__cell cw-heatmap__cell--interactive"
							style:background-color={cellColor(val)}
							style:height="{rowHeight}px"
							aria-label="{fmtDay(col)} {fmtHour(hour)}: {fmtValue(val)}"
							onmouseenter={(e) => showTooltipAtPointer(e, col, hour)}
							onmouseleave={hideTooltip}
							onfocus={(e) => showTooltipAtElement(e, col, hour)}
							onblur={hideTooltip}
							onclick={() => handleClick(col, hour)}
						></button>
					{:else}
						<div
							class="cw-heatmap__cell"
							class:cw-heatmap__cell--loading={loading}
							style:background-color={loading ? undefined : cellColor(val)}
							style:height="{rowHeight}px"
							aria-hidden="true"
							onmouseenter={(e) => !loading && showTooltipAtPointer(e, col, hour)}
							onmouseleave={hideTooltip}
						></div>
					{/if}
				{/each}
			{/each}
		</div>
	</div>

	<!-- Legend gradient bar -->
	{#if !loading && !isEmpty}
		<div class="cw-heatmap__legend" aria-hidden="true">
			<span class="cw-heatmap__legend-label">{fmtValue(computedMin)}</span>
			<div
				class="cw-heatmap__legend-bar"
				style:background="linear-gradient(to right in oklab, {colors[0]}, {colors[1]}, {colors[2]})"
			></div>
			<span class="cw-heatmap__legend-label">{fmtValue(computedMax)}</span>
		</div>
	{/if}

	<!-- Tooltip -->
	{#if tooltip}
		<div class="cw-heatmap__tooltip" style:left="{tooltip.x}px" style:top="{tooltip.y}px" aria-hidden="true">
			<span class="cw-heatmap__tooltip-time">{tooltip.date} · {tooltip.hour}</span>
			<span class="cw-heatmap__tooltip-value">{fmtValue(tooltip.value)}</span>
		</div>
	{/if}

	{#if hasNoData}
		<CwNoDataOverlay message={noDataMessage} />
	{/if}
</div>

<style>
	.cw-heatmap {
		position: relative;
		font-family: var(--cw-font-family);
		color: var(--cw-text-primary);
	}

	.cw-heatmap__title {
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-tight);
		margin: 0 0 var(--cw-space-3);
	}

	/* ── Scrollable grid ─────────────── */
	.cw-heatmap__scroll {
		overflow-x: auto;
	}

	.cw-heatmap__grid {
		display: grid;
		gap: 3px;
		min-width: max-content;
		padding: 2px;
	}

	.cw-heatmap__col-header {
		font-size: var(--cw-chart-tick-size, 0.6875rem);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-muted);
		text-align: center;
		padding: var(--cw-space-1) 0;
		white-space: nowrap;
	}

	.cw-heatmap__row-header {
		font-size: var(--cw-chart-tick-size, 0.6875rem);
		font-variant-numeric: tabular-nums;
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
		display: block;
		width: 100%;
		min-width: 1.75rem;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: var(--cw-radius-sm);
	}

	.cw-heatmap__cell--interactive {
		cursor: pointer;
	}

	.cw-heatmap__cell:hover,
	.cw-heatmap__cell--interactive:focus-visible {
		outline: var(--cw-focus-ring-width) solid var(--cw-focus-ring-color);
		outline-offset: 1px;
		z-index: 1;
	}

	.cw-heatmap__cell--loading {
		background-color: var(--cw-bg-muted);
		animation: cw-heatmap-pulse 1.4s var(--cw-ease-default) infinite;
	}

	@keyframes cw-heatmap-pulse {
		50% {
			opacity: 0.5;
		}
	}

	/* ── Legend ────────────────────────── */
	.cw-heatmap__legend {
		display: flex;
		align-items: center;
		gap: var(--cw-space-3);
		margin-top: var(--cw-space-3);
	}

	.cw-heatmap__legend-bar {
		width: 10rem;
		max-width: 40%;
		height: 0.625rem;
		border-radius: var(--cw-radius-full);
	}

	.cw-heatmap__legend-label {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
		font-weight: var(--cw-font-medium);
		font-variant-numeric: tabular-nums;
	}

	/* ── Tooltip ──────────────────────── */
	.cw-heatmap__tooltip {
		position: absolute;
		z-index: var(--cw-z-inline-overlay, 10);
		display: grid;
		gap: 2px;
		padding: var(--cw-space-2) var(--cw-space-3);
		border: 1px solid var(--cw-chart-tooltip-border);
		border-radius: var(--cw-radius-md);
		background-color: var(--cw-chart-tooltip-bg);
		color: var(--cw-chart-tooltip-text);
		font-size: var(--cw-text-xs);
		pointer-events: none;
		white-space: nowrap;
		box-shadow: var(--cw-shadow-md);
	}

	.cw-heatmap__tooltip-time {
		color: var(--cw-chart-tooltip-muted);
	}

	.cw-heatmap__tooltip-value {
		font-weight: var(--cw-font-semibold);
		font-variant-numeric: tabular-nums;
	}
</style>
