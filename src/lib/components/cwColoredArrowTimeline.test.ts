import { describe, expect, it } from 'vitest';
import {
	CW_COLORED_ARROW_TIMELINE_MIN_ITEM_WIDTH,
	CW_COLORED_ARROW_TIMELINE_PALETTE,
	cwColoredArrowTimelineColor,
	resolveCwColoredArrowTimelineOrientation
} from './cwColoredArrowTimeline.js';

describe('cwColoredArrowTimelineColor', () => {
	it('gives each of the first eight steps its own palette colour', () => {
		const colors = Array.from({ length: 8 }, (_, i) => cwColoredArrowTimelineColor({}, i));
		expect(new Set(colors).size).toBe(8);
		expect(colors[0]).toBe('var(--cw-chart-cat-1)');
		expect(colors[7]).toBe('var(--cw-chart-cat-8)');
	});

	it('never repeats a colour on neighbouring steps, even after wrapping', () => {
		for (let i = 0; i < 24; i++) {
			expect(cwColoredArrowTimelineColor({}, i)).not.toBe(cwColoredArrowTimelineColor({}, i + 1));
		}
	});

	it('wraps back to the first colour after the palette runs out', () => {
		const n = CW_COLORED_ARROW_TIMELINE_PALETTE.length;
		expect(cwColoredArrowTimelineColor({}, n)).toBe(cwColoredArrowTimelineColor({}, 0));
		expect(cwColoredArrowTimelineColor({}, n + 3)).toBe(cwColoredArrowTimelineColor({}, 3));
	});

	it('uses the item colour when one is given', () => {
		expect(cwColoredArrowTimelineColor({ color: '#006045' }, 2)).toBe('#006045');
		expect(cwColoredArrowTimelineColor({ color: ' var(--brand) ' }, 0)).toBe('var(--brand)');
	});

	it('ignores a blank item colour', () => {
		expect(cwColoredArrowTimelineColor({ color: '  ' }, 1)).toBe('var(--cw-chart-cat-2)');
	});

	it('copes with negative and fractional indexes', () => {
		expect(cwColoredArrowTimelineColor({}, -1)).toBe('var(--cw-chart-cat-8)');
		expect(cwColoredArrowTimelineColor({}, 2.7)).toBe('var(--cw-chart-cat-3)');
	});
});

describe('resolveCwColoredArrowTimelineOrientation', () => {
	it('returns a fixed orientation unchanged', () => {
		expect(resolveCwColoredArrowTimelineOrientation('horizontal', 200, 8)).toBe('horizontal');
		expect(resolveCwColoredArrowTimelineOrientation('vertical', 2000, 2)).toBe('vertical');
	});

	it('stays horizontal until the width is known', () => {
		expect(resolveCwColoredArrowTimelineOrientation('auto', undefined, 6)).toBe('horizontal');
		expect(resolveCwColoredArrowTimelineOrientation('auto', 0, 6)).toBe('horizontal');
	});

	it('turns vertical when columns would be narrower than the minimum', () => {
		const min = CW_COLORED_ARROW_TIMELINE_MIN_ITEM_WIDTH;
		expect(resolveCwColoredArrowTimelineOrientation('auto', min * 4, 4)).toBe('horizontal');
		expect(resolveCwColoredArrowTimelineOrientation('auto', min * 4 - 1, 4)).toBe('vertical');
	});

	it('honours a custom minimum column width', () => {
		expect(resolveCwColoredArrowTimelineOrientation('auto', 600, 4, 120)).toBe('horizontal');
		expect(resolveCwColoredArrowTimelineOrientation('auto', 600, 4, 200)).toBe('vertical');
	});

	it('stays horizontal with no items', () => {
		expect(resolveCwColoredArrowTimelineOrientation('auto', 300, 0)).toBe('horizontal');
	});
});
