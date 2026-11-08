/**
 * Data model and pure logic for `CwAboveBelowChart`: the summary of each
 * reading (now, low, average, high), its status against a growing target,
 * and where the marks sit on its range bar.
 *
 * Kept out of the component so apps can push raw readings in and so the
 * maths is unit-tested.
 */
import { formatCwNumber, isCwFiniteNumber, joinCwUnit } from '../utils/cwFormat.js';
import { metricColor, normalizeMetric } from '../utils/metricColors.js';

/**
 * One reading: a bare number, or a point with a time. Points may come in any
 * order; `null`, `undefined` and non-finite values are skipped.
 */
export type CwAboveBelowPoint =
	| number
	| null
	| undefined
	| { t?: number | string | Date | null; v: number | null | undefined };

/**
 * A growing target. The optimal bounds draw the band on the bar and decide
 * "Optimal"; `min` / `max` are stress limits ("Too low" / "Too high").
 * Any bound may be missing.
 */
export interface CwAboveBelowTarget {
	min?: number | null;
	optimalMin?: number | null;
	optimalMax?: number | null;
	max?: number | null;
}

/** Built-in icons; `metric.icon` overrides the one picked from `metric.key`. */
export type CwAboveBelowIcon =
	| 'thermometer'
	| 'humidity'
	| 'co2'
	| 'moisture'
	| 'ec'
	| 'ph'
	| 'vpd'
	| 'light'
	| 'generic';

/** One reading on the air or ground layer. */
export interface CwAboveBelowMetric {
	/**
	 * Stable id. A CropWatch metric key (`air_temperature`, `air_humidity`,
	 * `co2`, `soil_temperature`, `soil_moisture`, `soil_ec`, `soil_ph`, `vpd`)
	 * also picks the metric's colour and icon.
	 */
	key: string;
	/** Display name, already translated ("Air temperature" / "気温"). */
	label: string;
	/** Unit shown after the current value ("°C", "%", "ppm", "mS/cm"). */
	unit?: string;
	/** The readings for the selected range; Low / Avg / High come from these. */
	data?: readonly CwAboveBelowPoint[];
	/** The newest value. Defaults to the newest reading in `data`. */
	current?: number | null;
	/** Pre-computed figures that replace the ones worked out from `data`. */
	stats?: { min?: number | null; avg?: number | null; max?: number | null } | null;
	/** Fraction digits for the figures (default 1). */
	decimals?: number;
	/** Growing target: drawn as a band on the bar and judged. */
	target?: CwAboveBelowTarget | null;
	/**
	 * Text in place of the target line, never judged or drawn — for example a
	 * lab-test reference ("0.2–0.5 mS/cm (lab test, 1:5)") or "Daytime only".
	 */
	note?: string | null;
	/** Overrides the metric colour (any CSS colour). */
	color?: string;
	/** Overrides the icon picked from `key`. */
	icon?: CwAboveBelowIcon;
}

/** The light strip above the air layer. */
export interface CwAboveBelowLight {
	/** PPFD readings in any order: the newest is "now" and the highest is the peak. */
	data?: readonly CwAboveBelowPoint[];
	/** PPFD now. Defaults to the newest reading in `data`. */
	current?: number | null;
	/** Peak PPFD. Defaults to the highest reading in `data`. */
	peak?: number | null;
	/** Daily light integral so far today. */
	dli?: number | null;
	/** The daily light goal. */
	dliTarget?: { min?: number | null; max?: number | null } | null;
	/** PPFD unit (default "µmol/m²/s"). */
	ppfdUnit?: string;
	/** Unit of the DLI so far (default "mol/m²"). */
	dliUnit?: string;
	/** Unit of the daily goal (default "mol/m²/day"). */
	dliTargetUnit?: string;
}

/** Where the current value sits against the target. */
export type CwAboveBelowStatus = 'too_low' | 'low' | 'optimal' | 'high' | 'too_high';

