/* ============================================================
   CropWatch UI — Alarm Scheduler / Context
   ============================================================ */

import type { CwAlarmApi, CwAlarmRegistration, CwDateTimeInput } from '../types/index.js';
import { getContext, setContext } from 'svelte';

const ALARM_KEY = Symbol('cw-alarm');
const MAX_TIMEOUT_MS = 2_147_483_647;

interface AlarmTask {
	id: string;
	triggerAt: number;
	callback: () => void;
}

interface AlarmHeapNode {
	id: string;
	triggerAt: number;
}

class AlarmMinHeap {
	private items: AlarmHeapNode[] = [];
	private indexById = new Map<string, number>();

	get size(): number {
		return this.items.length;
	}

	peek(): AlarmHeapNode | undefined {
		return this.items[0];
	}

	upsert(node: AlarmHeapNode) {
		const currentIndex = this.indexById.get(node.id);
		if (currentIndex === undefined) {
			this.items.push(node);
			const nextIndex = this.items.length - 1;
			this.indexById.set(node.id, nextIndex);
			this.bubbleUp(nextIndex);
			return;
		}

		this.items[currentIndex] = node;
		this.bubbleUp(currentIndex);
		this.bubbleDown(currentIndex);
	}

	remove(id: string): AlarmHeapNode | undefined {
		const index = this.indexById.get(id);
		if (index === undefined) return undefined;

		const lastIndex = this.items.length - 1;
		const removed = this.items[index];
		const tail = this.items[lastIndex];

		this.items.pop();
		this.indexById.delete(id);

		if (index < lastIndex) {
			this.items[index] = tail;
			this.indexById.set(tail.id, index);
			this.bubbleUp(index);
			this.bubbleDown(index);
		}

		return removed;
	}

	pop(): AlarmHeapNode | undefined {
		const top = this.peek();
		if (!top) return undefined;
		this.remove(top.id);
		return top;
	}

	clear() {
		this.items = [];
		this.indexById.clear();
	}

	private bubbleUp(index: number) {
		let current = index;
		while (current > 0) {
			const parent = Math.floor((current - 1) / 2);
			if (this.items[parent].triggerAt <= this.items[current].triggerAt) break;
			this.swap(parent, current);
			current = parent;
		}
	}

	private bubbleDown(index: number) {
		let current = index;
		while (true) {
			const left = current * 2 + 1;
			const right = left + 1;
			let smallest = current;

			if (left < this.items.length && this.items[left].triggerAt < this.items[smallest].triggerAt) {
				smallest = left;
			}
			if (right < this.items.length && this.items[right].triggerAt < this.items[smallest].triggerAt) {
				smallest = right;
			}

			if (smallest === current) break;
			this.swap(current, smallest);
			current = smallest;
		}
	}

	private swap(a: number, b: number) {
		const temp = this.items[a];
		this.items[a] = this.items[b];
		this.items[b] = temp;
		this.indexById.set(this.items[a].id, a);
		this.indexById.set(this.items[b].id, b);
	}
}

function toEpochMs(value: CwDateTimeInput, fieldName: string): number {
	const raw = value instanceof Date ? value.getTime() : typeof value === 'string' ? new Date(value).getTime() : value;

	if (!Number.isFinite(raw)) {
		throw new Error(`Invalid ${fieldName}. Expected a Date, epoch ms number, or ISO datetime string.`);
	}

	return raw;
}

function resolveAlarmDelayMs(options: CwAlarmRegistration): number {
	if (options.alarmAfterMs !== undefined) {
		if (!Number.isFinite(options.alarmAfterMs) || options.alarmAfterMs < 0) {
			throw new Error('alarmAfterMs must be a finite number >= 0.');
		}
		return options.alarmAfterMs;
	}

	if (options.alarmAfterMinutes !== undefined) {
		if (!Number.isFinite(options.alarmAfterMinutes) || options.alarmAfterMinutes < 0) {
			throw new Error('alarmAfterMinutes must be a finite number >= 0.');
		}
		return options.alarmAfterMinutes * 60_000;
	}

	return 0;
}

/**
 * Create a shared alarm scheduler.
 * Uses a min-heap plus a single active timeout, making it suitable for large alarm sets.
 */
export function createCwAlarmScheduler(): CwAlarmApi {
	const tasks = new Map<string, AlarmTask>();
	const heap = new AlarmMinHeap();
	let timeout: ReturnType<typeof setTimeout> | null = null;
	let counter = 0;

	function armNextTimeout() {
		if (timeout !== null) {
			clearTimeout(timeout);
			timeout = null;
		}

		const next = heap.peek();
		if (!next) return;

		const delay = Math.min(MAX_TIMEOUT_MS, Math.max(0, next.triggerAt - Date.now()));
		timeout = setTimeout(flushDueAlarms, delay);
	}

	function flushDueAlarms() {
		timeout = null;
		const now = Date.now();

		while (true) {
			const next = heap.peek();
			if (!next || next.triggerAt > now) break;

			const popped = heap.pop();
			if (!popped) break;

			const task = tasks.get(popped.id);
			if (!task) continue;
			tasks.delete(popped.id);

			try {
				task.callback();
			} catch (error) {
				console.error('[cw-alarm] alarm callback failed', error);
			}
		}

		armNextTimeout();
	}

	function schedule(options: CwAlarmRegistration): string {
		if (typeof options.callback !== 'function') {
			throw new Error('callback must be a function.');
		}

		const baseMs = toEpochMs(options.from, 'from');
		const delayMs = resolveAlarmDelayMs(options);
		const triggerAt = baseMs + delayMs;

		if (!Number.isFinite(triggerAt)) {
			throw new Error('Computed alarm trigger timestamp is invalid.');
		}

		const providedId = options.id?.trim();
		const id =
			providedId && providedId.length > 0
				? providedId
				: (() => {
						let nextId = `cw-alarm-${++counter}`;
						while (tasks.has(nextId)) {
							nextId = `cw-alarm-${++counter}`;
						}
						return nextId;
					})();
		if (tasks.has(id)) {
			tasks.delete(id);
			heap.remove(id);
		}

		tasks.set(id, { id, triggerAt, callback: options.callback });
		heap.upsert({ id, triggerAt });
		armNextTimeout();
		return id;
	}

	function cancel(id: string) {
		if (!tasks.delete(id)) return;
		heap.remove(id);
		armNextTimeout();
	}

	function clear() {
		tasks.clear();
		heap.clear();
		if (timeout !== null) {
			clearTimeout(timeout);
			timeout = null;
		}
	}

	const api: CwAlarmApi = {
		schedule,
		cancel,
		clear,
		get size() {
			return tasks.size;
		}
	};

	return api;
}

/**
 * Create and register alarm scheduler in Svelte context.
 * Call once from a top-level layout/component.
 */
export function createCwAlarmContext(): CwAlarmApi {
	const api = createCwAlarmScheduler();
	setContext(ALARM_KEY, api);
	return api;
}

/**
 * Retrieve alarm scheduler from Svelte context.
 */
export function useCwAlarm(): CwAlarmApi {
	return getContext<CwAlarmApi>(ALARM_KEY);
}
