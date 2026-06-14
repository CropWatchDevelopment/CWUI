/* ============================================================
   CropWatch UI — Device Refresh Scheduler
   ------------------------------------------------------------
   Refetch-on-expiry for IoT devices: every tracked device is
   refetched when its expected upload window (lastSeenAt +
   uploadInterval + grace) passes. While a device stays stale the
   scheduler retries with capped exponential backoff; fresh data
   resets the cycle. Built on the shared min-heap alarm scheduler
   (one timer for any number of devices). Jitter staggers fetches
   so devices sharing an interval don't fire as a thundering herd.
   ============================================================ */

import { SvelteMap } from 'svelte/reactivity';
import { createCwAlarmScheduler } from '../components/cwAlarmContext.svelte.js';
import { resolveCwDateTimeMs } from './cwTimeout.js';
import type { CwDateTimeInput } from '../types/index.js';

export type CwDeviceFreshness = 'fresh' | 'checking' | 'stale';

export interface CwDeviceRefreshResult {
	/** Timestamp of the newest reading the fetch returned. */
	lastSeenAt: CwDateTimeInput | null;
	/** Opaque payload handed to onData (e.g. the latest-data row). */
	data?: unknown;
}

export interface CwDeviceRefreshEntry {
	/** Stable device identifier (dev_eui). */
	id: string;
	/** Newest known reading timestamp, or null when unknown. */
	lastSeenAt: CwDateTimeInput | null;
	/** Expected upload cadence in minutes; falls back to defaultIntervalMinutes. */
	uploadIntervalMinutes?: number | null;
}

export interface CwDeviceRefreshOptions {
	/** Fetch the device's latest data. Return null when nothing newer exists. */
	fetcher: (id: string) => Promise<CwDeviceRefreshResult | null>;
	/** Called when a fetch produced strictly newer data. */
	onData?: (id: string, result: CwDeviceRefreshResult) => void;
	/** Called on every freshness transition. */
	onStateChange?: (id: string, state: CwDeviceFreshness) => void;
	/** Slack added after the expected upload before refetching. Default 60s. */
	graceMs?: number;
	/** Upper bound of the random stagger added to every fetch. Default 15s. */
	jitterMaxMs?: number;
	/** First retry delay while a device stays stale. Default 60s. */
	backoffBaseMs?: number;
	/** Multiplier applied per consecutive stale attempt. Default 2. */
	backoffFactor?: number;
	/** Retry delay ceiling. Default 10 minutes. */
	backoffMaxMs?: number;
	/** Used when an entry has no usable uploadIntervalMinutes. Default 15. */
	defaultIntervalMinutes?: number;
	/** Random source for jitter — injectable for tests. Default Math.random. */
	random?: () => number;
}

export interface CwDeviceRefreshScheduler {
	/** Insert or update a device and (re)schedule its next refetch. */
	track(entry: CwDeviceRefreshEntry): void;
	trackAll(entries: CwDeviceRefreshEntry[]): void;
	/**
	 * Tell the scheduler that data for a device arrived through another path
	 * (page load, manual refresh). Resets backoff and reschedules.
	 */
	reportData(id: string, lastSeenAt: CwDateTimeInput | null): void;
	/** Fetch one device (or every tracked device) immediately. */
	refreshNow(id?: string): Promise<void>;
	untrack(id: string): void;
	/** Stop firing (tab hidden). Tracked devices and backoff are kept. */
	pause(): void;
	/** Re-arm after pause; overdue devices fetch immediately (staggered). */
	resume(): void;
	destroy(): void;
	/** Reactive freshness per device id (SvelteMap). */
	readonly states: ReadonlyMap<string, CwDeviceFreshness>;
	readonly size: number;
}

interface TrackedDevice {
	id: string;
	lastSeenAtMs: number | null;
	intervalMs: number;
	/** Consecutive stale fetches since the last fresh result. */
	staleAttempts: number;
	inFlight: boolean;
}

const MINUTE_MS = 60_000;

const DEFAULT_GRACE_MS = MINUTE_MS;
const DEFAULT_JITTER_MAX_MS = 15_000;
const DEFAULT_BACKOFF_BASE_MS = MINUTE_MS;
const DEFAULT_BACKOFF_FACTOR = 2;
const DEFAULT_BACKOFF_MAX_MS = 10 * MINUTE_MS;
const DEFAULT_INTERVAL_MINUTES = 15;