/** A reading's summary for the selected range. */
export interface CwAboveBelowSummary {
	current: number | null;
	min: number | null;
	avg: number | null;
	max: number | null;
	/** Readings with a value. */
	count: number;
}

/** Positions on the range bar, in percent of its width (0–100). */
export interface CwAboveBelowBar {
	/** The readings' low-to-high span. */
	span: { left: number; width: number } | null;
	avg: number | null;
	now: number | null;
	/** The target's optimal band. */
	band: { left: number; width: number } | null;
}

function valueOf(point: CwAboveBelowPoint): number | null {
	const value = point !== null && typeof point === 'object' ? point.v : point;
	return isCwFiniteNumber(value) ? value : null;
}

function timeOf(point: CwAboveBelowPoint): number | null {
	if (point === null || typeof point !== 'object') return null;
	const { t } = point;
	if (t instanceof Date) return Number.isFinite(t.getTime()) ? t.getTime() : null;
	if (typeof t === 'number') return Number.isFinite(t) ? t : null;
	if (typeof t === 'string') {
		const ms = Date.parse(t);
		return Number.isFinite(ms) ? ms : null;
	}
	return null;
}

function finiteOrNull(value: number | null | undefined): number | null {
	return isCwFiniteNumber(value) ? value : null;
}

/**
 * Now, low, average and high of a set of readings. "Now" is the reading with
 * the latest time, or the last one when the readings carry no time; an
 * explicit `current` or `stats` value wins over the computed one.
 */
export function summarizeCwReadings(
	data: readonly CwAboveBelowPoint[] = [],
	overrides: Pick<CwAboveBelowMetric, 'current' | 'stats'> = {}
): CwAboveBelowSummary {
	let min: number | null = null;
	let max: number | null = null;
	let sum = 0;
	let count = 0;
	let last: number | null = null;
	let newest: number | null = null;
	let newestTime = Number.NEGATIVE_INFINITY;

	for (const point of data) {
		const value = valueOf(point);
		if (value === null) continue;
		count += 1;
		sum += value;
		min = min === null ? value : Math.min(min, value);
		max = max === null ? value : Math.max(max, value);
		last = value;
		const time = timeOf(point);
		if (time !== null && time >= newestTime) {
			newestTime = time;
			newest = value;
		}
	}

	return {
		current: finiteOrNull(overrides.current) ?? newest ?? last,
		min: finiteOrNull(overrides.stats?.min) ?? min,
		avg: finiteOrNull(overrides.stats?.avg) ?? (count > 0 ? sum / count : null),
		max: finiteOrNull(overrides.stats?.max) ?? max,
		count
	};
}

/** True when a summary has nothing to show. */
export function isCwSummaryEmpty(summary: CwAboveBelowSummary): boolean {
	return (
		summary.current === null && summary.min === null && summary.avg === null && summary.max === null
	);
}

/**
 * Judges a value against a target: past a stress limit is "too low" / "too
 * high", outside the optimal band "low" / "high", inside it "optimal". Null
 * without a value or without any optimal bound.
 */
export function judgeCwReading(
	value: number | null | undefined,
	target: CwAboveBelowTarget | null | undefined
): CwAboveBelowStatus | null {
	if (!isCwFiniteNumber(value) || !target) return null;
	const min = finiteOrNull(target.min);
	const max = finiteOrNull(target.max);
	const optimalMin = finiteOrNull(target.optimalMin);
	const optimalMax = finiteOrNull(target.optimalMax);
	if (min !== null && value < min) return 'too_low';
	if (max !== null && value > max) return 'too_high';
	if (optimalMin !== null && value < optimalMin) return 'low';
	if (optimalMax !== null && value > optimalMax) return 'high';
	if (optimalMin === null && optimalMax === null) return null;
	return 'optimal';
}

/** The chip tone for a status: in band, outside it, or past a stress limit. */
export function cwAboveBelowStatusTone(status: CwAboveBelowStatus): 'success' | 'warning' | 'danger' {
	if (status === 'optimal') return 'success';
	return status === 'too_low' || status === 'too_high' ? 'danger' : 'warning';
}

