/**
 * Shared number / measurement formatting so every card, table and chart
 * renders values the same way.
 *
 * - `null`, `undefined` and non-finite numbers render as the placeholder
 *   ("—" by default) instead of a fake `0`.
 * - Units are separated from the value by a non-breaking space, except for
 *   units that conventionally attach directly (`%`, `°`, `°C`, `°F`).
 */

export const CW_EMPTY_VALUE = '—';

export interface CwFormatNumberOptions {
	/** Exact number of fraction digits. Overrides min/max. */
	decimals?: number;
	minimumFractionDigits?: number;
	maximumFractionDigits?: number;
	/** BCP 47 locale; defaults to the runtime locale. */
	locale?: string | string[];
	/** Text shown for missing values. Defaults to "—". */
	empty?: string;
	/** Prefix positive numbers with "+" (useful for deltas). */
	signed?: boolean;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string | string[] | undefined, options: Intl.NumberFormatOptions) {
	const key = JSON.stringify([locale ?? null, options]);
	let formatter = formatterCache.get(key);
	if (!formatter) {
		formatter = new Intl.NumberFormat(locale, options);
		formatterCache.set(key, formatter);
	}
	return formatter;
}

export function isCwFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

export function formatCwNumber(
	value: number | null | undefined,
	options: CwFormatNumberOptions = {}
): string {
	if (!isCwFiniteNumber(value)) return options.empty ?? CW_EMPTY_VALUE;

	const min = options.decimals ?? options.minimumFractionDigits ?? 0;
	const max = options.decimals ?? options.maximumFractionDigits ?? Math.max(min, 2);

	return getFormatter(options.locale, {
		minimumFractionDigits: min,
		maximumFractionDigits: max,
		signDisplay: options.signed ? 'exceptZero' : 'auto'
	}).format(value);
}

const ATTACHED_UNITS = new Set(['%', '°', '°C', '°F', '℃', '℉']);

/** Joins a formatted value and unit with the library's spacing convention. */
export function joinCwUnit(formatted: string, unit: string | null | undefined): string {
	if (!unit) return formatted;
	const trimmed = unit.trim();
	if (!trimmed) return formatted;
	return ATTACHED_UNITS.has(trimmed) ? `${formatted}${trimmed}` : `${formatted} ${trimmed}`;
}

export function formatCwMeasurement(
	value: number | null | undefined,
	unit?: string | null,
	options: CwFormatNumberOptions = {}
): string {
	if (!isCwFiniteNumber(value)) return options.empty ?? CW_EMPTY_VALUE;
	return joinCwUnit(formatCwNumber(value, options), unit);
}
