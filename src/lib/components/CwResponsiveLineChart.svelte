<!--
  CwResponsiveLineChart — high-performance Canvas2D multi-series time chart
  for sensor telemetry. Touch-first (pan, pinch, tap-lock), dual Y-axes,
  optional value-mapped temperature gradient, threshold lines, anomaly
  markers, explicit data-gap bands, and a responsive shell with legend chips
  and range pills.

  Colours come from the CWUI theme tokens (`--cw-chart-*`), resolved at draw
  time, so the chart follows the document's [data-theme] automatically.
-->
<script lang="ts" module>
	import type {
		CwResponsiveLineSeries,
		CwResponsiveLineDataPoint,
		CwResponsiveLineThreshold,
		CwResponsiveLineTheme,
		CwResponsiveLineLayout,
		CwResponsiveLineRangePreset,
		CwResponsiveLineSeriesStats,
		CwResponsiveLineChangeEvent,
		CwNoDataMessage
	} from '../types/index.js';
	import { formatCwNumber } from '../utils/cwFormat.js';
	import {
		CW_RLC_HOVER_SNAP_PX,
		hoverPoint,
		nearestPointIndex
	} from '../utils/lineChartHover.js';

	export type {
		CwResponsiveLineSeries,
		CwResponsiveLineDataPoint,
		CwResponsiveLineThreshold,
		CwResponsiveLineTheme,
		CwResponsiveLineLayout,
		CwResponsiveLineRangePreset,
		CwResponsiveLineSeriesStats,
		CwResponsiveLineChangeEvent,
		CwNoDataMessage
	};

	const TAU = Math.PI * 2;
	const HOUR = 3600 * 1000;
	const DAY = 24 * HOUR;
	const MIN_SPAN = 5 * 60 * 1000;

	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
	const clamp = (x: number, lo: number, hi: number) => (x < lo ? lo : x > hi ? hi : x);

	// Cold→hot ramp for the temperature gradient. Every stop sits in the same
	// luminance band so the line keeps ≥3:1 contrast against both theme chart
	// surfaces (#293950 dark, #f7fafc light); the stops differ by hue only.
	const TEMP_STOPS: { v: number; c: [number, number, number] }[] = [
		{ v: -10, c: [122, 124, 243] }, // very cold — icy indigo
		{ v: -2, c: [66, 134, 246] }, // cold — blue
		{ v: 8, c: [12, 146, 206] }, // cool — sky
		{ v: 18, c: [13, 156, 109] }, // mild — emerald
		{ v: 26, c: [190, 122, 8] }, // warm — amber
		{ v: 34, c: [240, 81, 81] }, // hot — red
		{ v: 42, c: [235, 79, 131] } // very hot — crimson
	];

	/** CSS gradient matching TEMP_STOPS, for legend swatches. */
	const TEMP_GRADIENT_CSS = `linear-gradient(90deg, ${TEMP_STOPS.map(
		(stop, i) => `rgb(${stop.c.join(',')}) ${Math.round((i / (TEMP_STOPS.length - 1)) * 100)}%`
	).join(', ')})`;

	function tempColor(v: number | null): string {
		if (v == null || Number.isNaN(v)) return 'rgb(123,138,160)';
		if (v <= TEMP_STOPS[0].v) return rgb(TEMP_STOPS[0].c);
		const last = TEMP_STOPS[TEMP_STOPS.length - 1];
		if (v >= last.v) return rgb(last.c);
		for (let i = 0; i < TEMP_STOPS.length - 1; i++) {
			const a = TEMP_STOPS[i];
			const b = TEMP_STOPS[i + 1];
			if (v <= b.v) {
				const t = (v - a.v) / (b.v - a.v);
				return rgb([
					Math.round(lerp(a.c[0], b.c[0], t)),
					Math.round(lerp(a.c[1], b.c[1], t)),
					Math.round(lerp(a.c[2], b.c[2], t))
				]);
			}
		}
		return rgb(last.c);
	}
	const rgb = ([r, g, b]: [number, number, number]) => `rgb(${r},${g},${b})`;

	/** Canvas colours, resolved from CSS tokens at draw time. */
	interface ChartPalette {
		text: string;
		subtle: string;
		grid: string;
		threshold: string;
		crosshair: string;
		crosshairLocked: string;
		gap: string;
		gapHatch: string;
		night: string;
		tooltipBg: string;
		tooltipBorder: string;
		tooltipText: string;
		tooltipMuted: string;
		pointRing: string;
		shadow: string;
		font: string;
		mono: string;
	}

	/** Token (or CSS colour expression) per palette slot, with a fallback. */
	const PALETTE_TOKENS: Record<Exclude<keyof ChartPalette, 'font' | 'mono'>, string> = {
		text: 'var(--cw-chart-card-title, #f6fbff)',
		subtle: 'var(--cw-chart-card-muted, #bccddd)',
		grid: 'var(--cw-chart-grid, rgba(128,128,128,0.35))',
		threshold: 'var(--cw-chart-threshold, #bccddd)',
		crosshair: 'var(--cw-chart-crosshair, #bccddd)',
		crosshairLocked: 'var(--cw-chart-card-title, #f6fbff)',
		gap: 'var(--cw-chart-gap-fill, rgba(128,128,128,0.1))',
		gapHatch: 'color-mix(in srgb, var(--cw-chart-card-muted, #888) 22%, transparent)',
		night: 'color-mix(in srgb, var(--cw-chart-card-muted, #888) 7%, transparent)',
		tooltipBg: 'var(--cw-chart-tooltip-bg, #31455e)',
		tooltipBorder: 'var(--cw-chart-tooltip-border, #7388a3)',
		tooltipText: 'var(--cw-chart-tooltip-text, #eff6ff)',
		tooltipMuted: 'var(--cw-chart-tooltip-muted, #d0dceb)',
		pointRing: 'var(--cw-chart-card-bg, #293950)',
		shadow: 'color-mix(in srgb, var(--cw-gray-950, #020618) 35%, transparent)'
	};

	/**
	 * Normalizes a computed colour to a form every canvas implementation
	 * accepts. Browsers may serialize color-mix() results as `color(srgb …)`.
	 */
	function toCanvasColor(value: string): string {
		const m = /^color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.e-]+))?\)$/.exec(
			value.trim()
		);
		if (!m) return value;
		const [r, g, b] = [m[1], m[2], m[3]].map((c) => Math.round(clamp(parseFloat(c), 0, 1) * 255));
		const a = m[4] === undefined ? 1 : clamp(parseFloat(m[4]), 0, 1);
		return `rgba(${r},${g},${b},${a})`;
	}

	function niceY(min: number, max: number, target = 5) {
		if (min === max) {
			min -= 1;
			max += 1;
		}
		const span = max - min;
		const rough = span / target;
		const pow = Math.pow(10, Math.floor(Math.log10(rough)));
		const norm = rough / pow;
		const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * pow;
		const lo = Math.floor(min / step) * step;
		const hi = Math.ceil(max / step) * step;
		const ticks: number[] = [];
		for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(10));
		return { ticks, step, lo, hi };
	}

	function niceTimeTicks(startMs: number, endMs: number, targetCount = 6) {
		const span = endMs - startMs;
		const candidates: [number, 'time' | 'date'][] = [
			[15 * 60 * 1000, 'time'],
			[30 * 60 * 1000, 'time'],
			[HOUR, 'time'],
			[2 * HOUR, 'time'],
			[3 * HOUR, 'time'],
			[6 * HOUR, 'time'],
			[12 * HOUR, 'time'],
			[DAY, 'date'],
			[2 * DAY, 'date'],
			[7 * DAY, 'date']
		];
		let best = candidates[0];
		for (const c of candidates) {
			if (span / c[0] <= targetCount * 1.5) {
				best = c;
				break;
			}
		}
		const [step, mode] = best;
		const ticks: number[] = [];
		const first = new Date(startMs);
		if (step >= DAY) {
			first.setHours(0, 0, 0, 0);
		} else if (step >= HOUR) {
			const h = step / HOUR;
			first.setMinutes(0, 0, 0);
			first.setHours(Math.floor(first.getHours() / h) * h);
		} else {
			const m = step / (60 * 1000);
			first.setSeconds(0, 0);
			first.setMinutes(Math.floor(first.getMinutes() / m) * m);
		}
		let t = first.getTime();
		while (t <= endMs) {
			if (t >= startMs) ticks.push(t);
			t += step;
		}
		return { ticks, mode, step };
	}

	function fmtTime(ms: number, mode: 'time' | 'date', locale?: string) {
		const d = new Date(ms);
		if (mode === 'date') {
			return new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' }).format(d);
		}
		return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(d);
	}

	function fmtCrosshairTime(ms: number, locale?: string) {
		const d = new Date(ms);
		const date = new Intl.DateTimeFormat(locale, {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		}).format(d);
		const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(d);
		return `${date} · ${time}`;
	}

	function fmtValue(v: number | null | undefined, decimals = 1, locale?: string) {
		return formatCwNumber(v, { decimals, locale });
	}

	function seriesStats(
		data: CwResponsiveLineDataPoint[],
		t0: number,
		t1: number
	): CwResponsiveLineSeriesStats {
		let min = Infinity;
		let max = -Infinity;
		let sum = 0;
		let n = 0;
		let last: number | null = null;
		for (const p of data) {
			if (p.t < t0) continue;
			if (p.t > t1) break;
			if (p.v == null || Number.isNaN(p.v)) continue;
			if (p.v < min) min = p.v;
			if (p.v > max) max = p.v;
			sum += p.v;
			n++;
			last = p.v;
		}
		if (!n) return { min: null, max: null, avg: null, last: null };
		return { min, max, avg: sum / n, last };
	}

	function anomalyPoints(data: CwResponsiveLineDataPoint[], t0: number, t1: number) {
		let sum = 0;
		let n = 0;
		for (const p of data) {
			if (p.t < t0 || p.t > t1 || p.v == null) continue;
			sum += p.v;
			n++;
		}
		if (n < 8) return [] as CwResponsiveLineDataPoint[];
		const mean = sum / n;
		let varS = 0;
		for (const p of data) {
			if (p.t < t0 || p.t > t1 || p.v == null) continue;
			varS += (p.v - mean) * (p.v - mean);
		}
		const sd = Math.sqrt(varS / n);
		if (sd < 1e-6) return [];
		const out: CwResponsiveLineDataPoint[] = [];
		for (const p of data) {
			if (p.t < t0 || p.t > t1 || p.v == null) continue;
			const z = Math.abs(p.v - mean) / sd;
			if (z > 2.5) out.push(p);
		}
		return out;
	}

	function formatTick(v: number, step: number, locale?: string) {
		const decimals = step >= 1 ? 0 : step >= 0.1 ? 1 : 2;
		return formatCwNumber(v, { decimals, locale });
	}

	/** User-facing strings for {@link CwResponsiveLineChart}. All optional; English defaults are used when omitted. */
	export interface CwResponsiveLineChartLabels {
		/** Label for the built-in 1-hour range preset (default "1H"). Overridden by a custom `ranges` prop. */
		range1h?: string;
		/** Label for the built-in 24-hour range preset (default "24H"). Overridden by a custom `ranges` prop. */
		range24h?: string;
		/** Label for the built-in 7-day range preset (default "7D"). Overridden by a custom `ranges` prop. */
		range7d?: string;
		/** Accessible label for the range-preset button group (default "Time range"). */
		rangeGroupAria?: string;
		/** Accessible label for the theme toggle button (default "Toggle theme"). Only used with `showThemeToggle`. */
		toggleThemeAria?: string;
		/** Legend heading; receives how many sensors are on and the total (default "Sensors · {on} of {total} on"). */
		sensorsOnOf?: (on: number, total: number) => string;
		/** Hint label for anomaly markers (default "anomaly"). */
		anomaly?: string;
		/** Hint label for data-gap bands (default "data gap"). */
		dataGap?: string;
		/** In-plot caption drawn over a data-gap band (default "no signal"). */
		noSignal?: string;
		/** Hint shown when scrolling without the zoom modifier held (default "Hold Ctrl + scroll to zoom"; "Ctrl" becomes "⌘" on Apple devices). */
		zoomHint?: string;
		/** Legend chip stat label for the minimum (default "min"). */
		statMin?: string;
		/** Legend chip stat label for the average (default "avg"). */
		statAvg?: string;
		/** Legend chip stat label for the maximum (default "max"). */
		statMax?: string;
		/** Short badge for a series on the left axis (default "L"). */
		axisLeftShort?: string;
		/** Short badge for a series on the right axis (default "R"). */
		axisRightShort?: string;
		/** Full name of the left axis, used for the badge's accessible label (default "Left axis"). */
		axisLeft?: string;
		/** Full name of the right axis, used for the badge's accessible label (default "Right axis"). */
		axisRight?: string;
		/** Accessible name for the plot when there is no `title` (default "Sensor chart"). */
		chart?: string;
		/** Screen-reader summary per visible series. Receives the label and formatted stats. */
		seriesSummary?: (label: string, min: string, avg: string, max: string, latest: string) => string;
		/** Keyboard help read after the summary. */
		keyboardHint?: string;
		/** Status text while `loading` is true (default "Loading chart data…"). */
		loading?: string;
		/** Title for a legend chip that cannot be hidden because it is the last visible series; receives the series label. */
		lastSensorTitle?: (label: string) => string;
		/** Title for a legend chip that will hide a visible series; receives the series label (default "Hide {label}"). */
		hideSeries?: (label: string) => string;
		/** Title for a legend chip that will show a hidden series; receives the series label (default "Show {label}"). */
		showSeries?: (label: string) => string;
	}

	const DEFAULT_LABELS: Required<CwResponsiveLineChartLabels> = {
		range1h: '1H',
		range24h: '24H',
		range7d: '7D',
		rangeGroupAria: 'Time range',
		toggleThemeAria: 'Toggle theme',
		sensorsOnOf: (on, total) => `Sensors · ${on} of ${total} on`,
		anomaly: 'anomaly',
		dataGap: 'data gap',
		noSignal: 'no signal',
		zoomHint: 'Hold Ctrl + scroll to zoom',
		statMin: 'min',
		statAvg: 'avg',
		statMax: 'max',
		axisLeftShort: 'L',
		axisRightShort: 'R',
		axisLeft: 'Left axis',
		axisRight: 'Right axis',
		chart: 'Sensor chart',
		seriesSummary: (label, min, avg, max, latest) =>
			`${label}: minimum ${min}, average ${avg}, maximum ${max}, latest ${latest}.`,
		keyboardHint:
			'Use the left and right arrow keys to inspect readings, plus and minus to zoom, and 0 to reset.',
		loading: 'Loading chart data…',
		lastSensorTitle: (label) => `${label} — at least one sensor must stay visible`,
		hideSeries: (label) => `Hide ${label}`,
		showSeries: (label) => `Show ${label}`
	};

	const DEFAULT_RANGE_MS = {
		'1h': 60 * 60 * 1000,
		'24h': 24 * 60 * 60 * 1000,
		'7d': 7 * 24 * 60 * 60 * 1000
	} as const;