const round = (value: number) => Math.round(value * 100) / 100;
const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

/**
 * Lays out the range bar. The scale covers the readings, the current value
 * and the optimal band, plus 8 % either side, so every mark is visible; an
 * open-ended band runs to the edge of the scale.
 */
export function cwAboveBelowBar(
	summary: CwAboveBelowSummary,
	target?: CwAboveBelowTarget | null
): CwAboveBelowBar | null {
	const bandLow = finiteOrNull(target?.optimalMin);
	const bandHigh = finiteOrNull(target?.optimalMax);
	const marks = [summary.min, summary.max, summary.avg, summary.current].filter(
		(value): value is number => value !== null
	);
	if (marks.length === 0) return null;

	const bounds = [...marks, ...[bandLow, bandHigh].filter((value): value is number => value !== null)];
	let low = Math.min(...bounds);
	let high = Math.max(...bounds);
	const pad = high > low ? (high - low) * 0.08 : Math.max(Math.abs(high) * 0.05, 1);
	low -= pad;
	high += pad;
	const at = (value: number) => round(clampPercent(((value - low) / (high - low)) * 100));

	const hasBand = bandLow !== null || bandHigh !== null;
	const bandStart = at(bandLow ?? low);
	return {
		span:
			summary.min !== null && summary.max !== null
				? { left: at(summary.min), width: round(at(summary.max) - at(summary.min)) }
				: null,
		avg: summary.avg !== null ? at(summary.avg) : null,
		now: summary.current !== null ? at(summary.current) : null,
		band: hasBand ? { left: bandStart, width: round(at(bandHigh ?? high) - bandStart) } : null
	};
}

/**
 * The target as text: the optimal band ("20–25°C", "≥ 20°C", "≤ 25°C"), or the
 * stress limits when there is no optimal bound; null without any bound.
 */
export function formatCwTargetRange(
	target: CwAboveBelowTarget | null | undefined,
	options: { decimals?: number; unit?: string; locale?: string } = {}
): string | null {
	if (!target) return null;
	const optimalMin = finiteOrNull(target.optimalMin);
	const optimalMax = finiteOrNull(target.optimalMax);
	const hasBand = optimalMin !== null || optimalMax !== null;
	const low = hasBand ? optimalMin : finiteOrNull(target.min);
	const high = hasBand ? optimalMax : finiteOrNull(target.max);
	const format = (value: number) =>
		formatCwNumber(value, {
			minimumFractionDigits: 0,
			maximumFractionDigits: options.decimals ?? 1,
			locale: options.locale
		});

	if (low !== null && high !== null) return joinCwUnit(`${format(low)}–${format(high)}`, options.unit);
	if (low !== null) return joinCwUnit(`≥ ${format(low)}`, options.unit);
	if (high !== null) return joinCwUnit(`≤ ${format(high)}`, options.unit);
	return null;
}

/** The built-in icon for a metric key ("air_temperature" → thermometer). */
export function cwAboveBelowIconFor(key: string): CwAboveBelowIcon {
	const name = normalizeMetric(key);
	if (/(^|_)ph$/.test(name)) return 'ph';
	if (name.includes('vpd')) return 'vpd';
	if (name.includes('temp')) return 'thermometer';
	if (name.includes('humid') || name === 'rh') return 'humidity';
	if (name.includes('co2') || name.includes('carbon')) return 'co2';
	if (/moist|vwc|water/.test(name)) return 'moisture';
	if (/(^|_)ec$|conductiv/.test(name)) return 'ec';
	if (/ppfd|par|light|lux|solar/.test(name)) return 'light';
	return 'generic';
}

/** The metric's colour: the explicit one, else the CropWatch metric colour for its key. */
export function cwAboveBelowColorFor(metric: Pick<CwAboveBelowMetric, 'key' | 'color'>): string {
	return metric.color ?? metricColor(metric.key).color;
}
