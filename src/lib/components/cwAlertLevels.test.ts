import { describe, expect, it } from 'vitest';
import type { CwAlertPointCondition, CwAlertPointRule } from '../types/index.js';
import {
	alertLevelBand,
	alertLevelBounds,
	alertLevelOverlaps,
	alertLevelProblems,
	alertLevelScale,
	alertLevelTicks,
	areAlertLevelsValid,
	CW_ALERT_LEVEL_COLORS,
	nextAlertLevelColor,
	type CwAlertLevelNumbers
} from './cwAlertLevels.js';

let nextId = 0;
function point(
	condition: CwAlertPointCondition,
	numbers: { value?: string; min?: string; max?: string } = {},
	name = 'Level'
): CwAlertPointRule {
	nextId += 1;
	return {
		id: `p${nextId}`,
		name,
		color: '#3987e5',
		condition,
		value: numbers.value ?? '',
		min: numbers.min ?? '',
		max: numbers.max ?? ''
	};
}

function level(
	condition: CwAlertPointCondition,
	numbers: { value?: number; min?: number; max?: number } = {}
): CwAlertLevelNumbers {
	nextId += 1;
	return {
		id: `l${nextId}`,
		condition,
		value: numbers.value ?? null,
		min: numbers.min ?? null,
		max: numbers.max ?? null
	};
}

const kinds = (points: CwAlertPointRule[]) =>
	alertLevelProblems(points).map((problems) => problems.map((problem) => problem.kind));

describe('alertLevelProblems', () => {
	it('finds nothing wrong with complete levels', () => {
		expect(
			kinds([
				point('lessThan', { value: '5' }),
				point('range', { min: '18', max: '26' }),
				point('equals', { value: '0' })
			])
		).toEqual([[], [], []]);
	});

	it('names a missing name, value and unreadable number', () => {
		expect(kinds([point('greaterThan', {}, '  ')])).toEqual([['nameMissing', 'valueMissing']]);
		expect(kinds([point('greaterThan', { value: '-' })])).toEqual([['valueInvalid']]);
	});

	it('checks both ends of "between", and their order', () => {
		expect(kinds([point('range', { min: '', max: '' })])).toEqual([
			['valueMissing', 'valueMissing']
		]);
		expect(kinds([point('range', { min: '30', max: '20' })])).toEqual([['rangeOrder']]);
		expect(kinds([point('range', { min: '20', max: '20' })])).toEqual([['rangeOrder']]);
		const [problems] = alertLevelProblems([point('range', { min: '', max: 'x' })]);
		expect(problems.map((problem) => problem.field)).toEqual(['min', 'max']);
	});

	it('lets a report have no levels at all', () => {
		expect(areAlertLevelsValid([])).toBe(true);
		expect(areAlertLevelsValid([point('lessThan', { value: '5' })])).toBe(true);
		expect(areAlertLevelsValid([point('lessThan', {})])).toBe(false);
	});
});

describe('alertLevelOverlaps', () => {
	it('finds no overlap between levels that only touch or are apart', () => {
		expect(
			alertLevelOverlaps([
				point('lessThan', { value: '5' }),
				point('range', { min: '18', max: '26' }),
				point('greaterThan', { value: '30' })
			])
		).toEqual([]);
		// Below 5 and above 5 share no reading.
		expect(
			alertLevelOverlaps([point('lessThan', { value: '5' }), point('greaterThan', { value: '5' })])
		).toEqual([]);
	});

	it('reports each overlapping pair once, earlier level first', () => {
		expect(
			alertLevelOverlaps([
				point('range', { min: '20', max: '30' }),
				point('greaterThan', { value: '25' }),
				point('lessThan', { value: '0' })
			])
		).toEqual([[0, 1]]);
	});

	it('leaves an incomplete level out, but not one that only lacks a name', () => {
		expect(
			alertLevelOverlaps([point('lessThan', { value: '' }), point('lessThan', { value: '9' })])
		).toEqual([]);
		expect(
			alertLevelOverlaps([
				point('lessThan', { value: '5' }, ''),
				point('lessThan', { value: '9' })
			])
		).toEqual([[0, 1]]);
	});
});

describe('alertLevelBounds', () => {
	it('opens the side a level has no limit on', () => {
		expect(alertLevelBounds(level('lessThan', { value: 5 }))).toEqual({
			start: Number.NEGATIVE_INFINITY,
			end: 5
		});
		expect(alertLevelBounds(level('greaterThanOrEqual', { value: 30 }))).toEqual({
			start: 30,
			end: Number.POSITIVE_INFINITY
		});
		expect(alertLevelBounds(level('range', { min: 18, max: 26 }))).toEqual({ start: 18, end: 26 });
		expect(alertLevelBounds(level('equals', { value: 7 }))).toEqual({ start: 7, end: 7 });
	});

	it('has none for an incomplete or upside-down level', () => {
		expect(alertLevelBounds(level('lessThan'))).toBeNull();
		expect(alertLevelBounds(level('range', { min: 18 }))).toBeNull();
		expect(alertLevelBounds(level('range', { min: 30, max: 20 }))).toBeNull();
	});
});

