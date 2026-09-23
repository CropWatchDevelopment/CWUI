/**
 * Responsive layout resolution for {@link CwResponsiveLineChart}.
 *
 * ## Why this measures the border box
 *
 * The chart picks its layout from its own measured width. Several of the
 * classes it applies as a result — `.cw-rlc--phone`, `.cw-rlc--phone-land`,
 * `.cw-rlc--xs` — change the element's `padding` (20px at rest, 12px on phone,
 * 8px on xs). `.cw-rlc` is `box-sizing: border-box`, so padding comes out of
 * the *content* box.
 *
 * Measuring the content box therefore closes a loop: the class the width
 * selects changes the width being measured, which can select a different
 * class, forever. A chart just above the xs threshold reads a content width
 * below it (xs on), repads smaller, reads a width above it (xs off), repads
 * larger, and so on. The visible symptom is a chart that vibrates, and it
 * pegs the renderer. The same trap sits at the 520px phone/tablet boundary.
 *
 * The border-box width does not depend on the element's own padding, so
 * resolving against it breaks the loop at every breakpoint at once. That is
 * the invariant `lineChartLayout.test.ts` pins down: for a given outer width,
 * the decision must be the same whatever padding the chart is currently
 * applying.
 *
 * Thresholds are expressed in outer width. They are the space the chart has
 * been given, which is what the breakpoints were always trying to describe.
 */

import type { CwResponsiveLineLayout } from '../types/index.js';

/** Layout used before the first measurement lands (SSR and first paint). */
export const CW_RLC_DEFAULT_WIDTH = 1024;

/** Outer width below which the chart uses its extra-small typography. */
export const CW_RLC_XS_MAX = 380;

export interface CwLineChartLayoutDecision {
	layout: Exclude<CwResponsiveLineLayout, 'auto'>;
	/** Apply `.cw-rlc--xs` (tighter type and padding). */
	xs: boolean;
}

/**
 * Resolve the layout for a chart whose **border-box** width is `width`.
 *
 * `width` of 0 means "not measured yet" and falls back to
 * {@link CW_RLC_DEFAULT_WIDTH}; `xs` stays off in that case so an unmeasured
 * chart never flashes the smallest typography.
 */
export function resolveLineChartLayout(
	width: number,
	explicit: CwResponsiveLineLayout = 'auto'
): CwLineChartLayoutDecision {
	const measured = width > 0;
	const w = measured ? width : CW_RLC_DEFAULT_WIDTH;
	const xs = measured && w < CW_RLC_XS_MAX;

	if (explicit !== 'auto') return { layout: explicit, xs };

	if (w < 520) return { layout: 'phone', xs };
	if (w < 820) return { layout: 'tablet', xs };
	if (w < 1100) return { layout: 'tablet-land', xs };
	return { layout: 'desktop', xs };
}