</script>

<script lang="ts">
	import { onMount, onDestroy, untrack } from 'svelte';
	import CwNoDataOverlay from './CwNoDataOverlay.svelte';
	import CwSpinner from './CwSpinner.svelte';
	import { getCwNoDataMessage, hasCwNoData } from './cwNoData.js';
	import { resolveLineChartLayout } from '../utils/lineChartLayout.js';
	import { joinCwUnit } from '../utils/cwFormat.js';

	interface Props {
		/** Series to render. The first one becomes the default left axis if not specified. */
		series?: CwResponsiveLineSeries[] | null;
		/** Earliest sample timestamp (ms epoch). Computed from `series` when omitted. */
		dataStart?: number;
		/** Latest sample timestamp (ms epoch). Computed from `series` when omitted. */
		dataEnd?: number;
		/** Card heading. */
		title?: string;
		/** Card sub-heading. */
		subtitle?: string;
		/**
		 * Forces a theme for this chart only. When omitted (default) the chart
		 * follows the document's `data-theme`, falling back to the OS preference.
		 */
		theme?: CwResponsiveLineTheme;
		/** Track the OS color-scheme preference. Overrides `theme` while active. */
		themeAuto?: boolean;
		/** Show the built-in theme toggle button. Off by default: the app normally owns the theme. */
		showThemeToggle?: boolean;
		/** BCP 47 locale for numbers and dates. Defaults to the runtime locale. */
		locale?: string;
		/** Shows a loading state over the plot. */
		loading?: boolean;
		/** Accessible name for the plot. Defaults to `title`. */
		ariaLabel?: string;
		/** Range preset shortcuts. Set to `[]` to hide. Defaults to 1H / 24H / 7D (labels come from `labels`). */
		ranges?: CwResponsiveLineRangePreset[];
		/** Override display labels for i18n. English defaults are used for any omitted field. */
		labels?: CwResponsiveLineChartLabels;
		/** Initial range preset id. Falls back to "show everything" when unmatched. */
		initialRange?: string;
		/** Series ids hidden at mount time. */
		initialHidden?: string[];
		/** Show min/avg/max under each legend chip. */
		showLegendStats?: boolean;
		/** Show the legend at all. */
		showLegend?: boolean;
		/** Show anomaly markers (z-score > 2.5σ within view). */
		showAnomalies?: boolean;
		/** Show series threshold lines. */
		showThresholds?: boolean;
		/** Show explicit data-gap bands when `gapMs` is set on a series. */
		showDataGaps?: boolean;
		/** Shade 18:00–06:00 when the view spans less than 14 days. */
		showNightBands?: boolean;
		/** Forced layout. `'auto'` (default) picks one from the container width. */
		layout?: CwResponsiveLineLayout;
		/** Component height (CSS value or pixels). */
		height?: number | string;
		/** Render the chart inside the host's themed card or as a bare canvas. */
		bare?: boolean;
		/**
		 * Shows the no-data overlay. When omitted, the overlay appears automatically
		 * if no series has any readings; pass `false` to suppress it.
		 */
		noData?: CwNoDataMessage;
		/** Optional className applied to the root element. */
		class?: string;
		/** Called whenever the chart's interactive state changes. */
		onchange?: (e: CwResponsiveLineChangeEvent) => void;
	}

	let {
		series: seriesInput = [],
		dataStart,
		dataEnd,
		title = '',
		subtitle = '',
		theme = $bindable<CwResponsiveLineTheme | undefined>(undefined),
		themeAuto = false,
		showThemeToggle = false,
		locale,
		loading = false,
		ariaLabel,
		ranges: rangesInput,
		labels = {},
		initialRange = '24h',
		initialHidden = [],
		showLegendStats = true,
		showLegend = true,
		showAnomalies = true,
		showThresholds = true,
		showDataGaps = true,
		showNightBands = true,
		layout = 'auto',
		height = 480,
		bare = false,
		noData,
		class: className = '',
		onchange
	}: Props = $props();

	const l = $derived({ ...DEFAULT_LABELS, ...labels });

	const ranges = $derived(
		rangesInput ?? [
			{ id: '1h', label: l.range1h, ms: DEFAULT_RANGE_MS['1h'] },
			{ id: '24h', label: l.range24h, ms: DEFAULT_RANGE_MS['24h'] },
			{ id: '7d', label: l.range7d, ms: DEFAULT_RANGE_MS['7d'] }
		]
	);

	const series = $derived(seriesInput ?? []);
	const isEmpty = $derived(series.every((s) => !s.data?.some((p) => p.v != null && !Number.isNaN(p.v))));
	const hasNoData = $derived(!loading && (noData === undefined ? isEmpty : hasCwNoData(noData)));
	const noDataMessage = $derived(getCwNoDataMessage(noData));

	let rootEl: HTMLDivElement;
	let canvasEl: HTMLCanvasElement;
	/** Hidden element used to resolve theme tokens into concrete colours. */
	let probeEl: HTMLSpanElement;
	let containerWidth = $state(0);
	let containerHeight = $state(0);

	let hidden = $state<string[]>(untrack(() => [...initialHidden]));
	let viewStart = $state<number>(0);
	let viewEnd = $state<number>(0);
	let crosshairX = $state<number | null>(null);
	let crosshairLocked = $state(false);

	/** Transient overlay shown when the user scrolls over the chart without Ctrl. */
	let zoomHintVisible = $state(false);
	let zoomHintTimer: ReturnType<typeof setTimeout> | null = null;
	/** When the mouse last entered the plot; see onWheel. */
	let hoverSince = 0;
	const isApple =
		typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
	const zoomHintText = $derived(isApple ? l.zoomHint.replace(/\bCtrl\b/g, '⌘') : l.zoomHint);
	function flashZoomHint() {
		zoomHintVisible = true;
		if (zoomHintTimer) clearTimeout(zoomHintTimer);
		zoomHintTimer = setTimeout(() => (zoomHintVisible = false), 1200);
	}

	let visibleSeries = $derived(series.filter((s) => !hidden.includes(s.id)));

	interface AxisPlacement {
		series: CwResponsiveLineSeries;
		side: 'left' | 'right';
		/** Index on its side (0 = innermost, stacks outward). */
		index: number;
	}

	let axisPlacements = $derived.by<AxisPlacement[]>(() => {
		const left: AxisPlacement[] = [];
		const right: AxisPlacement[] = [];
		let lc = 0;
		let rc = 0;
		visibleSeries.forEach((s, i) => {
			const side = s.axisSide ?? (i % 2 === 0 ? 'left' : 'right');
			if (side === 'left') {
				left.push({ series: s, side, index: lc++ });
			} else {
				right.push({ series: s, side, index: rc++ });
			}
		});
		return [...left, ...right];
	});

	let leftAxisCount = $derived(axisPlacements.filter((p) => p.side === 'left').length);
	let rightAxisCount = $derived(axisPlacements.filter((p) => p.side === 'right').length);

	let bounds = $derived.by(() => {
		let lo = Infinity;
		let hi = -Infinity;
		for (const s of series) {
			for (const p of s.data) {
				if (p.t < lo) lo = p.t;
				if (p.t > hi) hi = p.t;
			}
		}
		return {
			lo: dataStart ?? (lo === Infinity ? 0 : lo),
			hi: dataEnd ?? (hi === -Infinity ? 0 : hi)
		};
	});

	// `containerWidth` is the BORDER-box width (see resolveLineChartLayout): the
	// classes below change this element's padding, so resolving against the
	// content box would let the chosen class change the measurement that chose
	// it.
	let layoutDecision = $derived(resolveLineChartLayout(containerWidth, layout));
	let resolvedLayout: CwResponsiveLineLayout = $derived(layoutDecision.layout);
	let isXs = $derived(layoutDecision.xs);
	let compact = $derived(resolvedLayout === 'phone' || resolvedLayout === 'phone-land');
	let sidebar = $derived(resolvedLayout === 'desktop' || resolvedLayout === 'tablet-land');

	// ── Theme ────────────────────────────────────────────────
	// The chart follows the document theme ([data-theme] on <html>) unless a
	// theme is forced via `theme` / `themeAuto`, in which case it scopes the
	// theme tokens to itself with its own data-theme attribute.
	let documentTheme = $state<CwResponsiveLineTheme>('dark');
	let osTheme = $state<CwResponsiveLineTheme>('dark');

	onMount(() => {
		const html = document.documentElement;
		const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
		const readOs = () => {
			osTheme = mq && !mq.matches ? 'light' : 'dark';
		};
		const readDoc = () => {
			const attr = html.getAttribute('data-theme');
			documentTheme = attr === 'light' || attr === 'dark' ? attr : osTheme;
		};
		readOs();
		readDoc();
		const onOsChange = () => {
			readOs();
			readDoc();
		};
		mq?.addEventListener('change', onOsChange);
		const mo = new MutationObserver(readDoc);
		mo.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
		return () => {
			mq?.removeEventListener('change', onOsChange);
			mo.disconnect();
		};
	});

	const forcedTheme = $derived<CwResponsiveLineTheme | undefined>(themeAuto ? osTheme : theme);
	const resolvedTheme = $derived<CwResponsiveLineTheme>(forcedTheme ?? documentTheme);

	// Palette cache; cleared whenever the effective theme may have changed.
	let palette: ChartPalette | null = null;
	$effect(() => {
		void resolvedTheme;
		void forcedTheme;
		palette = null;
		schedule();
	});

	function readPalette(): ChartPalette {
		if (palette) return palette;
		const probe = probeEl;
		const out = {} as ChartPalette;
		for (const [key, expr] of Object.entries(PALETTE_TOKENS)) {
			probe.style.color = '';
			probe.style.color = expr;
			(out as unknown as Record<string, string>)[key] = toCanvasColor(getComputedStyle(probe).color);
		}
		probe.style.color = '';
		const rootStyle = getComputedStyle(rootEl);
		out.font = rootStyle.getPropertyValue('--cw-font-family').trim() || 'system-ui, sans-serif';
		out.mono = rootStyle.getPropertyValue('--cw-font-mono').trim() || 'ui-monospace, monospace';
		palette = out;
		return out;
	}

	function initView() {
		const r = ranges.find((x) => x.id === initialRange);
		if (r && bounds.hi - bounds.lo > r.ms) {
			viewStart = bounds.hi - r.ms;
			viewEnd = bounds.hi;
		} else {
			viewStart = bounds.lo;
			viewEnd = bounds.hi;
		}
	}

	$effect(() => {
		// re-initialize view when data identity changes
		series;
		untrack(() => initView());
	});

	function selectRange(id: string) {
		const r = ranges.find((x) => x.id === id);
		if (!r) return;
		viewEnd = bounds.hi;
		viewStart = Math.max(bounds.lo, bounds.hi - r.ms);
		clampView();
		schedule();
		fireChange();
	}

	let activeRange = $derived.by(() => {
		const span = viewEnd - viewStart;
		const tol = Math.max(1000, span * 0.005);
		const r = ranges.find((rg) => Math.abs(rg.ms - span) < tol);
		return r?.id ?? null;
	});

	function toggleSeries(id: string) {
		if (hidden.includes(id)) {
			hidden = hidden.filter((x) => x !== id);
		} else {
			// Never let the user hide every series — keep the chart from
			// going blank while there is still data to show.
			if (series.length - hidden.length <= 1) return;
			hidden = [...hidden, id];
		}
		schedule();
		fireChange();
	}

	function legendStats(): Record<string, CwResponsiveLineSeriesStats> {
		const out: Record<string, CwResponsiveLineSeriesStats> = {};
		for (const s of series) out[s.id] = seriesStats(s.data, viewStart, viewEnd);
		return out;
	}

	let stats = $derived(legendStats());

	/** Whether any visible series has a data gap inside the current view. */
	let hasGapsInView = $derived.by(() => {
		if (!showDataGaps) return false;
		for (const s of visibleSeries) {
			const gapMs = s.gapMs;
			if (!gapMs) continue;
			let last: number | null = null;
			for (const dp of s.data) {
				if (dp.t > viewEnd) break;
				if (dp.v == null || Number.isNaN(dp.v)) continue;
				if (last !== null && dp.t >= viewStart && dp.t - last > gapMs) return true;
				last = dp.t;
			}
		}
		return false;
	});

	// Anomaly detection makes three full passes over each series' points, so it
	// is hoisted out of draw(): a crosshair/tooltip repaint reads this cache
	// instead of recomputing the statistics per frame. Recomputes only when the
	// data, view window, visibility, or the toggle change.
	let anomaliesBySeries = $derived.by(() => {
		const map = new Map<string, CwResponsiveLineDataPoint[]>();
		if (!showAnomalies) return map;
		for (const s of visibleSeries) {
			map.set(s.id, anomalyPoints(s.data, viewStart, viewEnd));
		}
		return map;
	});

	let hasAnomaliesInView = $derived.by(() => {
		for (const pts of anomaliesBySeries.values()) if (pts.length) return true;
		return false;
	});

	function fireChange() {
		onchange?.({
			viewStart,
			viewEnd,
			hidden: [...hidden],
			// Reuse the derived — legendStats() here would rescan every series a
			// second time per interaction for an identical result. Shallow-copied
			// so a consumer mutating the event payload can't corrupt the derived.
			legendStats: { ...stats }
		});
	}

	/**
	 * A percentage metric (humidity, soil moisture, …) can't physically exceed
	 * 100%, so its axis should never scale past it. Honors an explicit
	 * `percentage` flag, otherwise infers it from a unit carrying a "%" sign.
	 */
	function isPercentageSeries(s: CwResponsiveLineSeries) {
		if (s.percentage !== undefined) return s.percentage;
		return (s.unit ?? '').includes('%');
	}

	function seriesRange(s: CwResponsiveLineSeries, targetTicks?: number) {
		let lo = Infinity;
		let hi = -Infinity;
		for (const p of s.data) {
			if (p.t < viewStart || p.t > viewEnd) continue;
			if (p.v == null || Number.isNaN(p.v)) continue;
			if (p.v < lo) lo = p.v;
			if (p.v > hi) hi = p.v;
		}
		if (s.thresholds) {
			for (const th of s.thresholds) {
				if (th.value < lo) lo = th.value;
				if (th.value > hi) hi = th.value;
			}
		}
		if (lo === Infinity) return null;
		const pad = (hi - lo) * 0.08 || 1;
		// Cap percentage axes at 100% so the padded/"nice" top never implies an
		// impossible reading. We only ever cap downward — a metric sitting well
		// below 100% keeps its tighter, data-fitted scale.
		const cap = isPercentageSeries(s) ? 100 : Infinity;
		const r = niceY(lo - pad, Math.min(hi + pad, cap), targetTicks ?? (compact ? 4 : 5));
		if (r.hi > cap) {
			r.hi = cap;
			r.ticks = r.ticks.filter((t) => t <= cap);
			if (r.ticks[r.ticks.length - 1] !== cap) r.ticks.push(cap);
		}
		return r;
	}

	/** Color for a series' axis ticks/unit (gradient series fall back to series.color). */
	function axisColorFor(s: CwResponsiveLineSeries) {
		return s.color;
	}

	/**
	 * One axis column per side. All series on the same side share the column;
	 * their tick labels stack at their value-mapped Y positions and are
	 * colored to identify the series.
	 */
	function computeAxisLayout(W: number) {
		const hasL = leftAxisCount > 0;
		const hasR = rightAxisCount > 0;
		const cols = (hasL ? 1 : 0) + (hasR ? 1 : 0);
		// Widths sized to comfortably fit 3-4 character labels (e.g. "700", "1.6")
		// without leaving a wide empty gap between the label column and the plot.
		const want = compact ? 30 : 44;
		const minW = compact ? 24 : 34;
		const basePad = compact ? 4 : 8;
		let axisWidth = want;
		if (cols > 0 && W > 0) {
			const maxAxisTotal = Math.max(48, W * 0.4);
			const perColMax = maxAxisTotal / cols;
			axisWidth = Math.max(minW, Math.min(want, perColMax));
		}
		const pl = hasL ? basePad + axisWidth : basePad;
		const pr = hasR ? basePad + axisWidth : basePad;
		return { axisWidth, pl, pr, basePad };
	}

	let raf: number | null = null;
	function schedule() {
		if (raf != null) return;
		raf = requestAnimationFrame(() => {
			raf = null;
			draw();
		});
	}

	function clampView() {
		const fullSpan = bounds.hi - bounds.lo;
		let span = viewEnd - viewStart;
		if (span < MIN_SPAN) {
			const mid = (viewEnd + viewStart) / 2;
			viewStart = mid - MIN_SPAN / 2;
			viewEnd = mid + MIN_SPAN / 2;
			span = MIN_SPAN;
		}
		if (span > fullSpan) {
			viewStart = bounds.lo;
			viewEnd = bounds.hi;
			return;
		}
		if (viewStart < bounds.lo) {
			viewEnd += bounds.lo - viewStart;
			viewStart = bounds.lo;
		}
		if (viewEnd > bounds.hi) {
			viewStart -= viewEnd - bounds.hi;
			viewEnd = bounds.hi;
		}
	}

	function roundRect(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		w: number,
		h: number,
		r: number
	) {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.arcTo(x + w, y, x + w, y + h, r);
		ctx.arcTo(x + w, y + h, x, y + h, r);
		ctx.arcTo(x, y + h, x, y, r);
		ctx.arcTo(x, y, x + w, y, r);
		ctx.closePath();
	}

	function draw() {
		if (!canvasEl) return;
		const cnv = canvasEl;
		const W = cnv.clientWidth;
		const H = cnv.clientHeight;
		if (!W || !H) {
			// Zero-sized (e.g. inside a display:none tab): bail without
			// rescheduling — retrying here spins an endless rAF loop for as long
			// as the chart stays hidden. The ResizeObserver schedules a fresh
			// draw the moment the element gains size.
			return;
		}
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		if (cnv.width !== W * dpr || cnv.height !== H * dpr) {
			cnv.width = W * dpr;
			cnv.height = H * dpr;
		}
		const ctx = cnv.getContext('2d');
		if (!ctx) return;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const T = readPalette();
		ctx.clearRect(0, 0, W, H);

		const { axisWidth, pl, pr } = computeAxisLayout(W);
		// progressive font scale based on container width
		const veryNarrow = W < 380;
		const narrow = W < 520;
		const pt = compact ? (veryNarrow ? 12 : 16) : 18;
		const pb = compact ? (veryNarrow ? 18 : 20) : 26;
		const plot = { x: pl, y: pt, w: Math.max(1, W - pl - pr), h: Math.max(1, H - pt - pb) };
		// drop the per-axis unit crown when each axis is too narrow to fit a label
		const showUnitCrowns = axisWidth >= 30 && !veryNarrow;
		// 11px is the library's minimum legible chart text (--cw-chart-tick-size).
		const tickFontPx = 11;
		const timeFontPx = 11;
		const thresholdFontPx = 11;
		const unitFontPx = 11;

		const span = viewEnd - viewStart || 1;
		const xS = (t: number) => plot.x + ((t - viewStart) / span) * plot.w;

		// Compute the range for each placed axis (one per visible series).
		// When multiple series share a side, ask for fewer ticks each so the
		// shared column doesn't get crammed.
		const rangeByPlacement = new Map<string, ReturnType<typeof niceY> | null>();
		for (const p of axisPlacements) {
			const onSide = p.side === 'left' ? leftAxisCount : rightAxisCount;
			const target =
				onSide >= 3 ? (compact ? 2 : 3) : onSide === 2 ? (compact ? 3 : 4) : compact ? 4 : 5;
			rangeByPlacement.set(p.series.id, seriesRange(p.series, target));
		}

		// grid — use the first left axis (or first axis overall) as the gridline driver
		const gridPlacement = axisPlacements[0];
		const gridRange = gridPlacement ? rangeByPlacement.get(gridPlacement.series.id) : null;
		if (gridRange) {
			const yS = (v: number) =>
				plot.y + plot.h - ((v - gridRange.lo) / (gridRange.hi - gridRange.lo || 1)) * plot.h;
			ctx.strokeStyle = T.grid;
			ctx.lineWidth = 1;
			ctx.beginPath();
			for (const v of gridRange.ticks) {
				const y = Math.round(yS(v)) + 0.5;
				ctx.moveTo(plot.x, y);
				ctx.lineTo(plot.x + plot.w, y);
			}
			ctx.stroke();
		}

		// night bands
		if (showNightBands && viewEnd - viewStart <= 14 * DAY) {
			ctx.fillStyle = T.night;
			const dS = new Date(viewStart);
			dS.setHours(0, 0, 0, 0);
			for (let t = dS.getTime() - DAY; t < viewEnd; t += DAY) {
				const ns = t + 18 * HOUR;
				const ne = t + 30 * HOUR;
				const a = Math.max(viewStart, ns);
				const b = Math.min(viewEnd, ne);
				if (b <= a) continue;
				ctx.fillRect(xS(a), plot.y, xS(b) - xS(a), plot.h);
			}
		}

		// time axis
		const { ticks: timeTicks, mode: timeMode } = niceTimeTicks(
			viewStart,
			viewEnd,
			compact ? 4 : 7
		);
		ctx.strokeStyle = T.grid;
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (const t of timeTicks) {
			const x = Math.round(xS(t)) + 0.5;
			ctx.moveTo(x, plot.y);
			ctx.lineTo(x, plot.y + plot.h);
		}
		ctx.stroke();
		ctx.fillStyle = T.subtle;
		ctx.font = `500 ${timeFontPx}px ${T.font}`;
		ctx.textBaseline = 'top';
		ctx.textAlign = 'center';
		for (const t of timeTicks) {
			ctx.fillText(fmtTime(t, timeMode, locale), xS(t), plot.y + plot.h + 4);
		}

		// Collect every visible tick label, then run a minimum-gap pass per side
		// so labels from different series never overlap. The walk preserves the
		// natural value-mapped Y for as long as possible and only nudges
		// neighbours apart when their natural positions collide.
		interface TickLabel {
			y: number;
			naturalY: number;
			text: string;
			color: string;
		}
		const leftLabels: TickLabel[] = [];
		const rightLabels: TickLabel[] = [];
		for (const p of axisPlacements) {
			const range = rangeByPlacement.get(p.series.id);
			if (!range) continue;
			const s = p.series;
			const col = axisColorFor(s);
			const yS = (v: number) =>
				plot.y + plot.h - ((v - range.lo) / (range.hi - range.lo || 1)) * plot.h;
			for (const v of range.ticks) {
				const y = yS(v);
				const item: TickLabel = { y, naturalY: y, text: formatTick(v, range.step, locale), color: col };
				(p.side === 'left' ? leftLabels : rightLabels).push(item);
			}
		}
		const minGap = tickFontPx + 2;
		const resolveOverlaps = (labels: TickLabel[]) => {
			labels.sort((a, b) => a.naturalY - b.naturalY);
			// forward pass: push down anything too close to its predecessor
			for (let i = 1; i < labels.length; i++) {
				const minY = labels[i - 1].y + minGap;
				if (labels[i].y < minY) labels[i].y = minY;
			}
			// backward pass: if the last label was pushed past the plot bottom,
			// drag the cluster back up so the column stays within the plot box
			const plotBottom = plot.y + plot.h;
			for (let i = labels.length - 1; i > 0; i--) {
				if (labels[i].y > plotBottom) labels[i].y = plotBottom;
				const maxY = labels[i].y - minGap;
				if (labels[i - 1].y > maxY) labels[i - 1].y = maxY;
			}
		};
		resolveOverlaps(leftLabels);
		resolveOverlaps(rightLabels);

		const tickPadX = compact ? 4 : 6;
		const leftAnchorX = plot.x - tickPadX;
		const rightAnchorX = plot.x + plot.w + tickPadX;
		ctx.font = `500 ${tickFontPx}px ${T.mono}`;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'right';
		for (const lbl of leftLabels) {
			ctx.fillStyle = lbl.color;
			ctx.fillText(lbl.text, leftAnchorX, lbl.y);
		}
		ctx.textAlign = 'left';
		for (const lbl of rightLabels) {
			ctx.fillStyle = lbl.color;
			ctx.fillText(lbl.text, rightAnchorX, lbl.y);
		}

		// Unit crowns: only when a side has a single series (otherwise the column
		// header would have to stack many units; the legend chip carries the unit
		// in the multi-series case).
		if (showUnitCrowns) {
			for (const p of axisPlacements) {
				const onSide = p.side === 'left' ? leftAxisCount : rightAxisCount;
				if (onSide !== 1 || !p.series.unit) continue;
				ctx.font = `700 ${unitFontPx}px ${T.font}`;
				ctx.textBaseline = 'bottom';
				ctx.textAlign = p.side === 'left' ? 'right' : 'left';
				ctx.fillStyle = axisColorFor(p.series);
				ctx.fillText(
					p.series.unit,
					p.side === 'left' ? leftAnchorX : rightAnchorX,
					plot.y - 3
				);
			}
		}

		// clip plot
		ctx.save();
		ctx.beginPath();
		ctx.rect(plot.x, plot.y, plot.w, plot.h);
		ctx.clip();

		// thresholds
		if (showThresholds) {
			for (const p of axisPlacements) {
				const s = p.series;
				if (!s.thresholds || !s.thresholds.length) continue;
				const range = rangeByPlacement.get(s.id);
				if (!range) continue;
				const yS = (v: number) =>
					plot.y + plot.h - ((v - range.lo) / (range.hi - range.lo || 1)) * plot.h;
				for (const th of s.thresholds) {
					const y = yS(th.value);
					ctx.save();
					ctx.strokeStyle = th.color || T.threshold;
					ctx.lineWidth = 1;
					ctx.setLineDash([3, 4]);
					ctx.beginPath();
					ctx.moveTo(plot.x, y);
					ctx.lineTo(plot.x + plot.w, y);
					ctx.stroke();
					ctx.restore();
					ctx.fillStyle = th.color || T.subtle;
					ctx.font = `500 ${thresholdFontPx}px ${T.font}`;
					ctx.textBaseline = 'bottom';
					ctx.textAlign = 'left';
					ctx.fillText(th.label, plot.x + 6, y - 2);
				}
			}
		}

		// series lines
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		for (const p of axisPlacements) {
			const s = p.series;
			const range = rangeByPlacement.get(s.id);
			if (!range) continue;
			const yS = (v: number) =>
				plot.y + plot.h - ((v - range.lo) / (range.hi - range.lo || 1)) * plot.h;
			const data = s.data;
			if (!data.length) continue;
			const gapMs = s.gapMs || 0;
			let i0 = nearestPointIndex(data, viewStart);
			let i1 = nearestPointIndex(data, viewEnd);
			if (data[i0] && data[i0].t > viewStart && i0 > 0) i0--;
			if (data[i1] && data[i1].t < viewEnd && i1 < data.length - 1) i1++;
			ctx.lineWidth = s.gradient ? 2.4 : 1.8;

			const runs: CwResponsiveLineDataPoint[][] = [];
			let run: CwResponsiveLineDataPoint[] = [];
			for (let i = i0; i <= i1; i++) {
				const p = data[i];
				if (!p) continue;
				if (p.v == null || Number.isNaN(p.v)) {
					if (run.length) {
						runs.push(run);
						run = [];
					}
					continue;
				}
				if (run.length && gapMs && p.t - run[run.length - 1].t > gapMs) {
					runs.push(run);
					run = [];
				}
				run.push(p);
			}
			if (run.length) runs.push(run);

			if (s.gradient) {
				for (const r of runs) {
					for (let i = 1; i < r.length; i++) {
						const a = r[i - 1];
						const b = r[i];
						const mid = ((a.v as number) + (b.v as number)) / 2;
						ctx.beginPath();
						ctx.strokeStyle = tempColor(mid);
						ctx.moveTo(xS(a.t), yS(a.v as number));
						ctx.lineTo(xS(b.t), yS(b.v as number));
						ctx.stroke();
					}
				}
			} else {
				ctx.strokeStyle = s.color;
				for (const r of runs) {
					if (r.length < 2) {
						ctx.fillStyle = s.color;
						ctx.beginPath();
						ctx.arc(xS(r[0].t), yS(r[0].v as number), 2, 0, TAU);
						ctx.fill();
						continue;
					}
					ctx.beginPath();
					ctx.moveTo(xS(r[0].t), yS(r[0].v as number));
					for (let i = 1; i < r.length; i++) ctx.lineTo(xS(r[i].t), yS(r[i].v as number));
					ctx.stroke();
				}
			}
		}

		// data gap markers
		if (showDataGaps) {
			for (const s of visibleSeries) {
				const gapMs = s.gapMs;
				if (!gapMs) continue;
				let last: CwResponsiveLineDataPoint | null = null;
				for (const dp of s.data) {
					if (dp.t < viewStart) {
						last = dp;
						continue;
					}
					if (dp.t > viewEnd) break;
					if (dp.v == null || Number.isNaN(dp.v)) continue;
					if (last && dp.t - last.t > gapMs) {
						const x0 = xS(last.t);
						const x1 = xS(dp.t);
						ctx.save();
						ctx.fillStyle = T.gap;
						ctx.fillRect(x0, plot.y, x1 - x0, plot.h);
						// Diagonal hatch keeps gaps distinct from the (plain) night bands.
						ctx.beginPath();
						ctx.rect(x0, plot.y, x1 - x0, plot.h);
						ctx.clip();
						ctx.strokeStyle = T.gapHatch;
						ctx.lineWidth = 1;
						ctx.beginPath();
						for (let hx = x0 - plot.h; hx < x1; hx += 8) {
							ctx.moveTo(hx, plot.y + plot.h);
							ctx.lineTo(hx + plot.h, plot.y);
						}
						ctx.stroke();
						ctx.strokeStyle = T.threshold;
						ctx.setLineDash([2, 3]);
						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.moveTo(Math.round((x0 + x1) / 2) + 0.5, plot.y);
						ctx.lineTo(Math.round((x0 + x1) / 2) + 0.5, plot.y + plot.h);
						ctx.stroke();
						ctx.restore();
						ctx.fillStyle = T.subtle;
						ctx.font = `500 ${thresholdFontPx}px ${T.font}`;
						ctx.textAlign = 'center';
						ctx.textBaseline = 'top';
						if (x1 - x0 > 36) ctx.fillText(l.noSignal, (x0 + x1) / 2, plot.y + 4);
					}
					last = dp;
				}
			}
		}

		// anomalies
		if (showAnomalies) {
			for (const p of axisPlacements) {
				const s = p.series;
				const range = rangeByPlacement.get(s.id);
				if (!range) continue;
				const yS = (v: number) =>
					plot.y + plot.h - ((v - range.lo) / (range.hi - range.lo || 1)) * plot.h;
				const anoms = anomaliesBySeries.get(s.id) ?? [];
				for (const p of anoms) {
					const x = xS(p.t);
					const y = yS(p.v as number);
					ctx.beginPath();
					ctx.fillStyle = T.pointRing;
					ctx.arc(x, y, 5, 0, TAU);
					ctx.fill();
					ctx.beginPath();
					ctx.fillStyle = s.gradient ? tempColor(p.v) : s.color;
					ctx.arc(x, y, 3.2, 0, TAU);
					ctx.fill();
					ctx.beginPath();
					ctx.strokeStyle = s.gradient ? tempColor(p.v) : s.color;
					ctx.lineWidth = 1.4;
					ctx.arc(x, y, 6, 0, TAU);
					ctx.stroke();
				}
			}
		}

		ctx.restore();

		// crosshair
		if (crosshairX != null && crosshairX >= plot.x && crosshairX <= plot.x + plot.w) {
			const cx = crosshairX;
			const t = viewStart + ((cx - plot.x) / plot.w) * (viewEnd - viewStart);
			ctx.strokeStyle = crosshairLocked ? T.crosshairLocked : T.crosshair;
			ctx.lineWidth = 1;
			ctx.setLineDash(crosshairLocked ? [] : [3, 3]);
			ctx.beginPath();
			ctx.moveTo(Math.round(cx) + 0.5, plot.y);
			ctx.lineTo(Math.round(cx) + 0.5, plot.y + plot.h);
			ctx.stroke();
			ctx.setLineDash([]);

			interface Readout {
				s: CwResponsiveLineSeries;
				p: CwResponsiveLineDataPoint;
				col: string;
			}
			const readouts: Readout[] = [];
			// A series whose first reading comes after the cursor is left out:
			// its nearest point would be a value from the cursor's future.
			const snapMs = ((viewEnd - viewStart) / plot.w) * CW_RLC_HOVER_SNAP_PX;
			for (const s of visibleSeries) {
				const dp = hoverPoint(s.data, t, snapMs);
				if (!dp) continue;
				const range = rangeByPlacement.get(s.id);
				if (!range) continue;
				const yS = (v: number) =>
					plot.y + plot.h - ((v - range.lo) / (range.hi - range.lo || 1)) * plot.h;
				const px2 = xS(dp.t);
				const py = yS(dp.v as number);
				const col = s.gradient ? tempColor(dp.v) : s.color;
				ctx.beginPath();
				ctx.fillStyle = T.pointRing;
				ctx.arc(px2, py, 5, 0, TAU);
				ctx.fill();
				ctx.beginPath();
				ctx.fillStyle = col;
				ctx.arc(px2, py, 3.2, 0, TAU);
				ctx.fill();
				readouts.push({ s, p: dp, col });
			}

			// tooltip
			const ttFontPx = narrow ? 11 : 12;
			const padX = veryNarrow ? 7 : narrow ? 8 : 10;
			const padY = veryNarrow ? 6 : narrow ? 7 : 8;
			const lh = compact ? 15 : 17;
			const titleFont = `600 ${ttFontPx}px ${T.font}`;
			const labelFont = `500 ${ttFontPx}px ${T.font}`;
			const valFont = `600 ${ttFontPx}px ${T.mono}`;

			ctx.font = titleFont;
			const titleText = fmtCrosshairTime(t, locale);
			let w = ctx.measureText(titleText).width;
			for (const r of readouts) {
				ctx.font = labelFont;
				const lw = ctx.measureText(r.s.label).width;
				ctx.font = valFont;
				const val = joinCwUnit(fmtValue(r.p.v, r.s.decimals ?? 1, locale), r.s.unit);
				const vw = ctx.measureText(val).width;
				w = Math.max(w, lw + vw + 18);
			}
			const h = padY * 2 + lh + readouts.length * lh + (readouts.length ? 4 : 0);
			const boxW = w + padX * 2;
			let x = cx + 12;
			if (x + boxW > W - 6) x = cx - 12 - boxW;
			x = clamp(x, 4, W - boxW - 4);
			const y = plot.y + 8;

			ctx.save();
			ctx.shadowColor = T.shadow;
			ctx.shadowBlur = 16;
			ctx.shadowOffsetY = 4;
			ctx.fillStyle = T.tooltipBg;
			roundRect(ctx, x, y, boxW, h, 8);
			ctx.fill();
			ctx.restore();
			ctx.strokeStyle = T.tooltipBorder;
			ctx.lineWidth = 1;
			roundRect(ctx, x + 0.5, y + 0.5, boxW - 1, h - 1, 8);
			ctx.stroke();

			ctx.fillStyle = T.tooltipText;
			ctx.font = titleFont;
			ctx.textAlign = 'left';
			ctx.textBaseline = 'top';
			ctx.fillText(titleText, x + padX, y + padY);

			let ry = y + padY + lh + 4;
			for (const r of readouts) {
				ctx.fillStyle = r.col;
				ctx.beginPath();
				ctx.arc(x + padX + 3, ry + lh / 2 - 1, 3, 0, TAU);
				ctx.fill();
				ctx.fillStyle = T.tooltipMuted;
				ctx.font = labelFont;
				ctx.textBaseline = 'top';
				ctx.textAlign = 'left';
				ctx.fillText(r.s.label, x + padX + 12, ry);
				ctx.fillStyle = T.tooltipText;
				ctx.font = valFont;
				ctx.textAlign = 'right';
				const val = joinCwUnit(fmtValue(r.p.v, r.s.decimals ?? 1, locale), r.s.unit);
				ctx.fillText(val, x + boxW - padX, ry);
				ry += lh;
			}
		}
	}

	// re-draw on relevant state changes
	$effect(() => {
		void series;
		void viewStart;
		void viewEnd;
		void hidden;
		void crosshairX;
		void crosshairLocked;
		void axisPlacements;
		void resolvedTheme;
		void containerWidth;
		void containerHeight;
		void showThresholds;
		void showAnomalies;
		void showDataGaps;
		void showNightBands;
		schedule();
	});

	function plotGeometry() {
		const W = canvasEl?.clientWidth ?? 0;
		const { pl, pr } = computeAxisLayout(W);
		return { plotX: pl, plotW: Math.max(1, W - pl - pr) };
	}

	// ── interaction ──────────────────────────────────────────
	let pointers = new Map<number, { x: number; y: number }>();
	let panAnchor: {
		x: number;
		y: number;
		t: number;
		viewStart: number;
		viewEnd: number;
		moved: boolean;
	} | null = null;
	let pinchPrev: { mid: number; dist: number; viewStart: number; viewEnd: number } | null = null;
	let lastTap = 0;

	function onPointerDown(e: PointerEvent) {
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		const rect = canvasEl.getBoundingClientRect();
		if (pointers.size === 1) {
			panAnchor = {
				x: e.clientX,
				y: e.clientY,
				t: Date.now(),
				viewStart,
				viewEnd,
				moved: false
			};
			crosshairX = e.clientX - rect.left;
			crosshairLocked = false;
			schedule();
		} else if (pointers.size === 2) {
			panAnchor = null;
			const pts = Array.from(pointers.values());
			pinchPrev = {
				mid: (pts[0].x + pts[1].x) / 2,
				dist: Math.abs(pts[0].x - pts[1].x) || 1,
				viewStart,
				viewEnd
			};
		}
	}

	function onPointerMove(e: PointerEvent) {
		if (!pointers.has(e.pointerId)) {
			// hover only
			if (e.pointerType === 'mouse' && !pointers.size) {
				const rect = canvasEl.getBoundingClientRect();
				crosshairX = e.clientX - rect.left;
				if (!crosshairLocked) schedule();
			}
			return;
		}
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		const rect = canvasEl.getBoundingClientRect();
		if (pointers.size === 1 && panAnchor) {
			const dx = e.clientX - panAnchor.x;
			if (Math.abs(dx) > 4) panAnchor.moved = true;
			if (panAnchor.moved && Math.abs(dx) > 8) {
				const { plotW } = plotGeometry();
				const span = panAnchor.viewEnd - panAnchor.viewStart;
				const dt = -(dx / plotW) * span;
				viewStart = panAnchor.viewStart + dt;
				viewEnd = panAnchor.viewEnd + dt;
				clampView();
				crosshairX = null;
			} else {
				crosshairX = e.clientX - rect.left;
			}
			schedule();
		} else if (pointers.size === 2 && pinchPrev) {
			const pts = Array.from(pointers.values());
			const mid = (pts[0].x + pts[1].x) / 2;
			const dist = Math.abs(pts[0].x - pts[1].x) || 1;
			const { plotX, plotW } = plotGeometry();
			const span0 = pinchPrev.viewEnd - pinchPrev.viewStart;
			const scale = pinchPrev.dist / dist;
			const midFrac = (pinchPrev.mid - rect.left - plotX) / plotW;
			const anchorT = pinchPrev.viewStart + clamp(midFrac, 0, 1) * span0;
			const newSpan = clamp(span0 * scale, MIN_SPAN, bounds.hi - bounds.lo);
			let newStart = anchorT - midFrac * newSpan;
			let newEnd = newStart + newSpan;
			const midDx = mid - pinchPrev.mid;
			const dt = -(midDx / plotW) * newSpan;
			newStart += dt;
			newEnd += dt;
			viewStart = newStart;
			viewEnd = newEnd;
			clampView();
			crosshairX = null;
			schedule();
		}
	}

	function onPointerUp(e: PointerEvent) {
		if (!pointers.has(e.pointerId)) return;
		const wasPan = panAnchor;
		pointers.delete(e.pointerId);
		if (pointers.size < 2) pinchPrev = null;
		if (pointers.size === 0) {
			if (wasPan && !wasPan.moved && Date.now() - wasPan.t < 280) {
				const now = Date.now();
				if (now - lastTap < 320) {
					viewStart = bounds.lo;
					viewEnd = bounds.hi;
					crosshairX = null;
					crosshairLocked = false;
					lastTap = 0;
				} else {
					crosshairLocked = !crosshairLocked;
					schedule();
					lastTap = now;
				}
			}
			panAnchor = null;
			fireChange();
		}
	}

	function onWheel(e: WheelEvent) {
		// Require Ctrl (or ⌘) to interact, so a plain scroll moves the page
		// instead of trapping the wheel inside the chart. A Mac trackpad
		// pinch-zoom also arrives as a ctrlKey wheel event.
		if (!e.ctrlKey && !e.metaKey) {
			// Only hint when the pointer has been resting on the chart. While the
			// page scrolls, the chart slides under a stationary cursor and
			// pointerenter fires just before the wheel events; hinting then
			// would flash the overlay on every ordinary page scroll.
			if (hoverSince && Date.now() - hoverSince > 800) flashZoomHint();
			return;
		}
		e.preventDefault();
		const rect = canvasEl.getBoundingClientRect();
		const { plotX, plotW } = plotGeometry();
		if (e.shiftKey) {
			const span = viewEnd - viewStart;
			const dt = (e.deltaY / plotW) * span;
			viewStart += dt;
			viewEnd += dt;
		} else {
			const cursorX = e.clientX - rect.left;
			const span = viewEnd - viewStart;
			const frac = clamp((cursorX - plotX) / plotW, 0, 1);
			const anchor = viewStart + frac * span;
			const k = Math.exp(e.deltaY * 0.0015);
			const newSpan = clamp(span * k, MIN_SPAN, bounds.hi - bounds.lo);
			viewStart = anchor - frac * newSpan;
			viewEnd = viewStart + newSpan;
		}
		clampView();
		crosshairX = e.clientX - rect.left;
		schedule();
		fireChange();
	}

	function onPointerEnter(e: PointerEvent) {
		if (e.pointerType === 'mouse') hoverSince = Date.now();
	}

	function onPointerLeave(e: PointerEvent) {
		if (e.pointerType === 'mouse') {
			hoverSince = 0;
			if (!crosshairLocked && !pointers.size) {
				crosshairX = null;
				schedule();
			}
		}
	}

	// ── keyboard ─────────────────────────────────────────────
	let liveMessage = $state('');

	function describeAt(t: number): string {
		const parts = [fmtCrosshairTime(t, locale)];
		const snapMs = ((viewEnd - viewStart) / plotGeometry().plotW) * CW_RLC_HOVER_SNAP_PX;
		for (const s of visibleSeries) {
			const dp = hoverPoint(s.data, t, snapMs);
			if (!dp) continue;
			parts.push(`${s.label} ${joinCwUnit(fmtValue(dp.v, s.decimals ?? 1, locale), s.unit)}`);
		}
		return parts.join(', ');
	}

	function zoomBy(k: number) {
		const span = viewEnd - viewStart;
		const anchor =
			crosshairX != null
				? viewStart + clamp((crosshairX - plotGeometry().plotX) / plotGeometry().plotW, 0, 1) * span
				: (viewStart + viewEnd) / 2;
		const frac = span ? (anchor - viewStart) / span : 0.5;
		const newSpan = clamp(span * k, MIN_SPAN, bounds.hi - bounds.lo);
		viewStart = anchor - frac * newSpan;
		viewEnd = viewStart + newSpan;
		clampView();
	}

	function onKeydown(e: KeyboardEvent) {
		if (hasNoData || loading) return;
		const { plotX, plotW } = plotGeometry();
		const current = crosshairX ?? plotX + plotW;
		const step = plotW * (e.shiftKey ? 0.1 : 0.02);
		let handled = true;
		switch (e.key) {
			case 'ArrowLeft':
				crosshairX = clamp(current - step, plotX, plotX + plotW);
				crosshairLocked = true;
				break;
			case 'ArrowRight':
				crosshairX = clamp(current + step, plotX, plotX + plotW);
				crosshairLocked = true;
				break;
			case 'Home':
				crosshairX = plotX;
				crosshairLocked = true;
				break;
			case 'End':
				crosshairX = plotX + plotW;
				crosshairLocked = true;
				break;
			case '+':
			case '=':
				zoomBy(0.75);
				break;
			case '-':
			case '_':
				zoomBy(1 / 0.75);
				break;
			case '0':
				viewStart = bounds.lo;
				viewEnd = bounds.hi;
				break;
			case 'Escape':
				crosshairX = null;
				crosshairLocked = false;
				break;
			default:
				handled = false;
		}
		if (!handled) return;
		e.preventDefault();
		if (crosshairX != null) {
			const t = viewStart + ((crosshairX - plotX) / plotW) * (viewEnd - viewStart);
			liveMessage = describeAt(t);
		} else {
			liveMessage = '';
		}
		schedule();
		fireChange();
	}

	function onPlotBlur() {
		if (crosshairLocked && !pointers.size) {
			crosshairLocked = false;
			crosshairX = null;
			schedule();
		}
	}

	const srSummary = $derived.by(() => {
		const lines: string[] = [];
		for (const s of visibleSeries) {
			const st = stats[s.id];
			if (!st || st.last == null) continue;
			const f = (v: number | null) => joinCwUnit(fmtValue(v, s.decimals ?? 1, locale), s.unit);
			lines.push(l.seriesSummary(s.label, f(st.min), f(st.avg), f(st.max), f(st.last)));
		}
		if (lines.length) lines.push(l.keyboardHint);
		return lines.join(' ');
	});
	const accessibleName = $derived(ariaLabel ?? (title || l.chart));
	const uid = $props.id();

	function onDblClick() {
		viewStart = bounds.lo;
		viewEnd = bounds.hi;
		crosshairLocked = false;
		crosshairX = null;
		schedule();
		fireChange();
	}

	/**
	 * Border-box size of a ResizeObserver entry.
	 *
	 * The layout classes this component applies change its own padding, so the
	 * content box is not a safe thing to measure — see resolveLineChartLayout.
	 * `borderBoxSize` is used where available, falling back to the bounding rect
	 * (which is also a border box) on older engines.
	 */
	function borderBoxOf(entry: ResizeObserverEntry): { width: number; height: number } {
		const box = entry.borderBoxSize?.[0];
		if (box) return { width: box.inlineSize, height: box.blockSize };
		const rect = entry.target.getBoundingClientRect();
		return { width: rect.width, height: rect.height };
	}

	let ro: ResizeObserver | null = null;
	onMount(() => {
		// Measure before the first paint so the layout comes from the real width
		// rather than the unmeasured default, which would render the desktop
		// sidebar and then snap to the phone layout a frame later.
		const rect = rootEl.getBoundingClientRect();
		if (rect.width > 0 && rect.height > 0) {
			containerWidth = rect.width;
			containerHeight = rect.height;
		}

		initView();
		ro = new ResizeObserver((entries) => {
			for (const e of entries) {
				if (e.target === rootEl) {
					const { width, height } = borderBoxOf(e);
					// A zero-size observation means the chart is hidden (display:none,
					// an inactive tab), not that it shrank. Adopting it would fall
					// through to the unmeasured default and swap in the desktop
					// layout, which resizes the element and fires the observer again.
					// Keep the last known size and let the next real measurement win.
					if (width > 0 && height > 0) {
						containerWidth = width;
						containerHeight = height;
					}
				}
			}
			schedule();
		});
		ro.observe(rootEl);
		if (canvasEl) ro.observe(canvasEl);
		schedule();
	});

	onDestroy(() => {
		if (ro) ro.disconnect();
		if (raf != null) cancelAnimationFrame(raf);
		if (zoomHintTimer) clearTimeout(zoomHintTimer);
	});

	const heightCss = $derived(
		typeof height === 'number' ? `${height}px` : (height as string)
	);

	function swatchStyle(s: CwResponsiveLineSeries) {
		return `background: ${s.gradient ? TEMP_GRADIENT_CSS : s.color}`;
	}

	function axisSideFor(id: string): 'left' | 'right' | null {
		const p = axisPlacements.find((x) => x.series.id === id);
		return p?.side ?? null;
	}
