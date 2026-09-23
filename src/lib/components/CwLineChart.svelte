<script lang="ts" module>
	/** Overridable user-facing labels for {@link CwLineChart} (i18n). All optional; English defaults are used when omitted. */
	export interface CwLineChartLabels {
		/** Fallback name for the primary series (left axis & legend). Default: "Value". */
		primary?: string;
		/** Fallback name for the secondary series (right axis & legend). Default: "Secondary". */
		secondary?: string;
		/** Name used for the legacy single-threshold line (`threshold` prop). Default: "Threshold". */
		threshold?: string;
		/** Legend label for multiple thresholds; `{count}` is replaced with the number of thresholds. Default: "Thresholds ({count})". */
		thresholdsCount?: string;
		/** Tooltip heading for a critical-severity alert. Default: "Critical alert". */
		criticalAlert?: string;
		/** Tooltip heading for a non-critical alert. Default: "Alert". */
		alert?: string;
		/** Accessible name for the chart when `ariaLabel` is not set. Default: "Line chart". */
		chart?: string;
		/** Screen-reader summary per series. Tokens: {label}, {count}, {min}, {max}, {latest}. */
		seriesSummary?: string;
		/** Keyboard hint read after the summary. Default: "Use the left and right arrow keys to move between readings." */
		keyboardHint?: string;
		/** Status text while `loading` is true. Default: "Loading chart data…". */
		loading?: string;
	}

	const DEFAULT_LABELS: Required<CwLineChartLabels> = {
		primary: 'Value',
		secondary: 'Secondary',
		threshold: 'Threshold',
		thresholdsCount: 'Thresholds ({count})',
		criticalAlert: 'Critical alert',
		alert: 'Alert',
		chart: 'Line chart',
		seriesSummary: '{label}: {count} readings, minimum {min}, maximum {max}, latest {latest}.',
		keyboardHint: 'Use the left and right arrow keys to move between readings.',
		loading: 'Loading chart data…'
	};

	/** Picks a "nice" tick step (1, 2 or 5 × 10ⁿ) for roughly `target` intervals. */
	function niceStep(range: number, target = 5): number {
		if (!(range > 0) || !Number.isFinite(range)) return 1;
		const raw = range / target;
		const magnitude = 10 ** Math.floor(Math.log10(raw));
		const normalized = raw / magnitude;
		const nice = normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10;
		return nice * magnitude;
	}

	function extent(values: Iterable<number>): { min: number; max: number } | null {
		let min = Infinity;
		let max = -Infinity;
		for (const v of values) {
			if (!Number.isFinite(v)) continue;
			if (v < min) min = v;
			if (v > max) max = v;
		}
		return min <= max ? { min, max } : null;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type {
		CwNoDataMessage,
		CwLineChartAlert,
		CwLineChartAlertPoint,
		CwLineChartDataPoint,
		CwLineChartSecondaryDataPoint,
		CwLineChartThreshold
	} from '../types/index.js';
	import CwNoDataOverlay from './CwNoDataOverlay.svelte';
	import CwSpinner from './CwSpinner.svelte';
	import { getCwNoDataMessage, hasCwNoData } from './cwNoData.js';
	import { formatCwNumber, joinCwUnit } from '../utils/cwFormat.js';

	interface Props {
		/** Primary data series (required) */
		data?: CwLineChartDataPoint[] | null;
		/** Optional secondary data series (right Y-axis) */
		secondaryData?: CwLineChartSecondaryDataPoint[] | null;
		/** Optional standalone alert markers */
		alertPoints?: CwLineChartAlertPoint[] | null;
		/** Legacy shorthand for a single horizontal threshold line */
		threshold?: number;
		/** Named threshold lines shown on the primary axis */
		thresholds?: CwLineChartThreshold[] | null;
		/** Left Y-axis label */
		primaryLabel?: string;
		/** Right Y-axis label */
		secondaryLabel?: string;
		/** Primary unit (e.g. "°C") */
		primaryUnit?: string;
		/** Secondary unit */
		secondaryUnit?: string;
		/** CSS colour for the primary series. Defaults to the theme's primary chart colour. */
		primaryColor?: string;
		/** CSS colour for the secondary series. Defaults to the theme's secondary chart colour. */
		secondaryColor?: string;
		/** Chart height in px (plot + axes; the legend sits below) */
		height?: number;
		/** Show grid lines */
		showGrid?: boolean;
		/** Maximum fraction digits for values in tooltips and labels. Default 2. */
		decimals?: number;
		/** BCP 47 locale for numbers and dates. Defaults to the runtime locale. */
		locale?: string;
		/** Shows a loading state instead of the plot. */
		loading?: boolean;
		/** Accessible name for the chart. Defaults to the series labels. */
		ariaLabel?: string;
		/**
		 * Shows the no-data overlay. When omitted, the overlay appears automatically
		 * if there is nothing to plot; pass `false` to suppress it.
		 */
		noData?: CwNoDataMessage;
		/** Override display labels for i18n */
		labels?: CwLineChartLabels;
		class?: string;
	}

	let {
		data: dataInput = [],
		secondaryData: secondaryDataInput = [],
		alertPoints: alertPointsInput = [],
		threshold,
		thresholds: thresholdsInput = [],
		primaryLabel: primaryLabelProp,
		secondaryLabel: secondaryLabelProp,
		primaryUnit = '',
		secondaryUnit = '',
		primaryColor,
		secondaryColor,
		height = 300,
		showGrid = true,
		decimals = 2,
		locale,
		loading = false,
		ariaLabel,
		noData,
		labels = {},
		class: className = ''
	}: Props = $props();

	const l = $derived({ ...DEFAULT_LABELS, ...labels });

	/* Existing explicit label props win over the `labels` object / defaults. */
	const primaryLabel = $derived(primaryLabelProp ?? l.primary);
	const secondaryLabel = $derived(secondaryLabelProp ?? l.secondary);

	const data = $derived(dataInput ?? []);
	const secondaryData = $derived(secondaryDataInput ?? []);
	const alertPoints = $derived(alertPointsInput ?? []);
	const thresholds = $derived(thresholdsInput ?? []);

	const isEmpty = $derived(data.length === 0 && secondaryData.length === 0 && alertPoints.length === 0);
	const hasNoData = $derived(
		!loading && (noData === undefined ? isEmpty : hasCwNoData(noData))
	);
	const noDataMessage = $derived(getCwNoDataMessage(noData));
	const showPlotContent = $derived(!loading && !isEmpty);

	/* ── Refs & state ─────────────────────────────────── */
	let chartContainer: HTMLDivElement | undefined = $state(undefined);
	let width = $state(600);
	let mouseX = $state(0);
	let mouseY = $state(0);
	let showPrimary = $state(true);
	let showSecondary = $state(true);
	let showThresholds = $state(true);
	/** Index into `data` (or `secondaryData` when there is no primary) for keyboard navigation. */
	let focusIndex = $state<number | null>(null);

	interface ResolvedAlertPoint extends CwLineChartAlertPoint {
		renderId: string;
		stackIndex: number;
	}

	interface TooltipPayload {
		timestamp: string | Date | null;
		primary: CwLineChartDataPoint | null;
		secondary: CwLineChartSecondaryDataPoint | null;
		alerts: ResolvedAlertPoint[];
		thresholds: CwLineChartThreshold[];
	}
	let tooltipData = $state<TooltipPayload | null>(null);

	const uid = $props.id();

	function formatValue(value: number, maxDigits = decimals): string {
		return formatCwNumber(value, { maximumFractionDigits: maxDigits, locale });
	}

	function formatWithUnit(value: number, unit: string): string {
		return joinCwUnit(formatValue(value), unit);
	}

	const dateTimeFormatter = $derived(
		new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' })
	);

	function getPointAlerts(point: CwLineChartDataPoint): CwLineChartAlert[] {
		const alertsForPoint: CwLineChartAlert[] = [];
		if (point.alert) alertsForPoint.push(point.alert);
		if (point.alerts?.length) alertsForPoint.push(...point.alerts);
		return alertsForPoint;
	}

	const resolvedThresholds = $derived.by(() => {
		if (thresholds.length > 0) return thresholds;
		if (threshold === undefined) return [];
		return [
			{
				id: `${uid}-legacy-threshold`,
				name: l.threshold,
				value: threshold
			}
		];
	});

	const thresholdComparisonValue = $derived.by(() => {
		if (resolvedThresholds.length !== 1) return undefined;
		return resolvedThresholds[0].value;
	});

	const resolvedAlertPoints = $derived.by(() => {
		const legacyAlerts = data.flatMap((point) =>
			getPointAlerts(point).map((alert) => ({
				id: alert.id,
				timestamp: point.timestamp,
				value: point.value,
				message: alert.message,
				severity: alert.severity
			}))
		);

		const stackCounts = new Map<string, number>();

		return [...legacyAlerts, ...alertPoints]
			.sort(
				(a, b) =>
					new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime() || a.value - b.value
			)
			.map((alertPoint, index) => {
				const key = `${new Date(alertPoint.timestamp).getTime()}::${alertPoint.value}`;
				const stackIndex = stackCounts.get(key) ?? 0;
				stackCounts.set(key, stackIndex + 1);

				return {
					...alertPoint,
					renderId: `${alertPoint.id}-${index}`,
					stackIndex
				};
			});
	});

	/* ── Margins ──────────────────────────────────────── */
	const margin = $derived({
		top: 20,
		right: secondaryData.length > 0 ? 60 : 20,
		bottom: 60,
		left: 60
	});

	/* ── Derived dimensions ───────────────────────────── */
	const chartWidth = $derived(Math.max(0, width - margin.left - margin.right));
	const chartHeight = $derived(Math.max(0, height - margin.top - margin.bottom));

	/* ── Y ranges ─────────────────────────────────────── */
	// Loops rather than Math.min(...spread): spreading long series overflows
	// the JS argument limit.
	function paddedRange(bounds: { min: number; max: number } | null) {
		if (!bounds) return { min: 0, max: 1 };
		const pad = (bounds.max - bounds.min) * 0.1 || Math.abs(bounds.max) * 0.1 || 1;
		return { min: bounds.min - pad, max: bounds.max + pad };
	}

	const primaryRange = $derived.by(() => {
		function* values() {
			if (showPrimary) {
				for (const d of data) yield d.value;
				for (const a of resolvedAlertPoints) yield a.value;
			}
			if (showThresholds) for (const t of resolvedThresholds) yield t.value;
		}
		return paddedRange(extent(values()));
	});

	const secondaryRange = $derived.by(() => {
		if (!secondaryData.length || !showSecondary) return { min: 0, max: 1 };
		return paddedRange(extent(secondaryData.map((d) => d.value)));
	});

	/* ── Tick calculation ─────────────────────────────── */
	function calcTicks(min: number, max: number): { values: number[]; digits: number } {
		const step = niceStep(max - min, Math.max(3, Math.min(6, Math.floor(chartHeight / 50))));
		const digits = Math.max(0, Math.min(4, -Math.floor(Math.log10(step))));
		const values: number[] = [];
		for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) {
			values.push(Number(v.toFixed(digits)));
			if (values.length > 50) break;
		}
		return { values, digits };
	}

	const primaryTicks = $derived(calcTicks(primaryRange.min, primaryRange.max));
	const secondaryTicks = $derived(calcTicks(secondaryRange.min, secondaryRange.max));

	/* ── X (time) range ───────────────────────────────── */
	// Numeric timestamps cached once per data change; path building, hover
	// scanning, and each-keys otherwise allocate a Date per point per pass.
	const dataTimes = $derived(data.map((d) => new Date(d.timestamp).getTime()));
	const secondaryTimes = $derived(secondaryData.map((d) => new Date(d.timestamp).getTime()));
	const alertTimes = $derived(
		resolvedAlertPoints.map((alertPoint) => new Date(alertPoint.timestamp).getTime())
	);

	const timeRange = $derived.by(() => {
		function* times() {
			yield* dataTimes;
			yield* secondaryTimes;
			yield* alertTimes;
		}
		return extent(times()) ?? { min: 0, max: 1 };
	});

	/* ── Scale functions ──────────────────────────────── */
	function scaleT(t: number): number {
		const span = timeRange.max - timeRange.min;
		// A single timestamp sits in the middle rather than on the axis.
		if (!span) return chartWidth / 2;
		return ((t - timeRange.min) / span) * chartWidth;
	}

	function scaleX(timestamp: string | Date): number {
		return scaleT(new Date(timestamp).getTime());
	}

	function scalePrimaryY(value: number): number {
		const span = primaryRange.max - primaryRange.min || 1;
		return chartHeight - ((value - primaryRange.min) / span) * chartHeight;
	}

	function scaleSecondaryY(value: number): number {
		const span = secondaryRange.max - secondaryRange.min || 1;
		return chartHeight - ((value - secondaryRange.min) / span) * chartHeight;
	}

	/* ── SVG paths ────────────────────────────────────── */
	const primaryPath = $derived(
		data
			.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleT(dataTimes[i])} ${scalePrimaryY(d.value)}`)
			.join(' ')
	);

	const secondaryPath = $derived(
		secondaryData
			.map(
				(d, i) => `${i === 0 ? 'M' : 'L'} ${scaleT(secondaryTimes[i])} ${scaleSecondaryY(d.value)}`
			)
			.join(' ')
	);

	/* ── Time labels ──────────────────────────────────── */
	const timeLabels = $derived.by(() => {
		if (!showPlotContent) return [];
		const span = timeRange.max - timeRange.min;
		if (!span) {
			return [{ time: timeRange.min, text: dateTimeFormatter.format(new Date(timeRange.min)) }];
		}
		const count = Math.min(8, Math.max(2, Math.floor(chartWidth / 80)));
		const step = span / (count - 1);
		const oneDay = 86400000;
		const formatter =
			span < oneDay
				? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' })
				: span < oneDay * 7
					? new Intl.DateTimeFormat(locale, { weekday: 'short', hour: '2-digit', minute: '2-digit' })
					: new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });

		const result: { time: number; text: string }[] = [];
		for (let i = 0; i < count; i++) {
			const t = timeRange.min + step * i;
			result.push({ time: t, text: formatter.format(new Date(t)) });
		}
		return result;
	});

	/* ── Screen-reader summary ────────────────────────── */
	function summarize(label: string, values: number[], unit: string): string {
		const bounds = extent(values);
		if (!bounds) return '';
		return l.seriesSummary
			.replace('{label}', label)
			.replace('{count}', String(values.length))
			.replace('{min}', formatWithUnit(bounds.min, unit))
			.replace('{max}', formatWithUnit(bounds.max, unit))
			.replace('{latest}', formatWithUnit(values[values.length - 1], unit));
	}

	const srSummary = $derived(
		[
			summarize(primaryLabel, data.map((d) => d.value), primaryUnit),
			summarize(secondaryLabel, secondaryData.map((d) => d.value), secondaryUnit),
			showPlotContent ? l.keyboardHint : ''
		]
			.filter(Boolean)
			.join(' ')
	);
	const accessibleName = $derived(
		ariaLabel ??
			(secondaryData.length > 0 ? `${l.chart}: ${primaryLabel}, ${secondaryLabel}` : `${l.chart}: ${primaryLabel}`)
	);

	/* ── Hover / focus → tooltip ──────────────────────── */
	function nearestIndex(times: number[], x: number): number {
		let best = -1;
		let bestDist = Infinity;
		for (let i = 0; i < times.length; i++) {
			const dist = Math.abs(scaleT(times[i]) - x);
			if (dist < bestDist) {
				bestDist = dist;
				best = i;
			}
		}
		return best;
	}

	function buildTooltip(relX: number, relY: number | null): TooltipPayload | null {
		const pi = nearestIndex(dataTimes, relX);
		const si = nearestIndex(secondaryTimes, relX);
		const closestPrimary = pi >= 0 ? data[pi] : null;
		const closestSecondary = si >= 0 ? secondaryData[si] : null;

		const hoveredAlerts = showPrimary
			? resolvedAlertPoints.filter((_, i) => Math.abs(scaleT(alertTimes[i]) - relX) <= 12)
			: [];
		const hoveredThresholds =
			showThresholds && relY !== null
				? resolvedThresholds.filter(
						(thresholdLine) => Math.abs(scalePrimaryY(thresholdLine.value) - relY) <= 6
					)
				: [];
		const hasVisibleSeriesContent =
			(showPrimary && closestPrimary) || (showSecondary && closestSecondary);

		if (!hasVisibleSeriesContent && hoveredAlerts.length === 0 && hoveredThresholds.length === 0) {
			return null;
		}

		return {
			timestamp:
				closestPrimary?.timestamp ?? closestSecondary?.timestamp ?? hoveredAlerts[0]?.timestamp ?? null,
			primary: closestPrimary,
			secondary: closestSecondary,
			alerts: hoveredAlerts,
			thresholds: hoveredThresholds
		};
	}

	function handleMouseMove(event: MouseEvent) {
		if (!showPlotContent || hasNoData || !chartContainer) return;
		const rect = chartContainer.getBoundingClientRect();
		const relX = event.clientX - rect.left - margin.left;
		const relY = event.clientY - rect.top - margin.top;
		mouseX = event.clientX - rect.left;
		mouseY = event.clientY - rect.top;

		if (relX < 0 || relX > chartWidth || relY < 0 || relY > chartHeight) {
			tooltipData = null;
			return;
		}
		focusIndex = null;
		tooltipData = buildTooltip(relX, relY);
	}

	function handleMouseLeave() {
		if (focusIndex === null) tooltipData = null;
	}

	/* Keyboard: arrow keys step through readings and drive the same tooltip. */
	const navTimes = $derived(data.length > 0 ? dataTimes : secondaryTimes);
	let liveMessage = $state('');

	function focusPoint(index: number) {
		if (navTimes.length === 0) return;
		const i = Math.max(0, Math.min(navTimes.length - 1, index));
		focusIndex = i;
		const x = scaleT(navTimes[i]);
		const y =
			data.length > 0 ? scalePrimaryY(data[i].value) : scaleSecondaryY(secondaryData[i].value);
		mouseX = x + margin.left;
		mouseY = y + margin.top;
		tooltipData = buildTooltip(x, null);
		liveMessage = describeTooltip(tooltipData);
	}

	function describeTooltip(payload: TooltipPayload | null): string {
		if (!payload) return '';
		const parts: string[] = [];
		if (payload.timestamp) parts.push(dateTimeFormatter.format(new Date(payload.timestamp)));
		if (payload.primary && showPrimary)
			parts.push(`${primaryLabel} ${formatWithUnit(payload.primary.value, primaryUnit)}`);
		if (payload.secondary && showSecondary)
			parts.push(`${secondaryLabel} ${formatWithUnit(payload.secondary.value, secondaryUnit)}`);
		for (const a of payload.alerts) parts.push(`${a.severity === 'critical' ? l.criticalAlert : l.alert}: ${a.message}`);
		return parts.join(', ');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!showPlotContent || navTimes.length === 0) return;
		const current = focusIndex ?? -1;
		let next: number | null = null;
		if (event.key === 'ArrowRight') next = current < 0 ? 0 : current + 1;
		else if (event.key === 'ArrowLeft') next = current < 0 ? navTimes.length - 1 : current - 1;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = navTimes.length - 1;
		else if (event.key === 'Escape') {
			focusIndex = null;
			tooltipData = null;
			return;
		}
		if (next === null) return;
		event.preventDefault();
		focusPoint(next);
	}

	function handleBlur() {
		focusIndex = null;
		tooltipData = null;
	}

	/* ── Tooltip position (clamped, flips near the right edge) ── */
	const tooltipLeft = $derived(
		mouseX > width * 0.6 ? Math.max(8, mouseX - 15 - 240) : Math.min(mouseX + 15, Math.max(8, width - 250))
	);
	const tooltipTop = $derived(Math.max(8, mouseY - 115));
	const hoveredThresholdIds = $derived(tooltipData?.thresholds.map((thresholdLine) => thresholdLine.id) ?? []);
	const singleThresholdLabel = $derived.by(() => {
		if (resolvedThresholds.length !== 1) return null;
		const thresholdLine = resolvedThresholds[0];
		if (thresholdLine.name === l.threshold) {
			return formatWithUnit(thresholdLine.value, primaryUnit);
		}
		return thresholdLine.name;
	});
	const thresholdLegendLabel = $derived.by(() => {
		if (resolvedThresholds.length === 0) return '';
		if (resolvedThresholds.length === 1) {
			const thresholdLine = resolvedThresholds[0];
			return `${thresholdLine.name} (${formatWithUnit(thresholdLine.value, primaryUnit)})`;
		}
		return l.thresholdsCount.replace('{count}', String(resolvedThresholds.length));
	});

	/* Never let the user hide the last visible data series. */
	const canHidePrimary = $derived(!showPrimary || (secondaryData.length > 0 && showSecondary));
	const canHideSecondary = $derived(!showSecondary || (data.length > 0 && showPrimary));

	const colorStyle = $derived(
		[
			primaryColor ? `--cw-lchart-primary:${primaryColor}` : '',
			secondaryColor ? `--cw-lchart-secondary:${secondaryColor}` : ''
		]
			.filter(Boolean)
			.join(';')
	);

	/* ── ResizeObserver ───────────────────────────────── */
	onMount(() => {
		if (!chartContainer) return;
		const observer = new ResizeObserver((entries) => {
			width = entries[0].contentRect.width;
		});
		observer.observe(chartContainer);
		return () => observer.disconnect();
	});
</script>

<div
	class="cw-lchart cw-no-data-host {className}"
	class:cw-no-data-host--active={hasNoData}
	style={colorStyle || undefined}
	aria-busy={loading || undefined}
>
	<!-- The plot is a labelled, focusable region: arrow keys move through readings
	     (announced via the live region below), so it takes key handlers. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<div
		class="cw-lchart__plot"
		bind:this={chartContainer}
		role="group"
		aria-label={accessibleName}
		aria-describedby="{uid}-summary"
		tabindex={showPlotContent ? 0 : undefined}
		onmousemove={handleMouseMove}
		onmouseleave={handleMouseLeave}
		onkeydown={handleKeydown}
		onblur={handleBlur}
	>
		<p id="{uid}-summary" class="cw-lchart__sr-only">{srSummary}</p>
		<p class="cw-lchart__sr-only" aria-live="polite">{liveMessage}</p>

		<svg {width} {height} class="cw-lchart__svg" aria-hidden="true">
			<g transform="translate({margin.left},{margin.top})">
				<!-- Grid lines -->
				{#if showGrid}
					{#each primaryTicks.values as tick (tick)}
						<line
							x1="0" y1={scalePrimaryY(tick)} x2={chartWidth} y2={scalePrimaryY(tick)}
							class="cw-lchart__grid"
						/>
					{/each}
					{#each timeLabels as lbl (lbl.time)}
						{@const x = scaleT(lbl.time)}
						<line x1={x} y1="0" x2={x} y2={chartHeight} class="cw-lchart__grid" />
					{/each}
				{/if}

				{#if showPlotContent}
					<!-- Threshold lines -->
					{#if showThresholds}
						{#each resolvedThresholds as thresholdLine (thresholdLine.id)}
							{@const ty = scalePrimaryY(thresholdLine.value)}
							<line
								x1="0"
								y1={ty}
								x2={chartWidth}
								y2={ty}
								class="cw-lchart__threshold"
								class:cw-lchart__threshold--active={hoveredThresholdIds.includes(thresholdLine.id)}
							/>
							{#if resolvedThresholds.length === 1 && singleThresholdLabel}
								<text x={chartWidth + 4} y={ty + 4} class="cw-lchart__threshold-label">
									{singleThresholdLabel}
								</text>
							{/if}
						{/each}
					{/if}

					<!-- Primary line -->
					{#if showPrimary && data.length > 1}
						<path d={primaryPath} class="cw-lchart__line cw-lchart__line--primary" />
					{/if}

					<!-- Secondary line -->
					{#if showSecondary && secondaryData.length > 1}
						<path d={secondaryPath} class="cw-lchart__line cw-lchart__line--secondary" />
					{/if}

					<!-- Primary data points (red when above a single threshold) -->
					{#if showPrimary}
						{#each data as point, index (`${dataTimes[index]}-${index}`)}
							<circle
								cx={scaleT(dataTimes[index])}
								cy={scalePrimaryY(point.value)}
								r={focusIndex === index ? 5 : 3}
								class="cw-lchart__point"
								class:cw-lchart__point--over={showThresholds &&
									thresholdComparisonValue !== undefined &&
									point.value > thresholdComparisonValue}
							/>
						{/each}
					{/if}

					<!-- Alert markers -->
					{#if showPrimary}
						{#each resolvedAlertPoints as alertPoint (alertPoint.renderId)}
							{@const ax = scaleX(alertPoint.timestamp)}
							{@const ay = scalePrimaryY(alertPoint.value)}
							<g
								transform="translate({ax},{ay - 20 - alertPoint.stackIndex * 22})"
								class="cw-lchart__alert"
								class:cw-lchart__alert--critical={alertPoint.severity === 'critical'}
							>
								<circle r="10" class="cw-lchart__pulse" />
								<text y="4" text-anchor="middle">!</text>
							</g>
						{/each}
					{/if}
				{/if}

				<!-- ─── LEFT Y-AXIS ─── -->
				<line x1="0" y1="0" x2="0" y2={chartHeight} class="cw-lchart__axis" />
				{#if showPlotContent}
					{#each primaryTicks.values as tick (tick)}
						{@const y = scalePrimaryY(tick)}
						<line x1="-5" y1={y} x2="0" y2={y} class="cw-lchart__axis" />
						<text x="-10" y={y} class="cw-lchart__tick cw-lchart__tick--left">
							{formatValue(tick, primaryTicks.digits)}
						</text>
					{/each}
					<text
						x={-chartHeight / 2}
						y="-45"
						transform="rotate(-90)"
						class="cw-lchart__axis-label cw-lchart__axis-label--primary"
					>
						{primaryLabel}
					</text>
				{/if}

				<!-- ─── RIGHT Y-AXIS ─── -->
				{#if secondaryData.length > 0 && showPlotContent}
					<line x1={chartWidth} y1="0" x2={chartWidth} y2={chartHeight} class="cw-lchart__axis" />
					{#each secondaryTicks.values as tick (tick)}
						{@const y = scaleSecondaryY(tick)}
						<line x1={chartWidth} y1={y} x2={chartWidth + 5} y2={y} class="cw-lchart__axis" />
						<text x={chartWidth + 10} y={y} class="cw-lchart__tick cw-lchart__tick--right">
							{formatValue(tick, secondaryTicks.digits)}
						</text>
					{/each}
					<text
						x={chartHeight / 2}
						y={-chartWidth - 45}
						transform="rotate(90)"
						class="cw-lchart__axis-label cw-lchart__axis-label--secondary"
					>
						{secondaryLabel}
					</text>
				{/if}

				<!-- ─── X-AXIS ─── -->
				<line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} class="cw-lchart__axis" />
				{#each timeLabels as lbl (lbl.time)}
					{@const x = scaleT(lbl.time)}
					<line x1={x} y1={chartHeight} x2={x} y2={chartHeight + 5} class="cw-lchart__axis" />
					<text
						{x}
						y={chartHeight + 12}
						transform="rotate(-45,{x},{chartHeight + 12})"
						class="cw-lchart__time-label"
					>
						{lbl.text}
					</text>
				{/each}

				<!-- Hover crosshair -->
				{#if tooltipData}
					{@const hoverX = mouseX - margin.left}
					{#if hoverX >= 0 && hoverX <= chartWidth}
						<line x1={hoverX} y1="0" x2={hoverX} y2={chartHeight} class="cw-lchart__crosshair" />
					{/if}
				{/if}
			</g>
		</svg>

		<!-- Tooltip -->
		{#if tooltipData}
			<div class="cw-lchart__tooltip" style="left:{tooltipLeft}px;top:{tooltipTop}px" aria-hidden="true">
				{#if tooltipData.timestamp && ((tooltipData.primary && showPrimary) || (tooltipData.secondary && showSecondary))}
					<div class="cw-lchart__tt-time">
						{dateTimeFormatter.format(new Date(tooltipData.timestamp))}
					</div>
				{/if}
				{#if tooltipData.primary && showPrimary}
					<div class="cw-lchart__tt-row">
						<span class="cw-lchart__dot cw-lchart__dot--primary"></span>
						<span class="cw-lchart__tt-muted">{primaryLabel}</span>
						<span class="cw-lchart__tt-value">{formatWithUnit(tooltipData.primary.value, primaryUnit)}</span>
					</div>
				{/if}
				{#if tooltipData.secondary && showSecondary}
					<div class="cw-lchart__tt-row">
						<span class="cw-lchart__dot cw-lchart__dot--secondary"></span>
						<span class="cw-lchart__tt-muted">{secondaryLabel}</span>
						<span class="cw-lchart__tt-value">{formatWithUnit(tooltipData.secondary.value, secondaryUnit)}</span>
					</div>
				{/if}
				{#if tooltipData.thresholds.length > 0}
					<div class="cw-lchart__tt-section">
						{#each tooltipData.thresholds as thresholdLine (thresholdLine.id)}
							<div class="cw-lchart__tt-row">
								<span class="cw-lchart__tt-threshold-marker"></span>
								<span class="cw-lchart__tt-muted">{thresholdLine.name}</span>
								<span class="cw-lchart__tt-value">{formatWithUnit(thresholdLine.value, primaryUnit)}</span>
							</div>
						{/each}
					</div>
				{/if}
				{#if tooltipData.alerts.length > 0}
					<div class="cw-lchart__tt-section">
						{#each tooltipData.alerts as alertPoint (alertPoint.renderId)}
							<div
								class="cw-lchart__tt-alert"
								class:cw-lchart__tt-alert--critical={alertPoint.severity === 'critical'}
							>
								<svg viewBox="0 0 16 16" fill="none" class="cw-lchart__tt-alert-icon">
									<path d="M8 1l7 14H1L8 1z" stroke="currentColor" stroke-width="1.5" />
								</svg>
								<div class="cw-lchart__tt-alert-copy">
									<div class="cw-lchart__tt-alert-head">
										<span>{alertPoint.severity === 'critical' ? l.criticalAlert : l.alert}</span>
										<span>{formatWithUnit(alertPoint.value, primaryUnit)}</span>
									</div>
									<div>{alertPoint.message}</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		{#if loading}
			<div class="cw-lchart__loading" role="status">
				<CwSpinner size="lg" />
				<span>{l.loading}</span>
			</div>
		{/if}
	</div>

	<!-- Legend -->
	{#if showPlotContent}
		<div class="cw-lchart__legend">
			{#if data.length > 0}
				<button
					type="button"
					class="cw-lchart__legend-btn"
					aria-pressed={showPrimary}
					disabled={!canHidePrimary}
					onclick={() => (showPrimary = !showPrimary)}
				>
					<span class="cw-lchart__legend-marker cw-lchart__legend-marker--primary"></span>
					{primaryLabel}
				</button>
			{/if}

			{#if secondaryData.length > 0}
				<button
					type="button"
					class="cw-lchart__legend-btn"
					aria-pressed={showSecondary}
					disabled={!canHideSecondary}
					onclick={() => (showSecondary = !showSecondary)}
				>
					<span class="cw-lchart__legend-marker cw-lchart__legend-marker--secondary"></span>
					{secondaryLabel}
				</button>
			{/if}

			{#if resolvedThresholds.length > 0}
				<button
					type="button"
					class="cw-lchart__legend-btn"
					aria-pressed={showThresholds}
					onclick={() => (showThresholds = !showThresholds)}
				>
					<span class="cw-lchart__legend-marker cw-lchart__legend-marker--threshold"></span>
					{thresholdLegendLabel}
				</button>
			{/if}
		</div>
	{/if}

	{#if hasNoData}
		<CwNoDataOverlay message={noDataMessage} />
	{/if}
</div>

<style>
	/* ── Container ────────────────────────── */
	.cw-lchart {
		--cw-lchart-primary: var(--cw-linechart-dot-sky);
		--cw-lchart-secondary: var(--cw-linechart-secondary-stroke);
		position: relative;
		width: 100%;
		user-select: none;
		font-family: var(--cw-font-family);
	}

	.cw-lchart__plot {
		position: relative;
		width: 100%;
		border-radius: var(--cw-radius-md);
	}

	.cw-lchart__plot:focus-visible {
		outline: var(--cw-focus-ring-width) solid var(--cw-focus-ring-color);
		outline-offset: var(--cw-focus-ring-offset);
	}

	.cw-lchart__svg {
		display: block;
		overflow: visible;
	}

	.cw-lchart__sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	/* ── Grid ─────────────────────────────── */
	.cw-lchart__grid {
		stroke: var(--cw-chart-grid);
		stroke-width: 1;
	}

	/* ── Lines & points ───────────────────── */
	.cw-lchart__line {
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.cw-lchart__line--primary {
		stroke: var(--cw-lchart-primary);
		stroke-width: 2.5;
	}
	.cw-lchart__line--secondary {
		stroke: var(--cw-lchart-secondary);
		stroke-width: 2;
		stroke-dasharray: 6 3;
	}
	.cw-lchart__point {
		fill: var(--cw-lchart-primary);
		stroke: var(--cw-linechart-point-stroke);
		stroke-width: 1;
	}
	.cw-lchart__point--over {
		fill: var(--cw-status-alarm);
	}

	/* ── Alerts ───────────────────────────── */
	.cw-lchart__alert circle {
		fill: var(--cw-tone-warning-solid-bg);
		stroke: var(--cw-linechart-point-stroke);
		stroke-width: 2;
	}
	.cw-lchart__alert text {
		fill: var(--cw-tone-warning-solid-text);
		font-size: 12px;
		font-weight: var(--cw-font-bold);
	}
	.cw-lchart__alert--critical circle {
		fill: var(--cw-tone-danger-solid-bg);
	}
	.cw-lchart__alert--critical text {
		fill: var(--cw-tone-danger-solid-text);
	}

	/* ── Threshold ────────────────────────── */
	.cw-lchart__threshold {
		stroke: var(--cw-chart-threshold);
		stroke-width: 2;
		stroke-dasharray: 6 4;
	}
	.cw-lchart__threshold--active {
		stroke-width: 3;
	}
	.cw-lchart__threshold-label {
		fill: var(--cw-chart-threshold);
		font-size: var(--cw-chart-tick-size);
		font-variant-numeric: tabular-nums;
	}

	/* ── Axes ─────────────────────────────── */
	.cw-lchart__axis {
		stroke: var(--cw-chart-axis);
		stroke-width: 1;
	}
	.cw-lchart__tick {
		fill: var(--cw-chart-tick);
		font-size: var(--cw-chart-tick-size);
		font-variant-numeric: tabular-nums;
		dominant-baseline: middle;
	}
	.cw-lchart__tick--left {
		text-anchor: end;
	}
	.cw-lchart__tick--right {
		text-anchor: start;
		fill: var(--cw-linechart-tick-secondary);
	}
	.cw-lchart__axis-label {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		text-anchor: middle;
	}
	.cw-lchart__axis-label--primary {
		fill: var(--cw-linechart-axis-label-primary);
	}
	.cw-lchart__axis-label--secondary {
		fill: var(--cw-linechart-axis-label-secondary);
	}
	.cw-lchart__time-label {
		fill: var(--cw-linechart-time-label);
		font-size: var(--cw-chart-tick-size);
		text-anchor: end;
	}
	.cw-lchart__crosshair {
		stroke: var(--cw-chart-crosshair);
		stroke-width: 1;
		stroke-dasharray: 3 3;
	}

	/* ── Pulse animation (disabled by the global reduced-motion rule) ── */
	@keyframes cw-lchart-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.55;
		}
	}
	.cw-lchart__pulse {
		animation: cw-lchart-pulse 2s var(--cw-ease-default) infinite;
	}

	/* ── Tooltip ──────────────────────────── */
	.cw-lchart__tooltip {
		pointer-events: none;
		position: absolute;
		z-index: var(--cw-z-inline-overlay);
		min-width: 10rem;
		max-width: 15rem;
		border-radius: var(--cw-radius-md);
		border: 1px solid var(--cw-chart-tooltip-border);
		background-color: var(--cw-chart-tooltip-bg);
		padding: var(--cw-space-2) var(--cw-space-3);
		font-size: var(--cw-text-xs);
		box-shadow: var(--cw-shadow-md);
		color: var(--cw-chart-tooltip-text);
		display: grid;
		gap: var(--cw-space-1);
	}
	.cw-lchart__tt-row {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
	}
	.cw-lchart__tt-section {
		margin-top: var(--cw-space-1);
		display: grid;
		gap: var(--cw-space-1);
	}
	.cw-lchart__tt-muted {
		color: var(--cw-chart-tooltip-muted);
		flex: 1;
	}
	.cw-lchart__tt-value {
		color: var(--cw-linechart-tooltip-value);
		font-weight: var(--cw-font-semibold);
		font-variant-numeric: tabular-nums;
	}
	.cw-lchart__tt-time {
		color: var(--cw-linechart-tooltip-time);
		font-size: var(--cw-text-xs);
	}
	.cw-lchart__dot {
		height: 0.5rem;
		width: 0.5rem;
		border-radius: var(--cw-radius-full);
		flex-shrink: 0;
	}
	.cw-lchart__dot--primary {
		background-color: var(--cw-lchart-primary);
	}
	.cw-lchart__dot--secondary {
		background-color: var(--cw-lchart-secondary);
	}
	.cw-lchart__tt-threshold-marker {
		display: inline-block;
		width: 0.9rem;
		border-top: 2px dashed var(--cw-linechart-threshold-marker);
		flex-shrink: 0;
	}

	.cw-lchart__tt-alert {
		display: flex;
		align-items: flex-start;
		gap: var(--cw-space-2);
		border-radius: var(--cw-radius-sm);
		background-color: var(--cw-tone-warning-solid-bg);
		padding: var(--cw-space-1) var(--cw-space-2);
		color: var(--cw-tone-warning-solid-text);
	}
	.cw-lchart__tt-alert--critical {
		background-color: var(--cw-tone-danger-solid-bg);
		color: var(--cw-tone-danger-solid-text);
	}
	.cw-lchart__tt-alert-icon {
		height: 0.75rem;
		width: 0.75rem;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}
	.cw-lchart__tt-alert-copy {
		display: grid;
		gap: 0.125rem;
	}
	.cw-lchart__tt-alert-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-3);
		font-weight: var(--cw-font-semibold);
		font-variant-numeric: tabular-nums;
	}

	/* ── Loading ──────────────────────────── */
	.cw-lchart__loading {
		position: absolute;
		inset: 0;
		z-index: var(--cw-z-inline-overlay);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-2);
		color: var(--cw-chart-card-muted);
		font-size: var(--cw-text-sm);
	}

	/* ── Legend ────────────────────────────── */
	.cw-lchart__legend {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-1) var(--cw-space-3);
		margin-top: var(--cw-space-2);
		font-size: var(--cw-text-sm);
	}
	.cw-lchart__legend-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
		min-height: var(--cw-hit-target-min);
		padding: var(--cw-space-1) var(--cw-space-2);
		background: none;
		border: none;
		border-radius: var(--cw-radius-sm);
		cursor: pointer;
		color: var(--cw-linechart-legend-text);
		font-family: inherit;
		font-size: inherit;
		transition: color var(--cw-duration-fast) var(--cw-ease-default);
	}
	.cw-lchart__legend-btn[aria-pressed='false'] {
		color: var(--cw-linechart-legend-inactive);
		text-decoration: line-through;
	}
	.cw-lchart__legend-btn[aria-pressed='false'] .cw-lchart__legend-marker {
		opacity: 0.45;
	}
	.cw-lchart__legend-btn:disabled {
		cursor: default;
	}
	.cw-lchart__legend-marker {
		display: inline-block;
		height: 2px;
		width: 1rem;
		border-radius: var(--cw-radius-full);
	}
	.cw-lchart__legend-marker--primary {
		background-color: var(--cw-lchart-primary);
	}
	.cw-lchart__legend-marker--secondary {
		background: repeating-linear-gradient(
			90deg,
			var(--cw-lchart-secondary),
			var(--cw-lchart-secondary) 4px,
			transparent 4px,
			transparent 6px
		);
	}
	.cw-lchart__legend-marker--threshold {
		border-top: 2px dashed var(--cw-linechart-threshold-marker);
		background: none;
	}
</style>
