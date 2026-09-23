import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildCalendarScrollEntries } from './cwCalendarScrollUtils.js';

describe('buildCalendarScrollEntries', () => {
	const originalTz = process.env.TZ;

	beforeAll(() => {
		// US spring-forward: 2024-03-10 is only 23 hours long.
		process.env.TZ = 'America/New_York';
	});

	afterAll(() => {
		process.env.TZ = originalTz;
	});

	it('includes the last day when the range spans a DST spring-forward', () => {
		const rows = buildCalendarScrollEntries({
			items: [],
			showAllDates: true,
			startDate: '2024-03-09',
			endDate: '2024-03-12'
		});

		expect(rows.map((row) => row.key)).toEqual([
			'2024-03-09',
			'2024-03-10',
			'2024-03-11',
			'2024-03-12'
		]);
	});

	it('includes every day when the range spans a DST fall-back', () => {
		const rows = buildCalendarScrollEntries({
			items: [],
			showAllDates: true,
			startDate: '2024-11-02',
			endDate: '2024-11-04'
		});

		expect(rows.map((row) => row.key)).toEqual(['2024-11-02', '2024-11-03', '2024-11-04']);
	});

	it('only shows rows with data when showAllDates is false', () => {
		const rows = buildCalendarScrollEntries({
			items: [{ date: '2024-05-01' }, { date: '2024-05-03' }],
			showAllDates: false
		});

		expect(rows.map((row) => row.key)).toEqual(['2024-05-01', '2024-05-03']);
	});
});