</script>

<div
	bind:this={rootEl}
	class="cw-rlc cw-no-data-host cw-rlc--{resolvedLayout} cw-rlc--{resolvedTheme} {isXs
		? 'cw-rlc--xs'
		: ''} {bare ? 'cw-rlc--bare' : ''} {className}"
	class:cw-no-data-host--active={hasNoData}
	data-theme={forcedTheme}
	aria-busy={loading || undefined}
	style="height:{heightCss};"
>
	{#if title || subtitle || ranges.length > 0 || showThemeToggle}
		<div class="cw-rlc__header">
			<div class="cw-rlc__title-wrap">
				{#if title}<div class="cw-rlc__title">{title}</div>{/if}
				{#if subtitle}<div class="cw-rlc__subtitle">{subtitle}</div>{/if}
			</div>
			<div class="cw-rlc__controls">
				{#if ranges.length > 0}
					<div class="cw-rlc__pills" role="group" aria-label={l.rangeGroupAria}>
						{#each ranges as r (r.id)}
							<button
								type="button"
								aria-pressed={activeRange === r.id}
								class="cw-rlc__pill {activeRange === r.id ? 'is-active' : ''}"
								onclick={() => selectRange(r.id)}>{r.label}</button
							>
						{/each}
					</div>
				{/if}
				{#if showThemeToggle && !themeAuto}
					<button
						type="button"
						class="cw-rlc__theme-btn"
						aria-label={l.toggleThemeAria}
						onclick={() => (theme = resolvedTheme === 'dark' ? 'light' : 'dark')}
					>
						{#if resolvedTheme === 'dark'}
							<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<circle cx="12" cy="12" r="4" />
								<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
							</svg>
						{:else}
							<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
							</svg>
						{/if}
					</button>
				{/if}
			</div>
		</div>
	{/if}

	<!-- The plot is a labelled, focusable region: arrow keys move through readings
	     (announced via the live region below), so it takes key handlers. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<div
		class="cw-rlc__plot-wrap"
		role="group"
		aria-label={accessibleName}
		aria-describedby={srSummary ? `${uid}-summary` : undefined}
		tabindex={hasNoData || loading ? undefined : 0}
		onkeydown={onKeydown}
		onblur={onPlotBlur}
	>
		<canvas
			bind:this={canvasEl}
			class="cw-rlc__canvas"
			aria-hidden="true"
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
			onpointerenter={onPointerEnter}
			onpointerleave={onPointerLeave}
			onwheel={onWheel}
			ondblclick={onDblClick}
		></canvas>
		<span bind:this={probeEl} class="cw-rlc__probe" aria-hidden="true"></span>
		<p id="{uid}-summary" class="cw-rlc__sr-only">{srSummary}</p>
		<p class="cw-rlc__sr-only" aria-live="polite">{liveMessage}</p>
		{#if (showAnomalies && hasAnomaliesInView) || hasGapsInView}
			<div class="cw-rlc__plot-hints" aria-hidden="true">
				{#if showAnomalies && hasAnomaliesInView}
					<span class="cw-rlc__hint">
						<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M12 2 L22 21 L2 21 Z" />
							<path d="M12 9 L12 14" />
							<circle cx="12" cy="17.5" r="0.8" fill="currentColor" />
						</svg>
						{l.anomaly}
					</span>
				{/if}
				{#if hasGapsInView}
					<span class="cw-rlc__hint">
						<span class="cw-rlc__hint-hatch"></span>
						{l.dataGap}
					</span>
				{/if}
			</div>
		{/if}
		{#if zoomHintVisible}
			<div class="cw-rlc__zoom-hint" aria-hidden="true">
				{zoomHintText}
			</div>
		{/if}
		{#if loading}
			<div class="cw-rlc__loading" role="status">
				<CwSpinner size="lg" />
				<span>{l.loading}</span>
			</div>
		{/if}
	</div>

	{#if showLegend}
		<div class="cw-rlc__legend">
			<div class="cw-rlc__legend-heading">
				{l.sensorsOnOf(series.length - hidden.length, series.length)}
			</div>
			<div class="cw-rlc__chips">
				{#each series as s (s.id)}
					{@const on = !hidden.includes(s.id)}
					{@const st = stats[s.id]}
					{@const side = axisSideFor(s.id)}
					{@const isLastOn = on && series.length - hidden.length <= 1}
					<button
						type="button"
						class="cw-rlc__chip {on ? 'is-on' : 'is-off'}"
						onclick={() => toggleSeries(s.id)}
						aria-pressed={on}
						disabled={isLastOn}
						title={isLastOn
							? l.lastSensorTitle(s.label)
							: on
								? l.hideSeries(s.label)
								: l.showSeries(s.label)}
						style={on ? `--cw-rlc-chip-accent:${s.color}` : ''}
					>
						<span class="cw-rlc__chip-swatch" style={swatchStyle(s)}></span>
						<span class="cw-rlc__chip-text">
							<span class="cw-rlc__chip-headline">
								<span class="cw-rlc__chip-label">{s.label}</span>
								{#if side}
									<span
										class="cw-rlc__chip-axis"
										title={side === 'left' ? l.axisLeft : l.axisRight}
									>
										<span aria-hidden="true">{side === 'left' ? l.axisLeftShort : l.axisRightShort}</span>
										<span class="cw-rlc__sr-only">{side === 'left' ? l.axisLeft : l.axisRight}</span>
									</span>
								{/if}
							</span>
							{#if showLegendStats}
								<span class="cw-rlc__chip-stats">
									<span><em>{l.statMin}</em>{fmtValue(st?.min, s.decimals ?? 1, locale)}</span>
									<span><em>{l.statAvg}</em>{fmtValue(st?.avg, s.decimals ?? 1, locale)}</span>
									<span><em>{l.statMax}</em>{fmtValue(st?.max, s.decimals ?? 1, locale)}</span>
								</span>
							{/if}
						</span>
						<span class="cw-rlc__chip-last">
							<span class="cw-rlc__chip-last-value">{fmtValue(st?.last, s.decimals ?? 1, locale)}</span>
							{#if s.unit}<span class="cw-rlc__chip-last-unit">{s.unit}</span>{/if}
						</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	{#if hasNoData}
		<CwNoDataOverlay message={noDataMessage} />
	{/if}
</div>

<style>
	.cw-rlc {
		/* Internal aliases onto the shared chart tokens. */
		--cw-rlc-bg: var(--cw-chart-card-bg);
		--cw-rlc-panel: var(--cw-chart-card-cell-bg);
		--cw-rlc-panel-inset: var(--cw-bg-muted);
		--cw-rlc-text: var(--cw-chart-card-title);
		--cw-rlc-subtle: var(--cw-chart-card-muted);
		--cw-rlc-faint: var(--cw-text-muted);
		--cw-rlc-border: var(--cw-chart-card-cell-border);
		--cw-rlc-border-strong: var(--cw-border-strong);
		--cw-rlc-pill-bg-active: var(--cw-accent);
		--cw-rlc-pill-fg-active: var(--cw-text-inverse);
		--cw-rlc-chip-bg: var(--cw-chart-card-cell-bg);
		--cw-rlc-chip-bg-off: transparent;

		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
		width: 100%;
		max-width: 100%;
		min-width: 0;
		padding: var(--cw-space-5);
		box-sizing: border-box;
		background: var(--cw-rlc-bg);
		color: var(--cw-rlc-text);
		font-family: var(--cw-font-family);
		border-radius: var(--cw-radius-2xl);
		border: 1px solid var(--cw-chart-card-border);
		box-shadow: var(--cw-chart-card-shadow);
		min-height: 280px;
		overflow: hidden;
	}
	.cw-rlc--bare {
		background: transparent;
		border: none;
		box-shadow: none;
		padding: 0;
	}

	.cw-rlc__probe {
		display: none;
	}
	.cw-rlc__sr-only {
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

	/* ── Header ─────────────────────────────── */
	.cw-rlc__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-2);
		flex-shrink: 0;
		flex-wrap: wrap;
	}
	.cw-rlc__title-wrap {
		min-width: 0;
		flex: 1 1 0;
	}
	.cw-rlc__title {
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-tight);
		color: var(--cw-rlc-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.cw-rlc__subtitle {
		font-size: var(--cw-text-sm);
		color: var(--cw-rlc-subtle);
		margin-top: 0.125rem;
	}

	.cw-rlc__controls {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		flex-shrink: 0;
	}

	.cw-rlc__pills {
		display: flex;
		background: var(--cw-rlc-panel-inset);
		padding: 2px;
		border-radius: var(--cw-radius-lg);
		border: 1px solid var(--cw-rlc-border);
	}
	.cw-rlc__pill {
		appearance: none;
		background: transparent;
		border: none;
		cursor: pointer;
		min-height: var(--cw-hit-target-min);
		padding: var(--cw-space-1) var(--cw-space-3);
		font: inherit;
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.02em;
		color: var(--cw-rlc-subtle);
		border-radius: var(--cw-radius-md);
		transition:
			background var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}
	.cw-rlc__pill:hover:not(.is-active) {
		color: var(--cw-rlc-text);
	}
	.cw-rlc__pill.is-active {
		background: var(--cw-rlc-pill-bg-active);
		color: var(--cw-rlc-pill-fg-active);
	}

	.cw-rlc__theme-btn {
		appearance: none;
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--cw-radius-lg);
		background: var(--cw-rlc-panel-inset);
		border: 1px solid var(--cw-rlc-border);
		color: var(--cw-rlc-text);
	}

	/* ── Plot ───────────────────────────────── */
	.cw-rlc__plot-wrap {
		position: relative;
		flex: 1 1 auto;
		width: 100%;
		min-width: 0;
		min-height: 160px;
		background: var(--cw-rlc-panel);
		border-radius: var(--cw-radius-xl);
		border: 1px solid var(--cw-rlc-border);
		overflow: hidden;
	}
	.cw-rlc--bare .cw-rlc__plot-wrap {
		background: transparent;
		border-radius: 0;
		border: none;
	}
	.cw-rlc__canvas {
		display: block;
		width: 100%;
		height: 100%;
		/* pan-y lets a one-finger vertical swipe scroll the page so the user
		   never gets trapped in the chart; horizontal drag still pans and a
		   two-finger pinch still zooms. */
		touch-action: pan-y;
		user-select: none;
		cursor: crosshair;
	}
	.cw-rlc__plot-hints {
		position: absolute;
		left: var(--cw-space-3);
		bottom: var(--cw-space-2);
		display: flex;
		gap: var(--cw-space-3);
		align-items: center;
		font-size: var(--cw-chart-tick-size);
		color: var(--cw-rlc-faint);
		font-weight: var(--cw-font-medium);
		pointer-events: none;
	}
	.cw-rlc__hint {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-1);
	}
	.cw-rlc__hint-hatch {
		display: inline-block;
		width: 0.75rem;
		height: 0.625rem;
		border: 1px dashed currentColor;
		background: repeating-linear-gradient(
			135deg,
			currentColor 0 1px,
			transparent 1px 4px
		);
		opacity: 0.8;
	}
	.cw-rlc__zoom-hint {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-gray-50);
		background: var(--cw-scrim);
		pointer-events: none;
		animation: cw-rlc-hint-fade 1.2s var(--cw-ease-default) forwards;
	}
	@keyframes cw-rlc-hint-fade {
		0% {
			opacity: 0;
		}
		15% {
			opacity: 1;
		}
		70% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
	.cw-rlc__loading {
		position: absolute;
		inset: 0;
		z-index: var(--cw-z-inline-overlay);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-2);
		color: var(--cw-rlc-subtle);
		font-size: var(--cw-text-sm);
		background: color-mix(in srgb, var(--cw-rlc-panel) 70%, transparent);
	}

	/* ── Legend ─────────────────────────────── */
	.cw-rlc__legend {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-2);
		flex-shrink: 0;
		min-width: 0;
		width: 100%;
	}

	.cw-rlc__legend-heading {
		font-size: var(--cw-chart-tick-size);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.08em;
		color: var(--cw-rlc-subtle);
		text-transform: uppercase;
	}

	.cw-rlc__chips {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: var(--cw-space-2);
		min-width: 0;
		max-width: 100%;
	}
	.cw-rlc__chip {
		appearance: none;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
		padding: var(--cw-space-1) var(--cw-space-3);
		background: var(--cw-rlc-chip-bg);
		color: var(--cw-rlc-text);
		border: 1px solid var(--cw-rlc-border);
		border-radius: var(--cw-radius-full);
		text-align: left;
		font: inherit;
		transition:
			background var(--cw-duration-fast) var(--cw-ease-default),
			opacity var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default);
		min-height: 2rem;
		max-width: 100%;
	}
	.cw-rlc__chip.is-on {
		border-color: var(--cw-rlc-chip-accent, var(--cw-rlc-border));
		box-shadow: inset 0 0 0 1px var(--cw-rlc-chip-accent, transparent);
	}
	.cw-rlc__chip:disabled {
		cursor: not-allowed;
	}
	.cw-rlc__chip.is-off {
		background: var(--cw-rlc-chip-bg-off);
		opacity: 0.55;
	}
	.cw-rlc__chip.is-off .cw-rlc__chip-label {
		text-decoration: line-through;
	}
	.cw-rlc__chip-swatch {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: var(--cw-radius-sm);
		flex-shrink: 0;
	}
	.cw-rlc__chip.is-off .cw-rlc__chip-swatch {
		box-shadow: inset 0 0 0 1px var(--cw-rlc-border-strong);
	}
	.cw-rlc__chip-text {
		display: flex;
		flex-direction: column;
		gap: 0;
		min-width: 0;
		flex: 0 0 auto;
	}
	.cw-rlc__chip-headline {
		display: flex;
		align-items: baseline;
		gap: var(--cw-space-1);
	}
	.cw-rlc__chip-label {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		white-space: nowrap;
	}
	.cw-rlc__chip-axis {
		font-size: var(--cw-chart-tick-size);
		color: var(--cw-rlc-subtle);
		font-weight: var(--cw-font-bold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 0 0.25rem;
		border: 1px solid var(--cw-rlc-border);
		border-radius: var(--cw-radius-sm);
		line-height: 1.3;
	}
	.cw-rlc__chip-stats {
		display: flex;
		gap: var(--cw-space-2);
		font-family: var(--cw-font-mono);
		font-size: var(--cw-chart-tick-size);
		color: var(--cw-rlc-subtle);
		font-variant-numeric: tabular-nums;
		line-height: 1.2;
	}
	.cw-rlc__chip-stats em {
		font-style: normal;
		color: var(--cw-rlc-faint);
		margin-right: 2px;
	}
	.cw-rlc__chip-last {
		display: inline-flex;
		align-items: baseline;
		gap: 0.1875rem;
		flex-shrink: 0;
		margin-left: 2px;
	}
	.cw-rlc__chip-last-value {
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-rlc-text);
		font-variant-numeric: tabular-nums;
	}
	.cw-rlc__chip-last-unit {
		font-size: var(--cw-chart-tick-size);
		color: var(--cw-rlc-faint);
		font-weight: var(--cw-font-medium);
	}

	.cw-rlc__chip:focus-visible,
	.cw-rlc__pill:focus-visible,
	.cw-rlc__theme-btn:focus-visible,
	.cw-rlc__plot-wrap:focus-visible {
		outline: var(--cw-focus-ring-width) solid var(--cw-focus-ring-color);
		outline-offset: var(--cw-focus-ring-offset);
	}

	/* ─ Class-based progressive scale-down ─
	   Driven by `containerWidth` measured in JS so it's reliable even when
	   children would otherwise force the container wider than the viewport.
	   Text never drops below --cw-chart-tick-size (11px). */
	.cw-rlc--phone,
	.cw-rlc--phone-land {
		padding: var(--cw-space-3);
		gap: var(--cw-space-2);
	}
	.cw-rlc--phone .cw-rlc__title,
	.cw-rlc--phone-land .cw-rlc__title {
		font-size: var(--cw-text-base);
	}
	.cw-rlc--phone .cw-rlc__subtitle,
	.cw-rlc--phone-land .cw-rlc__subtitle {
		font-size: var(--cw-text-xs);
	}
	.cw-rlc--phone .cw-rlc__pill,
	.cw-rlc--phone-land .cw-rlc__pill {
		padding: var(--cw-space-1) var(--cw-space-2);
		font-size: var(--cw-chart-tick-size);
	}
	.cw-rlc--phone .cw-rlc__theme-btn,
	.cw-rlc--phone-land .cw-rlc__theme-btn {
		width: 1.75rem;
		height: 1.75rem;
	}
	.cw-rlc--phone .cw-rlc__chip-stats,
	.cw-rlc--phone-land .cw-rlc__chip-stats {
		display: none;
	}
	.cw-rlc--phone .cw-rlc__chip,
	.cw-rlc--phone-land .cw-rlc__chip {
		padding: 0.125rem var(--cw-space-2);
		min-height: var(--cw-hit-target-min);
		gap: var(--cw-space-1);
	}
	.cw-rlc--phone .cw-rlc__chip-label,
	.cw-rlc--phone-land .cw-rlc__chip-label {
		font-size: var(--cw-chart-tick-size);
		max-width: 110px;
		overflow: hidden;
		text-overflow: ellipsis;
		display: inline-block;
	}
	.cw-rlc--phone .cw-rlc__chip-last-value,
	.cw-rlc--phone-land .cw-rlc__chip-last-value {
		font-size: var(--cw-text-xs);
	}
	.cw-rlc--phone .cw-rlc__chip-swatch,
	.cw-rlc--phone-land .cw-rlc__chip-swatch {
		width: 0.5625rem;
		height: 0.5625rem;
	}
	.cw-rlc--phone .cw-rlc__plot-wrap,
	.cw-rlc--phone-land .cw-rlc__plot-wrap {
		min-height: 140px;
	}

	/* extra-small: < 380px */
	.cw-rlc--xs {
		padding: var(--cw-space-2);
		gap: var(--cw-space-2);
		min-height: 240px;
	}
	.cw-rlc--xs .cw-rlc__title {
		font-size: var(--cw-text-sm);
	}
	.cw-rlc--xs .cw-rlc__chip-label {
		max-width: 86px;
	}
	.cw-rlc--xs .cw-rlc__plot-wrap {
		min-height: 120px;
	}

	/* Bare mode never pads, whatever the layout class. */
	.cw-rlc.cw-rlc--bare {
		padding: 0;
	}
</style>
