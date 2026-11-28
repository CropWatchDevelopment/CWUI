/**
 * The rules behind CwAlertLevels: what is missing from a level, which levels
 * overlap, and where each one sits on the preview scale. Pure functions, so
 * they can be tested without a browser.
 */
import type { CwAlertPointCondition, CwAlertPointRule } from '../types/index.js';
import { domainsOverlap, getTriggerDomain } from './alert-points/ruleDomains.js';
import { parseRuleNumber } from './cwRuleCondition.js';

/** The conditions a report level can have, in the order they are offered. */
export const CW_ALERT_LEVEL_CONDITIONS = [
	'lessThan',
	'lessThanOrEqual',
	'greaterThan',
	'greaterThanOrEqual',
	'range',
	'equals'
] as const satisfies readonly CwAlertPointCondition[];

export type CwAlertLevelField = 'name' | 'value' | 'min' | 'max';

export type CwAlertLevelProblemKind =
	| 'nameMissing'
	| 'valueMissing'
	| 'valueInvalid'
	/** "Between" needs its lower value below its upper one. */
	| 'rangeOrder';

export interface CwAlertLevelProblem {
	kind: CwAlertLevelProblemKind;
	field: CwAlertLevelField;
}

/** A level's numbers, already in the unit they are shown in. */
export interface CwAlertLevelNumbers {
	id: string;
	condition: CwAlertPointCondition;
	value: number | null;
	min: number | null;
	max: number | null;
}

function numberProblem(raw: string, field: CwAlertLevelField): CwAlertLevelProblem | null {
	if (parseRuleNumber(raw) !== null) return null;
	return { kind: raw.trim() ? 'valueInvalid' : 'valueMissing', field };
}

/** What is wrong with each level, in the order of `points`. */
export function alertLevelProblems(points: readonly CwAlertPointRule[]): CwAlertLevelProblem[][] {
	return points.map((point) => {
		const problems: CwAlertLevelProblem[] = [];
		if (!point.name.trim()) problems.push({ kind: 'nameMissing', field: 'name' });

		if (point.condition !== 'range') {
			const problem = numberProblem(point.value, 'value');
			if (problem) problems.push(problem);
			return problems;
		}

		const fromProblem = numberProblem(point.min, 'min');
		const toProblem = numberProblem(point.max, 'max');
		if (fromProblem) problems.push(fromProblem);
		if (toProblem) problems.push(toProblem);
		if (!fromProblem && !toProblem && Number(point.min) >= Number(point.max)) {
			problems.push({ kind: 'rangeOrder', field: 'max' });
		}
		return problems;
	});
}

/** Whether every level can be saved. No levels at all is fine: they are optional. */
export function areAlertLevelsValid(points: readonly CwAlertPointRule[]): boolean {
	return alertLevelProblems(points).every((problems) => problems.length === 0);
}

/** The pairs of complete levels (by position, first < second) that some reading matches both of. */
export function alertLevelOverlaps(points: readonly CwAlertPointRule[]): [number, number][] {
	const problems = alertLevelProblems(points);
	const zones = points.map((point, index) =>
		problems[index].some((problem) => problem.field !== 'name')
			? null
			: getTriggerDomain({
					condition: point.condition,
					numericValue: parseRuleNumber(point.value),
					numericMin: parseRuleNumber(point.min),
					numericMax: parseRuleNumber(point.max),
					numericReset: null
				})
	);
	const pairs: [number, number][] = [];
	zones.forEach((zone, index) => {
		for (let earlier = 0; earlier < index; earlier += 1) {
			const other = zones[earlier];
			if (zone && other && domainsOverlap(zone, other)) pairs.push([earlier, index]);
		}
	});
	return pairs;
}

/** Where a level starts and ends; an open side is ±Infinity. `null` while it is incomplete. */
export function alertLevelBounds(level: CwAlertLevelNumbers): { start: number; end: number } | null {
	if (level.condition === 'range') {
		if (level.min === null || level.max === null || level.min >= level.max) return null;
		return { start: level.min, end: level.max };
	}
	if (level.value === null) return null;
	switch (level.condition) {
		case 'lessThan':
		case 'lessThanOrEqual':
			return { start: Number.NEGATIVE_INFINITY, end: level.value };
		case 'greaterThan':
		case 'greaterThanOrEqual':
			return { start: level.value, end: Number.POSITIVE_INFINITY };
		default:
			return { start: level.value, end: level.value };
	}
}

