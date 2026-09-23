/* ============================================================
   CropWatch UI — Toast Context (Svelte 5 runes-based)
   ============================================================ */

import type { CwTone, CwToastItem } from '../types/index.js';
import { getContext, hasContext, setContext } from 'svelte';

const TOAST_KEY = Symbol('cw-toast');
const EMPTY_TOAST_ITEMS: CwToastItem[] = [];

/** Default auto-dismiss delay. Long enough to read a sentence (WCAG 2.2.1). */
export const CW_TOAST_DEFAULT_DURATION = 6000;

export interface CwToastOptions {
	tone?: CwTone;
	message: string;
	/** Optional bold heading shown above the message. */
	title?: string;
	/**
	 * Auto-dismiss delay in ms. `0` keeps the toast until dismissed.
	 * Defaults to 6000ms, or `0` (sticky) for `danger` toasts.
	 */
	duration?: number;
	dismissible?: boolean;
}

export interface CwToastApi {
	add(opts: CwToastOptions): string;
	dismiss(id: string): void;
	readonly items: CwToastItem[];
}

const NOOP_TOAST_API: CwToastApi = {
	add() {
		return '';
	},
	dismiss() {},
	get items() {
		return EMPTY_TOAST_ITEMS;
	}
};

/** Tones announced assertively (interrupting) rather than politely. */
export function isCwToastUrgent(tone: CwTone): boolean {
	return tone === 'danger' || tone === 'warning';
}

/**
 * Creates the toast context. Call once in a layout/root component.
 * Returns the API for adding / dismissing toasts.
 */
export function createCwToastContext(maxItems = 4): CwToastApi {
	// Only ever wholesale-reassigned, so deep reactivity is unnecessary.
	let items = $state.raw<CwToastItem[]>([]);
	let counter = 0;

	function add(opts: CwToastOptions): string {
		const id = `cw-toast-${++counter}`;
		const tone = opts.tone ?? 'info';
		const item: CwToastItem = {
			id,
			tone,
			message: opts.message,
			title: opts.title,
			duration: opts.duration ?? (tone === 'danger' ? 0 : CW_TOAST_DEFAULT_DURATION),
			dismissible: opts.dismissible ?? true
		};

		let next = [...items, item];
		// Over the limit: evict the oldest non-urgent toast first so a sticky
		// error is never silently dropped by a routine success message.
		while (next.length > maxItems) {
			const evictIndex = next.findIndex((t) => t.id !== id && !isCwToastUrgent(t.tone));
			next.splice(evictIndex === -1 ? 0 : evictIndex, 1);
		}
		items = next;
		return id;
	}

	function dismiss(id: string) {
		items = items.filter((t) => t.id !== id);
	}

	const api: CwToastApi = {
		add,
		dismiss,
		get items() {
			return items;
		}
	};

	setContext(TOAST_KEY, api);
	return api;
}

/** True when a toast context has been created by an ancestor component. */
export function hasCwToastContext(): boolean {
	return hasContext(TOAST_KEY);
}

/**
 * Retrieve the toast API from context. Call in child components.
 */
export function useCwToast(): CwToastApi {
	if (!hasContext(TOAST_KEY)) {
		return NOOP_TOAST_API;
	}

	return getContext<CwToastApi>(TOAST_KEY);
}
