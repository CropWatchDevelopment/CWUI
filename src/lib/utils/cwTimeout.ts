import type { CwDateTimeInput } from '../types/index.js';

export function resolveCwLastSeenAt(
	lastSeenAt?: CwDateTimeInput | null,
	lastUpdated?: CwDateTimeInput | null
): CwDateTimeInput | undefined {
	return lastSeenAt ?? lastUpdated ?? undefined;
}

export function resolveCwExpireAfterMinutes(
	expireAfterMinutes?: number | null,
	legacyExpireAfterMinutes?: number | null
): number | undefined {
	return expireAfterMinutes ?? legacyExpireAfterMinutes ?? undefined;
}

export function resolveCwDateTimeMs(value?: CwDateTimeInput | null): number | null {
	if (value == null) return null;

	const timestamp =
		value instanceof Date ? value.getTime() : typeof value === 'string' ? new Date(value).getTime() : value;

	return Number.isFinite(timestamp) ? timestamp : null;
}

export function resolveCwExpireAfterMs(
	expireAfterMinutes?: number | null,
	legacyExpireAfterMinutes?: number | null
): number | null {
	const resolvedMinutes = resolveCwExpireAfterMinutes(expireAfterMinutes, legacyExpireAfterMinutes);
	if (resolvedMinutes == null || !Number.isFinite(resolvedMinutes) || resolvedMinutes < 0) {
		return null;
	}

	return resolvedMinutes * 60_000;
}

export function isCwWithinTimeout(
	lastSeenAt?: CwDateTimeInput | null,
	expireAfterMinutes?: number | null,
	legacyExpireAfterMinutes?: number | null
): boolean | null {
	const lastSeenAtMs = resolveCwDateTimeMs(lastSeenAt);
	const expireAfterMs = resolveCwExpireAfterMs(expireAfterMinutes, legacyExpireAfterMinutes);

	if (lastSeenAtMs == null || expireAfterMs == null) {
		return null;
	}

	return Date.now() - lastSeenAtMs <= expireAfterMs;
}
