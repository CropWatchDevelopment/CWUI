/**
 * Hover readouts for {@link CwResponsiveLineChart}: which reading of a series
 * the crosshair tooltip, and the keyboard / screen-reader description, show
 * for the time under the cursor.
 *
 * It is the reading nearest to the cursor, except before a series has any
 * data. There the nearest reading is the series' first one, which can be hours
 * or days after the cursor (a sensor added later, a field only newer devices
 * report), and the tooltip would pair the cursor's earlier time with a value
 * that had not been measured yet. Such a series is left out of the readout.
 */
import type { CwResponsiveLineDataPoint } from '../types/index.js';

/** Pixels a cursor may sit short of a series' first reading and still pick it up. */
export const CW_RLC_HOVER_SNAP_PX = 4;

/** Index of the reading nearest to `t` in time-sorted `data`; -1 when empty. */
export function nearestPointIndex(data: CwResponsiveLineDataPoint[], t: number): number {
	if (!data.length) return -1;
	let lo = 0;
	let hi = data.length - 1;
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		if (data[mid].t < t) lo = mid + 1;
		else hi = mid;
	}
	if (lo > 0 && Math.abs(data[lo - 1].t - t) < Math.abs(data[lo].t - t)) return lo - 1;
	return lo;
}

/**
 * The reading a hover readout shows for one series at time `t`, or null to
 * leave the series out: no reading yet at `t` (its first one is more than
 * `snapMs` later), or the nearest reading is a gap (`v` null). `snapMs` is
 * the time {@link CW_RLC_HOVER_SNAP_PX} pixels span at the current zoom.
 */
export function hoverPoint(
	data: CwResponsiveLineDataPoint[],
	t: number,
	snapMs = 0
): CwResponsiveLineDataPoint | null {
	const first = data.find((point) => point.v != null && !Number.isNaN(point.v));
	if (!first || t < first.t - snapMs) return null;
	const point = data[nearestPointIndex(data, t)];
	return point && point.v != null ? point : null;
}
