import { describe, expect, it } from 'vitest';
import type { CwAlertPointCondition, CwAlertPointRule } from '../types/index.js';
import {
	CW_RULE_EXAMPLE,
	fillRuleTemplate,
	fillRuleText,
	isRuleConditionValid,
	isRuleResetOnSafeSide,
	oppositeRuleCondition,
	parseRuleNumber,
	ruleDirection,
	ruleExampleGeometry,
	ruleLimitProblems,
	ruleNumberText,
	ruleTextToDisplay,
	ruleTextToStorage,
	ruleUnitOf,
	ruleValueToDisplay,
	ruleValueToStorage,
	suggestedRuleReset
} from './cwRuleCondition.js';

let nextId = 0;
function limit(
	condition: CwAlertPointCondition,
	value: string,
	reset = '',
	extra: Partial<CwAlertPointRule> = {}
): CwAlertPointRule {
	nextId += 1;
	return { id: `p${nextId}`, name: '', color: '#000000', condition, value, min: '', max: '', reset, ...extra };
}

const kinds = (points: CwAlertPointRule[]) =>
	ruleLimitProblems(points).map((problems) => problems.map((problem) => problem.kind));

describe('parseRuleNumber', () => {
	it('reads whole, decimal and negative numbers', () => {
		expect(parseRuleNumber('5')).toBe(5);
		expect(parseRuleNumber(' -18.5 ')).toBe(-18.5);
		expect(parseRuleNumber('0')).toBe(0);
	});

	it('answers null for empty and half-typed input', () => {
		for (const raw of ['', '   ', '-', 'abc', '1e999', undefined, null]) {
			expect(parseRuleNumber(raw)).toBeNull();
		}
	});
});

describe('ruleNumberText', () => {
	it('drops float noise and a negative zero', () => {
		expect(ruleNumberText(0.1 + 0.2)).toBe('0.3');
		expect(ruleNumberText(-0)).toBe('0');
		expect(ruleNumberText(-18)).toBe('-18');
	});
});

describe('units', () => {
	it('keeps Celsius as it is and converts Fahrenheit both ways', () => {
		expect(ruleValueToDisplay(5, 'C')).toBe(5);
		expect(ruleValueToStorage(5, 'C')).toBe(5);
		expect(ruleValueToDisplay(5, 'F')).toBe(41);
		expect(ruleValueToStorage(41, 'F')).toBe(5);
	});

	it('gives back what was typed after storing and showing it again', () => {
		for (const typed of ['40', '-4', '98.6', '0']) {
			expect(ruleTextToDisplay(ruleTextToStorage(typed, 'F'), 'F')).toBe(typed);
		}
	});

	it('passes empty and half-typed text through untouched', () => {
		expect(ruleTextToStorage('', 'F')).toBe('');
		expect(ruleTextToStorage('-', 'F')).toBe('-');
		expect(ruleTextToDisplay('-', 'F')).toBe('-');
		expect(ruleTextToDisplay(undefined, 'C')).toBe('');
	});

	it('no longer offers Kelvin: a stored K is shown as Celsius', () => {
		expect(ruleUnitOf('K')).toBe('C');
		expect(ruleUnitOf('F')).toBe('F');
		expect(ruleUnitOf(undefined)).toBe('C');
	});
});

describe('ruleDirection', () => {
	it('sorts the conditions by the way the reading has to go', () => {
		expect(ruleDirection('lessThan')).toBe('below');
		expect(ruleDirection('lessThanOrEqual')).toBe('below');
		expect(ruleDirection('greaterThan')).toBe('above');
		expect(ruleDirection('greaterThanOrEqual')).toBe('above');
		expect(ruleDirection('equals')).toBe('exact');
	});

	it('has none for a range, which a rule cannot save', () => {
		expect(ruleDirection('range')).toBeNull();
	});
});

describe('suggestedRuleReset', () => {
	it('suggests the safe side of the limit', () => {
		expect(suggestedRuleReset('lessThan', 5, 2)).toBe(7);
		expect(suggestedRuleReset('lessThanOrEqual', -20, 2)).toBe(-18);
		expect(suggestedRuleReset('greaterThan', 30, 2)).toBe(28);
		expect(suggestedRuleReset('greaterThanOrEqual', 86, 4)).toBe(82);
	});

	it('suggests nothing for "is exactly" or a range', () => {
		expect(suggestedRuleReset('equals', 5, 2)).toBeNull();
		expect(suggestedRuleReset('range', 5, 2)).toBeNull();
	});
});

