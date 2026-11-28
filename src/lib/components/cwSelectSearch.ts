/**
 * The search and keyboard-movement rules shared by CwDropdown and
 * CwMultiSelect. Pure functions, so they can be tested without a browser.
 */

/**
 * Text as the search compares it: case-insensitive, and with full-width
 * letters and digits and half-width kana folded onto their usual forms
 * (NFKC), so "ＡＢ１" finds "ab1" and "ｾﾝｻｰ" finds "センサー".
 */
export function normalizeSearchText(text: string): string {
	return text.normalize('NFKC').toLowerCase().trim();
}

/** Whether `label` contains the query. An empty query matches everything. */
export function matchesSearch(label: string, query: string): boolean {
	const wanted = normalizeSearchText(query);
	return wanted === '' || normalizeSearchText(label).includes(wanted);
}

/** The options whose label contains the query, in their original order. */
export function filterBySearch<T extends { label: string }>(options: readonly T[], query: string): T[] {
	const wanted = normalizeSearchText(query);
	if (wanted === '') return [...options];
	return options.filter((option) => normalizeSearchText(option.label).includes(wanted));
}

/**
 * The first option that is not disabled, looking from `start` in the
 * direction of `step`. -1 when there is none.
 */
export function firstEnabledIndex(
	options: readonly { disabled?: boolean }[],
	start = 0,
	step: 1 | -1 = 1
): number {
	for (let index = start; index >= 0 && index < options.length; index += step) {
		if (!options[index]?.disabled) return index;
	}
	return -1;
}

/**
 * Which option should be active after the list changed (for example after a
 * search): the selected one when it is still listed and enabled, else the
 * first enabled one, else none (-1).
 */
export function activeIndexFor(
	options: readonly { value: string; disabled?: boolean }[],
	selectedValue: string | undefined
): number {
	const selected = options.findIndex((option) => option.value === selectedValue && !option.disabled);
	return selected >= 0 ? selected : firstEnabledIndex(options);
}