function niceStep(rough: number): number {
	const magnitude = 10 ** Math.floor(Math.log10(rough));
	const fraction = rough / magnitude;
	return (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * magnitude;
}

/**
 * A scale that shows every level with room on both sides, on round numbers.
 * `null` while no level is complete.
 */
export function alertLevelScale(
	levels: readonly CwAlertLevelNumbers[]
): { min: number; max: number } | null {
	const numbers = levels
		.map(alertLevelBounds)
		.flatMap((bounds) => (bounds ? [bounds.start, bounds.end] : []))
		.filter(Number.isFinite);
	if (numbers.length === 0) return null;

	const low = Math.min(...numbers);
	const high = Math.max(...numbers);
	const span = high - low;
	// One value alone still needs a stretch of scale around it.
	const room = span > 0 ? span * 0.35 : Math.max(Math.abs(low) * 0.5, 10);
	const step = niceStep((span + 2 * room) / 5);
	// A step such as 0.1 leaves float noise on its multiples.
	const tidy = (value: number) => Number(value.toPrecision(12));
	return {
		min: tidy(Math.floor((low - room) / step) * step),
		max: tidy(Math.ceil((high + room) / step) * step)
	};
}

const percent = (value: number, scale: { min: number; max: number }) =>
	Math.max(0, Math.min(100, ((value - scale.min) / (scale.max - scale.min)) * 100));

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Where a level is drawn on the scale, in percent of its width. "Exactly"
 * has no width: it is drawn as a mark at `left`.
 */
export function alertLevelBand(
	level: CwAlertLevelNumbers,
	scale: { min: number; max: number }
): { left: number; width: number; mark: boolean } | null {
	const bounds = alertLevelBounds(level);
	if (!bounds) return null;
	const left = percent(Math.max(bounds.start, scale.min), scale);
	const right = percent(Math.min(bounds.end, scale.max), scale);
	return { left: round(left), width: round(right - left), mark: bounds.start === bounds.end };
}

export interface CwAlertLevelTick {
	value: number;
	/** Percent across the scale. */
	left: number;
	/** One of the two ends of the scale, as opposed to a level's boundary. */
	edge: boolean;
}

/**
 * The numbers under the scale: its two ends and every boundary of a level.
 * A number that would sit on top of one already placed is left out;
 * boundaries win over the ends, earlier boundaries over later ones.
 */
export function alertLevelTicks(
	levels: readonly CwAlertLevelNumbers[],
	scale: { min: number; max: number },
	minGap = 7
): CwAlertLevelTick[] {
	const boundaries = [
		...new Set(
			levels
				.map(alertLevelBounds)
				.flatMap((bounds) => (bounds ? [bounds.start, bounds.end] : []))
				.filter(Number.isFinite)
		)
	].sort((a, b) => a - b);

	const placed: CwAlertLevelTick[] = [];
	const fits = (left: number) => placed.every((tick) => Math.abs(tick.left - left) >= minGap);
	for (const value of boundaries) {
		const left = round(percent(value, scale));
		if (fits(left)) placed.push({ value, left, edge: false });
	}
	for (const [value, left] of [
		[scale.min, 0],
		[scale.max, 100]
	]) {
		if (fits(left)) placed.push({ value, left, edge: true });
	}
	return placed.sort((a, b) => a.left - b.left);
}

/** The colours new levels get, in turn: the chart palette, checked for colour-blind separation. */
export const CW_ALERT_LEVEL_COLORS = [
	'#3987e5',
	'#da5e2d',
	'#199e70',
	'#c98500',
	'#d75987',
	'#9085e9'
] as const;

/** The first palette colour no level uses yet; the palette starts over when all are taken. */
export function nextAlertLevelColor(points: readonly Pick<CwAlertPointRule, 'color'>[]): string {
	const used = new Set(points.map((point) => point.color.trim().toLowerCase()));
	return (
		CW_ALERT_LEVEL_COLORS.find((color) => !used.has(color)) ??
		CW_ALERT_LEVEL_COLORS[points.length % CW_ALERT_LEVEL_COLORS.length]
	);
}
