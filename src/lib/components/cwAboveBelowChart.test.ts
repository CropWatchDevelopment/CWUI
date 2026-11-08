import { describe, expect, it } from 'vitest';
import {
	cwAboveBelowBar,
	cwAboveBelowColorFor,
	cwAboveBelowIconFor,
	cwAboveBelowStatusTone,
	formatCwTargetRange,
	isCwSummaryEmpty,
	judgeCwReading,
	summarizeCwReadings
} from './cwAboveBelowChart.js';

describe('summarizeCwReadings', () => {
	it('works out now, low, average and high from bare numbers', () => {
		expect(summarizeCwReadings([14, null, 22.7, Number.NaN, 17])).toEqual({
			current: 17,
			min: 14,
			avg: (14 + 22.7 + 17) / 3,
			max: 22.7,
			count: 3
		});
	});

	it('takes "now" from the latest time, whatever the order', () => {
		const summary = summarizeCwReadings([
			{ t: '2026-11-08T04:52:00Z', v: 20.9 },
			{ t: '2026-11-08T04:17:00Z', v: 21.4 },
			{ t: new Date('2026-11-08T04:34:00Z'), v: null },
			{ t: Date.parse('2026-11-07T22:00:00Z'), v: 14 }
		]);
		expect(summary.current).toBe(20.9);
		expect(summary.min).toBe(14);
		expect(summary.max).toBe(21.4);
		expect(summary.count).toBe(3);
	});

	it('lets an explicit current value and figures win', () => {
		const summary = summarizeCwReadings([1, 2, 3], { current: 9, stats: { min: 0, avg: null, max: 10 } });
		expect(summary).toEqual({ current: 9, min: 0, avg: 2, max: 10, count: 3 });
	});

	it('has nothing to show without readings', () => {
		const summary = summarizeCwReadings(undefined);
		expect(summary).toEqual({ current: null, min: null, avg: null, max: null, count: 0 });
		expect(isCwSummaryEmpty(summary)).toBe(true);
		expect(isCwSummaryEmpty(summarizeCwReadings([], { current: 4 }))).toBe(false);
	});
});

describe('judgeCwReading', () => {
	const target = { min: 12, optimalMin: 20, optimalMax: 25, max: 35 };

	it('places a value against the band and the stress limits', () => {
		expect(judgeCwReading(11, target)).toBe('too_low');
		expect(judgeCwReading(15, target)).toBe('low');
		expect(judgeCwReading(23.6, target)).toBe('optimal');
		expect(judgeCwReading(20, target)).toBe('optimal');
		expect(judgeCwReading(30, target)).toBe('high');
		expect(judgeCwReading(36, target)).toBe('too_high');
	});

	it('handles open-ended bands', () => {
		expect(judgeCwReading(19, { optimalMin: 20 })).toBe('low');
		expect(judgeCwReading(400, { optimalMin: 20 })).toBe('optimal');
		expect(judgeCwReading(46.2, { min: 12.5, optimalMin: 19.3, optimalMax: 24.2 })).toBe('high');
	});

	it('does not judge without a value or an optimal bound', () => {
		expect(judgeCwReading(null, target)).toBeNull();
		expect(judgeCwReading(5, null)).toBeNull();
		expect(judgeCwReading(50, { max: 90 })).toBeNull();
		expect(judgeCwReading(95, { max: 90 })).toBe('too_high');
	});

	it('maps statuses to chip tones', () => {
		expect(cwAboveBelowStatusTone('optimal')).toBe('success');
		expect(cwAboveBelowStatusTone('low')).toBe('warning');
		expect(cwAboveBelowStatusTone('high')).toBe('warning');
		expect(cwAboveBelowStatusTone('too_low')).toBe('danger');
		expect(cwAboveBelowStatusTone('too_high')).toBe('danger');
	});
});