describe('isRuleResetOnSafeSide', () => {
	it('wants a reset above a "too low" limit and below a "too high" one', () => {
		expect(isRuleResetOnSafeSide('lessThan', 5, 7)).toBe(true);
		expect(isRuleResetOnSafeSide('lessThan', 5, 3)).toBe(false);
		expect(isRuleResetOnSafeSide('greaterThan', 30, 28)).toBe(true);
		expect(isRuleResetOnSafeSide('greaterThan', 30, 35)).toBe(false);
	});

	it('refuses a reset on the limit itself: there would be no room between them', () => {
		expect(isRuleResetOnSafeSide('lessThan', 5, 5)).toBe(false);
		expect(isRuleResetOnSafeSide('greaterThanOrEqual', 30, 30)).toBe(false);
	});

	it('has no wrong side for "is exactly"', () => {
		expect(isRuleResetOnSafeSide('equals', 5, 99)).toBe(true);
	});
});

describe('ruleLimitProblems', () => {
	it('finds nothing wrong with a complete limit', () => {
		expect(kinds([limit('lessThan', '5', '7')])).toEqual([[]]);
		expect(kinds([limit('greaterThanOrEqual', '30', '28')])).toEqual([[]]);
	});

	it('names a missing or unreadable value and reset', () => {
		expect(kinds([limit('lessThan', '', '')])).toEqual([['valueMissing', 'resetMissing']]);
		expect(kinds([limit('lessThan', 'x', '-')])).toEqual([['valueInvalid', 'resetInvalid']]);
	});

	it('names a reset on the alert side', () => {
		expect(kinds([limit('lessThan', '5', '3')])).toEqual([['resetWrongSide']]);
		expect(kinds([limit('greaterThan', '30', '35')])).toEqual([['resetWrongSide']]);
	});

	it('does not judge the side of a reset before the value is a number', () => {
		expect(kinds([limit('lessThan', '', '3')])).toEqual([['valueMissing']]);
	});

	it('asks nothing of the reset of "is exactly"', () => {
		expect(kinds([limit('equals', '5', '')])).toEqual([[]]);
		expect(kinds([limit('equals', '', '')])).toEqual([['valueMissing']]);
	});

	it('refuses a range', () => {
		expect(kinds([limit('range', '', '', { min: '1', max: '2' })])).toEqual([['unsupported']]);
	});

	it('puts each problem under the field it belongs to', () => {
		const [problems] = ruleLimitProblems([limit('lessThan', '', '')]);
		expect(problems.map((problem) => problem.field)).toEqual(['value', 'reset']);
		expect(ruleLimitProblems([limit('range', '', '')])[0][0].field).toBe('condition');
	});

	it('accepts "too cold or too hot": two limits that leave room between them', () => {
		expect(kinds([limit('lessThan', '5', '7'), limit('greaterThan', '35', '33')])).toEqual([
			[],
			[]
		]);
	});

	it('reports the second of two limits whose alert zones overlap', () => {
		expect(kinds([limit('lessThan', '20', '22'), limit('greaterThan', '10', '8')])).toEqual([
			[],
			['overlap']
		]);
		expect(kinds([limit('lessThan', '5', '7'), limit('lessThan', '3', '4')])).toEqual([
			[],
			['overlap']
		]);
	});

	it('reports a reset that lies inside the other limit\'s alert zone', () => {
		// Too cold below 5 resets above 40, but above 35 the "too hot" limit is alerting.
		expect(kinds([limit('lessThan', '5', '40'), limit('greaterThan', '35', '33')])).toEqual([
			['neverResets'],
			[]
		]);
	});

	it('does not compare a limit that is wrong on its own', () => {
		expect(kinds([limit('lessThan', '20', ''), limit('greaterThan', '10', '8')])).toEqual([
			['resetMissing'],
			[]
		]);
	});
});

