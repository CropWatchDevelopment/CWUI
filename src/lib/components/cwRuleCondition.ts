/**
 * The rules behind CwRuleCondition: which side of a limit alerts, where a
 * reset may sit, what to suggest, and what is wrong with a set of limits.
 * Pure functions, so they can be tested without a browser and reused by an
 * app to decide whether a rule may be saved.
 */
import type { CwAlertPointCondition, CwAlertPointRule, CwAlertPointsValue } from '../types/index.js';
import {
	areDomainsFullyCovered,
	domainsOverlap,
	getResetDomains,
	getTriggerDomain
} from './alert-points/ruleDomains.js';

/** The units a temperature can be typed in. Values are always stored in °C. */
export type CwRuleUnit = 'C' | 'F';

/** Which way a reading has to go to alert. */
export type CwRuleDirection = 'below' | 'above' | 'exact';

/** The conditions a rule limit can have. `range` cannot be saved in a rule. */
export const CW_RULE_CONDITIONS = [
	'lessThan',
	'lessThanOrEqual',
	'greaterThan',
	'greaterThanOrEqual',
	'equals'
] as const satisfies readonly CwAlertPointCondition[];

export type CwRuleProblemKind =
	/** The condition (`range`) cannot be used in a rule. */
	| 'unsupported'
	| 'valueMissing'
	| 'valueInvalid'
	| 'resetMissing'
	| 'resetInvalid'
	/** The reset sits on the alert side of the limit, or on it: the rule would alert on every reading. */
	| 'resetWrongSide'
	/** Some readings match this limit and an earlier one. */
	| 'overlap'
	/** No reading can be past this reset while the other limits are quiet. */
	| 'neverResets';

export interface CwRuleProblem {
	kind: CwRuleProblemKind;
	/** The field the problem belongs under. */
	field: 'condition' | 'value' | 'reset';
}

/** A number typed by a person; `null` while it is empty or not yet a number ("-", "3."). */
export function parseRuleNumber(raw: string | undefined | null): number | null {
	const trimmed = raw?.trim() ?? '';
	if (!trimmed) return null;
	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : null;
}

/**
 * A number as it is stored and shown in a field: no float noise, no "-0".
 * `decimals` rounds it for showing, so a value that went to °C and back
 * (0 °F is -17.777… °C) reads as what was typed.
 */
export function ruleNumberText(value: number, decimals?: number): string {
	const rounded =
		decimals === undefined ? Number(value.toPrecision(12)) : Number(value.toFixed(decimals));
	return Object.is(rounded, -0) ? '0' : String(rounded);
}

/** Decimals kept when a stored value is shown in another unit. */
const SHOWN_DECIMALS = 4;

export function ruleDirection(condition: CwAlertPointCondition): CwRuleDirection | null {
	switch (condition) {
		case 'lessThan':
		case 'lessThanOrEqual':
			return 'below';
		case 'greaterThan':
		case 'greaterThanOrEqual':
			return 'above';
		case 'equals':
			return 'exact';
		default:
			return null;
	}
}

/** The unit a stored editor unit is shown in: Kelvin is no longer offered. */
export function ruleUnitOf(unit: string | undefined): CwRuleUnit {
	return unit === 'F' ? 'F' : 'C';
}

/** A stored value (°C) as the number shown in `unit`. */
export function ruleValueToDisplay(celsius: number, unit: CwRuleUnit): number {
	return unit === 'F' ? (celsius * 9) / 5 + 32 : celsius;
}

/** A number typed in `unit` as the value that is stored (°C). */
export function ruleValueToStorage(shown: number, unit: CwRuleUnit): number {
	return unit === 'F' ? ((shown - 32) * 5) / 9 : shown;
}

/**
 * What is typed in a field for a stored text. A stored number is converted;
 * anything else (empty, half-typed) is passed through.
 */
export function ruleTextToDisplay(stored: string | undefined, unit: CwRuleUnit): string {
	const parsed = parseRuleNumber(stored);
	return parsed === null
		? (stored ?? '')
		: ruleNumberText(ruleValueToDisplay(parsed, unit), SHOWN_DECIMALS);
}

