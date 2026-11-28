import { describe, expect, it } from 'vitest';
import {
	activeIndexFor,
	filterBySearch,
	firstEnabledIndex,
	matchesSearch,
	normalizeSearchText
} from './cwSelectSearch.js';

const option = (label: string, extra: { value?: string; disabled?: boolean } = {}) => ({
	label,
	value: extra.value ?? label,
	...(extra.disabled ? { disabled: true } : {})
});

describe('normalizeSearchText', () => {
	it('ignores case and surrounding spaces', () => {
		expect(normalizeSearchText('  Greenhouse 1 ')).toBe('greenhouse 1');
	});

	it('folds full-width letters and digits and half-width kana onto their usual forms', () => {
		expect(normalizeSearchText('ＡＢ１２')).toBe('ab12');
		expect(normalizeSearchText('ｾﾝｻｰ')).toBe(normalizeSearchText('センサー'));
	});
});

describe('matchesSearch', () => {
	it('matches anywhere in the label, whatever the case', () => {
		expect(matchesSearch('Pump relay (A840410000000002)', 'RELAY')).toBe(true);
		expect(matchesSearch('Pump relay (A840410000000002)', '0002')).toBe(true);
		expect(matchesSearch('Pump relay (A840410000000002)', 'fan')).toBe(false);
	});

	it('matches everything for an empty or blank query', () => {
		expect(matchesSearch('anything', '')).toBe(true);
		expect(matchesSearch('anything', '   ')).toBe(true);
	});

	it('finds Japanese labels typed in another width', () => {
		expect(matchesSearch('冷凍庫センサー A1', 'ｾﾝｻｰ')).toBe(true);
		expect(matchesSearch('冷凍庫センサー A1', 'ａ１')).toBe(true);
		expect(matchesSearch('冷凍庫センサー A1', '冷蔵')).toBe(false);
	});
});

describe('filterBySearch', () => {
	const options = [option('North barn'), option('South barn'), option('Greenhouse', { disabled: true })];

	it('keeps the matching options in their order', () => {
		expect(filterBySearch(options, 'barn').map((o) => o.label)).toEqual(['North barn', 'South barn']);
		expect(filterBySearch(options, 'green').map((o) => o.label)).toEqual(['Greenhouse']);
	});

	it('returns every option, as a new list, for an empty query', () => {
		const all = filterBySearch(options, ' ');
		expect(all).toEqual(options);
		expect(all).not.toBe(options);
	});

	it('returns nothing when nothing matches', () => {
		expect(filterBySearch(options, 'cellar')).toEqual([]);
	});
});

describe('firstEnabledIndex', () => {
	const options = [option('a', { disabled: true }), option('b'), option('c', { disabled: true }), option('d')];

	it('skips disabled options going forward', () => {
		expect(firstEnabledIndex(options)).toBe(1);
		expect(firstEnabledIndex(options, 2)).toBe(3);
	});

	it('skips disabled options going backward', () => {
		expect(firstEnabledIndex(options, 2, -1)).toBe(1);
		expect(firstEnabledIndex(options, 3, -1)).toBe(3);
	});

	it('answers -1 when there is none, or the start is outside the list', () => {
		expect(firstEnabledIndex([option('a', { disabled: true })])).toBe(-1);
		expect(firstEnabledIndex([])).toBe(-1);
		expect(firstEnabledIndex(options, 4)).toBe(-1);
		expect(firstEnabledIndex(options, -1, -1)).toBe(-1);
	});
});

describe('activeIndexFor', () => {
	const options = [option('a', { disabled: true }), option('b'), option('c')];

	it('keeps the selected option active when it is listed and enabled', () => {
		expect(activeIndexFor(options, 'c')).toBe(2);
	});

	it('falls back to the first enabled option', () => {
		expect(activeIndexFor(options, 'missing')).toBe(1);
		expect(activeIndexFor(options, undefined)).toBe(1);
		// A selected option that is disabled is not a place to start from.
		expect(activeIndexFor(options, 'a')).toBe(1);
	});

	it('answers -1 for an empty list', () => {
		expect(activeIndexFor([], 'a')).toBe(-1);
	});
});
