import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	createCwDeviceRefreshScheduler,
	normalizeCwUploadIntervalMinutes,
	type CwDeviceRefreshResult
} from './cwDeviceRefresh.js';

const MINUTE = 60_000;

function isoAt(ms: number): string {
	return new Date(ms).toISOString();
}

describe('normalizeCwUploadIntervalMinutes', () => {
	it('accepts numbers and numeric strings', () => {
		expect(normalizeCwUploadIntervalMinutes(15)).toBe(15);
		expect(normalizeCwUploadIntervalMinutes('15')).toBe(15);
		expect(normalizeCwUploadIntervalMinutes('7.5')).toBe(7.5);
	});

	it('rejects zero, negatives, and garbage', () => {
		expect(normalizeCwUploadIntervalMinutes(0)).toBeNull();
		expect(normalizeCwUploadIntervalMinutes(-1)).toBeNull();
		expect(normalizeCwUploadIntervalMinutes('abc')).toBeNull();
		expect(normalizeCwUploadIntervalMinutes(null)).toBeNull();
		expect(normalizeCwUploadIntervalMinutes(undefined)).toBeNull();
	});
});

describe('createCwDeviceRefreshScheduler', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(0);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	/** Scheduler with zero jitter so timings are exact. */
	function createScheduler(overrides: {
		fetcher?: (id: string) => Promise<CwDeviceRefreshResult | null>;
		onData?: (id: string, result: CwDeviceRefreshResult) => void;
		onStateChange?: (id: string, state: string) => void;
		jitterMaxMs?: number;
	}) {
		return createCwDeviceRefreshScheduler({
			fetcher: overrides.fetcher ?? (async () => null),
			onData: overrides.onData,
			onStateChange: overrides.onStateChange,
			graceMs: MINUTE,
			jitterMaxMs: overrides.jitterMaxMs ?? 0,
			backoffBaseMs: MINUTE,
			backoffFactor: 2,
			backoffMaxMs: 10 * MINUTE,
			defaultIntervalMinutes: 15
		});
	}

	it('fetches at lastSeenAt + interval + grace', async () => {
		const fetcher = vi.fn(async () => null);
		const scheduler = createScheduler({ fetcher });

		scheduler.track({ id: 'dev-1', lastSeenAt: isoAt(0), uploadIntervalMinutes: 10 });

		await vi.advanceTimersByTimeAsync(10 * MINUTE + MINUTE - 1);
		expect(fetcher).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1);
		expect(fetcher).toHaveBeenCalledTimes(1);
		expect(fetcher).toHaveBeenCalledWith('dev-1');

		scheduler.destroy();
	});

	it('marks the device fresh and reschedules from new data', async () => {
		const dueAt = 11 * MINUTE; // 10 min interval + 1 min grace
		const onData = vi.fn();
		const fetcher = vi.fn(async (): Promise<CwDeviceRefreshResult | null> => ({
			lastSeenAt: isoAt(dueAt),
			data: { value: 42 }
		}));
		const scheduler = createScheduler({ fetcher, onData });

		scheduler.track({ id: 'dev-1', lastSeenAt: isoAt(0), uploadIntervalMinutes: 10 });
		await vi.advanceTimersByTimeAsync(dueAt);

		expect(fetcher).toHaveBeenCalledTimes(1);
		expect(onData).toHaveBeenCalledWith('dev-1', {
			lastSeenAt: isoAt(dueAt),
			data: { value: 42 }
		});
		expect(scheduler.states.get('dev-1')).toBe('fresh');

		// Next fetch is scheduled from the NEW lastSeenAt (dueAt + 11 min).
		await vi.advanceTimersByTimeAsync(11 * MINUTE);
		expect(fetcher).toHaveBeenCalledTimes(2);

		scheduler.destroy();
	});

	it('retries stale devices with capped exponential backoff', async () => {
		const fetcher = vi.fn(async () => null);
		const scheduler = createScheduler({ fetcher });

		scheduler.track({ id: 'dev-1', lastSeenAt: isoAt(0), uploadIntervalMinutes: 10 });

		await vi.advanceTimersByTimeAsync(11 * MINUTE);
		expect(fetcher).toHaveBeenCalledTimes(1);
		expect(scheduler.states.get('dev-1')).toBe('stale');

		// Backoff sequence: 1, 2, 4, 8, 10 (cap), 10 minutes...
		await vi.advanceTimersByTimeAsync(1 * MINUTE);
		expect(fetcher).toHaveBeenCalledTimes(2);
		await vi.advanceTimersByTimeAsync(2 * MINUTE);
		expect(fetcher).toHaveBeenCalledTimes(3);
		await vi.advanceTimersByTimeAsync(4 * MINUTE);
		expect(fetcher).toHaveBeenCalledTimes(4);
		await vi.advanceTimersByTimeAsync(8 * MINUTE);
		expect(fetcher).toHaveBeenCalledTimes(5);
		await vi.advanceTimersByTimeAsync(10 * MINUTE);
		expect(fetcher).toHaveBeenCalledTimes(6);
		await vi.advanceTimersByTimeAsync(10 * MINUTE);
		expect(fetcher).toHaveBeenCalledTimes(7);

		scheduler.destroy();
	});

	it('treats fetcher errors as stale results', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		const fetcher = vi.fn(async () => {
			throw new Error('network down');
		});
		const scheduler = createScheduler({ fetcher });

		scheduler.track({ id: 'dev-1', lastSeenAt: isoAt(0), uploadIntervalMinutes: 10 });
		await vi.advanceTimersByTimeAsync(11 * MINUTE);

		expect(scheduler.states.get('dev-1')).toBe('stale');
		expect(consoleError).toHaveBeenCalled();

		scheduler.destroy();
		consoleError.mockRestore();
	});

	it('resets backoff when reportData delivers newer data', async () => {
		const fetcher = vi.fn(async () => null);
		const scheduler = createScheduler({ fetcher });

		scheduler.track({ id: 'dev-1', lastSeenAt: isoAt(0), uploadIntervalMinutes: 10 });
		await vi.advanceTimersByTimeAsync(11 * MINUTE); // stale, attempt 1
		await vi.advanceTimersByTimeAsync(1 * MINUTE); // stale, attempt 2
		expect(fetcher).toHaveBeenCalledTimes(2);

		const nowMs = Date.now();
		scheduler.reportData('dev-1', isoAt(nowMs));
		expect(scheduler.states.get('dev-1')).toBe('fresh');

		// Rescheduled at the regular cadence, not the backoff cadence.
		await vi.advanceTimersByTimeAsync(11 * MINUTE - 1);
		expect(fetcher).toHaveBeenCalledTimes(2);
		await vi.advanceTimersByTimeAsync(1);
		expect(fetcher).toHaveBeenCalledTimes(3);

		scheduler.destroy();
	});

	it('does not fetch while paused and reconciles overdue devices on resume', async () => {
		const fetcher = vi.fn(async () => null);
		const scheduler = createScheduler({ fetcher });

		scheduler.track({ id: 'dev-1', lastSeenAt: isoAt(0), uploadIntervalMinutes: 10 });
		scheduler.pause();

		await vi.advanceTimersByTimeAsync(60 * MINUTE);
		expect(fetcher).not.toHaveBeenCalled();

		scheduler.resume();
		await vi.advanceTimersByTimeAsync(0);
		expect(fetcher).toHaveBeenCalledTimes(1);

		scheduler.destroy();
	});

	it('staggers fetches with jitter', async () => {
		const fetcher = vi.fn(async () => null);
		const scheduler = createCwDeviceRefreshScheduler({
			fetcher,
			graceMs: MINUTE,
			jitterMaxMs: 15_000,
			random: () => 1 // worst-case jitter
		});

		scheduler.track({ id: 'dev-1', lastSeenAt: isoAt(0), uploadIntervalMinutes: 10 });

		await vi.advanceTimersByTimeAsync(11 * MINUTE);
		expect(fetcher).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(15_000);
		expect(fetcher).toHaveBeenCalledTimes(1);

		scheduler.destroy();
	});

	it('refreshNow fetches immediately and ignores in-flight duplicates', async () => {
		let resolveFetch: ((value: CwDeviceRefreshResult | null) => void) | undefined;
		const fetcher = vi.fn(
			() =>
				new Promise<CwDeviceRefreshResult | null>((resolve) => {
					resolveFetch = resolve;
				})
		);
		const scheduler = createScheduler({ fetcher });

		scheduler.track({ id: 'dev-1', lastSeenAt: isoAt(0), uploadIntervalMinutes: 10 });

		const first = scheduler.refreshNow('dev-1');
		const second = scheduler.refreshNow('dev-1'); // in flight — must not double-fetch
		expect(fetcher).toHaveBeenCalledTimes(1);

		resolveFetch?.(null);
		await first;
		await second;
		expect(fetcher).toHaveBeenCalledTimes(1);

		scheduler.destroy();
	});

	it('untrack stops future fetches and clears state', async () => {
		const fetcher = vi.fn(async () => null);
		const scheduler = createScheduler({ fetcher });

		scheduler.track({ id: 'dev-1', lastSeenAt: isoAt(0), uploadIntervalMinutes: 10 });
		scheduler.untrack('dev-1');

		expect(scheduler.size).toBe(0);
		expect(scheduler.states.has('dev-1')).toBe(false);

		await vi.advanceTimersByTimeAsync(60 * MINUTE);
		expect(fetcher).not.toHaveBeenCalled();

		scheduler.destroy();
	});

	it('devices without a lastSeenAt are fetched right away', async () => {
		const fetcher = vi.fn(async () => null);
		const scheduler = createScheduler({ fetcher });

		scheduler.track({ id: 'dev-1', lastSeenAt: null, uploadIntervalMinutes: 10 });

		await vi.advanceTimersByTimeAsync(0);
		expect(fetcher).toHaveBeenCalledTimes(1);

		scheduler.destroy();
	});

	it('emits state transitions through onStateChange', async () => {
		const transitions: Array<[string, string]> = [];
		const fetcher = vi.fn(async () => null);
		const scheduler = createScheduler({
			fetcher,
			onStateChange: (id, state) => transitions.push([id, state])
		});

		scheduler.track({ id: 'dev-1', lastSeenAt: isoAt(0), uploadIntervalMinutes: 10 });
		await vi.advanceTimersByTimeAsync(11 * MINUTE);

		expect(transitions).toEqual([
			['dev-1', 'fresh'],
			['dev-1', 'checking'],
			['dev-1', 'stale']
		]);

		scheduler.destroy();
	});

	it('destroy cancels everything', async () => {
		const fetcher = vi.fn(async () => null);
		const scheduler = createScheduler({ fetcher });

		scheduler.trackAll([
			{ id: 'dev-1', lastSeenAt: isoAt(0), uploadIntervalMinutes: 10 },
			{ id: 'dev-2', lastSeenAt: isoAt(0), uploadIntervalMinutes: 10 }
		]);
		expect(scheduler.size).toBe(2);

		scheduler.destroy();
		expect(scheduler.size).toBe(0);

		await vi.advanceTimersByTimeAsync(60 * MINUTE);
		expect(fetcher).not.toHaveBeenCalled();
	});
});