describe('cwAboveBelowBar', () => {
	const summary = { current: 23.6, min: 5.7, avg: 14.1, max: 26, count: 84 };

	it('places every mark on a scale padded 8 % past the readings and the band', () => {
		// Scale: 5.7 … 26 (the band 20–25 is inside), padded by 1.624 each side.
		const bar = cwAboveBelowBar(summary, { optimalMin: 20, optimalMax: 25 });
		expect(bar?.span?.left).toBeCloseTo(6.9, 1);
		expect(bar?.span?.width).toBeCloseTo(86.2, 1);
		expect(bar?.avg).toBeCloseTo(42.6, 1);
		expect(bar?.now).toBeCloseTo(82.9, 1);
		expect(bar?.band?.left).toBeCloseTo(67.6, 1);
		expect(bar?.band?.width).toBeCloseTo(21.2, 1);
	});

	it('widens the scale to show a band far from the readings', () => {
		const moisture = { current: 46.2, min: 46.2, avg: 47.1, max: 51.3, count: 84 };
		const bar = cwAboveBelowBar(moisture, { optimalMin: 19.3, optimalMax: 24.2 });
		expect(bar?.band?.left).toBeCloseTo(6.9, 1);
		expect(bar?.span?.left).toBeGreaterThan(70);
	});

	it('runs an open-ended band to the edge of the scale', () => {
		const bar = cwAboveBelowBar({ current: 500, min: 380, avg: 640, max: 915, count: 10 }, { optimalMin: 600 });
		expect((bar?.band?.left ?? 0) + (bar?.band?.width ?? 0)).toBe(100);
	});

	it('copes with a single reading and with nothing at all', () => {
		const single = cwAboveBelowBar({ current: 0.23, min: 0.23, avg: 0.23, max: 0.23, count: 1 });
		expect(single?.now).toBe(50);
		expect(single?.span).toEqual({ left: 50, width: 0 });
		expect(single?.band).toBeNull();
		expect(cwAboveBelowBar({ current: null, min: null, avg: null, max: null, count: 0 })).toBeNull();
	});
});

describe('formatCwTargetRange', () => {
	it('shows the optimal band, or the stress limits without one', () => {
		expect(formatCwTargetRange({ optimalMin: 20, optimalMax: 25 }, { unit: '°C', locale: 'en' })).toBe(
			'20–25°C'
		);
		expect(formatCwTargetRange({ optimalMin: 19.3, optimalMax: 24.2 }, { unit: '%', locale: 'en' })).toBe(
			'19.3–24.2%'
		);
		expect(formatCwTargetRange({ optimalMin: 600 }, { unit: 'ppm', decimals: 0, locale: 'en' })).toBe(
			'≥ 600\u00a0ppm'
		);
		expect(formatCwTargetRange({ max: 90 }, { unit: '%', locale: 'en' })).toBe('≤ 90%');
		expect(formatCwTargetRange({}, { unit: '%' })).toBeNull();
		expect(formatCwTargetRange(null)).toBeNull();
	});

	it('formats for the locale', () => {
		expect(formatCwTargetRange({ optimalMin: 1200, optimalMax: 1500.5 }, { locale: 'de' })).toBe(
			'1.200–1.500,5'
		);
	});
});

describe('icons and colours', () => {
	it('picks an icon from the metric key', () => {
		expect(cwAboveBelowIconFor('air_temperature')).toBe('thermometer');
		expect(cwAboveBelowIconFor('temperature_c')).toBe('thermometer');
		expect(cwAboveBelowIconFor('air_humidity')).toBe('humidity');
		expect(cwAboveBelowIconFor('co2')).toBe('co2');
		expect(cwAboveBelowIconFor('soil_moisture')).toBe('moisture');
		expect(cwAboveBelowIconFor('soil_ec')).toBe('ec');
		expect(cwAboveBelowIconFor('soil_ph')).toBe('ph');
		expect(cwAboveBelowIconFor('vpd')).toBe('vpd');
		expect(cwAboveBelowIconFor('ppfd')).toBe('light');
		expect(cwAboveBelowIconFor('dew_point')).toBe('generic');
	});

	it('uses the CropWatch metric colour unless one is given', () => {
		expect(cwAboveBelowColorFor({ key: 'soil_moisture' })).toBe('#119a8b');
		expect(cwAboveBelowColorFor({ key: 'soil_moisture', color: 'red' })).toBe('red');
	});
});
