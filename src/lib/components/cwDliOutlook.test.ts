import { describe, expect, it } from 'vitest';
import { cwDliOutlook } from './cwDliOutlook.js';

const SUNSET = '2026-11-08T08:21:00Z';

describe('cwDliOutlook', () => {
	it('says what is still needed, how much light is left and where the day is heading', () => {
		// 15.06 mol by 15:20 in Miyazaki, with 91.8 % of the day's light fallen.
		const outlook = cwDliOutlook(15.06, 20, 30, { lightSoFar: 0.918, lightEndsAt: SUNSET });

		expect(outlook?.kind).toBe('needed');
		expect(outlook?.amount).toBeCloseTo(4.94, 6);
		expect(outlook?.lightLeft).toBeCloseTo(0.082, 6);
		expect(outlook?.projected).toBeCloseTo(15.06 / 0.918, 6);
		expect(outlook?.status).toBe('behind');
	});

	it('is on track when the pace so far reaches the target', () => {
		expect(cwDliOutlook(12, 20, 30, { lightSoFar: 0.5 })?.status).toBe('on_track');
		expect(cwDliOutlook(8, 20, 30, { lightSoFar: 0.5 })?.status).toBe('behind');
	});

	it('does not project the pace early in the day', () => {
		expect(cwDliOutlook(0.5, 20, 30, { lightSoFar: 0.05 })).toEqual({
			kind: 'needed',
			amount: 19.5,
			lightLeft: 0.95,
			projected: null,
			status: null
		});
	});

	it('shows the room left inside the target, and the excess past it', () => {
		expect(cwDliOutlook(22, 20, 30, { lightSoFar: 0.7 })).toMatchObject({
			kind: 'room',
			amount: 8,
			status: 'reached'
		});
		expect(cwDliOutlook(31.5, 20, 30, { lightSoFar: 0.7 })).toMatchObject({
			kind: 'over',
			amount: 1.5,
			status: 'above'
		});
	});

	it('keeps an open end open', () => {
		expect(cwDliOutlook(22, 20, null, { lightSoFar: 0.7 })).toMatchObject({
			kind: 'room',
			amount: null,
			status: 'reached'
		});
		expect(cwDliOutlook(10, null, 30, { lightSoFar: 0.7 })).toMatchObject({
			kind: 'room',
			amount: 20,
			status: null
		});
	});

	it('has nothing to say without a reading, a target or the day, or once the light is over', () => {
		expect(cwDliOutlook(null, 20, 30, { lightSoFar: 0.5 })).toBeNull();
		expect(cwDliOutlook(10, null, null, { lightSoFar: 0.5 })).toBeNull();
		expect(cwDliOutlook(10, 20, 30, null)).toBeNull();
		expect(cwDliOutlook(10, 20, 30, { lightSoFar: Number.NaN })).toBeNull();
		expect(cwDliOutlook(15, 20, 30, { lightSoFar: 1 })).toBeNull();
	});
});