/** The text to store for what was typed in a field shown in `unit`. */
export function ruleTextToStorage(typed: string, unit: CwRuleUnit): string {
	const parsed = parseRuleNumber(typed);
	return parsed === null ? typed : ruleNumberText(ruleValueToStorage(parsed, unit));
}

/**
 * The reset to suggest for a limit, in the same unit as `value`: `gap` past
 * the limit on its safe side. None for "is exactly", which has no reset value.
 */
export function suggestedRuleReset(
	condition: CwAlertPointCondition,
	value: number,
	gap: number
): number | null {
	const direction = ruleDirection(condition);
	if (direction === 'below') return value + gap;
	if (direction === 'above') return value - gap;
	return null;
}

/** Whether a reset is on the safe side of its limit, with room between them. */
export function isRuleResetOnSafeSide(
	condition: CwAlertPointCondition,
	value: number,
	reset: number
): boolean {
	const direction = ruleDirection(condition);
	if (direction === 'below') return reset > value;
	if (direction === 'above') return reset < value;
	return true;
}

function numericRule(point: CwAlertPointRule) {
	return {
		condition: point.condition,
		numericValue: parseRuleNumber(point.value),
		numericMin: parseRuleNumber(point.min),
		numericMax: parseRuleNumber(point.max),
		numericReset: parseRuleNumber(point.reset)
	};
}

/** The problems of one limit taken alone. */
function ownProblems(point: CwAlertPointRule): CwRuleProblem[] {
	const direction = ruleDirection(point.condition);
	if (direction === null) return [{ kind: 'unsupported', field: 'condition' }];

	const problems: CwRuleProblem[] = [];
	const value = parseRuleNumber(point.value);
	if (value === null) {
		problems.push({
			kind: point.value.trim() ? 'valueInvalid' : 'valueMissing',
			field: 'value'
		});
	}
	// "Is exactly" resets as soon as the reading is anything else: it has no reset value.
	if (direction === 'exact') return problems;

	const reset = parseRuleNumber(point.reset);
	if (reset === null) {
		problems.push({
			kind: point.reset?.trim() ? 'resetInvalid' : 'resetMissing',
			field: 'reset'
		});
	} else if (value !== null && !isRuleResetOnSafeSide(point.condition, value, reset)) {
		problems.push({ kind: 'resetWrongSide', field: 'reset' });
	}
	return problems;
}

/**
 * What is wrong with each limit, in the order of `points`. Limits on one
 * reading are alternatives (the alert goes out when any of them is passed),
 * so their alert zones must not overlap, and each reset must be reachable
 * while the others are quiet.
 */
export function ruleLimitProblems(points: readonly CwAlertPointRule[]): CwRuleProblem[][] {
	const problems = points.map(ownProblems);
	const rules = points.map(numericRule);
	const triggers = rules.map((rule) =>
		ruleDirection(rule.condition) === null ? null : getTriggerDomain(rule)
	);

	// Compare only limits that are sound on their own: one message per mistake.
	const sound = problems.map((own, index) => own.length === 0 && triggers[index] !== null);
	const overlapping = points.map(() => false);
	points.forEach((_, index) => {
		for (let earlier = 0; earlier < index; earlier += 1) {
			if (!sound[index] || !sound[earlier]) continue;
			if (!domainsOverlap(triggers[index]!, triggers[earlier]!)) continue;
			overlapping[index] = overlapping[earlier] = true;
			// Reported once, on the later of the two.
			if (!problems[index].some((problem) => problem.kind === 'overlap')) {
				problems[index].push({ kind: 'overlap', field: 'value' });
			}
		}
	});

	points.forEach((_, index) => {
		if (!sound[index] || overlapping[index]) return;
		const others = triggers.filter(
			(other, otherIndex): other is NonNullable<typeof other> =>
				otherIndex !== index && sound[otherIndex] && other !== null
		);
		const resets = getResetDomains(rules[index]);
		if (others.length > 0 && resets && areDomainsFullyCovered(resets, others)) {
			problems[index].push({ kind: 'neverResets', field: 'reset' });
		}
	});

	return problems;
}