function hasDom(): boolean {
	return typeof document !== 'undefined';
}

function toPositiveNumber(value: number | undefined, fallback: number): number {
	return value !== undefined && Number.isFinite(value) && value > 0 ? value : fallback;
}

function toNonNegativeNumber(value: number | undefined, fallback: number): number {
	return value !== undefined && Number.isFinite(value) && value >= 0 ? value : fallback;
}

/**
 * Normalize an upload interval that may arrive as a Postgres numeric string
 * (e.g. "15"), a number, or garbage. Returns minutes or null.
 */
export function normalizeCwUploadIntervalMinutes(value: unknown): number | null {
	const minutes = typeof value === 'string' ? Number(value) : value;
	return typeof minutes === 'number' && Number.isFinite(minutes) && minutes > 0 ? minutes : null;
}

export function createCwDeviceRefreshScheduler(
	options: CwDeviceRefreshOptions
): CwDeviceRefreshScheduler {
	if (typeof options.fetcher !== 'function') {
		throw new Error('fetcher must be a function.');
	}

	const graceMs = toNonNegativeNumber(options.graceMs, DEFAULT_GRACE_MS);
	const jitterMaxMs = toNonNegativeNumber(options.jitterMaxMs, DEFAULT_JITTER_MAX_MS);
	const backoffBaseMs = toPositiveNumber(options.backoffBaseMs, DEFAULT_BACKOFF_BASE_MS);
	const backoffFactor = toPositiveNumber(options.backoffFactor, DEFAULT_BACKOFF_FACTOR);
	const backoffMaxMs = toPositiveNumber(options.backoffMaxMs, DEFAULT_BACKOFF_MAX_MS);
	const defaultIntervalMs =
		toPositiveNumber(options.defaultIntervalMinutes, DEFAULT_INTERVAL_MINUTES) * MINUTE_MS;
	const random = options.random ?? Math.random;

	const alarms = createCwAlarmScheduler();
	const devices = new Map<string, TrackedDevice>();
	const states = new SvelteMap<string, CwDeviceFreshness>();
	let paused = false;
	let destroyed = false;

	function alarmIdFor(id: string): string {
		return `cw-device-refresh:${id}`;
	}

	function jitter(): number {
		return jitterMaxMs > 0 ? random() * jitterMaxMs : 0;
	}

	function setState(device: TrackedDevice, state: CwDeviceFreshness) {
		if (states.get(device.id) === state) return;
		states.set(device.id, state);
		options.onStateChange?.(device.id, state);
	}

	function backoffDelayMs(staleAttempts: number): number {
		const exponent = Math.max(0, staleAttempts - 1);
		return Math.min(backoffMaxMs, backoffBaseMs * backoffFactor ** exponent);
	}

	/** Epoch ms at which the device should be fetched next (jitter excluded). */
	function dueAtMs(device: TrackedDevice): number {
		if (device.staleAttempts > 0) {
			return Date.now() + backoffDelayMs(device.staleAttempts);
		}
		if (device.lastSeenAtMs == null) {
			return Date.now();
		}
		return device.lastSeenAtMs + device.intervalMs + graceMs;
	}

	function scheduleNext(device: TrackedDevice) {
		if (paused || destroyed || !hasDom()) return;
		const triggerAt = Math.max(Date.now(), dueAtMs(device)) + jitter();
		alarms.schedule({
			id: alarmIdFor(device.id),
			from: triggerAt,
			callback: () => {
				void runFetch(device.id);
			}
		});
	}

	async function runFetch(id: string): Promise<void> {
		const device = devices.get(id);
		if (!device || device.inFlight || destroyed) return;

		device.inFlight = true;
		setState(device, 'checking');

		let result: CwDeviceRefreshResult | null = null;
		let failed = false;
		try {
			result = await options.fetcher(id);
		} catch (error) {
			failed = true;
			console.error(`[cw-device-refresh] fetch failed for ${id}`, error);
		}
		device.inFlight = false;

		// The device may have been untracked or the scheduler destroyed while
		// the fetch was in the air.
		if (destroyed || !devices.has(id)) return;

		const fetchedMs = failed ? null : resolveCwDateTimeMs(result?.lastSeenAt ?? null);
		const isNewer =
			fetchedMs != null && (device.lastSeenAtMs == null || fetchedMs > device.lastSeenAtMs);

		if (isNewer) {
			device.lastSeenAtMs = fetchedMs;
			device.staleAttempts = 0;
			setState(device, 'fresh');
			if (result) {
				options.onData?.(id, result);
			}
		} else {
			device.staleAttempts += 1;
			setState(device, 'stale');
		}

		scheduleNext(device);
	}

	function track(entry: CwDeviceRefreshEntry): void {
		if (destroyed) return;
		const id = entry.id?.trim();
		if (!id) return;

		const intervalMinutes = normalizeCwUploadIntervalMinutes(entry.uploadIntervalMinutes);
		const intervalMs = intervalMinutes != null ? intervalMinutes * MINUTE_MS : defaultIntervalMs;
		const lastSeenAtMs = resolveCwDateTimeMs(entry.lastSeenAt);

		const existing = devices.get(id);
		if (existing) {
			const advanced = lastSeenAtMs != null &&
				(existing.lastSeenAtMs == null || lastSeenAtMs > existing.lastSeenAtMs);
			existing.intervalMs = intervalMs;
			if (advanced) {
				existing.lastSeenAtMs = lastSeenAtMs;
				existing.staleAttempts = 0;
				setState(existing, 'fresh');
			}
			scheduleNext(existing);
			return;
		}

		const device: TrackedDevice = {
			id,
			lastSeenAtMs,
			intervalMs,
			staleAttempts: 0,
			inFlight: false
		};
		devices.set(id, device);
		setState(device, lastSeenAtMs != null ? 'fresh' : 'stale');
		scheduleNext(device);
	}

	function trackAll(entries: CwDeviceRefreshEntry[]): void {
		for (const entry of entries) {
			track(entry);
		}
	}

	function reportData(id: string, lastSeenAt: CwDateTimeInput | null): void {
		const device = devices.get(id);
		if (!device) return;

		const lastSeenAtMs = resolveCwDateTimeMs(lastSeenAt);
		if (lastSeenAtMs != null && (device.lastSeenAtMs == null || lastSeenAtMs > device.lastSeenAtMs)) {
			device.lastSeenAtMs = lastSeenAtMs;
			device.staleAttempts = 0;
			setState(device, 'fresh');
		}
		scheduleNext(device);
	}

	async function refreshNow(id?: string): Promise<void> {
		if (id !== undefined) {
			const device = devices.get(id);
			if (!device) return;
			alarms.cancel(alarmIdFor(id));
			await runFetch(id);
			return;
		}

		const ids = Array.from(devices.keys());
		for (const deviceId of ids) {
			alarms.cancel(alarmIdFor(deviceId));
		}
		await Promise.all(ids.map((deviceId) => runFetch(deviceId)));
	}

	function untrack(id: string): void {
		if (!devices.delete(id)) return;
		alarms.cancel(alarmIdFor(id));
		states.delete(id);
	}

	function pause(): void {
		if (paused) return;
		paused = true;
		alarms.clear();
	}

	function resume(): void {
		if (!paused || destroyed) return;
		paused = false;
		for (const device of devices.values()) {
			scheduleNext(device);
		}
	}

	function destroy(): void {
		if (destroyed) return;
		destroyed = true;
		alarms.clear();
		devices.clear();
		states.clear();
	}

	return {
		track,
		trackAll,
		reportData,
		refreshNow,
		untrack,
		pause,
		resume,
		destroy,
		get states(): ReadonlyMap<string, CwDeviceFreshness> {
			return states;
		},
		get size(): number {
			return devices.size;
		}
	};
}

/**
 * Pause the scheduler while the document is hidden and reconcile when it
 * becomes visible again. Returns a cleanup function. No-op without a DOM.
 */
export function attachCwDeviceRefreshVisibility(
	scheduler: CwDeviceRefreshScheduler
): () => void {
	if (!hasDom()) {
		return () => {};
	}

	const onVisibilityChange = () => {
		if (document.hidden) {
			scheduler.pause();
		} else {
			scheduler.resume();
		}
	};

	document.addEventListener('visibilitychange', onVisibilityChange);
	if (document.hidden) {
		scheduler.pause();
	}

	return () => {
		document.removeEventListener('visibilitychange', onVisibilityChange);
	};
}
