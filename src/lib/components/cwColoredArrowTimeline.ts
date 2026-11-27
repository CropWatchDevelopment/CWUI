/**
 * Data model and pure logic for `CwColoredArrowTimeline`: which colour each
 * step gets and when the timeline turns vertical.
 *
 * Kept out of the component so the rules are unit-tested.
 */

/** One step on the timeline. All text arrives already translated. */
export interface CwColoredArrowTimelineItem {
	/** Stable key for the list. Defaults to the item's position. */
	id?: string | number;
	/**
	 * The date shown above the arrow, formatted by your app
	 * ("Apr 2026", "2026年4月", "Q2", "Week 14").
	 */
	date: string;
	/**
	 * Machine-readable date for the `datetime` attribute (`2026-04`,
	 * `2026-04-15`). When set, the date renders in a `<time>` element.
	 */
	datetime?: string;
	/** Heading under the arrow. */
	title: string;
	/** Optional text under the title. */
	description?: string;
	/**
	 * Any CSS colour. Defaults to the shared categorical chart palette
	 * (`--cw-chart-cat-1` … `--cw-chart-cat-8`), one colour per step.
	 */
	color?: string;
	/** Grey this step out, e.g. for steps that have not happened yet. */
	muted?: boolean;
}

/** `auto` turns vertical when the columns would be narrower than `minItemWidth`. */
export type CwColoredArrowTimelineOrientation = 'horizontal' | 'vertical' | 'auto';

/**
 * Default step colours: the shared categorical chart palette. Every pair of
 * neighbours differs in hue, including the wrap from the 8th back to the 1st.
 */
export const CW_COLORED_ARROW_TIMELINE_PALETTE: readonly string[] = [
	'var(--cw-chart-cat-1)',
	'var(--cw-chart-cat-2)',
	'var(--cw-chart-cat-3)',
	'var(--cw-chart-cat-4)',
	'var(--cw-chart-cat-5)',
	'var(--cw-chart-cat-6)',
	'var(--cw-chart-cat-7)',
	'var(--cw-chart-cat-8)'
];

/** Columns narrower than this (px) make an `auto` timeline vertical. */
export const CW_COLORED_ARROW_TIMELINE_MIN_ITEM_WIDTH = 160;

/**
 * The colour for the step at `index`: its own `color`, or the palette colour
 * for its position. Muted steps keep their colour here, so a step coloured
 * once keeps the same colour after it is un-muted.
 */
export function cwColoredArrowTimelineColor(
	item: Pick<CwColoredArrowTimelineItem, 'color'>,
	index: number
): string {
	const own = item.color?.trim();
	if (own) return own;
	const palette = CW_COLORED_ARROW_TIMELINE_PALETTE;
	const slot = ((Math.trunc(index) % palette.length) + palette.length) % palette.length;
	return palette[slot];
}

/**
 * The orientation to draw. `auto` stays horizontal until the container has
 * been measured (`width` is 0 or missing), so server-rendered markup matches
 * the first client render.
 */
export function resolveCwColoredArrowTimelineOrientation(
	orientation: CwColoredArrowTimelineOrientation,
	width: number | null | undefined,
	count: number,
	minItemWidth: number = CW_COLORED_ARROW_TIMELINE_MIN_ITEM_WIDTH
): 'horizontal' | 'vertical' {
	if (orientation !== 'auto') return orientation;
	if (!width || width <= 0 || count <= 0) return 'horizontal';
	return width / count < minItemWidth ? 'vertical' : 'horizontal';
}