/** Whether a reading's limits can be saved: at least one, and nothing wrong with any. */
export function isRuleConditionValid(value: Pick<CwAlertPointsValue, 'points'>): boolean {
	return (
		value.points.length > 0 &&
		ruleLimitProblems(value.points).every((problems) => problems.length === 0)
	);
}

/** The condition a second limit starts with: the other side of the first one. */
export function oppositeRuleCondition(condition: CwAlertPointCondition): CwAlertPointCondition {
	return ruleDirection(condition) === 'above' ? 'lessThan' : 'greaterThan';
}

/** One piece of a sentence: plain text, or a part the reader should not miss. */
export interface CwRuleTextPart {
	text: string;
	strong: boolean;
}

/**
 * Fills a sentence template. `{name}` is replaced by `values.name`; the
 * names in `strong` come back marked, so a component can set them in bold.
 * A name without a value is left out.
 */
export function fillRuleTemplate(
	template: string,
	values: Record<string, string>,
	strong: readonly string[] = []
): CwRuleTextPart[] {
	const parts: CwRuleTextPart[] = [];
	let rest = template;
	for (;;) {
		const match = /\{(\w+)\}/.exec(rest);
		if (!match) break;
		if (match.index > 0) parts.push({ text: rest.slice(0, match.index), strong: false });
		const filled = values[match[1]];
		if (filled) parts.push({ text: filled, strong: strong.includes(match[1]) });
		rest = rest.slice(match.index + match[0].length);
	}
	if (rest) parts.push({ text: rest, strong: false });
	return parts;
}

/** {@link fillRuleTemplate} as one plain string. */
export function fillRuleText(template: string, values: Record<string, string>): string {
	return fillRuleTemplate(template, values)
		.map((part) => part.text)
		.join('');
}

/**
 * The example reading the chart draws: where each sample sits across the
 * chart (0 = start, 1 = end) and how far down it (0 = top, 1 = bottom), for a
 * limit that alerts when the reading drops. The alert line is at 0.556 and
 * the reset line at 0.333 of the height.
 */
export const CW_RULE_EXAMPLE = {
	alertLine: 0.556,
	resetLine: 0.333,
	samples: [
		[0, 0.156],
		[0.079, 0.2],
		[0.145, 0.4],
		[0.197, 0.6],
		[0.25, 0.689],
		[0.303, 0.733],
		[0.355, 0.622],
		[0.401, 0.456],
		[0.447, 0.589],
		[0.5, 0.678],
		[0.553, 0.611],
		[0.599, 0.422],
		[0.645, 0.289],
		[0.697, 0.167],
		[0.75, 0.133],
		[0.796, 0.3],
		[0.842, 0.467],
		[0.884, 0.611],
		[0.921, 0.667],
		[1, 0.7]
	] as readonly (readonly [number, number])[],
	/** The samples the four numbered steps point at: alert, wobble, reset, alert again. */
	steps: [3, 7, 12, 17] as readonly number[]
};

/**
 * The example's geometry in pixels for a plot `width` × `height`. A limit that
 * alerts when the reading rises is the same picture upside down.
 */
export function ruleExampleGeometry(direction: 'below' | 'above', width: number, height: number) {
	const y = (down: number) => (direction === 'below' ? down : 1 - down) * height;
	const points = CW_RULE_EXAMPLE.samples.map(([across, down]) => ({
		x: Math.round(across * width * 10) / 10,
		y: Math.round(y(down) * 10) / 10
	}));
	const alertY = Math.round(y(CW_RULE_EXAMPLE.alertLine) * 10) / 10;
	return {
		points,
		polyline: points.map((point) => `${point.x},${point.y}`).join(' '),
		alertY,
		resetY: Math.round(y(CW_RULE_EXAMPLE.resetLine) * 10) / 10,
		/** The alert zone: from the alert line to the edge the reading alerts towards. */
		zone:
			direction === 'below'
				? { y: alertY, height: Math.round((height - alertY) * 10) / 10 }
				: { y: 0, height: alertY },
		steps: CW_RULE_EXAMPLE.steps.map((sample) => points[sample])
	};
}
