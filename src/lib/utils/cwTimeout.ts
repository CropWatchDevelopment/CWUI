import type { CwDateTimeInput } from '../types/index.js';

export function resolveCwLastSeenAt(
	...candidates: Array<CwDateTimeInput | null | undefined>
): CwDateTimeInput | undefined {
	for (const candidate of candidates) {
		if (candidate != null) {
			return candidate;
		}
	}

	return undefined;
}

export function resolveCwExpireAfterMinutes(
	...candidates: Array<number | null | undefined>
): number | undefined {
	for (const candidate of candidates) {
		if (candidate != null) {
			return candidate;
		}
	}

	return undefined;
}

export function resolveCwDateTimeMs(value?: CwDateTimeInput | null): number | null {
	if (value == null) return null;

	const timestamp =
		value instanceof Date ? value.getTime() : typeof value === 'string' ? new Date(value).getTime() : value;

	return Number.isFinite(timestamp) ? timestamp : null;
}

export function resolveCwExpireAfterMs(
	...candidates: Array<number | null | undefined>
): number | null {
	const resolvedMinutes = resolveCwExpireAfterMinutes(...candidates);
	if (resolvedMinutes == null || !Number.isFinite(resolvedMinutes) || resolvedMinutes < 0) {
		return null;
	}

	return resolvedMinutes * 60_000;
}

export function isCwWithinTimeout(
	lastSeenAt?: CwDateTimeInput | null,
	...expireAfterCandidates: Array<number | null | undefined>
): boolean | null {
	const lastSeenAtMs = resolveCwDateTimeMs(lastSeenAt);
	const expireAfterMs = resolveCwExpireAfterMs(...expireAfterCandidates);

	if (lastSeenAtMs == null || expireAfterMs == null) {
		return null;
	}

	return Date.now() - lastSeenAtMs <= expireAfterMs;
}
