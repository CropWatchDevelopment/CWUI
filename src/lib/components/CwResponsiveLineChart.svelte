<!--
  CwResponsiveLineChart — high-performance Canvas2D multi-series time chart
  for sensor telemetry. Touch-first (pan, pinch, tap-lock), dual Y-axes,
  optional value-mapped temperature gradient, light/dark theming, threshold
  lines, anomaly markers, explicit data-gap bands, and a responsive shell
  with legend chips and range pills.

  Ported from the Claude Design "phone-tablet-desktop-line-chart" handoff.
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

	const TEMP_STOPS: { v: number; c: [number, number, number] }[] = [
		{ v: -10, c: [12, 12, 16] },
		{ v: -2, c: [37, 99, 235] },
		{ v: 8, c: [14, 165, 233] },
		{ v: 18, c: [16, 185, 129] },
		{ v: 26, c: [245, 158, 11] },
		{ v: 34, c: [239, 68, 68] },
		{ v: 42, c: [160, 25, 30] }
	];

	function tempColor(v: number | null): string {
		if (v == null || Number.isNaN(v)) return 'rgb(120,120,120)';
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

	interface ChartTheme {
		bg: string;
		panel: string;
		panelInset: string;
		text: string;
		subtle: string;
		faint: string;
		border: string;
		borderStrong: string;
		grid: string;
		gridStrong: string;
		threshold: string;
		crosshair: string;
		crosshairLocked: string;
		gap: string;
		tooltipBg: string;
		tooltipBorder: string;
		anomalyRing: string;
		pillBg: string;
		pillBgActive: string;
		pillFgActive: string;
		chipBg: string;
		chipBgOff: string;
	}

	const THEMES: Record<CwResponsiveLineTheme, ChartTheme> = {
		light: {
			bg: '#fafaf7',
			panel: '#ffffff',
			panelInset: '#f4f3ee',
			text: '#1a1a17',
			subtle: '#6e6b65',
			faint: '#a8a59f',
			border: 'rgba(20,20,18,0.08)',
			borderStrong: 'rgba(20,20,18,0.14)',
			grid: 'rgba(20,20,18,0.06)',
			gridStrong: 'rgba(20,20,18,0.12)',
			threshold: 'rgba(20,20,18,0.25)',
			crosshair: 'rgba(20,20,18,0.5)',
			crosshairLocked: 'rgba(20,20,18,0.85)',
			gap: 'rgba(20,20,18,0.04)',
			tooltipBg: 'rgba(255,255,255,0.96)',
			tooltipBorder: 'rgba(20,20,18,0.08)',
			anomalyRing: '#fafaf7',
			pillBg: '#ffffff',
			pillBgActive: '#1a1a17',
			pillFgActive: '#fafaf7',
			chipBg: '#ffffff',
			chipBgOff: 'transparent'
		},
		dark: {
			bg: '#0e0e0c',
			panel: '#18181a',
			panelInset: '#222224',
			text: '#f0eee9',
			subtle: '#98948e',
			faint: '#5a5650',
			border: 'rgba(240,238,233,0.10)',
			borderStrong: 'rgba(240,238,233,0.18)',
			grid: 'rgba(240,238,233,0.05)',
			gridStrong: 'rgba(240,238,233,0.10)',
			threshold: 'rgba(240,238,233,0.22)',
			crosshair: 'rgba(240,238,233,0.45)',
			crosshairLocked: 'rgba(240,238,233,0.9)',
			gap: 'rgba(240,238,233,0.05)',
			tooltipBg: 'rgba(24,24,26,0.96)',
			tooltipBorder: 'rgba(240,238,233,0.10)',
			anomalyRing: '#0e0e0c',
			pillBg: '#222224',
			pillBgActive: '#f0eee9',
			pillFgActive: '#0e0e0c',
			chipBg: '#222224',
			chipBgOff: 'transparent'
		}
	};

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

	function fmtTime(ms: number, mode: 'time' | 'date') {
		const d = new Date(ms);
		if (mode === 'date') {
			return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
		}
		return d
			.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
			.replace(' ', '');
	}

	function fmtCrosshairTime(ms: number) {
		const d = new Date(ms);
		const date = d.toLocaleDateString(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
		const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
		return `${date} · ${time}`;
	}

	function fmtValue(v: number | null | undefined, decimals = 1) {
		if (v == null || Number.isNaN(v)) return '—';
		return v.toFixed(decimals);
	}

	function nearestIdx(data: CwResponsiveLineDataPoint[], t: number) {
		if (!data.length) return -1;
		let lo = 0;
		let hi = data.length - 1;
		while (lo < hi) {
			const mid = (lo + hi) >> 1;
			if (data[mid].t < t) lo = mid + 1;
			else hi = mid;
		}
		if (lo > 0 && Math.abs(data[lo - 1].t - t) < Math.abs(data[lo].t - t)) return lo - 1;
		return lo;
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

	function formatTick(v: number, step: number) {
		if (step >= 1) return Math.round(v).toString();
		if (step >= 0.1) return v.toFixed(1);
		return v.toFixed(2);
	}

	const DEFAULT_RANGES: CwResponsiveLineRangePreset[] = [
		{ id: '1h', label: '1H', ms: 60 * 60 * 1000 },
		{ id: '24h', label: '24H', ms: 24 * 60 * 60 * 1000 },
		{ id: '7d', label: '7D', ms: 7 * 24 * 60 * 60 * 1000 }
	];
</script>

<script lang="ts">
	import { onMount, onDestroy, untrack } from 'svelte';
	import CwNoDataOverlay from './CwNoDataOverlay.svelte';
	import { getCwNoDataMessage, hasCwNoData } from './cwNoData.js';

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
		/** Initial theme. */
		theme?: CwResponsiveLineTheme;
		/** Track the OS color-scheme preference. Overrides `theme` while active. */
		themeAuto?: boolean;
		/** Show / hide the built-in theme toggle button. */
		showThemeToggle?: boolean;
		/** Range preset shortcuts. Set to `[]` to hide. */
		ranges?: CwResponsiveLineRangePreset[];
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
		theme = $bindable<CwResponsiveLineTheme>('light'),
		themeAuto = false,
		showThemeToggle = true,
		ranges = DEFAULT_RANGES,
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

	const series = $derived(seriesInput ?? []);
	const hasNoData = $derived(hasCwNoData(noData));
	const noDataMessage = $derived(getCwNoDataMessage(noData));

	let rootEl: HTMLDivElement;
	let canvasEl: HTMLCanvasElement;
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

	let resolvedLayout: CwResponsiveLineLayout = $derived.by(() => {
		if (layout !== 'auto') return layout;
		const w = containerWidth || 1024;
		if (w < 520) return 'phone';
		if (w < 820) return 'tablet';
		if (w < 1100) return 'tablet-land';
		return 'desktop';
	});
	let compact = $derived(resolvedLayout === 'phone' || resolvedLayout === 'phone-land');
	let sidebar = $derived(resolvedLayout === 'desktop' || resolvedLayout === 'tablet-land');

	let themePalette = $derived<ChartTheme>(THEMES[theme] ?? THEMES.light);

	$effect(() => {
		if (!themeAuto || typeof window === 'undefined' || !window.matchMedia) return;
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const apply = () => {
			theme = mq.matches ? 'dark' : 'light';
		};
		apply();
		mq.addEventListener('change', apply);
		return () => mq.removeEventListener('change', apply);
	});

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

	function fireChange() {
		onchange?.({
			viewStart,
			viewEnd,
			hidden: [...hidden],
			legendStats: legendStats()
		});
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
		return niceY(lo - pad, hi + pad, targetTicks ?? (compact ? 4 : 5));
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
			raf = requestAnimationFrame(() => {
				raf = null;
				draw();
			});
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
		const T = themePalette;
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
		const tickFontPx = veryNarrow ? 8.5 : narrow ? 9 : compact ? 10 : 11;
		const timeFontPx = veryNarrow ? 9 : narrow ? 9.5 : compact ? 10 : 11;
		const thresholdFontPx = veryNarrow ? 8 : narrow ? 8.5 : compact ? 9 : 10;
		const unitFontPx = veryNarrow ? 8 : narrow ? 8.5 : compact ? 9 : 10;

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
			ctx.fillStyle = T.gap;
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
		ctx.font = `500 ${timeFontPx}px Geist, system-ui, sans-serif`;
		ctx.textBaseline = 'top';
		ctx.textAlign = 'center';
		for (const t of timeTicks) {
			ctx.fillText(fmtTime(t, timeMode), xS(t), plot.y + plot.h + 4);
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
				const item: TickLabel = { y, naturalY: y, text: formatTick(v, range.step), color: col };
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
		ctx.font = `500 ${tickFontPx}px "Geist Mono", ui-monospace, monospace`;
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
				ctx.font = `700 ${unitFontPx}px Geist, system-ui, sans-serif`;
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
					ctx.font = `500 ${thresholdFontPx}px Geist, system-ui, sans-serif`;
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
			let i0 = nearestIdx(data, viewStart);
			let i1 = nearestIdx(data, viewEnd);
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
						ctx.strokeStyle = T.threshold;
						ctx.setLineDash([2, 3]);
						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.moveTo(Math.round((x0 + x1) / 2) + 0.5, plot.y);
						ctx.lineTo(Math.round((x0 + x1) / 2) + 0.5, plot.y + plot.h);
						ctx.stroke();
						ctx.restore();
						ctx.fillStyle = T.subtle;
						ctx.font = `500 ${thresholdFontPx}px Geist, system-ui, sans-serif`;
						ctx.textAlign = 'center';
						ctx.textBaseline = 'top';
						if (x1 - x0 > 36) ctx.fillText('no signal', (x0 + x1) / 2, plot.y + 4);
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
				const anoms = anomalyPoints(s.data, viewStart, viewEnd);
				for (const p of anoms) {
					const x = xS(p.t);
					const y = yS(p.v as number);
					ctx.beginPath();
					ctx.fillStyle = T.anomalyRing;
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
			for (const s of visibleSeries) {
				const idx = nearestIdx(s.data, t);
				const dp = s.data[idx];
				if (!dp || dp.v == null) continue;
				const range = rangeByPlacement.get(s.id);
				if (!range) continue;
				const yS = (v: number) =>
					plot.y + plot.h - ((v - range.lo) / (range.hi - range.lo || 1)) * plot.h;
				const px2 = xS(dp.t);
				const py = yS(dp.v as number);
				const col = s.gradient ? tempColor(dp.v) : s.color;
				ctx.beginPath();
				ctx.fillStyle = T.anomalyRing;
				ctx.arc(px2, py, 5, 0, TAU);
				ctx.fill();
				ctx.beginPath();
				ctx.fillStyle = col;
				ctx.arc(px2, py, 3.2, 0, TAU);
				ctx.fill();
				readouts.push({ s, p: dp, col });
			}

			// tooltip
			const ttFontPx = veryNarrow ? 9 : narrow ? 10 : compact ? 10 : 11;
			const padX = veryNarrow ? 7 : narrow ? 8 : 10;
			const padY = veryNarrow ? 6 : narrow ? 7 : 8;
			const lh = veryNarrow ? 12 : compact ? 14 : 16;
			const titleFont = `600 ${ttFontPx}px Geist, system-ui, sans-serif`;
			const labelFont = `500 ${ttFontPx}px Geist, system-ui, sans-serif`;
			const valFont = `600 ${ttFontPx}px "Geist Mono", ui-monospace, monospace`;

			ctx.font = titleFont;
			const titleText = fmtCrosshairTime(t);
			let w = ctx.measureText(titleText).width;
			for (const r of readouts) {
				ctx.font = labelFont;
				const lw = ctx.measureText(r.s.label).width;
				ctx.font = valFont;
				const val = fmtValue(r.p.v, r.s.decimals ?? 1) + (r.s.unit ? ' ' + r.s.unit : '');
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
			ctx.shadowColor = theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)';
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

			ctx.fillStyle = T.text;
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
				ctx.fillStyle = T.subtle;
				ctx.font = labelFont;
				ctx.textBaseline = 'top';
				ctx.textAlign = 'left';
				ctx.fillText(r.s.label, x + padX + 12, ry);
				ctx.fillStyle = T.text;
				ctx.font = valFont;
				ctx.textAlign = 'right';
				const val = fmtValue(r.p.v, r.s.decimals ?? 1) + (r.s.unit ? ' ' + r.s.unit : '');
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
		void themePalette;
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
			flashZoomHint();
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

	function onDblClick() {
		viewStart = bounds.lo;
		viewEnd = bounds.hi;
		crosshairLocked = false;
		crosshairX = null;
		schedule();
		fireChange();
	}

	let ro: ResizeObserver | null = null;
	onMount(() => {
		initView();
		ro = new ResizeObserver((entries) => {
			for (const e of entries) {
				if (e.target === rootEl) {
					containerWidth = e.contentRect.width;
					containerHeight = e.contentRect.height;
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
		if (s.gradient) {
			return 'background: linear-gradient(90deg, #0c0c10 0%, #2563eb 20%, #10b981 48%, #f59e0b 76%, #ef4444 100%)';
		}
		return `background: ${s.color}`;
	}

	function axisSideFor(id: string): 'left' | 'right' | null {
		const p = axisPlacements.find((x) => x.series.id === id);
		return p?.side ?? null;
	}
</script>

<div
	bind:this={rootEl}
	class="cw-rlc cw-no-data-host cw-rlc--{resolvedLayout} cw-rlc--{theme} {containerWidth > 0 && containerWidth < 380 ? 'cw-rlc--xs' : ''} {bare ? 'cw-rlc--bare' : ''} {className}"
	class:cw-no-data-host--active={hasNoData}
	style="--cw-rlc-bg:{themePalette.bg};
		--cw-rlc-panel:{themePalette.panel};
		--cw-rlc-panel-inset:{themePalette.panelInset};
		--cw-rlc-text:{themePalette.text};
		--cw-rlc-subtle:{themePalette.subtle};
		--cw-rlc-faint:{themePalette.faint};
		--cw-rlc-border:{themePalette.border};
		--cw-rlc-border-strong:{themePalette.borderStrong};
		--cw-rlc-pill-bg:{themePalette.pillBg};
		--cw-rlc-pill-bg-active:{themePalette.pillBgActive};
		--cw-rlc-pill-fg-active:{themePalette.pillFgActive};
		--cw-rlc-chip-bg:{themePalette.chipBg};
		--cw-rlc-chip-bg-off:{themePalette.chipBgOff};
		height:{heightCss};"
>
	<div class="cw-rlc__header">
		<div class="cw-rlc__title-wrap">
			{#if title}<div class="cw-rlc__title">{title}</div>{/if}
			{#if subtitle}<div class="cw-rlc__subtitle">{subtitle}</div>{/if}
		</div>
		<div class="cw-rlc__controls">
			{#if ranges.length > 0}
				<div class="cw-rlc__pills" role="tablist" aria-label="Time range">
					{#each ranges as r (r.id)}
						<button
							type="button"
							role="tab"
							aria-selected={activeRange === r.id}
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
					aria-label="Toggle theme"
					onclick={() => (theme = theme === 'dark' ? 'light' : 'dark')}
				>
					{#if theme === 'dark'}
						<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="4" />
							<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
						</svg>
					{:else}
						<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
						</svg>
					{/if}
				</button>
			{/if}
		</div>
	</div>

	<div class="cw-rlc__plot-wrap">
		<canvas
			bind:this={canvasEl}
			class="cw-rlc__canvas"
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
			onwheel={onWheel}
			ondblclick={onDblClick}
		></canvas>
		<div class="cw-rlc__plot-hints" aria-hidden="true">
			<span class="cw-rlc__hint">
				<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 2 L22 21 L2 21 Z" />
					<path d="M12 9 L12 14" />
					<circle cx="12" cy="17.5" r="0.8" fill="currentColor" />
				</svg>
				anomaly
			</span>
			<span class="cw-rlc__hint">
				<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
					<path d="M3 12 L8 12" />
					<path d="M16 12 L21 12" />
					<path d="M11 8 L11 16 M13 8 L13 16" />
				</svg>
				data gap
			</span>
		</div>
		{#if zoomHintVisible}
			<div class="cw-rlc__zoom-hint" aria-hidden="true">
				Hold <kbd>Ctrl</kbd> + scroll to zoom
			</div>
		{/if}
	</div>

	{#if showLegend}
		<div class="cw-rlc__legend">
			<div class="cw-rlc__legend-heading">
				Sensors · {series.length - hidden.length} of {series.length} on
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
							? `${s.label} — at least one sensor must stay visible`
							: on
								? `Hide ${s.label}`
								: `Show ${s.label}`}
						style={on && !s.gradient ? `--cw-rlc-chip-accent:${s.color}` : ''}
					>
						<span class="cw-rlc__chip-swatch" style={swatchStyle(s)}></span>
						<span class="cw-rlc__chip-text">
							<span class="cw-rlc__chip-headline">
								<span class="cw-rlc__chip-label">{s.label}</span>
								{#if side}<span class="cw-rlc__chip-axis">{side === 'left' ? 'L' : 'R'}</span>{/if}
							</span>
							{#if showLegendStats}
								<span class="cw-rlc__chip-stats">
									<span><em>min</em>{fmtValue(st?.min, s.decimals ?? 1)}</span>
									<span><em>avg</em>{fmtValue(st?.avg, s.decimals ?? 1)}</span>
									<span><em>max</em>{fmtValue(st?.max, s.decimals ?? 1)}</span>
								</span>
							{/if}
						</span>
						<span class="cw-rlc__chip-last">
							<span class="cw-rlc__chip-last-value">{fmtValue(st?.last, s.decimals ?? 1)}</span>
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
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
		max-width: 100%;
		min-width: 0;
		padding: 16px;
		box-sizing: border-box;
		background: var(--cw-rlc-bg);
		color: var(--cw-rlc-text);
		font-family: Geist, 'Geist Fallback', system-ui, -apple-system, 'Segoe UI', sans-serif;
		border-radius: 12px;
		border: 1px solid var(--cw-rlc-border);
		min-height: 280px;
		overflow: hidden;
	}
	.cw-rlc--bare {
		background: transparent;
		border: none;
		padding: 0;
	}
	.cw-rlc--phone,
	.cw-rlc--phone-land {
		padding: 6px;
		gap: 6px;
	}

	.cw-rlc__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		flex-shrink: 0;
		flex-wrap: wrap;
	}
	.cw-rlc__title-wrap {
		min-width: 0;
		flex: 1 1 0;
	}
	.cw-rlc__title {
		font-size: 16px;
		font-weight: 600;
		letter-spacing: -0.015em;
		color: var(--cw-rlc-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.cw-rlc__subtitle {
		font-size: 11px;
		color: var(--cw-rlc-subtle);
		margin-top: 1px;
	}
	.cw-rlc--phone .cw-rlc__title,
	.cw-rlc--phone-land .cw-rlc__title {
		font-size: 14px;
	}
	.cw-rlc--phone .cw-rlc__subtitle,
	.cw-rlc--phone-land .cw-rlc__subtitle {
		font-size: 10px;
	}

	.cw-rlc__controls {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.cw-rlc__pills {
		display: flex;
		background: var(--cw-rlc-panel-inset);
		padding: 2px;
		border-radius: 8px;
		border: 1px solid var(--cw-rlc-border);
	}
	.cw-rlc__pill {
		appearance: none;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 5px 12px;
		font: inherit;
		font-size: 11.5px;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--cw-rlc-subtle);
		border-radius: 6px;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.cw-rlc__pill.is-active {
		background: var(--cw-rlc-pill-bg-active);
		color: var(--cw-rlc-pill-fg-active);
	}
	.cw-rlc--phone .cw-rlc__pill,
	.cw-rlc--phone-land .cw-rlc__pill {
		padding: 4px 10px;
		font-size: 10.5px;
	}

	.cw-rlc__theme-btn {
		appearance: none;
		cursor: pointer;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: var(--cw-rlc-panel-inset);
		border: 1px solid var(--cw-rlc-border);
		color: var(--cw-rlc-text);
	}
	.cw-rlc--phone .cw-rlc__theme-btn,
	.cw-rlc--phone-land .cw-rlc__theme-btn {
		width: 28px;
		height: 28px;
	}

	.cw-rlc__plot-wrap {
		position: relative;
		flex: 1 1 auto;
		width: 100%;
		min-width: 0;
		min-height: 160px;
		background: var(--cw-rlc-panel);
		border-radius: 12px;
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
		left: 12px;
		bottom: 8px;
		display: flex;
		gap: 10px;
		align-items: center;
		font-size: 9.5px;
		color: var(--cw-rlc-faint);
		font-weight: 500;
		pointer-events: none;
	}
	.cw-rlc__hint {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.cw-rlc__zoom-hint {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 600;
		color: #fff;
		background: rgba(0, 0, 0, 0.45);
		pointer-events: none;
		animation: cw-rlc-hint-fade 1.2s ease forwards;
	}
	.cw-rlc__zoom-hint kbd {
		font: inherit;
		padding: 1px 6px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.22);
		border: 1px solid rgba(255, 255, 255, 0.35);
	}
	@keyframes cw-rlc-hint-fade {
		0% { opacity: 0; }
		15% { opacity: 1; }
		70% { opacity: 1; }
		100% { opacity: 0; }
	}
	.cw-rlc__legend {
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex-shrink: 0;
		min-width: 0;
		width: 100%;
	}

	.cw-rlc__legend-heading {
		font-size: 9.5px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--cw-rlc-subtle);
		text-transform: uppercase;
	}

	.cw-rlc__chips {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 6px;
		min-width: 0;
		max-width: 100%;
	}
	.cw-rlc__chip {
		appearance: none;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		background: var(--cw-rlc-chip-bg);
		color: var(--cw-rlc-text);
		border: 1px solid var(--cw-rlc-border);
		border-radius: 999px;
		text-align: left;
		font: inherit;
		transition:
			background 0.15s,
			opacity 0.15s,
			border-color 0.15s,
			box-shadow 0.15s;
		min-height: 32px;
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
		opacity: 0.45;
	}
	/* ─ Class-based progressive scale-down ─
	   Driven by `containerWidth` measured in JS so it's reliable even when
	   children would otherwise force the container wider than the viewport. */
	.cw-rlc--phone,
	.cw-rlc--phone-land {
		padding: 6px;
		gap: 6px;
	}
	.cw-rlc--phone .cw-rlc__title,
	.cw-rlc--phone-land .cw-rlc__title {
		font-size: 13px;
	}
	.cw-rlc--phone .cw-rlc__subtitle,
	.cw-rlc--phone-land .cw-rlc__subtitle {
		font-size: 10px;
	}
	.cw-rlc--phone .cw-rlc__pill,
	.cw-rlc--phone-land .cw-rlc__pill {
		padding: 3px 8px;
		font-size: 10.5px;
	}
	.cw-rlc--phone .cw-rlc__theme-btn,
	.cw-rlc--phone-land .cw-rlc__theme-btn {
		width: 28px;
		height: 28px;
	}
	.cw-rlc--phone .cw-rlc__chip-stats,
	.cw-rlc--phone-land .cw-rlc__chip-stats {
		display: none;
	}
	.cw-rlc--phone .cw-rlc__chip,
	.cw-rlc--phone-land .cw-rlc__chip {
		padding: 3px 8px;
		min-height: 24px;
		gap: 5px;
		max-width: 100%;
	}
	.cw-rlc--phone .cw-rlc__chip-label,
	.cw-rlc--phone-land .cw-rlc__chip-label {
		font-size: 10.5px;
		max-width: 110px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: inline-block;
	}
	.cw-rlc--phone .cw-rlc__chip-last-value,
	.cw-rlc--phone-land .cw-rlc__chip-last-value {
		font-size: 11.5px;
	}
	.cw-rlc--phone .cw-rlc__chip-last-unit,
	.cw-rlc--phone-land .cw-rlc__chip-last-unit {
		font-size: 8px;
	}
	.cw-rlc--phone .cw-rlc__chip-swatch,
	.cw-rlc--phone-land .cw-rlc__chip-swatch {
		width: 9px;
		height: 9px;
	}
	.cw-rlc--phone .cw-rlc__chip-axis,
	.cw-rlc--phone-land .cw-rlc__chip-axis {
		font-size: 7.5px;
		padding: 0 3px;
	}
	.cw-rlc--phone .cw-rlc__legend-heading,
	.cw-rlc--phone-land .cw-rlc__legend-heading {
		font-size: 9px;
	}
	.cw-rlc--phone .cw-rlc__plot-wrap,
	.cw-rlc--phone-land .cw-rlc__plot-wrap {
		min-height: 140px;
	}

	/* extra-small: < 380px */
	.cw-rlc--xs {
		padding: 4px;
		gap: 5px;
		min-height: 240px;
	}
	.cw-rlc--xs .cw-rlc__title {
		font-size: 12px;
	}
	.cw-rlc--xs .cw-rlc__subtitle {
		font-size: 9.5px;
	}
	.cw-rlc--xs .cw-rlc__pill {
		padding: 3px 7px;
		font-size: 10px;
	}
	.cw-rlc--xs .cw-rlc__theme-btn {
		width: 26px;
		height: 26px;
	}
	.cw-rlc--xs .cw-rlc__chip {
		padding: 3px 7px;
		min-height: 22px;
		gap: 4px;
	}
	.cw-rlc--xs .cw-rlc__chip-label {
		font-size: 10px;
		max-width: 86px;
	}
	.cw-rlc--xs .cw-rlc__chip-last-value {
		font-size: 11px;
	}
	.cw-rlc--xs .cw-rlc__chip-last-unit {
		font-size: 7.5px;
	}
	.cw-rlc--xs .cw-rlc__chip-swatch {
		width: 8px;
		height: 8px;
	}
	.cw-rlc--xs .cw-rlc__plot-wrap {
		min-height: 120px;
	}
	.cw-rlc__chip-swatch {
		width: 12px;
		height: 12px;
		border-radius: 3px;
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
		gap: 5px;
	}
	.cw-rlc__chip-label {
		font-size: 12px;
		font-weight: 600;
		letter-spacing: -0.005em;
		white-space: nowrap;
	}
	.cw-rlc__chip-axis {
		font-size: 8.5px;
		color: var(--cw-rlc-subtle);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 0 4px;
		border: 1px solid var(--cw-rlc-border);
		border-radius: 3px;
		line-height: 1.3;
	}
	.cw-rlc__chip-stats {
		display: flex;
		gap: 8px;
		font-family: 'Geist Mono', ui-monospace, monospace;
		font-size: 9.5px;
		color: var(--cw-rlc-subtle);
		font-variant-numeric: tabular-nums;
		line-height: 1.1;
	}
	.cw-rlc__chip-stats em {
		font-style: normal;
		color: var(--cw-rlc-faint);
		margin-right: 2px;
	}
	.cw-rlc__chip-last {
		display: inline-flex;
		align-items: baseline;
		gap: 3px;
		flex-shrink: 0;
		margin-left: 2px;
	}
	.cw-rlc__chip-last-value {
		font-family: 'Geist Mono', ui-monospace, monospace;
		font-size: 13px;
		font-weight: 600;
		color: var(--cw-rlc-text);
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.01em;
	}
	.cw-rlc__chip-last-unit {
		font-size: 9px;
		color: var(--cw-rlc-faint);
		font-weight: 500;
	}

	.cw-rlc__chip:focus-visible,
	.cw-rlc__pill:focus-visible,
	.cw-rlc__theme-btn:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
</style>
