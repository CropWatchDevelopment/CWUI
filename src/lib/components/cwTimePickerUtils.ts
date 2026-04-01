import type { CwTimeValue } from '../types/index.js';

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function toSafeInteger(value: unknown, fallback: number): number {
	const parsed = typeof value === 'number' ? value : Number(value);
	return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function wrap(totalMinutes: number): number {
	return ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

export function normalizeMinuteStep(step: number): number {
	return clamp(toSafeInteger(step, 1), 1, 30);
}

export function formatTimeSegment(value: number): string {
	return clamp(toSafeInteger(value, 0), 0, 99).toString().padStart(2, '0');
}

export function snapMinutes(minutes: number, minuteStep = 1): number {
	const safeStep = normalizeMinuteStep(minuteStep);
	const maxMinute = Math.floor((MINUTES_PER_HOUR - 1) / safeStep) * safeStep;
	const rounded = Math.round(toSafeInteger(minutes, 0) / safeStep) * safeStep;
	return clamp(rounded, 0, maxMinute);
}

export function sanitizeTimeValue(value: Partial<CwTimeValue> | null | undefined, minuteStep = 1): CwTimeValue {
	return {
		hours: clamp(toSafeInteger(value?.hours, 0), 0, HOURS_PER_DAY - 1),
		minutes: snapMinutes(toSafeInteger(value?.minutes, 0), minuteStep)
	};
}

export function isSameTimeValue(a: CwTimeValue | null | undefined, b: CwTimeValue | null | undefined): boolean {
	return a?.hours === b?.hours && a?.minutes === b?.minutes;
}

export function format24HourTime(value: CwTimeValue): string {
	const safeValue = sanitizeTimeValue(value);
	return `${formatTimeSegment(safeValue.hours)}:${formatTimeSegment(safeValue.minutes)}`;
}

export function format12HourTime(value: CwTimeValue): string {
	const safeValue = sanitizeTimeValue(value);
	const meridiem = safeValue.hours >= 12 ? 'PM' : 'AM';
	const displayHours = safeValue.hours % 12 || 12;
	return `${displayHours}:${formatTimeSegment(safeValue.minutes)} ${meridiem}`;
}

export function addHours(value: CwTimeValue, delta: number): CwTimeValue {
	const safeValue = sanitizeTimeValue(value);
	return {
		hours: ((safeValue.hours + toSafeInteger(delta, 0)) % HOURS_PER_DAY + HOURS_PER_DAY) % HOURS_PER_DAY,
		minutes: safeValue.minutes
	};
}

export function addMinutes(value: CwTimeValue, direction: number, minuteStep = 1): CwTimeValue {
	const safeStep = normalizeMinuteStep(minuteStep);
	const safeValue = sanitizeTimeValue(value, safeStep);
	const totalMinutes =
		safeValue.hours * MINUTES_PER_HOUR +
		safeValue.minutes +
		toSafeInteger(direction, 0) * safeStep;
	const wrappedMinutes = wrap(totalMinutes);

	return {
		hours: Math.floor(wrappedMinutes / MINUTES_PER_HOUR),
		minutes: snapMinutes(wrappedMinutes % MINUTES_PER_HOUR, safeStep)
	};
}
