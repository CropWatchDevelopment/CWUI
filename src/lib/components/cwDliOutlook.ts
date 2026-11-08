/**
 * Today's outlook for `CwDliCard`: from the light so far, the target and how
 * much of the day's light has fallen, what is still needed (or how much room
 * is left), whether the day's pace reaches the target, and how much light is
 * left. Pure, so it is unit-tested and apps only pass the day's progress.
 */
import { isCwFiniteNumber } from '../utils/cwFormat.js';

/** How far through its light the day is, which lets the DLI card look ahead. */
export interface CwDliDayProgress {
	/** Share (0–1) of today's light that has already fallen, from the sun's course at the location. */
	lightSoFar: number;
	/** When today's light ends: sunset, or the end of an assumed day. */
	lightEndsAt?: Date | string | number | null;
	/** `lightEndsAt` is an assumed end of the day (the location has no coordinates). */
	assumed?: boolean;
}

/**
 * - `behind` / `on_track`: below the target, and the day's pace points
 *   below / into it.
 * - `reached`: inside the target.
 * - `above`: past its upper end.
 */
export type CwDliOutlookStatus = 'behind' | 'on_track' | 'reached' | 'above';

export interface CwDliOutlook {
	/** What `amount` is: still needed to reach the target, room left inside it, or past it. */
	kind: 'needed' | 'room' | 'over';
	/** Daily light for that figure (≥ 0); null for room left under an open upper end. */
	amount: number | null;
	/** Share (0–1) of today's light still to come. */
	lightLeft: number;
	/** Where the day ends at its pace so far; null until enough of the day has passed. */
	projected: number | null;
	status: CwDliOutlookStatus | null;
}

/** Share of the day's light that has to have fallen before the pace is projected. */
export const CW_DLI_OUTLOOK_MIN_SHARE = 0.15;

/** Share of the day's light after which the day counts as over. */
const DAY_OVER_SHARE = 0.999;

/**
 * The outlook, or null without a reading, a target or the day's progress, and
 * once the day's light is over (the card's final status takes over then).
 */
export function cwDliOutlook(
	value: number | null | undefined,
	targetMin: number | null | undefined,
	targetMax: number | null | undefined,
	day: CwDliDayProgress | null | undefined
): CwDliOutlook | null {
	if (!day || !isCwFiniteNumber(day.lightSoFar) || !isCwFiniteNumber(value)) return null;
	const min = isCwFiniteNumber(targetMin) ? targetMin : null;
	const max = isCwFiniteNumber(targetMax) ? targetMax : null;
	if (min === null && max === null) return null;

	const done = Math.min(1, Math.max(0, day.lightSoFar));
	if (done >= DAY_OVER_SHARE) return null;
	const lightLeft = 1 - done;
	const projected = done >= CW_DLI_OUTLOOK_MIN_SHARE ? value / done : null;

	if (max !== null && value > max) {
		return { kind: 'over', amount: value - max, lightLeft, projected, status: 'above' };
	}
	if (min === null || value >= min) {
		return {
			kind: 'room',
			amount: max === null ? null : max - value,
			lightLeft,
			projected,
			status: min === null ? null : 'reached'
		};
	}
	return {
		kind: 'needed',
		amount: min - value,
		lightLeft,
		projected,
		status: projected === null ? null : projected >= min ? 'on_track' : 'behind'
	};
}
