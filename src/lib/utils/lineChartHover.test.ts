import { describe, expect, it } from 'vitest';
import { hoverPoint, nearestPointIndex } from './lineChartHover.js';

const MIN = 60_000;
/** Readings every 15 minutes from t = 1000 minutes. */
const SERIES = [
	{ t: 1000 * MIN, v: 10 },
	{ t: 1015 * MIN, v: 12 },
	{ t: 1030 * MIN, v: 14 }
];

describe('nearestPointIndex', () => {
	it('finds the nearest reading on either side', () => {
		expect(nearestPointIndex(SERIES, 1006 * MIN)).toBe(0);
		expect(nearestPointIndex(SERIES, 1009 * MIN)).toBe(1);
		expect(nearestPointIndex(SERIES, 1015 * MIN)).toBe(1);
		expect(nearestPointIndex(SERIES, 0)).toBe(0);
		expect(nearestPointIndex(SERIES, 5000 * MIN)).toBe(2);
		expect(nearestPointIndex([], 1000 * MIN)).toBe(-1);
	});
});

describe('hoverPoint', () => {
	it('shows the nearest reading once the series has data', () => {
		expect(hoverPoint(SERIES, 1009 * MIN)).toEqual(SERIES[1]);
		expect(hoverPoint(SERIES, 1000 * MIN)).toEqual(SERIES[0]);
		// After the last reading it still shows that (past) reading.
		expect(hoverPoint(SERIES, 1200 * MIN)).toEqual(SERIES[2]);
	});

	it('shows nothing before the series has its first reading', () => {
		// A day earlier: the first reading had not been taken yet.
		expect(hoverPoint(SERIES, (1000 - 24 * 60) * MIN)).toBeNull();
		expect(hoverPoint(SERIES, 999 * MIN)).toBeNull();
	});

	it('still picks the first reading when the cursor is within the snap distance of it', () => {
		expect(hoverPoint(SERIES, 999 * MIN, 2 * MIN)).toEqual(SERIES[0]);
		expect(hoverPoint(SERIES, 997 * MIN, 2 * MIN)).toBeNull();
	});

	it('counts the first real reading, not leading gaps', () => {
		const late = [{ t: 900 * MIN, v: null }, ...SERIES];
		expect(hoverPoint(late, 950 * MIN)).toBeNull();
		expect(hoverPoint(late, 1001 * MIN)).toEqual(SERIES[0]);
		expect(hoverPoint([{ t: 900 * MIN, v: Number.NaN }, ...SERIES], 950 * MIN)).toBeNull();
	});

	it('shows nothing for a series without readings, or when the nearest point is a gap', () => {
		expect(hoverPoint([], 1000 * MIN)).toBeNull();
		expect(hoverPoint([{ t: 1000 * MIN, v: null }], 1000 * MIN)).toBeNull();
		const gap = [SERIES[0], { t: 1015 * MIN, v: null }, SERIES[2]];
		expect(hoverPoint(gap, 1015 * MIN)).toBeNull();
	});
});