describe('isRuleConditionValid', () => {
	it('needs at least one limit and no problem in any', () => {
		expect(isRuleConditionValid({ points: [] })).toBe(false);
		expect(isRuleConditionValid({ points: [limit('lessThan', '5', '7')] })).toBe(true);
		expect(isRuleConditionValid({ points: [limit('lessThan', '5', '3')] })).toBe(false);
		expect(
			isRuleConditionValid({ points: [limit('lessThan', '5', '7'), limit('greaterThan', '', '')] })
		).toBe(false);
	});
});

describe('oppositeRuleCondition', () => {
	it('starts a second limit on the other side of the first', () => {
		expect(oppositeRuleCondition('lessThan')).toBe('greaterThan');
		expect(oppositeRuleCondition('lessThanOrEqual')).toBe('greaterThan');
		expect(oppositeRuleCondition('greaterThan')).toBe('lessThan');
		expect(oppositeRuleCondition('equals')).toBe('greaterThan');
	});
});

describe('fillRuleTemplate', () => {
	it('fills the names and marks the ones to set in bold', () => {
		expect(
			fillRuleTemplate('Sends {one} when it {when}.', { one: 'one alert', when: 'drops below 5 °C' }, [
				'one'
			])
		).toEqual([
			{ text: 'Sends ', strong: false },
			{ text: 'one alert', strong: true },
			{ text: ' when it ', strong: false },
			{ text: 'drops below 5 °C', strong: false },
			{ text: '.', strong: false }
		]);
	});

	it('leaves out a name it has no value for, and keeps text without names', () => {
		expect(fillRuleText('{a}{missing} b', { a: 'A' })).toBe('A b');
		expect(fillRuleText('plain', {})).toBe('plain');
		expect(fillRuleTemplate('', {})).toEqual([]);
	});

	it('works for a sentence that starts with a name, as Japanese ones do', () => {
		expect(fillRuleText('{reading}が{when}と通知します。', { reading: '温度', when: '5 °Cを下回る' })).toBe(
			'温度が5 °Cを下回ると通知します。'
		);
	});
});

describe('ruleExampleGeometry', () => {
	it('tells the story it is drawn for: alert, wobble, reset, alert again', () => {
		const { alertLine, resetLine, samples, steps } = CW_RULE_EXAMPLE;
		const down = (index: number) => samples[index][1];
		const [first, wobble, reset, again] = steps;

		// Larger = lower on the chart. The first step is the first sample past the alert line.
		expect(down(first)).toBeGreaterThan(alertLine);
		expect(samples.slice(0, first).every(([, d]) => d <= alertLine)).toBe(true);
		// The wobble comes back over the alert line without reaching the reset line.
		expect(down(wobble)).toBeLessThan(alertLine);
		expect(samples.slice(first, reset).every(([, d]) => d > resetLine)).toBe(true);
		// The reset is the first sample past the reset line; the last step alerts again.
		expect(down(reset)).toBeLessThan(resetLine);
		expect(down(again)).toBeGreaterThan(alertLine);
		expect(samples.slice(reset, again).every(([, d]) => d <= alertLine)).toBe(true);
	});

	it('scales to the plot and puts the alert zone at the bottom for "too low"', () => {
		const geometry = ruleExampleGeometry('below', 760, 180);
		expect(geometry.points[0]).toEqual({ x: 0, y: 28.1 });
		expect(geometry.points.at(-1)).toEqual({ x: 760, y: 126 });
		expect(geometry.alertY).toBe(100.1);
		expect(geometry.resetY).toBe(59.9);
		expect(geometry.zone).toEqual({ y: 100.1, height: 79.9 });
		expect(geometry.steps).toHaveLength(4);
		expect(geometry.polyline.split(' ')).toHaveLength(CW_RULE_EXAMPLE.samples.length);
	});

	it('turns the picture upside down for "too high"', () => {
		const geometry = ruleExampleGeometry('above', 760, 180);
		expect(geometry.alertY).toBe(79.9);
		expect(geometry.resetY).toBe(120.1);
		expect(geometry.zone).toEqual({ y: 0, height: 79.9 });
		// The alert steps are now above the alert line.
		expect(geometry.steps[0].y).toBeLessThan(geometry.alertY);
		expect(geometry.steps[2].y).toBeGreaterThan(geometry.resetY);
	});
});