describe('alertLevelScale', () => {
	it('shows every level with room on both sides, on round numbers', () => {
		expect(
			alertLevelScale([
				level('lessThan', { value: 5 }),
				level('range', { min: 18, max: 26 }),
				level('greaterThan', { value: 30 })
			])
		).toEqual({ min: -10, max: 40 });
	});

	it('gives a single value a stretch of scale around it', () => {
		expect(alertLevelScale([level('greaterThan', { value: 30 })])).toEqual({ min: 10, max: 50 });
		expect(alertLevelScale([level('equals', { value: 0 })])).toEqual({ min: -10, max: 10 });
	});

	it('handles small and large numbers alike', () => {
		expect(alertLevelScale([level('range', { min: 0.2, max: 0.8 })])).toEqual({
			min: -0.5,
			max: 1.5
		});
		// 0.1 steps: no 0.30000000000000004.
		expect(alertLevelScale([level('range', { min: 0.12, max: 0.31 })])).toEqual({
			min: 0,
			max: 0.4
		});
		expect(alertLevelScale([level('greaterThan', { value: 1000 })])).toEqual({
			min: 400,
			max: 1600
		});
	});

	it('has none while no level is complete', () => {
		expect(alertLevelScale([])).toBeNull();
		expect(alertLevelScale([level('lessThan')])).toBeNull();
	});
});

describe('alertLevelBand', () => {
	const scale = { min: -10, max: 40 };

	it('places each kind of level on the scale', () => {
		expect(alertLevelBand(level('lessThan', { value: 5 }), scale)).toEqual({
			left: 0,
			width: 30,
			mark: false
		});
		expect(alertLevelBand(level('range', { min: 18, max: 26 }), scale)).toEqual({
			left: 56,
			width: 16,
			mark: false
		});
		expect(alertLevelBand(level('greaterThan', { value: 30 }), scale)).toEqual({
			left: 80,
			width: 20,
			mark: false
		});
	});

	it('draws "exactly" as a mark without width', () => {
		expect(alertLevelBand(level('equals', { value: 15 }), scale)).toEqual({
			left: 50,
			width: 0,
			mark: true
		});
	});

	it('keeps a level inside the scale, and has nothing for an incomplete one', () => {
		expect(alertLevelBand(level('range', { min: -50, max: 90 }), scale)).toEqual({
			left: 0,
			width: 100,
			mark: false
		});
		expect(alertLevelBand(level('range', { min: 18 }), scale)).toBeNull();
	});
});

describe('alertLevelTicks', () => {
	const scale = { min: -10, max: 40 };
	const levels = [
		level('lessThan', { value: 5 }),
		level('range', { min: 18, max: 26 }),
		level('greaterThan', { value: 30 })
	];

	it('labels the two ends and every boundary, left to right', () => {
		expect(alertLevelTicks(levels, scale).map((tick) => [tick.value, tick.left, tick.edge])).toEqual([
			[-10, 0, true],
			[5, 30, false],
			[18, 56, false],
			[26, 72, false],
			[30, 80, false],
			[40, 100, true]
		]);
	});

	it('leaves out a number that would sit on another: boundaries win over the ends', () => {
		const crowded = [level('greaterThan', { value: 39 }), level('range', { min: 20, max: 22 })];
		expect(alertLevelTicks(crowded, scale).map((tick) => tick.value)).toEqual([-10, 20, 39]);
	});

	it('names a boundary shared by two levels once', () => {
		const touching = [level('lessThan', { value: 10 }), level('greaterThan', { value: 10 })];
		expect(alertLevelTicks(touching, scale).map((tick) => tick.value)).toEqual([-10, 10, 40]);
	});
});

describe('nextAlertLevelColor', () => {
	it('gives the first palette colour no level uses, whatever its case', () => {
		expect(nextAlertLevelColor([])).toBe(CW_ALERT_LEVEL_COLORS[0]);
		expect(nextAlertLevelColor([{ color: '#3987E5' }])).toBe(CW_ALERT_LEVEL_COLORS[1]);
		expect(nextAlertLevelColor([{ color: '#da5e2d' }])).toBe(CW_ALERT_LEVEL_COLORS[0]);
	});

	it('starts the palette over when every colour is taken', () => {
		const all = CW_ALERT_LEVEL_COLORS.map((color) => ({ color }));
		expect(nextAlertLevelColor(all)).toBe(CW_ALERT_LEVEL_COLORS[0]);
		expect(nextAlertLevelColor([...all, { color: '#000000' }])).toBe(CW_ALERT_LEVEL_COLORS[1]);
	});
});
